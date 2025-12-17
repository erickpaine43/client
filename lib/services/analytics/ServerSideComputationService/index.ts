// ============================================================================
// SERVER-SIDE COMPUTATION SERVICE - Main Interface
// ============================================================================

import {
  HeavyComputationConfig,
  ComputationResult,
  CacheWarmingResult,
  ComputationStatistics,
  ComprehensiveAnalyticsData,
  DEFAULT_COMPUTATION_CONFIG
} from "./types";
import { AnalyticsFilters, AnalyticsComputeOptions } from "@/types/analytics/core";
import { AnalyticsDomain } from "@/types/analytics/ui";
import {
  BaseAnalyticsService
} from "../BaseAnalyticsService";

// Re-export public interfaces for backward compatibility
export type {
  HeavyComputationConfig,
  ComputationResult,
  CacheWarmingResult,
  ComputationStatistics,
  ComprehensiveAnalyticsData
};
export { DEFAULT_COMPUTATION_CONFIG };

// Import functions from extracted modules
import {
  executeHeavyComputation,
  executeParallelComputations,
  computeComprehensiveAnalytics
} from "./calculations";
import { createDefaultFilters } from "./validation";
import {
  initializeCacheWarmingStrategy,
  warmCache,
  startCacheWarmingScheduler,
  stopCacheWarmingScheduler
} from "./cache";

/**
 * Server-side computation service for heavy analytics operations.
 * Optimizes performance through intelligent caching, parallel processing, and cache warming.
 *
 * This is a refactored modular version that maintains 100% API compatibility
 * with the original ServerSideComputationService.
 */
export class ServerSideComputationService extends BaseAnalyticsService {
  private static instance: ServerSideComputationService | null = null;
  private config: HeavyComputationConfig;
  private activeComputations: Map<string, Promise<unknown>> = new Map();
  private computationQueue: Array<{ id: string; priority: number; executor: () => Promise<unknown> }> = [];
  private cacheWarmingStrategy: ReturnType<typeof initializeCacheWarmingStrategy>;
  private cacheWarmingInterval: NodeJS.Timeout | null = null;

  private constructor(config: HeavyComputationConfig = DEFAULT_COMPUTATION_CONFIG) {
    super("computation");
    this.config = config;
    this.cacheWarmingStrategy = initializeCacheWarmingStrategy(this.config);
    this.startCacheWarmingScheduler();
  }

  /**
   * Get singleton instance.
   */
  static getInstance(config?: HeavyComputationConfig): ServerSideComputationService {
    if (!this.instance) {
      this.instance = new ServerSideComputationService(config);
    }
    return this.instance;
  }

  /**
   * Execute heavy computation with optimization strategies.
   */
  async executeHeavyComputation<T>(
    operation: string,
    domain: AnalyticsDomain,
    entityIds: string[] = [],
    filters: AnalyticsFilters,
    computeOptions: AnalyticsComputeOptions,
    executor: () => Promise<T>
  ): Promise<ComputationResult<T>> {
    return executeHeavyComputation(
      operation,
      domain,
      entityIds,
      filters,
      computeOptions,
      executor,
      {
        computationTimeout: this.config.computationTimeout,
        enableResultCaching: this.config.enableResultCaching
      },
      this.activeComputations
    );
  }

  /**
   * Execute parallel computations across multiple domains.
   */
  async executeParallelComputations<T>(
    computations: Array<{
      operation: string;
      domain: AnalyticsDomain;
      entityIds?: string[];
      filters: AnalyticsFilters;
      executor: () => Promise<T>;
      priority?: number;
    }>
  ): Promise<Record<string, ComputationResult<T> | null>> {
    return executeParallelComputations(
      computations,
      {
        enableParallelProcessing: this.config.enableParallelProcessing,
        maxConcurrentOperations: this.config.maxConcurrentOperations
      },
      this.activeComputations
    );
  }

  /**
   * Compute comprehensive analytics with all optimizations.
   */
  async computeComprehensiveAnalytics(
    domain: AnalyticsDomain,
    entityIds: string[],
    filters: AnalyticsFilters,
    options: AnalyticsComputeOptions = {}
  ): Promise<ComputationResult<ComprehensiveAnalyticsData>> {
    return computeComprehensiveAnalytics(
      domain,
      entityIds,
      filters,
      options,
      {
        computationTimeout: this.config.computationTimeout,
        enableResultCaching: this.config.enableResultCaching
      },
      this.activeComputations
    );
  }

  /**
   * Warm cache for common analytics queries.
   */
  async warmCache(
    domains: AnalyticsDomain[] = this.cacheWarmingStrategy.domains,
    operations: string[] = this.cacheWarmingStrategy.operations
  ): Promise<CacheWarmingResult> {
    return warmCache(
      domains,
      operations,
      this.cacheWarmingStrategy,
      this.config,
      this.activeComputations,
      async (operation: string, domain: AnalyticsDomain, entityIds: string[], filters: AnalyticsFilters) => {
        // Execute a lightweight computation for cache warming
        return this.executeHeavyComputation(
          operation,
          domain,
          entityIds,
          filters,
          { includePerformanceMetrics: false },
          async () => ({ warmed: true, timestamp: Date.now() })
        );
      }
    );
  }

  /**
   * Get computation statistics.
   */
  getComputationStatistics(): ComputationStatistics {
    return {
      activeComputations: this.activeComputations.size,
      queuedComputations: this.computationQueue.length,
      config: { ...this.config },
      cacheWarmingStrategy: { ...this.cacheWarmingStrategy },
      performance: {
        averageComputationTime: 0, // TODO: Implement from monitoring data
        cacheHitRate: 0, // TODO: Implement from cache statistics
        totalComputations: 0, // TODO: Implement from monitoring data
      },
    };
  }

  /**
   * Health check implementation.
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if there are too many active computations
      if (this.activeComputations.size > this.config.maxConcurrentOperations * 2) {
        return false;
      }

      // Test a simple computation
      const testResult = await this.executeHeavyComputation(
        "health-check",
        "campaigns",
        [],
        createDefaultFilters(),
        {},
        async () => ({ test: true })
      );

      return testResult.data.test === true;
    } catch {
      return false;
    }
  }

  /**
   * Create default filters.
   */
  protected createDefaultFilters(): AnalyticsFilters {
    return createDefaultFilters();
  }

  /**
   * Create extended filters for longer time ranges.
   */
  private createExtendedFilters(days: number): AnalyticsFilters {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    return {
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
    };
  }

  /**
   * Start cache warming scheduler.
   */
  private startCacheWarmingScheduler(): void {
    if (this.cacheWarmingInterval) {
      stopCacheWarmingScheduler(this.cacheWarmingInterval);
    }

    this.cacheWarmingInterval = startCacheWarmingScheduler(
      this.cacheWarmingStrategy,
      () => this.warmCache()
    );
  }

  /**
   * Stop cache warming scheduler.
   */
  private stopCacheWarmingScheduler(): void {
    if (this.cacheWarmingInterval) {
      stopCacheWarmingScheduler(this.cacheWarmingInterval);
      this.cacheWarmingInterval = null;
    }
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    this.stopCacheWarmingScheduler();
    this.activeComputations.clear();
    this.computationQueue.length = 0;
  }
}

// Export singleton instance
export const serverSideComputationService = ServerSideComputationService.getInstance();
