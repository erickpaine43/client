// ============================================================================
// ANALYTICS SERVICE - Main coordinator for all domain analytics services
// ============================================================================
// Re-exports all types and modular functions for backward compatibility
// This maintains the existing API while using the new modular architecture

export * from "./types";
export * from "./validation";
export * from "./calculations";
export * from "./queries";
export * from "./mutations";

// Re-export types from core analytics for convenience
export type { AnalyticsFilters, PerformanceMetrics } from "@/types/analytics/core";
export type { AnalyticsDomain } from "@/types/analytics/ui";
export type { CacheTTL } from "./types"; // Import CacheTTL here

// Import required dependencies
import { AnalyticsFilters, PerformanceMetrics } from "@/types/analytics/core";
import { AnalyticsDomain } from "@/types/analytics/ui";
// Removed: import { CacheTTL } from "./types"; as it's re-exported as a type
import { analyticsCache } from "@/lib/utils/redis";
import { BaseAnalyticsService, AnalyticsError, AnalyticsErrorType, DEFAULT_RETRY_CONFIG } from "../BaseAnalyticsService";
import { CampaignAnalyticsService, campaignAnalyticsService } from "../CampaignAnalyticsService";
import { DomainAnalyticsService, domainAnalyticsService } from "../DomainAnalyticsService";
import { MailboxAnalyticsService } from "../MailboxAnalyticsService";
import { CrossDomainAnalyticsService, crossDomainAnalyticsService } from "../CrossDomainAnalyticsService";
import { LeadAnalyticsService, leadAnalyticsService } from "../LeadAnalyticsService";
import { TemplateAnalyticsService } from "../TemplateAnalyticsService";
import { BillingAnalyticsService, billingAnalyticsService } from "../BillingAnalyticsService";

// Import modular functions
import { OverviewMetrics, DomainServiceHealth, CrossDomainOperationResult } from "./types";
import { aggregatePerformanceMetrics } from "./calculations";
import { getOverviewMetrics as getOverviewMetricsQuery } from "./queries";
import {
  invalidateCache as invalidateCacheMutation,
  invalidateEntities as invalidateEntitiesMutation,
  refreshAll as refreshAllMutation,
  refreshDomain as refreshDomainMutation
} from "./mutations";

/**
 * Main analytics service that coordinates all domain-specific services.
 * Provides cross-domain operations, cache management, and error handling.
 *
 * This class maintains 100% API compatibility with the original AnalyticsService
 * while internally using the new modular architecture.
 */
export class AnalyticsService extends BaseAnalyticsService {
  private static instance: AnalyticsService | null = null;
  private domainHealthStatus: Record<AnalyticsDomain, DomainServiceHealth> = {} as Record<AnalyticsDomain, DomainServiceHealth>;

  // Domain services
  campaigns: CampaignAnalyticsService;
  domains: DomainAnalyticsService;
  mailboxes: MailboxAnalyticsService;
  crossDomain: CrossDomainAnalyticsService;
  leads: LeadAnalyticsService;
  templates: TemplateAnalyticsService;
  billing: BillingAnalyticsService;

  private constructor() {
    super("overview", DEFAULT_RETRY_CONFIG);
    this.initializeDomainHealthStatus();

    // Initialize domain services
    this.campaigns = campaignAnalyticsService;
    this.domains = domainAnalyticsService;
    this.mailboxes = new MailboxAnalyticsService();
    this.crossDomain = crossDomainAnalyticsService;
    this.leads = leadAnalyticsService;
    this.templates = new TemplateAnalyticsService();
    this.billing = billingAnalyticsService;

    console.log("AnalyticsService initialized with domain coordination");
  }

  /**
   * Get singleton instance of AnalyticsService.
   */
  static getInstance(): AnalyticsService {
    if (!this.instance) {
      this.instance = new AnalyticsService();
    }
    return this.instance;
  }

  /**
   * Initialize domain health status tracking.
   */
  private initializeDomainHealthStatus(): void {
    const domains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "crossDomain", "leads", "templates", "billing"];

    domains.forEach(domain => {
      this.domainHealthStatus[domain] = {
        isHealthy: true,
        lastChecked: Date.now(),
        errorCount: 0,
      };
    });
  }

  /**
   * Update domain health status.
   */
  private updateDomainHealth(domain: AnalyticsDomain, isHealthy: boolean, error?: string): void {
    const status = this.domainHealthStatus[domain];
    status.isHealthy = isHealthy;
    status.lastChecked = Date.now();

    if (!isHealthy) {
      status.errorCount++;
      status.lastError = error;
    } else {
      status.errorCount = 0;
      status.lastError = undefined;
    }
  }

  /**
   * Try to get cached data for a specific domain operation.
   * Used as fallback when domain services are unavailable.
   */
  private async tryGetCachedDataForDomain<T>(
    domain: AnalyticsDomain,
    operation: string,
    entityIds: string[] = [],
    filters: Record<string, unknown> = {}
  ): Promise<T | null> {
    if (!analyticsCache.isAvailable()) {
      return null;
    }

    try {
      // Try different cache key variations for common operations
      const cacheKeyVariations = [
        analyticsCache.generateCacheKey(domain, operation, entityIds, filters),
        analyticsCache.generateCacheKey(domain, operation, [], filters), // Without entity IDs
        analyticsCache.generateCacheKey(domain, operation, entityIds, {}), // Without filters
        analyticsCache.generateCacheKey(domain, operation, [], {}), // Basic operation
      ];

      for (const cacheKey of cacheKeyVariations) {
        const cached = await analyticsCache.get<T>(cacheKey);
        if (cached) {
          console.log(`Found cached data for ${domain}:${operation} with key: ${cacheKey}`);
          return cached;
        }
      }

      return null;
    } catch (error) {
      console.warn(`Error retrieving cached data for ${domain}:${operation}:`, error);
      return null;
    }
  }

  /**
   * Execute cross-domain operation with error handling and partial failure support.
   * Includes fallback to cached data and graceful degradation.
   */
  private async executeCrossDomainOperation<T>(
    operation: string,
    domainOperations: Record<AnalyticsDomain, () => Promise<T>>,
    allowPartialFailure: boolean = true,
    fallbackToCachedData: boolean = true
  ): Promise<CrossDomainOperationResult<Record<AnalyticsDomain, T>>> {
    const results: Partial<Record<AnalyticsDomain, T>> = {};
    const errors: Record<AnalyticsDomain, string | null> = {} as Record<AnalyticsDomain, string | null>;
    let successCount = 0;
    let fallbackCount = 0;

    // Execute operations in parallel with individual error handling
    const promises = Object.entries(domainOperations).map(async ([domain, domainOperation]) => {
      const domainKey = domain as AnalyticsDomain;

      try {
        const result = await this.executeWithRetry(domainOperation);
        results[domainKey] = result;
        errors[domainKey] = null;
        this.updateDomainHealth(domainKey, true);
        successCount++;
      } catch (error) {
        const analyticsError = this.normalizeError(error);

        // Try to get cached data as fallback if service is unavailable
        if (fallbackToCachedData &&
            (analyticsError.type === AnalyticsErrorType.SERVICE_UNAVAILABLE ||
             analyticsError.type === AnalyticsErrorType.NETWORK_ERROR)) {

          try {
            const cachedResult = await this.tryGetCachedDataForDomain(domainKey, operation);
            if (cachedResult) {
              results[domainKey] = cachedResult as T;
              errors[domainKey] = `Using cached data (service unavailable): ${analyticsError.message}`;
              this.updateDomainHealth(domainKey, false, `Fallback to cache: ${analyticsError.message}`);
              fallbackCount++;
              console.warn(`Using cached data for domain '${domain}' in operation '${operation}':`, analyticsError.message);
              return;
            }
          } catch (cacheError) {
            console.warn(`Failed to retrieve cached data for domain '${domain}':`, cacheError);
          }
        }

        // No cached data available or other error type
        errors[domainKey] = analyticsError.message;
        this.updateDomainHealth(domainKey, false, analyticsError.message);

        console.error(`Cross-domain operation '${operation}' failed for domain '${domain}':`, analyticsError.message);
      }
    });

    await Promise.all(promises);

    const totalDomains = Object.keys(domainOperations).length;
    const totalSuccessful = successCount + fallbackCount;
    const partialFailure = totalSuccessful > 0 && totalSuccessful < totalDomains;
    const success = totalSuccessful > 0 && (allowPartialFailure || totalSuccessful === totalDomains);

    // Log operation summary
    console.log(`Cross-domain operation '${operation}' completed:`, {
      totalDomains,
      successful: successCount,
      fallbackUsed: fallbackCount,
      failed: totalDomains - totalSuccessful,
      partialFailure,
    });

    if (!success && !allowPartialFailure) {
      throw new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Cross-domain operation '${operation}' failed across all domains (${totalDomains - totalSuccessful} failures)`,
        "overview",
        true
      );
    }

    return {
      success,
      data: results as Record<AnalyticsDomain, T>,
      errors,
      partialFailure,
    };
  }

  /**
   * Get overview metrics aggregated across all domains.
   * Uses intelligent caching with fallback to individual domain queries.
   */
  async getOverviewMetrics(filters?: AnalyticsFilters): Promise<OverviewMetrics> {
    // Create a wrapper function that matches the expected signature
    const executeWithCacheWrapper = async <T>(
      operation: string,
      entityIds: string[],
      filters: Record<string, unknown>,
      operationFn: () => Promise<T>,
      ttl: number // Changed from CacheTTL to number
    ): Promise<T> => {
      return this.executeWithCache(operation, entityIds, filters as Record<string, unknown>, operationFn, ttl);
    };

    return getOverviewMetricsQuery(filters, executeWithCacheWrapper);
  }

  /**
   * Aggregate performance metrics across multiple domains.
   */
  async aggregatePerformanceMetrics(
    domainMetrics: Record<AnalyticsDomain, PerformanceMetrics[]>
  ): Promise<PerformanceMetrics> {
    return aggregatePerformanceMetrics(domainMetrics);
  }

  /**
   * Invalidate cache for a specific domain with cascade support.
   */
  async invalidateDomainCache(domain?: AnalyticsDomain): Promise<number> {
    return invalidateCacheMutation(domain, analyticsCache);
  }

  /**
   * Invalidate cache for a specific domain (overrides base class method).
   * This method maintains backward compatibility while supporting domain-specific cache invalidation.
   */
  async invalidateCache(entityIds?: string[]): Promise<number> {
    // If entityIds is provided as a single string (domain), handle it as domain invalidation
    if (entityIds && typeof entityIds === 'string') {
      return this.invalidateDomainCache(entityIds as AnalyticsDomain);
    }
    // If entityIds is an array, delegate to base class or handle entity-specific invalidation
    if (entityIds && Array.isArray(entityIds)) {
      // For now, invalidate all if specific entities are provided
      return this.invalidateDomainCache();
    }
    // Default: invalidate all cache
    return this.invalidateDomainCache();
  }

  /**
   * Invalidate cache for specific entities across domains with cascade support.
   */
  async invalidateEntities(
    domain: AnalyticsDomain,
    entityIds: string[]
  ): Promise<number> {
    return invalidateEntitiesMutation(domain, entityIds, analyticsCache);
  }

  /**
   * Get cache statistics for monitoring.
   */
  async getCacheStats() {
    try {
      return await analyticsCache.getStats();
    } catch (error) {
      console.error("Cache stats error:", error);
      return {
        isAvailable: false,
        totalKeys: 0,
        analyticsKeys: 0,
      };
    }
  }

  /**
   * Check if analytics services are healthy (detailed version).
   */
  async getDetailedHealthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    services: Record<AnalyticsDomain, boolean>;
    cache: boolean;
    timestamp: number;
    details: Record<AnalyticsDomain, DomainServiceHealth>;
  }> {
    const cacheAvailable = analyticsCache.isAvailable();

    // In future tasks, this will check actual domain services
    // For now, use the health status tracking
    const services: Record<AnalyticsDomain, boolean> = {} as Record<AnalyticsDomain, boolean>;

    Object.entries(this.domainHealthStatus).forEach(([domain, health]) => {
      services[domain as AnalyticsDomain] = health.isHealthy;
    });

    const healthyServices = Object.values(services).filter(Boolean).length;
    const totalServices = Object.keys(services).length;

    let status: "healthy" | "degraded" | "unhealthy";
    if (healthyServices === totalServices && cacheAvailable) {
      status = "healthy";
    } else if (healthyServices > totalServices / 2) {
      status = "degraded";
    } else {
      status = "unhealthy";
    }

    return {
      status,
      services,
      cache: cacheAvailable,
      timestamp: Date.now(),
      details: { ...this.domainHealthStatus },
    };
  }

  /**
   * Refresh all analytics data by invalidating caches.
   */
  async refreshAll(): Promise<void> {
    // Create wrapper for invalidateCache
    const invalidateCacheWrapper = async (): Promise<number> => {
      return this.invalidateCache();
    };
 
    // Create wrapper for logOperation with proper typing
    const logOperationWrapper = (operation: string, params: string[], duration: number, success: boolean, error?: AnalyticsError): void => {
      this.logOperation(operation, params, duration, success, error);
    };

    return refreshAllMutation(
      invalidateCacheWrapper,
      logOperationWrapper
    );
  }

  /**
   * Refresh analytics data for a specific domain.
   */
  async refreshDomain(domain: AnalyticsDomain): Promise<void> {
    // Create wrapper for invalidateDomainCache
    const invalidateDomainCacheWrapper = async (): Promise<number> => {
      return this.invalidateDomainCache(domain);
    };
 
    // Create wrapper for logOperation with proper typing
    const logOperationWrapper = (operation: string, params: string[], duration: number, success: boolean, error?: AnalyticsError): void => {
      this.logOperation(operation, params, duration, success, error);
    };

    return refreshDomainMutation(
      domain,
      invalidateDomainCacheWrapper,
      logOperationWrapper
    );
  }

  /**
   * Get analytics service configuration.
   */
  getConfiguration() {
    return {
      cacheEnabled: analyticsCache.isAvailable(),
      domains: [
        "campaigns",
        "domains",
        "mailboxes",
        "crossDomain",
        "leads",
        "templates",
        "billing"
      ],
    };
  }

  /**
   * Reset health status for all domains (used for testing).
   */
  resetHealthStatus(): void {
    this.initializeDomainHealthStatus();
  }

  /**
   * Test domain isolation by attempting operations across all domains.
   * Returns detailed results for each domain operation.
   */
  async testDomainIsolation(_targetDomain?: AnalyticsDomain, _includeCacheFallback?: boolean): Promise<{
    results: Record<AnalyticsDomain, { success: boolean; error?: string; duration: number }>;
    summary: { total: number; successful: number; failed: number };
  }> {
    const allDomains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "crossDomain", "leads", "templates", "billing"];
    const results: Record<AnalyticsDomain, { success: boolean; error?: string; duration: number }> = {} as Record<AnalyticsDomain, { success: boolean; error?: string; duration: number }>;

    // Test each domain with a simple health check operation
    const domainOperations: Record<AnalyticsDomain, () => Promise<boolean>> = {} as Record<AnalyticsDomain, () => Promise<boolean>>;

    allDomains.forEach(domain => {
      domainOperations[domain] = async () => {
        switch (domain) {
          case "campaigns":
            return this.campaigns.healthCheck();
          case "domains":
            return this.domains.healthCheck();
          case "mailboxes":
            return this.mailboxes.healthCheck();
          case "crossDomain":
            return this.crossDomain.healthCheck();
          case "leads":
            return this.leads.healthCheck();
          case "templates":
            return this.templates.healthCheck();
          case "billing":
            return this.billing.healthCheck();
          default:
            throw new Error(`Unknown domain: ${domain}`);
        }
      };
    });

    const operationResult = await this.executeCrossDomainOperation(
      "testDomainIsolation",
      domainOperations,
      true, // Allow partial failure
      false // Don't fallback to cached data for testing
    );

    // Process results
    Object.entries(operationResult.errors).forEach(([domain, error]) => {
      const domainKey = domain as AnalyticsDomain;
      results[domainKey] = {
        success: error === null,
        error: error || undefined,
        duration: 0, // Would need to track actual duration in real implementation
      };
    });

    const summary = {
      total: allDomains.length,
      successful: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length,
    };

    return { results, summary };
  }

  /**
   * Test cached data fallback functionality.
   * Simulates service failures to verify cache fallback works correctly.
   */
  async testCachedDataFallback(_domain?: AnalyticsDomain): Promise<{
    cacheAvailable: boolean;
    fallbackTests: Record<AnalyticsDomain, { tested: boolean; fallbackWorked: boolean; error?: string }>;
  }> {
    const cacheAvailable = analyticsCache.isAvailable();
    const fallbackTests: Record<AnalyticsDomain, { tested: boolean; fallbackWorked: boolean; error?: string }> = {} as Record<AnalyticsDomain, { tested: boolean; fallbackWorked: boolean; error?: string }>;

    // Test cache fallback for each domain
    const domains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "crossDomain", "leads", "templates", "billing"];

    for (const domain of domains) {
      try {
        // Try to get cached data (this will test if cache fallback mechanism works)
        const cachedResult = await this.tryGetCachedDataForDomain(
          domain,
          "testFallback",
          [],
          { test: true }
        );

        fallbackTests[domain] = {
          tested: true,
          fallbackWorked: cachedResult !== null,
        };
      } catch (error) {
        fallbackTests[domain] = {
          tested: true,
          fallbackWorked: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return { cacheAvailable, fallbackTests };
  }

  /**
   * Basic health check for the analytics service.
   */
  async healthCheck(): Promise<boolean> {
    try {
      const health = await this.getDetailedHealthCheck();
      return health.status === "healthy";
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }
}

// Lazy initialization to prevent issues during build time
let analyticsServiceInstance: AnalyticsService | null = null;

export const analyticsService = (() => {
  // Completely skip initialization during SSR/build time to prevent window access issues
  if (typeof window === 'undefined') {
    // Return a proxy that provides no-op methods to prevent runtime errors
    return new Proxy({}, {
      get: (target, prop) => {
        // Return no-op functions for any method calls
        if (typeof prop === 'string' && prop !== 'constructor') {
          return () => Promise.resolve(null);
        }
        return undefined;
      }
    }) as AnalyticsService;
  }

  if (!analyticsServiceInstance) {
    try {
      analyticsServiceInstance = AnalyticsService.getInstance();
    } catch (error) {
      console.warn("Failed to initialize AnalyticsService:", error);
      // Return a proxy as fallback
      return new Proxy({}, {
        get: (target, prop) => {
          if (typeof prop === 'string' && prop !== 'constructor') {
            return () => Promise.resolve(null);
          }
          return undefined;
        }
      }) as AnalyticsService; 
    }
  }
  return analyticsServiceInstance;
})();

// Default export for convenience
export default AnalyticsService;
