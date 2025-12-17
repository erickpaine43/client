/**
 * LeadAnalyticsService - Main entry point
 * 
 * This module exports the LeadAnalyticsService class, maintaining API compatibility
 * with the original monolithic file. The class extends BaseAnalyticsService and orchestrates
 * queries and mutations from the modular files.
 * 
 * Private utilities (logger, getCompanyId, invalidateCachePatterns, getCacheTTL) are defined here.
 * Wrapper methods use executeWithCache from base.
 * 
 * Usage:
 * - Import { LeadAnalyticsService } from "./LeadAnalyticsService"
 * - Instantiate new LeadAnalyticsService()
 * - Call methods like getLeadListMetrics, updateAnalytics - same as original
 * 
 * Backward compatibility: All public methods have same signatures as original.
 * Internal: Delegates to ./queries.ts and ./mutations.ts
 */

import { BaseAnalyticsService } from "../BaseAnalyticsService";
import { ConvexHttpClient } from "convex/browser";
import type { AnalyticsFilters, AnalyticsComputeOptions, DataGranularity, TimeSeriesDataPoint } from "@/types/analytics/core";
import type {
  LeadListMetrics,
  LeadEngagementAnalytics,
  ConversionFunnelData,
  LeadSourceAnalytics,
  SegmentationAnalytics,
  FilteredLeadAnalytics,
  LeadAnalyticsUpdatePayload
} from "./types";
import {
  performLeadListMetricsQuery,
  performLeadEngagementAnalyticsQuery,
  performConversionFunnelsQuery,
  performLeadSourceAnalyticsQuery,
  performSegmentationAnalyticsQuery,
  performFilteredAnalyticsQuery,
  performHealthCheckQuery
} from "./queries";
import {
  performUpdateAnalyticsMutation
} from "./mutations";
import { CACHE_TTL } from "@/lib/utils/redis";
import { api } from "@/convex/_generated/api";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";

/**
 * Lead Analytics Service
 * 
 * Handles lead performance tracking, engagement analytics, source analysis,
 * segmentation, conversion funnels, and filtered computations.
 * Uses standardized field names and AnalyticsCalculator for rates.
 * 
 * All public methods maintain original API - internal delegation to modular files.
 */
export class LeadAnalyticsService extends BaseAnalyticsService {
  private readonly convex: ConvexHttpClient;
  private readonly logger = {
    info: (message: string, data?: Record<string, unknown>) => console.log(`[LeadAnalytics] ${message}`, data),
    warn: (message: string, data?: Record<string, unknown>) => console.warn(`[LeadAnalytics] ${message}`, data),
    error: (message: string, data?: Record<string, unknown>) => console.error(`[LeadAnalytics] ${message}`, data),
  };

  constructor() {
    super("leads");
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }

  /**
   * Get company ID from context or environment.
   * In a real implementation, this would get the company ID from the current user session.
   */
  private async getCompanyId(): Promise<string> {
    // TODO: Implement proper company ID retrieval from user session/context
    return process.env.COMPANY_ID || "company-123";
  }

  /**
   * Serialize filters for cache key generation.
   */
  private serializeFilters(filters: AnalyticsFilters): string {
    return JSON.stringify(filters);
  }

  /**
   * Invalidate cache entries by patterns.
   */
  private async invalidateCachePatterns(patterns: string[]): Promise<void> {
    // TODO: Implement cache invalidation logic
    this.logger.info("Invalidating cache patterns", { patterns });
  }

  /**
   * Get cache TTL based on operation type.
   */
  private getCacheTTL(operation: string): number {
    const ttlMap: Record<string, number> = {
      leadListMetrics: CACHE_TTL.RECENT,
      engagementAnalytics: CACHE_TTL.RECENT,
      conversionFunnels: CACHE_TTL.RECENT,
      leadSourceAnalytics: CACHE_TTL.RECENT,
      segmentationAnalytics: CACHE_TTL.RECENT,
      leadTimeSeries: CACHE_TTL.RECENT,
      filteredAnalytics: CACHE_TTL.RECENT,
    };
    return ttlMap[operation] || CACHE_TTL.RECENT;
  }

  /**
   * Get lead list metrics for specific leads.
   * Original API: async getLeadListMetrics(leadIds: string[], filters?: AnalyticsFilters): Promise<LeadListMetrics>
   */
  async getLeadListMetrics(
    leadIds: string[],
    filters?: AnalyticsFilters
  ): Promise<LeadListMetrics> {
    return this.executeWithCache(
      "leadListMetrics",
      leadIds,
      filters || this.createDefaultFilters(),
      async () => await performLeadListMetricsQuery(
        this.convex,
        await this.getCompanyId(),
        leadIds,
        filters
      ),
      this.getCacheTTL("leadListMetrics")
    );
  }

  /**
   * Get lead engagement analytics with time series data.
   * Original API: async getEngagementAnalytics(filters: AnalyticsFilters, leadIds?: string[]): Promise<LeadEngagementAnalytics>
   */
  async getEngagementAnalytics(
    filters: AnalyticsFilters,
    leadIds?: string[]
  ): Promise<LeadEngagementAnalytics> {
    return this.executeWithCache(
      "engagementAnalytics",
      leadIds || [],
      filters,
      async () => await performLeadEngagementAnalyticsQuery(
        this.convex,
        await this.getCompanyId(),
        leadIds,
        filters
      ),
      this.getCacheTTL("engagementAnalytics")
    );
  }

  /**
   * Get conversion funnels for specific campaigns.
   * Original API: async getConversionFunnels(campaignIds: string[]): Promise<ConversionFunnelData>
   */
  async getConversionFunnels(campaignIds: string[]): Promise<ConversionFunnelData> {
    return this.executeWithCache(
      "conversionFunnels",
      campaignIds,
      {},
      async () => await performConversionFunnelsQuery(
        this.convex,
        await this.getCompanyId(),
        campaignIds
      ),
      this.getCacheTTL("conversionFunnels")
    );
  }

  /**
   * Get lead source analytics.
   * Original API: async getLeadSourceAnalytics(): Promise<LeadSourceAnalytics>
   */
  async getLeadSourceAnalytics(): Promise<LeadSourceAnalytics> {
    return this.executeWithCache(
      "leadSourceAnalytics",
      [],
      {},
      async () => await performLeadSourceAnalyticsQuery(
        this.convex,
        await this.getCompanyId()
      ),
      this.getCacheTTL("leadSourceAnalytics")
    );
  }

  /**
   * Get lead segmentation analytics.
   * Original API: async getSegmentationAnalytics(): Promise<SegmentationAnalytics>
   */
  async getSegmentationAnalytics(): Promise<SegmentationAnalytics> {
    return this.executeWithCache(
      "segmentationAnalytics",
      [],
      {},
      async () => await performSegmentationAnalyticsQuery(
        this.convex,
        await this.getCompanyId()
      ),
      this.getCacheTTL("segmentationAnalytics")
    );
  }

  /**
   * Get lead time series data for charts.
   * Supports daily, weekly, and monthly granularity for lead engagement over time.
   */
  async getTimeSeriesData(
    leadIds?: string[],
    filters?: AnalyticsFilters,
    granularity: DataGranularity = "day"
  ): Promise<TimeSeriesDataPoint[]> {
    return this.executeWithCache(
      "leadTimeSeries",
      leadIds || [],
      filters || this.createDefaultFilters(),
      async () => {
        const convexHelper = createAnalyticsConvexHelper(this.convex, "LeadAnalyticsService");
        const timeSeriesData = await convexHelper.query(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          api.leadAnalytics.getLeadEngagementAnalytics,
          {
            leadIds,
            dateRange: filters?.dateRange,
            companyId: await this.getCompanyId(),
            granularity: granularity,
          },
          {
            serviceName: "LeadAnalyticsService",
            methodName: "getTimeSeriesData",
          }
        ) as unknown as (TimeSeriesDataPoint & { leadCount: number })[];
        return timeSeriesData.map((item: TimeSeriesDataPoint & { leadCount: number }) => ({
          date: item.date,
          label: item.date, // Use date as label for now
          metrics: item.metrics,
          leadCount: item.leadCount || 0
        }));
      },
      this.getCacheTTL("leadTimeSeries")
    );
  }

  /**
   * Compute analytics for filtered lead data.
   * Original API: async computeAnalyticsForFilteredData(filters: AnalyticsFilters, options?: AnalyticsComputeOptions): Promise<FilteredLeadAnalytics>
   */
  async computeAnalyticsForFilteredData(
    filters: AnalyticsFilters,
    options: AnalyticsComputeOptions = {}
  ): Promise<FilteredLeadAnalytics> {
    return this.executeWithCache(
      "filteredAnalytics",
      filters.entityIds || [],
      filters,
      async () => await performFilteredAnalyticsQuery(
        this.convex,
        await this.getCompanyId(),
        filters,
        options
      ),
      this.getCacheTTL("filteredAnalytics")
    );
  }

  /**
   * Update lead analytics data.
   * Original API: async updateAnalytics(data: { ... }): Promise<string>
   * Note: data shape matches LeadAnalyticsUpdatePayload
   */
  async updateAnalytics(data: LeadAnalyticsUpdatePayload): Promise<string> {
    const result = await performUpdateAnalyticsMutation(
      this.convex,
      data,
      this.logger
    );

    // Invalidate related cache entries
    await this.invalidateCachePatterns([
      "leadListMetrics:*",
      "engagementAnalytics:*",
      "conversionFunnels:*",
      "leadSourceAnalytics:*",
      "segmentationAnalytics:*",
      "filteredAnalytics:*",
    ]);

    // Type assertion for Convex platform limitation
    return result as string;
  }

  /**
   * Health check for the lead analytics service.
   * Original API: async healthCheck(): Promise<boolean>
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await performHealthCheckQuery(
        this.convex,
        await this.getCompanyId()
      );
    } catch (error) {
      this.logger.error("Health check failed", { error });
      return false;
    }
  }
}

// Export singleton instance for backward compatibility
export const leadAnalyticsService = new LeadAnalyticsService();

// Re-exports for backward compatibility
export * from "./types";
export * from "./validation";
export * from "./calculations";
export * from "./queries";
export * from "./mutations";

