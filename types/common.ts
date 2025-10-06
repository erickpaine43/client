// Common utility types and generic interfaces used across the application

export type ID = string | number;

export type Timestamp = string; // ISO date string

export type Status = "active" | "inactive" | "pending" | "error";

export type DisplayStatus =
  | "Running"
  | "Paused"
  | "Draft"
  | "Completed"
  | "Archived";

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MetricData {
  total: number;
  rate?: number;
  trend?: "up" | "down" | "stable";
}

export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

// Server action result type for consistent error handling
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// Consolidated Types Utilities and Type Guards
import { User, Company, Team, Tenant, UserRole, TeamRole } from './index';

// Type Guards for Consolidated Types
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).tenantId === 'string' &&
    typeof (obj as User).email === 'string' &&
    typeof (obj as User).displayName === 'string' &&
    typeof (obj as User).claims === 'object' &&
    typeof (obj as User).profile === 'object'
  );
}

export function isCompany(obj: unknown): obj is Company {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Company).id === 'string' &&
    typeof (obj as Company).tenantId === 'string' &&
    typeof (obj as Company).name === 'string'
  );
}

export function isTeam(obj: unknown): obj is Team {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Team).id === 'string' &&
    typeof (obj as Team).tenantId === 'string' &&
    typeof (obj as Team).name === 'string' &&
    typeof (obj as Team).ownerId === 'string' &&
    typeof (obj as Team).memberCount === 'number' &&
    typeof (obj as Team).settings === 'object'
  );
}

export function isTenant(obj: unknown): obj is Tenant {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Tenant).id === 'string' &&
    typeof (obj as Tenant).name === 'string' &&
    typeof (obj as Tenant).created === 'string'
  );
}

// Utility Functions for Consolidated Types
export function validateUserId(id: string): boolean {
  // UUID v4 regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getUserDisplayName(user: User): string {
  return user.displayName || user.email.split('@')[0];
}

export function getUserInitials(user: User): string {
  const name = getUserDisplayName(user);
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function isUserAdmin(user: User): boolean {
  return user.claims.role === UserRole.ADMIN || user.claims.role === UserRole.SUPER_ADMIN;
}

export function isUserSuperAdmin(user: User): boolean {
  return user.claims.role === UserRole.SUPER_ADMIN;
}

export function canUserAccessTenant(user: User, tenantId: string): boolean {
  return user.tenantId === tenantId;
}

export function canUserAccessTeam(user: User, team: Team): boolean {
  return user.tenantId === team.tenantId && (user.teamId === team.id || user.id === team.ownerId);
}

export function filterUsersByTenant(users: User[], tenantId: string): User[] {
  return users.filter(user => user.tenantId === tenantId);
}

export function filterTeamsByTenant(teams: Team[], tenantId: string): Team[] {
  return teams.filter(team => team.tenantId === tenantId);
}

export function filterCompaniesByTenant(companies: Company[], tenantId: string): Company[] {
  return companies.filter(company => company.tenantId === tenantId);
}

// Default values for consolidated types
export function createDefaultUser(partial: Partial<User>): User {
  return {
    id: partial.id || '',
    tenantId: partial.tenantId || '',
    email: partial.email || '',
    displayName: partial.displayName || '',
    claims: partial.claims || {
      role: UserRole.USER,
      tenantId: partial.tenantId || '',
      permissions: [],
    },
    profile: partial.profile || {
      timezone: 'UTC',
      language: 'en',
    },
    ...partial,
  };
}

export function createDefaultCompany(partial: Partial<Company>): Company {
  return {
    id: partial.id || '',
    tenantId: partial.tenantId || '',
    name: partial.name || '',
    ...partial,
  };
}

export function createDefaultTeam(partial: Partial<Team>): Team {
  return {
    id: partial.id || '',
    tenantId: partial.tenantId || '',
    name: partial.name || '',
    ownerId: partial.ownerId || '',
    memberCount: partial.memberCount || 0,
    settings: partial.settings || {
      allowMemberInvites: true,
      requireTwoFactorAuth: false,
      defaultRole: 'member' as TeamRole,
      autoApproveMembers: true,
      notifyOnNewMember: false,
    },
    ...partial,
  };
}

export function createDefaultTenant(partial: Partial<Tenant>): Tenant {
  return {
    id: partial.id || '',
    name: partial.name || '',
    created: partial.created || new Date().toISOString(),
    ...partial,
  };
}
