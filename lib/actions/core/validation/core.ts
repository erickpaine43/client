/**
 * Core validation types and basic validation functions
 * 
 * This module provides the fundamental validation building blocks
 * used across all domain-specific validators.
 */

import { ValidationResult, ValidationError } from '../types';
import { validateEmail } from './auth';

// Re-export types for use in other validation modules
export type { ValidationResult, ValidationError };

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
 * Common validators object
 */
export const Validators = {
  required: (value: unknown, field: string) => validateRequired(value, field),
  string: (value: unknown, field: string, options?: Parameters<typeof validateString>[2]) =>
    validateString(value, field, options),
  number: (value: unknown, field: string, options?: Parameters<typeof validateNumber>[2]) =>
    validateNumber(value, field, options),
  email: (value: unknown, field: string) => validateEmail(value, field),
  name: (value: unknown, field: string) =>
    validateString(value, field, { minLength: 1, maxLength: 100 }),
  positiveNumber: (value: unknown, field: string) =>
    validateNumber(value, field, { min: 0 }),
  length: (value: unknown, field: string, min: number, max?: number) =>
    validateString(value, field, { minLength: min, maxLength: max }),
  enum: <T extends readonly unknown[]>(value: unknown, field: string, allowedValues: T) =>
    validateEnum(value, field, allowedValues),
};
