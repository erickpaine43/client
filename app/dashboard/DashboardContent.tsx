import KpiCards from "@/components/dashboard/cards/KpiCards";
import QuickActions from "@/components/dashboard/actions/QuickActions";
import RecentRepliesList from "@/components/inbox/RecentReply/RecentReplyList";
import RecentReplySkeleton from "@/components/inbox/RecentReply/RecentReplySkeleton";
import StatsCardSkeleton from "@/components/dashboard/cards/KpiCardSkeleton";
import WarmupSummary from "@/components/dashboard/summaries/WarmupSummary";
import WarmupSummarySkeleton from "@/components/dashboard/summaries/WarmupSummarySkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Suspense } from "react";
import { getStatsCards, getRecentReplies, getWarmupSummaryData } from "@/lib/actions/dashboard";

export default async function DashboardContent() {
  const statsCards = await getStatsCards();
  const recentReplies = await getRecentReplies();
  const warmupSummaryData = await getWarmupSummaryData();
  return (
    <div className=" mx-auto  space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening with your campaigns.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <KpiCards cards={statsCards} />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 gap-0">
            <CardHeader className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Replies
              </h2>
            </CardHeader>
            <CardContent className="divide-y divide-gray-200 p-0">
              <Suspense
                fallback={
                  <div className="space-y-0">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RecentReplySkeleton key={index} />
                    ))}
                  </div>
                }
              >
                <RecentRepliesList recentReplies={recentReplies} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Warmup Summary */}
          <Suspense fallback={<WarmupSummarySkeleton />}>
            <WarmupSummary data={warmupSummaryData} />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
