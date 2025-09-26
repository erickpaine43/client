/**
 * Performance Validation Utilities
 * 
 * Extracted from RuntimePerformanceMonitor for better modularity
 */

import { PerformanceMetric, PerformanceValidation, MonitorConfig } from './runtime-performance-monitor';

/**
 * Default runtime performance thresholds
 */
export const DEFAULT_RUNTIME_THRESHOLDS = {
  maxQueryTime: 5000,
  maxMutationTime: 10000,
  maxAverageResponseTime: 2000,
  minSuccessRate: 95,
  maxErrorRate: 5,
};

/**
 * Validate performance metrics against thresholds
 */
export function validatePerformanceMetrics(
  metrics: PerformanceMetric[],
  thresholds: MonitorConfig['thresholds']
): PerformanceValidation {
  const recentMetrics = metrics.slice(-50);
  const issues: string[] = [];
  const warnings: string[] = [];
  
  if (recentMetrics.length === 0) {
    warnings.push('No metrics available for analysis');
    return {
      overallValid: true,
      checks: {
        executionTimeValid: true,
        averageResponseTimeValid: true,
        successRateValid: true,
        errorRateValid: true,
        slowQueriesValid: true,
      },
      issues: [],
      warnings,
    };
  }
  
  // Check execution time
  const avgExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length;
  const executionTimeValid = avgExecutionTime <= thresholds.maxExecutionTime;
  const averageResponseTimeValid = avgExecutionTime <= (DEFAULT_RUNTIME_THRESHOLDS.maxAverageResponseTime || 2000);
  
  if (!executionTimeValid) {
    issues.push(`Average execution time (${avgExecutionTime.toFixed(2)}ms) exceeds threshold`);
  }
  
  if (!averageResponseTimeValid) {
    warnings.push(`Average response time (${avgExecutionTime.toFixed(2)}ms) exceeds threshold`);
  }
  
  // Check success rate
  const successCount = recentMetrics.filter(m => m.success).length;
  const successRate = (successCount / recentMetrics.length) * 100;
  const errorRate = 100 - successRate;
  const successRateValid = successRate >= thresholds.minSuccessRate;
  const errorRateValid = errorRate <= (DEFAULT_RUNTIME_THRESHOLDS.maxErrorRate || 5);
  
  if (!successRateValid) {
    issues.push(`Success rate (${successRate.toFixed(1)}%) below threshold`);
    warnings.push(`Success rate (${successRate.toFixed(1)}%) below threshold`);
  }
  
  if (!errorRateValid) {
    warnings.push(`Error rate (${errorRate.toFixed(1)}%) above threshold`);
  }
  
  // Check for slow queries
  const slowQueries = recentMetrics.filter(m => m.executionTime > thresholds.maxExecutionTime);
  const slowQueriesValid = slowQueries.length === 0;
  if (!slowQueriesValid) {
    issues.push(`${slowQueries.length} slow queries detected`);
    warnings.push(`${slowQueries.length} queries exceed execution time thresholds`);
  }
  
  return {
    overallValid: executionTimeValid && averageResponseTimeValid && successRateValid && errorRateValid && slowQueriesValid,
    checks: {
      executionTimeValid,
      averageResponseTimeValid,
      successRateValid,
      errorRateValid,
      slowQueriesValid,
    },
    issues,
    warnings,
  };
}

/**
 * Check individual metric against performance thresholds
 */
export function checkMetricThresholds(
  metric: PerformanceMetric,
  thresholds: MonitorConfig['thresholds'],
  _enableLogging: boolean = true
): string[] {
  const issues: string[] = [];

  if (!metric.success) {
    issues.push(`Operation failed: ${metric.error || 'Unknown error'}`);
  }

  // Check execution time thresholds
  const executionThreshold = metric.operation === 'compilation' 
    ? thresholds.maxCompilationTime 
    : thresholds.maxExecutionTime;
  
  if (metric.executionTime > executionThreshold) {
    const thresholdType = metric.operation === 'compilation' ? 'compilation' : 'execution';
    issues.push(`Slow ${thresholdType}: ${metric.executionTime}ms (threshold: ${executionThreshold}ms)`);
  }

  if (metric.memoryUsage && metric.memoryUsage > thresholds.maxMemoryUsage) {
    issues.push(`High memory usage: ${metric.memoryUsage}MB (threshold: ${thresholds.maxMemoryUsage}MB)`);
  }

  if (metric.cpuUsage && metric.cpuUsage > thresholds.maxCpuUsage) {
    issues.push(`High CPU usage: ${metric.cpuUsage}% (threshold: ${thresholds.maxCpuUsage}%)`);
  }

  // Special handling for compilation metrics
  if (metric.operation === 'compilation' && metric.compilationPhase) {
    const phaseThresholds = {
      tsc: 10000, // 10 seconds for TypeScript compilation
      eslint: 5000, // 5 seconds for ESLint
      build: 30000, // 30 seconds for build
      test: 60000, // 60 seconds for tests
    };

    const phaseThreshold = phaseThresholds[metric.compilationPhase];
    if (metric.executionTime > phaseThreshold) {
      issues.push(`Slow ${metric.compilationPhase} phase: ${metric.executionTime}ms (threshold: ${phaseThreshold}ms)`);
    }
  }

  return issues;
}

/**
 * Check success rate over recent operations
 */
export function checkRecentSuccessRate(
  metrics: PerformanceMetric[],
  minSuccessRate: number,
  sampleSize: number = 50
): { isValid: boolean; successRate: number; issues: string[] } {
  const recentMetrics = metrics.slice(-sampleSize);
  const issues: string[] = [];
  
  if (recentMetrics.length < 10) {
    return { isValid: true, successRate: 100, issues };
  }
  
  const recentSuccessRate = (recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100;
  const isValid = recentSuccessRate >= minSuccessRate;
  
  if (!isValid) {
    issues.push(`Low success rate: ${recentSuccessRate.toFixed(1)}% (threshold: ${minSuccessRate}%)`);
  }
  
  return { isValid, successRate: recentSuccessRate, issues };
}

/**
 * Get performance issues from metrics
 */
export function getPerformanceIssues(
  metrics: PerformanceMetric[],
  thresholds: MonitorConfig['thresholds'],
  timeRangeMs: number = 300000
): PerformanceMetric[] {
  const now = Date.now();
  const startTime = now - timeRangeMs;
  
  return metrics.filter(metric => 
    metric.timestamp >= startTime && (
      !metric.success ||
      metric.executionTime > thresholds.maxExecutionTime ||
      (metric.memoryUsage && metric.memoryUsage > thresholds.maxMemoryUsage)
    )
  );
}

/**
 * Log performance issues to console
 */
export function logPerformanceIssues(
  metric: PerformanceMetric,
  issues: string[],
  enableLogging: boolean = true
): void {
  if (!enableLogging || issues.length === 0) return;

  console.warn(`[RuntimePerformanceMonitor] Performance issues detected:`, {
    service: metric.service,
    operation: metric.operation,
    queryName: metric.queryName,
    compilationPhase: metric.compilationPhase,
    issues,
    metric,
  });
}
