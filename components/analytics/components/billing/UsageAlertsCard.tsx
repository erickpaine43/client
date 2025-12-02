// ============================================================================
// USAGE ALERTS CARD - Usage alerts display for billing dashboard
// ============================================================================

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { UsageAlertsCardSkeleton } from "../BillingAnalyticsSkeletons";

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
 * Props for the UsageAlertsCard component.
 */
interface UsageAlertsCardProps {
  limitAlerts: LimitAlerts | null;
}

/**
 * Usage alerts card component.
 */
export function UsageAlertsCard({ limitAlerts }: UsageAlertsCardProps) {
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
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
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
        <p className="text-sm text-gray-600 dark:text-muted-foreground">
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
