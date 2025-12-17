import type { TeamPermission, TeamRole } from '../../types/team';

export const TEAM_ERROR_CODES = {
  AUTH_REQUIRED: 'TEAM_AUTH_REQUIRED',
  PERMISSION_DENIED: 'TEAM_PERMISSION_DENIED',
  MEMBER_NOT_FOUND: 'TEAM_MEMBER_NOT_FOUND',
  INVALID_ROLE: 'TEAM_INVALID_ROLE',
  INVALID_EMAIL: 'TEAM_INVALID_EMAIL',
  MEMBER_EXISTS: 'TEAM_MEMBER_EXISTS',
  INVITE_EXISTS: 'TEAM_INVITE_EXISTS',
  OWNER_REQUIRED: 'TEAM_OWNER_REQUIRED',
  CANNOT_REMOVE_OWNER: 'TEAM_CANNOT_REMOVE_OWNER',
  CANNOT_DEMOTE_OWNER: 'TEAM_CANNOT_DEMOTE_OWNER',
  TEAM_LIMIT_REACHED: 'TEAM_LIMIT_REACHED',
  RATE_LIMIT_EXCEEDED: 'TEAM_RATE_LIMIT_EXCEEDED',
  VALIDATION_FAILED: 'TEAM_VALIDATION_FAILED',
  UPDATE_FAILED: 'TEAM_UPDATE_FAILED',
} as const;

export const ROLE_HIERARCHY: Record<TeamRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
  viewer: 0,
};

export const ROLE_PERMISSIONS: Record<TeamRole, TeamPermission[]> = {
  owner: ['all'],
  admin: [
    'members:read',
    'members:write',
    'members:delete',
    'settings:read',
    'settings:write',
    'billing:read',
    'campaigns:read',
    'campaigns:write',
  ],
  member: [
    'members:read',
    'settings:read',
    'campaigns:read',
    'campaigns:write',
  ],
  viewer: [
    'members:read',
    'settings:read',
    'campaigns:read',
  ],
};


