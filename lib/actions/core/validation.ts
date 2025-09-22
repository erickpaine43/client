/**
 * Common validation utilities and helpers for server actions
 * 
 * This module provides reusable validation functions, schema validation,
 * and input sanitization utilities used across all action modules.
 */

import { ValidationResult, ValidationError, ActionResult } from './types';
import { ErrorFactory } from './errors';

/**
 * Email validation regex (RFC 5322 compliant)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * URL validation regex
 */
const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;

/**
 * Phone number validation regex (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Strong password regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
 */
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Create a validation error
 */
function createValidationError(
  field: string,
  message: string,
  code?: string,
  value?: unknown
): ValidationError {
  return { field, message, code, value };
}

/**
 * Create a successful validation result
 */
function createValidationSuccess<T>(data: T): ValidationResult<T> {
  return { isValid: true, data };
}

/**
 * Create a failed validation result
 */
function createValidationFailure(errors: ValidationError[]): ValidationResult<never> {
  return { isValid: false, errors };
}

/**
 * Validate required field
 */
export function validateRequired(
  value: unknown,
  field: string
): ValidationResult<unknown> {
  if (value === null || value === undefined || value === '') {
    return createValidationFailure([
      createValidationError(field, `${field} is required`, 'REQUIRED_FIELD', value)
    ]);
  }
  
  return createValidationSuccess(value);
}

/**
 * Validate email format
 */
export function validateEmail(email: string, field = 'email'): ValidationResult<string> {
  const requiredCheck = validateRequired(email, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<string>;
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return createValidationFailure([
      createValidationError(
        field,
        'Please enter a valid email address',
        'INVALID_EMAIL',
        email
      )
    ]);
  }

  return createValidationSuccess(email.trim().toLowerCase());
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, field = 'url'): ValidationResult<string> {
  const requiredCheck = validateRequired(url, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<string>;
  }

  if (!URL_REGEX.test(url.trim())) {
    return createValidationFailure([
      createValidationError(
        field,
        'Please enter a valid URL (must start with http:// or https://)',
        'INVALID_URL',
        url
      )
    ]);
  }

  return createValidationSuccess(url.trim());
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string, field = 'phone'): ValidationResult<string> {
  const requiredCheck = validateRequired(phone, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<string>;
  }

  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  if (!PHONE_REGEX.test(cleanPhone)) {
    return createValidationFailure([
      createValidationError(
        field,
        'Please enter a valid phone number',
        'INVALID_PHONE',
        phone
      )
    ]);
  }

  return createValidationSuccess(cleanPhone);
}

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  field = 'password',
  requireStrong = true
): ValidationResult<string> {
  const requiredCheck = validateRequired(password, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<string>;
  }

  if (password.length < 8) {
    return createValidationFailure([
      createValidationError(
        field,
        'Password must be at least 8 characters long',
        'PASSWORD_TOO_SHORT',
        password.length
      )
    ]);
  }

  if (requireStrong && !STRONG_PASSWORD_REGEX.test(password)) {
    return createValidationFailure([
      createValidationError(
        field,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'PASSWORD_TOO_WEAK'
      )
    ]);
  }

  return createValidationSuccess(password);
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  field: string,
  min?: number,
  max?: number
): ValidationResult<string> {
  const requiredCheck = validateRequired(value, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<string>;
  }

  const length = value.trim().length;

  if (min !== undefined && length < min) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be at least ${min} characters long`,
        'TOO_SHORT',
        length
      )
    ]);
  }

  if (max !== undefined && length > max) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be no more than ${max} characters long`,
        'TOO_LONG',
        length
      )
    ]);
  }

  return createValidationSuccess(value.trim());
}

/**
 * Validate numeric value
 */
export function validateNumber(
  value: unknown,
  field: string,
  min?: number,
  max?: number
): ValidationResult<number> {
  const requiredCheck = validateRequired(value, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<number>;
  }

  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (isNaN(num)) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be a valid number`,
        'INVALID_NUMBER',
        value
      )
    ]);
  }

  if (min !== undefined && num < min) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be at least ${min}`,
        'TOO_SMALL',
        num
      )
    ]);
  }

  if (max !== undefined && num > max) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be no more than ${max}`,
        'TOO_LARGE',
        num
      )
    ]);
  }

  return createValidationSuccess(num);
}

/**
 * Validate array
 */
export function validateArray<T>(
  value: unknown,
  field: string,
  minLength?: number,
  maxLength?: number
): ValidationResult<T[]> {
  const requiredCheck = validateRequired(value, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<T[]>;
  }

  if (!Array.isArray(value)) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be an array`,
        'INVALID_ARRAY',
        value
      )
    ]);
  }

  if (minLength !== undefined && value.length < minLength) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must contain at least ${minLength} items`,
        'ARRAY_TOO_SHORT',
        value.length
      )
    ]);
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must contain no more than ${maxLength} items`,
        'ARRAY_TOO_LONG',
        value.length
      )
    ]);
  }

  return createValidationSuccess(value as T[]);
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  field: string,
  allowedValues: readonly T[]
): ValidationResult<T> {
  const requiredCheck = validateRequired(value, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<T>;
  }

  if (!allowedValues.includes(value as T)) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be one of: ${allowedValues.join(', ')}`,
        'INVALID_ENUM',
        value
      )
    ]);
  }

  return createValidationSuccess(value as T);
}

/**
 * Validate date
 */
export function validateDate(
  value: unknown,
  field: string,
  minDate?: Date,
  maxDate?: Date
): ValidationResult<Date> {
  const requiredCheck = validateRequired(value, field);
  if (!requiredCheck.isValid) {
    return requiredCheck as ValidationResult<Date>;
  }

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be a valid date`,
        'INVALID_DATE',
        value
      )
    ]);
  }

  if (isNaN(date.getTime())) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be a valid date`,
        'INVALID_DATE',
        value
      )
    ]);
  }

  if (minDate && date < minDate) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be after ${minDate.toISOString()}`,
        'DATE_TOO_EARLY',
        date
      )
    ]);
  }

  if (maxDate && date > maxDate) {
    return createValidationFailure([
      createValidationError(
        field,
        `${field} must be before ${maxDate.toISOString()}`,
        'DATE_TOO_LATE',
        date
      )
    ]);
  }

  return createValidationSuccess(date);
}

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validate and sanitize object with multiple fields
 */
export function validateObject<T extends Record<string, unknown>>(
  data: unknown,
  validators: {
    [K in keyof T]: (value: unknown, field: string) => ValidationResult<T[K]>;
  }
): ValidationResult<T> {
  if (!data || typeof data !== 'object') {
    return createValidationFailure([
      createValidationError('data', 'Invalid data object', 'INVALID_OBJECT', data)
    ]);
  }

  const errors: ValidationError[] = [];
  const result = {} as T;

  for (const [field, validator] of Object.entries(validators)) {
    const value = (data as Record<string, unknown>)[field];
    const validation = validator(value, field);

    if (validation.isValid) {
      result[field as keyof T] = validation.data as T[keyof T];
    } else {
      errors.push(...(validation.errors || []));
    }
  }

  if (errors.length > 0) {
    return createValidationFailure(errors);
  }

  return createValidationSuccess(result);
}

/**
 * Convert validation result to action result
 */
export function validationToActionResult<T>(
  validation: ValidationResult<T>
): ActionResult<T> {
  if (validation.isValid) {
    return {
      success: true,
      data: validation.data!,
    };
  }

  // Use the first error for the main error message
  const firstError = validation.errors![0];
  
  return ErrorFactory.validation(
    firstError.message,
    firstError.field,
    firstError.code
  );
}

/**
 * Validation helper for common patterns
 */
export const Validators = {
  email: (value: unknown, field = 'email') => validateEmail(value as string, field),
  url: (value: unknown, field = 'url') => validateUrl(value as string, field),
  phone: (value: unknown, field = 'phone') => validatePhone(value as string, field),
  password: (value: unknown, field = 'password') => validatePassword(value as string, field),
  required: (value: unknown, field: string) => validateRequired(value, field),
  
  // Common field validators
  name: (value: unknown, field = 'name') => validateLength(value as string, field, 1, 100),
  description: (value: unknown, field = 'description') => validateLength(value as string, field, 0, 1000),
  title: (value: unknown, field = 'title') => validateLength(value as string, field, 1, 200),
  
  // Numeric validators
  positiveNumber: (value: unknown, field: string) => validateNumber(value, field, 0),
  percentage: (value: unknown, field: string) => validateNumber(value, field, 0, 100),
  
  // Array validators
  nonEmptyArray: <T>(value: unknown, field: string) => validateArray<T>(value, field, 1),
  
  // Date validators
  futureDate: (value: unknown, field: string) => validateDate(value, field, new Date()),
  pastDate: (value: unknown, field: string) => validateDate(value, field, undefined, new Date()),
} as const;
