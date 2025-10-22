"use client";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  HelpCircle,
  Mail,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WarmupChartData } from "@/types";

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color?: string;
  payload?: WarmupChartData;
}

function WarmUpLineChart(): ReactElement {
  const {
    visibleWarmupMetrics = {
      totalWarmups: true,
      spamFlags: false,
      replies: true,
    },
    setVisibleWarmupMetrics = () => {},
    warmupChartData = [],
    warmupMetrics = [],
  } = useAnalytics();

  const toggleMetric = (metric: "totalWarmups" | "spamFlags" | "replies") => {
    setVisibleWarmupMetrics({
      ...visibleWarmupMetrics,
      [metric]: !visibleWarmupMetrics[metric],
    });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: TooltipPayloadItem, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-semibold">{entry.value}</span>
              <span className="ml-2 text-gray-600">
                {entry.dataKey === "totalWarmups" && "Total Warmups"}
                {entry.dataKey === "spamFlags" && "Spam Flags"}
                {entry.dataKey === "replies" && "Replies"}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const footerMetrics = warmupMetrics.map((metric) => ({
    key: metric.key,
    label: metric.label,
    color:
      metric.key === "totalWarmups"
        ? "text-blue-600"
        : metric.key === "spamFlags"
          ? "text-red-600"
          : "text-green-600",
    tooltip: metric.tooltip,
    value: warmupChartData.reduce((sum, d) => {
      switch (metric.key) {
        case "totalWarmups":
          return sum + d.totalWarmups;
        case "spamFlags":
          return sum + d.spamFlags;
        case "replies":
          return sum + d.replies;
        default:
          return sum;
      }
    }, 0),
  }));

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                Warmup Performance Over Time
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={
                  visibleWarmupMetrics.totalWarmups ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleMetric("totalWarmups")}
                className={
                  visibleWarmupMetrics.totalWarmups
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : ""
                }
              >
                <Mail className="w-4 h-4 mr-2" />
                Total Warmups
              </Button>

              <Button
                variant={visibleWarmupMetrics.spamFlags ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMetric("spamFlags")}
                className={
                  visibleWarmupMetrics.spamFlags
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : ""
                }
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Spam Flags
              </Button>

              <Button
                variant={visibleWarmupMetrics.replies ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMetric("replies")}
                className={
                  visibleWarmupMetrics.replies
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : ""
                }
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Replies
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={warmupChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <RechartsTooltip content={<CustomTooltip />} />

                {visibleWarmupMetrics.totalWarmups && (
                  <Line
                    type="monotone"
                    dataKey="totalWarmups"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                  />
                )}

                {visibleWarmupMetrics.spamFlags && (
                  <Line
                    type="monotone"
                    dataKey="spamFlags"
                    stroke="#DC2626"
                    strokeWidth={2}
                    dot={{ fill: "#DC2626", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#DC2626", strokeWidth: 2 }}
                  />
                )}

                {visibleWarmupMetrics.replies && (
                  <Line
                    type="monotone"
                    dataKey="replies"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#059669", strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          {footerMetrics.map((metric) => (
            <div key={metric.key} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.key === "totalWarmups"
                    ? metric.value.toLocaleString()
                    : metric.value}
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{metric.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

export default WarmUpLineChart;
