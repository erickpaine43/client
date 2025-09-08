/**
 * Server actions for team management
 * 
 * This module provides server-side actions for managing team members,
 * including role-based permission validation and comprehensive error handling.
 */

'use server';

import { z } from 'zod';
import {
  getCurrentUserId,
  requireUserId,
  checkRateLimit,
} from '../utils/auth';
import { 
  TeamMember, 
  TeamRole, 
  TeamInvite,
  TeamPermission,
  TeamActivity,
  TeamSettings,
} from '@/types/team';
import { ActionResult } from '@/types/common';
import { TEAM_ERROR_CODES, ROLE_HIERARCHY, ROLE_PERMISSIONS } from '../constants/team';
import { mockTeamMembers, mockInvites } from '../mocks/team';


// Validation schemas
const emailSchema = z.string().email('Invalid email address');

const teamRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);

const addTeamMemberSchema = z.object({
  email: emailSchema,
  role: teamRoleSchema,
  name: z.string().min(1, 'Name is required').optional(),
  sendInvite: z.boolean().default(true),
});

const updateTeamMemberSchema = z.object({
  role: teamRoleSchema.optional(),
  status: z.enum(['active', 'inactive']).optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Check if a user has permission to perform an action on team members
 */
export async function checkTeamPermission(
  userId: string,
  permission: TeamPermission,
  targetMemberId?: string
): Promise<boolean> {
  try {
    // Get the current user's team member record
    const currentMember = mockTeamMembers.find(m => m.userId === userId);
    
    if (!currentMember) {
      return false;
    }
    
    // Owner has all permissions
    if (currentMember.role === 'owner') {
      return true;
    }
    
    // Check if user has the all permission
    if (currentMember.permissions.includes('all')) {
      return true;
    }
    
    // Check specific permission
    if (!currentMember.permissions.includes(permission)) {
      console.log('User does not have permission:', permission);
      return false;
    }
    
    // If targeting another member, check role hierarchy
    if (targetMemberId) {
      const targetMember = mockTeamMembers.find(m => m.id === targetMemberId);
      if (targetMember) {
        const currentLevel = ROLE_HIERARCHY[currentMember.role];
        const targetLevel = ROLE_HIERARCHY[targetMember.role];
        
        // Can only modify members with lower or equal role (except owners)
        if (targetLevel > currentLevel && targetMember.role !== 'owner') {
          return false;
        }
      }
    }
    
    console.log('Permission check passed, returning true');
    return true;
  } catch (error) {
    console.log('Error in checkTeamPermission:', error);
    return false;
  }
}

/**
 * Get all team members
 */
export async function getTeamMembers(
  includeInvites: boolean = false
): Promise<ActionResult<{
  members: TeamMember[];
  invites?: TeamInvite[];
  stats?: {
    totalMembers: number;
    activeMembers: number;
    pendingInvites: number;
    memberLimit: number;
  };
}>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to view team members',
        code: TEAM_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Check rate limit
    const canProceed = await checkRateLimit(`team:read:${userId}`, 30, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.',
        code: TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Check permission
    const hasAccess = await checkTeamPermission(userId, 'members:read');
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have permission to view team members',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get team members
    const members = [...mockTeamMembers];
    
    // Get invites if requested
    const invites = includeInvites ? [...mockInvites] : undefined;
    
    // Calculate stats
    const stats = {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'active').length,
      pendingInvites: invites?.length || 0,
      memberLimit: 10, // Example limit
    };
    
    return {
      success: true,
      data: {
        members,
        invites,
        stats,
      },
    };
  } catch (error) {
    console.error('getTeamMembers error:', error);
    
    return {
      success: false,
      error: 'Failed to retrieve team members',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Add a new team member or send invite
 */
export async function addTeamMember(
  data: z.infer<typeof addTeamMemberSchema>
): Promise<ActionResult<TeamInvite | TeamMember>> {
  try {
    const userId = await requireUserId();
    
    // Check rate limit for sensitive operation
    const canProceed = await checkRateLimit(`team:add:${userId}`, 5, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: 'Too many attempts. Please try again later.',
        code: TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Validate input
    const validationResult = addTeamMemberSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || 'Invalid input',
        code: TEAM_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    const { email, role, sendInvite } = validationResult.data;

    // Check if member already exists
    const existingMember = mockTeamMembers.find(m => m.email === email);
    if (existingMember) {
      return {
        success: false,
        error: 'A team member with this email already exists',
        code: TEAM_ERROR_CODES.MEMBER_EXISTS,
      };
    }

    // Check if invite already exists
    const existingInvite = mockInvites.find(i => i.email === email && i.status === 'pending');
    if (existingInvite) {
      return {
        success: false,
        error: 'An invitation has already been sent to this email',
        code: TEAM_ERROR_CODES.INVITE_EXISTS,
      };
    }

    // Check team member limit
    const memberCount = mockTeamMembers.length + mockInvites.filter(i => i.status === 'pending').length;
    if (memberCount >= 10) { // Example limit
      return {
        success: false,
        error: 'Team member limit reached. Please upgrade your plan.',
        code: TEAM_ERROR_CODES.TEAM_LIMIT_REACHED,
      };
    }

    // Check if user can assign this role
    const currentMember = mockTeamMembers.find(m => m.userId === userId);
    if (currentMember && currentMember.role !== 'owner') {
      const currentLevel = ROLE_HIERARCHY[currentMember.role];
      const newRoleLevel = ROLE_HIERARCHY[role];

      if (newRoleLevel > currentLevel) {
        return {
          success: false,
          error: `You cannot assign a role higher than your own (${currentMember.role})`,
          code: TEAM_ERROR_CODES.PERMISSION_DENIED,
        };
      }
    }

    // Check permission
    const hasAccess = await checkTeamPermission(userId, 'members:write');
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have permission to add team members',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Create invite
    const newInvite: TeamInvite = {
      id: `invite-${Date.now()}`,
      teamId: 'team-1',
      email,
      role,
      invitedBy: userId,
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
      performedBy: userId,
      targetUser: email,
      metadata: { role },
    });
    
    return {
      success: true,
      data: newInvite,
    };
  } catch (error) {
    console.error('addTeamMember error:', error);
    
    return {
      success: false,
      error: 'Failed to add team member',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Update team member details
 */
export async function updateTeamMember(
  memberId: string,
  updates: z.infer<typeof updateTeamMemberSchema>
): Promise<ActionResult<TeamMember>> {
  try {
    const userId = await requireUserId();
    
    // Check rate limit
    const canProceed = await checkRateLimit(`team:update:${userId}`, 10, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: 'Too many update attempts. Please try again later.',
        code: TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Validate input
    const validationResult = updateTeamMemberSchema.safeParse(updates);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || 'Invalid input',
        code: TEAM_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Find the member first
    const memberIndex = mockTeamMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return {
        success: false,
        error: 'Team member not found',
        code: TEAM_ERROR_CODES.MEMBER_NOT_FOUND,
      };
    }

    // Check permission
    const hasAccess = await checkTeamPermission(userId, 'members:write', memberId);
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have permission to update this team member',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    const member = mockTeamMembers[memberIndex];
    
    // Check if trying to update owner
    if (member.role === 'owner') {
      const currentMember = mockTeamMembers.find(m => m.userId === userId);
      if (currentMember && currentMember.role !== 'owner') {
        return {
          success: false,
          error: 'Cannot change the role of the team owner',
          code: TEAM_ERROR_CODES.CANNOT_DEMOTE_OWNER,
        };
      }
    }
    
    // Check special cases for role changes
    if (updates.role) {
      // Check if user can assign this role
      const currentMember = mockTeamMembers.find(m => m.userId === userId);
      if (currentMember && currentMember.role !== 'owner') {
        const currentLevel = ROLE_HIERARCHY[currentMember.role];
        const newRoleLevel = ROLE_HIERARCHY[updates.role];
        
        if (newRoleLevel > currentLevel) {
          return {
            success: false,
            error: `You cannot assign a role higher than your own (${currentMember.role})`,
            code: TEAM_ERROR_CODES.PERMISSION_DENIED,
          };
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
      permissions: updates.role ? ROLE_PERMISSIONS[updates.role] : (updates.permissions as TeamPermission[]) || member.permissions,
    };
    
    // Update mock data
    mockTeamMembers[memberIndex] = updatedMember;
    
    // Log activity
    await logTeamActivity({
      action: 'member:updated',
      performedBy: userId,
      targetUser: member.userId,
      metadata: updates,
    });
    
    return {
      success: true,
      data: updatedMember,
    };
  } catch (error) {
    console.error('updateTeamMember error:', error);
    
    return {
      success: false,
      error: 'Failed to update team member',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Remove a team member
 */
export async function removeTeamMember(
  memberId: string,
  transferOwnership?: string
): Promise<ActionResult<{ removed: boolean }>> {
  try {
    const userId = await requireUserId();
    
    // Check rate limit for sensitive operation
    const canProceed = await checkRateLimit(`team:remove:${userId}`, 3, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: 'Too many removal attempts. Please try again later.',
        code: TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Find the member first
    const memberIndex = mockTeamMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      return {
        success: false,
        error: 'Team member not found',
        code: TEAM_ERROR_CODES.MEMBER_NOT_FOUND,
      };
    }

    // Check permission
    const hasAccess = await checkTeamPermission(userId, 'members:delete', memberId);
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have permission to remove team members',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    const member = mockTeamMembers[memberIndex];
    
    // Check if trying to remove owner
    if (member.role === 'owner') {
      if (!transferOwnership) {
        return {
          success: false,
          error: 'Cannot remove team owner without transferring ownership',
          code: TEAM_ERROR_CODES.CANNOT_REMOVE_OWNER,
        };
      }
      
      // Validate new owner
      const newOwner = mockTeamMembers.find(m => m.id === transferOwnership);
      if (!newOwner) {
        return {
          success: false,
          error: 'New owner not found',
          code: TEAM_ERROR_CODES.MEMBER_NOT_FOUND,
        };
      }
      
      // Transfer ownership
      newOwner.role = 'owner';
      newOwner.permissions = ['all'];
    }
    
    // Check if there will be at least one owner
    const ownerCount = mockTeamMembers.filter(m => m.role === 'owner').length;
    if (member.role === 'owner' && ownerCount === 1 && !transferOwnership) {
      return {
        success: false,
        error: 'Team must have at least one owner',
        code: TEAM_ERROR_CODES.OWNER_REQUIRED,
      };
    }
    
    // Simulate async database call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Remove the member
    mockTeamMembers.splice(memberIndex, 1);
    
    // Log activity
    await logTeamActivity({
      action: 'member:removed',
      performedBy: userId,
      targetUser: member.userId,
      metadata: { transferredTo: transferOwnership },
    });
    
    return {
      success: true,
      data: { removed: true },
    };
  } catch (error) {
    console.error('removeTeamMember error:', error);
    
    return {
      success: false,
      error: 'Failed to remove team member',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Resend team invitation
 */
export async function resendInvite(
  inviteId: string
): Promise<ActionResult<TeamInvite>> {
  try {
    const userId = await requireUserId();
    console.log('resendInvite - userId:', userId);

    // Find the invite first
    const invite = mockInvites.find(i => i.id === inviteId);
    if (!invite) {
      console.log('resendInvite - Invite not found:', inviteId);
      return {
        success: false,
        error: 'Invitation not found',
        code: TEAM_ERROR_CODES.MEMBER_NOT_FOUND,
      };
    }

    // Check permission
    console.log('resendInvite - Checking permission for user:', userId, 'permission: members:write');
    const hasAccess = await checkTeamPermission(userId, 'members:write');
    console.log('resendInvite - hasAccess:', hasAccess);
    
    if (!hasAccess) {
      console.log('resendInvite - Access denied for user:', userId);
      return {
        success: false,
        error: 'You do not have permission to manage invitations',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    // Update expiry
    invite.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // TODO: Resend invite email
    // await sendTeamInviteEmail(invite.email, invite);
    
    return {
      success: true,
      data: invite,
    };
  } catch (error) {
    console.error('resendInvite error:', error);
    
    return {
      success: false,
      error: 'Failed to resend invitation',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Cancel team invitation
 */
export async function cancelInvite(
  inviteId: string
): Promise<ActionResult<{ cancelled: boolean }>> {
  try {
    const userId = await requireUserId();

    // Find and remove the invite
    const inviteIndex = mockInvites.findIndex(i => i.id === inviteId);
    if (inviteIndex === -1) {
      return {
        success: false,
        error: 'Invitation not found',
        code: TEAM_ERROR_CODES.MEMBER_NOT_FOUND,
      };
    }

    // Check permission
    const hasAccess = await checkTeamPermission(userId, 'members:delete');
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have permission to cancel invitations',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    mockInvites.splice(inviteIndex, 1);
    
    return {
      success: true,
      data: { cancelled: true },
    };
  } catch (error) {
    console.error('cancelInvite error:', error);
    
    return {
      success: false,
      error: 'Failed to cancel invitation',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get team activity log
 */
export async function getTeamActivity(
  limit: number = 20,
  offset: number = 0
): Promise<ActionResult<TeamActivity[]>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to view team activity',
        code: TEAM_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Check permission
    const hasAccess = await checkTeamPermission(userId, 'settings:read');
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have permission to view team activity',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    // Mock activity data
    const activities: TeamActivity[] = [
      {
        id: 'activity-1',
        teamId: 'team-1',
        action: 'member:invited',
        performedBy: 'user-123',
        performedByName: 'John Owner',
        targetUser: 'new@example.com',
        timestamp: new Date(),
        metadata: { role: 'member' },
      },
    ];
    
    return {
      success: true,
      data: activities.slice(offset, offset + limit),
    };
  } catch (error) {
    console.error('getTeamActivity error:', error);
    
    return {
      success: false,
      error: 'Failed to retrieve team activity',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Update team settings
 */
export async function updateTeamSettings(
  settings: Partial<TeamSettings>
): Promise<ActionResult<TeamSettings>> {
  try {
    const userId = await requireUserId();
    
    // Check permission
    const hasAccess = await checkTeamPermission(userId, 'settings:write');
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have permission to update team settings',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    // Simulate async update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock updated settings
    const updatedSettings: TeamSettings = {
      teamId: 'team-1',
      teamName: settings.teamName || 'My Team',
      allowMemberInvites: settings.allowMemberInvites ?? false,
      requireTwoFactorAuth: settings.requireTwoFactorAuth ?? false,
      defaultRole: settings.defaultRole || 'member',
      autoApproveMembers: settings.autoApproveMembers ?? false,
      notifyOnNewMember: settings.notifyOnNewMember ?? true,
      notifyOnMemberRemoval: settings.notifyOnMemberRemoval ?? true,
    };
    
    return {
      success: true,
      data: updatedSettings,
    };
  } catch (error) {
    console.error('updateTeamSettings error:', error);
    
    return {
      success: false,
      error: 'Failed to update team settings',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Helper function to log team activity
 */
async function logTeamActivity(activity: Omit<TeamActivity, 'id' | 'teamId' | 'timestamp' | 'performedByName'>): Promise<void> {
  try {
    // In a real implementation, this would save to database
  } catch (error) {
    console.error('Failed to log team activity:', error);
  }
}

/**
 * Check if email is valid for team invitation
 */
export async function validateTeamEmail(
  email: string
): Promise<ActionResult<{ valid: boolean; reason?: string }>> {
  try {
    // Validate email format
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      return {
        success: true,
        data: {
          valid: false,
          reason: 'Invalid email format',
        },
      };
    }
    
    // Check if already a member
    const existingMember = mockTeamMembers.find(m => m.email === email);
    if (existingMember) {
      return {
        success: true,
        data: {
          valid: false,
          reason: 'User is already a team member',
        },
      };
    }
    
    // Check if already invited
    const existingInvite = mockInvites.find(i => i.email === email && i.status === 'pending');
    if (existingInvite) {
      return {
        success: true,
        data: {
          valid: false,
          reason: 'User has already been invited',
        },
      };
    }
    
    return {
      success: true,
      data: { valid: true },
    };
  } catch (error) {
    console.error('validateTeamEmail error:', error);
    
    return {
      success: false,
      error: 'Failed to validate email',
      code: TEAM_ERROR_CODES.VALIDATION_FAILED,
    };
  }
}

/**
 * Bulk invite team members
 */
export async function bulkInviteMembers(
  emails: string[],
  role: TeamRole = 'member'
): Promise<ActionResult<{
  successful: string[];
  failed: Array<{ email: string; reason: string }>;
}>> {
  try {
    const userId = await requireUserId();
    
    // Check permission
    const hasAccess = await checkTeamPermission(userId, 'members:write');
    if (!hasAccess) {
      return {
        success: false,
        error: 'You do not have permission to invite team members',
        code: TEAM_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    
    const successful: string[] = [];
    const failed: Array<{ email: string; reason: string }> = [];
    
    for (const email of emails) {
      const validation = await validateTeamEmail(email);
      
      if (validation.success && validation.data.valid) {
        const result = await addTeamMember({ email, role, sendInvite: true });
        
        if (result.success) {
          successful.push(email);
        } else {
          failed.push({ email, reason: result.error });
        }
      } else if (validation.success) {
        failed.push({ email, reason: validation.data.reason || 'Invalid email' });
      } else {
        failed.push({ email, reason: 'Validation failed' });
      }
    }
    
    return {
      success: true,
      data: { successful, failed },
    };
  } catch (error) {
    console.error('bulkInviteMembers error:', error);
    
    return {
      success: false,
      error: 'Failed to invite team members',
      code: TEAM_ERROR_CODES.UPDATE_FAILED,
    };
  }
}
