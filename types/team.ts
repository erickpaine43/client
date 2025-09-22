/**
 * Team-related type definitions
 */

// Team roles with hierarchy
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

// Team member status
export type TeamMemberStatus = 'active' | 'inactive' | 'pending';

// Team permissions
export type TeamPermission = 
  | 'all'
  | 'members:read'
  | 'members:write'
  | 'members:delete'
  | 'settings:read'
  | 'settings:write'
  | 'billing:read'
  | 'billing:write'
  | 'campaigns:read'
  | 'campaigns:write'
  | 'domains:read'
  | 'domains:write';

// Team member
export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  email: string;
  name: string;
  role: TeamRole;
  status: TeamMemberStatus;
  avatar?: string;
  joinedAt: Date;
  lastActiveAt?: Date;
  permissions: TeamPermission[];
  twoFactorEnabled?: boolean;
  metadata?: Record<string, unknown>;
}

// Team invite
export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  invitedByName?: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token?: string;
  metadata?: Record<string, unknown>;
}

// Team activity log
export interface TeamActivity {
  id: string;
  teamId: string;
  action: 
    | 'member:invited'
    | 'member:joined'
    | 'member:updated'
    | 'member:removed'
    | 'member:left'
    | 'role:changed'
    | 'settings:updated'
    | 'billing:updated'
    | 'ownership:transferred';
  performedBy: string;
  performedByName?: string;
  targetUser?: string;
  targetUserName?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Team settings
export interface TeamSettings {
  teamId: string;
  teamName: string;
  teamSlug?: string;
  teamLogo?: string;
  allowMemberInvites: boolean;
  requireTwoFactorAuth: boolean;
  defaultRole: TeamRole;
  autoApproveMembers: boolean;
  notifyOnNewMember: boolean;
  notifyOnMemberRemoval: boolean;
  ssoEnabled?: boolean;
  ssoProvider?: 'google' | 'microsoft' | 'okta' | 'saml';
  allowedEmailDomains?: string[];
  ipWhitelist?: string[];
  sessionTimeout?: number; // in minutes
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays?: number;
  };
}

// Team
export interface Team {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  billingEmail?: string;
  memberCount: number;
  memberLimit: number;
  settings: TeamSettings;
  metadata?: Record<string, unknown>;
}

// Team stats
export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  pendingInvites: number;
  memberLimit: number;
  lastActivityAt: string;
  storageUsed: number;
  storageLimit: number;
  emailsSent: number;
  emailsLimit: number;
}

// Form types for team operations
export interface InviteTeamMemberForm {
  email: string;
  role: TeamRole;
  sendInvite?: boolean;
  message?: string;
}

export interface UpdateTeamMemberForm {
  role?: TeamRole;
  status?: TeamMemberStatus;
  permissions?: TeamPermission[];
}

export interface UpdateTeamSettingsForm {
  teamName?: string;
  teamLogo?: string;
  allowMemberInvites?: boolean;
  requireTwoFactorAuth?: boolean;
  defaultRole?: TeamRole;
  autoApproveMembers?: boolean;
  notifyOnNewMember?: boolean;
  notifyOnMemberRemoval?: boolean;
}

// Bulk operations
export interface BulkInviteResult {
  successful: string[];
  failed: Array<{
    email: string;
    reason: string;
  }>;
}

export interface BulkRemoveResult {
  successful: string[];
  failed: Array<{
    memberId: string;
    reason: string;
  }>;
}

// API response types
export interface TeamMembersResponse {
  members: TeamMember[];
  invites?: TeamInvite[];
  stats?: TeamStats;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface TeamActivityResponse {
  activities: TeamActivity[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
