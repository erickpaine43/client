import type { ActionResult } from "./base";
import type { UserSettings } from "./user";
import type { NotificationPreferences } from "./notifications";
import type { BillingInfo } from "./billing";
import type { TeamMember } from "./team";
import type { ClientPreferences } from "./appearance";
import type { CompanyInfo, BillingAddress } from "./base";

// ============================================================================
// TYPE GUARDS
// ============================================================================

// Type guard for ActionResult success
export function isActionSuccess<T>(result: ActionResult<T>): result is { success: true; data: T } {
  return result.success === true;
}

// Type guard for ActionResult error
export function isActionError<T>(result: ActionResult<T>): result is { success: false; error: string; code?: string } {
  return result.success === false;
}

// Type guard for UserSettings
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isUserSettings(obj: any): obj is UserSettings {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.timezone === "string" &&
    obj.companyInfo &&
    typeof obj.companyInfo === "object" &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

// Type guard for NotificationPreferences
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isNotificationPreferences(obj: any): obj is NotificationPreferences {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.newReplies === "boolean" &&
    typeof obj.campaignUpdates === "boolean" &&
    typeof obj.weeklyReports === "boolean" &&
    typeof obj.domainAlerts === "boolean" &&
    typeof obj.warmupCompletion === "boolean"
  );
}

// Type guard for BillingInfo
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isBillingInfo(obj: any): obj is BillingInfo {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    obj.currentPlan &&
    obj.paymentMethod &&
    obj.billingAddress &&
    obj.usage &&
    typeof obj.renewalDate === "string"
  );
}

// Type guard for TeamMember
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isTeamMember(obj: any): obj is TeamMember {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string" &&
    typeof obj.role === "string" &&
    ["active", "inactive", "pending"].includes(obj.status) &&
    obj.lastActive instanceof Date &&
    Array.isArray(obj.permissions)
  );
}

// Type guard for ClientPreferences
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isClientPreferences(obj: any): obj is ClientPreferences {
  return (
    obj &&
    typeof obj === "object" &&
    ["light", "dark", "system"].includes(obj.theme) &&
    ["expanded", "collapsed"].includes(obj.sidebarView) &&
    typeof obj.language === "string" &&
    ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].includes(obj.dateFormat)
  );
}

// Type guard for CompanyInfo
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isCompanyInfo(obj: any): obj is CompanyInfo {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.name === "string" &&
    typeof obj.industry === "string" &&
    typeof obj.size === "string" &&
    obj.address &&
    typeof obj.address === "object"
  );
}

// Type guard for BillingAddress
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isBillingAddress(obj: any): obj is BillingAddress {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.street === "string" &&
    typeof obj.city === "string" &&
    typeof obj.state === "string" &&
    typeof obj.zipCode === "string" &&
    typeof obj.country === "string"
  );
}
