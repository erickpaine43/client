/**
 * Notifications module - Main entry point
 * 
 * This module provides the main notification management functions,
 * serving as the primary interface for notification operations.
 */

"use server";

import { ActionResult } from '../core/types';
import { withErrorHandling } from '../core/errors';
import { withAuth, withContextualRateLimit, RateLimits } from '../core/auth';
import {
  NotificationPreferences,
  EmailNotificationPreferences,
  InAppNotificationPreferences,
  PushNotificationPreferences,
  NotificationType,
} from '../../../lib/data/notifications.mock';
import {
  NotificationFormValues,
  NotificationSettingsProps,
} from '../../../types/settings';

// Re-export types for convenience
export type {
  NotificationPreferences,
  EmailNotificationPreferences,
  InAppNotificationPreferences,
  PushNotificationPreferences,
  NotificationType,
  NotificationFormValues,
  NotificationSettingsProps,
};

// Re-export specialized functions
export * from './preferences';
export * from './history';
export * from './schedules';

// Helper type for deep partial updates
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Get notification preferences for the authenticated user
 */
export async function getNotificationPreferences(): Promise<ActionResult<NotificationPreferences>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:get',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        const { getNotificationPreferencesInternal } = await import('./preferences');
        return getNotificationPreferencesInternal(context);
      }
    );
  });
}

/**
 * Update notification preferences for the authenticated user
 */
export async function updateNotificationPreferences(
  preferences: DeepPartial<NotificationPreferences>
): Promise<ActionResult<NotificationPreferences>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:update',
      'user',
      RateLimits.NOTIFICATION_PREFERENCES_UPDATE,
      async () => {
        const { updateNotificationPreferencesInternal } = await import('./preferences');
        return updateNotificationPreferencesInternal(context, preferences);
      }
    );
  });
}

/**
 * Get available notification types
 */
export async function getNotificationTypes(): Promise<ActionResult<NotificationType[]>> {
  return withErrorHandling(async () => {
    const { notificationTypes } = await import('../../../lib/data/notifications.mock');
    return notificationTypes;
  });
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
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:bulk-update',
      'user',
      RateLimits.NOTIFICATION_PREFERENCES_UPDATE,
      async () => {
        const { bulkUpdateNotificationPreferencesInternal } = await import('./preferences');
        return bulkUpdateNotificationPreferencesInternal(context, updates);
      }
    );
  });
}
