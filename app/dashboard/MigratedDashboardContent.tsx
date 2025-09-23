"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCampaignAnalytics } from "@/hooks/useCampaignAnalytics";

// Import migrated components
import MigratedKpiCards from "@/components/dashboard/cards/MigratedKpiCards";
import QuickActions from "@/components/dashboard/actions/QuickActions";
import RecentRepliesList from "@/components/inbox/RecentReply/RecentReplyList";
import WarmupSummary from "@/components/dashboard/summaries/WarmupSummary";

// Import skeleton loaders
import {
  KPISummaryCardSkeleton,
} from "@/components/analytics/components/SkeletonLoaders";
import RecentReplySkeleton from "@/components/inbox/RecentReply/RecentReplySkeleton";
import WarmupSummarySkeleton from "@/components/dashboard/summaries/WarmupSummarySkeleton";
import type { RecentReply } from "@/types/campaign";
import type { WarmupSummaryData } from "@/types/campaign";

// Import server actions (keeping existing ones for non-analytics data)
import {
  getRecentReplies,
  getWarmupSummaryData,
} from "@/lib/actions/dashboardActions";

/**
 * Migrated Dashboard Content with real-time analytics KPIs.
 * Replaces conflicting dashboard KPIs with AnalyticsCalculator calculations.
 * Uses standardized field names and Convex subscriptions for real-time updates.
 */
export default function MigratedDashboardContent() {
  // Real-time campaign analytics with Convex subscriptions
  const {
    data: campaignAnalytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useCampaignAnalytics();

  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening with your campaigns.
        </p>
      </div>

      {/* Migrated KPI Cards with real-time analytics */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <KPISummaryCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <MigratedKpiCards
          campaignAnalytics={campaignAnalytics}
          loading={analyticsLoading}
          error={analyticsError}
        />
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
                <RecentRepliesWrapper />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Warmup Summary */}
          <Suspense fallback={<WarmupSummarySkeleton />}>
            <WarmupSummaryWrapper />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component for Recent Replies to handle async data fetching
 */
function RecentRepliesWrapper() {
  const [recentReplies, setRecentReplies] = useState<RecentReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentReplies().then((data) => {
      setRecentReplies(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <RecentReplySkeleton />;
  }

  return <RecentRepliesList recentReplies={recentReplies} />;
}

/**
 * Wrapper component for Warmup Summary to handle async data fetching
 */
function WarmupSummaryWrapper() {
  const [warmupData, setWarmupData] = useState<WarmupSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWarmupSummaryData().then((data) => {
      setWarmupData(data);
      setLoading(false);
    });
  }, []);

  if (loading || !warmupData) {
    return <WarmupSummarySkeleton />;
  }

  return <WarmupSummary data={warmupData} />;
}
