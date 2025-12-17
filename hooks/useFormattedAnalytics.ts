"use client";
import { useState, useCallback } from "react";
import { FormattedAnalyticsStats } from "@/types/analytics/ui";
import { PerformanceMetrics } from "@/types/analytics/core";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

/**
 * Hook for formatted analytics display.
 * Provides methods to format raw analytics data for UI display.
 */
export function useFormattedAnalytics() {
  // Formatted Analytics Stats for UI Display
  const [formattedStats, setFormattedStats] = useState<FormattedAnalyticsStats>(
    {
      totalSent: "0",
      openRate: "0.0%",
      clickRate: "0.0%",
      replyRate: "0.0%",
      bounceRate: "0.0%",
      deliveryRate: "0.0%",
    }
  );

  // Update formatted stats
  const updateFormattedStats = useCallback(
    (stats: Partial<FormattedAnalyticsStats>) => {
      setFormattedStats((prev) => ({ ...prev, ...stats }));
    },
    []
  );

  const formatMetricsForDisplay = useCallback(
    (metrics?: PerformanceMetrics | null) => {
      if (!metrics) return;

      // Defensive: ensure numeric fields exist to avoid runtime NaN
      const safeMetrics: PerformanceMetrics = {
        sent: metrics.sent ?? 0,
        delivered: metrics.delivered ?? 0,
        opened_tracked: metrics.opened_tracked ?? 0,
        clicked_tracked: metrics.clicked_tracked ?? 0,
        replied: metrics.replied ?? 0,
        bounced: metrics.bounced ?? 0,
        unsubscribed: metrics.unsubscribed ?? 0,
        spamComplaints: metrics.spamComplaints ?? 0,
      };

      const rates = AnalyticsCalculator.calculateAllRates(safeMetrics);

      updateFormattedStats({
        totalSent: AnalyticsCalculator.formatNumber(safeMetrics.sent),
        openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
        replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        bounceRate: AnalyticsCalculator.formatRateAsPercentage(
          rates.bounceRate
        ),
        deliveryRate: AnalyticsCalculator.formatRateAsPercentage(
          rates.deliveryRate
        ),
      });
    },
    [updateFormattedStats]
  );

  return {
    formattedStats,
    formatMetricsForDisplay,
    updateFormattedStats,
  };
}
