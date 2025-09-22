import {
  EmailMetrics,
  MailboxAnalyticsRecord,
  TimeSeriesGroup
} from "./types";

/**
 * Calculate mailbox health score based on performance metrics
 * @param mailbox Mailbox record with metrics
 * @returns Health score (0-100)
 */
export function calculateMailboxHealthScore(mailbox: MailboxAnalyticsRecord & EmailMetrics): number {
  const bounceRate = mailbox.sent > 0 ? mailbox.bounced / mailbox.sent : 0;
  const spamRate = mailbox.delivered > 0 ? mailbox.spamComplaints / mailbox.delivered : 0;

  let healthScore = 100;
  healthScore -= bounceRate * 100 * 2; // Bounce rate impact
  healthScore -= spamRate * 100 * 5;   // Spam rate impact

  return Math.max(0, Math.min(100, healthScore));
}

/**
 * Calculate domain health score based on aggregated metrics
 * @param metrics Domain metrics
 * @returns Health score (0-100)
 */
export function calculateDomainHealthScore(metrics: EmailMetrics): number {
  const bounceRate = metrics.sent > 0 ? metrics.bounced / metrics.sent : 0;
  const spamRate = metrics.delivered > 0 ? metrics.spamComplaints / metrics.delivered : 0;

  let healthScore = 100;
  healthScore -= bounceRate * 100 * 2; // Bounce rate impact
  healthScore -= spamRate * 100 * 5;   // Spam rate impact

  return Math.max(0, Math.min(100, healthScore));
}

/**
 * Calculate domain reputation score
 * @param metrics Domain metrics
 * @param authentication Domain authentication status
 * @returns Reputation score (0-100)
 */
export function calculateDomainReputation(
  metrics: EmailMetrics,
  authentication: { spf: boolean; dkim: boolean; dmarc: boolean }
): number {
  let reputation = 50; // Base reputation

  // Authentication bonuses
  if (authentication.spf) reputation += 15;
  if (authentication.dkim) reputation += 15;
  if (authentication.dmarc) reputation += 20;

  // Performance-based adjustments
  const deliveryRate = metrics.sent > 0 ? metrics.delivered / metrics.sent : 0;
  const bounceRate = metrics.sent > 0 ? metrics.bounced / metrics.sent : 0;
  const spamRate = metrics.delivered > 0 ? metrics.spamComplaints / metrics.delivered : 0;

  if (deliveryRate > 0.95) reputation += 10;
  else if (deliveryRate < 0.85) reputation -= 20;

  if (bounceRate < 0.02) reputation += 5;
  else if (bounceRate > 0.05) reputation -= 15;

  if (spamRate < 0.001) reputation += 5;
  else if (spamRate > 0.005) reputation -= 25;

  return Math.max(0, Math.min(100, reputation));
}

/**
 * Aggregate email metrics from multiple records
 * @param records Array of records with email metrics
 * @returns Aggregated email metrics
 */
export function aggregateEmailMetrics(records: (MailboxAnalyticsRecord & EmailMetrics)[]): EmailMetrics {
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
 * Calculate mailbox insights for domain analysis
 * @param mailboxes Array of mailbox records
 * @returns Mailbox insights object
 */
export function calculateMailboxInsights(mailboxes: (MailboxAnalyticsRecord & EmailMetrics)[]): {
  totalMailboxes: number;
  activeMailboxes: number;
  warmingMailboxes: number;
  averageWarmupProgress: number;
  totalCapacity: number;
  totalVolume: number;
} {
  const totalMailboxes = mailboxes.length;
  const activeMailboxes = mailboxes.filter(m => m.sent > 0).length;
  const warmingMailboxes = mailboxes.filter(m => m.warmupStatus === "WARMING").length;
  const averageWarmupProgress = totalMailboxes > 0
    ? Math.round(mailboxes.reduce((sum, m) => sum + m.warmupProgress, 0) / totalMailboxes)
    : 0;
  const totalCapacity = mailboxes.reduce((sum, m) => sum + m.dailyLimit, 0);
  const totalVolume = mailboxes.reduce((sum, m) => sum + m.currentVolume, 0);

  return {
    totalMailboxes,
    activeMailboxes,
    warmingMailboxes,
    averageWarmupProgress,
    totalCapacity,
    totalVolume,
  };
}

/**
 * Calculate capacity utilization rate
 * @param totalVolume Total current volume
 * @param totalCapacity Total capacity
 * @returns Utilization rate (0-1)
 */
export function calculateCapacityUtilization(totalVolume: number, totalCapacity: number): number {
  return totalCapacity > 0 ? totalVolume / totalCapacity : 0;
}

/**
 * Calculate warmup summary for domain
 * @param mailboxes Array of mailbox records
 * @returns Warmup summary object
 */
export function calculateWarmupSummary(mailboxes: (MailboxAnalyticsRecord & EmailMetrics)[]): {
  totalMailboxes: number;
  warmingMailboxes: number;
  warmedMailboxes: number;
  averageWarmupProgress: number;
  averageHealthScore: number;
} {
  const totalMailboxes = mailboxes.length;
  const warmingMailboxes = mailboxes.filter(m => m.warmupStatus === "WARMING").length;
  const warmedMailboxes = mailboxes.filter(m => m.warmupStatus === "WARMED").length;
  const averageWarmupProgress = totalMailboxes > 0
    ? Math.round(mailboxes.reduce((sum, m) => sum + m.warmupProgress, 0) / totalMailboxes)
    : 0;

  const healthScores = mailboxes.map(m => calculateMailboxHealthScore(m));
  const averageHealthScore = healthScores.length > 0
    ? Math.round(healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length)
    : 0;

  return {
    totalMailboxes,
    warmingMailboxes,
    warmedMailboxes,
    averageWarmupProgress,
    averageHealthScore,
  };
}

/**
 * Calculate capacity summary for domain
 * @param mailboxes Array of mailbox records
 * @returns Capacity summary object
 */
export function calculateCapacitySummary(mailboxes: (MailboxAnalyticsRecord & EmailMetrics)[]): {
  totalDailyLimit: number;
  totalCurrentVolume: number;
  utilizationRate: number;
} {
  const totalDailyLimit = mailboxes.reduce((sum, m) => sum + m.dailyLimit, 0);
  const totalCurrentVolume = mailboxes.reduce((sum, m) => sum + m.currentVolume, 0);
  const utilizationRate = mailboxes.length > 0
    ? mailboxes.reduce((sum, m) => sum + calculateCapacityUtilization(m.currentVolume, m.dailyLimit), 0) / mailboxes.length
    : 0;

  return {
    totalDailyLimit,
    totalCurrentVolume,
    utilizationRate,
  };
}

/**
 * Get time key for grouping records by time period
 * @param dateStr Date string
 * @param granularity Time granularity
 * @returns Time key string
 */
export function getTimeKey(dateStr: string, granularity: "day" | "week" | "month"): string {
  const date = new Date(dateStr);

  switch (granularity) {
    case "day":
      return dateStr;
    case "week": {
      const year = date.getFullYear();
      const weekNum = getWeekNumber(date);
      return `${year}-W${weekNum.toString().padStart(2, '0')}`;
    }
    case "month": {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${year}-${month}`;
    }
    default:
      return dateStr;
  }
}

/**
 * Format time label for display
 * @param timeKey Time key string
 * @param granularity Time granularity
 * @returns Formatted time label
 */
export function formatTimeLabel(timeKey: string, granularity: "day" | "week" | "month"): string {
  switch (granularity) {
    case "day":
      return new Date(timeKey).toLocaleDateString();
    case "week": {
      const [year, week] = timeKey.split('-W');
      const weekNum = parseInt(week, 10);
      const date = new Date(parseInt(year, 10), 0, 1 + (weekNum - 1) * 7);
      const endDate = new Date(date);
      endDate.setDate(date.getDate() + 6);
      return `${date.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    case "month": {
      const [year, month] = timeKey.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
    default:
      return timeKey;
  }
}

/**
 * Get ISO week number for a date
 * @param date Date object
 * @returns Week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Group mailbox data by time period and domain
 * @param records Mailbox records
 * @param granularity Time granularity
 * @returns Time series groups
 */
export function groupByTimePeriod(
  records: (MailboxAnalyticsRecord & EmailMetrics)[],
  granularity: "day" | "week" | "month"
): TimeSeriesGroup[] {
  const groups = records.reduce((groups, record) => {
    const timeKey = getTimeKey(record.date, granularity);
    const groupKey = `${timeKey}:${record.domain}`;

    if (!groups[groupKey]) {
      groups[groupKey] = {
        date: timeKey,
        domainId: record.domain,
        mailboxes: [],
        aggregatedMetrics: {
          sent: 0,
          delivered: 0,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        },
      };
    }

    const group = groups[groupKey];
    group.mailboxes.push(record);
    group.aggregatedMetrics.sent += record.sent;
    group.aggregatedMetrics.delivered += record.delivered;
    group.aggregatedMetrics.opened_tracked += record.opened_tracked;
    group.aggregatedMetrics.clicked_tracked += record.clicked_tracked;
    group.aggregatedMetrics.replied += record.replied;
    group.aggregatedMetrics.bounced += record.bounced;
    group.aggregatedMetrics.unsubscribed += record.unsubscribed;
    group.aggregatedMetrics.spamComplaints += record.spamComplaints;

    return groups;
  }, {} as Record<string, TimeSeriesGroup>);

  return Object.values(groups);
}

/**
 * Calculate performance rates from email metrics
 * @param metrics Email metrics
 * @returns Standard performance rates
 */
export function calculatePerformanceRates(metrics: EmailMetrics): {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  spamRate: number;
} {
  const delivered = metrics.delivered || 0;
  const sent = metrics.sent || 0;

  return {
    deliveryRate: sent > 0 ? delivered / sent : 0,
    openRate: delivered > 0 ? metrics.opened_tracked / delivered : 0,
    clickRate: delivered > 0 ? metrics.clicked_tracked / delivered : 0,
    replyRate: delivered > 0 ? metrics.replied / delivered : 0,
    bounceRate: sent > 0 ? metrics.bounced / sent : 0,
    unsubscribeRate: delivered > 0 ? metrics.unsubscribed / delivered : 0,
    spamRate: delivered > 0 ? metrics.spamComplaints / delivered : 0,
  };
}

/**
 * Calculate correlation metrics for time series data
 * @param metrics Domain metrics
 * @param mailboxInsights Mailbox insights
 * @returns Correlation metrics
 */
export function calculateCorrelationMetrics(
  metrics: EmailMetrics,
  mailboxInsights: { totalCapacity: number; totalVolume: number }
): {
  mailboxContribution: number;
  healthImpact: number;
  capacityUtilization: number;
} {
  return {
    mailboxContribution: metrics.sent > 0 ? metrics.sent / metrics.sent : 0, // Placeholder - would need domain totals
    healthImpact: calculateDomainHealthScore(metrics),
    capacityUtilization: calculateCapacityUtilization(mailboxInsights.totalVolume, mailboxInsights.totalCapacity),
  };
}
