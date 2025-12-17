/**
 * Unit tests for ConvexQueryHelper
 * 
 * Tests the core functionality of the ConvexQueryHelper utility
 * to ensure it properly handles Convex type issues while maintaining
 * full runtime functionality.
 */

// Mock the dependencies to avoid Jest ES module issues
jest.mock('../runtime-performance-monitor', () => ({
  getGlobalRuntimeMonitor: () => ({
    recordMetric: jest.fn(),
  }),
}));

jest.mock('@/lib/services/analytics/BaseAnalyticsService', () => ({
  AnalyticsError: class AnalyticsError extends Error {
    constructor(public type: string, message: string, public domain: string, public retryable: boolean = false, public retryAfter?: number) {
      super(message);
      this.name = 'AnalyticsError';
    }
  },
  AnalyticsErrorType: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
}));

import { ConvexQueryHelper, createConvexHelper, createAnalyticsConvexHelper, ConvexQueryError } from '../convex-query-helper';
import { ConvexHttpClient } from "convex/browser";
import { FunctionReference } from "convex/server";

// Mock ConvexHttpClient
const mockConvexClient = {
  query: jest.fn(),
  mutation: jest.fn(),
} as unknown as ConvexHttpClient;

// Mock function references
const mockQueryFn = {
  _name: 'testQuery',
  toString: () => 'function testQuery() {}',
} as unknown as FunctionReference<"query">;

const mockMutationFn = {
  _name: 'testMutation',
  toString: () => 'function testMutation() {}',
} as unknown as FunctionReference<"mutation">;

describe('ConvexQueryHelper', () => {
  let helper: ConvexQueryHelper;

  beforeEach(() => {
    jest.clearAllMocks();
    helper = new ConvexQueryHelper(mockConvexClient);
  });

  describe('query method', () => {
    it('should execute successful queries with proper typing', async () => {
      const mockResult = { id: '123', name: 'test' };
      (mockConvexClient.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await helper.query<typeof mockResult>(mockQueryFn, { param: 'value' });

      expect(result).toEqual(mockResult);
      expect(mockConvexClient.query).toHaveBeenCalledWith(mockQueryFn, { param: 'value' });
    });

    it('should handle query failures gracefully', async () => {
      const mockError = new Error('Query failed');
      (mockConvexClient.query as jest.Mock).mockRejectedValue(mockError);

      await expect(
        helper.query(mockQueryFn, { param: 'value' })
      ).rejects.toThrow(ConvexQueryError);
    });

    it('should validate function references when validation is enabled', async () => {
      await expect(
        helper.query(null as unknown as FunctionReference<"query">, { param: 'value' })
      ).rejects.toThrow('Invalid query function');
    });

    it('should validate query arguments', async () => {
      await expect(
        helper.query(mockQueryFn, null as unknown as Record<string, unknown>)
      ).rejects.toThrow('Query arguments cannot be null or undefined');
    });

    it('should include execution context in queries', async () => {
      const mockResult = { success: true };
      (mockConvexClient.query as jest.Mock).mockResolvedValue(mockResult);

      const context = {
        serviceName: 'TestService',
        methodName: 'testMethod',
      };

      const result = await helper.query(mockQueryFn, { param: 'value' }, context);

      expect(result).toEqual(mockResult);
    });
  });

  describe('mutation method', () => {
    it('should execute successful mutations with proper typing', async () => {
      const mockResult = { id: '456', updated: true };
      (mockConvexClient.mutation as jest.Mock).mockResolvedValue(mockResult);

      const result = await helper.mutation<typeof mockResult>(mockMutationFn, { param: 'value' });

      expect(result).toEqual(mockResult);
      expect(mockConvexClient.mutation).toHaveBeenCalledWith(mockMutationFn, { param: 'value' });
    });

    it('should handle mutation failures gracefully', async () => {
      const mockError = new Error('Mutation failed');
      (mockConvexClient.mutation as jest.Mock).mockRejectedValue(mockError);

      await expect(
        helper.mutation(mockMutationFn, { param: 'value' })
      ).rejects.toThrow(ConvexQueryError);
    });
  });

  describe('healthCheck method', () => {
    it('should return true for healthy client', async () => {
      const isHealthy = await helper.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false for null client', async () => {
      const helperWithNullClient = new ConvexQueryHelper(null as unknown as ConvexHttpClient);
      const isHealthy = await helperWithNullClient.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should accept custom configuration', () => {
      const customConfig = {
        enableValidation: false,
        enableMonitoring: false,
        queryTimeout: 5000,
      };

      const customHelper = new ConvexQueryHelper(mockConvexClient, customConfig);
      expect(customHelper).toBeInstanceOf(ConvexQueryHelper);
    });

    it('should allow configuration updates', () => {
      helper.updateConfig({ enableValidation: false });
      // Configuration update should not throw
      expect(helper).toBeInstanceOf(ConvexQueryHelper);
    });
  });

  describe('metrics', () => {
    it('should track performance metrics when monitoring is enabled', async () => {
      const mockResult = { success: true };
      (mockConvexClient.query as jest.Mock).mockResolvedValue(mockResult);

      await helper.query(mockQueryFn, { param: 'value' });

      const metrics = helper.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toHaveProperty('executionTime');
      expect(metrics[0]).toHaveProperty('success', true);
    });

    it('should clear metrics when requested', async () => {
      const mockResult = { success: true };
      (mockConvexClient.query as jest.Mock).mockResolvedValue(mockResult);

      await helper.query(mockQueryFn, { param: 'value' });
      expect(helper.getMetrics().length).toBeGreaterThan(0);

      helper.clearMetrics();
      expect(helper.getMetrics().length).toBe(0);
    });
  });
});

describe('Factory Functions', () => {
  describe('createConvexHelper', () => {
    it('should create ConvexQueryHelper instance', () => {
      const helper = createConvexHelper(mockConvexClient);
      expect(helper).toBeInstanceOf(ConvexQueryHelper);
    });

    it('should accept custom configuration', () => {
      const config = { enableValidation: false };
      const helper = createConvexHelper(mockConvexClient, config);
      expect(helper).toBeInstanceOf(ConvexQueryHelper);
    });
  });

  describe('createAnalyticsConvexHelper', () => {
    it('should create ConvexQueryHelper with analytics configuration', () => {
      const helper = createAnalyticsConvexHelper(mockConvexClient, 'TestService');
      expect(helper).toBeInstanceOf(ConvexQueryHelper);
    });

    it('should configure error handler for analytics services', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const helper = createAnalyticsConvexHelper(mockConvexClient, 'TestService');

      const mockError = new Error('Test error');
      (mockConvexClient.query as jest.Mock).mockRejectedValue(mockError);

      await expect(helper.query(mockQueryFn, { param: 'value' })).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

describe('ConvexQueryError', () => {
  it('should properly categorize network errors', () => {
    const networkError = new Error('Network connection failed');
    const convexError = new ConvexQueryError(
      networkError,
      'testQuery',
      { param: 'value' },
      'test-context'
    );

    expect(convexError.queryName).toBe('testQuery');
    expect(convexError.context).toBe('test-context');
    expect(convexError.retryable).toBe(true);
  });

  it('should preserve original error information', () => {
    const originalError = new Error('Original error message');
    originalError.stack = 'Original stack trace';

    const convexError = new ConvexQueryError(
      originalError,
      'testQuery',
      { param: 'value' },
      'test-context',
      1000
    );

    expect(convexError.message).toContain('Original error message');
    expect(convexError.stack).toBe('Original stack trace');
    expect(convexError.executionTime).toBe(1000);
  });
});
