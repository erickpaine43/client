/**
 * NileDB Error Handling System
 * 
 * Comprehensive error classes and utilities for consistent error handling
 * across the NileDB backend migration system.
 */

// Base Error Classes
export class NileDBError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'NILEDB_ERROR',
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      timestamp: this.timestamp,
      ...(this.context && { context: this.context }),
    };
  }
}

// Authentication Errors (extending existing from auth.ts)
export class AuthenticationError extends NileDBError {
  constructor(
    message: string,
    code: string = 'AUTH_REQUIRED',
    context?: Record<string, unknown>
  ) {
    super(message, code, 401, context);
  }
}

export class SessionExpiredError extends AuthenticationError {
  constructor(message: string = 'Session has expired') {
    super(message, 'SESSION_EXPIRED');
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message: string = 'Invalid credentials provided') {
    super(message, 'INVALID_CREDENTIALS');
  }
}

export class InsufficientPrivilegesError extends AuthenticationError {
  constructor(
    message: string = 'Insufficient privileges',
    requiredRole?: string,
    currentRole?: string
  ) {
    super(message, 'INSUFFICIENT_PRIVILEGES', {
      requiredRole,
      currentRole,
    });
    // Override statusCode after construction
    Object.defineProperty(this, 'statusCode', { value: 403, writable: false });
  }
}

// Tenant Errors
export class TenantError extends NileDBError {
  constructor(
    message: string,
    code: string = 'TENANT_ERROR',
    statusCode: number = 400,
    context?: Record<string, unknown>
  ) {
    super(message, code, statusCode, context);
  }
}

export class TenantAccessError extends TenantError {
  constructor(
    message: string = 'Tenant access denied',
    tenantId?: string
  ) {
    super(message, 'TENANT_ACCESS_DENIED', 403, { tenantId });
  }
}

export class TenantNotFoundError extends TenantError {
  constructor(
    message: string = 'Tenant not found',
    tenantId?: string
  ) {
    super(message, 'TENANT_NOT_FOUND', 404, { tenantId });
  }
}

export class TenantContextError extends TenantError {
  constructor(
    message: string = 'Tenant context required',
    operation?: string
  ) {
    super(message, 'TENANT_CONTEXT_REQUIRED', 400, { operation });
  }
}

// Company Errors
export class CompanyError extends NileDBError {
  constructor(
    message: string,
    code: string = 'COMPANY_ERROR',
    statusCode: number = 400,
    context?: Record<string, unknown>
  ) {
    super(message, code, statusCode, context);
  }
}

export class CompanyAccessError extends CompanyError {
  constructor(
    message: string = 'Company access denied',
    companyId?: string,
    tenantId?: string
  ) {
    super(message, 'COMPANY_ACCESS_DENIED', 403, { companyId, tenantId });
  }
}

export class CompanyNotFoundError extends CompanyError {
  constructor(
    message: string = 'Company not found',
    companyId?: string,
    tenantId?: string
  ) {
    super(message, 'COMPANY_NOT_FOUND', 404, { companyId, tenantId });
  }
}

export class CompanyValidationError extends CompanyError {
  constructor(
    message: string = 'Company validation failed',
    validationErrors?: Record<string, string[]>
  ) {
    super(message, 'COMPANY_VALIDATION_ERROR', 400, { validationErrors });
  }
}

// Database Errors
export class DatabaseError extends NileDBError {
  constructor(
    message: string,
    code: string = 'DATABASE_ERROR',
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, code, 500, {
      ...context,
      originalError: originalError?.message,
    });
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(
    message: string = 'Database connection failed',
    originalError?: Error
  ) {
    super(message, 'DATABASE_CONNECTION_ERROR', originalError);
  }
}

export class QueryError extends DatabaseError {
  constructor(
    message: string = 'Database query failed',
    query?: string,
    originalError?: Error
  ) {
    super(message, 'QUERY_ERROR', originalError, { query });
  }
}

export class TransactionError extends DatabaseError {
  constructor(
    message: string = 'Database transaction failed',
    originalError?: Error
  ) {
    super(message, 'TRANSACTION_ERROR', originalError);
  }
}

export class SchemaValidationError extends DatabaseError {
  constructor(
    message: string = 'Database schema validation failed',
    schemaErrors?: Record<string, string[]>
  ) {
    super(message, 'SCHEMA_VALIDATION_ERROR', undefined, { schemaErrors });
  }
}

// Validation Errors
export class ValidationError extends NileDBError {
  constructor(
    message: string = 'Input validation failed',
    validationErrors?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400, { validationErrors });
  }
}

export class ResourceNotFoundError extends NileDBError {
  constructor(
    message: string = 'Resource not found',
    resourceType?: string,
    resourceId?: string
  ) {
    super(message, 'RESOURCE_NOT_FOUND', 404, { resourceType, resourceId });
  }
}

export class ConflictError extends NileDBError {
  constructor(
    message: string = 'Resource conflict',
    conflictType?: string,
    conflictDetails?: Record<string, unknown>
  ) {
    super(message, 'CONFLICT_ERROR', 409, { conflictType, ...conflictDetails });
  }
}

// Migration Errors
export class MigrationError extends NileDBError {
  constructor(
    message: string,
    step?: string,
    rollbackAvailable: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message, 'MIGRATION_ERROR', 500, {
      step,
      rollbackAvailable,
      ...context,
    });
  }
}

export class DataMigrationError extends MigrationError {
  constructor(
    message: string = 'Data migration failed',
    step?: string,
    dataType?: string
  ) {
    super(message, step, true, { dataType });
    Object.defineProperty(this, 'code', { value: 'DATA_MIGRATION_ERROR', writable: false });
  }
}

export class DataIntegrityError extends MigrationError {
  constructor(
    message: string = 'Data integrity violation',
    violationType?: string,
    affectedRecords?: number
  ) {
    super(message, undefined, true, { violationType, affectedRecords });
    Object.defineProperty(this, 'code', { value: 'DATA_INTEGRITY_ERROR', writable: false });
  }
}

// Rate Limiting Errors
export class RateLimitError extends NileDBError {
  constructor(
    message: string = 'Rate limit exceeded',
    limit?: number,
    resetTime?: Date
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, {
      limit,
      resetTime: resetTime?.toISOString(),
    });
  }
}

// Service Unavailable Errors
export class ServiceUnavailableError extends NileDBError {
  constructor(
    message: string = 'Service temporarily unavailable',
    retryAfter?: number
  ) {
    super(message, 'SERVICE_UNAVAILABLE', 503, { retryAfter });
  }
}

// Error Utilities
export const isNileDBError = (error: unknown): error is NileDBError => {
  return error instanceof NileDBError;
};

export const isAuthenticationError = (error: unknown): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isTenantError = (error: unknown): error is TenantError => {
  return error instanceof TenantError;
};

export const isCompanyError = (error: unknown): error is CompanyError => {
  return error instanceof CompanyError;
};

export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return error instanceof DatabaseError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

// Error Classification
export const classifyDatabaseError = (error: unknown): DatabaseError => {
  let pgError: Record<string, unknown> | undefined;
  let message = 'Unknown database error';
  let code: string | undefined;

  if (error && typeof error === 'object') {
    pgError = error as Record<string, unknown>;
    message = (pgError.message as string) || message;
    code = pgError.code as string | undefined;
  }

  // PostgreSQL error codes
  switch (code) {
    case '23505': // unique_violation
      return new ConflictError('Duplicate entry detected', 'unique_violation', {
        constraint: pgError?.constraint as string | undefined,
        detail: pgError?.detail as string | undefined,
      });
    
    case '23503': // foreign_key_violation
      return new ValidationError('Referenced record not found', {
        constraint: [(pgError?.constraint as string) || 'Foreign key constraint violated'],
      });
    
    case '23502': // not_null_violation
      return new ValidationError('Required field missing', {
        column: [(pgError?.column as string) || 'Required field cannot be null'],
      });
    
    case '42P01': // undefined_table
      return new SchemaValidationError('Table not found', {
        table: [(pgError?.table as string) || 'Referenced table does not exist'],
      });
    
    case '42703': // undefined_column
      return new SchemaValidationError('Column not found', {
        column: [(pgError?.column as string) || 'Referenced column does not exist'],
      });
    
    case '08003': // connection_does_not_exist
    case '08006': // connection_failure
      return new DatabaseConnectionError('Database connection lost', pgError instanceof Error ? pgError : undefined);
    
    case '57014': // query_canceled
      return new QueryError('Query was canceled', pgError?.query as string | undefined, pgError instanceof Error ? pgError : undefined);
    
    case '53300': // too_many_connections
      return new ServiceUnavailableError('Database connection pool exhausted');
    
    default:
      return new DatabaseError(message, 'DATABASE_ERROR', pgError instanceof Error ? pgError : undefined);
  }
};

// Error Recovery Utilities
export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  retryableErrors?: string[];
}

export const isRetryableError = (error: unknown, retryableErrors?: string[]): boolean => {
  if (!isNileDBError(error)) return false;

  const defaultRetryableErrors = [
    'DATABASE_CONNECTION_ERROR',
    'QUERY_TIMEOUT',
    'SERVICE_UNAVAILABLE',
    'RATE_LIMIT_EXCEEDED',
  ];

  const retryable = retryableErrors || defaultRetryableErrors;
  return retryable.includes(error.code);
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    retryableErrors,
  } = options;

  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !isRetryableError(error, retryableErrors)) {
        throw error;
      }
      
      const delay = exponentialBackoff 
        ? retryDelay * Math.pow(2, attempt)
        : retryDelay;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Error Logging Utilities
export interface ErrorLogContext {
  userId?: string;
  tenantId?: string;
  companyId?: string;
  operation?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  recoveryPointId?: string;
  backupId?: string;
  table?: string;
  [key: string]: unknown;
}

export const logError = (
  error: unknown,
  context: ErrorLogContext = {},
  level: 'error' | 'warn' | 'info' = 'error'
): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    error: {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...(isNileDBError(error) && {
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
      }),
    },
    context,
  };

  switch (level) {
    case 'error':
      console.error('NileDB Error:', logData);
      break;
    case 'warn':
      console.warn('NileDB Warning:', logData);
      break;
    case 'info':
      console.info('NileDB Info:', logData);
      break;
  }
};

// Error Response Utilities for API Routes
export const createErrorResponse = (
  error: unknown,
  context?: ErrorLogContext
): { body: Record<string, unknown>; status: number } => {
  // Log the error
  logError(error, context);

  if (isNileDBError(error)) {
    return {
      body: error.toJSON(),
      status: error.statusCode,
    };
  }

  // Handle unknown errors
  const unknownError = new NileDBError(
    'An unexpected error occurred',
    'INTERNAL_SERVER_ERROR',
    500
  );

  return {
    body: unknownError.toJSON(),
    status: unknownError.statusCode,
  };
};
