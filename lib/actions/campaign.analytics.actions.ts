'use server';

// ============================================================================
// CAMPAIGN ANALYTICS SERVER ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/campaign-analytics.ts
//
// Migration notes:
// - Replaced safeQuery/safeMutation with ConvexQueryHelper
// - All functions now use standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved error handling and type safety
// - Performance monitoring and caching improvements

import {
  getCampaignPerformanceMetrics as _getCampaignPerformanceMetrics,
  getCampaignAnalytics,
  getCampaignAnalyticsSummary,
  getSequenceStepAnalytics,
  getCampaignTimeSeries,
  updateCampaignAnalytics as _updateCampaignAnalytics,
  bulkUpdateCampaignAnalytics,
  exportCampaignAnalytics,
  getCampaignAnalyticsHealth,
  refreshCampaignAnalyticsCache,
  type CampaignPerformanceMetrics,
  type CampaignAnalyticsSummary
} from './analytics/campaign-analytics';

// Re-export all functions for backward compatibility
export {
  getCampaignAnalytics,
  getCampaignAnalyticsSummary,
  getSequenceStepAnalytics,
  getCampaignTimeSeries,
  bulkUpdateCampaignAnalytics,
  exportCampaignAnalytics,
  getCampaignAnalyticsHealth,
  refreshCampaignAnalyticsCache,
  type CampaignPerformanceMetrics,
  type CampaignAnalyticsSummary
};

// Legacy imports for backward compatibility
import { api } from "@/convex/_generated/api";
import { safeQuery, safeMutation } from "@/lib/utils/safe-convex";
import {
  AnalyticsFilters,
  PerformanceMetrics,
  TimeSeriesDataPoint,
  AnalyticsComputeOptions
} from "@/types/analytics/core";
import {
  CampaignAnalytics,
  SequenceStepAnalytics,
  CampaignStatus
} from "@/types/analytics/domain-specific";
import {
  CampaignAnalyticsRecord,
  AggregatedCampaignMetrics,
  TimeSeriesData
} from "@/convex/campaignAnalytics/types";
import {
  AnalyticsCalculator,
  analyticsCache,
  CACHE_TTL
} from "@/lib/services/analytics";
import { ConvexMigrationUtils } from "@/lib/utils/convex-migration";

// Type definitions for Convex query responses
interface CampaignPerformanceMetricsResponse {
  campaignId: string;
  campaignName: string;
  status: CampaignStatus;
  metrics: AggregatedCampaignMetrics;
  updatedAt: number;
}

interface CampaignAnalyticsResponse {
  results: CampaignAnalyticsRecord[];
  nextCursor?: string;
  hasMore: boolean;
}

interface LegacyCampaignData {
  campaignId?: string;
  campaignName?: string;
  sent?: number;
  delivered?: number;
  opened_tracked?: number;
  clicked_tracked?: number;
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  spamComplaints?: number;
  status?: CampaignStatus;
  leadCount?: number;
  activeLeads?: number;
  completedLeads?: number;
  [key: string]: unknown;
}

// Using shared Convex client via safeQuery wrapper


/**
 * Get time series analytics data for campaigns.
 * Returns data formatted for charts with configurable granularity.
 */
export async function getCampaignTimeSeriesData(
  campaignIds?: string[],
  filters?: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day",
  companyId?: string
): Promise<TimeSeriesDataPoint[]> {
  const cacheKey = analyticsCache.generateCacheKey(
    "campaigns",
    "timeseries",
    campaignIds || [],
    { ...filters, additionalFilters: { ...filters?.additionalFilters, granularity, companyId } }
  );

  // Try cache first
  if (analyticsCache.isAvailable()) {
    try {
      const cached = await analyticsCache.get<TimeSeriesDataPoint[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }
  }

  try {
    const analyticsFilters = filters || createDefaultFilters();
    const effectiveCompanyId = companyId || getCurrentCompanyId();

    // Query Convex for time series data via safe wrapper
    const rawTs = await safeQuery(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Convex generated type for this function can cause deep instantiation
      api.campaignAnalytics.getCampaignTimeSeriesAnalytics,
      {
        campaignIds: campaignIds || [],
        dateRange: analyticsFilters.dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        companyId: effectiveCompanyId,
        granularity,
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeSeriesData = (rawTs as any) as TimeSeriesData[];

    // Transform to standardized TimeSeriesDataPoint format
    const result: TimeSeriesDataPoint[] = timeSeriesData.map((point: TimeSeriesData) => ({
      date: point.timeKey,
      label: point.timeLabel,
      metrics: {
        sent: point.metrics.sent,
        delivered: point.metrics.delivered,
        opened_tracked: point.metrics.openedTracked,
        clicked_tracked: point.metrics.clickedTracked,
        replied: point.metrics.replied,
        bounced: point.metrics.bounced,
        unsubscribed: point.metrics.unsubscribed,
        spamComplaints: point.metrics.spamComplaints,
      },
    }));

    // Cache the result
    if (analyticsCache.isAvailable()) {
      try {
        await analyticsCache.set(cacheKey, result, CACHE_TTL.RECENT);
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching campaign time series data:", error);
    throw new Error("Failed to fetch campaign time series data");
  }
}

/**
 * Compute analytics on pre-filtered campaign data.
 * Filters data first, then computes analytics on the filtered dataset.
 */
export async function computeAnalyticsForFilteredData(
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  const cacheKey = analyticsCache.generateCacheKey(
    "campaigns",
    "filtered-analytics",
    filters.entityIds || [],
    { ...filters, additionalFilters: { ...filters?.additionalFilters, computeOptions, companyId } }
  );

  // Try cache first
  if (analyticsCache.isAvailable()) {
    try {
      const cached = await analyticsCache.get<{
        aggregatedMetrics: PerformanceMetrics;
        rates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
        timeSeriesData?: TimeSeriesDataPoint[];
        performanceMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
      }>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }
  }

  try {
    const effectiveCompanyId = companyId || getCurrentCompanyId();
    const effectiveFilters = filters || createDefaultFilters();
    const effectiveCampaignIds = effectiveFilters.entityIds || [];

    // Query filtered data from Convex via safe wrapper
    const rawDataUnknown = await safeQuery(
      api.campaignAnalytics.getCampaignAnalytics,
      {
        campaignIds: effectiveCampaignIds.length > 0 ? effectiveCampaignIds : undefined,
        dateRange: effectiveFilters.dateRange,
        companyId: effectiveCompanyId,
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = (rawDataUnknown as any) as CampaignAnalyticsResponse;

    // Extract metrics from raw data
    const metrics = rawData.results.map((item: CampaignAnalyticsRecord) => ({
      sent: item.sent,
      delivered: item.delivered,
      opened_tracked: item.openedTracked,
      clicked_tracked: item.clickedTracked,
      replied: item.replied,
      bounced: item.bounced,
      unsubscribed: item.unsubscribed,
      spamComplaints: item.spamComplaints,
    }));
    
    // Aggregate metrics
    const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(metrics);
    
    // Calculate rates
    const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
    
    // Build result object
    const result = {
      aggregatedMetrics,
      rates,
      performanceMetrics: rates
    };

    // Cache the result
    if (analyticsCache.isAvailable()) {
      try {
        await analyticsCache.set(cacheKey, result, CACHE_TTL.RECENT);
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error computing analytics for filtered data:", error);
    throw new Error("Failed to compute analytics for filtered data");
  }
}

/**
 * Get sequence step analytics for campaigns.
 * Returns performance data for each step in campaign sequences.
 */
export async function getCampaignSequenceAnalytics(
  campaignId: string,
  filters?: AnalyticsFilters,
  companyId?: string
): Promise<SequenceStepAnalytics[]> {
  const cacheKey = analyticsCache.generateCacheKey(
    "campaigns",
    "sequence",
    [campaignId],
    { ...filters, additionalFilters: { ...filters?.additionalFilters, companyId } }
  );

  // Try cache first
  if (analyticsCache.isAvailable()) {
    try {
      const cached = await analyticsCache.get<SequenceStepAnalytics[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }
  }

  try {
    const analyticsFilters = filters || createDefaultFilters();
    const effectiveCompanyId = companyId || getCurrentCompanyId();

    // Query sequence analytics from Convex via safe wrapper
    const rawSeq = await safeQuery(
      api.sequenceStepAnalytics.getCampaignSequenceAnalytics,
      {
        campaignId,
        dateRange: analyticsFilters.dateRange,
        companyId: effectiveCompanyId,
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sequenceData = rawSeq as any[];

    // Transform to standardized SequenceStepAnalytics format
    const result: SequenceStepAnalytics[] = sequenceData.map(step => ({
      stepId: step.stepId,
      stepType: step.stepType,
      subject: step.subject,
      waitDuration: step.waitDuration,
      
      // Performance metrics from aggregatedMetrics
      sent: step.aggregatedMetrics.sent,
      delivered: step.aggregatedMetrics.delivered,
      opened_tracked: step.aggregatedMetrics.opened_tracked,
      clicked_tracked: step.aggregatedMetrics.clicked_tracked,
      replied: step.aggregatedMetrics.replied,
      bounced: step.aggregatedMetrics.bounced,
      unsubscribed: step.aggregatedMetrics.unsubscribed,
      spamComplaints: step.aggregatedMetrics.spamComplaints,
    }));

    // Cache the result
    if (analyticsCache.isAvailable()) {
      try {
        await analyticsCache.set(cacheKey, result, CACHE_TTL.RECENT);
      } catch (error) {
        console.warn("Cache write error:", error);
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching campaign sequence analytics:", error);
    throw new Error("Failed to fetch campaign sequence analytics");
  }
}


/**
 * Migrate legacy campaign data to Convex format.
 * Uses ConvexMigrationUtils for data transformation.
 */
export async function migrateLegacyCampaignData(
  legacyData: LegacyCampaignData[],
  companyId: string
): Promise<{ success: number; errors: number; details: string[] }> {
  const results = {
    success: 0,
    errors: 0,
    details: [] as string[],
  };

  try {
    // Migrate data using ConvexMigrationUtils
    const migratedData = ConvexMigrationUtils.batchMigrate(
      legacyData,
      ConvexMigrationUtils.migrateCampaignData,
      (error, record) => {
        results.errors++;
        results.details.push(`Migration error for record ${record.id || 'unknown'}: ${error.message}`);
      }
    );

    if (migratedData.length > 0) {
      // Prepare data for Convex insertion, mapping to camelCase
      const convexRecords = migratedData.map(campaign => ({
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        date: new Date().toISOString().split("T")[0], // Use current date for migration
        companyId,
        sent: campaign.sent,
        delivered: campaign.delivered,
        openedTracked: campaign.opened_tracked,
        clickedTracked: campaign.clicked_tracked,
        replied: campaign.replied,
        bounced: campaign.bounced,
        unsubscribed: campaign.unsubscribed,
        spamComplaints: campaign.spamComplaints,
        status: campaign.status,
        leadCount: campaign.leadCount,
        activeLeads: campaign.activeLeads,
        completedLeads: campaign.completedLeads,
      }));

      // Batch insert into Convex via safe wrapper
      const insertedIds = await safeMutation(
        api.campaignAnalytics.batchUpsertCampaignAnalytics,
        { records: convexRecords }
      ) as string[];

      results.success = insertedIds.length;
      results.details.push(`Successfully migrated ${insertedIds.length} campaign records`);

      // Invalidate cache after migration
      if (analyticsCache.isAvailable()) {
        try {
          await analyticsCache.invalidateDomain("campaigns");
        } catch (error) {
          console.warn("Cache invalidation error after migration:", error);
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error migrating legacy campaign data:", error);
    results.errors++;
    results.details.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
}

/**
 * Backward-compatible wrapper for getCampaignPerformanceMetrics.
 * Maintains the old signature expected by existing services.
 */
export async function getCampaignPerformanceMetrics(
  campaignIds?: string[],
  filters?: AnalyticsFilters,
  companyId?: string
): Promise<CampaignAnalytics[]> {
  try {
    // Call the new standardized function
    const result = await _getCampaignPerformanceMetrics(campaignIds || [], filters);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to fetch campaign performance metrics');
    }

    // Transform the new response format to the old format
    return result.data.map((item: any) => ({
      id: item.campaignId,
      name: item.campaignName,
      campaignId: item.campaignId,
      campaignName: item.campaignName,
      status: item.status,
      leadCount: 0, // Not provided in new format
      activeLeads: 0, // Not provided in new format
      completedLeads: 0, // Not provided in new format
      sent: item.performance.sent,
      delivered: item.performance.delivered,
      opened_tracked: item.performance.openedTracked,
      clicked_tracked: item.performance.clickedTracked,
      replied: item.performance.replied,
      bounced: item.performance.bounced,
      unsubscribed: item.performance.unsubscribed,
      spamComplaints: item.performance.spamComplaints,
      updatedAt: item.updatedAt,
    }));
  } catch (error) {
    console.error("Error in backward-compatible getCampaignPerformanceMetrics:", error);
    throw error;
  }
}

/**
 * Backward-compatible wrapper for updateCampaignAnalytics.
 * Maintains the old signature expected by existing services.
 */
export async function updateCampaignAnalytics(
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
 try {
   // Transform old format to new format
   const updateData = {
     campaignName: campaignData.campaignName,
     sent: campaignData.sent,
     delivered: campaignData.delivered,
     opened_tracked: campaignData.opened_tracked,
     clicked_tracked: campaignData.clicked_tracked,
     replied: campaignData.replied,
     bounced: campaignData.bounced,
     unsubscribed: campaignData.unsubscribed,
     spamComplaints: campaignData.spamComplaints,
     status: campaignData.status,
     leadCount: campaignData.leadCount,
     activeLeads: campaignData.activeLeads,
     completedLeads: campaignData.completedLeads,
   };

   // Call the new standardized function
   const result = await _updateCampaignAnalytics(campaignData.campaignId, updateData);

   if (!result.success) {
     throw new Error(result.error?.message || 'Failed to update campaign analytics');
   }

   // Return the campaign ID as string (old format)
   return campaignData.campaignId;
 } catch (error) {
   console.error("Error in backward-compatible updateCampaignAnalytics:", error);
   throw error;
 }
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create default analytics filters (last 30 days).
 */
function createDefaultFilters(): AnalyticsFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  return {
    dateRange: {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    },
  };
}

/**
 * Get current company ID from context/session.
 * This is a placeholder - implement based on your auth system.
 */
function getCurrentCompanyId(): string {
  // TODO: Implement based on your authentication system
  // This could come from session, JWT token, or other auth mechanism
  return process.env.DEFAULT_COMPANY_ID || "default-company";
}

/**
 * Invalidate campaign analytics cache.
 */
export async function invalidateCampaignAnalyticsCache(
  campaignIds?: string[]
): Promise<number> {
  if (!analyticsCache.isAvailable()) {
    return 0;
  }

  try {
    if (campaignIds) {
      return await analyticsCache.invalidateEntities("campaigns", campaignIds);
    } else {
      return await analyticsCache.invalidateDomain("campaigns");
    }
  } catch (error) {
    console.error("Error invalidating campaign analytics cache:", error);
    return 0;
  }
}
