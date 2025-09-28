"use client";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { AnalyticsUIFilters, AnalyticsDomain, DateRangePreset } from "@/types/analytics/ui";
import { DataGranularity } from "@/types/analytics/core";
import { filterPropagationService } from "@/lib/services/analytics/FilterPropagationService";

interface FiltersContextState {
  // Filter State
  filters: AnalyticsUIFilters;
  updateFilters: (filters: Partial<AnalyticsUIFilters>) => void;
  resetFilters: () => void;

  // Backward-compatible direct filter accessors
  dateRange: DateRangePreset;
  setDateRange: (r: DateRangePreset) => void;
  granularity: DataGranularity;
  setGranularity: (g: DataGranularity) => void;
  allowedGranularities: DataGranularity[];

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

const FiltersContext = createContext<FiltersContextState | undefined>(
  undefined
);

function FiltersProvider({ children }: { children: React.ReactNode }) {
  // UI Filters State - using standardized interfaces
  const [filters, setFilters] = useState<AnalyticsUIFilters>({
    dateRange: "30d",
    granularity: "day",
    selectedCampaigns: [],
    selectedMailboxes: [],
    selectedDomains: [],
    visibleMetrics: ["sent", "opened_tracked", "clicked_tracked", "replied"],
  });

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
    <FiltersContext.Provider
      value={{
        // Filter State
        filters,
        updateFilters,
        resetFilters,

        // Backward-compatible direct filter accessors
        dateRange: filters.dateRange,
        setDateRange,
        granularity: filters.granularity,
        setGranularity,
        allowedGranularities,

        // UI Helper Methods
        getAllowedGranularities: getFilteredAllowedGranularities,
        getDaysFromRange: getFilteredDaysFromRange,
        isFilterActive,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

/**
 * Hook to access the filters context.
 */
function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
}

/**
 * Hook for filter validation and compatibility checking.
 */
function useFilterValidation() {
  const { filters } = useFilters();

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

export { FiltersProvider, useFilters, useFilterValidation };
