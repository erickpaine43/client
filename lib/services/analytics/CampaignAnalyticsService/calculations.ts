// ============================================================================
// CAMPAIGN ANALYTICS SERVICE CALCULATIONS
// ============================================================================

import { PerformanceMetrics } from "./types";

/**
 * Campaign-specific calculation functions
 */

/**
 * Extracts PerformanceMetrics from a domain object that extends PerformanceMetrics.
 * This ensures we only validate the raw metrics without any additional properties.
 */
/**
 * Extracts and validates PerformanceMetrics from any object that might contain metric fields.
 * Ensures all required fields are present with proper defaults.
 */
export function toPerformanceMetrics(metrics: unknown): PerformanceMetrics {
  // Type guard to check if the input has all required PerformanceMetrics fields
  const isPerformanceMetrics = (obj: unknown): obj is PerformanceMetrics => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'sent' in obj &&
      'delivered' in obj &&
      'opened_tracked' in obj &&
      'clicked_tracked' in obj &&
      'replied' in obj &&
      'bounced' in obj &&
      'unsubscribed' in obj &&
      'spamComplaints' in obj
    );
  };

  // If input is already a valid PerformanceMetrics object, return it directly
  if (isPerformanceMetrics(metrics)) {
    return metrics;
  }

  // Otherwise, safely extract or default all required fields
  const safeMetrics = metrics as Record<string, unknown>;

  return {
    sent: typeof safeMetrics.sent === 'number' ? safeMetrics.sent : 0,
    delivered: typeof safeMetrics.delivered === 'number' ? safeMetrics.delivered : 0,
    opened_tracked: typeof safeMetrics.opened_tracked === 'number' ? safeMetrics.opened_tracked : 0,
    clicked_tracked: typeof safeMetrics.clicked_tracked === 'number' ? safeMetrics.clicked_tracked : 0,
    replied: typeof safeMetrics.replied === 'number' ? safeMetrics.replied : 0,
    bounced: typeof safeMetrics.bounced === 'number' ? safeMetrics.bounced : 0,
    unsubscribed: typeof safeMetrics.unsubscribed === 'number' ? safeMetrics.unsubscribed : 0,
    spamComplaints: typeof safeMetrics.spamComplaints === 'number' ? safeMetrics.spamComplaints : 0
  };
}

/**
 * Calculate engagement metrics for a campaign.
 */
export function calculateEngagementMetrics(campaign: {
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  delivered: number;
}) {
  const engagedLeads = campaign.opened_tracked + campaign.clicked_tracked;
  const engagementRate = campaign.delivered > 0 ? engagedLeads / campaign.delivered : 0;
  const conversionRate = campaign.delivered > 0 ? campaign.replied / campaign.delivered : 0;

  return {
    engagedLeads,
    engagementRate,
    conversionRate,
  };
}
