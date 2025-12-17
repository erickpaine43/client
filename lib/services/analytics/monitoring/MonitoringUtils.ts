// ============================================================================
// MONITORING UTILITIES - Centralized utilities for monitoring operations
// ============================================================================

/**
 * Monitoring utilities and helpers
 */
export class MonitoringUtils {
  /**
   * Initialize all monitoring systems.
   */
  static async initialize(): Promise<void> {
    // Initialize singletons by accessing them
    const { analyticsMonitor } = await import("./AnalyticsMonitor");
    const { cacheMonitor } = await import("./CacheMonitor");
    const { errorTracker } = await import("./ErrorTracker");

    // Ensure initialization by calling a method on each
    analyticsMonitor.getDashboardData();
    await cacheMonitor.getDashboardData();
    errorTracker.getDashboardData();

    console.log("Analytics monitoring systems initialized");
  }

  /**
   * Get comprehensive monitoring dashboard data.
   */
  static async getDashboardData(): Promise<{
    analytics: ReturnType<typeof import("./AnalyticsMonitor").analyticsMonitor.getDashboardData>;
    cache: Awaited<ReturnType<typeof import("./CacheMonitor").cacheMonitor.getDashboardData>>;
    errors: ReturnType<typeof import("./ErrorTracker").errorTracker.getDashboardData>;
    summary: {
      overallHealth: "healthy" | "degraded" | "unhealthy";
      totalAlerts: number;
      criticalIssues: number;
      systemStatus: Record<string, boolean>;
    };
  }> {
    // Import here to avoid circular dependencies
    const { analyticsMonitor } = await import("./AnalyticsMonitor");
    const { cacheMonitor } = await import("./CacheMonitor");
    const { errorTracker } = await import("./ErrorTracker");
    
    const [analyticsData, cacheData, errorData] = await Promise.all([
      analyticsMonitor.getDashboardData(),
      cacheMonitor.getDashboardData(),
      errorTracker.getDashboardData(),
    ]);

    // Calculate overall health
    const criticalIssues = 
      analyticsData.overview.activeAlerts +
      cacheData.alerts.filter(a => a.severity === "error").length +
      errorData.criticalErrors.length;

    const totalAlerts = 
      analyticsData.overview.activeAlerts +
      cacheData.alerts.length;

    let overallHealth: "healthy" | "degraded" | "unhealthy";
    if (criticalIssues > 0) {
      overallHealth = "unhealthy";
    } else if (totalAlerts > 5 || errorData.healthScore < 80) {
      overallHealth = "degraded";
    } else {
      overallHealth = "healthy";
    }

    const systemStatus = {
      analytics: analyticsData.overview.successRate > 95,
      cache: cacheData.health.isAvailable && cacheData.health.hitRate > 70,
      errors: errorData.healthScore > 80,
    };

    return {
      analytics: analyticsData,
      cache: cacheData,
      errors: errorData,
      summary: {
        overallHealth,
        totalAlerts,
        criticalIssues,
        systemStatus,
      },
    };
  }

  /**
   * Get health check status for all systems.
   */
  static async getHealthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    checks: Record<string, {
      status: "pass" | "warn" | "fail";
      message: string;
      duration?: number;
    }>;
    timestamp: string;
  }> {
    const startTime = Date.now();
    const checks: Record<string, {
      status: "pass" | "warn" | "fail";
      message: string;
      duration?: number;
    }> = {};

    // Import here to avoid circular dependencies
    const { analyticsMonitor } = await import("./AnalyticsMonitor");
    const { cacheMonitor } = await import("./CacheMonitor");
    const { errorTracker } = await import("./ErrorTracker");

    // Check analytics monitoring
    try {
      const analyticsData = analyticsMonitor.getDashboardData();
      const duration = Date.now() - startTime;
      
      if (analyticsData.overview.successRate > 95 && analyticsData.overview.activeAlerts === 0) {
        checks.analytics = {
          status: "pass",
          message: "Analytics monitoring is healthy",
          duration,
        };
      } else if (analyticsData.overview.successRate > 80) {
        checks.analytics = {
          status: "warn",
          message: "Analytics monitoring is degraded",
          duration,
        };
      } else {
        checks.analytics = {
          status: "fail",
          message: "Analytics monitoring is unhealthy",
          duration,
        };
      }
    } catch (error) {
      checks.analytics = {
        status: "fail",
        message: `Analytics monitoring check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Check cache health
    try {
      const cacheHealth = await cacheMonitor.getCacheHealth();
      const duration = Date.now() - startTime;

      if (cacheHealth.isAvailable && cacheHealth.hitRate > 70) {
        checks.cache = {
          status: "pass",
          message: `Cache is healthy (${cacheHealth.hitRate.toFixed(1)}% hit rate)`,
          duration,
        };
      } else if (cacheHealth.isAvailable) {
        checks.cache = {
          status: "warn",
          message: `Cache hit rate is low (${cacheHealth.hitRate.toFixed(1)}%)`,
          duration,
        };
      } else {
        checks.cache = {
          status: "fail",
          message: "Cache is unavailable",
          duration,
        };
      }
    } catch (error) {
      checks.cache = {
        status: "fail",
        message: `Cache health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Check error tracking
    try {
      const errorData = errorTracker.getDashboardData();
      const duration = Date.now() - startTime;

      if (errorData.healthScore > 90) {
        checks.errors = {
          status: "pass",
          message: `Error tracking is healthy (score: ${errorData.healthScore})`,
          duration,
        };
      } else if (errorData.healthScore > 70) {
        checks.errors = {
          status: "warn",
          message: `Error rate is elevated (score: ${errorData.healthScore})`,
          duration,
        };
      } else {
        checks.errors = {
          status: "fail",
          message: `High error rate detected (score: ${errorData.healthScore})`,
          duration,
        };
      }
    } catch (error) {
      checks.errors = {
        status: "fail",
        message: `Error tracking check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Determine overall status
    const failedChecks = Object.values(checks).filter(c => c.status === "fail").length;
    const warnChecks = Object.values(checks).filter(c => c.status === "warn").length;

    let status: "healthy" | "degraded" | "unhealthy";
    if (failedChecks > 0) {
      status = "unhealthy";
    } else if (warnChecks > 0) {
      status = "degraded";
    } else {
      status = "healthy";
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear all old monitoring data.
   */
  static async clearOldData(olderThanHours: number = 24): Promise<{
    analytics: { logsCleared: number; alertsCleared: number };
    cache: number;
    errors: number;
  }> {
    // Import the singletons dynamically
    const { analyticsMonitor } = await import("./AnalyticsMonitor");
    const { cacheMonitor } = await import("./CacheMonitor");
    const { errorTracker } = await import("./ErrorTracker");
    
    const analyticsCleared = analyticsMonitor.clearOldData(olderThanHours);
    const cacheCleared = cacheMonitor.clearOldMetrics(olderThanHours);
    const errorsCleared = errorTracker.clearOldErrors(olderThanHours);

    return {
      analytics: analyticsCleared,
      cache: cacheCleared,
      errors: errorsCleared,
    };
  }

  /**
   * Generate monitoring report.
   */
  static async generateReport(timeWindow: number = 3600000): Promise<{
    period: string;
    summary: {
      totalOperations: number;
      successRate: number;
      averageResponseTime: number;
      cacheHitRate: number;
      errorCount: number;
      alertCount: number;
    };
    domains: Record<string, {
      operations: number;
      successRate: number;
      averageTime: number;
      errors: number;
    }>;
    recommendations: string[];
  }> {
    const dashboardData = await this.getDashboardData();
    const period = `${timeWindow / (60 * 1000)} minutes`;

    // Calculate summary metrics
    const summary = {
      totalOperations: dashboardData.analytics.overview.totalOperations,
      successRate: dashboardData.analytics.overview.successRate,
      averageResponseTime: dashboardData.analytics.overview.averageDuration,
      cacheHitRate: dashboardData.cache.health.hitRate,
      errorCount: dashboardData.errors.statistics.totalErrors,
      alertCount: dashboardData.summary.totalAlerts,
    };

    // Domain breakdown
    const domains: Record<string, {
      operations: number;
      successRate: number;
      averageTime: number;
      errors: number;
    }> = {};

    Object.entries(dashboardData.analytics.domains).forEach(([domain, metrics]) => {
      domains[domain] = {
        operations: metrics.operationCount,
        successRate: metrics.successRate,
        averageTime: metrics.averageDuration,
        errors: Object.values(dashboardData.errors.statistics.errorsByDomain)[0] || 0,
      };
    });

    // Generate recommendations
    const recommendations: string[] = [];

    if (summary.successRate < 95) {
      recommendations.push(`Success rate is ${summary.successRate.toFixed(1)}% - investigate failing operations`);
    }

    if (summary.cacheHitRate < 70) {
      recommendations.push(`Cache hit rate is ${summary.cacheHitRate.toFixed(1)}% - review caching strategy`);
    }

    if (summary.averageResponseTime > 2000) {
      recommendations.push(`Average response time is ${summary.averageResponseTime.toFixed(0)}ms - optimize slow operations`);
    }

    if (dashboardData.errors.criticalErrors.length > 0) {
      recommendations.push(`${dashboardData.errors.criticalErrors.length} critical errors need immediate attention`);
    }

    if (recommendations.length === 0) {
      recommendations.push("All systems are operating within normal parameters");
    }

    return {
      period,
      summary,
      domains,
      recommendations,
    };
  }
}
