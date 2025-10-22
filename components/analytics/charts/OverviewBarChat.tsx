"use client";
import { useAnalytics, useDomainAnalytics } from "@/context/AnalyticsContext";
import { ChartDataPoint } from "@/types/analytics/ui";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { getVisibleMetrics } from "../config/metrics";
import {
  prepareChartDataFromTimeSeries,
  convertUIFiltersToDataFilters,
  formatTooltipValue,
} from "../utils/chartDataPreparation";
import {
  ChartSkeleton,
  ChartError,
  ChartEmptyState,
} from "../components/ChartStates";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import type { CampaignAnalyticsService } from "@/lib/services/analytics/CampaignAnalyticsService";

function OverviewBarChat() {
  const { filters, loadingState } = useAnalytics();
  const { service: campaignService } = useDomainAnalytics("campaigns");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Fetch data when filters change
  useEffect(() => {
    async function fetchChartData() {
      if (!campaignService) return;

      try {
        // Convert UI filters to data filters using utility
        const dataFilters = convertUIFiltersToDataFilters(filters);

        // Type guard to ensure we have the correct service type
        const typedCampaignService =
          campaignService as CampaignAnalyticsService;

        // Check if the service has the getTimeSeriesData method
        if (typeof typedCampaignService.getTimeSeriesData !== "function") {
          console.warn(
            "Campaign service does not have getTimeSeriesData method"
          );
          setChartData([]);
          return;
        }

        // Fetch time series data using the service
        const timeSeriesData = await typedCampaignService.getTimeSeriesData(
          filters.selectedCampaigns.length > 0 ? filters.selectedCampaigns : [],
          dataFilters,
          filters.granularity
        );

        // Prepare chart data using utility
        const formattedData = prepareChartDataFromTimeSeries(timeSeriesData);
        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        setChartData([]);
      }
    }

    fetchChartData();
  }, [filters, campaignService]);

  // Progressive loading with skeleton
  if (loadingState.domains.campaigns) {
    return <ChartSkeleton height="h-96" />;
  }

  // Error handling
  if (loadingState.errors.campaigns) {
    return <ChartError error={loadingState.errors.campaigns} height="h-96" />;
  }

  if (chartData.length === 0) {
    return <ChartEmptyState height="h-96" />;
  }

  // Filter visible metrics based on UI filters
  const visibleMetrics = getVisibleMetrics(filters.visibleMetrics);

  return (
    <>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              className="text-xs text-muted-foreground"
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              tickFormatter={(value) => AnalyticsCalculator.formatNumber(value)}
            />
            <Tooltip
              formatter={(value, name) =>
                formatTooltipValue(Number(value), name as string)
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            {visibleMetrics.map((metric) => (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                name={metric.label}
                fill={metric.color}
                stackId="stack"
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default OverviewBarChat;
