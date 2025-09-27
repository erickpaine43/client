/**
 * Common validation utilities
 * 
 * This module provides general-purpose validation functions
 * that are used across multiple domains.
 */

import { ValidationResult, ValidationError, createValidationResult, createValidationError } from './core';
import { validateString, validateNumber } from './core';

// ============================================================================
// COMMON VALIDATION FUNCTIONS
// ============================================================================

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

// ============================================================================
// COMMON VALIDATORS OBJECT
// ============================================================================

/**
 * Common validators object
 */
export const CommonValidators = {
  url: (value: unknown, field: string, options?: Parameters<typeof validateUrl>[2]) =>
    validateUrl(value, field, options),
  id: (value: unknown, field: string, options?: Parameters<typeof validateId>[2]) =>
    validateId(value, field, options),
  pagination: (params: unknown) => validatePagination(params),
  length: (value: unknown, field: string, min: number, max?: number) =>
    validateLength(value, field, min, max),
};

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
