// ============================================================================
// ANALYTICS MODULE BARREL EXPORTS
// ============================================================================
// This file maintains API compatibility by re-exporting all analytics functions
// from the modular structure, ensuring zero breaking changes for existing imports.

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  BaseMetrics,
  CampaignBase,
  CampaignAnalytics,
  CampaignPerformanceMetrics,
  DateRange,
  GetAnalyticsFilterArgs,
  GetComprehensiveCampaignAnalyticsArgs,
  ComprehensiveCampaignAnalyticsResponse,
  CampaignComparisonResult,
  GetAnalyticsOverviewArgs,
  AnalyticsOverviewResponse,
} from "./types";

// ============================================================================
// VALIDATION EXPORTS
// ============================================================================

export {
  campaignStatusValidator,
  dateRangeSchema,
  campaignAnalyticsQuerySchema,
  analyticsOverviewQuerySchema,
  campaignComparisonQuerySchema,
  bulkUpdateCampaignAnalyticsSchema,
  initializeCampaignAnalyticsSchema,
} from "./validation";

// ============================================================================
// CALCULATION EXPORTS
// ============================================================================

export {
  getNumericMetrics,
  getDefaultDateRange,
  calculateTotalMetrics,
  calculatePerformanceRates,
} from "./calculations";

// ============================================================================
// QUERY EXPORTS
// ============================================================================

export {
  getComprehensiveCampaignAnalytics,
  getAnalyticsOverview,
  getCampaignComparison,
} from "./queries";

// ============================================================================
// MUTATION EXPORTS
// ============================================================================

export {
  bulkUpdateCampaignAnalytics,
  initializeCampaignAnalytics,
  updateCampaignAnalytics,
  deleteCampaignAnalytics,
  updateAnalyticsFilters,
  clearAnalyticsCache,
} from "./mutations";
