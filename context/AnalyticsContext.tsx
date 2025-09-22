"use client";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  AnalyticsUIFilters,
  AnalyticsLoadingState,
  AnalyticsDomain,
  DateRangePreset,
  FormattedAnalyticsStats,
} from "@/types/analytics/ui";
import {
  DataGranularity,
  PerformanceMetrics,
  AnalyticsFilters,
} from "@/types/analytics/core";
import type {
  WarmupChartData,
  WarmupMetric,
  MailboxWarmupData,
  MailboxAnalyticsData,
} from "@/types/analytics";
import { analyticsService } from "@/lib/services/analytics/AnalyticsService";
import {
  mapServiceMailboxToLegacy,
  mapServiceWarmupToChartData,
} from "@/lib/utils/analytics-mappers";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { filterPropagationService } from "@/lib/services/analytics/FilterPropagationService";
import { intelligentCacheService } from "@/lib/services/analytics/IntelligentCacheService";

/**
 * Simplified Analytics Context State - UI state management only.
 * No data fetching logic, delegates to domain services.
 */
interface SimplifiedAnalyticsContextState {
  // UI Filters State
  filters: AnalyticsUIFilters;
  updateFilters: (filters: Partial<AnalyticsUIFilters>) => void;
  resetFilters: () => void;

  // Loading and Error State Management per Domain
  loadingState: AnalyticsLoadingState;
  setDomainLoading: (domain: AnalyticsDomain, loading: boolean) => void;
  setDomainError: (domain: AnalyticsDomain, error: string | null) => void;

  // Formatted Analytics Stats for UI Display
  formattedStats: FormattedAnalyticsStats;
  updateFormattedStats: (stats: Partial<FormattedAnalyticsStats>) => void;

  // Backward Compatibility - Direct access to formatted stats
  totalSent: string;
  openRate: string;
  clickRate: string;
  replyRate: string;
  bounceRate: string;
  deliveryRate: string;
  campaignPerformanceData: PerformanceMetrics[];

  // Backward-compatible convenience methods used by legacy components
  fetchMailboxAnalytics: (
    mailboxId: string
  ) => Promise<MailboxAnalyticsData | null>;
  fetchMailboxes: () => Promise<MailboxWarmupData[]>;
  fetchMultipleMailboxAnalytics: (
    mailboxIds: string[],
    dateRangePreset?: DateRangePreset,
    granularityLevel?: DataGranularity,
    userid?: string,
    companyid?: string
  ) => Promise<Record<string, MailboxAnalyticsData>>;
  getAccountMetrics: (accountId?: string) => Promise<unknown | null>;
  smartInsightsList: unknown[];
  // Backward-compatible direct filter accessors
  dateRange: DateRangePreset;
  setDateRange: (r: DateRangePreset) => void;
  granularity: DataGranularity;
  setGranularity: (g: DataGranularity) => void;
  allowedGranularities: DataGranularity[];

  // Warmup legacy UI state
  warmupMetrics: WarmupMetric[];
  visibleWarmupMetrics: Record<string, boolean>;
  setVisibleWarmupMetrics: (metrics: Record<string, boolean>) => void;
  warmupChartData: WarmupChartData[];

  // Service Access
  services: typeof analyticsService;

  // Cross-domain Coordination Methods
  refreshAll: () => Promise<void>;
  refreshDomain: (domain: AnalyticsDomain) => Promise<void>;
  invalidateCache: (domain?: AnalyticsDomain) => Promise<void>;

  // UI Helper Methods
  getAllowedGranularities: () => DataGranularity[];
  getDaysFromRange: () => number;
  isFilterActive: (filterType: keyof AnalyticsUIFilters) => boolean;
}

// Helper function to get allowed granularities based on date range
const getAllowedGranularities = (days: number): DataGranularity[] => {
  if (days <= 14) {
    return ["day", "week"];
  } else if (days <= 60) {
    return ["week", "month"];
  } else {
    return ["week", "month"];
  }
};

// Helper function to calculate days from date range
const getDaysFromRange = (
  dateRange: DateRangePreset,
  customRange?: { start: string; end: string }
): number => {
  if (dateRange === "custom" && customRange) {
    const start = new Date(customRange.start);
    const end = new Date(customRange.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  switch (dateRange) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
      return 365;
    default:
      return 30;
  }
};

const AnalyticsContext = createContext<
  SimplifiedAnalyticsContextState | undefined
>(undefined);

function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // UI Filters State - using standardized interfaces
  const [filters, setFilters] = useState<AnalyticsUIFilters>({
    dateRange: "30d",
    granularity: "day",
    selectedCampaigns: [],
    selectedMailboxes: [],
    selectedDomains: [],
    visibleMetrics: ["sent", "opened_tracked", "clicked_tracked", "replied"],
  });

  // Loading and Error State Management per Domain
  const [loadingState, setLoadingState] = useState<AnalyticsLoadingState>({
    domains: {
      campaigns: false,
      domains: false,
      mailboxes: false,
      crossDomain: false,
      leads: false,
      templates: false,
      billing: false,
    },
    errors: {
      campaigns: null,
      domains: null,
      mailboxes: null,
      crossDomain: null,
      leads: null,
      templates: null,
      billing: null,
    },
    isLoading: false,
    hasErrors: false,
  });

  // Formatted Analytics Stats for UI Display
  const [formattedStats, setFormattedStats] = useState<FormattedAnalyticsStats>(
    {
      totalSent: "0",
      openRate: "0.0%",
      clickRate: "0.0%",
      replyRate: "0.0%",
      bounceRate: "0.0%",
      deliveryRate: "0.0%",
    }
  );

  // Warmup-specific UI state (backward compatibility for warmup components)
  const [visibleWarmupMetrics, setVisibleWarmupMetrics] = useState<
    Record<string, boolean>
  >({
    totalWarmups: true,
    spamFlags: false,
    replies: true,
  });

  const [warmupChartData, setWarmupChartData] = useState<WarmupChartData[]>([]);
  const [warmupMetrics] = useState<WarmupMetric[]>([
    {
      key: "totalWarmups",
      label: "Total Warmups",
      color: "#3B82F6",
      icon: () => null,
      visible: true,
      tooltip: "Total warmup emails",
    },
    {
      key: "spamFlags",
      label: "Spam Flags",
      color: "#DC2626",
      icon: () => null,
      visible: false,
      tooltip: "Spam flags detected",
    },
    {
      key: "replies",
      label: "Replies",
      color: "#059669",
      icon: () => null,
      visible: true,
      tooltip: "Replies received",
    },
  ]);

  // Calculate days based on current filters
  const days = useMemo(() => {
    return getDaysFromRange(filters.dateRange, filters.customDateRange);
  }, [filters.dateRange, filters.customDateRange]);

  // Get allowed granularities based on date range
  const allowedGranularities = useMemo(() => {
    return getAllowedGranularities(days);
  }, [days]);

  // Backward-compatible setters for dateRange/granularity used by legacy components
  const setDateRange = useCallback((r: DateRangePreset) => {
    setFilters((prev) => ({ ...prev, dateRange: r }));
  }, []);

  const setGranularity = useCallback((g: DataGranularity) => {
    setFilters((prev) => ({ ...prev, granularity: g }));
  }, []);

  // Update filters with validation and propagation
  const updateFilters = useCallback(
    async (newFilters: Partial<AnalyticsUIFilters>) => {
      const oldFilters = filters;

      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };

        // Auto-adjust granularity if current selection is not allowed
        const allowedGrans = getAllowedGranularities(
          getDaysFromRange(updated.dateRange, updated.customDateRange)
        );

        if (!allowedGrans.includes(updated.granularity)) {
          updated.granularity = allowedGrans[0];
        }

        return updated;
      });

      // Propagate filter changes across domains
      for (const [filterType, newValue] of Object.entries(newFilters)) {
        const oldValue = oldFilters[filterType as keyof AnalyticsUIFilters];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          try {
            const propagationResult =
              await filterPropagationService.propagateFilterChange(
                "campaigns", // Default source domain - in practice, this would be determined by context
                filterType as keyof AnalyticsUIFilters,
                oldValue,
                newValue,
                { ...oldFilters, ...newFilters } as AnalyticsUIFilters
              );

            if (propagationResult.success) {
              console.log(
                `Filter propagation successful: ${propagationResult.cacheKeysInvalidated} keys invalidated across ${propagationResult.affectedDomains.length} domains`
              );
            } else {
              console.warn(
                "Filter propagation had errors:",
                propagationResult.errors
              );
            }
          } catch (error) {
            console.error("Filter propagation failed:", error);
          }
        }
      }
    },
    [filters]
  );

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: "30d",
      granularity: "day",
      selectedCampaigns: [],
      selectedMailboxes: [],
      selectedDomains: [],
      visibleMetrics: ["sent", "opened_tracked", "clicked_tracked", "replied"],
    });
  }, []);

  // Set domain loading state
  const setDomainLoading = useCallback(
    (domain: AnalyticsDomain, loading: boolean) => {
      setLoadingState((prev) => {
        const newDomains = { ...prev.domains, [domain]: loading };
        const isLoading = Object.values(newDomains).some(Boolean);

        return {
          ...prev,
          domains: newDomains,
          isLoading,
        };
      });
    },
    []
  );

  // Set domain error state
  const setDomainError = useCallback(
    (domain: AnalyticsDomain, error: string | null) => {
      setLoadingState((prev) => {
        const newErrors = { ...prev.errors, [domain]: error };
        const hasErrors = Object.values(newErrors).some(Boolean);

        return {
          ...prev,
          errors: newErrors,
          hasErrors,
        };
      });
    },
    []
  );

  // Update formatted stats
  const updateFormattedStats = useCallback(
    (stats: Partial<FormattedAnalyticsStats>) => {
      setFormattedStats((prev) => ({ ...prev, ...stats }));
    },
    []
  );

  // Cross-domain coordination methods with intelligent caching
  const refreshAll = useCallback(async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isLoading: true }));

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

      await analyticsService.refreshAll();

      // Clear all errors on successful refresh
      setLoadingState((prev) => ({
        ...prev,
        errors: {
          campaigns: null,
          domains: null,
          mailboxes: null,
          crossDomain: null,
          leads: null,
          templates: null,
          billing: null,
        },
        hasErrors: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to refresh all analytics:", error);
      setLoadingState((prev) => ({
        ...prev,
        isLoading: false,
        hasErrors: true,
      }));
    }
  }, []);

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

        await analyticsService.refreshDomain(domain);
        setDomainError(domain, null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to refresh domain";
        setDomainError(domain, errorMessage);
        console.error(`Failed to refresh domain ${domain}:`, error);
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

      await analyticsService.invalidateCache(domain ? [domain] : undefined);
    } catch (error) {
      console.error("Failed to invalidate cache:", error);
      throw error;
    }
  }, []);

  // UI Helper Methods
  const getFilteredAllowedGranularities = useCallback(() => {
    return allowedGranularities;
  }, [allowedGranularities]);

  const getFilteredDaysFromRange = useCallback(() => {
    return days;
  }, [days]);

  const isFilterActive = useCallback(
    (filterType: keyof AnalyticsUIFilters) => {
      switch (filterType) {
        case "selectedCampaigns":
          return filters.selectedCampaigns.length > 0;
        case "selectedMailboxes":
          return filters.selectedMailboxes.length > 0;
        case "selectedDomains":
          return filters.selectedDomains.length > 0;
        case "customDateRange":
          return (
            filters.dateRange === "custom" && Boolean(filters.customDateRange)
          );
        case "visibleMetrics":
          return filters.visibleMetrics.length > 0;
        default:
          return false;
      }
    },
    [filters]
  );

  return (
    <AnalyticsContext.Provider
      value={{
        // UI Filters State
        filters,
        updateFilters,
        resetFilters,

        // Loading and Error State Management per Domain
        loadingState,
        setDomainLoading,
        setDomainError,

        // Formatted Analytics Stats for UI Display
        formattedStats,
        updateFormattedStats,

        // Backward Compatibility - Direct access to formatted stats
        totalSent: formattedStats.totalSent,
        openRate: formattedStats.openRate,
        clickRate: formattedStats.clickRate,
        replyRate: formattedStats.replyRate,
        bounceRate: formattedStats.bounceRate,
        deliveryRate: formattedStats.deliveryRate,
        campaignPerformanceData: [], // TODO: Implement proper campaign data
        // Warmup legacy state
        visibleWarmupMetrics,
        setVisibleWarmupMetrics,
        warmupChartData,
        warmupMetrics,
        // Backward-compatible direct filter accessors
        dateRange: filters.dateRange,
        setDateRange,
        granularity: filters.granularity,
        setGranularity,
        allowedGranularities,

        // Backward-compatible method shims (lightweight wrappers)
        fetchMailboxAnalytics: async (mailboxId: string) => {
          try {
            // Build a minimal default filter inline to avoid protected method access
            const defaultFilter: AnalyticsFilters = {
              dateRange: {
                start: new Date(
                  Date.now() - 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                end: new Date().toISOString(),
              },
            };
            const res = await analyticsService.mailboxes.getMailboxPerformance(
              [mailboxId],
              defaultFilter
            );
            if (res && res.length > 0) {
              const svc = res[0];
              // Best-effort: try to fetch warmup analytics for chart data
              let warmup = null;
              try {
                warmup =
                  (
                    await analyticsService.mailboxes.getWarmupAnalytics([
                      mailboxId,
                    ])
                  )?.[0] ?? null;
              } catch {
                warmup = null;
              }

              const legacy = mapServiceMailboxToLegacy(svc, warmup);
              if (warmup)
                setWarmupChartData(mapServiceWarmupToChartData(warmup));
              return legacy;
            }
            return null;
          } catch {
            console.warn("fetchMailboxAnalytics shim failed");
            return null;
          }
        },
        fetchMultipleMailboxAnalytics: async (
          mailboxIds: string[],
          _dateRangePreset?: DateRangePreset,
          _granularityLevel?: DataGranularity,
          _userid?: string,
          _companyid?: string
        ) => {
          try {
            const defaultFilter: AnalyticsFilters = {
              dateRange: {
                start: new Date(
                  Date.now() - 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                end: new Date().toISOString(),
              },
            };
            const res = await analyticsService.mailboxes.getMailboxPerformance(
              mailboxIds,
              defaultFilter
            );
            const warmups = await analyticsService.mailboxes
              .getWarmupAnalytics(mailboxIds)
              .catch(() => []);
            // return a mapping keyed by mailboxId for easier consumer access
            const map: Record<string, MailboxAnalyticsData> = {};
            res.forEach((svc, idx) => {
              const w = warmups && warmups[idx] ? warmups[idx] : null;
              map[svc.mailboxId] = mapServiceMailboxToLegacy(svc, w);
            });
            return map;
          } catch (e) {
            console.warn("fetchMultipleMailboxAnalytics shim failed", e);
            return {} as Record<string, MailboxAnalyticsData>;
          }
        },
        fetchMailboxes: async () => {
          try {
            // Best-effort: return empty default until a proper service call is wired
            return [] as MailboxWarmupData[];
          } catch {
            return [] as MailboxWarmupData[];
          }
        },
        getAccountMetrics: async (accountId?: string) => {
          try {
            // Best-effort: call getDomainPerformance if available
            const defaultFilter: AnalyticsFilters = {
              dateRange: {
                start: new Date(
                  Date.now() - 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
                end: new Date().toISOString(),
              },
            };
            type DomainsServiceShape = {
              getDomainPerformance?: (
                ids: string[],
                filters: AnalyticsFilters
              ) => Promise<unknown>;
            };
            const domainsService = analyticsService.domains as
              | DomainsServiceShape
              | undefined;
            if (accountId && domainsService?.getDomainPerformance) {
              return await domainsService.getDomainPerformance(
                [accountId],
                defaultFilter
              );
            }
            return null;
          } catch {
            console.warn("getAccountMetrics shim failed");
            return null;
          }
        },
        smartInsightsList: [],

        // Service Access
        services: analyticsService,

        // Cross-domain Coordination Methods
        refreshAll,
        refreshDomain,
        invalidateCache,

        // UI Helper Methods
        getAllowedGranularities: getFilteredAllowedGranularities,
        getDaysFromRange: getFilteredDaysFromRange,
        isFilterActive,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access the simplified analytics context.
 * Provides UI state management and domain service coordination.
 */
function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}

/**
 * Hook for domain-specific analytics operations.
 * Provides convenient access to domain services with loading/error handling.
 */
function useDomainAnalytics(domain: AnalyticsDomain) {
  const { services, loadingState, setDomainLoading, setDomainError } =
    useAnalytics();

  const executeWithErrorHandling = useCallback(
    async function <T>(operation: () => Promise<T>): Promise<T | null> {
      try {
        setDomainLoading(domain, true);
        const result = await operation();
        setDomainError(domain, null);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Operation failed";
        setDomainError(domain, errorMessage);
        console.error(`Domain ${domain} operation failed:`, error);
        return null;
      } finally {
        setDomainLoading(domain, false);
      }
    },
    [domain, setDomainLoading, setDomainError]
  );

  return {
    service: services[domain as keyof typeof services],
    loading: loadingState.domains[domain],
    error: loadingState.errors[domain],
    executeWithErrorHandling,
  };
}

/**
 * Hook for formatted analytics display.
 * Provides methods to format raw analytics data for UI display.
 */
function useFormattedAnalytics() {
  const { formattedStats, updateFormattedStats } = useAnalytics();

  const formatMetricsForDisplay = useCallback(
    (metrics?: PerformanceMetrics | null) => {
      if (!metrics) return;

      // Defensive: ensure numeric fields exist to avoid runtime NaN
      const safeMetrics: PerformanceMetrics = {
        sent: metrics.sent ?? 0,
        delivered: metrics.delivered ?? 0,
        opened_tracked: metrics.opened_tracked ?? 0,
        clicked_tracked: metrics.clicked_tracked ?? 0,
        replied: metrics.replied ?? 0,
        bounced: metrics.bounced ?? 0,
        unsubscribed: metrics.unsubscribed ?? 0,
        spamComplaints: metrics.spamComplaints ?? 0,
      };

      const rates = AnalyticsCalculator.calculateAllRates(safeMetrics);

      updateFormattedStats({
        totalSent: AnalyticsCalculator.formatNumber(safeMetrics.sent),
        openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
        replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        bounceRate: AnalyticsCalculator.formatRateAsPercentage(
          rates.bounceRate
        ),
        deliveryRate: AnalyticsCalculator.formatRateAsPercentage(
          rates.deliveryRate
        ),
      });
    },
    [updateFormattedStats]
  );

  return {
    formattedStats,
    formatMetricsForDisplay,
    updateFormattedStats,
  };
}

/**
 * Hook for parallel domain loading with performance testing.
 * Provides intelligent caching and loading state management.
 */
function useParallelDomainLoading() {
  const { filters, loadingState, setDomainLoading, setDomainError } =
    useAnalytics();

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

/**
 * Hook for filter validation and compatibility checking.
 * Provides filter validation across domains.
 */
function useFilterValidation() {
  const { filters } = useAnalytics();

  const validateFilters = useCallback(() => {
    return filterPropagationService.validateFilterCompatibility(filters);
  }, [filters]);

  const getAffectedDomains = useCallback(
    (sourceDomain: AnalyticsDomain, filterType: keyof AnalyticsUIFilters) => {
      return filterPropagationService.getAffectedDomains(
        sourceDomain,
        filterType
      );
    },
    []
  );

  const hasFilterDependencies = useCallback(
    (sourceDomain: AnalyticsDomain, filterType: keyof AnalyticsUIFilters) => {
      return filterPropagationService.hasFilterDependencies(
        sourceDomain,
        filterType
      );
    },
    []
  );

  return {
    validateFilters,
    getAffectedDomains,
    hasFilterDependencies,
    currentFilters: filters,
  };
}

export {
  AnalyticsProvider,
  useAnalytics,
  useDomainAnalytics,
  useFormattedAnalytics,
  useParallelDomainLoading,
  useFilterValidation,
};
