// ============================================================================
// BILLING SUMMARY CARDS - Dashboard summary cards for billing analytics
// ============================================================================

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";

/**
 * Summary data structure for dashboard cards.
 */
interface SummaryData {
  overallUsage: number;
  totalAlerts: number;
  criticalAlerts: number;
  projectedCost: number;
  currency: string;
  costTrend: "increasing" | "decreasing" | "stable";
  isOverLimit: boolean;
  needsAttention: boolean;
}

/**
 * Props for the SummaryCards component.
 */
interface SummaryCardsProps {
  summary: SummaryData | null;
}

/**
 * Dashboard summary cards component for billing analytics.
 */
export function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall usage */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                Overall Usage
              </p>
              <p className="text-2xl font-bold">{summary.overallUsage}%</p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                summary.overallUsage > 90
                  ? "bg-red-100"
                  : summary.overallUsage > 75
                    ? "bg-yellow-100"
                    : "bg-green-100"
              }`}
            >
              {summary.overallUsage > 90 ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : summary.overallUsage > 75 ? (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
          </div>
          <Progress value={summary.overallUsage} className="mt-3" />
        </CardContent>
      </Card>

      {/* Total alerts */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                Active Alerts
              </p>
              <p className="text-2xl font-bold">{summary.totalAlerts}</p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                summary.criticalAlerts > 0
                  ? "bg-red-100"
                  : summary.totalAlerts > 0
                    ? "bg-yellow-100"
                    : "bg-green-100"
              }`}
            >
              <AlertTriangle
                className={`h-6 w-6 ${
                  summary.criticalAlerts > 0
                    ? "text-red-600"
                    : summary.totalAlerts > 0
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
            {summary.criticalAlerts} critical,{" "}
            {summary.totalAlerts - summary.criticalAlerts} warnings
          </p>
        </CardContent>
      </Card>

      {/* Projected cost */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                Projected Cost
              </p>
              <p className="text-2xl font-bold">
                {summary.currency === "USD" ? "$" : summary.currency}
                {summary.projectedCost.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {summary.costTrend === "increasing" ? (
              <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
            ) : summary.costTrend === "decreasing" ? (
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500 mr-1" />
            )}
            <span
              className={`text-xs ${
                summary.costTrend === "increasing"
                  ? "text-red-600"
                  : summary.costTrend === "decreasing"
                    ? "text-green-600"
                    : "text-gray-600 dark:text-muted-foreground"
              }`}
            >
              {summary.costTrend}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Status indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">
                Account Status
              </p>
              <p className="text-2xl font-bold">
                {summary.isOverLimit
                  ? "Over Limit"
                  : summary.needsAttention
                    ? "Attention"
                    : "Healthy"}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                summary.isOverLimit
                  ? "bg-red-100"
                  : summary.needsAttention
                    ? "bg-yellow-100"
                    : "bg-green-100"
              }`}
            >
              {summary.isOverLimit ? (
                <XCircle className="h-6 w-6 text-red-600" />
              ) : summary.needsAttention ? (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {summary.isOverLimit
              ? "Immediate action required"
              : summary.needsAttention
                ? "Monitor usage closely"
                : "All systems normal"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
