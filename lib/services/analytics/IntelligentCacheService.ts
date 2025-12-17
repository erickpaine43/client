// ============================================================================
// INTELLIGENT CACHE SERVICE - Advanced caching with structured keys
// ============================================================================

import { 
  AnalyticsFilters, 
} from "@/types/analytics/core";
import { AnalyticsDomain} from "@/types/analytics/ui";
import { 
  analyticsCache, 
  CACHE_TTL, 
  DOMAIN_CACHE_CONFIG 
} from "@/lib/utils/redis";

/**
 * Cache key structure for analytics data.
 */
export interface StructuredCacheKey {
  domain: AnalyticsDomain;
  operation: string;
  entityIds: string[];
  filters: AnalyticsFilters;
  timestamp: number;
  ttl: number;
}

/**
 * Cache performance metrics.
 */
export interface CachePerformanceMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  cacheSize: number;
  lastUpdated: number;
}

/**
 * Cache invalidation strategy.
 */
export interface CacheInvalidationStrategy {
  type: "time-based" | "event-based" | "pattern-based" | "dependency-based";
triggers: string[];
  cascadeRules: Array<{
    condition: string;
    action: "invalidate" | "refresh" | "cascade";
    targets: string[];
  }>;
}

/**
 * Cache warming configuration.
 */
export interface CacheWarmingConfig {
  enabled: boolean;
  domains: AnalyticsDomain[];
  operations: string[];
  schedules: Array<{
    pattern: string; // cron-like pattern
    priority: "high" | "medium" | "low";
  }>;
}

/**
 * Intelligent caching service with advanced features.
 * Provides structured cache keys, performance monitoring, and intelligent invalidation.
 */
export class IntelligentCacheService {
  private static instance: IntelligentCacheService | null = null;
  private performanceMetrics: Map<string, CachePerformanceMetrics> = new Map();
  private cacheRequests: Map<string, { hits: number; misses: number; totalTime: number }> = new Map();
  private invalidationStrategies: Map<AnalyticsDomain, CacheInvalidationStrategy> = new Map();

  private constructor() {
    this.initializeInvalidationStrategies();
    this.startPerformanceMonitoring();
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): IntelligentCacheService {
    if (!this.instance) {
      this.instance = new IntelligentCacheService();
    }
    return this.instance;
  }

  /**
   * Initialize cache invalidation strategies for each domain.
   */
  private initializeInvalidationStrategies(): void {
    const domains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "leads", "templates", "billing", "crossDomain"];
    
    domains.forEach(domain => {
      this.invalidationStrategies.set(domain, {
        type: "dependency-based",
        triggers: ["filter-change", "data-update", "time-expiry"],
        cascadeRules: [
          {
            condition: "filter-change",
            action: "invalidate",
            targets: ["related-domains"],
          },
          {
            condition: "data-update",
            action: "refresh",
            targets: ["same-domain"],
          },
          {
            condition: "time-expiry",
            action: "cascade",
            targets: ["dependent-caches"],
          },
        ],
      });
    });
  }

  /**
   * Generate structured cache key with intelligent naming.
   */
  generateStructuredCacheKey(
    domain: AnalyticsDomain,
    operation: string,
    entityIds: string[] = [],
    filters: AnalyticsFilters,
    customTTL?: number
  ): StructuredCacheKey {
    // Sort entity IDs for consistent keys
    const sortedEntityIds = [...entityIds].sort();
    
    // Create filter hash for consistent key generation
    const filterHash = this.createFilterHash(filters);
    
    // Determine TTL based on domain configuration
    const ttl = customTTL || this.getDomainTTL(domain, operation);
    
    // Round timestamp to TTL window for cache efficiency
    const timeWindow = Math.floor(Date.now() / (ttl * 1000)) * ttl;

    return {
      domain,
      operation,
      entityIds: sortedEntityIds,
      filters: { ...filters, _hash: filterHash },
      timestamp: timeWindow,
      ttl,
    };
  }

  /**
   * Create consistent hash from filters.
   */
  private createFilterHash(filters: AnalyticsFilters): string {
    const filterString = JSON.stringify({
      dateRange: filters.dateRange,
      entityIds: filters.entityIds?.sort(),
      additionalFilters: filters.additionalFilters,
    });
    
    // Simple hash function for consistent key generation
    let hash = 0;
    for (let i = 0; i < filterString.length; i++) {
      const char = filterString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Get TTL for domain and operation.
   */
  private getDomainTTL(domain: AnalyticsDomain, operation: string): number {
    const domainConfig = DOMAIN_CACHE_CONFIG[domain as keyof typeof DOMAIN_CACHE_CONFIG];
    
    if (domainConfig && operation in domainConfig) {
      return domainConfig[operation as keyof typeof domainConfig];
    }
    
    // Default TTL based on operation type
    if (operation.includes("realtime") || operation.includes("live")) {
      return CACHE_TTL.REAL_TIME;
    } else if (operation.includes("recent") || operation.includes("current")) {
      return CACHE_TTL.RECENT;
    } else if (operation.includes("daily")) {
      return CACHE_TTL.DAILY;
    } else {
      return CACHE_TTL.HOURLY;
    }
  }

  /**
   * Get cached data with performance tracking.
   */
  async getWithTracking<T>(
    structuredKey: StructuredCacheKey
  ): Promise<{ data: T | null; fromCache: boolean; responseTime: number }> {
    const startTime = Date.now();
    const cacheKey = this.structuredKeyToString(structuredKey);
    
    try {
      const data = await analyticsCache.get<T>(cacheKey);
      const responseTime = Date.now() - startTime;
      
      // Track performance
      this.trackCacheRequest(structuredKey.domain, structuredKey.operation, data !== null, responseTime);
      
      return {
        data,
        fromCache: data !== null,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error("Cache get error:", error);
      
      // Track as miss
      this.trackCacheRequest(structuredKey.domain, structuredKey.operation, false, responseTime);
      
      return {
        data: null,
        fromCache: false,
        responseTime,
      };
    }
  }

  /**
   * Set cached data with intelligent TTL.
   */
  async setWithIntelligentTTL<T>(
    structuredKey: StructuredCacheKey,
    data: T
  ): Promise<boolean> {
    const cacheKey = this.structuredKeyToString(structuredKey);
    
    // Adjust TTL based on data characteristics
    const adjustedTTL = this.adjustTTLBasedOnData(structuredKey, data);
    
    try {
      const success = await analyticsCache.set(cacheKey, data, adjustedTTL);
      
      if (success) {
        console.log(`Cached data for ${structuredKey.domain}:${structuredKey.operation} with TTL ${adjustedTTL}s`);
      }
      
      return success;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  /**
   * Adjust TTL based on data characteristics.
   */
  private adjustTTLBasedOnData<T>(structuredKey: StructuredCacheKey, data: T): number {
    let baseTTL = structuredKey.ttl;
    
    // Adjust based on data size (larger data gets longer TTL)
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 100000) { // > 100KB
      baseTTL *= 2;
    } else if (dataSize < 1000) { // < 1KB
      baseTTL *= 0.5;
    }
    
    // Adjust based on entity count
    if (structuredKey.entityIds.length > 10) {
      baseTTL *= 1.5; // Longer TTL for complex queries
    }
    
    // Adjust based on date range
    const filters = structuredKey.filters;
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 90) {
        baseTTL *= 2; // Historical data changes less frequently
      } else if (daysDiff <= 7) {
        baseTTL *= 0.5; // Recent data changes more frequently
      }
    }
    
    return Math.max(CACHE_TTL.REAL_TIME, Math.min(baseTTL, CACHE_TTL.HISTORICAL));
  }

  /**
   * Convert structured key to string.
   */
  private structuredKeyToString(structuredKey: StructuredCacheKey): string {
    const entityPart = structuredKey.entityIds.length > 0 
      ? structuredKey.entityIds.join(",") 
      : "all";
    
    const filterHash = structuredKey.filters._hash || "nofilters";
    
    return `analytics:${structuredKey.domain}:${structuredKey.operation}:${entityPart}:${filterHash}:${structuredKey.timestamp}`;
  }

  /**
   * Intelligent cache invalidation with cascade support.
   */
  async intelligentInvalidation(
    domain: AnalyticsDomain,
    trigger: string,
    context: {
      entityIds?: string[];
      filters?: AnalyticsFilters;
      operation?: string;
    } = {}
  ): Promise<{
    keysInvalidated: number;
    domainsAffected: AnalyticsDomain[];
    cascadeResults: Array<{ domain: AnalyticsDomain; keys: number }>;
  }> {
    const strategy = this.invalidationStrategies.get(domain);
    if (!strategy) {
      return { keysInvalidated: 0, domainsAffected: [], cascadeResults: [] };
    }

    let totalKeysInvalidated = 0;
    const domainsAffected: AnalyticsDomain[] = [domain];
    const cascadeResults: Array<{ domain: AnalyticsDomain; keys: number }> = [];

    // Apply invalidation rules
    for (const rule of strategy.cascadeRules) {
      if (rule.condition === trigger) {
        switch (rule.action) {
          case "invalidate":
            if (context.entityIds && context.entityIds.length > 0) {
              const keys = await analyticsCache.invalidateEntities(domain, context.entityIds);
              totalKeysInvalidated += keys;
            } else {
              const keys = await analyticsCache.invalidateDomain(domain);
              totalKeysInvalidated += keys;
            }
            break;

          case "refresh":
            // For refresh, invalidate and mark for warming
            const refreshKeys = await analyticsCache.invalidateDomain(domain);
            totalKeysInvalidated += refreshKeys;
            // TODO: Trigger cache warming in future tasks
            break;

          case "cascade":
            // Cascade to related domains
            const relatedDomains = this.getRelatedDomains(domain, context);
            for (const relatedDomain of relatedDomains) {
              const cascadeKeys = await analyticsCache.invalidateDomain(relatedDomain);
              cascadeResults.push({ domain: relatedDomain, keys: cascadeKeys });
              totalKeysInvalidated += cascadeKeys;
              domainsAffected.push(relatedDomain);
            }
            break;
        }
      }
    }

    return {
      keysInvalidated: totalKeysInvalidated,
      domainsAffected: [...new Set(domainsAffected)],
      cascadeResults,
    };
  }

  /**
   * Get related domains for cascade invalidation.
   */
  private getRelatedDomains(
    domain: AnalyticsDomain,
    context: { entityIds?: string[]; filters?: AnalyticsFilters; operation?: string }
  ): AnalyticsDomain[] {
    const relatedDomains: AnalyticsDomain[] = [];

    // Define domain relationships
    const relationships: Record<AnalyticsDomain, AnalyticsDomain[]> = {
      campaigns: ["mailboxes", "domains", "leads", "crossDomain"],
      mailboxes: ["campaigns", "domains", "crossDomain"],
      domains: ["campaigns", "mailboxes", "crossDomain"],
      leads: ["campaigns", "crossDomain"],
      templates: ["campaigns", "crossDomain"],
      billing: ["crossDomain"],
      crossDomain: [], // Cross-domain doesn't cascade to avoid loops
    };

    const related = relationships[domain] || [];
    
    // Filter based on context
    if (context.operation?.includes("performance")) {
      // Performance operations affect all related domains
      relatedDomains.push(...related);
    } else if (context.entityIds && context.entityIds.length > 0) {
      // Entity-specific operations affect fewer domains
      relatedDomains.push(...related.slice(0, 2));
    } else {
      // General operations affect primary related domains
      relatedDomains.push(...related.slice(0, 1));
    }

    return relatedDomains;
  }

  /**
   * Track cache request performance.
   */
  private trackCacheRequest(
    domain: AnalyticsDomain,
    operation: string,
    hit: boolean,
    responseTime: number
  ): void {
    const key = `${domain}:${operation}`;
    const existing = this.cacheRequests.get(key) || { hits: 0, misses: 0, totalTime: 0 };
    
    if (hit) {
      existing.hits++;
    } else {
      existing.misses++;
    }
    existing.totalTime += responseTime;
    
    this.cacheRequests.set(key, existing);
  }

  /**
   * Get cache performance metrics.
   */
  getCachePerformanceMetrics(domain?: AnalyticsDomain): CachePerformanceMetrics | Record<string, CachePerformanceMetrics> {
    if (domain) {
      return this.calculateDomainMetrics(domain);
    }

    const allMetrics: Record<string, CachePerformanceMetrics> = {};
    const domains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "leads", "templates", "billing", "crossDomain"];
    
    domains.forEach(d => {
      allMetrics[d] = this.calculateDomainMetrics(d);
    });

    return allMetrics;
  }

  /**
   * Calculate metrics for a specific domain.
   */
  private calculateDomainMetrics(domain: AnalyticsDomain): CachePerformanceMetrics {
    let totalHits = 0;
    let totalMisses = 0;
    let totalTime = 0;
    let requestCount = 0;

    this.cacheRequests.forEach((stats, key) => {
      if (key.startsWith(`${domain}:`)) {
        totalHits += stats.hits;
        totalMisses += stats.misses;
        totalTime += stats.totalTime;
        requestCount += stats.hits + stats.misses;
      }
    });

    const totalRequests = totalHits + totalMisses;
    
    return {
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      missRate: totalRequests > 0 ? totalMisses / totalRequests : 0,
      totalRequests,
      totalHits,
      totalMisses,
      averageResponseTime: requestCount > 0 ? totalTime / requestCount : 0,
      cacheSize: 0, // TODO: Implement cache size tracking
      lastUpdated: Date.now(),
    };
  }

  /**
   * Start performance monitoring.
   */
  private startPerformanceMonitoring(): void {
    // Reset metrics every hour
    setInterval(() => {
      this.resetPerformanceMetrics();
    }, 60 * 60 * 1000);

    console.log("Cache performance monitoring started");
  }

  /**
   * Reset performance metrics.
   */
  private resetPerformanceMetrics(): void {
    this.cacheRequests.clear();
    console.log("Cache performance metrics reset");
  }

  /**
   * Parallel domain loading with intelligent caching.
   */
  async parallelDomainLoading<T>(
    domains: AnalyticsDomain[],
    operation: string,
    filters: AnalyticsFilters,
    dataFetcher: (domain: AnalyticsDomain) => Promise<T>
  ): Promise<{
    results: Record<AnalyticsDomain, T | null>;
    errors: Record<AnalyticsDomain, string | null>;
    cacheHits: Record<AnalyticsDomain, boolean>;
    totalTime: number;
  }> {
    const startTime = Date.now();
    const results: Record<AnalyticsDomain, T | null> = {} as Record<AnalyticsDomain, T | null>;
    const errors: Record<AnalyticsDomain, string | null> = {} as Record<AnalyticsDomain, string | null>;
    const cacheHits: Record<AnalyticsDomain, boolean> = {} as Record<AnalyticsDomain, boolean>;

    // Create promises for parallel execution
    const promises = domains.map(async (domain) => {
      try {
        // Generate cache key
        const structuredKey = this.generateStructuredCacheKey(domain, operation, [], filters);
        
        // Try cache first
        const cacheResult = await this.getWithTracking<T>(structuredKey);
        
        if (cacheResult.data) {
          results[domain] = cacheResult.data;
          cacheHits[domain] = true;
          errors[domain] = null;
        } else {
          // Fetch from data source
          const data = await dataFetcher(domain);
          results[domain] = data;
          cacheHits[domain] = false;
          errors[domain] = null;
          
          // Cache the result
          await this.setWithIntelligentTTL(structuredKey, data);
        }
      } catch (error) {
        results[domain] = null;
        cacheHits[domain] = false;
        errors[domain] = error instanceof Error ? error.message : "Unknown error";
        console.error(`Parallel loading failed for domain ${domain}:`, error);
      }
    });

    // Wait for all promises to complete
    await Promise.all(promises);

    const totalTime = Date.now() - startTime;

    return {
      results,
      errors,
      cacheHits,
      totalTime,
    };
  }

  /**
   * Get cache statistics for monitoring.
   */
  async getCacheStatistics(): Promise<{
    performance: Record<string, CachePerformanceMetrics>;
    redis: Awaited<ReturnType<typeof analyticsCache.getStats>>;
    strategies: Record<AnalyticsDomain, CacheInvalidationStrategy>;
    activeRequests: number;
  }> {
    const performance = this.getCachePerformanceMetrics() as Record<string, CachePerformanceMetrics>;
    const redis = await analyticsCache.getStats();
    const strategies: Record<AnalyticsDomain, CacheInvalidationStrategy> = {
      campaigns: this.invalidationStrategies.get("campaigns")!,
      domains: this.invalidationStrategies.get("domains")!,
      mailboxes: this.invalidationStrategies.get("mailboxes")!,
      leads: this.invalidationStrategies.get("leads")!,
      templates: this.invalidationStrategies.get("templates")!,
      billing: this.invalidationStrategies.get("billing")!,
      crossDomain: this.invalidationStrategies.get("crossDomain")!,
    };
    
    this.invalidationStrategies.forEach((strategy, domain) => {
      strategies[domain] = strategy;
    });

    return {
      performance,
      redis,
      strategies,
      activeRequests: this.cacheRequests.size,
    };
  }
}

// Export singleton instance
export const intelligentCacheService = IntelligentCacheService.getInstance();
