/**
 * Notification preferences actions
 * 
 * This module handles notification preferences including email notifications,
 * in-app notifications, and various notification categories.
 */

"use server";

import { ActionResult } from "../core/types";
import { ErrorFactory, withErrorHandling } from "../core/errors";
import { withAuth } from "../core/auth";
import { 
  SimpleNotificationPreferences,
  mockSimpleNotificationPreferences,
  ERROR_CODES
} from './types';

/**
 * Get simple notification preferences for the authenticated user
 */
export async function getSimpleNotificationPreferences(): Promise<ActionResult<SimpleNotificationPreferences>> {
  return withAuth(async (context) => {
    return withErrorHandling(async () => {
      // Simulate database fetch
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return mock data with current user ID
      const preferences: SimpleNotificationPreferences = {
        ...mockSimpleNotificationPreferences,
        userId: context.userId!,
        updatedAt: new Date(),
      };
      
      return {
        success: true,
        data: preferences,
      };
    });
  });
}

/**
 * Update simple notification preferences for the authenticated user
 */
export async function updateSimpleNotificationPreferences(
  preferences: Partial<Pick<SimpleNotificationPreferences, 'newReplies' | 'campaignUpdates' | 'weeklyReports' | 'domainAlerts' | 'warmupCompletion'>>
): Promise<ActionResult<SimpleNotificationPreferences>> {
  return withAuth(async (context) => {
    return withErrorHandling(async () => {
      // Validate that all provided values are boolean
      for (const [key, value] of Object.entries(preferences)) {
        if (value !== undefined && typeof value !== "boolean") {
          return ErrorFactory.validation(
            `Invalid value for notification preference '${key}': must be true or false`,
            key,
            ERROR_CODES.VALIDATION_FAILED
          );
        }
      }
      
      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Merge with existing preferences
      const updatedPreferences: SimpleNotificationPreferences = {
        ...mockSimpleNotificationPreferences,
        ...(preferences as Partial<SimpleNotificationPreferences>),
        userId: context.userId!,
        updatedAt: new Date(),
      };
      
      return {
        success: true,
        data: updatedPreferences,
      };
    });
  });
}

/**
 * Get detailed notification preferences with categories and channels
 */
export async function getDetailedNotificationPreferences(): Promise<ActionResult<{
  categories: Array<{
    id: string;
    name: string;
    description: string;
    channels: {
      email: boolean;
      inApp: boolean;
      push: boolean;
    };
  }>;
  globalSettings: {
    emailEnabled: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string;   // HH:MM format
      timezone: string;
    };
  };
}>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Simulate database fetch
      await new Promise(resolve => setTimeout(resolve, 150));

      // Mock detailed notification preferences
      const detailedPreferences = {
        categories: [
          {
            id: "new-replies",
            name: "New Replies",
            description: "When someone replies to your campaigns",
            channels: {
              email: true,
              inApp: true,
              push: true,
            },
          },
          {
            id: "campaign-updates",
            name: "Campaign Updates",
            description: "Status updates for your campaigns",
            channels: {
              email: true,
              inApp: true,
              push: false,
            },
          },
          {
            id: "weekly-reports",
            name: "Weekly Reports",
            description: "Weekly performance summaries",
            channels: {
              email: true,
              inApp: false,
              push: false,
            },
          },
          {
            id: "domain-alerts",
            name: "Domain Alerts",
            description: "Important domain and deliverability alerts",
            channels: {
              email: true,
              inApp: true,
              push: true,
            },
          },
          {
            id: "warmup-completion",
            name: "Warmup Completion",
            description: "When domain warmup processes complete",
            channels: {
              email: true,
              inApp: true,
              push: false,
            },
          },
          {
            id: "team-activity",
            name: "Team Activity",
            description: "Team member invitations and updates",
            channels: {
              email: true,
              inApp: true,
              push: false,
            },
          },
          {
            id: "billing-updates",
            name: "Billing Updates",
            description: "Payment confirmations and billing alerts",
            channels: {
              email: true,
              inApp: true,
              push: false,
            },
          },
        ],
        globalSettings: {
          emailEnabled: true,
          inAppEnabled: true,
          pushEnabled: false,
          quietHours: {
            enabled: true,
            start: "22:00",
            end: "08:00",
            timezone: "America/New_York",
          },
        },
      };

      return {
        success: true,
        data: detailedPreferences,
      };
    });
  });
}

/**
 * Update detailed notification preferences
 */
export async function updateDetailedNotificationPreferences(
  preferences: {
    categories?: Array<{
      id: string;
      channels: {
        email?: boolean;
        inApp?: boolean;
        push?: boolean;
      };
    }>;
    globalSettings?: {
      emailEnabled?: boolean;
      inAppEnabled?: boolean;
      pushEnabled?: boolean;
      quietHours?: {
        enabled?: boolean;
        start?: string;
        end?: string;
        timezone?: string;
      };
    };
  }
): Promise<ActionResult<{ success: boolean }>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Validate quiet hours format if provided
      if (preferences.globalSettings?.quietHours) {
        const { start, end, timezone } = preferences.globalSettings.quietHours;
        
        if (start && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(start)) {
          return ErrorFactory.validation(
            "Invalid start time format. Use HH:MM format",
            "quietHours.start",
            ERROR_CODES.VALIDATION_FAILED
          );
        }
        
        if (end && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(end)) {
          return ErrorFactory.validation(
            "Invalid end time format. Use HH:MM format",
            "quietHours.end",
            ERROR_CODES.VALIDATION_FAILED
          );
        }
        
        if (timezone) {
          try {
            Intl.DateTimeFormat(undefined, { timeZone: timezone });
          } catch {
            return ErrorFactory.validation(
              "Invalid timezone",
              "quietHours.timezone",
              ERROR_CODES.VALIDATION_FAILED
            );
          }
        }
      }

      // Validate category IDs if provided
      if (preferences.categories) {
        const validCategoryIds = [
          "new-replies", "campaign-updates", "weekly-reports", 
          "domain-alerts", "warmup-completion", "team-activity", "billing-updates"
        ];
        
        for (const category of preferences.categories) {
          if (!validCategoryIds.includes(category.id)) {
            return ErrorFactory.validation(
              `Invalid category ID: ${category.id}`,
              "categories",
              ERROR_CODES.VALIDATION_FAILED
            );
          }
        }
      }

      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 250));

      // In production, update the detailed notification preferences in the database

      return {
        success: true,
        data: { success: true },
      };
    });
  });
}

/**
 * Test notification delivery
 */
export async function testNotification(
  type: 'email' | 'inApp' | 'push',
  category: string
): Promise<ActionResult<{ sent: boolean; message: string }>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      if (!['email', 'inApp', 'push'].includes(type)) {
        return ErrorFactory.validation(
          "Invalid notification type",
          "type",
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      const validCategories = [
        "new-replies", "campaign-updates", "weekly-reports", 
        "domain-alerts", "warmup-completion", "team-activity", "billing-updates"
      ];

      if (!validCategories.includes(category)) {
        return ErrorFactory.validation(
          "Invalid notification category",
          "category",
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, send actual test notification based on type and category

      const messages = {
        email: "Test email notification sent successfully",
        inApp: "Test in-app notification displayed",
        push: "Test push notification sent to your devices",
      };

      return {
        success: true,
        data: {
          sent: true,
          message: messages[type],
        },
      };
    });
  });
}

/**
 * Get notification history
 */
export async function getNotificationHistory(
  limit = 50,
  offset = 0
): Promise<ActionResult<{
  notifications: Array<{
    id: string;
    type: 'email' | 'inApp' | 'push';
    category: string;
    title: string;
    message: string;
    sentAt: Date;
    readAt?: Date;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  }>;
  total: number;
  hasMore: boolean;
}>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Validate pagination parameters
      if (limit < 1 || limit > 100) {
        return ErrorFactory.validation(
          "Limit must be between 1 and 100",
          "limit",
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      if (offset < 0) {
        return ErrorFactory.validation(
          "Offset must be non-negative",
          "offset",
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // Simulate database fetch
      await new Promise(resolve => setTimeout(resolve, 150));

      // Mock notification history
      const mockNotifications = Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
        id: `notif-${offset + i + 1}`,
        type: ['email', 'inApp', 'push'][i % 3] as 'email' | 'inApp' | 'push',
        category: ['new-replies', 'campaign-updates', 'domain-alerts'][i % 3],
        title: `Test Notification ${offset + i + 1}`,
        message: `This is a test notification message ${offset + i + 1}`,
        sentAt: new Date(Date.now() - (i * 60 * 60 * 1000)), // i hours ago
        readAt: i % 2 === 0 ? new Date(Date.now() - (i * 60 * 60 * 1000) + 30 * 60 * 1000) : undefined,
        status: ['sent', 'delivered', 'read', 'failed'][i % 4] as 'sent' | 'delivered' | 'read' | 'failed',
      }));

      const total = 150; // Mock total count
      const hasMore = offset + limit < total;

      return {
        success: true,
        data: {
          notifications: mockNotifications,
          total,
          hasMore,
        },
      };
    });
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult<{ success: boolean }>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      if (!notificationId) {
        return ErrorFactory.validation(
          "Notification ID is required",
          "notificationId",
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 100));

      // In production, mark the notification as read in the database

      return {
        success: true,
        data: { success: true },
      };
    });
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult<{ 
  success: boolean; 
  markedCount: number; 
}>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 200));

      // In production, mark all unread notifications as read for the user
      const markedCount = 15; // Mock count

      return {
        success: true,
        data: { 
          success: true,
          markedCount,
        },
      };
    });
  });
}
