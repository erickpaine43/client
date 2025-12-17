/**
 * NileDB Monitoring and Logging System
 * 
 * Comprehensive monitoring, metrics collection, and logging utilities
 * for the NileDB backend migration system.
 */

import { performHealthCheck, type HealthCheckResult } from './health';
// import { getRecoveryManager } from './recovery'; // Unused for now
import { logError, type ErrorLogContext } from './errors';

// Monitoring Types
export interface SystemMetrics {
  timestamp: string;
  health: HealthCheckResult;
  performance: PerformanceMetrics;
  database: DatabaseMetrics;
  errors: ErrorMetrics;
  usage: UsageMetrics;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  requestsPerMinute: number;
  totalRequests: number;
  slowRequests: number;
  activeConnections: number;
  cpuUsage: number;
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface DatabaseMetrics {
  connectionPoolSize: number;
  activeQueries: number;
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    failedQueries: number;
  };
  tableStats: Array<{
    table: string;
    recordCount: number;
    size: string;
  }>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  errorsByType: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  recentErrors: Array<{
    timestamp: string;
    type: string;
    message: string;
    endpoint?: string;
    userId?: string;
    tenantId?: string;
  }>;
}

export interface Alert {
  ruleId: string;
  severity: string;
  timestamp: string;
  metricsSnapshot: {
    healthStatus: string;
    averageResponseTime: number;
    totalErrors: number;
    memoryPercentage: number;
  };
}

export interface UsageMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTenants: number;
  activeTenants: number;
  totalCompanies: number;
  requestsByEndpoint: Record<string, number>;
  usersByTenant: Record<string, number>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: SystemMetrics) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldownMs: number;
  lastTriggered?: string;
  enabled: boolean;
}

// Monitoring Manager Class
export class MonitoringManager {
  private metrics: SystemMetrics[] = [];
  private maxMetricsHistory = 1000;
  private alertRules: Map<string, AlertRule> = new Map();
  private errorLog: ErrorMetrics['recentErrors'] = [];
  private maxErrorHistory = 500;

  constructor() {
    this.initializeDefaultAlerts();
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  clearAlertRules(): void {
    this.alertRules.clear();
  }

  async getSystemHealth(): Promise<HealthCheckResult> {
    return performHealthCheck();
  }

  /**
   * Collect comprehensive system metrics
   */
  async collectMetrics(): Promise<SystemMetrics> {
    try {
      const timestamp = new Date().toISOString();
      
      const [health, performance, database, errors, usage] = await Promise.all([
        this.collectHealthMetrics(),
        this.collectPerformanceMetrics(),
        this.collectDatabaseMetrics(),
        this.collectErrorMetrics(),
        this.collectUsageMetrics(),
      ]);

      const metrics: SystemMetrics = {
        timestamp,
        health,
        performance,
        database,
        errors,
        usage,
      };

      // Store metrics
      this.metrics.push(metrics);
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      }

      // Check alert rules
      await this.checkAlerts(metrics);

      return metrics;

    } catch (error) {
      logError(error, { operation: 'collect_metrics' });
      throw error;
    }
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get metrics summary for a time period
   */
  getMetricsSummary(periodMs: number = 60 * 60 * 1000): {
    timeWindow: number;
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    healthStatus: string;
    period: string;
    peakMemoryUsage: number;
  } {
    const cutoff = Date.now() - periodMs;
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > cutoff
    );
  
    if (recentMetrics.length === 0) {
      return {
        timeWindow: periodMs,
        averageResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        healthStatus: 'unknown',
        period: `${periodMs / 1000}s`,
        peakMemoryUsage: 0,
      };
    }
  
    const totalResponseTime = recentMetrics.reduce(
      (sum, m) => sum + m.performance.averageResponseTime, 0
    );
    const totalRequests = recentMetrics.reduce(
      (sum, m) => sum + m.performance.requestsPerMinute, 0
    );
    const totalErrors = recentMetrics.reduce(
      (sum, m) => sum + m.errors.totalErrors, 0
    );
  
    const healthStatuses = recentMetrics.map(m => m.health.status);
    const healthyCount = healthStatuses.filter(s => s === 'healthy').length;
    const healthStatus = healthyCount / healthStatuses.length > 0.8 ? 'healthy' : 'degraded';
  
    const peakMemory = recentMetrics.length > 0 ? Math.max(...recentMetrics.map(m => m.performance.memoryUsage.percentage)) : 0;
  
    return {
      timeWindow: periodMs,
      averageResponseTime: totalResponseTime / recentMetrics.length,
      totalRequests,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      healthStatus,
      period: `${periodMs / 1000}s`,
      peakMemoryUsage: peakMemory,
    };
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }
  
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
    }
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  /**
   * Get all alert rules
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Log error for monitoring
   */
  logError(
    error: unknown,
    context: ErrorLogContext & { endpoint?: string } = {}
  ): void {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      type: error instanceof Error ? error.constructor.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      endpoint: context.endpoint,
      userId: context.userId,
      tenantId: context.tenantId,
    };

    this.errorLog.push(errorEntry);
    if (this.errorLog.length > this.maxErrorHistory) {
      this.errorLog = this.errorLog.slice(-this.maxErrorHistory);
    }

    // Also log to console/external system
    logError(error, context);
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 60000): () => void {
    const interval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('Monitoring collection failed:', error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }

  // Private methods
  private async collectHealthMetrics(): Promise<HealthCheckResult> {
    return await performHealthCheck();
  }

  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const memoryUsage = process.memoryUsage();
    
    return {
      averageResponseTime: this.calculateAverageResponseTime(),
      requestsPerMinute: this.calculateRequestsPerMinute(),
      totalRequests: this.calculateTotalRequests(),
      slowRequests: this.calculateSlowRequests(),
      activeConnections: 0, // Would need to implement connection tracking
      cpuUsage: process.cpuUsage ? (process.cpuUsage().user / 10000000) : 0,
      uptime: process.uptime(),
      memoryUsage: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      },
    };
  }

  private async collectDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      
      // This would collect actual database metrics
      // For now, return mock data
      return {
        connectionPoolSize: 10,
        activeQueries: 0,
        queryPerformance: {
          averageQueryTime: 50,
          slowQueries: 0,
          failedQueries: 0,
        },
        tableStats: [
          { table: 'users', recordCount: 100, size: '1MB' },
          { table: 'tenants', recordCount: 10, size: '100KB' },
          { table: 'companies', recordCount: 50, size: '500KB' },
        ],
      };
    } catch (error) {
      logError(error, { operation: 'collect_database_metrics' });
      return {
        connectionPoolSize: 0,
        activeQueries: 0,
        queryPerformance: {
          averageQueryTime: 0,
          slowQueries: 0,
          failedQueries: 1,
        },
        tableStats: [],
      };
    }
  }

  private collectErrorMetrics(): ErrorMetrics {
    const recentErrors = this.errorLog.slice(-100);
    
    const errorsByType: Record<string, number> = {};
    const errorsByEndpoint: Record<string, number> = {};
  
    recentErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      if (error.endpoint) {
        errorsByEndpoint[error.endpoint] = (errorsByEndpoint[error.endpoint] || 0) + 1;
      }
    });
  
    const errorRate = this.calculateErrorRate();
  
    return {
      totalErrors: this.errorLog.length,
      errorRate,
      errorsByType,
      errorsByEndpoint,
      recentErrors: recentErrors.slice(-10),
    };
  }
  
  private calculateErrorRate(): number {
    const recentMetrics = this.getRecentMetrics(10);
    if (recentMetrics.length === 0) return 0;
  
    const totalRequests = recentMetrics.reduce(
      (sum, m) => sum + m.performance.requestsPerMinute, 0
    );
    const totalErrors = this.errorLog.length;
  
    return totalRequests > 0 ? totalErrors / totalRequests : 0;
  }

  private async collectUsageMetrics(): Promise<UsageMetrics> {
    try {
      // This would collect actual usage metrics from the database
      // For now, return mock data
      return {
        totalUsers: 100,
        activeUsers: 75,
        totalTenants: 10,
        activeTenants: 8,
        totalCompanies: 50,
        requestsByEndpoint: {
          '/api/tenants': 150,
          '/api/companies': 100,
          '/api/profile': 75,
        },
        usersByTenant: {
          'tenant-1': 25,
          'tenant-2': 30,
          'tenant-3': 20,
        },
      };
    } catch (error) {
      logError(error, { operation: 'collect_usage_metrics' });
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalTenants: 0,
        activeTenants: 0,
        totalCompanies: 0,
        requestsByEndpoint: {},
        usersByTenant: {},
      };
    }
  }

  private calculateAverageResponseTime(): number {
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length === 0) return 0;
    
    const total = recentMetrics.reduce(
      (sum, m) => sum + m.performance.averageResponseTime, 0
    );
    return total / recentMetrics.length;
  }

  private calculateRequestsPerMinute(): number {
    const oneMinuteAgo = Date.now() - 60000;
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > oneMinuteAgo
    );
    
    return recentMetrics.reduce(
      (sum, m) => sum + m.performance.requestsPerMinute, 0
    );
  }

  private calculateSlowRequests(): number {
    const recentMetrics = this.metrics.slice(-10);
    return recentMetrics.reduce(
      (sum, m) => sum + m.performance.slowRequests, 0
    );
  }

  private calculateTotalRequests(): number {
    const recentMetrics = this.getRecentMetrics(60); // Last hour
    return recentMetrics.reduce(
      (sum, m) => sum + m.performance.requestsPerMinute * 60, 0
    );
  }

  private initializeDefaultAlerts(): void {
    // High error rate alert
    this.addAlertRule({
      id: 'high_error_rate',
      name: 'High Error Rate',
      condition: (metrics) => {
        const errorRate = metrics.errors.totalErrors / 
          Math.max(metrics.performance.requestsPerMinute, 1);
        return errorRate > 0.1; // 10% error rate
      },
      severity: 'high',
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      enabled: true,
    });

    // Slow response time alert
    this.addAlertRule({
      id: 'slow_response_time',
      name: 'Slow Response Time',
      condition: (metrics) => metrics.performance.averageResponseTime > 5000,
      severity: 'medium',
      cooldownMs: 5 * 60 * 1000,
      enabled: true,
    });

    // Database health alert
    this.addAlertRule({
      id: 'database_unhealthy',
      name: 'Database Unhealthy',
      condition: (metrics) => metrics.health.checks.database.status === 'fail',
      severity: 'critical',
      cooldownMs: 2 * 60 * 1000, // 2 minutes
      enabled: true,
    });

    // High memory usage alert
    this.addAlertRule({
      id: 'high_memory_usage',
      name: 'High Memory Usage',
      condition: (metrics) => metrics.performance.memoryUsage.percentage > 90,
      severity: 'medium',
      cooldownMs: 10 * 60 * 1000, // 10 minutes
      enabled: true,
    });
  }

  public async checkAlerts(metrics: SystemMetrics): Promise<Alert[]> {
    const now = Date.now();
    const triggered: Alert[] = [];
  
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;
  
      // Check cooldown
      if (rule.lastTriggered) {
        const lastTriggeredTime = new Date(rule.lastTriggered).getTime();
        if (now - lastTriggeredTime < rule.cooldownMs) {
          continue;
        }
      }
  
      // Check condition
      try {
        if (rule.condition(metrics)) {
          const alert: Alert = {
            ruleId: rule.id,
            severity: rule.severity,
            timestamp: new Date().toISOString(),
            metricsSnapshot: {
              healthStatus: metrics.health.status,
              averageResponseTime: metrics.performance.averageResponseTime,
              totalErrors: metrics.errors.totalErrors,
              memoryPercentage: metrics.performance.memoryUsage.percentage,
            },
          };
          triggered.push(alert);
          await this.triggerAlert(rule, metrics);
          rule.lastTriggered = new Date().toISOString();
        }
      } catch (error) {
        console.error(`Alert rule ${rule.id} failed:`, error);
      }
    }
  
    return triggered;
  }

  private async triggerAlert(rule: AlertRule, metrics: SystemMetrics): Promise<void> {
    const alert = {
      rule: rule.name,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      metrics: {
        health: metrics.health.status,
        averageResponseTime: metrics.performance.averageResponseTime,
        errorRate: metrics.errors.totalErrors,
        memoryUsage: metrics.performance.memoryUsage.percentage,
      },
    };

    // Log alert
    console.warn('ALERT TRIGGERED:', alert);

    // Here you would integrate with external alerting systems
    // like Slack, PagerDuty, email, etc.
  }
}

// Export singleton instance
let monitoringManagerInstance: MonitoringManager | null = null;

export const getMonitoringManager = (): MonitoringManager => {
  if (!monitoringManagerInstance) {
    monitoringManagerInstance = new MonitoringManager();
  }
  return monitoringManagerInstance;
};

export const resetMonitoringManager = (): void => {
  monitoringManagerInstance = null;
};
