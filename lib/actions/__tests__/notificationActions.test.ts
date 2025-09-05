/**
 * Unit tests for notificationActions.ts
 * 
 * Note: These tests are written for Jest/Vitest.
 * To run them, you'll need to configure a test runner.
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  updateEmailNotifications,
  updateInAppNotifications,
  updatePushNotifications,
  getNotificationHistory,
  markNotificationsAsRead,
  getNotificationSchedules,
  upsertNotificationSchedule,
  deleteNotificationSchedule,
  getNotificationTypes,
  preferencesToFormValues,
  formValuesToPreferences,
  preferencesToSettingsProps,
  bulkUpdateNotificationPreferences,
  NOTIFICATION_ERROR_CODES,
} from '../notificationActions';
import { 
  mockNotificationPreferences,
} from '../../data/notifications.mock';
import * as authUtils from '../../utils/auth';

// Mock timers for simulated delays and API calls
jest.mock('@/app/api/[...nile]/nile');

// Mock timers for simulated delays

describe('Notification Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotificationPreferences', () => {
    it('should return notification preferences for authenticated user', async () => {
      const mockUserId = 'user-123';
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(mockUserId);
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await getNotificationPreferences();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(mockUserId);
        expect(result.data.email).toBeDefined();
        expect(result.data.inApp).toBeDefined();
        expect(result.data.push).toBeDefined();
      }
    });

    it('should return error when user is not authenticated', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);

      const result = await getNotificationPreferences();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('logged in');
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.AUTH_REQUIRED);
      }
    });

    it('should enforce rate limiting', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(false);

      const result = await getNotificationPreferences();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Too many requests');
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    });

    it('should handle network errors gracefully', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockRejectedValue(
        new Error('Network error')
      );

      const result = await getNotificationPreferences();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.INTERNAL_ERROR);
      }
    });
  });

  describe('updateNotificationPreferences', () => {
    const validPreferences = {
      email: {
        newReplies: true,
        campaignUpdates: false,
        weeklyReports: true,
      },
      inApp: {
        realTimeCampaignAlerts: true,
        emailAccountAlerts: false,
      },
      push: {
        enabled: true,
        desktopNotifications: true,
        mobileNotifications: true,
      },
    };

    it('should update preferences for authenticated user with valid data', async () => {
      const mockUserId = 'user-123';
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(mockUserId);
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await updateNotificationPreferences(validPreferences);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(mockUserId);
        expect(result.data.email.newReplies).toBe(true);
        expect(result.data.email.campaignUpdates).toBe(false);
        expect(result.data.inApp.realTimeCampaignAlerts).toBe(true);
        expect(result.data.push.enabled).toBe(true);
      }
    });

    it('should reject invalid email preference values', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await updateNotificationPreferences({
        email: {
          newReplies: 'invalid' as never,
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid value for email preference');
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it('should reject push notifications without any platform enabled', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await updateNotificationPreferences({
        push: {
          enabled: true,
          desktopNotifications: false,
          mobileNotifications: false,
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('At least one notification platform must be enabled');
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it('should enforce rate limiting', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(false);

      const result = await updateNotificationPreferences(validPreferences);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Too many updates');
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    });

    it('should require authentication', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);

      const result = await updateNotificationPreferences(validPreferences);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.AUTH_REQUIRED);
      }
    });
  });

  describe('updateEmailNotifications', () => {
    it('should update only email preferences', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const emailPrefs = {
        newReplies: false,
        weeklyReports: true,
      };

      const result = await updateEmailNotifications(emailPrefs);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.newReplies).toBe(false);
        expect(result.data.weeklyReports).toBe(true);
      }
    });

    it('should validate email preferences', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await updateEmailNotifications({
        newReplies: 123 as never,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid value');
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.VALIDATION_FAILED);
      }
    });
  });

  describe('updateInAppNotifications', () => {
    it('should update only in-app preferences', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const inAppPrefs = {
        realTimeCampaignAlerts: false,
        emailAccountAlerts: true,
      };

      const result = await updateInAppNotifications(inAppPrefs);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.realTimeCampaignAlerts).toBe(false);
        expect(result.data.emailAccountAlerts).toBe(true);
      }
    });
  });

  describe('updatePushNotifications', () => {
    it('should update only push preferences', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const pushPrefs = {
        enabled: true,
        desktopNotifications: true,
        mobileNotifications: false,
      };

      const resultPromise = updatePushNotifications(pushPrefs);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
        expect(result.data.desktopNotifications).toBe(true);
        expect(result.data.mobileNotifications).toBe(false);
      }
    });

    it('should validate push platform requirements', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await updatePushNotifications({
        enabled: true,
        desktopNotifications: false,
        mobileNotifications: false,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('At least one notification platform');
      }
    });
  });

  describe('getNotificationHistory', () => {
    it('should return notification history with pagination', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-1');

      const resultPromise = getNotificationHistory(10, 0);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeLessThanOrEqual(10);
      }
    });

    it('should validate pagination parameters', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Test invalid limit
      let result = await getNotificationHistory(0, 0);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Limit must be between');
      }

      // Test limit too high
      result = await getNotificationHistory(101, 0);
      expect(result.success).toBe(false);

      // Test negative offset
      result = await getNotificationHistory(10, -1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Offset must be non-negative');
      }
    });

    it('should require authentication', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);

      const result = await getNotificationHistory();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.AUTH_REQUIRED);
      }
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark notifications as read', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const notificationIds = ['notif-1', 'notif-2', 'notif-3'];

      const resultPromise = markNotificationsAsRead(notificationIds);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.updated).toBe(3);
      }
    });

    it('should reject empty notification IDs', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await markNotificationsAsRead([]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('No notification IDs provided');
      }
    });

    it('should limit batch size', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const tooManyIds = Array(101).fill('notif-id');
      const result = await markNotificationsAsRead(tooManyIds);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Cannot mark more than 100');
      }
    });
  });

  describe('getNotificationSchedules', () => {
    it('should return notification schedules', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      const resultPromise = getNotificationSchedules();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        result.data.forEach(schedule => {
          expect(schedule.userId).toBe('user-123');
          expect(schedule.type).toBeDefined();
          expect(schedule.schedule).toBeDefined();
        });
      }
    });
  });

  describe('upsertNotificationSchedule', () => {
    it('should create or update a notification schedule', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const schedule = {
        type: 'weeklyReports' as const,
        schedule: {
          frequency: 'weekly' as const,
          dayOfWeek: 1, // Monday
          time: '09:00',
          timezone: 'America/New_York',
        },
        enabled: true,
      };

      const resultPromise = upsertNotificationSchedule(schedule);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('weeklyReports');
        expect(result.data.schedule.dayOfWeek).toBe(1);
        expect(result.data.enabled).toBe(true);
      }
    });

    it('should validate schedule type', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await upsertNotificationSchedule({
        type: 'invalidType' as never,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid schedule type');
      }
    });

    it('should validate time format', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await upsertNotificationSchedule({
        type: 'weeklyReports',
        schedule: {
          time: '25:00', // Invalid time
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Time must be in HH:MM format');
      }
    });

    it('should validate day of week range', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await upsertNotificationSchedule({
        type: 'weeklyReports',
        schedule: {
          dayOfWeek: 7, // Invalid (0-6)
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Day of week must be between');
      }
    });

    it('should validate timezone', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await upsertNotificationSchedule({
        type: 'weeklyReports',
        schedule: {
          timezone: 'Invalid/Timezone',
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid timezone');
      }
    });
  });

  describe('deleteNotificationSchedule', () => {
    it('should delete a notification schedule', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const resultPromise = deleteNotificationSchedule('schedule-1');
      const result = await resultPromise;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.deleted).toBe(true);
      }
    });

    it('should require schedule ID', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await deleteNotificationSchedule('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Schedule ID is required');
      }
    });
  });

  describe('getNotificationTypes', () => {
    it('should return notification types without authentication', async () => {
      const result = await getNotificationTypes();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach(type => {
          expect(type.id).toBeDefined();
          expect(type.name).toBeDefined();
          expect(type.category).toBeDefined();
          expect(type.channels).toBeDefined();
        });
      }
    });
  });

  describe('Utility Functions', () => {
    describe('preferencesToFormValues', () => {
      it('should convert preferences to form values', () => {
        const formValues = preferencesToFormValues(mockNotificationPreferences);

        expect(formValues.newReplies).toBe(mockNotificationPreferences.email.newReplies);
        expect(formValues.campaignUpdates).toBe(
          mockNotificationPreferences.email.campaignUpdates
        );
        expect(formValues.weeklyReports).toBe(
          mockNotificationPreferences.email.weeklyReports
        );
      });
    });

    describe('formValuesToPreferences', () => {
      it('should convert form values to preferences', () => {
        const formValues = {
          newReplies: true,
          campaignUpdates: false,
          weeklyReports: true,
          domainAlerts: false,
          warmupCompletion: false,
        };

        const prefs = formValuesToPreferences(formValues);

        expect(prefs.email?.newReplies).toBe(true);
        expect(prefs.email?.campaignUpdates).toBe(false);
        expect(prefs.email?.weeklyReports).toBe(true);
      });
    });

    describe('preferencesToSettingsProps', () => {
      it('should convert preferences to settings props', () => {
        const props = preferencesToSettingsProps(mockNotificationPreferences);

        expect(props.email.newReplies).toBe(
          mockNotificationPreferences.email.newReplies
        );
        expect(props.inApp.realTimeCampaignAlerts).toBe(
          mockNotificationPreferences.inApp.realTimeCampaignAlerts
        );
      });
    });
  });

  describe('bulkUpdateNotificationPreferences', () => {
    it('should update multiple preference types at once', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const updates = {
        email: { newReplies: false },
        inApp: { emailAccountAlerts: true },
        push: { enabled: false },
      };

      const resultPromise = bulkUpdateNotificationPreferences(updates);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email.newReplies).toBe(false);
        expect(result.data.inApp.emailAccountAlerts).toBe(true);
        expect(result.data.push.enabled).toBe(false);
      }
    });

    it('should validate all preference types', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await bulkUpdateNotificationPreferences({
        email: { newReplies: 'invalid' as any },
        inApp: { emailAccountAlerts: 'invalid' as any },
        push: { enabled: 'invalid' as any },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.VALIDATION_FAILED);
      }
    });
  });

  describe('Error Handling', () => {
    it('should provide specific error codes for different error types', async () => {
      // Auth error
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);
      
      let result = await getNotificationPreferences();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.AUTH_REQUIRED);
      }

      // Validation error
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const upsertResult = await upsertNotificationSchedule({ type: 'invalid' as any });
      expect(upsertResult.success).toBe(false);
      if (!upsertResult.success) {
        expect(upsertResult.code).toBe(NOTIFICATION_ERROR_CODES.VALIDATION_FAILED);
      }

      // Rate limit error
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(false);
      
      result = await getNotificationPreferences();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(NOTIFICATION_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    });
  });

  describe('Authentication Integration', () => {
    it('should consistently check authentication across protected actions', async () => {
      const getCurrentUserIdSpy = jest.spyOn(authUtils, 'getCurrentUserId');
      const requireUserIdSpy = jest.spyOn(authUtils, 'requireUserId');
      
      getCurrentUserIdSpy.mockResolvedValue(null);
      requireUserIdSpy.mockRejectedValue(new Error('Not authenticated'));

      const actions = [
        getNotificationPreferences(),
        updateNotificationPreferences({ email: {} }),
        getNotificationHistory(),
        getNotificationSchedules(),
      ];

      const results = await Promise.allSettled(actions);

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          expect(result.value.success).toBe(false);
          if (!result.value.success) {
            expect([
              NOTIFICATION_ERROR_CODES.AUTH_REQUIRED,
              NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
            ]).toContain(result.value.code);
          }
        }
      });
    });
  });
});
