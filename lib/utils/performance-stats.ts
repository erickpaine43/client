/**
 * Performance Statistics Utilities
 * 
 * Extracted from RuntimePerformanceMonitor for better modularity
 */

import { PerformanceMetric, PerformanceStats, ServicePerformanceAnalysis } from './runtime-performance-monitor';

/**
 * Calculate performance statistics from metrics
 */
export function calculatePerformanceStats(
  metrics: PerformanceMetric[],
  startTime: number
): PerformanceStats {
  const now = Date.now();
  
  if (metrics.length === 0) {
    return {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageExecutionTime: 0,
      minExecutionTime: 0,
      maxExecutionTime: 0,
      p95ExecutionTime: 0,
      successRate: 0,
      operationsPerSecond: 0,
      timeRange: { start: startTime, end: now },
    };
  }

  const executionTimes = metrics.map(m => m.executionTime);
  const successfulOps = metrics.filter(m => m.success).length;
  const totalOps = metrics.length;
  const timeRangeSeconds = (now - startTime) / 1000;

  // Calculate percentiles
  const sortedTimes = [...executionTimes].sort((a, b) => a - b);
  const p95Index = Math.floor(sortedTimes.length * 0.95);

  // Calculate compilation-specific statistics
  const compilationMetrics = metrics.filter(m => m.operation === 'compilation');
  let compilationStats;
  
  if (compilationMetrics.length > 0) {
    compilationStats = calculateCompilationStats(compilationMetrics);
  }

  return {
    totalOperations: totalOps,
    successfulOperations: successfulOps,
    failedOperations: totalOps - successfulOps,
    averageExecutionTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
    minExecutionTime: Math.min(...executionTimes),
    maxExecutionTime: Math.max(...executionTimes),
    p95ExecutionTime: sortedTimes[p95Index] || 0,
    successRate: (successfulOps / totalOps) * 100,
    operationsPerSecond: totalOps / timeRangeSeconds,
    timeRange: { start: startTime, end: now },
    compilationStats,
  };
}

/**
 * Calculate compilation-specific statistics
 */
export function calculateCompilationStats(compilationMetrics: PerformanceMetric[]) {
  const tscMetrics = compilationMetrics.filter(m => m.compilationPhase === 'tsc');
  const eslintMetrics = compilationMetrics.filter(m => m.compilationPhase === 'eslint');
  const buildMetrics = compilationMetrics.filter(m => m.compilationPhase === 'build');
  
  const avgTscTime = tscMetrics.length > 0 
    ? tscMetrics.reduce((sum, m) => sum + m.executionTime, 0) / tscMetrics.length 
    : 0;
  const avgEslintTime = eslintMetrics.length > 0 
    ? eslintMetrics.reduce((sum, m) => sum + m.executionTime, 0) / eslintMetrics.length 
    : 0;
  const avgBuildTime = buildMetrics.length > 0 
    ? buildMetrics.reduce((sum, m) => sum + m.executionTime, 0) / buildMetrics.length 
    : 0;
  
  const totalFilesProcessed = compilationMetrics.reduce((sum, m) => sum + (m.fileCount || 0), 0);
  const compilationSuccessCount = compilationMetrics.filter(m => m.success).length;
  const compilationSuccessRate = (compilationSuccessCount / compilationMetrics.length) * 100;

  return {
    avgTscTime,
    avgEslintTime,
    avgBuildTime,
    totalFilesProcessed,
    compilationSuccessRate,
  };
}

/**
 * Calculate median from array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Analyze service performance from metrics
 */
export function analyzeServicePerformance(
  metrics: PerformanceMetric[]
): Record<string, ServicePerformanceAnalysis> {
  const servicePerformance = new Map<string, ServicePerformanceAnalysis>();
  
  // Initialize service stats
  metrics.forEach(metric => {
    const service = metric.service || 'unknown';
    if (!servicePerformance.has(service)) {
      servicePerformance.set(service, {
        totalOperations: 0,
        successfulOperations: 0,
        averageExecutionTime: 0,
        successRate: 0,
        commonQueries: [],
      });
    }
    
    const serviceStats = servicePerformance.get(service)!;
    serviceStats.totalOperations++;
    if (metric.success) serviceStats.successfulOperations++;
  });
  
  // Calculate average execution times and success rates for services
  servicePerformance.forEach((stats, service) => {
    const serviceMetrics = metrics.filter(m => (m.service || 'unknown') === service);
    stats.averageExecutionTime = serviceMetrics.reduce((sum, m) => sum + m.executionTime, 0) / serviceMetrics.length;
    stats.successRate = (stats.successfulOperations / stats.totalOperations) * 100;
    
    // Calculate common queries with average times
    const queryMap = new Map<string, { count: number; totalTime: number }>();
    serviceMetrics.forEach(m => {
      const queryName = m.queryName || 'unknown';
      const existing = queryMap.get(queryName) || { count: 0, totalTime: 0 };
      queryMap.set(queryName, {
        count: existing.count + 1,
        totalTime: existing.totalTime + m.executionTime
      });
    });
    
    stats.commonQueries = Array.from(queryMap.entries())
      .map(([queryName, data]) => ({ 
        queryName, 
        count: data.count, 
        avgTime: data.totalTime / data.count 
      }))
      .sort((a, b) => b.count - a.count);
  });
  
  return Object.fromEntries(servicePerformance);
}

/**
 * Get compilation statistics for specific phases
 */
export function getCompilationPhaseStats(
  compilationMetrics: PerformanceMetric[],
  timeRangeMs?: number,
  startTime?: number
) {
  const now = Date.now();
  const filterStartTime = timeRangeMs ? now - timeRangeMs : startTime || 0;
  
  const filteredMetrics = compilationMetrics.filter(
    metric => 
      metric.operation === 'compilation' && 
      metric.timestamp >= filterStartTime
  );

  const getPhaseStats = (phase: 'tsc' | 'eslint' | 'build' | 'test') => {
    const phaseMetrics = filteredMetrics.filter(m => m.compilationPhase === phase);
    if (phaseMetrics.length === 0) {
      return { avgTime: 0, successRate: 0, count: 0 };
    }

    const avgTime = phaseMetrics.reduce((sum, m) => sum + m.executionTime, 0) / phaseMetrics.length;
    const successCount = phaseMetrics.filter(m => m.success).length;
    const successRate = (successCount / phaseMetrics.length) * 100;

    return { avgTime, successRate, count: phaseMetrics.length };
  };

  const totalCompilationTime = filteredMetrics.reduce((sum, m) => sum + m.executionTime, 0);
  const compilationSuccessCount = filteredMetrics.filter(m => m.success).length;
  const compilationSuccessRate = filteredMetrics.length > 0 
    ? (compilationSuccessCount / filteredMetrics.length) * 100 
    : 0;

  return {
    tscStats: getPhaseStats('tsc'),
    eslintStats: getPhaseStats('eslint'),
    buildStats: getPhaseStats('build'),
    testStats: getPhaseStats('test'),
    totalCompilationTime,
    compilationSuccessRate,
  };
}

/**
 * Find slowest operations from metrics
 */
export function findSlowestOperations(
  metrics: PerformanceMetric[],
  limit: number = 10
): PerformanceMetric[] {
  return [...metrics]
    .sort((a, b) => b.executionTime - a.executionTime)
    .slice(0, limit);
}

/**
 * Analyze frequent errors from metrics
 */
export function analyzeFrequentErrors(
  metrics: PerformanceMetric[],
  limit: number = 5
): { error: string; count: number }[] {
  const errorMetrics = metrics.filter(m => !m.success);
  const errorCounts = new Map<string, number>();
  
  errorMetrics.forEach(m => {
    const error = m.error || 'Unknown error';
    errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
  });
  
  return Array.from(errorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([error, count]) => ({ error, count }));
}
