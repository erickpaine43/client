// ============================================================================
// SERVER-SIDE COMPUTATION SERVICE DATA PROCESSING
// ============================================================================

import {
  ComputationResult,
  HeavyComputationConfig,
  DEFAULT_COMPUTATION_CONFIG
} from "./types";
import { AnalyticsDomain } from "@/types/analytics/ui";
import { AnalyticsFilters } from "@/types/analytics/core";
import { PerformanceMonitor, PerformanceUtils } from "../monitoring/PerformanceMonitor";

/**
 * Wrap computation result with performance metrics.
 */
export function wrapResult<T>(
  data: T,
  monitor: PerformanceMonitor,
  operation: string,
  domain: AnalyticsDomain,
  filters: AnalyticsFilters,
  fromCache: boolean
): ComputationResult<T> {
  const measurement = monitor.complete();
  const dataSize = PerformanceUtils.calculateDataSize(data);

  monitor.setDataSize(dataSize);
  monitor.setCacheHit(fromCache);

  return {
    data,
    performance: {
      totalDuration: measurement.totalDuration,
      computationTime: measurement.phases.computationTime || 0,
      cacheTime: measurement.phases.cacheTime || 0,
      dataSize,
      recordCount: Array.isArray(data) ? data.length : 1,
      fromCache,
    },
    metadata: {
      operation,
      domain,
      filters,
      timestamp: Date.now(),
    },
  };
}

/**
 * Chunk array into smaller arrays for parallel processing.
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Process parallel computation results.
 */
export function processParallelResults<T>(
  results: Record<string, ComputationResult<T> | null>
): {
  successful: Array<{ key: string; result: ComputationResult<T> }>;
  failed: string[];
  totalDuration: number;
  averageDuration: number;
} {
  const successful: Array<{ key: string; result: ComputationResult<T> }> = [];
  const failed: string[] = [];
  let totalDuration = 0;
  let count = 0;

  Object.entries(results).forEach(([key, result]) => {
    if (result) {
      successful.push({ key, result });
      totalDuration += result.performance.totalDuration;
      count++;
    } else {
      failed.push(key);
    }
  });

  return {
    successful,
    failed,
    totalDuration,
    averageDuration: count > 0 ? totalDuration / count : 0,
  };
}

/**
 * Aggregate performance metrics from multiple computation results.
 */
export function aggregatePerformanceMetrics<T>(
  results: ComputationResult<T>[]
): {
  totalDuration: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  totalDataSize: number;
  cacheHitRate: number;
  totalRecords: number;
} {
  if (results.length === 0) {
    return {
      totalDuration: 0,
      averageDuration: 0,
      maxDuration: 0,
      minDuration: 0,
      totalDataSize: 0,
      cacheHitRate: 0,
      totalRecords: 0,
    };
  }

  const durations = results.map(r => r.performance.totalDuration);
  const dataSizes = results.map(r => r.performance.dataSize);
  const cacheHits = results.filter(r => r.performance.fromCache).length;
  const totalRecords = results.reduce((sum, r) => sum + r.performance.recordCount, 0);

  return {
    totalDuration: durations.reduce((sum, d) => sum + d, 0),
    averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
    totalDataSize: dataSizes.reduce((sum, size) => sum + size, 0),
    cacheHitRate: cacheHits / results.length,
    totalRecords,
  };
}

/**
 * Transform raw data into structured analytics format.
 */
export function transformAnalyticsData<T>(
  rawData: unknown[],
  transformers: Array<(data: unknown[]) => T>
): T[] {
  return transformers.map(transformer => transformer(rawData));
}

/**
 * Validate and sanitize computation configuration.
 */
export function sanitizeComputationConfig(
  config: Partial<HeavyComputationConfig>
): HeavyComputationConfig {
  return {
    enableParallelProcessing: config.enableParallelProcessing ?? DEFAULT_COMPUTATION_CONFIG.enableParallelProcessing,
    maxConcurrentOperations: Math.max(1, Math.min(config.maxConcurrentOperations ?? DEFAULT_COMPUTATION_CONFIG.maxConcurrentOperations, 10)),
    computationTimeout: Math.max(1000, config.computationTimeout ?? DEFAULT_COMPUTATION_CONFIG.computationTimeout),
    enableProgressiveLoading: config.enableProgressiveLoading ?? DEFAULT_COMPUTATION_CONFIG.enableProgressiveLoading,
    chunkSize: Math.max(100, config.chunkSize ?? DEFAULT_COMPUTATION_CONFIG.chunkSize),
    enableResultCaching: config.enableResultCaching ?? DEFAULT_COMPUTATION_CONFIG.enableResultCaching,
    cacheWarmingEnabled: config.cacheWarmingEnabled ?? DEFAULT_COMPUTATION_CONFIG.cacheWarmingEnabled,
  };
}
