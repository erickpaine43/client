'use server';

/**
 * Billing Analytics Actions - Standardized Implementation
 * 
 * This module provides consistent billing analytics actions using ConvexQueryHelper
 * for type safety and standardized error handling.
 */

import { api } from '@/convex/_generated/api';
import { createAnalyticsConvexHelper } from '@/lib/utils/convex-query-helper';
import { ConvexHttpClient } from 'convex/browser';
import {
  createActionResult,
  withConvexErrorHandling,
  ErrorFactory
} from '../core/errors';
import {
  withAuthAndCompany,
  withContextualRateLimit,
  RateLimits
} from '../core/auth';
import { withSecurity, SecurityConfigs } from '../core/auth-middleware';
import type { ActionResult, ActionContext } from '../core/types';
import type {
  AnalyticsFilters,
  PerformanceMetrics,
  TimeSeriesDataPoint,
} from '@/types/analytics/core';
import type { BillingAnalytics } from '@/types/analytics/domain-specific';
import type { CurrentUsageMetrics } from '../../../convex/billingAnalytics/types';

// Initialize Convex client and helper
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const convexHelper = createAnalyticsConvexHelper(convex, 'BillingAnalyticsActions');

/**
 * Usage metrics interface for billing analytics
 */
export interface UsageMetrics {
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  domainsLimit: number;
  mailboxesUsed: number;
  mailboxesLimit: number;
  usagePercentages: {
    emails: number;
    domains: number;
    mailboxes: number;
  };
}

/**
 * Cost analytics interface for billing tracking
 */
export interface CostAnalytics {
  totalCost: number;
  averageDailyCost: number;
  projectedMonthlyCost: number;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  currency: string;
  periodStart: string;
  periodEnd: string;
  trendPercentage: number;
}

/**
 * Plan utilization interface for billing analytics
 */
export interface PlanUtilization {
  planName: string;
  planType: 'free' | 'starter' | 'professional' | 'enterprise';
  utilizationPercentage: number;
  featuresUsed: string[];
  upgradeRecommendations: string[];
  nextBillingDate: string;
  daysUntilRenewal: number;
}

/**
 * Get current usage metrics for a company
 */
export async function getCurrentUsageMetrics(
  companyId?: string
): Promise<ActionResult<UsageMetrics>> {
  return withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
    const targetCompanyId = companyId || context.companyId;

    return withConvexErrorHandling(async () => {
      // Ensure company context exists

      if (!context.companyId) {

        return ErrorFactory.unauthorized('Company context required');

      }


      const usageData = await convexHelper.query(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Convex generated type for this function can cause deep instantiation
        api.billingAnalytics.getCurrentUsageMetrics,
        { companyId: targetCompanyId },
        {
          serviceName: 'BillingAnalyticsActions',
          methodName: 'getCurrentUsageMetrics',
        }
      );

      return createActionResult(usageData as UsageMetrics);
    });
  });
}

/**
 * Get billing analytics with performance metrics
 */
export async function getBillingAnalytics(
  filters?: AnalyticsFilters
): Promise<ActionResult<BillingAnalytics & { performance: PerformanceMetrics }>> {
  return withContextualRateLimit(
    'billing_analytics_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Ensure company context exists

        if (!_context.companyId) {

          return ErrorFactory.unauthorized('Company context required');

        }


        const analyticsData = await convexHelper.query(
          api.billingAnalytics.getBillingAnalytics,
          {
            companyId: _context.companyId,
            filters: filters || {}
          },
          {
            serviceName: 'BillingAnalyticsActions',
            methodName: 'getBillingAnalytics',
          }
        );

        return createActionResult(analyticsData as BillingAnalytics & { performance: PerformanceMetrics });
      });
    })
  );
}

/**
 * Get cost analytics for billing tracking
 */
export async function getCostAnalytics(
  filters?: AnalyticsFilters
): Promise<ActionResult<CostAnalytics>> {
  return withContextualRateLimit(
    'cost_analytics_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Ensure company context exists

        if (!_context.companyId) {

          return ErrorFactory.unauthorized('Company context required');

        }


        const costData = await convexHelper.query(
          api.billingAnalytics.getCostAnalytics,
          { 
            companyId: _context.companyId,
            filters: filters || {}
          },
          {
            serviceName: 'BillingAnalyticsActions',
            methodName: 'getCostAnalytics',
          }
        );

        return createActionResult(costData as CostAnalytics);
      });
    })
  );
}

/**
 * Get plan utilization metrics
 */
export async function getPlanUtilization(): Promise<ActionResult<PlanUtilization>> {
  return withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
    return withConvexErrorHandling(async () => {
      // Get current usage data to calculate plan utilization
      // Ensure company context exists

      if (!context.companyId) {

        return ErrorFactory.unauthorized('Company context required');

      }


      const currentUsage = await convexHelper.query(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Convex generated type for this function can cause deep instantiation
        api.billingAnalytics.getCurrentUsageMetrics,
        { companyId: context.companyId },
        {
          serviceName: 'BillingAnalyticsActions',
          methodName: 'getCurrentUsageMetrics',
        }
      );

      // Calculate utilization percentages
      const usageData = currentUsage as CurrentUsageMetrics;
      const emailsPercentage = usageData.usage.emailsRemaining > 0
        ? (usageData.usage.emailsSent / (usageData.usage.emailsSent + usageData.usage.emailsRemaining)) * 100
        : 0;
      const domainsPercentage = usageData.usage.domainsLimit > 0
        ? (usageData.usage.domainsUsed / usageData.usage.domainsLimit) * 100
        : 0;
      const mailboxesPercentage = usageData.usage.mailboxesLimit > 0
        ? (usageData.usage.mailboxesUsed / usageData.usage.mailboxesLimit) * 100
        : 0;

      const utilizationData: PlanUtilization = {
        planName: usageData.planType,
        planType: usageData.planType as 'free' | 'starter' | 'professional' | 'enterprise',
        utilizationPercentage: Math.max(emailsPercentage, domainsPercentage, mailboxesPercentage),
        featuresUsed: [], // Placeholder
        upgradeRecommendations: [], // Placeholder
        nextBillingDate: '', // Placeholder
        daysUntilRenewal: 30, // Placeholder
      };

      return createActionResult(utilizationData);
    });
  });
}

/**
 * Get billing time series data
 */
export async function getBillingTimeSeries(
  filters?: AnalyticsFilters
): Promise<ActionResult<TimeSeriesDataPoint[]>> {
  return withContextualRateLimit(
    'billing_timeseries_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Ensure company context exists

        if (!_context.companyId) {

          return ErrorFactory.unauthorized('Company context required');

        }


        const timeSeriesData = await convexHelper.query(
          api.billingAnalytics.getBillingTimeSeriesAnalytics,
          {
            companyId: _context.companyId,
            dateRange: { start: filters?.dateRange?.start || '', end: filters?.dateRange?.end || '' },
            granularity: filters?.granularity === 'day' ? 'day' : filters?.granularity === 'week' ? 'week' : filters?.granularity === 'month' ? 'month' : 'day'
          },
          {
            serviceName: 'BillingAnalyticsActions',
            methodName: 'getBillingTimeSeries',
          }
        );

        return createActionResult(timeSeriesData as TimeSeriesDataPoint[]);
      });
    })
  );
}

/**
 * Update billing analytics data (mutation)
 */
export async function updateBillingAnalytics(
  data: Partial<BillingAnalytics>
): Promise<ActionResult<BillingAnalytics>> {
  return withContextualRateLimit(
    'billing_analytics_update',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Ensure company context exists

        if (!_context.companyId) {

          return ErrorFactory.unauthorized('Company context required');

        }


        const updatedData = await convexHelper.mutation(
          api.billingAnalytics.upsertBillingAnalytics,
          {
            companyId: _context.companyId,
            date: new Date().toISOString().split('T')[0],
            planType: data.planType || 'starter',
            usage: {
              emailsSent: data.usage?.emailsSent || 0,
              emailsRemaining: data.usage?.emailsRemaining || 1000,
              domainsUsed: data.usage?.domainsUsed || 0,
              domainsLimit: data.usage?.domainsLimit || 1,
              mailboxesUsed: data.usage?.mailboxesUsed || 0,
              mailboxesLimit: data.usage?.mailboxesLimit || 1,
            },
            costs: {
              currentPeriod: data.costs?.currentPeriod || 0,
              projectedCost: data.costs?.projectedCost || 0,
              currency: data.costs?.currency || 'USD',
            },
          },
          {
            serviceName: 'BillingAnalyticsActions',
            methodName: 'updateBillingAnalytics',
          }
        );

        return createActionResult(updatedData as BillingAnalytics);
      });
    })
  );
}

/**
 * Export billing analytics data
 */
export async function exportBillingAnalytics(
  _filters?: AnalyticsFilters,
  _format: 'csv' | 'json' = 'csv'
): Promise<ActionResult<{ downloadUrl: string; expiresAt: number }>> {
  return withContextualRateLimit(
    'billing_analytics_export',
    'company',
    RateLimits.ANALYTICS_EXPORT,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Export functionality not yet implemented in Convex backend for billing analytics
        const exportData = {
          downloadUrl: '',
          expiresAt: Date.now() + 3600000 // 1 hour from now
        };

        return createActionResult(exportData);
      });
    })
  );
}

/**
 * Get billing analytics health check
 */
export async function getBillingAnalyticsHealth(): Promise<ActionResult<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastUpdated: number;
  dataFreshness: number;
  issues: string[];
}>> {
  return withSecurity(
    'health_check',
    SecurityConfigs.USER_READ,
    async () => {
    return withConvexErrorHandling(async () => {
      // Check ConvexQueryHelper health
      const helperHealthy = await convexHelper.healthCheck();
      
      if (!helperHealthy) {
        return createActionResult({
          status: 'unhealthy' as const,
          lastUpdated: Date.now(),
          dataFreshness: 0,
          issues: ['ConvexQueryHelper health check failed']
        });
      }

      // Simple health check without backend call since getHealthStatus doesn't exist
      const healthData = {
        status: 'healthy' as const,
        lastUpdated: Date.now(),
        dataFreshness: Date.now(),
        issues: []
      };

      return createActionResult(healthData);
    });
  });
}
