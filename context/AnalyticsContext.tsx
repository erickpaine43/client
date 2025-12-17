"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { AnalyticsDomain, DateRangePreset } from "@/types/analytics/ui";
import { DataGranularity, AnalyticsFilters } from "@/types/analytics/core";
import type {
  WarmupChartData,
  WarmupMetric,
  MailboxWarmupData,
  MailboxAnalyticsData,
} from "@/types/analytics";
import type { DomainWithMailboxesData } from "@/lib/actions/domains/types";
import { PerformanceMetrics } from "@/types/analytics/core";
import { CampaignPerformanceData } from "@/types";
import { analyticsService } from "@/lib/services/analytics/AnalyticsService";
import {
  mapServiceMailboxToLegacy,
  mapServiceWarmupToChartData,
} from "@/lib/utils/analytics-mappers";
import { FiltersProvider, useFilters } from "./FiltersContext";
import {
  LoadingProvider,
  useLoading,
  useDomainLoading,
} from "./LoadingContext";
import { useAnalyticsRefresh } from "@/hooks/useAnalyticsRefresh";
import { useFormattedAnalytics } from "@/hooks/useFormattedAnalytics";
import { useParallelDomainLoading } from "@/hooks/useParallelDomainLoading";
import { useFilterValidation } from "./FiltersContext";

/**
 * Simplified Analytics Context State - Combines all sub-contexts for backward compatibility.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
interface SimplifiedAnalyticsContextState {
  // Re-exported from FiltersContext for backward compatibility
  filters: any;
  updateFilters: (filters: any) => void;
  resetFilters: () => void;
  dateRange: DateRangePreset;
  setDateRange: (r: DateRangePreset) => void;
  granularity: any;
  setGranularity: (g: any) => void;
  allowedGranularities: any[];
  getAllowedGranularities: () => any[];
  getDaysFromRange: () => number;
  isFilterActive: (filterType: any) => boolean;

  // Re-exported from LoadingContext for backward compatibility
  loadingState: any;
  setDomainLoading: (domain: any, loading: boolean) => void;
  setDomainError: (domain: any, error: string | null) => void;

  // Re-exported from FormattedAnalytics for backward compatibility
  formattedStats: any;
  updateFormattedStats: (stats: any) => void;
  totalSent: string;
  openRate: string;
  clickRate: string;
  replyRate: string;
  bounceRate: string;
  deliveryRate: string;

  // Re-exported from AnalyticsRefresh for backward compatibility
  refreshAll: () => Promise<void>;
  refreshDomain: (domain: any) => Promise<void>;
  invalidateCache: (domain?: any) => Promise<void>;

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

  // Additional backward compatibility properties
  chartData: unknown[];
  fetchDomainsWithMailboxes: () => Promise<DomainWithMailboxesData[]>;
  campaignPerformanceData: Array<PerformanceMetrics | CampaignPerformanceData>;
  campaigns: unknown[]; // Backward compatibility for campaigns list

  // Warmup legacy UI state
  warmupMetrics: WarmupMetric[];
  visibleWarmupMetrics: Record<string, boolean>;
  setVisibleWarmupMetrics: (metrics: Record<string, boolean>) => void;
  warmupChartData: WarmupChartData[];

  // Service Access
  services: typeof analyticsService;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const AnalyticsContext = createContext<
  SimplifiedAnalyticsContextState | undefined
>(undefined);

/**
 * Internal provider that combines all contexts and provides backward compatibility.
 */
function InternalAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use all the sub-context hooks for backward compatibility
  const filtersContext = useFilters();
  const loadingContext = useLoading();
  const refreshHooks = useAnalyticsRefresh();
  const formattedAnalytics = useFormattedAnalytics();

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

  // Backward-compatible method shims (lightweight wrappers)
  const fetchMailboxAnalytics = useCallback(async (mailboxId: string) => {
    if (!analyticsService || typeof window === 'undefined') {
      console.warn("AnalyticsService not available for fetchMailboxAnalytics (SSR or service unavailable)");
      return null;
    }
    try {
      // Build a minimal default filter inline to avoid protected method access
      const defaultFilter: AnalyticsFilters = {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
              await analyticsService.mailboxes.getWarmupAnalytics([mailboxId])
            )?.[0] ?? null;
        } catch {
          warmup = null;
        }

        const legacy = mapServiceMailboxToLegacy(svc, warmup);
        if (warmup) setWarmupChartData(mapServiceWarmupToChartData(warmup));
        return legacy;
      }
      return null;
    } catch {
      console.warn("fetchMailboxAnalytics shim failed");
      return null;
    }
  }, []);

  const fetchMultipleMailboxAnalytics = useCallback(
    async (
      mailboxIds: string[],
      _dateRangePreset?: DateRangePreset,
      _granularityLevel?: DataGranularity,
      _userid?: string,
      _companyid?: string
    ) => {
      if (!analyticsService || typeof window === 'undefined') {
        console.warn(
          "AnalyticsService not available for fetchMultipleMailboxAnalytics (SSR or service unavailable)"
        );
        return {} as Record<string, MailboxAnalyticsData>;
      }
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
    []
  );

  const fetchMailboxes = useCallback(async () => {
    try {
      // Best-effort: return empty default until a proper service call is wired
      return [] as MailboxWarmupData[];
    } catch {
      return [] as MailboxWarmupData[];
    }
  }, []);

  const getAccountMetrics = useCallback(async (accountId?: string) => {
    if (!analyticsService || typeof window === 'undefined') {
      console.warn("AnalyticsService not available for getAccountMetrics (SSR or service unavailable)");
      return null;
    }
    try {
      // Best-effort: call getDomainPerformance if available
      const defaultFilter: AnalyticsFilters = {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
  }, []);

  const fetchDomainsWithMailboxes = useCallback(async () => {
    try {
      // Best-effort: return empty default until a proper service call is wired
      return [] as DomainWithMailboxesData[];
    } catch {
      return [] as DomainWithMailboxesData[];
    }
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        // Re-exported from FiltersContext for backward compatibility
        filters: filtersContext.filters,
        updateFilters: filtersContext.updateFilters,
        resetFilters: filtersContext.resetFilters,
        dateRange: filtersContext.dateRange,
        setDateRange: filtersContext.setDateRange,
        granularity: filtersContext.granularity,
        setGranularity: filtersContext.setGranularity,
        allowedGranularities: filtersContext.allowedGranularities,
        getAllowedGranularities: filtersContext.getAllowedGranularities,
        getDaysFromRange: filtersContext.getDaysFromRange,
        isFilterActive: filtersContext.isFilterActive,

        // Re-exported from LoadingContext for backward compatibility
        loadingState: loadingContext.loadingState,
        setDomainLoading: loadingContext.setDomainLoading,
        setDomainError: loadingContext.setDomainError,

        // Re-exported from FormattedAnalytics for backward compatibility
        formattedStats: formattedAnalytics.formattedStats,
        updateFormattedStats: formattedAnalytics.updateFormattedStats,
        totalSent: formattedAnalytics.formattedStats.totalSent,
        openRate: formattedAnalytics.formattedStats.openRate,
        clickRate: formattedAnalytics.formattedStats.clickRate,
        replyRate: formattedAnalytics.formattedStats.replyRate,
        bounceRate: formattedAnalytics.formattedStats.bounceRate,
        deliveryRate: formattedAnalytics.formattedStats.deliveryRate,

        // Re-exported from AnalyticsRefresh for backward compatibility
        refreshAll: refreshHooks.refreshAll,
        refreshDomain: refreshHooks.refreshDomain,
        invalidateCache: refreshHooks.invalidateCache,

        // Backward-compatible convenience methods
        fetchMailboxAnalytics,
        fetchMailboxes,
        fetchMultipleMailboxAnalytics,
        getAccountMetrics,
        smartInsightsList: [],

        // Additional backward compatibility properties
        chartData: [],
        fetchDomainsWithMailboxes,
        campaignPerformanceData: [], // TODO: Implement proper campaign data
        campaigns: [], // TODO: Implement proper campaigns list

        // Warmup legacy state
        visibleWarmupMetrics,
        setVisibleWarmupMetrics,
        warmupChartData,
        warmupMetrics,

        // Service Access
        services: analyticsService || undefined,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Main Analytics Provider that wraps all sub-providers.
 * Temporarily disabled during SSR to prevent build issues.
 */
function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Temporarily disable analytics provider during SSR to prevent build issues
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <FiltersProvider>
      <LoadingProvider>
        <InternalAnalyticsProvider>{children}</InternalAnalyticsProvider>
      </LoadingProvider>
    </FiltersProvider>
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
  const { services } = useAnalytics();
  const { loading, error, executeWithErrorHandling } = useDomainLoading(domain);

  return {
    service: (services && typeof window !== 'undefined') ? services[domain as keyof typeof services] : null,
    loading,
    error,
    executeWithErrorHandling,
  };
}

export {
  AnalyticsProvider,
  useAnalytics,
  useDomainAnalytics,
  // Re-export hooks from sub-contexts for convenience
  useFilters,
  useLoading,
  useDomainLoading,
  useAnalyticsRefresh,
  useFormattedAnalytics,
  useParallelDomainLoading,
  useFilterValidation,
};
