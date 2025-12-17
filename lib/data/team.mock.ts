import type { TeamMember, TeamPermission } from "../../types/team";

// Nile User Interface based on API docs
export interface NileUser {
  id: string;
  email: string;
  name?: string;
  familyName?: string;
  givenName?: string;
  picture?: string;
  created: string;
  updated?: string;
  emailVerified?: boolean;
  tenants: { id: string }[];
}

// Extended Team Member Type with additional fields
export interface ExtendedTeamMember extends TeamMember {
  joinedDate: string;
  department?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneNumber?: string;
  location?: string;
  bio?: string;
}

// Team Role Definition Types
export interface TeamRoleDefinition {
  id: string;
  name: TeamMember["role"];
  description: string;
  permissions: TeamPermission[];
  level: number; // For hierarchy
  color: string; // For UI display
}

// Permission Definition Types (for UI display)
export interface TeamPermissionDefinition {
  id: string;
  name: string;
  category: "campaigns" | "domains" | "billing" | "team" | "settings" | "analytics";
  description: string;
}

// Team Activity Types (local definition for mock data)
export interface MockTeamActivity {
  id: string;
  memberId: string;
  memberName: string;
  action: string;
  target?: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

// Team Invitation Types (local definition for mock data)
export interface MockTeamInvitation {
  id: string;
  email: string;
  role: TeamMember["role"];
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  token?: string;
}

// Permission definitions
export const permissions: Record<string, TeamPermissionDefinition> = {
  // Campaign permissions
  viewCampaigns: {
    id: "perm-1",
    name: "View Campaigns",
    category: "campaigns",
    description: "Can view all campaigns and their details",
  },
  createCampaigns: {
    id: "perm-2",
    name: "Create Campaigns",
    category: "campaigns",
    description: "Can create new email campaigns",
  },
  editCampaigns: {
    id: "perm-3",
    name: "Edit Campaigns",
    category: "campaigns",
    description: "Can edit existing campaigns",
  },
  deleteCampaigns: {
    id: "perm-4",
    name: "Delete Campaigns",
    category: "campaigns",
    description: "Can delete campaigns",
  },
  
  // Domain permissions
  viewDomains: {
    id: "perm-5",
    name: "View Domains",
    category: "domains",
    description: "Can view domain configurations",
  },
  manageDomains: {
    id: "perm-6",
    name: "Manage Domains",
    category: "domains",
    description: "Can add, edit, and remove domains",
  },
  
  // Billing permissions
  viewBilling: {
    id: "perm-7",
    name: "View Billing",
    category: "billing",
    description: "Can view billing information and invoices",
  },
  manageBilling: {
    id: "perm-8",
    name: "Manage Billing",
    category: "billing",
    description: "Can update payment methods and subscription plans",
  },
  
  // Team permissions
  viewTeam: {
    id: "perm-9",
    name: "View Team",
    category: "team",
    description: "Can view team members and their roles",
  },
  manageTeam: {
    id: "perm-10",
    name: "Manage Team",
    category: "team",
    description: "Can invite, edit, and remove team members",
  },
  
  // Settings permissions
  viewSettings: {
    id: "perm-11",
    name: "View Settings",
    category: "settings",
    description: "Can view application settings",
  },
  manageSettings: {
    id: "perm-12",
    name: "Manage Settings",
    category: "settings",
    description: "Can modify application settings",
  },
  
  // Analytics permissions
  viewAnalytics: {
    id: "perm-13",
    name: "View Analytics",
    category: "analytics",
    description: "Can view analytics and reports",
  },
  exportAnalytics: {
    id: "perm-14",
    name: "Export Analytics",
    category: "analytics",
    description: "Can export analytics data",
  },
};

// Role definitions
export const roles: TeamRoleDefinition[] = [
  {
    id: "role-owner",
    name: "owner",
    description: "Full ownership and control of the team",
    level: 4,
    color: "#DC2626", // red
    permissions: ["all"], // All permissions
  },
  {
    id: "role-admin",
    name: "admin",
    description: "Full access to all features and settings",
    level: 3,
    color: "#2563EB", // blue
    permissions: [
      "members:read",
      "members:write",
      "members:delete",
      "settings:read",
      "settings:write",
      "billing:read",
      "campaigns:read",
      "campaigns:write",
      "domains:read",
      "domains:write",
    ],
  },
  {
    id: "role-member",
    name: "member",
    description: "Can manage campaigns and view analytics",
    level: 2,
    color: "#059669", // green
    permissions: [
      "members:read",
      "settings:read",
      "campaigns:read",
      "campaigns:write",
      "domains:read",
    ],
  },
  {
    id: "role-viewer",
    name: "viewer",
    description: "Can view campaigns and analytics",
    level: 1,
    color: "#7C3AED", // purple
    permissions: [
      "members:read",
      "settings:read",
      "campaigns:read",
    ],
  },
];

// Mock team members (compatible with types/team.ts)
export const mockTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    userId: "user-1",
    teamId: "team-1",
    name: "John Doe",
    email: "john.doe@acmecorp.com",
    role: "admin",
    status: "active",
    joinedAt: new Date("2024-01-15"),
    lastActiveAt: new Date("2024-12-20T15:30:00Z"),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JD",
    permissions: ["members:read", "members:write", "settings:read", "settings:write", "campaigns:read", "campaigns:write"],
  },
  {
    id: "member-2",
    userId: "user-2",
    teamId: "team-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@acmecorp.com",
    role: "member",
    status: "active",
    joinedAt: new Date("2024-03-20"),
    lastActiveAt: new Date("2024-12-20T14:20:00Z"),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SJ",
    permissions: ["members:read", "settings:read", "campaigns:read", "campaigns:write"],
  },
  {
    id: "member-3",
    userId: "user-3",
    teamId: "team-1",
    name: "Michael Chen",
    email: "michael.chen@acmecorp.com",
    role: "viewer",
    status: "active",
    joinedAt: new Date("2024-06-10"),
    lastActiveAt: new Date("2024-12-20T10:15:00Z"),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MC",
    permissions: ["members:read", "settings:read", "campaigns:read"],
  },
  {
    id: "member-4",
    userId: "user-4",
    teamId: "team-1",
    name: "Emily Davis",
    email: "emily.davis@acmecorp.com",
    role: "member",
    status: "active",
    joinedAt: new Date("2024-08-15"),
    lastActiveAt: new Date("2024-12-19T16:45:00Z"),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ED",
    permissions: ["members:read", "settings:read", "campaigns:read", "campaigns:write"],
  },
  {
    id: "member-5",
    userId: "user-5",
    teamId: "team-1",
    name: "Robert Wilson",
    email: "robert.wilson@acmecorp.com",
    role: "member",
    status: "inactive",
    joinedAt: new Date("2024-05-01"),
    lastActiveAt: new Date("2024-12-10T09:00:00Z"),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RW",
    permissions: ["members:read", "settings:read", "campaigns:read"],
  },
];

// Extended mock team members with additional details
export const mockExtendedTeamMembers: ExtendedTeamMember[] = [
  {
    id: "member-1",
    userId: "user-1",
    teamId: "team-1",
    name: "John Doe",
    email: "john.doe@acmecorp.com",
    role: "admin",
    status: "active",
    joinedAt: new Date("2023-01-15"),
    lastActiveAt: new Date("2024-12-20T15:30:00Z"),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JD",
    permissions: ["members:read", "members:write", "settings:read", "settings:write", "campaigns:read", "campaigns:write"],
    joinedDate: "2023-01-15",
    department: "Management",
    twoFactorEnabled: true,
    emailVerified: true,
    phoneNumber: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Founder and CEO of Acme Corporation",
  },
  {
    id: "member-2",
    userId: "user-2",
    teamId: "team-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@acmecorp.com",
    role: "member",
    status: "active",
    joinedAt: new Date("2023-03-20"),
    lastActiveAt: new Date("2024-12-20T14:20:00Z"),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SJ",
    permissions: ["members:read", "settings:read", "campaigns:read", "campaigns:write"],
    joinedDate: "2023-03-20",
    department: "Marketing",
    twoFactorEnabled: true,
    emailVerified: true,
    phoneNumber: "+1 (555) 234-5678",
    location: "New York, NY",
    bio: "Leading outreach campaigns and email marketing strategies",
  },
  {
    id: "member-3",
    userId: "user-3",
    teamId: "team-1",
    name: "Michael Chen",
    email: "michael.chen@acmecorp.com",
    role: "viewer",
    status: "active",
    joinedAt: new Date("2023-06-10"),
    lastActiveAt: new Date("2024-12-20T10:15:00Z"),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MC",
    permissions: ["members:read", "settings:read", "campaigns:read"],
    joinedDate: "2023-06-10",
    department: "Analytics",
    twoFactorEnabled: false,
    emailVerified: true,
    phoneNumber: "+1 (555) 345-6789",
    location: "Seattle, WA",
    bio: "Data analyst focusing on campaign performance metrics",
  },
];

// Mock team activities
export const mockTeamActivities: MockTeamActivity[] = [
  {
    id: "activity-1",
    memberId: "member-1",
    memberName: "John Doe",
    action: "Created campaign",
    target: "Black Friday Sale 2024",
    timestamp: "2024-12-20T15:30:00Z",
    details: "Created new email campaign targeting 5,000 contacts",
    ipAddress: "192.168.1.100",
  },
  {
    id: "activity-2",
    memberId: "member-2",
    memberName: "Sarah Johnson",
    action: "Updated domain settings",
    target: "mail.acmecorp.com",
    timestamp: "2024-12-20T14:20:00Z",
    details: "Updated SPF and DKIM records",
    ipAddress: "192.168.1.101",
  },
  {
    id: "activity-3",
    memberId: "member-3",
    memberName: "Michael Chen",
    action: "Exported analytics",
    target: "Q4 2024 Report",
    timestamp: "2024-12-20T10:15:00Z",
    details: "Exported campaign performance data for Q4 2024",
    ipAddress: "192.168.1.102",
  },
  {
    id: "activity-4",
    memberId: "member-1",
    memberName: "John Doe",
    action: "Invited team member",
    target: "jessica.martinez@acmecorp.com",
    timestamp: "2024-12-19T16:45:00Z",
    details: "Sent invitation to join as Member",
    ipAddress: "192.168.1.100",
  },
  {
    id: "activity-5",
    memberId: "member-2",
    memberName: "Sarah Johnson",
    action: "Paused campaign",
    target: "Holiday Newsletter",
    timestamp: "2024-12-19T12:00:00Z",
    details: "Paused campaign due to content updates",
    ipAddress: "192.168.1.101",
  },
];

// Mock team invitations
export const mockTeamInvitations: MockTeamInvitation[] = [
  {
    id: "invite-1",
    email: "jessica.martinez@acmecorp.com",
    role: "member",
    invitedBy: "john.doe@acmecorp.com",
    invitedAt: "2024-12-19T16:45:00Z",
    expiresAt: "2024-12-26T16:45:00Z",
    status: "pending",
    token: "invite_token_abc123",
  },
  {
    id: "invite-2",
    email: "david.brown@acmecorp.com",
    role: "viewer",
    invitedBy: "john.doe@acmecorp.com",
    invitedAt: "2024-12-15T10:00:00Z",
    expiresAt: "2024-12-22T10:00:00Z",
    status: "expired",
  },
  {
    id: "invite-3",
    email: "lisa.anderson@acmecorp.com",
    role: "member",
    invitedBy: "sarah.johnson@acmecorp.com",
    invitedAt: "2024-12-10T14:30:00Z",
    expiresAt: "2024-12-17T14:30:00Z",
    status: "accepted",
  },
];

// Helper functions
export function getRoleByName(roleName: TeamMember["role"]): TeamRoleDefinition | undefined {
  return roles.find(role => role.name === roleName);
}

export function getPermissionsForRole(roleName: TeamMember["role"]): TeamPermission[] {
  const role = getRoleByName(roleName);
  return (role?.permissions as TeamPermission[]) || [];
}

export function hasPermission(
  member: TeamMember | ExtendedTeamMember,
  permission: TeamPermission
): boolean {
  return member.permissions.includes(permission);
}

export function getActiveTeamMembers(): TeamMember[] {
  return mockTeamMembers.filter(member => member.status === "active");
}

export function getTeamMemberById(id: string): TeamMember | undefined {
  return mockTeamMembers.find(member => member.id === id);
}

export function formatLastActive(lastActive: string): string {
  if (!lastActive) return "Never";
  
  const date = new Date(lastActive);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString();
}

// Mock Nile User for authentication
export const mockNileUser: NileUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  givenName: 'Test',
  familyName: 'User',
  picture: 'https://example.com/avatar.jpg',
  created: '2023-01-01T00:00:00Z',
  updated: '2024-01-01T00:00:00Z',
  emailVerified: true,
  tenants: [{ id: 'test-tenant-id' }],
};

// Team statistics
export const teamStatistics = {
  totalMembers: mockTeamMembers.length,
  activeMembers: mockTeamMembers.filter(m => m.status === "active").length,
  pendingInvitations: mockTeamMembers.filter(m => m.status === "pending").length,
  rolesDistribution: {
    owner: mockTeamMembers.filter(m => m.role === "owner").length,
    admin: mockTeamMembers.filter(m => m.role === "admin").length,
    member: mockTeamMembers.filter(m => m.role === "member").length,
    viewer: mockTeamMembers.filter(m => m.role === "viewer").length,
  },
};
