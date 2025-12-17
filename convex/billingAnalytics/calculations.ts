import type { CostAnalyticsResult } from "./types";
import type { BillingAnalyticsRecord, DateRange, Granularity, CostTrend, UsageAlert, AlertThresholds } from "./types";

// ============================================================================
// BILLING ANALYTICS CALCULATIONS
// ============================================================================

/**
 * Get default date range for last 30 days
 */
export function getDefaultDateRange(): DateRange {
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const end = new Date().toISOString().split("T")[0];
  return { start, end };
}

/**
 * Group billing data by granularity for time series
 */
export function groupBillingDataByGranularity(
  billingData: BillingAnalyticsRecord[],
  granularity: Granularity
): Map<string, BillingAnalyticsRecord[]> {
  const groupedData = new Map<string, BillingAnalyticsRecord[]>();

  billingData.forEach(record => {
    let groupKey: string;
    const date = new Date(record.date);

    switch (granularity) {
      case "week":
        // Get Monday of the week
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        groupKey = monday.toISOString().split("T")[0];
        break;
      case "month":
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
        break;
      default: // day
        groupKey = record.date;
    }

    if (!groupedData.has(groupKey)) {
      groupedData.set(groupKey, []);
    }
    groupedData.get(groupKey)!.push(record);
  });

  return groupedData;
}

/**
 * Calculate cost analytics metrics
 */
export function calculateCostAnalytics(
  billingData: BillingAnalyticsRecord[],
  dateRange: DateRange
): CostAnalyticsResult {
  if (billingData.length === 0) {
    return {
      totalCost: 0,
      averageDailyCost: 0,
      projectedMonthlyCost: 0,
      costTrend: "stable",
      currency: "USD",
      periodStart: dateRange.start,
      periodEnd: dateRange.end,
      dataPoints: 0,
      trendPercentage: 0,
    };
  }

  // Calculate cost metrics
  const totalCost = billingData.reduce((sum, record) => sum + record.currentPeriodCost, 0);
  const averageDailyCost = totalCost / billingData.length;

  // Project monthly cost based on current usage
  const latestRecord = billingData.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const projectedMonthlyCost = latestRecord.projectedCost;

  // Calculate cost trend (compare first half vs second half of period)
  const midpoint = Math.floor(billingData.length / 2);
  const firstHalf = billingData.slice(0, midpoint);
  const secondHalf = billingData.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.currentPeriodCost, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.currentPeriodCost, 0) / secondHalf.length;

  let costTrend: CostTrend;
  const trendThreshold = 0.1; // 10% change threshold
  const trendRatio = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;

  if (trendRatio > trendThreshold) {
    costTrend = "increasing";
  } else if (trendRatio < -trendThreshold) {
    costTrend = "decreasing";
  } else {
    costTrend = "stable";
  }

  return {
    totalCost,
    averageDailyCost,
    projectedMonthlyCost,
    costTrend,
    currency: latestRecord.currency,
    periodStart: dateRange.start,
    periodEnd: dateRange.end,
    dataPoints: billingData.length,
    trendPercentage: Math.round(Math.abs(trendRatio) * 100),
  } as const;
}

/**
 * Calculate usage alerts
 */
export function calculateUsageAlerts(
  currentUsage: BillingAnalyticsRecord,
  thresholds: Required<AlertThresholds>
): UsageAlert[] {
  const alerts: UsageAlert[] = [];

  // Check email usage
  if (currentUsage.emailsRemaining !== -1) { // -1 means unlimited
    const totalEmails = currentUsage.emailsSent + currentUsage.emailsRemaining;
    const emailUsageRatio = currentUsage.emailsSent / totalEmails;

    if (emailUsageRatio >= thresholds.emailsCritical) {
      alerts.push({
        type: "critical",
        resource: "emails",
        message: `Critical: ${Math.round(emailUsageRatio * 100)}% of email quota used`,
        usage: currentUsage.emailsSent,
        limit: totalEmails,
        percentage: Math.round(emailUsageRatio * 100),
      });
    } else if (emailUsageRatio >= thresholds.emailsWarning) {
      alerts.push({
        type: "warning",
        resource: "emails",
        message: `Warning: ${Math.round(emailUsageRatio * 100)}% of email quota used`,
        usage: currentUsage.emailsSent,
        limit: totalEmails,
        percentage: Math.round(emailUsageRatio * 100),
      });
    }
  }

  // Check domain usage
  if (currentUsage.domainsLimit > 0) {
    const domainUsageRatio = currentUsage.domainsUsed / currentUsage.domainsLimit;

    if (domainUsageRatio >= thresholds.domainsWarning) {
      alerts.push({
        type: domainUsageRatio >= 1 ? "critical" : "warning",
        resource: "domains",
        message: `${domainUsageRatio >= 1 ? "Critical" : "Warning"}: ${currentUsage.domainsUsed}/${currentUsage.domainsLimit} domains used`,
        usage: currentUsage.domainsUsed,
        limit: currentUsage.domainsLimit,
        percentage: Math.round(domainUsageRatio * 100),
      });
    }
  }

  // Check mailbox usage
  if (currentUsage.mailboxesLimit > 0) {
    const mailboxUsageRatio = currentUsage.mailboxesUsed / currentUsage.mailboxesLimit;

    if (mailboxUsageRatio >= thresholds.mailboxesWarning) {
      alerts.push({
        type: mailboxUsageRatio >= 1 ? "critical" : "warning",
        resource: "mailboxes",
        message: `${mailboxUsageRatio >= 1 ? "Critical" : "Warning"}: ${currentUsage.mailboxesUsed}/${currentUsage.mailboxesLimit} mailboxes used`,
        usage: currentUsage.mailboxesUsed,
        limit: currentUsage.mailboxesLimit,
        percentage: Math.round(mailboxUsageRatio * 100),
      });
    }
  }

  return alerts;
}

/**
 * Get default thresholds for alerts
 */
export function getDefaultThresholds(overrides?: AlertThresholds): Required<AlertThresholds> {
  return {
    emailsWarning: overrides?.emailsWarning || 0.8,
    emailsCritical: overrides?.emailsCritical || 0.95,
    domainsWarning: overrides?.domainsWarning || 0.8,
    mailboxesWarning: overrides?.mailboxesWarning || 0.8,
  };
}
