// ============================================================================
// SERVER-SIDE COMPUTATION SERVICE CALCULATIONS
// ============================================================================

import {
  ComputationResult,
  ComprehensiveAnalyticsData,
  ParallelComputationTask
} from "./types";
import { AnalyticsFilters, AnalyticsComputeOptions } from "@/types/analytics/core";
import { AnalyticsDomain } from "@/types/analytics/ui";
import {
  AnalyticsCalculator
} from "@/lib/utils/analytics-calculator";
import { PerformanceCalculator } from "@/lib/utils/performance-calculator";
import {
  wrapResult,
  chunkArray
} from "./dataProcessing";
import {
  executeWithTimeout,
  generateComputationId,
  generateMockPerformanceData,
  generateMockTimeSeriesData,
  getDomainTTL,
  sleep
} from "./utils";
import {
  validateParallelComputationTasks
} from "./validation";
import { PerformanceMonitor } from "../monitoring/PerformanceMonitor";
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { analyticsCache } from "@/lib/utils/redis";

/**
 * Execute heavy computation with optimization strategies.
 */
export async function executeHeavyComputation<T>(
  operation: string,
  domain: AnalyticsDomain,
  entityIds: string[] = [],
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions,
  executor: () => Promise<T>,
  config: {
    computationTimeout: number;
    enableResultCaching: boolean;
  },
  activeComputations: Map<string, Promise<unknown>>
): Promise<ComputationResult<T>> {
  const monitor = PerformanceMonitor.create(`heavy-${operation}`, domain);
  const computationId = generateComputationId(operation, domain, entityIds, filters);

  try {
    // Check for duplicate computation
    if (activeComputations.has(computationId)) {
      console.log(`Reusing active computation: ${computationId}`);
      const result = await activeComputations.get(computationId)! as T;
      return wrapResult(result, monitor, operation, domain, filters, true);
    }

    // Execute with caching and performance monitoring
    const computationPromise = executeWithCache(
      operation,
      entityIds,
      filters,
      async () => {
        monitor.startPhase("computationTime");

        // Execute heavy computation with timeout
        const result = await executeWithTimeout(executor, config.computationTimeout);

        monitor.endPhase("computationTime");
        return result;
      },
      getDomainTTL(domain, operation),
      config.enableResultCaching
    );

    // Track active computation
    activeComputations.set(computationId, computationPromise);

    const result = await computationPromise;

    // Clean up active computation
    activeComputations.delete(computationId);

    return wrapResult(result, monitor, operation, domain, filters, false);

  } catch (error) {
    activeComputations.delete(computationId);
    monitor.completeWithError(error as Error);
    throw error;
  }
}

/**
 * Execute computation with caching.
 */
async function executeWithCache<T>(
  operation: string,
  entityIds: string[],
  filters: AnalyticsFilters,
  executor: () => Promise<T>,
  ttl: number,
  enableCaching: boolean
): Promise<T> {
  if (!enableCaching) {
    return executor();
  }

  const cacheKey = `${operation}:${entityIds.join(',')}:${JSON.stringify(filters)}`;

  try {
    // Try to get from cache first
    const cached = await analyticsCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }
  } catch (error) {
    console.warn(`Cache read failed for ${cacheKey}:`, error);
  }

  // Execute computation
  const result = await executor();

  try {
    // Cache the result
    await analyticsCache.set(cacheKey, JSON.stringify(result), ttl);
  } catch (error) {
    console.warn(`Cache write failed for ${cacheKey}:`, error);
  }

  return result;
}

/**
 * Execute parallel computations across multiple domains.
 */
export async function executeParallelComputations<T>(
  computations: ParallelComputationTask<T>[],
  config: {
    enableParallelProcessing: boolean;
    maxConcurrentOperations: number;
  },
  activeComputations: Map<string, Promise<unknown>>
): Promise<Record<string, ComputationResult<T> | null>> {
  // Validate tasks
  const validation = validateParallelComputationTasks(computations);
  if (!validation.isValid) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      `Invalid computation tasks: ${validation.errors.join(', ')}`,
      "parallel-computation"
    );
  }

  if (!config.enableParallelProcessing) {
    // Execute sequentially if parallel processing is disabled
    const results: Record<string, ComputationResult<T> | null> = {};

    for (const computation of computations) {
      const key = `${computation.domain}:${computation.operation}`;
      try {
        const result = await executeHeavyComputation(
          computation.operation,
          computation.domain,
          computation.entityIds || [],
          computation.filters,
          {},
          computation.executor,
          { computationTimeout: 30000, enableResultCaching: true },
          activeComputations
        );
        results[key] = result;
      } catch (error) {
        console.error(`Sequential computation failed for ${key}:`, error);
        results[key] = null;
      }
    }

    return results;
  }

  // Execute in parallel with concurrency limit
  const results: Record<string, ComputationResult<T> | null> = {};
  const chunks = chunkArray(computations, config.maxConcurrentOperations);

  for (const chunk of chunks) {
    const promises = chunk.map(async (computation) => {
      const key = `${computation.domain}:${computation.operation}`;
      try {
        const result = await executeHeavyComputation(
          computation.operation,
          computation.domain,
          computation.entityIds || [],
          computation.filters,
          {},
          computation.executor,
          { computationTimeout: 30000, enableResultCaching: true },
          activeComputations
        );
        return { key, result };
      } catch (error) {
        console.error(`Parallel computation failed for ${key}:`, error);
        return { key, result: null };
      }
    });

    const chunkResults = await Promise.all(promises);
    chunkResults.forEach(({ key, result }) => {
      results[key] = result;
    });
  }

  return results;
}

/**
 * Compute comprehensive analytics with all optimizations.
 */
export async function computeComprehensiveAnalytics(
  domain: AnalyticsDomain,
  entityIds: string[],
  filters: AnalyticsFilters,
  options: AnalyticsComputeOptions = {},
  config: {
    computationTimeout: number;
    enableResultCaching: boolean;
  },
  activeComputations: Map<string, Promise<unknown>>
): Promise<ComputationResult<ComprehensiveAnalyticsData>> {
  return executeHeavyComputation(
    "comprehensive-analytics",
    domain,
    entityIds,
    filters,
    options,
    async () => {
      // This would typically query from Convex or other data source
      // For now, we'll simulate heavy computation with mock data
      const mockData = generateMockPerformanceData(entityIds.length || 10);

      // Simulate heavy computation delay
      await sleep(100);

      // Aggregate metrics
      const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(mockData);

      // Calculate rates
      const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

      const result: ComprehensiveAnalyticsData = {
        aggregatedMetrics,
        rates,
      };

      // Add time series data if requested
      if (options.includeTimeSeriesData) {
        result.timeSeriesData = generateMockTimeSeriesData(filters);
      }

      // Add performance benchmarks if requested
      if (options.includePerformanceMetrics) {
        result.performanceBenchmarks = PerformanceCalculator.calculatePerformanceBenchmarks(aggregatedMetrics);
      }

      // Add comparative analysis if requested
      if (options.includeComparativeData && mockData.length >= 2) {
        const midpoint = Math.floor(mockData.length / 2);
        const firstHalf = AnalyticsCalculator.aggregateMetrics(mockData.slice(0, midpoint));
        const secondHalf = AnalyticsCalculator.aggregateMetrics(mockData.slice(midpoint));
        result.comparativeAnalysis = PerformanceCalculator.calculateComparativePerformance(secondHalf, firstHalf);
      }

      // Add KPI metrics
      result.kpiMetrics = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

      return result;
    },
    config,
    activeComputations
  );
}
