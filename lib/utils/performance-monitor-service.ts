/**
 * Performance Monitor Service
 * 
 * Refactored service class that uses extracted utilities for better modularity
 */

import { 
  PerformanceMetric, 
  PerformanceStats, 
  PerformanceAnalysis, 
  MonitorConfig,
  DEFAULT_MONITOR_CONFIG 
} from './runtime-performance-monitor';
import { calculatePerformanceStats, calculateMedian, analyzeServicePerformance, getCompilationPhaseStats, findSlowestOperations, analyzeFrequentErrors } from './performance-stats';
import { validatePerformanceMetrics, getPerformanceIssues } from './validation-utils';
import { createMetricRecording, createMetricFiltering, createPerformanceSummary } from './performance-hooks';

/**
 * Performance Monitor Service class
 * Refactored to use extracted utilities and composable patterns
 */
export class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private config: MonitorConfig;
  private startTime: number;

  // Composable utilities
  private metricRecording: ReturnType<typeof createMetricRecording>;
  private metricFiltering: ReturnType<typeof createMetricFiltering>;
  private performanceSummary: ReturnType<typeof createPerformanceSummary>;

  constructor(
    thresholds: Partial<MonitorConfig['thresholds']> = {},
    maxMetricsHistory: number = 1000
  ) {
    this.config = { 
      ...DEFAULT_MONITOR_CONFIG, 
      thresholds: { ...DEFAULT_MONITOR_CONFIG.thresholds, ...thresholds },
      maxMetrics: maxMetricsHistory
    };
    this.startTime = Date.now();

    // Initialize composable utilities
    this.metricRecording = createMetricRecording(this.metrics, this.config, (metrics) => {
      this.metrics = metrics;
    });
    this.metricFiltering = createMetricFiltering(this.metrics, this.startTime);
    this.performanceSummary = createPerformanceSummary(this.metrics, this.startTime);
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'>): void {
    this.metricRecording.recordMetric(metric);
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
    this.metricRecording.recordCompilationMetric(phase, executionTime, success, fileCount, error);
  }

  /**
   * Get compilation performance statistics
   */
  getCompilationStats(timeRangeMs?: number) {
    return getCompilationPhaseStats(this.metrics, timeRangeMs, this.startTime);
  }

  /**
   * Get current performance statistics
   */
  getStats(timeRangeMs?: number): PerformanceStats {
    const relevantMetrics = this.metricFiltering.getMetricsInTimeRange(timeRangeMs);
    return calculatePerformanceStats(relevantMetrics, timeRangeMs ? Date.now() - timeRangeMs : this.startTime);
  }

  /**
   * Get metrics for a specific service
   */
  getServiceMetrics(serviceName: string, timeRangeMs?: number): PerformanceMetric[] {
    return this.metricFiltering.getServiceMetrics(serviceName, timeRangeMs);
  }

  /**
   * Get recent performance issues
   */
  getPerformanceIssues(timeRangeMs: number = 300000): PerformanceMetric[] {
    return getPerformanceIssues(this.metrics, this.config.thresholds, timeRangeMs);
  }

  /**
   * Get the number of stored metrics
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }

  /**
   * Record multiple metrics at once
   */
  recordMetrics(metrics: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'>[]): void {
    this.metricRecording.recordMetrics(metrics);
  }

  /**
   * Analyze performance and return comprehensive analysis
   */
  analyzePerformance(): PerformanceAnalysis {
    const stats = this.getStats();
    
    // Calculate validation
    const validation = validatePerformanceMetrics(this.metrics, this.config.thresholds);
    
    // Find slowest operations
    const slowestOperations = findSlowestOperations(this.metrics, 10);
    
    // Analyze frequent errors
    const frequentErrors = analyzeFrequentErrors(this.metrics, 5);
    
    // Analyze performance by service
    const servicePerformance = analyzeServicePerformance(this.metrics);
    
    return {
      totalOperations: stats.totalOperations,
      successfulOperations: stats.successfulOperations,
      failedOperations: stats.failedOperations,
      averageExecutionTime: stats.averageExecutionTime,
      medianExecutionTime: calculateMedian(this.metrics.map(m => m.executionTime)),
      p95ExecutionTime: stats.p95ExecutionTime,
      successRate: stats.successRate,
      errorRate: 100 - stats.successRate,
      slowestOperations,
      frequentErrors,
      servicePerformance,
      validation,
    };
  }

  /**
   * Get performance summary for specific time window (in seconds)
   */
  getPerformanceSummary(timeWindowSeconds?: number) {
    return this.performanceSummary.getPerformanceSummary(timeWindowSeconds);
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<MonitorConfig['thresholds']>): void {
    this.config.thresholds = { ...this.config.thresholds, ...newThresholds };
  }

  /**
   * Import metrics from external source
   */
  importMetrics(metrics: PerformanceMetric[]): void {
    this.metrics = [...this.metrics, ...metrics];
    
    // Maintain maximum metrics limit
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.startTime = Date.now();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(config: Partial<MonitorConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
