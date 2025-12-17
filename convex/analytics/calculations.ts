// ============================================================================
// ANALYTICS CALCULATIONS - EXTRACTED FROM MAIN ANALYTICS FILE
// ============================================================================

import type { BaseMetrics, CampaignAnalytics, CampaignPerformanceMetrics, DateRange } from "./types";

// ============================================================================
// METRICS EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extracts all numeric metrics from a campaign analytics object.
 * This function works with both the new CampaignAnalytics type and the legacy CampaignPerformanceMetrics.
 *
 * @param campaign - The campaign analytics object
 * @returns An object containing all numeric metrics from the campaign
 */
export function getNumericMetrics(
  campaign: CampaignAnalytics | CampaignPerformanceMetrics
): Record<keyof BaseMetrics | 'leadCount' | 'activeLeads' | 'completedLeads', number> {
  // Handle both new and legacy types
  const metrics = 'aggregatedMetrics' in campaign
    ? campaign.aggregatedMetrics
    : campaign;

  return {
    sent: metrics.sent,
    delivered: metrics.delivered,
    opened_tracked: metrics.opened_tracked,
    clicked_tracked: metrics.clicked_tracked,
    replied: metrics.replied,
    bounced: metrics.bounced,
    unsubscribed: metrics.unsubscribed,
    spamComplaints: metrics.spamComplaints,
    leadCount: campaign.leadCount,
    activeLeads: campaign.activeLeads,
    completedLeads: campaign.completedLeads,
  };
}

// ============================================================================
// DATE RANGE UTILITIES
// ============================================================================

/**
 * Gets the default date range (last 30 days)
 * @returns Default date range object
 */
export function getDefaultDateRange(): DateRange {
  return {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  };
}

// ============================================================================
// METRICS CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates aggregate metrics from multiple campaign analytics
 * @param campaigns - Array of campaign analytics
 * @returns Aggregated metrics across all campaigns
 */
export function calculateTotalMetrics(campaigns: CampaignAnalytics[]): BaseMetrics {
  const initialMetrics: BaseMetrics = {
    sent: 0,
    delivered: 0,
    opened_tracked: 0,
    clicked_tracked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
    spamComplaints: 0,
  };

  return campaigns.reduce<BaseMetrics>((acc, campaign) => ({
    sent: acc.sent + campaign.aggregatedMetrics.sent,
    delivered: acc.delivered + campaign.aggregatedMetrics.delivered,
    opened_tracked: acc.opened_tracked + campaign.aggregatedMetrics.opened_tracked,
    clicked_tracked: acc.clicked_tracked + campaign.aggregatedMetrics.clicked_tracked,
    replied: acc.replied + campaign.aggregatedMetrics.replied,
    bounced: acc.bounced + campaign.aggregatedMetrics.bounced,
    unsubscribed: acc.unsubscribed + campaign.aggregatedMetrics.unsubscribed,
    spamComplaints: acc.spamComplaints + campaign.aggregatedMetrics.spamComplaints,
  }), { ...initialMetrics });
}

/**
 * Calculates performance rates from campaign metrics
 * @param campaign - Campaign analytics object
 * @returns Performance rates (reply rate, open rate, click rate)
 */
export function calculatePerformanceRates(campaign: CampaignAnalytics) {
  const { sent, replied, opened_tracked, clicked_tracked } = campaign.aggregatedMetrics;
  const safeSent = sent || 1; // Avoid division by zero

  return {
    replyRate: (replied / safeSent) * 100,
    openRate: (opened_tracked / safeSent) * 100,
    clickRate: (clicked_tracked / safeSent) * 100,
  };
}
