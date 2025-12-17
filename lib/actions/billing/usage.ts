"use server";

/**
 * Usage metrics and tracking actions
 * 
 * This module handles usage metrics retrieval, calculations,
 * and usage-related operations.
 */

import { ActionResult } from '../core/types';
import { ErrorFactory, withErrorHandling } from '../core/errors';
import { withAuth, withContextualRateLimit, RateLimits } from '../core/auth';
import { 
  mockUsageMetrics, 
  type UsageMetrics,
  getDaysUntilRenewal 
} from '../../data/billing.mock';
import {
  calculateUsagePercentages,
  calculateOverage,
  projectMonthlyUsage,
} from '../../utils/billingUtils';

/**
 * Get usage metrics for the authenticated user
 */
export async function getUsageMetrics(): Promise<ActionResult<UsageMetrics>> {
  return await withContextualRateLimit(
    'billing:usage:metrics',
    'user',
    RateLimits.ANALYTICS_QUERY,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Simulate database fetch
          await new Promise(resolve => setTimeout(resolve, 100));

          // In production, fetch from database
          // const usage = await db.usageMetrics.findUnique({
          //   where: { userId: context.userId }
          // });

          return {
            success: true,
            data: mockUsageMetrics,
          };
        });
      });
    }
  );
}

/**
 * Get usage metrics with calculations
 */
export async function getUsageWithCalculations(): Promise<ActionResult<{
  usage: UsageMetrics;
  percentages: ReturnType<typeof calculateUsagePercentages>;
  overage: ReturnType<typeof calculateOverage>;
  projection: UsageMetrics;
  daysUntilReset: number;
}>> {
  return await withContextualRateLimit(
    'billing:usage:calculations',
    'user',
    RateLimits.ANALYTICS_QUERY,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          const usageResult = await getUsageMetrics();
          if (!usageResult.success || !usageResult.data) {
            return ErrorFactory.internal('Failed to get usage metrics');
          }

          const usage = usageResult.data;
          const percentages = calculateUsagePercentages(usage);
          const overage = calculateOverage(usage);
          const projection = projectMonthlyUsage(usage);
          const daysUntilReset = getDaysUntilRenewal(usage.resetDate);

          return {
            success: true,
            data: {
              usage,
              percentages,
              overage,
              projection,
              daysUntilReset,
            },
          };
        });
      });
    }
  );
}

/**
 * Get usage history for a specific metric
 */
export async function getUsageHistory(
  metric: keyof Pick<UsageMetrics, 'emailsSent' | 'contactsReached' | 'storageUsed'>,
  days: number = 30
): Promise<ActionResult<Array<{ date: string; value: number }>>> {
  return await withContextualRateLimit(
    'billing:usage:history',
    'user',
    RateLimits.ANALYTICS_QUERY,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Validate metric
          const validMetrics = ['emailsSent', 'contactsReached', 'storageUsed'];
          if (!validMetrics.includes(metric)) {
            return ErrorFactory.validation('Invalid usage metric');
          }

          // Validate days range
          if (days < 1 || days > 365) {
            return ErrorFactory.validation('Days must be between 1 and 365');
          }

          // Simulate database fetch
          await new Promise(resolve => setTimeout(resolve, 200));

          // In production, fetch historical data from database
          // const history = await db.usageHistory.findMany({
          //   where: {
          //     userId: context.userId,
          //     metric,
          //     date: {
          //       gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          //     }
          //   },
          //   orderBy: { date: 'asc' }
          // });

          // Generate mock historical data
          const history: Array<{ date: string; value: number }> = [];
          const currentValue = mockUsageMetrics[metric];
          
          for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Generate realistic progression
            const progress = (days - i) / days;
            const randomVariation = 0.8 + Math.random() * 0.4; // 80-120% variation
            const value = Math.round(currentValue * progress * randomVariation);
            
            history.push({
              date: date.toISOString().split('T')[0],
              value: Math.max(0, value),
            });
          }

          return {
            success: true,
            data: history,
          };
        });
      });
    }
  );
}

/**
 * Get usage alerts and warnings
 */
export async function getUsageAlerts(): Promise<ActionResult<Array<{
  type: 'warning' | 'critical' | 'info';
  metric: string;
  message: string;
  threshold: number;
  current: number;
  action?: string;
}>>> {
  return await withContextualRateLimit(
    'billing:usage:alerts',
    'user',
    RateLimits.ANALYTICS_QUERY,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {

    const usageResult = await getUsageWithCalculations();
    if (!usageResult.success || !usageResult.data) {
      return ErrorFactory.internal('Failed to retrieve usage data');
    }

    const { usage, percentages, overage } = usageResult.data;
    const alerts: Array<{
      type: 'warning' | 'critical' | 'info';
      metric: string;
      message: string;
      threshold: number;
      current: number;
      action?: string;
    }> = [];

    // Check for usage warnings (80% threshold)
    if (percentages.emailsSentPercentage >= 80) {
      alerts.push({
        type: percentages.emailsSentPercentage >= 95 ? 'critical' : 'warning',
        metric: 'emails',
        message: `You've used ${percentages.emailsSentPercentage}% of your monthly email limit`,
        threshold: usage.emailsLimit,
        current: usage.emailsSent,
        action: percentages.emailsSentPercentage >= 95 ? 'Consider upgrading your plan' : 'Monitor usage closely',
      });
    }

    if (percentages.contactsReachedPercentage >= 80) {
      alerts.push({
        type: percentages.contactsReachedPercentage >= 95 ? 'critical' : 'warning',
        metric: 'contacts',
        message: `You've reached ${percentages.contactsReachedPercentage}% of your contact limit`,
        threshold: usage.contactsLimit,
        current: usage.contactsReached,
        action: percentages.contactsReachedPercentage >= 95 ? 'Consider upgrading your plan' : 'Monitor usage closely',
      });
    }

    if (percentages.storageUsedPercentage >= 80) {
      alerts.push({
        type: percentages.storageUsedPercentage >= 95 ? 'critical' : 'warning',
        metric: 'storage',
        message: `You've used ${percentages.storageUsedPercentage}% of your storage limit`,
        threshold: usage.storageLimit,
        current: usage.storageUsed,
        action: percentages.storageUsedPercentage >= 95 ? 'Add more storage or upgrade plan' : 'Consider adding storage',
      });
    }

    // Check for overage
    if (overage.hasOverage) {
      for (const item of overage.overageItems) {
        alerts.push({
          type: 'critical',
          metric: item.metric.toLowerCase(),
          message: `You've exceeded your ${item.metric.toLowerCase()} limit by ${item.overage}`,
          threshold: item.limit,
          current: item.used,
          action: `Additional charges: $${item.cost.toFixed(2)}`,
        });
      }
    }

    // Add informational alerts for good usage patterns
    if (percentages.emailsSentPercentage < 50 && percentages.contactsReachedPercentage < 50) {
      alerts.push({
        type: 'info',
        metric: 'general',
        message: 'You have plenty of capacity remaining this month',
        threshold: 100,
        current: Math.max(percentages.emailsSentPercentage, percentages.contactsReachedPercentage),
        action: 'Consider running more campaigns to maximize your plan value',
      });
    }

          return {
            success: true,
            data: alerts,
          };
        });
      });
    }
  );
}

/**
 * Reset usage metrics (admin function for testing)
 */
export async function resetUsageMetrics(): Promise<ActionResult<{ reset: boolean }>> {
  return await withContextualRateLimit(
    'billing:usage:reset',
    'user',
    RateLimits.BILLING_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // In production, this would be an admin-only function with proper permissions
          // const hasAdminPermission = await checkPermission('admin:usage:reset', context.userId);
          // if (!hasAdminPermission) {
          //   return ErrorFactory.unauthorized('Admin permission required');
          // }

          // Simulate reset operation
          await new Promise(resolve => setTimeout(resolve, 200));

          // In production, reset usage metrics in database
          // await db.usageMetrics.update({
          //   where: { userId: context.userId },
          //   data: {
          //     emailsSent: 0,
          //     contactsReached: 0,
          //     campaignsActive: 0,
          //     storageUsed: 0,
          //     resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          //     periodStart: new Date(),
          //     periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          //   }
          // });

          // Reset mock data
          mockUsageMetrics.emailsSent = 0;
          mockUsageMetrics.contactsReached = 0;
          mockUsageMetrics.campaignsActive = 0;
          mockUsageMetrics.storageUsed = 0;

          return {
            success: true,
            data: { reset: true },
          };
        });
      });
    }
  );
}

/**
 * Update usage metrics (internal function for tracking)
 */
export async function updateUsageMetrics(
  updates: Partial<Pick<UsageMetrics, 'emailsSent' | 'contactsReached' | 'campaignsActive' | 'storageUsed'>>
): Promise<ActionResult<UsageMetrics>> {
  return await withContextualRateLimit(
    'billing:usage:update',
    'user',
    RateLimits.BILLING_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Validate updates
          for (const [key, value] of Object.entries(updates)) {
            if (typeof value !== 'number' || value < 0) {
              return ErrorFactory.validation(`Invalid value for ${key}: must be a non-negative number`);
            }
          }

          // Simulate database update
          await new Promise(resolve => setTimeout(resolve, 100));

          // In production, update usage metrics in database
          // const updatedUsage = await db.usageMetrics.update({
          //   where: { userId: context.userId },
          //   data: updates
          // });

          // Update mock data
          Object.assign(mockUsageMetrics, updates);

          return {
            success: true,
            data: mockUsageMetrics,
          };
        });
      });
    }
  );
}

/**
 * Get usage comparison with previous period
 */
export async function getUsageComparison(): Promise<ActionResult<{
  current: UsageMetrics;
  previous: UsageMetrics;
  changes: {
    emailsSent: { value: number; percentage: number };
    contactsReached: { value: number; percentage: number };
    campaignsActive: { value: number; percentage: number };
    storageUsed: { value: number; percentage: number };
  };
}>> {
  return await withContextualRateLimit(
    'billing:usage:comparison',
    'user',
    RateLimits.ANALYTICS_QUERY,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Simulate database fetch for previous period
          await new Promise(resolve => setTimeout(resolve, 150));

          // In production, fetch previous period usage from database
          // const previousUsage = await db.usageMetrics.findFirst({
          //   where: {
          //     userId: context.userId,
          //     periodEnd: {
          //       lt: new Date(mockUsageMetrics.periodStart)
          //     }
          //   },
          //   orderBy: { periodEnd: 'desc' }
          // });

          // Generate mock previous period data
          const previousUsage: UsageMetrics = {
            ...mockUsageMetrics,
            emailsSent: Math.round(mockUsageMetrics.emailsSent * 0.8),
            contactsReached: Math.round(mockUsageMetrics.contactsReached * 0.9),
            campaignsActive: Math.round(mockUsageMetrics.campaignsActive * 0.7),
            storageUsed: mockUsageMetrics.storageUsed * 0.85,
          };

          // Calculate changes
          const calculateChange = (current: number, previous: number) => {
            const value = current - previous;
            const percentage = previous > 0 ? (value / previous) * 100 : 0;
            return { value, percentage };
          };

          const changes = {
            emailsSent: calculateChange(mockUsageMetrics.emailsSent, previousUsage.emailsSent),
            contactsReached: calculateChange(mockUsageMetrics.contactsReached, previousUsage.contactsReached),
            campaignsActive: calculateChange(mockUsageMetrics.campaignsActive, previousUsage.campaignsActive),
            storageUsed: calculateChange(mockUsageMetrics.storageUsed, previousUsage.storageUsed),
          };

          return {
            success: true,
            data: {
              current: mockUsageMetrics,
              previous: previousUsage,
              changes,
            },
          };
        });
      });
    }
  );
}
