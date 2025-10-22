import React from "react";

/**
 * Skeleton loading component for charts.
 */
export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <div className="animate-pulse space-y-4 w-full">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

/**
 * Error display component for charts.
 */
export function ChartError({
  error,
  height = "h-80",
}: {
  error: string;
  height?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${height} text-red-500`}>
      Error loading chart data: {error}
    </div>
  );
}

/**
 * Empty state component for charts.
 */
export function ChartEmptyState({
  message = "No data available",
  height = "h-80",
}: {
  message?: string;
  height?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center ${height} text-muted-foreground`}
    >
      {message}
    </div>
  );
}
