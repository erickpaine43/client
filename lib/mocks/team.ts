import type { TeamInvite, TeamMember } from '../../types/team';

// Mock data for team members (replace with actual database calls)
export const mockTeamMembers: TeamMember[] = [
  {
    id: 'member-1',
    userId: 'test-user-1',
    teamId: 'team-1',
    email: 'owner@example.com',
    name: 'John Owner',
    role: 'owner',
    status: 'active',
    avatar: 'https://avatar.vercel.sh/owner.png',
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
    avatar: 'https://avatar.vercel.sh/admin.png',
    joinedAt: new Date('2024-02-01'),
    lastActiveAt: new Date(),
    permissions: ['members:read', 'members:write', 'settings:read', 'settings:write'],
  },
  {
    id: 'member-3',
    userId: 'user-789',
    teamId: 'team-1',
    email: 'member@example.com',
    name: 'Bob Member',
    role: 'member',
    status: 'active',
    avatar: 'https://avatar.vercel.sh/member.png',
    joinedAt: new Date('2024-03-01'),
    lastActiveAt: new Date(),
    permissions: ['members:read', 'settings:read'],
  },
];

// Mock pending invites
export const mockInvites: TeamInvite[] = [
  {
    id: 'invite-1',
    teamId: 'team-1',
    email: 'pending@example.com',
    role: 'member',
    invitedBy: 'user-123',
    invitedAt: new Date('2024-11-01'),
    expiresAt: new Date('2024-12-01'),
    status: 'pending',
  },
];


