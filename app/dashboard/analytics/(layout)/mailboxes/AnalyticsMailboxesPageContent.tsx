"use client";
import AnalyticsNavLinks from "@/components/analytics/nav/AnalyticsNavLinks";
import AnalyticsStatistics from "@/components/analytics/components/analytics-statistics";
import { useAnalytics } from "@/context/AnalyticsContext";
import EmailMailboxesTable from "@/components/analytics/warmup/email-mailboxes-table";

function AnalyticsMailboxesPageContent() {
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
      <EmailMailboxesTable />
    </div>
  );
}

export default AnalyticsMailboxesPageContent;
