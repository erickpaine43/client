/**
 * Performance Monitoring Utilities
 * 
 * Modular performance monitoring system extracted from RuntimePerformanceMonitor
 */

// Core service
export { PerformanceMonitorService } from '../performance-monitor-service';

// Statistics utilities
export {
  calculatePerformanceStats,
  calculateCompilationStats,
  calculateMedian,
  analyzeServicePerformance,
  getCompilationPhaseStats,
  findSlowestOperations,
  analyzeFrequentErrors
} from '../performance-stats';

// Validation utilities
export {
  validatePerformanceMetrics,
  checkMetricThresholds,
  checkRecentSuccessRate,
  getPerformanceIssues,
  logPerformanceIssues,
  DEFAULT_RUNTIME_THRESHOLDS
} from '../validation-utils';

// System metrics
export {
  getMemoryUsage,
  getCpuUsage
} from '../system-metrics';

// Composable utilities
export {
  createMetricRecording,
  createMetricFiltering,
  createPerformanceSummary
} from '../performance-hooks';

// Measurement utilities
export {
  getGlobalPerformanceMonitor,
  initializeGlobalPerformanceMonitor,
  resetGlobalPerformanceMonitor,
  measureAsync,
  measureSync,
  measureCompilation
} from '../performance-measurement';

// Reporting utilities
export {
  getCompilationReport,
  monitorConvexHelperImpact,
  generatePerformanceReport
} from '../performance-reporting';

// Types and interfaces (re-exported from main file)
export type {
  PerformanceMetric,
  PerformanceStats,
  PerformanceAnalysis,
  PerformanceValidation,
  ServicePerformanceAnalysis,
  MonitorConfig,
  RuntimePerformanceThresholds
} from '../runtime-performance-monitor';
