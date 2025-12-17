/**
 * Tests for enhanced error handling system
 */

import {
  ActionError,
  createActionResult,
  createActionError,
  ErrorFactory,
  handleUnknownError,
  withErrorHandling,
  withConvexErrorHandling,
  logActionError,
  logConvexError,
} from '../errors';
// ConvexQueryError type for testing
type ConvexQueryError = {
  name: string;
  message: string;
  queryName: string;
  args: Record<string, unknown>;
  context: string;
  executionTime?: number;
  retryable?: boolean;
};

// Mock ConvexQueryError for testing
const mockConvexQueryError = {
  name: 'ConvexQueryError',
  message: 'Query failed: timeout',
  queryName: 'testQuery',
  args: { param: 'value' },
  context: 'test-context',
  executionTime: 5000,
  retryable: true,
};

describe('Enhanced Error Handling', () => {
  beforeEach(() => {
    // Clear console mocks
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ActionError class', () => {
    it('should create ActionError with all properties', () => {
      const error = new ActionError(
        'validation',
        'Test error',
        'TEST_CODE',
        'testField',
        { extra: 'data' }
      );

      expect(error.type).toBe('validation');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.field).toBe('testField');
      expect(error.details).toEqual({ extra: 'data' });
      expect(error.name).toBe('ActionError');
    });

    it('should maintain proper stack trace', () => {
      const error = new ActionError('server', 'Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ErrorFactory', () => {
    it('should create auth required error', () => {
      const result = ErrorFactory.authRequired();
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('auth');
      expect(result.error?.code).toBe('AUTH_REQUIRED');
      expect(result.error?.message).toBe('Authentication required');
    });

    it('should create validation error with field', () => {
      const result = ErrorFactory.validation('Invalid email', 'email');
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('email');
      expect(result.error?.message).toBe('Invalid email');
    });

    it('should create Convex error with context', () => {
      const result = ErrorFactory.convex('Query failed', 'testQuery', { args: {} });
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
      expect(result.error?.code).toBe('CONVEX_ERROR');
      expect(result.error?.details?.queryName).toBe('testQuery');
    });

    it('should create rate limit error', () => {
      const result = ErrorFactory.rateLimit();
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('rate_limit');
      expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('handleUnknownError', () => {
    it('should handle ActionError instances', () => {
      const actionError = new ActionError('validation', 'Test error', 'TEST_CODE');
      const result = handleUnknownError(actionError);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.code).toBe('TEST_CODE');
    });

    it('should handle ConvexQueryError instances', () => {
      const result = handleUnknownError(mockConvexQueryError);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
      expect(result.error?.code).toBe('CONVEX_ERROR');
      expect(result.error?.details?.queryName).toBe('testQuery');
      expect(result.error?.details?.executionTime).toBe(5000);
    });

    it('should handle generic Error instances', () => {
      const error = new Error('Generic error');
      const result = handleUnknownError(error);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
      expect(result.error?.message).toBe('Generic error');
    });

    it('should handle Convex-specific errors', () => {
      const convexError = new Error('ConvexError: Connection failed');
      convexError.name = 'ConvexError';
      const result = handleUnknownError(convexError);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
      expect(result.error?.code).toBe('CONVEX_ERROR');
    });

    it('should handle rate limit errors', () => {
      const rateLimitError = new Error('rate limit exceeded');
      const result = handleUnknownError(rateLimitError);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('rate_limit');
    });

    it('should handle string errors', () => {
      const result = handleUnknownError('String error');
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
      expect(result.error?.message).toBe('String error');
    });

    it('should handle unknown error types', () => {
      const result = handleUnknownError({ unknown: 'object' });
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
      expect(result.error?.message).toBe('An unexpected error occurred');
    });
  });

  describe('withErrorHandling', () => {
    it('should return success result for successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success data');
      const result = await withErrorHandling(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success data');
      expect(operation).toHaveBeenCalled();
    });

    it('should handle thrown errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const result = await withErrorHandling(operation);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Operation failed');
    });

    it('should handle ActionError instances', async () => {
      const actionError = new ActionError('validation', 'Validation failed');
      const operation = jest.fn().mockRejectedValue(actionError);
      const result = await withErrorHandling(operation);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });

  describe('withConvexErrorHandling', () => {
    it('should return success result for successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('convex data');
      const result = await withConvexErrorHandling(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('convex data');
    });

    it('should handle ConvexQueryError with enhanced logging', async () => {
      const operation = jest.fn().mockRejectedValue(mockConvexQueryError);
      const result = await withConvexErrorHandling(operation, {
        actionName: 'testAction',
        userId: 'user123',
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
      expect(result.error?.code).toBe('CONVEX_ERROR');
    });

    it('should handle generic errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Generic error'));
      const result = await withConvexErrorHandling(operation);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
    });
  });

  describe('logActionError', () => {
    it('should log error with context in development', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      
      // Use Object.defineProperty to modify read-only property
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      const error = new ActionError('validation', 'Test error', 'TEST_CODE');
      logActionError(error, {
        actionName: 'testAction',
        userId: 'user123',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Action Error:',
        expect.objectContaining({
          error: expect.objectContaining({
            type: 'validation',
            message: 'Test error',
            code: 'TEST_CODE',
          }),
          context: expect.objectContaining({
            actionName: 'testAction',
            userId: 'user123',
          }),
        })
      );

      // Restore original NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
      consoleSpy.mockRestore();
    });
  });

  describe('logConvexError', () => {
    it('should log ConvexQueryError with enhanced context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      
      // Use Object.defineProperty to modify read-only property
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      logConvexError(mockConvexQueryError as ConvexQueryError, {
        actionName: 'testAction',
        userId: 'user123',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Convex Query Error:',
        expect.objectContaining({
          error: expect.objectContaining({
            queryName: 'testQuery',
            executionTime: 5000,
            retryable: true,
          }),
          performance: expect.objectContaining({
            slow: true,
            timeout: true,
          }),
        })
      );

      // Restore original NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
      consoleSpy.mockRestore();
    });
  });

  describe('createActionResult', () => {
    it('should create successful result', () => {
      const result = createActionResult({ data: 'test' });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ data: 'test' });
      expect(result.error).toBeUndefined();
    });
  });

  describe('createActionError', () => {
    it('should create error result with all fields', () => {
      const result = createActionError(
        'validation',
        'Test error',
        'TEST_CODE',
        'testField',
        { extra: 'data' }
      );
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toBe('Test error');
      expect(result.error?.code).toBe('TEST_CODE');
      expect(result.error?.field).toBe('testField');
      expect(result.error?.details).toEqual({ extra: 'data' });
    });
  });
});
