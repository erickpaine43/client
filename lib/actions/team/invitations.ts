/**
 * Team invitation management actions
 * 
 * This module handles team invitation operations including sending,
 * resending, canceling invitations, and bulk operations.
 */

'use server';

import { z } from 'zod';
import { ActionResult } from '../core/types';
import { ErrorFactory, withErrorHandling } from '../core/errors';
import { withFullAuth, RateLimits } from '../core/auth';
import { TeamInvite, TeamRole, BulkInviteResult } from '../../../types/team';
import { mockInvites } from '../../mocks/team';
import { checkTeamPermission } from './permissions';
import { logTeamActivity } from './activity';
import { validateTeamEmail } from './members';
import { getTenantService } from '../../niledb/tenant';

// Validation schemas
const addTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
  name: z.string().min(1, 'Name is required').optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
});

/**
 * Add a new team member by creating their account directly
 */
export async function addTeamMember(
  data: z.infer<typeof addTeamMemberSchema>
): Promise<ActionResult<{ userId: string; email: string; role: TeamRole }>> {
  return await withFullAuth(
    {
      permission: undefined,
      rateLimit: {
        action: 'team:member:add',
        type: 'user',
        config: RateLimits.TEAM_INVITE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Validate input
        const validationResult = addTeamMemberSchema.safeParse(data);
        if (!validationResult.success) {
          return ErrorFactory.validation(
            validationResult.error.issues[0]?.message || 'Invalid input'
          );
        }

        const { email, password, role, name, givenName, familyName } = validationResult.data;

        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'members:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to add team members');
        }

        // Get current user's tenants to find the tenant ID
        const tenantService = getTenantService();
        const userTenants = await tenantService.getUserTenants(context.userId!);

        if (userTenants.length === 0) {
          return ErrorFactory.notFound('No tenant found for user');
        }

        // Use the first tenant (in a real app, this might be selected from UI)
        const tenantId = userTenants[0].tenant.id;

        // Check if user can assign this role
        const hasTenantAccess = await tenantService.validateTenantAccess(context.userId!, tenantId);
        if (!hasTenantAccess) {
          return ErrorFactory.unauthorized('You do not have access to this tenant');
        }

        // For now, assume users can assign roles within tenant access
        // TODO: Implement proper role hierarchy checking when tenant service provides user role

        // Call the signup API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tenants/${tenantId}/signup-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Auth headers should be handled by the auth system
          },
          body: JSON.stringify({
            email,
            password,
            name,
            givenName,
            familyName,
            roles: [role],
          }),
        });

        if (!response.ok) {
           const errorData = await response.json().catch(() => ({ message: 'Unknown error' })) as { message?: string };
           return ErrorFactory.internal(errorData.message || 'Failed to create user account');
         }

        const apiResponse: { userId: string; email: string; tenantId: string; roles: string[]; timestamp: string } = await response.json();

        // Log activity
        await logTeamActivity({
          action: 'member:invited',
          performedBy: context.userId!,
          targetUser: apiResponse.userId,
          metadata: { role, email: apiResponse.email },
        });

        return {
          userId: apiResponse.userId,
          email: apiResponse.email,
          role,
        };
      });
    }
  );
}

/**
 * Resend team invitation
 */
export async function resendInvite(
  inviteId: string
): Promise<ActionResult<TeamInvite>> {
  return await withFullAuth(
    {
      permission: undefined,
      rateLimit: {
        action: 'team:invite:resend',
        type: 'user',
        config: RateLimits.TEAM_INVITE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Find the invite first
        const invite = mockInvites.find(i => i.id === inviteId);
        if (!invite) {
          return ErrorFactory.notFound('Invitation');
        }

        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'members:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to manage invitations');
        }

        // Update expiry
        invite.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // TODO: Resend invite email
        // await sendTeamInviteEmail(invite.email, invite);

        // Log activity
        await logTeamActivity({
          action: 'member:invited',
          performedBy: context.userId!,
          targetUser: invite.email,
          metadata: { action: 'resend', inviteId },
        });

        return invite;
      });
    }
  );
}

/**
 * Cancel team invitation
 */
export async function cancelInvite(
  inviteId: string
): Promise<ActionResult<{ cancelled: boolean }>> {
  return await withFullAuth(
    {
      permission: undefined,
      rateLimit: {
        action: 'team:invite:cancel',
        type: 'user',
        config: RateLimits.TEAM_MEMBER_REMOVE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Find and remove the invite
        const inviteIndex = mockInvites.findIndex(i => i.id === inviteId);
        if (inviteIndex === -1) {
          return ErrorFactory.notFound('Invitation');
        }

        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'members:delete');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to cancel invitations');
        }

        const invite = mockInvites[inviteIndex];
        mockInvites.splice(inviteIndex, 1);

        // Log activity
        await logTeamActivity({
          action: 'member:invited',
          performedBy: context.userId!,
          targetUser: invite.email,
          metadata: { action: 'cancelled', inviteId },
        });

        return { cancelled: true };
      });
    }
  );
}

/**
 * Bulk invite team members
 */
export async function bulkInviteMembers(
  emails: string[],
  role: TeamRole = 'member'
): Promise<ActionResult<BulkInviteResult>> {
  return await withFullAuth(
    {
      permission: undefined,
      rateLimit: {
        action: 'team:bulk:invite',
        type: 'user',
        config: RateLimits.BULK_OPERATION,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'members:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to invite team members');
        }

        const successful: string[] = [];
        const failed: Array<{ email: string; reason: string }> = [];

        for (const email of emails) {
          const validation = await validateTeamEmail(email);

          if (validation.success && validation.data?.valid) {
            const result = await addTeamMember({ email, password: 'tempPassword123!', role });

            if (result.success) {
              successful.push(email);
            } else {
              failed.push({ email, reason: result.error?.message || 'Unknown error' });
            }
          } else if (validation.success) {
            failed.push({ email, reason: validation.data?.reason || 'Invalid email' });
          } else {
            failed.push({ email, reason: 'Validation failed' });
          }
        }

        // Log bulk activity
        await logTeamActivity({
          action: 'member:invited',
          performedBy: context.userId!,
          metadata: { 
            action: 'bulk',
            successful: successful.length,
            failed: failed.length,
            role 
          },
        });

        return { successful, failed };
      });
    }
  );
}
