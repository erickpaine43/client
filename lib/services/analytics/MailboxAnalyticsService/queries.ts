// ============================================================================
// MAILBOX ANALYTICS SERVICE QUERIES - Query handler functions
// ============================================================================

import { AnalyticsFilters, TimeSeriesDataPoint, AnalyticsComputeOptions, PerformanceMetrics } from "@/types/analytics/core";
import { CACHE_TTL } from "@/lib/utils/redis";
import { convex } from "@/lib/convex";
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { validateMailboxFilters, validateMailboxIds } from "./validation";
import {
  mapToMailboxPerformanceData,
  mapToWarmupAnalyticsData,
  mapToMailboxHealthMetrics,
  mapToSendingCapacityData,
  mapToTimeSeriesDataPoint,
  aggregateMailboxMetrics
} from "./calculations";
import {
  MailboxPerformanceData,
  WarmupAnalyticsData,
  MailboxHealthMetrics,
  SendingCapacityData,
  ConvexMailboxPerformanceResult,
  ConvexWarmupAnalyticsResult,
  ConvexTimeSeriesResult
} from "./types";

/**
 * Executes query with caching wrapper.
 * Provides consistent caching behavior for all mailbox queries.
 */
function executeWithCache<T>(
  _operation: string,
  _entityIds: string[],
  _filters: AnalyticsFilters,
  operationFn: () => Promise<T>,
  _ttl: number = CACHE_TTL.RECENT
): Promise<T> {
  // This would normally use the BaseAnalyticsService executeWithCache method
  // For now, we'll implement a simplified version
  return operationFn();
}

/**
 * Runtime-only loader for Convex generated api that avoids TypeScript expanding types.
 * This uses the Function('return import') trick so TS treats the import as any at compile time.
 */
async function loadConvexApi(): Promise<unknown> {
  const importer = (Function("return import"))() as unknown;
  return (importer as (path: string) => Promise<unknown>)("@/convex/_generated/api");
}

/**
 * Minimal wrapper for Convex client to avoid deep generic instantiation.
 * Uses `unknown` instead of `any` to satisfy ESLint and keep type safety at the edges.
 */
async function callConvexQuery<T>(fn: unknown, args: unknown): Promise<T> {
  const client = convex as unknown as {
    query: (fn: unknown, args: unknown) => Promise<unknown>;
  };

  let fnRef: unknown = fn;
  if (typeof fn === "string") {
    const [namespace, functionName] = fn.split(":");
    const mod = await loadConvexApi();
    const apiObj = (mod as { api: Record<string, unknown> }).api;
    fnRef = (apiObj?.[namespace] as Record<string, unknown>)?.[functionName];
  }

  return (await client.query(fnRef, args)) as Promise<T>;
}

/**
 * Safely obtain a Convex API function handle from the generated `api` object
 * without triggering deep type instantiation, by navigating through `unknown`.
 */
// Use string-based Convex function references to avoid importing generated types
const FN_MAILBOX_ANALYTICS = "mailboxAnalytics:getMailboxAnalytics";
const FN_WARMUP_ANALYTICS = "mailboxAnalytics:getWarmupAnalytics";
const FN_TIME_SERIES_ANALYTICS = "mailboxAnalytics:getMailboxTimeSeriesAnalytics";

/**
 * Gets performance metrics for specific mailboxes.
 * Retrieves comprehensive performance data for mailbox analytics.
 *
 * @param mailboxIds - IDs of mailboxes to query
 * @param filters - Filters to apply to the query
 * @returns Promise resolving to mailbox performance data
 */
export async function getMailboxPerformance(
  mailboxIds: string[],
  filters: AnalyticsFilters
): Promise<MailboxPerformanceData[]> {
  validateMailboxFilters(filters);
  validateMailboxIds(mailboxIds);

  return executeWithCache(
    "mailbox-performance",
    mailboxIds,
    filters,
    async () => {
      const startTime = Date.now();

      try {
        // Simplified query parameters to avoid deep type instantiation
        const queryParams = {
          mailboxIds,
          dateRange: filters.dateRange,
          companyId: filters.entityIds?.[0] || "default", // TODO: Get from context
        };
        
        // Avoid deep type inference by routing through the minimal wrapper
        const results = await callConvexQuery<ConvexMailboxPerformanceResult[]>(FN_MAILBOX_ANALYTICS, queryParams as unknown);

        const mappedResults = results.map(
          (item) => mapToMailboxPerformanceData(item)
        );

        console.log(`Retrieved performance data for ${mailboxIds.length} mailboxes in ${Date.now() - startTime}ms`);
        return mappedResults;
      } catch (error) {
        const normalized = error instanceof AnalyticsError ? error :
          new AnalyticsError(
            AnalyticsErrorType.SERVICE_UNAVAILABLE,
            `Failed to get mailbox performance: ${error instanceof Error ? error.message : 'Unknown error'}`,
            "mailboxes",
            true
          );
        throw normalized;
      }
    },
    CACHE_TTL.RECENT
  );
}

/**
 * Gets warmup analytics for specific mailboxes.
 * Retrieves warmup progress and statistics for mailbox monitoring.
 *
 * @param mailboxIds - IDs of mailboxes to query
 * @returns Promise resolving to warmup analytics data
 */
export async function getWarmupAnalytics(mailboxIds: string[]): Promise<WarmupAnalyticsData[]> {
  validateMailboxIds(mailboxIds);

  return executeWithCache(
    "mailbox-warmup",
    mailboxIds,
    {} as AnalyticsFilters, // Empty filters for warmup queries
    async () => {
      const startTime = Date.now();

      try {
        const dateRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        };

        // Avoid deep type inference by routing through the minimal wrapper
        const results = await callConvexQuery<ConvexWarmupAnalyticsResult[]>(FN_WARMUP_ANALYTICS, {
          mailboxIds,
          dateRange,
          companyId: "default", // TODO: Get from context
        } as unknown);

        const mappedResults = results.map(
          (item) => mapToWarmupAnalyticsData(item)
        );

        console.log(`Retrieved warmup data for ${mailboxIds.length} mailboxes in ${Date.now() - startTime}ms`);
        return mappedResults;
      } catch (error) {
        const normalized = error instanceof AnalyticsError ? error :
          new AnalyticsError(
            AnalyticsErrorType.SERVICE_UNAVAILABLE,
            `Failed to get warmup analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
            "mailboxes",
            true
          );
        throw normalized;
      }
    },
    CACHE_TTL.RECENT
  );
}

/**
 * Gets health scores for specific mailboxes.
 * Calculates and returns comprehensive health metrics for mailboxes.
 *
 * @param mailboxIds - IDs of mailboxes to query
 * @returns Promise resolving to mailbox health metrics
 */
export async function getHealthScores(mailboxIds: string[]): Promise<MailboxHealthMetrics[]> {
  validateMailboxIds(mailboxIds);

  return executeWithCache(
    "mailbox-health",
    mailboxIds,
    {} as AnalyticsFilters, // Empty filters for health queries
    async () => {
      const startTime = Date.now();

      try {
        // Avoid deep type inference by routing through the minimal wrapper
        const results = await callConvexQuery<ConvexMailboxPerformanceResult[]>(FN_MAILBOX_ANALYTICS, {
          mailboxIds,
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          },
          companyId: "default", // TODO: Get from context
        } as unknown);

        const mappedResults = results.map(
          (item) => mapToMailboxHealthMetrics(item)
        );

        console.log(`Calculated health scores for ${mailboxIds.length} mailboxes in ${Date.now() - startTime}ms`);
        return mappedResults;
      } catch (error) {
        const normalized = error instanceof AnalyticsError ? error :
          new AnalyticsError(
            AnalyticsErrorType.SERVICE_UNAVAILABLE,
            `Failed to get mailbox health scores: ${error instanceof Error ? error.message : 'Unknown error'}`,
            "mailboxes",
            true
          );
        throw normalized;
      }
    },
    CACHE_TTL.RECENT
  );
}

/**
 * Gets sending capacity data for mailboxes.
 * Calculates utilization rates and capacity metrics for sending optimization.
 *
 * @param mailboxIds - IDs of mailboxes to query
 * @returns Promise resolving to sending capacity data
 */
export async function getSendingCapacity(mailboxIds: string[]): Promise<SendingCapacityData[]> {
  validateMailboxIds(mailboxIds);

  return executeWithCache(
    "mailbox-capacity",
    mailboxIds,
    {} as AnalyticsFilters, // Empty filters for capacity queries
    async () => {
      const startTime = Date.now();

      try {
        // Get current mailbox performance data
        const performanceData = await getMailboxPerformance(
          mailboxIds,
          {
            dateRange: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0],
            },
            entityIds: [],
          }
        );

        const mappedResults = performanceData.map(
          (mailbox) => mapToSendingCapacityData(mailbox)
        );

        console.log(`Calculated sending capacity for ${mailboxIds.length} mailboxes in ${Date.now() - startTime}ms`);
        return mappedResults;
      } catch (error) {
        const normalized = error instanceof AnalyticsError ? error :
          new AnalyticsError(
            AnalyticsErrorType.SERVICE_UNAVAILABLE,
            `Failed to get sending capacity: ${error instanceof Error ? error.message : 'Unknown error'}`,
            "mailboxes",
            true
          );
        throw normalized;
      }
    },
    CACHE_TTL.RECENT
  );
}

/**
 * Gets time series data for mailbox analytics.
 * Retrieves historical performance data for trend analysis.
 *
 * @param mailboxIds - IDs of mailboxes to query
 * @param filters - Filters including date range
 * @param granularity - Time granularity for aggregation
 * @returns Promise resolving to time series data points
 */
export async function getTimeSeriesData(
  mailboxIds: string[],
  filters: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day"
): Promise<TimeSeriesDataPoint[]> {
  validateMailboxFilters(filters);
  validateMailboxIds(mailboxIds);

  return executeWithCache(
    "mailbox-timeseries",
    mailboxIds,
    filters,
    async () => {
      const startTime = Date.now();

      try {
        // Convex time series requires dateRange; guard already ensured by validateFilters
        // Avoid deep type inference by routing through the minimal wrapper
        const results = await callConvexQuery<ConvexTimeSeriesResult[]>(FN_TIME_SERIES_ANALYTICS, {
          mailboxIds,
          dateRange: filters.dateRange!,
          companyId: filters.entityIds?.[0] || "default",
          granularity,
        } as unknown);

        const mappedResults = results.map(
          (item) => mapToTimeSeriesDataPoint(item)
        );

        console.log(`Retrieved time series data for ${mailboxIds.length} mailboxes in ${Date.now() - startTime}ms`);
        return mappedResults;
      } catch (error) {
        const normalized = error instanceof AnalyticsError ? error :
          new AnalyticsError(
            AnalyticsErrorType.SERVICE_UNAVAILABLE,
            `Failed to get mailbox time series: ${error instanceof Error ? error.message : 'Unknown error'}`,
            "mailboxes",
            true
          );
        throw normalized;
      }
    },
    CACHE_TTL.RECENT
  );
}

/**
 * Computes analytics for filtered mailbox data.
 * Performs advanced analytics computations on filtered datasets.
 *
 * @param filters - Filters to apply to the computation
 * @param options - Additional computation options
 * @returns Promise resolving to computed analytics
 */
export async function computeAnalyticsForFilteredData(
  filters: AnalyticsFilters,
  options: AnalyticsComputeOptions = {}
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: ReturnType<typeof import("@/lib/utils/analytics-calculator").AnalyticsCalculator.calculateAllRates>;
  timeSeriesData?: TimeSeriesDataPoint[];
  healthMetrics?: MailboxHealthMetrics[];
}> {
  validateMailboxFilters(filters);

  return executeWithCache(
    "mailbox-filtered-compute",
    filters.entityIds || [],
    filters,
    async () => {
      const startTime = Date.now();

      try {
        // Get filtered mailbox performance data
        const mailboxData = await getMailboxPerformance(
          filters.entityIds || [],
          filters
        );

        // Aggregate metrics across all mailboxes
        const aggregatedMetrics = aggregateMailboxMetrics(mailboxData);

        // Calculate rates (simplified - would use AnalyticsCalculator in practice)
        const rates = {
          openRate: aggregatedMetrics.delivered > 0 ? (aggregatedMetrics.opened_tracked / aggregatedMetrics.delivered) * 100 : 0,
          clickRate: aggregatedMetrics.delivered > 0 ? (aggregatedMetrics.clicked_tracked / aggregatedMetrics.delivered) * 100 : 0,
          replyRate: aggregatedMetrics.delivered > 0 ? (aggregatedMetrics.replied / aggregatedMetrics.delivered) * 100 : 0,
          deliveryRate: aggregatedMetrics.sent > 0 ? (aggregatedMetrics.delivered / aggregatedMetrics.sent) * 100 : 0,
          bounceRate: aggregatedMetrics.sent > 0 ? (aggregatedMetrics.bounced / aggregatedMetrics.sent) * 100 : 0,
          unsubscribeRate: aggregatedMetrics.delivered > 0 ? (aggregatedMetrics.unsubscribed / aggregatedMetrics.delivered) * 100 : 0,
          spamRate: aggregatedMetrics.delivered > 0 ? (aggregatedMetrics.spamComplaints / aggregatedMetrics.delivered) * 100 : 0,
        };

        interface AnalyticsResult {
          aggregatedMetrics: PerformanceMetrics;
          rates: ReturnType<typeof import("@/lib/utils/analytics-calculator").AnalyticsCalculator.calculateAllRates>;
          timeSeriesData?: TimeSeriesDataPoint[];
          healthMetrics?: MailboxHealthMetrics[];
        }

        const result: AnalyticsResult = {
          aggregatedMetrics,
          rates,
        };

        // Add time series data if requested
        if (options.includeTimeSeriesData) {
          result.timeSeriesData = await getTimeSeriesData(
            filters.entityIds || [],
            filters,
            options.granularity || "day"
          );
        }

        // Add health metrics if requested
        if (options.includePerformanceMetrics) {
          result.healthMetrics = await getHealthScores(filters.entityIds || []);
        }

        console.log(`Computed analytics for ${filters.entityIds?.length || 0} mailboxes in ${Date.now() - startTime}ms`);
        return result;
      } catch (error) {
        const normalized = error instanceof AnalyticsError ? error :
          new AnalyticsError(
            AnalyticsErrorType.SERVICE_UNAVAILABLE,
            `Failed to compute analytics on filtered data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            "mailboxes",
            true
          );
        throw normalized;
      }
    },
    CACHE_TTL.RECENT
  );
}
