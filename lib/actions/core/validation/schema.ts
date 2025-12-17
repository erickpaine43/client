/**
 * Schema-based validation system
 * 
 * This module provides a comprehensive schema validation system
 * that can validate complex objects against defined schemas.
 */

import { ActionResult, ValidationResult, ValidationError } from '../types';
import { ErrorFactory } from '../errors';
import {
  ValidationSchema,
  createValidationResult,
  createValidationError,
  validateRequired,
  validateString,
  validateNumber,
  validateArray,
  validateDate
} from './core';
import { validateEmail } from './auth';
import { validateUrl } from './common';

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
