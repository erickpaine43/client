import { Doc } from "../_generated/dataModel";
import type { PerformanceMetrics, TimeSeriesDataPoint } from "../../types/analytics/core";
import type { MailboxAnalyticsResult } from "./types";
import { calculateHealthScore, getTimeKey, formatTimeLabel } from "./calculations";

/**
 * Common aggregation utilities for mailbox analytics.
 * Centralizes metric aggregation logic to avoid duplication across queries.
 */

// Type aliases to reduce deep instantiation
type MetricsAccumulator = PerformanceMetrics;
type MailboxGroups = Record<string, Doc<"mailboxAnalytics">[]>;
type TimeGroups = Record<string, Doc<"mailboxAnalytics">[]>;

/**
 * Aggregate mailbox analytics data by mailbox ID.
 * Groups records by mailbox and calculates aggregated metrics for each.
 */
export function aggregateByMailbox(
  rawData: Doc<"mailboxAnalytics">[]
): MailboxAnalyticsResult[] {
  // Group by mailbox with proper typing
  const mailboxGroups: MailboxGroups = rawData.reduce((
    acc: MailboxGroups,
    record: Doc<"mailboxAnalytics">
  ) => {
    if (!acc[record.mailboxId]) {
      acc[record.mailboxId] = [];
    }
    acc[record.mailboxId].push(record);
    return acc;
  }, {} as MailboxGroups);

  // Aggregate metrics for each mailbox with deterministic sorting
  const results: MailboxAnalyticsResult[] = (
    Object.entries(mailboxGroups) as Array<[string, Doc<"mailboxAnalytics">[]]>
  ).map(([mailboxId, records]) => {
    // Sort records by date for deterministic processing
    const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
    
    const latestRecord = sortedRecords.reduce((latest, current) =>
      current.date > latest.date ? current : latest
    );

    // Aggregate metrics using helper function
    const metrics = aggregateMetrics(sortedRecords);

    return {
      mailboxId,
      email: latestRecord.email,
      domain: latestRecord.domain,
      provider: latestRecord.provider,
      warmupStatus: latestRecord.warmupStatus,
      warmupProgress: latestRecord.warmupProgress,
      dailyLimit: latestRecord.dailyLimit,
      currentVolume: latestRecord.currentVolume,
      metrics,
      healthScore: calculateHealthScore(metrics),
      updatedAt: latestRecord.updatedAt,
    } as MailboxAnalyticsResult;
  });

  // Ensure deterministic sorting by date and mailboxId
  return results.sort((a, b) => {
    const dateCompare = b.updatedAt - a.updatedAt; // Latest first
    if (dateCompare !== 0) return dateCompare;
    return a.mailboxId.localeCompare(b.mailboxId); // Then by mailboxId
  });
}

/**
 * Aggregate mailbox analytics data by time period.
 * Groups records by time period and calculates aggregated metrics for each period.
 */
export function aggregateByTimePeriod(
  rawData: Doc<"mailboxAnalytics">[],
  granularity: "day" | "week" | "month"
): TimeSeriesDataPoint[] {
  // Local time grouping logic using getTimeKey helper
  const timeGroups: TimeGroups = rawData.reduce((acc: TimeGroups, record: Doc<"mailboxAnalytics">) => {
    const timeKey = getTimeKey(record.date, granularity);
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(record);
    return acc;
  }, {} as TimeGroups);

  // Aggregate metrics for each time period with proper typing
  const results: TimeSeriesDataPoint[] = Object.entries(timeGroups)
    .map(([timeKey, records]: [string, Doc<"mailboxAnalytics">[]]) => {
      const metrics = aggregateMetrics(records);

      return {
        date: timeKey,
        label: formatTimeLabel(timeKey, granularity),
        metrics,
      } as TimeSeriesDataPoint;
    });

  // Proper sorting by date for time series data
  return results.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate performance metrics from multiple records.
 * Sums up all metric values across the provided records.
 */
export function aggregateMetrics(
  records: Doc<"mailboxAnalytics">[]
): PerformanceMetrics {
  const zeroMetrics: MetricsAccumulator = {
    sent: 0,
    delivered: 0,
    opened_tracked: 0,
    clicked_tracked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
    spamComplaints: 0,
  };
  
  return records.reduce<MetricsAccumulator>(
    (acc, record) => ({
      sent: acc.sent + record.sent,
      delivered: acc.delivered + record.delivered,
      opened_tracked: acc.opened_tracked + record.opened_tracked,
      clicked_tracked: acc.clicked_tracked + record.clicked_tracked,
      replied: acc.replied + record.replied,
      bounced: acc.bounced + record.bounced,
      unsubscribed: acc.unsubscribed + record.unsubscribed,
      spamComplaints: acc.spamComplaints + record.spamComplaints,
    }),
    zeroMetrics
  );
}

/**
 * Aggregate warmup analytics data by mailbox ID.
 * Groups warmup records by mailbox and calculates totals and daily stats.
 */
export function aggregateWarmupByMailbox(
  warmupData: Doc<"warmupAnalytics">[]
): Array<{
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
}> {
  // Group by mailbox and aggregate
  const mailboxGroups = warmupData.reduce((acc: Record<string, Doc<"warmupAnalytics">[]>, record) => {
    if (!acc[record.mailboxId]) {
      acc[record.mailboxId] = [];
    }
    acc[record.mailboxId].push(record);
    return acc;
  }, {});

  return Object.entries(mailboxGroups).map(([mailboxId, records]) => {
    const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
    
    const totals = sortedRecords.reduce(
      (acc, record) => ({
        totalWarmups: acc.totalWarmups + record.totalWarmups,
        spamComplaints: acc.spamComplaints + record.spamComplaints,
        replies: acc.replies + record.replies,
      }),
      { totalWarmups: 0, spamComplaints: 0, replies: 0 }
    );

    const latestRecord = sortedRecords[sortedRecords.length - 1];
    const progressPercentage = latestRecord?.progressPercentage || 0;

    const dailyStats = sortedRecords.map((record) => ({
      date: record.date,
      emailsWarmed: record.emailsWarmed,
      delivered: record.delivered,
      spamComplaints: record.spamComplaints,
      replies: record.replies,
      bounced: record.bounced,
      healthScore: record.healthScore,
    }));

    return {
      mailboxId,
      totalWarmups: totals.totalWarmups,
      spamComplaints: totals.spamComplaints,
      replies: totals.replies,
      progressPercentage,
      dailyStats,
    };
  }).sort((a, b) => a.mailboxId.localeCompare(b.mailboxId));
}
