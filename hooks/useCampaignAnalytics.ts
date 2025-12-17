"use client";

import { useMemo, useCallback } from "react";
import { CampaignAnalytics } from "@/types/analytics/domain-specific";
import { convexCampaignAnalytics } from "@/lib/data/analytics-convex.mock";
import {
  updateCampaignAnalytics
} from "@/lib/actions/analytics/campaign-analytics";

// Import Convex hooks - will be mocked in tests
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Real-time campaign analytics hook using Convex subscriptions.
 * Provides live updates when campaign data changes in the database.
 * Falls back to mock data when Convex is not available.
 */
export function useCampaignAnalytics(
  campaignIds?: string[],
  companyId?: string
) {
  // Try to use Convex query for real-time data
  const convexData = useQuery(
    api.campaignAnalytics?.getCampaignAnalytics,
    campaignIds && companyId ? {} : "skip"
  );

  // Transform and memoize the data
  const data = useMemo(() => {
    // If Convex data is null (error state), return empty array
    if (convexData === null) {
      return [];
    }

    // If Convex data is available (including empty array), use it
    if (convexData !== undefined) {
      return Array.isArray(convexData)
        ? (convexData as unknown as CampaignAnalytics[])
        : [];
    }

    // If we're in loading state, return empty array
    if (campaignIds && companyId && convexData === undefined) {
      return [];
    }

    // Fall back to mock data for development/demo
    if (campaignIds && campaignIds.length > 0) {
      return convexCampaignAnalytics.filter(campaign => 
        campaignIds.includes(campaign.campaignId)
      );
    }

    // Return all mock data if no specific campaigns requested
    return convexCampaignAnalytics;
  }, [convexData, campaignIds, companyId]);

  // Determine loading state - only loading if we expect Convex data but don't have it yet
  const isLoading = useMemo(() => {
    // If we have campaign IDs and company ID but no Convex data yet, we're loading
    // But only if convexData is specifically undefined (not null or empty array)
    if (campaignIds && companyId && convexData === undefined) {
      return true;
    }
    return false;
  }, [convexData, campaignIds, companyId]);

  // Error handling
  const error = useMemo(() => {
    // For now, we don't have specific error handling from Convex
    // In a real implementation, this would come from the Convex query
    return null;
  }, []);

  return {
    data,
    isLoading,
    error,
    // Additional helper methods
    refetch: () => {
      // In a real implementation, this would trigger a refetch
      console.log("Refetching campaign analytics...");
    },
    isEmpty: data.length === 0,
    totalCampaigns: data.length,
  };
}

/**
 * Hook for getting campaign performance metrics with real-time updates.
 * Provides formatted data ready for display components.
 */
interface CampaignFilters {
  dateRange?: "7d" | "30d" | "90d" | "all";
  selectedCampaigns?: string[];
}

// Adapter: convert AnalyticsFilters (with explicit start/end) to CampaignFilters
export function analyticsDateRangeToCampaignRange(
  dateRange?: { start: string; end: string } | "7d" | "30d" | "90d" | "all"
): CampaignFilters["dateRange"] {
  if (!dateRange) return undefined;
  if (typeof dateRange === "string") return dateRange;
  // Heuristic: map recent ranges based on span length
  try {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return "7d";
    if (diffDays <= 30) return "30d";
    if (diffDays <= 90) return "90d";
    return "all";
  } catch {
    return undefined;
  }
}

export function useCampaignPerformanceMetrics(
  campaignIds?: string[],
  filters?: CampaignFilters,
  companyId?: string
) {
  const { data, isLoading, error } = useCampaignAnalytics(campaignIds, companyId);

  // Apply filters and format data for display
  const formattedData = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // Apply date range filter
    if (filters?.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // No filter
      }

      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign.updatedAt || 0);
        return campaignDate >= startDate;
      });
    }

    // Apply campaign name filter
    if (filters?.selectedCampaigns && filters.selectedCampaigns.length > 0) {
      filtered = filtered.filter(campaign =>
        filters.selectedCampaigns!.includes(campaign.campaignName)
      );
    }

    // Add formatted display properties
    return filtered.map(campaign => ({
      ...campaign,
      displayOpenRate: campaign.sent > 0 ? `${((campaign.opened_tracked / campaign.sent) * 100).toFixed(1)}%` : "0.0%",
      displayClickRate: campaign.sent > 0 ? `${((campaign.clicked_tracked / campaign.sent) * 100).toFixed(1)}%` : "0.0%",
      displayReplyRate: campaign.sent > 0 ? `${((campaign.replied / campaign.sent) * 100).toFixed(1)}%` : "0.0%",
      displayDeliveryRate: campaign.sent > 0 ? `${((campaign.delivered / campaign.sent) * 100).toFixed(1)}%` : "0.0%",
      displayBounceRate: campaign.sent > 0 ? `${((campaign.bounced / campaign.sent) * 100).toFixed(1)}%` : "0.0%",
      displayUnsubscribeRate: campaign.sent > 0 ? `${((campaign.unsubscribed / campaign.sent) * 100).toFixed(1)}%` : "0.0%",
      healthScore: 85, // Mock health score - in real implementation would be calculated
    }));
  }, [data, filters]);

  return {
    data: formattedData,
    isLoading,
    error,
    totalCampaigns: formattedData.length,
    isEmpty: formattedData.length === 0,
  };
}



/**
 * Hook for getting campaign time series data for charts.
 * Enhanced version with proper parameters for real-time updates.
 */
export function useCampaignTimeSeriesData(
  campaignIds?: string[],
  filters?: CampaignFilters,
  _granularity: "day" | "week" | "month" = "day",
  companyId?: string
) {
  const { data, isLoading, error } = useCampaignAnalytics(campaignIds, companyId);

  const timeSeriesData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Apply filters if provided
    let filteredData = [...data];
    if (filters?.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filteredData = filteredData.filter(campaign => {
        const campaignDate = new Date(campaign.updatedAt || 0);
        return campaignDate >= startDate;
      });
    }

    // Transform campaign data to time series format
    return filteredData.map((campaign) => ({
      date: campaign.updatedAt 
        ? new Date(campaign.updatedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      label: new Date(campaign.updatedAt || Date.now()).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      metrics: {
        sent: campaign.sent,
        delivered: campaign.delivered,
        opened_tracked: campaign.opened_tracked,
        clicked_tracked: campaign.clicked_tracked,
        replied: campaign.replied,
        bounced: campaign.bounced,
        unsubscribed: campaign.unsubscribed,
        spamComplaints: campaign.spamComplaints,
      },
      displayData: {
        sent: campaign.sent,
        delivered: campaign.delivered,
        opened: campaign.opened_tracked,
        clicked: campaign.clicked_tracked,
        replied: campaign.replied,
        bounced: campaign.bounced,
        openRate: campaign.sent > 0 ? (campaign.opened_tracked / campaign.sent) * 100 : 0,
        clickRate: campaign.sent > 0 ? (campaign.clicked_tracked / campaign.sent) * 100 : 0,
        replyRate: campaign.sent > 0 ? (campaign.replied / campaign.sent) * 100 : 0,
      },
    }));
  }, [data, filters]);

  return {
    data: timeSeriesData,
    isLoading,
    error,
    isEmpty: timeSeriesData.length === 0,
  };
}

/**
 * Hook for getting aggregated campaign analytics overview.
 * Enhanced version with better formatting and real-time updates.
 */
export function useCampaignAnalyticsOverview(filters?: CampaignFilters, companyId?: string) {
  const { data, isLoading, error } = useCampaignAnalytics(undefined, companyId);

  const overviewData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        overview: {
          totalCampaigns: 0,
          activeCampaigns: 0,
          completedCampaigns: 0,
          pausedCampaigns: 0,
          draftCampaigns: 0,
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalReplied: 0,
          totalBounced: 0,
          totalUnsubscribed: 0,
          totalSpamComplaints: 0,
          displayOpenRate: "0.0%",
          displayClickRate: "0.0%",
          displayReplyRate: "0.0%",
          displayDeliveryRate: "0.0%",
          displayBounceRate: "0.0%",
        },
        topPerformingCampaigns: [],
        metadata: {
          dateRange: filters?.dateRange || { start: "", end: "" },
          generatedAt: Date.now(),
          dataPos: 0,
        },
      };
    }

    // Apply filters if provided
    let filteredData = [...data];
    if (filters?.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filteredData = filteredData.filter(campaign => {
        const campaignDate = new Date(campaign.updatedAt || 0);
        return campaignDate >= startDate;
      });
    }

    const totals = {
      totalCampaigns: filteredData.length,
      activeCampaigns: filteredData.filter(c => c.status === "ACTIVE").length,
      completedCampaigns: filteredData.filter(c => c.status === "COMPLETED").length,
      pausedCampaigns: filteredData.filter(c => c.status === "PAUSED").length,
      draftCampaigns: filteredData.filter(c => c.status === "DRAFT").length,
      totalSent: filteredData.reduce((sum, c) => sum + c.sent, 0),
      totalDelivered: filteredData.reduce((sum, c) => sum + c.delivered, 0),
      totalOpened: filteredData.reduce((sum, c) => sum + c.opened_tracked, 0),
      totalClicked: filteredData.reduce((sum, c) => sum + c.clicked_tracked, 0),
      totalReplied: filteredData.reduce((sum, c) => sum + c.replied, 0),
      totalBounced: filteredData.reduce((sum, c) => sum + c.bounced, 0),
      totalUnsubscribed: filteredData.reduce((sum, c) => sum + c.unsubscribed, 0),
      totalSpamComplaints: filteredData.reduce((sum, c) => sum + c.spamComplaints, 0),
    };

    const overview = {
      ...totals,
      displayOpenRate: totals.totalSent > 0 ? `${((totals.totalOpened / totals.totalSent) * 100).toFixed(1)}%` : "0.0%",
      displayClickRate: totals.totalSent > 0 ? `${((totals.totalClicked / totals.totalSent) * 100).toFixed(1)}%` : "0.0%",
      displayReplyRate: totals.totalSent > 0 ? `${((totals.totalReplied / totals.totalSent) * 100).toFixed(1)}%` : "0.0%",
      displayDeliveryRate: totals.totalSent > 0 ? `${((totals.totalDelivered / totals.totalSent) * 100).toFixed(1)}%` : "0.0%",
      displayBounceRate: totals.totalSent > 0 ? `${((totals.totalBounced / totals.totalSent) * 100).toFixed(1)}%` : "0.0%",
    };

    const topPerformingCampaigns = filteredData
      .map(campaign => ({
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        replyRate: campaign.sent > 0 ? campaign.replied / campaign.sent : 0,
        totalReplies: campaign.replied,
        displayReplyRate: campaign.sent > 0 ? `${((campaign.replied / campaign.sent) * 100).toFixed(1)}%` : "0.0%",
      }))
      .sort((a, b) => b.replyRate - a.replyRate)
      .slice(0, 5);

    return {
      overview,
      topPerformingCampaigns,
      metadata: {
        dateRange: filters?.dateRange || { start: "", end: "" },
        generatedAt: Date.now(),
        dataPos: filteredData.length,
      },
    };
  }, [data, filters]);

  return {
    data: overviewData,
    isLoading,
    error,
  };
}

/**
 * Hook for optimistic campaign analytics updates.
 * Provides immediate UI feedback while syncing with server.
 */
export function useOptimisticCampaignAnalytics(
  campaignIds?: string[],
  filters?: CampaignFilters,
  companyId?: string
) {
  const { data: baseData, isLoading, error } = useCampaignAnalytics(campaignIds, companyId);
  
  const updateWithOptimisticUI = useCallback(async (campaignId: string, updates: Partial<CampaignAnalytics>) => {
    try {
      console.log("Optimistic update:", { campaignId, updates });

      // Call the server action
      const result = await updateCampaignAnalytics(campaignId, updates);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update campaign analytics');
      }

      console.log("Optimistic update completed:", { campaignId, updates });
      return result.data;
    } catch (error) {
      console.error("Optimistic update failed:", error);
      throw error;
    }
  }, []);

  return {
    data: baseData,
    isLoading,
    error,
    updateWithOptimisticUI,
  };
}
