"use server";

import { nile } from "@/app/api/[...nile]/nile";
import { mockUserSettings, mockGeneralSettings, mockSecuritySettings } from "../data/settings.mock";
import { getCurrentUserId } from "@/lib/utils/auth";
import type {
  UserSettings,
  CompanyInfo,
  BillingAddress,
  GeneralSettings,
  SecuritySettings,
  ActionResult,
  SimpleNotificationPreferences,
  ComplianceSettings,
  SecurityRecommendation
} from "./settings.types";
import { 
  ERROR_CODES,
  mockSimpleNotificationPreferences 
} from "./settings.types";

// Validation functions
function validateUserSettings(settings: DeepPartial<UserSettings>): string | null {
  if (settings.timezone && !isValidTimezone(settings.timezone)) {
    return "Invalid timezone format";
  }
  
  if (settings.companyInfo) {
    const companyValidation = validateCompanyInfo(settings.companyInfo);
    if (companyValidation) return companyValidation;
  }
  
  return null;
}

function validateCompanyInfo(company: DeepPartial<CompanyInfo>): string | null {
  if (company.name && company.name.length > 255) {
    return "Company name must be 255 characters or less";
  }
  
  if (company.vatId && !isValidVatId(company.vatId)) {
    return "Invalid VAT ID format";
  }
  
  if (company.website && !isValidUrl(company.website)) {
    return "Invalid website URL";
  }
  
  if (company.address) {
    const addressValidation = validateAddress(company.address);
    if (addressValidation) return addressValidation;
  }
  
  return null;
}

function validateAddress(address: DeepPartial<BillingAddress>): string | null {
  if (address.zipCode && !isValidZipCode(address.zipCode)) {
    return "Invalid zip code format";
  }
  
  if (address.state && address.state.length > 50) {
    return "State name must be 50 characters or less";
  }
  
  if (address.city && address.city.length > 100) {
    return "City name must be 100 characters or less";
  }
  
  return null;
}

// Helper validation functions
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function isValidVatId(vatId: string): boolean {
  // Basic VAT ID validation - can be enhanced based on requirements
  return /^[A-Z]{2}[0-9A-Z]+$/.test(vatId);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidZipCode(zipCode: string): boolean {
  // US zip code validation - can be enhanced for international
  return /^[0-9]{5}(-[0-9]{4})?$/.test(zipCode) || /^[A-Z0-9\s-]+$/i.test(zipCode);
}

// Helper type for deep partial
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;


// Main Server Actions

/**
 * Get user settings for the authenticated user
 */
export async function getUserSettings(): Promise<ActionResult<UserSettings>> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // In production, fetch from database
    // For now, return mock data based on userId
    // const settings = await db.userSettings.findUnique({ where: { userId } });
    
    // Simulate database fetch with mock data
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    
    // For demonstration, return mock data
    // In production, this would come from the database
    const settings: UserSettings = {
      ...mockUserSettings,
      userId,
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("getUserSettings error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }
    
    return {
      success: false,
      error: "Failed to retrieve user settings",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Update user settings for the authenticated user
 */
export async function updateUserSettings(
  settings: DeepPartial<UserSettings>
): Promise<ActionResult<UserSettings>> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to update settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Validate input
    const validationError = validateUserSettings(settings);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // In production, update in database
    // const updatedSettings = await db.userSettings.update({
    //   where: { userId },
    //   data: { ...settings, updatedAt: new Date() }
    // });
    
    // Simulate database update with mock data
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
    
    // For demonstration, merge with mock data
    // Deep merge to handle partial nested objects
    const updatedSettings: UserSettings = {
      ...mockUserSettings,
      ...(settings as Partial<UserSettings>),
      companyInfo: {
        ...mockUserSettings.companyInfo,
        ...(settings.companyInfo || {}),
        address: {
          ...mockUserSettings.companyInfo.address,
          ...(settings.companyInfo?.address || {}),
        },
      },
      userId,
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: updatedSettings,
    };
  } catch (error) {
    console.error("updateUserSettings error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }
    
    if (errorMessage.includes("database") || errorMessage.includes("constraint")) {
      return {
        success: false,
        error: "Failed to update settings in database",
        code: ERROR_CODES.DATABASE_ERROR,
      };
    }
    
    return {
      success: false,
      error: "Failed to update user settings",
      code: ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get general settings (profile, preferences, appearance)
 */
export async function getGeneralSettings(): Promise<ActionResult<GeneralSettings>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get user profile from NileDB
    const user = await nile.users.getSelf();
    
    let generalSettings: GeneralSettings;
    
    if (user && !(user instanceof Response) && typeof user === "object") {
      // Merge real user data with mock settings
      generalSettings = {
        ...mockGeneralSettings,
        profile: {
          name: (user as { name?: string }).name || mockGeneralSettings.profile.name,
          email: (user as { email?: string }).email || mockGeneralSettings.profile.email,
          company: mockGeneralSettings.profile.company,
        },
      };
    } else {
      generalSettings = mockGeneralSettings;
    }
    
    return {
      success: true,
      data: generalSettings,
    };
  } catch (error) {
    console.error("getGeneralSettings error:", error);
    return {
      success: false,
      error: "Failed to retrieve general settings",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Update general settings
 */
export async function updateGeneralSettings(
  settings: DeepPartial<GeneralSettings>
): Promise<ActionResult<GeneralSettings>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to update settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Validate preferences if provided
    if (settings.preferences?.timezone) {
      if (!isValidTimezone(settings.preferences.timezone)) {
        return {
          success: false,
          error: "Invalid timezone",
          code: ERROR_CODES.VALIDATION_FAILED,
          field: "timezone",
        };
      }
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Merge with existing settings
    const updatedSettings: GeneralSettings = {
      ...mockGeneralSettings,
      profile: {
        ...mockGeneralSettings.profile,
        ...(settings.profile || {}),
      },
      preferences: {
        ...mockGeneralSettings.preferences,
        ...(settings.preferences || {}),
      },
      appearance: {
        ...mockGeneralSettings.appearance,
        ...(settings.appearance || {}),
      },
    };
    
    return {
      success: true,
      data: updatedSettings,
    };
  } catch (error) {
    console.error("updateGeneralSettings error:", error);
    return {
      success: false,
      error: "Failed to update general settings",
      code: ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get security settings
 */
export async function getSecuritySettings(): Promise<ActionResult<SecuritySettings>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view security settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      data: mockSecuritySettings,
    };
  } catch (error) {
    console.error("getSecuritySettings error:", error);
    return {
      success: false,
      error: "Failed to retrieve security settings",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Update security settings
 */
export async function updateSecuritySettings(
  settings: DeepPartial<SecuritySettings>
): Promise<ActionResult<SecuritySettings>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to update security settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Validate session timeout if provided
    if (settings.sessionTimeout !== undefined) {
      if (settings.sessionTimeout < 5 || settings.sessionTimeout > 1440) {
        return {
          success: false,
          error: "Session timeout must be between 5 and 1440 minutes",
          code: ERROR_CODES.VALIDATION_FAILED,
          field: "sessionTimeout",
        };
      }
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const updatedSettings: SecuritySettings = {
      ...mockSecuritySettings,
      ...(settings as Partial<SecuritySettings>),
      twoFactor: {
        ...mockSecuritySettings.twoFactor,
        ...(settings.twoFactor || {}),
      } as SecuritySettings['twoFactor'],
    };
    
    return {
      success: true,
      data: updatedSettings,
    };
  } catch (error) {
    console.error("updateSecuritySettings error:", error);
    return {
      success: false,
      error: "Failed to update security settings",
      code: ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Update user timezone
 */
export async function updateUserTimezone(
  timezone: string
): Promise<ActionResult<{ timezone: string }>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to update timezone",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    if (!isValidTimezone(timezone)) {
      return {
        success: false,
        error: "Invalid timezone format",
        code: ERROR_CODES.VALIDATION_FAILED,
        field: "timezone",
      };
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      success: true,
      data: { timezone },
    };
  } catch (error) {
    console.error("updateUserTimezone error:", error);
    return {
      success: false,
      error: "Failed to update timezone",
      code: ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Update company information
 */
export async function updateCompanyInfo(
  companyInfo: DeepPartial<CompanyInfo>
): Promise<ActionResult<CompanyInfo>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to update company information",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    const validationError = validateCompanyInfo(companyInfo);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const updatedCompanyInfo: CompanyInfo = {
      ...mockUserSettings.companyInfo,
      ...(companyInfo as Partial<CompanyInfo>),
      address: {
        ...mockUserSettings.companyInfo.address,
        ...(companyInfo.address || {}),
      },
    };
    
    return {
      success: true,
      data: updatedCompanyInfo,
    };
  } catch (error) {
    console.error("updateCompanyInfo error:", error);
    return {
      success: false,
      error: "Failed to update company information",
      code: ERROR_CODES.UPDATE_FAILED,
    };
  }
}

// Batch operations for efficiency

/**
 * Get all settings at once (for initial page load)
 */
export async function getAllSettings(): Promise<ActionResult<{
  userSettings: UserSettings;
  generalSettings: GeneralSettings;
  securitySettings: SecuritySettings;
}>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Simulate parallel database fetches
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      success: true,
      data: {
        userSettings: { ...mockUserSettings, userId },
        generalSettings: mockGeneralSettings,
        securitySettings: mockSecuritySettings,
      },
    };
  } catch (error) {
    console.error("getAllSettings error:", error);
    return {
      success: false,
      error: "Failed to retrieve settings",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

// Simple Notification Preferences Actions

/**
 * Get simple notification preferences for the authenticated user
 */
export async function getSimpleNotificationPreferences(): Promise<ActionResult<SimpleNotificationPreferences>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view notification preferences",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock data with current user ID
    const preferences: SimpleNotificationPreferences = {
      ...mockSimpleNotificationPreferences,
      userId,
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: preferences,
    };
  } catch (error) {
    console.error("getSimpleNotificationPreferences error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }
    
    return {
      success: false,
      error: "Failed to retrieve notification preferences",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Update simple notification preferences for the authenticated user
 */
export async function updateSimpleNotificationPreferences(
  preferences: Partial<Pick<SimpleNotificationPreferences, 'newReplies' | 'campaignUpdates' | 'weeklyReports' | 'domainAlerts' | 'warmupCompletion'>>
): Promise<ActionResult<SimpleNotificationPreferences>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to update notification preferences",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Validate that all provided values are boolean
    for (const [key, value] of Object.entries(preferences)) {
      if (value !== undefined && typeof value !== "boolean") {
        return {
          success: false,
          error: `Invalid value for notification preference '${key}': must be true or false`,
          code: ERROR_CODES.VALIDATION_FAILED,
          field: key,
        };
      }
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Merge with existing preferences
    const updatedPreferences: SimpleNotificationPreferences = {
      ...mockSimpleNotificationPreferences,
      ...(preferences as Partial<SimpleNotificationPreferences>),
      userId,
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: updatedPreferences,
    };
  } catch (error) {
    console.error("updateSimpleNotificationPreferences error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }
    
    if (errorMessage.includes("database") || errorMessage.includes("constraint")) {
      return {
        success: false,
        error: "Failed to update preferences in database",
        code: ERROR_CODES.DATABASE_ERROR,
      };
    }
    
    return {
      success: false,
      error: "Failed to update notification preferences",
      code: ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get compliance settings
 */
export async function getComplianceSettings(): Promise<ActionResult<ComplianceSettings>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view compliance settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock compliance settings
    const complianceSettings: ComplianceSettings = {
      autoAddUnsubscribeLink: true,
      unsubscribeText: "Click here to unsubscribe",
      unsubscribeLandingPage: "",
      companyName: "",
      addressLine1: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    };

    return {
      success: true,
      data: complianceSettings,
    };
  } catch (error) {
    console.error("getComplianceSettings error:", error);
    return {
      success: false,
      error: "Failed to retrieve compliance settings",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Update compliance settings
 */
export async function updateComplianceSettings(
  settings: DeepPartial<ComplianceSettings>
): Promise<ActionResult<ComplianceSettings>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to update compliance settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Validate unsubscribeText if provided
    if (settings.unsubscribeText && settings.unsubscribeText.length === 0) {
      return {
        success: false,
        error: "Unsubscribe text is required",
        code: ERROR_CODES.VALIDATION_FAILED,
        field: "unsubscribeText",
      };
    }

    // Validate companyName if provided
    if (settings.companyName && settings.companyName.length === 0) {
      return {
        success: false,
        error: "Company name is required",
        code: ERROR_CODES.VALIDATION_FAILED,
        field: "companyName",
      };
    }

    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock updated settings
    const updatedSettings: ComplianceSettings = {
      autoAddUnsubscribeLink: settings.autoAddUnsubscribeLink ?? true,
      unsubscribeText: settings.unsubscribeText || "Click here to unsubscribe",
      unsubscribeLandingPage: settings.unsubscribeLandingPage || "",
      companyName: settings.companyName || "",
      addressLine1: settings.addressLine1 || "",
      city: settings.city || "",
      state: settings.state || "",
      zip: settings.zip || "",
      country: settings.country || "",
    };

    return {
      success: true,
      data: updatedSettings,
    };
  } catch (error) {
    console.error("updateComplianceSettings error:", error);
    return {
      success: false,
      error: "Failed to update compliance settings",
      code: ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get security recommendations
 */
export async function getSecurityRecommendations(): Promise<ActionResult<SecurityRecommendation[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view security recommendations",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock security recommendations
    const securityRecommendations: SecurityRecommendation[] = [
      {
        id: "strong-password",
        title: "Strong Password",
        description: "Your password meets our security requirements.",
        status: "enabled",
        actionRequired: false,
      },
      {
        id: "two-factor-auth",
        title: "Two-Factor Authentication",
        description: "Enabling 2FA adds an extra layer of security to your account.",
        status: "recommended",
        actionRequired: true,
      },
      {
        id: "activity-monitoring",
        title: "Recent Activity Monitoring",
        description: "We monitor your account for suspicious activity and will notify you of any concerns.",
        status: "enabled",
        actionRequired: false,
      },
    ];

    return {
      success: true,
      data: securityRecommendations,
    };
  } catch (error) {
    console.error("getSecurityRecommendations error:", error);
    return {
      success: false,
      error: "Failed to retrieve security recommendations",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}
