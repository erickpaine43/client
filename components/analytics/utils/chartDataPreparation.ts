import { TimeSeriesDataPoint } from "@/types/analytics/core";
import { ChartDataPoint, AnalyticsUIFilters } from "@/types/analytics/ui";
import { AnalyticsCalculator, PerformanceCalculator } from "@/lib/utils/analytics-calculator";

/**
 * Interface for UI filter data used in chart data preparation
 * @deprecated Use AnalyticsUIFilters from types/analytics/ui.ts instead
 */
interface UIFilters {
  dateRange: string;
  customDateRange?: {
    start?: string;
    end?: string;
  };
  selectedCampaigns: string[];
  [key: string]: unknown;
}

/**
 * Prepare chart data from time series data using standardized field names.
 * This utility ensures consistent data formatting across all chart components.
 */
export function prepareChartDataFromTimeSeries(
  timeSeriesData: TimeSeriesDataPoint[]
): ChartDataPoint[] {
  return timeSeriesData.map((point) => {
    const rates = PerformanceCalculator.calculateStandardizedRates(point.metrics);
    
    return {
      name: point.label,
      date: point.date,
      // Use standardized field names
      sent: point.metrics.sent,
      delivered: point.metrics.delivered,
      opened_tracked: point.metrics.opened_tracked,
      clicked_tracked: point.metrics.clicked_tracked,
      replied: point.metrics.replied,
      bounced: point.metrics.bounced,
      unsubscribed: point.metrics.unsubscribed,
      spamComplaints: point.metrics.spamComplaints,
      // Add calculated rates as percentages for display
      openRate: rates.openRate * 100,
      clickRate: rates.clickRate * 100,
      replyRate: rates.replyRate * 100,
      bounceRate: rates.bounceRate * 100,
      deliveryRate: rates.deliveryRate * 100,
      unsubscribeRate: rates.unsubscribeRate * 100,
      spamRate: rates.spamRate * 100,
    };
  });
}

/**
 * Convert UI filters to data filters for service calls.
 * Supports both legacy UIFilters and new AnalyticsUIFilters interfaces.
 */
export function convertUIFiltersToDataFilters(filters: UIFilters | AnalyticsUIFilters) {
  const getDaysFromRange = (dateRange: string) => {
    switch (dateRange) {
      case "7d": return 7;
      case "30d": return 30;
      case "90d": return 90;
      case "1y": return 365;
      default: return 30;
    }
  };

  return {
    dateRange: {
      start: filters.customDateRange?.start || 
        new Date(Date.now() - getDaysFromRange(filters.dateRange) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: filters.customDateRange?.end || new Date().toISOString().split("T")[0],
    },
    entityIds: filters.selectedCampaigns.length > 0 ? filters.selectedCampaigns : undefined,
  };
}

/**
 * Format tooltip values for charts using AnalyticsCalculator.
 */
export function formatTooltipValue(value: number, metricKey: string): [string, string] {
  const numValue = Number(value);
  
  // Format rates as percentages, counts as numbers
  if (metricKey.includes("Rate") || metricKey.includes("rate")) {
    return [
      AnalyticsCalculator.formatRateAsPercentage(numValue / 100),
      metricKey,
    ];
  }
  
  return [
    AnalyticsCalculator.formatNumber(numValue),
    metricKey,
  ];
}

/**
 * Create skeleton loading component props for charts.
 */
export function getSkeletonProps(height = "h-80") {
  return {
    className: `${height} flex items-center justify-center`,
    children: {
      className: "animate-pulse space-y-4 w-full",
      elements: [
        { className: "h-4 bg-gray-200 rounded w-3/4" },
        { className: "h-4 bg-gray-200 rounded w-1/2" },
        { className: "h-64 bg-gray-200 rounded" },
      ]
    }
  };
}

/**
 * Create error display props for charts.
 */
export function getErrorProps(error: string, height = "h-80") {
  return {
    className: `flex items-center justify-center ${height} text-red-500`,
    message: `Error loading chart data: ${error}`
  };
}

/**
 * Create empty state props for charts.
 */
export function getEmptyStateProps(message = "No data available", height = "h-80") {
  return {
    className: `flex items-center justify-center ${height} text-muted-foreground`,
    message
  };
}
