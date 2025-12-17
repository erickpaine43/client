// ============================================================================
// MAILBOX ANALYTICS SERVICE CALCULATIONS - Data transformation and computation logic
// ============================================================================

import { PerformanceMetrics, TimeSeriesDataPoint } from "@/types/analytics/core";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import {
  ConvexMailboxPerformanceResult,
  ConvexWarmupAnalyticsResult,
  ConvexTimeSeriesResult,
  MailboxPerformanceData,
  WarmupAnalyticsData,
  MailboxHealthMetrics,
  SendingCapacityData
} from "./types";

/**
 * Maps Convex mailbox performance result to MailboxPerformanceData.
 * Transforms raw query results into structured performance data.
 *
 * @param result - Raw Convex query result
 * @returns Mapped mailbox performance data
 */
export function mapToMailboxPerformanceData(result: ConvexMailboxPerformanceResult): MailboxPerformanceData {
  // Calculate metrics from the result
  const metrics: PerformanceMetrics = {
    sent: result.sent,
    delivered: result.delivered,
    opened_tracked: result.opened_tracked,
    clicked_tracked: result.clicked_tracked,
    replied: result.replied,
    bounced: result.bounced,
    unsubscribed: result.unsubscribed,
    spamComplaints: result.spamComplaints,
  };

  return {
    mailboxId: result.mailboxId,
    email: result.email,
    domain: result.domain,
    provider: result.provider,
    warmupStatus: result.warmupStatus,
    warmupProgress: result.warmupProgress,
    dailyLimit: result.dailyLimit,
    currentVolume: result.currentVolume,
    healthScore: result.healthScore || calculateMailboxHealthScore(metrics, result.warmupProgress),
    metrics,
  };
}

/**
 * Maps Convex warmup analytics result to WarmupAnalyticsData.
 * Transforms raw warmup query results into structured warmup data.
 *
 * @param result - Raw Convex warmup query result
 * @returns Mapped warmup analytics data
 */
export function mapToWarmupAnalyticsData(result: ConvexWarmupAnalyticsResult): WarmupAnalyticsData {
  return {
    mailboxId: result.mailboxId,
    totalWarmups: result.totalWarmups,
    spamComplaints: result.spamComplaints,
    replies: result.replies,
    progressPercentage: result.progressPercentage,
    dailyStats: result.dailyStats,
  };
}

/**
 * Maps Convex mailbox performance result to MailboxHealthMetrics.
 * Creates comprehensive health metrics with reputation factors.
 *
 * @param result - Raw Convex query result
 * @returns Mapped mailbox health metrics
 */
export function mapToMailboxHealthMetrics(result: ConvexMailboxPerformanceResult): MailboxHealthMetrics {
  const metrics: PerformanceMetrics = {
    sent: result.sent,
    delivered: result.delivered,
    opened_tracked: result.opened_tracked,
    clicked_tracked: result.clicked_tracked,
    replied: result.replied,
    bounced: result.bounced,
    unsubscribed: result.unsubscribed,
    spamComplaints: result.spamComplaints,
  };

  const rates = AnalyticsCalculator.calculateAllRates(metrics);
  const reputationFactors = calculateReputationFactors(metrics, rates);

  return {
    mailboxId: result.mailboxId,
    email: result.email,
    domain: result.domain,
    provider: result.provider,
    warmupStatus: result.warmupStatus,
    warmupProgress: result.warmupProgress,
    healthScore: result.healthScore || calculateMailboxHealthScore(metrics, result.warmupProgress),
    reputationFactors,
    performanceMetrics: metrics,
    dailyLimit: result.dailyLimit,
    currentVolume: result.currentVolume,
    lastUpdated: Date.now(),
  };
}

/**
 * Maps MailboxPerformanceData to SendingCapacityData.
 * Calculates sending capacity metrics from performance data.
 *
 * @param mailbox - Mailbox performance data
 * @returns Mapped sending capacity data
 */
export function mapToSendingCapacityData(mailbox: MailboxPerformanceData): SendingCapacityData {
  const remainingCapacity = Math.max(0, mailbox.dailyLimit - mailbox.currentVolume);
  const utilizationRate = mailbox.dailyLimit > 0 ? (mailbox.currentVolume / mailbox.dailyLimit) * 100 : 0;
  const recommendedVolume = calculateRecommendedVolume(mailbox);

  return {
    mailboxId: mailbox.mailboxId,
    email: mailbox.email,
    dailyLimit: mailbox.dailyLimit,
    currentVolume: mailbox.currentVolume,
    remainingCapacity,
    utilizationRate,
    recommendedVolume,
    warmupStatus: mailbox.warmupStatus,
    warmupProgress: mailbox.warmupProgress,
  };
}

/**
 * Maps Convex time series result to TimeSeriesDataPoint.
 * Transforms raw time series data into standardized format.
 *
 * @param result - Raw Convex time series result
 * @returns Mapped time series data point
 */
export function mapToTimeSeriesDataPoint(result: ConvexTimeSeriesResult): TimeSeriesDataPoint {
  return {
    date: result.date,
    label: result.date, // Use date as label
    metrics: {
      sent: result.sent,
      delivered: result.delivered,
      opened_tracked: result.opened_tracked,
      clicked_tracked: result.clicked_tracked,
      replied: result.replied,
      bounced: result.bounced,
      unsubscribed: result.unsubscribed,
      spamComplaints: result.spamComplaints,
    },
  };
}

/**
 * Calculates mailbox health score based on performance metrics and warmup progress.
 * Provides a comprehensive health assessment for mailbox monitoring.
 *
 * @param metrics - Performance metrics
 * @param warmupProgress - Current warmup progress (0-100)
 * @returns Health score between 0-100
 */
export function calculateMailboxHealthScore(metrics: PerformanceMetrics, warmupProgress: number): number {
  const rates = AnalyticsCalculator.calculateAllRates(metrics);

  // Factor weights for health score calculation
  const deliverabilityWeight = 0.3;
  const engagementWeight = 0.25;
  const spamWeight = 0.2;
  const warmupWeight = 0.15;
  const reputationWeight = 0.1;

  // Deliverability score (based on delivery rate)
  const deliverabilityScore = Math.min(100, Math.max(0, rates.deliveryRate));

  // Engagement score (based on open and click rates)
  const engagementScore = Math.min(100, Math.max(0, (rates.openRate + rates.clickRate) / 2));

  // Spam score (inverse of bounce and spam rates)
  const spamRate = (metrics.bounced + metrics.spamComplaints) / Math.max(1, metrics.sent) * 100;
  const spamScore = Math.max(0, 100 - spamRate * 2);

  // Warmup score (based on warmup progress)
  const warmupScore = Math.min(100, warmupProgress * 1.2); // Slight bonus for progress

  // Reputation score (placeholder - would integrate with reputation services)
  const reputationScore = 85; // Default good reputation

  // Calculate weighted health score
  const healthScore =
    deliverabilityScore * deliverabilityWeight +
    engagementScore * engagementWeight +
    spamScore * spamWeight +
    warmupScore * warmupWeight +
    reputationScore * reputationWeight;

  return Math.round(Math.max(0, Math.min(100, healthScore)));
}

/**
 * Calculates reputation factors based on performance metrics.
 * Analyzes various aspects that affect sender reputation.
 *
 * @param metrics - Performance metrics
 * @param rates - Calculated rates from metrics
 * @returns Reputation factors breakdown
 */
export function calculateReputationFactors(
  metrics: PerformanceMetrics,
  rates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>
): {
  deliverabilityScore: number;
  spamScore: number;
  bounceScore: number;
  engagementScore: number;
  warmupScore: number;
} {
  // Deliverability score based on delivery rate
  const deliverabilityScore = Math.min(100, Math.max(0, rates.deliveryRate));

  // Spam score based on spam complaints and unsubscribes
  const spamRate = (metrics.spamComplaints + metrics.unsubscribed) / Math.max(1, metrics.sent) * 100;
  const spamScore = Math.max(0, 100 - spamRate * 5);

  // Bounce score based on bounce rate
  const bounceRate = metrics.bounced / Math.max(1, metrics.sent) * 100;
  const bounceScore = Math.max(0, 100 - bounceRate * 2);

  // Engagement score based on open and click rates
  const engagementScore = Math.min(100, Math.max(0, (rates.openRate + rates.clickRate) / 2));

  // Warmup score (placeholder - would be calculated based on warmup history)
  const warmupScore = 75; // Default moderate warmup score

  return {
    deliverabilityScore,
    spamScore,
    bounceScore,
    engagementScore,
    warmupScore,
  };
}

/**
 * Calculates recommended sending volume based on mailbox status and performance.
 * Provides guidance on safe sending volumes to maintain deliverability.
 *
 * @param mailbox - Mailbox performance data
 * @returns Recommended daily sending volume
 */
export function calculateRecommendedVolume(mailbox: MailboxPerformanceData): number {
  const baseRecommendation = mailbox.dailyLimit;

  // Adjust based on warmup status
  let multiplier = 1.0;
  const status = mailbox.warmupStatus as string; // Cast to string for comparison
  switch (status) {
    case 'NOT_STARTED':
    case 'not_started':
      multiplier = 0.1; // Very conservative for new mailboxes
      break;
    case 'IN_PROGRESS':
    case 'in_progress':
      multiplier = Math.min(1.0, mailbox.warmupProgress / 100); // Scale with progress
      break;
    case 'COMPLETED':
    case 'completed':
      multiplier = 1.0; // Full capacity
      break;
    case 'PAUSED':
    case 'paused':
      multiplier = 0.5; // Reduced capacity when paused
      break;
    case 'FAILED':
    case 'failed':
      multiplier = 0.2; // Very conservative for failed warmups
      break;
    default:
      multiplier = 0.5; // Default conservative approach
  }

  // Adjust based on health score
  const healthMultiplier = Math.max(0.1, mailbox.healthScore / 100);

  return Math.round(baseRecommendation * multiplier * healthMultiplier);
}

/**
 * Aggregates mailbox performance metrics across multiple mailboxes.
 * Combines metrics from multiple mailboxes for overview calculations.
 *
 * @param mailboxData - Array of mailbox performance data
 * @returns Aggregated performance metrics
 */
export function aggregateMailboxMetrics(mailboxData: MailboxPerformanceData[]): PerformanceMetrics {
  if (mailboxData.length === 0) {
    return {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    };
  }

  const aggregated = mailboxData.reduce(
    (acc, mailbox) => ({
      sent: acc.sent + mailbox.metrics.sent,
      delivered: acc.delivered + mailbox.metrics.delivered,
      opened_tracked: acc.opened_tracked + mailbox.metrics.opened_tracked,
      clicked_tracked: acc.clicked_tracked + mailbox.metrics.clicked_tracked,
      replied: acc.replied + mailbox.metrics.replied,
      bounced: acc.bounced + mailbox.metrics.bounced,
      unsubscribed: acc.unsubscribed + mailbox.metrics.unsubscribed,
      spamComplaints: acc.spamComplaints + mailbox.metrics.spamComplaints,
    }),
    {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    }
  );

  return aggregated;
}

/**
 * Calculates mailbox utilization statistics.
 * Provides insights into how mailboxes are being used.
 *
 * @param mailboxData - Array of mailbox performance data
 * @returns Utilization statistics
 */
export function calculateMailboxUtilizationStats(mailboxData: MailboxPerformanceData[]): {
  totalCapacity: number;
  usedCapacity: number;
  utilizationRate: number;
  averageHealthScore: number;
  underUtilizedCount: number;
  overUtilizedCount: number;
} {
  if (mailboxData.length === 0) {
    return {
      totalCapacity: 0,
      usedCapacity: 0,
      utilizationRate: 0,
      averageHealthScore: 0,
      underUtilizedCount: 0,
      overUtilizedCount: 0,
    };
  }

  const totalCapacity = mailboxData.reduce((sum, mb) => sum + mb.dailyLimit, 0);
  const usedCapacity = mailboxData.reduce((sum, mb) => sum + mb.currentVolume, 0);
  const utilizationRate = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;
  const averageHealthScore = mailboxData.reduce((sum, mb) => sum + mb.healthScore, 0) / mailboxData.length;

  const underUtilizedCount = mailboxData.filter(mb => {
    const utilization = mb.dailyLimit > 0 ? (mb.currentVolume / mb.dailyLimit) * 100 : 0;
    return utilization < 30; // Less than 30% utilization
  }).length;

  const overUtilizedCount = mailboxData.filter(mb => {
    const utilization = mb.dailyLimit > 0 ? (mb.currentVolume / mb.dailyLimit) * 100 : 0;
    return utilization > 90; // More than 90% utilization
  }).length;

  return {
    totalCapacity,
    usedCapacity,
    utilizationRate,
    averageHealthScore,
    underUtilizedCount,
    overUtilizedCount,
  };
}
