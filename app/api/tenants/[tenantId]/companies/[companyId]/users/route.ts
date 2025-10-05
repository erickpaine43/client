/**
 * Company User Management API Routes
 * 
 * GET /api/tenants/[tenantId]/companies/[companyId]/users - Get all users in a company
 * POST /api/tenants/[tenantId]/companies/[companyId]/users - Add user to company
 * 
 * These routes handle user-company relationships within tenant contexts.
 */

import { NextResponse } from 'next/server';
import { withTenantAccess, withResourcePermission } from '@/lib/niledb/middleware';
import { getCompanyService } from '@/lib/niledb/company';
import { z } from 'zod';

// Validation schema for adding user to company
const AddUserToCompanySchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['member', 'admin', 'owner']).default('member'),
  permissions: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/tenants/[tenantId]/companies/[companyId]/users
 * Get all users in a company (member access required)
 */
export const GET = withTenantAccess('member')(async (request, context) => {
  try {
    const companyService = getCompanyService();
    const { tenantId, companyId } = context.params;

    const users = await companyService.getCompanyUsers(
      tenantId,
      companyId,
      request.user.id
    );

    return NextResponse.json({
      users,
      count: users.length,
      companyId,
      tenantId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get company users:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve company users',
        code: 'COMPANY_USERS_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/tenants/[tenantId]/companies/[companyId]/users
 * Add a user to a company (admin access required)
 */
export const POST = withTenantAccess('admin')(
  withResourcePermission('user', 'write')(async (request, context) => {
    try {
      const companyService = getCompanyService();
      const { tenantId, companyId } = context.params;

      // Parse and validate request body
      const body = await request.json();
      const validationResult = AddUserToCompanySchema.safeParse(body);

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

      const { userId, role, permissions } = validationResult.data;

      const userCompany = await companyService.addUserToCompany(
        tenantId,
        userId,
        companyId,
        role,
        permissions || {},
        request.user.id
      );

      return NextResponse.json(
        {
          message: 'User added to company successfully',
          userCompany,
          timestamp: new Date().toISOString(),
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Failed to add user to company:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to add user to company',
          code: 'ADD_USER_TO_COMPANY_ERROR',
        },
        { status: 500 }
      );
    }
  })
);
