// ============================================================================
// ANALYTICS TYPES INDEX - Centralized exports
// ============================================================================

// Core data types (no UI concerns)
export type {
  PerformanceMetrics,
  CalculatedRates,
  TimeSeriesDataPoint,
  BaseAnalytics,
  AnalyticsFilters,
  AnalyticsComputeOptions,
  FilteredDataset,
  DataGranularity,
} from "./core";

// Domain-specific data types
export type {
  CampaignAnalytics,
  DomainAnalytics,
  MailboxAnalytics,
  LeadAnalytics,
  TemplateAnalytics,
  BillingAnalytics,
  CampaignStatus,
  WarmupStatus,
  LeadStatus,
  SequenceStepAnalytics,
  WarmupAnalytics,
  DailyWarmupStats,
} from "./domain-specific";

// UI and display types
export type {
  DateRangePreset,
  AnalyticsUIFilters,
  AnalyticsMetricConfig,
  KPIDisplayConfig,
  ChartDataPoint,
  SmartInsightDisplay,
  AnalyticsLoadingState,
  AnalyticsDomain,
  MetricToggleProps,
  DateRangePickerProps,
  EntityFilterProps,
  FormattedAnalyticsStats,
  PerformanceThresholds,
} from "./ui";

// Re-export commonly used types for backward compatibility
export type {
  PerformanceMetrics as StandardizedPerformanceMetrics,
  CalculatedRates as StandardizedRates,
  TimeSeriesDataPoint as StandardizedTimeSeriesData,
} from "./core";
