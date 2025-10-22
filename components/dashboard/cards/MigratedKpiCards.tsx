"use client";

import { useMemo } from "react";
import {
  Eye,
  Mail,
  MousePointer,
  Reply,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { KPIDisplayConfig } from "@/types/analytics/ui";
import { CampaignAnalytics } from "@/types/analytics/domain-specific";
import MigratedStatsCard from "@/components/analytics/dashboard/MigratedStatsCard";
import { KPISummaryCardSkeleton } from "@/components/analytics/components/SkeletonLoaders";

interface MigratedKpiCardsProps {
  campaignAnalytics?: CampaignAnalytics[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Migrated KPI Cards component that replaces conflicting dashboard KPIs.
 * Uses AnalyticsCalculator for all rate calculations instead of stored rates.
 * Implements standardized field names (opened_tracked, clicked_tracked, etc.).
 */
function MigratedKpiCards({
  campaignAnalytics = [],
  loading = false,
  error = null,
}: MigratedKpiCardsProps) {
  // Calculate aggregated metrics using standardized field names
  const aggregatedMetrics = useMemo(() => {
    if (campaignAnalytics.length === 0) {
      return {
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
      };
    }

    return AnalyticsCalculator.aggregateMetrics(campaignAnalytics);
  }, [campaignAnalytics]);

  // Calculate all rates using AnalyticsCalculator (no stored rates)
  const calculatedRates = useMemo(() => {
    return AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
  }, [aggregatedMetrics]);

  // Calculate health score and performance benchmarks
  const healthScore = useMemo(() => {
    return AnalyticsCalculator.calculateHealthScore(aggregatedMetrics);
  }, [aggregatedMetrics]);

  // Create KPI display configurations using standardized data
  const kpiConfigs: KPIDisplayConfig[] = useMemo(() => {
    // Calculate trends (simplified - in real implementation, compare with previous period)
    const getTrend = (
      rate: number,
      benchmark: number
    ): "up" | "down" | "stable" => {
      if (rate > benchmark * 1.1) return "up";
      if (rate < benchmark * 0.9) return "down";
      return "stable";
    };

    const getChangeType = (
      trend: "up" | "down" | "stable"
    ): "increase" | "decrease" | "stable" => {
      return trend === "up"
        ? "increase"
        : trend === "down"
          ? "decrease"
          : "stable";
    };

    return [
      {
        id: "open-rate",
        name: "Open Rate",
        displayValue: AnalyticsCalculator.formatRateAsPercentage(
          calculatedRates.openRate
        ),
        rawValue: calculatedRates.openRate,
        unit: "%",
        color:
          calculatedRates.openRate >= 0.25
            ? "positive"
            : calculatedRates.openRate >= 0.15
              ? "warning"
              : "danger",
        target: 0.25, // 25% industry benchmark
        trend: getTrend(calculatedRates.openRate, 0.25),
        changeType: getChangeType(getTrend(calculatedRates.openRate, 0.25)),
        change: "vs last period", // Simplified - would calculate actual change
      },
      {
        id: "click-rate",
        name: "Click Rate",
        displayValue: AnalyticsCalculator.formatRateAsPercentage(
          calculatedRates.clickRate
        ),
        rawValue: calculatedRates.clickRate,
        unit: "%",
        color:
          calculatedRates.clickRate >= 0.03
            ? "positive"
            : calculatedRates.clickRate >= 0.02
              ? "warning"
              : "danger",
        target: 0.03, // 3% industry benchmark
        trend: getTrend(calculatedRates.clickRate, 0.03),
        changeType: getChangeType(getTrend(calculatedRates.clickRate, 0.03)),
        change: "vs last period",
      },
      {
        id: "reply-rate",
        name: "Reply Rate",
        displayValue: AnalyticsCalculator.formatRateAsPercentage(
          calculatedRates.replyRate
        ),
        rawValue: calculatedRates.replyRate,
        unit: "%",
        color:
          calculatedRates.replyRate >= 0.1
            ? "positive"
            : calculatedRates.replyRate >= 0.05
              ? "warning"
              : "danger",
        target: 0.1, // 10% industry benchmark
        trend: getTrend(calculatedRates.replyRate, 0.1),
        changeType: getChangeType(getTrend(calculatedRates.replyRate, 0.1)),
        change: "vs last period",
      },
      {
        id: "health-score",
        name: "Health Score",
        displayValue: `${healthScore}`,
        rawValue: healthScore,
        unit: "/100",
        color:
          healthScore >= 80
            ? "positive"
            : healthScore >= 60
              ? "warning"
              : "danger",
        target: 80, // 80/100 target score
        trend: healthScore >= 80 ? "up" : healthScore >= 60 ? "stable" : "down",
        changeType:
          healthScore >= 80
            ? "increase"
            : healthScore >= 60
              ? "stable"
              : "decrease",
        change: "overall performance",
      },
    ];
  }, [calculatedRates, healthScore]);

  // Icon mapping for different KPI types
  const getIconForKPI = (id: string) => {
    switch (id) {
      case "open-rate":
        return Eye;
      case "click-rate":
        return MousePointer;
      case "reply-rate":
        return Reply;
      case "health-score":
        return TrendingUp;
      default:
        return Mail;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <KPISummaryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full">
          <div className="flex items-center space-x-2 text-red-500 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <span>Error loading KPI data: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (campaignAnalytics.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full">
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Campaign Data
            </h3>
            <p className="text-gray-600">
              Start a campaign to see KPI metrics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {kpiConfigs.map((kpi) => (
        <MigratedStatsCard
          key={kpi.id}
          title={kpi.name}
          value={kpi.displayValue}
          icon={getIconForKPI(kpi.id)}
          color={getColorForKPI(kpi.color)}
          target={kpi.target}
          rawValue={kpi.rawValue}
          unit={kpi.unit}
          trend={kpi.trend}
          change={kpi.change}
          changeType={kpi.changeType}
        />
      ))}
    </div>
  );
}

// Color mapping helper function
function getColorForKPI(color?: KPIDisplayConfig["color"]) {
  switch (color) {
    case "positive":
      return "bg-green-100 text-green-600";
    case "warning":
      return "bg-yellow-100 text-yellow-600";
    case "danger":
      return "bg-red-100 text-red-600";
    case "neutral":
    default:
      return "bg-blue-100 text-blue-600";
  }
}

export default MigratedKpiCards;
