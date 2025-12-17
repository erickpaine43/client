'use server';

/**
 * Campaign Analytics Actions - Standardized Implementation
 * 
 * This module provides consistent campaign analytics actions using ConvexQueryHelper
 * for type safety and standardized error handling.
 */

import { api } from '@/convex/_generated/api';
import { createAnalyticsConvexHelper } from '@/lib/utils/convex-query-helper';
import { ConvexHttpClient } from 'convex/browser';
import { 
  createActionResult, 
  withConvexErrorHandling 
} from '../core/errors';
import { 
  withAuth, 
  withAuthAndCompany,
  withContextualRateLimit,
  RateLimits 
} from '../core/auth';
import type { ActionResult, ActionContext } from '../core/types';
import type {
  AnalyticsFilters,
  PerformanceMetrics,
  TimeSeriesDataPoint,
  AnalyticsComputeOptions,
} from '@/types/analytics/core';
import type {
  CampaignAnalytics,
  SequenceStepAnalytics,
  CampaignStatus,
} from '@/types/analytics/domain-specific';

// Initialize Convex client and helper
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const convexHelper = createAnalyticsConvexHelper(convex, 'CampaignAnalyticsActions');

/**
 * Campaign performance metrics response interface
 */
export interface CampaignPerformanceMetrics {
  campaignId: string;
  campaignName: string;
  status: CampaignStatus;
  performance: PerformanceMetrics;
  sequenceSteps: SequenceStepAnalytics[];
  updatedAt: number;
}

/**
 * Campaign analytics summary interface
 */
export interface CampaignAnalyticsSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalEmailsSent: number;
  overallPerformance: PerformanceMetrics;
  topPerformingCampaigns: Array<{
    campaignId: string;
    campaignName: string;
    openRate: number;
    clickRate: number;
    replyRate: number;
  }>;
}

/**
 * Get campaign performance metrics for specific campaigns
 */
export async function getCampaignPerformanceMetrics(
  campaignIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<CampaignPerformanceMetrics[]>> {
  return withContextualRateLimit(
    'campaign_performance_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const performanceData = await convexHelper.query(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Convex generated type for this function can cause deep instantiation
          api.campaignAnalytics.getCampaignPerformanceMetrics,
          {
            companyId: context.companyId,
            campaignIds,
            filters: filters || {}
          },
          {
            serviceName: 'CampaignAnalyticsActions',
            methodName: 'getCampaignPerformanceMetrics',
          }
        );

        return createActionResult(performanceData as CampaignPerformanceMetrics[]);
      });
    })
  );
}

/**
 * Get campaign analytics for all campaigns
 */
export async function getCampaignAnalytics(
  filters?: AnalyticsFilters,
  options?: AnalyticsComputeOptions
): Promise<ActionResult<CampaignAnalytics[]>> {
  return withContextualRateLimit(
    'campaign_analytics_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const analyticsData = await convexHelper.query(
          api.campaignAnalytics.getCampaignAnalytics,
          { 
            companyId: context.companyId,
            filters: filters || {},
            options: options || {}
          },
          {
            serviceName: 'CampaignAnalyticsActions',
            methodName: 'getCampaignAnalytics',
          }
        );

        return createActionResult(analyticsData as CampaignAnalytics[]);
      });
    })
  );
}

/**
 * Get campaign analytics summary
 */
export async function getCampaignAnalyticsSummary(
  filters?: AnalyticsFilters
): Promise<ActionResult<CampaignAnalyticsSummary>> {
  return withContextualRateLimit(
    'campaign_summary_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const summaryData = await convexHelper.query(
          api.campaignAnalytics.getCampaignAggregatedAnalytics,
          {
            companyId: context.companyId,
            filters: filters || {}
          },
          {
            serviceName: 'CampaignAnalyticsActions',
            methodName: 'getCampaignAnalyticsSummary',
          }
        );

        return createActionResult(summaryData as CampaignAnalyticsSummary);
      });
    })
  );
}

/**
 * Get sequence step analytics for a campaign
 */
export async function getSequenceStepAnalytics(
  campaignId: string,
  filters?: AnalyticsFilters
): Promise<ActionResult<SequenceStepAnalytics[]>> {
  return withContextualRateLimit(
    'sequence_analytics_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const sequenceData = await convexHelper.query(
          api.sequenceStepAnalytics.getSequenceStepAnalytics,
          {
            companyId: context.companyId,
            campaignIds: [campaignId],
            filters: filters || {}
          },
          {
            serviceName: 'CampaignAnalyticsActions',
            methodName: 'getSequenceStepAnalytics',
          }
        );

        return createActionResult(sequenceData as SequenceStepAnalytics[]);
      });
    })
  );
}

/**
 * Get campaign time series data
 */
export async function getCampaignTimeSeries(
  campaignIds?: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<TimeSeriesDataPoint[]>> {
  return withContextualRateLimit(
    'campaign_timeseries_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const timeSeriesData = await convexHelper.query(
          api.campaignAnalytics.getCampaignTimeSeriesAnalytics,
          {
            companyId: context.companyId,
            campaignIds: campaignIds || [],
            dateRange: filters?.dateRange,
            granularity: filters?.granularity === 'day' ? 'day' : filters?.granularity === 'week' ? 'week' : filters?.granularity === 'month' ? 'month' : 'day'
          },
          {
            serviceName: 'CampaignAnalyticsActions',
            methodName: 'getCampaignTimeSeries',
          }
        );

        return createActionResult(timeSeriesData as TimeSeriesDataPoint[]);
      });
    })
  );
}

/**
 * Update campaign analytics data (mutation)
 */
export async function updateCampaignAnalytics(
  campaignId: string,
  data: Partial<CampaignAnalytics>
): Promise<ActionResult<CampaignAnalytics>> {
  return withContextualRateLimit(
    'campaign_analytics_update',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const updatedData = await convexHelper.mutation(
          api.campaignAnalytics.upsertCampaignAnalytics,
          {
            companyId: context.companyId,
            campaignId,
            campaignName: data.campaignName || '', // Required field
            date: new Date().toISOString().split('T')[0], // Today's date
            sent: data.sent || 0,
            delivered: data.delivered || 0,
            openedTracked: data.opened_tracked || 0,
            clickedTracked: data.clicked_tracked || 0,
            replied: data.replied || 0,
            bounced: data.bounced || 0,
            unsubscribed: data.unsubscribed || 0,
            spamComplaints: data.spamComplaints || 0,
            status: data.status || 'ACTIVE',
            leadCount: data.leadCount || 0,
            activeLeads: data.activeLeads || 0,
            completedLeads: data.completedLeads || 0
          },
          {
            serviceName: 'CampaignAnalyticsActions',
            methodName: 'updateCampaignAnalytics',
          }
        );

        return createActionResult(updatedData as CampaignAnalytics);
      });
    })
  );
}

/**
 * Bulk update campaign analytics (mutation)
 */
export async function bulkUpdateCampaignAnalytics(
  updates: Array<{
    campaignId: string;
    data: Partial<CampaignAnalytics>;
  }>
): Promise<ActionResult<{ updated: number; failed: number; errors: string[] }>> {
  return withContextualRateLimit(
    'campaign_bulk_update',
    'company',
    RateLimits.BULK_OPERATION,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const bulkResult = await convexHelper.mutation(
          api.campaignAnalytics.batchUpsertCampaignAnalytics,
          {
            records: updates.map(update => ({
              campaignId: update.campaignId,
              campaignName: update.data.campaignName || '',
              date: new Date().toISOString().split('T')[0],
              companyId: context.companyId,
              sent: update.data.sent || 0,
              delivered: update.data.delivered || 0,
              openedTracked: update.data.opened_tracked || 0,
              clickedTracked: update.data.clicked_tracked || 0,
              replied: update.data.replied || 0,
              bounced: update.data.bounced || 0,
              unsubscribed: update.data.unsubscribed || 0,
              spamComplaints: update.data.spamComplaints || 0,
              status: update.data.status || 'ACTIVE',
              leadCount: update.data.leadCount || 0,
              activeLeads: update.data.activeLeads || 0,
              completedLeads: update.data.completedLeads || 0,
            }))
          },
          {
            serviceName: 'CampaignAnalyticsActions',
            methodName: 'bulkUpdateCampaignAnalytics',
          }
        );

        return createActionResult(bulkResult as { updated: number; failed: number; errors: string[] });
      });
    })
  );
}

/**
 * Export campaign analytics data
 */
export async function exportCampaignAnalytics(
  campaignIds?: string[],
  filters?: AnalyticsFilters,
  _format: 'csv' | 'json' = 'csv'
): Promise<ActionResult<{ downloadUrl: string; expiresAt: number }>> {
  return withContextualRateLimit(
    'campaign_analytics_export',
    'company',
    RateLimits.ANALYTICS_EXPORT,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Export functionality not yet implemented in Convex backend for campaign analytics
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
 * Get campaign analytics health check
 */
export async function getCampaignAnalyticsHealth(): Promise<ActionResult<{
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

      return createActionResult(healthData);
    });
  });
}

/**
 * Refresh campaign analytics cache
 */
export async function refreshCampaignAnalyticsCache(
  _campaignIds?: string[]
): Promise<ActionResult<{ refreshed: number; failed: number }>> {
  return withContextualRateLimit(
    'campaign_cache_refresh',
    'company',
    RateLimits.SENSITIVE_ACTION,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Refresh cache not implemented in Convex backend
        // Could be implemented by calling upsertCampaignAnalytics for each campaign
        const refreshResult = {
          refreshed: 0,
          failed: 0
        };

        return createActionResult(refreshResult);
      });
    })
  );
}
