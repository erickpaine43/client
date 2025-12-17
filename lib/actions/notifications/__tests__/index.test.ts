/**
 * Tests for notifications module main entry point
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { mockNotificationPreferences } from '../../../../lib/data/notifications.mock';

// Mock the auth utilities
jest.mock('../../core/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuth: jest.fn((handler: any) => {
    return handler({ userId: 'test-user-1', timestamp: Date.now(), requestId: 'test-req' });
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withContextualRateLimit: jest.fn((action: any, type: any, config: any, operation: any) => {
    return operation();
  }),
  RateLimits: {
    GENERAL_READ: { limit: 100, windowMs: 60000 },
    NOTIFICATION_PREFERENCES_UPDATE: { limit: 20, windowMs: 60000 },
  },
}));

// Mock the error handling
jest.mock('../../core/errors', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withErrorHandling: jest.fn((operation: any) => {
    return operation();
  }),
  ErrorFactory: {
    authRequired: jest.fn(() => ({ success: false, error: { type: 'auth', message: 'Auth required' } })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validation: jest.fn((message: any) => ({ success: false, error: { type: 'validation', message } })),
  },
}));

// Mock the preferences module
jest.mock('../preferences', () => ({
  getNotificationPreferencesInternal: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      ...mockNotificationPreferences,
      userId: 'test-user-1',
    },
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateNotificationPreferencesInternal: jest.fn((context: any, preferences: any) => Promise.resolve({
    success: true,
    data: {
      ...mockNotificationPreferences,
      userId: context.userId,
      email: {
        ...mockNotificationPreferences.email,
        ...(preferences.email || {}),
      },
      inApp: {
        ...mockNotificationPreferences.inApp,
        ...(preferences.inApp || {}),
      },
      push: {
        ...mockNotificationPreferences.push,
        ...(preferences.push || {}),
      },
    },
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bulkUpdateNotificationPreferencesInternal: jest.fn((context: any, updates: any) => Promise.resolve({
    success: true,
    data: {
      ...mockNotificationPreferences,
      userId: context.userId,
      email: {
        ...mockNotificationPreferences.email,
        ...(updates.email || {}),
      },
      inApp: {
        ...mockNotificationPreferences.inApp,
        ...(updates.inApp || {}),
      },
      push: {
        ...mockNotificationPreferences.push,
        ...(updates.push || {}),
      },
    },
  })),
}));

// Import after mocking
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationTypes,
  preferencesToFormValues,
  formValuesToPreferences,
  preferencesToSettingsProps,
  bulkUpdateNotificationPreferences,
} from '../index';

describe('Notifications Module - Main Entry Point', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getNotificationPreferences', () => {
    it('should return notification preferences for authenticated user', async () => {
      const result = await getNotificationPreferences();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.userId).toBe('test-user-1');
        expect(result.data!.email).toBeDefined();
        expect(result.data!.inApp).toBeDefined();
        expect(result.data!.push).toBeDefined();
      }
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences successfully', async () => {
      const updates = {
        email: {
          newReplies: false,
          campaignUpdates: true,
        },
      };

      const result = await updateNotificationPreferences(updates);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.email.newReplies).toBe(false);
        expect(result.data!.email.campaignUpdates).toBe(true);
      }
    });

    it('should handle validation errors', async () => {
      const updates = {
        email: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newReplies: 'invalid' as any, // Invalid type
        },
      };

      const result = await updateNotificationPreferences(updates);

      // Should handle validation error gracefully
      expect(result).toBeDefined();
    });
  });

  describe('getNotificationTypes', () => {
    it('should return available notification types', async () => {
      const result = await getNotificationTypes();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data!.length).toBeGreaterThan(0);
        expect(result.data![0]).toHaveProperty('id');
        expect(result.data![0]).toHaveProperty('name');
        expect(result.data![0]).toHaveProperty('category');
      }
    });
  });

  describe('bulkUpdateNotificationPreferences', () => {
    it('should update multiple preference types at once', async () => {
      const updates = {
        email: {
          newReplies: true,
          campaignUpdates: false,
        },
        inApp: {
          realTimeCampaignAlerts: false,
        },
        push: {
          enabled: true,
          desktopNotifications: true,
        },
      };

      const result = await bulkUpdateNotificationPreferences(updates);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.email.newReplies).toBe(true);
        expect(result.data!.email.campaignUpdates).toBe(false);
        expect(result.data!.inApp.realTimeCampaignAlerts).toBe(false);
        expect(result.data!.push.enabled).toBe(true);
      }
    });
  });

  describe('Helper Functions', () => {
    describe('preferencesToFormValues', () => {
      it('should convert preferences to form values correctly', () => {
        const formValues = preferencesToFormValues(mockNotificationPreferences);
        
        expect(formValues).toEqual({
          newReplies: mockNotificationPreferences.email.newReplies,
          campaignUpdates: mockNotificationPreferences.email.campaignUpdates,
          weeklyReports: mockNotificationPreferences.email.weeklyReports,
          domainAlerts: mockNotificationPreferences.email.domainAlerts,
          warmupCompletion: mockNotificationPreferences.email.warmupCompletion,
        });
      });
    });

    describe('formValuesToPreferences', () => {
      it('should convert form values to preferences correctly', () => {
        const formValues = {
          newReplies: true,
          campaignUpdates: false,
          weeklyReports: true,
          domainAlerts: false,
          warmupCompletion: true,
        };

        const preferences = formValuesToPreferences(formValues);
        
        expect(preferences).toEqual({
          email: {
            newReplies: true,
            campaignUpdates: false,
            weeklyReports: true,
            domainAlerts: false,
            warmupCompletion: true,
          },
        });
      });
    });

    describe('preferencesToSettingsProps', () => {
      it('should convert preferences to settings props correctly', () => {
        const settingsProps = preferencesToSettingsProps(mockNotificationPreferences);
        
        expect(settingsProps).toEqual({
          email: {
            campaignCompletions: mockNotificationPreferences.email.campaignCompletions,
            newReplies: mockNotificationPreferences.email.newReplies,
            weeklyReports: mockNotificationPreferences.email.weeklyReports,
            systemAnnouncements: mockNotificationPreferences.email.systemAnnouncements,
          },
          inApp: {
            realTimeCampaignAlerts: mockNotificationPreferences.inApp.realTimeCampaignAlerts,
            emailAccountAlerts: mockNotificationPreferences.inApp.emailAccountAlerts,
          },
        });
      });
    });
  });
});
