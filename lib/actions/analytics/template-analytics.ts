'use server';

/**
 * Template Analytics Actions - Standardized Implementation
 * 
 * This module provides consistent template analytics actions using ConvexQueryHelper
 * for type safety and standardized error handling.
 */

import { api } from '../../../convex/_generated/api';
import { createAnalyticsConvexHelper } from '../../utils/convex-query-helper';
import { ConvexHttpClient } from 'convex/browser';
import { 
  createActionResult, 
  withConvexErrorHandling,
  ErrorFactory
} from '../core/errors';
import { 
  withAuth, 
  withAuthAndCompany,
  withContextualRateLimit,
  RateLimits,
  withSecurity,
  SecurityConfigs
} from '../core/auth';
import {
  validateArray,
  validateString,
  validateId,
  validateSchema,
  validateAnalyticsFilters
} from '../core/validation';
import { templateAnalyticsSchema } from '../core/validation-schemas';
import type { ActionResult, ActionContext } from '../core/types';
import type {
  AnalyticsFilters,
  PerformanceMetrics,
  TimeSeriesDataPoint,
  CalculatedRates,
} from '../../../types/analytics/core';
import type { TemplateAnalytics } from '../../../types/analytics/domain-specific';

// Initialize Convex client and helper
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const convexHelper = createAnalyticsConvexHelper(convex, 'TemplateAnalyticsActions');

/**
 * Template performance analytics interface
 */
export interface TemplatePerformanceAnalytics {
  templates: TemplateAnalytics[];
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  formattedRates: {
    openRate: string;
    clickRate: string;
    replyRate: string;
    deliveryRate: string;
  };
  topPerformingTemplates: Array<{
    templateId: string;
    templateName: string;
    category: string;
    usage: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  }>;
}

/**
 * Template usage analytics interface
 */
export interface TemplateUsageAnalytics {
  templateId: string;
  templateName: string;
  category: string;
  totalUsage: number;
  uniqueUsers: number;
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    usage: number;
    performance: PerformanceMetrics;
  }>;
  usageTrend: TimeSeriesDataPoint[];
  lastUsed: string;
}

/**
 * Template comparison interface
 */
export interface TemplateComparison {
  templates: Array<{
    templateId: string;
    templateName: string;
    category: string;
    performance: PerformanceMetrics;
    rates: CalculatedRates;
    ranking: number;
    percentileRank: number;
    strengths: string[];
    improvements: string[];
  }>;
  winner: {
    templateId: string;
    templateName: string;
    winningMetric: string;
    advantage: number;
  };
  recommendations: string[];
}

/**
 * Get template performance analytics with calculated rates
 */
export async function getTemplatePerformanceAnalytics(
  templateIds?: string[]
): Promise<ActionResult<TemplatePerformanceAnalytics>> {
  return withSecurity(
    'get_template_performance_analytics',
    SecurityConfigs.ANALYTICS_READ,
    async (context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // Validate template IDs if provided
        if (templateIds) {
          const validationResult = validateArray(templateIds, 'templateIds', {
            maxLength: 100,
            itemValidator: (item, index) => validateString(item, `templateIds[${index}]`, { minLength: 1 })
          });
          
          if (!validationResult.isValid && validationResult.errors) {
            const firstError = validationResult.errors[0];
            return ErrorFactory.validation(
              firstError.message,
              firstError.field,
              firstError.code
            );
          }
        }

        // Ensure company context exists
        if (!context.companyId) {
          return ErrorFactory.unauthorized('Company context required');
        }

        const performanceData = await convexHelper.query(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Convex generated type for this function can cause deep instantiation
          api.templateAnalytics.getTemplatePerformanceMetrics,
          {
            companyId: context.companyId,
            templateIds: templateIds || []
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'getTemplatePerformanceAnalytics',
          }
        );

        return createActionResult(performanceData as TemplatePerformanceAnalytics);
      });
    }
  );
}

/**
 * Get template analytics for all templates
 */
export async function getTemplateAnalytics(
  filters?: AnalyticsFilters
): Promise<ActionResult<TemplateAnalytics[]>> {
  return withContextualRateLimit(
    'template_analytics_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate analytics filters if provided
        if (filters) {
          const validationResult = validateAnalyticsFilters(filters);
          if (!validationResult.isValid) {
            const firstError = validationResult.errors?.[0];
            return ErrorFactory.validation(
              firstError?.message || 'Invalid analytics filters',
              firstError?.field,
              firstError?.code
            );
          }
          filters = validationResult.data;
        }

        const analyticsData = await convexHelper.query(
          api.templateAnalytics.getTemplateAnalyticsOverview,
          {
            companyId: context.companyId,
            dateRange: filters?.dateRange
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'getTemplateAnalytics',
          }
        );

        return createActionResult(analyticsData as TemplateAnalytics[]);
      });
    })
  );
}

/**
 * Get template usage analytics
 */
export async function getTemplateUsageAnalytics(
  templateIds?: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<TemplateUsageAnalytics[]>> {
  return withContextualRateLimit(
    'template_usage_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const usageData = await convexHelper.query(
          api.templateAnalytics.getTemplateUsageAnalytics,
          { 
            companyId: context.companyId,
            templateIds: templateIds || [],
            filters: filters || {}
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'getTemplateUsageAnalytics',
          }
        );

        return createActionResult(usageData as TemplateUsageAnalytics[]);
      });
    })
  );
}

/**
 * Get template performance comparison
 */
export async function getTemplateComparison(
  templateIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<TemplateComparison>> {
  return withContextualRateLimit(
    'template_comparison_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const comparisonData = await convexHelper.query(
          api.templateAnalytics.getTemplateEffectivenessMetrics,
          {
            companyId: context.companyId,
            templateIds,
            dateRange: filters?.dateRange
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'getTemplateComparison',
          }
        );

        return createActionResult(comparisonData as TemplateComparison);
      });
    })
  );
}

/**
 * Get template analytics by category
 */
export async function getTemplateAnalyticsByCategory(
  category?: string,
  filters?: AnalyticsFilters
): Promise<ActionResult<Array<{
  category: string;
  templateCount: number;
  totalUsage: number;
  averagePerformance: PerformanceMetrics;
  averageRates: CalculatedRates;
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    usage: number;
    openRate: number;
  }>;
}>>> {
  return withContextualRateLimit(
    'template_category_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const categoryData = await convexHelper.query(
          api.templateAnalytics.getTemplateAnalyticsOverview,
          {
            companyId: context.companyId,
            dateRange: filters?.dateRange
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'getTemplateAnalyticsByCategory',
          }
        );

        return createActionResult(categoryData as Array<{
          category: string;
          templateCount: number;
          totalUsage: number;
          averagePerformance: PerformanceMetrics;
          averageRates: CalculatedRates;
          topTemplates: Array<{
            templateId: string;
            templateName: string;
            usage: number;
            openRate: number;
          }>;
        }>);
      });
    })
  );
}

/**
 * Get template time series data
 */
export async function getTemplateTimeSeries(
  templateIds?: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<TimeSeriesDataPoint[]>> {
  return withContextualRateLimit(
    'template_timeseries_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const timeSeriesData = await convexHelper.query(
          api.templateAnalytics.getTemplateTimeSeriesData,
          {
            companyId: context.companyId,
            templateIds: templateIds || [],
            dateRange: { start: filters?.dateRange?.start || '', end: filters?.dateRange?.end || '' },
            granularity: filters?.granularity === 'day' ? 'day' : filters?.granularity === 'week' ? 'week' : filters?.granularity === 'month' ? 'month' : undefined
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'getTemplateTimeSeries',
          }
        );

        return createActionResult(timeSeriesData as TimeSeriesDataPoint[]);
      });
    })
  );
}

/**
 * Update template analytics data (mutation)
 */
export async function updateTemplateAnalytics(
  templateId: string,
  data: Partial<TemplateAnalytics>
): Promise<ActionResult<TemplateAnalytics>> {
  return withSecurity(
    'update_template_analytics',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // Validate template ID
        const idResult = validateId(templateId, 'templateId');
        if (!idResult.isValid && idResult.errors) {
          const firstError = idResult.errors[0];
          return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
        }

        // Validate update data using template analytics schema
        const validationResult = validateSchema(data, templateAnalyticsSchema);
        if (!validationResult.isValid) {
          const firstError = validationResult.errors?.[0];
          return ErrorFactory.validation(
            firstError?.message || 'Invalid template analytics data',
            firstError?.field,
            firstError?.code
          );
        }

        // Ensure company context exists
        if (!context.companyId) {
          return ErrorFactory.unauthorized('Company context required');
        }

        const updatedData = await convexHelper.mutation(
          api.templateAnalytics.updateTemplateAnalytics,
          { 
            companyId: context.companyId,
            templateId,
            data: validationResult.data,
            updatedBy: context.userId,
            updatedAt: Date.now()
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'updateTemplateAnalytics',
          }
        );

        return createActionResult(updatedData as TemplateAnalytics);
      });
    }
  );
}

/**
 * Track template usage (mutation)
 */
export async function trackTemplateUsage(
  templateId: string,
  campaignId: string,
  usage: {
    sent: number;
    delivered?: number;
    opened?: number;
    clicked?: number;
    replied?: number;
  }
): Promise<ActionResult<{ success: boolean; updated: TemplateAnalytics }>> {
  return withContextualRateLimit(
    'template_usage_track',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const trackingResult = await convexHelper.mutation(
          api.templateAnalytics.updateTemplateAnalytics,
          {
            companyId: context.companyId,
            templateId,
            date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            sent: usage.sent,
            delivered: usage.delivered,
            opened_tracked: usage.opened,
            clicked_tracked: usage.clicked,
            replied: usage.replied,
            usage: 1 // Increment usage count
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'trackTemplateUsage',
          }
        );

        return createActionResult(trackingResult as { success: boolean; updated: TemplateAnalytics });
      });
    })
  );
}

/**
 * Bulk update template analytics (mutation)
 */
export async function bulkUpdateTemplateAnalytics(
  updates: Array<{
    templateId: string;
    data: Partial<TemplateAnalytics>;
  }>
): Promise<ActionResult<{ updated: number; failed: number; errors: string[] }>> {
  return withSecurity(
    'bulk_update_template_analytics',
    SecurityConfigs.BULK_OPERATION,
    async (context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // Ensure company context exists
        if (!context.companyId) {
          return ErrorFactory.unauthorized('Company context required');
        }

        const bulkResult = await convexHelper.mutation(
          api.templateAnalytics.batchUpdateTemplateAnalytics,
          {
            companyId: context.companyId,
            updates: updates.map(update => ({
              templateId: update.templateId,
              companyId: context.companyId,
              date: new Date().toISOString().split('T')[0], // Today's date
              sent: update.data.sent,
              delivered: update.data.delivered,
              opened_tracked: update.data.opened_tracked,
              clicked_tracked: update.data.clicked_tracked,
              replied: update.data.replied,
              bounced: update.data.bounced,
              unsubscribed: update.data.unsubscribed,
              spamComplaints: update.data.spamComplaints,
              usage: update.data.usage
            }))
          },
          {
            serviceName: 'TemplateAnalyticsActions',
            methodName: 'bulkUpdateTemplateAnalytics',
          }
        );

        return createActionResult(bulkResult as { updated: number; failed: number; errors: string[] });
      });
    }
  );
}

/**
 * Export template analytics data
 */
export async function exportTemplateAnalytics(
  _templateIds?: string[],
  _filters?: AnalyticsFilters,
  _format: 'csv' | 'json' = 'csv'
): Promise<ActionResult<{ downloadUrl: string; expiresAt: number }>> {
  return withContextualRateLimit(
    'template_analytics_export',
    'company',
    RateLimits.ANALYTICS_EXPORT,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Export functionality not yet implemented in Convex backend
        const exportData = {
          downloadUrl: '',
          expiresAt: Date.now() + 3600000 // 1 hour from now
        };

        return createActionResult(exportData as { downloadUrl: string; expiresAt: number });
      });
    })
  );
}

/**
 * Get template analytics health check
 */
export async function getTemplateAnalyticsHealth(): Promise<ActionResult<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastUpdated: number;
  dataFreshness: number;
  issues: string[];
}>> {
  return withAuth(async (_context: ActionContext) => {
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

      return createActionResult(healthData as {
        status: 'healthy' | 'degraded' | 'unhealthy';
        lastUpdated: number;
        dataFreshness: number;
        issues: string[];
      });
    });
  });
}
