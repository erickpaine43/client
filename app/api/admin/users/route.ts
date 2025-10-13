/**
 * Admin User Management API Routes
 *
 * GET /api/admin/users - List all users with pagination (staff only)
 *
 * These routes provide cross-tenant user administration for staff users.
 */

import { NextResponse } from 'next/server';
import { withStaffAccess } from '@/lib/niledb/middleware';
import { withoutTenantContext } from '@/lib/niledb/client';
import { transformUsersForAdminResponse } from '@/lib/admin/transformers';
import { logDashboardAccess, logFilterApplied, extractClientIP, extractUserAgent } from '@/lib/admin/audit';

// Note: AdminUserRow interface is defined but not used in final implementation
// Kept for potential future use with different data transformation approach

/**
 * GET /api/admin/users
 * List all users with pagination (staff only)
 */
export const GET = withStaffAccess('admin')(async (request, context) => {
  try {
    // Debug logging
    console.log('Admin API: Request received')
    console.log('Admin API: Context user:', context.user?.id, context.user?.email)
    console.log('Admin API: Context isStaff:', context.isStaff)
    console.log('Admin API: User profile:', context.user?.profile)

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);
    const search = url.searchParams.get('search');
    const role = url.searchParams.get('role');
    const staffOnly = url.searchParams.get('staff_only') === 'true';

    // Audit logging for dashboard access
    const adminUserId = context.user?.id;
    const ipAddress = extractClientIP(request);
    const userAgent = extractUserAgent(request);

    console.log('Admin API: About to log dashboard access for user:', adminUserId)

    if (adminUserId) {
      await logDashboardAccess(adminUserId, ipAddress, userAgent);
    }

    // Build query with optional filters
    let query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.given_name,
        u.family_name,
        u.picture,
        u.created,
        u.updated,
        u.email_verified,
        COALESCE(up.role, 'user') as role,
        COALESCE(up.is_penguinmails_staff, false) as is_penguinmails_staff,
        COUNT(DISTINCT tu.tenant_id) as tenant_count,
        COUNT(DISTINCT uc.company_id) as company_count
      FROM users.users u
      LEFT JOIN public.user_profiles up ON u.id = up.user_id AND up.deleted IS NULL
      LEFT JOIN users.tenant_users tu ON u.id = tu.user_id AND tu.deleted IS NULL
      LEFT JOIN public.user_companies uc ON u.id = uc.user_id AND uc.deleted IS NULL
      WHERE 1=1
    `;

    const queryParams: (string | number | boolean)[] = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      query += ` AND (u.email ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add role filter
    if (role) {
      query += ` AND up.role = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }

    // Add staff filter
    if (staffOnly) {
      query += ` AND up.is_penguinmails_staff = $${paramIndex}`;
      queryParams.push(true);
      paramIndex++;
    }

    query += `
      GROUP BY u.id, u.email, u.name, u.given_name, u.family_name, u.picture, 
               u.created, u.updated, u.email_verified, up.role, up.is_penguinmails_staff
      ORDER BY u.created DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    // Execute query using withoutTenantContext for cross-tenant access
    const rawUsers = await withoutTenantContext(async (nile) => {
      const result = await nile.db.query(query, queryParams);
      return result.rows;
    });

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users.users u
      LEFT JOIN public.user_profiles up ON u.id = up.user_id AND up.deleted IS NULL
      WHERE 1=1
    `;

    const countParams: (string | number | boolean)[] = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (u.email ILIKE $${countParamIndex} OR u.name ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (role) {
      countQuery += ` AND up.role = $${countParamIndex}`;
      countParams.push(role);
      countParamIndex++;
    }

    if (staffOnly) {
      countQuery += ` AND up.is_penguinmails_staff = $${countParamIndex}`;
      countParams.push(true);
      countParamIndex++;
    }

    const totalCount = await withoutTenantContext(async (nile) => {
      const result = await nile.db.query(countQuery, countParams);
      return parseInt(result.rows[0]?.total || '0');
    });

    // Audit logging for filter application
    if (adminUserId && (search || role || staffOnly)) {
      await logFilterApplied(
        adminUserId,
        { search, role, staffOnly },
        totalCount,
        ipAddress,
        userAgent
      );
    }

    // Transform response with privacy masking
    const response = transformUsersForAdminResponse(
      rawUsers,
      totalCount,
      offset,
      limit,
      { search: search || undefined, role: role || undefined, staffOnly }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get users:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve users',
        code: 'ADMIN_USERS_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});
