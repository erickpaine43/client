"use client";
import {
  generateTimeSeriesData,
  generateWarmupChartData,
  getDaysFromRange,
  metrics,
  warmupMetrics,
  campaignData,
  campaigns,
} from "@/lib/data/analytics.mock";
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  AnalyticsContextState,
  AnalyticsFilterState,
  DataGranularity,
  DateRangePreset,
  WarmupMetric,
} from "@/types";

// Helper function to get allowed granularities based on date range
const getAllowedGranularities = (days: number): DataGranularity[] => {
  if (days <= 14) {
    // For 14 days or less, allow daily and weekly
    return ["day", "week"];
  } else if (days <= 60) {
    // For 60 days or less, allow weekly and monthly (daily gets too crowded)
    return ["week", "month"];
  } else {
    // For more than 60 days (like 90 days, 1 year), only allow weekly and monthly
    return ["week", "month"];
  }
};

const AnalyticsContext = createContext<AnalyticsContextState | undefined>(
  undefined,
);

function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRangePreset>("30d");
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [granularity, setGranularity] = useState<DataGranularity>("day");
  const [selectedCampaigns, setSelectedCampaigns] = useState(["all"]);
  const [selectedMailboxes, setSelectedMailboxes] = useState(["all"]);
  const [visibleMetrics, setVisibleMetrics] = useState(
    metrics.reduce(
      (acc, metric) => ({ ...acc, [metric.key]: metric.visible }),
      {},
    ),
  );
  const [visibleWarmupMetrics, setVisibleWarmupMetrics] = useState(
    warmupMetrics.reduce(
      (acc, metric) => ({ ...acc, [metric.key]: metric.visible }),
      {},
    ),
  );

  // Calculate days based on date range
  const days = useMemo(() => {
    if (showCustomDate && customDateStart && customDateEnd) {
      const start = new Date(customDateStart);
      const end = new Date(customDateEnd);
      return Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
    }
    return getDaysFromRange(dateRange);
  }, [dateRange, showCustomDate, customDateStart, customDateEnd]);

  // Get allowed granularities based on date range
  const allowedGranularities = useMemo(() => {
    return getAllowedGranularities(days);
  }, [days]);

  // Auto-adjust granularity if current selection is not allowed
  useEffect(() => {
    if (!allowedGranularities.includes(granularity)) {
      // Set to the first allowed granularity
      setGranularity(allowedGranularities[0]);
    }
  }, [allowedGranularities, granularity, setGranularity]);

  // Generate chart data when dependencies change
  const chartData = useMemo(() => {
    return generateTimeSeriesData(days, granularity);
  }, [days, granularity]);

  // Generate warmup chart data when dependencies change
  const warmupChartData = useMemo(() => {
    return generateWarmupChartData(days, granularity);
  }, [days, granularity]);

  // Create filters object
  const filters: AnalyticsFilterState = useMemo(() => ({
    visibleMetrics,
    setVisibleMetrics,
    showCustomDate,
    setShowCustomDate,
    dateRange,
    setDateRange,
    granularity,
    setGranularity,
    allowedGranularities,
    customDateStart,
    setCustomDateStart,
    customDateEnd,
    setCustomDateEnd,
    selectedCampaigns,
    setSelectedCampaigns,
    selectedMailboxes,
    setSelectedMailboxes,
  }), [
    visibleMetrics,
    setVisibleMetrics,
    showCustomDate,
    setShowCustomDate,
    dateRange,
    setDateRange,
    granularity,
    setGranularity,
    allowedGranularities,
    customDateStart,
    setCustomDateStart,
    customDateEnd,
    setCustomDateEnd,
    selectedCampaigns,
    setSelectedCampaigns,
    selectedMailboxes,
    setSelectedMailboxes,
  ]);


  // Calculate summary metrics from chart data
  const { totalSent, openRate, clickRate, replyRate } = useMemo(() => {
    const sent = chartData.reduce((sum, d) => sum + d.sent, 0);
    const opens = chartData.reduce((sum, d) => sum + d.opens, 0);
    const clicks = chartData.reduce((sum, d) => sum + d.clicks, 0);
    const replies = chartData.reduce((sum, d) => sum + d.replies, 0);

    return {
      totalSent: sent,
      openRate: sent > 0 ? ((opens / sent) * 100).toFixed(1) : "0",
      clickRate: sent > 0 ? ((clicks / sent) * 100).toFixed(1) : "0",
      replyRate: sent > 0 ? ((replies / sent) * 100).toFixed(1) : "0",
    };
  }, [chartData]);

  return (
    <AnalyticsContext.Provider
      value={{
        totalSent,
        openRate,
        replyRate,
        clickRate,
        chartData,
        metrics,
        visibleMetrics,
        setVisibleMetrics,
        showCustomDate,
        setShowCustomDate,
        dateRange,
        setDateRange,
        granularity,
        setGranularity,
        allowedGranularities,
        customDateStart,
        setCustomDateStart,
        customDateEnd,
        setCustomDateEnd,
        selectedCampaigns,
        setSelectedCampaigns,
        selectedMailboxes,
        setSelectedMailboxes,
        filters,
        campaignPerformanceData: campaignData,
        campaigns,
        warmupMetrics: warmupMetrics as WarmupMetric[],
        visibleWarmupMetrics,
        setVisibleWarmupMetrics,
        warmupChartData,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}

export { AnalyticsProvider, useAnalytics };
