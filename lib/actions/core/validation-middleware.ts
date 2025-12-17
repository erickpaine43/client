/**
 * Validation middleware for server actions
 * 
 * This module provides middleware functions that can be easily applied to action functions
 * to ensure consistent validation patterns across all action modules.
 */

import { ActionResult, ActionContext } from './types';
import { ErrorFactory } from './errors';
import {
  ValidationSchema,
  validateSchema,
  validationToActionResult,
  validateAnalyticsFilters,
  validatePagination,
  validateId,
  validatePerformanceMetrics,
  isAnalyticsFilters,
  isPerformanceMetrics,
} from './validation';
import {
  analyticsFiltersSchema,
  performanceMetricsSchema,
  paginationSchema,
  getAnalyticsSchema,
} from './validation-schemas';
import type { AnalyticsFilters } from '../../../types/analytics/core';

// ============================================================================
// VALIDATION MIDDLEWARE TYPES
// ============================================================================

export interface ValidationMiddlewareOptions<T = unknown> {
  schema?: ValidationSchema<T>;
  skipValidation?: boolean;
  customValidator?: (data: unknown) => ActionResult<T>;
  transformData?: (data: T) => T;
}

export interface ValidatedActionHandler<TInput, TOutput> {
  (data: TInput, context?: ActionContext): Promise<ActionResult<TOutput>>;
}

export interface ValidationConfig {
  required?: boolean;
  allowEmpty?: boolean;
  customMessage?: string;
}

// ============================================================================
// CORE VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Generic validation middleware that can be applied to any action
 */
export function withValidation<TInput, TOutput>(
  schema: ValidationSchema<TInput>,
  handler: ValidatedActionHandler<TInput, TOutput>,
  options: ValidationMiddlewareOptions<TInput> = {}
): (data: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return async (data: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
    // Skip validation if explicitly requested
    if (options.skipValidation) {
      return handler(data as TInput, context);
    }

    // Use custom validator if provided
    if (options.customValidator) {
      const validationResult = options.customValidator(data);
      if (!validationResult.success) {
        return validationResult as unknown as ActionResult<TOutput>;
      }
      data = validationResult.data;
    } else {
      // Use schema validation
      const validationResult = validateSchema(data, schema);
      if (!validationResult.isValid) {
        return validationToActionResult(validationResult) as unknown as ActionResult<TOutput>;
      }
      data = validationResult.data;
    }

    // Transform data if transformer provided
    if (options.transformData && data) {
      data = options.transformData(data as TInput);
    }

    return handler(data as TInput, context);
  };
}

/**
 * Validation middleware specifically for analytics filters
 */
export function withAnalyticsFiltersValidation<TOutput>(
  handler: ValidatedActionHandler<AnalyticsFilters | undefined, TOutput>,
  config: ValidationConfig = {}
): (filters: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return async (filters: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
    // Handle undefined/null filters
    if (!filters) {
      if (config.required) {
        return ErrorFactory.validation(
          config.customMessage || 'Analytics filters are required'
        ) as ActionResult<TOutput>;
      }
      return handler(undefined, context);
    }

    // Handle empty object
    if (typeof filters === 'object' && Object.keys(filters).length === 0) {
      if (!config.allowEmpty && config.required) {
        return ErrorFactory.validation(
          config.customMessage || 'Analytics filters cannot be empty'
        ) as ActionResult<TOutput>;
      }
      return handler(filters as AnalyticsFilters, context);
    }

    // Validate filters
    const validationResult = validateAnalyticsFilters(filters);
    if (!validationResult.isValid) {
      return validationToActionResult(validationResult) as ActionResult<TOutput>;
    }

    return handler(validationResult.data, context);
  };
}

/**
 * Validation middleware for pagination parameters
 */
export function withPaginationValidation<TOutput>(
  handler: ValidatedActionHandler<{ limit: number; offset: number }, TOutput>
): (params: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return async (params: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
    const validationResult = validatePagination(params);
    if (!validationResult.isValid) {
      return validationToActionResult(validationResult) as ActionResult<TOutput>;
    }

    return handler(validationResult.data!, context);
  };
}

/**
 * Validation middleware for ID parameters
 */
export function withIdValidation<TOutput>(
  handler: ValidatedActionHandler<string, TOutput>,
  options: {
    fieldName?: string;
    format?: 'uuid' | 'custom';
    pattern?: RegExp;
    required?: boolean;
  } = {}
): (id: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return async (id: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
    const fieldName = options.fieldName || 'id';
    
    if (!id && options.required !== false) {
      return ErrorFactory.validation(
        `${fieldName} is required`
      ) as ActionResult<TOutput>;
    }

    if (!id) {
      return handler('' as string, context);
    }

    const validationResult = validateId(id, fieldName, {
      format: options.format,
      pattern: options.pattern,
    });

    if (!validationResult.isValid && validationResult.errors) {
      const firstError = validationResult.errors[0];
      return ErrorFactory.validation(
        firstError.message,
        firstError.field,
        firstError.code
      ) as ActionResult<TOutput>;
    }

    return handler(id as string, context);
  };
}

/**
 * Validation middleware for performance metrics
 */
export function withPerformanceMetricsValidation<TOutput>(
  handler: ValidatedActionHandler<{
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
  }, TOutput>
): (metrics: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return async (metrics: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
    const validationResult = validatePerformanceMetrics(metrics);
    if (!validationResult.isValid) {
      return validationToActionResult(validationResult) as ActionResult<TOutput>;
    }

    return handler(validationResult.data!, context);
  };
}

// ============================================================================
// DOMAIN-SPECIFIC VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Validation middleware for analytics data by type
 */
export function withAnalyticsDataValidation<TInput, TOutput>(
  analyticsType: 'campaign' | 'domain' | 'mailbox' | 'lead' | 'template' | 'billing',
  handler: ValidatedActionHandler<TInput, TOutput>
): (data: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  const schema = getAnalyticsSchema(analyticsType);
  
  return withValidation(schema as ValidationSchema<TInput>, handler);
}

/**
 * Validation middleware for bulk operations
 */
export function withBulkOperationValidation<TInput, TOutput>(
  itemSchema: ValidationSchema<TInput>,
  handler: ValidatedActionHandler<TInput[], TOutput>,
  options: {
    maxItems?: number;
    minItems?: number;
  } = {}
): (data: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return async (data: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
    if (!Array.isArray(data)) {
      return ErrorFactory.validation(
        'Bulk operation data must be an array'
      ) as ActionResult<TOutput>;
    }

    const { maxItems = 100, minItems = 1 } = options;

    if (data.length < minItems) {
      return ErrorFactory.validation(
        `Bulk operation must contain at least ${minItems} items`
      ) as ActionResult<TOutput>;
    }

    if (data.length > maxItems) {
      return ErrorFactory.validation(
        `Bulk operation cannot contain more than ${maxItems} items`
      ) as ActionResult<TOutput>;
    }

    // Validate each item
    const validatedItems: TInput[] = [];
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const validationResult = validateSchema(data[i], itemSchema);
      if (validationResult.isValid && validationResult.data) {
        validatedItems.push(validationResult.data);
      } else if (validationResult.errors) {
        errors.push(`Item ${i}: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return ErrorFactory.validation(
        `Bulk operation validation failed: ${errors.join('; ')}`
      ) as ActionResult<TOutput>;
    }

    return handler(validatedItems, context);
  };
}

// ============================================================================
// RUNTIME TYPE CHECKING MIDDLEWARE
// ============================================================================

/**
 * Runtime type checking middleware
 */
export function withRuntimeTypeCheck<TInput, TOutput>(
  typeGuard: (value: unknown) => value is TInput,
  handler: ValidatedActionHandler<TInput, TOutput>,
  errorMessage?: string
): (data: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return async (data: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
    if (!typeGuard(data)) {
      return ErrorFactory.validation(
        errorMessage || 'Invalid data type provided'
      ) as ActionResult<TOutput>;
    }

    return handler(data, context);
  };
}

/**
 * Analytics filters runtime type checking middleware
 */
export function withAnalyticsFiltersTypeCheck<TOutput>(
  handler: ValidatedActionHandler<AnalyticsFilters, TOutput>
): (filters: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return withRuntimeTypeCheck(
    isAnalyticsFilters,
    handler,
    'Invalid analytics filters format'
  );
}

/**
 * Performance metrics runtime type checking middleware
 */
export function withPerformanceMetricsTypeCheck<TOutput>(
  handler: ValidatedActionHandler<{
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
  }, TOutput>
): (metrics: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return withRuntimeTypeCheck(
    isPerformanceMetrics,
    handler,
    'Invalid performance metrics format'
  );
}

// ============================================================================
// COMPOSITE VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Composite middleware that combines multiple validation steps
 */
export function withCompositeValidation<TInput, TOutput>(
  validations: Array<{
    name: string;
    validator: (data: unknown) => ActionResult<unknown>;
    required?: boolean;
  }>,
  handler: ValidatedActionHandler<TInput, TOutput>
): (data: unknown, context?: ActionContext) => Promise<ActionResult<TOutput>> {
  return async (data: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
    let validatedData = data;

    for (const validation of validations) {
      const result = validation.validator(validatedData);
      
      if (!result.success) {
        if (validation.required !== false) {
          return result as ActionResult<TOutput>;
        }
        // Skip optional validation that failed
        continue;
      }
      
      validatedData = result.data;
    }

    return handler(validatedData as TInput, context);
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Create a validation function from a schema
 */
export function createValidator<T>(
  schema: ValidationSchema<T>
): (data: unknown) => ActionResult<T> {
  return (data: unknown) => {
    const validationResult = validateSchema(data, schema);
    return validationToActionResult(validationResult);
  };
}

/**
 * Create a type-safe validation middleware
 */
export function createValidationMiddleware<TInput, TOutput>(
  validator: (data: unknown) => ActionResult<TInput>
) {
  return (handler: ValidatedActionHandler<TInput, TOutput>) => {
    return async (data: unknown, context?: ActionContext): Promise<ActionResult<TOutput>> => {
      const validationResult = validator(data);
      if (!validationResult.success) {
        return validationResult as unknown as ActionResult<TOutput>;
      }

      return handler(validationResult.data!, context);
    };
  };
}

/**
 * Combine multiple validators into one
 */
export function combineValidators<T>(
  validators: Array<(data: unknown) => ActionResult<T>>
): (data: unknown) => ActionResult<T> {
  return (data: unknown) => {
    for (const validator of validators) {
      const result = validator(data);
      if (!result.success) {
        return result;
      }
      data = result.data;
    }
    
    return { success: true, data: data as T };
  };
}

// ============================================================================
// PREDEFINED VALIDATORS
// ============================================================================

/**
 * Common validators that can be reused across actions
 */
export const commonValidators = {
  analyticsFilters: createValidator(analyticsFiltersSchema),
  performanceMetrics: createValidator(performanceMetricsSchema),
  pagination: createValidator(paginationSchema),
  
  // ID validators
  requiredId: (data: unknown) => {
    const result = validateId(data, 'id');
    if (!result.isValid && result.errors) {
      const firstError = result.errors[0];
      return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
    }
    return { success: true, data: result.data as string };
  },
  
  optionalId: (data: unknown) => {
    if (!data) {
      return { success: true, data: undefined };
    }
    return commonValidators.requiredId(data);
  },
  
  // Array validators
  stringArray: (data: unknown) => {
    if (!Array.isArray(data)) {
      return ErrorFactory.validation('Must be an array');
    }
    
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i] !== 'string') {
        return ErrorFactory.validation(`Item at index ${i} must be a string`);
      }
    }
    
    return { success: true, data: data as string[] };
  },
  
  // Date validators
  dateRange: (data: unknown) => {
    if (!data || typeof data !== 'object') {
      return ErrorFactory.validation('Date range must be an object');
    }
    
    const range = data as Record<string, unknown>;
    
    if (!range.start || !range.end) {
      return ErrorFactory.validation('Date range must have start and end dates');
    }
    
    const start = new Date(range.start as string);
    const end = new Date(range.end as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return ErrorFactory.validation('Invalid date format in date range');
    }
    
    if (start >= end) {
      return ErrorFactory.validation('Start date must be before end date');
    }
    
    return { success: true, data: { start: range.start, end: range.end } };
  },
} as const;

// ============================================================================
// VALIDATION DECORATORS (for future use with decorators)
// ============================================================================

/**
 * Validation decorator factory (for when decorators are supported)
 */
export function Validate<T>(schema: ValidationSchema<T>) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (data: unknown, ...args: unknown[]) {
      const validationResult = validateSchema(data, schema);
      if (!validationResult.isValid) {
        return validationToActionResult(validationResult);
      }
      
      return originalMethod.call(this, validationResult.data, ...args);
    };
    
    return descriptor;
  };
}

/**
 * Runtime type check decorator factory
 */
export function TypeCheck<T>(
  typeGuard: (value: unknown) => value is T,
  errorMessage?: string
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (data: unknown, ...args: unknown[]) {
      if (!typeGuard(data)) {
        return ErrorFactory.validation(
          errorMessage || `Invalid type for ${propertyKey}`
        );
      }
      
      return originalMethod.call(this, data, ...args);
    };
    
    return descriptor;
  };
}
