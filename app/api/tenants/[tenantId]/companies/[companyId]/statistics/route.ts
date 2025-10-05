/**
 * Company Statistics API Routes
 * 
 * GET /api/tenants/[tenantId]/companies/[companyId]/statistics - Get company statistics
 * 
 * These routes provide analytics and statistics for companies.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess } from '@/lib/niledb/middleware';
import { getCompanyService } from '@/lib/niledb/company';

/**
 * GET /api/tenants/[tenantId]/companies/[companyId]/statistics
 * Get company statistics (member access required)
 */
export const GET = withTenantAccess('member')(async (request, context) => {
  try {
    const companyService = getCompanyService();
    const { tenantId, companyId } = context.params;

    const statistics = await companyService.getCompanyStatistics(
      tenantId,
      companyId,
      request.user.id
    );

    return NextResponse.json({
      statistics,
      companyId,
      tenantId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get company statistics:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve company statistics',
        code: 'COMPANY_STATISTICS_ERROR',
      },
      { status: 500 }
    );
  }
});
