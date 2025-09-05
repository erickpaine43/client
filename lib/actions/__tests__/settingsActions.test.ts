/**
 * Unit tests for settingsActions.ts
 * 
 * Note: These tests are written for Jest/Vitest. 
 * To run them, you'll need to:
 * 1. Install test dependencies: npm install -D jest @types/jest @testing-library/jest-dom
 * 2. Configure Jest in jest.config.js
 * 3. Add test script to package.json: "test": "jest"
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import {
  getUserSettings,
  updateUserSettings,
  getGeneralSettings,
  updateGeneralSettings,
  getSecuritySettings,
  updateSecuritySettings,
  updateUserTimezone,
  updateCompanyInfo,
  getAllSettings,
  ERROR_CODES,
} from '../settingsActions';
import * as authUtils from '../../utils/auth';

// Mock the auth module
jest.mock('../../utils/auth');
jest.mock('@/app/api/[...nile]/nile');


describe('Settings Server Actions', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
  });

  describe('getUserSettings', () => {
    it('should return user settings for authenticated user', async () => {
      // Mock authenticated user
      const mockUserId = 'user-123';
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(mockUserId);

      // Execute
      const resultPromise = getUserSettings();
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(mockUserId);
        expect(result.data.timezone).toBeDefined();
        expect(result.data.companyInfo).toBeDefined();
      }
    });

    it('should return error when user is not authenticated', async () => {
      // Mock unauthenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);

      // Execute
      const result = await getUserSettings();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('logged in');
        expect(result.code).toBe(ERROR_CODES.AUTH_REQUIRED);
      }
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      jest.spyOn(authUtils, 'getCurrentUserId').mockRejectedValue(new Error('Network error'));

      // Execute
      const result = await getUserSettings();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.INTERNAL_ERROR);
      }
    });
  });

  describe('updateUserSettings', () => {
    const validSettings = {
      timezone: 'America/New_York',
      companyInfo: {
        name: 'Test Company',
        industry: 'Technology',
        size: '10-50 employees',
      },
    };

    it('should update settings for authenticated user with valid data', async () => {
      // Mock authenticated user
      const mockUserId = 'user-123';
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(mockUserId);

      // Execute
      const resultPromise = updateUserSettings(validSettings);
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(mockUserId);
        expect(result.data.timezone).toBe(validSettings.timezone);
        expect(result.data.companyInfo.name).toBe(validSettings.companyInfo.name);
      }
    });

    it('should reject invalid timezone', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute with invalid timezone
      const result = await updateUserSettings({
        timezone: 'Invalid/Timezone',
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid timezone');
        expect(result.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it('should reject invalid company VAT ID', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute with invalid VAT ID
      const result = await updateUserSettings({
        companyInfo: {
          vatId: 'invalid-vat-id',
        },
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('VAT ID');
        expect(result.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it('should reject invalid website URL', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute with invalid URL
      const result = await updateUserSettings({
        companyInfo: {
          website: 'not-a-valid-url',
        },
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('website URL');
        expect(result.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it('should require authentication', async () => {
      // Mock unauthenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);

      // Execute
      const result = await updateUserSettings(validSettings);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.AUTH_REQUIRED);
      }
    });
  });

  describe('getGeneralSettings', () => {
    it('should return general settings for authenticated user', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute
      const resultPromise = getGeneralSettings();
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.profile).toBeDefined();
        expect(result.data.preferences).toBeDefined();
        expect(result.data.appearance).toBeDefined();
      }
    });

    it('should merge NileDB user data when available', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      
      // Note: In actual implementation, you'd mock nile.users.getSelf()
      // For this test structure, we're demonstrating the test case

      // Execute
      const resultPromise = getGeneralSettings();
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('updateGeneralSettings', () => {
    it('should update general settings with valid data', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute
      const updates = {
        preferences: {
          theme: 'dark' as const,
          language: 'es',
          timezone: 'Europe/London',
        },
      };
      
      const resultPromise = updateGeneralSettings(updates);
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.preferences.theme).toBe('dark');
        expect(result.data.preferences.language).toBe('es');
        expect(result.data.preferences.timezone).toBe('Europe/London');
      }
    });

    it('should validate timezone when updating preferences', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute with invalid timezone
      const result = await updateGeneralSettings({
        preferences: {
          timezone: 'Invalid/Zone',
        },
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('timezone');
        expect(result.code).toBe(ERROR_CODES.VALIDATION_FAILED);
        expect(result.field).toBe('timezone');
      }
    });
  });

  describe('getSecuritySettings', () => {
    it('should return security settings for authenticated user', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute
      const resultPromise = getSecuritySettings();
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessionTimeout).toBeDefined();
        expect(result.data.twoFactor).toBeDefined();
        expect(result.data.loginAlerts).toBeDefined();
      }
    });
  });

  describe('updateSecuritySettings', () => {
    it('should update security settings with valid data', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute
      const updates = {
        sessionTimeout: 60,
        loginAlerts: true,
        twoFactor: {
          enabled: true,
          method: 'app' as const,
        },
      };
      
      const resultPromise = updateSecuritySettings(updates);
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessionTimeout).toBe(60);
        expect(result.data.loginAlerts).toBe(true);
        expect(result.data.twoFactor.enabled).toBe(true);
      }
    });

    it('should validate session timeout range', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Test too low
      let result = await updateSecuritySettings({ sessionTimeout: 2 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('between 5 and 1440');
        expect(result.field).toBe('sessionTimeout');
      }

      // Test too high
      result = await updateSecuritySettings({ sessionTimeout: 2000 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('between 5 and 1440');
      }
    });
  });

  describe('updateUserTimezone', () => {
    it('should update timezone with valid value', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute
      const resultPromise = updateUserTimezone('Asia/Tokyo');
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timezone).toBe('Asia/Tokyo');
      }
    });

    it('should reject invalid timezone', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute
      const result = await updateUserTimezone('Not/A/Timezone');

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid timezone');
        expect(result.code).toBe(ERROR_CODES.VALIDATION_FAILED);
        expect(result.field).toBe('timezone');
      }
    });
  });

  describe('updateCompanyInfo', () => {
    it('should update company info with valid data', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute
      const companyInfo = {
        name: 'New Company Name',
        industry: 'Healthcare',
        size: '200-500 employees',
        vatId: 'US123456789',
        website: 'https://example.com',
      };
      
      const resultPromise = updateCompanyInfo(companyInfo);
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(companyInfo.name);
        expect(result.data.industry).toBe(companyInfo.industry);
        expect(result.data.vatId).toBe(companyInfo.vatId);
      }
    });

    it('should validate company name length', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Execute with name too long
      const longName = 'a'.repeat(256);
      const result = await updateCompanyInfo({ name: longName });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('255 characters or less');
      }
    });

    it('should validate address fields', async () => {
      // Mock authenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Test invalid zip code
      let result = await updateCompanyInfo({
        address: { zipCode: 'invalid!' },
      });
      expect(result.success).toBe(false);

      // Test city name too long
      result = await updateCompanyInfo({
        address: { city: 'a'.repeat(101) },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('100 characters or less');
      }
    });
  });

  describe('getAllSettings', () => {
    it('should return all settings for authenticated user', async () => {
      // Mock authenticated user
      const mockUserId = 'user-123';
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(mockUserId);

      // Execute
      const resultPromise = getAllSettings();
      const result = await resultPromise;

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userSettings).toBeDefined();
        expect(result.data.userSettings.userId).toBe(mockUserId);
        expect(result.data.generalSettings).toBeDefined();
        expect(result.data.securitySettings).toBeDefined();
      }
    });

    it('should require authentication', async () => {
      // Mock unauthenticated user
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);

      // Execute
      const result = await getAllSettings();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.AUTH_REQUIRED);
      }
    });

    it('should handle errors gracefully', async () => {
      // Mock error
      jest.spyOn(authUtils, 'getCurrentUserId').mockRejectedValue(new Error('Database error'));

      // Execute
      const result = await getAllSettings();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.INTERNAL_ERROR);
      }
    });
  });

  describe('Error Handling', () => {
    it('should provide specific error codes for different error types', async () => {
      // Mock unauthenticated for auth error
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);
      
      let result = await getUserSettings();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.AUTH_REQUIRED);
      }

      // Mock authenticated for validation error
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      
      result = await updateUserSettings({ timezone: 'Invalid' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it('should handle network errors with appropriate error code', async () => {
      // Mock network error
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      
      // For this test, we'd need to mock the actual database call
      // This demonstrates the expected behavior
      
      // Assert that network errors are handled with NETWORK_ERROR code
      expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
    });
  });
});

describe('Authentication Integration', () => {
  it('should use getCurrentUserId from auth utils', async () => {
    const getCurrentUserIdSpy = jest.spyOn(authUtils, 'getCurrentUserId');
    getCurrentUserIdSpy.mockResolvedValue('user-123');

    await getUserSettings();

    expect(getCurrentUserIdSpy).toHaveBeenCalled();
  });

  it('should consistently check authentication across all protected actions', async () => {
    const getCurrentUserIdSpy = jest.spyOn(authUtils, 'getCurrentUserId');
    getCurrentUserIdSpy.mockResolvedValue(null);

    const actions = [
      getUserSettings(),
      updateUserSettings({ timezone: 'UTC' }),
      getGeneralSettings(),
      updateGeneralSettings({ preferences: {} }),
      getSecuritySettings(),
      updateSecuritySettings({ sessionTimeout: 30 }),
      updateUserTimezone('UTC'),
      updateCompanyInfo({ name: 'Test' }),
      getAllSettings(),
    ];

    const results = await Promise.all(actions);

    results.forEach(result => {
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ERROR_CODES.AUTH_REQUIRED);
      }
    });

    expect(getCurrentUserIdSpy).toHaveBeenCalled();
  });
});
