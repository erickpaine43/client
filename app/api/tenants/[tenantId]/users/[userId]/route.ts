/**
 * Individual Tenant User Management API Routes
 * 
 * DELETE /api/tenants/[tenantId]/users/[userId] - Remove user from tenant
 * 
 * These routes handle individual user-tenant relationship operations.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess, withResourcePermission } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';

/**
 * DELETE /api/tenants/[tenantId]/users/[userId]
 * Remove user from tenant (admin access required)
 */
export const DELETE = withTenantAccess('admin')(
  withResourcePermission('user', 'delete')(async (request, context) => {
    try {
      const tenantService = getTenantService();
      const { tenantId, userId } = context.params;

      await tenantService.removeUserFromTenant(
        userId,
        tenantId,
        request.user.id
      );

      return NextResponse.json({
        message: 'User removed from tenant successfully',
        userId,
        tenantId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to remove user from tenant:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to remove user from tenant',
          code: 'REMOVE_USER_FROM_TENANT_ERROR',
        },
        { status: 500 }
      );
    }
  })
);
