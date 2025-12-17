/**
 * Error monitoring and performance tracking utilities for server actions
 * 
 * This module provides comprehensive monitoring capabilities for action errors,
 * performance metrics, and operational insights.
 */

import { ActionError, ActionErrorType } from './types';
import { ActionError as ActionErrorClass } from './errors';

/**
 * Error metrics for monitoring and alerting
 */
export interface ErrorMetrics {
  errorType: ActionErrorType;
  errorCode?: string;
  actionName: string;
  userId?: string;
  companyId?: string;
  timestamp: number;
  count: number;
  details?: Record<string, unknown>;
}

/**
 * Performance metrics for action monitoring
 */
export interface ActionPerformanceMetrics {
  actionName: string;
  duration: number;
  success: boolean;
  errorType?: ActionErrorType;
  userId?: string;
  companyId?: string;
  timestamp: number;
  memoryUsage?: number;
  cacheHit?: boolean;
}

/**
 * Convex-specific performance metrics
 */
export interface ConvexPerformanceMetrics {
  queryName: string;
  executionTime: number;
  success: boolean;
  retryCount?: number;
  cacheHit?: boolean;
  args: Record<string, unknown>;
  context: string;
  timestamp: number;
}

/**
 * Error rate tracking for alerting
 */
export interface ErrorRateMetrics {
  actionName: string;
  timeWindow: number; // milliseconds
  totalRequests: number;
  errorCount: number;
  errorRate: number; // percentage
  threshold: number; // alert threshold
  timestamp: number;
}

/**
 * In-memory metrics store for development and testing
 */
class MetricsStore {
  private errorMetrics: ErrorMetrics[] = [];
  private performanceMetrics: ActionPerformanceMetrics[] = [];
  private convexMetrics: ConvexPerformanceMetrics[] = [];
  private errorRates: Map<string, ErrorRateMetrics> = new Map();

  /**
   * Record an error metric
   */
  recordError(metric: ErrorMetrics): void {
    this.errorMetrics.push(metric);
    this.updateErrorRate(metric);
    
    // Keep only last 1000 entries in development
    if (this.errorMetrics.length > 1000) {
      this.errorMetrics = this.errorMetrics.slice(-1000);
    }
  }

  /**
   * Record a performance metric
   */
  recordPerformance(metric: ActionPerformanceMetrics): void {
    this.performanceMetrics.push(metric);
    
    // Keep only last 1000 entries in development
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  /**
   * Record a Convex-specific metric
   */
  recordConvexMetric(metric: ConvexPerformanceMetrics): void {
    this.convexMetrics.push(metric);
    
    // Keep only last 1000 entries in development
    if (this.convexMetrics.length > 1000) {
      this.convexMetrics = this.convexMetrics.slice(-1000);
    }
  }

  /**
   * Update error rate tracking
   */
  private updateErrorRate(errorMetric: ErrorMetrics): void {
    const key = errorMetric.actionName;
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    const existing = this.errorRates.get(key);
    if (existing && (now - existing.timestamp) < timeWindow) {
      existing.errorCount += errorMetric.count;
      existing.totalRequests += 1;
      existing.errorRate = (existing.errorCount / existing.totalRequests) * 100;
    } else {
      this.errorRates.set(key, {
        actionName: errorMetric.actionName,
        timeWindow,
        totalRequests: 1,
        errorCount: errorMetric.count,
        errorRate: (errorMetric.count / 1) * 100,
        threshold: 50, // 50% error rate threshold
        timestamp: now,
      });
    }
  }

  /**
   * Get error metrics for analysis
   */
  getErrorMetrics(actionName?: string): ErrorMetrics[] {
    if (actionName) {
      return this.errorMetrics.filter(m => m.actionName === actionName);
    }
    return [...this.errorMetrics];
  }

  /**
   * Get performance metrics for analysis
   */
  getPerformanceMetrics(actionName?: string): ActionPerformanceMetrics[] {
    if (actionName) {
      return this.performanceMetrics.filter(m => m.actionName === actionName);
    }
    return [...this.performanceMetrics];
  }

  /**
   * Get Convex metrics for analysis
   */
  getConvexMetrics(queryName?: string): ConvexPerformanceMetrics[] {
    if (queryName) {
      return this.convexMetrics.filter(m => m.queryName === queryName);
    }
    return [...this.convexMetrics];
  }

  /**
   * Get error rates for alerting
   */
  getErrorRates(): ErrorRateMetrics[] {
    return Array.from(this.errorRates.values());
  }

  /**
   * Get high error rate actions (above threshold)
   */
  getHighErrorRateActions(): ErrorRateMetrics[] {
    return this.getErrorRates().filter(rate => rate.errorRate > rate.threshold);
  }

  /**
   * Clear all metrics (for testing)
   */
  clear(): void {
    this.errorMetrics = [];
    this.performanceMetrics = [];
    this.convexMetrics = [];
    this.errorRates.clear();
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalErrors: number;
    totalActions: number;
    averageResponseTime: number;
    topErrors: { type: ActionErrorType; count: number }[];
    slowestActions: { name: string; avgDuration: number }[];
  } {
    const totalErrors = this.errorMetrics.length;
    const totalActions = this.performanceMetrics.length;
    
    const avgResponseTime = totalActions > 0
      ? this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / totalActions
      : 0;

    // Top error types
    const errorTypeCounts = new Map<ActionErrorType, number>();
    this.errorMetrics.forEach(m => {
      errorTypeCounts.set(m.errorType, (errorTypeCounts.get(m.errorType) || 0) + 1);
    });
    
    const topErrors = Array.from(errorTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Slowest actions
    const actionDurations = new Map<string, number[]>();
    this.performanceMetrics.forEach(m => {
      if (!actionDurations.has(m.actionName)) {
        actionDurations.set(m.actionName, []);
      }
      actionDurations.get(m.actionName)!.push(m.duration);
    });

    const slowestActions = Array.from(actionDurations.entries())
      .map(([name, durations]) => ({
        name,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    return {
      totalErrors,
      totalActions,
      averageResponseTime: Math.round(avgResponseTime),
      topErrors,
      slowestActions,
    };
  }
}

// Global metrics store instance
const metricsStore = new MetricsStore();

/**
 * Record an error for monitoring
 */
export function recordError(
  error: ActionError,
  actionName: string,
  context?: {
    userId?: string;
    companyId?: string;
  }
): void {
  const metric: ErrorMetrics = {
    errorType: error.type,
    errorCode: error.code,
    actionName,
    userId: context?.userId,
    companyId: context?.companyId,
    timestamp: Date.now(),
    count: 1,
    details: error.details,
  };

  metricsStore.recordError(metric);

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendErrorToMonitoring(metric);
  }
}

/**
 * Record performance metrics for an action
 */
export function recordPerformance(
  actionName: string,
  duration: number,
  success: boolean,
  context?: {
    userId?: string;
    companyId?: string;
    errorType?: ActionErrorType;
    memoryUsage?: number;
    cacheHit?: boolean;
  }
): void {
  const metric: ActionPerformanceMetrics = {
    actionName,
    duration,
    success,
    errorType: context?.errorType,
    userId: context?.userId,
    companyId: context?.companyId,
    timestamp: Date.now(),
    memoryUsage: context?.memoryUsage,
    cacheHit: context?.cacheHit,
  };

  metricsStore.recordPerformance(metric);

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendPerformanceToMonitoring(metric);
  }
}

/**
 * Record Convex-specific performance metrics
 */
export function recordConvexPerformance(
  queryName: string,
  executionTime: number,
  success: boolean,
  args: Record<string, unknown>,
  context: string,
  options?: {
    retryCount?: number;
    cacheHit?: boolean;
  }
): void {
  const metric: ConvexPerformanceMetrics = {
    queryName,
    executionTime,
    success,
    retryCount: options?.retryCount,
    cacheHit: options?.cacheHit,
    args,
    context,
    timestamp: Date.now(),
  };

  metricsStore.recordConvexMetric(metric);

  // In production, send to Convex monitoring
  if (process.env.NODE_ENV === 'production') {
    // Example: sendConvexMetricsToMonitoring(metric);
  }
}

/**
 * Performance monitoring decorator for actions
 */
export function withPerformanceMonitoring<T extends readonly unknown[], R>(
  actionName: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage?.()?.heapUsed;
    
    try {
      const result = await fn(...args);
      
      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage?.()?.heapUsed;
      const memoryUsage = endMemory && startMemory ? endMemory - startMemory : undefined;
      
      recordPerformance(actionName, duration, true, { memoryUsage });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage?.()?.heapUsed;
      const memoryUsage = endMemory && startMemory ? endMemory - startMemory : undefined;
      
      const errorType = error instanceof ActionErrorClass ? error.type : 'server';
      recordPerformance(actionName, duration, false, { 
        errorType: errorType as ActionErrorType,
        memoryUsage 
      });
      
      throw error;
    }
  };
}

/**
 * Get metrics for development debugging
 */
export function getMetrics() {
  return {
    errors: metricsStore.getErrorMetrics(),
    performance: metricsStore.getPerformanceMetrics(),
    convex: metricsStore.getConvexMetrics(),
    errorRates: metricsStore.getErrorRates(),
    highErrorRates: metricsStore.getHighErrorRateActions(),
    summary: metricsStore.getSummary(),
  };
}

/**
 * Clear metrics (for testing)
 */
export function clearMetrics(): void {
  metricsStore.clear();
}

/**
 * Check if any actions have high error rates
 */
export function hasHighErrorRates(): boolean {
  return metricsStore.getHighErrorRateActions().length > 0;
}

/**
 * Get actions with performance issues
 */
export function getSlowActions(thresholdMs = 5000): ActionPerformanceMetrics[] {
  return metricsStore.getPerformanceMetrics()
    .filter(m => m.duration > thresholdMs)
    .sort((a, b) => b.duration - a.duration);
}

/**
 * Get Convex queries with performance issues
 */
export function getSlowConvexQueries(thresholdMs = 3000): ConvexPerformanceMetrics[] {
  return metricsStore.getConvexMetrics()
    .filter(m => m.executionTime > thresholdMs)
    .sort((a, b) => b.executionTime - a.executionTime);
}
