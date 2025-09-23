"use client";

import { useState, useEffect } from "react";
import { getCampaignAnalytics, getUserCampaigns } from "@/lib/actions/campaigns";
import { ChartData } from "@/types/campaign";

export function useCampaignStats(timeRange: 7 | 14 | 30) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get campaigns for this user/company
        const campaignsResult = await getUserCampaigns();
        if (!campaignsResult.success) {
          throw new Error(campaignsResult.error?.message || 'Failed to get campaigns');
        }

        // Step 2: Pass campaigns to analytics function to generate timeseries data
        const analyticsResult = await getCampaignAnalytics(
          campaignsResult.data || [],
          timeRange
        );
        if (!analyticsResult.success) {
          throw new Error(analyticsResult.error?.message || 'Failed to get campaign analytics');
        }
        
        // Transform analytics data to chart format
        const chartData = analyticsResult.data?.ChartData?.map((point) => ({
          date: point.date,
          sent: point.sent,
          opened: point.opened_tracked,
          clicked: point.clicked_tracked,
          replied: point.replied,
          bounced: point.bounced,
          formattedDate: point.formattedDate,
        })) || [];
        
        setData(chartData);
      } catch (err) {
        console.error("Failed to fetch campaign analytics data:", err);
        setError("Failed to load campaign analytics data");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [timeRange]);

  return { data, loading, error };
}
