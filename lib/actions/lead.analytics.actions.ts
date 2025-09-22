// ============================================================================
// LEAD ANALYTICS SERVER ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

"use server";

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/lead-analytics.ts
//
// Migration notes:
// - All functions now use ConvexQueryHelper for consistent error handling
// - Standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved type safety and performance monitoring

import {
  getLeadAnalytics,
  getLeadTimeSeries,
  bulkUpdateLeadAnalytics,
  exportLeadAnalytics,
  getLeadAnalyticsHealth,
  type LeadListMetrics,
  type LeadEngagementAnalytics,
  type LeadSourceAnalytics
} from './analytics/lead-analytics';

// Re-export all functions for backward compatibility
export {
  getLeadAnalytics,
  getLeadTimeSeries,
  bulkUpdateLeadAnalytics,
  exportLeadAnalytics,
  getLeadAnalyticsHealth,
  type LeadListMetrics,
  type LeadEngagementAnalytics,
  type LeadSourceAnalytics
};

// Legacy imports for backward compatibility
import { leadAnalyticsService } from "@/lib/services/analytics/LeadAnalyticsService";
import {
  AnalyticsFilters,
  AnalyticsComputeOptions,
  CalculatedRates,
  PerformanceMetrics,
  TimeSeriesDataPoint
} from "@/types/analytics/core";
import {
  LeadStatus
} from "@/types/analytics/domain-specific";

// Define local types for backward compatibility
interface ConversionFunnelData {
  stages: Array<{
    stage: string;
    count: number;
    percentage: number;
    dropoffRate: number;
  }>;
  totalLeads: number;
  conversionRate: number;
  averageTimeToConvert: number;
}

interface SegmentationAnalytics {
  segment: string;
  criteria: Record<string, unknown>;
  leadCount: number;
  performance: PerformanceMetrics;
  rates: CalculatedRates;
  averageEngagementScore: number;
  conversionRate: number;
}

/**
 * Get lead list metrics for specific leads.
 */
export async function getLeadListMetricsAction(
  leadIds: string[],
  filters?: AnalyticsFilters
): Promise<any> {
  try {
    return await leadAnalyticsService.getLeadListMetrics(leadIds, filters);
  } catch (error) {
    console.error("Failed to get lead list metrics:", error);
    throw new Error("Failed to retrieve lead list metrics");
  }
}

/**
 * Get lead engagement analytics with time series data.
 */
export async function getLeadEngagementAnalyticsAction(
  filters: AnalyticsFilters,
  leadIds?: string[]
): Promise<any> {
  try {
    return await leadAnalyticsService.getEngagementAnalytics(filters, leadIds);
  } catch (error) {
    console.error("Failed to get lead engagement analytics:", error);
    throw new Error("Failed to retrieve lead engagement analytics");
  }
}

/**
 * Get conversion funnels for specific campaigns.
 */
export async function getLeadConversionFunnelsAction(
  campaignIds: string[]
): Promise<any> {
  try {
    return await leadAnalyticsService.getConversionFunnels(campaignIds);
  } catch (error) {
    console.error("Failed to get conversion funnels:", error);
    throw new Error("Failed to retrieve conversion funnels");
  }
}

/**
 * Get lead source analytics.
 */
export async function getLeadSourceAnalyticsAction(): Promise<any> {
  try {
    return await leadAnalyticsService.getLeadSourceAnalytics();
  } catch (error) {
    console.error("Failed to get lead source analytics:", error);
    throw new Error("Failed to retrieve lead source analytics");
  }
}

/**
 * Get lead segmentation analytics.
 */
export async function getLeadSegmentationAnalyticsAction(): Promise<any> {
  try {
    return await leadAnalyticsService.getSegmentationAnalytics();
  } catch (error) {
    console.error("Failed to get lead segmentation analytics:", error);
    throw new Error("Failed to retrieve lead segmentation analytics");
  }
}

/**
 * Compute analytics for filtered lead data.
 */
export async function computeLeadAnalyticsForFilteredDataAction(
  filters: AnalyticsFilters,
  options: AnalyticsComputeOptions = {}
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  timeSeriesData?: TimeSeriesDataPoint[];
  leadCount: number;
}> {
  try {
    return await leadAnalyticsService.computeAnalyticsForFilteredData(filters, options);
  } catch (error) {
    console.error("Failed to compute filtered lead analytics:", error);
    throw new Error("Failed to compute filtered lead analytics");
  }
}

/**
 * Update lead analytics data.
 */
export async function updateLeadAnalyticsAction(data: {
  leadId: string;
  email: string;
  company?: string;
  date: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  status: LeadStatus;
}): Promise<string> {
  try {
    return await leadAnalyticsService.updateAnalytics(data);
  } catch (error) {
    console.error("Failed to update lead analytics:", error);
    throw new Error("Failed to update lead analytics");
  }
}

/**
 * Get lead performance metrics for specific leads.
 */
export async function getLeadPerformanceMetricsAction(
  leadIds: string[],
  filters?: AnalyticsFilters
): Promise<Array<{
  leadId: string;
  email: string;
  company?: string;
  status: LeadStatus;
  metrics: PerformanceMetrics;
  rates: CalculatedRates;
  healthScore: number;
}>> {
  try {
    const result = await leadAnalyticsService.computeAnalyticsForFilteredData(
      {
        ...filters,
        entityIds: leadIds,
        dateRange: filters?.dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0],
        },
      },
      { includeTimeSeriesData: false }
    );

    // This would need to be enhanced to return individual lead metrics
    // For now, return aggregated data
    return [{
      leadId: "aggregated",
      email: "multiple",
      status: "ACTIVE" as LeadStatus,
      metrics: result.aggregatedMetrics,
      rates: result.rates,
      healthScore: 85, // Would calculate from actual metrics
    }];
  } catch (error) {
    console.error("Failed to get lead performance metrics:", error);
    throw new Error("Failed to retrieve lead performance metrics");
  }
}

/**
 * Get lead analytics time series data.
 */
export async function getLeadTimeSeriesDataAction(
  leadIds?: string[],
  filters?: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day"
): Promise<Array<{
  date: string;
  label: string;
  metrics: PerformanceMetrics;
  leadCount: number;
}>> {
  try {
    const engagementData = await leadAnalyticsService.getEngagementAnalytics(
      {
        ...filters,
        granularity,
        dateRange: filters?.dateRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0],
        },
      },
      leadIds
    );

    return engagementData.timeSeriesData;
  } catch (error) {
    console.error("Failed to get lead time series data:", error);
    throw new Error("Failed to retrieve lead time series data");
  }
}

/**
 * Get lead analytics overview for dashboard.
 */
export async function getLeadAnalyticsOverviewAction(
  filters?: AnalyticsFilters
): Promise<{
  totalLeads: number;
  activeLeads: number;
  repliedLeads: number;
  conversionRate: number;
  averageEngagement: number;
  topPerformingLeads: Array<{
    leadId: string;
    email: string;
    company?: string;
    engagementScore: number;
  }>;
}> {
  try {
    const engagementData = await leadAnalyticsService.getEngagementAnalytics(
      filters || {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0],
        },
      }
    );

    const segmentationData = await leadAnalyticsService.getSegmentationAnalytics();

    const activeLeads = segmentationData.statusSegments.find(s => s.status === "ACTIVE")?.leadCount || 0;
    const repliedLeads = segmentationData.statusSegments.find(s => s.status === "REPLIED")?.leadCount || 0;
    const totalLeads = segmentationData.statusSegments.reduce((sum, s) => sum + s.leadCount, 0);

    const conversionRate = totalLeads > 0 ? repliedLeads / totalLeads : 0;
    
    // Calculate average engagement from total metrics
    const { totalEngagement } = engagementData;
    const averageEngagement = totalEngagement.delivered > 0 
      ? (totalEngagement.opened_tracked + totalEngagement.clicked_tracked + totalEngagement.replied) / totalEngagement.delivered
      : 0;

    return {
      totalLeads,
      activeLeads,
      repliedLeads,
      conversionRate,
      averageEngagement,
      topPerformingLeads: engagementData.topEngagingLeads.slice(0, 5),
    };
  } catch (error) {
    console.error("Failed to get lead analytics overview:", error);
    throw new Error("Failed to retrieve lead analytics overview");
  }
}

/**
 * Health check for lead analytics service.
 */
export async function leadAnalyticsHealthCheckAction(): Promise<{
  healthy: boolean;
  timestamp: string;
  service: string;
}> {
  try {
    const healthy = await leadAnalyticsService.healthCheck();
    return {
      healthy,
      timestamp: new Date().toISOString(),
      service: "lead-analytics",
    };
  } catch (error) {
    console.error("Lead analytics health check failed:", error);
    return {
      healthy: false,
      timestamp: new Date().toISOString(),
      service: "lead-analytics",
    };
  }
}
