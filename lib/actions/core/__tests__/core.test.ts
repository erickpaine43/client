/**
 * Tests for core action utilities
 */

import {
  createActionResult,
  createActionError,
  ErrorFactory,
  validateEmail,
  validateRequired,
  validateLength,
  Validators,
  ERROR_CODES,
} from '../index';

describe('Core Action Utilities', () => {
  describe('createActionResult', () => {
    it('should create a successful result', () => {
      const data = { id: '1', name: 'Test' };
      const result = createActionResult(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createActionError', () => {
    it('should create an error result', () => {
      const result = createActionError('validation', 'Invalid input', 'INVALID_INPUT', 'email');

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        type: 'validation',
        message: 'Invalid input',
        code: 'INVALID_INPUT',
        field: 'email',
      });
    });
  });

  describe('ErrorFactory', () => {
    it('should create auth required error', () => {
      const result = ErrorFactory.authRequired();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('auth');
      expect(result.error?.code).toBe('AUTH_REQUIRED');
    });

    it('should create validation error', () => {
      const result = ErrorFactory.validation('Invalid email', 'email');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('email');
    });

    it('should create rate limit error', () => {
      const result = ErrorFactory.rateLimit();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('rate_limit');
      expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Validation', () => {
    describe('validateRequired', () => {
      it('should pass for valid values', () => {
        const result = validateRequired('test', 'field');
        expect(result.isValid).toBe(true);
        expect(result.data).toBe('test');
      });

      it('should fail for null/undefined/empty values', () => {
        expect(validateRequired(null, 'field').isValid).toBe(false);
        expect(validateRequired(undefined, 'field').isValid).toBe(false);
        expect(validateRequired('', 'field').isValid).toBe(false);
      });
    });

    describe('validateEmail', () => {
      it('should pass for valid emails', () => {
        const result = validateEmail('test@example.com');
        expect(result.isValid).toBe(true);
        expect(result.data).toBe('test@example.com');
      });

      it('should fail for invalid emails', () => {
        expect(validateEmail('invalid-email').isValid).toBe(false);
        expect(validateEmail('test@').isValid).toBe(false);
        expect(validateEmail('@example.com').isValid).toBe(false);
      });

      it('should normalize email case', () => {
        const result = validateEmail('TEST@EXAMPLE.COM');
        expect(result.isValid).toBe(true);
        expect(result.data).toBe('test@example.com');
      });
    });

    describe('validateLength', () => {
      it('should pass for valid length', () => {
        const result = validateLength('test', 'field', 2, 10);
        expect(result.isValid).toBe(true);
        expect(result.data).toBe('test');
      });

      it('should fail for too short', () => {
        const result = validateLength('a', 'field', 2, 10);
        expect(result.isValid).toBe(false);
        expect(result.errors?.[0].code).toBe('TOO_SHORT');
      });

      it('should fail for too long', () => {
        const result = validateLength('very long string', 'field', 2, 5);
        expect(result.isValid).toBe(false);
        expect(result.errors?.[0].code).toBe('TOO_LONG');
      });
    });
  });

  describe('Validators', () => {
    it('should have common validators', () => {
      expect(typeof Validators.email).toBe('function');
      expect(typeof Validators.required).toBe('function');
      expect(typeof Validators.name).toBe('function');
      expect(typeof Validators.positiveNumber).toBe('function');
    });

    it('should validate names correctly', () => {
      const validName = Validators.name('John Doe', 'name');
      expect(validName.isValid).toBe(true);

      const emptyName = Validators.name('', 'name');
      expect(emptyName.isValid).toBe(false);
    });
  });

  describe('ERROR_CODES', () => {
    it('should have standard error codes', () => {
      expect(ERROR_CODES.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(ERROR_CODES.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
      expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });
  });
});
