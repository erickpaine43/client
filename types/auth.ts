// Authentication and User Types
// Extracted from context/AuthContext.tsx and enhanced for comprehensive auth system

import { z } from "zod";

// Core Authentication Types

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  GUEST = "guest"
}

export enum Permission {
  // User management
  CREATE_USER = "create_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",
  VIEW_USERS = "view_users",

  // Campaign management
  CREATE_CAMPAIGN = "create_campaign",
  UPDATE_CAMPAIGN = "update_campaign",
  DELETE_CAMPAIGN = "delete_campaign",
  VIEW_CAMPAIGNS = "view_campaigns",

  // Domain management
  CREATE_DOMAIN = "create_domain",
  UPDATE_DOMAIN = "update_domain",
  DELETE_DOMAIN = "delete_domain",
  VIEW_DOMAINS = "view_domains",

  // Mailbox management
  CREATE_MAILBOX = "create_mailbox",
  UPDATE_MAILBOX = "update_mailbox",
  DELETE_MAILBOX = "delete_mailbox",
  VIEW_MAILBOXES = "view_mailboxes",

  // Analytics
  VIEW_ANALYTICS = "view_analytics",
  EXPORT_DATA = "export_data",

  // Settings
  UPDATE_SETTINGS = "update_settings",
  VIEW_SETTINGS = "view_settings",

  // Billing
  VIEW_BILLING = "view_billing",
  UPDATE_BILLING = "update_billing",
  MANAGE_SUBSCRIPTIONS = "manage_subscriptions"
}

export const ClaimsSchema = z.object({
  name: z.string(),
  role: z.nativeEnum(UserRole),
  companyId: z.string(),
  companyName: z.string(),
  plan: z.string(),
  permissions: z.array(z.nativeEnum(Permission)).optional(),
  issuedAt: z.date().optional(),
  expiresAt: z.date().optional()
});

export type Claims = z.infer<typeof ClaimsSchema>;

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().url().optional(),
  token: z.string(),
  claims: ClaimsSchema,
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    lastLogin: z.date().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
  }).optional()
});

export type User = z.infer<typeof UserSchema>;

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string, companyName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  refreshToken?: () => Promise<void>;
}

// Session Management Types

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  refreshToken: z.string(),
  expiresAt: z.date(),
  refreshExpiresAt: z.date(),
  deviceInfo: z.object({
    userAgent: z.string(),
    ipAddress: z.string().optional(),
    deviceFingerprint: z.string().optional()
  }).optional(),
  createdAt: z.date(),
  lastActivity: z.date()
});

export type Session = z.infer<typeof SessionSchema>;

export const TokenPayloadSchema = z.object({
  uid: z.string(),
  email: z.string(),
  iat: z.number(), // Issued at
  exp: z.number(), // Expires at
  claims: ClaimsSchema
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
  revoked: z.boolean().default(false),
  revocationReason: z.string().optional()
});

export type RefreshToken = z.infer<typeof RefreshTokenSchema>;

// Authentication Response Types

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional()
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  user: UserSchema,
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number()
  })
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().optional(),
  acceptTerms: z.boolean()
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Password Reset Types

export const PasswordResetRequestSchema = z.object({
  email: z.string().email()
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
  confirmPassword: z.string()
});

export type PasswordReset = z.infer<typeof PasswordResetSchema>;

// Authentication Status

export enum AuthStatus {
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  LOADING = "loading",
  ERROR = "error"
}

export const AuthStateSchema = z.object({
  status: z.nativeEnum(AuthStatus),
  user: UserSchema.nullable(),
  session: SessionSchema.optional(),
  error: z.string().optional()
});

export type AuthState = z.infer<typeof AuthStateSchema>;

// Role-based Access Control (RBAC) Utilities

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.CREATE_CAMPAIGN,
    Permission.UPDATE_CAMPAIGN,
    Permission.DELETE_CAMPAIGN,
    Permission.VIEW_CAMPAIGNS,
    Permission.CREATE_DOMAIN,
    Permission.UPDATE_DOMAIN,
    Permission.DELETE_DOMAIN,
    Permission.VIEW_DOMAINS,
    Permission.CREATE_MAILBOX,
    Permission.UPDATE_MAILBOX,
    Permission.DELETE_MAILBOX,
    Permission.VIEW_MAILBOXES,
    Permission.VIEW_ANALYTICS,
    Permission.UPDATE_SETTINGS,
    Permission.VIEW_SETTINGS,
    Permission.VIEW_BILLING,
    Permission.UPDATE_BILLING
  ],
  [UserRole.MANAGER]: [
    Permission.CREATE_CAMPAIGN,
    Permission.UPDATE_CAMPAIGN,
    Permission.DELETE_CAMPAIGN,
    Permission.VIEW_CAMPAIGNS,
    Permission.UPDATE_MAILBOX,
    Permission.DELETE_MAILBOX,
    Permission.VIEW_MAILBOXES,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS
  ],
  [UserRole.USER]: [
    Permission.CREATE_CAMPAIGN,
    Permission.UPDATE_CAMPAIGN,
    Permission.VIEW_CAMPAIGNS,
    Permission.VIEW_MAILBOXES,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.GUEST]: [
    Permission.VIEW_ANALYTICS
  ]
};

// Utility functions for RBAC

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user || !user.claims.permissions) return false;
  return user.claims.permissions.includes(permission);
}

export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.claims.role === role;
}

export function getUserPermissions(user: User | null): Permission[] {
  if (!user) return [];
  if (user.claims.permissions) return user.claims.permissions;
  return RolePermissions[user.claims.role] || [];
}

// Type Guards

export function isAuthenticated(user: User | null): user is User {
  return user !== null;
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.ADMIN) || hasRole(user, UserRole.SUPER_ADMIN);
}

export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.SUPER_ADMIN);
}

// Error Types

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const AuthErrorCodes = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  SESSION_EXPIRED: "SESSION_EXPIRED"
} as const;

export type AuthErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];
