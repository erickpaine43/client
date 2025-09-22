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

// Validation schema for team settings
const updateTeamSettingsSchema = z.object({
  teamName: z.string().min(1, 'Team name is required').max(100, 'Team name too long').optional(),
  teamSlug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Invalid slug format').optional(),
  teamLogo: z.string().url('Invalid logo URL').optional(),
  allowMemberInvites: z.boolean().optional(),
  requireTwoFactorAuth: z.boolean().optional(),
  defaultRole: z.enum(['owner', 'admin', 'member', 'viewer']).optional(),
  autoApproveMembers: z.boolean().optional(),
  notifyOnNewMember: z.boolean().optional(),
  notifyOnMemberRemoval: z.boolean().optional(),
  ssoEnabled: z.boolean().optional(),
  ssoProvider: z.enum(['google', 'microsoft', 'okta', 'saml']).optional(),
  allowedEmailDomains: z.array(z.string().min(1)).optional(),
  ipWhitelist: z.array(
    z.string().regex(
      /^(\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?$|^[a-fA-F0-9:]+$/,
      "Invalid IP address format"
    )
  ).optional(),
  sessionTimeout: z.number().min(5).max(1440).optional(), // 5 minutes to 24 hours
  passwordPolicy: z.object({
    minLength: z.number().min(8).max(128),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
    expiryDays: z.number().min(30).max(365).optional(),
  }).optional(),
});

// Mock team settings storage
let mockTeamSettings: TeamSettings = {
  teamId: 'team-1',
  teamName: 'My Team',
  teamSlug: 'my-team',
  allowMemberInvites: false,
  requireTwoFactorAuth: false,
  defaultRole: 'member',
  autoApproveMembers: false,
  notifyOnNewMember: true,
  notifyOnMemberRemoval: true,
  ssoEnabled: false,
  sessionTimeout: 480, // 8 hours
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    expiryDays: 90,
  },
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

        // Validate team slug uniqueness (in production, check against database)
        if (validatedSettings.teamSlug && validatedSettings.teamSlug !== mockTeamSettings.teamSlug) {
          // Mock slug validation - in production, check database
          const slugExists = false; // await checkSlugExists(validatedSettings.teamSlug);
          if (slugExists) {
            return ErrorFactory.conflict('Team slug is already taken');
          }
        }

        // Validate email domains format
        if (validatedSettings.allowedEmailDomains) {
          const invalidDomains = validatedSettings.allowedEmailDomains.filter(domain => 
            !/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/.test(domain)
          );
          
          if (invalidDomains.length > 0) {
            return ErrorFactory.validation(
              `Invalid email domains: ${invalidDomains.join(', ')}`,
              'allowedEmailDomains'
            );
          }
        }

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

        // Reset to defaults
        const defaultSettings: TeamSettings = {
          teamId: mockTeamSettings.teamId,
          teamName: mockTeamSettings.teamName, // Keep team name
          teamSlug: mockTeamSettings.teamSlug, // Keep slug
          allowMemberInvites: false,
          requireTwoFactorAuth: false,
          defaultRole: 'member',
          autoApproveMembers: false,
          notifyOnNewMember: true,
          notifyOnMemberRemoval: true,
          ssoEnabled: false,
          sessionTimeout: 480, // 8 hours
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            expiryDays: 90,
          },
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
 */
export async function validateTeamSlug(
  slug: string
): Promise<ActionResult<{ available: boolean; suggestion?: string }>> {
  return await withErrorHandling(async () => {
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return ErrorFactory.validation('Slug can only contain lowercase letters, numbers, and hyphens');
    }

    if (slug.length < 3 || slug.length > 50) {
      return ErrorFactory.validation('Slug must be between 3 and 50 characters');
    }

    if (slug.startsWith('-') || slug.endsWith('-')) {
      return ErrorFactory.validation('Slug cannot start or end with a hyphen');
    }

    // Check if current team already uses this slug
    if (slug === mockTeamSettings.teamSlug) {
      return { available: true };
    }

    // Mock availability check - in production, check database
    const isAvailable = true; // await checkSlugAvailability(slug);

    if (isAvailable) {
      return { available: true };
    } else {
      // Generate suggestion
      const suggestion = `${slug}-${Math.floor(Math.random() * 1000)}`;
      return { 
        available: false, 
        suggestion,
      };
    }
  });
}

/**
 * Update team branding (logo, colors, etc.)
 */
export async function updateTeamBranding(
  branding: {
    teamLogo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    favicon?: string;
  }
): Promise<ActionResult<TeamSettings>> {
  return await withFullAuth(
    {
      permission: Permission.UPDATE_SETTINGS,
      rateLimit: {
        action: 'team:branding:update',
        type: 'user',
        config: RateLimits.GENERAL_WRITE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to update team branding');
        }

        // Validate URLs if provided
        if (branding.teamLogo) {
          try {
            new URL(branding.teamLogo);
          } catch {
            return ErrorFactory.validation('Invalid logo URL', 'teamLogo');
          }
        }

        if (branding.favicon) {
          try {
            new URL(branding.favicon);
          } catch {
            return ErrorFactory.validation('Invalid favicon URL', 'favicon');
          }
        }

        // Validate color formats
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (branding.primaryColor && !colorRegex.test(branding.primaryColor)) {
          return ErrorFactory.validation('Invalid primary color format', 'primaryColor');
        }

        if (branding.secondaryColor && !colorRegex.test(branding.secondaryColor)) {
          return ErrorFactory.validation('Invalid secondary color format', 'secondaryColor');
        }

        // Update settings
        const updatedSettings: TeamSettings = {
          ...mockTeamSettings,
          teamLogo: branding.teamLogo || mockTeamSettings.teamLogo,
        };

        mockTeamSettings = updatedSettings;

        // Log activity
        await logTeamActivity({
          action: 'settings:updated',
          performedBy: context.userId!,
          metadata: { 
            action: 'branding_update',
            changes: branding,
          },
        });

        return updatedSettings;
      });
    }
  );
}

/**
 * Get team security settings
 */
export async function getTeamSecuritySettings(): Promise<ActionResult<{
  requireTwoFactorAuth: boolean;
  ssoEnabled: boolean;
  ssoProvider?: string;
  allowedEmailDomains?: string[];
  ipWhitelist?: string[];
  sessionTimeout: number;
  passwordPolicy: TeamSettings['passwordPolicy'];
}>> {
  return await withFullAuth(
    {
      permission: Permission.VIEW_SETTINGS,
      rateLimit: {
        action: 'team:security:read',
        type: 'user',
        config: RateLimits.GENERAL_READ,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:read');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to view security settings');
        }

        return {
          requireTwoFactorAuth: mockTeamSettings.requireTwoFactorAuth,
          ssoEnabled: mockTeamSettings.ssoEnabled || false,
          ssoProvider: mockTeamSettings.ssoProvider,
          allowedEmailDomains: mockTeamSettings.allowedEmailDomains,
          ipWhitelist: mockTeamSettings.ipWhitelist,
          sessionTimeout: mockTeamSettings.sessionTimeout || 480,
          passwordPolicy: mockTeamSettings.passwordPolicy,
        };
      });
    }
  );
}

/**
 * Update team security settings
 */
export async function updateTeamSecuritySettings(
  securitySettings: {
    requireTwoFactorAuth?: boolean;
    ssoEnabled?: boolean;
    ssoProvider?: 'google' | 'microsoft' | 'okta' | 'saml';
    allowedEmailDomains?: string[];
    ipWhitelist?: string[];
    sessionTimeout?: number;
    passwordPolicy?: TeamSettings['passwordPolicy'];
  }
): Promise<ActionResult<TeamSettings>> {
  return await withFullAuth(
    {
      permission: Permission.UPDATE_SETTINGS,
      rateLimit: {
        action: 'team:security:update',
        type: 'user',
        config: RateLimits.SENSITIVE_ACTION,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission (only admins and owners can update security settings)
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to update security settings');
        }

        // Validate session timeout
        if (securitySettings.sessionTimeout !== undefined) {
          if (securitySettings.sessionTimeout < 5 || securitySettings.sessionTimeout > 1440) {
            return ErrorFactory.validation('Session timeout must be between 5 minutes and 24 hours');
          }
        }

        // Validate password policy
        if (securitySettings.passwordPolicy) {
          const policy = securitySettings.passwordPolicy;
          if (policy.minLength < 8 || policy.minLength > 128) {
            return ErrorFactory.validation('Password minimum length must be between 8 and 128 characters');
          }
          
          if (policy.expiryDays !== undefined && (policy.expiryDays < 30 || policy.expiryDays > 365)) {
            return ErrorFactory.validation('Password expiry must be between 30 and 365 days');
          }
        }

        // Update settings
        const updatedSettings: TeamSettings = {
          ...mockTeamSettings,
          ...securitySettings,
        };

        mockTeamSettings = updatedSettings;

        // Log activity
        await logTeamActivity({
          action: 'settings:updated',
          performedBy: context.userId!,
          metadata: { 
            action: 'security_update',
            changes: Object.keys(securitySettings),
          },
        });

        return updatedSettings;
      });
    }
  );
}
