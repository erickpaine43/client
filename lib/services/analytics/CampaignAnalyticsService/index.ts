// ============================================================================
// CAMPAIGN ANALYTICS SERVICE - MAIN ENTRY POINT
// ============================================================================

import { BaseAnalyticsService } from "../BaseAnalyticsService";
import {
  CampaignAnalytics,
  SequenceStepAnalytics,
  TimeSeriesDataPoint,
  AnalyticsFilters,
  AnalyticsComputeOptions,
  DataGranularity,
  PerformanceMetrics
} from "./types";
import {
  queryCampaignPerformanceMetrics,
  queryCampaignTimeSeriesData,
  queryCampaignSequenceAnalytics,
  queryCampaignLeadEngagement,
  queryFilteredAnalyticsComputation
} from "./queries";
import {
  updateCampaignAnalyticsData,
  migrateLegacyCampaignDataAction,
  invalidateCampaignAnalyticsCacheAction
} from "./mutations";
import {
  validateCampaignIds,
  validateCampaignFilters,
  validateCampaignData
} from "./validation";

/**
 * Campaign Analytics Service
 *
 * Handles campaign performance tracking, sequence analytics, lead engagement,
 * time series data, and filtered computations.
 * Uses standardized field names and maintains API compatibility.
 *
 * All public methods maintain original API - internal delegation to modular files.
 */
export class CampaignAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super("campaigns");
  }

  /**
   * Get performance metrics for specific campaigns.
   * Original API: async getPerformanceMetrics(campaignIds?: string[], filters?: AnalyticsFilters, companyId?: string): Promise<CampaignAnalytics[]>
   */
  async getPerformanceMetrics(
    campaignIds?: string[],
    filters?: AnalyticsFilters,
    companyId?: string
  ): Promise<CampaignAnalytics[]> {
    const startTime = Date.now();

    try {
      // Validate campaign IDs
      validateCampaignIds(campaignIds);

      // Validate filters if provided
      if (filters) {
        validateCampaignFilters(filters);
      }

      const result = await this.executeWithCache<CampaignAnalytics[]>(
        "performance",
        campaignIds || [],
        { ...filters, companyId },
        () => queryCampaignPerformanceMetrics(campaignIds, filters, companyId),
        CACHE_TTL.RECENT
      );

      // Validate each campaign's metrics by extracting only PerformanceMetrics properties
      result.forEach(campaign => {
        this.validateMetrics(this.toPerformanceMetrics(campaign));
      });

      this.logOperation(
        "getPerformanceMetrics",
        campaignIds || [],
        Date.now() - startTime,
        true
      );

      return result;
    } catch (error) {
      const analyticsError = this.normalizeError(error);

      this.logOperation(
        "getPerformanceMetrics",
        campaignIds || [],
        Date.now() - startTime,
        false,
        analyticsError
      );

      throw analyticsError;
    }
  }

  /**
   * Get time series analytics data for campaigns.
   * Original API: async getTimeSeriesData(campaignIds: string[], filters?: Omit<AnalyticsFilters, 'entityIds'>, granularity: DataGranularity, companyId?: string): Promise<TimeSeriesDataPoint[]>
   */
  async getTimeSeriesData(
    campaignIds: string[] = [],
    filters?: Partial<Omit<AnalyticsFilters, 'entityIds'>>,
    granularity: DataGranularity = "day",
    companyId?: string
  ): Promise<TimeSeriesDataPoint[]> {
    const startTime = Date.now();

    try {
      // If no campaign IDs provided, return empty array
      if (!campaignIds || campaignIds.length === 0) {
        return [];
      }

      // Validate campaign IDs
      validateCampaignIds(campaignIds);

      // Validate filters if provided
      if (filters) {
        // Note: filters here omit 'entityIds', so we need to add companyId for validation
        const fullFilters = { ...filters, companyId: companyId || "default" };
        validateCampaignFilters(fullFilters);
      }

      const result = await this.executeWithCache(
        "timeseries",
        campaignIds,
        { ...filters, granularity, companyId },
        () => queryCampaignTimeSeriesData(campaignIds, filters, granularity, companyId),
        CACHE_TTL.RECENT
      );

      this.logOperation(
        "getTimeSeriesData",
        campaignIds || [],
        Date.now() - startTime,
        true
      );

      return result;
    } catch (error) {
      const analyticsError = this.normalizeError(error);

      this.logOperation(
        "getTimeSeriesData",
        campaignIds || [],
        Date.now() - startTime,
        false,
        analyticsError
      );

      throw analyticsError;
    }
  }

  /**
   * Compute analytics on pre-filtered campaign data.
   * Original API: async computeAnalyticsForFilteredData(filters: AnalyticsFilters, computeOptions: AnalyticsComputeOptions, companyId?: string): Promise<{...}>
   */
  async computeAnalyticsForFilteredData(
    filters: AnalyticsFilters,
    computeOptions: AnalyticsComputeOptions = {},
    companyId?: string
  ): Promise<{
    aggregatedMetrics: PerformanceMetrics;
    rates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
    data: CampaignAnalytics[];
    metadata: {
      total: number;
      filtered: number;
      queryTime: number;
    } & ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
  }> {
    const startTime = Date.now();

    try {
      // Use server-side action to compute filtered analytics and leverage executeWithCache
      const entityIds = filters.entityIds || [];
      const cached = await this.executeWithCache(
        "computeFiltered",
        entityIds,
        { ...filters, companyId },
        () => queryFilteredAnalyticsComputation(filters, computeOptions, companyId),
        CACHE_TTL.RECENT
      );

      // If we have campaign-level data, validate metrics
      if (cached && 'data' in cached && Array.isArray(cached.data)) {
        cached.data.forEach((c: unknown) => this.validateMetrics(this.toPerformanceMetrics(c)));
      }

      this.logOperation(
        "computeAnalyticsForFilteredData",
        entityIds,
        Date.now() - startTime,
        true
      );

      return cached as {
        aggregatedMetrics: PerformanceMetrics;
        rates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
        data: CampaignAnalytics[];
        metadata: {
          total: number;
          filtered: number;
          queryTime: number;
        } & ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
      };
    } catch (error) {
      const analyticsError = this.normalizeError(error);

      this.logOperation(
        "computeAnalyticsForFilteredData",
        filters.entityIds || [],
        Date.now() - startTime,
        false,
        analyticsError
      );

      throw analyticsError;
    }
  }

  /**
   * Get sequence step analytics for a specific campaign.
   * Original API: async getSequenceAnalytics(campaignId: string, filters?: AnalyticsFilters, companyId?: string): Promise<SequenceStepAnalytics[]>
   */
  async getSequenceAnalytics(
    campaignId: string,
    filters?: AnalyticsFilters,
    companyId?: string
  ): Promise<SequenceStepAnalytics[]> {
    const startTime = Date.now();

    try {
      if (!campaignId) {
        throw new AnalyticsError(
          AnalyticsErrorType.INVALID_FILTERS,
          "Campaign ID is required for sequence analytics",
          this.domain,
          false
        );
      }

      // Validate filters if provided
      if (filters) {
        this.validateFilters(filters);
      }

      const result = await this.executeWithCache<SequenceStepAnalytics[]>(
        'sequence',
        [campaignId],
        { ...filters, companyId },
        () => queryCampaignSequenceAnalytics(campaignId, filters, companyId),
        CACHE_TTL.RECENT
      );

      this.logOperation('getSequenceAnalytics', [campaignId], Date.now() - startTime, true);

      return result;
    } catch (error) {
      const analyticsError = this.normalizeError(error);

      this.logOperation('getSequenceAnalytics', [campaignId], Date.now() - startTime, false, analyticsError);

      throw analyticsError;
    }
  }

  /**
   * Get lead engagement data for a campaign.
   * Original API: async getLeadEngagement(campaignId: string, filters?: AnalyticsFilters, companyId?: string): Promise<{...}>
   */
  async getLeadEngagement(
    campaignId: string,
    filters?: AnalyticsFilters,
    companyId?: string
  ): Promise<{
    totalLeads: number;
    activeLeads: number;
    engagedLeads: number;
    repliedLeads: number;
    unsubscribedLeads: number;
    engagementRate: number;
    conversionRate: number;
  }> {
    const startTime = Date.now();

    try {
      if (!campaignId) {
        throw new AnalyticsError(
          AnalyticsErrorType.INVALID_FILTERS,
          "Campaign ID is required for lead engagement data",
          this.domain,
          false
        );
      }

      // Get campaign performance metrics
      const campaignMetrics = await this.getPerformanceMetrics([campaignId], filters, companyId);

      const result = await queryCampaignLeadEngagement(campaignId, campaignMetrics, filters);

      this.logOperation(
        "getLeadEngagement",
        [campaignId],
        Date.now() - startTime,
        true
      );

      return result;
    } catch (error) {
      const analyticsError = this.normalizeError(error);

      this.logOperation(
        "getLeadEngagement",
        [campaignId],
        Date.now() - startTime,
        false,
        analyticsError
      );

      throw analyticsError;
    }
  }

  /**
   * Update campaign analytics data.
   * Original API: async updateAnalytics(campaignData: {...}): Promise<string>
   */
  async updateAnalytics(
    campaignData: {
      campaignId: string;
      campaignName: string;
      date: string;
      companyId: string;
      sent: number;
      delivered: number;
      opened_tracked: number;
      clicked_tracked: number;
      replied: number;
      bounced: number;
      unsubscribed: number;
      spamComplaints: number;
      status: "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT";
      leadCount: number;
      activeLeads: number;
      completedLeads: number;
    }
  ): Promise<string> {
    const startTime = Date.now();

    try {
      // Validate campaign data
      validateCampaignData(campaignData);

      // Convert to PerformanceMetrics for validation
      const metrics = this.toPerformanceMetrics({
        sent: campaignData.sent,
        delivered: campaignData.delivered,
        opened_tracked: campaignData.opened_tracked,
        clicked_tracked: campaignData.clicked_tracked,
        replied: campaignData.replied,
        bounced: campaignData.bounced,
        unsubscribed: campaignData.unsubscribed,
        spamComplaints: campaignData.spamComplaints
      });

      // Validate the metrics
      this.validateMetrics(metrics);

      const result = await updateCampaignAnalyticsData(campaignData);

      // Invalidate cache for this campaign
      await this.invalidateCache([campaignData.campaignId]);

      this.logOperation(
        "updateAnalytics",
        [campaignData.campaignId],
        Date.now() - startTime,
        true
      );

      return result;
    } catch (error) {
      const analyticsError = this.normalizeError(error);

      this.logOperation(
        "updateAnalytics",
        [campaignData.campaignId],
        Date.now() - startTime,
        false,
        analyticsError
      );

      throw analyticsError;
    }
  }

  /**
   * Migrate legacy campaign data.
   * Original API: async migrateLegacyData(campaignId?: string, companyId?: string): Promise<void>
   */
  async migrateLegacyData(campaignId?: string, companyId?: string): Promise<void> {
    await migrateLegacyCampaignDataAction(campaignId, companyId);
  }

  /**
   * Invalidate campaign analytics cache.
   * Original API: async invalidateCache(campaignIds?: string[]): Promise<number>
   */
  async invalidateCache(campaignIds?: string[]): Promise<number> {
    return await invalidateCampaignAnalyticsCacheAction(campaignIds);
  }

  /**
   * Check if the campaign analytics service is healthy.
   * Original API: async healthCheck(): Promise<boolean>
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Perform a simple query to verify the service is working
      const testResult = await this.getPerformanceMetrics();
      return Array.isArray(testResult);
    } catch (error) {
      console.error('Campaign Analytics Service health check failed:', error);
      return false;
    }
  }

  // Import required dependencies
  private toPerformanceMetrics = toPerformanceMetrics;
}

// Import required types and utilities
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { CACHE_TTL } from "@/lib/utils/redis";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { toPerformanceMetrics } from "./calculations";

// Export singleton instance for backward compatibility
export const campaignAnalyticsService = new CampaignAnalyticsService();

// Re-exports for backward compatibility
export * from "./types";
export * from "./validation";
export * from "./calculations";
export * from "./queries";
export * from "./mutations";
