"use client";
import AnalyticsNavLinks from "@/components/analytics/nav/AnalyticsNavLinks";
import AnalyticsStatistics from "@/components/analytics/components/analytics-statistics";
import CampaignPerformanceTable from "@/components/campaigns/analytics/CampaignPerformanceTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAnalytics } from "@/context/AnalyticsContext";

function Page() {
  const { totalSent, openRate, replyRate, clickRate, campaignPerformanceData } = useAnalytics();

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-responsive gap-4">
        <AnalyticsStatistics
          totalSent={totalSent}
          openRate={openRate}
          replyRate={replyRate}
          clickRate={clickRate}
        />
      </div>
      <AnalyticsNavLinks />
      <Card>
        <CardHeader>
          <CardTitle>Mailbox Performance Breakdown</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <CampaignPerformanceTable data={campaignPerformanceData} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
