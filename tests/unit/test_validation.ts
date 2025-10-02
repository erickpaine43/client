import { describe, test, expect } from '@jest/globals';
import { z } from 'zod';

// Test validation schemas
const emailSchema = z.string().email();
const uuidSchema = z.string().uuid();

describe('Validation Unit Tests', () => {
  test('should validate email format', () => {
    expect(() => emailSchema.parse('test@example.com')).not.toThrow();
    expect(() => emailSchema.parse('invalid-email')).toThrow();
  });

  test('should validate UUID format', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(() => uuidSchema.parse(validUuid)).not.toThrow();
    expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
  });

  test('should validate required fields', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    expect(() => schema.parse({ name: 'Test', email: 'test@example.com' })).not.toThrow();
    expect(() => schema.parse({ name: '', email: 'test@example.com' })).toThrow();
    expect(() => schema.parse({ name: 'Test' })).toThrow();
  });
});
