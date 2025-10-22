// ============================================================================
// CORE BASE TYPES
// ============================================================================

// Import BaseEntity from common types but extend for settings-specific needs
import type { BaseEntity as CommonBaseEntity } from "../common";

// Settings-specific base entity (extends common but uses Date objects instead of strings)
export interface BaseEntity extends Omit<CommonBaseEntity, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

// Import and re-export ActionResult from common types
import type { ActionResult as CommonActionResult } from "../common";
export type ActionResult<T> = CommonActionResult<T>;

// Company Information
export interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  address: BillingAddress;
  vatId?: string;
}

// Billing Address
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Settings field keys for validation
export const SETTINGS_FIELDS = {
  USER: {
    TIMEZONE: "timezone",
    COMPANY_NAME: "companyInfo.name",
    COMPANY_INDUSTRY: "companyInfo.industry",
    COMPANY_SIZE: "companyInfo.size",
    COMPANY_VAT_ID: "companyInfo.vatId",
  },
  NOTIFICATIONS: {
    NEW_REPLIES: "newReplies",
    CAMPAIGN_UPDATES: "campaignUpdates",
    WEEKLY_REPORTS: "weeklyReports",
    DOMAIN_ALERTS: "domainAlerts",
    WARMUP_COMPLETION: "warmupCompletion",
  },
  CLIENT: {
    THEME: "theme",
    SIDEBAR_VIEW: "sidebarView",
    LANGUAGE: "language",
    DATE_FORMAT: "dateFormat",
  },
} as const;

// Settings validation error codes
export const SETTINGS_ERROR_CODES = {
  REQUIRED_FIELD: "REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_ENUM_VALUE: "INVALID_ENUM_VALUE",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_URL: "INVALID_URL",
  INVALID_DATE: "INVALID_DATE",
  INVALID_TIMEZONE: "INVALID_TIMEZONE",
  DUPLICATE_VALUE: "DUPLICATE_VALUE",
  PERMISSION_DENIED: "PERMISSION_DENIED",
} as const;

// Settings validation result with field-specific errors
export interface FieldValidationError {
  field: string;
  message: string;
  code: keyof typeof SETTINGS_ERROR_CODES;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
  warnings?: FieldValidationError[];
}

// Deep partial type for nested updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
