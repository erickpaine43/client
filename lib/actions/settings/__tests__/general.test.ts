/**
 * Tests for general settings actions
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  getUserSettings,
  updateUserSettings,
  getGeneralSettings,
  updateGeneralSettings,
  updateUserTimezone,
  updateCompanyInfo,
  getAllSettings,
} from '../general';
import { withErrorHandling } from '../../core/errors';

// Mock the auth utilities
jest.mock('@/lib/utils/auth', () => ({
  getCurrentUserId: jest.fn(),
}));

// Mock the nile client
jest.mock('@/app/api/[...nile]/nile', () => ({
  nile: {
    users: {
      getSelf: jest.fn(),
    },
  },
}));

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
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withErrorHandling: jest.fn((handler: any) => handler()),
}));

// Mock the settings data
jest.mock('../../../data/settings.mock', () => ({
  mockUserSettings: {
    userId: 'test-user-id',
    timezone: 'America/New_York',
    companyInfo: {
      name: 'Test Company',
      website: 'https://test.com',
      vatId: 'US123456789',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
      },
    },
    updatedAt: new Date(),
  },
  mockGeneralSettings: {
    profile: {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
    },
    preferences: {
      timezone: 'America/New_York',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
    },
    appearance: {
      theme: 'light',
      sidebarCollapsed: false,
    },
  },
}));

describe('General Settings Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserSettings', () => {
    it('should return user settings successfully', async () => {
      const result = await getUserSettings();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe('test-user-id');
    });

    it('should handle errors gracefully', async () => {
      // Mock withErrorHandling to return an error
      (withErrorHandling as jest.MockedFunction<typeof withErrorHandling>).mockImplementationOnce(() => Promise.resolve({
        success: false,
        error: { type: 'server', message: 'Database error' },
      }));

      const result = await getUserSettings();

      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings successfully', async () => {
      const updates = {
        timezone: 'America/Los_Angeles',
      };

      const result = await updateUserSettings(updates);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe('test-user-id');
    });

    it('should validate timezone format', async () => {
      const updates = {
        timezone: 'Invalid/Timezone',
      };

      const result = await updateUserSettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should validate company info', async () => {
      const updates = {
        companyInfo: {
          name: 'A'.repeat(300), // Too long
        },
      };

      const result = await updateUserSettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });

  describe('getGeneralSettings', () => {
    it('should return general settings successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { nile } = require('@/app/api/[...nile]/nile');
      nile.users.getSelf.mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com',
      });

      const result = await getGeneralSettings();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.profile.name).toBe('Test User');
    });

    it('should handle nile API errors', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { nile } = require('@/app/api/[...nile]/nile');
      nile.users.getSelf.mockResolvedValue(null); // Simulate API returning null

      const result = await getGeneralSettings();

      expect(result.success).toBe(true); // Should still succeed with mock data
      expect(result.data).toBeDefined();
    });
  });

  describe('updateGeneralSettings', () => {
    it('should update general settings successfully', async () => {
      const updates = {
        preferences: {
          timezone: 'America/Chicago',
          language: 'es',
        },
      };

      const result = await updateGeneralSettings(updates);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate timezone in preferences', async () => {
      const updates = {
        preferences: {
          timezone: 'Invalid/Timezone',
        },
      };

      const result = await updateGeneralSettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('timezone');
    });
  });

  describe('updateUserTimezone', () => {
    it('should update timezone successfully', async () => {
      const result = await updateUserTimezone('America/Denver');

      expect(result.success).toBe(true);
      expect(result.data?.timezone).toBe('America/Denver');
    });

    it('should validate timezone format', async () => {
      const result = await updateUserTimezone('Invalid/Timezone');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('timezone');
    });
  });

  describe('updateCompanyInfo', () => {
    it('should update company info successfully', async () => {
      const updates = {
        name: 'Updated Company Name',
        website: 'https://updated.com',
      };

      const result = await updateCompanyInfo(updates);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate company name length', async () => {
      const updates = {
        name: 'A'.repeat(300), // Too long
      };

      const result = await updateCompanyInfo(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should validate website URL', async () => {
      const updates = {
        website: 'not-a-valid-url',
      };

      const result = await updateCompanyInfo(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should validate VAT ID format', async () => {
      const updates = {
        vatId: 'invalid-vat-id',
      };

      const result = await updateCompanyInfo(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });

  describe('getAllSettings', () => {
    it('should return all settings successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { nile } = require('@/app/api/[...nile]/nile');
      nile.users.getSelf.mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com',
      });

      const result = await getAllSettings();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userSettings).toBeDefined();
      expect(result.data?.generalSettings).toBeDefined();
    });
  });
});
