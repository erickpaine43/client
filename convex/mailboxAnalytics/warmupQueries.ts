import { query } from "../_generated/server";
import { v } from "convex/values";
import { fetchWarmupAnalyticsData } from "./dataFetchers";
import { aggregateWarmupByMailbox } from "./aggregators";

/**
 * Warmup-specific query handlers for mailbox analytics.
 * Separated from main queries to focus on warmup-related functionality.
 */

/**
 * Result type for warmup analytics queries.
 */
type WarmupAnalyticsResult = Array<{
  mailboxId: string;
  totalWarmups: number;
  spamComplaints: number;
  replies: number;
  progressPercentage: number;
  dailyStats: Array<{
    date: string;
    emailsWarmed: number;
    delivered: number;
    spamComplaints: number;
    replies: number;
    bounced: number;
    healthScore: number;
  }>;
}>;

/**
 * Get warmup analytics for specific mailboxes.
 * Provides detailed warmup progress and daily statistics.
 */
export const getWarmupAnalytics = query({
  args: {
    mailboxIds: v.array(v.string()),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<WarmupAnalyticsResult> => {
    // Fetch warmup data using centralized fetcher
    const warmupData = await fetchWarmupAnalyticsData(ctx.db, {
      companyId: args.companyId,
      mailboxIds: args.mailboxIds,
      dateRange: args.dateRange,
    });

    // Aggregate using centralized aggregator
    return aggregateWarmupByMailbox(warmupData);
  },
});
