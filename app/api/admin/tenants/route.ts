/**
 * Admin Tenant Management API Routes
 * 
 * GET /api/admin/tenants - Get all tenants (staff only)
 * 
 * These routes provide cross-tenant administration for staff users.
 */

import { NextResponse } from 'next/server';
import { withStaffAccess } from '@/lib/niledb/middleware';
import { withoutTenantContext } from '@/lib/niledb/client';

interface AdminTenantRow {
  id: string;
  name: string;
  created: string;
  updated: string;
  user_count: string;
  company_count: string;
  subscription_status: string;
  plan: string;
}

/**
 * GET /api/admin/tenants
 * Get all tenants with statistics (staff only)
 */
export const GET = withStaffAccess('admin')(async (request, _context) => {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    // Use withoutTenantContext for cross-tenant queries
    const tenants = await withoutTenantContext(async (nile) => {
      const result = await nile.db.query(
        `
        SELECT 
          t.id,
          t.name,
          t.created,
          t.updated,
          COUNT(DISTINCT tu.user_id) as user_count,
          COUNT(DISTINCT c.id) as company_count,
          COALESCE(tb.subscription_status, 'unknown') as subscription_status,
          COALESCE(tb.plan, 'free') as plan
        FROM public.tenants t
        LEFT JOIN users.tenant_users tu ON t.id = tu.tenant_id AND tu.deleted IS NULL
        LEFT JOIN public.companies c ON t.id = c.tenant_id AND c.deleted IS NULL
        LEFT JOIN public.tenant_billing tb ON t.id = tb.tenant_id AND tb.deleted IS NULL
        WHERE t.deleted IS NULL
        GROUP BY t.id, t.name, t.created, t.updated, tb.subscription_status, tb.plan
        ORDER BY t.created DESC
        LIMIT $1 OFFSET $2
      `,
        [limit, offset]
      );

      return result.rows.map((row: AdminTenantRow) => ({
        id: row.id,
        name: row.name,
        created: row.created,
        updated: row.updated,
        userCount: parseInt(row.user_count || '0'),
        companyCount: parseInt(row.company_count || '0'),
        subscriptionStatus: row.subscription_status || 'unknown',
        plan: row.plan || 'free',
      }));
    });

    // Get total count for pagination
    const totalCount = await withoutTenantContext(async (nile) => {
      const result = await nile.db.query(
        'SELECT COUNT(*) as total FROM public.tenants WHERE deleted IS NULL'
      );
      return parseInt(result.rows[0]?.total || '0');
    });

    return NextResponse.json({
      tenants,
      count: tenants.length,
      total: totalCount,
      pagination: {
        limit,
        offset,
        hasMore: (offset + tenants.length) < totalCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get all tenants:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve tenants',
        code: 'ADMIN_TENANTS_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});
