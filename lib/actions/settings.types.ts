// Re-export types from their source files
export type { UserSettings, CompanyInfo, BillingAddress } from "../data/settings.mock";
export type { GeneralSettings, SecuritySettings } from "../../types/settings";

// Helper type for deep partial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Action Result Types
export type ActionResult<T> = 
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
      field?: string; // For field-specific validation errors
    };

// Error codes for better error handling
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: "AUTH_REQUIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  
  // Validation errors
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_INPUT: "INVALID_INPUT",
  REQUIRED_FIELD: "REQUIRED_FIELD",
  
  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",
  SETTINGS_NOT_FOUND: "SETTINGS_NOT_FOUND",
  UPDATE_FAILED: "UPDATE_FAILED",
  
  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  
  // General errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// Simple Notification Preferences Interface (for basic settings form)
export interface SimpleNotificationPreferences {
  id: string;
  userId: string;
  newReplies: boolean;
  campaignUpdates: boolean;
  weeklyReports: boolean;
  domainAlerts: boolean;
  warmupCompletion: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Simple notification preferences mock data
export const mockSimpleNotificationPreferences: SimpleNotificationPreferences = {
  id: "simple-notif-1",
  userId: "user-1",
  newReplies: true,
  campaignUpdates: true,
  weeklyReports: true,
  domainAlerts: true,
  warmupCompletion: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
