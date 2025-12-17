// ============================================================================
// ANALYTICS SERVICE MUTATIONS - Mutation handler functions for analytics data
// ============================================================================

import { AnalyticsDomain } from "@/types/analytics/ui";
import { AnalyticsLogOperation } from "./types";
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { validateAnalyticsDomain, validateEntityIds } from "./validation";

/**
 * Invalidates cache for a specific domain with cascade support.
 * Clears cached analytics data to ensure fresh data on next query.
 *
 * @param domain - Optional domain to invalidate (invalidates all if not specified)
 * @param analyticsCache - Cache instance to perform invalidation
 * @returns Promise resolving to number of invalidated cache keys
 */
export async function invalidateCache(
  domain: AnalyticsDomain | undefined,
  analyticsCache: {
    invalidateDomain: (domain: AnalyticsDomain | "overview") => Promise<number>;
    invalidateAll: () => Promise<number>;
  }
): Promise<number> {
  try {
    let totalInvalidated = 0;

    if (domain) {
      // Validate domain if specified
      validateAnalyticsDomain(domain);

      // Invalidate specific domain
      totalInvalidated = await analyticsCache.invalidateDomain(domain);

      // Also invalidate overview cache since it depends on domain data
      const overviewInvalidated = await analyticsCache.invalidateDomain("overview");
      totalInvalidated += overviewInvalidated;

      console.log(`Invalidated ${totalInvalidated} cache keys for domain: ${domain}`);
    } else {
      // Invalidate all analytics cache
      totalInvalidated = await analyticsCache.invalidateAll();
      console.log(`Invalidated ${totalInvalidated} total cache keys`);
    }

    return totalInvalidated;
  } catch (error) {
    console.error("Cache invalidation error:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.CACHE_ERROR,
      `Failed to invalidate cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
      domain || "overview",
      true
    );
  }
}

/**
 * Invalidates cache for specific entities across domains with cascade support.
 * Useful for updating cache when specific entities have been modified.
 *
 * @param domain - Domain containing the entities
 * @param entityIds - IDs of entities to invalidate cache for
 * @param analyticsCache - Cache instance to perform invalidation
 * @returns Promise resolving to number of invalidated cache keys
 */
export async function invalidateEntities(
  domain: AnalyticsDomain,
  entityIds: string[],
  analyticsCache: {
    invalidateEntities: (domain: AnalyticsDomain, entityIds: string[]) => Promise<number>;
    invalidateDomain: (domain: AnalyticsDomain | "overview") => Promise<number>;
  }
): Promise<number> {
  try {
    // Validate inputs
    validateAnalyticsDomain(domain);
    validateEntityIds(entityIds);

    let totalInvalidated = 0;

    // Invalidate specific entities
    totalInvalidated = await analyticsCache.invalidateEntities(domain, entityIds);

    // Invalidate overview cache since it may depend on these entities
    const overviewInvalidated = await analyticsCache.invalidateDomain("overview");
    totalInvalidated += overviewInvalidated;

    console.log(`Invalidated ${totalInvalidated} cache keys for ${entityIds.length} entities in domain: ${domain}`);
    return totalInvalidated;
  } catch (error) {
    console.error("Entity cache invalidation error:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.CACHE_ERROR,
      `Failed to invalidate entity cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
      domain,
      true
    );
  }
}

/**
 * Refreshes all analytics data by invalidating caches.
 * Forces a complete refresh of all cached analytics data.
 *
 * @param invalidateCacheFn - Function to invalidate cache
 * @param logOperation - Function to log the operation
 * @returns Promise resolving when refresh is complete
 */
export async function refreshAll(
  invalidateCacheFn: () => Promise<number>,
  logOperation: AnalyticsLogOperation
): Promise<void> {
  const startTime = Date.now();

  try {
    const invalidatedCount = await invalidateCacheFn();
    const duration = Date.now() - startTime;

    logOperation("refreshAll", [], duration, true);
    console.log(`All analytics caches refreshed (${invalidatedCount} keys invalidated in ${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const analyticsError = error instanceof AnalyticsError ? error :
      new AnalyticsError(
        AnalyticsErrorType.CACHE_ERROR,
        `Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "overview",
        true
      );

    logOperation("refreshAll", [], duration, false, analyticsError);
    throw analyticsError;
  }
}

/**
 * Refreshes analytics data for a specific domain.
 * Forces a refresh of cached data for a particular analytics domain.
 *
 * @param domain - Domain to refresh
 * @param invalidateCacheFn - Function to invalidate cache for the domain
 * @param logOperation - Function to log the operation
 * @returns Promise resolving when refresh is complete
 */
export async function refreshDomain(
  domain: AnalyticsDomain,
  invalidateCacheFn: () => Promise<number>,
  logOperation: AnalyticsLogOperation
): Promise<void> {
  // Validate domain
  validateAnalyticsDomain(domain);

  const startTime = Date.now();

  try {
    const invalidatedCount = await invalidateCacheFn();
    const duration = Date.now() - startTime;

    logOperation("refreshDomain", [domain], duration, true);
    console.log(`Analytics cache refreshed for domain: ${domain} (${invalidatedCount} keys invalidated in ${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const analyticsError = error instanceof AnalyticsError ? error :
      new AnalyticsError(
        AnalyticsErrorType.CACHE_ERROR,
        `Domain refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        domain,
        true
      );

    logOperation("refreshDomain", [domain], duration, false, analyticsError);
    throw analyticsError;
  }
}

/**
 * Bulk updates campaign analytics data.
 * Updates multiple campaign analytics records in a single operation.
 *
 * @param updates - Array of campaign analytics updates
 * @returns Promise resolving to bulk update results
 */
export async function bulkUpdateCampaignAnalytics(
  updates: Array<{
    campaignId: string;
    metrics: {
      sent?: number;
      delivered?: number;
      opened_tracked?: number;
      clicked_tracked?: number;
      replied?: number;
      bounced?: number;
      unsubscribed?: number;
      spamComplaints?: number;
    };
    date?: string;
  }>
): Promise<{
  success: boolean;
  processed: number;
  results: Array<{ id: string; success: boolean; error?: string }>;
}> {
  if (!updates || updates.length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "At least one update is required for bulk operation",
      "campaigns",
      false
    );
  }

  // Placeholder implementation - would interact with actual data store
  const results = updates.map(update => ({
    id: update.campaignId,
    success: true, // In real implementation, this would be the actual result
  }));

  return {
    success: results.every(r => r.success),
    processed: updates.length,
    results,
  };
}

/**
 * Initializes analytics data for a new campaign.
 * Sets up initial analytics tracking structure for a campaign.
 *
 * @param campaignId - ID of the campaign to initialize
 * @param campaignData - Initial campaign data
 * @returns Promise resolving when initialization is complete
 */
export async function initializeCampaignAnalytics(
  campaignId: string,
  campaignData: {
    name: string;
    startDate: string;
    expectedVolume?: number;
  }
): Promise<{
  success: boolean;
  campaignId: string;
  trackingId: string;
}> {
  if (!campaignId || campaignId.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Campaign ID is required",
      "campaigns",
      false
    );
  }

  if (!campaignData.name || campaignData.name.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Campaign name is required",
      "campaigns",
      false
    );
  }

  // Placeholder implementation - would create initial analytics record
  return {
    success: true,
    campaignId,
    trackingId: `tracking_${campaignId}_${Date.now()}`,
  };
}

/**
 * Updates analytics data for a specific campaign.
 * Modifies existing campaign analytics with new data.
 *
 * @param campaignId - ID of the campaign to update
 * @param updates - Analytics data updates
 * @returns Promise resolving to update result
 */
export async function updateCampaignAnalytics(
  campaignId: string,
  updates: {
    metrics?: Partial<{
      sent: number;
      delivered: number;
      opened_tracked: number;
      clicked_tracked: number;
      replied: number;
      bounced: number;
      unsubscribed: number;
      spamComplaints: number;
    }>;
    metadata?: Record<string, unknown>;
  }
): Promise<{
  success: boolean;
  campaignId: string;
  updatedFields: string[];
}> {
  if (!campaignId || campaignId.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Campaign ID is required",
      "campaigns",
      false
    );
  }

  if (!updates.metrics && !updates.metadata) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "At least one field must be provided for update",
      "campaigns",
      false
    );
  }

  // Placeholder implementation - would update actual analytics record
  const updatedFields: string[] = [];
  if (updates.metrics) {
    updatedFields.push(...Object.keys(updates.metrics));
  }
  if (updates.metadata) {
    updatedFields.push(...Object.keys(updates.metadata));
  }

  return {
    success: true,
    campaignId,
    updatedFields,
  };
}

/**
 * Deletes analytics data for a specific campaign.
 * Permanently removes campaign analytics records.
 *
 * @param campaignId - ID of the campaign to delete analytics for
 * @returns Promise resolving to deletion result
 */
export async function deleteCampaignAnalytics(
  campaignId: string
): Promise<{
  success: boolean;
  campaignId: string;
  deletedRecords: number;
}> {
  if (!campaignId || campaignId.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Campaign ID is required",
      "campaigns",
      false
    );
  }

  // Placeholder implementation - would delete actual analytics records
  return {
    success: true,
    campaignId,
    deletedRecords: 0, // Would be actual count in real implementation
  };
}
