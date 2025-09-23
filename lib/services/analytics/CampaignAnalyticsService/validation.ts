// ============================================================================
// CAMPAIGN ANALYTICS SERVICE VALIDATION
// ============================================================================

import { AnalyticsFilters } from "./types";

/**
 * Campaign-specific validation functions
 */

/**
 * Validate campaign IDs array
 */
export function validateCampaignIds(campaignIds?: string[]): void {
  if (!campaignIds) return;

  if (!Array.isArray(campaignIds)) {
    throw new Error("Campaign IDs must be an array");
  }

  campaignIds.forEach((id, index) => {
    if (!id || typeof id !== "string") {
      throw new Error(`Invalid campaign ID at index ${index}: must be a non-empty string`);
    }
  });
}

/**
 * Validate campaign analytics filters
 */
export function validateCampaignFilters(filters: Partial<AnalyticsFilters>): void {
  if (!filters) {
    throw new Error("Filters are required for campaign analytics");
  }

  if (!filters.dateRange || !filters.dateRange.start || !filters.dateRange.end) {
    throw new Error("Date range is required for campaign analytics");
  }

  if (!filters.companyId) {
    throw new Error("Company ID is required for campaign analytics");
  }
}

/**
 * Validate campaign data for updates
 */
export function validateCampaignData(data: {
  campaignId: string;
  campaignName?: string;
  sent?: number;
  delivered?: number;
  opened_tracked?: number;
  clicked_tracked?: number;
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  spamComplaints?: number;
}): void {
  if (!data.campaignId || typeof data.campaignId !== "string") {
    throw new Error("Valid campaign ID is required");
  }

  if (data.campaignName && typeof data.campaignName !== "string") {
    throw new Error("Campaign name must be a string if provided");
  }

  // Validate numeric fields are non-negative
  const numericFields = [
    "sent", "delivered", "opened_tracked", "clicked_tracked",
    "replied", "bounced", "unsubscribed", "spamComplaints"
  ];

  numericFields.forEach(field => {
    const value = data[field as keyof typeof data];
    if (value !== undefined && (typeof value !== "number" || value < 0)) {
      throw new Error(`${field} must be a non-negative number if provided`);
    }
  });

  // Validate logical constraints
  if (data.delivered && data.sent && data.delivered > data.sent) {
    throw new Error("Delivered count cannot exceed sent count");
  }

  if (data.opened_tracked && data.delivered && data.opened_tracked > data.delivered) {
    throw new Error("Opened tracked count cannot exceed delivered count");
  }
}
