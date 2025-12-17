// ============================================================================
// ANALYTICS QUERIES - EXTRACTED FROM MAIN ANALYTICS FILE
// ============================================================================

import { query } from "../_generated/server";
import type { CampaignStatus } from "@/types/campaign";

import {
  campaignAnalyticsQuerySchema,
  analyticsOverviewQuerySchema,
  campaignComparisonQuerySchema
} from "./validation";
import {
  getDefaultDateRange,
  getNumericMetrics,
  calculateTotalMetrics,
  calculatePerformanceRates
} from "./calculations";
import type {
  GetComprehensiveCampaignAnalyticsArgs,
  ComprehensiveCampaignAnalyticsResponse,
  GetAnalyticsOverviewArgs,
  AnalyticsOverviewResponse,
  CampaignComparisonResult,
  CampaignAnalytics,
  CampaignPerformanceMetrics,
  BaseMetrics,
} from "./types";

// ============================================================================
// COMPREHENSIVE CAMPAIGN ANALYTICS QUERY
// ============================================================================

/**
 * Get comprehensive campaign analytics including sequence and time series data.
 * This is the main entry point for campaign analytics with all related data.
 *
 * @param args - Arguments for the query
 * @returns Comprehensive analytics data including campaigns, time series, and sequence data
 */
export const getComprehensiveCampaignAnalytics = query({
  args: campaignAnalyticsQuerySchema,
  handler: async (ctx, args: GetComprehensiveCampaignAnalyticsArgs): Promise<ComprehensiveCampaignAnalyticsResponse> => {
    // Get campaign analytics - using direct database query as fallback
    const campaignAnalyticsResult = await ctx.db.query("campaignAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
      .filter((q) => {
        type BoolExpr = ReturnType<typeof q.and>;
        let pred: BoolExpr | boolean | undefined;
        const add = (e: BoolExpr | boolean) => {
          pred = pred ? q.and(pred, e) : e;
        };

        if (args.dateRange?.start) add(q.gte(q.field("date"), args.dateRange.start));
        if (args.dateRange?.end) add(q.lte(q.field("date"), args.dateRange.end));
        if (args.campaignIds?.length) {
          add(q.or(...args.campaignIds.map(id => q.eq(q.field("campaignId"), id))));
        }

        return pred ?? true;
      })
      .collect();

    // Aggregate the results (simplified version of getCampaignAggregatedAnalytics)
    const campaignAnalytics = campaignAnalyticsResult.map(record => ({
      campaignId: record.campaignId,
      campaignName: record.campaignName,
      status: record.status,
      leadCount: record.leadCount || 0,
      activeLeads: record.activeLeads || 0,
      completedLeads: record.completedLeads || 0,
      updatedAt: record.updatedAt,
      aggregatedMetrics: {
        sent: record.sent || 0,
        delivered: record.delivered || 0,
        opened_tracked: record.opened_tracked || 0,
        clicked_tracked: record.clicked_tracked || 0,
        replied: record.replied || 0,
        bounced: record.bounced || 0,
        unsubscribed: record.unsubscribed || 0,
        spamComplaints: record.spamComplaints || 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
        complaintRate: 0,
      }
    }));

    // Get time series data if requested (simplified implementation)
    let timeSeriesData = null;
    if (args.includeTimeSeriesData) {
      timeSeriesData = []; // Placeholder - would need full implementation
    }

    // Get sequence data if requested (simplified implementation)
    let sequenceAnalytics: Record<string, unknown> | null = null;
    if (args.includeSequenceData && args.campaignIds) {
      sequenceAnalytics = {}; // Placeholder - would need full implementation
    }

    return {
      campaigns: campaignAnalytics,
      timeSeriesData,
      sequenceAnalytics,
      metadata: {
        dateRange: args.dateRange,
        campaignCount: campaignAnalytics.length,
        includesSequenceData: Boolean(args.includeSequenceData),
        includesTimeSeriesData: Boolean(args.includeTimeSeriesData),
        generatedAt: Date.now(),
      },
    };
  },
});

// ============================================================================
// ANALYTICS OVERVIEW QUERY
// ============================================================================

/**
 * Get analytics overview for dashboard.
 * Returns high-level metrics across all campaigns.
 *
 * @param args - Arguments for the query
 * @returns Analytics overview data including metrics, status counts, and top campaigns
 */
export const getAnalyticsOverview = query({
  args: analyticsOverviewQuerySchema,
  handler: async (ctx, args: GetAnalyticsOverviewArgs): Promise<AnalyticsOverviewResponse> => {
    const dateRange = args.dateRange || getDefaultDateRange();

    // Get all campaign analytics for the period using direct database query
    const rawCampaigns = await ctx.db.query("campaignAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
      .filter((q) => {
        type BoolExpr = ReturnType<typeof q.and>;
        let pred: BoolExpr | boolean | undefined;
        const add = (e: BoolExpr | boolean) => {
          pred = pred ? q.and(pred, e) : e;
        };

        if (dateRange.start) add(q.gte(q.field("date"), dateRange.start));
        if (dateRange.end) add(q.lte(q.field("date"), dateRange.end));

        return pred ?? true;
      })
      .collect();

    const allCampaigns: CampaignAnalytics[] = rawCampaigns.map(record => ({
      campaignId: record.campaignId,
      campaignName: record.campaignName,
      status: record.status,
      leadCount: record.leadCount || 0,
      activeLeads: record.activeLeads || 0,
      completedLeads: record.completedLeads || 0,
      updatedAt: record.updatedAt,
      aggregatedMetrics: {
        sent: record.sent || 0,
        delivered: record.delivered || 0,
        opened_tracked: record.opened_tracked || 0,
        clicked_tracked: record.clicked_tracked || 0,
        replied: record.replied || 0,
        bounced: record.bounced || 0,
        unsubscribed: record.unsubscribed || 0,
        spamComplaints: record.spamComplaints || 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
        complaintRate: 0,
      }
    }));

    // Calculate overview metrics
    const totalMetrics = calculateTotalMetrics(allCampaigns);

    // Get campaign status counts with type safety
    const statusCounts = allCampaigns.reduce<Record<CampaignStatus, number>>(
      (acc, campaign) => {
        acc[campaign.status] = (acc[campaign.status] || 0) + 1;
        return acc;
      },
      // Initialize with all possible statuses set to 0
      {
        ACTIVE: 0,
        PAUSED: 0,
        COMPLETED: 0,
        DRAFT: 0,
      } as Record<CampaignStatus, number>
    );

    // Find top performing campaigns (by reply rate)
    const topCampaigns = allCampaigns
      .map((campaign) => {
        const { replyRate, openRate, clickRate } = calculatePerformanceRates(campaign);

        return {
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
          replyRate,
          openRate,
          clickRate,
        };
      })
      .sort((a, b) => b.replyRate - a.replyRate)
      .slice(0, 5);

    return {
      totalMetrics,
      statusCounts,
      topCampaigns,
      campaignCount: allCampaigns.length,
      dateRange,
      generatedAt: Date.now()
    };
  },
});

// ============================================================================
// CAMPAIGN COMPARISON QUERY
// ============================================================================

/**
 * Get campaign comparison analytics.
 * Compares performance between multiple campaigns.
 */
export const getCampaignComparison = query({
  args: campaignComparisonQuerySchema,
  handler: async (ctx, args): Promise<CampaignComparisonResult> => {
    // Get performance metrics for specified campaigns using direct database query
    const rawCampaignMetrics = await ctx.db.query("campaignAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
      .filter((q) => {
        type BoolExpr = ReturnType<typeof q.and>;
        let pred: BoolExpr | boolean | undefined;
        const add = (e: BoolExpr | boolean) => {
          pred = pred ? q.and(pred, e) : e;
        };

        if (args.dateRange?.start) add(q.gte(q.field("date"), args.dateRange.start));
        if (args.dateRange?.end) add(q.lte(q.field("date"), args.dateRange.end));
        if (args.campaignIds?.length) {
          add(q.or(...args.campaignIds.map(id => q.eq(q.field("campaignId"), id))));
        }

        return pred ?? true;
      })
      .collect();

    const campaignMetrics: CampaignPerformanceMetrics[] = rawCampaignMetrics.map(record => ({
      campaignId: record.campaignId,
      campaignName: record.campaignName,
      status: record.status,
      leadCount: record.leadCount || 0,
      activeLeads: record.activeLeads || 0,
      completedLeads: record.completedLeads || 0,
      // BaseMetrics fields flattened
      sent: record.sent || 0,
      delivered: record.delivered || 0,
      opened_tracked: record.opened_tracked || 0,
      clicked_tracked: record.clicked_tracked || 0,
      replied: record.replied || 0,
      bounced: record.bounced || 0,
      unsubscribed: record.unsubscribed || 0,
      spamComplaints: record.spamComplaints || 0,
      updatedAt: record.updatedAt,
    }));

    // Define the metrics we want to compare
    type MetricKey = keyof BaseMetrics | 'leadCount' | 'activeLeads' | 'completedLeads';
    const defaultMetrics: MetricKey[] = [
      'sent', 'opened_tracked', 'clicked_tracked', 'replied', 'bounced', 'unsubscribed', 'spamComplaints'
    ];

    // Use provided metrics or defaults, ensuring they're valid
    const metricsToCompare = (args.comparisonMetrics?.length
      ? args.comparisonMetrics.filter((m): m is MetricKey =>
          defaultMetrics.includes(m as MetricKey)
        )
      : defaultMetrics
    ) as MetricKey[];

    // Type for the campaign metrics in the comparison
    interface CampaignComparisonData {
      campaignId: string;
      campaignName: string;
      status: CampaignStatus;
      metrics: Record<keyof ReturnType<typeof getNumericMetrics>, number>;
    }


    // Process campaign metrics and create comparison data
    const campaigns: CampaignComparisonData[] = campaignMetrics.map(campaign => ({
      campaignId: campaign.campaignId,
      campaignName: campaign.campaignName,
      status: campaign.status,
      metrics: getNumericMetrics(campaign),
    }));

    // Calculate relative performance for each campaign and metric
    const relativePerformance: Record<string, Record<string, number>> = {};
    const bestPerformers: Record<string, { campaignId: string; campaignName: string; value: number }> = {};
    const worstPerformers: Record<string, { campaignId: string; campaignName: string; value: number }> = {};

    // Initialize best/worst performers
    metricsToCompare.forEach(metric => {
      let bestValue = -Infinity;
      let worstValue = Infinity;
      let bestCampaign = campaigns[0];
      let worstCampaign = campaigns[0];

      campaigns.forEach(campaign => {
        const value = campaign.metrics[metric];
        if (value > bestValue) {
          bestValue = value;
          bestCampaign = campaign;
        }
        if (value < worstValue) {
          worstValue = value;
          worstCampaign = campaign;
        }
      });

      bestPerformers[metric] = {
        campaignId: bestCampaign.campaignId,
        campaignName: bestCampaign.campaignName,
        value: bestValue,
      };

      worstPerformers[metric] = {
        campaignId: worstCampaign.campaignId,
        campaignName: worstCampaign.campaignName,
        value: worstValue,
      };

      // Calculate relative performance (0-100% scale)
      const maxValue = bestValue;
      const minValue = worstValue;
      const range = maxValue - minValue;

      campaigns.forEach(campaign => {
        const campaignId = campaign.campaignId;
        if (!relativePerformance[campaignId]) {
          relativePerformance[campaignId] = {};
        }

        if (range === 0) {
          // All campaigns have the same value
          relativePerformance[campaignId][metric] = 100;
        } else {
          // Calculate relative performance as percentage
          const value = campaign.metrics[metric];
          relativePerformance[campaignId][metric] = Math.round(((value - minValue) / range) * 100);
        }
      });
    });

    return {
      campaigns,
      relativePerformance,
      bestPerformers,
      worstPerformers,
      summary: {
        totalCampaigns: campaigns.length,
        metrics: metricsToCompare as string[],
        dateRange: args.dateRange || getDefaultDateRange(),
        generatedAt: Date.now(),
      },
    };
  },
});
