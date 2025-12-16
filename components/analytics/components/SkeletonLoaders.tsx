"use client";

// ============================================================================
// ANALYTICS SKELETON LOADERS - Loading states for analytics components
// ============================================================================

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loader for campaign performance metrics cards.
 */
export function CampaignMetricsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-18" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-22" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for campaign performance table rows.
 */
export function CampaignTableRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-16" />
      </td>
    </tr>
  );
}

/**
 * Skeleton loader for analytics charts.
 */
export function AnalyticsChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart legend */}
          <div className="flex space-x-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="relative">
            <Skeleton
              className={`w-full rounded-lg`}
              style={{ height: `${height}px` }}
            />

            {/* Simulated chart bars/lines */}
            <AnalyticsChartSkeletonBars />
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-12" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsChartSkeletonBars() {
  // Generate pseudo-random heights once at component mount
  const heights = useMemo(() => {
    // Use a simple seeded random number generator to avoid Math.random() during render
    // Use a fixed seed for consistency
    const seed = 67890;
    return Array.from({ length: 12 }, (_, i) => {
      const value = ((seed + i) * 9301 + 49297) % 233280;
      return (value / 233280) * 40 + 20; // Scale to 20-60 range
    });
  }, []);

  return (
    <div className="absolute inset-4 flex items-end justify-between space-x-1">
      {heights.map((height, i) => (
        <Skeleton
          key={i}
          className="w-full rounded-t"
          style={{
            height: `${height}%`,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}


/**
 * Skeleton loader for KPI summary cards.
 */
export function KPISummaryCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for sequence step analytics.
 */
export function SequenceStepSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="text-center">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for analytics overview dashboard.
 */
export function AnalyticsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPISummaryCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Chart */}
      <AnalyticsChartSkeleton height={400} />

      {/* Campaign Performance Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-12" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <CampaignTableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Skeleton loader for campaign comparison view.
 */
export function CampaignComparisonSkeleton() {
  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChartSkeleton height={250} />
        <AnalyticsChartSkeleton height={250} />
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CampaignMetricsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for real-time analytics updates indicator.
 */
export function RealTimeUpdateSkeleton() {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75" />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150" />
      </div>
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

/**
 * Progressive loading skeleton that shows different states.
 */
export function ProgressiveAnalyticsLoader({
  stage = "loading",
  message,
}: {
  stage?: "loading" | "computing" | "finalizing";
  message?: string;
}) {
  const stageMessages = {
    loading: "Loading campaign data...",
    computing: "Computing analytics...",
    finalizing: "Finalizing results...",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="flex space-x-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full animate-bounce ${
              stage === "loading" && i === 0
                ? "bg-blue-500"
                : stage === "computing" && i === 1
                  ? "bg-yellow-500"
                  : stage === "finalizing" && i === 2
                    ? "bg-green-500"
                    : "bg-gray-300"
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {message || stageMessages[stage]}
      </p>
      <div className="w-64">
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}
