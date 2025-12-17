// ============================================================================
// LEAD ANALYTICS - BARREL EXPORTS
// ============================================================================

// Query exports
export {
  getLeadAnalytics,
  getLeadAggregatedAnalytics,
  getLeadEngagementAnalytics,
  getLeadListMetrics,
  getLeadPerformanceOverview,
  calculateEngagementRates
} from "./queries";

// Mutation exports
export {
  upsertLeadAnalytics,
  batchInsertLeadAnalytics,
  batchUpdateLeadAnalytics,
  deleteLeadAnalytics,
  initializeLeadAnalytics
} from "./mutations";

// Type exports
export type {
  LeadAnalyticsRecord,
  LeadAnalyticsQueryArgs,
  LeadTimeSeriesQueryArgs,
  LeadAnalyticsMutationArgs,
  LeadAggregatedMetrics,
  LeadEngagementSummary,
  LeadStatusBreakdownItem,
  LeadListMetricsResponse,
  LeadTimeSeriesDataPoint,
  LeadAggregationResponse,
  LeadAnalyticsValidationResult
} from "./types";

// Utility function exports (for advanced usage)
export {
  calculateLeadAggregatedMetrics,
  getTimeKey,
  formatTimeLabel,
  groupRecordsByLeadId,
  groupRecordsByStatus,
  calculateUniqueLeadCount
} from "./calculations";

export {
  validateLeadAnalyticsQueryArgs,
  validateLeadAnalyticsMutationArgs,
  validateDateRange,
  validateLeadIds,
  validateGranularity,
  sanitizeLeadAnalyticsQueryArgs,
  sanitizeLeadAnalyticsMutationArgs
} from "./validation";
