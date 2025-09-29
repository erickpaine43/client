/**
 * Tenant Access Test API Routes
 * 
 * GET /api/test/tenant/[tenantId] - Test tenant access functionality
 * 
 * These routes provide testing endpoints for tenant access and middleware.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess } from '@/lib/niledb/middleware';

/**
 * GET /api/test/tenant/[tenantId]
 * Test tenant access functionality
 */
export const GET = withTenantAccess('member')(async (request, context) => {
  try {
    return NextResponse.json({
      message: 'Tenant access successful',
      user: {
        id: request.user.id,
        email: request.user.email,
        name: request.user.name,
      },
      tenant: context.tenant,
      tenantId: context.params.tenantId,
      isStaff: context.isStaff,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Tenant access test failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Tenant access test failed',
        code: 'TENANT_ACCESS_TEST_ERROR',
      },
      { status: 500 }
    );
  }
});
