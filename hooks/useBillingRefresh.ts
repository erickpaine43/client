// ============================================================================
// BILLING REFRESH HOOK - Custom hook for billing dashboard refresh functionality
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { AnalyticsFilters, DataGranularity } from "@/types/analytics/core";

/**
 * Props for the useBillingRefresh hook.
 */
interface UseBillingRefreshProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilters?: AnalyticsFilters;
}

/**
 * Return type for the useBillingRefresh hook.
 */
interface UseBillingRefreshReturn {
  filters: AnalyticsFilters | undefined;
  isRefreshing: boolean;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilters | undefined>>;
  handleRefresh: () => Promise<void>;
}

/**
 * Custom hook for managing billing dashboard refresh functionality.
 */
export function useBillingRefresh({
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  initialFilters,
}: UseBillingRefreshProps = {}): UseBillingRefreshReturn {
  const [filters, setFilters] = useState<AnalyticsFilters | undefined>(
    initialFilters
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Migration note: Defensive filter update, normalize filter state before passing to consumers.
    setFilters((prev) => {
      const p = prev as Record<string, unknown> | undefined;
      
      // Always set dateRange as an object { start, end }
      const dateRange =
        typeof p?.dateRange === "object" && p?.dateRange !== null
          ? (p.dateRange as { start: string; end: string })
          : {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              end: new Date().toISOString().split("T")[0],
            };
      
      const granularity: DataGranularity =
        typeof p?.granularity === "string" && 
        ["hour", "day", "week", "month", "quarter", "year"].includes(p.granularity)
          ? (p.granularity as DataGranularity) 
          : "day";
      const entityIds = Array.isArray(p?.entityIds)
        ? (p.entityIds as string[])
        : [];
      const domainIds = Array.isArray(p?.domainIds)
        ? (p.domainIds as string[])
        : [];
      const mailboxIds = Array.isArray(p?.mailboxIds)
        ? (p.mailboxIds as string[])
        : [];
      
      return {
        dateRange,
        granularity,
        entityIds,
        domainIds,
        mailboxIds,
      } as AnalyticsFilters;
    });
    
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(handleRefresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, handleRefresh]);

  return {
    filters,
    isRefreshing,
    setFilters,
    handleRefresh,
  };
}
