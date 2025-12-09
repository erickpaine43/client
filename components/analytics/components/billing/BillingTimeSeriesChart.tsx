// ============================================================================
// BILLING TIME SERIES CHART - Time series chart for billing analytics
// ============================================================================

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingTimeSeriesChartSkeleton } from "../BillingAnalyticsSkeletons";

/**
 * Time series data point structure.
 */
interface TimeSeriesDataPoint {
  label: string;
  usage: {
    emailsSent: number;
  };
  costs: {
    currency: string;
    currentPeriod: number;
  };
}

/**
 * Props for the BillingTimeSeriesChart component.
 */
interface BillingTimeSeriesChartProps {
  timeSeriesData: TimeSeriesDataPoint[] | null;
}

/**
 * Billing time series chart component.
 */
export function BillingTimeSeriesChart({
  timeSeriesData,
}: BillingTimeSeriesChartProps) {
  if (!timeSeriesData) {
    return <BillingTimeSeriesChartSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Trends</CardTitle>
        <p className="text-sm text-gray-600 dark:text-muted-foreground">
          Usage and cost trends over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-muted-foreground">
          <p>
            Chart visualization would be implemented here with your preferred
            charting library
          </p>
        </div>

        {/* Simple data display for now */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Recent Data Points</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {timeSeriesData
              .slice(-3)
              .map((point: TimeSeriesDataPoint, index: number) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 dark:bg-muted/30 rounded"
                >
                  <p className="font-medium">{point.label}</p>
                  <p>Emails: {point.usage.emailsSent.toLocaleString()}</p>
                  <p>
                    Cost:{" "}
                    {point.costs.currency === "USD"
                      ? "$"
                      : point.costs.currency}
                    {point.costs.currentPeriod.toFixed(2)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
