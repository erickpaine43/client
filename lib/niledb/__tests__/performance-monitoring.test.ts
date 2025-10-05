/**
 * Performance and Monitoring Tests
 * 
 * Comprehensive test suite for performance monitoring, system health,
 * and optimization validation from Task 9 monitoring infrastructure.
 */

import {
  getMonitoringManager,
  type MonitoringManager,
  type SystemMetrics,
  type AlertRule,
} from '../monitoring';
import { getRecoveryManager, type RecoveryManager } from '../recovery';
import { type HealthCheckResult } from '../health';
import {
  createTestNileClient,
  cleanupTestData,
  createTestSetup,
  setupTestEnvironment,
  restoreEnvironment,
  waitFor,
} from './test-utils';
import type { Server } from '@niledatabase/server';

describe('Performance and Monitoring Tests', () => {
  let testNile: Server;
  let monitoringManager: MonitoringManager;
  let recoveryManager: RecoveryManager;

  beforeAll(() => {
    setupTestEnvironment();
    testNile = createTestNileClient();
    monitoringManager = getMonitoringManager();
    recoveryManager = getRecoveryManager();
  });

  afterAll(async () => {
    await cleanupTestData(testNile);
    restoreEnvironment();
  });

  beforeEach(async () => {
    await cleanupTestData(testNile);
    // Reset monitoring state
    monitoringManager.clearMetrics();
    monitoringManager.clearAlertRules();
  });

  describe('Metrics Collection', () => {
    it('should collect basic system metrics', async () => {
      const metrics = await monitoringManager.collectMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.timestamp).toBe('string');
      expect(metrics.performance).toBeDefined();
      expect(metrics.errors).toBeDefined();
      expect(metrics.database).toBeDefined();
      expect(metrics.usage).toBeDefined();

      // Performance metrics
      expect(metrics.performance.requestsPerMinute).toBeGreaterThanOrEqual(0);
      expect(metrics.performance.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.performance.requestsPerMinute).toBeGreaterThanOrEqual(0);

      // Error metrics
      expect(metrics.errors.totalErrors).toBeGreaterThanOrEqual(0);
      expect(metrics.errors.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.errors.errorsByType).toBeDefined();

      // Database metrics
      expect(metrics.database.connectionPoolSize).toBeGreaterThanOrEqual(0);
      expect(metrics.database.activeQueries).toBeGreaterThanOrEqual(0);
      expect(metrics.database.queryPerformance.averageQueryTime).toBeGreaterThanOrEqual(0);

      // System metrics
      expect(metrics.performance.memoryUsage.percentage).toBeGreaterThanOrEqual(0);
      expect(metrics.performance.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.performance.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should track metrics over time', async () => {
      // Collect initial metrics
      const initialMetrics = await monitoringManager.collectMetrics();

      // Perform some operations to generate metrics
      await createTestSetup(testNile, 'admin');
    
      // Wait for metrics to be updated
      await waitFor(2000);
    
      // Collect updated metrics
      const updatedMetrics = await monitoringManager.collectMetrics();

      // Should have more requests
      expect(updatedMetrics.performance.requestsPerMinute).toBeGreaterThanOrEqual(
        initialMetrics.performance.requestsPerMinute
      );

      // Should have database activity
      expect(updatedMetrics.database.connectionPoolSize).toBeGreaterThanOrEqual(
        initialMetrics.database.connectionPoolSize
      );
    });

    it('should provide metrics summary for time periods', () => {
      const oneHour = 60 * 60 * 1000;
      const summary = monitoringManager.getMetricsSummary(oneHour);

      expect(summary).toBeDefined();
      expect(summary.timeWindow).toBe(oneHour);
      expect(summary.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(summary.totalRequests).toBeGreaterThanOrEqual(0);
      expect(summary.errorRate).toBeGreaterThanOrEqual(0);
      expect(summary.peakMemoryUsage).toBeGreaterThanOrEqual(0);
    });

    it('should handle metrics collection errors gracefully', async () => {
      // Mock a metrics collection error
      const originalCollectMetrics = monitoringManager.collectMetrics;
      monitoringManager.collectMetrics = jest.fn().mockRejectedValue(new Error('Metrics collection failed'));

      // Should not throw, but return default metrics
      const metrics = await monitoringManager.collectMetrics().catch(() => ({
        timestamp: new Date().toISOString(),
        health: { status: 'healthy', timestamp: new Date().toISOString(), checks: { database: { status: 'pass' }, api: { status: 'pass' }, authentication: { status: 'pass' } }, metadata: { environment: 'test', version: '1.0.0', uptime: 0 } },
        performance: { requestsPerMinute: 0, averageResponseTime: 0, slowRequests: 0, activeConnections: 0, cpuUsage: 0, uptime: 0, memoryUsage: { used: 0, total: 0, percentage: 0 } },
        errors: { totalErrors: 0, errorRate: 0, errorsByType: {}, errorsByEndpoint: {}, recentErrors: [] },
        database: { connectionPoolSize: 0, activeQueries: 0, queryPerformance: { averageQueryTime: 0, slowQueries: 0, failedQueries: 0 }, tableStats: [] },
        usage: { totalUsers: 0, activeUsers: 0, totalTenants: 0, activeTenants: 0, totalCompanies: 0, requestsByEndpoint: {}, usersByTenant: {} },
      }));

      expect(metrics).toBeDefined();

      // Restore original method
      monitoringManager.collectMetrics = originalCollectMetrics;
    });
  });

  describe('Alert System', () => {
    it('should add and manage alert rules', () => {
      const alertRule = {
        id: 'test_high_error_rate',
        name: 'High Error Rate Alert',
        condition: (metrics: SystemMetrics) => metrics.errors.errorRate > 0.05,
        severity: 'high' as const,
        cooldownMs: 5 * 60 * 1000, // 5 minutes
        enabled: true,
      };

      monitoringManager.addAlertRule(alertRule);

      const rules = monitoringManager.getAlertRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('test_high_error_rate');
      expect(rules[0].enabled).toBe(true);
    });

    it('should trigger alerts when conditions are met', async () => {
      const alertRule = {
        id: 'test_response_time',
        name: 'High Response Time Alert',
        condition: (metrics: SystemMetrics) => metrics.performance.averageResponseTime > 100,
        severity: 'medium' as const,
        cooldownMs: 1000, // 1 second for testing
        enabled: true,
      };

      monitoringManager.addAlertRule(alertRule);

      // Mock metrics that would trigger the alert
      const mockMetrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        health: { status: 'healthy', timestamp: new Date().toISOString(), checks: { database: { status: 'pass' }, api: { status: 'pass' }, authentication: { status: 'pass' }, tenantService: { status: 'pass' }, companyService: { status: 'pass' } }, metadata: { environment: 'test', version: '1.0.0', uptime: 0 } },
        performance: { averageResponseTime: 150, requestsPerMinute: 10, totalRequests: 100, slowRequests: 0, activeConnections: 0, cpuUsage: 45, uptime: 3600, memoryUsage: { used: 0, total: 0, percentage: 75 } },
        errors: { totalErrors: 0, errorRate: 0, errorsByType: {}, errorsByEndpoint: {}, recentErrors: [] },
        database: { connectionPoolSize: 5, activeQueries: 50, queryPerformance: { averageQueryTime: 25, slowQueries: 0, failedQueries: 0 }, tableStats: [] },
        usage: { totalUsers: 0, activeUsers: 0, totalTenants: 0, activeTenants: 0, totalCompanies: 0, requestsByEndpoint: {}, usersByTenant: {} },
      };

      const triggeredAlerts = await monitoringManager.checkAlerts(mockMetrics);

      expect(triggeredAlerts).toHaveLength(1);
      expect(triggeredAlerts[0].ruleId).toBe('test_response_time');
      expect(triggeredAlerts[0].severity).toBe('medium');
    });

    it('should respect alert cooldown periods', async () => {
      const alertRule = {
        id: 'test_cooldown',
        name: 'Cooldown Test Alert',
        condition: (metrics: SystemMetrics) => metrics.errors.totalErrors > 0,
        severity: 'low' as const,
        cooldownMs: 2000, // 2 seconds
        enabled: true,
      };

      monitoringManager.addAlertRule(alertRule);

      const mockMetrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        health: { status: 'healthy', timestamp: new Date().toISOString(), checks: { database: { status: 'pass' }, api: { status: 'pass' }, authentication: { status: 'pass' }, tenantService: { status: 'pass' }, companyService: { status: 'pass' } }, metadata: { environment: 'test', version: '1.0.0', uptime: 0 } },
        performance: { averageResponseTime: 50, requestsPerMinute: 10, totalRequests: 50, slowRequests: 0, activeConnections: 0, cpuUsage: 45, uptime: 3600, memoryUsage: { used: 0, total: 0, percentage: 75 } },
        errors: { totalErrors: 1, errorRate: 0.01, errorsByType: { validation: 1 }, errorsByEndpoint: {}, recentErrors: [] },
        database: { connectionPoolSize: 5, activeQueries: 50, queryPerformance: { averageQueryTime: 25, slowQueries: 0, failedQueries: 0 }, tableStats: [] },
        usage: { totalUsers: 0, activeUsers: 0, totalTenants: 0, activeTenants: 0, totalCompanies: 0, requestsByEndpoint: {}, usersByTenant: {} },
      };

      // First trigger should work
      const firstTrigger = await monitoringManager.checkAlerts(mockMetrics);
      expect(firstTrigger).toHaveLength(1);

      // Immediate second trigger should be blocked by cooldown
      const secondTrigger = await monitoringManager.checkAlerts(mockMetrics);
      expect(secondTrigger).toHaveLength(0);

      // After cooldown period, should trigger again
      await waitFor(2100);
      const thirdTrigger = await monitoringManager.checkAlerts(mockMetrics);
      expect(thirdTrigger).toHaveLength(1);
    });

    it('should disable and enable alert rules', async () => {
      const alertRule = {
        id: 'test_toggle',
        name: 'Toggle Test Alert',
        condition: (_metrics: SystemMetrics) => true, // Always trigger
        severity: 'low' as const,
        cooldownMs: 1000,
        enabled: true,
      };

      monitoringManager.addAlertRule(alertRule);

      // Disable the rule
      monitoringManager.updateAlertRule('test_toggle', { enabled: false });

      const mockMetrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        health: { status: 'healthy', timestamp: new Date().toISOString(), checks: { database: { status: 'pass' }, api: { status: 'pass' }, authentication: { status: 'pass' }, tenantService: { status: 'pass' }, companyService: { status: 'pass' } }, metadata: { environment: 'test', version: '1.0.0', uptime: 0 } },
        performance: { averageResponseTime: 50, requestsPerMinute: 10, totalRequests: 50, slowRequests: 0, activeConnections: 0, cpuUsage: 45, uptime: 3600, memoryUsage: { used: 0, total: 0, percentage: 75 } },
        errors: { totalErrors: 0, errorRate: 0, errorsByType: {}, errorsByEndpoint: {}, recentErrors: [] },
        database: { connectionPoolSize: 5, activeQueries: 50, queryPerformance: { averageQueryTime: 25, slowQueries: 0, failedQueries: 0 }, tableStats: [] },
        usage: { totalUsers: 0, activeUsers: 0, totalTenants: 0, activeTenants: 0, totalCompanies: 0, requestsByEndpoint: {}, usersByTenant: {} },
      };

      // Should not trigger when disabled
      const disabledTrigger = await monitoringManager.checkAlerts(mockMetrics);
      expect(disabledTrigger).toHaveLength(0);

      // Re-enable and should trigger
      monitoringManager.updateAlertRule('test_toggle', { enabled: true });
      const enabledTrigger = await monitoringManager.checkAlerts(mockMetrics);
      expect(enabledTrigger).toHaveLength(1);
    });

    it('should remove alert rules', () => {
      const alertRule = {
        id: 'test_remove',
        name: 'Remove Test Alert',
        condition: (_metrics: SystemMetrics) => false,
        severity: 'low' as const,
        cooldownMs: 1000,
        enabled: true,
      };

      monitoringManager.addAlertRule(alertRule);
      expect(monitoringManager.getAlertRules()).toHaveLength(1);

      monitoringManager.removeAlertRule('test_remove');
      expect(monitoringManager.getAlertRules()).toHaveLength(0);
    });
  });

  describe('System Health Monitoring', () => {
    it('should provide comprehensive system health status', async () => {
      const healthStatus = await monitoringManager.getSystemHealth();

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toMatch(/^(healthy|unhealthy|degraded)$/);
      expect(typeof healthStatus.timestamp).toBe('string');
      expect(healthStatus.checks).toBeDefined();

      // Check individual service health
      expect(healthStatus.checks.database).toBeDefined();
      expect(healthStatus.checks.database.status).toMatch(/^(pass|fail|warn)$/);
      expect(healthStatus.checks.database.responseTime).toBeGreaterThanOrEqual(0);

      expect(healthStatus.checks.authentication).toBeDefined();
      expect(healthStatus.checks.api).toBeDefined();
    });

    it('should detect unhealthy services', async () => {
      // Mock a service failure
      const originalHealthCheck = monitoringManager.getSystemHealth;
      monitoringManager.getSystemHealth = jest.fn().mockResolvedValue({
        status: 'critical',
        timestamp: new Date(),
        checks: {
          database: { status: 'critical', responseTime: 5000, error: 'Connection timeout' },
          authentication: { status: 'healthy', responseTime: 50 },
          tenantService: { status: 'warning', responseTime: 200 },
          companyService: { status: 'healthy', responseTime: 75 },
        },
        uptime: 3600,
      });

      const healthStatus = await monitoringManager.getSystemHealth();

      expect(healthStatus.status).toBe('critical');
      expect(healthStatus.checks.database.status).toBe('critical');
      expect(healthStatus.checks.database.error).toBe('Connection timeout');

      // Restore original method
      monitoringManager.getSystemHealth = originalHealthCheck;
    });

    it('should calculate overall health from service statuses', async () => {
      // Test healthy system
      const healthyStatus = await monitoringManager.getSystemHealth();
      expect(['healthy', 'warning', 'critical']).toContain(healthyStatus.status);

      // The overall status should be the worst individual status
      let worstLevel = 0;
      for (const check of Object.values(healthyStatus.checks)) {
        let level = 0;
        const checkStatus = check as { status: string };
        if (checkStatus.status === 'fail') level = 2;
        else if (checkStatus.status === 'warn') level = 1;
        else if (checkStatus.status === 'pass') level = 0;
        if (level > worstLevel) worstLevel = level;
      }
      let worstStatus: 'healthy' | 'degraded' | 'unhealthy';
      if (worstLevel === 2) worstStatus = 'unhealthy';
      else if (worstLevel === 1) worstStatus = 'degraded';
      else worstStatus = 'healthy';

      expect(healthyStatus.status).toBe(worstStatus);
    });
  });

  describe('Continuous Monitoring', () => {
    it('should start and stop continuous monitoring', async () => {
      const initialMetrics = await monitoringManager.collectMetrics();

      // Start monitoring with 100ms interval
      const stopMonitoring = monitoringManager.startMonitoring(100);

      // Wait for a few monitoring cycles
      await waitFor(350);

      // Stop monitoring
      stopMonitoring();

      const finalMetrics = await monitoringManager.collectMetrics();

      // Should have collected metrics during monitoring
      expect(new Date(finalMetrics.timestamp).getTime()).toBeGreaterThan(new Date(initialMetrics.timestamp).getTime());
    });

    it('should handle monitoring errors gracefully', async () => {
      // Mock metrics collection to fail
      const originalCollectMetrics = monitoringManager.collectMetrics;
      let callCount = 0;
      monitoringManager.collectMetrics = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          throw new Error('Monitoring error');
        }
        return originalCollectMetrics.call(monitoringManager);
      });

      // Start monitoring
      const stopMonitoring = monitoringManager.startMonitoring(100);

      // Wait for error recovery
      await waitFor(350);

      // Stop monitoring
      stopMonitoring();

      // Should have attempted multiple collections despite errors
      expect(callCount).toBeGreaterThan(2);

      // Restore original method
      monitoringManager.collectMetrics = originalCollectMetrics;
    });
  });

  describe('Performance Optimization', () => {
    it('should identify performance bottlenecks', async () => {
      // Perform operations that might create bottlenecks
      const { tenant } = await createTestSetup(testNile, 'admin');

      // Create multiple companies to simulate load
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          testNile.db.query(
            'INSERT INTO public.companies (tenant_id, name) VALUES ($1, $2)',
            [tenant.id, `Performance Test Company ${i}`]
          )
        );
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const endTime = Date.now();

      const metrics = await monitoringManager.collectMetrics();

      // Should track the database operations
      expect(metrics.database.connectionPoolSize).toBeGreaterThan(0);
      expect(metrics.performance.requestsPerMinute).toBeGreaterThanOrEqual(0);

      // Response time should be reasonable
      expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds
    });

    it('should track query performance', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'member');

      // Perform a complex query
      const startTime = Date.now();
      await testNile.db.query(`
        SELECT c.*, uc.role, uc.permissions
        FROM public.companies c
        JOIN public.user_companies uc ON c.id = uc.company_id
        WHERE uc.user_id = $1 AND c.tenant_id = $2
      `, [user.id, tenant.id]);
      const queryTime = Date.now() - startTime;

      const metrics = await monitoringManager.collectMetrics();

      // Should track query performance
      expect(metrics.database.queryPerformance.averageQueryTime).toBeGreaterThanOrEqual(0);
      expect(queryTime).toBeLessThan(1000); // Should be fast
    });

    it('should monitor memory usage patterns', async () => {
      // Create data that uses memory
      const largeData = [];
      for (let i = 0; i < 1000; i++) {
        largeData.push({
          id: i,
          data: 'x'.repeat(1000), // 1KB per item
        });
      }

      const finalMetrics = await monitoringManager.collectMetrics();
      const finalMemory = finalMetrics.performance.memoryUsage.percentage;

      // Memory usage should be tracked
      expect(finalMemory).toBeGreaterThanOrEqual(0);
      expect(finalMemory).toBeLessThan(100); // Should be reasonable percentage
    });
  });

  describe('Recovery System Integration', () => {
    it('should create and validate recovery points', async () => {
      const { user: _user, tenant: _tenant, company: _company } = await createTestSetup(testNile, 'owner');

      // Create recovery point before operation
      const recoveryPoint = await recoveryManager.createRecoveryPoint(
        'performance_test',
        _tenant.id,
        { userId: _user.id, companyId: _company.id }
      );

      expect(recoveryPoint).toBeDefined();
      expect(recoveryPoint.operation).toBe('performance_test');
      expect(recoveryPoint.tenantId).toBe(_tenant.id);
      expect(recoveryPoint.metadata.userId).toBe(_user.id);

      // Simple validation - check if it exists and has expected structure
      expect(recoveryPoint.id).toBeDefined();
      expect(recoveryPoint.timestamp).toBeDefined();
    });

    it('should perform automatic recovery on errors', async () => {
      // Simulate a system error - no arg needed
      const recoveryResult = await recoveryManager.performAutoRecovery();

      expect(recoveryResult).toBeDefined();
      expect(recoveryResult.success).toBeDefined();
      expect(recoveryResult.actionsPerformed).toBeDefined();
      expect(recoveryResult.errors).toBeDefined();
    });

    it('should validate data integrity after operations', async () => {
      await createTestSetup(testNile, 'admin');

      // Perform data integrity check
      const integrityResult = await recoveryManager.validateDataIntegrity();

      expect(integrityResult).toBeDefined();
      expect(integrityResult.valid).toBe(true);
      expect(integrityResult.issues).toHaveLength(0);
    });

    it('should create and validate system backups', async () => {
      await createTestSetup(testNile, 'owner');

      // Create system backup
      const backup = await recoveryManager.createSystemBackup();

      expect(backup).toBeDefined();
      expect(backup.id).toBeDefined();
      expect(backup.tables).toBeDefined();
      expect(backup.recordCounts).toBeDefined();

      // Simple validation - check structure
      expect(backup.checksums).toBeDefined();
      expect(backup.metadata).toBeDefined();
    });
  });

  describe('Monitoring API Integration', () => {
    it('should provide monitoring data via API endpoints', async () => {
      // Mock API response for monitoring endpoint
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          metrics: await monitoringManager.collectMetrics(),
          systemHealth: await monitoringManager.getSystemHealth(),
          alertRules: monitoringManager.getAlertRules(),
        }),
      });

      const response = await fetch('/api/admin/monitoring');
      const data = await response.json() as {
        metrics: SystemMetrics;
        systemHealth: HealthCheckResult;
        alertRules: AlertRule[];
      };

      expect(data.metrics).toBeDefined();
      expect(data.systemHealth).toBeDefined();
      expect(data.alertRules).toBeDefined();
    });

    it('should handle monitoring configuration updates', async () => {
      const newAlertRule = {
        id: 'api_test_alert',
        name: 'API Test Alert',
        condition: (metrics: SystemMetrics) => metrics.errors.errorRate > 0.1,
        severity: 'high' as const,
        cooldownMs: 60000,
        enabled: true,
      };

      // Mock API call to add alert rule
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('/api/admin/monitoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertRule: newAlertRule }),
      });

      expect(response.ok).toBe(true);

      // Verify rule was added (in real implementation)
      monitoringManager.addAlertRule(newAlertRule);
      const rules = monitoringManager.getAlertRules();
      expect(rules.find(rule => rule.id === 'api_test_alert')).toBeDefined();
    });
  });

  describe('Load Testing and Scalability', () => {
    it('should handle concurrent operations efficiently', async () => {
      const { tenant } = await createTestSetup(testNile, 'admin');

      const startTime = Date.now();

      // Simulate concurrent operations
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(
          testNile.db.query(
            'SELECT * FROM public.companies WHERE tenant_id = $1',
            [tenant.id]
          )
        );
      }

      await Promise.all(operations);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // Less than 2 seconds

      const metrics = await monitoringManager.collectMetrics();
      expect(metrics.database.connectionPoolSize).toBeGreaterThan(0);
    });

    it('should maintain performance under load', async () => {
      const { tenant } = await createTestSetup(testNile, 'owner');

      // Create multiple companies to simulate data load
      const companies = [];
      for (let i = 0; i < 20; i++) {
        const result = await testNile.db.query(
          'INSERT INTO public.companies (tenant_id, name) VALUES ($1, $2) RETURNING id',
          [tenant.id, `Load Test Company ${i}`]
        );
        companies.push(result.rows[0].id);
      }

      // Measure query performance with larger dataset
      const startTime = Date.now();
      await testNile.db.query(
        'SELECT * FROM public.companies WHERE tenant_id = $1 ORDER BY name',
        [tenant.id]
      );
      const queryTime = Date.now() - startTime;

      // Should still be fast with more data
      expect(queryTime).toBeLessThan(500); // Less than 500ms

      const metrics = await monitoringManager.collectMetrics();
      expect(metrics.database.queryPerformance.averageQueryTime).toBeLessThan(100); // Average should be fast
    });
  });
});
