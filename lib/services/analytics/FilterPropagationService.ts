// ============================================================================
// FILTER PROPAGATION SERVICE - Cross-domain filter coordination
// ============================================================================

import { 
  AnalyticsFilters,
} from "@/types/analytics/core";
import {
  AnalyticsDomain,
} from "@/types/analytics/ui";
import { 
  AnalyticsUIFilters, 
  DateRangePreset
} from "@/types/analytics/ui";
import { analyticsCache } from "@/lib/utils/redis";

/**
 * Filter change event for cross-domain coordination.
 */
export interface FilterChangeEvent {
  domain: AnalyticsDomain;
  filterType: keyof AnalyticsUIFilters;
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
  affectedDomains: AnalyticsDomain[];
}

/**
 * Filter dependency mapping for cross-domain effects.
 */
export interface FilterDependency {
  sourceDomain: AnalyticsDomain;
  targetDomains: AnalyticsDomain[];
  filterTypes: (keyof AnalyticsUIFilters)[];
  propagationType: "cascade" | "invalidate" | "refresh";
}

/**
 * Filter propagation result.
 */
export interface FilterPropagationResult {
  success: boolean;
  affectedDomains: AnalyticsDomain[];
  cacheKeysInvalidated: number;
  errors: Record<AnalyticsDomain, string | null>;
  propagationTime: number;
}

/**
 * Service for managing filter propagation across analytics domains.
 * Handles cross-domain filter coordination and cache invalidation.
 */
export class FilterPropagationService {
  private static instance: FilterPropagationService | null = null;
  private filterDependencies: FilterDependency[] = [];
  private filterChangeListeners: Array<(event: FilterChangeEvent) => void> = [];

  private constructor() {
    this.initializeFilterDependencies();
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): FilterPropagationService {
    if (!this.instance) {
      this.instance = new FilterPropagationService();
    }
    return this.instance;
  }

  /**
   * Initialize filter dependencies between domains.
   */
  private initializeFilterDependencies(): void {
    this.filterDependencies = [
      // Campaign filters affect mailbox and domain analytics
      {
        sourceDomain: "campaigns",
        targetDomains: ["mailboxes", "domains", "crossDomain"],
        filterTypes: ["selectedCampaigns", "dateRange", "customDateRange"],
        propagationType: "invalidate",
      },
      
      // Mailbox filters affect campaign and domain analytics
      {
        sourceDomain: "mailboxes",
        targetDomains: ["campaigns", "domains", "crossDomain"],
        filterTypes: ["selectedMailboxes", "dateRange", "customDateRange"],
        propagationType: "invalidate",
      },
      
      // Domain filters affect campaign and mailbox analytics
      {
        sourceDomain: "domains",
        targetDomains: ["campaigns", "mailboxes", "crossDomain"],
        filterTypes: ["selectedDomains", "dateRange", "customDateRange"],
        propagationType: "invalidate",
      },
      
      // Date range changes affect all domains
      {
        sourceDomain: "campaigns",
        targetDomains: ["domains", "mailboxes", "leads", "templates", "billing", "crossDomain"],
        filterTypes: ["dateRange", "customDateRange", "granularity"],
        propagationType: "cascade",
      },
      
      // Lead filters affect campaign analytics
      {
        sourceDomain: "leads",
        targetDomains: ["campaigns", "crossDomain"],
        filterTypes: ["dateRange", "customDateRange"],
        propagationType: "invalidate",
      },
      
      // Template filters affect campaign analytics
      {
        sourceDomain: "templates",
        targetDomains: ["campaigns", "crossDomain"],
        filterTypes: ["dateRange", "customDateRange"],
        propagationType: "invalidate",
      },
    ];
  }

  /**
   * UI filters to data layer filters.
   */
  convertUIFiltersToDataFilters(uiFilters: AnalyticsUIFilters): AnalyticsFilters {
    const dateRange = this.resolveDateRange(uiFilters.dateRange, uiFilters.customDateRange);
    
    return {
      dateRange,
      entityIds: [
        ...uiFilters.selectedCampaigns,
        ...uiFilters.selectedMailboxes,
        ...uiFilters.selectedDomains,
      ],
      additionalFilters: {
        granularity: uiFilters.granularity,
        visibleMetrics: uiFilters.visibleMetrics,
        campaigns: uiFilters.selectedCampaigns,
        mailboxes: uiFilters.selectedMailboxes,
        domains: uiFilters.selectedDomains,
      },
    };
  }

  /**
   * Resolve date range from UI filters.
   */
  private resolveDateRange(
    preset: DateRangePreset,
    customRange?: { start: string; end: string }
  ): { start: string; end: string } {
    if (preset === "custom" && customRange) {
      return customRange;
    }

    const end = new Date();
    const start = new Date();

    switch (preset) {
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      case "90d":
        start.setDate(start.getDate() - 90);
        break;
      case "1y":
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }

  /**
   * Propagate filter changes across domains.
   */
  async propagateFilterChange(
    sourceDomain: AnalyticsDomain,
    filterType: keyof AnalyticsUIFilters,
    oldValue: unknown,
    newValue: unknown,
    uiFilters: AnalyticsUIFilters
  ): Promise<FilterPropagationResult> {
    const startTime = Date.now();
    const affectedDomains: AnalyticsDomain[] = [];
    const errors: Record<AnalyticsDomain, string | null> = {} as Record<AnalyticsDomain, string | null>;
    let totalCacheKeysInvalidated = 0;

    try {
      // Find relevant dependencies
      const relevantDependencies = this.filterDependencies.filter(
        dep => dep.sourceDomain === sourceDomain && dep.filterTypes.includes(filterType)
      );

      // Create filter change event
      const changeEvent: FilterChangeEvent = {
        domain: sourceDomain,
        filterType,
        oldValue,
        newValue,
        timestamp: Date.now(),
        affectedDomains: [],
      };

      // Process each dependency
      for (const dependency of relevantDependencies) {
        for (const targetDomain of dependency.targetDomains) {
          try {
            affectedDomains.push(targetDomain);
            changeEvent.affectedDomains.push(targetDomain);

            // Apply propagation based on type
            const keysInvalidated = await this.applyFilterPropagation(
              dependency,
              targetDomain,
              uiFilters
            );

            totalCacheKeysInvalidated += keysInvalidated;
            errors[targetDomain] = null;

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            errors[targetDomain] = errorMessage;
            console.error(`Filter propagation failed for domain ${targetDomain}:`, error);
          }
        }
      }

      // Notify listeners
      this.notifyFilterChangeListeners(changeEvent);

      const propagationTime = Date.now() - startTime;

      return {
        success: Object.values(errors).every(error => error === null),
        affectedDomains: [...new Set(affectedDomains)],
        cacheKeysInvalidated: totalCacheKeysInvalidated,
        errors,
        propagationTime,
      };

    } catch (error) {
      const propagationTime = Date.now() - startTime;
      console.error("Filter propagation error:", error);

      return {
        success: false,
        affectedDomains,
        cacheKeysInvalidated: totalCacheKeysInvalidated,
        errors: { [sourceDomain]: error instanceof Error ? error.message : "Unknown error" } as Record<AnalyticsDomain, string | null>,
        propagationTime,
      };
    }
  }

  /**
   * Apply filter propagation to a target domain.
   */
  private async applyFilterPropagation(
    dependency: FilterDependency,
    targetDomain: AnalyticsDomain,
    uiFilters: AnalyticsUIFilters
  ): Promise<number> {
    const _dataFilters = this.convertUIFiltersToDataFilters(uiFilters);

    switch (dependency.propagationType) {
      case "cascade":
        // Cascade filters to target domain (full refresh)
        return await this.cascadeFilters(targetDomain);

      case "invalidate":
        // Invalidate cache for target domain
        return await this.invalidateDomainCache(targetDomain, _dataFilters);

      case "refresh":
        // Refresh data for target domain
        return await this.refreshDomainData(targetDomain, _dataFilters);

      default:
        return 0;
    }
  }

  /**
   * Cascade filters to target domain.
   */
  private async cascadeFilters(
    targetDomain: AnalyticsDomain,
  ): Promise<number> {
    // Invalidate all cache for the domain since filters changed
    return await analyticsCache.invalidateDomain(targetDomain);
  }

  /**
   * Invalidate domain cache based on filters.
   */
  private async invalidateDomainCache(
    targetDomain: AnalyticsDomain,
    dataFilters: AnalyticsFilters
  ): Promise<number> {
    let totalInvalidated = 0;

    // Invalidate cache for specific entities if provided
    if (dataFilters.entityIds && dataFilters.entityIds.length > 0) {
      totalInvalidated += await analyticsCache.invalidateEntities(targetDomain, dataFilters.entityIds);
    } else {
      // Invalidate entire domain cache
      totalInvalidated += await analyticsCache.invalidateDomain(targetDomain);
    }

    return totalInvalidated;
  }

  /**
   * Refresh domain data.
   */
  private async refreshDomainData(
    targetDomain: AnalyticsDomain,
    dataFilters: AnalyticsFilters
  ): Promise<number> {
    // For now, just invalidate cache - in future tasks, this could trigger data refresh
    return await this.invalidateDomainCache(targetDomain, dataFilters);
  }

  /**
   * Get domains affected by filter changes.
   */
  getAffectedDomains(
    sourceDomain: AnalyticsDomain,
    filterType: keyof AnalyticsUIFilters
  ): AnalyticsDomain[] {
    const affectedDomains: AnalyticsDomain[] = [];

    this.filterDependencies.forEach(dependency => {
      if (dependency.sourceDomain === sourceDomain && dependency.filterTypes.includes(filterType)) {
        affectedDomains.push(...dependency.targetDomains);
      }
    });

    return [...new Set(affectedDomains)];
  }

  /**
   * Check if filter change affects other domains.
   */
  hasFilterDependencies(
    sourceDomain: AnalyticsDomain,
    filterType: keyof AnalyticsUIFilters
  ): boolean {
    return this.filterDependencies.some(
      dep => dep.sourceDomain === sourceDomain && dep.filterTypes.includes(filterType)
    );
  }

  /**
   * Add filter change listener.
   */
  addFilterChangeListener(listener: (event: FilterChangeEvent) => void): void {
    this.filterChangeListeners.push(listener);
  }

  /**
   * Remove filter change listener.
   */
  removeFilterChangeListener(listener: (event: FilterChangeEvent) => void): void {
    const index = this.filterChangeListeners.indexOf(listener);
    if (index > -1) {
      this.filterChangeListeners.splice(index, 1);
    }
  }

  /**
   * Notify all filter change listeners.
   */
  private notifyFilterChangeListeners(event: FilterChangeEvent): void {
    this.filterChangeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error("Filter change listener error:", error);
      }
    });
  }

  /**
   * Validate filter compatibility across domains.
   */
  validateFilterCompatibility(
    uiFilters: AnalyticsUIFilters
  ): { isValid: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check date range validity
    const dateRange = this.resolveDateRange(uiFilters.dateRange, uiFilters.customDateRange);
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    if (start > end) {
      errors.push("Start date must be before end date");
    }

    // Check for very large date ranges that might impact performance
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      warnings.push("Large date range may impact performance");
    }

    // Check granularity compatibility with date range
    if (daysDiff <= 7 && uiFilters.granularity === "month") {
      warnings.push("Monthly granularity not recommended for date ranges under 7 days");
    }

    if (daysDiff > 90 && uiFilters.granularity === "day") {
      warnings.push("Daily granularity may be too detailed for date ranges over 90 days");
    }

    // Check entity filter combinations
    const totalEntities = uiFilters.selectedCampaigns.length + 
                         uiFilters.selectedMailboxes.length + 
                         uiFilters.selectedDomains.length;

    if (totalEntities > 50) {
      warnings.push("Large number of selected entities may impact performance");
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Get filter propagation statistics.
   */
  getFilterPropagationStats(): {
    totalDependencies: number;
    dependenciesByDomain: Record<AnalyticsDomain, number>;
    propagationTypes: Record<string, number>;
    activeListeners: number;
  } {
    const dependenciesByDomain: Record<AnalyticsDomain, number> = {} as Record<AnalyticsDomain, number>;
    const propagationTypes: Record<string, number> = {};

    this.filterDependencies.forEach(dep => {
      // Count by source domain
      dependenciesByDomain[dep.sourceDomain] = (dependenciesByDomain[dep.sourceDomain] || 0) + 1;
      
      // Count by propagation type
      propagationTypes[dep.propagationType] = (propagationTypes[dep.propagationType] || 0) + 1;
    });

    return {
      totalDependencies: this.filterDependencies.length,
      dependenciesByDomain,
      propagationTypes,
      activeListeners: this.filterChangeListeners.length,
    };
  }

  /**
   * Reset filter dependencies (useful for testing).
   */
  resetFilterDependencies(): void {
    this.filterDependencies = [];
    this.filterChangeListeners = [];
    this.initializeFilterDependencies();
  }
}

// Export singleton instance
export const filterPropagationService = FilterPropagationService.getInstance();
