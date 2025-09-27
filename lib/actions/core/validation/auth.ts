/**
 * Authentication and user-related validation functions
 * 
 * This module provides validation functions for user authentication,
 * profile data, and security-related inputs.
 */

import { ValidationResult, createValidationResult, createValidationError } from './core';
import { validateString } from './core';

// ============================================================================
// AUTH VALIDATION FUNCTIONS
// ============================================================================

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

// ============================================================================
// AUTH VALIDATORS OBJECT
// ============================================================================

/**
 * Auth-specific validators object
 */
export const AuthValidators = {
  email: (value: unknown, field: string) => validateEmail(value, field),
  phone: (value: unknown, field: string) => validatePhone(value, field),
  password: (value: unknown, field: string, options?: Parameters<typeof validatePassword>[2]) =>
    validatePassword(value, field, options),
};

// ============================================================================
// CONTENT SANITIZATION
// ============================================================================

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
