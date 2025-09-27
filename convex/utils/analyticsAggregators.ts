/**
 * Analytics aggregation utilities
 * Extracted from large query functions to reduce complexity and improve reusability
 */

/**
 * Aggregate mailbox data by domain
 */
export function aggregateMailboxMetrics<T extends { domain: string }>(mailboxData: T[]): Record<string, T[]> {
  return mailboxData.reduce((groups, mailbox) => {
    if (!groups[mailbox.domain]) {
      groups[mailbox.domain] = [];
    }
    groups[mailbox.domain].push(mailbox);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Aggregate domain data by domain ID
 */
export function aggregateDomainMetrics<T extends { domainId: string }>(domainData: T[]): Record<string, T[]> {
  return domainData.reduce((groups, domain) => {
    if (!groups[domain.domainId]) {
      groups[domain.domainId] = [];
    }
    groups[domain.domainId].push(domain);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Aggregate mailbox data by time period
 */
export function aggregateByTimePeriod<T extends { date: string }>(
  data: T[],
  granularity: 'day' | 'week' | 'month' = 'day'
): Record<string, T[]> {
  return data.reduce((groups, record) => {
    const timeKey = formatDateForGranularity(record.date, granularity);
    if (!groups[timeKey]) {
      groups[timeKey] = [];
    }
    groups[timeKey].push(record);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Aggregate data by multiple dimensions (domain + time)
 */
export function aggregateByDomainAndTime<T extends { domain: string; date: string }>(
  data: T[],
  granularity: 'day' | 'week' | 'month' = 'day'
): Record<string, T[]> {
  return data.reduce((groups, record) => {
    const timeKey = formatDateForGranularity(record.date, granularity);
    const compositeKey = `${record.domain}:${timeKey}`;
    if (!groups[compositeKey]) {
      groups[compositeKey] = [];
    }
    groups[compositeKey].push(record);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate statistical aggregations for numeric fields
 */
export function calculateStatistics(values: number[]): {
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
  stdDev: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, count: 0, stdDev: 0 };
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    min,
    max,
    avg,
    sum,
    count: values.length,
    stdDev,
  };
}

/**
 * Aggregate performance rates across multiple records
 */

interface PerformanceRecord {
  sent?: number;
  delivered?: number;
  opened_tracked?: number;
  clicked_tracked?: number;
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  spamComplaints?: number;
}

type Totals = {
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
};

export function aggregatePerformanceRates(records: PerformanceRecord[]): {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  spamRate: number;
} {
  if (records.length === 0) {
    return {
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
      spamRate: 0,
    };
  }

  // Sum up all metrics
  const totals: Totals = records.reduce((acc: Totals, record: PerformanceRecord) => ({
    sent: acc.sent + (record.sent ?? 0),
    delivered: acc.delivered + (record.delivered ?? 0),
    opened_tracked: acc.opened_tracked + (record.opened_tracked ?? 0),
    clicked_tracked: acc.clicked_tracked + (record.clicked_tracked ?? 0),
    replied: acc.replied + (record.replied ?? 0),
    bounced: acc.bounced + (record.bounced ?? 0),
    unsubscribed: acc.unsubscribed + (record.unsubscribed ?? 0),
    spamComplaints: acc.spamComplaints + (record.spamComplaints ?? 0),
  }), {
    sent: 0,
    delivered: 0,
    opened_tracked: 0,
    clicked_tracked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
    spamComplaints: 0,
  });

  // Calculate rates
  return {
    deliveryRate: totals.sent > 0 ? totals.delivered / totals.sent : 0,
    openRate: totals.delivered > 0 ? totals.opened_tracked / totals.delivered : 0,
    clickRate: totals.delivered > 0 ? totals.clicked_tracked / totals.delivered : 0,
    replyRate: totals.delivered > 0 ? totals.replied / totals.delivered : 0,
    bounceRate: totals.sent > 0 ? totals.bounced / totals.sent : 0,
    unsubscribeRate: totals.delivered > 0 ? totals.unsubscribed / totals.delivered : 0,
    spamRate: totals.delivered > 0 ? totals.spamComplaints / totals.delivered : 0,
  };
}

/**
 * Group records by provider for provider-level analysis
 */
export function aggregateByProvider<T extends { provider?: string }>(records: T[]): Record<string, T[]> {
  return records.reduce((groups, record) => {
    const provider = record.provider || 'unknown';
    if (!groups[provider]) {
      groups[provider] = [];
    }
    groups[provider].push(record);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate percentiles for a set of values
 */
export function calculatePercentiles(values: number[], percentiles: number[] = [25, 50, 75, 90, 95]): Record<number, number> {
  if (values.length === 0) {
    return percentiles.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
  }

  const sorted = [...values].sort((a, b) => a - b);
  const result: Record<number, number> = {};

  percentiles.forEach(percentile => {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    result[percentile] = sorted[Math.max(0, index)];
  });

  return result;
}

/**
 * Format date based on granularity for grouping
 */
function formatDateForGranularity(date: string, granularity: 'day' | 'week' | 'month'): string {
  const dateObj = new Date(date);
  
  switch (granularity) {
    case 'day':
      return date; // Assume date is already in YYYY-MM-DD format
    case 'week':
      // Get the Monday of the week
      const monday = new Date(dateObj);
      monday.setDate(dateObj.getDate() - dateObj.getDay() + 1);
      return monday.toISOString().split('T')[0];
    case 'month':
      return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    default:
      return date;
  }
}

/**
 * Calculate correlation coefficient between two arrays of values
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate moving averages for time series data
 */
export function calculateMovingAverage(values: number[], windowSize: number): number[] {
  if (values.length < windowSize) {
    return values;
  }

  const result: number[] = [];
  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
    result.push(average);
  }

  return result;
}

/**
 * Detect outliers using the IQR method
 */
export function detectOutliers(values: number[]): {
  outliers: number[];
  lowerBound: number;
  upperBound: number;
  q1: number;
  q3: number;
} {
  if (values.length === 0) {
    return { outliers: [], lowerBound: 0, upperBound: 0, q1: 0, q3: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outliers = values.filter(value => value < lowerBound || value > upperBound);

  return {
    outliers,
    lowerBound,
    upperBound,
    q1,
    q3,
  };
}
