// ============================================================================
// CAMPAIGN ANALYTICS SERVICE MUTATIONS
// ============================================================================

import {
  updateCampaignAnalytics,
  refreshCampaignAnalyticsCache
} from "@/lib/actions/analytics/campaign-analytics";

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

  const result = await updateCampaignAnalytics(campaignData.campaignId, {
    campaignName: campaignData.campaignName,
    sent: campaignData.sent,
    delivered: campaignData.delivered,
    opened_tracked: campaignData.opened_tracked,
    clicked_tracked: campaignData.clicked_tracked,
    replied: campaignData.replied,
    bounced: campaignData.bounced,
    unsubscribed: campaignData.unsubscribed,
    spamComplaints: campaignData.spamComplaints,
    status: campaignData.status,
    leadCount: campaignData.leadCount,
    activeLeads: campaignData.activeLeads,
    completedLeads: campaignData.completedLeads,
  });

  // Return the result properly
  if (!result.success) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Failed to update campaign analytics');
  }

  return result.data!.id || campaignData.campaignId;
}

/**
 * Migrate legacy campaign data.
 */
export async function migrateLegacyCampaignDataAction(campaignId?: string, companyId?: string): Promise<void> {
  if (typeof companyId !== 'string') throw new Error('Company id is required');
  if (typeof campaignId !== 'string') throw new Error('Campaign id is required');
  // migrateLegacyCampaignData not implemented
  console.log('migrateLegacyCampaignData not implemented for', campaignId, companyId);
}

/**
 * Invalidate campaign analytics cache.
 */
export async function invalidateCampaignAnalyticsCacheAction(campaignIds?: string[]): Promise<number> {
  const result = await refreshCampaignAnalyticsCache(campaignIds);
  if (!result.success) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Failed to invalidate cache');
  }
  return result.data!.refreshed;
}
