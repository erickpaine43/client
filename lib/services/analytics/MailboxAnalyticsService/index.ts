// ============================================================================
// MAILBOX ANALYTICS SERVICE - Main coordinator for mailbox analytics
// ============================================================================
// Re-exports all types and modular functions for backward compatibility
// This maintains the existing API while using the new modular architecture

export * from "./types";
export * from "./validation";
export * from "./calculations";
export * from "./queries";
export * from "./mutations";

// Re-export core analytics types for convenience
export type { AnalyticsFilters, PerformanceMetrics, TimeSeriesDataPoint, AnalyticsComputeOptions } from "@/types/analytics/core";
export type { WarmupStatus, DailyWarmupStats } from "@/types/analytics/domain-specific";

// Import required dependencies
import { AnalyticsFilters, PerformanceMetrics, TimeSeriesDataPoint, AnalyticsComputeOptions } from "@/types/analytics/core";
import { WarmupStatus } from "@/types/analytics/domain-specific";
import { BaseAnalyticsService, AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

// Import modular functions
import {
  MailboxPerformanceData,
  WarmupAnalyticsData,
  MailboxHealthMetrics,
  SendingCapacityData
} from "./types";
import {
  getMailboxPerformance,
  getWarmupAnalytics,
  getHealthScores,
  getSendingCapacity,
  getTimeSeriesData,
  computeAnalyticsForFilteredData
} from "./queries";
import {
  updateAnalytics,
  updateWarmupAnalytics,
  batchUpdateAnalytics
} from "./mutations";

/**
 * Domain service for mailbox analytics operations.
 * Handles mailbox performance, warmup tracking, and health monitoring.
 *
 * This class maintains 100% API compatibility with the original MailboxAnalyticsService
 * while internally using the new modular architecture.
 */
export class MailboxAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super("mailboxes");
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Get performance metrics for specific mailboxes.
   */
  async getMailboxPerformance(
    mailboxIds: string[],
    filters: AnalyticsFilters
  ): Promise<MailboxPerformanceData[]> {
    return getMailboxPerformance(mailboxIds, filters);
  }

  /**
   * Get warmup analytics for specific mailboxes.
   */
  async getWarmupAnalytics(mailboxIds: string[]): Promise<WarmupAnalyticsData[]> {
    return getWarmupAnalytics(mailboxIds);
  }

  /**
   * Get health scores for specific mailboxes.
   */
  async getHealthScores(mailboxIds: string[]): Promise<MailboxHealthMetrics[]> {
    return getHealthScores(mailboxIds);
  }

  /**
   * Get sending capacity data for mailboxes.
   */
  async getSendingCapacity(mailboxIds: string[]): Promise<SendingCapacityData[]> {
    return getSendingCapacity(mailboxIds);
  }

  /**
   * Get time series data for mailbox analytics.
   */
  async getTimeSeriesData(
    mailboxIds: string[],
    filters: AnalyticsFilters,
    granularity: "day" | "week" | "month" = "day"
  ): Promise<TimeSeriesDataPoint[]> {
    return getTimeSeriesData(mailboxIds, filters, granularity);
  }

  /**
   * Compute analytics on filtered dataset.
   */
  async computeAnalyticsForFilteredData(
    filters: AnalyticsFilters,
    options: AnalyticsComputeOptions = {}
  ): Promise<{
    aggregatedMetrics: PerformanceMetrics;
    rates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
    timeSeriesData?: TimeSeriesDataPoint[];
    healthMetrics?: MailboxHealthMetrics[];
  }> {
    return computeAnalyticsForFilteredData(filters, options);
  }

  // ============================================================================
  // MUTATION METHODS
  // ============================================================================

  /**
   * Update mailbox analytics data.
   */
  async updateAnalytics(data: {
    mailboxId: string;
    email: string;
    domain: string;
    provider: string;
    companyId: string;
    date: string;
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    warmupStatus: WarmupStatus;
    warmupProgress: number;
    dailyLimit: number;
    currentVolume: number;
  }): Promise<string> {
    return updateAnalytics(data);
  }

  /**
   * Update warmup analytics data.
   */
  async updateWarmupAnalytics(
    data:
      | {
          mailboxId: string;
          date: string;
          sent: number;
          delivered: number;
          replies: number;
          spamComplaints: number;
          warmupStatus: WarmupStatus;
          warmupProgress: number;
        }
      | {
          mailboxId: string;
          companyId: string; // legacy, ignored in new mutation
          date: string;
          totalWarmups: number;
          delivered: number;
          spamComplaints: number;
          replies: number;
          bounced: number; // legacy, not used in new mutation
          emailsWarmed: number;
          healthScore: number; // legacy, not used in new mutation
          progressPercentage: number;
        }
  ): Promise<string> {
    // Type guard to detect legacy warmup payload shape
    const isLegacyWarmupPayload = (
      payload: unknown
    ): payload is {
      mailboxId: string;
      companyId: string;
      date: string;
      totalWarmups: number;
      delivered: number;
      spamComplaints: number;
      replies: number;
      bounced: number;
      emailsWarmed: number;
      healthScore: number;
      progressPercentage: number;
    } =>
      !!payload &&
      typeof payload === "object" &&
      ("emailsWarmed" in (payload as Record<string, unknown>) ||
        "progressPercentage" in (payload as Record<string, unknown>));

    if (isLegacyWarmupPayload(data)) {
      const progress = data.progressPercentage ?? 0;
      const derivedStatus: WarmupStatus =
        progress >= 100 ? "WARMED" : progress > 0 ? "WARMING" : "NOT_STARTED";

      const mapped = {
        mailboxId: data.mailboxId,
        date: data.date,
        sent: (data.emailsWarmed ?? data.totalWarmups) as number,
        delivered: data.delivered,
        replies: data.replies,
        spamComplaints: data.spamComplaints,
        warmupStatus: derivedStatus,
        warmupProgress: progress,
      } as const;

      return updateWarmupAnalytics(mapped);
    }

    return updateWarmupAnalytics(data);
  }

  /**
   * Batch update analytics data.
   */
  async batchUpdateAnalytics(data: Array<{
    mailboxId: string;
    email: string;
    domain: string;
    provider: string;
    companyId: string;
    date: string;
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    warmupStatus: WarmupStatus;
    warmupProgress: number;
    dailyLimit: number;
    currentVolume: number;
  }>): Promise<{
    success: boolean;
    processed: number;
    results: Array<{ id: string; success: boolean; error?: string }>;
  }> {
    return batchUpdateAnalytics(data);
  }

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * Get company ID from filters (legacy compatibility).
   * @deprecated Use context-based company resolution instead
   */
  private getCompanyId(filters: AnalyticsFilters): string {
    // TODO: Get from context instead of filters
    return filters.entityIds?.[0] || "default";
  }

  /**
   * Get default date range (legacy compatibility).
   * @deprecated Use explicit date ranges in filters
   */
  private getDefaultDateRange(days: number = 30): { start: string; end: string } {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }

  /**
   * Validate filters (legacy compatibility).
   * @deprecated Use validation functions from validation module
   */
  validateFilters(filters: AnalyticsFilters): void {
    if (!filters) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Filters are required",
        this.domain,
        false
      );
    }

    if (filters.dateRange) {
      if (!filters.dateRange.start || !filters.dateRange.end) {
        throw new AnalyticsError(
          AnalyticsErrorType.VALIDATION_ERROR,
          "Date range must include both start and end dates",
          this.domain,
          false
        );
      }
    }
  }

  /**
   * Validate metrics (legacy compatibility).
   * @deprecated Use validation functions from validation module
   */
  validateMetrics(metrics: {
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
  }): void {
    const fields = ['sent', 'delivered', 'opened_tracked', 'clicked_tracked', 'replied', 'bounced', 'unsubscribed', 'spamComplaints'];

    for (const field of fields) {
      const value = metrics[field as keyof typeof metrics];
      if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
        throw new AnalyticsError(
          AnalyticsErrorType.VALIDATION_ERROR,
          `${field} must be a non-negative integer`,
          this.domain,
          false
        );
      }
    }
  }

  // ============================================================================
  // MAPPING METHODS (Legacy - now in calculations module)
  // ============================================================================

  /**
   * Map Convex result to MailboxPerformanceData.
   * @deprecated Use mapToMailboxPerformanceData from calculations module
   */
  private async mapToMailboxPerformanceData(_result: unknown): Promise<MailboxPerformanceData> {
    // This method is now handled by the calculations module
    // Keeping for backward compatibility during transition
    throw new Error("Use mapToMailboxPerformanceData from calculations module");
  }

  /**
   * Map Convex result to WarmupAnalyticsData.
   * @deprecated Use mapToWarmupAnalyticsData from calculations module
   */
  private async mapToWarmupAnalyticsData(_result: unknown): Promise<WarmupAnalyticsData> {
    // This method is now handled by the calculations module
    // Keeping for backward compatibility during transition
    throw new Error("Use mapToWarmupAnalyticsData from calculations module");
  }

  /**
   * Map Convex result to MailboxHealthMetrics.
   * @deprecated Use mapToMailboxHealthMetrics from calculations module
   */
  private async mapToMailboxHealthMetrics(_result: unknown): Promise<MailboxHealthMetrics> {
    // This method is now handled by the calculations module
    // Keeping for backward compatibility during transition
    throw new Error("Use mapToMailboxHealthMetrics from calculations module");
  }

  /**
   * Map MailboxPerformanceData to SendingCapacityData.
   * @deprecated Use mapToSendingCapacityData from calculations module
   */
  private async mapToSendingCapacityData(_mailbox: MailboxPerformanceData): Promise<SendingCapacityData> {
    // This method is now handled by the calculations module
    // Keeping for backward compatibility during transition
    throw new Error("Use mapToSendingCapacityData from calculations module");
  }

  /**
   * Map Convex result to TimeSeriesDataPoint.
   * @deprecated Use mapToTimeSeriesDataPoint from calculations module
   */
  private async mapToTimeSeriesDataPoint(_result: unknown): Promise<TimeSeriesDataPoint> {
    // This method is now handled by the calculations module
    // Keeping for backward compatibility during transition
    throw new Error("Use mapToTimeSeriesDataPoint from calculations module");
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Basic health check for the mailbox analytics service.
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - try to query with minimal data
      await this.getMailboxPerformance(["test"], {
        dateRange: {
          start: new Date().toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
        entityIds: [],
      });
      return true;
    } catch (error) {
      console.error("MailboxAnalyticsService health check failed:", error);
      return false;
    }
  }
}

// Export singleton instance for convenience
export const mailboxAnalyticsService = new MailboxAnalyticsService();

// Default export for convenience
export default MailboxAnalyticsService;
