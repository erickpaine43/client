/**
 * General settings actions
 * 
 * This module handles general user settings including profile information,
 * preferences, appearance settings, and user-specific configurations.
 */

"use server";

import { nile } from "@/app/api/[...nile]/nile";
import { mockUserSettings, mockGeneralSettings } from "../../data/settings.mock";
import { ActionResult } from "@/lib/actions/core/types";
import { ErrorFactory, withErrorHandling } from "@/lib/actions/core/errors";
import { withAuth } from "@/lib/actions/core/auth";
import { 
  UserSettings,
  CompanyInfo,
  GeneralSettings,
  DeepPartial,
  ERROR_CODES
} from './types';
import { validateUserSettings, validateCompanyInfo, isValidTimezone } from './validation';

/**
 * Get user settings for the authenticated user
 */
export async function getUserSettings(): Promise<ActionResult<UserSettings>> {
  return withAuth(async (context) => {
    return withErrorHandling(async () => {
      // Simulate database fetch with mock data
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
      
      // For demonstration, return mock data
      // In production, this would come from the database
      const settings: UserSettings = {
        ...mockUserSettings,
        userId: context.userId!,
        updatedAt: new Date(),
      };
      
      return {
        success: true,
        data: settings,
      };
    });
  });
}

/**
 * Update user settings for the authenticated user
 */
export async function updateUserSettings(
  settings: DeepPartial<UserSettings>
): Promise<ActionResult<UserSettings>> {
  return withAuth(async (context) => {
    return withErrorHandling(async () => {
      // Validate input
      const validationError = validateUserSettings(settings);
      if (validationError) {
        return ErrorFactory.validation(validationError, undefined, ERROR_CODES.VALIDATION_FAILED);
      }
      
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
        userId: context.userId!,
        updatedAt: new Date(),
      };
      
      return {
        success: true,
        data: updatedSettings,
      };
    });
  });
}

/**
 * Get general settings (profile, preferences, appearance)
 */
export async function getGeneralSettings(): Promise<ActionResult<GeneralSettings>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Simulate database fetch
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get user profile from NileDB
      const user = await nile.users.getSelf();
      
      let generalSettings: GeneralSettings;
      
      if (user && typeof user === "object" && !('status' in user)) {
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
    });
  });
}

/**
 * Update general settings
 */
export async function updateGeneralSettings(
  settings: DeepPartial<GeneralSettings>
): Promise<ActionResult<GeneralSettings>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Validate preferences if provided
      if (settings.preferences?.timezone) {
        if (!isValidTimezone(settings.preferences.timezone)) {
          return ErrorFactory.validation(
            "Invalid timezone",
            "timezone",
            ERROR_CODES.VALIDATION_FAILED
          );
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
    });
  });
}

/**
 * Update user timezone
 */
export async function updateUserTimezone(
  timezone: string
): Promise<ActionResult<{ timezone: string }>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      if (!isValidTimezone(timezone)) {
        return ErrorFactory.validation(
          "Invalid timezone format",
          "timezone",
          ERROR_CODES.VALIDATION_FAILED
        );
      }
      
      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 150));
      
      return {
        success: true,
        data: { timezone },
      };
    });
  });
}

/**
 * Update company information
 */
export async function updateCompanyInfo(
  companyInfo: DeepPartial<CompanyInfo>
): Promise<ActionResult<CompanyInfo>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      const validationError = validateCompanyInfo(companyInfo);
      if (validationError) {
        return ErrorFactory.validation(validationError, undefined, ERROR_CODES.VALIDATION_FAILED);
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
    });
  });
}

/**
 * Get all settings at once (for initial page load)
 */
export async function getAllSettings(): Promise<ActionResult<{
  userSettings: UserSettings;
  generalSettings: GeneralSettings;
}>> {
  return withAuth(async (context) => {
    return withErrorHandling(async () => {
      // Simulate parallel database fetches
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Get user profile from NileDB for general settings
      const user = await nile.users.getSelf();
      
      let generalSettings: GeneralSettings;
      
      if (user && typeof user === "object" && !('status' in user)) {
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
        data: {
          userSettings: { ...mockUserSettings, userId: context.userId! },
          generalSettings,
        },
      };
    });
  });
}
