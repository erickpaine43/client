/**
 * Admin Company Management API Routes
 * 
 * GET /api/admin/companies - Get all companies across all tenants (staff only)
 * 
 * These routes provide cross-tenant company administration for staff users.
 */

import { NextResponse } from 'next/server';
import { withStaffAccess } from '@/lib/niledb/middleware';
import { withoutTenantContext } from '@/lib/niledb/client';

interface AdminCompanyRow {
  id: string;
  tenant_id: string;
  tenant_name: string;
  name: string;
  email: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  user_count: string;
}

/**
 * GET /api/admin/companies
 * Get all companies across all tenants (staff only)
 */
export const GET = withStaffAccess('admin')(async (request, _context) => {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);
    const search = url.searchParams.get('search');
    const tenantId = url.searchParams.get('tenantId');

    // Build query with optional filters
    let query = `
      SELECT 
        c.id,
        c.tenant_id,
        t.name as tenant_name,
        c.name,
        c.email,
        c.settings,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT uc.user_id) as user_count
      FROM public.companies c
      LEFT JOIN public.tenants t ON c.tenant_id = t.id
      LEFT JOIN public.user_companies uc ON c.id = uc.company_id AND uc.deleted IS NULL
      WHERE c.deleted IS NULL AND t.deleted IS NULL
    `;

    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add tenant filter
    if (tenantId) {
      query += ` AND c.tenant_id = $${paramIndex}`;
      queryParams.push(tenantId);
      paramIndex++;
    }

    query += `
      GROUP BY c.id, c.tenant_id, t.name, c.name, c.email, c.settings, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    // Execute query using withoutTenantContext for cross-tenant access
    const companies = await withoutTenantContext(async (nile) => {
      const result = await nile.db.query(query, queryParams);

      return result.rows.map((row: AdminCompanyRow) => ({
        id: row.id,
        tenantId: row.tenant_id,
        tenantName: row.tenant_name,
        name: row.name,
        email: row.email,
        settings: row.settings || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        userCount: parseInt(row.user_count || '0'),
      }));
    });

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT c.id) as total 
      FROM public.companies c
      LEFT JOIN public.tenants t ON c.tenant_id = t.id
      WHERE c.deleted IS NULL AND t.deleted IS NULL
    `;

    const countParams: (string | number)[] = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (c.name ILIKE $${countParamIndex} OR c.email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (tenantId) {
      countQuery += ` AND c.tenant_id = $${countParamIndex}`;
      countParams.push(tenantId);
      countParamIndex++;
    }

    const totalCount = await withoutTenantContext(async (nile) => {
      const result = await nile.db.query(countQuery, countParams);
      return parseInt(result.rows[0]?.total || '0');
    });

    return NextResponse.json({
      companies,
      count: companies.length,
      total: totalCount,
      pagination: {
        limit,
        offset,
        hasMore: (offset + companies.length) < totalCount,
      },
      filters: {
        search: search || null,
        tenantId: tenantId || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get all companies:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve companies',
        code: 'ADMIN_COMPANIES_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});
