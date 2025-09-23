// ============================================================================
// BILLING ANALYTICS HOOKS - Real-time React hooks for billing analytics
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  AnalyticsFilters, 
  DataGranularity 
} from "@/types/analytics/core";
import {
  getCurrentUsageMetrics,
  getPlanUtilization,
  updateBillingAnalytics,
  type UsageMetrics,
  type CostAnalytics
} from "@/lib/actions/analytics/billing-analytics";
import type { TimeSeriesDataPoint } from "@/types/analytics/core";

export interface UsageLimitAlert {
  type: 'warning' | 'critical';
  message: string;
  threshold: number;
  current: number;
  resource: 'emails' | 'domains' | 'mailboxes';
}


/**
 * Hook for real-time usage metrics monitoring.
 */
export function useUsageMetrics(companyId: string) {
  // Real-time Convex subscription for current usage
  const convexUsage = useConvexQuery(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    api.billingAnalytics.getCurrentUsageMetrics,
    companyId ? { companyId } : "skip"
  );

  // Fallback to action for additional processing
  const { data: serviceUsage, isLoading: serviceLoading } = useQuery({
    queryKey: ["billing", "usage", companyId],
    queryFn: async () => {
      const result = await getCurrentUsageMetrics(companyId);
      return result.success ? result.data : null;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Combine real-time data with service processing
  const data = useMemo(() => {
    if (convexUsage && typeof convexUsage === 'object' && 'usage' in convexUsage) {
      // Calculate usage percentages from real-time data
      const usage = convexUsage.usage as {
        emailsSent: number;
        emailsRemaining: number;
        domainsUsed: number;
        domainsLimit: number;
        mailboxesUsed: number;
        mailboxesLimit: number;
      };
      const emailsPercentage = usage.emailsRemaining === -1 
        ? 0 // Unlimited
        : Math.round((usage.emailsSent / (usage.emailsSent + usage.emailsRemaining)) * 100);
      
      const domainsPercentage = usage.domainsLimit === 0 
        ? 0 // Unlimited
        : Math.round((usage.domainsUsed / usage.domainsLimit) * 100);
      
      const mailboxesPercentage = usage.mailboxesLimit === 0 
        ? 0 // Unlimited
        : Math.round((usage.mailboxesUsed / usage.mailboxesLimit) * 100);

      return {
        ...usage,
        usagePercentages: {
          emails: emailsPercentage,
          domains: domainsPercentage,
          mailboxes: mailboxesPercentage,
        },
      } as UsageMetrics;
    }
    return serviceUsage;
  }, [convexUsage, serviceUsage]);

  const isLoading = convexUsage === undefined || serviceLoading;

  return {
    data,
    isLoading,
    error: null, // Convex errors are handled differently
    isRealTime: convexUsage !== undefined && typeof convexUsage === 'object',
  };
}

/**
 * Hook for real-time usage limit alerts.
 */
export function useUsageLimitAlerts(
  companyId: string,
  thresholds?: {
    emailsWarning?: number;
    emailsCritical?: number;
    domainsWarning?: number;
    mailboxesWarning?: number;
  }
) {
  // Real-time alerts from Convex
  const convexAlerts = useConvexQuery(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    api.billingAnalytics.getUsageLimitAlerts,
    companyId ? { companyId, thresholds } : "skip"
  );

  // Transform Convex data to expected format
  const data = useMemo(() => {
    if (convexAlerts && typeof convexAlerts === 'object') {
      // Transform Convex alerts to expected format
      const alerts = convexAlerts;
      return {
        alerts: alerts.alerts?.map((alert) => ({
          type: alert.type,
          message: alert.message,
          threshold: alert.limit || 0,
          current: alert.usage || 0,
          resource: alert.resource as 'emails' | 'domains' | 'mailboxes',
        })) || [],
        totalAlerts: alerts.totalAlerts || 0,
        criticalAlerts: alerts.criticalAlerts || 0,
        warningAlerts: alerts.warningAlerts || 0,
      };
    }
    return null;
  }, [convexAlerts]);

  return {
    data,
    isLoading: convexAlerts === undefined,
    error: null, // Convex errors are handled differently
    isRealTime: convexAlerts !== undefined && typeof convexAlerts === 'object',
  };
}

/**
 * Hook for cost analytics and projections.
 */
export function useCostAnalytics(
  companyId: string,
  filters?: AnalyticsFilters
) {
  const effectiveFilters = useMemo(() => {
    if (filters) return filters;
    
    // Default to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    return {
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
    };
  }, [filters]);

  // Real-time cost data from Convex
  const convexCosts = useConvexQuery(
    api.billingAnalytics.getCostAnalytics,
    companyId && effectiveFilters.dateRange ? { companyId, dateRange: effectiveFilters.dateRange } : "skip"
  );

  const data = useMemo(() => {
    if (convexCosts && typeof convexCosts === 'object') {
      return convexCosts as CostAnalytics;
    }
    return null;
  }, [convexCosts]);

  return {
    data,
    isLoading: convexCosts === undefined,
    error: null, // Convex errors are handled differently
    isRealTime: convexCosts !== undefined && typeof convexCosts === 'object',
  };
}

/**
 * Hook for plan utilization data.
 */
export function usePlanUtilization(companyId: string) {
  const { data: serviceData, isLoading } = useQuery({
    queryKey: ["billing", "utilization", companyId],
    queryFn: async () => {
      const result = await getPlanUtilization();
      return result.success ? result.data : null;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return {
    data: serviceData,
    isLoading,
    isRealTime: false, // Service-based, not real-time
  };
}

/**
 * Hook for billing analytics time series data.
 */
export function useBillingTimeSeriesData(
  companyId: string,
  filters?: AnalyticsFilters,
  granularity: DataGranularity = "day"
) {
  const effectiveFilters = useMemo(() => {
    if (filters) return filters;
    
    // Default to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    return {
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
    };
  }, [filters]);

  // Real-time time series data from Convex
  const convexTimeSeries = useConvexQuery(
    api.billingAnalytics.getBillingTimeSeriesAnalytics,
    companyId && effectiveFilters.dateRange ? { 
      companyId, 
      dateRange: effectiveFilters.dateRange,
      granularity 
    } : "skip"
  );

  const data = useMemo(() => {
    if (convexTimeSeries && Array.isArray(convexTimeSeries)) {
      // Transform Convex time series to expected format
      return convexTimeSeries.map((point) => ({
        date: point.date,
        label: point.label,
        metrics: point.usage ? {
          sent: point.usage.emailsSent,
          delivered: point.usage.emailsSent, // For billing, assume sent = delivered
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        } : {
          sent: 0,
          delivered: 0,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        },
      })) as TimeSeriesDataPoint[];
    }
    return null;
  }, [convexTimeSeries]);

  return {
    data,
    isLoading: convexTimeSeries === undefined,
    error: null, // Convex errors are handled differently
    isRealTime: convexTimeSeries !== undefined && Array.isArray(convexTimeSeries),
  };
}

/**
 * Hook for comprehensive billing analytics dashboard.
 */
export function useBillingAnalyticsDashboard(
  companyId: string,
  filters?: AnalyticsFilters
) {
  const usageMetrics = useUsageMetrics(companyId);
  const limitAlerts = useUsageLimitAlerts(companyId);
  const costAnalytics = useCostAnalytics(companyId, filters);
  const planUtilization = usePlanUtilization(companyId);
  const timeSeriesData = useBillingTimeSeriesData(companyId, filters);

  const isLoading = useMemo(() => {
    return (
      usageMetrics.isLoading ||
      limitAlerts.isLoading ||
      costAnalytics.isLoading ||
      planUtilization.isLoading ||
      timeSeriesData.isLoading
    );
  }, [
    usageMetrics.isLoading,
    limitAlerts.isLoading,
    costAnalytics.isLoading,
    planUtilization.isLoading,
    timeSeriesData.isLoading,
  ]);

  const hasErrors = useMemo(() => {
    return !!(
      usageMetrics.error ||
      limitAlerts.error ||
      costAnalytics.error ||
      timeSeriesData.error
    );
  }, [
    usageMetrics.error,
    limitAlerts.error,
    costAnalytics.error,
    timeSeriesData.error,
  ]);

  // Calculate dashboard summary
  const summary = useMemo(() => {
    if (!usageMetrics.data || !limitAlerts.data || !costAnalytics.data) {
      return null;
    }

    const overallUsage = Math.max(
      usageMetrics.data.usagePercentages.emails,
      usageMetrics.data.usagePercentages.domains,
      usageMetrics.data.usagePercentages.mailboxes
    );

    return {
      overallUsage,
      totalAlerts: limitAlerts.data.totalAlerts,
      criticalAlerts: limitAlerts.data.criticalAlerts,
      projectedCost: costAnalytics.data.projectedMonthlyCost,
      costTrend: costAnalytics.data.costTrend,
      currency: costAnalytics.data.currency,
      isOverLimit: overallUsage >= 100,
      needsAttention: limitAlerts.data.criticalAlerts > 0 || overallUsage > 90,
    };
  }, [usageMetrics.data, limitAlerts.data, costAnalytics.data]);

  return {
    usageMetrics: usageMetrics.data,
    limitAlerts: limitAlerts.data,
    costAnalytics: costAnalytics.data,
    planUtilization: planUtilization.data,
    timeSeriesData: timeSeriesData.data,
    summary,
    isLoading,
    hasErrors,
    isRealTime: usageMetrics.isRealTime || limitAlerts.isRealTime || costAnalytics.isRealTime,
  };
}

/**
 * Hook for billing analytics mutations (updates).
 */
export function useBillingAnalyticsMutations(companyId: string) {
  const queryClient = useQueryClient();
  // Update billing analytics
  const updateAnalytics = useMutation({
    mutationFn: async (data: {
      planType?: string;
      usage?: {
        emailsSent: number;
        emailsRemaining: number;
        domainsUsed: number;
        domainsLimit: number;
        mailboxesUsed: number;
        mailboxesLimit: number;
      };
      costs?: {
        currentPeriod: number;
        projectedCost: number;
        currency: string;
      };
    }) => {
      const result = await updateBillingAnalytics(data);
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update billing analytics');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["billing", companyId] });
    },
  });

  // Initialize billing analytics
  const initializeAnalytics = useMutation({
    mutationFn: async (data: {
      planType: string;
      planLimits: {
        emailsLimit: number;
        domainsLimit: number;
        mailboxesLimit: number;
      };
      currency?: string;
    }) => {
      const result = await updateBillingAnalytics({
        planType: data.planType,
        usage: {
          emailsSent: 0,
          emailsRemaining: data.planLimits.emailsLimit,
          domainsUsed: 0,
          domainsLimit: data.planLimits.domainsLimit,
          mailboxesUsed: 0,
          mailboxesLimit: data.planLimits.mailboxesLimit,
        },
        costs: {
          currentPeriod: 0,
          projectedCost: 0,
          currency: data.currency || 'USD',
        },
      });
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to initialize billing analytics');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", companyId] });
    },
  });

  return {
    updateAnalytics,
    initializeAnalytics,
  };
}

/**
 * Hook for optimistic billing analytics updates.
 */
export function useOptimisticBillingAnalytics(companyId: string) {
  const queryClient = useQueryClient();
  const { updateAnalytics } = useBillingAnalyticsMutations(companyId);

  const updateWithOptimisticUI = useCallback(async (
    updates: {
      usage?: Partial<{
        emailsSent: number;
        emailsRemaining: number;
        domainsUsed: number;
        mailboxesUsed: number;
      }>;
      costs?: Partial<{
        currentPeriod: number;
        projectedCost: number;
      }>;
    }
  ) => {
    // Optimistically update the UI
    queryClient.setQueryData(
      ["billing", "usage", companyId],
      (oldData: UsageMetrics | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          ...updates.usage,
          usagePercentages: {
            ...oldData.usagePercentages,
            // Recalculate percentages if usage changed
            ...(updates.usage?.emailsSent && {
              emails: Math.round((updates.usage.emailsSent / (updates.usage.emailsSent + oldData.emailsRemaining)) * 100)
            }),
          },
        };
      }
    );

    // Perform the actual update
    try {
      const updateData: Record<string, unknown> = {
        planType: "current", // This should come from current plan data
      };

      if (updates.usage) {
        const usage: Record<string, number> = {};
        if (updates.usage.emailsSent !== undefined) usage.emailsSent = updates.usage.emailsSent;
        if (updates.usage.emailsRemaining !== undefined) usage.emailsRemaining = updates.usage.emailsRemaining;
        if (updates.usage.domainsUsed !== undefined) usage.domainsUsed = updates.usage.domainsUsed;
        if (updates.usage.mailboxesUsed !== undefined) usage.mailboxesUsed = updates.usage.mailboxesUsed;
        if (Object.keys(usage).length > 0) updateData.usage = usage;
      }

      if (updates.costs) {
        const costs: Record<string, unknown> = { currency: "USD" };
        if (updates.costs.currentPeriod !== undefined) costs.currentPeriod = updates.costs.currentPeriod;
        if (updates.costs.projectedCost !== undefined) costs.projectedCost = updates.costs.projectedCost;
        if (Object.keys(costs).length > 1) updateData.costs = costs;
      }

      await updateAnalytics.mutateAsync(updateData);
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ["billing", "usage", companyId] });
      throw error;
    }
  }, [companyId, queryClient, updateAnalytics]);

  return {
    updateWithOptimisticUI,
    isUpdating: updateAnalytics.isPending,
  };
}

/**
 * Hook for usage recommendations based on current metrics.
 */
export function useUsageRecommendations(companyId: string) {
  const { data: usageMetrics } = useUsageMetrics(companyId);
  const { data: limitAlerts } = useUsageLimitAlerts(companyId);

  const recommendations = useMemo(() => {
    if (!usageMetrics || !limitAlerts) {
      return {
        recommendations: [],
        urgentActions: [],
        planSuggestions: [],
      };
    }

    const recommendations: string[] = [];
    const urgentActions: string[] = [];
    const planSuggestions: string[] = [];

    // Check email usage
    if (usageMetrics.usagePercentages.emails > 90) {
      urgentActions.push("Email quota is critically low - consider upgrading immediately");
    } else if (usageMetrics.usagePercentages.emails > 75) {
      recommendations.push("Email usage is high - monitor closely or upgrade plan");
    }

    // Check domain usage
    if (usageMetrics.usagePercentages.domains > 90) {
      urgentActions.push("Domain limit nearly reached - upgrade plan or remove unused domains");
    } else if (usageMetrics.usagePercentages.domains > 75) {
      recommendations.push("Domain usage is high - consider upgrading for more domains");
    }

    // Check mailbox usage
    if (usageMetrics.usagePercentages.mailboxes > 90) {
      urgentActions.push("Mailbox limit nearly reached - upgrade plan or remove unused mailboxes");
    } else if (usageMetrics.usagePercentages.mailboxes > 75) {
      recommendations.push("Mailbox usage is high - consider upgrading for more mailboxes");
    }

    // Plan suggestions based on overall usage
    const overallUsage = Math.max(
      usageMetrics.usagePercentages.emails,
      usageMetrics.usagePercentages.domains,
      usageMetrics.usagePercentages.mailboxes
    );

    if (overallUsage > 80) {
      planSuggestions.push("Consider upgrading to a higher-tier plan for better resource allocation");
    } else if (overallUsage < 30) {
      planSuggestions.push("Your current usage is low - you might benefit from a lower-tier plan");
    }

    // Add critical alert messages
    limitAlerts.alerts.forEach((alert: UsageLimitAlert) => {
      if (alert.type === "critical") {
        urgentActions.push(alert.message);
      }
    });

    return {
      recommendations,
      urgentActions,
      planSuggestions,
    };
  }, [usageMetrics, limitAlerts]);

  return recommendations;
}
