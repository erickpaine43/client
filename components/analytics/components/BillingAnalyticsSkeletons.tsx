// ============================================================================
// BILLING ANALYTICS SKELETON LOADERS - Loading states for billing components
// ============================================================================

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for usage metrics cards.
 */
export function UsageMetricsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage bars */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for cost analytics card.
 */
export function CostAnalyticsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for plan utilization card.
 */
export function PlanUtilizationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-16 mx-auto" />
          <Skeleton className="h-4 w-28 mx-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for usage alerts card.
 */
export function UsageAlertsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-start space-x-3 p-3 rounded-lg border"
          >
            <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


function BillingTimeSeriesChartSkeletonBars() {
  // Generate pseudo-random heights once at component mount
  const heights = useMemo(() => {
    // Use a simple seeded random number generator to avoid Math.random() during render
    // Use a fixed seed for consistency
    const seed = 12345;
    return Array.from({ length: 12 }, (_, i) => {
      const value = ((seed + i) * 9301 + 49297) % 233280;
      return (value / 233280) * 60 + 20; // Scale to 20-80 range
    });
  }, []);

  return (
    <div className="h-64 flex items-end space-x-2">
      {heights.map((height, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for billing time series chart.
 */
export function BillingTimeSeriesChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart legend */}
          <div className="flex space-x-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Chart area */}
          <BillingTimeSeriesChartSkeletonBars />

          {/* X-axis labels */}
          <div className="flex justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-12" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for billing dashboard summary.
 */
export function BillingDashboardSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for usage recommendations.
 */
export function UsageRecommendationsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgent actions */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start space-x-2">
                <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-2">
                <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Plan suggestions */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start space-x-2">
                <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Progressive loading indicator for billing analytics computation.
 */
export function BillingAnalyticsProgressiveLoader({
  stage,
  message,
}: {
  stage: "loading" | "computing" | "finalizing";
  message?: string;
}) {
  const stageMessages = {
    loading: "Loading billing data...",
    computing: "Computing usage analytics...",
    finalizing: "Finalizing cost projections...",
  };

  const stageProgress = {
    loading: 33,
    computing: 66,
    finalizing: 90,
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
              style={{
                transform: `rotate(${(stageProgress[stage] / 100) * 360}deg)`,
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {stageProgress[stage]}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {message || stageMessages[stage]}
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stageProgress[stage]}%` }}
              ></div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Analyzing your usage patterns and cost projections...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Complete billing analytics dashboard skeleton.
 */
export function BillingAnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Dashboard summary */}
      <BillingDashboardSummarySkeleton />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <UsageMetricsCardSkeleton />
          <CostAnalyticsCardSkeleton />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <PlanUtilizationCardSkeleton />
          <UsageAlertsCardSkeleton />
        </div>
      </div>

      {/* Full width sections */}
      <BillingTimeSeriesChartSkeleton />
      <UsageRecommendationsSkeleton />
    </div>
  );
}
