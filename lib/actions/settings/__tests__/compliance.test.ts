/**
 * Tests for compliance settings actions
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  getComplianceSettings,
  updateComplianceSettings,
  validateComplianceCompleteness,
  getComplianceChecklist,
  exportComplianceReport,
} from '../compliance';
import { withErrorHandling } from '../../core/errors';

// Mock the core auth utilities
jest.mock('@/lib/actions/core/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuth: jest.fn((handler: any) => {
    const mockContext = {
      userId: 'test-user-id',
      companyId: 'test-company-id',
      timestamp: Date.now(),
      requestId: 'test-request-id',
    };
    return handler(mockContext);
  }),
  RateLimits: {},
  getRateLimitConfig: jest.fn(),
}));

// Mock the error handling
jest.mock('@/lib/actions/core/errors', () => ({
  ErrorFactory: {
    validation: jest.fn((message, field, code) => ({
      success: false,
      error: { type: 'validation', message, field, code },
    })),
    internal: jest.fn((message) => ({
      success: false,
      error: { type: 'server', message },
    })),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withErrorHandling: jest.fn((handler: any) => handler()),
}));

describe('Compliance Settings Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getComplianceSettings', () => {
    it('should return compliance settings successfully', async () => {
      const result = await getComplianceSettings();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.autoAddUnsubscribeLink).toBeDefined();
      expect(result.data?.unsubscribeText).toBeDefined();
    });
  });

  describe('updateComplianceSettings', () => {
    it('should update compliance settings successfully', async () => {
      const updates = {
        autoAddUnsubscribeLink: true,
        unsubscribeText: 'Custom unsubscribe text',
        companyName: 'Test Company',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US',
      };

      const result = await updateComplianceSettings(updates);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.companyName).toBe('Test Company');
    });

    it('should validate unsubscribe text is not empty', async () => {
      const updates = {
        unsubscribeText: '',
      };

      const result = await updateComplianceSettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('unsubscribeText');
    });

    it('should validate company name is not empty', async () => {
      const updates = {
        companyName: '',
      };

      const result = await updateComplianceSettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('companyName');
    });

    it('should validate zip code format', async () => {
      const updates = {
        zip: '123', // Too short
      };

      const result = await updateComplianceSettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('zip');
    });

    it('should validate unsubscribe landing page URL', async () => {
      const updates = {
        unsubscribeLandingPage: 'not-a-valid-url',
      };

      const result = await updateComplianceSettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('unsubscribeLandingPage');
    });

    it('should accept valid zip codes', async () => {
      const updates1 = { zip: '12345' };
      const updates2 = { zip: '12345-6789' };
      const updates3 = { zip: 'K1A 0A6' }; // Canadian postal code

      const result1 = await updateComplianceSettings(updates1);
      const result2 = await updateComplianceSettings(updates2);
      const result3 = await updateComplianceSettings(updates3);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    it('should accept valid URLs for unsubscribe landing page', async () => {
      const updates = {
        unsubscribeLandingPage: 'https://example.com/unsubscribe',
      };

      const result = await updateComplianceSettings(updates);

      expect(result.success).toBe(true);
      expect(result.data?.unsubscribeLandingPage).toBe('https://example.com/unsubscribe');
    });
  });

  describe('validateComplianceCompleteness', () => {
    it('should validate compliance completeness', async () => {
      const result = await validateComplianceCompleteness();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.isComplete).toBeDefined();
      expect(result.data?.missingFields).toBeDefined();
      expect(result.data?.recommendations).toBeDefined();
      expect(Array.isArray(result.data?.missingFields)).toBe(true);
      expect(Array.isArray(result.data?.recommendations)).toBe(true);
    });

    it('should handle errors when getting compliance settings fails', async () => {
      // Mock withErrorHandling to simulate an error
      (withErrorHandling as jest.MockedFunction<typeof withErrorHandling>).mockImplementationOnce(() => Promise.resolve({
        success: false,
        error: { type: 'server', message: 'Database error' },
      }));

      const result = await validateComplianceCompleteness();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
    });
  });

  describe('getComplianceChecklist', () => {
    it('should return compliance checklist', async () => {
      const result = await getComplianceChecklist();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);

      // Check that each item has required properties
      result.data?.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.description).toBeDefined();
        expect(typeof item.completed).toBe('boolean');
        expect(typeof item.required).toBe('boolean');
        expect(item.category).toBeDefined();
      });
    });
  });

  describe('exportComplianceReport', () => {
    it('should export compliance report successfully', async () => {
      const result = await exportComplianceReport();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.reportUrl).toBeDefined();
      expect(result.data?.expiresAt).toBeDefined();
      expect(result.data?.expiresAt).toBeInstanceOf(Date);
    });

    it('should generate unique report URLs', async () => {
      const result1 = await exportComplianceReport();
      const result2 = await exportComplianceReport();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.reportUrl).not.toBe(result2.data?.reportUrl);
    });
  });
});
