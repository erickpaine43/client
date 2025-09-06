/**
 * Unit tests for teamActions.ts
 * 
 * Tests role-based permissions, CRUD operations, and error handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  resendInvite,
  cancelInvite,
  getTeamActivity,
  updateTeamSettings,
  validateTeamEmail,
  bulkInviteMembers,
  TEAM_ERROR_CODES,
} from '../teamActions';
import * as authUtils from '../../utils/auth';

// Mock the auth module
jest.mock('../../utils/auth', () => ({
  getCurrentUserId: jest.fn(),
  requireUserId: jest.fn(),
  hasPermission: jest.fn(),
  checkRateLimit: jest.fn(),
}));

describe('Team Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeamMembers', () => {
    it('should return team members for authenticated user with permission', async () => {
      const mockUserId = 'user-123';
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(mockUserId);
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await getTeamMembers(true);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data.members)).toBe(true);
        expect(result.data.members.length).toBeGreaterThan(0);
        expect(result.data.invites).toBeDefined();
        expect(result.data.stats).toBeDefined();
        expect(result.data.stats?.totalMembers).toBeGreaterThan(0);
      }
    });

    it('should return error when user is not authenticated', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);

      const result = await getTeamMembers();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('logged in');
        expect(result.code).toBe(TEAM_ERROR_CODES.AUTH_REQUIRED);
      }
    });

    it('should enforce rate limiting', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(false);

      const result = await getTeamMembers();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Too many requests');
        expect(result.code).toBe(TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    });

    it('should exclude invites when not requested', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await getTeamMembers(false);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.invites).toBeUndefined();
      }
    });

    it('should check permission to view team members', async () => {
      // Mock user without permission
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-no-access');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await getTeamMembers();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('permission');
        expect(result.code).toBe(TEAM_ERROR_CODES.PERMISSION_DENIED);
      }
    });
  });

  describe('addTeamMember', () => {
    it('should add team member with valid data and permission', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const newMember = {
        email: 'newmember@example.com',
        role: 'member' as const,
        name: 'New Member',
        sendInvite: true,
      };

      const result = await addTeamMember(newMember);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        if ('email' in result.data) {
          expect(result.data.email).toBe(newMember.email);
          expect(result.data.role).toBe(newMember.role);
          expect(result.data.status).toBe('pending');
        }
      }
    });

    it('should validate email format', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await addTeamMember({
        email: 'invalid-email',
        role: 'member',
        sendInvite: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid');
        expect(result.code).toBe(TEAM_ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it('should prevent adding duplicate members', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await addTeamMember({
        email: 'admin@example.com', // Existing member
        role: 'member',
        sendInvite: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('already exists');
        expect(result.code).toBe(TEAM_ERROR_CODES.MEMBER_EXISTS);
      }
    });

    it('should prevent duplicate invites', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await addTeamMember({
        email: 'pending@example.com', // Existing invite
        role: 'member',
        sendInvite: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('invitation has already been sent');
        expect(result.code).toBe(TEAM_ERROR_CODES.INVITE_EXISTS);
      }
    });

    it('should check role hierarchy when assigning roles', async () => {
      // Mock as admin trying to add another admin
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-456'); // Admin user
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await addTeamMember({
        email: 'newadmin@example.com',
        role: 'admin',
        sendInvite: true,
      });

      // Admin can add another admin (same level)
      expect(result.success).toBe(true);
    });

    it('should prevent assigning higher roles than own', async () => {
      // Mock as member trying to add an admin
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-789'); // Member user
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await addTeamMember({
        email: 'newadmin@example.com',
        role: 'admin',
        sendInvite: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('cannot assign a role higher');
        expect(result.code).toBe(TEAM_ERROR_CODES.PERMISSION_DENIED);
      }
    });

    it('should enforce rate limiting for sensitive operation', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(false);

      const result = await addTeamMember({
        email: 'test@example.com',
        role: 'member',
        sendInvite: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Too many attempts');
        expect(result.code).toBe(TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    });
  });

  describe('updateTeamMember', () => {
    it('should update team member with valid data and permission', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const updates = {
        role: 'admin' as const,
        status: 'active' as const,
      };

      const result = await updateTeamMember('member-3', updates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('admin');
        expect(result.data.status).toBe('active');
      }
    });

    it('should prevent changing owner role', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-456');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await updateTeamMember('member-1', { role: 'admin' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Cannot change the role of the team owner');
        expect(result.code).toBe(TEAM_ERROR_CODES.CANNOT_DEMOTE_OWNER);
      }
    });

    it('should return error for non-existent member', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await updateTeamMember('non-existent', { role: 'admin' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
        expect(result.code).toBe(TEAM_ERROR_CODES.MEMBER_NOT_FOUND);
      }
    });

    it('should validate input data', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await updateTeamMember('member-3', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: 'invalid' as any,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(TEAM_ERROR_CODES.VALIDATION_FAILED);
      }
    });

    it('should check permission hierarchy for role updates', async () => {
      // Admin trying to promote member to owner
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-456');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await updateTeamMember('member-3', { role: 'owner' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('cannot assign a role higher');
        expect(result.code).toBe(TEAM_ERROR_CODES.PERMISSION_DENIED);
      }
    });

    it('should update permissions based on new role', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await updateTeamMember('member-3', { role: 'viewer' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('viewer');
        expect(result.data.permissions).toContain('members:read');
        expect(result.data.permissions).not.toContain('members:write');
      }
    });
  });

  describe('removeTeamMember', () => {
    it('should remove team member with permission', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await removeTeamMember('member-3');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.removed).toBe(true);
      }
    });

    it('should prevent removing owner without transfer', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await removeTeamMember('member-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Cannot remove team owner');
        expect(result.code).toBe(TEAM_ERROR_CODES.CANNOT_REMOVE_OWNER);
      }
    });

    it('should allow removing owner with ownership transfer', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await removeTeamMember('member-1', 'member-2');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.removed).toBe(true);
      }
    });

    it('should return error for non-existent member', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await removeTeamMember('non-existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
        expect(result.code).toBe(TEAM_ERROR_CODES.MEMBER_NOT_FOUND);
      }
    });

    it('should check permission to remove members', async () => {
      // Member trying to remove another member
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-789');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const result = await removeTeamMember('member-2');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('permission');
        expect(result.code).toBe(TEAM_ERROR_CODES.PERMISSION_DENIED);
      }
    });

    it('should enforce rate limiting for sensitive operation', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(false);

      const result = await removeTeamMember('member-3');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Too many removal attempts');
        expect(result.code).toBe(TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    });
  });

  describe('resendInvite', () => {
    it('should resend invite with permission', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await resendInvite('invite-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expiresAt).toBeDefined();
        expect(result.data.expiresAt > new Date()).toBe(true);
      }
    });

    it('should return error for non-existent invite', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await resendInvite('non-existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
        expect(result.code).toBe(TEAM_ERROR_CODES.MEMBER_NOT_FOUND);
      }
    });

    it('should check permission to manage invites', async () => {
      // Viewer trying to resend invite
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-viewer');

      const result = await resendInvite('invite-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('permission');
        expect(result.code).toBe(TEAM_ERROR_CODES.PERMISSION_DENIED);
      }
    });
  });

  describe('cancelInvite', () => {
    it('should cancel invite with permission', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await cancelInvite('invite-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cancelled).toBe(true);
      }
    });

    it('should return error for non-existent invite', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const result = await cancelInvite('non-existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
        expect(result.code).toBe(TEAM_ERROR_CODES.MEMBER_NOT_FOUND);
      }
    });
  });

  describe('getTeamActivity', () => {
    it('should return team activity with permission', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      const result = await getTeamActivity(10, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        if (result.data.length > 0) {
          expect(result.data[0].action).toBeDefined();
          expect(result.data[0].performedBy).toBeDefined();
          expect(result.data[0].timestamp).toBeDefined();
        }
      }
    });

    it('should validate pagination parameters', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      const result = await getTeamActivity(5, 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeLessThanOrEqual(5);
      }
    });

    it('should require authentication', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);

      const result = await getTeamActivity();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(TEAM_ERROR_CODES.AUTH_REQUIRED);
      }
    });
  });

  describe('updateTeamSettings', () => {
    it('should update team settings with permission', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');

      const settings = {
        teamName: 'New Team Name',
        allowMemberInvites: true,
        requireTwoFactorAuth: true,
        defaultRole: 'viewer' as const,
      };

      const result = await updateTeamSettings(settings);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.teamName).toBe('New Team Name');
        expect(result.data.allowMemberInvites).toBe(true);
        expect(result.data.requireTwoFactorAuth).toBe(true);
        expect(result.data.defaultRole).toBe('viewer');
      }
    });

    it('should check permission to update settings', async () => {
      // Member trying to update settings
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-789');

      const result = await updateTeamSettings({ teamName: 'New Name' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('permission');
        expect(result.code).toBe(TEAM_ERROR_CODES.PERMISSION_DENIED);
      }
    });
  });

  describe('validateTeamEmail', () => {
    it('should validate valid email', async () => {
      const result = await validateTeamEmail('valid@example.com');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(true);
      }
    });

    it('should reject invalid email format', async () => {
      const result = await validateTeamEmail('invalid-email');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.reason).toContain('Invalid email format');
      }
    });

    it('should reject existing member email', async () => {
      const result = await validateTeamEmail('admin@example.com');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.reason).toContain('already a team member');
      }
    });

    it('should reject already invited email', async () => {
      const result = await validateTeamEmail('pending@example.com');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.valid).toBe(false);
        expect(result.data.reason).toContain('already been invited');
      }
    });
  });

  describe('bulkInviteMembers', () => {
    it('should bulk invite valid emails', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const emails = [
        'valid1@example.com',
        'valid2@example.com',
        'invalid-email',
        'admin@example.com', // Existing member
      ];

      const result = await bulkInviteMembers(emails, 'member');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.successful.length).toBe(2);
        expect(result.data.failed.length).toBe(2);
        expect(result.data.successful).toContain('valid1@example.com');
        expect(result.data.successful).toContain('valid2@example.com');
        expect(result.data.failed.find(f => f.email === 'invalid-email')).toBeDefined();
        expect(result.data.failed.find(f => f.email === 'admin@example.com')).toBeDefined();
      }
    });

    it('should check permission for bulk invites', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-viewer');

      const result = await bulkInviteMembers(['test@example.com'], 'member');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('permission');
        expect(result.code).toBe(TEAM_ERROR_CODES.PERMISSION_DENIED);
      }
    });
  });

  describe('Role-based Permission Tests', () => {
    describe('Owner permissions', () => {
      it('should allow owner to perform all actions', async () => {
        jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123'); // Owner
        jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
        jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

        // Should be able to add any role
        let result = await addTeamMember({
          email: 'newowner@example.com',
          role: 'owner',
          sendInvite: true,
        });
        expect(result.success).toBe(true);

        // Should be able to update any member
        result = await updateTeamMember('member-2', { role: 'member' });
        expect(result.success).toBe(true);

        // Should be able to remove members
        result = await removeTeamMember('member-3');
        expect(result.success).toBe(true);

        // Should be able to update settings
        result = await updateTeamSettings({ teamName: 'Owner Team' });
        expect(result.success).toBe(true);
      });
    });

    describe('Admin permissions', () => {
      it('should allow admin limited management actions', async () => {
        jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-456'); // Admin
        jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-456');
        jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

        // Should be able to add members and viewers
        let result = await addTeamMember({
          email: 'newmember@example.com',
          role: 'member',
          sendInvite: true,
        });
        expect(result.success).toBe(true);

        // Should NOT be able to add owner
        result = await addTeamMember({
          email: 'newowner@example.com',
          role: 'owner',
          sendInvite: true,
        });
        expect(result.success).toBe(false);

        // Should be able to update members with lower role
        result = await updateTeamMember('member-3', { status: 'inactive' });
        expect(result.success).toBe(true);

        // Should NOT be able to update owner
        result = await updateTeamMember('member-1', { status: 'inactive' });
        expect(result.success).toBe(false);
      });
    });

    describe('Member permissions', () => {
      it('should restrict member to read-only actions', async () => {
        jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-789'); // Member
        jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-789');
        jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

        // Should be able to view team members
        let result = await getTeamMembers();
        expect(result.success).toBe(true);

        // Should NOT be able to add members
        result = await addTeamMember({
          email: 'new@example.com',
          role: 'viewer',
          sendInvite: true,
        });
        expect(result.success).toBe(false);

        // Should NOT be able to update members
        result = await updateTeamMember('member-2', { status: 'inactive' });
        expect(result.success).toBe(false);

        // Should NOT be able to remove members
        result = await removeTeamMember('member-2');
        expect(result.success).toBe(false);

        // Should NOT be able to update settings
        result = await updateTeamSettings({ teamName: 'Member Team' });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockRejectedValue(new Error('Database error'));

      const result = await addTeamMember({
        email: 'test@example.com',
        role: 'member',
        sendInvite: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(TEAM_ERROR_CODES.UPDATE_FAILED);
      }
    });

    it('should provide specific error codes for different scenarios', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue(null);
      
      // Auth required
      let result = await getTeamMembers();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(TEAM_ERROR_CODES.AUTH_REQUIRED);
      }

      // Permission denied
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-789');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);
      
      result = await removeTeamMember('member-2');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(TEAM_ERROR_CODES.PERMISSION_DENIED);
      }

      // Member not found - but permission is checked first for non-owner
      // So it will return PERMISSION_DENIED rather than MEMBER_NOT_FOUND
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      
      result = await updateTeamMember('non-existent', { role: 'admin' });
      expect(result.success).toBe(false);
      if (!result.success) {
        // The permission check happens before member existence check
        // Since user-123 (owner) has permission, it will check member existence
        expect(result.code).toBe(TEAM_ERROR_CODES.MEMBER_NOT_FOUND);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce different rate limits for different operations', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');

      // Mock rate limit exceeded
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(false);

      // Test add member rate limit
      let result = await addTeamMember({
        email: 'test@example.com',
        role: 'member',
        sendInvite: true,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }

      // Test update member rate limit
      result = await updateTeamMember('member-3', { role: 'admin' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }

      // Test remove member rate limit
      result = await removeTeamMember('member-3');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(TEAM_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      }
    });
  });
});
