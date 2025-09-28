"use client";
import { useCallback } from "react";
import { AnalyticsDomain } from "@/types/analytics/ui";
import { analyticsService } from "@/lib/services/analytics/AnalyticsService";
import { intelligentCacheService } from "@/lib/services/analytics/IntelligentCacheService";
import { useLoading } from "@/context/LoadingContext";

/**
 * Hook for analytics refresh operations.
 * Provides methods to refresh analytics data with intelligent caching.
 */
export function useAnalyticsRefresh() {
  const { setDomainLoading, setDomainError, clearAllErrors, setGlobalLoading } = useLoading();

  // Cross-domain coordination methods with intelligent caching
  const refreshAll = useCallback(async () => {
    try {
      setGlobalLoading(true);

      // Use intelligent cache invalidation
      const domains: AnalyticsDomain[] = [
        "campaigns",
        "domains",
        "mailboxes",
        "leads",
        "templates",
        "billing",
        "crossDomain",
      ];

      for (const domain of domains) {
        await intelligentCacheService.intelligentInvalidation(
          domain,
          "refresh",
          {}
        );
      }

      if (analyticsService) {
        await analyticsService.refreshAll();
      } else {
        console.warn("AnalyticsService not available, skipping refreshAll");
      }

      // Clear all errors on successful refresh
      clearAllErrors();
    } catch (error) {
      console.error("Failed to refresh all analytics:", error);
      setGlobalLoading(false);
      throw error;
    } finally {
      setGlobalLoading(false);
    }
  }, [setGlobalLoading, clearAllErrors]);

  const refreshDomain = useCallback(
    async (domain: AnalyticsDomain) => {
      try {
        setDomainLoading(domain, true);

        // Use intelligent cache invalidation for the domain
        await intelligentCacheService.intelligentInvalidation(
          domain,
          "refresh",
          {}
        );

        if (analyticsService) {
          await analyticsService.refreshDomain(domain);
        } else {
          console.warn("AnalyticsService not available, skipping refreshDomain");
        }
        setDomainError(domain, null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to refresh domain";
        setDomainError(domain, errorMessage);
        console.error(`Failed to refresh domain ${domain}:`, error);
        throw error;
      } finally {
        setDomainLoading(domain, false);
      }
    },
    [setDomainLoading, setDomainError]
  );

  const invalidateCache = useCallback(async (domain?: AnalyticsDomain) => {
    try {
      if (domain) {
        // Use intelligent cache invalidation for specific domain
        const result = await intelligentCacheService.intelligentInvalidation(
          domain,
          "invalidate",
          {}
        );
        console.log(
          `Intelligent cache invalidation: ${result.keysInvalidated} keys invalidated, ${result.domainsAffected.length} domains affected`
        );
      } else {
        // Invalidate all domains
        const domains: AnalyticsDomain[] = [
          "campaigns",
          "domains",
          "mailboxes",
          "leads",
          "templates",
          "billing",
          "crossDomain",
        ];
        let totalKeys = 0;

        for (const d of domains) {
          const result = await intelligentCacheService.intelligentInvalidation(
            d,
            "invalidate",
            {}
          );
          totalKeys += result.keysInvalidated;
        }

        console.log(
          `Total cache invalidation: ${totalKeys} keys invalidated across all domains`
        );
      }

      if (analyticsService) {
        await analyticsService.invalidateCache(domain ? [domain] : undefined);
      } else {
        console.warn("AnalyticsService not available, skipping invalidateCache");
      }
    } catch (error) {
      console.error("Failed to invalidate cache:", error);
      throw error;
    }
  }, []);

  return {
    refreshAll,
    refreshDomain,
    invalidateCache,
  };
}
