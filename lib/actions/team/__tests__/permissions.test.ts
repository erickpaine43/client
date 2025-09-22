/**
 * Tests for team permission management
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  checkTeamPermission,
  canAssignRole,
  canModifyMember,
  getEffectivePermissions,
  roleHasPermission,
  validateRoleChange,
  hasMinimumOwners,
  isTeamOwner,
  isTeamAdminOrHigher,
} from '../permissions';
import { mockTeamMembers } from '../../../mocks/team';

describe('Team Permissions', () => {
  beforeEach(() => {
    // Reset mock data
    mockTeamMembers.length = 0;
    mockTeamMembers.push(
      {
        id: 'member-1',
        userId: 'owner-user',
        teamId: 'team-1',
        email: 'owner@example.com',
        name: 'John Owner',
        role: 'owner',
        status: 'active',
        joinedAt: new Date('2024-01-01'),
        lastActiveAt: new Date(),
        permissions: ['all'],
      },
      {
        id: 'member-2',
        userId: 'admin-user',
        teamId: 'team-1',
        email: 'admin@example.com',
        name: 'Jane Admin',
        role: 'admin',
        status: 'active',
        joinedAt: new Date('2024-02-01'),
        lastActiveAt: new Date(),
        permissions: ['members:read', 'members:write', 'settings:read', 'settings:write'],
      },
      {
        id: 'member-3',
        userId: 'member-user',
        teamId: 'team-1',
        email: 'member@example.com',
        name: 'Bob Member',
        role: 'member',
        status: 'active',
        joinedAt: new Date('2024-03-01'),
        lastActiveAt: new Date(),
        permissions: ['members:read', 'settings:read'],
      },
      {
        id: 'member-4',
        userId: 'viewer-user',
        teamId: 'team-1',
        email: 'viewer@example.com',
        name: 'Alice Viewer',
        role: 'viewer',
        status: 'active',
        joinedAt: new Date('2024-04-01'),
        lastActiveAt: new Date(),
        permissions: ['members:read', 'settings:read'],
      }
    );
  });

  describe('checkTeamPermission', () => {
    it('should allow owner all permissions', async () => {
      const result = await checkTeamPermission('owner-user', 'members:write');
      expect(result).toBe(true);
    });

    it('should allow admin specific permissions', async () => {
      const result = await checkTeamPermission('admin-user', 'members:write');
      expect(result).toBe(true);
    });

    it('should deny admin permissions they do not have', async () => {
      const result = await checkTeamPermission('admin-user', 'billing:write');
      expect(result).toBe(false);
    });

    it('should allow member read permissions', async () => {
      const result = await checkTeamPermission('member-user', 'members:read');
      expect(result).toBe(true);
    });

    it('should deny member write permissions', async () => {
      const result = await checkTeamPermission('member-user', 'members:write');
      expect(result).toBe(false);
    });

    it('should deny permissions for non-existent user', async () => {
      const result = await checkTeamPermission('non-existent', 'members:read');
      expect(result).toBe(false);
    });

    it('should check role hierarchy for target member operations', async () => {
      // Admin trying to modify member (should work)
      const result1 = await checkTeamPermission('admin-user', 'members:write', 'member-3');
      expect(result1).toBe(true);

      // Member trying to modify admin (should fail due to hierarchy)
      const result2 = await checkTeamPermission('member-user', 'members:write', 'member-2');
      expect(result2).toBe(false);
    });
  });

  describe('canAssignRole', () => {
    it('should allow owner to assign any role', async () => {
      const result = await canAssignRole('owner-user', 'admin');
      expect(result).toBe(true);
    });

    it('should allow admin to assign member and viewer roles', async () => {
      const result1 = await canAssignRole('admin-user', 'member');
      expect(result1).toBe(true);

      const result2 = await canAssignRole('admin-user', 'viewer');
      expect(result2).toBe(true);
    });

    it('should not allow admin to assign owner role', async () => {
      const result = await canAssignRole('admin-user', 'owner');
      expect(result).toBe(false);
    });

    it('should not allow member to assign admin role', async () => {
      const result = await canAssignRole('member-user', 'admin');
      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const result = await canAssignRole('non-existent', 'member');
      expect(result).toBe(false);
    });
  });

  describe('canModifyMember', () => {
    it('should allow owner to modify anyone', async () => {
      const result = await canModifyMember('owner-user', 'member-2');
      expect(result).toBe(true);
    });

    it('should allow admin to modify members and viewers', async () => {
      const result1 = await canModifyMember('admin-user', 'member-3');
      expect(result1).toBe(true);

      const result2 = await canModifyMember('admin-user', 'member-4');
      expect(result2).toBe(true);
    });

    it('should not allow admin to modify owner', async () => {
      const result = await canModifyMember('admin-user', 'member-1');
      expect(result).toBe(false);
    });

    it('should not allow member to modify admin', async () => {
      const result = await canModifyMember('member-user', 'member-2');
      expect(result).toBe(false);
    });

    it('should return false for non-existent users', async () => {
      const result1 = await canModifyMember('non-existent', 'member-1');
      expect(result1).toBe(false);

      const result2 = await canModifyMember('owner-user', 'non-existent');
      expect(result2).toBe(false);
    });
  });

  describe('getEffectivePermissions', () => {
    it('should return correct permissions for owner', () => {
      const permissions = getEffectivePermissions('owner');
      expect(permissions).toEqual(['all']);
    });

    it('should return correct permissions for admin', () => {
      const permissions = getEffectivePermissions('admin');
      expect(permissions).toContain('members:read');
      expect(permissions).toContain('members:write');
      expect(permissions).toContain('settings:read');
      expect(permissions).toContain('settings:write');
    });

    it('should return correct permissions for member', () => {
      const permissions = getEffectivePermissions('member');
      expect(permissions).toContain('members:read');
      expect(permissions).toContain('settings:read');
      expect(permissions).not.toContain('members:write');
    });

    it('should return correct permissions for viewer', () => {
      const permissions = getEffectivePermissions('viewer');
      expect(permissions).toContain('members:read');
      expect(permissions).toContain('settings:read');
      expect(permissions).not.toContain('members:write');
    });
  });

  describe('roleHasPermission', () => {
    it('should return true for owner with any permission', () => {
      const result = roleHasPermission('owner', 'members:write');
      expect(result).toBe(true);
    });

    it('should return true for admin with write permissions', () => {
      const result = roleHasPermission('admin', 'members:write');
      expect(result).toBe(true);
    });

    it('should return false for member with write permissions', () => {
      const result = roleHasPermission('member', 'members:write');
      expect(result).toBe(false);
    });

    it('should return true for member with read permissions', () => {
      const result = roleHasPermission('member', 'members:read');
      expect(result).toBe(true);
    });
  });

  describe('validateRoleChange', () => {
    it('should allow owner to change any role to any role', () => {
      const result = validateRoleChange('owner', 'admin', 'member');
      expect(result.valid).toBe(true);
    });

    it('should not allow changing owner role by non-owner', () => {
      const result = validateRoleChange('admin', 'owner', 'admin');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('owner');
    });

    it('should not allow assigning higher role than current user', () => {
      const result = validateRoleChange('member', 'viewer', 'admin');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('higher than your own');
    });

    it('should not allow modifying someone with equal or higher role', () => {
      const result = validateRoleChange('admin', 'admin', 'member');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('equal or higher role');
    });

    it('should allow valid role changes', () => {
      const result = validateRoleChange('admin', 'member', 'viewer');
      expect(result.valid).toBe(true);
    });
  });

  describe('hasMinimumOwners', () => {
    it('should return true when there is at least one owner', () => {
      const result = hasMinimumOwners();
      expect(result).toBe(true);
    });

    it('should return false when excluding the only owner', () => {
      const result = hasMinimumOwners('member-1');
      expect(result).toBe(false);
    });

    it('should return true when there are multiple owners', () => {
      // Add another owner
      mockTeamMembers.push({
        id: 'member-5',
        userId: 'owner-user-2',
        teamId: 'team-1',
        email: 'owner2@example.com',
        name: 'Second Owner',
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        permissions: ['all'],
      });

      const result = hasMinimumOwners('member-1');
      expect(result).toBe(true);
    });
  });

  describe('isTeamOwner', () => {
    it('should return true for owner user', () => {
      const result = isTeamOwner('owner-user');
      expect(result).toBe(true);
    });

    it('should return false for non-owner user', () => {
      const result = isTeamOwner('admin-user');
      expect(result).toBe(false);
    });

    it('should return false for non-existent user', () => {
      const result = isTeamOwner('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('isTeamAdminOrHigher', () => {
    it('should return true for owner', () => {
      const result = isTeamAdminOrHigher('owner-user');
      expect(result).toBe(true);
    });

    it('should return true for admin', () => {
      const result = isTeamAdminOrHigher('admin-user');
      expect(result).toBe(true);
    });

    it('should return false for member', () => {
      const result = isTeamAdminOrHigher('member-user');
      expect(result).toBe(false);
    });

    it('should return false for viewer', () => {
      const result = isTeamAdminOrHigher('viewer-user');
      expect(result).toBe(false);
    });

    it('should return false for non-existent user', () => {
      const result = isTeamAdminOrHigher('non-existent');
      expect(result).toBe(false);
    });
  });
});
