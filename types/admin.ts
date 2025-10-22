import { z } from 'zod'

/**
 * Admin User Type
 * Staff user with cross-tenant access privileges.
 */
export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['staff', 'admin', 'super_admin']),
  isPenguinMailsStaff: z.boolean(),
  tenantId: z.string().uuid().optional(),
  created: z.string(),
  updated: z.string(),
})

export type AdminUser = z.infer<typeof AdminUserSchema>

/**
 * Regular User Type (as seen by admins)
 * Standard platform user with tenant-specific access, with privacy masking.
 */
export const RegularUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(), // Masked email for privacy
  name: z.string(),
  role: z.string(),
  isPenguinMailsStaff: z.boolean(),
  tenantCount: z.number().min(0),
  companyCount: z.number().min(0),
  created: z.string(),
})

export type RegularUser = z.infer<typeof RegularUserSchema>

/**
 * Audit Log Entry Type
 * Record of admin dashboard actions for compliance.
 */
export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  adminUserId: z.string().uuid(),
  action: z.enum(['dashboard_access', 'user_view', 'filter_applied']),
  resourceType: z.enum(['user', 'dashboard']),
  resourceId: z.string().uuid().optional(),
  tenantContext: z.string().optional(),
  metadata: z.object({}).passthrough(),
  ipAddress: z.string(),
  userAgent: z.string(),
  timestamp: z.string(),
})

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>

/**
 * Admin Dashboard API Response Types
 */
export const AdminUsersResponseSchema = z.object({
  users: z.array(RegularUserSchema),
  count: z.number(),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
  filters: z.object({
    search: z.string().nullable(),
    role: z.string().nullable(),
    staffOnly: z.boolean(),
  }),
  timestamp: z.string(),
})

export type AdminUsersResponse = z.infer<typeof AdminUsersResponseSchema>

/**
 * Validation helpers for admin types
 */
export function validateAdminUser(data: unknown): AdminUser {
  return AdminUserSchema.parse(data)
}

export function validateRegularUser(data: unknown): RegularUser {
  return RegularUserSchema.parse(data)
}

export function validateAuditLogEntry(data: unknown): AuditLogEntry {
  return AuditLogEntrySchema.parse(data)
}

export function validateAdminUsersResponse(data: unknown): AdminUsersResponse {
  return AdminUsersResponseSchema.parse(data)
}
