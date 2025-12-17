// ============================================================================
// ANALYTICS VALIDATION SCHEMAS - EXTRACTED FROM MAIN ANALYTICS FILE
// ============================================================================

import { v } from "convex/values";

// ============================================================================
// CAMPAIGN STATUS VALIDATION
// ============================================================================

/** Schema for campaign status validation */
export const campaignStatusValidator = v.union(
  v.literal('DRAFT'),
  v.literal('ACTIVE'),
  v.literal('PAUSED'),
  v.literal('COMPLETED'),
  v.literal('ARCHIVED')
);

// ============================================================================
// DATE RANGE VALIDATION
// ============================================================================

/** Schema for date range validation */
export const dateRangeSchema = v.object({
  start: v.string(),
  end: v.string(),
});

// ============================================================================
// ANALYTICS QUERY VALIDATION SCHEMAS
// ============================================================================

/** Schema for campaign analytics query validation */
export const campaignAnalyticsQuerySchema = v.object({
  campaignIds: v.optional(v.array(v.string())),
  dateRange: v.optional(dateRangeSchema),
  companyId: v.string(),
  includeSequenceData: v.optional(v.boolean()),
  includeTimeSeriesData: v.optional(v.boolean()),
});

/** Schema for analytics overview query validation */
export const analyticsOverviewQuerySchema = v.object({
  dateRange: v.optional(dateRangeSchema),
  companyId: v.string(),
});

/** Schema for campaign comparison query validation */
export const campaignComparisonQuerySchema = v.object({
  campaignIds: v.array(v.string()),
  dateRange: v.optional(dateRangeSchema),
  companyId: v.string(),
  comparisonMetrics: v.optional(v.array(v.string())),
});

// ============================================================================
// BULK UPDATE VALIDATION SCHEMAS
// ============================================================================

/** Schema for bulk update campaign analytics validation */
export const bulkUpdateCampaignAnalyticsSchema = v.object({
  campaignId: v.string(),
  metrics: v.object({
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
  }),
  companyId: v.string(),
});

/** Schema for initialize campaign analytics validation */
export const initializeCampaignAnalyticsSchema = v.object({
  campaignId: v.string(),
  campaignName: v.string(),
  companyId: v.string(),
});
