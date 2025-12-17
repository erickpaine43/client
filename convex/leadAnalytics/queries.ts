import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import {
  LeadAnalyticsQueryArgs,
  LeadTimeSeriesQueryArgs,
  LeadAnalyticsRecord,
  LeadAggregationResponse,
  LeadListMetricsResponse
} from "./types";
import {
  validateLeadAnalyticsQueryArgs,
  validateDateRange,
  validateLeadIds,
  validateGranularity,
  sanitizeLeadAnalyticsQueryArgs
} from "./validation";
import {
  calculateLeadAggregatedMetrics,
  groupRecordsByLeadId,
  groupRecordsByStatus,
  groupRecordsByTimePeriod,
  calculateStatusBreakdown,
  calculateEngagementSummary,
  createTimeSeriesDataPoints,
  getLatestRecord,
  calculateUniqueLeadCount,
  calculateEngagementRates
} from "./calculations";

// Helper function for the base query logic
async function getLeadAnalyticsHelper(ctx: QueryCtx, args: LeadAnalyticsQueryArgs): Promise<LeadAnalyticsRecord[]> {
  // Validate and sanitize input
  const validation = validateLeadAnalyticsQueryArgs(args);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  const sanitizedArgs = sanitizeLeadAnalyticsQueryArgs(args);

  // Build query with filters
  let query = ctx.db
    .query("leadAnalytics")
    .withIndex("by_company_date", (q) => q.eq("companyId", sanitizedArgs.companyId));

  // Apply date range filter
  if (sanitizedArgs.dateRange) {
    validateDateRange(sanitizedArgs.dateRange);
    query = query.filter((q) =>
      q.and(
        q.gte(q.field("date"), sanitizedArgs.dateRange!.start),
        q.lte(q.field("date"), sanitizedArgs.dateRange!.end)
      )
    );
  }

  const results = await query.collect();

  // Apply lead IDs filter if provided
  if (sanitizedArgs.leadIds && sanitizedArgs.leadIds.length > 0) {
    validateLeadIds(sanitizedArgs.leadIds);
    return results.filter((record: LeadAnalyticsRecord) =>
      sanitizedArgs.leadIds!.includes(record.leadId)
    );
  }

  return results;
}

/**
 * Get Lead Analytics Data with Optional Filtering
 * Primary query for retrieving lead analytics records with various filters
 */
export const getLeadAnalytics = query({
  args: {
    leadIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args: LeadAnalyticsQueryArgs) => {
    return await getLeadAnalyticsHelper(ctx, args);
  },
});

/**
 * Get Aggregated Lead Analytics by Lead
 * Groups analytics data by lead and aggregates metrics
 */
export const getLeadAggregatedAnalytics = query({
  args: {
    leadIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args: LeadAnalyticsQueryArgs) => {
    const records = await getLeadAnalyticsHelper(ctx, args);

    if (records.length === 0) {
      return [];
    }

    // Group by lead and aggregate
    const leadGroups = groupRecordsByLeadId(records);

    return Array.from(leadGroups.entries()).map(([leadId, groupRecords]: [string, LeadAnalyticsRecord[]]) => {
      // Get the most recent record for lead info
      const latestRecord = getLatestRecord(groupRecords);

      // Aggregate metrics
      const aggregatedMetrics = calculateLeadAggregatedMetrics(groupRecords);

      return {
        leadId,
        email: latestRecord.email,
        company: latestRecord.company,
        status: latestRecord.status,
        companyId: latestRecord.companyId,
        date: latestRecord.date,
        aggregatedMetrics,
        recordCount: groupRecords.length,
        updatedAt: latestRecord.updatedAt,
      } as LeadAggregationResponse;
    });
  },
});

/**
 * Get Lead Engagement Analytics with Time Series Data
 * Provides time series data for engagement metrics
 */
export const getLeadEngagementAnalytics = query({
  args: {
    leadIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
    granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args: LeadTimeSeriesQueryArgs) => {
    const records = await getLeadAnalyticsHelper(ctx, args);
    const granularity = validateGranularity(args.granularity);

    if (records.length === 0) {
      return [];
    }

    // Group by time period
    const timeGroups = groupRecordsByTimePeriod(records, granularity);

    // Create time series data points
    return createTimeSeriesDataPoints(timeGroups, granularity);
  },
});

/**
 * Get Lead List Metrics for Specific Lead Lists
 * Provides comprehensive metrics for lead lists with status breakdown
 */
export const getLeadListMetrics = query({
  args: {
    leadIds: v.array(v.string()),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args: LeadAnalyticsQueryArgs) => {
    // Validate lead IDs
    if (!args.leadIds || args.leadIds.length === 0) {
      throw new Error("leadIds array is required and cannot be empty");
    }

    const records = await getLeadAnalyticsHelper(ctx, args);

    if (records.length === 0) {
      return {
        totalLeads: 0,
        totalMetrics: {
          sent: 0,
          delivered: 0,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        },
        statusBreakdown: [],
        engagementSummary: {
          activeLeads: 0,
          repliedLeads: 0,
          bouncedLeads: 0,
          unsubscribedLeads: 0,
          completedLeads: 0,
        },
      } as LeadListMetricsResponse;
    }

    // Group by status
    const statusGroups = groupRecordsByStatus(records);

    // Calculate metrics
    const totalLeads = calculateUniqueLeadCount(records);
    const totalMetrics = calculateLeadAggregatedMetrics(records);
    const statusBreakdown = calculateStatusBreakdown(statusGroups, totalLeads);
    const engagementSummary = calculateEngagementSummary(statusGroups);

    return {
      totalLeads,
      totalMetrics,
      statusBreakdown,
      engagementSummary,
    } as LeadListMetricsResponse;
  },
});

/**
 * Get Lead Performance Overview
 * Provides a high-level overview of lead performance metrics
 */
export const getLeadPerformanceOverview = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args: LeadAnalyticsQueryArgs) => {
    const records = await getLeadAnalyticsHelper(ctx, args);

    if (records.length === 0) {
      return {
        totalRecords: 0,
        totalLeads: 0,
        totalMetrics: {
          sent: 0,
          delivered: 0,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        },
        engagementRates: {
          openRate: 0,
          clickRate: 0,
          replyRate: 0,
          bounceRate: 0,
          unsubscribeRate: 0,
          spamComplaintRate: 0,
        },
        topPerformingLeads: [],
      };
    }

    // Calculate overall metrics
    const totalLeads = calculateUniqueLeadCount(records);
    const totalMetrics = calculateLeadAggregatedMetrics(records);
    const engagementRates = calculateEngagementRates(totalMetrics);

    // Get top performing leads
    const leadGroups = groupRecordsByLeadId(records);
    const leadPerformance = Array.from(leadGroups.entries())
      .map(([leadId, groupRecords]) => {
        const metrics = calculateLeadAggregatedMetrics(groupRecords);
        const rates = calculateEngagementRates(metrics);
        const latestRecord = getLatestRecord(groupRecords);

        return {
          leadId,
          email: latestRecord.email,
          metrics,
          engagementRates: rates,
          score: rates.openRate * 0.3 + rates.clickRate * 0.4 + rates.replyRate * 0.3,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10

    return {
      totalRecords: records.length,
      totalLeads,
      totalMetrics,
      engagementRates,
      topPerformingLeads: leadPerformance,
    };
  },
});

// Re-export engagement rates calculation for external use
export { calculateEngagementRates } from "./calculations";
