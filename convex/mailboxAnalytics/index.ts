// Barrel export for mailbox analytics module
// This file re-exports all the handlers to maintain API compatibility

// Export core query handlers
export {
  getMailboxAnalytics,
  getMailboxAggregatedAnalytics,
  getMailboxPerformanceMetrics,
  getMailboxTimeSeriesAnalytics,
} from "./queries";

// Export warmup-specific queries
export {
  getWarmupAnalytics,
} from "./warmupQueries";

// Export health-specific queries
export {
  getMailboxHealthMetrics,
} from "./healthQueries";

// Export all mutation handlers
export {
  upsertMailboxAnalytics,
  upsertWarmupAnalytics,
  batchInsertMailboxAnalytics,
  deleteMailboxAnalytics,
} from "./mutations";

// Export utility functions for reuse in other modules
export {
  validateCompanyId,
  validateDateRange,
  normalizeMailboxIds,
  validateMetrics,
  validateMetricInvariants,
} from "./validation";

export {
  calculateHealthScore,
  calculateDeliverabilityScore,
  calculateComprehensiveHealthScore,
  getTimeKey,
  formatTimeLabel,
} from "./calculations";

// Export data fetching utilities
export {
  fetchMailboxAnalyticsData,
  fetchWarmupAnalyticsData,
  fetchRecentMailboxData,
} from "./dataFetchers";

// Export aggregation utilities
export {
  aggregateByMailbox,
  aggregateByTimePeriod,
  aggregateMetrics,
  aggregateWarmupByMailbox,
} from "./aggregators";

// Export types
export type { MailboxAnalyticsResult } from "./types";
