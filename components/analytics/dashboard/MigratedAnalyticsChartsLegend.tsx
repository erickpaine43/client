"use client";

import { useAnalytics } from "@/context/AnalyticsContext";

/**
 * Migrated Analytics Charts Legend using standardized field names.
 * Shows legend for opened_tracked, clicked_tracked instead of opens, clicks.
 */
function MigratedAnalyticsChartsLegend() {
  const { filters } = useAnalytics();
  const { visibleMetrics } = filters;

  // Standardized metrics configuration using new field names
  const standardizedMetrics = [
    {
      key: "sent",
      label: "Emails Sent",
      color: "#3B82F6",
    },
    {
      key: "delivered",
      label: "Delivered",
      color: "#06B6D4",
    },
    {
      key: "opened_tracked",
      label: "Opens (Tracked)",
      color: "#8B5CF6",
    },
    {
      key: "clicked_tracked",
      label: "Clicks (Tracked)",
      color: "#F59E0B",
    },
    {
      key: "replied",
      label: "Replies",
      color: "#10B981",
    },
    {
      key: "bounced",
      label: "Bounced",
      color: "#EF4444",
    },
    {
      key: "unsubscribed",
      label: "Unsubscribed",
      color: "#F97316",
    },
    {
      key: "spamComplaints",
      label: "Spam Complaints",
      color: "#DC2626",
    },
  ];

  // Filter to show only visible metrics
  const visibleLegendItems = standardizedMetrics.filter((metric) =>
    visibleMetrics.includes(metric.key)
  );

  if (visibleLegendItems.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No metrics selected for display
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {visibleLegendItems.map((metric) => (
        <div key={metric.key} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: metric.color }}
          />
          <span className="text-sm text-gray-700">{metric.label}</span>
        </div>
      ))}
    </div>
  );
}

export default MigratedAnalyticsChartsLegend;
