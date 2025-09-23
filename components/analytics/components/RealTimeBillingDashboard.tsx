// ============================================================================
// REAL-TIME BILLING DASHBOARD - Main dashboard with real-time billing analytics
// ============================================================================

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Mail,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useBillingAnalyticsDashboard,
  useUsageRecommendations,
  useOptimisticBillingAnalytics,
} from "@/hooks/useBillingAnalytics";
import { AnalyticsFilters } from "@/types/analytics/core";
import {
  BillingAnalyticsDashboardSkeleton,
  UsageMetricsCardSkeleton,
  CostAnalyticsCardSkeleton,
  PlanUtilizationCardSkeleton,
  UsageAlertsCardSkeleton,
  BillingTimeSeriesChartSkeleton,
} from "./BillingAnalyticsSkeletons";

/**
 * Props for the RealTimeBillingDashboard component.
 */
interface RealTimeBillingDashboardProps {
  companyId: string;
  initialFilters?: AnalyticsFilters;
  showRecommendations?: boolean;
  showTimeSeriesChart?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Usage metrics data structure.
 */
interface UsageMetrics {
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  domainsLimit: number;
  mailboxesUsed: number;
  mailboxesLimit: number;
  usagePercentages: {
    emails: number;
    domains: number;
    mailboxes: number;
  };
}

/**
 * Plan utilization data structure.
 */
interface PlanUtilization {
  planType: string;
  utilizationPercentages: {
    overall: number;
  };
  recommendations: string[];
  isOverLimit: boolean;
}

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
 * Usage alert data structure.
 */
interface UsageAlert {
  type: "critical" | "warning";
  message: string;
  percentage: number;
}

/**
 * Limit alerts data structure.
 */
interface LimitAlerts {
  totalAlerts: number;
  alerts: UsageAlert[];
}

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
 * Usage recommendations data structure.
 */
interface UsageRecommendations {
  recommendations: string[];
  urgentActions: string[];
  planSuggestions: string[];
}

/**
 * Real-time billing analytics dashboard with usage monitoring and cost tracking.
 */
export function RealTimeBillingDashboard({
  companyId,
  initialFilters,
  showRecommendations = true,
  showTimeSeriesChart = true,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: RealTimeBillingDashboardProps) {
  const [filters, setFilters] = useState<AnalyticsFilters | undefined>(
    initialFilters
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Main dashboard data
  const {
    usageMetrics,
    limitAlerts,
    costAnalytics,
    planUtilization,
    timeSeriesData,
    summary,
    isLoading,
    hasErrors,
    isRealTime,
  } = useBillingAnalyticsDashboard(companyId, filters);

  // Usage recommendations
  const recommendations = useUsageRecommendations(companyId);

  // Optimistic updates
  const { isUpdating } = useOptimisticBillingAnalytics(companyId);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Migration note: Defensive filter update, normalize filter state before passing to consumers.
    setFilters((prev) => {
      const p = prev as Record<string, unknown> | undefined;
      // Always set dateRange as an object { start, end }
      const customDateRange =
        typeof p?.customDateRange === "object" && p?.customDateRange !== null
          ? (p.customDateRange as { start: string; end: string })
          : {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              end: new Date().toISOString().split("T")[0],
            };
      const dateRange = customDateRange;
      const granularity =
        typeof p?.granularity === "string" ? p.granularity : "day";
      const campaigns = Array.isArray(p?.campaigns)
        ? (p.campaigns as string[])
        : [];
      const mailboxesArr = Array.isArray(p?.mailboxes)
        ? (p.mailboxes as string[])
        : [];
      const visibleMetricsArr = Array.isArray(p?.visibleMetrics)
        ? (p.visibleMetrics as string[])
        : [];
      return {
        dateRange,
        customDateRange,
        granularity,
        campaigns,
        mailboxes: mailboxesArr,
        visibleMetrics: visibleMetricsArr,
      } as AnalyticsFilters;
    });
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(handleRefresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, handleRefresh]);

  // Show loading state
  if (isLoading) {
    return <BillingAnalyticsDashboardSkeleton />;
  }

  // Show error state
  if (hasErrors) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load billing analytics. Please try refreshing the page.
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billing Analytics</h2>
          <p className="text-gray-600">
            Real-time usage monitoring and cost tracking
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Real-time indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${isRealTime ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            />
            <span className="text-sm text-gray-600">
              {isRealTime ? "Live" : "Cached"}
            </span>
          </div>

          {/* Refresh button */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing || isUpdating}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dashboard summary cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall usage */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
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
                  <p className="text-sm font-medium text-gray-600">
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
              <p className="text-xs text-gray-500 mt-2">
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
                  <p className="text-sm font-medium text-gray-600">
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
                        : "text-gray-600"
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
                  <p className="text-sm font-medium text-gray-600">
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
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage metrics */}
        <UsageMetricsCard usageMetrics={usageMetrics ?? null} />

        {/* Plan utilization */}
        <PlanUtilizationCard
          planUtilization={
            planUtilization
              ? {
                  planType:
                    planUtilization.planType || planUtilization.planName,
                  utilizationPercentages: {
                    overall:
                      ("utilizationPercentage" in planUtilization
                        ? planUtilization.utilizationPercentage
                        : 0) || 0,
                  },
                  recommendations:
                    ("upgradeRecommendations" in planUtilization
                      ? planUtilization.upgradeRecommendations
                      : []) || [],
                  isOverLimit:
                    ("utilizationPercentage" in planUtilization
                      ? planUtilization.utilizationPercentage
                      : 0) > 100,
                }
              : null
          }
        />

        {/* Cost analytics */}
        <CostAnalyticsCard costAnalytics={costAnalytics} />

        {/* Usage alerts */}
        <UsageAlertsCard
          limitAlerts={
            limitAlerts
              ? {
                  ...limitAlerts,
                  alerts: limitAlerts.alerts.map((alert) => ({
                    ...alert,
                    percentage:
                      alert.current && alert.threshold
                        ? Math.round((alert.current / alert.threshold) * 100)
                        : 0,
                  })),
                }
              : null
          }
        />
      </div>

      {/* Time series chart */}
      {showTimeSeriesChart && (
        <BillingTimeSeriesChart
          timeSeriesData={
            timeSeriesData
              ? timeSeriesData.map((point) => ({
                  label: point.label || point.date,
                  usage: {
                    emailsSent: Number(
                      ("emailsSent" in point
                        ? point.emailsSent
                        : "sent" in point
                          ? point.sent
                          : 0) || 0
                    ),
                  },
                  costs: {
                    currency: String(
                      ("currency" in point ? point.currency : "USD") || "USD"
                    ),
                    currentPeriod: Number(
                      ("cost" in point
                        ? point.cost
                        : "totalCost" in point
                          ? point.totalCost
                          : 0) || 0
                    ),
                  },
                }))
              : null
          }
        />
      )}

      {/* Recommendations */}
      {showRecommendations && (
        <UsageRecommendationsCard recommendations={recommendations} />
      )}
    </div>
  );
}

/**
 * Usage metrics card component.
 */
function UsageMetricsCard({
  usageMetrics,
}: {
  usageMetrics: UsageMetrics | null;
}) {
  if (!usageMetrics) {
    return <UsageMetricsCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Usage Metrics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Emails</span>
            <span className="text-sm text-gray-600">
              {usageMetrics.emailsSent.toLocaleString()} /{" "}
              {usageMetrics.emailsRemaining === -1
                ? "∞"
                : (
                    usageMetrics.emailsSent + usageMetrics.emailsRemaining
                  ).toLocaleString()}
            </span>
          </div>
          <Progress value={usageMetrics.usagePercentages.emails} />
          <p className="text-xs text-gray-500">
            {usageMetrics.usagePercentages.emails}% used
          </p>
        </div>

        {/* Domain usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Domains</span>
            <span className="text-sm text-gray-600">
              {usageMetrics.domainsUsed} /{" "}
              {usageMetrics.domainsLimit === 0
                ? "∞"
                : usageMetrics.domainsLimit}
            </span>
          </div>
          <Progress value={usageMetrics.usagePercentages.domains} />
          <p className="text-xs text-gray-500">
            {usageMetrics.usagePercentages.domains}% used
          </p>
        </div>

        {/* Mailbox usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Mailboxes</span>
            <span className="text-sm text-gray-600">
              {usageMetrics.mailboxesUsed} /{" "}
              {usageMetrics.mailboxesLimit === 0
                ? "∞"
                : usageMetrics.mailboxesLimit}
            </span>
          </div>
          <Progress value={usageMetrics.usagePercentages.mailboxes} />
          <p className="text-xs text-gray-500">
            {usageMetrics.usagePercentages.mailboxes}% used
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Plan utilization card component.
 */
function PlanUtilizationCard({
  planUtilization,
}: {
  planUtilization: PlanUtilization | null;
}) {
  if (!planUtilization) {
    return <PlanUtilizationCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Utilization</CardTitle>
        <p className="text-sm text-gray-600">
          Current plan: {planUtilization.planType}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray={`${planUtilization.utilizationPercentages.overall}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">
                {planUtilization.utilizationPercentages.overall}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Overall Utilization</p>
        </div>

        {planUtilization.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations</h4>
            {planUtilization.recommendations
              .slice(0, 3)
              .map((rec: string, index: number) => (
                <p key={index} className="text-xs text-gray-600">
                  • {rec}
                </p>
              ))}
          </div>
        )}

        {planUtilization.isOverLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have exceeded your plan limits. Please upgrade or reduce
              usage.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Cost analytics card component.
 */
function CostAnalyticsCard({
  costAnalytics,
}: {
  costAnalytics: CostAnalytics | null;
}) {
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
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold">
              {costAnalytics.currency === "USD" ? "$" : costAnalytics.currency}
              {costAnalytics.totalCost.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Projected Monthly</p>
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
                  : "text-gray-600"
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

/**
 * Usage alerts card component.
 */
function UsageAlertsCard({ limitAlerts }: { limitAlerts: LimitAlerts | null }) {
  if (!limitAlerts) {
    return <UsageAlertsCardSkeleton />;
  }

  if (limitAlerts.alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Usage Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            No active alerts. All usage is within limits.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span>Usage Alerts</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          {limitAlerts.totalAlerts} active alerts
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {limitAlerts.alerts.map((alert: UsageAlert, index: number) => (
          <Alert
            key={index}
            variant={alert.type === "critical" ? "destructive" : "default"}
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{alert.message}</span>
                <Badge
                  variant={
                    alert.type === "critical" ? "destructive" : "secondary"
                  }
                >
                  {alert.percentage}%
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Billing time series chart component.
 */
function BillingTimeSeriesChart({
  timeSeriesData,
}: {
  timeSeriesData: TimeSeriesDataPoint[] | null;
}) {
  if (!timeSeriesData) {
    return <BillingTimeSeriesChartSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Trends</CardTitle>
        <p className="text-sm text-gray-600">Usage and cost trends over time</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-500">
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
                <div key={index} className="p-2 bg-gray-50 rounded">
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

/**
 * Usage recommendations card component.
 */
function UsageRecommendationsCard({
  recommendations,
}: {
  recommendations: UsageRecommendations | null;
}) {
  if (!recommendations) {
    return <div>Loading recommendations...</div>;
  }

  const hasRecommendations =
    recommendations.recommendations.length > 0 ||
    recommendations.urgentActions.length > 0 ||
    recommendations.planSuggestions.length > 0;

  if (!hasRecommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Your usage is optimized. No recommendations at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Recommendations</CardTitle>
        <p className="text-sm text-gray-600">
          Optimize your plan and usage based on current patterns
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgent actions */}
        {recommendations.urgentActions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2">
              Urgent Actions
            </h4>
            <div className="space-y-2">
              {recommendations.urgentActions.map(
                (action: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{action}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* General recommendations */}
        {recommendations.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-600 mb-2">
              Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.recommendations.map(
                (rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Plan suggestions */}
        {recommendations.planSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-600 mb-2">
              Plan Suggestions
            </h4>
            <div className="space-y-2">
              {recommendations.planSuggestions.map(
                (suggestion: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
