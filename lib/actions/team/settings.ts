/**
 * Team Management Functions (NileDB Implementation)
 *
 * Teams are now logical groupings within tenants. This module provides
 * functions to manage users within a tenant (agency) including:
 * - Querying team members from user_profiles table
 * - Adding new users via signup/registration
 * - Updating user roles and status
 * - Removing users (soft delete via status change)
 */

'use server';

import { z } from 'zod';
import { ActionResult } from '../core/types';
import { ErrorFactory, withErrorHandling } from '../core/errors';
import { withFullAuth, RateLimits } from '../core/auth';

// Team member interface aligned with NileDB schema
export interface TeamMember {
  userId: string;
  email: string;
  name?: string;
  role: 'owner' | 'admin' | 'manager' | 'user';
  status: 'active' | 'paused' | 'suspended' | 'banned';
  isPenguinmailsStaff: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Validation schemas
const addTeamMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['owner', 'admin', 'manager', 'user']).default('user'),
});

const updateTeamMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['owner', 'admin', 'manager', 'user']).optional(),
  status: z.enum(['active', 'paused', 'suspended', 'banned']).optional(),
  name: z.string().min(1).optional(),
});

/**
 * Get all team members for the current tenant
 * Queries user_profiles table for users in the current tenant
 */
export async function getAllTenantMembers(): Promise<ActionResult<TeamMember[]>> {
  return await withFullAuth(
    {
      rateLimit: {
        action: 'tenant:members:read',
        type: 'user',
        config: RateLimits.GENERAL_READ,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Get current user's tenant from their profile
        // This would use NileDB to query user_profiles table
        const currentUserTenant = await getUserTenant(context.userId!);
        if (!currentUserTenant) {
          return ErrorFactory.notFound('User tenant not found');
        }

        // Query all users in the same tenant
        const members = await queryTenantMembers(currentUserTenant.tenantId);

        return members;
      });
    }
  );
}

/**
 * Add a new member to the tenant
 * This triggers the user registration/signup flow for the tenant
 */
export async function inviteTenantMember(
  memberData: z.infer<typeof addTeamMemberSchema>
): Promise<ActionResult<{ inviteSent: boolean; memberId?: string }>> {
  return await withFullAuth(
    {
      rateLimit: {
        action: 'tenant:members:create',
        type: 'user',
        config: RateLimits.GENERAL_WRITE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Validate input
        const validationResult = addTeamMemberSchema.safeParse(memberData);
        if (!validationResult.success) {
          return ErrorFactory.validation(
            validationResult.error.issues[0]?.message || 'Invalid member data'
          );
        }

        const validatedData = validationResult.data;

        // Get current user's tenant
        const currentUserTenant = await getUserTenant(context.userId!);
        if (!currentUserTenant) {
          return ErrorFactory.notFound('User tenant not found');
        }

        // Check if user with this email already exists globally
        const existingUser = await checkUserExistsByEmail(validatedData.email);
        if (existingUser) {
          // If user exists, check if they're already in this tenant
          const isInTenant = await checkUserInTenant(existingUser.userId, currentUserTenant.tenantId);
          if (isInTenant) {
            return ErrorFactory.conflict('User is already a member of this tenant');
          }

          // User exists but not in this tenant - could add them
          // For now, reject to avoid complexity
          return ErrorFactory.conflict('User account exists but is not in this tenant. Contact support.');
        }

        // Create invitation/signup link for new user
        // This would integrate with your auth system to send invitation
        await createTenantInvitation({
          email: validatedData.email,
          name: validatedData.name,
          role: validatedData.role,
          tenantId: currentUserTenant.tenantId,
          invitedBy: context.userId!,
        });

        return { inviteSent: true };
      });
    }
  );
}

/**
 * Update tenant member information
 * Modifies user profile in the tenant context
 */
export async function updateTenantMember(
  memberData: z.infer<typeof updateTeamMemberSchema>
): Promise<ActionResult<TeamMember>> {
  return await withFullAuth(
    {
      rateLimit: {
        action: 'tenant:members:update',
        type: 'user',
        config: RateLimits.GENERAL_WRITE,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Validate input
        const validationResult = updateTeamMemberSchema.safeParse(memberData);
        if (!validationResult.success) {
          return ErrorFactory.validation(
            validationResult.error.issues[0]?.message || 'Invalid member data'
          );
        }

        const validatedData = validationResult.data;

        // Get current user's tenant
        const currentUserTenant = await getUserTenant(context.userId!);
        if (!currentUserTenant) {
          return ErrorFactory.notFound('User tenant not found');
        }

        // Verify the target user is in the same tenant
        const isInTenant = await checkUserInTenant(validatedData.userId, currentUserTenant.tenantId);
        if (!isInTenant) {
          return ErrorFactory.notFound('Team member not found in this tenant');
        }

        // Cannot modify your own owner status
        if (validatedData.userId === context.userId && validatedData.role === 'owner') {
          return ErrorFactory.validation('Cannot modify your own owner role');
        }

        // Update user profile in NileDB
        const updatedMember = await updateUserInTenant(validatedData, currentUserTenant.tenantId);

        return updatedMember;
      });
    }
  );
}

/**
 * Remove member from tenant (soft delete)
 * Changes user status to prevent access while preserving data
 */
export async function removeTenantMember(
  userId: string,
  permanent: boolean = false
): Promise<ActionResult<{ removed: boolean; permanent: boolean }>> {
  return await withFullAuth(
    {
      rateLimit: {
        action: 'tenant:members:remove',
        type: 'user',
        config: RateLimits.SENSITIVE_ACTION,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Get current user's tenant
        const currentUserTenant = await getUserTenant(context.userId!);
        if (!currentUserTenant) {
          return ErrorFactory.notFound('User tenant not found');
        }

        // Verify the target user is in the tenant
        const isInTenant = await checkUserInTenant(userId, currentUserTenant.tenantId);
        if (!isInTenant) {
          return ErrorFactory.notFound('Team member not found in this tenant');
        }

        // Cannot remove yourself
        if (context.userId === userId) {
          return ErrorFactory.validation('Cannot remove yourself from the tenant');
        }

        // Cannot remove the last owner
        const member = await getTenantMember(userId, currentUserTenant.tenantId);
        if (member?.role === 'owner') {
          const ownerCount = await countTenantOwners(currentUserTenant.tenantId);
          if (ownerCount <= 1) {
            return ErrorFactory.validation('Cannot remove the last owner from the tenant');
          }
        }

        // Soft delete by changing status or permanent removal
        if (permanent) {
          // Permanent removal - would delete from tenant association
          await permanentlyRemoveUserFromTenant(userId, currentUserTenant.tenantId);
          return { removed: true, permanent: true };
        } else {
          // Soft delete - change status
          await updateUserStatusInTenant(userId, currentUserTenant.tenantId, 'suspended');
          return { removed: true, permanent: false };
        }
      });
    }
  );
}

/**
 * Get specific tenant member details
 */
export async function getTenantMemberDetails(userId: string): Promise<ActionResult<TeamMember>> {
  return await withFullAuth(
    {
      rateLimit: {
        action: 'tenant:members:read_single',
        type: 'user',
        config: RateLimits.GENERAL_READ,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Get current user's tenant
        const currentUserTenant = await getUserTenant(context.userId!);
        if (!currentUserTenant) {
          return ErrorFactory.notFound('User tenant not found');
        }

        // Get member details
        const member = await getTenantMember(userId, currentUserTenant.tenantId);
        if (!member) {
          return ErrorFactory.notFound('Team member not found');
        }

        return member;
      });
    }
  );
}

// NileDB Integration Functions (Mock implementations - replace with actual NileDB calls)

/**
 * Get user's tenant information
 */
async function getUserTenant(_userId: string): Promise<{ tenantId: string } | null> {
  // TODO: NileDB query
  // SELECT tenant_id FROM user_profiles WHERE user_id = $1
  return { tenantId: 'tenant-123' }; // Mock
}

/**
 * Query all members in a tenant
 */
async function queryTenantMembers(_tenantId: string): Promise<TeamMember[]> {
  // TODO: NileDB query
  // SELECT u.id, u.email, u.name, up.* FROM users u
  // JOIN user_profiles up ON u.id = up.user_id
  // WHERE up.tenant_id = $1

  return [
    {
      userId: 'user-1',
      email: 'owner@agency.com',
      name: 'Agency Owner',
      role: 'owner',
      status: 'active',
      isPenguinmailsStaff: false,
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date(),
    },
    {
      userId: 'user-2',
      email: 'admin@agency.com',
      name: 'Agency Admin',
      role: 'admin',
      status: 'active',
      isPenguinmailsStaff: false,
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date(Date.now() - 86400000),
    },
  ];
}

/**
 * Check if user exists by email
 */
async function checkUserExistsByEmail(_email: string): Promise<{ userId: string } | null> {
  // TODO: NileDB query
  // SELECT id FROM users WHERE email = $1
  return null; // Mock - user doesn't exist
}

/**
 * Check if user is in tenant
 */
async function checkUserInTenant(_userId: string, _tenantId: string): Promise<boolean> {
  // TODO: NileDB query
  // SELECT COUNT(*) FROM user_profiles WHERE user_id = $1 AND tenant_id = $2
  return true; // Mock
}

/**
 * Create tenant invitation
 */
async function createTenantInvitation(data: {
  email: string;
  name: string;
  role: string;
  tenantId: string;
  invitedBy: string;
}): Promise<{ success: boolean }> {
  // TODO: Implement invitation system
  // This could create a record in an invitations table or send email directly
  console.log('Creating invitation for:', data.email);
  return { success: true };
}

/**
 * Update user in tenant
 */
async function updateUserInTenant(
  updates: z.infer<typeof updateTeamMemberSchema>,
  tenantId: string
): Promise<TeamMember> {
  // TODO: NileDB update
  // UPDATE user_profiles SET ... WHERE user_id = $1 AND tenant_id = $2
  return {
    userId: updates.userId,
    email: 'member@agency.com',
    name: updates.name || 'Updated Member',
    role: (updates.role as any) || 'user',
    status: (updates.status as any) || 'active',
    isPenguinmailsStaff: false,
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
  };
}

/**
 * Get tenant member
 */
async function getTenantMember(userId: string, tenantId: string): Promise<TeamMember | null> {
  // TODO: NileDB query
  return {
    userId,
    email: 'member@agency.com',
    name: 'Team Member',
    role: 'user',
    status: 'active',
    isPenguinmailsStaff: false,
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
  };
}

/**
 * Count tenant owners
 */
async function countTenantOwners(tenantId: string): Promise<number> {
  // TODO: NileDB query
  // SELECT COUNT(*) FROM user_profiles WHERE tenant_id = $1 AND role = 'owner'
  return 1;
}

/**
 * Permanently remove user from tenant
 */
async function permanentlyRemoveUserFromTenant(userId: string, tenantId: string): Promise<void> {
  // TODO: NileDB deletion
  // DELETE FROM user_profiles WHERE user_id = $1 AND tenant_id = $2
  console.log('Permanently removing user from tenant');
}

/**
 * Update user status in tenant
 */
async function updateUserStatusInTenant(
  userId: string,
  tenantId: string,
  status: 'active' | 'paused' | 'suspended' | 'banned'
): Promise<void> {
  // TODO: NileDB update
  // UPDATE user_profiles SET status = $3 WHERE user_id = $1 AND tenant_id = $2
  console.log('Updating user status to:', status);
}
