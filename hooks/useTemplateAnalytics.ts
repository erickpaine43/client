import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  PerformanceMetrics,
  AnalyticsFilters,
  DataGranularity
} from "@/types/analytics/core";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { useMemo } from "react";
/**
 * Template Analytics React Hooks
 * 
 * Provides real-time template analytics data using Convex subscriptions.
 * Follows the same patterns as campaign and domain analytics hooks.
 */

/**
 * Hook for real-time template performance metrics.
 * Automatically updates when template analytics data changes in Convex.
 */
export function useTemplatePerformanceMetrics(
  templateIds?: string[],
  filters?: AnalyticsFilters,
  companyId?: string
) {
  const data = useQuery(
    api.templateAnalytics.getTemplatePerformanceMetrics,
    companyId ? {
      templateIds: templateIds || [],
      companyId,
      dateRange: filters?.dateRange,
    } : "skip"
  );

  const processedData = useMemo(() => {
    if (!data) return undefined;

    return data.map((template) => {
      const rates = AnalyticsCalculator.calculateAllRates(template.performance || template);
      const healthScore = AnalyticsCalculator.calculateHealthScore(template.performance || template);
      
      return {
        ...template,
        calculatedRates: rates,
        displayOpenRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        displayReplyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        displayClickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
        healthScore,
      };
    });
  }, [data]);

  return {
    data: processedData,
    isLoading: data === undefined,
    error: null, // Convex handles errors internally
  };
}

/**
 * Hook for real-time template time series data.
 * Used for template performance charts with live updates.
 */
export function useTemplateTimeSeriesData(
  templateIds?: string[],
  filters?: AnalyticsFilters,
  granularity: DataGranularity = "day",
  companyId?: string
) {
  const data = useQuery(
    api.templateAnalytics.getTemplateTimeSeriesData,
    companyId && filters?.dateRange ? {
      templateIds: templateIds || [],
      companyId,
      dateRange: filters.dateRange,
      granularity,
    } : "skip"
  );

  const processedData = useMemo(() => {
    if (!data) return undefined;

    return data.map((point) => ({
      ...point,
      calculatedRates: AnalyticsCalculator.calculateAllRates(point.metrics),
      displayOpenRate: AnalyticsCalculator.formatRateAsPercentage(
        AnalyticsCalculator.calculateOpenRate(point.metrics.opened_tracked, point.metrics.delivered)
      ),
      displayReplyRate: AnalyticsCalculator.formatRateAsPercentage(
        AnalyticsCalculator.calculateReplyRate(point.metrics.replied, point.metrics.delivered)
      ),
    }));
  }, [data]);

  return {
    data: processedData,
    isLoading: data === undefined,
    error: null,
  };
}

/**
 * Hook for real-time template usage analytics.
 * Shows most used templates and usage trends.
 */
export function useTemplateUsageAnalytics(
  filters?: AnalyticsFilters,
  limit: number = 10,
  companyId?: string
) {
  const data = useQuery(
    api.templateAnalytics.getTemplateUsageAnalytics,
    companyId ? {
      companyId,
      dateRange: filters?.dateRange,
      limit,
    } : "skip"
  );

  const processedData = useMemo(() => {
    if (!data) return undefined;

    const topTemplatesWithRates = data.topTemplates.map((template) => {
      const rates = AnalyticsCalculator.calculateAllRates(template.performance || template);
      const healthScore = AnalyticsCalculator.calculateHealthScore(template.performance || template);
      
      return {
        ...template,
        calculatedRates: rates,
        displayOpenRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        displayReplyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        healthScore,
      };
    });

    return {
      ...data,
      topTemplates: topTemplatesWithRates,
    };
  }, [data]);

  return {
    data: processedData,
    isLoading: data === undefined,
    error: null,
  };
}

/**
 * Hook for real-time template effectiveness metrics.
 * Compares template performance and ranks by effectiveness.
 */
export function useTemplateEffectivenessMetrics(
  templateIds: string[],
  filters?: AnalyticsFilters,
  companyId?: string
) {
  const data = useQuery(
    api.templateAnalytics.getTemplateEffectivenessMetrics,
    companyId && templateIds && templateIds.length > 0 ? {
      templateIds,
      companyId,
      dateRange: filters?.dateRange,
    } : "skip"
  );

  const processedData = useMemo(() => {
    if (!data) return undefined;

    return data.map((template) => {
      const performance = template.effectiveness?.performance || template;
      const rates = AnalyticsCalculator.calculateAllRates(performance);
      const healthScore = AnalyticsCalculator.calculateHealthScore(performance);
      
      return {
        ...template,
        effectiveness: {
          calculatedRates: rates,
          displayOpenRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
          displayReplyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
          displayClickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
          healthScore,
        },
      };
    });
  }, [data]);

  return {
    data: processedData,
    isLoading: data === undefined,
    error: null,
  };
}

/**
 * Hook for real-time template analytics overview.
 * Provides dashboard-level template metrics.
 */
export function useTemplateAnalyticsOverview(
  filters?: AnalyticsFilters,
  companyId?: string
) {
  const data = useQuery(
    api.templateAnalytics.getTemplateAnalyticsOverview,
    companyId ? {
      companyId,
      dateRange: filters?.dateRange,
    } : "skip"
  );

  const processedData = useMemo(() => {
    if (!data) return undefined;

    // Calculate rates for aggregated metrics
    const aggregatedRates = AnalyticsCalculator.calculateAllRates(data.aggregatedMetrics);
    const aggregatedHealthScore = AnalyticsCalculator.calculateHealthScore(data.aggregatedMetrics);

    // Process category breakdown
    const categoryBreakdownWithRates = data.categoryBreakdown.map((category) => {
      const performance = category.averagePerformance || category;
      const rates = AnalyticsCalculator.calculateAllRates(performance);
      const healthScore = AnalyticsCalculator.calculateHealthScore(performance);
      
      return {
        ...category,
        calculatedRates: rates,
        displayOpenRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        displayReplyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        healthScore,
      };
    });

    // Format top performing template
    const topPerformingTemplate = data.topPerformingTemplate ? {
      ...data.topPerformingTemplate,
      displayReplyRate: "0.0%", // Will be calculated from metrics if available
    } : null;

    return {
      ...data,
      calculatedRates: aggregatedRates,
      displayOpenRate: AnalyticsCalculator.formatRateAsPercentage(aggregatedRates.openRate),
      displayReplyRate: AnalyticsCalculator.formatRateAsPercentage(aggregatedRates.replyRate),
      healthScore: aggregatedHealthScore,
      topPerformingTemplate,
      categoryBreakdown: categoryBreakdownWithRates,
    };
  }, [data]);

  return {
    data: processedData,
    isLoading: data === undefined,
    error: null,
  };
}

/**
 * Comprehensive template analytics hook.
 * Combines multiple template analytics queries for dashboard usage.
 */
export function useComprehensiveTemplateAnalytics(
  templateIds?: string[],
  filters?: AnalyticsFilters,
  companyId?: string,
  options: {
    includeTimeSeriesData?: boolean;
    includeUsageData?: boolean;
    includeEffectivenessData?: boolean;
    granularity?: DataGranularity;
    usageLimit?: number;
  } = {}
) {
  const {
    includeTimeSeriesData = false,
    includeUsageData = false,
    includeEffectivenessData = false,
    granularity = "day",
    usageLimit = 10,
  } = options;

  // Performance metrics (always included)
  const performanceMetrics = useTemplatePerformanceMetrics(templateIds, filters, companyId);

  // Time series data (optional)
  const timeSeriesData = useTemplateTimeSeriesData(
    includeTimeSeriesData ? templateIds : undefined,
    includeTimeSeriesData ? filters : undefined,
    granularity,
    includeTimeSeriesData ? companyId : undefined
  );

  // Usage analytics (optional)
  const usageAnalytics = useTemplateUsageAnalytics(
    includeUsageData ? filters : undefined,
    usageLimit,
    includeUsageData ? companyId : undefined
  );

  // Effectiveness metrics (optional)
  const effectivenessMetrics = useTemplateEffectivenessMetrics(
    includeEffectivenessData && templateIds ? templateIds : [],
    includeEffectivenessData ? filters : undefined,
    includeEffectivenessData ? companyId : undefined
  );

  // Overview (always included)
  const overview = useTemplateAnalyticsOverview(filters, companyId);

  const isLoading = useMemo(() => {
    let loading = performanceMetrics.isLoading || overview.isLoading;
    
    if (includeTimeSeriesData) loading = loading || timeSeriesData.isLoading;
    if (includeUsageData) loading = loading || usageAnalytics.isLoading;
    if (includeEffectivenessData) loading = loading || effectivenessMetrics.isLoading;
    
    return loading;
  }, [
    performanceMetrics.isLoading,
    overview.isLoading,
    timeSeriesData.isLoading,
    usageAnalytics.isLoading,
    effectivenessMetrics.isLoading,
    includeTimeSeriesData,
    includeUsageData,
    includeEffectivenessData,
  ]);

  return {
    performanceMetrics: performanceMetrics.data,
    timeSeriesData: timeSeriesData.data,
    usageAnalytics: usageAnalytics.data,
    effectivenessMetrics: effectivenessMetrics.data,
    overview: overview.data,
    isLoading,
    error: null,
  };
}

/**
 * Hook for template analytics with optimistic updates.
 * Provides immediate UI feedback while syncing with server.
 */
export function useOptimisticTemplateAnalytics(
  templateIds?: string[],
  filters?: AnalyticsFilters,
  companyId?: string
) {
  const { data, isLoading, error } = useTemplatePerformanceMetrics(templateIds, filters, companyId);

  // In a full implementation, this would include optimistic update logic
  // For now, return the basic data with placeholder update function
  const updateWithOptimisticUI = async (
    templateId: string,
    updates: Partial<PerformanceMetrics>
  ) => {
    // Placeholder for optimistic update logic
    console.log("Optimistic update for template:", templateId, updates);
    
    // In real implementation:
    // 1. Update local state immediately
    // 2. Call server action to persist changes
    // 3. Handle rollback on error
  };

  return {
    data,
    isLoading,
    error,
    updateWithOptimisticUI,
  };
}

/**
 * Hook for template analytics mutations.
 * Provides functions to update template analytics data.
 */
export function useTemplateAnalyticsMutations() {
  // In a full implementation, this would use Convex mutations
  // For now, provide placeholder functions
  
  const updateTemplateAnalytics = async (data: {
    templateId: string;
    templateName: string;
    category?: string;
    companyId: string;
    date: string;
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    usage: number;
  }) => {
    // Placeholder for mutation logic
    console.log("Update template analytics:", data);
  };

  const batchUpdateTemplateAnalytics = async (
    updates: Array<{
      templateId: string;
      templateName: string;
      category?: string;
      companyId: string;
      date: string;
      sent: number;
      delivered: number;
      opened_tracked: number;
      clicked_tracked: number;
      replied: number;
      bounced: number;
      unsubscribed: number;
      spamComplaints: number;
      usage: number;
    }>
  ) => {
    // Placeholder for batch mutation logic
    console.log("Batch update template analytics:", updates.length, "updates");
  };

  return {
    updateTemplateAnalytics,
    batchUpdateTemplateAnalytics,
  };
}
