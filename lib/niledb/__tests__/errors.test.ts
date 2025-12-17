/**
 * Error Handling System Test Suite
 * 
 * Comprehensive tests for the centralized error handling system
 * including error classification, recovery, and logging.
 */

import {
  NileDBError,
  AuthenticationError,
  TenantAccessError,
  ValidationError,
  DatabaseError,
  MigrationError,
  classifyDatabaseError,
  isNileDBError,
  isAuthenticationError,
  withRetry,
  createErrorResponse,
  logError,
} from '../errors';

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation();

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  mockConsoleError.mockRestore();
  mockConsoleWarn.mockRestore();
  mockConsoleInfo.mockRestore();
});

describe('NileDB Error Classes', () => {
  test('should create basic NileDB error', () => {
    const error = new NileDBError('Test error', 'TEST_CODE', 400, { key: 'value' });

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(400);
    expect(error.context).toEqual({ key: 'value' });
    expect(error.timestamp).toBeDefined();
    expect(error.name).toBe('NileDBError');
  });

  test('should create authentication error', () => {
    const error = new AuthenticationError('Auth failed', 'CUSTOM_AUTH_CODE');

    expect(error.message).toBe('Auth failed');
    expect(error.code).toBe('CUSTOM_AUTH_CODE');
    expect(error.statusCode).toBe(401);
    expect(error instanceof NileDBError).toBe(true);
    expect(error instanceof AuthenticationError).toBe(true);
  });

  test('should create tenant access error', () => {
    const error = new TenantAccessError('Access denied', 'tenant-123');

    expect(error.message).toBe('Access denied');
    expect(error.code).toBe('TENANT_ACCESS_DENIED');
    expect(error.statusCode).toBe(403);
    expect(error.context).toEqual({ tenantId: 'tenant-123' });
  });

  test('should create validation error', () => {
    const validationErrors = {
      email: ['Invalid email format'],
      name: ['Name is required'],
    };

    const error = new ValidationError('Validation failed', validationErrors);

    expect(error.message).toBe('Validation failed');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.context).toEqual({ validationErrors });
  });

  test('should create database error', () => {
    const originalError = new Error('Connection failed');
    const error = new DatabaseError('DB error', 'DB_CONNECTION_ERROR', originalError);

    expect(error.message).toBe('DB error');
    expect(error.code).toBe('DB_CONNECTION_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.context?.originalError).toBe('Connection failed');
  });

  test('should create migration error', () => {
    const error = new MigrationError('Migration failed', 'step_1', true, { records: 100 });

    expect(error.message).toBe('Migration failed');
    expect(error.code).toBe('MIGRATION_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.context).toEqual({
      step: 'step_1',
      rollbackAvailable: true,
      records: 100,
    });
  });

  test('should serialize error to JSON', () => {
    const error = new NileDBError('Test error', 'TEST_CODE', 400, { key: 'value' });
    const json = error.toJSON();

    expect(json).toEqual({
      error: 'Test error',
      code: 'TEST_CODE',
      timestamp: error.timestamp,
      context: { key: 'value' },
    });
  });
});

describe('Error Classification', () => {
  test('should classify PostgreSQL unique violation', () => {
    const pgError = {
      code: '23505',
      constraint: 'users_email_key',
      detail: 'Key (email)=(test@example.com) already exists.',
      message: 'duplicate key value violates unique constraint',
    };

    const classified = classifyDatabaseError(pgError);

    expect(classified.code).toBe('CONFLICT_ERROR');
    expect(classified.statusCode).toBe(409);
    expect(classified.context?.constraint).toBe('users_email_key');
  });

  test('should classify PostgreSQL foreign key violation', () => {
    const pgError = {
      code: '23503',
      constraint: 'fk_user_company',
      message: 'insert or update on table violates foreign key constraint',
    };

    const classified = classifyDatabaseError(pgError);

    expect(classified.code).toBe('VALIDATION_ERROR');
    expect(classified.statusCode).toBe(400);
  });

  test('should classify PostgreSQL connection error', () => {
    const pgError = {
      code: '08006',
      message: 'connection failure',
    };

    const classified = classifyDatabaseError(pgError);

    expect(classified.code).toBe('DATABASE_CONNECTION_ERROR');
    expect(classified.statusCode).toBe(500);
  });

  test('should classify unknown database error', () => {
    const unknownError = {
      code: 'UNKNOWN_CODE',
      message: 'Unknown database error',
    };

    const classified = classifyDatabaseError(unknownError);

    expect(classified.code).toBe('DATABASE_ERROR');
    expect(classified.statusCode).toBe(500);
  });
});

describe('Error Type Guards', () => {
  test('should identify NileDB errors', () => {
    const nileError = new NileDBError('Test');
    const regularError = new Error('Regular error');

    expect(isNileDBError(nileError)).toBe(true);
    expect(isNileDBError(regularError)).toBe(false);
    expect(isNileDBError('string')).toBe(false);
    expect(isNileDBError(null)).toBe(false);
  });

  test('should identify authentication errors', () => {
    const authError = new AuthenticationError('Auth failed');
    const nileError = new NileDBError('Test');
    const regularError = new Error('Regular error');

    expect(isAuthenticationError(authError)).toBe(true);
    expect(isAuthenticationError(nileError)).toBe(false);
    expect(isAuthenticationError(regularError)).toBe(false);
  });
});

describe('Error Recovery', () => {
  test('should retry retryable operations', async () => {
    let attempts = 0;
    const operation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new DatabaseError('Connection failed', 'DATABASE_CONNECTION_ERROR');
      }
      return 'success';
    });

    const result = await withRetry(operation, {
      maxRetries: 3,
      retryDelay: 10,
      exponentialBackoff: false,
    });

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  test('should not retry non-retryable errors', async () => {
    const operation = jest.fn().mockImplementation(() => {
      throw new ValidationError('Invalid input');
    });

    await expect(withRetry(operation, { maxRetries: 3 })).rejects.toThrow('Invalid input');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('should respect maximum retry attempts', async () => {
    const operation = jest.fn().mockImplementation(() => {
      throw new DatabaseError('Connection failed', 'DATABASE_CONNECTION_ERROR');
    });

    await expect(withRetry(operation, { maxRetries: 2 })).rejects.toThrow('Connection failed');
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  test('should use exponential backoff', async () => {
    const delays: number[] = [];
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((callback: () => void, delay?: number) => {
      delays.push(delay ?? 0);
      return setTimeout(callback, 0) as NodeJS.Timeout; // Execute immediately for testing
    });
    
    const operation = jest.fn().mockImplementation(() => {
      throw new DatabaseError('Connection failed', 'DATABASE_CONNECTION_ERROR');
    });
    
    try {
      await withRetry(operation, {
        maxRetries: 3,
        retryDelay: 100,
        exponentialBackoff: true,
      });
    } catch {
      // Expected to fail
    }
    
    expect(delays).toEqual([100, 200, 400]); // Exponential backoff
    
    setTimeoutSpy.mockRestore();
  });
});

describe('Error Logging', () => {
  test('should log error with context', () => {
    const error = new Error('Test error');
    const context = {
      userId: 'user-123',
      tenantId: 'tenant-456',
      operation: 'test_operation',
    };

    logError(error, context, 'error');

    expect(mockConsoleError).toHaveBeenCalledWith(
      'NileDB Error:',
      expect.objectContaining({
        level: 'error',
        error: expect.objectContaining({
          name: 'Error',
          message: 'Test error',
        }),
        context,
      })
    );
  });

  test('should log warning', () => {
    const error = new ValidationError('Validation failed');
    
    logError(error, {}, 'warn');

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'NileDB Warning:',
      expect.objectContaining({
        level: 'warn',
        error: expect.objectContaining({
          name: 'ValidationError',
          code: 'VALIDATION_ERROR',
        }),
      })
    );
  });

  test('should log info', () => {
    const error = new Error('Info message');
    
    logError(error, {}, 'info');

    expect(mockConsoleInfo).toHaveBeenCalledWith(
      'NileDB Info:',
      expect.objectContaining({
        level: 'info',
      })
    );
  });
});

describe('Error Response Creation', () => {
  test('should create response for NileDB error', () => {
    const error = new ValidationError('Invalid input', {
      email: ['Invalid format'],
    });

    const { body, status } = createErrorResponse(error, {
      userId: 'user-123',
      operation: 'test',
    });

    expect(status).toBe(400);
    expect(body).toEqual({
      error: 'Invalid input',
      code: 'VALIDATION_ERROR',
      timestamp: error.timestamp,
      context: {
        validationErrors: {
          email: ['Invalid format'],
        },
      },
    });
  });

  test('should create response for unknown error', () => {
    const error = new Error('Unknown error');

    const { body, status } = createErrorResponse(error);

    expect(status).toBe(500);
    expect(body).toEqual({
      error: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: expect.any(String),
    });
  });

  test('should log error when creating response', () => {
    const error = new Error('Test error');
    const context = { operation: 'test' };

    createErrorResponse(error, context);

    expect(mockConsoleError).toHaveBeenCalledWith(
      'NileDB Error:',
      expect.objectContaining({
        context,
      })
    );
  });
});
