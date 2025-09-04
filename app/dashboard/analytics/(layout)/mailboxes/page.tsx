"use client";
import AnalyticsNavLinks from "@/components/analytics/nav/AnalyticsNavLinks";
import AnalyticsStatistics from "@/components/analytics/components/analytics-statistics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAnalytics } from "@/context/AnalyticsContext";
import EmailMailboxesTable from "@/components/analytics/warmup/email-mailboxes-table";

function Page() {
  const { totalSent, openRate, replyRate, clickRate } = useAnalytics();

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
          <EmailMailboxesTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
