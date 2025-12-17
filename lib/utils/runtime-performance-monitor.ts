/**
 * Runtime Performance Monitor for ConvexQueryHelper
 * 
 * This utility monitors the runtime performance impact of the ConvexQueryHelper
 * to ensure it doesn't negatively affect application performance.
 * 
 * Requirements addressed:
 * - 2.3: Performance monitoring and validation
 * - 3.1: No performance degradation
 */

/**
 * Performance metric data structure
 */
export interface PerformanceMetric {
  /** Metric timestamp */
  timestamp: number;
  /** Operation type (query, mutation, compilation, etc.) */
  operation: string;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Success/failure status */
  success: boolean;
  /** Service context */
  service?: string;
  /** Query name for identification */
  queryName?: string;
  /** Error message if failed */
  error?: string;
  /** Memory usage snapshot (optional) */
  memoryUsage?: number;
  /** CPU usage percentage (optional) */
  cpuUsage?: number;
  /** Compilation phase (for compilation operations) */
  compilationPhase?: 'tsc' | 'eslint' | 'build' | 'test';
  /** File count processed (for compilation operations) */
  fileCount?: number;
}

/**
 * Service performance analysis
 */
export interface ServicePerformanceAnalysis {
  totalOperations: number;
  successfulOperations: number;
  averageExecutionTime: number;
  successRate: number;
  commonQueries: { queryName: string; count: number; avgTime: number }[];
}

/**
 * Performance validation result
 */
export interface PerformanceValidation {
  overallValid: boolean;
  checks: {
    executionTimeValid: boolean;
    averageResponseTimeValid: boolean;
    successRateValid: boolean;
    errorRateValid: boolean;
    slowQueriesValid: boolean;
  };
  issues: string[];
  warnings: string[];
}

/**
 * Comprehensive performance analysis
 */
export interface PerformanceAnalysis {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  p95ExecutionTime: number;
  successRate: number;
  errorRate: number;
  slowestOperations: PerformanceMetric[];
  frequentErrors: { error: string; count: number }[];
  servicePerformance: Record<string, ServicePerformanceAnalysis>;
  validation: PerformanceValidation;
}

/**
 * Performance statistics aggregation
 */
export interface PerformanceStats {
  /** Total number of operations */
  totalOperations: number;
  /** Successful operations count */
  successfulOperations: number;
  /** Failed operations count */
  failedOperations: number;
  /** Average execution time */
  averageExecutionTime: number;
  /** Minimum execution time */
  minExecutionTime: number;
  /** Maximum execution time */
  maxExecutionTime: number;
  /** 95th percentile execution time */
  p95ExecutionTime: number;
  /** Success rate percentage */
  successRate: number;
  /** Operations per second */
  operationsPerSecond: number;
  /** Time range of statistics */
  timeRange: {
    start: number;
    end: number;
  };
  /** Compilation-specific statistics */
  compilationStats?: {
    /** Average TypeScript compilation time */
    avgTscTime: number;
    /** Average ESLint time */
    avgEslintTime: number;
    /** Average build time */
    avgBuildTime: number;
    /** Total files processed */
    totalFilesProcessed: number;
    /** Compilation success rate */
    compilationSuccessRate: number;
  };
}

/**
 * Performance monitoring configuration
 */
export interface MonitorConfig {
  /** Maximum number of metrics to store */
  maxMetrics: number;
  /** Enable memory usage tracking */
  trackMemory: boolean;
  /** Enable CPU usage tracking */
  trackCpu: boolean;
  /** Performance alert thresholds */
  thresholds: {
    /** Maximum acceptable execution time (ms) */
    maxExecutionTime: number;
    /** Minimum acceptable success rate (%) */
    minSuccessRate: number;
    /** Maximum acceptable memory usage (MB) */
    maxMemoryUsage: number;
    /** Maximum acceptable CPU usage (%) */
    maxCpuUsage: number;
    /** Maximum acceptable compilation time (ms) */
    maxCompilationTime: number;
  };
  /** Enable console logging of performance issues */
  enableLogging: boolean;
  /** Enable compilation time tracking */
  trackCompilation: boolean;
}

/**
 * Default monitoring configuration
 */
export const DEFAULT_MONITOR_CONFIG: MonitorConfig = {
  maxMetrics: 1000,
  trackMemory: true,
  trackCpu: true,
  trackCompilation: true,
  thresholds: {
    maxExecutionTime: 5000, // 5 seconds
    minSuccessRate: 95, // 95%
    maxMemoryUsage: 100, // 100MB
    maxCpuUsage: 80, // 80%
    maxCompilationTime: 15000, // 15 seconds as per requirement 1.2
  },
  enableLogging: true,
};

// Import the service for internal use
import { PerformanceMonitorService } from './performance-monitor-service';

/**
 * Runtime Performance Monitor class
 * @deprecated Use PerformanceMonitorService from './performance-monitor-service' instead
 */
export class RuntimePerformanceMonitor {
  private service: PerformanceMonitorService;

  constructor(
    thresholds: Partial<MonitorConfig['thresholds']> = {},
    maxMetricsHistory: number = 1000
  ) {
    // Use the new service internally for backward compatibility
    this.service = new PerformanceMonitorService(thresholds, maxMetricsHistory);
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'>): void {
    this.service.recordMetric(metric);
  }

  /**
   * Record compilation performance metric
   */
  recordCompilationMetric(
    phase: 'tsc' | 'eslint' | 'build' | 'test',
    executionTime: number,
    success: boolean,
    fileCount?: number,
    error?: string
  ): void {
    this.service.recordCompilationMetric(phase, executionTime, success, fileCount, error);
  }

  /**
   * Get compilation performance statistics
   */
  getCompilationStats(timeRangeMs?: number) {
    return this.service.getCompilationStats(timeRangeMs);
  }

  /**
   * Get current performance statistics
   */
  getStats(timeRangeMs?: number): PerformanceStats {
    return this.service.getStats(timeRangeMs);
  }

  /**
   * Get metrics for a specific service
   */
  getServiceMetrics(serviceName: string, timeRangeMs?: number): PerformanceMetric[] {
    return this.service.getServiceMetrics(serviceName, timeRangeMs);
  }

  /**
   * Get recent performance issues
   */
  getPerformanceIssues(timeRangeMs: number = 300000): PerformanceMetric[] {
    return this.service.getPerformanceIssues(timeRangeMs);
  }

  /**
   * Get the number of stored metrics
   */
  getMetricsCount(): number {
    return this.service.getMetricsCount();
  }

  /**
   * Record multiple metrics at once
   */
  recordMetrics(metrics: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'>[]): void {
    this.service.recordMetrics(metrics);
  }

  /**
   * Analyze performance and return comprehensive analysis
   */
  analyzePerformance(): PerformanceAnalysis {
    return this.service.analyzePerformance();
  }

  /**
   * Get performance summary for specific time window (in seconds)
   */
  getPerformanceSummary(timeWindowSeconds?: number) {
    return this.service.getPerformanceSummary(timeWindowSeconds);
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<MonitorConfig['thresholds']>): void {
    this.service.updateThresholds(newThresholds);
  }

  /**
   * Import metrics from external source
   */
  importMetrics(metrics: PerformanceMetric[]): void {
    this.service.importMetrics(metrics);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.service.clearMetrics();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return this.service.exportMetrics();
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(config: Partial<MonitorConfig>): void {
    this.service.updateConfig(config);
  }


}

/**
 * Global runtime monitor instance
 * @deprecated Use functions from './performance-measurement' instead
 */
let globalMonitor: RuntimePerformanceMonitor | null = null;

/**
 * Get or create the global runtime performance monitor
 * @deprecated Use getGlobalPerformanceMonitor from './performance-measurement' instead
 */
export function getGlobalRuntimeMonitor(): RuntimePerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new RuntimePerformanceMonitor();
  }
  return globalMonitor;
}

/**
 * Initialize global monitor with custom configuration
 * @deprecated Use initializeGlobalPerformanceMonitor from './performance-measurement' instead
 */
export function initializeGlobalMonitor(config: Partial<MonitorConfig>): RuntimePerformanceMonitor {
  globalMonitor = new RuntimePerformanceMonitor(config.thresholds || {}, config.maxMetrics || 1000);
  return globalMonitor;
}

/**
 * Reset global monitor (useful for testing)
 * @deprecated Use resetGlobalPerformanceMonitor from './performance-measurement' instead
 */
export function resetGlobalMonitor(): void {
  globalMonitor = null;
}

/**
 * Create a runtime performance monitor with custom configuration
 * @deprecated Use PerformanceMonitorService from './performance-monitor-service' instead
 */
export function createRuntimePerformanceMonitor(
  thresholds?: Partial<MonitorConfig['thresholds']>,
  maxMetrics?: number
): RuntimePerformanceMonitor {
  return new RuntimePerformanceMonitor(thresholds || {}, maxMetrics || 1000);
}

/**
 * Initialize global runtime monitoring with custom configuration
 * @deprecated Use initializeGlobalPerformanceMonitor from './performance-measurement' instead
 */
export function initializeGlobalRuntimeMonitoring(
  thresholds?: Partial<MonitorConfig['thresholds']>,
  maxMetrics?: number
): RuntimePerformanceMonitor {
  globalMonitor = new RuntimePerformanceMonitor(thresholds || {}, maxMetrics || 1000);
  return globalMonitor;
}

/**
 * Runtime performance thresholds type alias for backward compatibility
 */
export type RuntimePerformanceThresholds = MonitorConfig['thresholds'];

// Re-export utilities from the new modular structure for backward compatibility
export { measureAsync, measureSync, measureCompilation } from './performance-measurement';
export { getCompilationReport, monitorConvexHelperImpact } from './performance-reporting';
export { DEFAULT_RUNTIME_THRESHOLDS } from './validation-utils';
