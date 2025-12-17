// ============================================================================
// SERVER-SIDE COMPUTATION SERVICE TYPES
// ============================================================================

import { PerformanceMetrics, CalculatedRates, TimeSeriesDataPoint, AnalyticsFilters } from "@/types/analytics/core";
import { AnalyticsDomain } from "@/types/analytics/ui";

/**
 * Heavy computation configuration.
 */
export interface HeavyComputationConfig {
  enableParallelProcessing: boolean;
  maxConcurrentOperations: number;
  computationTimeout: number; // milliseconds
  enableProgressiveLoading: boolean;
  chunkSize: number;
  enableResultCaching: boolean;
  cacheWarmingEnabled: boolean;
}

/**
 * Computation result with performance metrics.
 */
export interface ComputationResult<T> {
  data: T;
  performance: {
    totalDuration: number;
    computationTime: number;
    cacheTime: number;
    dataSize: number;
    recordCount: number;
    fromCache: boolean;
  };
  metadata: {
    operation: string;
    domain: AnalyticsDomain;
    filters: AnalyticsFilters;
    timestamp: number;
  };
}

/**
 * Cache warming strategy configuration.
 */
export interface CacheWarmingStrategy {
  enabled: boolean;
  domains: AnalyticsDomain[];
  operations: string[];
  schedules: Array<{
    pattern: string; // cron-like pattern
    priority: "high" | "medium" | "low";
    filters: AnalyticsFilters;
  }>;
  precomputeCommonQueries: boolean;
  warmOnDataUpdate: boolean;
}

/**
 * Default heavy computation configuration.
 */
export const DEFAULT_COMPUTATION_CONFIG: HeavyComputationConfig = {
  enableParallelProcessing: true,
  maxConcurrentOperations: 5,
  computationTimeout: 30000, // 30 seconds
  enableProgressiveLoading: true,
  chunkSize: 1000,
  enableResultCaching: true,
  cacheWarmingEnabled: true,
};

/**
 * Comprehensive analytics data structure.
 */
export interface ComprehensiveAnalyticsData {
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceBenchmarks?: ReturnType<typeof import("@/lib/utils/performance-calculator").PerformanceCalculator.calculatePerformanceBenchmarks>;
  comparativeAnalysis?: ReturnType<typeof import("@/lib/utils/performance-calculator").PerformanceCalculator.calculateComparativePerformance>;
  kpiMetrics?: ReturnType<typeof import("@/lib/utils/analytics-calculator").AnalyticsCalculator.calculateAllRates>;
}

/**
 * Cache warming result.
 */
export interface CacheWarmingResult {
  totalWarmed: number;
  successful: number;
  failed: number;
  details: Array<{
    domain: AnalyticsDomain;
    operation: string;
    success: boolean;
    duration: number;
  }>;
}

/**
 * Computation statistics.
 */
export interface ComputationStatistics {
  activeComputations: number;
  queuedComputations: number;
  config: HeavyComputationConfig;
  cacheWarmingStrategy: CacheWarmingStrategy;
  performance: {
    averageComputationTime: number;
    cacheHitRate: number;
    totalComputations: number;
  };
}

/**
 * Parallel computation task.
 */
export interface ParallelComputationTask<T> {
  operation: string;
  domain: AnalyticsDomain;
  entityIds?: string[];
  filters: AnalyticsFilters;
  executor: () => Promise<T>;
  priority?: number;
}
