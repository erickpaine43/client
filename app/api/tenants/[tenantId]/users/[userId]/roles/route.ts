/**
 * Tenant User Roles Management API Routes
 * 
 * PUT /api/tenants/[tenantId]/users/[userId]/roles - Update user roles in tenant
 * 
 * These routes handle user role management within tenants.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess, withResourcePermission } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';
import { z } from 'zod';

// Validation schema for updating user roles
const UpdateUserRolesSchema = z.object({
  roles: z.array(z.string()).min(1),
});

/**
 * PUT /api/tenants/[tenantId]/users/[userId]/roles
 * Update user roles in tenant (admin access required)
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

      return NextResponse.json({
        message: 'User roles updated successfully',
        userId,
        tenantId,
        roles,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update user roles:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to update user roles',
          code: 'UPDATE_USER_ROLES_ERROR',
        },
        { status: 500 }
      );
    }
  })
);
