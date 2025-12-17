/**
 * Individual Company User Management API Routes
 * 
 * PUT /api/tenants/[tenantId]/companies/[companyId]/users/[userId] - Update user role in company
 * DELETE /api/tenants/[tenantId]/companies/[companyId]/users/[userId] - Remove user from company
 * 
 * These routes handle individual user-company relationship operations.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess, withResourcePermission } from '@/lib/niledb/middleware';
import { getCompanyService } from '@/lib/niledb/company';
import { z } from 'zod';

// Validation schema for updating user role
const UpdateUserRoleSchema = z.object({
  role: z.enum(['member', 'admin', 'owner']),
  permissions: z.record(z.string(), z.unknown()).optional(),
});

/**
 * PUT /api/tenants/[tenantId]/companies/[companyId]/users/[userId]
 * Update user role in company (admin access required)
 */
export const PUT = withTenantAccess('admin')(
  withResourcePermission('user', 'write')(async (request, context) => {
    try {
      const companyService = getCompanyService();
      const { tenantId, companyId, userId } = context.params;

      // Parse and validate request body
      const body = await request.json();
      const validationResult = UpdateUserRoleSchema.safeParse(body);

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

      const { role, permissions } = validationResult.data;

      const userCompany = await companyService.updateUserCompanyRole(
        tenantId,
        userId,
        companyId,
        role,
        permissions || {},
        request.user.id
      );

      return NextResponse.json({
        message: 'User role updated successfully',
        userCompany,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update user role:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to update user role',
          code: 'UPDATE_USER_ROLE_ERROR',
        },
        { status: 500 }
      );
    }
  })
);

/**
 * DELETE /api/tenants/[tenantId]/companies/[companyId]/users/[userId]
 * Remove user from company (admin access required)
 */
export const DELETE = withTenantAccess('admin')(
  withResourcePermission('user', 'delete')(async (request, context) => {
    try {
      const companyService = getCompanyService();
      const { tenantId, companyId, userId } = context.params;

      await companyService.removeUserFromCompany(
        tenantId,
        userId,
        companyId,
        request.user.id
      );

      return NextResponse.json({
        message: 'User removed from company successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to remove user from company:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to remove user from company',
          code: 'REMOVE_USER_FROM_COMPANY_ERROR',
        },
        { status: 500 }
      );
    }
  })
);
