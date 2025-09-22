"use server";

// ============================================================================
// MAILBOX ANALYTICS SERVER ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/mailbox-analytics.ts
//
// Migration notes:
// - All functions now use ConvexQueryHelper for consistent error handling
// - Standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved type safety and performance monitoring

import {
  getMailboxAnalytics,
  getMailboxAnalyticsSummary,
  getWarmupAnalytics,
  getMailboxTimeSeries,
  updateWarmupProgress,
  refreshMailboxHealthScores,
  exportMailboxAnalytics,
  getMailboxAnalyticsHealth,
  type MailboxPerformanceMetrics,
  type MailboxAnalyticsSummary,
  type WarmupAnalytics
} from './analytics/mailbox-analytics';

// Re-export all functions for backward compatibility
export {
  getMailboxAnalytics,
  getMailboxAnalyticsSummary,
  getWarmupAnalytics,
  getMailboxTimeSeries,
  updateWarmupProgress,
  refreshMailboxHealthScores,
  exportMailboxAnalytics,
  getMailboxAnalyticsHealth,
  type MailboxPerformanceMetrics,
  type MailboxAnalyticsSummary,
  type WarmupAnalytics
};

// Legacy imports for backward compatibility
import {
  AnalyticsFilters,
  PerformanceMetrics,
  TimeSeriesDataPoint,
  AnalyticsComputeOptions,
} from "@/types/analytics/core";
import { 
  WarmupStatus,
  DailyWarmupStats 
} from "@/types/analytics/domain-specific";
import type { MailboxHealthMetrics } from "@/lib/services/analytics/MailboxAnalyticsService";
import { MailboxAnalyticsService } from "@/lib/services/analytics/MailboxAnalyticsService";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import {
  safeExtractCompanyId,
  calculateRatesForCoreMetrics,
} from "@/lib/utils/analytics-mappers";

// Initialize the mailbox analytics service
const mailboxAnalyticsService = new MailboxAnalyticsService();

// ============================================================================
// MAILBOX PERFORMANCE ACTIONS
// ============================================================================

/**
 * Get performance metrics for specific mailboxes.
 * Replaces scattered logic from lib/actions/mailboxActions.ts
 */
export async function getMailboxPerformanceMetrics(
  mailboxIds: string[],
  filters?: Partial<AnalyticsFilters>
): Promise<{
  mailboxId: string;
  email: string;
  domain: string;
  provider: string;
  warmupStatus: WarmupStatus;
  warmupProgress: number;
  dailyLimit: number;
  currentVolume: number;
  healthScore: number;
  performanceMetrics: PerformanceMetrics;
  calculatedRates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}[]> {
  // Create default filters if not provided
  // Build core analytics filters (data-layer shape)
  const companyId: string = safeExtractCompanyId(filters, "default");

  const additionalFiltersCore: Record<string, unknown> = {
    ...((filters as Partial<AnalyticsFilters>)?.additionalFilters || {}),
  };
  additionalFiltersCore.companyId = companyId;

  const analyticsFiltersCore: AnalyticsFilters = {
    dateRange:
      filters?.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
    entityIds: mailboxIds,
    additionalFilters: additionalFiltersCore,
  };

  // Convert to legacy service filter shape expected by MailboxAnalyticsService
  const legacyFilters = ({
    dateRange: analyticsFiltersCore.dateRange,
    mailboxes: mailboxIds,
    companyId: companyId,
  } as unknown) as Parameters<MailboxAnalyticsService["getMailboxPerformance"]>[1];

  const performanceData = await mailboxAnalyticsService.getMailboxPerformance(
    mailboxIds,
    legacyFilters
  );

  return performanceData.map((mailbox) => {
    // The service returns metrics in a nested structure
    const performanceMetrics: PerformanceMetrics = mailbox.metrics;

    const calculatedRates = calculateRatesForCoreMetrics(performanceMetrics);

    return {
      mailboxId: mailbox.mailboxId,
      email: mailbox.email,
      domain: mailbox.domain,
      provider: mailbox.provider,
      warmupStatus: mailbox.warmupStatus,
      warmupProgress: mailbox.warmupProgress,
      dailyLimit: mailbox.dailyLimit,
      currentVolume: mailbox.currentVolume,
      healthScore: mailbox.healthScore,
      performanceMetrics,
      calculatedRates,
    };
  });
}

/**
 * Get time series data for mailbox analytics.
 * Used for charts and trend analysis.
 */
export async function getMailboxTimeSeriesData(
  mailboxIds: string[],
  filters: Partial<AnalyticsFilters> = {},
  granularity: "day" | "week" | "month" = "day"
): Promise<TimeSeriesDataPoint[]> {
  const companyIdTs: string = safeExtractCompanyId(filters, "default");

  const analyticsFiltersCore: AnalyticsFilters = {
    dateRange: filters.dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    entityIds: mailboxIds,
    additionalFilters: {
      ...(filters as Partial<AnalyticsFilters>)?.additionalFilters,
      companyId: companyIdTs,
    },
  };

  const legacyFiltersTs = ({
    dateRange: analyticsFiltersCore.dateRange,
    mailboxes: mailboxIds,
    companyId: companyIdTs,
  } as unknown) as Parameters<MailboxAnalyticsService["getTimeSeriesData"]>[1];

  const rawSeries = await mailboxAnalyticsService.getTimeSeriesData(
    mailboxIds,
    legacyFiltersTs,
    granularity
  );

  // The service already returns TimeSeriesDataPoint[] in the correct format
  return rawSeries;
}

/**
 * Compute analytics on filtered mailbox data.
 * Filter data first, then compute analytics on the filtered dataset.
 */
export async function computeMailboxAnalyticsForFilteredData(
  filters: AnalyticsFilters,
  options: AnalyticsComputeOptions = {}
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  calculatedRates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
  healthScore: number;
  timeSeriesData?: TimeSeriesDataPoint[];
  healthMetrics?: Array<{
    mailboxId: string;
    email: string;
    healthScore: number;
  reputationFactors: MailboxHealthMetrics["reputationFactors"];
  }>;
}> {
  // convert core filters to legacy shape for service
  const legacyFiltersForCompute = ({
    dateRange: filters.dateRange,
    mailboxes: filters.entityIds || [],
    companyId: String(filters.additionalFilters?.companyId ?? "default"),
  } as unknown) as Parameters<MailboxAnalyticsService["computeAnalyticsForFilteredData"]>[0];

  const result = await mailboxAnalyticsService.computeAnalyticsForFilteredData(
    legacyFiltersForCompute,
    options
  );

  // The service already returns the correct format
  const aggregatedMetricsCore: PerformanceMetrics = result.aggregatedMetrics;
  const calculatedRates = result.rates;
  const healthScore = AnalyticsCalculator.calculateHealthScore(aggregatedMetricsCore);

  return {
    aggregatedMetrics: aggregatedMetricsCore,
    calculatedRates,
    healthScore,
    timeSeriesData: result.timeSeriesData,
    healthMetrics: result.healthMetrics,
  };
}

// ============================================================================
// WARMUP ANALYTICS ACTIONS
// ============================================================================

/**
 * Get warmup analytics for specific mailboxes.
 * Replaces warmup logic from existing mailbox actions.
 */
export async function getMailboxWarmupAnalytics(
  mailboxIds: string[]
): Promise<{
  mailboxId: string;
  totalWarmups: number;
  spamComplaints: number;
  replies: number;
  progressPercentage: number;
  dailyStats: DailyWarmupStats[];
  healthTrend: Array<{ date: string; healthScore: number }>;
}[]> {
  const warmupData = await mailboxAnalyticsService.getWarmupAnalytics(mailboxIds);

  return warmupData.map((warmup) => ({
    mailboxId: warmup.mailboxId,
    totalWarmups: warmup.totalWarmups,
    spamComplaints: warmup.spamComplaints,
    replies: warmup.replies,
    progressPercentage: warmup.progressPercentage,
    dailyStats: warmup.dailyStats,
    healthTrend: warmup.dailyStats.map((stat) => ({
      date: stat.date,
      healthScore: stat.healthScore,
    })),
  }));
}

/**
 * Get mailbox health scores and reputation factors.
 */
export async function getMailboxHealthScores(
  mailboxIds: string[]
): Promise<{
  mailboxId: string;
  email: string;
  domain: string;
  provider: string;
  warmupStatus: WarmupStatus;
  warmupProgress: number;
  healthScore: number;
  reputationFactors: {
    deliverabilityScore: number;
    spamScore: number;
    bounceScore: number;
    engagementScore: number;
    warmupScore: number;
  };
  recommendations: string[];
}[]> {
  const healthData = await mailboxAnalyticsService.getHealthScores(mailboxIds);

  return healthData.map((health) => {
    // Generate recommendations based on health factors
    const recommendations: string[] = [];
    
    if (health.reputationFactors.deliverabilityScore < 80) {
      recommendations.push("Improve list hygiene to increase deliverability");
    }
    
    if (health.reputationFactors.spamScore > 0.01) {
      recommendations.push("Review email content to reduce spam complaints");
    }
    
    if (health.reputationFactors.bounceScore > 0.03) {
      recommendations.push("Clean email list to reduce bounce rate");
    }
    
    if (health.reputationFactors.engagementScore < 0.2) {
      recommendations.push("Improve email content to increase engagement");
    }
    
    if (health.warmupStatus === "WARMING" && health.reputationFactors.warmupScore < 0.5) {
      recommendations.push("Continue warmup process to improve sender reputation");
    }

    return {
      mailboxId: health.mailboxId,
      email: health.email,
      domain: health.domain,
      provider: health.provider,
      warmupStatus: health.warmupStatus,
      warmupProgress: health.warmupProgress,
      healthScore: health.healthScore,
      reputationFactors: health.reputationFactors,
      recommendations,
    };
  });
}

/**
 * Get sending capacity data for mailboxes.
 */
export async function getMailboxSendingCapacity(
  mailboxIds: string[]
): Promise<{
  mailboxId: string;
  email: string;
  dailyLimit: number;
  currentVolume: number;
  remainingCapacity: number;
  utilizationRate: number;
  utilizationPercentage: string;
  recommendedVolume: number;
  warmupStatus: WarmupStatus;
  warmupProgress: number;
  canSendMore: boolean;
  warningLevel: "none" | "low" | "medium" | "high";
}[]> {
  const capacityData = await mailboxAnalyticsService.getSendingCapacity(mailboxIds);

  return capacityData.map((capacity) => {
    const utilizationPercentage = AnalyticsCalculator.formatRateAsPercentage(
      capacity.utilizationRate,
      1
    );

    // Determine warning level based on utilization and health
    let warningLevel: "none" | "low" | "medium" | "high" = "none";
    if (capacity.utilizationRate > 0.9) {
      warningLevel = "high";
    } else if (capacity.utilizationRate > 0.75) {
      warningLevel = "medium";
    } else if (capacity.utilizationRate > 0.5) {
      warningLevel = "low";
    }

    return {
      mailboxId: capacity.mailboxId,
      email: capacity.email,
      dailyLimit: capacity.dailyLimit,
      currentVolume: capacity.currentVolume,
      remainingCapacity: capacity.remainingCapacity,
      utilizationRate: capacity.utilizationRate,
      utilizationPercentage,
      recommendedVolume: capacity.recommendedVolume,
      warmupStatus: capacity.warmupStatus,
      warmupProgress: capacity.warmupProgress,
      canSendMore: capacity.remainingCapacity > 0 && capacity.warmupStatus !== "PAUSED",
      warningLevel,
    };
  });
}

// ============================================================================
// PROGRESSIVE LOADING ACTIONS
// ============================================================================

/**
 * Get progressive analytics data for gradual loading.
 * Useful for dashboard components that need to show data incrementally.
 */
export async function getProgressiveMailboxAnalytics(
  mailboxIds: string[],
  filters?: Partial<AnalyticsFilters>
): Promise<{
  mailboxId: string;
  email: string;
  basicMetrics: PerformanceMetrics;
  calculatedRates: ReturnType<typeof calculateRatesForCoreMetrics>;
  healthScore: number;
  warmupStatus: WarmupStatus;
  isComplete: boolean;
  loadingProgress: number;
}[]> {
  // Since getProgressiveAnalytics doesn't exist in the service yet,
  // we'll use the regular performance data and simulate progressive loading
  const companyId = safeExtractCompanyId(filters, "default");

  const analyticsFiltersCore: AnalyticsFilters = {
    dateRange: filters?.dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    entityIds: mailboxIds,
    additionalFilters: {
      ...(filters?.additionalFilters || {}),
      companyId: companyId,
    },
  };

  const legacyFiltersForProgressive = ({
    dateRange: analyticsFiltersCore.dateRange,
    mailboxes: mailboxIds,
    companyId: companyId,
  } as unknown) as Parameters<MailboxAnalyticsService["getMailboxPerformance"]>[1];

  const performanceData = await mailboxAnalyticsService.getMailboxPerformance(
    mailboxIds,
    legacyFiltersForProgressive
  );

  return performanceData.map((data) => {
    const basicMetrics: PerformanceMetrics = data.metrics;
    const calculatedRates = calculateRatesForCoreMetrics(basicMetrics);

    return {
      mailboxId: data.mailboxId,
      email: data.email,
      basicMetrics,
      calculatedRates,
      healthScore: data.healthScore,
      warmupStatus: data.warmupStatus,
      isComplete: true, // Simulated - always complete for now
      loadingProgress: 100, // Simulated - always 100% for now
    };
  });
}

// ============================================================================
// DATA UPDATE ACTIONS
// ============================================================================

/**
 * Update mailbox analytics data.
 * Replaces scattered update logic from existing actions.
 */
export async function updateMailboxAnalytics(data: {
  mailboxId: string;
  email: string;
  domain: string;
  provider: string;
  companyId: string;
  date: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  warmupStatus: WarmupStatus;
  warmupProgress: number;
  dailyLimit: number;
  currentVolume: number;
}): Promise<{
  id: string;
  mailboxId: string;
  healthScore: number;
  calculatedRates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  const id = await mailboxAnalyticsService.updateAnalytics(data);

  // Calculate health score and rates for response
  const performanceMetrics: PerformanceMetrics = {
    sent: data.sent,
    delivered: data.delivered,
    opened_tracked: data.opened_tracked,
    clicked_tracked: data.clicked_tracked,
    replied: data.replied,
    bounced: data.bounced,
    unsubscribed: data.unsubscribed,
    spamComplaints: data.spamComplaints,
  };

  const healthScore = AnalyticsCalculator.calculateHealthScore(performanceMetrics);
  const calculatedRates = calculateRatesForCoreMetrics(performanceMetrics);

  return {
    id,
    mailboxId: data.mailboxId,
    healthScore,
    calculatedRates,
  };
}

/**
 * Update warmup analytics data.
 */
export async function updateMailboxWarmupAnalytics(data: {
  mailboxId: string;
  companyId: string;
  date: string;
  totalWarmups: number;
  delivered: number;
  spamComplaints: number;
  replies: number;
  bounced: number;
  emailsWarmed: number;
  healthScore: number;
  progressPercentage: number;
}): Promise<{
  id: string;
  mailboxId: string;
  progressPercentage: number;
  healthScore: number;
}> {
  const id = await mailboxAnalyticsService.updateWarmupAnalytics(data);

  return {
    id,
    mailboxId: data.mailboxId,
    progressPercentage: data.progressPercentage,
    healthScore: data.healthScore,
  };
}

/**
 * Batch update multiple mailbox analytics records.
 * Useful for bulk data imports and synchronization.
 */
export async function batchUpdateMailboxAnalytics(
  records: Array<{
    mailboxId: string;
    email: string;
    domain: string;
    provider: string;
    companyId: string;
    date: string;
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    warmupStatus: WarmupStatus;
    warmupProgress: number;
    dailyLimit: number;
    currentVolume: number;
  }>
): Promise<{
  totalRecords: number;
  successful: number;
  failed: number;
  results: Array<{ 
    success: boolean; 
    id?: string; 
    error?: string; 
    mailboxId: string;
    healthScore?: number;
  }>;
}> {
  const result = await mailboxAnalyticsService.batchUpdateAnalytics(records);

  // Calculate health scores for successful updates
  const enhancedResults = result.results.map((res) => {
    const record = records.find(r => r.mailboxId === (res as { id?: string }).id);
    if (res.success && record) {
      const performanceMetrics: PerformanceMetrics = {
        sent: record.sent,
        delivered: record.delivered,
        opened_tracked: record.opened_tracked,
        clicked_tracked: record.clicked_tracked,
        replied: record.replied,
        bounced: record.bounced,
        unsubscribed: record.unsubscribed,
        spamComplaints: record.spamComplaints,
      };
      
      const healthScore = AnalyticsCalculator.calculateHealthScore(performanceMetrics);
      
      return {
        ...res,
        mailboxId: record.mailboxId,
        healthScore,
      };
    }
    return {
      ...res,
      mailboxId: record?.mailboxId ?? String((res as { id?: string }).id ?? ""),
    };
  });

  const totalRecords = records.length;
  const successful = enhancedResults.filter(r => r.success).length;
  const failed = totalRecords - successful;

  return {
    totalRecords,
    successful,
    failed,
    results: enhancedResults,
  };
}

// ============================================================================
// MIGRATION AND COMPATIBILITY ACTIONS
// ============================================================================

/**
 * Migrate legacy mailbox analytics data to new standardized format.
 * Handles field name changes and data structure updates.
 */
export async function migrateLegacyMailboxData(
  legacyData: Array<{
    id: string;
    email: string;
    domain: string;
    provider: string;
    companyId: string;
    date: string;
    // Legacy field names
    opens?: number;
    clicks?: number;
    spamFlags?: number;
    // Current field names
    sent: number;
    delivered: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    warmupStatus: WarmupStatus;
    warmupProgress: number;
    dailyLimit: number;
    currentVolume: number;
  }>
): Promise<{
  migrated: number;
  failed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migrated = 0;
  let failed = 0;

  // Convert legacy data to standardized format
  type StandardizedRecord = {
    mailboxId: string;
    email: string;
    domain: string;
    provider: string;
    companyId: string;
    date: string;
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    warmupStatus: WarmupStatus;
    warmupProgress: number;
    dailyLimit: number;
    currentVolume: number;
  };

  const standardizedRecords = legacyData.map((legacy) => {
    try {
      return {
        mailboxId: legacy.id,
        email: legacy.email,
        domain: legacy.domain,
        provider: legacy.provider,
        companyId: legacy.companyId,
        date: legacy.date,
        sent: legacy.sent,
        delivered: legacy.delivered,
        // Map legacy field names to standardized names
        opened_tracked: legacy.opens || 0,
        clicked_tracked: legacy.clicks || 0,
        replied: legacy.replied,
        bounced: legacy.bounced,
        unsubscribed: legacy.unsubscribed,
        spamComplaints: legacy.spamFlags || 0, // spamFlags -> spamComplaints
        warmupStatus: legacy.warmupStatus,
        warmupProgress: legacy.warmupProgress,
        dailyLimit: legacy.dailyLimit,
        currentVolume: legacy.currentVolume,
      };
    } catch (error) {
      errors.push(`Failed to convert legacy record ${legacy.id}: ${error}`);
      failed++;
      return null;
    }
  }).filter(Boolean) as StandardizedRecord[];

  // Batch update the standardized records
  if (standardizedRecords.length > 0) {
    try {
      const result = await batchUpdateMailboxAnalytics(standardizedRecords);
      migrated = result.successful;
      failed += result.failed;
      
      // Add any batch update errors
      result.results.forEach((res) => {
        if (!res.success && res.error) {
          errors.push(`Batch update failed for ${res.mailboxId}: ${res.error}`);
        }
      });
    } catch (error) {
      errors.push(`Batch update failed: ${error}`);
      failed += standardizedRecords.length;
    }
  }

  return {
    migrated,
    failed,
    errors,
  };
}

// ============================================================================
// HEALTH CHECK ACTION
// ============================================================================

/**
 * Health check for mailbox analytics service.
 */
export async function checkMailboxAnalyticsHealth(): Promise<{
  healthy: boolean;
  service: string;
  timestamp: number;
  details?: string;
}> {
  try {
    const healthy = await mailboxAnalyticsService.healthCheck();
    
    return {
      healthy,
      service: "mailbox-analytics",
      timestamp: Date.now(),
      details: healthy ? "Service is operational" : "Service check failed",
    };
  } catch (error) {
    return {
      healthy: false,
      service: "mailbox-analytics",
      timestamp: Date.now(),
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
