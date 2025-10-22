"use client";
import { useAnalytics } from "@/context/AnalyticsContext";
import { getVisibleMetrics } from "../config/metrics";

function AnalyticChartsLegend() {
  const { filters } = useAnalytics();
  const visibleMetrics = getVisibleMetrics(filters.visibleMetrics);

  return (
    <div className="flex flex-wrap gap-4">
      {visibleMetrics.map((metric) => (
        <div key={metric.key} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: metric.color }}
          />
          <span
            className="text-sm text-muted-foreground"
            title={metric.tooltip}
          >
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default AnalyticChartsLegend;
