"use client";

import { useMemo } from "react";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { KPIDisplayConfig } from "@/types/analytics/ui";
import {
  CampaignAnalytics,
  DomainAnalytics,
} from "@/types/analytics/domain-specific";
import MigratedAnalyticsStatistics from "./MigratedAnalyticsStatistics";
import { AnalyticsOverviewSkeleton } from "@/components/analytics/components/SkeletonLoaders";

interface MigratedAnalyticsOverviewProps {
  campaignAnalytics?: CampaignAnalytics[];
  domainAnalytics?: DomainAnalytics[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Migrated Analytics Overview with standardized field names and real-time KPIs.
 * Uses AnalyticsCalculator for all rate calculations instead of stored rates.
 */
function MigratedAnalyticsOverview({
  campaignAnalytics = [],
  loading = false,
  error = null,
}: MigratedAnalyticsOverviewProps) {
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

  // Calculate all rates using AnalyticsCalculator
  const calculatedRates = useMemo(() => {
    return AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
  }, [aggregatedMetrics]);

  // Create KPI display configurations using standardized data
  const kpiConfigs: KPIDisplayConfig[] = useMemo(
    () => [
      {
        id: "total-sent",
        name: "Total Sent",
        displayValue: AnalyticsCalculator.formatNumber(aggregatedMetrics.sent),
        rawValue: aggregatedMetrics.sent,
        unit: "#",
        color: "neutral",
      },
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
      },
      {
        id: "delivery-rate",
        name: "Delivery Rate",
        displayValue: AnalyticsCalculator.formatRateAsPercentage(
          calculatedRates.deliveryRate
        ),
        rawValue: calculatedRates.deliveryRate,
        unit: "%",
        color:
          calculatedRates.deliveryRate >= 0.95
            ? "positive"
            : calculatedRates.deliveryRate >= 0.9
              ? "warning"
              : "danger",
        target: 0.95, // 95% industry benchmark
      },
    ],
    [aggregatedMetrics, calculatedRates]
  );

  // Show loading state
  if (loading) {
    return <AnalyticsOverviewSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Error loading analytics: {error}
      </div>
    );
  }

  // Show empty state
  if (campaignAnalytics.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Campaign Data
        </h3>
        <p className="text-gray-600">Start a campaign to see analytics data.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-responsive gap-4">
      <MigratedAnalyticsStatistics kpiConfigs={kpiConfigs} />
    </div>
  );
}

export default MigratedAnalyticsOverview;
