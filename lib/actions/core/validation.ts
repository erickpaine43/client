/**
 * Standardized validation utilities for server actions
 * 
 * This module provides consistent validation patterns across all action modules
 * with field-specific error information and runtime type checking.
 */

import { ActionResult, ValidationResult, ValidationError } from './types';
import { ErrorFactory } from './errors';
import type { AnalyticsFilters, DataGranularity } from '../../../types/analytics/core';

// ============================================================================
// CORE VALIDATION TYPES
// ============================================================================

export interface ValidationSchema<T = unknown> {
  [key: string]: ValidationRule<T>;
}

export interface ValidationRule<T = unknown> {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'url';
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: readonly unknown[];
  custom?: (value: unknown, data: T) => string | null;
  transform?: (value: unknown) => unknown;
}

export interface ValidationContext {
  field: string;
  value: unknown;
  data: Record<string, unknown>;
  path: string[];
}

// ============================================================================
// VALIDATION RESULT HELPERS
// ============================================================================

/**
 * Create a successful validation result
 */
export function createValidationResult<T>(data: T): ValidationResult<T> {
  return {
    isValid: true,
    data,
    errors: [],
  };
}

/**
 * Create a failed validation result
 */
export function createValidationError(
  field: string,
  message: string,
  code?: string,
  value?: unknown
): ValidationResult<never> {
  return {
    isValid: false,
    errors: [{
      field,
      message,
      code,
      value,
    }],
  };
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults<T>(
  results: ValidationResult<T>[]
): ValidationResult<T[]> {
  const errors: ValidationError[] = [];
  const data: T[] = [];

  for (const result of results) {
    if (result.isValid && result.data !== undefined) {
      data.push(result.data);
    } else if (result.errors) {
      errors.push(...result.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================================================
// BASIC VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate required field
 */
export function validateRequired(
  value: unknown,
  field: string
): ValidationResult<unknown> {
  if (value === null || value === undefined || value === '') {
    return createValidationError(field, `${field} is required`, 'REQUIRED_FIELD', value);
  }
  return createValidationResult(value);
}

/**
 * Validate string type and constraints
 */
export function validateString(
  value: unknown,
  field: string,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: readonly string[];
  } = {}
): ValidationResult<string> {
  if (typeof value !== 'string') {
    return createValidationError(field, `${field} must be a string`, 'INVALID_TYPE', value);
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    return createValidationError(field, `${field} must be at least ${options.minLength} characters`, 'MIN_LENGTH', value);
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    return createValidationError(field, `${field} must be at most ${options.maxLength} characters`, 'MAX_LENGTH', value);
  }

  if (options.pattern && !options.pattern.test(value)) {
    return createValidationError(field, `${field} format is invalid`, 'INVALID_FORMAT', value);
  }

  if (options.enum && !options.enum.includes(value)) {
    return createValidationError(field, `${field} must be one of: ${options.enum.join(', ')}`, 'INVALID_ENUM', value);
  }

  return createValidationResult(value);
}

/**
 * Validate number type and constraints
 */
export function validateNumber(
  value: unknown,
  field: string,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidationResult<number> {
  if (typeof value !== 'number' || isNaN(value)) {
    return createValidationError(field, `${field} must be a valid number`, 'INVALID_TYPE', value);
  }

  if (options.integer && !Number.isInteger(value)) {
    return createValidationError(field, `${field} must be an integer`, 'INVALID_INTEGER', value);
  }

  if (options.min !== undefined && value < options.min) {
    return createValidationError(field, `${field} must be at least ${options.min}`, 'MIN_VALUE', value);
  }

  if (options.max !== undefined && value > options.max) {
    return createValidationError(field, `${field} must be at most ${options.max}`, 'MAX_VALUE', value);
  }

  return createValidationResult(value);
}

/**
 * Validate array type and constraints
 */
export function validateArray(
  value: unknown,
  field: string,
  options: {
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: unknown, index: number) => ValidationResult<unknown>;
  } = {}
): ValidationResult<unknown[]> {
  if (!Array.isArray(value)) {
    return createValidationError(field, `${field} must be an array`, 'INVALID_TYPE', value);
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    return createValidationError(field, `${field} must have at least ${options.minLength} items`, 'MIN_LENGTH', value);
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    return createValidationError(field, `${field} must have at most ${options.maxLength} items`, 'MAX_LENGTH', value);
  }

  if (options.itemValidator) {
    const itemResults = value.map((item, index) => options.itemValidator!(item, index));
    const failedResult = itemResults.find(result => !result.isValid);
    if (failedResult) {
      return {
        isValid: false,
        errors: failedResult.errors ? failedResult.errors.map(error => ({
          ...error,
          field: `${field}[${itemResults.indexOf(failedResult)}]`,
        })) : [],
      };
    }
  }

  return createValidationResult(value);
}

/**
 * Validate email format
 */
export function validateEmail(
  value: unknown,
  field: string
): ValidationResult<string> {
  const stringResult = validateString(value, field);
  if (!stringResult.isValid) return stringResult;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value as string)) {
    return createValidationError(field, `${field} must be a valid email address`, 'INVALID_EMAIL', value);
  }

  return createValidationResult(value as string);
}

/**
 * Validate URL format
 */
export function validateUrl(
  value: unknown,
  field: string,
  options: {
    protocols?: string[];
  } = {}
): ValidationResult<string> {
  const stringResult = validateString(value, field);
  if (!stringResult.isValid) return stringResult;

  try {
    const url = new URL(value as string);

    if (options.protocols && !options.protocols.includes(url.protocol.slice(0, -1))) {
      return createValidationError(field, `${field} must use one of these protocols: ${options.protocols.join(', ')}`, 'INVALID_PROTOCOL', value);
    }
  } catch {
    return createValidationError(field, `${field} must be a valid URL`, 'INVALID_URL', value);
  }

  return createValidationResult(value as string);
}

/**
 * Validate date format and constraints
 */
export function validateDate(
  value: unknown,
  field: string,
  options: {
    min?: Date;
    max?: Date;
    format?: 'iso' | 'timestamp';
  } = {}
): ValidationResult<string | number> {
  let date: Date;

  if (options.format === 'timestamp') {
    if (typeof value !== 'number') {
      return createValidationError(field, `${field} must be a timestamp number`, 'INVALID_TYPE', value);
    }
    date = new Date(value);
  } else {
    if (typeof value !== 'string') {
      return createValidationError(field, `${field} must be a date string`, 'INVALID_TYPE', value);
    }
    date = new Date(value);
  }

  if (isNaN(date.getTime())) {
    return createValidationError(field, `${field} must be a valid date`, 'INVALID_DATE', value);
  }

  if (options.min && date < options.min) {
    return createValidationError(field, `${field} must be after ${options.min.toISOString()}`, 'MIN_DATE', value);
  }

  if (options.max && date > options.max) {
    return createValidationError(field, `${field} must be before ${options.max.toISOString()}`, 'MAX_DATE', value);
  }

  return createValidationResult(value);
}

// ============================================================================
// DOMAIN-SPECIFIC VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate analytics filters
 */
export function validateAnalyticsFilters(
  filters: unknown
): ValidationResult<AnalyticsFilters> {
  if (!filters || typeof filters !== 'object') {
    return createValidationError('filters', 'Filters must be an object');
  }

  const errors: ValidationError[] = [];
  const typedFilters = filters as Record<string, unknown>;

  // Validate date range
  if (typedFilters.dateRange) {
    if (typeof typedFilters.dateRange !== 'object' || !typedFilters.dateRange) {
      errors.push({
        field: 'dateRange',
        message: 'Date range must be an object',
        code: 'INVALID_TYPE',
        value: typedFilters.dateRange,
      });
    } else {
      const dateRange = typedFilters.dateRange as Record<string, unknown>;
      
      const startResult = validateDate(dateRange.start, 'dateRange.start', { format: 'iso' });
      if (!startResult.isValid && startResult.errors) errors.push(...startResult.errors);

      const endResult = validateDate(dateRange.end, 'dateRange.end', { format: 'iso' });
      if (!endResult.isValid && endResult.errors) errors.push(...endResult.errors);

      // Validate start is before end
      if (startResult.isValid && endResult.isValid) {
        const start = new Date(dateRange.start as string);
        const end = new Date(dateRange.end as string);
        if (start >= end) {
          errors.push({
            field: 'dateRange',
            message: 'Start date must be before end date',
            code: 'INVALID_RANGE',
            value: dateRange,
          });
        }
      }
    }
  }

  // Validate entity IDs
  if (typedFilters.entityIds) {
    const entityResult = validateArray(typedFilters.entityIds, 'entityIds', {
      itemValidator: (item, index) => validateString(item, `entityIds[${index}]`, { minLength: 1 }),
    });
    if (!entityResult.isValid && entityResult.errors) {
      errors.push(...entityResult.errors);
    }
  }

  // Validate granularity
  if (typedFilters.granularity) {
    const granularityResult = validateString(
      typedFilters.granularity,
      'granularity',
      { enum: ['day', 'week', 'month'] as const }
    );
    if (!granularityResult.isValid && granularityResult.errors) {
      errors.push(...granularityResult.errors);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return createValidationResult(typedFilters as AnalyticsFilters);
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  params: unknown
): ValidationResult<{ limit: number; offset: number }> {
  if (!params || typeof params !== 'object') {
    return createValidationError('pagination', 'Pagination must be an object');
  }

  const errors: ValidationError[] = [];
  const typedParams = params as Record<string, unknown>;

  const limitResult = validateNumber(typedParams.limit, 'limit', {
    min: 1,
    max: 100,
    integer: true,
  });
  if (!limitResult.isValid && limitResult.errors) errors.push(...limitResult.errors);

  const offsetResult = validateNumber(typedParams.offset, 'offset', {
    min: 0,
    integer: true,
  });
  if (!offsetResult.isValid && offsetResult.errors) errors.push(...offsetResult.errors);

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return createValidationResult({
    limit: typedParams.limit as number,
    offset: typedParams.offset as number,
  });
}

/**
 * Validate ID format (UUID or custom format)
 */
export function validateId(
  value: unknown,
  field: string,
  options: {
    format?: 'uuid' | 'custom';
    pattern?: RegExp;
  } = {}
): ValidationResult<string> {
  const stringResult = validateString(value, field, { minLength: 1 });
  if (!stringResult.isValid) return stringResult;

  const stringValue = stringResult.data!;

  if (options.format === 'uuid') {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(stringValue)) {
      return createValidationError(field, `${field} must be a valid UUID`, 'INVALID_UUID', value);
    }
  } else if (options.pattern) {
    if (!options.pattern.test(stringValue)) {
      return createValidationError(field, `${field} format is invalid`, 'INVALID_FORMAT', value);
    }
  }

  return createValidationResult(stringValue);
}

/**
 * Validate performance metrics
 */
export function validatePerformanceMetrics(
  metrics: unknown
): ValidationResult<{
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}> {
  if (!metrics || typeof metrics !== 'object') {
    return createValidationError('metrics', 'Metrics must be an object');
  }

  const errors: ValidationError[] = [];
  const typedMetrics = metrics as Record<string, unknown>;

  const requiredFields = [
    'sent', 'delivered', 'opened_tracked', 'clicked_tracked',
    'replied', 'bounced', 'unsubscribed', 'spamComplaints'
  ];

  for (const field of requiredFields) {
    const result = validateNumber(typedMetrics[field], field, {
      min: 0,
      integer: true,
    });
    if (!result.isValid && result.errors) {
      errors.push(...result.errors);
    }
  }

  // Validate logical constraints
  if (typeof typedMetrics.sent === 'number' && typeof typedMetrics.delivered === 'number') {
    if (typedMetrics.delivered > typedMetrics.sent) {
      errors.push({
        field: 'delivered',
        message: 'Delivered count cannot exceed sent count',
        code: 'INVALID_CONSTRAINT',
        value: typedMetrics.delivered,
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return createValidationResult(typedMetrics as {
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
  });
}

// ============================================================================
// SCHEMA-BASED VALIDATION
// ============================================================================

/**
 * Validate data against a schema
 */
export function validateSchema<T>(
  data: unknown,
  schema: ValidationSchema<T>
): ValidationResult<T> {
  if (!data || typeof data !== 'object') {
    return createValidationError('data', 'Data must be an object');
  }

  const errors: ValidationError[] = [];
  const typedData = data as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = typedData[field];

    // Check required fields
    if (rule.required) {
      const requiredResult = validateRequired(value, field);
      if (!requiredResult.isValid && requiredResult.errors) {
        errors.push(...requiredResult.errors);
        continue;
      }
    }

    // Skip validation if field is not required and not provided
    if (!rule.required && (value === undefined || value === null)) {
      continue;
    }

    // Transform value if transformer provided
    const transformedValue = rule.transform ? rule.transform(value) : value;

    // Type validation
    if (rule.type) {
      let typeResult: ValidationResult<unknown> | null = null;

      switch (rule.type) {
        case 'string':
          typeResult = validateString(transformedValue, field, {
            minLength: rule.min,
            maxLength: rule.max,
            pattern: rule.pattern,
            enum: rule.enum as readonly string[],
          });
          break;
        case 'number':
          typeResult = validateNumber(transformedValue, field, {
            min: rule.min,
            max: rule.max,
            integer: false,
          });
          break;
        case 'email':
          typeResult = validateEmail(transformedValue, field);
          break;
        case 'url':
          typeResult = validateUrl(transformedValue, field);
          break;
        case 'date':
          typeResult = validateDate(transformedValue, field);
          break;
        case 'array':
          typeResult = validateArray(transformedValue, field, {
            minLength: rule.min,
            maxLength: rule.max,
          });
          break;
        case 'boolean':
          if (typeof transformedValue !== 'boolean') {
            typeResult = createValidationError(field, `${field} must be a boolean`,
              'INVALID_TYPE', transformedValue);
          } else {
            typeResult = createValidationResult(transformedValue);
          }
          break;
        case 'object':
          if (typeof transformedValue !== 'object' || transformedValue === null) {
            typeResult = createValidationError(field, `${field} must be an object`,
              'INVALID_TYPE', transformedValue);
          } else {
            typeResult = createValidationResult(transformedValue);
          }
          break;
      }

      if (typeResult && !typeResult.isValid && typeResult.errors) {
        errors.push(...typeResult.errors);
        continue;
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(transformedValue, data as T);
      if (customError) {
        errors.push({
          field,
          message: customError,
          code: 'CUSTOM_VALIDATION',
          value: transformedValue,
        });
        continue;
      }
    }

    result[field] = transformedValue;
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return createValidationResult(result as T);
}

// ============================================================================
// ACTION RESULT HELPERS
// ============================================================================

/**
 * Convert validation result to action result
 */
export function validationToActionResult<T>(
  validation: ValidationResult<T>
): ActionResult<T> {
  if (validation.isValid && validation.data !== undefined) {
    return {
      success: true,
      data: validation.data,
    };
  }

  const firstError = validation.errors?.[0];
  if (firstError) {
    return ErrorFactory.validation(
      firstError.message,
      firstError.field,
      firstError.code
    );
  }

  return ErrorFactory.validation('Validation failed');
}

/**
 * Validate and return action result
 */
export function validateAndReturn<T>(
  data: unknown,
  schema: ValidationSchema<T>
): ActionResult<T> {
  const validation = validateSchema(data, schema);
  return validationToActionResult(validation);
}

// ============================================================================
// RUNTIME TYPE CHECKING
// ============================================================================

/**
 * Runtime type guard for checking if value matches expected type
 */
export function isOfType<T>(
  value: unknown,
  typeChecker: (value: unknown) => value is T
): value is T {
  return typeChecker(value);
}

/**
 * Assert that value matches expected type, throw if not
 */
export function assertType<T>(
  value: unknown,
  typeChecker: (value: unknown) => value is T,
  errorMessage: string
): asserts value is T {
  if (!typeChecker(value)) {
    throw new Error(errorMessage);
  }
}

/**
 * Type guard for AnalyticsFilters
 */
export function isAnalyticsFilters(value: unknown): value is AnalyticsFilters {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  // Check optional dateRange
  if (obj.dateRange !== undefined) {
    if (typeof obj.dateRange !== 'object' || !obj.dateRange) return false;
    const dateRange = obj.dateRange as Record<string, unknown>;
    if (typeof dateRange.start !== 'string' || typeof dateRange.end !== 'string') return false;
  }
  
  // Check optional arrays
  if (obj.entityIds !== undefined && !Array.isArray(obj.entityIds)) return false;
  if (obj.domainIds !== undefined && !Array.isArray(obj.domainIds)) return false;
  if (obj.mailboxIds !== undefined && !Array.isArray(obj.mailboxIds)) return false;
  
  // Check optional granularity
  if (obj.granularity !== undefined) {
    const validGranularities: DataGranularity[] = ['day', 'week', 'month'];
    if (!validGranularities.includes(obj.granularity as DataGranularity)) return false;
  }
  
  return true;
}

/**
 * Type guard for performance metrics
 */
export function isPerformanceMetrics(value: unknown): value is {
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
} {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  const requiredFields = [
    'sent', 'delivered', 'opened_tracked', 'clicked_tracked',
    'replied', 'bounced', 'unsubscribed', 'spamComplaints'
  ];
  
  return requiredFields.every(field => 
    typeof obj[field] === 'number' && obj[field] >= 0
  );
}

// ============================================================================
// ADDITIONAL VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate phone number format
 */
export function validatePhone(
  value: unknown,
  field: string
): ValidationResult<string> {
  const stringResult = validateString(value, field);
  if (!stringResult.isValid) return stringResult;

  // Basic phone number pattern (international format)
  const phonePattern = /^\+?[1-9]\d{1,14}$/;
  if (!phonePattern.test(value as string)) {
    return createValidationError(field, `${field} must be a valid phone number`, 'INVALID_PHONE', value);
  }

  return createValidationResult(value as string);
}

/**
 * Validate password strength
 */
export function validatePassword(
  value: unknown,
  field: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): ValidationResult<string> {
  const stringResult = validateString(value, field, { minLength: options.minLength || 8 });
  if (!stringResult.isValid) return stringResult;

  const password = value as string;
  const errors: string[] = [];

  if (options.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('at least one uppercase letter');
  }

  if (options.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('at least one lowercase letter');
  }

  if (options.requireNumbers && !/\d/.test(password)) {
    errors.push('at least one number');
  }

  if (options.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('at least one special character');
  }

  if (errors.length > 0) {
    return createValidationError(field, `${field} must contain ${errors.join(', ')}`, 'INVALID_PASSWORD', value);
  }

  return createValidationResult(password);
}

/**
 * Validate string length
 */
export function validateLength(
  value: unknown,
  field: string,
  minLength: number,
  maxLength?: number
): ValidationResult<string> {
  return validateString(value, field, {
    minLength,
    maxLength,
  });
}

/**
 * Validate enum value
 */
export function validateEnum<T extends readonly unknown[]>(
  value: unknown,
  field: string,
  allowedValues: T
): ValidationResult<T[number]> {
  if (!allowedValues.includes(value)) {
    return createValidationError(field, `${field} must be one of: ${allowedValues.join(', ')}`, 'INVALID_ENUM', value);
  }

  return createValidationResult(value as T[number]);
}

/**
 * Sanitize HTML content (basic implementation)
 */
export function sanitizeHtml(value: string): string {
  if (typeof value !== 'string') return '';

  // Basic HTML sanitization - remove script tags and dangerous attributes
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*\bon\w+\s*=\s*[^>]*>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Sanitize string content
 */
export function sanitizeString(value: string): string {
  if (typeof value !== 'string') return '';

  // Remove potentially dangerous characters and normalize whitespace
  return value
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate object against schema
 */
export function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  schema: ValidationSchema<T>
): ValidationResult<T> {
  if (!value || typeof value !== 'object') {
    return createValidationError('object', 'Value must be an object', 'INVALID_TYPE', value);
  }

  return validateSchema(value as T, schema);
}

// ============================================================================
// VALIDATOR OBJECTS
// ============================================================================

/**
 * Common validators object
 */
export const Validators = {
  required: (value: unknown, field: string) => validateRequired(value, field),
  email: (value: unknown, field: string) => validateEmail(value, field),
  phone: (value: unknown, field: string) => validatePhone(value, field),
  password: (value: unknown, field: string, options?: Parameters<typeof validatePassword>[2]) =>
    validatePassword(value, field, options),
  string: (value: unknown, field: string, options?: Parameters<typeof validateString>[2]) =>
    validateString(value, field, options),
  number: (value: unknown, field: string, options?: Parameters<typeof validateNumber>[2]) =>
    validateNumber(value, field, options),
  name: (value: unknown, field: string) =>
    validateString(value, field, { minLength: 1, maxLength: 100 }),
  positiveNumber: (value: unknown, field: string) =>
    validateNumber(value, field, { min: 0 }),
  url: (value: unknown, field: string, options?: Parameters<typeof validateUrl>[2]) =>
    validateUrl(value, field, options),
  length: (value: unknown, field: string, min: number, max?: number) =>
    validateLength(value, field, min, max),
  enum: <T extends readonly unknown[]>(value: unknown, field: string, allowedValues: T) =>
    validateEnum(value, field, allowedValues),
};
