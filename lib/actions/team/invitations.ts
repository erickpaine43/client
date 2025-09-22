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
import { TeamInvite, TeamRole, BulkInviteResult } from '@/types/team';
import { ROLE_HIERARCHY } from '@/lib/constants/team';
import { mockTeamMembers, mockInvites } from '@/lib/mocks/team';
import { checkTeamPermission } from './permissions';
import { logTeamActivity } from './activity';
import { validateTeamEmail } from './members';

// Validation schemas
const addTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
  name: z.string().min(1, 'Name is required').optional(),
  sendInvite: z.boolean().default(true),
});

/**
 * Add a new team member or send invite
 */
export async function addTeamMember(
  data: z.infer<typeof addTeamMemberSchema>
): Promise<ActionResult<TeamInvite>> {
  return await withFullAuth(
    {
      permission: undefined,
      rateLimit: {
        action: 'team:invite',
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

        const { email, role, sendInvite } = validationResult.data;

        // Check if member already exists
        const existingMember = mockTeamMembers.find(m => m.email === email);
        if (existingMember) {
          return ErrorFactory.conflict('A team member with this email already exists');
        }

        // Check if invite already exists
        const existingInvite = mockInvites.find(i => i.email === email && i.status === 'pending');
        if (existingInvite) {
          return ErrorFactory.conflict('An invitation has already been sent to this email');
        }

        // Check team member limit
        const memberCount = mockTeamMembers.length + mockInvites.filter(i => i.status === 'pending').length;
        if (memberCount >= 10) { // Example limit
          return ErrorFactory.conflict('Team member limit reached. Please upgrade your plan.');
        }

        // Check if user can assign this role
        const currentMember = mockTeamMembers.find(m => m.userId === context.userId);
        if (currentMember && currentMember.role !== 'owner') {
          const currentLevel = ROLE_HIERARCHY[currentMember.role];
          const newRoleLevel = ROLE_HIERARCHY[role];

          if (newRoleLevel > currentLevel) {
            return ErrorFactory.unauthorized(
              `You cannot assign a role higher than your own (${currentMember.role})`
            );
          }
        }

        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'members:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to add team members');
        }

        // Simulate async database call
        await new Promise(resolve => setTimeout(resolve, 200));

        // Create invite
        const newInvite: TeamInvite = {
          id: `invite-${Date.now()}`,
          teamId: 'team-1',
          email,
          role,
          invitedBy: context.userId!,
          invitedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'pending',
        };

        // Add to mock data
        mockInvites.push(newInvite);

        // TODO: Send invite email if sendInvite is true
        if (sendInvite) {
          // await sendTeamInviteEmail(email, newInvite);
        }

        // Log activity
        await logTeamActivity({
          action: 'member:invited',
          performedBy: context.userId!,
          targetUser: email,
          metadata: { role },
        });

        return newInvite;
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
            const result = await addTeamMember({ email, role, sendInvite: true });

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
