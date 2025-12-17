/**
 * Performance Reporting Utilities
 * 
 * Utilities for generating performance reports and monitoring ConvexQueryHelper impact
 */

import { getGlobalPerformanceMonitor } from './performance-measurement';
import { getCompilationPhaseStats } from './performance-stats';
import type { PerformanceMetric } from './runtime-performance-monitor';

/**
 * Get compilation performance report
 */
export function getCompilationReport(timeRangeMs?: number): {
  summary: string;
  details: ReturnType<typeof getCompilationPhaseStats>;
  recommendations: string[];
} {
  const monitor = getGlobalPerformanceMonitor();
  const stats = monitor.getCompilationStats(timeRangeMs);
  
  const recommendations: string[] = [];
  
  if (stats.tscStats.avgTime > 10000) {
    recommendations.push('TypeScript compilation is slow. Consider using incremental compilation or project references.');
  }
  
  if (stats.eslintStats.avgTime > 5000) {
    recommendations.push('ESLint is slow. Consider using eslint cache or reducing the number of rules.');
  }
  
  if (stats.buildStats.avgTime > 30000) {
    recommendations.push('Build process is slow. Consider optimizing webpack configuration or using build caching.');
  }
  
  if (stats.compilationSuccessRate < 95) {
    recommendations.push('Compilation success rate is low. Review and fix recurring compilation issues.');
  }
  
  const summary = `Compilation Performance Summary:
- TypeScript: ${stats.tscStats.avgTime.toFixed(0)}ms avg (${stats.tscStats.count} runs, ${stats.tscStats.successRate.toFixed(1)}% success)
- ESLint: ${stats.eslintStats.avgTime.toFixed(0)}ms avg (${stats.eslintStats.count} runs, ${stats.eslintStats.successRate.toFixed(1)}% success)
- Build: ${stats.buildStats.avgTime.toFixed(0)}ms avg (${stats.buildStats.count} runs, ${stats.buildStats.successRate.toFixed(1)}% success)
- Tests: ${stats.testStats.avgTime.toFixed(0)}ms avg (${stats.testStats.count} runs, ${stats.testStats.successRate.toFixed(1)}% success)
- Total Compilation Time: ${stats.totalCompilationTime.toFixed(0)}ms
- Overall Success Rate: ${stats.compilationSuccessRate.toFixed(1)}%`;

  return {
    summary,
    details: stats,
    recommendations,
  };
}

/**
 * Monitor ConvexQueryHelper performance impact
 */
export function monitorConvexHelperImpact(): {
  queryPerformance: { avgTime: number; count: number; successRate: number };
  mutationPerformance: { avgTime: number; count: number; successRate: number };
  overallImpact: string;
} {
  const monitor = getGlobalPerformanceMonitor();
  const timeRange = 24 * 60 * 60 * 1000; // Last 24 hours
  
  const queryMetrics = monitor.getServiceMetrics('convex-query-helper', timeRange)
    .filter(m => m.operation === 'query');
  const mutationMetrics = monitor.getServiceMetrics('convex-query-helper', timeRange)
    .filter(m => m.operation === 'mutation');
  
  const calculateStats = (metrics: PerformanceMetric[]) => {
    if (metrics.length === 0) return { avgTime: 0, count: 0, successRate: 0 };
    
    const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    const successCount = metrics.filter(m => m.success).length;
    const successRate = (successCount / metrics.length) * 100;
    
    return { avgTime, count: metrics.length, successRate };
  };
  
  const queryPerformance = calculateStats(queryMetrics);
  const mutationPerformance = calculateStats(mutationMetrics);
  
  // Determine overall impact
  let overallImpact = 'minimal';
  if (queryPerformance.avgTime > 1000 || mutationPerformance.avgTime > 1000) {
    overallImpact = 'high';
  } else if (queryPerformance.avgTime > 500 || mutationPerformance.avgTime > 500) {
    overallImpact = 'moderate';
  }
  
  return {
    queryPerformance,
    mutationPerformance,
    overallImpact,
  };
}

/**
 * Generate performance summary report
 */
export function generatePerformanceReport(timeRangeMs?: number): {
  summary: string;
  analysis: import('./runtime-performance-monitor').PerformanceAnalysis;
  compilationReport: ReturnType<typeof getCompilationReport>;
  convexImpact: ReturnType<typeof monitorConvexHelperImpact>;
} {
  const monitor = getGlobalPerformanceMonitor();
  const analysis = monitor.analyzePerformance();
  const compilationReport = getCompilationReport(timeRangeMs);
  const convexImpact = monitorConvexHelperImpact();
  
  const summary = `Performance Report Summary:
- Total Operations: ${analysis.totalOperations}
- Success Rate: ${analysis.successRate.toFixed(1)}%
- Average Execution Time: ${analysis.averageExecutionTime.toFixed(2)}ms
- P95 Execution Time: ${analysis.p95ExecutionTime.toFixed(2)}ms
- Performance Issues: ${analysis.validation.issues.length}
- ConvexQueryHelper Impact: ${convexImpact.overallImpact}`;

  return {
    summary,
    analysis,
    compilationReport,
    convexImpact,
  };
}
