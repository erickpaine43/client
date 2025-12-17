// ============================================================================
// UPSTASH REDIS CONFIGURATION - Analytics caching infrastructure
// ============================================================================

import { AnalyticsFilters } from "@/types/analytics/core";
import { Redis } from "@upstash/redis";

/**
 * Create Redis client using environment variables.
 * Simplified configuration with graceful degradation.
 */
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "Upstash Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables."
    );
    return null;
  }

  try {
    const client = new Redis({ url, token });
    console.log("Upstash Redis client configured successfully");
    return client;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
    return null;
  }
}

/**
 * Analytics cache manager with domain-specific key structure.
 * Implements intelligent caching strategies for analytics data.
 */
export class AnalyticsCache {
  private redis: Redis | null;

  constructor() {
    this.redis = createRedisClient();
  }

  /**
   * Generate structured cache key for analytics data.
   * Format: analytics:{domain}:{operation}:{entityIds}:{filters}:{timestamp}
   */
  generateCacheKey(
    domain: string,
    operation: string,
    entityIds: string[] = [],
    filters: AnalyticsFilters,
    timeWindow: number = 300 // 5 minutes default
  ): string {
    const entityPart = entityIds.length > 0 ? entityIds.sort().join(",") : "all";
    const filterPart = Object.keys(filters).length > 0 
      ? btoa(JSON.stringify(filters)).replace(/[^a-zA-Z0-9]/g, "") 
      : "nofilters";
    
    // Round timestamp to time window for cache efficiency
    const timestamp = Math.floor(Date.now() / (timeWindow * 1000)) * timeWindow;
    
    return `analytics:${domain}:${operation}:${entityPart}:${filterPart}:${timestamp}`;
  }

  /**
   * Get cached analytics data.
   */
  async get<T>(cacheKey: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const cached = await this.redis.get(cacheKey);
      return cached ? (cached as T) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  /**
   * Set cached analytics data with TTL.
   */
  async set(
    cacheKey: string,
    data: unknown,
    ttlSeconds: number = 300
  ): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.setex(cacheKey, ttlSeconds, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Redis set error:", error);
      return false;
    }
  }

  /**
   * Delete cached data by key.
   */
  async delete(cacheKey: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.del(cacheKey);
      return true;
    } catch (error) {
      console.error("Redis delete error:", error);
      return false;
    }
  }

  /**
   * Delete multiple cache keys by pattern.
   * Uses SCAN to find keys matching pattern and deletes them.
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const keys = await this.scanKeys(pattern);
      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error("Redis delete by pattern error:", error);
      return 0;
    }
  }

  /**
   * Scan for keys matching a pattern.
   */
  private async scanKeys(pattern: string): Promise<string[]> {
    if (!this.redis) return [];

    const keys: string[] = [];
    let cursor = 0;

    do {
      try {
        const result = await this.redis.scan(cursor, {
          match: pattern,
          count: 100,
        });
        
        cursor = Number(result[0]);
        keys.push(...result[1]);
      } catch (error) {
        console.error("Redis scan error:", error);
        break;
      }
    } while (cursor !== 0);

    return keys;
  }

  /**
   * Invalidate cache for a specific domain.
   */
  async invalidateDomain(domain: string): Promise<number> {
    const pattern = `analytics:${domain}:*`;
    return await this.deleteByPattern(pattern);
  }

  /**
   * Invalidate cache for specific entities.
   */
  async invalidateEntities(domain: string, entityIds: string[]): Promise<number> {
    const entityPart = entityIds.sort().join(",");
    const pattern = `analytics:${domain}:*:${entityPart}:*`;
    return await this.deleteByPattern(pattern);
  }

  /**
   * Invalidate all analytics cache.
   */
  async invalidateAll(): Promise<number> {
    const pattern = "analytics:*";
    return await this.deleteByPattern(pattern);
  }

  /**
   * Get cache statistics.
   */
  async getStats(): Promise<{
    isAvailable: boolean;
    totalKeys: number;
    analyticsKeys: number;
  }> {
    if (!this.redis) {
      return {
        isAvailable: false,
        totalKeys: 0,
        analyticsKeys: 0,
      };
    }

    try {
      const info = await this.redis.dbsize();
      const analyticsKeys = await this.scanKeys("analytics:*");

      return {
        isAvailable: true,
        totalKeys: info,
        analyticsKeys: analyticsKeys.length,
      };
    } catch (error) {
      console.error("Redis stats error:", error);
      return {
        isAvailable: false,
        totalKeys: 0,
        analyticsKeys: 0,
      };
    }
  }

  /**
   * Check if Redis is available.
   */
  isAvailable(): boolean {
    return this.redis !== null;
  }
}

/**
 * Cache TTL constants for different types of analytics data.
 */
export const CACHE_TTL = {
  // Real-time data (1 minute)
  REAL_TIME: 60,
  
  // Recent data (5 minutes)
  RECENT: 300,
  
  // Hourly aggregates (15 minutes)
  HOURLY: 900,
  
  // Daily aggregates (1 hour)
  DAILY: 3600,
  
  // Historical data (24 hours)
  HISTORICAL: 86400,
} as const;

/**
 * Domain-specific cache configurations.
 */
export const DOMAIN_CACHE_CONFIG = {
  campaigns: {
    performance: CACHE_TTL.RECENT,
    timeSeries: CACHE_TTL.HOURLY,
    comparative: CACHE_TTL.DAILY,
  },
  domains: {
    health: CACHE_TTL.RECENT,
    reputation: CACHE_TTL.HOURLY,
    authentication: CACHE_TTL.DAILY,
  },
  mailboxes: {
    performance: CACHE_TTL.RECENT,
    warmup: CACHE_TTL.RECENT,
    health: CACHE_TTL.HOURLY,
  },
  leads: {
    engagement: CACHE_TTL.RECENT,
    conversion: CACHE_TTL.HOURLY,
    segmentation: CACHE_TTL.DAILY,
  },
  templates: {
    performance: CACHE_TTL.HOURLY,
    usage: CACHE_TTL.DAILY,
    effectiveness: CACHE_TTL.DAILY,
  },
  billing: {
    usage: CACHE_TTL.RECENT,
    costs: CACHE_TTL.HOURLY,
    limits: CACHE_TTL.DAILY,
  },
} as const;

// Export singleton instance
export const analyticsCache = new AnalyticsCache();

// Export Redis client for direct access if needed
export const redis = createRedisClient();
