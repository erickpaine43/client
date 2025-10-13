import { maskEmail } from '@/lib/utils/privacy'
import type { AdminUsersResponse, RegularUser } from '@/types/admin'

/**
 * Admin API Response Transformers
 * Handles data transformation and privacy masking for admin endpoints
 */

/**
 * Transform raw user data from database to admin view with privacy masking
 */
export function transformUserForAdmin(user: Record<string, unknown>): RegularUser {
  return {
    id: user.id as string,
    email: maskEmail(user.email as string),
    name: user.name as string,
    role: (user.role as string) || 'user',
    isPenguinMailsStaff: (user.is_penguinmails_staff as boolean) || false,
    tenantCount: Number(user.tenant_count) || 0,
    companyCount: Number(user.company_count) || 0,
    created: user.created as string,
  }
}

/**
 * Transform array of raw users to admin response format
 */
export function transformUsersForAdminResponse(
  users: Record<string, unknown>[],
  total: number,
  offset: number,
  limit: number,
  filters: {
    search?: string
    role?: string
    staffOnly?: boolean
  } = {}
): AdminUsersResponse {
  const transformedUsers = users.map(transformUserForAdmin)

  return {
    users: transformedUsers,
    count: transformedUsers.length,
    total,
    pagination: {
      limit,
      offset,
      hasMore: offset + limit < total,
    },
    filters: {
      search: filters.search || null,
      role: filters.role || null,
      staffOnly: filters.staffOnly || false,
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Apply search filter to user query
 */
export function buildSearchFilter(search: string): string {
  if (!search) return ''

  // Search in email (unmasked for filtering) and name
  return `AND (u.email ILIKE '%${search}%' OR u.name ILIKE '%${search}%')`
}

/**
 * Apply role filter to user query
 */
export function buildRoleFilter(role: string): string {
  if (!role) return ''

  return `AND up.role = '${role}'`
}

/**
 * Apply staff-only filter to user query
 */
export function buildStaffFilter(staffOnly: boolean): string {
  if (!staffOnly) return ''

  return 'AND up.is_penguinmails_staff = true'
}
