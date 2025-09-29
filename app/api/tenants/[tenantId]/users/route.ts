/**
 * Tenant User Management API Routes
 * 
 * GET /api/tenants/[tenantId]/users - Get all users in a tenant
 * POST /api/tenants/[tenantId]/users - Add user to tenant
 * 
 * These routes handle user-tenant relationships with proper access control.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess, withResourcePermission } from '@/lib/niledb/middleware';
import { getTenantService } from '@/lib/niledb/tenant';
import { z } from 'zod';

// Validation schema for adding user to tenant
const AddUserToTenantSchema = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.string()).default(['member']),
});

/**
 * GET /api/tenants/[tenantId]/users
 * Get all users in a tenant (admin access required)
 */
export const GET = withTenantAccess('admin')(
  withResourcePermission('user', 'read')(async (request, context) => {
    try {
      const tenantService = getTenantService();
      const { tenantId } = context.params;

      const users = await tenantService.getTenantUsers(tenantId, request.user.id);

      return NextResponse.json({
        users,
        count: users.length,
        tenantId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to get tenant users:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to retrieve tenant users',
          code: 'TENANT_USERS_FETCH_ERROR',
        },
        { status: 500 }
      );
    }
  })
);

/**
 * POST /api/tenants/[tenantId]/users
 * Add user to tenant (admin access required)
 */
export const POST = withTenantAccess('admin')(
  withResourcePermission('user', 'write')(async (request, context) => {
    try {
      const tenantService = getTenantService();
      const { tenantId } = context.params;

      // Parse and validate request body
      const body = await request.json();
      const validationResult = AddUserToTenantSchema.safeParse(body);

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

      const { userId, roles } = validationResult.data;

      await tenantService.addUserToTenant(
        userId,
        tenantId,
        roles,
        request.user.id
      );

      return NextResponse.json(
        {
          message: 'User added to tenant successfully',
          userId,
          tenantId,
          roles,
          timestamp: new Date().toISOString(),
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Failed to add user to tenant:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to add user to tenant',
          code: 'ADD_USER_TO_TENANT_ERROR',
        },
        { status: 500 }
      );
    }
  })
);
