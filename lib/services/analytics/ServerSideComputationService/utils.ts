// ============================================================================
// SERVER-SIDE COMPUTATION SERVICE UTILITIES
// ============================================================================

import { AnalyticsFilters, TimeSeriesDataPoint } from "@/types/analytics/core";
import { AnalyticsDomain } from "@/types/analytics/ui";
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { CACHE_TTL, DOMAIN_CACHE_CONFIG } from "@/lib/utils/redis";

/**
 * Generate unique computation ID for caching and deduplication.
 */
export function generateComputationId(
  operation: string,
  domain: AnalyticsDomain,
  entityIds: string[],
  filters: AnalyticsFilters
): string {
  const entityPart = entityIds.length > 0 ? entityIds.sort().join(",") : "all";
  const filterHash = createFilterHash(filters);
  return `${domain}:${operation}:${entityPart}:${filterHash}`;
}

/**
 * Create filter hash for consistent computation IDs.
 */
export function createFilterHash(filters: AnalyticsFilters): string {
  const filterString = JSON.stringify({
    dateRange: filters.dateRange,
    entityIds: filters.entityIds?.sort(),
    additionalFilters: filters.additionalFilters,
  });

  let hash = 0;
  for (let i = 0; i < filterString.length; i++) {
    const char = filterString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

/**
 * Get domain-specific TTL for caching.
 */
export function getDomainTTL(domain: AnalyticsDomain, operation: string): number {
  const domainConfig = DOMAIN_CACHE_CONFIG[domain as keyof typeof DOMAIN_CACHE_CONFIG];

  if (domainConfig && operation in domainConfig) {
    return domainConfig[operation as keyof typeof domainConfig];
  }

  // Heavy computations get longer TTL
  if (operation.includes("heavy") || operation.includes("complex")) {
    return CACHE_TTL.DAILY;
  }

  return CACHE_TTL.HOURLY;
}

/**
 * Execute computation with timeout.
 */
export async function executeWithTimeout<T>(
  executor: () => Promise<T>,
  timeout: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Computation after ${timeout}ms`,
        "computation",
        true
      ));
    }, timeout);

    executor()
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Sleep utility function.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate mock performance data for testing.
 */
export function generateMockPerformanceData(count: number) {
  const data = [];

  for (let i = 0; i < count; i++) {
    const sent = Math.floor(Math.random() * 1000) + 100;
    const delivered = Math.floor(sent * (0.9 + Math.random() * 0.1));
    const opened_tracked = Math.floor(delivered * (0.2 + Math.random() * 0.3));
    const clicked_tracked = Math.floor(opened_tracked * (0.1 + Math.random() * 0.2));
    const replied = Math.floor(clicked_tracked * (0.05 + Math.random() * 0.15));

    data.push({
      sent,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied,
      bounced: sent - delivered,
      unsubscribed: Math.floor(delivered * Math.random() * 0.01),
      spamComplaints: Math.floor(delivered * Math.random() * 0.001),
    });
  }

  return data;
}

/**
 * Generate mock time series data for testing.
 */
export function generateMockTimeSeriesData(filters: AnalyticsFilters): TimeSeriesDataPoint[] {
  const start = new Date(filters.dateRange?.start || '');
  const end = new Date(filters.dateRange?.end || '');
  const data: TimeSeriesDataPoint[] = [];

  const current = new Date(start);
  while (current <= end) {
    const mockMetrics = generateMockPerformanceData(1)[0];

    data.push({
      date: current.toISOString().split("T")[0],
      label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      metrics: mockMetrics
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
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
