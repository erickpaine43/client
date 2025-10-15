// Define a type for companyInfo
interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
}

// Define UserSettings locally for validation since it's not exported from user.ts
interface UserSettings {
  id?: string;
  userId: string;
  timezone: string;
  companyInfo: CompanyInfo;
  createdAt?: Date;
  updatedAt?: Date;
}
import type { NotificationPreferences } from "./notifications";
import type { ClientPreferences } from "./appearance";
import type { TeamMember } from "./team";
import type { SettingsValidationResult, FieldValidationError } from "./base";
import { SETTINGS_FIELDS } from "./base";

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

// Validate timezone string
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate enum values
export function isValidTheme(theme: string): theme is ClientPreferences["theme"] {
  return ["light", "dark", "system"].includes(theme);
}

export function isValidSidebarView(view: string): view is ClientPreferences["sidebarView"] {
  return ["expanded", "collapsed"].includes(view);
}

export function isValidDateFormat(format: string): format is ClientPreferences["dateFormat"] {
  return ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].includes(format);
}

export function isValidTeamMemberRole(role: string): role is TeamMember["role"] {
  return ["Admin", "Outreach Manager", "Analyst", "Member"].includes(role);
}

export function isValidTeamMemberStatus(status: string): status is TeamMember["status"] {
  return ["active", "inactive", "pending"].includes(status);
}

// Validate settings data
export function validateUserSettings(settings: Partial<UserSettings>): SettingsValidationResult {
  const errors: FieldValidationError[] = [];

  if (settings.timezone && !isValidTimezone(settings.timezone)) {
    errors.push({
      field: SETTINGS_FIELDS.USER.TIMEZONE,
      message: "Invalid timezone",
      code: "INVALID_TIMEZONE",
    });
  }

  if (settings.companyInfo) {
    if (!settings.companyInfo.name || settings.companyInfo.name.trim().length === 0) {
      errors.push({
        field: SETTINGS_FIELDS.USER.COMPANY_NAME,
        message: "Company name is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!settings.companyInfo.industry || settings.companyInfo.industry.trim().length === 0) {
      errors.push({
        field: SETTINGS_FIELDS.USER.COMPANY_INDUSTRY,
        message: "Industry is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!settings.companyInfo.size || settings.companyInfo.size.trim().length === 0) {
      errors.push({
        field: SETTINGS_FIELDS.USER.COMPANY_SIZE,
        message: "Company size is required",
        code: "REQUIRED_FIELD",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateNotificationPreferences(prefs: Partial<NotificationPreferences>): SettingsValidationResult {
  const errors: FieldValidationError[] = [];

  // Notification preferences are all boolean, so basic type checking is sufficient
  const booleanFields = [
    { key: "newReplies", field: SETTINGS_FIELDS.NOTIFICATIONS.NEW_REPLIES },
    { key: "campaignUpdates", field: SETTINGS_FIELDS.NOTIFICATIONS.CAMPAIGN_UPDATES },
    { key: "weeklyReports", field: SETTINGS_FIELDS.NOTIFICATIONS.WEEKLY_REPORTS },
    { key: "domainAlerts", field: SETTINGS_FIELDS.NOTIFICATIONS.DOMAIN_ALERTS },
    { key: "warmupCompletion", field: SETTINGS_FIELDS.NOTIFICATIONS.WARMUP_COMPLETION },
  ];

  for (const { key, field } of booleanFields) {
    const value = (prefs as Record<string, unknown>)[key];
    if (value !== undefined && typeof value !== "boolean") {
      errors.push({
        field,
        message: `${key} must be a boolean`,
        code: "INVALID_FORMAT",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateClientPreferences(prefs: Partial<ClientPreferences>): SettingsValidationResult {
  const errors: FieldValidationError[] = [];

  if (prefs.theme && !isValidTheme(prefs.theme)) {
    errors.push({
      field: SETTINGS_FIELDS.CLIENT.THEME,
      message: "Invalid theme value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  if (prefs.sidebarView && !isValidSidebarView(prefs.sidebarView)) {
    errors.push({
      field: SETTINGS_FIELDS.CLIENT.SIDEBAR_VIEW,
      message: "Invalid sidebar view value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  if (prefs.dateFormat && !isValidDateFormat(prefs.dateFormat)) {
    errors.push({
      field: SETTINGS_FIELDS.CLIENT.DATE_FORMAT,
      message: "Invalid date format value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  if (prefs.language !== undefined && (!prefs.language || prefs.language.trim().length === 0)) {
    errors.push({
      field: SETTINGS_FIELDS.CLIENT.LANGUAGE,
      message: "Language is required",
      code: "REQUIRED_FIELD",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTeamMember(member: Partial<TeamMember>): SettingsValidationResult {
  const errors: FieldValidationError[] = [];

  if (member.name !== undefined && (!member.name || member.name.trim().length === 0)) {
    errors.push({
      field: "name",
      message: "Name is required",
      code: "REQUIRED_FIELD",
    });
  }

  if (member.email && !isValidEmail(member.email)) {
    errors.push({
      field: "email",
      message: "Invalid email format",
      code: "INVALID_EMAIL",
    });
  }

  if (member.role && !isValidTeamMemberRole(member.role)) {
    errors.push({
      field: "role",
      message: "Invalid role value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  if (member.status && !isValidTeamMemberStatus(member.status)) {
    errors.push({
      field: "status",
      message: "Invalid status value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
