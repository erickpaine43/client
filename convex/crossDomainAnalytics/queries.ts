// Re-export queries from sub-modules for backward compatibility
export {
  getMailboxDomainJoinedAnalytics,
  getMailboxDomainImpactAnalysis
} from "./mailboxQueries";

export {
  getPerformanceComparison,
  getCorrelationAnalysis,
  getTrendAnalysis
} from "./domainQueries";

export {
  getCrossDomainTimeSeriesAnalytics,
  getTimeSeriesData
} from "./timeSeriesQueries";

export {
  getAggregatedMetrics,
  generateInsights,
  getHealthStatus
} from "./aggregationQueries";
