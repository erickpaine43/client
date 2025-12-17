import { query } from "../_generated/server";
import type {
  BillingAnalyticsResult,
  TimeSeriesDataPoint,
  UsageAlertsResult,
  CostAnalyticsResult,
  CurrentUsageMetrics
} from "./types";
import {
  getBillingAnalyticsArgs,
  getCurrentUsageMetricsArgs,
  getBillingTimeSeriesAnalyticsArgs,
  getUsageLimitAlertsArgs,
  getCostAnalyticsArgs
} from "./validation";
import {
  getDefaultDateRange,
  groupBillingDataByGranularity,
  calculateCostAnalytics,
  calculateUsageAlerts,
  getDefaultThresholds
} from "./calculations";

// ============================================================================
// BILLING ANALYTICS QUERY HANDLERS
// ============================================================================

/**
 * Get billing analytics for a company with usage metrics and cost tracking.
 */
export const getBillingAnalytics = query({
  args: getBillingAnalyticsArgs,
  handler: async (ctx, args): Promise<BillingAnalyticsResult> => {
    // Default to last 30 days if no date range provided
    const dateRange = args.dateRange || getDefaultDateRange();

    // Get billing analytics for the specified period
    const billingAnalytics = await ctx.db
      .query("billingAnalytics")
      .withIndex("by_company_date", (q) =>
        q.eq("companyId", args.companyId)
         .gte("date", dateRange.start)
         .lte("date", dateRange.end)
      )
      .collect();

    // Get the most recent billing record for current usage
    const currentBilling = await ctx.db
      .query("billingAnalytics")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .first();

    return {
      analytics: billingAnalytics,
      currentUsage: currentBilling,
      dateRange,
      totalRecords: billingAnalytics.length,
    };
  },
});

/**
 * Get current usage metrics for a company.
 */
export const getCurrentUsageMetrics = query({
  args: getCurrentUsageMetricsArgs,
  handler: async (ctx, args): Promise<CurrentUsageMetrics> => {
    // Get the most recent billing analytics record
    const currentBilling = await ctx.db
      .query("billingAnalytics")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .order("desc")
      .first();

    if (!currentBilling) {
      // Return default usage metrics if no billing data exists
      return {
        companyId: args.companyId,
        planType: "starter",
        usage: {
          emailsSent: 0,
          emailsRemaining: 1000,
          domainsUsed: 0,
          domainsLimit: 1,
          mailboxesUsed: 0,
          mailboxesLimit: 1,
        },
        costs: {
          currentPeriodCost: 0,
          projectedCost: 0,
          currency: "USD",
        },
        date: new Date().toISOString().split("T")[0],
        updatedAt: Date.now(),
      };
    }

    // Transform DB record to nested format
    return {
      companyId: currentBilling.companyId,
      planType: currentBilling.planType,
      usage: {
        emailsSent: currentBilling.emailsSent,
        emailsRemaining: currentBilling.emailsRemaining,
        domainsUsed: currentBilling.domainsUsed,
        domainsLimit: currentBilling.domainsLimit,
        mailboxesUsed: currentBilling.mailboxesUsed,
        mailboxesLimit: currentBilling.mailboxesLimit,
      },
      costs: {
        currentPeriodCost: currentBilling.currentPeriodCost,
        projectedCost: currentBilling.projectedCost,
        currency: currentBilling.currency,
      },
      date: currentBilling.date,
      updatedAt: currentBilling.updatedAt,
    };
  },
});

/**
 * Get billing analytics time series data for cost tracking over time.
 */
export const getBillingTimeSeriesAnalytics = query({
  args: getBillingTimeSeriesAnalyticsArgs,
  handler: async (ctx, args): Promise<TimeSeriesDataPoint[]> => {
    const granularity = args.granularity || "day";

    // Get all billing analytics for the period
    const billingData = await ctx.db
      .query("billingAnalytics")
      .withIndex("by_company_date", (q) =>
        q.eq("companyId", args.companyId)
         .gte("date", args.dateRange.start)
         .lte("date", args.dateRange.end)
      )
      .collect();

    // Group data by granularity
    const groupedData = groupBillingDataByGranularity(billingData, granularity);

    // Convert to time series format
    const timeSeriesData = Array.from(groupedData.entries()).map(([date, records]) => {
      // Use the most recent record for each time period
      const latestRecord = records.sort((a, b) => b.updatedAt - a.updatedAt)[0];

      return {
        date,
        label: new Date(date).toLocaleDateString(),
        usage: {
          emailsSent: latestRecord.emailsSent,
          emailsRemaining: latestRecord.emailsRemaining,
          domainsUsed: latestRecord.domainsUsed,
          domainsLimit: latestRecord.domainsLimit,
          mailboxesUsed: latestRecord.mailboxesUsed,
          mailboxesLimit: latestRecord.mailboxesLimit,
        },
        costs: {
          currentPeriodCost: latestRecord.currentPeriodCost,
          projectedCost: latestRecord.projectedCost,
          currency: latestRecord.currency,
        },
        planType: latestRecord.planType,
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    return timeSeriesData;
  },
});

/**
 * Get usage limit alerts for a company.
 */
export const getUsageLimitAlerts = query({
  args: getUsageLimitAlertsArgs,
  handler: async (ctx, args): Promise<UsageAlertsResult> => {
    const thresholds = getDefaultThresholds(args.thresholds);

    // Get current usage directly from the database
    const billingRecord = await ctx.db
      .query("billingAnalytics")
      .withIndex("by_company_date", (q) => 
        q.eq("companyId", args.companyId)
      )
      .order("desc")
      .first();

    if (!billingRecord) {
      return {
        alerts: [],
        totalAlerts: 0,
        criticalAlerts: 0,
        warningAlerts: 0,
        currentUsage: null,
        thresholds,
        generatedAt: Date.now(),
      };
    }

    const alerts = calculateUsageAlerts(billingRecord, thresholds);

    return {
      alerts,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.type === "critical").length,
      warningAlerts: alerts.filter(a => a.type === "warning").length,
      currentUsage: billingRecord,
      thresholds,
      generatedAt: Date.now(),
    };
  },
});

/**
 * Get cost analytics and projections for a company.
 */
export const getCostAnalytics = query({
  args: getCostAnalyticsArgs,
  handler: async (ctx, args): Promise<CostAnalyticsResult> => {
    // Get billing data for the period
    const billingData = await ctx.db
      .query("billingAnalytics")
      .withIndex("by_company_date", (q) =>
        q.eq("companyId", args.companyId)
         .gte("date", args.dateRange.start)
         .lte("date", args.dateRange.end)
      )
      .collect();

    return calculateCostAnalytics(billingData, args.dateRange);
  },
});
