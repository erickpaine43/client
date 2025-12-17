// ============================================================================
// SERVER-SIDE COMPUTATION SERVICE CACHE MANAGEMENT
// ============================================================================

import { AnalyticsFilters } from "@/types/analytics/core";
import { AnalyticsDomain, AnalyticsDomain as UIDomain } from "@/types/analytics/ui";
import {
  CacheWarmingResult,
  HeavyComputationConfig,
  CacheWarmingStrategy
} from "./types";
import { sleep, chunkArray } from "./utils";
import { getCommonFilterCombinations } from "./validation";

/**
 * Initialize cache warming strategy configuration.
 */
export function initializeCacheWarmingStrategy(
  config: HeavyComputationConfig
): CacheWarmingStrategy {
  return {
    enabled: config.cacheWarmingEnabled,
    domains: ["campaigns", "domains", "mailboxes", "leads", "templates", "billing"],
    operations: ["performance", "timeseries", "overview", "health"],
    schedules: [
      {
        pattern: "0 */15 * * * *", // Every 15 minutes
        priority: "high",
        filters: getCommonFilterCombinations()[0], // Use first common filter
      },
      {
        pattern: "0 0 */6 * * *", // Every 6 hours
        priority: "medium",
        filters: getCommonFilterCombinations()[1] || getCommonFilterCombinations()[0], // Use second or fallback
      },
      {
        pattern: "0 0 0 * * 0", // Weekly on Sunday
        priority: "low",
        filters: getCommonFilterCombinations()[2] || getCommonFilterCombinations()[0], // Use third or fallback
      },
    ],
    precomputeCommonQueries: true,
    warmOnDataUpdate: true,
  };
}

/**
 * Warm cache for common analytics queries.
 */
export async function warmCache(
  domains: AnalyticsDomain[],
  operations: string[],
  strategy: CacheWarmingStrategy,
  config: HeavyComputationConfig,
  activeComputations: Map<string, Promise<unknown>>,
  computeExecutor: (
    operation: string,
    domain: AnalyticsDomain,
    entityIds: string[],
    filters: AnalyticsFilters
  ) => Promise<unknown>
): Promise<CacheWarmingResult> {
  if (!strategy.enabled) {
    return {
      totalWarmed: 0,
      successful: 0,
      failed: 0,
      details: []
    };
  }

  const results: CacheWarmingResult = {
    totalWarmed: 0,
    successful: 0,
    failed: 0,
    details: []
  };

  console.log(`Starting cache warming for ${domains.length} domains and ${operations.length} operations`);

  // Generate warming tasks
  const warmingTasks: Array<{
    domain: AnalyticsDomain;
    operation: string;
    filters: AnalyticsFilters;
    priority: number;
  }> = [];

  domains.forEach(domain => {
    operations.forEach(operation => {
      // Add common filter combinations
      const filterCombinations = getCommonFilterCombinations();
      filterCombinations.forEach((filters, index) => {
        warmingTasks.push({
          domain,
          operation,
          filters,
          priority: index, // Earlier combinations have higher priority
        });
      });
    });
  });

  // Sort by priority
  warmingTasks.sort((a, b) => a.priority - b.priority);

  // Execute warming tasks in chunks
  const chunks = chunkArray(warmingTasks, config.maxConcurrentOperations);

  for (const chunk of chunks) {
    const promises = chunk.map(async (task) => {
      const startTime = Date.now();
      try {
        // Execute the computation to warm the cache
        await computeExecutor(
          task.operation,
          task.domain,
          [], // No specific entity IDs for warming
          task.filters
        );

        const duration = Date.now() - startTime;
        results.successful++;
        results.details.push({
          domain: task.domain as UIDomain,
          operation: task.operation,
          success: true,
          duration,
        });

      } catch (error) {
        const duration = Date.now() - startTime;
        results.failed++;
        results.details.push({
          domain: task.domain as UIDomain,
          operation: task.operation,
          success: false,
          duration,
        });
        console.warn(`Cache warming failed for ${task.domain}:${task.operation}:`, error);
      }
    });

    await Promise.all(promises);
    results.totalWarmed += chunk.length;

    // Small delay between chunks to avoid overwhelming the system
    await sleep(100);
  }

  console.log(`Cache warming completed: ${results.successful}/${results.totalWarmed} successful`);
  return results;
}

/**
 * Start cache warming scheduler.
 */
export function startCacheWarmingScheduler(
  strategy: CacheWarmingStrategy,
  warmCacheFn: () => Promise<CacheWarmingResult>
): NodeJS.Timeout | null {
  if (!strategy.enabled) {
    return null;
  }

  // Simple interval-based scheduler (in production, use a proper cron scheduler)
  const interval = setInterval(async () => {
    try {
      await warmCacheFn();
    } catch (error) {
      console.error("Scheduled cache warming failed:", error);
    }
  }, 15 * 60 * 1000); // Every 15 minutes

  console.log("Cache warming scheduler started");
  return interval;
}

/**
 * Stop cache warming scheduler.
 */
export function stopCacheWarmingScheduler(interval: NodeJS.Timeout | null): void {
  if (interval) {
    clearInterval(interval);
    console.log("Cache warming scheduler stopped");
  }
}

/**
 * Get cache warming statistics.
 */
export function getCacheWarmingStatistics(
  strategy: CacheWarmingStrategy,
  config: HeavyComputationConfig
): {
  enabled: boolean;
  domainsCount: number;
  operationsCount: number;
  schedulesCount: number;
  maxConcurrentOperations: number;
} {
  return {
    enabled: strategy.enabled,
    domainsCount: strategy.domains.length,
    operationsCount: strategy.operations.length,
    schedulesCount: strategy.schedules.length,
    maxConcurrentOperations: config.maxConcurrentOperations,
  };
}
