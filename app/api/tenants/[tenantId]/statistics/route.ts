/**
 * Tenant Statistics API Routes
 * 
 * GET /api/tenants/[tenantId]/statistics - Get tenant statistics
 * 
 * These routes provide analytics and statistics for tenants.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';

/**
 * GET /api/tenants/[tenantId]/statistics
 * Get tenant statistics (admin access required)
 */
export const GET = withTenantAccess('admin')(async (request, context) => {
  try {
    const tenantService = getTenantService();
    const { tenantId } = context.params;

    const statistics = await tenantService.getTenantStatistics(
      tenantId,
      request.user.id
    );

    return NextResponse.json({
      statistics,
      tenantId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get tenant statistics:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve tenant statistics',
        code: 'TENANT_STATISTICS_ERROR',
      },
      { status: 500 }
    );
  }
});
