/**
 * Performance Measurement Utilities
 * 
 * Utility functions for measuring execution time of operations
 */

import { PerformanceMonitorService } from './performance-monitor-service';

/**
 * Global performance monitor service instance
 */
let globalMonitorService: PerformanceMonitorService | null = null;

/**
 * Get or create the global performance monitor service
 */
export function getGlobalPerformanceMonitor(): PerformanceMonitorService {
  if (!globalMonitorService) {
    globalMonitorService = new PerformanceMonitorService();
  }
  return globalMonitorService;
}

/**
 * Initialize global monitor with custom configuration
 */
export function initializeGlobalPerformanceMonitor(
  thresholds?: Partial<import('./runtime-performance-monitor').MonitorConfig['thresholds']>,
  maxMetrics?: number
): PerformanceMonitorService {
  globalMonitorService = new PerformanceMonitorService(thresholds || {}, maxMetrics || 1000);
  return globalMonitorService;
}

/**
 * Reset global monitor (useful for testing)
 */
export function resetGlobalPerformanceMonitor(): void {
  globalMonitorService = null;
}

/**
 * Utility function to measure execution time of async operations
 */
export async function measureAsync<T>(
  operation: () => Promise<T>,
  context: {
    operation: string;
    service?: string;
    queryName?: string;
  }
): Promise<T> {
  const monitor = getGlobalPerformanceMonitor();
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    monitor.recordMetric({
      operation: context.operation,
      executionTime: Date.now() - startTime,
      success: true,
      service: context.service,
      queryName: context.queryName,
    });
    
    return result;
  } catch (error) {
    monitor.recordMetric({
      operation: context.operation,
      executionTime: Date.now() - startTime,
      success: false,
      service: context.service,
      queryName: context.queryName,
      error: error instanceof Error ? error.message : String(error),
    });
    
    throw error;
  }
}

/**
 * Utility function to measure execution time of synchronous operations
 */
export function measureSync<T>(
  operation: () => T,
  context: {
    operation: string;
    service?: string;
    queryName?: string;
  }
): T {
  const monitor = getGlobalPerformanceMonitor();
  const startTime = Date.now();
  
  try {
    const result = operation();
    
    monitor.recordMetric({
      operation: context.operation,
      executionTime: Date.now() - startTime,
      success: true,
      service: context.service,
      queryName: context.queryName,
    });
    
    return result;
  } catch (error) {
    monitor.recordMetric({
      operation: context.operation,
      executionTime: Date.now() - startTime,
      success: false,
      service: context.service,
      queryName: context.queryName,
      error: error instanceof Error ? error.message : String(error),
    });
    
    throw error;
  }
}

/**
 * Utility function to measure compilation time
 */
export async function measureCompilation<T>(
  operation: () => Promise<T> | T,
  phase: 'tsc' | 'eslint' | 'build' | 'test',
  fileCount?: number
): Promise<T> {
  const monitor = getGlobalPerformanceMonitor();
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    monitor.recordCompilationMetric(
      phase,
      Date.now() - startTime,
      true,
      fileCount
    );
    
    return result;
  } catch (error) {
    monitor.recordCompilationMetric(
      phase,
      Date.now() - startTime,
      false,
      fileCount,
      error instanceof Error ? error.message : String(error)
    );
    
    throw error;
  }
}
