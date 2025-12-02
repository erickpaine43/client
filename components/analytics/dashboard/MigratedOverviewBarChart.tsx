"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics } from "@/context/AnalyticsContext";
import { CampaignAnalytics } from "@/types/analytics/domain-specific";
import { ChartDataPoint } from "@/types/analytics/ui";
import { AnalyticsChartSkeleton } from "@/components/analytics/components/SkeletonLoaders";

interface MigratedOverviewBarChartProps {
  data?: CampaignAnalytics[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Migrated Overview Bar Chart using standardized field names.
 * Uses opened_tracked, clicked_tracked instead of opens, clicks.
 */
function MigratedOverviewBarChart({
  data = [],
  loading = false,
  error = null,
}: MigratedOverviewBarChartProps) {
  const { filters } = useAnalytics();
  const { visibleMetrics } = filters;

  // Transform campaign analytics to chart data using standardized field names
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((campaign) => ({
      name: campaign.campaignName,
      date: campaign.updatedAt
        ? new Date(campaign.updatedAt).toLocaleDateString()
        : "",
      // Use standardized field names
      sent: campaign.sent,
      delivered: campaign.delivered,
      opened_tracked: campaign.opened_tracked,
      clicked_tracked: campaign.clicked_tracked,
      replied: campaign.replied,
      bounced: campaign.bounced,
      unsubscribed: campaign.unsubscribed,
      spamComplaints: campaign.spamComplaints,
    }));
  }, [data]);

  // Standardized metrics configuration using new field names
  const standardizedMetrics = useMemo(
    () => [
      {
        key: "sent",
        label: "Emails Sent",
        color: "#3B82F6",
        visible: true,
      },
      {
        key: "delivered",
        label: "Delivered",
        color: "#06B6D4",
        visible: true,
      },
      {
        key: "opened_tracked",
        label: "Opens (Tracked)",
        color: "#8B5CF6",
        visible: true,
      },
      {
        key: "clicked_tracked",
        label: "Clicks (Tracked)",
        color: "#F59E0B",
        visible: true,
      },
      {
        key: "replied",
        label: "Replies",
        color: "#10B981",
        visible: true,
      },
      {
        key: "bounced",
        label: "Bounced",
        color: "#EF4444",
        visible: false,
      },
      {
        key: "unsubscribed",
        label: "Unsubscribed",
        color: "#F97316",
        visible: false,
      },
      {
        key: "spamComplaints",
        label: "Spam Complaints",
        color: "#DC2626",
        visible: false,
      },
    ],
    []
  );

  // Show loading state
  if (loading) {
    return <AnalyticsChartSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading chart data</p>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (chartData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No data available</p>
          <p className="text-sm text-gray-400">
            Start a campaign to see chart data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis
            dataKey="name"
            className="text-xs text-muted-foreground"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis className="text-xs text-muted-foreground" />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toLocaleString(),
              standardizedMetrics.find((m) => m.key === name)?.label || name,
            ]}
            labelFormatter={(label) => `Campaign: ${label}`}
          />
          {standardizedMetrics
            .filter((metric) => visibleMetrics.includes(metric.key))
            .map((metric) => (
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
  );
}

export default MigratedOverviewBarChart;
