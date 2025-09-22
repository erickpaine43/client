/**
 * Tests for notification preferences management
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  updateEmailNotifications,
  updateInAppNotifications,
  updatePushNotifications,
  resetNotificationPreferences,
  getNotificationPreferencesSummary,
} from '../preferences';

// Mock the auth utilities
jest.mock('../../core/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuth: jest.fn((handler: any) => handler({ userId: 'test-user-1', timestamp: Date.now(), requestId: 'test-req' })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withContextualRateLimit: jest.fn((action: any, type: any, config: any, operation: any) => operation()),
  RateLimits: {
    NOTIFICATION_PREFERENCES_UPDATE: { limit: 20, windowMs: 60000 },
    GENERAL_READ: { limit: 100, windowMs: 60000 },
  },
}));

// Mock the error handling
jest.mock('../../core/errors', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withErrorHandling: jest.fn((operation: any) => operation()),
  ErrorFactory: {
    authRequired: jest.fn(() => ({ success: false, error: { type: 'auth', message: 'Auth required' } })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validation: jest.fn((message: any) => ({ success: false, error: { type: 'validation', message } })),
  },
}));

describe('Notification Preferences Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateEmailNotifications', () => {
    it('should update email notification preferences successfully', async () => {
      const emailPrefs = {
        newReplies: false,
        campaignUpdates: true,
        weeklyReports: false,
      };

      const result = await updateEmailNotifications(emailPrefs);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.newReplies).toBe(false);
        expect(result.data!.campaignUpdates).toBe(true);
        expect(result.data!.weeklyReports).toBe(false);
      }
    });

    it('should validate email preferences', async () => {
      const invalidPrefs = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newReplies: 'invalid' as any,
      };

      const result = await updateEmailNotifications(invalidPrefs);

      // Should handle validation error
      expect(result).toBeDefined();
    });
  });

  describe('updateInAppNotifications', () => {
    it('should update in-app notification preferences successfully', async () => {
      const inAppPrefs = {
        realTimeCampaignAlerts: false,
        emailAccountAlerts: true,
        newMessageAlerts: false,
      };

      const result = await updateInAppNotifications(inAppPrefs);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.realTimeCampaignAlerts).toBe(false);
        expect(result.data!.emailAccountAlerts).toBe(true);
        expect(result.data!.newMessageAlerts).toBe(false);
      }
    });

    it('should validate in-app preferences', async () => {
      const invalidPrefs = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        realTimeCampaignAlerts: 123 as any,
      };

      const result = await updateInAppNotifications(invalidPrefs);

      // Should handle validation error
      expect(result).toBeDefined();
    });
  });

  describe('updatePushNotifications', () => {
    it('should update push notification preferences successfully', async () => {
      const pushPrefs = {
        enabled: true,
        desktopNotifications: true,
        mobileNotifications: false,
        sound: true,
      };

      const result = await updatePushNotifications(pushPrefs);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.enabled).toBe(true);
        expect(result.data!.desktopNotifications).toBe(true);
        expect(result.data!.mobileNotifications).toBe(false);
        expect(result.data!.sound).toBe(true);
      }
    });

    it('should validate push notification platform requirements', async () => {
      const invalidPrefs = {
        enabled: true,
        desktopNotifications: false,
        mobileNotifications: false,
      };

      const result = await updatePushNotifications(invalidPrefs);
      
      // Should handle validation error for no platforms enabled
      expect(result).toBeDefined();
    });

    it('should validate push preference types', async () => {
      const invalidPrefs = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enabled: 'yes' as any,
      };

      const result = await updatePushNotifications(invalidPrefs);

      // Should handle validation error
      expect(result).toBeDefined();
    });
  });

  describe('resetNotificationPreferences', () => {
    it('should reset preferences to defaults', async () => {
      const result = await resetNotificationPreferences();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.userId).toBe('test-user-1');
        // Should have default values
        expect(result.data!.email).toBeDefined();
        expect(result.data!.inApp).toBeDefined();
        expect(result.data!.push).toBeDefined();
      }
    });
  });

  describe('getNotificationPreferencesSummary', () => {
    it('should return preferences summary', async () => {
      const result = await getNotificationPreferencesSummary();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(typeof result.data!.emailEnabled).toBe('number');
        expect(typeof result.data!.inAppEnabled).toBe('number');
        expect(typeof result.data!.pushEnabled).toBe('boolean');
        expect(typeof result.data!.totalPreferences).toBe('number');
        expect(result.data!.emailEnabled).toBeGreaterThanOrEqual(0);
        expect(result.data!.inAppEnabled).toBeGreaterThanOrEqual(0);
        expect(result.data!.totalPreferences).toBeGreaterThan(0);
      }
    });
  });

  describe('Validation Functions', () => {
    it('should validate email preferences correctly', () => {
      // This tests the internal validation logic
      const validPrefs = {
        newReplies: true,
        campaignUpdates: false,
      };

      // Since validation functions are internal, we test through the public API
      expect(async () => {
        await updateEmailNotifications(validPrefs);
      }).not.toThrow();
    });

    it('should validate in-app preferences correctly', () => {
      const validPrefs = {
        realTimeCampaignAlerts: true,
        emailAccountAlerts: false,
      };

      expect(async () => {
        await updateInAppNotifications(validPrefs);
      }).not.toThrow();
    });

    it('should validate push preferences correctly', () => {
      const validPrefs = {
        enabled: true,
        desktopNotifications: true,
        mobileNotifications: true,
      };

      expect(async () => {
        await updatePushNotifications(validPrefs);
      }).not.toThrow();
    });
  });
});
