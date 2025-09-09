"use client";
import AnalyticChartsLegend from "@/components/analytics/charts/AnalyticChartsLegend";
import AnalyticsOverview from "@/components/analytics/overview/analytics-overview";
import AnalyticsNavLinks from "@/components/analytics/nav/AnalyticsNavLinks";
import OverviewBarChat from "@/components/analytics/charts/OverviewBarChat";
import OverviewLineChart from "@/components/analytics/charts/OverviewLineChart";
import PerformanceFilter from "@/components/analytics/filters/PerformanceFilter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyticsProvider, useAnalytics } from "@/context/AnalyticsContext";
import { useMailboxes } from "@/hooks/useMailboxes";

function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <AnalyticsContent />
    </AnalyticsProvider>
  );
}

function AnalyticsContent() {
  const analytics = useAnalytics();

  // For now, use the context data, but we can modify to use real data
  const campaignData = analytics.campaignPerformanceData;
  const metrics = analytics.metrics;

  const { mailboxes, loading: mailboxesLoading, error: mailboxesError } = useMailboxes();

  if (mailboxesLoading) {
    return <div>Loading mailboxes...</div>;
  }

  if (mailboxesError) {
    return <div className="text-red-500">Error: {mailboxesError}</div>;
  }

  if (mailboxes.length === 0) {
    return <div>No mailboxes available. Please set up a mailbox to view analytics.</div>;
  }

  return (
    <div className="space-y-10">
      <AnalyticsOverview />
      <AnalyticsNavLinks />
      {/* Bar Chart  */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Performance Overview - Bar Chart</CardTitle>
          <PerformanceFilter campaignData={campaignData} mailboxes={mailboxes} metrics={metrics} />
        </CardHeader>
        <CardContent className="overflow-auto">
          <OverviewBarChat />
        </CardContent>
        <CardFooter className="flex items-center justify-center space-x-8 ">
          <AnalyticChartsLegend />
        </CardFooter>
      </Card>
      {/* line Chart  */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Performance Overview - Line Chart</CardTitle>
          <CardDescription>
            Same data, different visualization
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <OverviewLineChart />
        </CardContent>
        <CardFooter className="flex items-center justify-center space-x-8 ">
          <AnalyticChartsLegend />
        </CardFooter>
      </Card>
    </div>
  );
}
export default AnalyticsPage;
