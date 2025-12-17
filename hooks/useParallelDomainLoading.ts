"use client";
import { useCallback } from "react";
import { AnalyticsDomain } from "@/types/analytics/ui";
import { filterPropagationService } from "@/lib/services/analytics/FilterPropagationService";
import { intelligentCacheService } from "@/lib/services/analytics/IntelligentCacheService";
import { useFilters } from "@/context/FiltersContext";
import { useLoading } from "@/context/LoadingContext";

/**
 * Hook for parallel domain loading with performance testing.
 * Provides intelligent caching and loading state management.
 */
export function useParallelDomainLoading() {
  const { filters } = useFilters();
  const { loadingState, setDomainLoading, setDomainError } = useLoading();

  const loadDomainsInParallel = useCallback(
    async function <T>(
      domains: AnalyticsDomain[],
      operation: string,
      dataFetcher: (domain: AnalyticsDomain) => Promise<T>
    ): Promise<{
      results: Record<AnalyticsDomain, T | null>;
      errors: Record<AnalyticsDomain, string | null>;
      performance: {
        totalTime: number;
        cacheHitRate: number;
        averageResponseTime: number;
      };
    }> {
      // Set all domains to loading
      domains.forEach((domain) => setDomainLoading(domain, true));

      try {
        // Convert UI filters to data filters
        const dataFilters =
          filterPropagationService.convertUIFiltersToDataFilters(filters);

        // Use intelligent cache service for parallel loading
        const result = await intelligentCacheService.parallelDomainLoading(
          domains,
          operation,
          dataFilters,
          dataFetcher
        );

        // Update loading states based on results
        domains.forEach((domain) => {
          setDomainLoading(domain, false);
          setDomainError(domain, result.errors[domain]);
        });

        // Calculate performance metrics
        const cacheHits = Object.values(result.cacheHits).filter(
          Boolean
        ).length;
        const cacheHitRate =
          domains.length > 0 ? cacheHits / domains.length : 0;

        return {
          results: result.results,
          errors: result.errors,
          performance: {
            totalTime: result.totalTime,
            cacheHitRate,
            averageResponseTime: result.totalTime / domains.length,
          },
        };
      } catch (error) {
        // Set all domains to error state
        const errorMessage =
          error instanceof Error ? error.message : "Parallel loading failed";
        domains.forEach((domain) => {
          setDomainLoading(domain, false);
          setDomainError(domain, errorMessage);
        });

        throw error;
      }
    },
    [filters, setDomainLoading, setDomainError]
  );

  const getCachePerformanceMetrics = useCallback((domain?: AnalyticsDomain) => {
    return intelligentCacheService.getCachePerformanceMetrics(domain);
  }, []);

  return {
    loadDomainsInParallel,
    getCachePerformanceMetrics,
    loadingState,
  };
}
