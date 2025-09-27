import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import type { TimeSeriesDataPoint } from "../../types/analytics/core";
import { fetchMailboxAnalyticsData } from "./dataFetchers";
import { aggregateByMailbox, aggregateByTimePeriod } from "./aggregators";
import type { MailboxAnalyticsResult } from "./types";

/**
 * Get raw mailbox analytics data with filtering support.
 */
export const getMailboxAnalytics = query({
  args: {
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"mailboxAnalytics">[]> => {
    // Use centralized data fetcher with optimized index usage
    return fetchMailboxAnalyticsData(ctx.db, {
      companyId: args.companyId,
      mailboxIds: args.mailboxIds,
      dateRange: args.dateRange,
    });
  },
});

/**
 * Get aggregated mailbox analytics by mailbox.
 */
export const getMailboxAggregatedAnalytics = query({
  args: {
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<MailboxAnalyticsResult[]> => {
    // Fetch raw data using centralized fetcher
    const rawData = await fetchMailboxAnalyticsData(ctx.db, {
      companyId: args.companyId,
      mailboxIds: args.mailboxIds,
      dateRange: args.dateRange,
    });

    // Aggregate using centralized aggregator
    return aggregateByMailbox(rawData);
  },
});

/**
 * Get mailbox performance metrics for specific mailboxes.
 */
export const getMailboxPerformanceMetrics = query({
  args: {
    mailboxIds: v.array(v.string()),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<MailboxAnalyticsResult[]> => {
    // Fetch raw data using centralized fetcher
    const rawData = await fetchMailboxAnalyticsData(ctx.db, {
      companyId: args.companyId,
      mailboxIds: args.mailboxIds,
      dateRange: args.dateRange,
    });

    // Aggregate using centralized aggregator
    return aggregateByMailbox(rawData);
  },
});

/**
 * Get time series analytics data for mailboxes.
 */
export const getMailboxTimeSeriesAnalytics = query({
  args: {
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
    companyId: v.string(),
    granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args): Promise<TimeSeriesDataPoint[]> => {
    const granularity = args.granularity || "day";

    // Fetch raw data using centralized fetcher
    const rawData = await fetchMailboxAnalyticsData(ctx.db, {
      companyId: args.companyId,
      mailboxIds: args.mailboxIds,
      dateRange: args.dateRange,
    });

    // Aggregate by time period using centralized aggregator
    return aggregateByTimePeriod(rawData, granularity);
  },
});


