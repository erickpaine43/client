/**
 * Tests for notification preferences actions
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  getSimpleNotificationPreferences,
  updateSimpleNotificationPreferences,
  getDetailedNotificationPreferences,
  updateDetailedNotificationPreferences,
  testNotification,
  getNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../notifications';

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

describe('Notification Preferences Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSimpleNotificationPreferences', () => {
    it('should return simple notification preferences successfully', async () => {
      const result = await getSimpleNotificationPreferences();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe('test-user-id');
      expect(typeof result.data?.newReplies).toBe('boolean');
      expect(typeof result.data?.campaignUpdates).toBe('boolean');
    });
  });

  describe('updateSimpleNotificationPreferences', () => {
    it('should update simple notification preferences successfully', async () => {
      const updates = {
        newReplies: false,
        campaignUpdates: true,
        weeklyReports: false,
      };

      const result = await updateSimpleNotificationPreferences(updates);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe('test-user-id');
    });

    it('should validate boolean values', async () => {
      const updates = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newReplies: 'invalid' as any,
      };

      const result = await updateSimpleNotificationPreferences(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('newReplies');
    });

    it('should accept undefined values', async () => {
      const updates = {
        newReplies: undefined,
        campaignUpdates: true,
      };

      const result = await updateSimpleNotificationPreferences(updates);

      expect(result.success).toBe(true);
    });
  });

  describe('getDetailedNotificationPreferences', () => {
    it('should return detailed notification preferences successfully', async () => {
      const result = await getDetailedNotificationPreferences();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.categories).toBeDefined();
      expect(result.data?.globalSettings).toBeDefined();
      expect(Array.isArray(result.data?.categories)).toBe(true);
      expect(result.data?.categories.length).toBeGreaterThan(0);
    });

    it('should return categories with proper structure', async () => {
      const result = await getDetailedNotificationPreferences();

      expect(result.success).toBe(true);
      result.data?.categories.forEach(category => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.channels).toBeDefined();
        expect(typeof category.channels.email).toBe('boolean');
        expect(typeof category.channels.inApp).toBe('boolean');
        expect(typeof category.channels.push).toBe('boolean');
      });
    });
  });

  describe('updateDetailedNotificationPreferences', () => {
    it('should update detailed notification preferences successfully', async () => {
      const updates = {
        categories: [
          {
            id: 'new-replies',
            channels: {
              email: false,
              inApp: true,
            },
          },
        ],
        globalSettings: {
          emailEnabled: true,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
          },
        },
      };

      const result = await updateDetailedNotificationPreferences(updates);

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should validate quiet hours time format', async () => {
      const updates = {
        globalSettings: {
          quietHours: {
            start: 'invalid-time',
          },
        },
      };

      const result = await updateDetailedNotificationPreferences(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('quietHours.start');
    });

    it('should validate timezone', async () => {
      const updates = {
        globalSettings: {
          quietHours: {
            timezone: 'Invalid/Timezone',
          },
        },
      };

      const result = await updateDetailedNotificationPreferences(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('quietHours.timezone');
    });

    it('should validate category IDs', async () => {
      const updates = {
        categories: [
          {
            id: 'invalid-category',
            channels: {
              email: true,
            },
          },
        ],
      };

      const result = await updateDetailedNotificationPreferences(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('categories');
    });

    it('should accept valid time formats', async () => {
      const validTimes = ['00:00', '12:30', '23:59', '9:15'];
      
      for (const time of validTimes) {
        const updates = {
          globalSettings: {
            quietHours: {
              start: time,
            },
          },
        };

        const result = await updateDetailedNotificationPreferences(updates);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('testNotification', () => {
    it('should send test email notification successfully', async () => {
      const result = await testNotification('email', 'new-replies');

      expect(result.success).toBe(true);
      expect(result.data?.sent).toBe(true);
      expect(result.data?.message).toContain('email');
    });

    it('should send test in-app notification successfully', async () => {
      const result = await testNotification('inApp', 'campaign-updates');

      expect(result.success).toBe(true);
      expect(result.data?.sent).toBe(true);
      expect(result.data?.message).toContain('in-app');
    });

    it('should validate notification type', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await testNotification('invalid' as any, 'new-replies');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('type');
    });

    it('should validate notification category', async () => {
      const result = await testNotification('email', 'invalid-category');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('category');
    });
  });

  describe('getNotificationHistory', () => {
    it('should return notification history successfully', async () => {
      const result = await getNotificationHistory();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.notifications).toBeDefined();
      expect(Array.isArray(result.data?.notifications)).toBe(true);
      expect(typeof result.data?.total).toBe('number');
      expect(typeof result.data?.hasMore).toBe('boolean');
    });

    it('should validate limit parameter', async () => {
      const result = await getNotificationHistory(150); // Too high

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('limit');
    });

    it('should validate offset parameter', async () => {
      const result = await getNotificationHistory(50, -1); // Negative

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('offset');
    });

    it('should return notifications with proper structure', async () => {
      const result = await getNotificationHistory(10);

      expect(result.success).toBe(true);
      result.data?.notifications.forEach(notification => {
        expect(notification.id).toBeDefined();
        expect(notification.type).toBeDefined();
        expect(notification.category).toBeDefined();
        expect(notification.title).toBeDefined();
        expect(notification.message).toBeDefined();
        expect(notification.sentAt).toBeInstanceOf(Date);
        expect(notification.status).toBeDefined();
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const result = await markNotificationAsRead('notif-123');

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should require notification ID', async () => {
      const result = await markNotificationAsRead('');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('notificationId');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const result = await markAllNotificationsAsRead();

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
      expect(typeof result.data?.markedCount).toBe('number');
    });
  });
});
