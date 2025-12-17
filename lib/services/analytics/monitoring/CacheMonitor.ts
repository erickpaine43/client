// ============================================================================
// CACHE MONITOR - Cache performance monitoring and alerting
// ============================================================================

import { AnalyticsDomain } from "@/types/analytics/ui";
import { analyticsMonitor } from "./AnalyticsMonitor";
import { analyticsCache } from "@/lib/utils/redis";

/**
 * Cache operation types.
 */
export enum CacheOperation {
  GET = "get",
  SET = "set",
  DELETE = "delete",
  INVALIDATE = "invalidate",
}

/**
 * Cache performance metrics.
 */
export interface CachePerformanceMetrics {
  domain: AnalyticsDomain | "overview";
  operation: CacheOperation;
  duration: number;
  hit: boolean;
  keySize: number;
  dataSize?: number;
  ttl?: number;
  cacheKey: string;
  timestamp: number;
}

/**
 * Cache health metrics.
 */
export interface CacheHealthMetrics {
  isAvailable: boolean;
  totalRequests: number;
  hitRate: number;
  averageHitTime: number;
  averageMissTime: number;
  errorRate: number;
  memoryUsage?: number;
  keyCount: number;
  evictionRate: number;
  connectionHealth: boolean;
}

/**
 * Cache alert thresholds.
 */
export interface CacheAlertThresholds {
  hitRate: number; // Minimum hit rate percentage
  averageResponseTime: number; // Maximum average response time in ms
  errorRate: number; // Maximum error rate percentage
  evictionRate: number; // Maximum eviction rate percentage
}

/**
 * Default cache alert thresholds.
 */
export const DEFAULT_CACHE_THRESHOLDS: CacheAlertThresholds = {
  hitRate: 70, // 70% minimum hit rate
  averageResponseTime: 100, // 100ms maximum average response time
  errorRate: 5, // 5% maximum error rate
  evictionRate: 10, // 10% maximum eviction rate
};

/**
 * Cache monitoring class for tracking cache performance and health.
 */
export class CacheMonitor {
  private static instance: CacheMonitor | null = null;
  private metrics: Map<string, CachePerformanceMetrics[]> = new Map();
  private healthChecks: Map<string, CacheHealthMetrics> = new Map();
  private thresholds: CacheAlertThresholds;
  private readonly maxMetricsPerDomain = 1000;

  private constructor(thresholds: CacheAlertThresholds = DEFAULT_CACHE_THRESHOLDS) {
    this.thresholds = thresholds;
    this.startHealthChecking();
    console.log("CacheMonitor initialized with thresholds:", thresholds);
  }

  /**
   * Get singleton instance.
   */
  static getInstance(thresholds?: CacheAlertThresholds): CacheMonitor {
    if (!this.instance) {
      this.instance = new CacheMonitor(thresholds);
    }
    return this.instance;
  }

  /**
   * Record a cache operation.
   */
  recordOperation(
    domain: AnalyticsDomain | "overview",
    operation: CacheOperation,
    cacheKey: string,
    duration: number,
    hit: boolean = false,
    dataSize?: number,
    ttl?: number
  ): void {
    const metric: CachePerformanceMetrics = {
      domain,
      operation,
      duration,
      hit,
      keySize: cacheKey.length,
      dataSize,
      ttl,
      cacheKey,
      timestamp: Date.now(),
    };

    // Store metric
    const domainKey = domain.toString();
    if (!this.metrics.has(domainKey)) {
      this.metrics.set(domainKey, []);
    }

    const domainMetrics = this.metrics.get(domainKey)!;
    domainMetrics.push(metric);

    // Trim old metrics
    if (domainMetrics.length > this.maxMetricsPerDomain) {
      domainMetrics.splice(0, domainMetrics.length - this.maxMetricsPerDomain);
    }

    // Log to analytics monitor
    analyticsMonitor.logCacheOperation(domain, operation, hit, duration, cacheKey);

    // Update health metrics
    this.updateHealthMetrics(domain);
  }

  /**
   * Record a cache error.
   */
  recordError(
    domain: AnalyticsDomain | "overview",
    operation: CacheOperation,
    cacheKey: string,
    error: Error,
    duration?: number
  ): void {
    // Log to analytics monitor
    analyticsMonitor.logCacheError(domain, operation, error, cacheKey);

    // Record as failed operation
    this.recordOperation(domain, operation, cacheKey, duration || 0, false);
  }

  /**
   * Get cache performance metrics for a domain.
   */
  getPerformanceMetrics(
    domain: AnalyticsDomain | "overview",
    timeWindow: number = 3600000 // 1 hour
  ): {
    totalRequests: number;
    hitRate: number;
    averageHitTime: number;
    averageMissTime: number;
    operationBreakdown: Record<CacheOperation, number>;
    keyPatterns: Array<{
      pattern: string;
      count: number;
      hitRate: number;
    }>;
    performanceGrade: "excellent" | "good" | "fair" | "poor";
  } {
    const domainKey = domain.toString();
    const domainMetrics = this.metrics.get(domainKey) || [];
    const cutoff = Date.now() - timeWindow;
    
    const recentMetrics = domainMetrics.filter(m => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        hitRate: 0,
        averageHitTime: 0,
        averageMissTime: 0,
        operationBreakdown: {
          [CacheOperation.GET]: 0,
          [CacheOperation.SET]: 0,
          [CacheOperation.DELETE]: 0,
          [CacheOperation.INVALIDATE]: 0,
        },
        keyPatterns: [],
        performanceGrade: "excellent",
      };
    }

    const hits = recentMetrics.filter(m => m.hit);
    const misses = recentMetrics.filter(m => !m.hit);
    const hitRate = (hits.length / recentMetrics.length) * 100;

    const averageHitTime = hits.length > 0 
      ? hits.reduce((sum, m) => sum + m.duration, 0) / hits.length 
      : 0;

    const averageMissTime = misses.length > 0 
      ? misses.reduce((sum, m) => sum + m.duration, 0) / misses.length 
      : 0;

    // Operation breakdown
    const operationBreakdown: Record<CacheOperation, number> = {
      [CacheOperation.GET]: 0,
      [CacheOperation.SET]: 0,
      [CacheOperation.DELETE]: 0,
      [CacheOperation.INVALIDATE]: 0,
    };

    recentMetrics.forEach(m => {
      operationBreakdown[m.operation]++;
    });

    // Key pattern analysis
    const keyPatterns = this.analyzeKeyPatterns(recentMetrics);

    // Performance grade
    const performanceGrade = this.calculatePerformanceGrade(hitRate, averageHitTime);

    return {
      totalRequests: recentMetrics.length,
      hitRate,
      averageHitTime,
      averageMissTime,
      operationBreakdown,
      keyPatterns,
      performanceGrade,
    };
  }

  /**
   * Get cache health metrics.
   */
  async getCacheHealth(): Promise<CacheHealthMetrics> {
    const isAvailable = analyticsCache.isAvailable();
    
    if (!isAvailable) {
      return {
        isAvailable: false,
        totalRequests: 0,
        hitRate: 0,
        averageHitTime: 0,
        averageMissTime: 0,
        errorRate: 0,
        keyCount: 0,
        evictionRate: 0,
        connectionHealth: false,
      };
    }

    try {
      const stats = await analyticsCache.getStats();
      const allMetrics = Array.from(this.metrics.values()).flat();
      const recentMetrics = allMetrics.filter(m => m.timestamp > Date.now() - 3600000); // 1 hour

      const totalRequests = recentMetrics.length;
      const hits = recentMetrics.filter(m => m.hit);
      const hitRate = totalRequests > 0 ? (hits.length / totalRequests) * 100 : 0;

      const averageHitTime = hits.length > 0 
        ? hits.reduce((sum, m) => sum + m.duration, 0) / hits.length 
        : 0;

      const misses = recentMetrics.filter(m => !m.hit);
      const averageMissTime = misses.length > 0 
        ? misses.reduce((sum, m) => sum + m.duration, 0) / misses.length 
        : 0;

      return {
        isAvailable: true,
        totalRequests,
        hitRate,
        averageHitTime,
        averageMissTime,
        errorRate: 0, // Would need error tracking
        keyCount: stats.analyticsKeys,
        evictionRate: 0, // Would need eviction tracking
        connectionHealth: true,
      };
    } catch (error) {
      console.error("Error getting cache health:", error);
      return {
        isAvailable: false,
        totalRequests: 0,
        hitRate: 0,
        averageHitTime: 0,
        averageMissTime: 0,
        errorRate: 100,
        keyCount: 0,
        evictionRate: 0,
        connectionHealth: false,
      };
    }
  }

  /**
   * Check cache health and trigger alerts if needed.
   */
  async checkCacheHealth(): Promise<void> {
    const health = await this.getCacheHealth();

    // Check hit rate threshold
    if (health.hitRate < this.thresholds.hitRate && health.totalRequests > 10) {
      console.warn(
        `Cache hit rate below threshold: ${health.hitRate.toFixed(1)}% (threshold: ${this.thresholds.hitRate}%)`
      );
    }

    // Check average response time
    const avgResponseTime = (health.averageHitTime + health.averageMissTime) / 2;
    if (avgResponseTime > this.thresholds.averageResponseTime) {
      console.warn(
        `Cache response time above threshold: ${avgResponseTime.toFixed(1)}ms (threshold: ${this.thresholds.averageResponseTime}ms)`
      );
    }

    // Check error rate
    if (health.errorRate > this.thresholds.errorRate) {
      console.warn(
        `Cache error rate above threshold: ${health.errorRate.toFixed(1)}% (threshold: ${this.thresholds.errorRate}%)`
      );
    }

    // Check connection health
    if (!health.connectionHealth) {
      console.error("Cache connection is unhealthy");
    }
  }

  /**
   * Get cache monitoring dashboard data.
   */
  async getDashboardData(): Promise<{
    health: CacheHealthMetrics;
    domainMetrics: Record<string, {
      totalRequests: number;
      hitRate: number;
      averageHitTime: number;
      averageMissTime: number;
      operationBreakdown: Record<CacheOperation, number>;
      keyPatterns: Array<{
        pattern: string;
        count: number;
        hitRate: number;
      }>;
      performanceGrade: "excellent" | "good" | "fair" | "poor";
    }>;
    topKeys: Array<{
      key: string;
      requests: number;
      hitRate: number;
      averageTime: number;
    }>;
    alerts: Array<{
      type: string;
      message: string;
      severity: "warning" | "error";
    }>;
  }> {
    const health = await this.getCacheHealth();
    const domainMetrics: Record<string, {
      totalRequests: number;
      hitRate: number;
      averageHitTime: number;
      averageMissTime: number;
      operationBreakdown: Record<CacheOperation, number>;
      keyPatterns: Array<{
        pattern: string;
        count: number;
        hitRate: number;
      }>;
      performanceGrade: "excellent" | "good" | "fair" | "poor";
    }> = {};
    
    // Get metrics for each domain
    this.metrics.forEach((_, domain) => {
      domainMetrics[domain] = this.getPerformanceMetrics(domain as AnalyticsDomain);
    });

    // Analyze top cache keys
    const topKeys = this.getTopCacheKeys();

    // Generate alerts
    const alerts = await this.generateAlerts(health);

    return {
      health,
      domainMetrics,
      topKeys,
      alerts,
    };
  }

  /**
   * Clear old metrics.
   */
  clearOldMetrics(olderThanHours: number = 24): number {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    let totalCleared = 0;

    this.metrics.forEach((metrics, domain) => {
      const initialLength = metrics.length;
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoff);
      this.metrics.set(domain, filteredMetrics);
      totalCleared += initialLength - filteredMetrics.length;
    });

    return totalCleared;
  }

  /**
   * Update health metrics for a domain.
   */
  private updateHealthMetrics(domain: AnalyticsDomain | "overview"): void {
    const metrics = this.getPerformanceMetrics(domain, 300000); // 5 minutes
    
    this.healthChecks.set(domain.toString(), {
      isAvailable: analyticsCache.isAvailable(),
      totalRequests: metrics.totalRequests,
      hitRate: metrics.hitRate,
      averageHitTime: metrics.averageHitTime,
      averageMissTime: metrics.averageMissTime,
      errorRate: 0, // Would need error tracking
      keyCount: 0, // Would need key counting
      evictionRate: 0, // Would need eviction tracking
      connectionHealth: analyticsCache.isAvailable(),
    });
  }

  /**
   * Analyze cache key patterns.
   */
  private analyzeKeyPatterns(metrics: CachePerformanceMetrics[]): Array<{
    pattern: string;
    count: number;
    hitRate: number;
  }> {
    const patterns = new Map<string, { count: number; hits: number }>();

    metrics.forEach(m => {
      // Extract pattern from cache key (e.g., "analytics:campaigns:performance" from full key)
      const parts = m.cacheKey.split(":");
      const pattern = parts.slice(0, 3).join(":"); // Take first 3 parts as pattern
      
      if (!patterns.has(pattern)) {
        patterns.set(pattern, { count: 0, hits: 0 });
      }

      const patternData = patterns.get(pattern)!;
      patternData.count++;
      if (m.hit) {
        patternData.hits++;
      }
    });

    return Array.from(patterns.entries())
      .map(([pattern, data]) => ({
        pattern,
        count: data.count,
        hitRate: (data.hits / data.count) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 patterns
  }

  /**
   * Calculate performance grade.
   */
  private calculatePerformanceGrade(
    hitRate: number,
    averageTime: number
  ): "excellent" | "good" | "fair" | "poor" {
    if (hitRate >= 90 && averageTime <= 50) return "excellent";
    if (hitRate >= 80 && averageTime <= 100) return "good";
    if (hitRate >= 70 && averageTime <= 200) return "fair";
    return "poor";
  }

  /**
   * Get top cache keys by usage.
   */
  private getTopCacheKeys(): Array<{
    key: string;
    requests: number;
    hitRate: number;
    averageTime: number;
  }> {
    const keyStats = new Map<string, { requests: number; hits: number; totalTime: number }>();

    // Aggregate metrics across all domains
    this.metrics.forEach((metrics) => {
      metrics.forEach(m => {
        if (!keyStats.has(m.cacheKey)) {
          keyStats.set(m.cacheKey, { requests: 0, hits: 0, totalTime: 0 });
        }

        const stats = keyStats.get(m.cacheKey)!;
        stats.requests++;
        stats.totalTime += m.duration;
        if (m.hit) {
          stats.hits++;
        }
      });
    });

    return Array.from(keyStats.entries())
      .map(([key, stats]) => ({
        key,
        requests: stats.requests,
        hitRate: (stats.hits / stats.requests) * 100,
        averageTime: stats.totalTime / stats.requests,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 20); // Top 20 keys
  }

  /**
   * Generate alerts based on cache health.
   */
  private async generateAlerts(health: CacheHealthMetrics): Promise<Array<{
    type: string;
    message: string;
    severity: "warning" | "error";
  }>> {
    const alerts: Array<{
      type: string;
      message: string;
      severity: "warning" | "error";
    }> = [];

    if (!health.isAvailable) {
      alerts.push({
        type: "CACHE_UNAVAILABLE",
        message: "Cache service is unavailable",
        severity: "error",
      });
    }

    if (health.hitRate < this.thresholds.hitRate && health.totalRequests > 10) {
      alerts.push({
        type: "LOW_HIT_RATE",
        message: `Cache hit rate is ${health.hitRate.toFixed(1)}% (threshold: ${this.thresholds.hitRate}%)`,
        severity: "warning",
      });
    }

    const avgResponseTime = (health.averageHitTime + health.averageMissTime) / 2;
    if (avgResponseTime > this.thresholds.averageResponseTime) {
      alerts.push({
        type: "SLOW_RESPONSE",
        message: `Cache response time is ${avgResponseTime.toFixed(1)}ms (threshold: ${this.thresholds.averageResponseTime}ms)`,
        severity: "warning",
      });
    }

    if (health.errorRate > this.thresholds.errorRate) {
      alerts.push({
        type: "HIGH_ERROR_RATE",
        message: `Cache error rate is ${health.errorRate.toFixed(1)}% (threshold: ${this.thresholds.errorRate}%)`,
        severity: "error",
      });
    }

    return alerts;
  }

  /**
   * Start periodic health checking.
   */
  private startHealthChecking(): void {
    // Check cache health every 5 minutes
    setInterval(async () => {
      try {
        await this.checkCacheHealth();
      } catch (error) {
        console.error("Cache health check failed:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Clear old metrics every hour
    setInterval(() => {
      const cleared = this.clearOldMetrics(24); // Keep 24 hours
      if (cleared > 0) {
        console.log(`Cache monitor: cleared ${cleared} old metrics`);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Export singleton instance
export const cacheMonitor = CacheMonitor.getInstance();
