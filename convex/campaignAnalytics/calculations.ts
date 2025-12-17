import { AggregatedCampaignMetrics, CampaignAnalyticsRecord, AggregatedCampaignAnalytics, TimeSeriesData } from "./types";

/**
 * Calculate performance metrics for aggregated campaign data
 * @param metrics Raw metrics data
 * @returns Metrics with calculated rates
 */
export function calculatePerformanceMetrics(metrics: Partial<AggregatedCampaignMetrics>): AggregatedCampaignMetrics {
  const totalSent = metrics.sent || 0;
  const totalDelivered = metrics.delivered || 0;

  return {
    sent: metrics.sent || 0,
    delivered: metrics.delivered || 0,
    openedTracked: metrics.openedTracked || 0,
    clickedTracked: metrics.clickedTracked || 0,
    replied: metrics.replied || 0,
    bounced: metrics.bounced || 0,
    unsubscribed: metrics.unsubscribed || 0,
    spamComplaints: metrics.spamComplaints || 0,
    deliveryRate: totalSent > 0 ? (metrics.delivered || 0) / totalSent : 0,
    openRate: totalDelivered > 0 ? (metrics.openedTracked || 0) / totalDelivered : 0,
    clickRate: totalDelivered > 0 ? (metrics.clickedTracked || 0) / totalDelivered : 0,
    replyRate: totalDelivered > 0 ? (metrics.replied || 0) / totalDelivered : 0,
    bounceRate: totalSent > 0 ? (metrics.bounced || 0) / totalSent : 0,
    unsubscribeRate: totalDelivered > 0 ? (metrics.unsubscribed || 0) / totalDelivered : 0,
    complaintRate: totalSent > 0 ? (metrics.spamComplaints || 0) / totalSent : 0,
  };
}

/**
 * Aggregate campaign data from multiple records
 * @param records Array of campaign analytics records
 * @returns Aggregated campaign analytics
 */
export function aggregateCampaignData(records: CampaignAnalyticsRecord[]): AggregatedCampaignAnalytics[] {
  const campaignMap = new Map<string, AggregatedCampaignAnalytics>();

  records.forEach(record => {
    const existing = campaignMap.get(record.campaignId);

    if (existing) {
      // Aggregate metrics
      existing.aggregatedMetrics.sent += record.sent;
      existing.aggregatedMetrics.delivered += record.delivered;
      existing.aggregatedMetrics.openedTracked += record.openedTracked;
      existing.aggregatedMetrics.clickedTracked += record.clickedTracked;
      existing.aggregatedMetrics.replied += record.replied;
      existing.aggregatedMetrics.bounced += record.bounced;
      existing.aggregatedMetrics.unsubscribed += record.unsubscribed;
      existing.aggregatedMetrics.spamComplaints += record.spamComplaints;

      // Update timestamp to most recent
      if (record.updatedAt > existing.updatedAt) {
        existing.updatedAt = record.updatedAt;
      }
    } else {
      const metrics: AggregatedCampaignMetrics = {
        sent: record.sent,
        delivered: record.delivered,
        openedTracked: record.openedTracked,
        clickedTracked: record.clickedTracked,
        replied: record.replied,
        bounced: record.bounced,
        unsubscribed: record.unsubscribed,
        spamComplaints: record.spamComplaints,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
        complaintRate: 0,
      };
      campaignMap.set(record.campaignId, {
        campaignId: record.campaignId,
        campaignName: record.campaignName,
        status: record.status,
        leadCount: record.leadCount,
        activeLeads: record.activeLeads,
        completedLeads: record.completedLeads,
        updatedAt: record.updatedAt,
        aggregatedMetrics: metrics,
      });
    }
  });

  // Calculate rates for all aggregated data
  const aggregatedResults = Array.from(campaignMap.values());
  aggregatedResults.forEach(campaign => {
    campaign.aggregatedMetrics = calculatePerformanceMetrics(campaign.aggregatedMetrics);
  });

  return aggregatedResults;
}

/**
 * Calculate engagement scores based on multiple metrics
 * @param metrics Campaign metrics
 * @returns Engagement score (0-100)
 */
export function calculateEngagementScores(metrics: AggregatedCampaignMetrics): number {
  const openWeight = 0.4;
  const clickWeight = 0.4;
  const replyWeight = 0.2;

  const openScore = metrics.openRate * 100;
  const clickScore = metrics.clickRate * 100;
  const replyScore = metrics.replyRate * 100;

  return (openScore * openWeight) + (clickScore * clickWeight) + (replyScore * replyWeight);
}

/**
 * Compute comparisons between current and previous periods
 * @param current Current period metrics
 * @param previous Previous period metrics
 * @returns Comparison data with percentage changes
 */
export function computeComparisons(
  current: AggregatedCampaignMetrics,
  previous: AggregatedCampaignMetrics
): Record<keyof AggregatedCampaignMetrics, { current: number; previous: number; change: number; changePercent: number }> {
  const comparisons: Partial<Record<keyof AggregatedCampaignMetrics, { current: number; previous: number; change: number; changePercent: number }>> = {};

  const keys: (keyof AggregatedCampaignMetrics)[] = [
    'sent', 'delivered', 'openedTracked', 'clickedTracked', 'replied',
    'bounced', 'unsubscribed', 'spamComplaints', 'deliveryRate', 'openRate',
    'clickRate', 'replyRate', 'bounceRate', 'unsubscribeRate', 'complaintRate'
  ];

  keys.forEach(key => {
    const currentValue = current[key] || 0;
    const previousValue = previous[key] || 0;
    const change = currentValue - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;

    comparisons[key] = {
      current: currentValue,
      previous: previousValue,
      change,
      changePercent
    };
  });

  return comparisons as Record<keyof AggregatedCampaignMetrics, { current: number; previous: number; change: number; changePercent: number }>;
}

/**
 * Group records by time period for time series analysis
 * @param records Analytics records
 * @param granularity Time granularity ('day', 'week', 'month')
 * @returns Time series data map
 */
export function groupByTimePeriod(records: CampaignAnalyticsRecord[], granularity: 'day' | 'week' | 'month'): Map<string, TimeSeriesData> {
  const timeSeriesMap = new Map<string, TimeSeriesData>();

  records.forEach(record => {
    const timeKey = getTimeKey(record.date, granularity);
    const existing = timeSeriesMap.get(timeKey);

    const recordMetrics = {
      sent: record.sent || 0,
      delivered: record.delivered || 0,
      openedTracked: record.openedTracked || 0,
      clickedTracked: record.clickedTracked || 0,
      replied: record.replied || 0,
      bounced: record.bounced || 0,
      unsubscribed: record.unsubscribed || 0,
      spamComplaints: record.spamComplaints || 0,
    };

    if (existing) {
      // Aggregate existing metrics
      existing.metrics.sent += recordMetrics.sent;
      existing.metrics.delivered += recordMetrics.delivered;
      existing.metrics.openedTracked += recordMetrics.openedTracked;
      existing.metrics.clickedTracked += recordMetrics.clickedTracked;
      existing.metrics.replied += recordMetrics.replied;
      existing.metrics.bounced += recordMetrics.bounced;
      existing.metrics.unsubscribed += recordMetrics.unsubscribed;
      existing.metrics.spamComplaints += recordMetrics.spamComplaints;
    } else {
      // Create new time series entry
      timeSeriesMap.set(timeKey, {
        timeKey,
        timeLabel: formatTimeLabel(timeKey, granularity),
        metrics: {
          ...recordMetrics,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          replyRate: 0,
          bounceRate: 0,
          unsubscribeRate: 0,
          complaintRate: 0,
        }
      });
    }
  });

  // Calculate rates for each time period
  timeSeriesMap.forEach(entry => {
    const metrics = entry.metrics;
    const totalSent = metrics.sent || 0;
    const totalDelivered = metrics.delivered || 0;

    entry.metrics.deliveryRate = totalSent > 0 ? metrics.delivered / totalSent : 0;
    entry.metrics.openRate = totalDelivered > 0 ? metrics.openedTracked / totalDelivered : 0;
    entry.metrics.clickRate = totalDelivered > 0 ? metrics.clickedTracked / totalDelivered : 0;
    entry.metrics.replyRate = totalDelivered > 0 ? metrics.replied / totalDelivered : 0;
    entry.metrics.bounceRate = totalSent > 0 ? metrics.bounced / totalSent : 0;
    entry.metrics.unsubscribeRate = totalDelivered > 0 ? metrics.unsubscribed / totalDelivered : 0;
    entry.metrics.complaintRate = totalSent > 0 ? metrics.spamComplaints / totalSent : 0;
  });

  return timeSeriesMap;
}

/**
 * Get time key for grouping records
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
