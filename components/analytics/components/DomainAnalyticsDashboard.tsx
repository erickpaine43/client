"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDomainHealthMonitoring } from "../hooks/useDomainAnalytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { DomainHealthDashboardSkeleton } from "./DomainAnalyticsSkeleton";
import { DomainAnalytics } from "@/types/analytics/domain-specific";
import { PerformanceMetrics } from "@/types/analytics/core";
import {
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  TrendingUp,
} from "lucide-react";

// Extended domain data type to handle legacy data structures
type DomainData = DomainAnalytics & {
  metrics?: PerformanceMetrics;
  formattedMetrics?: {
    sent?: string;
    delivered?: string;
  };
  healthScore?: number;
};

// Type for authentication status data
type AuthStatusData = {
  domainId: string;
  domainName: string;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  allAuthenticated: boolean;
  overallStatus?: string;
  authentication?: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
};

/**
 * Real-time domain analytics dashboard component.
 * Demonstrates live updates using real-time data subscriptions.
 */
export function DomainAnalyticsDashboard({
  domainIds,
}: {
  domainIds?: string[];
}) {
  const { domains, summary, isLoading } = useDomainHealthMonitoring(domainIds);

  if (isLoading) {
    return <DomainHealthDashboardSkeleton />;
  }

  if (!domains || domains.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No domain analytics data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Domains</p>
                  <p className="text-2xl font-bold">{summary.totalDomains}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Healthy Domains</p>
                  <p className="text-2xl font-bold">{summary.healthyDomains}</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.totalDomains > 0
                      ? Math.round(
                        (summary.healthyDomains / summary.totalDomains) * 100
                      )
                      : 0}
                    % of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Authenticated</p>
                  <p className="text-2xl font-bold">
                    {summary.authenticatedDomains}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {summary.totalDomains > 0
                      ? Math.round(
                        (summary.authenticatedDomains /
                          summary.totalDomains) *
                        100
                      )
                      : 0}
                    % authenticated
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Avg Health Score</p>
                  <p className="text-2xl font-bold">
                    {summary &&
                      typeof summary === "object" &&
                      "averageHealthScore" in summary &&
                      typeof summary.averageHealthScore === "number"
                      ? summary.averageHealthScore
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Out of 100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain: DomainData) => {
          // Migration note: consumer-side normalization. Accept either legacy
          // precomputed fields or core PerformanceMetrics on `domain.metrics`.
          // Compute healthScore and formatted rates/numbers defensively here
          // using AnalyticsCalculator to avoid relying on provider-side shape.
          const metrics =
            domain.aggregatedMetrics ||
            domain.metrics ||
            null;

          const safeMetrics = metrics
            ? {
              sent: Number(metrics.sent ?? 0),
              delivered: Number(metrics.delivered ?? 0),
              opened_tracked: Number(metrics.opened_tracked ?? 0),
              clicked_tracked: Number(metrics.clicked_tracked ?? 0),
              replied: Number(metrics.replied ?? 0),
              bounced: Number(metrics.bounced ?? 0),
              unsubscribed: Number(metrics.unsubscribed ?? 0),
              spamComplaints: Number(metrics.spamComplaints ?? 0),
            }
            : null;

          const computedHealthScore = safeMetrics
            ? AnalyticsCalculator.calculateHealthScore(safeMetrics)
            : Number(domain.healthScore ?? 0);

          const rates = safeMetrics
            ? AnalyticsCalculator.calculateAllRates(safeMetrics)
            : {
              deliveryRate: 0,
              openRate: 0,
              clickRate: 0,
              replyRate: 0,
              bounceRate: 0,
              unsubscribeRate: 0,
              spamRate: 0,
            };

          const formattedRates = {
            deliveryRate: AnalyticsCalculator.formatRateAsPercentage(
              rates.deliveryRate
            ),
            openRate: AnalyticsCalculator.formatRateAsPercentage(
              rates.openRate
            ),
            clickRate: AnalyticsCalculator.formatRateAsPercentage(
              rates.clickRate
            ),
            replyRate: AnalyticsCalculator.formatRateAsPercentage(
              rates.replyRate
            ),
          };

          const formattedMetrics = {
            sent: safeMetrics
              ? AnalyticsCalculator.formatNumber(safeMetrics.sent)
              : (domain.formattedMetrics?.sent ?? "0"),
            delivered: safeMetrics
              ? AnalyticsCalculator.formatNumber(safeMetrics.delivered)
              : (domain.formattedMetrics?.delivered ?? "0"),
          };

          return (
            <Card key={domain.domainId} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{domain.domainName}</CardTitle>
                  <Badge
                    variant={
                      computedHealthScore >= 80
                        ? "default"
                        : computedHealthScore >= 60
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {computedHealthScore}/100
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Health Score:{" "}
                  {computedHealthScore >= 80
                    ? "Healthy"
                    : computedHealthScore >= 60
                      ? "Fair"
                      : "Poor"}
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Authentication Status */}
                  <div>
                    <p className="text-sm font-medium mb-2">Authentication</p>
                    <div className="flex space-x-2">
                      <Badge
                        variant={
                          domain.authentication.spf ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        <CheckCircle
                          className={`h-3 w-3 mr-1 ${domain.authentication.spf ? "text-green-500" : "text-gray-400"}`}
                        />
                        SPF
                      </Badge>
                      <Badge
                        variant={
                          domain.authentication.dkim ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        <CheckCircle
                          className={`h-3 w-3 mr-1 ${domain.authentication.dkim ? "text-green-500" : "text-gray-400"}`}
                        />
                        DKIM
                      </Badge>
                      <Badge
                        variant={
                          domain.authentication.dmarc ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        <CheckCircle
                          className={`h-3 w-3 mr-1 ${domain.authentication.dmarc ? "text-green-500" : "text-gray-400"}`}
                        />
                        DMARC
                      </Badge>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Delivery Rate</p>
                      <p className="font-medium">
                        {formattedRates.deliveryRate}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Open Rate</p>
                      <p className="font-medium">{formattedRates.openRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Click Rate</p>
                      <p className="font-medium">{formattedRates.clickRate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reply Rate</p>
                      <p className="font-medium">{formattedRates.replyRate}</p>
                    </div>
                  </div>

                  {/* Volume Metrics */}
                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sent</p>
                        <p className="font-medium">{formattedMetrics.sent}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivered</p>
                        <p className="font-medium">
                          {formattedMetrics.delivered}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Health indicator */}
              <div
                className={`absolute top-2 right-2 h-3 w-3 rounded-full ${computedHealthScore >= 80
                    ? "bg-green-500"
                    : computedHealthScore >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Domain authentication status component.
 */
export function DomainAuthenticationStatus({
  domainIds,
}: {
  domainIds?: string[];
}) {
  const { authenticationStatus, isLoading } =
    useDomainHealthMonitoring(domainIds);

  if (isLoading || !authenticationStatus) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-14 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {authenticationStatus.map((domain: AuthStatusData) => (
        <Card key={domain.domainId}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{domain.domainName}</h4>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  {(domain.overallStatus || "unknown")
                    .replace(/_/g, " ")
                    .toLowerCase()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Badge
                  variant={
                    (domain.authentication?.spf ?? domain.spf)
                      ? "default"
                      : "outline"
                  }
                >
                  {(domain.authentication?.spf ?? domain.spf) ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  SPF
                </Badge>
                <Badge
                  variant={
                    (domain.authentication?.dkim ?? domain.dkim)
                      ? "default"
                      : "outline"
                  }
                >
                  {(domain.authentication?.dkim ?? domain.dkim) ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  DKIM
                </Badge>
                <Badge
                  variant={
                    (domain.authentication?.dmarc ?? domain.dmarc)
                      ? "default"
                      : "outline"
                  }
                >
                  {(domain.authentication?.dmarc ?? domain.dmarc) ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  DMARC
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
