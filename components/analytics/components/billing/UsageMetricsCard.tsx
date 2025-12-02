// ============================================================================
// USAGE METRICS CARD - Usage metrics display for billing dashboard
// ============================================================================

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mail } from "lucide-react";
import { UsageMetricsCardSkeleton } from "../BillingAnalyticsSkeletons";

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
 * Props for the UsageMetricsCard component.
 */
interface UsageMetricsCardProps {
  usageMetrics: UsageMetrics | null;
}

/**
 * Usage metrics card component.
 */
export function UsageMetricsCard({ usageMetrics }: UsageMetricsCardProps) {
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
            <span className="text-sm text-gray-600 dark:text-muted-foreground">
              {usageMetrics.emailsSent.toLocaleString()} /{" "}
              {usageMetrics.emailsRemaining === -1
                ? "∞"
                : (
                    usageMetrics.emailsSent + usageMetrics.emailsRemaining
                  ).toLocaleString()}
            </span>
          </div>
          <Progress value={usageMetrics.usagePercentages.emails} />
          <p className="text-xs text-gray-500 dark:text-muted-foreground">
            {usageMetrics.usagePercentages.emails}% used
          </p>
        </div>

        {/* Domain usage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Domains</span>
            <span className="text-sm text-gray-600 dark:text-muted-foreground">
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
            <span className="text-sm text-gray-600 dark:text-muted-foreground">
              {usageMetrics.mailboxesUsed} /{" "}
              {usageMetrics.mailboxesLimit === 0
                ? "∞"
                : usageMetrics.mailboxesLimit}
            </span>
          </div>
          <Progress value={usageMetrics.usagePercentages.mailboxes} />
          <p className="text-xs text-gray-500 dark:text-muted-foreground">
            {usageMetrics.usagePercentages.mailboxes}% used
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
