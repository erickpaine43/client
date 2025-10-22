import { AnalyticsMetricConfig } from "@/types/analytics/ui";

/**
 * Standardized metrics configuration using new field names.
 * This configuration is shared across all chart components to ensure consistency.
 */
export const ANALYTICS_METRICS_CONFIG: AnalyticsMetricConfig[] = [
  {
    key: "sent",
    label: "Sent",
    color: "#3b82f6",
    icon: () => null,
    visible: true,
    tooltip: "Total emails sent",
  },
  {
    key: "opened_tracked",
    label: "Opens",
    color: "#10b981",
    icon: () => null,
    visible: true,
    tooltip: "Total opens tracked via tracking pixel",
  },
  {
    key: "clicked_tracked",
    label: "Clicks",
    color: "#f59e0b",
    icon: () => null,
    visible: true,
    tooltip: "Total clicks tracked via tracking links",
  },
  {
    key: "replied",
    label: "Replies",
    color: "#8b5cf6",
    icon: () => null,
    visible: true,
    tooltip: "Total replies received",
  },
  {
    key: "bounced",
    label: "Bounced",
    color: "#ef4444",
    icon: () => null,
    visible: false,
    tooltip: "Total bounced emails",
  },
  {
    key: "unsubscribed",
    label: "Unsubscribed",
    color: "#f97316",
    icon: () => null,
    visible: false,
    tooltip: "Total unsubscribed recipients",
  },
];

/**
 * Get metrics configuration filtered by visibility.
 */
export function getVisibleMetrics(visibleMetricKeys: string[]): AnalyticsMetricConfig[] {
  return ANALYTICS_METRICS_CONFIG.filter((metric) => 
    visibleMetricKeys.includes(metric.key)
  );
}

/**
 * Get chart configuration for recharts components.
 */
export function getChartConfig(visibleMetricKeys: string[]): Record<string, { label: string; color: string }> {
  return getVisibleMetrics(visibleMetricKeys).reduce(
    (config, metric) => {
      config[metric.key] = {
        label: metric.label,
        color: metric.color,
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>,
  );
}
