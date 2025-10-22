import { AnalyticsFilters } from "@/types/analytics/core";
import { getRedisClient } from "./redis-client";
import type Redis from "ioredis";

/**
 * Cache TTL constants for different types of analytics data.
 */
export const CACHE_TTL = {
  REAL_TIME: 60,
  RECENT: 300,
  HOURLY: 900,
  DAILY: 3600,
  HISTORICAL: 86400,
} as const;

/**
 * Domain-specific cache configuration
 */
export const DOMAIN_CACHE_CONFIG = {
  campaigns: {
    defaultTtl: CACHE_TTL.RECENT,
    maxAge: CACHE_TTL.DAILY,
  },
  analytics: {
    defaultTtl: CACHE_TTL.HOURLY,
    maxAge: CACHE_TTL.HISTORICAL,
  },
  reports: {
    defaultTtl: CACHE_TTL.DAILY,
    maxAge: CACHE_TTL.HISTORICAL,
  },
  metrics: {
    defaultTtl: CACHE_TTL.REAL_TIME,
    maxAge: CACHE_TTL.HOURLY,
  },
} as const;

/**
 * Generate a cache key for analytics data
 */
export async function generateAnalyticsCacheKey(
  domain: string,
  operation: string,
  entityIds: string[] = [],
  filters: AnalyticsFilters,
  timeWindow: number = CACHE_TTL.RECENT
): Promise<string> {
  const entityPart = entityIds.length > 0 ? entityIds.sort().join(",") : "all";
  const filterPart =
    Object.keys(filters).length > 0
      ? btoa(JSON.stringify(filters)).replace(/[^a-zA-Z0-9]/g, "")
      : "nofilters";

  const timestamp =
    Math.floor(Date.now() / (timeWindow * 1000)) * timeWindow;

  return `analytics:${domain}:${operation}:${entityPart}:${filterPart}:${timestamp}`;
}

/**
 * Get cached analytics data
 */
export async function getAnalyticsCache<T>(
  cacheKey: string
): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(cacheKey);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

/**
 * Set cached analytics data with TTL
 */
export async function setAnalyticsCache(
  cacheKey: string,
  data: unknown,
  ttlSeconds: number = CACHE_TTL.RECENT
): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.set(cacheKey, JSON.stringify(data), "EX", ttlSeconds);
    return true;
  } catch (error) {
    console.error("Redis set error:", error);
    return false;
  }
}

/**
 * Delete cached analytics data
 */
export async function deleteAnalyticsCache(cacheKey: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    await redis.del(cacheKey);
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
export async function deleteAnalyticsCacheByPattern(pattern: string): Promise<number> {
  const redis = getRedisClient();
  if (!redis) return 0;

  const keys: string[] = [];
  let cursor = "0";

  try {
    do {
      const [nextCursor, foundKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      keys.push(...foundKeys);
    } while (cursor !== "0");

    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error("Redis batch delete error:", error);
    return 0;
  }
}

/**
 * Invalidate cache for a specific domain
 */
export async function invalidateAnalyticsDomain(domain: string): Promise<number> {
  const pattern = `analytics:${domain}:*`;
  return await deleteAnalyticsCacheByPattern(pattern);
}

/**
 * Invalidate cache for specific entities
 */
export async function invalidateAnalyticsEntities(
  domain: string,
  entityIds: string[]
): Promise<number> {
  const entityPart = entityIds.sort().join(",");
  const pattern = `analytics:${domain}:*:${entityPart}:*`;
  return await deleteAnalyticsCacheByPattern(pattern);
}

/**
 * Invalidate all analytics cache
 */
export async function invalidateAllAnalyticsCache(): Promise<number> {
  const pattern = "analytics:*";
  return await deleteAnalyticsCacheByPattern(pattern);
}

/**
 * Get cache statistics
 */
export async function getAnalyticsCacheStats(): Promise<{
  isAvailable: boolean;
  totalKeys: number;
  analyticsKeys: number;
}> {
  const redis = getRedisClient();
  if (!redis) {
    return { isAvailable: false, totalKeys: 0, analyticsKeys: 0 };
  }

  try {
    const [totalKeys, analyticsKeys] = await Promise.all([
      redis.dbsize(),
      scanKeys(redis, "analytics:*")
    ]);

    return {
      isAvailable: true,
      totalKeys,
      analyticsKeys: analyticsKeys.length,
    };
  } catch (error) {
    console.error("Redis stats error:", error);
    return { isAvailable: false, totalKeys: 0, analyticsKeys: 0 };
  }
}

/**
 * Check if Redis cache is available
 */
export async function isAnalyticsCacheAvailable(): Promise<boolean> {
  return getRedisClient() !== null;
}

/**
 * Scan for keys matching a pattern
 */
async function scanKeys(redis: Redis, pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = "0";

  do {
    try {
      const [nextCursor, foundKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      keys.push(...foundKeys);
    } catch (error) {
      console.error("Redis scan error:", error);
      break;
    }
  } while (cursor !== "0");

  return keys;
}