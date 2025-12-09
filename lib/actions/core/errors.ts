/**
 * Standardized error handling utilities for server actions
 * 
 * This module provides consistent error creation, handling, and response
 * formatting across all action modules.
 */

import { ActionResult, ActionError as IActionError, ActionErrorType } from './types';

// Import ConvexQueryError for integration
type ConvexQueryError = {
  name: string;
  message: string;
  queryName: string;
  args: Record<string, unknown>;
  context: string;
  executionTime?: number;
  retryable?: boolean;
};

/**
 * Custom error class for action-specific errors
 */
export class ActionError extends Error {
  constructor(
    public type: ActionErrorType,
    message: string,
    public code?: string,
    public field?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ActionError';
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ActionError);
    }
  }
}

/**
 * Create a successful action result
 */
export function createActionResult<T>(data: T): ActionResult<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error action result
 */
export function createActionError(
  type: ActionErrorType,
  message: string,
  code?: string,
  field?: string,
  details?: Record<string, unknown>
): ActionResult<never> {
  return {
    success: false,
    error: {
      type,
      message,
      code,
      field,
      details,
    } as IActionError,
  };
}

/**
 * Error factory functions for common error scenarios
 */
export const ErrorFactory = {
  /**
   * Authentication required error
   */
  authRequired(message = 'Authentication required'): ActionResult<never> {
    return createActionError('auth', message, 'AUTH_REQUIRED');
  },

  /**
   * Insufficient permissions error
   */
  unauthorized(message = 'Insufficient permissions'): ActionResult<never> {
    return createActionError('permission', message, 'UNAUTHORIZED');
  },

  /**
   * Validation error with field information
   */
  validation(
    message: string,
    field?: string,
    code = 'VALIDATION_FAILED'
  ): ActionResult<never> {
    return createActionError('validation', message, code, field);
  },

  /**
   * Required field error
   */
  requiredField(field: string): ActionResult<never> {
    return createActionError(
      'validation',
      `${field} is required`,
      'REQUIRED_FIELD',
      field
    );
  },

  /**
   * Invalid format error
   */
  invalidFormat(
    field: string,
    expectedFormat?: string
  ): ActionResult<never> {
    const message = expectedFormat
      ? `Invalid ${field} format. Expected: ${expectedFormat}`
      : `Invalid ${field} format`;
    
    return createActionError('validation', message, 'INVALID_FORMAT', field);
  },

  /**
   * Resource not found error
   */
  notFound(resource = 'Resource'): ActionResult<never> {
    return createActionError('not_found', `${resource} not found`, 'NOT_FOUND');
  },

  /**
   * Resource conflict error
   */
  conflict(message: string): ActionResult<never> {
    return createActionError('conflict', message, 'CONFLICT');
  },

  /**
   * Rate limit exceeded error
   */
  rateLimit(
    message = 'Rate limit exceeded. Please try again later.'
  ): ActionResult<never> {
    return createActionError('rate_limit', message, 'RATE_LIMIT_EXCEEDED');
  },

  /**
   * Network/connectivity error
   */
  network(message = 'Network error occurred'): ActionResult<never> {
    return createActionError('network', message, 'NETWORK_ERROR');
  },

  /**
   * Internal server error
   */
  internal(
    message = 'Internal server error',
    details?: Record<string, unknown>
  ): ActionResult<never> {
    return createActionError('server', message, 'INTERNAL_ERROR', undefined, details);
  },

  /**
   * Database operation error
   */
  database(message = 'Database operation failed'): ActionResult<never> {
    return createActionError('server', message, 'DATABASE_ERROR');
  },

  /**
   * Convex query error
   */
  convex(
    message: string,
    queryName?: string,
    context?: Record<string, unknown>
  ): ActionResult<never> {
    return createActionError('server', message, 'CONVEX_ERROR', undefined, {
      queryName,
      context,
    });
  },
};

/**
 * Convert unknown error to ActionResult
 */
export function handleUnknownError(error: unknown): ActionResult<never> {
  if (error instanceof ActionError) {
    return createActionError(
      error.type,
      error.message,
      error.code,
      error.field,
      error.details
    );
  }

  // Handle ConvexQueryError specifically
  if (isConvexQueryError(error)) {
    return createActionError('server', error.message, 'CONVEX_ERROR', undefined, {
      queryName: error.queryName,
      args: error.args,
      context: error.context,
      executionTime: error.executionTime,
      retryable: error.retryable,
    });
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.name === 'ConvexError' || error.message.includes('Convex')) {
      return ErrorFactory.convex(error.message);
    }

    if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many requests')) {
      return ErrorFactory.rateLimit(error.message);
    }

    if (error.message.includes('not found')) {
      return ErrorFactory.notFound();
    }

    if (error.message.includes('unauthorized') || error.message.includes('permission')) {
      return ErrorFactory.unauthorized(error.message);
    }

    // Default to internal server error
    return ErrorFactory.internal(error.message);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return ErrorFactory.internal(error);
  }

  // Handle completely unknown errors
  return ErrorFactory.internal('An unexpected error occurred');
}

/**
 * Type guard to check if a value is an ActionResult.
 */
function isActionResult(value: unknown): value is ActionResult<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in (value as Record<string, unknown>)
  );
}

// Map a possibly-ActionResult type R to its success payload
type SuccessOf<R> = R extends ActionResult<infer U> ? U : R;

/**
 * Wrap an async operation with error handling
 */
export async function withErrorHandling<R>(
  operation: () => Promise<R>
): Promise<ActionResult<SuccessOf<R>>> {
  try {
    const result = await operation();
    // If the operation already returned an ActionResult, forward it as-is
    if (isActionResult(result)) {
      return result as ActionResult<SuccessOf<R>>;
    }
    return createActionResult(result as SuccessOf<R>);
  } catch (error) {
    return handleUnknownError(error);
  }
}

/**
 * Type guard to check if error is ConvexQueryError
 */
function isConvexQueryError(error: unknown): error is ConvexQueryError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'ConvexQueryError' &&
    'queryName' in error &&
    'args' in error &&
    'context' in error
  );
}

/**
 * Enhanced Convex error handling wrapper
 */
export async function withConvexErrorHandling<R>(
  operation: () => Promise<R>,
  context?: {
    actionName?: string;
    userId?: string;
    companyId?: string;
  }
): Promise<ActionResult<SuccessOf<R>>> {
  try {
    const result = await operation();
    if (isActionResult(result)) {
      return result as ActionResult<SuccessOf<R>>;
    }
    return createActionResult(result as SuccessOf<R>);
  } catch (error) {
    // Log ConvexQueryError with enhanced context
    if (isConvexQueryError(error)) {
      logConvexError(error, context);
    }
    
    return handleUnknownError(error);
  }
}

/**
 * Specialized logging for ConvexQueryError
 */
export function logConvexError(
  error: any,
  context?: { actionName?: string; userId?: string; companyId?: string }
) {
  // For testing, always log if NODE_ENV is "test" or "development"
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") return;

  const performance = {
    slow: !!(error.executionTime && error.executionTime > 3000),
    timeout: error.message?.includes("timeout") ?? false,
  };

  console.error(
    "Convex Query Error:",
    {
      error: {
        queryName: error.queryName,
        executionTime: error.executionTime,
        retryable: error.retryable,
        message: error.message,
      },
      performance,
      context: context ? { ...context } : {},
    }
  );

  // In production, send to monitoring service
  // Example: sendToConvexMonitoring(logData);
}

/**
 * Log error for monitoring and debugging
 */
export function logActionError(
  error: ActionError,
  context?: {
    actionName?: string;
    userId?: string;
    companyId?: string;
    requestId?: string;
  }
): void {
  // For testing, always log if NODE_ENV is "test" or "development"
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") return;

  console.error(
    "Action Error:",
    {
      error: {
        type: error.type,
        message: error.message,
        code: error.code,
        field: error.field,
        details: error.details,
      },
      context: context ? { ...context } : {},
    }
  );
}
