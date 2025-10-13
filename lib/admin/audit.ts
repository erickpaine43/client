import { ConvexHttpClient } from 'convex/browser'
import { createAnalyticsConvexHelper } from '@/lib/utils/convex-query-helper'
import { api } from '@/convex/_generated/api'

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
const convexHelper = createAnalyticsConvexHelper(convex, 'AdminAuditService')

/**
 * Admin Audit Logging Service
 * Handles audit logging for admin dashboard actions
 */

export interface AuditLogContext {
  adminUserId: string
  action: 'dashboard_access' | 'user_view' | 'filter_applied'
  resourceType: 'user' | 'dashboard'
  resourceId?: string
  tenantContext?: string
  metadata?: Record<string, unknown>
  ipAddress: string
  userAgent: string
}

/**
 * Log an admin action for compliance and auditing
 */
export async function logAdminAction(context: AuditLogContext): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await convexHelper.mutation(api.adminAudit.logAdminAction, {
      adminUserId: context.adminUserId,
      action: context.action,
      resourceType: context.resourceType,
      resourceId: context.resourceId,
      tenantContext: context.tenantContext,
      metadata: context.metadata || {},
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    })
  } catch (error) {
    // Log audit failure but don't fail the operation
    console.error('Failed to log admin action:', error)
  }
}

/**
 * Log dashboard access for compliance tracking
 */
export async function logDashboardAccess(
  adminUserId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAdminAction({
    adminUserId,
    action: 'dashboard_access',
    resourceType: 'dashboard',
    resourceId: adminUserId, // Using admin user ID as resource
    ipAddress,
    userAgent,
    metadata: {
      accessedAt: new Date().toISOString(),
      source: 'admin_dashboard',
      action: 'dashboard_access',
    },
  })
}

/**
 * Log user view action for audit trail
 */
export async function logUserView(
  adminUserId: string,
  viewedUserId: string,
  tenantContext: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAdminAction({
    adminUserId,
    action: 'user_view',
    resourceType: 'user',
    resourceId: viewedUserId,
    tenantContext,
    ipAddress,
    userAgent,
    metadata: {
      viewedAt: new Date().toISOString(),
      source: 'admin_dashboard_users_list',
    },
  })
}

/**
 * Log filter application for compliance
 */
export async function logFilterApplied(
  adminUserId: string,
  filters: Record<string, unknown>,
  resultCount: number,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAdminAction({
    adminUserId,
    action: 'filter_applied',
    resourceType: 'dashboard',
    ipAddress,
    userAgent,
    metadata: {
      filters,
      resultCount,
      appliedAt: new Date().toISOString(),
      source: 'admin_dashboard_filters',
    },
  })
}

/**
 * Extract client IP from request headers
 */
export function extractClientIP(request: Request): string {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  const realIP = headers.get('x-real-ip')
  const clientIP = headers.get('x-client-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (clientIP) {
    return clientIP
  }

  return 'unknown'
}

/**
 * Extract user agent from request headers
 */
export function extractUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'Unknown'
}
