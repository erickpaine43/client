/**
 * Tests for team member management actions
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { ActionContext } from '../../core/types';
import { getTeamMembers, updateTeamMember, removeTeamMember, validateTeamEmail } from '../members';
import { mockTeamMembers, mockInvites } from '../../../mocks/team';
import type { TeamRole } from '../../../../types/team';

// Mock the auth utilities
jest.mock('../../core/auth', () => ({
  withFullAuth: jest.fn((options: unknown, handler: (ctx: ActionContext) => Promise<unknown>) => {
    const ctx: ActionContext = {
      userId: 'test-user-1',
      companyId: 'test-company',
      timestamp: Date.now(),
      requestId: 'test-request-123',
    };
    return handler(ctx);
  }),
  RateLimits: {
    GENERAL_READ: { limit: 100, windowMs: 60000 },
    TEAM_MEMBER_UPDATE: { limit: 50, windowMs: 3600000 },
    TEAM_MEMBER_REMOVE: { limit: 10, windowMs: 3600000 },
  },
}));

// Mock the error handling
jest.mock('../../core/errors', () => ({
  ErrorFactory: {
    unauthorized: jest.fn((message) => ({ success: false, error: { type: 'permission', message } })),
    notFound: jest.fn((resource) => ({ success: false, error: { type: 'not_found', message: `${resource} not found` } })),
    validation: jest.fn((message) => ({ success: false, error: { type: 'validation', message } })),
    conflict: jest.fn((message) => ({ success: false, error: { type: 'conflict', message } })),
  },
  withErrorHandling: jest.fn(async (fn: () => Promise<unknown>) => {
    try {
      const result = await fn();
      // If result is already an ActionResult (has success property), return it as-is
      if (result && typeof result === 'object' && 'success' in result) {
        return result;
      }
      // Otherwise wrap in success response
      return { success: true, data: result };
    } catch (error: unknown) {
      return { success: false, error: { type: 'server', message: (error as Error).message } };
    }
  }),
}));

// Mock permissions
jest.mock('../permissions', () => ({
  checkTeamPermission: jest.fn(() => Promise.resolve(true)) as jest.MockedFunction<() => Promise<boolean>>,
}));

// Mock activity logging
jest.mock('../activity', () => ({
  logTeamActivity: jest.fn(() => Promise.resolve()),
}));

describe('Team Members Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock data
    mockTeamMembers.splice(0, mockTeamMembers.length);
    mockInvites.splice(0, mockInvites.length);
    
    mockTeamMembers.push(
      {
        id: 'member-1',
        userId: 'test-user-1',
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
        userId: 'user-456',
        teamId: 'team-1',
        email: 'admin@example.com',
        name: 'Jane Admin',
        role: 'admin',
        status: 'active',
        joinedAt: new Date('2024-02-01'),
        lastActiveAt: new Date(),
        permissions: ['members:read', 'members:write', 'settings:read', 'settings:write'],
      }
    );
  });

  describe('getTeamMembers', () => {
    it('should return team members successfully', async () => {
      const result = await getTeamMembers();

      expect(result.success).toBe(true);
      expect(result.data?.members).toHaveLength(2);
      expect(result.data?.members[0].email).toBe('owner@example.com');
      expect(result.data?.stats?.totalMembers).toBe(2);
      expect(result.data?.stats?.activeMembers).toBe(2);
    });

    it('should include invites when requested', async () => {
      mockInvites.push({
        id: 'invite-1',
        teamId: 'team-1',
        email: 'pending@example.com',
        role: 'member',
        invitedBy: 'test-user-1',
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
      });

      const result = await getTeamMembers(true);

      expect(result.success).toBe(true);
      expect(result.data?.invites).toHaveLength(1);
      expect(result.data?.stats?.pendingInvites).toBe(1);
    });
  });

  describe('updateTeamMember', () => {
    it('should update team member role successfully', async () => {
      const result = await updateTeamMember('member-2', { role: 'member' });

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe('member');
      expect(mockTeamMembers[1].role).toBe('member');
    });

    it('should update team member status successfully', async () => {
      const result = await updateTeamMember('member-2', { status: 'inactive' });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('inactive');
      expect(mockTeamMembers[1].status).toBe('inactive');
    });

    it('should return error for non-existent member', async () => {
      const result = await updateTeamMember('non-existent', { role: 'member' });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });

    it('should validate input data', async () => {
      const result = await updateTeamMember('member-2', { role: 'invalid-role' as string as TeamRole });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should handle errors', async () => {
      const mockModule = jest.requireMock('../permissions') as { checkTeamPermission: jest.Mock };
      const checkTeamPermissionMock = mockModule.checkTeamPermission;
      const error = new Error('Test error');
      checkTeamPermissionMock.mockImplementationOnce(() => Promise.reject(error));

      const result = await updateTeamMember('member-2', { role: 'member' });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
      expect(result.error?.message).toBe('Test error');
    });
  });

  describe('removeTeamMember', () => {
    it('should remove team member successfully', async () => {
      const result = await removeTeamMember('member-2');

      expect(result.success).toBe(true);
      expect(result.data?.removed).toBe(true);
      expect(mockTeamMembers).toHaveLength(1);
    });

    it('should return error for non-existent member', async () => {
      const result = await removeTeamMember('non-existent');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });

    it('should require ownership transfer when removing owner', async () => {
      const result = await removeTeamMember('member-1'); // Owner

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('conflict');
      expect(result.error?.message).toContain('ownership');
    });

    it('should transfer ownership when specified', async () => {
      const result = await removeTeamMember('member-1', 'member-2');

      expect(result.success).toBe(true);
      expect(mockTeamMembers.find(m => m.id === 'member-2')?.role).toBe('owner');
    });
  });

  describe('validateTeamEmail', () => {
    it('should validate new email successfully', async () => {
      const result = await validateTeamEmail('new@example.com');

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const result = await validateTeamEmail('invalid-email');

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.reason).toContain('Invalid email format');
    });

    it('should reject existing member email', async () => {
      const result = await validateTeamEmail('owner@example.com');

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.reason).toContain('already a team member');
    });

    it('should reject already invited email', async () => {
      mockInvites.push({
        id: 'invite-1',
        teamId: 'team-1',
        email: 'pending@example.com',
        role: 'member',
        invitedBy: 'test-user-1',
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
      });

      const result = await validateTeamEmail('pending@example.com');

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.reason).toContain('already been invited');
    });
  });
});
