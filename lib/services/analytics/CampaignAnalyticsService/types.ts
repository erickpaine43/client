// ============================================================================
// CAMPAIGN ANALYTICS SERVICE TYPES
// ============================================================================

// Re-export shared types for convenience
export type {
  AnalyticsFilters,
  PerformanceMetrics,
  TimeSeriesDataPoint,
  AnalyticsComputeOptions,
  DataGranularity
} from "@/types/analytics/core";

export type {
  CampaignAnalytics,
  SequenceStepAnalytics
} from "@/types/analytics/domain-specific";

export type {
  AnalyticsError,
  AnalyticsErrorType
} from "./../BaseAnalyticsService";

// Local type definitions specific to campaign analytics
// Add any campaign-specific interfaces or types here
