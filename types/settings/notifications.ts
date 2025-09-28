import { z } from "zod";
import type { BaseEntity, ActionResult } from "./base";

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationData {
  email: {
    campaignCompletions: boolean;
    newReplies: boolean;
    weeklyReports: boolean;
    systemAnnouncements: boolean;
  };
  inApp: {
    realTimeCampaignAlerts: boolean;
    emailAccountAlerts: boolean;
  };
}

// Notification Preferences
export interface NotificationPreferences extends BaseEntity {
  userId: string;
  newReplies: boolean;
  campaignUpdates: boolean;
  weeklyReports: boolean;
  domainAlerts: boolean;
  warmupCompletion: boolean;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Notification Schema
export const notificationSchema = z.object({
  newReplies: z.boolean(),
  campaignUpdates: z.boolean(),
  weeklyReports: z.boolean(),
  domainAlerts: z.boolean(),
  warmupCompletion: z.boolean(),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type NotificationPreferencesResponse = ActionResult<NotificationPreferences>;

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface NotificationToggleProps {
  show: boolean;
  onToggle: () => void;
}

// Legacy Notification Settings Props (for backward compatibility)
export interface NotificationSettingsProps {
  email: {
    campaignCompletions: boolean;
    newReplies: boolean;
    weeklyReports: boolean;
    systemAnnouncements: boolean;
  };
  inApp: {
    realTimeCampaignAlerts: boolean;
    emailAccountAlerts: boolean;
  };
}

// Modern Settings Component Props
export interface NotificationSettingsComponentProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  loading?: boolean;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Partial update types for server actions
export type NotificationPreferencesUpdate = Partial<Omit<NotificationPreferences, "id" | "userId" | "createdAt" | "updatedAt">>;

// Create types for new entities
export type CreateNotificationPreferences = Omit<NotificationPreferences, "id" | "createdAt" | "updatedAt">;
