import { query } from "../_generated/server";
import { v } from "convex/values";
import type { MailboxHealthMetrics } from "../../lib/services/analytics/MailboxAnalyticsService";
import { fetchRecentMailboxData, fetchWarmupAnalyticsData } from "./dataFetchers";
import { aggregateByMailbox, aggregateWarmupByMailbox } from "./aggregators";
import { calculateComprehensiveHealthScore, calculateDeliverabilityScore } from "./calculations";
import type { MailboxAnalyticsResult } from "./types";

/**
 * Health-focused query handlers for mailbox analytics.
 * Separated from main queries to focus on health and reputation calculations.
 */

/**
 * Get mailbox health metrics with reputation factors.
 * Provides comprehensive health assessment including reputation factors.
 */
export const getMailboxHealthMetrics = query({
  args: {
    mailboxIds: v.optional(v.array(v.string())),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<MailboxHealthMetrics[]> => {
    // Get last 30 days of mailbox data using centralized fetcher
    const rawData = await fetchRecentMailboxData(
      ctx.db,
      args.companyId,
      args.mailboxIds
    );

    // Aggregate mailbox data using centralized aggregator
    const mailboxData = aggregateByMailbox(rawData);

    // Get warmup data for the same mailboxes
    const warmupMailboxIds = args.mailboxIds || mailboxData.map(m => m.mailboxId);
    const warmupData = await fetchWarmupAnalyticsData(ctx.db, {
      companyId: args.companyId,
      mailboxIds: warmupMailboxIds,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0]
      }
    });

    // Aggregate warmup data using centralized aggregator
    const warmupResults = aggregateWarmupByMailbox(warmupData);

    // Create warmup lookup for efficient access
    const warmupLookup = warmupResults.reduce<Record<string, typeof warmupResults[number]>>(
      (acc, warmup) => {
        acc[warmup.mailboxId] = warmup;
        return acc;
      },
      {}
    );

    // Compute health metrics with reputation factors
    const results: MailboxHealthMetrics[] = (mailboxData as MailboxAnalyticsResult[]).map((mailbox: MailboxAnalyticsResult) => {
      const warmup = warmupLookup[mailbox.mailboxId];
      
      // Compute reputation factors
      const reputationFactors = {
        deliverabilityScore: calculateDeliverabilityScore(mailbox.metrics),
        spamScore: mailbox.metrics.delivered > 0 
          ? mailbox.metrics.spamComplaints / mailbox.metrics.delivered 
          : 0,
        bounceScore: mailbox.metrics.sent > 0 
          ? mailbox.metrics.bounced / mailbox.metrics.sent 
          : 0,
        engagementScore: mailbox.metrics.delivered > 0 
          ? (mailbox.metrics.opened_tracked + mailbox.metrics.replied) / mailbox.metrics.delivered 
          : 0,
        warmupScore: warmup ? warmup.progressPercentage / 100 : 0,
      };

      return {
        mailboxId: mailbox.mailboxId,
        email: mailbox.email,
        domain: mailbox.domain,
        provider: mailbox.provider,
        warmupStatus: mailbox.warmupStatus,
        warmupProgress: mailbox.warmupProgress,
        healthScore: calculateComprehensiveHealthScore(mailbox.metrics, reputationFactors),
        reputationFactors,
        performanceMetrics: mailbox.metrics,
        dailyLimit: mailbox.dailyLimit,
        currentVolume: mailbox.currentVolume,
        lastUpdated: mailbox.updatedAt,
      } as MailboxHealthMetrics;
    });

    // Sort by health score (highest first), then by mailboxId
    return results.sort((a, b) => {
      const healthCompare = b.healthScore - a.healthScore;
      if (healthCompare !== 0) return healthCompare;
      return a.mailboxId.localeCompare(b.mailboxId);
    });
  },
});
