/**
 * User Tenant Management API Routes
 * 
 * GET /api/user/tenants - Get all tenants for the current user
 * 
 * These routes handle user-centric tenant operations.
 */

import { NextResponse } from 'next/server';
import { withAuthentication } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';

/**
 * GET /api/user/tenants
 * Get all tenants for the current user
 */
export const GET = withAuthentication(async (request, _context) => {
  try {
    const tenantService = getTenantService();

    const tenants = await tenantService.getUserTenants(request.user.id);

    return NextResponse.json({
      tenants,
      count: tenants.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get user tenants:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve user tenants',
        code: 'USER_TENANTS_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});
