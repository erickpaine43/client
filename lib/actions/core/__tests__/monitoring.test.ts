/**
 * Tests for monitoring and performance tracking utilities
 */

import {
  recordError,
  recordPerformance,
  recordConvexPerformance,
  withPerformanceMonitoring,
  getMetrics,
  clearMetrics,
  hasHighErrorRates,
  getSlowActions,
  getSlowConvexQueries,
} from '../monitoring';
import { ActionError } from '../errors';

describe('Monitoring Utilities', () => {
  beforeEach(() => {
    clearMetrics();
    jest.clearAllMocks();
  });

  describe('recordError', () => {
    it('should record error metrics', () => {
      const error = new ActionError('validation', 'Test error', 'TEST_CODE');
      
      recordError(error, 'testAction', {
        userId: 'user123',
        companyId: 'company456',
      });

      const metrics = getMetrics();
      expect(metrics.errors).toHaveLength(1);
      expect(metrics.errors[0]).toMatchObject({
        errorType: 'validation',
        errorCode: 'TEST_CODE',
        actionName: 'testAction',
        userId: 'user123',
        companyId: 'company456',
        count: 1,
      });
    });

    it('should record multiple errors', () => {
      const error1 = new ActionError('validation', 'Error 1');
      const error2 = new ActionError('auth', 'Error 2');
      
      recordError(error1, 'action1');
      recordError(error2, 'action2');

      const metrics = getMetrics();
      expect(metrics.errors).toHaveLength(2);
      expect(metrics.errors[0].errorType).toBe('validation');
      expect(metrics.errors[1].errorType).toBe('auth');
    });
  });

  describe('recordPerformance', () => {
    it('should record performance metrics', () => {
      recordPerformance('testAction', 1500, true, {
        userId: 'user123',
        memoryUsage: 1024,
        cacheHit: true,
      });

      const metrics = getMetrics();
      expect(metrics.performance).toHaveLength(1);
      expect(metrics.performance[0]).toMatchObject({
        actionName: 'testAction',
        duration: 1500,
        success: true,
        userId: 'user123',
        memoryUsage: 1024,
        cacheHit: true,
      });
    });

    it('should record failed performance metrics', () => {
      recordPerformance('testAction', 2000, false, {
        errorType: 'server',
      });

      const metrics = getMetrics();
      expect(metrics.performance[0]).toMatchObject({
        actionName: 'testAction',
        duration: 2000,
        success: false,
        errorType: 'server',
      });
    });
  });

  describe('recordConvexPerformance', () => {
    it('should record Convex performance metrics', () => {
      recordConvexPerformance(
        'testQuery',
        3000,
        true,
        { param: 'value' },
        'test-context',
        {
          retryCount: 1,
          cacheHit: false,
        }
      );

      const metrics = getMetrics();
      expect(metrics.convex).toHaveLength(1);
      expect(metrics.convex[0]).toMatchObject({
        queryName: 'testQuery',
        executionTime: 3000,
        success: true,
        args: { param: 'value' },
        context: 'test-context',
        retryCount: 1,
        cacheHit: false,
      });
    });
  });

  describe('withPerformanceMonitoring', () => {
    it('should monitor successful function execution', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const monitoredFn = withPerformanceMonitoring('testAction', mockFn);

      const result = await monitoredFn('arg1', 'arg2');

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

      const metrics = getMetrics();
      expect(metrics.performance).toHaveLength(1);
      expect(metrics.performance[0]).toMatchObject({
        actionName: 'testAction',
        success: true,
      });
      expect(metrics.performance[0].duration).toBeGreaterThanOrEqual(0);
    });

    it('should monitor failed function execution', async () => {
      const error = new ActionError('validation', 'Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const monitoredFn = withPerformanceMonitoring('testAction', mockFn);

      await expect(monitoredFn()).rejects.toThrow('Test error');

      const metrics = getMetrics();
      expect(metrics.performance).toHaveLength(1);
      expect(metrics.performance[0]).toMatchObject({
        actionName: 'testAction',
        success: false,
        errorType: 'validation',
      });
    });

    it('should monitor generic error execution', async () => {
      const error = new Error('Generic error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const monitoredFn = withPerformanceMonitoring('testAction', mockFn);

      await expect(monitoredFn()).rejects.toThrow('Generic error');

      const metrics = getMetrics();
      expect(metrics.performance[0]).toMatchObject({
        actionName: 'testAction',
        success: false,
        errorType: 'server',
      });
    });
  });

  describe('getMetrics', () => {
    it('should return comprehensive metrics', () => {
      // Record some test data
      const error = new ActionError('validation', 'Test error');
      recordError(error, 'testAction');
      recordPerformance('testAction', 1000, true);
      recordConvexPerformance('testQuery', 500, true, {}, 'context');

      const metrics = getMetrics();

      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('performance');
      expect(metrics).toHaveProperty('convex');
      expect(metrics).toHaveProperty('errorRates');
      expect(metrics).toHaveProperty('summary');

      expect(metrics.errors).toHaveLength(1);
      expect(metrics.performance).toHaveLength(1);
      expect(metrics.convex).toHaveLength(1);
    });

    it('should calculate summary statistics', () => {
      // Record multiple metrics
      recordError(new ActionError('validation', 'Error 1'), 'action1');
      recordError(new ActionError('auth', 'Error 2'), 'action2');
      recordError(new ActionError('validation', 'Error 3'), 'action1');
      
      recordPerformance('action1', 1000, true);
      recordPerformance('action2', 2000, false);
      recordPerformance('action1', 1500, true);

      const metrics = getMetrics();
      const summary = metrics.summary;

      expect(summary.totalErrors).toBe(3);
      expect(summary.totalActions).toBe(3);
      expect(summary.averageResponseTime).toBe(1500); // (1000 + 2000 + 1500) / 3
      
      expect(summary.topErrors).toHaveLength(2);
      expect(summary.topErrors[0]).toMatchObject({
        type: 'validation',
        count: 2,
      });
      expect(summary.topErrors[1]).toMatchObject({
        type: 'auth',
        count: 1,
      });

      expect(summary.slowestActions).toHaveLength(2);
      expect(summary.slowestActions[0].name).toBe('action2');
      expect(summary.slowestActions[0].avgDuration).toBe(2000);
    });
  });

  describe('hasHighErrorRates', () => {
    it('should detect high error rates', () => {
      // Record multiple errors for same action to trigger high error rate
      const error = new ActionError('server', 'Server error');
      
      // Record 5 errors (should trigger high error rate)
      for (let i = 0; i < 5; i++) {
        recordError(error, 'problematicAction');
      }

      expect(hasHighErrorRates()).toBe(true);
    });

    it('should return false for low error rates', () => {
      // Don't record any errors, should return false
      expect(hasHighErrorRates()).toBe(false);
    });
  });

  describe('getSlowActions', () => {
    it('should identify slow actions', () => {
      recordPerformance('fastAction', 100, true);
      recordPerformance('slowAction', 6000, true);
      recordPerformance('mediumAction', 3000, true);

      const slowActions = getSlowActions(5000);

      expect(slowActions).toHaveLength(1);
      expect(slowActions[0]).toMatchObject({
        actionName: 'slowAction',
        duration: 6000,
      });
    });

    it('should sort by duration descending', () => {
      recordPerformance('action1', 8000, true);
      recordPerformance('action2', 6000, true);
      recordPerformance('action3', 7000, true);

      const slowActions = getSlowActions(5000);

      expect(slowActions).toHaveLength(3);
      expect(slowActions[0].duration).toBe(8000);
      expect(slowActions[1].duration).toBe(7000);
      expect(slowActions[2].duration).toBe(6000);
    });
  });

  describe('getSlowConvexQueries', () => {
    it('should identify slow Convex queries', () => {
      recordConvexPerformance('fastQuery', 1000, true, {}, 'context');
      recordConvexPerformance('slowQuery', 5000, true, {}, 'context');
      recordConvexPerformance('mediumQuery', 2000, true, {}, 'context');

      const slowQueries = getSlowConvexQueries(3000);

      expect(slowQueries).toHaveLength(1);
      expect(slowQueries[0]).toMatchObject({
        queryName: 'slowQuery',
        executionTime: 5000,
      });
    });

    it('should sort by execution time descending', () => {
      recordConvexPerformance('query1', 6000, true, {}, 'context');
      recordConvexPerformance('query2', 4000, true, {}, 'context');
      recordConvexPerformance('query3', 5000, true, {}, 'context');

      const slowQueries = getSlowConvexQueries(3000);

      expect(slowQueries).toHaveLength(3);
      expect(slowQueries[0].executionTime).toBe(6000);
      expect(slowQueries[1].executionTime).toBe(5000);
      expect(slowQueries[2].executionTime).toBe(4000);
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      // Record some data
      recordError(new ActionError('validation', 'Error'), 'action');
      recordPerformance('action', 1000, true);
      recordConvexPerformance('query', 500, true, {}, 'context');

      expect(getMetrics().errors).toHaveLength(1);
      expect(getMetrics().performance).toHaveLength(1);
      expect(getMetrics().convex).toHaveLength(1);

      clearMetrics();

      const metrics = getMetrics();
      expect(metrics.errors).toHaveLength(0);
      expect(metrics.performance).toHaveLength(0);
      expect(metrics.convex).toHaveLength(0);
    });
  });

  describe('error rate tracking', () => {
    it('should track error rates over time', () => {
      const error = new ActionError('server', 'Server error');
      
      // Record multiple errors for the same action
      recordError(error, 'testAction');
      recordError(error, 'testAction');
      recordError(error, 'testAction');

      const metrics = getMetrics();
      expect(metrics.errorRates).toHaveLength(1);
      expect(metrics.errorRates[0]).toMatchObject({
        actionName: 'testAction',
        errorCount: 3,
        totalRequests: 3,
        errorRate: 100,
      });
    });
  });
});
