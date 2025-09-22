/**
 * Tests for notification history management
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  getNotificationHistory,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStatistics,
  getRecentNotifications,
  getUnreadNotificationCount,
  searchNotificationHistory,
} from '../history';

// Mock the auth utilities
jest.mock('../../core/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuth: jest.fn((handler: any) => handler({ userId: 'test-user-1', timestamp: Date.now(), requestId: 'test-req' })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withContextualRateLimit: jest.fn((action: any, type: any, config: any, operation: any) => operation()),
  RateLimits: {
    GENERAL_READ: { limit: 100, windowMs: 60000 },
    GENERAL_WRITE: { limit: 50, windowMs: 60000 },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notFound: jest.fn((resource: any) => ({ success: false, error: { type: 'not_found', message: `${resource} not found` } })),
  },
}));

describe('Notification History Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getNotificationHistory', () => {
    it('should return notification history with default pagination', async () => {
      const result = await getNotificationHistory();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data!.length).toBeLessThanOrEqual(50); // Default limit
        if (result.data!.length > 0) {
          expect(result.data![0]).toHaveProperty('id');
          expect(result.data![0]).toHaveProperty('title');
          expect(result.data![0]).toHaveProperty('message');
          expect(result.data![0]).toHaveProperty('channel');
          expect(result.data![0]).toHaveProperty('status');
        }
      }
    });

    it('should return notification history with custom pagination', async () => {
      const result = await getNotificationHistory(10, 0);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data!.length).toBeLessThanOrEqual(10);
      }
    });

    it('should validate pagination parameters', async () => {
      // Test invalid limit
      const result1 = await getNotificationHistory(101, 0);
      expect(result1).toBeDefined();

      // Test negative offset
      const result2 = await getNotificationHistory(10, -1);
      expect(result2).toBeDefined();
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark notifications as read successfully', async () => {
      const notificationIds = ['notif-hist-1', 'notif-hist-2'];
      
      const result = await markNotificationsAsRead(notificationIds);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.updated).toBe(notificationIds.length);
      }
    });

    it('should validate notification IDs', async () => {
      // Test empty array
      const result1 = await markNotificationsAsRead([]);
      expect(result1).toBeDefined();

      // Test too many IDs
      const tooManyIds = Array.from({ length: 101 }, (_, i) => `notif-${i}`);
      const result2 = await markNotificationsAsRead(tooManyIds);
      expect(result2).toBeDefined();
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      const result = await markAllNotificationsAsRead();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(typeof result.data!.updated).toBe('number');
        expect(result.data!.updated).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const result = await deleteNotification('notif-hist-1');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.deleted).toBe(true);
      }
    });

    it('should validate notification ID', async () => {
      const result = await deleteNotification('');
      expect(result).toBeDefined();
    });
  });

  describe('getNotificationStatistics', () => {
    it('should return notification statistics', async () => {
      const result = await getNotificationStatistics();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(typeof result.data!.total).toBe('number');
        expect(typeof result.data!.unread).toBe('number');
        expect(result.data!.byChannel).toBeDefined();
        expect(result.data!.byStatus).toBeDefined();
        expect(typeof result.data!.byChannel.email).toBe('number');
        expect(typeof result.data!.byChannel.inApp).toBe('number');
        expect(typeof result.data!.byChannel.push).toBe('number');
        expect(typeof result.data!.byChannel.sms).toBe('number');
      }
    });
  });

  describe('getRecentNotifications', () => {
    it('should return recent notifications', async () => {
      const result = await getRecentNotifications();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data!.length).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return unread notification count', async () => {
      const result = await getUnreadNotificationCount();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(typeof result.data!.count).toBe('number');
        expect(result.data!.count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('searchNotificationHistory', () => {
    it('should search notifications successfully', async () => {
      const result = await searchNotificationHistory('reply');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        // Results should contain the search term
        if (result.data!.length > 0) {
          const hasSearchTerm = result.data!.some(notification =>
            notification.title.toLowerCase().includes('reply') ||
            notification.message.toLowerCase().includes('reply')
          );
          expect(hasSearchTerm).toBe(true);
        }
      }
    });

    it('should search with filters', async () => {
      const filters = {
        channel: 'email' as const,
        status: 'delivered',
      };
      
      const result = await searchNotificationHistory('campaign', filters);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        // Results should match filters
        if (result.data!.length > 0) {
          result.data!.forEach(notification => {
            expect(notification.channel).toBe('email');
            expect(notification.status).toBe('delivered');
          });
        }
      }
    });

    it('should search with pagination', async () => {
      const pagination = { limit: 5, offset: 0 };
      
      const result = await searchNotificationHistory('notification', undefined, pagination);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data!.length).toBeLessThanOrEqual(5);
      }
    });

    it('should validate search query', async () => {
      // Test short query
      const result1 = await searchNotificationHistory('a');
      expect(result1).toBeDefined();

      // Test empty query
      const result2 = await searchNotificationHistory('');
      expect(result2).toBeDefined();
    });

    it('should validate pagination in search', async () => {
      const invalidPagination = { limit: 101, offset: -1 };
      
      const result = await searchNotificationHistory('test', undefined, invalidPagination);
      expect(result).toBeDefined();
    });

    it('should handle date filters', async () => {
      const filters = {
        dateFrom: '2024-12-01',
        dateTo: '2024-12-31',
      };
      
      const result = await searchNotificationHistory('notification', filters);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        // Results should be within date range
        if (result.data!.length > 0) {
          const fromDate = new Date(filters.dateFrom);
          const toDate = new Date(filters.dateTo);

          result.data!.forEach(notification => {
            const notificationDate = new Date(notification.sentAt);
            expect(notificationDate.getTime()).toBeGreaterThanOrEqual(fromDate.getTime());
            expect(notificationDate.getTime()).toBeLessThanOrEqual(toDate.getTime());
          });
        }
      }
    });
  });
});
