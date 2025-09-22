/**
 * Team member management actions
 * 
 * This module handles team member operations including listing, adding,
 * updating, and removing team members with proper permission checks.
 */

'use server';

import { z } from 'zod';
import { ActionResult } from '../core/types';
import { ErrorFactory, withErrorHandling } from '../core/errors';
import { withFullAuth, RateLimits } from '../core/auth';
import { TeamMember, TeamPermission, TeamMembersResponse, TeamStats } from '@/types/team';
import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from '@/lib/constants/team';
import { mockTeamMembers, mockInvites } from '@/lib/mocks/team';
import { checkTeamPermission } from './permissions';
import { logTeamActivity } from './activity';

// Validation schemas
const updateTeamMemberSchema = z.object({
  role: z.enum(['owner', 'admin', 'member', 'viewer']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Get all team members with optional invites and stats
 */
export async function getTeamMembers(
  includeInvites: boolean = false
): Promise<ActionResult<TeamMembersResponse>> {
  return await withFullAuth(
    {
      rateLimit: {
        action: 'team:members:read',
        type: 'user',
        config: RateLimits.GENERAL_READ,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'members:read');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to view team members');
        }

        // Simulate async database call
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get team members
        const members = [...mockTeamMembers];

        // Get invites if requested
        const invites = includeInvites ? [...mockInvites] : undefined;

        // Calculate stats
        const stats: TeamStats = {
          totalMembers: members.length,
          activeMembers: members.filter(m => m.status === 'active').length,
          inactiveMembers: members.filter(m => m.status !== 'active').length,
          pendingInvites: invites?.length || 0,
          memberLimit: 10, // Example limit
          lastActivityAt: new Date().toISOString(),
          storageUsed: 0, // Calculate actual storage
          storageLimit: 1024, // Your actual limit
          emailsSent: 0, // Calculate actual emails sent
          emailsLimit: 10000, // Your actual limit
        };

        return {
          members,
          invites,
          stats,
        };
      });
    }
  );
}

/**
 * Update team member details
 */
export async function updateTeamMember(
  memberId: string,
  updates: z.infer<typeof updateTeamMemberSchema>
): Promise<ActionResult<TeamMember>> {
  return await withFullAuth(
    {
      rateLimit: {
        action: 'team:member:update',
        type: 'user',
        config: RateLimits.TEAM_MEMBER_UPDATE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Validate input
        const validationResult = updateTeamMemberSchema.safeParse(updates);
        if (!validationResult.success) {
          return ErrorFactory.validation(
            validationResult.error.issues[0]?.message || 'Invalid input'
          );
        }

        // Find the member first
        const memberIndex = mockTeamMembers.findIndex(m => m.id === memberId);
        if (memberIndex === -1) {
          return ErrorFactory.notFound('Team member');
        }

        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'members:write', memberId);
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to update this team member');
        }

        const member = mockTeamMembers[memberIndex];

        // Check if trying to update owner
        if (member.role === 'owner') {
          const currentMember = mockTeamMembers.find(m => m.userId === context.userId);
          if (currentMember && currentMember.role !== 'owner') {
            return ErrorFactory.unauthorized('Cannot change the role of the team owner');
          }
        }

        // Check special cases for role changes
        if (updates.role) {
          // Check if user can assign this role
          const currentMember = mockTeamMembers.find(m => m.userId === context.userId);
          if (currentMember && currentMember.role !== 'owner') {
            const currentLevel = ROLE_HIERARCHY[currentMember.role];
            const newRoleLevel = ROLE_HIERARCHY[updates.role];

            if (newRoleLevel > currentLevel) {
              return ErrorFactory.unauthorized(
                `You cannot assign a role higher than your own (${currentMember.role})`
              );
            }
          }
        }

        // Simulate async database call
        await new Promise(resolve => setTimeout(resolve, 200));

        // Update the member
        const updatedMember: TeamMember = {
          ...member,
          ...updates,
          // Update permissions based on new role if role changed
          permissions: updates.role
            ? ROLE_PERMISSIONS[updates.role]
            : (updates.permissions as TeamPermission[]) || member.permissions,
        };

        // Update mock data
        mockTeamMembers[memberIndex] = updatedMember;

        // Log activity
        await logTeamActivity({
          action: 'member:updated',
          performedBy: context.userId!,
          targetUser: member.userId,
          metadata: updates,
        });

        return updatedMember;
      });
    }
  );
}

/**
 * Remove a team member
 */
export async function removeTeamMember(
  memberId: string,
  transferOwnership?: string
): Promise<ActionResult<{ removed: boolean }>> {
  return await withFullAuth(
    {
      rateLimit: {
        action: 'team:member:remove',
        type: 'user',
        config: RateLimits.TEAM_MEMBER_REMOVE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Find the member first
        const memberIndex = mockTeamMembers.findIndex(m => m.id === memberId);
        if (memberIndex === -1) {
          return ErrorFactory.notFound('Team member');
        }

        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'members:delete', memberId);
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to remove team members');
        }

        const member = mockTeamMembers[memberIndex];

        // Check if trying to remove owner
        if (member.role === 'owner') {
          if (!transferOwnership) {
            return ErrorFactory.conflict('Cannot remove team owner without transferring ownership');
          }

          // Validate new owner
          const newOwner = mockTeamMembers.find(m => m.id === transferOwnership);
          if (!newOwner) {
            return ErrorFactory.notFound('New owner');
          }

          // Transfer ownership
          newOwner.role = 'owner';
          newOwner.permissions = ['all'];
        }

        // Check if there will be at least one owner
        const ownerCount = mockTeamMembers.filter(m => m.role === 'owner').length;
        if (member.role === 'owner' && ownerCount === 1 && !transferOwnership) {
          return ErrorFactory.conflict('Team must have at least one owner');
        }

        // Simulate async database call
        await new Promise(resolve => setTimeout(resolve, 200));

        // Remove the member
        mockTeamMembers.splice(memberIndex, 1);

        // Log activity
        await logTeamActivity({
          action: 'member:removed',
          performedBy: context.userId!,
          targetUser: member.userId,
          metadata: { transferredTo: transferOwnership },
        });

        return { removed: true };
      });
    }
  );
}

/**
 * Validate team email for invitation
 */
export async function validateTeamEmail(
  email: string
): Promise<ActionResult<{ valid: boolean; reason?: string }>> {
  return await withErrorHandling(async () => {
    // Validate email format
    const emailSchema = z.string().email('Invalid email address');
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      return {
        valid: false,
        reason: 'Invalid email format',
      };
    }

    // Check if already a member
    const existingMember = mockTeamMembers.find(m => m.email === email);
    if (existingMember) {
      return {
        valid: false,
        reason: 'User is already a team member',
      };
    }

    // Check if already invited
    const existingInvite = mockInvites.find(i => i.email === email && i.status === 'pending');
    if (existingInvite) {
      return {
        valid: false,
        reason: 'User has already been invited',
      };
    }

    return { valid: true };
  });
}
