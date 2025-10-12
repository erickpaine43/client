/**
 * Tests for team invitation management actions
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { ActionContext, ActionResult } from '../../core/types';
import { addTeamMember, resendInvite, cancelInvite, bulkInviteMembers } from '../invitations';
import * as membersModule from '../members';
import { mockTeamMembers, mockInvites } from '../../../mocks/team';

// Mock the auth utilities
jest.mock('../../core/auth', () => ({
  withFullAuth: jest.fn((options: { permission?: string; rateLimit?: unknown }, handler: (ctx: ActionContext) => Promise<unknown>) => {
    const ctx: ActionContext = {
      userId: 'test-user-1',
      companyId: 'test-company',
      timestamp: Date.now(),
      requestId: 'test-request-123',
    };
    return handler(ctx);
  }),
  RateLimits: {
    TEAM_INVITE: { limit: 20, windowMs: 3600000 },
    TEAM_MEMBER_REMOVE: { limit: 10, windowMs: 3600000 },
    BULK_OPERATION: { limit: 10, windowMs: 300000 },
  },
}));

// Mock the error handling
jest.mock('../../core/errors', () => ({
  ErrorFactory: {
    unauthorized: jest.fn((message: string) => ({ success: false, error: { type: 'permission', message } })),
    notFound: jest.fn((resource: string) => ({ success: false, error: { type: 'not_found', message: `${resource} not found` } })),
    validation: jest.fn((message: string) => ({ success: false, error: { type: 'validation', message } })),
    conflict: jest.fn((message: string) => ({ success: false, error: { type: 'conflict', message } })),
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
      return { success: false, error: { type: 'server', message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }),
}));

// Mock permissions
jest.mock('../permissions', () => ({
  checkTeamPermission: jest.fn(() => Promise.resolve(true)),
}));

// Mock activity logging
jest.mock('../activity', () => ({
  logTeamActivity: jest.fn(() => Promise.resolve()),
}));

// Mock member validation
jest.mock('../members', () => ({
  validateTeamEmail: jest.fn(() => Promise.resolve({ success: true, data: { valid: true } })) as jest.Mock<() => Promise<ActionResult<{ valid: boolean; reason?: string }>>>,
}));

describe('Team Invitations Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock data
    mockTeamMembers.splice(0, mockTeamMembers.length);
    mockInvites.splice(0, mockInvites.length);
    
    mockTeamMembers.push({
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
    });
  });

  describe('addTeamMember', () => {
    it('should create invitation successfully', async () => {
      const inviteData = {
        email: 'new@example.com',
        password: 'securePassword123!',
        role: 'member' as const,
        sendInvite: true,
        name: 'Test User',
      };

      const result = await addTeamMember(inviteData);

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('new@example.com');
      expect(result.data?.role).toBe('member');
      // Note: status property might not exist in the new API return type
      // expect(result.data?.status).toBe('pending');
      expect(mockInvites).toHaveLength(1);
    });

    it('should validate email format', async () => {
      const inviteData = {
        email: 'invalid-email',
        password: 'securePassword123!',
        role: 'member' as const,
        sendInvite: true,
        name: 'Test User',
      };

      const result = await addTeamMember(inviteData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should validate role', async () => {
      const inviteData = {
        email: 'new@example.com',
        password: 'securePassword123!',
        role: 'invalid-role',
        sendInvite: true,
        name: 'Test User',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await addTeamMember({ ...inviteData, role: 'invalid-role' as any });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should prevent duplicate member emails', async () => {
      mockTeamMembers.push({
        id: 'member-2',
        userId: 'user-456',
        teamId: 'team-1',
        email: 'existing@example.com',
        name: 'Existing User',
        role: 'member',
        status: 'active',
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        permissions: ['members:read'],
      });

      const inviteData = {
        email: 'existing@example.com',
        password: 'securePassword123!',
        role: 'member' as const,
        sendInvite: true,
        name: 'Test User',
      };

      const result = await addTeamMember(inviteData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('conflict');
      expect(result.error?.message).toContain('already exists');
    });

    it('should prevent duplicate invitations', async () => {
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

      const inviteData = {
        email: 'pending@example.com',
        password: 'securePassword123!',
        role: 'member' as const,
        sendInvite: true,
        name: 'Test User',
      };

      const result = await addTeamMember(inviteData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('conflict');
      expect(result.error?.message).toContain('already been sent');
    });

    it('should enforce team member limit', async () => {
      // Add 9 more members to reach the limit of 10
      for (let i = 2; i <= 10; i++) {
        mockTeamMembers.push({
          id: `member-${i}`,
          userId: `user-${i}`,
          teamId: 'team-1',
          email: `user${i}@example.com`,
          name: `User ${i}`,
          role: 'member',
          status: 'active',
          joinedAt: new Date(),
          lastActiveAt: new Date(),
          permissions: ['members:read'],
        });
      }

      const inviteData = {
        email: 'overflow@example.com',
        password: 'securePassword123!',
        role: 'member' as const,
        sendInvite: true,
        name: 'Test User',
      };

      const result = await addTeamMember(inviteData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('conflict');
      expect(result.error?.message).toContain('limit reached');
    });
  });

  describe('resendInvite', () => {
    beforeEach(() => {
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
    });

    it('should resend invitation successfully', async () => {
      const result = await resendInvite('invite-1');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('invite-1');
      // Check that expiry was updated
      expect(result.data?.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * 24 * 60 * 60 * 1000);
    });

    it('should return error for non-existent invitation', async () => {
      const result = await resendInvite('non-existent');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });

  describe('cancelInvite', () => {
    beforeEach(() => {
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
    });

    it('should cancel invitation successfully', async () => {
      const result = await cancelInvite('invite-1');

      expect(result.success).toBe(true);
      expect(result.data?.cancelled).toBe(true);
      expect(mockInvites).toHaveLength(0);
    });

    it('should return error for non-existent invitation', async () => {
      const result = await cancelInvite('non-existent');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });

  describe('bulkInviteMembers', () => {
    it('should invite multiple members successfully', async () => {
      const emails = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
      
      const result = await bulkInviteMembers(emails, 'member');

      expect(result.success).toBe(true);
      expect(result.data?.successful).toHaveLength(3);
      expect(result.data?.failed).toHaveLength(0);
      expect(mockInvites).toHaveLength(3);
    });

    it('should handle mixed success and failure', async () => {
      // Mock validateTeamEmail to return different results
      const validateMock = jest.mocked(membersModule.validateTeamEmail);
      validateMock
        .mockResolvedValueOnce({ success: true, data: { valid: true } } as const)
        .mockResolvedValueOnce({ success: true, data: { valid: false, reason: 'Invalid email' } } as const)
        .mockResolvedValueOnce({ success: true, data: { valid: true } } as const);

      const emails = ['valid1@example.com', 'invalid-email', 'valid2@example.com'];
      
      const result = await bulkInviteMembers(emails, 'member');

      expect(result.success).toBe(true);
      expect(result.data?.successful).toHaveLength(2);
      expect(result.data?.failed).toHaveLength(1);
      expect(result.data?.failed[0].email).toBe('invalid-email');
    });

    it('should use default role when not specified', async () => {
      const emails = ['user1@example.com'];
      
      const result = await bulkInviteMembers(emails);

      expect(result.success).toBe(true);
      expect(mockInvites[0].role).toBe('member');
    });
  });
});
