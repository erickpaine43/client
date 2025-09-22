"use server";

/**
 * @deprecated This file has been split into a notifications module for better organization.
 * Please use the new module structure:
 * - lib/actions/notifications/index.ts - Main notification functions
 * - lib/actions/notifications/preferences.ts - Preference management
 * - lib/actions/notifications/history.ts - History management
 * - lib/actions/notifications/schedules.ts - Schedule management
 * 
 * This file will be removed in a future version.
 */

// Re-export from the new notifications module for backward compatibility
export * from './notifications';

// Legacy imports for backward compatibility
import {
  requireUserId,
  getCurrentUserId,
  checkRateLimit,
} from "@/lib/utils/auth";
import {
  mockNotificationPreferences,
  mockNotificationHistory,
  mockNotificationSchedules,
  notificationTypes,
  type NotificationPreferences,
  type EmailNotificationPreferences,
  type InAppNotificationPreferences,
  type PushNotificationPreferences,
  type NotificationHistory,
  type NotificationSchedule,
  type NotificationType,
} from "../data/notifications.mock";
import type { 
  NotificationFormValues,
  NotificationSettingsProps 
} from "../../types/settings";

// Helper type for deep partial
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// Action Result Types (consistent with settingsActions)
export type ActionResult<T> = 
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
      field?: string;
    };

// Error codes for notification operations
export const NOTIFICATION_ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: "AUTH_REQUIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  
  // Validation errors
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_CHANNEL: "INVALID_CHANNEL",
  INVALID_PREFERENCE: "INVALID_PREFERENCE",
  INVALID_SCHEDULE: "INVALID_SCHEDULE",
  
  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",
  PREFERENCES_NOT_FOUND: "PREFERENCES_NOT_FOUND",
  UPDATE_FAILED: "UPDATE_FAILED",
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // General errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

// Validation functions
function validateEmailPreferences(
  prefs: DeepPartial<EmailNotificationPreferences>
): string | null {
  // All boolean values, so just check they are actually booleans if provided
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined && typeof value !== "boolean") {
      return `Invalid value for email preference '${key}': must be true or false`;
    }
  }
  return null;
}

function validateInAppPreferences(
  prefs: DeepPartial<InAppNotificationPreferences>
): string | null {
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined && typeof value !== "boolean") {
      return `Invalid value for in-app preference '${key}': must be true or false`;
    }
  }
  return null;
}

function validatePushPreferences(
  prefs: DeepPartial<PushNotificationPreferences>
): string | null {
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined && typeof value !== "boolean") {
      return `Invalid value for push preference '${key}': must be true or false`;
    }
  }
  
  // Additional validation: if push is enabled, at least one platform should be enabled
  if (prefs.enabled === true) {
    if (prefs.desktopNotifications === false && prefs.mobileNotifications === false) {
      return "At least one notification platform must be enabled when push notifications are on";
    }
  }
  
  return null;
}

function validateNotificationPreferences(
  prefs: DeepPartial<NotificationPreferences>
): string | null {
  if (prefs.email) {
    const emailError = validateEmailPreferences(prefs.email);
    if (emailError) return emailError;
  }
  
  if (prefs.inApp) {
    const inAppError = validateInAppPreferences(prefs.inApp);
    if (inAppError) return inAppError;
  }
  
  if (prefs.push) {
    const pushError = validatePushPreferences(prefs.push);
    if (pushError) return pushError;
  }
  
  return null;
}

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

// Main Server Actions

/**
 * Get notification preferences for the authenticated user
 */
export async function getNotificationPreferences(): Promise<
  ActionResult<NotificationPreferences>
> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view notification preferences",
        code: NOTIFICATION_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Check rate limit
    const canProceed = await checkRateLimit(`notifications:get:${userId}`, 30, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: "Too many requests. Please try again later.",
        code: NOTIFICATION_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, fetch from database
    // const preferences = await db.notificationPreferences.findUnique({ 
    //   where: { userId } 
    // });
    
    // For now, return mock data
    const preferences: NotificationPreferences = {
      ...mockNotificationPreferences,
      userId,
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: preferences,
    };
  } catch (error) {
    console.error("getNotificationPreferences error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: NOTIFICATION_ERROR_CODES.NETWORK_ERROR,
      };
    }
    
    return {
      success: false,
      error: "Failed to retrieve notification preferences",
      code: NOTIFICATION_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Update notification preferences for the authenticated user
 */
export async function updateNotificationPreferences(
  preferences: DeepPartial<NotificationPreferences>
): Promise<ActionResult<NotificationPreferences>> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to update notification preferences",
        code: NOTIFICATION_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Check rate limit
    const canProceed = await checkRateLimit(`notifications:update:${userId}`, 10, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: "Too many updates. Please try again later.",
        code: NOTIFICATION_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Validate preferences
    const validationError = validateNotificationPreferences(preferences);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In production, update in database
    // const updatedPreferences = await db.notificationPreferences.update({
    //   where: { userId },
    //   data: { ...preferences, updatedAt: new Date() }
    // });
    
    // For now, merge with mock data
    const updatedPreferences: NotificationPreferences = {
      ...mockNotificationPreferences,
      userId,
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
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: updatedPreferences,
    };
  } catch (error) {
    console.error("updateNotificationPreferences error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: NOTIFICATION_ERROR_CODES.NETWORK_ERROR,
      };
    }
    
    if (errorMessage.includes("database") || errorMessage.includes("constraint")) {
      return {
        success: false,
        error: "Failed to update preferences in database",
        code: NOTIFICATION_ERROR_CODES.DATABASE_ERROR,
      };
    }
    
    return {
      success: false,
      error: "Failed to update notification preferences",
      code: NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Update email notification preferences only
 */
export async function updateEmailNotifications(
  emailPrefs: DeepPartial<EmailNotificationPreferences>
): Promise<ActionResult<EmailNotificationPreferences>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userId = await requireUserId();
    
    const validationError = validateEmailPreferences(emailPrefs);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Update only email preferences
    const result = await updateNotificationPreferences({ email: emailPrefs });
    
    if (!result.success) {
      return result as ActionResult<EmailNotificationPreferences>;
    }
    
    return {
      success: true,
      data: result.data.email,
    };
  } catch (error) {
    console.error("updateEmailNotifications error:", error);
    return {
      success: false,
      error: "Failed to update email notifications",
      code: NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Update in-app notification preferences only
 */
export async function updateInAppNotifications(
  inAppPrefs: DeepPartial<InAppNotificationPreferences>
): Promise<ActionResult<InAppNotificationPreferences>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userId = await requireUserId();
    
    const validationError = validateInAppPreferences(inAppPrefs);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    const result = await updateNotificationPreferences({ inApp: inAppPrefs });
    
    if (!result.success) {
      return result as ActionResult<InAppNotificationPreferences>;
    }
    
    return {
      success: true,
      data: result.data.inApp,
    };
  } catch (error) {
    console.error("updateInAppNotifications error:", error);
    return {
      success: false,
      error: "Failed to update in-app notifications",
      code: NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Update push notification preferences only
 */
export async function updatePushNotifications(
  pushPrefs: DeepPartial<PushNotificationPreferences>
): Promise<ActionResult<PushNotificationPreferences>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userId = await requireUserId();
    
    const validationError = validatePushPreferences(pushPrefs);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    const result = await updateNotificationPreferences({ push: pushPrefs });
    
    if (!result.success) {
      return result as ActionResult<PushNotificationPreferences>;
    }
    
    return {
      success: true,
      data: result.data.push,
    };
  } catch (error) {
    console.error("updatePushNotifications error:", error);
    return {
      success: false,
      error: "Failed to update push notifications",
      code: NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get notification history for the authenticated user
 */
export async function getNotificationHistory(
  limit: number = 50,
  offset: number = 0
): Promise<ActionResult<NotificationHistory[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view notification history",
        code: NOTIFICATION_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return {
        success: false,
        error: "Limit must be between 1 and 100",
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    if (offset < 0) {
      return {
        success: false,
        error: "Offset must be non-negative",
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // In production, fetch from database with pagination
    // const history = await db.notificationHistory.findMany({
    //   where: { userId },
    //   take: limit,
    //   skip: offset,
    //   orderBy: { sentAt: 'desc' }
    // });
    
    // For now, return mock data with pagination
    const history = mockNotificationHistory
      .filter(n => n.userId === userId || n.userId === "user-1")
      .slice(offset, offset + limit);
    
    return {
      success: true,
      data: history,
    };
  } catch (error) {
    console.error("getNotificationHistory error:", error);
    return {
      success: false,
      error: "Failed to retrieve notification history",
      code: NOTIFICATION_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  notificationIds: string[]
): Promise<ActionResult<{ updated: number }>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userId = await requireUserId();
    
    if (!notificationIds || notificationIds.length === 0) {
      return {
        success: false,
        error: "No notification IDs provided",
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    if (notificationIds.length > 100) {
      return {
        success: false,
        error: "Cannot mark more than 100 notifications at once",
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, update in database
    // const result = await db.notificationHistory.updateMany({
    //   where: { 
    //     id: { in: notificationIds },
    //     userId 
    //   },
    //   data: { 
    //     status: 'read',
    //     readAt: new Date() 
    //   }
    // });
    
    return {
      success: true,
      data: { updated: notificationIds.length },
    };
  } catch (error) {
    console.error("markNotificationsAsRead error:", error);
    return {
      success: false,
      error: "Failed to mark notifications as read",
      code: NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get notification schedules
 */
export async function getNotificationSchedules(): Promise<
  ActionResult<NotificationSchedule[]>
> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view notification schedules",
        code: NOTIFICATION_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, fetch from database
    // const schedules = await db.notificationSchedules.findMany({
    //   where: { userId }
    // });
    
    // For now, return mock data
    const schedules = mockNotificationSchedules.map(s => ({
      ...s,
      userId,
    }));
    
    return {
      success: true,
      data: schedules,
    };
  } catch (error) {
    console.error("getNotificationSchedules error:", error);
    return {
      success: false,
      error: "Failed to retrieve notification schedules",
      code: NOTIFICATION_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Create or update a notification schedule
 */
export async function upsertNotificationSchedule(
  schedule: DeepPartial<NotificationSchedule>
): Promise<ActionResult<NotificationSchedule>> {
  try {
    const userId = await requireUserId();
    
    const validationError = validateNotificationSchedule(schedule);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Simulate database upsert
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // In production, upsert in database
    // const result = await db.notificationSchedules.upsert({
    //   where: { 
    //     userId_type: { userId, type: schedule.type } 
    //   },
    //   create: { ...schedule, userId },
    //   update: { ...schedule }
    // });
    
    const result: NotificationSchedule = {
      id: schedule.id || `schedule-${Date.now()}`,
      userId,
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
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("upsertNotificationSchedule error:", error);
    return {
      success: false,
      error: "Failed to save notification schedule",
      code: NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Delete a notification schedule
 */
export async function deleteNotificationSchedule(
  scheduleId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userId = await requireUserId();
    
    if (!scheduleId) {
      return {
        success: false,
        error: "Schedule ID is required",
        code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Simulate database delete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, delete from database
    // const result = await db.notificationSchedules.delete({
    //   where: { 
    //     id: scheduleId,
    //     userId 
    //   }
    // });
    
    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error("deleteNotificationSchedule error:", error);
    return {
      success: false,
      error: "Failed to delete notification schedule",
      code: NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get available notification types
 */
export async function getNotificationTypes(): Promise<
  ActionResult<NotificationType[]>
> {
  try {
    // This doesn't require authentication as it's just metadata
    
    // Could filter based on user's plan/permissions in the future
    const types = notificationTypes;
    
    return {
      success: true,
      data: types,
    };
  } catch (error) {
    console.error("getNotificationTypes error:", error);
    return {
      success: false,
      error: "Failed to retrieve notification types",
      code: NOTIFICATION_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Convert NotificationPreferences to NotificationFormValues for forms
 */
export function preferencesToFormValues(
  prefs: NotificationPreferences
): NotificationFormValues {
  return {
    newReplies: prefs.email.newReplies,
    campaignUpdates: prefs.email.campaignUpdates,
    weeklyReports: prefs.email.weeklyReports,
    domainAlerts: prefs.email.domainAlerts,
    warmupCompletion: prefs.email.warmupCompletion,
  };
}

/**
 * Convert NotificationFormValues to partial NotificationPreferences
 */
export function formValuesToPreferences(
  values: NotificationFormValues
): DeepPartial<NotificationPreferences> {
  return {
    email: {
      newReplies: values.newReplies,
      campaignUpdates: values.campaignUpdates,
      weeklyReports: values.weeklyReports,
      domainAlerts: values.domainAlerts,
      warmupCompletion: values.warmupCompletion,
    },
  };
}

/**
 * Convert NotificationPreferences to NotificationSettingsProps for components
 */
export function preferencesToSettingsProps(
  prefs: NotificationPreferences
): NotificationSettingsProps {
  return {
    email: {
      campaignCompletions: prefs.email.campaignCompletions,
      newReplies: prefs.email.newReplies,
      weeklyReports: prefs.email.weeklyReports,
      systemAnnouncements: prefs.email.systemAnnouncements,
    },
    inApp: {
      realTimeCampaignAlerts: prefs.inApp.realTimeCampaignAlerts,
      emailAccountAlerts: prefs.inApp.emailAccountAlerts,
    },
  };
}

/**
 * Bulk update notification preferences
 */
export async function bulkUpdateNotificationPreferences(
  updates: {
    email?: DeepPartial<EmailNotificationPreferences>;
    inApp?: DeepPartial<InAppNotificationPreferences>;
    push?: DeepPartial<PushNotificationPreferences>;
  }
): Promise<ActionResult<NotificationPreferences>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userId = await requireUserId();
    
    // Validate all preference types
    if (updates.email) {
      const emailError = validateEmailPreferences(updates.email);
      if (emailError) {
        return {
          success: false,
          error: emailError,
          code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
        };
      }
    }
    
    if (updates.inApp) {
      const inAppError = validateInAppPreferences(updates.inApp);
      if (inAppError) {
        return {
          success: false,
          error: inAppError,
          code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
        };
      }
    }
    
    if (updates.push) {
      const pushError = validatePushPreferences(updates.push);
      if (pushError) {
        return {
          success: false,
          error: pushError,
          code: NOTIFICATION_ERROR_CODES.VALIDATION_FAILED,
        };
      }
    }
    
    return updateNotificationPreferences(updates);
  } catch (error) {
    console.error("bulkUpdateNotificationPreferences error:", error);
    return {
      success: false,
      error: "Failed to update notification preferences",
      code: NOTIFICATION_ERROR_CODES.UPDATE_FAILED,
    };
  }
}
