// ============================================================================
// CONVEX ANALYTICS API EXPORTS
// ============================================================================

// NOTE: Avoid re-exporting all functions here to prevent name collisions
// across modules. Consumers should import from each module directly, e.g.:
//   api.campaignAnalytics.getCampaignAnalytics
//   api.mailboxAnalytics.getMailboxAnalytics
// Keeping this file free of wildcard re-exports prevents duplicate symbol
// errors and keeps Convex codegen module namespaces clean.

// Type exports for client-side usage
export type { Doc } from "./_generated/dataModel";

// ============================================================================
// ANALYTICS API REFERENCE
// ============================================================================

/**
 * CAMPAIGN ANALYTICS FUNCTIONS
 * 
 * Queries:
 * - getCampaignAnalytics: Get raw campaign analytics data with filtering
 * - getCampaignAggregatedAnalytics: Get aggregated metrics by campaign
 * - getCampaignTimeSeriesAnalytics: Get time series data for charts
 * - getCampaignPerformanceMetrics: Get performance metrics for specific campaigns
 * 
 * Mutations:
 * - upsertCampaignAnalytics: Insert or update campaign analytics record
 * - batchInsertCampaignAnalytics: Bulk insert campaign analytics data
 * - deleteCampaignAnalytics: Delete campaign analytics data
 */

/**
 * DOMAIN ANALYTICS FUNCTIONS
 * 
 * Queries:
 * - getDomainAggregatedAnalytics: Get aggregated domain analytics with health scores
 * - getDomainPerformanceMetrics: Get performance metrics for specific domains
 * - getDomainTimeSeriesAnalytics: Get time series data for domain analytics
 * - getDomainHealthMetrics: Get domain health metrics with authentication status
 * - getDomainAuthenticationStatus: Get domain authentication status summary
 * 
 * Mutations:
 * - upsertDomainAnalytics: Insert or update domain analytics record
 * - bulkUpdateDomainAnalytics: Bulk update domain analytics data
 * - initializeDomainAnalytics: Initialize domain analytics with default data
 */

/**
 * MAILBOX ANALYTICS FUNCTIONS
 * 
 * Queries:
 * - getMailboxAnalytics: Get raw mailbox analytics data with filtering
 * - getMailboxAggregatedAnalytics: Get aggregated metrics by mailbox
 * - getMailboxPerformanceMetrics: Get performance metrics for specific mailboxes
 * - getMailboxTimeSeriesAnalytics: Get time series data for mailbox charts
 * - getWarmupAnalytics: Get warmup-specific metrics and daily progress
 * - getMailboxHealthMetrics: Get health scores and reputation factors
 * 
 * Mutations:
 * - upsertMailboxAnalytics: Insert or update mailbox analytics record
 * - upsertWarmupAnalytics: Insert or update warmup analytics record
 * - batchInsertMailboxAnalytics: Bulk insert mailbox analytics data
 * - deleteMailboxAnalytics: Delete mailbox analytics data
 */

/**
 * SEQUENCE STEP ANALYTICS FUNCTIONS
 * 
 * Queries:
 * - getSequenceStepAnalytics: Get sequence step analytics data
 * - getCampaignSequenceAnalytics: Get aggregated sequence data by campaign
 * - getSequenceStepComparison: Compare performance across sequence steps
 * - getSequenceFunnelAnalytics: Get funnel analytics for campaign sequences
 * 
 * Mutations:
 * - upsertSequenceStepAnalytics: Insert or update sequence step analytics
 * - batchInsertSequenceStepAnalytics: Bulk insert sequence step data
 * - deleteSequenceStepAnalytics: Delete sequence step analytics data
 */

/**
 * COMPREHENSIVE ANALYTICS FUNCTIONS
 * 
 * Queries:
 * - getComprehensiveCampaignAnalytics: Get complete campaign analytics with optional sequence data
 * - getAnalyticsOverview: Get dashboard overview metrics
 * - getCampaignComparison: Compare performance between campaigns
 * - getFilteredAnalyticsData: Get analytics data with complex filtering
 * 
 * Mutations:
 * - bulkUpdateCampaignAnalytics: Bulk update campaign analytics data
 * - initializeCampaignAnalytics: Initialize new campaign with baseline analytics
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Get campaign analytics with time series data
 * 
 * ```typescript
 * import { api } from "./convex/_generated/api";
 * 
 * const analytics = await convex.query(api.analytics.getComprehensiveCampaignAnalytics, {
 *   campaignIds: ["campaign-1", "campaign-2"],
 *   dateRange: { start: "2024-11-01", end: "2024-12-01" },
 *   companyId: "company-123",
 *   includeTimeSeriesData: true,
 *   includeSequenceData: true,
 * });
 * ```
 */

/**
 * Example: Update campaign analytics data
 * 
 * ```typescript
 * import { api } from "./convex/_generated/api";
 * 
 * await convex.mutation(api.campaignAnalytics.upsertCampaignAnalytics, {
 *   campaignId: "campaign-1",
 *   campaignName: "Q1 Outreach",
 *   date: "2024-12-01",
 *   companyId: "company-123",
 *   sent: 100,
 *   delivered: 95,
 *   opened_tracked: 30,
 *   clicked_tracked: 8,
 *   replied: 5,
 *   bounced: 5,
 *   unsubscribed: 2,
 *   spamComplaints: 1,
 *   status: "ACTIVE",
 *   leadCount: 100,
 *   activeLeads: 80,
 *   completedLeads: 20,
 * });
 * ```
 */

/**
 * Example: Get analytics overview for dashboard
 * 
 * ```typescript
 * import { api } from "./convex/_generated/api";
 * 
 * const overview = await convex.query(api.analytics.getAnalyticsOverview, {
 *   companyId: "company-123",
 *   dateRange: { start: "2024-11-01", end: "2024-12-01" },
 * });
 * 
 * // Use with AnalyticsCalculator for rate calculations
 * import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
 * 
 * const rates = AnalyticsCalculator.calculateAllRates(overview.overview);
 * const displayRate = AnalyticsCalculator.formatRateAsPercentage(rates.openRate);
 * ```
 */
