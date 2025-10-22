"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/analytics/cards/StatsCard";
import { useAnalytics } from "@/context/AnalyticsContext";
import { mapRawToLegacyMailboxData } from "@/lib/utils/analytics-mappers";
import { AlertTriangle, Mail, MessageSquare, Zap } from "lucide-react";

interface Mailbox {
  id: string;
  name: string;
  email: string;
  status: string;
  warmupProgress: number;
  dailyVolume: number;
  healthScore: number;
}

function WarmupStatsOverview({ mailbox }: { mailbox: Mailbox }) {
  const { fetchMailboxAnalytics } = useAnalytics();
  // Keep local state as legacy UI shape using the mapper's return type to avoid directly depending
  // on legacy type symbols in multiple places.
  const [analyticsData, setAnalyticsData] = useState<ReturnType<
    typeof mapRawToLegacyMailboxData
  > | null>(null); // Migration note: mailbox analytics state always set via mapper, legacy type dependency removed.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchMailboxAnalytics(mailbox.id);
        // Map raw/legacy result into the legacy UI shape explicitly.
        setAnalyticsData(mapRawToLegacyMailboxData(data ?? {}));
      } catch (err) {
        setError("Failed to load analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [mailbox.id, fetchMailboxAnalytics]);

  if (loading) {
    return (
      <div className="grid grid-cols-responsive gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-200 rounded-lg h-16"
          ></div>
        ))}
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-4 text-center text-red-500">
        {error || "No analytics data available"}
      </div>
    );
  }

  // Use real data from analytics context instead of computing from dailyStats
  const stats = [
    {
      label: "Health Score",
      value: `${analyticsData.healthScore}%`,
      icon: Zap,
      color: "bg-green-100 ",
      textColor: "text-green-600",
    },
    {
      label: "Warmup Progress",
      value: `${analyticsData.warmupProgress}%`,
      icon: Mail,
      color: "bg-blue-100 ",
      textColor: "text-blue-600",
    },
    {
      label: "Total Sent",
      value: (analyticsData.totalWarmups ?? 0).toLocaleString(),
      icon: MessageSquare,
      color: "bg-green-100 ",
      textColor: "text-green-600",
    },
    {
      label: "Spam Complaints",
      // legacy field spamFlags maps to spam complaints in UI
      value: (analyticsData.spamFlags ?? 0).toLocaleString(),
      icon: AlertTriangle,
      color: "bg-red-100 ",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-responsive gap-4">
      {stats.map((stat) => (
        <StatsCard
          key={stat.label}
          title={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          className={stat.textColor}
        />
      ))}
    </div>
  );
}
export default WarmupStatsOverview;
