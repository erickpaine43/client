// Barrel exports for campaign analytics module
// This ensures API compatibility with the original campaignAnalytics.ts

export {
  // Query handlers
  getCampaignAnalytics,
  getCampaignAggregatedAnalytics,
  getCampaignTimeSeriesAnalytics,
  getCampaignPerformanceMetrics,
} from "./queries";

export {
  // Mutation handlers
  upsertCampaignAnalytics,
  batchUpsertCampaignAnalytics,
  deleteCampaignAnalytics,
} from "./mutations";

export {
  // Types
  type CampaignAnalyticsRecord,
  type DBCampaignAnalyticsRecord,
  type AggregatedCampaignMetrics,
  type AggregatedCampaignAnalytics,
  type CampaignAnalyticsQueryArgs,
  type TimeSeriesData,
} from "./types";

export {
  // Validation utilities
  validateCampaignIds,
  validateDateRange,
  validateCompanyId,
  validateQueryArgs,
} from "./validation";

export {
  // Calculation utilities
  calculatePerformanceMetrics,
  aggregateCampaignData,
  calculateEngagementScores,
  computeComparisons,
  groupByTimePeriod,
  getTimeKey,
  formatTimeLabel,
} from "./calculations";
