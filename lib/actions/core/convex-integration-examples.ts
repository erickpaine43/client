/**
 * Examples of ConvexQueryError integration patterns
 * 
 * This file demonstrates how to use the enhanced error handling system
 * with Convex operations in server actions.
 */

import {
  ActionResult,
  withConvexErrorHandling,
  withPerformanceMonitoring,
  recordConvexPerformance,
  ErrorFactory,
} from './index';

// Mock Convex client for examples
interface MockConvexClient {
  query: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
  mutation: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Example 1: Basic Convex query with error handling
 */
export async function getAnalyticsDataExample(
  convex: MockConvexClient,
  filters: { companyId: string; dateRange: string }
): Promise<ActionResult<unknown>> {
  return withConvexErrorHandling(
    async () => {
      const data = await convex.query('analytics.getData', filters);
      return data;
    },
    {
      actionName: 'getAnalyticsData',
      userId: 'user123',
      companyId: filters.companyId,
    }
  );
}

/**
 * Example 2: Convex mutation with performance monitoring
 */
export const updateUserSettingsExample = withPerformanceMonitoring(
  'updateUserSettings',
  async function(
    convex: MockConvexClient,
    userId: string,
    settings: Record<string, unknown>
  ): Promise<ActionResult<unknown>> {
    return withConvexErrorHandling(
      async () => {
        // Record the start of Convex operation
        const startTime = Date.now();
        
        try {
          const result = await convex.mutation('settings.update', {
            userId,
            settings,
          });
          
          // Record successful Convex performance
          recordConvexPerformance(
            'settings.update',
            Date.now() - startTime,
            true,
            { userId, settingsCount: Object.keys(settings).length },
            'user-settings-update'
          );
          
          return result;
        } catch (error) {
          // Record failed Convex performance
          recordConvexPerformance(
            'settings.update',
            Date.now() - startTime,
            false,
            { userId, settingsCount: Object.keys(settings).length },
            'user-settings-update'
          );
          throw error;
        }
      },
      {
        actionName: 'updateUserSettings',
        userId,
      }
    );
  }
);

/**
 * Example 3: Complex action with multiple Convex operations
 */
export async function createCampaignWithAnalyticsExample(
  convex: MockConvexClient,
  campaignData: {
    name: string;
    companyId: string;
    templateId: string;
  }
): Promise<ActionResult<{ campaignId: string; analyticsId: string }>> {
  return withConvexErrorHandling(
    async () => {
      // Step 1: Create campaign
      const campaign = await convex.mutation('campaigns.create', {
        name: campaignData.name,
        companyId: campaignData.companyId,
        templateId: campaignData.templateId,
      }) as { id: string };

      // Step 2: Initialize analytics
      const analytics = await convex.mutation('analytics.initializeCampaign', {
        campaignId: campaign.id,
        companyId: campaignData.companyId,
      }) as { id: string };

      return {
        campaignId: campaign.id,
        analyticsId: analytics.id,
      };
    },
    {
      actionName: 'createCampaignWithAnalytics',
      companyId: campaignData.companyId,
    }
  );
}

/**
 * Example 4: Handling specific ConvexQueryError scenarios
 */
export async function getBillingDataWithRetryExample(
  convex: MockConvexClient,
  companyId: string
): Promise<ActionResult<unknown>> {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    const result = await withConvexErrorHandling(
      async () => {
        const data = await convex.query('billing.getData', { companyId });
        return data;
      },
      {
        actionName: 'getBillingData',
        companyId,
      }
    );

    // If successful, return result
    if (result.success) {
      return result;
    }

    // Check if error is retryable
    const isRetryable = result.error?.details?.retryable === true;
    const isTimeout = result.error?.message?.includes('timeout');
    
    if ((isRetryable || isTimeout) && retryCount < maxRetries - 1) {
      retryCount++;
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      continue;
    }

    // Return the error if not retryable or max retries reached
    return result;
  }

  // This should never be reached, but TypeScript requires it
  return ErrorFactory.internal('Max retries exceeded');
}

/**
 * Example 5: Batch operations with individual error handling
 */
export async function batchUpdateTemplatesExample(
  convex: MockConvexClient,
  updates: Array<{ id: string; data: Record<string, unknown> }>
): Promise<ActionResult<{ successful: string[]; failed: Array<{ id: string; error: string }> }>> {
  return withConvexErrorHandling(
    async () => {
      const successful: string[] = [];
      const failed: Array<{ id: string; error: string }> = [];

      // Process updates in parallel with individual error handling
      const results = await Promise.allSettled(
        updates.map(async (update) => {
          try {
            await convex.mutation('templates.update', {
              id: update.id,
              data: update.data,
            });
            return { success: true, id: update.id };
          } catch (error) {
            return {
              success: false,
              id: update.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      // Categorize results
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successful.push(result.value.id);
          } else {
            failed.push({
              id: result.value.id,
              error: result.value.error || 'Unknown error',
            });
          }
        } else {
          // This shouldn't happen with our error handling, but just in case
          failed.push({
            id: 'unknown',
            error: result.reason?.message || 'Promise rejected',
          });
        }
      });

      return { successful, failed };
    },
    {
      actionName: 'batchUpdateTemplates',
    }
  );
}

/**
 * Example 6: Convex operation with caching integration
 */
export async function getCachedAnalyticsExample(
  convex: MockConvexClient,
  cacheKey: string,
  queryParams: Record<string, unknown>
): Promise<ActionResult<unknown>> {
  return withConvexErrorHandling(
    async () => {
      // In a real implementation, you would check cache first
      // const cached = await getFromCache(cacheKey);
      // if (cached) return cached;

      const startTime = Date.now();
      const data = await convex.query('analytics.getMetrics', queryParams);
      
      // Record performance with cache miss
      recordConvexPerformance(
        'analytics.getMetrics',
        Date.now() - startTime,
        true,
        queryParams,
        'cache-miss',
        { cacheHit: false }
      );

      // In a real implementation, you would cache the result
      // await setCache(cacheKey, data, CACHE_TTL.MEDIUM);

      return data;
    },
    {
      actionName: 'getCachedAnalytics',
    }
  );
}

/**
 * Example 7: Error handling with user-friendly messages
 */
export async function getUserFriendlyDataExample(
  convex: MockConvexClient,
  userId: string
): Promise<ActionResult<unknown>> {
  const result = await withConvexErrorHandling(
    async () => {
      const data = await convex.query('users.getData', { userId });
      return data;
    },
    {
      actionName: 'getUserData',
      userId,
    }
  );

  // Transform technical errors into user-friendly messages
  if (!result.success && result.error) {
    const { error } = result;
    
    if (error.code === 'CONVEX_ERROR') {
      if (error.message.includes('timeout')) {
        return ErrorFactory.network('The request is taking longer than expected. Please try again.');
      }
      
      if (error.message.includes('not found')) {
        return ErrorFactory.notFound('User data');
      }
      
      if (error.message.includes('permission')) {
        return ErrorFactory.unauthorized('You do not have permission to access this data.');
      }
    }
  }

  return result;
}

/**
 * Example 8: Integration with existing ConvexQueryHelper
 */
export async function useExistingConvexHelperExample(
  convexHelper: { query: (name: string, args: Record<string, unknown>) => Promise<unknown> },
  queryName: string,
  args: Record<string, unknown>
): Promise<ActionResult<unknown>> {
  return withConvexErrorHandling(
    async () => {
      // The ConvexQueryHelper will throw ConvexQueryError on failure
      // which will be properly handled by withConvexErrorHandling
      const data = await convexHelper.query(queryName, args);
      return data;
    },
    {
      actionName: 'useConvexHelper',
    }
  );
}

/**
 * Example usage in a real server action
 */
export async function realWorldExample(
  userId: string,
  companyId: string,
  filters: Record<string, unknown>
): Promise<ActionResult<unknown>> {
  // This would be a real Convex client in practice
  const convex = {} as MockConvexClient;

  return withConvexErrorHandling(
    async () => {
      // Validate permissions first
      const hasPermission = await convex.query('permissions.check', {
        userId,
        companyId,
        resource: 'analytics',
        action: 'read',
      });

      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      // Get the data
      const data = await convex.query('analytics.getData', {
        companyId,
        filters,
      });

      return data;
    },
    {
      actionName: 'getAnalyticsData',
      userId,
      companyId,
    }
  );
}
