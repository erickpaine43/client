/**
 * Performance Monitoring Utilities
 * 
 * Composable utilities for performance monitoring functionality
 */

import { PerformanceMetric, MonitorConfig } from './runtime-performance-monitor';
import { getMemoryUsage, getCpuUsage } from './system-metrics';
import { checkMetricThresholds, checkRecentSuccessRate, logPerformanceIssues } from './validation-utils';

/**
 * Utility for recording performance metrics
 */
export function createMetricRecording(
  metrics: PerformanceMetric[],
  config: MonitorConfig,
  setMetrics: (metrics: PerformanceMetric[]) => void
) {
  const recordMetric = (metric: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'>): void => {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
      memoryUsage: config.trackMemory ? getMemoryUsage() : undefined,
      cpuUsage: config.trackCpu ? getCpuUsage() : undefined,
    };

    const newMetrics = [...metrics, fullMetric];

    // Maintain maximum metrics limit
    const trimmedMetrics = newMetrics.length > config.maxMetrics 
      ? newMetrics.slice(-config.maxMetrics)
      : newMetrics;

    setMetrics(trimmedMetrics);

    // Check for performance issues
    const issues = checkMetricThresholds(fullMetric, config.thresholds, config.enableLogging);
    
    if (issues.length > 0) {
      logPerformanceIssues(fullMetric, issues, config.enableLogging);
    }

    // Check success rate over recent operations
    const successRateCheck = checkRecentSuccessRate(trimmedMetrics, config.thresholds.minSuccessRate);
    if (!successRateCheck.isValid && config.enableLogging) {
      logPerformanceIssues(fullMetric, successRateCheck.issues, config.enableLogging);
    }
  };

  const recordCompilationMetric = (
    phase: 'tsc' | 'eslint' | 'build' | 'test',
    executionTime: number,
    success: boolean,
    fileCount?: number,
    error?: string
  ): void => {
    if (!config.trackCompilation) return;

    const metric: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'> = {
      operation: 'compilation',
      executionTime,
      success,
      service: 'build-system',
      queryName: phase,
      compilationPhase: phase,
      fileCount,
      error,
    };

    recordMetric(metric);
  };

  const recordMetrics = (metricsToRecord: Omit<PerformanceMetric, 'timestamp' | 'memoryUsage' | 'cpuUsage'>[]): void => {
    metricsToRecord.forEach(metric => recordMetric(metric));
  };

  return {
    recordMetric,
    recordCompilationMetric,
    recordMetrics,
  };
}

/**
 * Utility for filtering metrics by time range
 */
export function createMetricFiltering(metrics: PerformanceMetric[], startTime: number) {
  const getMetricsInTimeRange = (timeRangeMs?: number): PerformanceMetric[] => {
    if (!timeRangeMs) return metrics;
    
    const now = Date.now();
    const filterStartTime = now - timeRangeMs;
    
    return metrics.filter(metric => metric.timestamp >= filterStartTime);
  };

  const getServiceMetrics = (serviceName: string, timeRangeMs?: number): PerformanceMetric[] => {
    const now = Date.now();
    const filterStartTime = timeRangeMs ? now - timeRangeMs : startTime;
    
    return metrics.filter(
      metric => 
        metric.service === serviceName && 
        metric.timestamp >= filterStartTime
    );
  };

  return {
    getMetricsInTimeRange,
    getServiceMetrics,
  };
}

/**
 * Utility for performance summary calculations
 */
export function createPerformanceSummary(metrics: PerformanceMetric[], startTime: number) {
  const getPerformanceSummary = (timeWindowSeconds?: number): {
    totalOperations: number;
    averageExecutionTime: number;
    successRate: number;
  } => {
    const now = Date.now();
    const timeRangeMs = timeWindowSeconds ? timeWindowSeconds * 1000 : undefined;
    const filterStartTime = timeRangeMs ? now - timeRangeMs : startTime;
    
    const relevantMetrics = metrics.filter(
      metric => metric.timestamp >= filterStartTime
    );

    if (relevantMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageExecutionTime: 0,
        successRate: 0,
      };
    }

    const totalOps = relevantMetrics.length;
    const successfulOps = relevantMetrics.filter(m => m.success).length;
    const avgExecutionTime = relevantMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalOps;

    return {
      totalOperations: totalOps,
      averageExecutionTime: avgExecutionTime,
      successRate: (successfulOps / totalOps) * 100,
    };
  };

  return {
    getPerformanceSummary,
  };
}
