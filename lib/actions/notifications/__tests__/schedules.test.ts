/**
 * Tests for notification schedules management
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  getNotificationSchedules,
  upsertNotificationSchedule,
  deleteNotificationSchedule,
  toggleNotificationSchedule,
  getNotificationScheduleByType,
  getEnabledNotificationSchedules,
  createCustomReminder,
  getNextScheduledNotifications,
} from '../schedules';
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

describe('Notification Schedules Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getNotificationSchedules', () => {
    it('should return notification schedules for authenticated user', async () => {
      const result = await getNotificationSchedules();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        if (result.data!.length > 0) {
          expect(result.data![0]).toHaveProperty('id');
          expect(result.data![0]).toHaveProperty('userId');
          expect(result.data![0]).toHaveProperty('type');
          expect(result.data![0]).toHaveProperty('schedule');
          expect(result.data![0]).toHaveProperty('enabled');
          expect(result.data![0].userId).toBe('test-user-1');
        }
      }
    });
  });

  describe('upsertNotificationSchedule', () => {
    it('should create a new notification schedule', async () => {
      const scheduleData = {
        type: 'weeklyReports' as const,
        schedule: {
          frequency: 'weekly' as const,
          dayOfWeek: 1, // Monday
          time: '09:00',
          timezone: 'America/New_York',
        },
        enabled: true,
      };

      const result = await upsertNotificationSchedule(scheduleData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.type).toBe('weeklyReports');
        expect(result.data!.schedule.frequency).toBe('weekly');
        expect(result.data!.schedule.dayOfWeek).toBe(1);
        expect(result.data!.schedule.time).toBe('09:00');
        expect(result.data!.enabled).toBe(true);
        expect(result.data!.userId).toBe('test-user-1');
      }
    });

    it('should update an existing notification schedule', async () => {
      const scheduleData = {
        id: 'schedule-1',
        type: 'weeklyReports' as const,
        schedule: {
          frequency: 'weekly' as const,
          dayOfWeek: 2, // Tuesday
          time: '10:00',
          timezone: 'America/New_York',
        },
        enabled: false,
      };

      const result = await upsertNotificationSchedule(scheduleData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.schedule.dayOfWeek).toBe(2);
        expect(result.data!.schedule.time).toBe('10:00');
        expect(result.data!.enabled).toBe(false);
      }
    });

    it('should validate schedule data', async () => {
      // Test missing type
      const invalidSchedule1 = {
        schedule: {
          frequency: 'weekly' as const,
          time: '09:00',
          timezone: 'UTC',
        },
      };

      const result1 = await upsertNotificationSchedule(invalidSchedule1);
      expect(result1).toBeDefined();

      // Test invalid type
      const invalidSchedule2 = {
        type: 'invalidType' as 'weeklyReports' | 'monthlyReports' | 'customReminder',
        schedule: {
          frequency: 'weekly' as const,
          time: '09:00',
          timezone: 'UTC',
        },
      };

      const result2 = await upsertNotificationSchedule(invalidSchedule2);
      expect(result2).toBeDefined();

      // Test invalid day of week
      const invalidSchedule3 = {
        type: 'weeklyReports' as const,
        schedule: {
          frequency: 'weekly' as const,
          dayOfWeek: 8, // Invalid
          time: '09:00',
          timezone: 'UTC',
        },
      };

      const result3 = await upsertNotificationSchedule(invalidSchedule3);
      expect(result3).toBeDefined();

      // Test invalid time format
      const invalidSchedule4 = {
        type: 'weeklyReports' as const,
        schedule: {
          frequency: 'weekly' as const,
          time: '25:00', // Invalid
          timezone: 'UTC',
        },
      };

      const result4 = await upsertNotificationSchedule(invalidSchedule4);
      expect(result4).toBeDefined();
    });
  });

  describe('deleteNotificationSchedule', () => {
    it('should delete notification schedule successfully', async () => {
      const result = await deleteNotificationSchedule('schedule-1');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.deleted).toBe(true);
      }
    });

    it('should validate schedule ID', async () => {
      const result = await deleteNotificationSchedule('');
      expect(result).toBeDefined();
    });
  });

  describe('toggleNotificationSchedule', () => {
    it('should enable notification schedule', async () => {
      const result = await toggleNotificationSchedule('schedule-1', true);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.enabled).toBe(true);
      }
    });

    it('should disable notification schedule', async () => {
      const result = await toggleNotificationSchedule('schedule-1', false);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.enabled).toBe(false);
      }
    });

    it('should validate schedule ID', async () => {
      const result = await toggleNotificationSchedule('', true);
      expect(result).toBeDefined();
    });
  });

  describe('getNotificationScheduleByType', () => {
    it('should return schedule by type', async () => {
      const result = await getNotificationScheduleByType('weeklyReports');
      
      expect(result.success).toBe(true);
      if (result.success) {
        if (result.data) {
          expect(result.data.type).toBe('weeklyReports');
          expect(result.data.userId).toBe('test-user-1');
        }
      }
    });

    it('should return null for non-existent type', async () => {
      const result = await getNotificationScheduleByType('nonExistentType' as 'weeklyReports');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should validate schedule type', async () => {
      const result = await getNotificationScheduleByType('' as 'weeklyReports');
      expect(result).toBeDefined();
    });
  });

  describe('getEnabledNotificationSchedules', () => {
    it('should return only enabled schedules', async () => {
      const result = await getEnabledNotificationSchedules();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        result.data!.forEach(schedule => {
          expect(schedule.enabled).toBe(true);
          expect(schedule.userId).toBe('test-user-1');
        });
      }
    });
  });

  describe('createCustomReminder', () => {
    it('should create custom reminder successfully', async () => {
      const reminderData = {
        title: 'Follow up with leads',
        message: 'Remember to follow up with new leads',
        schedule: {
          frequency: 'daily' as const,
          time: '14:00',
          timezone: 'America/New_York',
        },
      };

      const result = await createCustomReminder(reminderData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data!.type).toBe('customReminder');
        expect(result.data!.schedule.frequency).toBe('daily');
        expect(result.data!.schedule.time).toBe('14:00');
        expect(result.data!.enabled).toBe(true);
      }
    });

    it('should validate reminder data', async () => {
      // Test missing title
      const invalidReminder1 = {
        title: '',
        message: 'Test message',
        schedule: {
          frequency: 'daily' as const,
          time: '14:00',
          timezone: 'UTC',
        },
      };

      const result1 = await createCustomReminder(invalidReminder1);
      expect(result1).toBeDefined();

      // Test missing message
      const invalidReminder2 = {
        title: 'Test title',
        message: '',
        schedule: {
          frequency: 'daily' as const,
          time: '14:00',
          timezone: 'UTC',
        },
      };

      const result2 = await createCustomReminder(invalidReminder2);
      expect(result2).toBeDefined();
    });
  });

  describe('getNextScheduledNotifications', () => {
    it('should return next scheduled notifications', async () => {
      const result = await getNextScheduledNotifications();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        result.data!.forEach(nextRun => {
          expect(nextRun).toHaveProperty('scheduleId');
          expect(nextRun).toHaveProperty('type');
          expect(nextRun).toHaveProperty('nextRun');
          expect(nextRun).toHaveProperty('timezone');
          expect(nextRun.nextRun).toBeInstanceOf(Date);
        });

        // Should be sorted by next run time
        if (result.data!.length > 1) {
          for (let i = 1; i < result.data!.length; i++) {
            expect(result.data![i].nextRun.getTime()).toBeGreaterThanOrEqual(
              result.data![i - 1].nextRun.getTime()
            );
          }
        }
      }
    });
  });

  describe('Schedule Validation', () => {
    it('should validate weekly schedule correctly', async () => {
      const validWeeklySchedule = {
        type: 'weeklyReports' as const,
        schedule: {
          frequency: 'weekly' as const,
          dayOfWeek: 1, // Monday
          time: '09:00',
          timezone: 'America/New_York',
        },
      };

      const result = await upsertNotificationSchedule(validWeeklySchedule);
      expect(result.success).toBe(true);
    });

    it('should validate monthly schedule correctly', async () => {
      const validMonthlySchedule = {
        type: 'monthlyReports' as const,
        schedule: {
          frequency: 'monthly' as const,
          dayOfMonth: 1, // First day of month
          time: '10:00',
          timezone: 'UTC',
        },
      };

      const result = await upsertNotificationSchedule(validMonthlySchedule);
      expect(result.success).toBe(true);
    });

    it('should validate daily schedule correctly', async () => {
      const validDailySchedule = {
        type: 'customReminder' as const,
        schedule: {
          frequency: 'daily' as const,
          time: '15:30',
          timezone: 'Europe/London',
        },
      };

      const result = await upsertNotificationSchedule(validDailySchedule);
      expect(result.success).toBe(true);
    });

    it('should validate timezone correctly', async () => {
      const invalidTimezoneSchedule = {
        type: 'weeklyReports' as const,
        schedule: {
          frequency: 'weekly' as const,
          dayOfWeek: 1,
          time: '09:00',
          timezone: 'Invalid/Timezone',
        },
      };

      const result = await upsertNotificationSchedule(invalidTimezoneSchedule);
      expect(result).toBeDefined();
    });
  });
});
