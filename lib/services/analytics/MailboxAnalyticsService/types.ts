// ============================================================================
// MAILBOX ANALYTICS SERVICE TYPES - Type definitions for MailboxAnalyticsService module
// ============================================================================

import { PerformanceMetrics } from "@/types/analytics/core";
import { WarmupStatus, DailyWarmupStats } from "@/types/analytics/domain-specific";

/**
 * Result type from getMailboxAnalytics Convex query.
 * Contains aggregated performance data for mailboxes.
 */
export interface ConvexMailboxPerformanceResult {
  /** Unique identifier for the result */
  _id: string;
  /** Timestamp when the result was created */
  _creationTime: number;
  /** ID of the mailbox */
  mailboxId: string;
  /** Email address of the mailbox */
  email: string;
  /** Domain of the mailbox */
  domain: string;
  /** Email provider for the mailbox */
  provider: string;
  /** Company ID the mailbox belongs to */
  companyId: string;
  /** Date of the analytics data */
  date: string;
  /** Number of emails sent */
  sent: number;
  /** Number of emails delivered */
  delivered: number;
  /** Number of emails opened (tracked) */
  opened_tracked: number;
  /** Number of emails clicked (tracked) */
  clicked_tracked: number;
  /** Number of emails that received replies */
  replied: number;
  /** Number of emails that bounced */
  bounced: number;
  /** Number of emails marked as unsubscribed */
  unsubscribed: number;
  /** Number of spam complaints */
  spamComplaints: number;
  /** Current warmup status of the mailbox */
  warmupStatus: WarmupStatus;
  /** Progress percentage of warmup (0-100) */
  warmupProgress: number;
  /** Daily sending limit for the mailbox */
  dailyLimit: number;
  /** Current sending volume for the day */
  currentVolume: number;
  /** Calculated health score (optional, may not be present in all results) */
  healthScore?: number;
}

/**
 * Result type from getWarmupAnalytics Convex query.
 * Contains warmup-specific analytics data.
 */
export interface ConvexWarmupAnalyticsResult {
  /** ID of the mailbox */
  mailboxId: string;
  /** Total number of warmup activities */
  totalWarmups: number;
  /** Number of spam complaints during warmup */
  spamComplaints: number;
  /** Number of replies received during warmup */
  replies: number;
  /** Overall progress percentage of warmup */
  progressPercentage: number;
  /** Daily warmup statistics */
  dailyStats: DailyWarmupStats[];
}

/**
 * Result type from getMailboxTimeSeriesAnalytics Convex query.
 * Contains time-series data for mailbox analytics.
 */
export interface ConvexTimeSeriesResult {
  /** Unique identifier for the result */
  _id: string;
  /** Timestamp when the result was created */
  _creationTime: number;
  /** Company ID the mailbox belongs to */
  companyId: string;
  /** Date of the time series data point */
  date: string;
  /** Number of emails sent */
  sent: number;
  /** Number of emails delivered */
  delivered: number;
  /** Number of emails opened (tracked) */
  opened_tracked: number;
  /** Number of emails clicked (tracked) */
  clicked_tracked: number;
  /** Number of emails that received replies */
  replied: number;
  /** Number of emails that bounced */
  bounced: number;
  /** Number of emails marked as unsubscribed */
  unsubscribed: number;
  /** Number of spam complaints */
  spamComplaints: number;
  /** Current warmup status of the mailbox */
  warmupStatus: WarmupStatus;
  /** Progress percentage of warmup (0-100) */
  warmupProgress: number;
  /** Daily sending limit for the mailbox */
  dailyLimit: number;
  /** Current sending volume for the day */
  currentVolume: number;
}

/**
 * Mailbox performance data with calculated metrics.
 * Comprehensive performance information for a mailbox.
 */
export interface MailboxPerformanceData {
  /** ID of the mailbox */
  mailboxId: string;
  /** Email address of the mailbox */
  email: string;
  /** Domain of the mailbox */
  domain: string;
  /** Email provider for the mailbox */
  provider: string;
  /** Current warmup status */
  warmupStatus: WarmupStatus;
  /** Progress percentage of warmup (0-100) */
  warmupProgress: number;
  /** Daily sending limit */
  dailyLimit: number;
  /** Current sending volume for the day */
  currentVolume: number;
  /** Calculated health score for the mailbox */
  healthScore: number;
  /** Performance metrics for the mailbox */
  metrics: PerformanceMetrics;
}

/**
 * Warmup analytics data with daily statistics.
 * Detailed information about mailbox warmup progress and performance.
 */
export interface WarmupAnalyticsData {
  /** ID of the mailbox */
  mailboxId: string;
  /** Total number of warmup activities */
  totalWarmups: number;
  /** Number of spam complaints during warmup */
  spamComplaints: number;
  /** Number of replies received during warmup */
  replies: number;
  /** Overall progress percentage of warmup */
  progressPercentage: number;
  /** Daily warmup statistics with detailed metrics */
  dailyStats: DailyWarmupStats[];
}

/**
 * Mailbox health metrics with reputation factors.
 * Comprehensive health assessment including reputation analysis.
 */
export interface MailboxHealthMetrics {
  /** ID of the mailbox */
  mailboxId: string;
  /** Email address of the mailbox */
  email: string;
  /** Domain of the mailbox */
  domain: string;
  /** Email provider for the mailbox */
  provider: string;
  /** Current warmup status */
  warmupStatus: WarmupStatus;
  /** Progress percentage of warmup (0-100) */
  warmupProgress: number;
  /** Calculated health score for the mailbox */
  healthScore: number;
  /** Reputation factors affecting deliverability */
  reputationFactors: {
    /** Score for deliverability performance */
    deliverabilityScore: number;
    /** Score for spam-related metrics */
    spamScore: number;
    /** Score for bounce-related metrics */
    bounceScore: number;
    /** Score for engagement metrics */
    engagementScore: number;
    /** Score for warmup progress and compliance */
    warmupScore: number;
  };
  /** Performance metrics for the mailbox */
  performanceMetrics: PerformanceMetrics;
  /** Daily sending limit */
  dailyLimit: number;
  /** Current sending volume for the day */
  currentVolume: number;
  /** Timestamp when this data was last updated */
  lastUpdated: number;
}

/**
 * Sending capacity data for mailboxes.
 * Information about sending limits and utilization.
 */
export interface SendingCapacityData {
  /** ID of the mailbox */
  mailboxId: string;
  /** Email address of the mailbox */
  email: string;
  /** Daily sending limit */
  dailyLimit: number;
  /** Current sending volume for the day */
  currentVolume: number;
  /** Remaining capacity for the day */
  remainingCapacity: number;
  /** Utilization rate as a percentage (0-100) */
  utilizationRate: number;
  /** Recommended volume based on warmup status and performance */
  recommendedVolume: number;
  /** Current warmup status */
  warmupStatus: WarmupStatus;
  /** Progress percentage of warmup (0-100) */
  warmupProgress: number;
}

/**
 * Analytics update data for mailboxes.
 * Structure for updating mailbox analytics information.
 */
export interface MailboxAnalyticsUpdate {
  /** ID of the mailbox */
  mailboxId: string;
  /** Email address of the mailbox */
  email: string;
  /** Domain of the mailbox */
  domain: string;
  /** Email provider for the mailbox */
  provider: string;
  /** Company ID the mailbox belongs to */
  companyId: string;
  /** Date of the analytics data */
  date: string;
  /** Number of emails sent */
  sent: number;
  /** Number of emails delivered */
  delivered: number;
  /** Number of emails opened (tracked) */
  opened_tracked: number;
  /** Number of emails clicked (tracked) */
  clicked_tracked: number;
  /** Number of emails that received replies */
  replied: number;
  /** Number of emails that bounced */
  bounced: number;
  /** Number of emails marked as unsubscribed */
  unsubscribed: number;
  /** Number of spam complaints */
  spamComplaints: number;
  /** Current warmup status */
  warmupStatus: WarmupStatus;
  /** Progress percentage of warmup (0-100) */
  warmupProgress: number;
  /** Daily sending limit */
  dailyLimit: number;
  /** Current sending volume for the day */
  currentVolume: number;
}

/**
 * Warmup analytics update data.
 * Structure for updating warmup-specific analytics.
 */
export interface WarmupAnalyticsUpdate {
  /** ID of the mailbox */
  mailboxId: string;
  /** Date of the warmup data */
  date: string;
  /** Number of warmup emails sent */
  sent: number;
  /** Number of warmup emails delivered */
  delivered: number;
  /** Number of warmup emails that received replies */
  replies: number;
  /** Number of spam complaints during warmup */
  spamComplaints: number;
  /** Current warmup status */
  warmupStatus: WarmupStatus;
  /** Progress percentage of warmup (0-100) */
  warmupProgress: number;
}

/**
 * Batch update result for analytics operations.
 * Contains results of bulk analytics updates.
 */
export interface BatchUpdateResult {
  /** Whether the batch operation was successful */
  success: boolean;
  /** Number of records processed */
  processed: number;
  /** Individual results for each record */
  results: Array<{
    /** ID of the record */
    id: string;
    /** Whether this specific record was updated successfully */
    success: boolean;
    /** Error message if the update failed */
    error?: string;
  }>;
}

/**
 * Mailbox analytics query parameters.
 * Parameters used for querying mailbox analytics data.
 */
export interface MailboxAnalyticsQuery {
  /** IDs of mailboxes to query */
  mailboxIds: string[];
  /** Date range for the query */
  dateRange?: {
    /** Start date (ISO string) */
    start: string;
    /** End date (ISO string) */
    end: string;
  };
  /** Company ID to filter by */
  companyId?: string;
  /** Granularity for time series data */
  granularity?: "day" | "week" | "month";
}
