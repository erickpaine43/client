"use client";
import CampaignTableSkeleton from "@/components/campaigns/tables/CampaignTableSkeleton";
import CampaignsFilter from "@/components/campaigns/tables/CampaignsFilter";
import CampaignsTable, {
  campaignColumns,
} from "@/components/campaigns/tables/CampaignsTable";
import StatsCardSkeleton from "@/components/dashboard/cards/StatsCardSkeleton";
import StatsCards from "@/components/campaigns/reports/StatsCards";
import { Button } from "@/components/ui/button";
import { Plus, Send, Mail, Eye, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useAnalytics } from "@/context/AnalyticsContext";

interface CampaignsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default function CampaignsPage({
  searchParams: _searchParams,
}: CampaignsPageProps) {
  const { totalSent, openRate, replyRate, clickRate, campaigns } = useAnalytics();

  const stats = [
    {
      title: "Total Campaigns",
      value: campaigns.length.toString(),
      icon: Send,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Sent",
      value: Number(totalSent).toLocaleString(),
      icon: Mail,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Open Rate",
      value: openRate + '%',
      icon: Eye,
      color: "text-orange-500  bg-orange-100",
    },
    {
      title: "Click Rate",
      value: clickRate + '%',
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Reply Rate",
      value: replyRate + '%',
      icon: Users,
      color: "text-pink-600 bg-pink-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Manage your email outreach campaigns like a pro
          </p>
        </div>
        <Button asChild>
          <Link href="campaigns/create">
            <Plus className="w-5 h-5" />
            <span className="font-semibold">New Campaign</span>
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <Suspense
          fallback={Array.from({ length: 5 }).map((_, index) => (
            <StatsCardSkeleton
              key={index}
              className="flex-row-reverse justify-end gap-2 "
            />
          ))}
        >
          <StatsCards stats={stats} />
        </Suspense>
      </div>
      <CampaignsFilter />

      <Suspense
        fallback={
          <CampaignTableSkeleton
            title="Campaigns Table"
            columns={campaignColumns}
          />
        }
      >
        <CampaignsTable />
      </Suspense>
    </div>
  );
}
