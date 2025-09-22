/**
 * Notification preferences management
 * 
 * This module handles all notification preference operations including
 * email, in-app, and push notification settings.
 */

"use server";

import { ActionResult, ActionContext } from '../core/types';
import { withErrorHandling, ErrorFactory } from '../core/errors';
import { withAuth, withContextualRateLimit, RateLimits } from '../core/auth';
import {
  mockNotificationPreferences,
  NotificationPreferences,
  EmailNotificationPreferences,
  InAppNotificationPreferences,
  PushNotificationPreferences,
} from '../../../lib/data/notifications.mock';

// Helper type for deep partial updates
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Validation functions for notification preferences
 */
function validateEmailPreferences(
  prefs: DeepPartial<EmailNotificationPreferences>
): string | null {
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

/**
 * Internal function to get notification preferences (used by main module)
 */
export async function getNotificationPreferencesInternal(
  context: ActionContext
): Promise<ActionResult<NotificationPreferences>> {
  return withErrorHandling(async () => {
    if (!context.userId) {
      return ErrorFactory.authRequired();
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, fetch from database
    // const preferences = await db.notificationPreferences.findUnique({ 
    //   where: { userId: context.userId } 
    // });
    
    // For now, return mock data
    const preferences: NotificationPreferences = {
      ...mockNotificationPreferences,
      userId: context.userId,
      updatedAt: new Date(),
    };
    
    return preferences;
  });
}

/**
 * Internal function to update notification preferences (used by main module)
 */
export async function updateNotificationPreferencesInternal(
  context: ActionContext,
  preferences: DeepPartial<NotificationPreferences>
): Promise<ActionResult<NotificationPreferences>> {
  return withErrorHandling(async () => {
    if (!context.userId) {
      return ErrorFactory.authRequired();
    }

    // Validate preferences
    const validationError = validateNotificationPreferences(preferences);
    if (validationError) {
      return ErrorFactory.validation(validationError);
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In production, update in database
    // const updatedPreferences = await db.notificationPreferences.update({
    //   where: { userId: context.userId },
    //   data: { ...preferences, updatedAt: new Date() }
    // });
    
    // For now, merge with mock data
    const updatedPreferences: NotificationPreferences = {
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
      updatedAt: new Date(),
    };
    
    return updatedPreferences;
  });
}

/**
 * Update email notification preferences only
 */
export async function updateEmailNotifications(
  emailPrefs: DeepPartial<EmailNotificationPreferences>
): Promise<ActionResult<EmailNotificationPreferences>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:email-update',
      'user',
      RateLimits.NOTIFICATION_PREFERENCES_UPDATE,
      async () => {
        return withErrorHandling(async () => {
          const validationError = validateEmailPreferences(emailPrefs);
          if (validationError) {
            return ErrorFactory.validation(validationError);
          }
          
          // Update only email preferences
          const result = await updateNotificationPreferencesInternal(context, { email: emailPrefs });
          
          if (!result.success || !result.data) {
            return result as unknown as ActionResult<EmailNotificationPreferences>;
          }
          
          return result.data.email;
        });
      }
    );
  });
}

/**
 * Update in-app notification preferences only
 */
export async function updateInAppNotifications(
  inAppPrefs: DeepPartial<InAppNotificationPreferences>
): Promise<ActionResult<InAppNotificationPreferences>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:inapp-update',
      'user',
      RateLimits.NOTIFICATION_PREFERENCES_UPDATE,
      async () => {
        return withErrorHandling(async () => {
          const validationError = validateInAppPreferences(inAppPrefs);
          if (validationError) {
            return ErrorFactory.validation(validationError);
          }
          
          const result = await updateNotificationPreferencesInternal(context, { inApp: inAppPrefs });
          
          if (!result.success || !result.data) {
            return result as unknown as ActionResult<InAppNotificationPreferences>;
          }
          
          return result.data.inApp;
        });
      }
    );
  });
}

/**
 * Update push notification preferences only
 */
export async function updatePushNotifications(
  pushPrefs: DeepPartial<PushNotificationPreferences>
): Promise<ActionResult<PushNotificationPreferences>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:push-update',
      'user',
      RateLimits.NOTIFICATION_PREFERENCES_UPDATE,
      async () => {
        return withErrorHandling(async () => {
          const validationError = validatePushPreferences(pushPrefs);
          if (validationError) {
            return ErrorFactory.validation(validationError);
          }
          
          const result = await updateNotificationPreferencesInternal(context, { push: pushPrefs });
          
          if (!result.success || !result.data) {
            return result as unknown as ActionResult<PushNotificationPreferences>;
          }
          
          return result.data.push;
        });
      }
    );
  });
}

/**
 * Internal function for bulk updates (used by main module)
 */
export async function bulkUpdateNotificationPreferencesInternal(
  context: ActionContext,
  updates: {
    email?: DeepPartial<EmailNotificationPreferences>;
    inApp?: DeepPartial<InAppNotificationPreferences>;
    push?: DeepPartial<PushNotificationPreferences>;
  }
): Promise<ActionResult<NotificationPreferences>> {
  return withErrorHandling(async () => {
    // Validate all preference types
    if (updates.email) {
      const emailError = validateEmailPreferences(updates.email);
      if (emailError) {
        return ErrorFactory.validation(emailError);
      }
    }
    
    if (updates.inApp) {
      const inAppError = validateInAppPreferences(updates.inApp);
      if (inAppError) {
        return ErrorFactory.validation(inAppError);
      }
    }
    
    if (updates.push) {
      const pushError = validatePushPreferences(updates.push);
      if (pushError) {
        return ErrorFactory.validation(pushError);
      }
    }
    
    return updateNotificationPreferencesInternal(context, updates);
  });
}

/**
 * Reset notification preferences to defaults
 */
export async function resetNotificationPreferences(): Promise<ActionResult<NotificationPreferences>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:reset',
      'user',
      RateLimits.NOTIFICATION_PREFERENCES_UPDATE,
      async () => {
        const { defaultNotificationPreferences } = await import('../../../lib/data/notifications.mock');
        
        const defaultPrefs = {
          ...defaultNotificationPreferences,
          id: '', // Will be set by database
          userId: context.userId!,
        };
        
        return updateNotificationPreferencesInternal(context, defaultPrefs);
      }
    );
  });
}

/**
 * Get notification preferences summary for dashboard
 */
export async function getNotificationPreferencesSummary(): Promise<ActionResult<{
  emailEnabled: number;
  inAppEnabled: number;
  pushEnabled: boolean;
  totalPreferences: number;
}>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'notifications:summary',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          const prefsResult = await getNotificationPreferencesInternal(context);
          
          if (!prefsResult.success || !prefsResult.data) {
            return prefsResult as unknown as ActionResult<{
              emailEnabled: number;
              inAppEnabled: number;
              pushEnabled: boolean;
              totalPreferences: number;
            }>;
          }
          
          const prefs = prefsResult.data;
          
          const emailEnabled = Object.values(prefs.email).filter(Boolean).length;
          const inAppEnabled = Object.values(prefs.inApp).filter(Boolean).length;
          const pushEnabled = prefs.push.enabled;
          const totalPreferences = Object.keys(prefs.email).length + 
                                 Object.keys(prefs.inApp).length + 
                                 Object.keys(prefs.push).length;
          
          return {
            emailEnabled,
            inAppEnabled,
            pushEnabled,
            totalPreferences,
          };
        });
      }
    );
  });
}
