// ============================================================================
// LEAD ANALYTICS REACT HOOKS - Real-time hooks for lead analytics
// ============================================================================

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useMemo } from "react";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { 
  AnalyticsFilters, 
  PerformanceMetrics 
} from "@/types/analytics/core";
import {
  LeadStatus
} from "@/types/analytics/domain-specific";
import { EmptyObject } from "react-hook-form";

/**
 * Hook for real-time lead analytics data.
 */
export function useLeadAnalytics(
  leadIds?: string[],
  filters?: AnalyticsFilters,
  companyId: string = "company-123"
) {
  const data = useQuery(
    api.leadAnalytics.getLeadAggregatedAnalytics,
    companyId ? {} : "skip"
  );

  const isLoading = data === undefined;

  // Transform data with calculated rates
  const transformedData = useMemo(() => {
    if (!data) return undefined;

    return data.map((lead) => {
      const rates = AnalyticsCalculator.calculateAllRates(lead.aggregatedMetrics);
      const healthScore = AnalyticsCalculator.calculateHealthScore(lead.aggregatedMetrics);

      return {
        ...lead,
        rates,
        healthScore,
        // Format rates for display
        displayOpenRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        displayClickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
        displayReplyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        displayBounceRate: AnalyticsCalculator.formatRateAsPercentage(rates.bounceRate),
        // Format numbers for display
        formattedSent: AnalyticsCalculator.formatNumber(lead.aggregatedMetrics.sent),
        formattedDelivered: AnalyticsCalculator.formatNumber(lead.aggregatedMetrics.delivered),
        formattedOpened: AnalyticsCalculator.formatNumber(lead.aggregatedMetrics.opened_tracked),
        formattedClicked: AnalyticsCalculator.formatNumber(lead.aggregatedMetrics.clicked_tracked),
        formattedReplied: AnalyticsCalculator.formatNumber(lead.aggregatedMetrics.replied),
      };
    });
  }, [data]);

  return {
    data: transformedData,
    isLoading,
    error: null, // Convex handles errors automatically
  };
}

/**
 * Hook for real-time lead engagement analytics with time series data.
 */
export function useLeadEngagementAnalytics(
  leadIds?: string[],
  filters?: AnalyticsFilters,
  companyId: string = "company-123"
) {
  const timeSeriesData = useQuery(
    api.leadAnalytics.getLeadEngagementAnalytics,
    companyId ? {} : "skip"
  );

  const aggregatedData = useQuery(
    api.leadAnalytics.getLeadAggregatedAnalytics,
    companyId ? {} : "skip"
  );

  const isTimeSeriesLoading = timeSeriesData === undefined;
  const isAggregatedLoading = aggregatedData === undefined;
  const isLoading = isTimeSeriesLoading || isAggregatedLoading;

  // Calculate engagement summary
  const engagementSummary = useMemo(() => {
    if (!aggregatedData) return undefined;

    const totalMetrics = aggregatedData.reduce(
      (acc, lead) => ({
        sent: acc.sent + lead.aggregatedMetrics.sent,
        delivered: acc.delivered + lead.aggregatedMetrics.delivered,
        opened_tracked: acc.opened_tracked + lead.aggregatedMetrics.opened_tracked,
        clicked_tracked: acc.clicked_tracked + lead.aggregatedMetrics.clicked_tracked,
        replied: acc.replied + lead.aggregatedMetrics.replied,
        bounced: acc.bounced + lead.aggregatedMetrics.bounced,
        unsubscribed: acc.unsubscribed + lead.aggregatedMetrics.unsubscribed,
        spamComplaints: acc.spamComplaints + lead.aggregatedMetrics.spamComplaints,
      }),
      {
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
      }
    );

    const rates = AnalyticsCalculator.calculateAllRates(totalMetrics);
    const engagementRate = AnalyticsCalculator.calculateEngagementRate(
      totalMetrics.opened_tracked,
      totalMetrics.clicked_tracked,
      totalMetrics.replied,
      totalMetrics.delivered
    );

    return {
      totalLeads: aggregatedData.length,
      totalMetrics,
      rates,
      engagementRate,
      formattedRates: {
        openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
        replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        engagementRate: AnalyticsCalculator.formatRateAsPercentage(engagementRate),
      },
    };
  }, [aggregatedData]);

  // Calculate top engaging leads
  const topEngagingLeads = useMemo(() => {
    if (!aggregatedData) return undefined;

    return aggregatedData
      .map((lead) => {
        const engagementScore = AnalyticsCalculator.calculateEngagementRate(
          lead.aggregatedMetrics.opened_tracked,
          lead.aggregatedMetrics.clicked_tracked,
          lead.aggregatedMetrics.replied,
          lead.aggregatedMetrics.delivered
        );

        return {
          leadId: lead.leadId,
          email: lead.email,
          company: lead.company,
          status: lead.status,
          engagementScore,
          formattedEngagementScore: AnalyticsCalculator.formatRateAsPercentage(engagementScore),
          totalInteractions: lead.aggregatedMetrics.opened_tracked + 
                            lead.aggregatedMetrics.clicked_tracked + 
                            lead.aggregatedMetrics.replied,
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 10);
  }, [aggregatedData]);

  return {
    timeSeriesData,
    engagementSummary,
    topEngagingLeads,
    isLoading,
    isTimeSeriesLoading,
    isAggregatedLoading,
  };
}

/**
 * Hook for lead list metrics.
 */
export function useLeadListMetrics(
  leadIds: string[],
  filters?: AnalyticsFilters,
  companyId: string = "company-123"
) {
  const data = useQuery(
    api.leadAnalytics.getLeadListMetrics,
    companyId ? {
      leadIds: leadIds || [],
      dateRange: filters?.dateRange,
      companyId,
    } : "skip"
  );

  const isLoading = data === undefined;

  // Transform data with formatted values
  const transformedData = useMemo(() => {
    if (!data) return undefined;

    const rates = AnalyticsCalculator.calculateAllRates(data.totalMetrics);

    return {
      ...data,
      rates,
      formattedRates: {
        openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
        replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        bounceRate: AnalyticsCalculator.formatRateAsPercentage(rates.bounceRate),
      },
      formattedMetrics: {
        sent: AnalyticsCalculator.formatNumber(data.totalMetrics.sent),
        delivered: AnalyticsCalculator.formatNumber(data.totalMetrics.delivered),
        opened: AnalyticsCalculator.formatNumber(data.totalMetrics.opened_tracked),
        clicked: AnalyticsCalculator.formatNumber(data.totalMetrics.clicked_tracked),
        replied: AnalyticsCalculator.formatNumber(data.totalMetrics.replied),
      },
      statusBreakdownFormatted: data.statusBreakdown.map(status => ({
        ...status,
        formattedPercentage: AnalyticsCalculator.formatRateAsPercentage(status.percentage),
      })),
    };
  }, [data]);

  return {
    data: transformedData,
    isLoading,
  };
}

/**
 * Hook for lead analytics mutations.
 */
export function useLeadAnalyticsMutations() {
  const upsertLeadAnalytics = useMutation(api.leadAnalytics.upsertLeadAnalytics);
  const batchInsertLeadAnalytics = useMutation(api.leadAnalytics.batchInsertLeadAnalytics);
  const deleteLeadAnalytics = useMutation(api.leadAnalytics.deleteLeadAnalytics);

  const updateLeadAnalytics = useCallback(
    async (data: {
      leadId: string;
      email: string;
      company?: string;
      date: string;
      sent: number;
      delivered: number;
      opened_tracked: number;
      clicked_tracked: number;
      replied: number;
      bounced: number;
      unsubscribed: number;
      spamComplaints: number;
      status: LeadStatus;
      companyId: string;
    }) => {
      try {
        return await upsertLeadAnalytics({
          leadId: data.leadId,
          email: data.email,
          company: data.company,
          date: data.date,
          sent: data.sent,
          delivered: data.delivered,
          opened_tracked: data.opened_tracked,
          clicked_tracked: data.clicked_tracked,
          replied: data.replied,
          bounced: data.bounced,
          unsubscribed: data.unsubscribed,
          spamComplaints: data.spamComplaints,
          status: data.status,
          companyId: data.companyId,
        } as unknown as EmptyObject);
      } catch (error) {
        console.error("Failed to update lead analytics:", error);
        throw error;
      }
    },
    [upsertLeadAnalytics]
  );

  const batchUpdateLeadAnalytics = useCallback(
    async (records: Array<{
      leadId: string;
      email: string;
      company?: string;
      date: string;
      sent: number;
      delivered: number;
      opened_tracked: number;
      clicked_tracked: number;
      replied: number;
      bounced: number;
      unsubscribed: number;
      spamComplaints: number;
      status: LeadStatus;
      companyId: string;
    }>) => {
      try {
        return await batchInsertLeadAnalytics({ records });
      } catch (error) {
        console.error("Failed to batch update lead analytics:", error);
        throw error;
      }
    },
    [batchInsertLeadAnalytics]
  );

  const removeLeadAnalytics = useCallback(
    async (leadId: string, companyId: string, date?: string) => {
      try {
        return await deleteLeadAnalytics({ leadId, companyId, date });
      } catch (error) {
        console.error("Failed to delete lead analytics:", error);
        throw error;
      }
    },
    [deleteLeadAnalytics]
  );

  return {
    updateLeadAnalytics,
    batchUpdateLeadAnalytics,
    removeLeadAnalytics,
  };
}

/**
 * Hook for optimistic lead analytics updates.
 */
export function useOptimisticLeadAnalytics(
  leadIds?: string[],
  filters?: AnalyticsFilters,
  companyId: string = "company-123"
) {
  const { data, isLoading } = useLeadAnalytics(leadIds, filters, companyId);
  const { updateLeadAnalytics } = useLeadAnalyticsMutations();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, PerformanceMetrics>>(new Map());

  // Apply optimistic updates to data
  const dataWithOptimisticUpdates = useMemo(() => {
    if (!data) return undefined;

    return data.map((lead) => {
      const optimisticUpdate = optimisticUpdates.get(lead.leadId);
      if (!optimisticUpdate) return lead;

      // Apply optimistic update
      const updatedMetrics = { ...lead.aggregatedMetrics, ...optimisticUpdate };
      const rates = AnalyticsCalculator.calculateAllRates(updatedMetrics);
      const healthScore = AnalyticsCalculator.calculateHealthScore(updatedMetrics);

      return {
        ...lead,
        aggregatedMetrics: updatedMetrics,
        rates,
        healthScore,
        displayOpenRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        displayClickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
        displayReplyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        displayBounceRate: AnalyticsCalculator.formatRateAsPercentage(rates.bounceRate),
      };
    });
  }, [data, optimisticUpdates]);

  const updateWithOptimisticUI = useCallback(
    async (leadId: string, updates: Partial<PerformanceMetrics>) => {
      // Apply optimistic update immediately
      setOptimisticUpdates(prev => new Map(prev.set(leadId, updates as PerformanceMetrics)));

      try {
        // Find the lead to get current data
        const lead = data?.find(l => l.leadId === leadId);
        if (!lead) {
          throw new Error("Lead not found");
        }

        // Update server data
        await updateLeadAnalytics({
          leadId,
          email: lead.email,
          company: lead.company,
          date: new Date().toISOString().split("T")[0],
          companyId,
          status: lead.status,
          sent: updates.sent || lead.aggregatedMetrics.sent,
          delivered: updates.delivered || lead.aggregatedMetrics.delivered,
          opened_tracked: updates.opened_tracked || lead.aggregatedMetrics.opened_tracked,
          clicked_tracked: updates.clicked_tracked || lead.aggregatedMetrics.clicked_tracked,
          replied: updates.replied || lead.aggregatedMetrics.replied,
          bounced: updates.bounced || lead.aggregatedMetrics.bounced,
          unsubscribed: updates.unsubscribed || lead.aggregatedMetrics.unsubscribed,
          spamComplaints: updates.spamComplaints || lead.aggregatedMetrics.spamComplaints,
        });

        // Clear optimistic update after successful server update
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(leadId);
          return newMap;
        });
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(leadId);
          return newMap;
        });
        throw error;
      }
    },
    [data, updateLeadAnalytics, companyId]
  );

  return {
    data: dataWithOptimisticUpdates,
    isLoading,
    updateWithOptimisticUI,
    hasOptimisticUpdates: optimisticUpdates.size > 0,
  };
}

/**
 * Hook for comprehensive lead analytics with all data types.
 */
export function useComprehensiveLeadAnalytics(
  leadIds?: string[],
  filters?: AnalyticsFilters,
  companyId: string = "company-123"
) {
  const { data: leadData, isLoading: isLeadDataLoading } = useLeadAnalytics(leadIds, filters, companyId);
  const { 
    timeSeriesData, 
    engagementSummary, 
    topEngagingLeads,
    isLoading: isEngagementLoading 
  } = useLeadEngagementAnalytics(leadIds, filters, companyId);

  const isLoading = isLeadDataLoading || isEngagementLoading;

  // Calculate comprehensive metrics
  const comprehensiveMetrics = useMemo(() => {
    if (!leadData || !engagementSummary) return undefined;

    const statusCounts = leadData.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<LeadStatus, number>);

    return {
      totalLeads: leadData.length,
      statusBreakdown: statusCounts,
      overallEngagement: engagementSummary.engagementRate,
      averageHealthScore: leadData.reduce((sum, lead) => sum + lead.healthScore, 0) / leadData.length,
      topPerformers: topEngagingLeads?.slice(0, 5) || [],
      trends: {
        // Calculate simple trends from time series data
        openTrend: timeSeriesData && timeSeriesData.length > 1 
          ? (timeSeriesData[timeSeriesData.length - 1].metrics.opened_tracked - timeSeriesData[0].metrics.opened_tracked) / Math.max(timeSeriesData[0].metrics.opened_tracked, 1)
          : 0,
        replyTrend: timeSeriesData && timeSeriesData.length > 1
          ? (timeSeriesData[timeSeriesData.length - 1].metrics.replied - timeSeriesData[0].metrics.replied) / Math.max(timeSeriesData[0].metrics.replied, 1)
          : 0,
      },
    };
  }, [leadData, engagementSummary, topEngagingLeads, timeSeriesData]);

  return {
    leadData,
    timeSeriesData,
    engagementSummary,
    topEngagingLeads,
    comprehensiveMetrics,
    isLoading,
  };
}
