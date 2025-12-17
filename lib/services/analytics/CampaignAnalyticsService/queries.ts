// ============================================================================
// CAMPAIGN ANALYTICS SERVICE QUERIES
// ============================================================================

import {
  CampaignAnalytics,
  SequenceStepAnalytics,
  TimeSeriesDataPoint,
  AnalyticsFilters,
  AnalyticsComputeOptions,
  DataGranularity,
  PerformanceMetrics
} from "./types";
import { CalculatedRates } from "@/types/analytics/core";
import {
  getCampaignPerformanceMetrics,
  getCampaignTimeSeries,
  getSequenceStepAnalytics
} from "@/lib/actions/analytics/campaign-analytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { toPerformanceMetrics, calculateEngagementMetrics } from "./calculations";

/**
 * Campaign-specific query functions
 */

/**
 * Query campaign performance metrics.
 */
export async function queryCampaignPerformanceMetrics(
  campaignIds?: string[],
  filters?: AnalyticsFilters,
  _companyId?: string
): Promise<CampaignAnalytics[]> {
  const result = await getCampaignPerformanceMetrics(campaignIds || [], filters);

  if (!result.success) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Failed to get performance metrics');
  }

  // Convert CampaignPerformanceMetrics[] to CampaignAnalytics[]
  return result.data!.map(campaign => ({
    id: campaign.campaignId,
    name: campaign.campaignName,
    sent: campaign.performance.sent,
    delivered: campaign.performance.delivered,
    opened_tracked: campaign.performance.opened_tracked,
    clicked_tracked: campaign.performance.clicked_tracked,
    replied: campaign.performance.replied,
    bounced: campaign.performance.bounced,
    unsubscribed: campaign.performance.unsubscribed,
    spamComplaints: campaign.performance.spamComplaints,
    updatedAt: campaign.updatedAt,
    campaignId: campaign.campaignId,
    campaignName: campaign.campaignName,
    status: campaign.status,
    leadCount: 0, // Placeholder
    activeLeads: 0, // Placeholder
    completedLeads: 0, // Placeholder
  }));
}

/**
 * Query time series analytics data for campaigns.
 */
export async function queryCampaignTimeSeriesData(
  campaignIds: string[] = [],
  filters?: Omit<AnalyticsFilters, 'entityIds'>,
  _granularity: DataGranularity = "day",
  _companyId?: string
): Promise<TimeSeriesDataPoint[]> {
  const result = await getCampaignTimeSeries(campaignIds, filters);
  if (!result.success) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Failed to get time series data');
  }
  return result.data!;
}

/**
 * Query sequence step analytics for a specific campaign.
 */
export async function queryCampaignSequenceAnalytics(
  campaignId: string,
  filters?: AnalyticsFilters,
  _companyId?: string
): Promise<SequenceStepAnalytics[]> {
  const result = await getSequenceStepAnalytics(campaignId, filters);

  if (!result.success) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Failed to get sequence analytics');
  }

  // Process and validate each step's metrics
  const validatedResults = result.data!.map((step: SequenceStepAnalytics) => {
    // Extract and validate metrics
    const metrics = toPerformanceMetrics(step);
    const validation = AnalyticsCalculator.validateMetrics(metrics);

    if (!validation.isValid) {
      console.warn(`Invalid metrics for sequence step ${step.stepId}: ${validation.errors.join(', ')}`);
    }

    // Return the step with validated metrics
    return {
      ...step,
      ...metrics,
      updatedAt: Date.now()
    };
  });

  return validatedResults;
}

/**
 * Query lead engagement data for a campaign.
 */
export async function queryCampaignLeadEngagement(
  campaignId: string,
  campaignMetrics: CampaignAnalytics[],
  _filters?: AnalyticsFilters
) {
  if (campaignMetrics.length === 0) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const campaign = campaignMetrics[0];

  // Calculate engagement metrics
  const engagementMetrics = calculateEngagementMetrics({
    opened_tracked: campaign.opened_tracked,
    clicked_tracked: campaign.clicked_tracked,
    replied: campaign.replied,
    delivered: campaign.delivered
  });

  const result = {
    totalLeads: campaign.leadCount,
    activeLeads: campaign.activeLeads,
    engagedLeads: engagementMetrics.engagedLeads,
    repliedLeads: campaign.replied,
    unsubscribedLeads: campaign.unsubscribed,
    engagementRate: engagementMetrics.engagementRate,
    conversionRate: engagementMetrics.conversionRate,
  };

  return result;
}

/**
 * Query filtered analytics computation.
 */
export async function queryFilteredAnalyticsComputation(
  filters: AnalyticsFilters,
  _computeOptions: AnalyticsComputeOptions = {},
  _companyId?: string
) {
  // computeAnalyticsForFilteredData not implemented, return proper structure
  const result = {
    aggregatedMetrics: {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    } as PerformanceMetrics,
    rates: {
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
      spamRate: 0,
    } as CalculatedRates,
    data: [] as CampaignAnalytics[],
    metadata: {
      total: 0,
      filtered: 0,
      queryTime: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
      spamRate: 0,
    } as {
      total: number;
      filtered: number;
      queryTime: number;
    } & CalculatedRates,
  };

  return result;
}
