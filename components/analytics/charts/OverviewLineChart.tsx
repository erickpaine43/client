"use client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAnalytics, useDomainAnalytics } from "@/context/AnalyticsContext";
import { ChartDataPoint } from "@/types/analytics/ui";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { ANALYTICS_METRICS_CONFIG, getChartConfig } from "../config/metrics";
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
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";

function OverviewLineChart() {
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
          campaignService as import("@/lib/services/analytics/CampaignAnalyticsService").CampaignAnalyticsService;

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
    return <ChartSkeleton height="h-80" />;
  }

  // Error handling
  if (loadingState.errors.campaigns) {
    return <ChartError error={loadingState.errors.campaigns} height="h-80" />;
  }

  if (chartData.length === 0) {
    return <ChartEmptyState height="h-80" />;
  }

  // Create chart config using shared configuration
  const chartConfig = getChartConfig(filters.visibleMetrics);

  // Filter visible metrics based on UI filters
  const visibleMetricKeys = ANALYTICS_METRICS_CONFIG.filter((m) =>
    filters.visibleMetrics.includes(m.key)
  ).map((m) => m.key);

  return (
    <div className="h-80">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={true}
              horizontal={true}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => AnalyticsCalculator.formatNumber(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const [formattedValue, label] = formatTooltipValue(
                      Number(value),
                      name as string
                    );
                    return [
                      formattedValue,
                      chartConfig[name as string]?.label || label,
                    ];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
              }
            />
            {visibleMetricKeys.map((metricKey) => (
              <Line
                key={metricKey}
                type="monotone"
                dataKey={metricKey}
                stroke={chartConfig[metricKey].color}
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: chartConfig[metricKey].color,
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: chartConfig[metricKey].color,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

export default OverviewLineChart;
