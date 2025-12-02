// ============================================================================
// COST ANALYTICS CARD - Cost analytics display for billing dashboard
// ============================================================================

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { CostAnalyticsCardSkeleton } from "../BillingAnalyticsSkeletons";

/**
 * Cost analytics data structure.
 */
interface CostAnalytics {
  currency: string;
  totalCost: number;
  projectedMonthlyCost: number;
  costTrend: "increasing" | "decreasing" | "stable";
  trendPercentage: number;
  periodStart: string;
  periodEnd: string;
  averageDailyCost: number;
}

/**
 * Props for the CostAnalyticsCard component.
 */
interface CostAnalyticsCardProps {
  costAnalytics: CostAnalytics | null;
}

/**
 * Cost analytics card component.
 */
export function CostAnalyticsCard({ costAnalytics }: CostAnalyticsCardProps) {
  if (!costAnalytics) {
    return <CostAnalyticsCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Cost Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              Total Cost
            </p>
            <p className="text-2xl font-bold">
              {costAnalytics.currency === "USD" ? "$" : costAnalytics.currency}
              {costAnalytics.totalCost.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              Projected Monthly
            </p>
            <p className="text-2xl font-bold">
              {costAnalytics.currency === "USD" ? "$" : costAnalytics.currency}
              {costAnalytics.projectedMonthlyCost.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {costAnalytics.costTrend === "increasing" ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : costAnalytics.costTrend === "decreasing" ? (
            <TrendingDown className="h-4 w-4 text-green-500" />
          ) : (
            <Minus className="h-4 w-4 text-gray-500" />
          )}
          <span
            className={`text-sm ${
              costAnalytics.costTrend === "increasing"
                ? "text-red-600"
                : costAnalytics.costTrend === "decreasing"
                  ? "text-green-600"
                  : "text-gray-600 dark:text-muted-foreground"
            }`}
          >
            {costAnalytics.costTrend} ({costAnalytics.trendPercentage}%)
          </span>
        </div>

        <div className="text-xs text-gray-500">
          <p>
            Period: {costAnalytics.periodStart} to {costAnalytics.periodEnd}
          </p>
          <p>
            Daily average:{" "}
            {costAnalytics.currency === "USD" ? "$" : costAnalytics.currency}
            {costAnalytics.averageDailyCost.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
