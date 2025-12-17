// ============================================================================
// ANALYTICS SERVICES INDEX - Centralized exports
// ============================================================================

// Main analytics service
export { AnalyticsService, analyticsService } from "./AnalyticsService";
export type { 
  OverviewMetrics, 
  DomainServiceHealth, 
  CrossDomainOperationResult 
} from "./AnalyticsService";

// Domain-specific services
export { CampaignAnalyticsService, campaignAnalyticsService } from "./CampaignAnalyticsService/";
export { DomainAnalyticsService, domainAnalyticsService } from "./DomainAnalyticsService";
export { MailboxAnalyticsService } from "./MailboxAnalyticsService";
export { CrossDomainAnalyticsService, crossDomainAnalyticsService } from "./CrossDomainAnalyticsService";
export { LeadAnalyticsService, leadAnalyticsService } from "./LeadAnalyticsService";
export { BillingAnalyticsService, billingAnalyticsService } from "./BillingAnalyticsService";
export { TemplateAnalyticsService } from "./TemplateAnalyticsService";
export type { 
  DomainHealthMetrics, 
  AuthenticationStatusData, 
  AggregatedDomainStats 
} from "./DomainAnalyticsService";
export type {
  MailboxPerformanceData,
  WarmupAnalyticsData,
  MailboxHealthMetrics,
  SendingCapacityData
} from "./MailboxAnalyticsService";
export type {
  CrossDomainAnalyticsResult,
  CrossDomainTimeSeriesDataPoint,
  MailboxDomainImpactAnalysis
} from "./CrossDomainAnalyticsService";
export type {
  LeadListMetrics,
  LeadEngagementAnalytics,
  ConversionFunnelData,
  LeadSourceAnalytics,
  SegmentationAnalytics
} from "./LeadAnalyticsService";
export type {
  UsageMetrics,
  CostAnalytics,
  PlanUtilizationData,
  UsageLimitAlert,
  BillingTimeSeriesDataPoint
} from "./BillingAnalyticsService";

// Base service infrastructure
export { 
  BaseAnalyticsService, 
  AnalyticsError, 
  AnalyticsErrorType,
  DEFAULT_RETRY_CONFIG 
} from "./BaseAnalyticsService";
export type { RetryConfig } from "./BaseAnalyticsService";

// Redis caching infrastructure
export { 
  AnalyticsCache, 
  analyticsCache, 
  redis,
  CACHE_TTL,
  DOMAIN_CACHE_CONFIG 
} from "@/lib/utils/redis";

// Analytics calculator utilities
export { 
  AnalyticsCalculator
} from "@/lib/utils/analytics-calculator";

// Re-export analytics types for convenience
export type {
  PerformanceMetrics,
  CalculatedRates,
  TimeSeriesDataPoint,
  BaseAnalytics,
  AnalyticsFilters,
  AnalyticsComputeOptions,
  FilteredDataset,
  DataGranularity
} from "@/types/analytics/core";
export type {
  CampaignAnalytics,
  DomainAnalytics,
  MailboxAnalytics,
  LeadAnalytics,
  TemplateAnalytics,
  BillingAnalytics
} from "@/types/analytics/domain-specific";
export type {
  AnalyticsDomain
} from "@/types/analytics/ui";

// Advanced filtering and caching services
export { 
  FilterPropagationService, 
  filterPropagationService 
} from "./FilterPropagationService";
export type { 
  FilterChangeEvent, 
  FilterDependency, 
  FilterPropagationResult 
} from "./FilterPropagationService";

export { 
  IntelligentCacheService, 
  intelligentCacheService 
} from "./IntelligentCacheService";
export type {
  StructuredCacheKey,
  CacheInvalidationStrategy,
  CacheWarmingConfig
} from "./IntelligentCacheService";

// Error handling and testing utilities
export { 
  ErrorHandlingTestUtils,
  createErrorHandlingTestUtils 
} from "./ErrorHandlingTestUtils";
export type { 
  ErrorHandlingTestResult 
} from "./ErrorHandlingTestUtils";

// Monitoring and alerting system - Import from monitoring directory
export {
  AnalyticsMonitor,
  analyticsMonitor,
  PerformanceMonitor,
  CacheMonitor,
  cacheMonitor,
  ErrorTracker,
  errorTracker,
  LogLevel,
  AlertType,
  CacheOperation,
  ErrorSeverity,
  ErrorCategory,
  MonitorPerformance,
  PerformanceUtils,
  DEFAULT_THRESHOLDS,
  DEFAULT_CACHE_THRESHOLDS,
  MonitoringUtils,
} from "./monitoring/";

export type {
  AnalyticsLogEntry,
  CacheMetrics,
  AlertConfig,
  AlertEntry,
  PerformanceMeasurement,
  PerformanceThresholds,
  CachePerformanceMetrics,
  CacheHealthMetrics,
  CacheAlertThresholds,
  TrackedError,
  ErrorPattern,
  ErrorStatistics,
} from "./monitoring/";

// Server-side computation optimization services
export {
  ServerSideComputationService,
  serverSideComputationService
} from "./ServerSideComputationService/";
export type {
  HeavyComputationConfig,
  ComputationResult,
  CacheWarmingStrategy
} from "./ServerSideComputationService/types";

