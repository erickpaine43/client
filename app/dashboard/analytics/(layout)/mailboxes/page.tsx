import AnalyticsNavLinks from "@/components/analytics/nav/AnalyticsNavLinks";
import AnalyticsStatistics from "@/components/analytics/components/analytics-statistics";
import CampaignPerformanceTable from "@/components/campaigns/analytics/CampaignPerformanceTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function page() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-responsive gap-4">
        <AnalyticsStatistics
          totalSent={1000}
          openRate={75}
          replyRate={25}
          clickRate={50}
        />
      </div>
      <AnalyticsNavLinks />
      <Card>
        <CardHeader>
          <CardTitle>Mailbox Performance Breakdown</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <CampaignPerformanceTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
