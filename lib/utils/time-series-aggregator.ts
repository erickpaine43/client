import { TimeSeriesDataPoint, DataGranularity } from "../../types/analytics/core";

/**
 * Time series data aggregation and analysis utilities.
 */
export class TimeSeriesAggregator {
  /**
   * Aggregate time series data by granularity (day, week, month).
   * @param timeSeriesData - Array of time series data points
   * @param granularity - Granularity to aggregate by
   * @returns Aggregated time series data
   */
  static aggregateByGranularity(
    timeSeriesData: TimeSeriesDataPoint[],
    granularity: DataGranularity
  ): TimeSeriesDataPoint[] {
    if (!timeSeriesData || timeSeriesData.length === 0) {
      return [];
    }

    const aggregated = new Map<string, TimeSeriesDataPoint>();

    timeSeriesData.forEach(point => {
      const key = this.getGranularityKey(point.date, granularity);
      
      if (aggregated.has(key)) {
        const existing = aggregated.get(key)!;
        aggregated.set(key, {
          date: key,
          label: key,
          metrics: {
            sent: existing.metrics.sent + point.metrics.sent,
            delivered: existing.metrics.delivered + point.metrics.delivered,
            opened_tracked: existing.metrics.opened_tracked + point.metrics.opened_tracked,
            clicked_tracked: existing.metrics.clicked_tracked + point.metrics.clicked_tracked,
            replied: existing.metrics.replied + point.metrics.replied,
            bounced: existing.metrics.bounced + point.metrics.bounced,
            unsubscribed: existing.metrics.unsubscribed + point.metrics.unsubscribed,
            spamComplaints: existing.metrics.spamComplaints + point.metrics.spamComplaints,
          }
        });
      } else {
        aggregated.set(key, {
          date: key,
          label: key,
          metrics: { ...point.metrics }
        });
      }
    });

    return Array.from(aggregated.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Fill missing time periods with zero data.
   * @param timeSeriesData - Existing time series data
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @param granularity - Time granularity
   * @returns Time series data with filled missing periods
   */
  static fillMissingPeriods(
    timeSeriesData: TimeSeriesDataPoint[],
    startDate: string,
    endDate: string,
    granularity: DataGranularity
  ): TimeSeriesDataPoint[] {
    const existingData = new Map(
      timeSeriesData.map(point => [point.date, point])
    );

    const filledData: TimeSeriesDataPoint[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    
    while (current <= end) {
      const key = this.getGranularityKey(current.toISOString(), granularity);
      
      if (existingData.has(key)) {
        filledData.push(existingData.get(key)!);
      } else {
        filledData.push({
          date: key,
          label: key,
          metrics: {
            sent: 0,
            delivered: 0,
            opened_tracked: 0,
            clicked_tracked: 0,
            replied: 0,
            bounced: 0,
            unsubscribed: 0,
            spamComplaints: 0,
          }
        });
      }

      // Increment current date based on granularity
      switch (granularity) {
        case "day":
          current.setDate(current.getDate() + 1);
          break;
        case "week":
          current.setDate(current.getDate() + 7);
          break;
        case "month":
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    return filledData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Calculate moving average for a specific metric.
   * @param timeSeriesData - Time series data
   * @param windowSize - Number of periods for moving average
   * @param metricKey - Metric to calculate moving average for
   * @returns Time series data with moving average values
   */
  static calculateMovingAverage(
    timeSeriesData: TimeSeriesDataPoint[],
    windowSize: number,
    metricKey: keyof TimeSeriesDataPoint["metrics"]
  ): Array<{ date: string; value: number; movingAverage: number }> {
    if (windowSize <= 0 || timeSeriesData.length === 0) {
      return [];
    }

    const result: Array<{ date: string; value: number; movingAverage: number }> = [];
    
    for (let i = 0; i < timeSeriesData.length; i++) {
      const point = timeSeriesData[i];
      const value = point.metrics[metricKey];
      
      // Calculate moving average
      let sum = 0;
      let count = 0;
      
      for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
        sum += timeSeriesData[j].metrics[metricKey];
        count++;
      }
      
      const movingAverage = count > 0 ? sum / count : 0;
      
      result.push({
        date: point.date,
        value,
        movingAverage
      });
    }

    return result;
  }

  /**
   * Calculate growth rates between periods.
   * @param timeSeriesData - Time series data
   * @param metricKey - Metric to calculate growth for
   * @returns Time series data with growth rates
   */
  static calculateGrowthRates(
    timeSeriesData: TimeSeriesDataPoint[],
    metricKey: keyof TimeSeriesDataPoint["metrics"]
  ): Array<{ date: string; value: number; growthRate: number }> {
    if (timeSeriesData.length < 2) {
      return timeSeriesData.map(point => ({
        date: point.date,
        value: point.metrics[metricKey],
        growthRate: 0
      }));
    }

    const result: Array<{ date: string; value: number; growthRate: number }> = [];
    
    for (let i = 0; i < timeSeriesData.length; i++) {
      const current = timeSeriesData[i];
      const currentValue = current.metrics[metricKey];
      
      let growthRate = 0;
      
      if (i > 0) {
        const previous = timeSeriesData[i - 1];
        const previousValue = previous.metrics[metricKey];
        
        if (previousValue > 0) {
          growthRate = (currentValue - previousValue) / previousValue;
        }
      }
      
      result.push({
        date: current.date,
        value: currentValue,
        growthRate
      });
    }

    return result;
  }

  /**
   * Get granularity key for a date.
   * @param dateString - ISO date string
   * @param granularity - Time granularity
   * @returns Granularity key
   */
  private static getGranularityKey(dateString: string, granularity: DataGranularity): string {
    const date = new Date(dateString);
    
    switch (granularity) {
      case "day":
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      case "week":
        // Get Monday of the week
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        return monday.toISOString().split('T')[0];
      case "month":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Calculate period-over-period comparison.
   * @param currentPeriod - Current period data
   * @param previousPeriod - Previous period data
   * @returns Comparison metrics
   */
  static calculatePeriodComparison(
    currentPeriod: TimeSeriesDataPoint[],
    previousPeriod: TimeSeriesDataPoint[]
  ): {
    current: { [key: string]: number };
    previous: { [key: string]: number };
    changes: { [key: string]: number };
    percentageChanges: { [key: string]: number };
  } {
    const currentTotals = this.aggregatePeriodTotals(currentPeriod);
    const previousTotals = this.aggregatePeriodTotals(previousPeriod);
    
    const changes: { [key: string]: number } = {};
    const percentageChanges: { [key: string]: number } = {};
    
    Object.keys(currentTotals).forEach(key => {
      const currentValue = currentTotals[key];
      const previousValue = previousTotals[key] || 0;
      
      changes[key] = currentValue - previousValue;
      percentageChanges[key] = previousValue > 0 ? (changes[key] / previousValue) * 100 : 0;
    });

    return {
      current: currentTotals,
      previous: previousTotals,
      changes,
      percentageChanges
    };
  }

  /**
   * Aggregate totals for a period.
   * @param periodData - Time series data for a period
   * @returns Aggregated totals
   */
  private static aggregatePeriodTotals(periodData: TimeSeriesDataPoint[]): { [key: string]: number } {
    const totals = {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    };

    periodData.forEach(point => {
      Object.keys(totals).forEach(key => {
        totals[key as keyof typeof totals] += point.metrics[key as keyof typeof point.metrics];
      });
    });

    return totals;
  }
}
