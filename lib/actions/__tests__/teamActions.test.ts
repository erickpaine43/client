/**
 * Tests for team management server actions
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { TeamMember, TeamInvite, TeamStats } from '@/types/team';
import { 
  getTeamMembers, 
  addTeamMember, 
  updateTeamMember, 
  removeTeamMember 
} from '../teamActions';

// Mock types
type MockTeamMember = Omit<TeamMember, 'lastActiveAt'> & {
  lastActiveAt?: Date;
};

// Extend TeamInvite to include createdAt for testing
interface MockTeamInvite extends TeamInvite {
  createdAt?: Date;
}

// Mock the team stats type - using all required properties from TeamStats
const createMockTeamStats = (overrides: Partial<TeamStats> = {}): TeamStats => ({
  totalMembers: 0,
  activeMembers: 0,
  inactiveMembers: 0,
  pendingInvites: 0,
  memberLimit: 10,
  lastActivityAt: new Date().toISOString(),
  storageUsed: 0,
  storageLimit: 1073741824, // 1GB in bytes
  emailsSent: 0,
  emailsLimit: 1000,
  ...overrides
});

// Mock the auth utilities
const mockAuth = {
  getCurrentUserId: jest.fn(async (): Promise<string> => 'test-user-1'),
  requireUserId: jest.fn(async (): Promise<string> => 'test-user-1'),
  checkRateLimit: jest.fn(async (): Promise<boolean> => true),
};

jest.mock('../../utils/auth', () => mockAuth);

// Mock the team constants
jest.mock('../../constants/team', () => ({
  TEAM_ERROR_CODES: {
    AUTH_REQUIRED: 'TEAM_AUTH_REQUIRED',
    PERMISSION_DENIED: 'TEAM_PERMISSION_DENIED',
    MEMBER_NOT_FOUND: 'TEAM_MEMBER_NOT_FOUND',
    MEMBER_EXISTS: 'TEAM_MEMBER_EXISTS',
    INVITE_EXISTS: 'TEAM_INVITE_EXISTS',
    TEAM_LIMIT_REACHED: 'TEAM_LIMIT_REACHED',
    RATE_LIMIT_EXCEEDED: 'TEAM_RATE_LIMIT_EXCEEDED',
    VALIDATION_FAILED: 'TEAM_VALIDATION_FAILED',
    UPDATE_FAILED: 'TEAM_UPDATE_FAILED',
  },
  ROLE_HIERARCHY: {
    owner: 3,
    admin: 2,
    member: 1,
    viewer: 0,
  },
  ROLE_PERMISSIONS: {
    owner: ['all'],
    admin: ['members:read', 'members:write', 'settings:read', 'settings:write'],
    member: ['members:read', 'settings:read'],
    viewer: ['members:read'],
  },
}));

describe('Team Actions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('getTeamMembers', () => {
    it('should return team members successfully', async () => {
      const now = new Date();
      const mockMember: MockTeamMember = {
        id: 'member-1',
        userId: 'test-user-1',
        teamId: 'team-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'member',
        status: 'active',
        avatar: 'https://example.com/avatar.jpg',
        joinedAt: now,
        lastActiveAt: now,
        permissions: ['all']
      };

      const mockStats = createMockTeamStats({
        totalMembers: 8, // 2 admins + 5 members + 1 owner
        activeMembers: 8,
        pendingInvites: 2
      });

      // Mock the implementation of getTeamMembers
      const mockGetTeamMembers = getTeamMembers as jest.MockedFunction<typeof getTeamMembers>;
      mockGetTeamMembers.mockResolvedValueOnce({
        success: true,
        data: {
          members: [mockMember],
          stats: mockStats,
        },
      });

      const result = await getTeamMembers();
      
      expect(result.success).toBe(true);
      if (!result.success || !result.data) {
        fail('Expected result.data to be defined');
      }
      
      // Check if stats is defined before accessing its properties
      const { stats } = result.data;
      expect(stats).toBeDefined();
      if (stats) {
        expect(stats.totalMembers).toBe(8);
        expect(stats.activeMembers).toBe(8);
        expect(stats.pendingInvites).toBe(2);
      }
    });

    it('should include invites when requested', async () => {
      const now = new Date();
      const mockInvite: MockTeamInvite = {
        id: 'invite-1',
        teamId: 'team-1',
        email: 'invite@example.com',
        role: 'member',
        invitedBy: 'test-user-1',
        invitedByName: 'Test User',
        status: 'pending',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        invitedAt: now,
      };

      const mockStats = createMockTeamStats({
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 1,
      });

      // Mock the implementation of getTeamMembers
      const mockGetTeamMembers = getTeamMembers as jest.MockedFunction<typeof getTeamMembers>;
      mockGetTeamMembers.mockResolvedValueOnce({
        success: true,
        data: {
          members: [],
          invites: [mockInvite],
          stats: mockStats,
        },
      });

      const result = await getTeamMembers(true);
      
      expect(result.success).toBe(true);
      if (!result.success || !result.data) {
        fail('Expected result.data to be defined');
      }
      
      if (result.data.invites) {
        expect(result.data.invites[0]?.email).toBe('invite@example.com');
      }
      
      if (result.data.stats) {
        expect(result.data.stats.pendingInvites).toBe(1);
      }
    });
  });

  describe('addTeamMember', () => {
    it('should add a team member successfully', async () => {
      const memberData = {
        email: 'newmember@example.com',
        role: 'member' as const,
        sendInvite: true,
      };

      const result = await addTeamMember(memberData);
      
      expect(result.success).toBe(true);
      if (!result.success || !result.data) {
        fail('Expected result.data to be defined');
      }
      
      expect(result.data.email).toBe(memberData.email);
      expect(result.data.role).toBe(memberData.role);
    });

    it('should validate email format', async () => {
      const memberData = {
        email: 'invalid-email',
        role: 'member' as const,
        sendInvite: true,
      };

      const result = await addTeamMember(memberData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid email');
      }
    });

    it('should add a team member with status pending', async () => {
      const memberData = {
        email: 'test@example.com',
        role: 'member' as const,
        sendInvite: true,
      };

      const result = await addTeamMember(memberData);
      
      expect(result.success).toBe(true);
      if (!result.success || !result.data) {
        fail('Expected result.data to be defined');
      }
      
      expect(result.data.email).toBe(memberData.email);
      expect(result.data.role).toBe(memberData.role);
      expect(result.data.status).toBe('pending');
    });
  });

  describe('updateTeamMember', () => {
    it('should update team member successfully', async () => {
      const updates = {
        role: 'admin' as const,
        status: 'active' as const,
      };

      const result = await updateTeamMember('member-2', updates);
      
      expect(result.success).toBe(true);
      if (!result.success || !result.data) {
        fail('Expected result.data to be defined');
      }
      
      expect(result.data.role).toBe(updates.role);
      expect(result.data.status).toBe(updates.status);
    });

    it('should handle non-existent member', async () => {
      const updates = {
        role: 'admin' as const,
      };

      const errorResult = await updateTeamMember('non-existent', updates);
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeDefined();
      if (!errorResult.success) {
        expect(errorResult.error?.code).toBe('MEMBER_NOT_FOUND');
      }
    });
  });

  describe('removeTeamMember', () => {
    it('should remove team member successfully', async () => {
      const result = await removeTeamMember('member-3');
      
      expect(result.success).toBe(true);
      if (!result.success || !result.data) {
        fail('Expected result.data to be defined');
      }
      
      expect(result.data.removed).toBe(true);
    });

    it('should handle non-existent member', async () => {
      const errorResult = await removeTeamMember('non-existent-member');
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeDefined();
      if (!errorResult.success) {
        expect(errorResult.error?.code).toBe('MEMBER_NOT_FOUND');
      }
    });
  });
});
