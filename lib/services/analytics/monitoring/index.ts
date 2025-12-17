// ============================================================================
// ANALYTICS MONITORING - Centralized monitoring and alerting exports
// ============================================================================

// Core monitoring components
export { 
  AnalyticsMonitor, 
  analyticsMonitor,
  LogLevel,
  AlertType,
  type AnalyticsLogEntry,
  type PerformanceMetrics as MonitoringPerformanceMetrics,
  type CacheMetrics,
  type AlertConfig,
  type AlertEntry,
} from "./AnalyticsMonitor";

export {
  PerformanceMonitor,
  MonitorPerformance,
  PerformanceUtils,
  DEFAULT_THRESHOLDS,
  type PerformanceMeasurement,
  type PerformanceThresholds,
} from "./PerformanceMonitor";

export {
  CacheMonitor,
  cacheMonitor,
  CacheOperation,
  DEFAULT_CACHE_THRESHOLDS,
  type CachePerformanceMetrics,
  type CacheHealthMetrics,
  type CacheAlertThresholds,
} from "./CacheMonitor";

export {
  ErrorTracker,
  errorTracker,
  ErrorSeverity,
  ErrorCategory,
  type TrackedError,
  type ErrorPattern,
  type ErrorStatistics,
} from "./ErrorTracker";

// Monitoring utilities and helpers
export { MonitoringUtils } from "./MonitoringUtils";
