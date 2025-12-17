/**
 * Admin Individual Tenant Management API Routes
 * 
 * GET /api/admin/tenants/[tenantId] - Get detailed tenant information (staff only)
 * 
 * These routes provide detailed tenant administration for staff users.
 */

import { NextResponse } from 'next/server';
import { withStaffAccess } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';

/**
 * GET /api/admin/tenants/[tenantId]
 * Get detailed tenant information (staff only)
 */
export const GET = withStaffAccess('admin')(async (request, context) => {
  try {
    const tenantService = getTenantService();
    const { tenantId } = context.params;

    const [tenant, statistics, users] = await Promise.all([
      tenantService.getTenantById(tenantId),
      tenantService.getTenantStatistics(tenantId, request.user.id),
      tenantService.getTenantUsers(tenantId, request.user.id),
    ]);

    if (!tenant) {
      return NextResponse.json(
        {
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tenant,
      statistics,
      users,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get admin tenant details:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve tenant details',
        code: 'ADMIN_TENANT_DETAILS_ERROR',
      },
      { status: 500 }
    );
  }
});
