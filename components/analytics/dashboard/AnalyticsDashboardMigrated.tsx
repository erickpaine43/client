"use client";

import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { useMailboxes } from "@/hooks/useMailboxes";
import { useCampaignAnalytics } from "@/hooks/useCampaignAnalytics";
import { useDomainAnalytics } from "@/components/analytics/hooks/useDomainAnalytics";

// Import migrated components
import MigratedAnalyticsOverview from "./MigratedAnalyticsOverview";
import MigratedAnalyticsNavLinks from "./MigratedAnalyticsNavLinks";
import MigratedOverviewBarChart from "./MigratedOverviewBarChart";
import MigratedOverviewLineChart from "./MigratedOverviewLineChart";
import MigratedPerformanceFilter from "./MigratedPerformanceFilter";
import MigratedAnalyticsChartsLegend from "./MigratedAnalyticsChartsLegend";

// Import skeleton loaders
import {
  AnalyticsOverviewSkeleton,
  AnalyticsChartSkeleton,
} from "@/components/analytics/components/SkeletonLoaders";

/**
 * Migrated Analytics Dashboard Page with real-time updates and standardized field names.
 * Uses Convex subscriptions for live data and AnalyticsCalculator for rate calculations.
 */
function MigratedAnalyticsDashboard() {
  return (
    <AnalyticsProvider>
      <MigratedAnalyticsContent />
    </AnalyticsProvider>
  );
}

function MigratedAnalyticsContent() {
  const {
    mailboxes,
    loading: mailboxesLoading,
    error: mailboxesError,
  } = useMailboxes();

  // Real-time campaign analytics with Convex subscriptions
  const {
    data: campaignAnalytics,
    isLoading: campaignLoading,
    error: campaignError,
  } = useCampaignAnalytics();

  // Real-time domain analytics
  const {
    domains,
    isLoading: domainLoading,
    error: domainError,
  } = useDomainAnalytics();

  // Show loading state while mailboxes are loading
  if (mailboxesLoading) {
    return (
      <div className="space-y-10">
        <AnalyticsOverviewSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChartSkeleton />
          <AnalyticsChartSkeleton />
        </div>
      </div>
    );
  }

  // Show error state
  if (mailboxesError) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Error loading mailboxes: {mailboxesError}
      </div>
    );
  }

  // Show empty state if no mailboxes
  if (mailboxes.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Mailboxes Available
        </h3>
        <p className="text-gray-600">
          Please set up a mailbox to view analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Analytics Overview with real-time KPIs */}
      <Suspense fallback={<AnalyticsOverviewSkeleton />}>
        <MigratedAnalyticsOverview
          campaignAnalytics={campaignAnalytics}
          domainAnalytics={domains}
          loading={campaignLoading || domainLoading}
          error={campaignError || domainError}
        />
      </Suspense>

      {/* Navigation Links */}
      <MigratedAnalyticsNavLinks />

      {/* Bar Chart with real-time data */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Performance Overview - Bar Chart</CardTitle>
            <CardDescription>
              Real-time analytics with standardized metrics
            </CardDescription>
          </div>
          <MigratedPerformanceFilter
            campaignData={campaignAnalytics || []}
            mailboxes={mailboxes}
            loading={campaignLoading}
          />
        </CardHeader>
        <CardContent className="overflow-auto">
          <Suspense fallback={<AnalyticsChartSkeleton />}>
            <MigratedOverviewBarChart
              data={campaignAnalytics}
              loading={campaignLoading}
              error={campaignError}
            />
          </Suspense>
        </CardContent>
        <CardFooter className="flex items-center justify-center space-x-8">
          <MigratedAnalyticsChartsLegend />
        </CardFooter>
      </Card>

      {/* Line Chart with real-time data */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Performance Overview - Line Chart</CardTitle>
            <CardDescription>
              Time series view with live updates
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Suspense fallback={<AnalyticsChartSkeleton />}>
            <MigratedOverviewLineChart
              data={campaignAnalytics}
              loading={campaignLoading}
              error={campaignError}
            />
          </Suspense>
        </CardContent>
        <CardFooter className="flex items-center justify-center space-x-8">
          <MigratedAnalyticsChartsLegend />
        </CardFooter>
      </Card>
    </div>
  );
}

export default MigratedAnalyticsDashboard;
