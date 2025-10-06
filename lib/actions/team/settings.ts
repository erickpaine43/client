/**
 * Team settings management actions
 * 
 * This module handles team settings operations including general settings,
 * security preferences, and team configuration management.
 */

'use server';

import { z } from 'zod';
import { ActionResult } from '../core/types';
import { ErrorFactory, withErrorHandling } from '../core/errors';
import { withFullAuth, RateLimits } from '../core/auth';
import { TeamSettings, UpdateTeamSettingsForm } from '../../../types/team';
import { checkTeamPermission } from './permissions';
import { logTeamActivity } from './activity';
import { Permission } from '../../../types/auth';

// Validation schema for team settings (minimal)
const updateTeamSettingsSchema = z.object({
  notifyOnNewMember: z.boolean().optional(),
});

// Mock team settings storage (minimal, team-identity focused)
let mockTeamSettings: TeamSettings = {
  teamId: 'team-1',
  notifyOnNewMember: true,
};

/**
 * Get current team settings
 */
export async function getTeamSettings(): Promise<ActionResult<TeamSettings>> {
  return await withFullAuth(
    {
      permission: Permission.VIEW_SETTINGS,
      rateLimit: {
        action: 'team:settings:read',
        type: 'user',
        config: RateLimits.GENERAL_READ,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:read');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to view team settings');
        }

        // Simulate async database call
        await new Promise(resolve => setTimeout(resolve, 100));

        return { ...mockTeamSettings };
      });
    }
  );
}

/**
 * Update team settings
 */
export async function updateTeamSettings(
  settings: UpdateTeamSettingsForm
): Promise<ActionResult<TeamSettings>> {
  return await withFullAuth(
    {
      permission: Permission.UPDATE_SETTINGS,
      rateLimit: {
        action: 'team:settings:update',
        type: 'user',
        config: RateLimits.GENERAL_WRITE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Validate input
        const validationResult = updateTeamSettingsSchema.safeParse(settings);
        if (!validationResult.success) {
          return ErrorFactory.validation(
            validationResult.error.issues[0]?.message || 'Invalid settings'
          );
        }

        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to update team settings');
        }

        const validatedSettings = validationResult.data;

        // Team settings validation is minimal - only notifyOnNewMember
        // Additional validations moved to appropriate domain contexts

        // Simulate async database call
        await new Promise(resolve => setTimeout(resolve, 200));

        // Update settings
        const updatedSettings: TeamSettings = {
          ...mockTeamSettings,
          ...validatedSettings,
        };

        // Update mock storage
        mockTeamSettings = updatedSettings;

        // Log activity
        await logTeamActivity({
          action: 'settings:updated',
          performedBy: context.userId!,
          metadata: { 
            updatedFields: Object.keys(validatedSettings),
            changes: validatedSettings,
          },
        });

        return updatedSettings;
      });
    }
  );
}

/**
 * Reset team settings to defaults
 */
export async function resetTeamSettings(): Promise<ActionResult<TeamSettings>> {
  return await withFullAuth(
    {
      permission: Permission.UPDATE_SETTINGS,
      rateLimit: {
        action: 'team:settings:reset',
        type: 'user',
        config: RateLimits.SENSITIVE_ACTION,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission (only owners can reset settings)
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to reset team settings');
        }

        // Store current settings for logging
        const previousSettings = { ...mockTeamSettings };

        // Reset to defaults (minimal settings)
        const defaultSettings: TeamSettings = {
          teamId: mockTeamSettings.teamId,
          notifyOnNewMember: true, // Default to notify on new members
        };

        // Update mock storage
        mockTeamSettings = defaultSettings;

        // Log activity
        await logTeamActivity({
          action: 'settings:updated',
          performedBy: context.userId!,
          metadata: { 
            action: 'reset_to_defaults',
            previousSettings,
          },
        });

        return defaultSettings;
      });
    }
  );
}

/**
 * Validate team slug availability
 * @deprecated Moved to company-level settings - use company branding validation instead
 */
export async function validateTeamSlug(
  slug: string
): Promise<ActionResult<{ available: boolean; suggestion?: string }>> {
  return ErrorFactory.validation('Team slug validation moved to company settings');
}

/**
 * Update team branding (logo, colors, etc.)
 * @deprecated Moved to company-level branding settings
 */
export async function updateTeamBranding(
  branding: {
    teamLogo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
  }
): Promise<ActionResult<TeamSettings>> {
  return ErrorFactory.validation('Team branding moved to company settings - use company branding API instead');
}

/**
 * Get team security settings
 * @deprecated Security settings moved to user profile and system configuration
 */
export async function getTeamSecuritySettings(): Promise<ActionResult<any>> {
  return ErrorFactory.validation('Security settings moved to user profile and system configuration');
}

/**
 * Update team security settings
 * @deprecated Security settings moved to user profile and system configuration
 */
export async function updateTeamSecuritySettings(
  securitySettings: any
): Promise<ActionResult<TeamSettings>> {
  return ErrorFactory.validation('Security settings moved to user profile and system configuration');
}
