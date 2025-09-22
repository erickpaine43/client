/**
 * Notification schedules management
 * 
 * This module handles notification scheduling operations including
 * creating, updating, and managing notification schedules.
 */

"use server";

import { ActionResult, ActionContext } from '../core/types';
import { withErrorHandling, ErrorFactory } from '../core/errors';
import { withAuth, withContextualRateLimit, RateLimits } from '../core/auth';
import {
  mockNotificationSchedules,
  NotificationSchedule,
} from '../../../lib/data/notifications.mock';

// Helper type for deep partial updates
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Validation function for notification schedules
 */
function validateNotificationSchedule(
  schedule: DeepPartial<NotificationSchedule>
): string | null {
  if (!schedule.type) {
    return "Schedule type is required";
  }
  
  if (!["weeklyReports", "monthlyReports", "customReminder"].includes(schedule.type)) {
    return "Invalid schedule type";
  }
  
  if (schedule.schedule) {
    const { frequency, dayOfWeek, dayOfMonth, time, timezone } = schedule.schedule;
    
    if (frequency && !["daily", "weekly", "monthly"].includes(frequency)) {
      return "Invalid schedule frequency";
    }
    
    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return "Day of week must be between 0 (Sunday) and 6 (Saturday)";
    }
    
    if (dayOfMonth !== undefined && (dayOfMonth < 1 || dayOfMonth > 31)) {
      return "Day of month must be between 1 and 31";
    }
    
    if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return "Time must be in HH:MM format";
    }
    
    if (timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch {
        return "Invalid timezone";
      }
    }
  }
  
  return null;
}

/**
 * Get notification schedules for the authenticated user
 */
export async function getNotificationSchedules(): Promise<ActionResult<NotificationSchedule[]>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:schedules',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return getNotificationSchedulesInternal(context);
      }
    );
  });
}

/**
 * Internal function to get notification schedules
 */
export async function getNotificationSchedulesInternal(
  context: ActionContext
): Promise<ActionResult<NotificationSchedule[]>> {
  return withErrorHandling(async () => {
    if (!context.userId) {
      return ErrorFactory.authRequired();
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, fetch from database
    // const schedules = await db.notificationSchedules.findMany({
    //   where: { userId: context.userId }
    // });
    
    // For now, return mock data
    const schedules = mockNotificationSchedules.map(s => ({
      ...s,
      userId: context.userId!,
    }));
    
    return schedules;
  });
}

/**
 * Create or update a notification schedule
 */
export async function upsertNotificationSchedule(
  schedule: DeepPartial<NotificationSchedule>
): Promise<ActionResult<NotificationSchedule>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:schedule-upsert',
      'user',
      RateLimits.GENERAL_WRITE,
      async () => {
        return upsertNotificationScheduleInternal(context, schedule);
      }
    );
  });
}

/**
 * Internal function to create or update a notification schedule
 */
export async function upsertNotificationScheduleInternal(
  context: ActionContext,
  schedule: DeepPartial<NotificationSchedule>
): Promise<ActionResult<NotificationSchedule>> {
  return withErrorHandling(async () => {
    if (!context.userId) {
      return ErrorFactory.authRequired();
    }

    const validationError = validateNotificationSchedule(schedule);
    if (validationError) {
      return ErrorFactory.validation(validationError);
    }
    
    // Simulate database upsert
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // In production, upsert in database
    // const result = await db.notificationSchedules.upsert({
    //   where: { 
    //     userId_type: { userId: context.userId, type: schedule.type } 
    //   },
    //   create: { ...schedule, userId: context.userId },
    //   update: { ...schedule }
    // });
    
    const result: NotificationSchedule = {
      id: schedule.id || `schedule-${Date.now()}`,
      userId: context.userId,
      type: schedule.type as NotificationSchedule["type"],
      schedule: {
        frequency: schedule.schedule?.frequency || "weekly",
        dayOfWeek: schedule.schedule?.dayOfWeek,
        dayOfMonth: schedule.schedule?.dayOfMonth,
        time: schedule.schedule?.time || "09:00",
        timezone: schedule.schedule?.timezone || "UTC",
      },
      enabled: schedule.enabled ?? true,
    };
    
    return result;
  });
}

/**
 * Delete a notification schedule
 */
export async function deleteNotificationSchedule(
  scheduleId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:schedule-delete',
      'user',
      RateLimits.GENERAL_WRITE,
      async () => {
        return deleteNotificationScheduleInternal(context, scheduleId);
      }
    );
  });
}

/**
 * Internal function to delete a notification schedule
 */
export async function deleteNotificationScheduleInternal(
  context: ActionContext,
  scheduleId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  return withErrorHandling(async () => {
    if (!context.userId) {
      return ErrorFactory.authRequired();
    }

    if (!scheduleId) {
      return ErrorFactory.validation("Schedule ID is required");
    }
    
    // Simulate database delete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, delete from database
    // const result = await db.notificationSchedules.delete({
    //   where: { 
    //     id: scheduleId,
    //     userId: context.userId 
    //   }
    // });
    
    return { deleted: true };
  });
}

/**
 * Enable or disable a notification schedule
 */
export async function toggleNotificationSchedule(
  scheduleId: string,
  enabled: boolean
): Promise<ActionResult<NotificationSchedule>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:schedule-toggle',
      'user',
      RateLimits.GENERAL_WRITE,
      async () => {
        return withErrorHandling(async () => {
          if (!context.userId) {
            return ErrorFactory.authRequired();
          }

          if (!scheduleId) {
            return ErrorFactory.validation("Schedule ID is required");
          }
          
          // Simulate database update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // In production, update in database
          // const result = await db.notificationSchedules.update({
          //   where: { 
          //     id: scheduleId,
          //     userId: context.userId 
          //   },
          //   data: { enabled }
          // });
          
          // For mock data, find and update the schedule
          const existingSchedule = mockNotificationSchedules.find(s => s.id === scheduleId);
          if (!existingSchedule) {
            return ErrorFactory.notFound("Notification schedule");
          }
          
          const updatedSchedule: NotificationSchedule = {
            ...existingSchedule,
            userId: context.userId,
            enabled,
          };
          
          return updatedSchedule;
        });
      }
    );
  });
}

/**
 * Get schedule by type for the authenticated user
 */
export async function getNotificationScheduleByType(
  type: NotificationSchedule["type"]
): Promise<ActionResult<NotificationSchedule | null>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:schedule-by-type',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          if (!context.userId) {
            return ErrorFactory.authRequired();
          }

          if (!type) {
            return ErrorFactory.validation("Schedule type is required");
          }
          
          // Simulate database fetch
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // In production, fetch from database
          // const schedule = await db.notificationSchedules.findUnique({
          //   where: { 
          //     userId_type: { userId: context.userId, type }
          //   }
          // });
          
          // For mock data, find the schedule by type
          const schedule = mockNotificationSchedules.find(s => s.type === type);
          
          if (!schedule) {
            return null;
          }
          
          return {
            ...schedule,
            userId: context.userId,
          };
        });
      }
    );
  });
}

/**
 * Get all enabled schedules for the authenticated user
 */
export async function getEnabledNotificationSchedules(): Promise<ActionResult<NotificationSchedule[]>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:enabled-schedules',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          if (!context.userId) {
            return ErrorFactory.authRequired();
          }

          // Simulate database fetch
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // In production, fetch enabled schedules from database
          // const schedules = await db.notificationSchedules.findMany({
          //   where: { 
          //     userId: context.userId,
          //     enabled: true
          //   }
          // });
          
          // For mock data, filter enabled schedules
          const schedules = mockNotificationSchedules
            .filter(s => s.enabled)
            .map(s => ({
              ...s,
              userId: context.userId!,
            }));
          
          return schedules;
        });
      }
    );
  });
}

/**
 * Create a custom reminder schedule
 */
export async function createCustomReminder(
  reminderData: {
    title: string;
    message: string;
    schedule: {
      frequency: "daily" | "weekly" | "monthly";
      dayOfWeek?: number;
      dayOfMonth?: number;
      time: string;
      timezone: string;
    };
  }
): Promise<ActionResult<NotificationSchedule>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:custom-reminder',
      'user',
      RateLimits.GENERAL_WRITE,
      async () => {
        return withErrorHandling(async () => {
          if (!context.userId) {
            return ErrorFactory.authRequired();
          }

          if (!reminderData.title || !reminderData.message) {
            return ErrorFactory.validation("Title and message are required for custom reminders");
          }
          
          const scheduleData: DeepPartial<NotificationSchedule> = {
            type: "customReminder",
            schedule: reminderData.schedule,
            enabled: true,
          };
          
          return upsertNotificationScheduleInternal(context, scheduleData);
        });
      }
    );
  });
}

/**
 * Get next scheduled notification times
 */
export async function getNextScheduledNotifications(): Promise<ActionResult<Array<{
  scheduleId: string;
  type: string;
  nextRun: Date;
  timezone: string;
}>>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:next-scheduled',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          if (!context.userId) {
            return ErrorFactory.authRequired();
          }

          const schedulesResult = await getEnabledNotificationSchedules();
          
          if (!schedulesResult.success || !schedulesResult.data) {
            return schedulesResult as unknown as ActionResult<Array<{
              scheduleId: string;
              type: string;
              nextRun: Date;
              timezone: string;
            }>>;
          }
          
          const schedules = schedulesResult.data;
          const now = new Date();
          
          const nextRuns = schedules.map(schedule => {
            const nextRun = calculateNextRun(schedule, now);
            return {
              scheduleId: schedule.id,
              type: schedule.type,
              nextRun,
              timezone: schedule.schedule.timezone,
            };
          });
          
          // Sort by next run time
          nextRuns.sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime());
          
          return nextRuns;
        });
      }
    );
  });
}

/**
 * Helper function to calculate next run time for a schedule
 */
function calculateNextRun(schedule: NotificationSchedule, from: Date): Date {
  const { frequency, dayOfWeek, dayOfMonth, time } = schedule.schedule;
  
  // Parse time
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create date in the specified timezone
  const nextRun = new Date(from);
  nextRun.setHours(hours, minutes, 0, 0);
  
  switch (frequency) {
    case 'daily':
      // If time has passed today, schedule for tomorrow
      if (nextRun <= from) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
      
    case 'weekly':
      if (dayOfWeek !== undefined) {
        // Calculate next occurrence of the specified day of week
        const currentDay = nextRun.getDay();
        const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
        
        if (daysUntilTarget === 0 && nextRun <= from) {
          // If it's the same day but time has passed, schedule for next week
          nextRun.setDate(nextRun.getDate() + 7);
        } else {
          nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        }
      }
      break;
      
    case 'monthly':
      if (dayOfMonth !== undefined) {
        // Set to the specified day of the current month
        nextRun.setDate(dayOfMonth);
        
        // If the date has passed this month, move to next month
        if (nextRun <= from) {
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(dayOfMonth);
        }
        
        // Handle months with fewer days
        if (nextRun.getDate() !== dayOfMonth) {
          nextRun.setDate(0); // Last day of previous month
        }
      }
      break;
  }
  
  return nextRun;
}
