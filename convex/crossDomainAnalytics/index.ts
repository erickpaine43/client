// Barrel exports for cross-domain analytics module
// This ensures API compatibility with the original crossDomainAnalytics.ts

export {
  // Query handlers
  getMailboxDomainJoinedAnalytics,
  getCrossDomainTimeSeriesAnalytics,
  getMailboxDomainImpactAnalysis,
  getPerformanceComparison,
  getCorrelationAnalysis,
  getTrendAnalysis,
  getAggregatedMetrics,
  getTimeSeriesData,
  generateInsights,
  getHealthStatus,
} from "./queries";

export {
  // Mutation handlers
  updateCrossDomainAnalytics,
  exportAnalytics,
} from "./mutations";

export {
  // Types
  type EmailMetrics,
  type MailboxAnalyticsRecord,
  type TimeSeriesGroup,
  type MailboxGroup,
  type CrossDomainAnalyticsQueryArgs,
  type DomainAnalyticsResult,
  type TimeSeriesAnalyticsResult,
  type ImpactAnalysisResult,
  type MailboxHealthData,
} from "./types";

export {
  // Validation utilities
  validateDomainIds,
  validateMailboxIds,
  validateDateRange,
  validateCompanyId,
  validateGranularity,
  validateQueryArgs,
  validateDomainId,
} from "./validation";

export {
  // Calculation utilities
  calculateMailboxHealthScore,
  calculateDomainHealthScore,
  calculateDomainReputation,
  aggregateEmailMetrics,
  calculateMailboxInsights,
  calculateCapacityUtilization,
  calculateWarmupSummary,
  calculateCapacitySummary,
  getTimeKey,
  formatTimeLabel,
  groupByTimePeriod,
  calculateCorrelationMetrics,
} from "./calculations";
