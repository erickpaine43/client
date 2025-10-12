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
import { z } from 'zod';

// Validation schema for updating user roles in a tenant
const UpdateUserRolesSchema = z.object({
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

/**
 * PUT /api/tenants/[tenantId]/users/[userId]
 * Update user roles in a tenant (admin access required)
 */
export const PUT = withTenantAccess('admin')(
  withResourcePermission('user', 'write')(async (request, context) => {
    try {
      const tenantService = getTenantService();
      const { tenantId, userId } = context.params;

      // Parse and validate request body
      const body = await request.json();
      const validationResult = UpdateUserRolesSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.issues,
          },
          { status: 400 }
        );
      }

      const { roles } = validationResult.data;

      await tenantService.updateUserTenantRoles(
        userId,
        tenantId,
        roles,
        request.user.id
      );

      return NextResponse.json(
        {
          message: 'User roles updated successfully',
          userId,
          tenantId,
          roles,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Failed to update user roles in tenant:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to update user roles in tenant',
          code: 'UPDATE_USER_ROLES_ERROR',
        },
        { status: 500 }
      );
    }
  })
);

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
