'use server';

/**
 * Mailbox Analytics Actions - Standardized Implementation
 * 
 * This module provides consistent mailbox analytics actions using ConvexQueryHelper
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
  CalculatedRates,
} from '@/types/analytics/core';
import type {
  MailboxAnalytics,
  WarmupStatus,
  DailyWarmupStats,
} from '@/types/analytics/domain-specific';

// Initialize Convex client and helper
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const convexHelper = createAnalyticsConvexHelper(convex, 'MailboxAnalyticsActions');

/**
 * Mailbox performance metrics interface
 */
export interface MailboxPerformanceMetrics {
  mailboxId: string;
  email: string;
  domain: string;
  provider: string;
  warmupStatus: WarmupStatus;
  warmupProgress: number;
  dailyLimit: number;
  currentVolume: number;
  healthScore: number;
  performance: PerformanceMetrics;
  rates: CalculatedRates;
  reputation: {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    factors: string[];
  };
}

/**
 * Mailbox analytics summary interface
 */
export interface MailboxAnalyticsSummary {
  totalMailboxes: number;
  activeMailboxes: number;
  warmingMailboxes: number;
  averageHealthScore: number;
  totalDailyLimit: number;
  currentDailyVolume: number;
  topPerformingMailboxes: Array<{
    mailboxId: string;
    email: string;
    healthScore: number;
    deliveryRate: number;
  }>;
  issuesFound: Array<{
    mailboxId: string;
    email: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Warmup analytics interface
 */
export interface WarmupAnalytics {
  mailboxId: string;
  email: string;
  warmupStatus: WarmupStatus;
  startDate: string;
  currentDay: number;
  totalDays: number;
  progress: number;
  dailyStats: DailyWarmupStats[];
  projectedCompletion: string;
  recommendations: string[];
}

/**
 * Get mailbox performance metrics for specific mailboxes
 */
export async function getMailboxPerformanceMetrics(
  mailboxIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<MailboxPerformanceMetrics[]>> {
  return withContextualRateLimit(
    'mailbox_performance_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const performanceData = await convexHelper.query(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - Convex generated type for this function can cause deep instantiation
          api.mailboxAnalytics.getMailboxPerformanceMetrics,
          { 
            companyId: context.companyId,
            mailboxIds,
            filters: filters || {}
          },
          {
            serviceName: 'MailboxAnalyticsActions',
            methodName: 'getMailboxPerformanceMetrics',
          }
        );

        return createActionResult(performanceData as MailboxPerformanceMetrics[]);
      });
    })
  );
}

/**
 * Get mailbox analytics for all mailboxes
 */
export async function getMailboxAnalytics(
  filters?: AnalyticsFilters
): Promise<ActionResult<MailboxAnalytics[]>> {
  return withContextualRateLimit(
    'mailbox_analytics_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const analyticsData = await convexHelper.query(
          api.mailboxAnalytics.getMailboxAnalytics,
          { 
            companyId: context.companyId,
            filters: filters || {}
          },
          {
            serviceName: 'MailboxAnalyticsActions',
            methodName: 'getMailboxAnalytics',
          }
        );

        return createActionResult(analyticsData as MailboxAnalytics[]);
      });
    })
  );
}

/**
 * Get mailbox analytics summary
 */
export async function getMailboxAnalyticsSummary(
  filters?: AnalyticsFilters
): Promise<ActionResult<MailboxAnalyticsSummary>> {
  return withContextualRateLimit(
    'mailbox_summary_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const summaryData = await convexHelper.query(
          api.mailboxAnalytics.getMailboxAggregatedAnalytics,
          {
            companyId: context.companyId,
            dateRange: filters?.dateRange
          },
          {
            serviceName: 'MailboxAnalyticsActions',
            methodName: 'getMailboxAnalyticsSummary',
          }
        );

        return createActionResult(summaryData as MailboxAnalyticsSummary);
      });
    })
  );
}

/**
 * Get warmup analytics for mailboxes
 */
export async function getWarmupAnalytics(
  mailboxIds?: string[]
): Promise<ActionResult<WarmupAnalytics[]>> {
  return withContextualRateLimit(
    'warmup_analytics_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const warmupData = await convexHelper.query(
          api.mailboxAnalytics.getWarmupAnalytics,
          { 
            companyId: context.companyId,
            mailboxIds: mailboxIds || []
          },
          {
            serviceName: 'MailboxAnalyticsActions',
            methodName: 'getWarmupAnalytics',
          }
        );

        return createActionResult(warmupData as WarmupAnalytics[]);
      });
    })
  );
}

/**
 * Get mailbox health scores
 */
export async function getMailboxHealthScores(
  mailboxIds?: string[]
): Promise<ActionResult<Array<{
  mailboxId: string;
  email: string;
  healthScore: number;
  factors: Array<{
    factor: string;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
    recommendation?: string;
  }>;
  trend: 'improving' | 'declining' | 'stable';
}>>> {
  return withContextualRateLimit(
    'mailbox_health_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const healthData = await convexHelper.query(
          api.mailboxAnalytics.getMailboxHealthMetrics,
          {
            companyId: context.companyId,
            mailboxIds: mailboxIds || []
          },
          {
            serviceName: 'MailboxAnalyticsActions',
            methodName: 'getMailboxHealthScores',
          }
        );

        return createActionResult(healthData as Array<{
          mailboxId: string;
          email: string;
          healthScore: number;
          factors: Array<{
            factor: string;
            score: number;
            impact: 'positive' | 'negative' | 'neutral';
            recommendation?: string;
          }>;
          trend: 'improving' | 'declining' | 'stable';
        }>);
      });
    })
  );
}

/**
 * Get mailbox time series data
 */
export async function getMailboxTimeSeries(
  mailboxIds?: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<TimeSeriesDataPoint[]>> {
  return withContextualRateLimit(
    'mailbox_timeseries_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const timeSeriesData = await convexHelper.query(
          api.mailboxAnalytics.getMailboxTimeSeriesAnalytics,
          {
            companyId: context.companyId,
            mailboxIds: mailboxIds || [],
            dateRange: { start: filters?.dateRange?.start || '', end: filters?.dateRange?.end || '' },
            granularity: filters?.granularity === 'day' ? 'day' : filters?.granularity === 'week' ? 'week' : filters?.granularity === 'month' ? 'month' : undefined
          },
          {
            serviceName: 'MailboxAnalyticsActions',
            methodName: 'getMailboxTimeSeries',
          }
        );

        return createActionResult(timeSeriesData as TimeSeriesDataPoint[]);
      });
    })
  );
}

/**
 * Update mailbox analytics data (mutation)
 */
export async function updateMailboxAnalytics(
  mailboxId: string,
  data: Partial<MailboxAnalytics>
): Promise<ActionResult<MailboxAnalytics>> {
  return withContextualRateLimit(
    'mailbox_analytics_update',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const updatedData = await convexHelper.mutation(
          api.mailboxAnalytics.upsertMailboxAnalytics,
          {
            companyId: context.companyId,
            mailboxId,
            date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            sent: data.sent,
            delivered: data.delivered,
            opened_tracked: data.opened_tracked,
            clicked_tracked: data.clicked_tracked,
            replied: data.replied,
            bounced: data.bounced,
            unsubscribed: data.unsubscribed,
            spamComplaints: data.spamComplaints,
            warmupStatus: data.warmupStatus,
            healthScore: data.healthScore,
            currentVolume: data.currentVolume
          },
          {
            serviceName: 'MailboxAnalyticsActions',
            methodName: 'updateMailboxAnalytics',
          }
        );

        return createActionResult(updatedData as MailboxAnalytics);
      });
    })
  );
}

/**
 * Update warmup progress (mutation)
 */
export async function updateWarmupProgress(
  mailboxId: string,
  dailyStats: DailyWarmupStats
): Promise<ActionResult<WarmupAnalytics>> {
  return withContextualRateLimit(
    'warmup_progress_update',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const updatedWarmup = await convexHelper.mutation(
          api.mailboxAnalytics.upsertWarmupAnalytics,
          {
            companyId: context.companyId,
            mailboxId,
            date: dailyStats.date,
            dailyVolume: dailyStats.emailsWarmed,
            dailyDelivered: dailyStats.delivered,
            dailySpam: dailyStats.spamComplaints,
            dailyReplied: dailyStats.replies,
            dailyBounced: dailyStats.bounced,
            warmupDay: 0, // Will need to calculate this based on warmup start date
            warmupStatus: 'WARMING' as const // Default status
          },
          {
            serviceName: 'MailboxAnalyticsActions',
            methodName: 'updateWarmupProgress',
          }
        );

        return createActionResult(updatedWarmup as WarmupAnalytics);
      });
    })
  );
}

/**
 * Refresh mailbox health scores
 */
export async function refreshMailboxHealthScores(
  _mailboxIds?: string[]
): Promise<ActionResult<{ updated: number; failed: number; errors: string[] }>> {
  return withContextualRateLimit(
    'mailbox_health_refresh',
    'company',
    RateLimits.SENSITIVE_ACTION,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Refresh health scores not implemented in Convex backend
        // Could be implemented by calling upsertMailboxAnalytics for each mailbox
        const refreshResult = {
          updated: 0,
          failed: 0,
          errors: ['Health score refresh not yet implemented']
        };

        return createActionResult(refreshResult as { updated: number; failed: number; errors: string[] });
      });
    })
  );
}

/**
 * Export mailbox analytics data
 */
export async function exportMailboxAnalytics(
  _mailboxIds?: string[],
  _filters?: AnalyticsFilters,
  _format: 'csv' | 'json' = 'csv'
): Promise<ActionResult<{ downloadUrl: string; expiresAt: number }>> {
  return withContextualRateLimit(
    'mailbox_analytics_export',
    'company',
    RateLimits.ANALYTICS_EXPORT,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Export functionality not yet implemented in Convex backend for mailbox analytics
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
 * Get mailbox analytics health check
 */
export async function getMailboxAnalyticsHealth(): Promise<ActionResult<{
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
