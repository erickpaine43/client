"use client";
import KpiCard from "@/components/analytics/cards/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChartData, MetricToggle } from "@/types/campaign";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator"; // MIGRATED: Added for rate calculations
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MousePointer,
  TrendingUp,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCampaignStats } from "@/hooks/useCampaignStats";

type TooltipPayloadItem = {
  color: string;
  dataKey: string;
  name: string;
  value: number;
  payload: ChartData;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

const CustomTooltip = ({
  active,
  payload,
}: Pick<ChartTooltipProps, "active" | "payload">) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[140px]">
        <p className="font-medium text-gray-900 text-sm mb-2">
          {formattedDate}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-xs">Sent:</span>
            <span className="font-medium text-gray-700 text-xs">
              {data.sent}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-600 text-xs">Opened:</span>
            <span className="font-medium text-blue-700 text-xs">
              {data.opened}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-600 text-xs">Replied:</span>
            <span className="font-medium text-green-700 text-xs">
              {data.replied}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-600 text-xs">Clicked:</span>
            <span className="font-medium text-purple-700 text-xs">
              {data.clicked}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-red-600 text-xs">Bounced:</span>
            <span className="font-medium text-red-700 text-xs">
              {data.bounced}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function StatsTab() {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const chartRef = useRef<HTMLDivElement>(null);
  const { data, loading, error } = useCampaignStats(timeRange);

  // MIGRATED: Updated metrics to use standardized field names
  const [metrics, setMetrics] = useState<MetricToggle[]>([
    { key: "sent", label: "Emails Sent", color: "#6B7280", visible: true },
    {
      key: "opened",
      label: "Opens (Tracked)",
      color: "#3B82F6",
      visible: true,
    },
    { key: "replied", label: "Replies", color: "#10B981", visible: true },
    {
      key: "clicked",
      label: "Clicks (Tracked)",
      color: "#8B5CF6",
      visible: true,
    },
    { key: "bounced", label: "Bounces", color: "#EF4444", visible: true },
  ]);

  // Handled by useCampaignStats hook

  const timeRangeOptions = [
    { value: 7, label: "Last 7 days" },
    { value: 14, label: "Last 14 days" },
    { value: 30, label: "Last 30 days" },
  ];

  const toggleMetric = (key: keyof ChartData) => {
    setMetrics((prev) =>
      prev.map((metric) =>
        metric.key === key ? { ...metric, visible: !metric.visible } : metric
      )
    );
  };

  // MIGRATED: Calculate totals using standardized field names
  const totals = data.reduce(
    // Migration note: Use Record<string, number | undefined> for dynamic keys to avoid type errors.
    (acc, day) => {
      const d = day as unknown as Record<string, number | undefined>;
      const sent = d.sent ?? 0;
      const bounced = d.bounced ?? 0;
      const delivered = d.delivered ?? sent - bounced;
      const opened_tracked = d.opened_tracked ?? d.opened ?? 0;
      const clicked_tracked = d.clicked_tracked ?? d.clicked ?? 0;
      const replied = d.replied ?? 0;
      const unsubscribed = d.unsubscribed ?? 0;
      const spamComplaints = d.spamComplaints ?? 0;
      return {
        sent: acc.sent + sent,
        delivered: acc.delivered + delivered,
        opened_tracked: acc.opened_tracked + opened_tracked,
        replied: acc.replied + replied,
        clicked_tracked: acc.clicked_tracked + clicked_tracked,
        bounced: acc.bounced + bounced,
        unsubscribed: acc.unsubscribed + unsubscribed,
        spamComplaints: acc.spamComplaints + spamComplaints,
      };
    },
    {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      replied: 0,
      clicked_tracked: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    }
  );

  // MIGRATED: Use AnalyticsCalculator for consistent rate calculations
  const rates = AnalyticsCalculator.calculateAllRates(totals);
  const openRate = AnalyticsCalculator.formatRateAsPercentage(rates.openRate);
  const replyRate = AnalyticsCalculator.formatRateAsPercentage(rates.replyRate);
  const clickRate = AnalyticsCalculator.formatRateAsPercentage(rates.clickRate);
  const bounceRate = AnalyticsCalculator.formatRateAsPercentage(
    rates.bounceRate
  );

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Campaign Performance
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">
              Failed to load analytics data
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Campaign Performance
      </h3>

      {/* KPI Cards - Show loading or data */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 animate-pulse rounded-lg p-4 h-24"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            className="flex-row-reverse justify-end gap-2"
            title="Total Sent"
            value={totals.sent.toLocaleString()}
            icon={Mail}
            color="bg-gray-100 text-gray-600"
          />
          <KpiCard
            className="flex-row-reverse justify-end gap-2"
            title="Opens (Tracked)"
            value={`${totals.opened_tracked.toLocaleString()} (${openRate})`}
            icon={Eye}
            color="bg-blue-100 text-blue-600"
          />
          <KpiCard
            className="flex-row-reverse justify-end gap-2"
            title="Replies"
            value={`${totals.replied.toLocaleString()} (${replyRate})`}
            icon={TrendingUp}
            color="bg-green-100 text-green-600"
          />
          <KpiCard
            className="flex-row-reverse justify-end gap-2"
            title="Clicks (Tracked)"
            value={`${totals.clicked_tracked.toLocaleString()} (${clickRate})`}
            icon={MousePointer}
            color="bg-purple-100 text-purple-600"
          />
          <KpiCard
            className="flex-row-reverse justify-end gap-2"
            title="Bounces"
            value={`${totals.bounced.toLocaleString()} (${bounceRate}%)`}
            icon={AlertTriangle}
            color="bg-red-100 text-red-600"
          />
        </div>
      )}

      {/* Chart Container */}
      {loading ? (
        <Card ref={chartRef}>
          <CardContent className="p-6">
            <div className="h-80 w-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">Loading analytics data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card ref={chartRef}>
          <CardContent className="p-6">
            {/* Header with Controls */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Over Time
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Metric Toggle Buttons */}
                <div className="flex flex-wrap gap-2">
                  {metrics.map((metric) => (
                    <Button
                      key={metric.key}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMetric(metric.key)}
                      className={`flex items-center gap-1.5 h-8 ${
                        metric.visible
                          ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          : "border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {metric.visible ? (
                        <Eye size={12} />
                      ) : (
                        <EyeOff size={12} />
                      )}
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: metric.visible
                            ? metric.color
                            : "#D1D5DB",
                        }}
                      />
                      {metric.label}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {/* Time Range Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {
                          timeRangeOptions.find(
                            (option) => option.value === timeRange
                          )?.label
                        }
                        <ChevronDown size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {timeRangeOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() =>
                            setTimeRange(option.value as 7 | 14 | 30)
                          }
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F3F4F6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {metrics.map(
                    (metric) =>
                      metric.visible && (
                        <Line
                          key={metric.key}
                          type="monotone"
                          dataKey={metric.key}
                          stroke={metric.color}
                          strokeWidth={2}
                          dot={{ fill: metric.color, strokeWidth: 0, r: 3 }}
                          activeDot={{
                            r: 5,
                            stroke: metric.color,
                            strokeWidth: 2,
                            fill: "#fff",
                          }}
                        />
                      )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              {metrics
                .filter((metric) => metric.visible)
                .map((metric) => (
                  <div key={metric.key} className="flex items-center gap-2">
                    <div
                      className="w-3 h-0.5 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      {metric.label}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
export default StatsTab;
