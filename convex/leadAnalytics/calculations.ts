import {
  LeadAnalyticsRecord,
  LeadAggregatedMetrics,
  LeadStatusBreakdownItem,
  LeadEngagementSummary,
  LeadTimeSeriesDataPoint,
  LeadStatus
} from "./types";

/**
 * Calculate Aggregated Metrics from Lead Analytics Records
 * Sums up all metrics across multiple records
 */
export function calculateLeadAggregatedMetrics(records: LeadAnalyticsRecord[]): LeadAggregatedMetrics {
  return records.reduce(
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
}

/**
 * Calculate Engagement Rates from Metrics
 * Computes various engagement percentages
 */
export function calculateEngagementRates(metrics: LeadAggregatedMetrics): {
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  spamComplaintRate: number;
} {
  const totalSent = metrics.sent;

  if (totalSent === 0) {
    return {
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
      spamComplaintRate: 0,
    };
  }

  return {
    openRate: metrics.opened_tracked / totalSent,
    clickRate: metrics.clicked_tracked / totalSent,
    replyRate: metrics.replied / totalSent,
    bounceRate: metrics.bounced / totalSent,
    unsubscribeRate: metrics.unsubscribed / totalSent,
    spamComplaintRate: metrics.spamComplaints / totalSent,
  };
}

/**
 * Group Records by Lead ID
 * Creates a map of lead IDs to their associated records
 */
export function groupRecordsByLeadId(records: LeadAnalyticsRecord[]): Map<string, LeadAnalyticsRecord[]> {
  const grouped = new Map<string, LeadAnalyticsRecord[]>();

  for (const record of records) {
    const leadId = record.leadId;
    if (!grouped.has(leadId)) {
      grouped.set(leadId, []);
    }
    grouped.get(leadId)!.push(record);
  }

  return grouped;
}

/**
 * Group Records by Status
 * Creates a map of status values to their associated records
 */
export function groupRecordsByStatus(records: LeadAnalyticsRecord[]): Map<string, LeadAnalyticsRecord[]> {
  const grouped = new Map<string, LeadAnalyticsRecord[]>();

  for (const record of records) {
    const status = record.status;
    if (!grouped.has(status)) {
      grouped.set(status, []);
    }
    grouped.get(status)!.push(record);
  }

  return grouped;
}

/**
 * Group Records by Time Period
 * Groups records by day, week, or month based on granularity
 */
export function groupRecordsByTimePeriod(
  records: LeadAnalyticsRecord[],
  granularity: "day" | "week" | "month"
): Map<string, LeadAnalyticsRecord[]> {
  const grouped = new Map<string, LeadAnalyticsRecord[]>();

  for (const record of records) {
    const timeKey = getTimeKey(record.date, granularity);
    if (!grouped.has(timeKey)) {
      grouped.set(timeKey, []);
    }
    grouped.get(timeKey)!.push(record);
  }

  return grouped;
}

/**
 * Get Time Key for Grouping
 * Converts a date string to a time key based on granularity
 */
export function getTimeKey(dateStr: string, granularity: "day" | "week" | "month"): string {
  const date = new Date(dateStr);

  switch (granularity) {
    case "day":
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    case "week":
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      return weekStart.toISOString().split("T")[0];
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
    default:
      return dateStr;
  }
}

/**
 * Format Time Label for Display
 * Creates human-readable labels for time periods
 */
export function formatTimeLabel(timeKey: string, granularity: "day" | "week" | "month"): string {
  const date = new Date(timeKey);

  switch (granularity) {
    case "day":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    case "week":
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    case "month":
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long"
      });
    default:
      return timeKey;
  }
}

/**
 * Calculate Status Breakdown
 * Creates status breakdown with counts and percentages
 */
export function calculateStatusBreakdown(
  statusGroups: Map<string, LeadAnalyticsRecord[]>,
  totalLeads: number
): LeadStatusBreakdownItem[] {
  return Array.from(statusGroups.entries()).map(([status, records]) => ({
    status: status as LeadStatus,
    count: new Set(records.map(r => r.leadId)).size,
    percentage: totalLeads > 0 ? new Set(records.map(r => r.leadId)).size / totalLeads : 0,
  }));
}

/**
 * Calculate Engagement Summary
 * Creates engagement summary from status groups
 */
export function calculateEngagementSummary(statusGroups: Map<string, LeadAnalyticsRecord[]>): LeadEngagementSummary {
  return {
    activeLeads: statusGroups.get("ACTIVE")?.length || 0,
    repliedLeads: statusGroups.get("REPLIED")?.length || 0,
    bouncedLeads: statusGroups.get("BOUNCED")?.length || 0,
    unsubscribedLeads: statusGroups.get("UNSUBSCRIBED")?.length || 0,
    completedLeads: statusGroups.get("COMPLETED")?.length || 0,
  };
}

/**
 * Create Time Series Data Points
 * Transforms grouped records into time series data points
 */
export function createTimeSeriesDataPoints(
  timeGroups: Map<string, LeadAnalyticsRecord[]>,
  granularity: "day" | "week" | "month"
): LeadTimeSeriesDataPoint[] {
  return Array.from(timeGroups.entries())
    .map(([timeKey, records]) => {
      const metrics = calculateLeadAggregatedMetrics(records);
      return {
        date: timeKey,
        label: formatTimeLabel(timeKey, granularity),
        metrics,
        leadCount: new Set(records.map(r => r.leadId)).size,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get Latest Record by Updated Time
 * Finds the most recently updated record from a group
 */
export function getLatestRecord(records: LeadAnalyticsRecord[]): LeadAnalyticsRecord {
  return records.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

/**
 * Calculate Unique Lead Count
 * Counts unique leads from a set of records
 */
export function calculateUniqueLeadCount(records: LeadAnalyticsRecord[]): number {
  return new Set(records.map(r => r.leadId)).size;
}

/**
 * Filter Records by Date Range
 * Filters records to only include those within the specified date range
 */
export function filterRecordsByDateRange(
  records: LeadAnalyticsRecord[],
  startDate: string,
  endDate: string
): LeadAnalyticsRecord[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= start && recordDate <= end;
  });
}

/**
 * Filter Records by Lead IDs
 * Filters records to only include specified lead IDs
 */
export function filterRecordsByLeadIds(
  records: LeadAnalyticsRecord[],
  leadIds: string[]
): LeadAnalyticsRecord[] {
  return records.filter(record => leadIds.includes(record.leadId));
}

/**
 * Validate Metrics Consistency
 * Checks for potential data inconsistencies in metrics
 */
export function validateMetricsConsistency(metrics: LeadAggregatedMetrics): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check if interactions exceed sent count
  const totalInteractions = metrics.opened_tracked + metrics.clicked_tracked + metrics.replied;
  if (totalInteractions > metrics.sent) {
    warnings.push("Total interactions exceed sent count");
  }

  // Check if bounces exceed sent count
  if (metrics.bounced > metrics.sent) {
    warnings.push("Bounce count exceeds sent count");
  }

  // Check for negative values
  const metricFields = Object.keys(metrics) as (keyof LeadAggregatedMetrics)[];
  for (const field of metricFields) {
    if (metrics[field] < 0) {
      warnings.push(`${field} contains negative value`);
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}
