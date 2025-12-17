/**
 * TemplateAnalyticsService - Main entry point
 * 
 * This module exports the TemplateAnalyticsService class, maintaining API compatibility
 * with the original monolithic file. The class extends BaseAnalyticsService and orchestrates
 * queries and mutations from the modular files.
 * 
 * Private utilities (logger, getCompanyId, testCacheConnection, invalidateCachePatterns, 
 * getCacheTTL) are defined here for service-specific logic.
 * 
 * Wrapper methods use executeWithCache from base and logOperation if needed.
 * 
 * Usage:
 * - Import { TemplateAnalyticsService } from "./TemplateAnalyticsService"
 * - Instantiate new TemplateAnalyticsService()
 * - Call methods like getPerformanceMetrics, updateAnalytics - same as original
 * 
 * Backward compatibility: All public methods have same signatures as original.
 * Internal: Delegates to ./queries.ts and ./mutations.ts
 */

import { BaseAnalyticsService } from "../BaseAnalyticsService";
import { ConvexHttpClient } from "convex/browser";
import type { AnalyticsFilters, AnalyticsComputeOptions, DataGranularity } from "@/types/analytics/core";
import type {
  TemplateAnalytics,
  TimeSeriesDataPoint,
  TemplateUsageAnalytics,
  TemplateEffectivenessMetrics,
  TemplateAnalyticsOverview,
  FilteredTemplateAnalytics,
  TemplateAnalyticsUpdatePayload,
  TemplateAnalyticsBatchUpdatePayload
} from "./types";
import {
  performPerformanceMetricsQuery,
  performTimeSeriesDataQuery,
  performUsageAnalyticsQuery,
  performEffectivenessMetricsQuery,
  performAnalyticsOverviewQuery,
  performFilteredAnalyticsQuery
} from "./queries";
import {
  performUpdateAnalyticsMutation,
  performBatchUpdateAnalyticsMutation
} from "./mutations";
import { api } from "@/convex/_generated/api";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";

/**
 * Template Analytics Service
 * 
 * Handles template performance tracking, usage analytics, and effectiveness metrics.
 * Uses standardized field names (opened_tracked, clicked_tracked) and 
 * AnalyticsCalculator for consistent rate calculations.
 * 
 * All public methods maintain original API - internal delegation to modular files.
 */
export class TemplateAnalyticsService extends BaseAnalyticsService {
  private readonly convex: ConvexHttpClient;
  private readonly logger = {
    info: (message: string, data?: Record<string, unknown>) => console.log(message, data),
    warn: (message: string, data?: Record<string, unknown>) => console.warn(message, data),
    error: (message: string, data?: Record<string, unknown>) => console.error(message, data),
  };

  constructor() {
    super("templates");
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }

  /**
   * Get company ID from context or environment.
   * In a real implementation, this would get the company ID from the current user session.
   */
  private async getCompanyId(): Promise<string> {
    // TODO: Implement proper company ID retrieval from user session/context
    return process.env.COMPANY_ID || "default-company";
  }

  /**
   * Test cache connection for health checks.
   */
  private async testCacheConnection(): Promise<void> {
    // TODO: Implement cache connection test
    // For now, just resolve successfully
    return Promise.resolve();
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
    // TODO: Implement cache invalidation
    // For now, just log the patterns
    console.log("Invalidating cache patterns:", patterns);
  }

  /**
   * Get template performance metrics for specified templates.
   * Uses filter-first approach: filters data at database level, then computes analytics.
   */
  async getPerformanceMetrics(
    templateIds?: string[],
    filters?: AnalyticsFilters
  ): Promise<TemplateAnalytics[]> {
    return this.executeWithCache(
      "performance",
      templateIds || [],
      (filters ?? ({} as AnalyticsFilters)),
      async () => await performPerformanceMetricsQuery(
        this.convex,
        await this.getCompanyId(),
        templateIds,
        filters ?? {}
      ),
      this.getCacheTTL("performance")
    );
  }

  /**
   * Get template time series data for charts.
   * Supports daily, weekly, and monthly granularity.
   */
  async getTimeSeriesData(
    templateIds?: string[],
    filters?: AnalyticsFilters,
    granularity: DataGranularity = "day"
  ): Promise<TimeSeriesDataPoint[]> {
    return this.executeWithCache(
      "timeseries",
      templateIds || [],
      (filters ?? ({} as AnalyticsFilters)),
      async () => {
        const timeSeriesData = await performTimeSeriesDataQuery(
          this.convex,
          await this.getCompanyId(),
          templateIds,
          filters ?? {},
          granularity
        );
        return timeSeriesData.map((item: TimeSeriesDataPoint & { leadCount?: number }) => ({
          date: item.date,
          label: item.date,
          metrics: item.metrics,
          leadCount: item.leadCount || 0
        }));
      },
      this.getCacheTTL("timeseries")
    );
  }

  /**
   * Get template usage analytics - most used templates, usage trends.
   */
  async getUsageAnalytics(
    filters?: AnalyticsFilters,
    limit: number = 10
  ): Promise<TemplateUsageAnalytics> {
    return this.executeWithCache(
      "usage",
      [],
      (filters ?? ({} as AnalyticsFilters)),
      async () => await performUsageAnalyticsQuery(
        this.convex,
        await this.getCompanyId(),
        filters ?? {},
        limit
      ),
      this.getCacheTTL("usage")
    );
  }

  /**
   * Get template effectiveness metrics - performance comparison.
   * Calculates effectiveness scores based on open rates, reply rates, and usage.
   */
  async getEffectivenessMetrics(
    templateIds: string[],
    filters?: AnalyticsFilters
  ): Promise<TemplateEffectivenessMetrics> {
    return this.executeWithCache(
      "effectiveness",
      templateIds,
      (filters ?? ({} as AnalyticsFilters)),
      async () => await performEffectivenessMetricsQuery(
        this.convex,
        await this.getCompanyId(),
        templateIds,
        filters ?? {}
      ),
      this.getCacheTTL("effectiveness")
    );
  }

  /**
   * Get aggregated template analytics overview.
   */
  async getAnalyticsOverview(
    filters?: AnalyticsFilters
  ): Promise<TemplateAnalyticsOverview> {
    return this.executeWithCache(
      "overview",
      [],
      (filters ?? ({} as AnalyticsFilters)),
      async () => await performAnalyticsOverviewQuery(
        this.convex,
        await this.getCompanyId(),
        filters ?? {}
      ) as TemplateAnalyticsOverview,
      this.getCacheTTL("overview")
    );
  }

  /**
   * Compute analytics on filtered dataset.
   * Filter data first at database level, then compute analytics on the filtered results.
   */
  async computeAnalyticsForFilteredData(
    filters: AnalyticsFilters,
    options: AnalyticsComputeOptions = {}
  ): Promise<FilteredTemplateAnalytics> {
    return this.executeWithCache(
      "filtered",
      [],
      filters,
      async () => await performFilteredAnalyticsQuery(
        this.convex,
        await this.getCompanyId(),
        filters,
        options
      ),
      this.getCacheTTL("filtered")
    );
  }

  /**
   * Update template analytics data.
   */
  async updateAnalytics(data: TemplateAnalyticsUpdatePayload): Promise<void> {
    await performUpdateAnalyticsMutation(
      this.convex,
      data,
      this.logger
    );
    
    // Invalidate related cache entries
    await this.invalidateCachePatterns([
      `analytics:templates:performance:*`,
      `analytics:templates:timeseries:*`,
      `analytics:templates:usage:*`,
      `analytics:templates:effectiveness:*`,
      `analytics:templates:overview:*`,
      `analytics:templates:filtered:*`,
    ]);
  }

  /**
   * Batch update multiple template analytics records.
   */
  async batchUpdateAnalytics(
    updates: TemplateAnalyticsBatchUpdatePayload
  ): Promise<void> {
    await performBatchUpdateAnalyticsMutation(
      this.convex,
      updates,
      this.logger
    );

    // Invalidate all template analytics cache
    await this.invalidateCache();
  }

  /**
   * Implementation of abstract healthCheck method from BaseAnalyticsService.
   */
  async healthCheck(): Promise<boolean> {
    try {
      const healthStatus = await this.getHealthCheck();
      return healthStatus.status === "healthy";
    } catch (error) {
      console.error("Template analytics health check failed:", error);
      return false;
    }
  }

  /**
   * Get detailed health check status for template analytics service.
   */
  async getHealthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    checks: Array<{
      name: string;
      status: "pass" | "fail";
      message: string;
      responseTime?: number;
    }>;
  }> {
    const checks = [];
    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

    // Test Convex connection
    try {
      const start = Date.now();
      const companyId = await this.getCompanyId();
      const convexHelper = createAnalyticsConvexHelper(this.convex, "TemplateAnalyticsService");
      
      await convexHelper.query<unknown>(
        api.templateAnalytics.getTemplateAnalyticsOverview,
        { companyId },
        {
          serviceName: "TemplateAnalyticsService",
          methodName: "getHealthCheck",
        }
      );
      const responseTime = Date.now() - start;
      
      checks.push({
        name: "convex_connection",
        status: "pass" as const,
        message: "Convex connection successful",
        responseTime,
      });
      
      if (responseTime > 2000) {
        overallStatus = "degraded";
      }
    } catch (error) {
      checks.push({
        name: "convex_connection",
        status: "fail" as const,
        message: `Convex connection failed: ${error}`,
      });
      overallStatus = "unhealthy";
    }

    // Test cache connection
    try {
      const start = Date.now();
      await this.testCacheConnection();
      const responseTime = Date.now() - start;
      
      checks.push({
        name: "cache_connection",
        status: "pass" as const,
        message: "Cache connection successful",
        responseTime,
      });
    } catch (error) {
      checks.push({
        name: "cache_connection",
        status: "fail" as const,
        message: `Cache connection failed: ${error}`,
      });
      if (overallStatus === "healthy") {
        overallStatus = "degraded"; // Cache failure is not critical
      }
    }

    return {
      status: overallStatus,
      checks,
    };
  }

  /**
   * Get cache TTL based on operation type.
   */
  private getCacheTTL(operation: string): number {
    const ttlMap: Record<string, number> = {
      performance: 5 * 60, // 5 minutes
      timeseries: 10 * 60, // 10 minutes
      usage: 15 * 60, // 15 minutes
      effectiveness: 10 * 60, // 10 minutes
      overview: 5 * 60, // 5 minutes
      filtered: 5 * 60, // 5 minutes
    };
    
    return ttlMap[operation] || 5 * 60; // Default 5 minutes
  }
}

// Re-exports for backward compatibility
export * from "./types";
export * from "./validation";
export * from "./calculations";
export * from "./queries";
export * from "./mutations";
