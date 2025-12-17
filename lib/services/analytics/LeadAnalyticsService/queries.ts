/**
 * Queries for LeadAnalyticsService
 *
 * This module contains all query handlers for lead analytics operations.
 * Each function performs a specific Convex query, applies validation and calculations,
 * and returns typed results. No caching or side effects here - pure query logic.
 *
 * Dependencies:
 * - Convex api for database queries
 * - Validation and calculations from sibling modules
 * - Types from ./types.ts
 *
 * Usage:
 * - Called from index.ts within executeWithCache wrappers
 * - Functions take convex client, companyId, and params
 * - Return Promises of typed analytics data
 */

import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";
import type {
  AnalyticsFilters,
  LeadListMetrics,
  LeadEngagementAnalytics,
  ConversionFunnelData,
  LeadSourceAnalytics,
  SegmentationAnalytics,
  FilteredLeadAnalytics,
  AnalyticsComputeOptions,
  LeadStatus,
  TimeSeriesDataPoint,
  PerformanceMetrics
} from "./types";
import {
  validateLeadFilters,
  validateLeadMetrics
} from "./validation";
import {
  aggregateLeadMetrics,
  calculateEngagementTrends,
  calculateTopEngagingLeads,
  computeConversionFunnel,
  identifyFunnelBottlenecks,
  computeLeadSourceAnalytics,
  computeSegmentationAnalytics
} from "./calculations";

/**
 * Perform lead list metrics query.
 * Validates filters, queries Convex, types result, computes breakdown.
 * 
 * @param convex - Convex client
 * @param companyId - Company identifier
 * @param leadIds - Array of lead IDs
 * @param filters - Optional analytics filters
 * @returns Promise<LeadListMetrics>
 */
export async function performLeadListMetricsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  leadIds: string[],
  filters?: AnalyticsFilters
): Promise<LeadListMetrics> {
  if (filters) {
    validateLeadFilters(filters);
  }

  const convexHelper = createAnalyticsConvexHelper(convex, "LeadAnalyticsService");
  const result = await convexHelper.query(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    api.leadAnalytics.getLeadListMetrics,
    {
      leadIds,
      dateRange: filters?.dateRange,
      companyId,
    },
    {
      serviceName: "LeadAnalyticsService",
      methodName: "performLeadListMetricsQuery",
    }
  );

  // Type status breakdown
  const rawResult = result as {
    statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  } & Omit<LeadListMetrics, 'statusBreakdown'>;
  const typedResult: LeadListMetrics = {
    ...rawResult,
    statusBreakdown: rawResult.statusBreakdown.map(item => ({
      ...item,
      status: item.status as LeadStatus
    }))
  };

  validateLeadMetrics(typedResult.totalMetrics);

  return typedResult;
}

/**
 * Perform lead engagement analytics query.
 * Queries time series and aggregated data, computes trends and top leads.
 * 
 * @param convex - Convex client
 * @param companyId - Company identifier
 * @param leadIds - Optional lead IDs
 * @param filters - Analytics filters
 * @returns Promise<LeadEngagementAnalytics>
 */
export async function performLeadEngagementAnalyticsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  leadIds: string[] = [],
  filters: AnalyticsFilters
): Promise<LeadEngagementAnalytics> {
  validateLeadFilters(filters);

  const convexHelper = createAnalyticsConvexHelper(convex, "LeadAnalyticsService");

  const timeSeriesData = await convexHelper.query(
    api.leadAnalytics.getLeadEngagementAnalytics,
    {
      leadIds,
      dateRange: filters.dateRange,
      companyId,
      granularity: filters.granularity || "day",
    },
    {
      serviceName: "LeadAnalyticsService",
      methodName: "performLeadEngagementAnalyticsQuery",
    }
  ) as unknown as (TimeSeriesDataPoint & { leadCount: number })[];

  const aggregatedData = await convexHelper.query(
    api.leadAnalytics.getLeadAggregatedAnalytics,
    {
      leadIds,
      dateRange: filters.dateRange,
      companyId,
    },
    {
      serviceName: "LeadAnalyticsService",
      methodName: "performLeadEngagementAnalyticsQuery",
    }
  ) as unknown as { leadId: string; email: string; company?: string; aggregatedMetrics: PerformanceMetrics; }[];

  const totalEngagement = aggregateLeadMetrics(aggregatedData.map((d: { aggregatedMetrics: PerformanceMetrics }) => ({ aggregatedMetrics: d.aggregatedMetrics })));

  const engagementTrends = calculateEngagementTrends(timeSeriesData);

  const topEngagingLeads = calculateTopEngagingLeads(aggregatedData);

  return {
    timeSeriesData,
    totalEngagement,
    engagementTrends,
    topEngagingLeads,
  };
}

/**
 * Perform conversion funnels query.
 * Queries lead data, computes funnel steps and bottlenecks.
 * 
 * @param convex - Convex client
 * @param companyId - Company identifier
 * @param campaignIds - Campaign IDs (unused in current impl, but param for future)
 * @returns Promise<ConversionFunnelData>
 */
export async function performConversionFunnelsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  _campaignIds: string[]
): Promise<ConversionFunnelData> {
  const convexHelper = createAnalyticsConvexHelper(convex, "LeadAnalyticsService");
  const leadData = await convexHelper.query(
    api.leadAnalytics.getLeadAggregatedAnalytics,
    {
      companyId,
    },
    {
      serviceName: "LeadAnalyticsService",
      methodName: "performConversionFunnelsQuery",
    }
  ) as unknown as { aggregatedMetrics: PerformanceMetrics }[];

  const { funnelSteps, overallConversion } = computeConversionFunnel(leadData.map((l: { aggregatedMetrics: PerformanceMetrics }) => ({ aggregatedMetrics: l.aggregatedMetrics })));

  const bottlenecks = identifyFunnelBottlenecks(funnelSteps);

  return {
    funnelSteps,
    overallConversion,
    bottlenecks,
  };
}

/**
 * Perform lead source analytics query.
 * Queries lead data, computes source breakdown by domain.
 * 
 * @param convex - Convex client
 * @param companyId - Company identifier
 * @returns Promise<LeadSourceAnalytics>
 */
export async function performLeadSourceAnalyticsQuery(
  convex: ConvexHttpClient,
  companyId: string
): Promise<LeadSourceAnalytics> {
  const convexHelper = createAnalyticsConvexHelper(convex, "LeadAnalyticsService");
  const leadData = await convexHelper.query(
    api.leadAnalytics.getLeadAggregatedAnalytics,
    {
      companyId,
    },
    {
      serviceName: "LeadAnalyticsService",
      methodName: "performLeadSourceAnalyticsQuery",
    }
  ) as unknown as { email: string; aggregatedMetrics: PerformanceMetrics }[];

  return computeLeadSourceAnalytics(
    leadData.map((l: { email: string; aggregatedMetrics: PerformanceMetrics }) => ({
      email: l.email,
      aggregatedMetrics: l.aggregatedMetrics
    }))
  );
}

/**
 * Perform lead segmentation analytics query.
 * Queries lead data, computes segments by company and status.
 * 
 * @param convex - Convex client
 * @param companyId - Company identifier
 * @returns Promise<SegmentationAnalytics>
 */
export async function performSegmentationAnalyticsQuery(
  convex: ConvexHttpClient,
  companyId: string
): Promise<SegmentationAnalytics> {
  const convexHelper = createAnalyticsConvexHelper(convex, "LeadAnalyticsService");
  const leadData = await convexHelper.query(
    api.leadAnalytics.getLeadAggregatedAnalytics,
    {
      companyId,
    },
    {
      serviceName: "LeadAnalyticsService",
      methodName: "performSegmentationAnalyticsQuery",
    }
  ) as unknown as { company?: string; status: LeadStatus; aggregatedMetrics: PerformanceMetrics }[];

  return computeSegmentationAnalytics(
    leadData.map((l: { company?: string; status: LeadStatus; aggregatedMetrics: PerformanceMetrics }) => ({
      company: l.company,
      status: l.status,
      aggregatedMetrics: l.aggregatedMetrics
    }))
  );
}

/**
 * Perform filtered analytics computation query.
 * Queries filtered data, aggregates, computes rates and optional time series.
 * 
 * @param convex - Convex client
 * @param companyId - Company identifier
 * @param filters - Analytics filters
 * @param options - Compute options
 * @returns Promise<FilteredLeadAnalytics>
 */
export async function performFilteredAnalyticsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  filters: AnalyticsFilters,
  options: AnalyticsComputeOptions = {}
): Promise<FilteredLeadAnalytics> {
  validateLeadFilters(filters);

  const convexHelper = createAnalyticsConvexHelper(convex, "LeadAnalyticsService");

  const leadData = await convexHelper.query(
    api.leadAnalytics.getLeadAggregatedAnalytics,
    {
      leadIds: filters.entityIds || [],
      dateRange: filters.dateRange,
      companyId,
    },
    {
      serviceName: "LeadAnalyticsService",
      methodName: "performFilteredAnalyticsQuery",
    }
  ) as unknown as { aggregatedMetrics: PerformanceMetrics }[];

  const aggregatedMetrics = aggregateLeadMetrics(leadData.map((d: { aggregatedMetrics: PerformanceMetrics }) => ({ aggregatedMetrics: d.aggregatedMetrics })));

  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  const result: FilteredLeadAnalytics = {
    aggregatedMetrics,
    rates,
    leadCount: leadData.length,
  };

  if (options.includeTimeSeriesData) {
    const timeSeriesData = await convexHelper.query(
      api.leadAnalytics.getLeadEngagementAnalytics,
      {
        leadIds: filters.entityIds || [],
        dateRange: filters.dateRange,
        companyId,
        granularity: filters.granularity || "day",
      },
      {
        serviceName: "LeadAnalyticsService",
        methodName: "performFilteredAnalyticsQuery",
      }
    ) as TimeSeriesDataPoint[];
    result.timeSeriesData = timeSeriesData;
  }

  return result;
}

/**
 * Perform health check query.
 * Simple query to verify service connectivity.
 * 
 * @param convex - Convex client
 * @param companyId - Company identifier
 * @returns Promise<boolean>
 */
export async function performHealthCheckQuery(
  convex: ConvexHttpClient,
  companyId: string
): Promise<boolean> {
  try {
    const convexHelper = createAnalyticsConvexHelper(convex, "LeadAnalyticsService");
    await convexHelper.query(
      api.leadAnalytics.getLeadAggregatedAnalytics,
      { companyId },
      {
        serviceName: "LeadAnalyticsService",
        methodName: "performHealthCheckQuery",
      }
    );
    return true;
  } catch (error) {
    console.error("Lead analytics health check failed:", error);
    return false;
  }
}
