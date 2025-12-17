// ============================================================================
// ANALYTICS MONITOR - Comprehensive monitoring and alerting system
// ============================================================================

import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { AnalyticsDomain } from "@/types/analytics/ui";

/**
 * Log levels for analytics operations.
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Structured log entry for analytics operations.
 */
export interface AnalyticsLogEntry {
  timestamp: string;
  level: LogLevel;
  domain: AnalyticsDomain | "overview";
  operation: string;
  entityIds?: string[];
  filters?: Record<string, unknown>;
  duration?: number;
  success: boolean;
  cacheHit?: boolean;
  retryAttempt?: number;
  error?: {
    type: AnalyticsErrorType;
    message: string;
    retryable: boolean;
    stack?: string;
  };
  performance?: {
    queryTime?: number;
    cacheTime?: number;
    computationTime?: number;
    dataSize?: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Performance metrics for monitoring.
 */
export interface PerformanceMetrics {
  operationCount: number;
  averageDuration: number;
  successRate: number;
  errorRate: number;
  cacheHitRate: number;
  p95Duration: number;
  p99Duration: number;
  slowestOperations: Array<{
    operation: string;
    domain: string;
    duration: number;
    timestamp: string;
  }>;
}

/**
 * Cache performance metrics.
 */
export interface CacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageHitTime: number;
  averageMissTime: number;
  evictions: number;
  errors: number;
}

/**
 * Alert configuration.
 */
export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    errorRate: number; // Percentage (0-100)
    averageDuration: number; // Milliseconds
    cacheHitRate: number; // Percentage (0-100)
    p95Duration: number; // Milliseconds
  };
  cooldownPeriod: number; // Minutes
  recipients?: string[];
}

/**
 * Alert types.
 */
export enum AlertType {
  HIGH_ERROR_RATE = "HIGH_ERROR_RATE",
  SLOW_PERFORMANCE = "SLOW_PERFORMANCE",
  LOW_CACHE_HIT_RATE = "LOW_CACHE_HIT_RATE",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  CACHE_FAILURE = "CACHE_FAILURE",
}

/**
 * Alert entry.
 */
export interface AlertEntry {
  id: string;
  type: AlertType;
  level: "warning" | "critical";
  domain: AnalyticsDomain | "overview";
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata: Record<string, unknown>;
}

/**
 * Comprehensive analytics monitoring system.
 */
export class AnalyticsMonitor {
  private static instance: AnalyticsMonitor | null = null;
  private logs: AnalyticsLogEntry[] = [];
  private alerts: AlertEntry[] = [];
  private performanceData: Map<string, number[]> = new Map();
  private cacheMetrics: Map<string, CacheMetrics> = new Map();
  private alertCooldowns: Map<string, number> = new Map();
  private readonly maxLogEntries = 10000;
  private readonly maxAlerts = 1000;

  private defaultAlertConfig: AlertConfig = {
    enabled: true,
    thresholds: {
      errorRate: 10, // 10% error rate
      averageDuration: 5000, // 5 seconds
      cacheHitRate: 70, // 70% cache hit rate
      p95Duration: 10000, // 10 seconds for P95
    },
    cooldownPeriod: 15, // 15 minutes
  };

  private constructor() {
    // Initialize monitoring - only start cleanup if not in SSR
    if (typeof window !== 'undefined') {
      this.startPeriodicCleanup();
    }
    console.log("AnalyticsMonitor initialized");
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): AnalyticsMonitor {
    // Return a no-op proxy during SSR to prevent browser API usage
    if (typeof window === 'undefined') {
      return new Proxy({}, {
        get: (target, prop) => {
          // Return no-op methods for any property access
          if (typeof prop === 'string' && prop !== 'constructor') {
            return () => {}; // Return no-op function
          }
          return undefined;
        }
      }) as AnalyticsMonitor;
    }

    if (!this.instance) {
      this.instance = new AnalyticsMonitor();
    }
    return this.instance;
  }

  /**
   * Log analytics operation with structured data.
   */
  logOperation(entry: Omit<AnalyticsLogEntry, "timestamp">): void {
    const logEntry: AnalyticsLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Add to logs
    this.logs.push(logEntry);
    this.trimLogs();

    // Update performance metrics
    this.updatePerformanceMetrics(logEntry);

    // Check for alerts
    this.checkAlerts(logEntry);

    // Console logging based on level
    this.consoleLog(logEntry);
  }

  /**
   * Log successful operation.
   */
  logSuccess(
    domain: AnalyticsDomain | "overview",
    operation: string,
    duration: number,
    options: {
      entityIds?: string[];
      filters?: Record<string, unknown>;
      cacheHit?: boolean;
      performance?: AnalyticsLogEntry["performance"];
      metadata?: Record<string, unknown>;
    } = {}
  ): void {
    this.logOperation({
      level: LogLevel.INFO,
      domain,
      operation,
      success: true,
      duration,
      ...options,
    });
  }

  /**
   * Log failed operation.
   */
  logError(
    domain: AnalyticsDomain | "overview",
    operation: string,
    error: AnalyticsError | Error,
    duration?: number,
    options: {
      entityIds?: string[];
      filters?: Record<string, unknown>;
      retryAttempt?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): void {
    const analyticsError = error instanceof AnalyticsError 
      ? error 
      : new AnalyticsError(
          AnalyticsErrorType.SERVICE_UNAVAILABLE,
          error.message,
          domain.toString(),
          false
        );

    this.logOperation({
      level: analyticsError.type === AnalyticsErrorType.SERVICE_UNAVAILABLE 
        ? LogLevel.CRITICAL 
        : LogLevel.ERROR,
      domain,
      operation,
      success: false,
      duration,
      error: {
        type: analyticsError.type,
        message: analyticsError.message,
        retryable: analyticsError.retryable,
        stack: analyticsError.stack,
      },
      ...options,
    });
  }

  /**
   * Log cache operation.
   */
  logCacheOperation(
    domain: AnalyticsDomain | "overview",
    operation: string,
    hit: boolean,
    duration: number,
    cacheKey?: string
  ): void {
    const domainKey = `${domain}:cache`;
    
    if (!this.cacheMetrics.has(domainKey)) {
      this.cacheMetrics.set(domainKey, {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        hitRate: 0,
        averageHitTime: 0,
        averageMissTime: 0,
        evictions: 0,
        errors: 0,
      });
    }

    const metrics = this.cacheMetrics.get(domainKey)!;
    metrics.totalRequests++;
    
    if (hit) {
      metrics.cacheHits++;
      metrics.averageHitTime = (metrics.averageHitTime * (metrics.cacheHits - 1) + duration) / metrics.cacheHits;
    } else {
      metrics.cacheMisses++;
      metrics.averageMissTime = (metrics.averageMissTime * (metrics.cacheMisses - 1) + duration) / metrics.cacheMisses;
    }

    metrics.hitRate = (metrics.cacheHits / metrics.totalRequests) * 100;

    this.logOperation({
      level: LogLevel.DEBUG,
      domain,
      operation: `cache:${operation}`,
      success: true,
      duration,
      cacheHit: hit,
      metadata: {
        cacheKey,
        hitRate: metrics.hitRate,
      },
    });
  }

  /**
   * Log cache error.
   */
  logCacheError(
    domain: AnalyticsDomain | "overview",
    operation: string,
    error: Error,
    cacheKey?: string
  ): void {
    const domainKey = `${domain}:cache`;
    
    if (this.cacheMetrics.has(domainKey)) {
      this.cacheMetrics.get(domainKey)!.errors++;
    }

    this.logOperation({
      level: LogLevel.WARN,
      domain,
      operation: `cache:${operation}`,
      success: false,
      error: {
        type: AnalyticsErrorType.CACHE_ERROR,
        message: error.message,
        retryable: true,
      },
      metadata: {
        cacheKey,
      },
    });
  }

  /**
   * Get performance metrics for a domain.
   */
  getPerformanceMetrics(
    domain: AnalyticsDomain | "overview",
    timeWindow: number = 3600000 // 1 hour
  ): PerformanceMetrics {
    const cutoff = Date.now() - timeWindow;
    const relevantLogs = this.logs.filter(
      log => log.domain === domain && 
             new Date(log.timestamp).getTime() > cutoff &&
             log.duration !== undefined
    );

    if (relevantLogs.length === 0) {
      return {
        operationCount: 0,
        averageDuration: 0,
        successRate: 100,
        errorRate: 0,
        cacheHitRate: 0,
        p95Duration: 0,
        p99Duration: 0,
        slowestOperations: [],
      };
    }

    const durations = relevantLogs.map(log => log.duration!).sort((a, b) => a - b);
    const successCount = relevantLogs.filter(log => log.success).length;
    const cacheHits = relevantLogs.filter(log => log.cacheHit === true).length;
    const cacheRequests = relevantLogs.filter(log => log.cacheHit !== undefined).length;

    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    const slowestOperations = relevantLogs
      .filter(log => log.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5)
      .map(log => ({
        operation: log.operation,
        domain: log.domain.toString(),
        duration: log.duration!,
        timestamp: log.timestamp,
      }));

    return {
      operationCount: relevantLogs.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      successRate: (successCount / relevantLogs.length) * 100,
      errorRate: ((relevantLogs.length - successCount) / relevantLogs.length) * 100,
      cacheHitRate: cacheRequests > 0 ? (cacheHits / cacheRequests) * 100 : 0,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      slowestOperations,
    };
  }

  /**
   * Get cache metrics for a domain.
   */
  getCacheMetrics(domain: AnalyticsDomain | "overview"): CacheMetrics {
    const domainKey = `${domain}:cache`;
    return this.cacheMetrics.get(domainKey) || {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      averageHitTime: 0,
      averageMissTime: 0,
      evictions: 0,
      errors: 0,
    };
  }

  /**
   * Get all active alerts.
   */
  getActiveAlerts(): AlertEntry[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get recent logs.
   */
  getRecentLogs(
    limit: number = 100,
    domain?: AnalyticsDomain | "overview",
    level?: LogLevel
  ): AnalyticsLogEntry[] {
    let filteredLogs = this.logs;

    if (domain) {
      filteredLogs = filteredLogs.filter(log => log.domain === domain);
    }

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    return filteredLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get monitoring dashboard data.
   */
  getDashboardData(): {
    overview: {
      totalOperations: number;
      successRate: number;
      averageDuration: number;
      activeAlerts: number;
    };
    domains: Record<string, PerformanceMetrics>;
    cacheMetrics: Record<string, CacheMetrics>;
    recentAlerts: AlertEntry[];
    recentErrors: AnalyticsLogEntry[];
  } {
    const totalOperations = this.logs.length;
    const successfulOperations = this.logs.filter(log => log.success).length;
    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 100;
    
    const durationsWithValues = this.logs
      .filter(log => log.duration !== undefined)
      .map(log => log.duration!);
    const averageDuration = durationsWithValues.length > 0 
      ? durationsWithValues.reduce((sum, d) => sum + d, 0) / durationsWithValues.length 
      : 0;

    const domains: Record<string, PerformanceMetrics> = {};
    const domainSet = new Set(this.logs.map(log => log.domain));
    const uniqueDomains = Array.from(domainSet);
    
    uniqueDomains.forEach(domain => {
      domains[domain] = this.getPerformanceMetrics(domain);
    });

    const cacheMetrics: Record<string, CacheMetrics> = {};
    this.cacheMetrics.forEach((metrics, key) => {
      cacheMetrics[key] = metrics;
    });

    const recentAlerts = this.alerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    const recentErrors = this.logs
      .filter(log => !log.success)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return {
      overview: {
        totalOperations,
        successRate,
        averageDuration,
        activeAlerts: this.getActiveAlerts().length,
      },
      domains,
      cacheMetrics,
      recentAlerts,
      recentErrors,
    };
  }

  /**
   * Resolve an alert.
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Clear old logs and alerts.
   */
  clearOldData(olderThanHours: number = 24): {
    logsCleared: number;
    alertsCleared: number;
  } {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    
    const initialLogCount = this.logs.length;
    this.logs = this.logs.filter(log => new Date(log.timestamp).getTime() > cutoff);
    const logsCleared = initialLogCount - this.logs.length;

    const initialAlertCount = this.alerts.length;
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoff || !alert.resolved
    );
    const alertsCleared = initialAlertCount - this.alerts.length;

    return { logsCleared, alertsCleared };
  }

  /**
   * Update performance metrics.
   */
  private updatePerformanceMetrics(entry: AnalyticsLogEntry): void {
    if (entry.duration === undefined) return;

    const key = `${entry.domain}:${entry.operation}`;
    if (!this.performanceData.has(key)) {
      this.performanceData.set(key, []);
    }

    const data = this.performanceData.get(key)!;
    data.push(entry.duration);

    // Keep only last 1000 entries per operation
    if (data.length > 1000) {
      data.splice(0, data.length - 1000);
    }
  }

  /**
   * Check for alert conditions.
   */
  private checkAlerts(entry: AnalyticsLogEntry): void {
    if (!this.defaultAlertConfig.enabled) return;

    const domain = entry.domain;
    const metrics = this.getPerformanceMetrics(domain, 300000); // 5 minutes

    // Check error rate
    if (metrics.errorRate > this.defaultAlertConfig.thresholds.errorRate) {
      this.createAlert(
        AlertType.HIGH_ERROR_RATE,
        "critical",
        domain,
        `High error rate detected: ${metrics.errorRate.toFixed(1)}%`,
        { errorRate: metrics.errorRate, threshold: this.defaultAlertConfig.thresholds.errorRate }
      );
    }

    // Check average duration
    if (metrics.averageDuration > this.defaultAlertConfig.thresholds.averageDuration) {
      this.createAlert(
        AlertType.SLOW_PERFORMANCE,
        "warning",
        domain,
        `Slow performance detected: ${metrics.averageDuration.toFixed(0)}ms average`,
        { averageDuration: metrics.averageDuration, threshold: this.defaultAlertConfig.thresholds.averageDuration }
      );
    }

    // Check cache hit rate
    if (metrics.cacheHitRate < this.defaultAlertConfig.thresholds.cacheHitRate && metrics.operationCount > 10) {
      this.createAlert(
        AlertType.LOW_CACHE_HIT_RATE,
        "warning",
        domain,
        `Low cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%`,
        { cacheHitRate: metrics.cacheHitRate, threshold: this.defaultAlertConfig.thresholds.cacheHitRate }
      );
    }

    // Check for service unavailable
    if (entry.error?.type === AnalyticsErrorType.SERVICE_UNAVAILABLE) {
      this.createAlert(
        AlertType.SERVICE_UNAVAILABLE,
        "critical",
        domain,
        `Service unavailable: ${entry.error.message}`,
        { operation: entry.operation, error: entry.error }
      );
    }

    // Check for cache failures
    if (entry.error?.type === AnalyticsErrorType.CACHE_ERROR) {
      this.createAlert(
        AlertType.CACHE_FAILURE,
        "warning",
        domain,
        `Cache failure: ${entry.error.message}`,
        { operation: entry.operation, error: entry.error }
      );
    }
  }

  /**
   * Create an alert with cooldown logic.
   */
  private createAlert(
    type: AlertType,
    level: "warning" | "critical",
    domain: AnalyticsDomain | "overview",
    message: string,
    metadata: Record<string, unknown>
  ): void {
    const cooldownKey = `${type}:${domain}`;
    const now = Date.now();
    const cooldownEnd = this.alertCooldowns.get(cooldownKey) || 0;

    if (now < cooldownEnd) {
      return; // Still in cooldown period
    }

    const alert: AlertEntry = {
      id: `${type}_${domain}_${now}`,
      type,
      level,
      domain,
      message,
      timestamp: new Date().toISOString(),
      resolved: false,
      metadata,
    };

    this.alerts.push(alert);
    this.trimAlerts();

    // Set cooldown
    this.alertCooldowns.set(
      cooldownKey,
      now + (this.defaultAlertConfig.cooldownPeriod * 60 * 1000)
    );

    // Log the alert
    console.warn(`ALERT [${level.toUpperCase()}] ${domain}: ${message}`, metadata);
  }

  /**
   * Console logging based on level.
   */
  private consoleLog(entry: AnalyticsLogEntry): void {
    const logMessage = `[${entry.level.toUpperCase()}] ${entry.domain}:${entry.operation}`;
    const logData = {
      success: entry.success,
      duration: entry.duration,
      cacheHit: entry.cacheHit,
      error: entry.error,
      performance: entry.performance,
    };

    switch (entry.level) {
      case LogLevel.DEBUG:
        // Only log debug in development
        if (process.env.NODE_ENV === "development") {
          console.debug(logMessage, logData);
        }
        break;
      case LogLevel.INFO:
        console.log(logMessage, logData);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, logData);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(logMessage, logData);
        break;
    }
  }

  /**
   * Trim logs to prevent memory issues.
   */
  private trimLogs(): void {
    if (this.logs.length > this.maxLogEntries) {
      this.logs.splice(0, this.logs.length - this.maxLogEntries);
    }
  }

  /**
   * Trim alerts to prevent memory issues.
   */
  private trimAlerts(): void {
    if (this.alerts.length > this.maxAlerts) {
      // Keep unresolved alerts and most recent resolved alerts
      const unresolved = this.alerts.filter(alert => !alert.resolved);
      const resolved = this.alerts
        .filter(alert => alert.resolved)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, this.maxAlerts - unresolved.length);
      
      this.alerts = [...unresolved, ...resolved];
    }
  }

  /**
   * Start periodic cleanup of old data.
   */
  private startPeriodicCleanup(): void {
    // Clean up every hour
    setInterval(() => {
      const result = this.clearOldData(24); // Keep 24 hours of data
      if (result.logsCleared > 0 || result.alertsCleared > 0) {
        console.log(`Analytics monitoring cleanup: ${result.logsCleared} logs, ${result.alertsCleared} alerts cleared`);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Export singleton instance - lazy initialization to prevent SSR issues
export const analyticsMonitor = (() => {
  return AnalyticsMonitor.getInstance();
})();
