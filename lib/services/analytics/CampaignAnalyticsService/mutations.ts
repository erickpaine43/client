// ============================================================================
// CAMPAIGN ANALYTICS SERVICE MUTATIONS
// ============================================================================

import {
  updateCampaignAnalytics,
  migrateLegacyCampaignData,
  invalidateCampaignAnalyticsCache
} from "@/lib/actions/campaign.analytics.actions";

/**
 * Campaign-specific mutation functions
 */

/**
 * Update campaign analytics data.
 */
export async function updateCampaignAnalyticsData(campaignData: {
  campaignId: string;
  campaignName: string;
  date: string;
  companyId: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT";
  leadCount: number;
  activeLeads: number;
  completedLeads: number;
}): Promise<string> {
  // Convert to PerformanceMetrics for validation
//   const metrics = toPerformanceMetrics({
//     sent: campaignData.sent,
//     delivered: campaignData.delivered,
//     opened_tracked: campaignData.opened_tracked,
//     clicked_tracked: campaignData.clicked_tracked,
//     replied: campaignData.replied,
//     bounced: campaignData.bounced,
//     unsubscribed: campaignData.unsubscribed,
//     spamComplaints: campaignData.spamComplaints
//   });

  // Note: In modular version, validation might be in validation.ts

  const result = await updateCampaignAnalytics(campaignData);

  return result;
}

/**
 * Migrate legacy campaign data.
 */
export async function migrateLegacyCampaignDataAction(campaignId?: string, companyId?: string): Promise<void> {
  if (typeof companyId !== 'string') throw new Error('Company id is required');
  if (typeof campaignId !== 'string') throw new Error('Campaign id is required');
  await migrateLegacyCampaignData([{ campaignId }], companyId);
}

/**
 * Invalidate campaign analytics cache.
 */
export async function invalidateCampaignAnalyticsCacheAction(campaignIds?: string[]): Promise<number> {
  return await invalidateCampaignAnalyticsCache(campaignIds);
}
