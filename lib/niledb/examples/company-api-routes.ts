/**
 * Company API Route Examples
 * 
 * Demonstrates how to use CompanyService with the authentication and tenant
 * middleware from Task 4, following the established patterns for secure,
 * tenant-aware API endpoints.
 */

import { NextResponse } from 'next/server';
import {
  withTenantAccess,
  withStaffAccess,
  withResourcePermission,
  type AuthenticatedRequest,
  type RouteContext,
} from '../middleware';
import { getCompanyService, type CreateCompanyData, type UpdateCompanyData } from '../company';
import { z } from 'zod';

// Validation schemas
const CreateCompanySchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().email().optional().or(z.literal('')),
  settings: z.record(z.string(), z.unknown()).optional(),
});

const UpdateCompanySchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  email: z.string().email().optional().or(z.literal('')),
  settings: z.record(z.string(), z.unknown()).optional(),
});

const AddUserToCompanySchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['member', 'admin', 'owner']).default('member'),
  permissions: z.record(z.string(), z.unknown()).optional(),
});

const UpdateUserRoleSchema = z.object({
  role: z.enum(['member', 'admin', 'owner']),
  permissions: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Company Management Routes
 * 
 * These routes demonstrate tenant-scoped company operations with proper
 * access control and integr the CompanyService.
 */

// GET /api/tenants/[tenantId]/companies
// List all companies in a tenant
export const getCompaniesHandler = withTenantAccess('member')(
  async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const companyService = getCompanyService();
      const { tenantId } = context.params;

      const companies = await companyService.getCompaniesForTenant(
        tenantId,
        request.user.id
      );

      return NextResponse.json({
        companies,
        count: companies.length,
        tenantId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to get companies:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Failed to retrieve companies',
          code: 'COMPANIES_FETCH_ERROR',
        },
        { status: 500 }
      );
    }
  }
);

// POST /api/tenants/[tenantId]/companies
// Create a new company in a tenant
export const createCompanyHandler = withTenantAccess('admin')(
  withResourcePermission('company', 'write')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
      try {
        const companyService = getCompanyService();
        const { tenantId } = context.params;

        // Parse and validate request body
        const body = await request.json();
        const validationResult = CreateCompanySchema.safeParse(body);

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

        const companyData: CreateCompanyData = {
          name: validationResult.data.name,
          email: validationResult.data.email || undefined,
          settings: validationResult.data.settings || {},
        };

        const company = await companyService.createCompany(
          tenantId,
          companyData,
          request.user.id
        );

        return NextResponse.json(
          {
            message: 'Company created successfully',
            company,
            timestamp: new Date().toISOString(),
          },
          { status: 201 }
        );
      } catch (error) {
        console.error('Failed to create company:', error);
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : 'Failed to create company',
            code: 'COMPANY_CREATE_ERROR',
          },
          { status: 500 }
        );
      }
    }
  )
);

// GET /api/tenants/[tenantId]/companies/[companyId]
// Get a specific company by ID
export const getCompanyHandler = withTenantAccess('member')(
  async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const companyService = getCompanyService();
      const { tenantId, companyId } = context.params;

      const company = await companyService.getCompanyById(
        tenantId,
        companyId,
        request.user.id
      );

      if (!company) {
        return NextResponse.json(
          {
            error: 'Company not found',
            code: 'COMPANY_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        company,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to get company:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to retrieve company',
          code: 'COMPANY_FETCH_ERROR',
        },
        { status: 500 }
      );
    }
  }
);

// PUT /api/tenants/[tenantId]/companies/[companyId]
// Update a company
export const updateCompanyHandler = withTenantAccess('admin')(
  withResourcePermission('company', 'write')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
      try {
        const companyService = getCompanyService();
        const { tenantId, companyId } = context.params;

        // Parse and validate request body
        const body = await request.json();
        const validationResult = UpdateCompanySchema.safeParse(body);

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

        const updateData: UpdateCompanyData = {};
        if (validationResult.data.name !== undefined) {
          updateData.name = validationResult.data.name;
        }
        if (validationResult.data.email !== undefined) {
          updateData.email = validationResult.data.email || undefined;
        }
        if (validationResult.data.settings !== undefined) {
          updateData.settings = validationResult.data.settings;
        }

        const company = await companyService.updateCompany(
          tenantId,
          companyId,
          updateData,
          request.user.id
        );

        return NextResponse.json({
          message: 'Company updated successfully',
          company,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to update company:', error);
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : 'Failed to update company',
            code: 'COMPANY_UPDATE_ERROR',
          },
          { status: 500 }
        );
      }
    }
  )
);

// DELETE /api/tenants/[tenantId]/companies/[companyId]
// Delete a company (owner only)
export const deleteCompanyHandler = withTenantAccess('owner')(
  withResourcePermission('company', 'delete')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
      try {
        const companyService = getCompanyService();
        const { tenantId, companyId } = context.params;

        await companyService.deleteCompany(
          tenantId,
          companyId,
          request.user.id
        );

        return NextResponse.json({
          message: 'Company deleted successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to delete company:', error);
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : 'Failed to delete company',
            code: 'COMPANY_DELETE_ERROR',
          },
          { status: 500 }
        );
      }
    }
  )
);

/**
 * Company User Management Routes
 * 
 * These routes handle user-company relationships within tenants.
 */

// GET /api/tenants/[tenantId]/companies/[companyId]/users
// Get all users in a company
export const getCompanyUsersHandler = withTenantAccess('member')(
  async (request: AuthenticatedRequest, context: RouteContext) => {
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
  }
);

// POST /api/tenants/[tenantId]/companies/[companyId]/users
// Add a user to a company
export const addUserToCompanyHandler = withTenantAccess('admin')(
  withResourcePermission('user', 'write')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
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
            code: 'ADD_USER_ERROR',
          },
          { status: 500 }
        );
      }
    }
  )
);

// PUT /api/tenants/[tenantId]/companies/[companyId]/users/[userId]
// Update user role in company
export const updateUserRoleHandler = withTenantAccess('admin')(
  withResourcePermission('user', 'write')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
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
    }
  )
);

// DELETE /api/tenants/[tenantId]/companies/[companyId]/users/[userId]
// Remove user from company
export const removeUserFromCompanyHandler = withTenantAccess('admin')(
  withResourcePermission('user', 'delete')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
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
            code: 'REMOVE_USER_ERROR',
          },
          { status: 500 }
        );
      }
    }
  )
);

/**
 * Cross-Tenant User Company Routes
 * 
 * These routes handle user companies across all tenants (staff or self only).
 */

// GET /api/users/[userId]/companies
// Get all companies for a user across tenants
export const getUserCompaniesHandler = withStaffAccess('admin')(
  async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const companyService = getCompanyService();
      const { userId } = context.params;

      // Allow users to view their own companies, staff can view any user's companies
      const targetUserId = userId === 'me' ? request.user.id : userId;
      
      const companies = await companyService.getUserCompanies(
        targetUserId,
        request.user.id
      );

      return NextResponse.json({
        companies,
        count: companies.length,
        userId: targetUserId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to get user companies:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to retrieve user companies',
          code: 'USER_COMPANIES_FETCH_ERROR',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Company Statistics Routes
 * 
 * These routes provide company analytics and statistics.
 */

// GET /api/tenants/[tenantId]/companies/[companyId]/statistics
// Get company statistics
export const getCompanyStatisticsHandler = withTenantAccess('member')(
  async (request: AuthenticatedRequest, context: RouteContext) => {
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
  }
);

/**
 * Admin Routes
 * 
 * These routes provide cross-tenant company management for staff users.
 */

// GET /api/admin/companies
// Get all companies across all tenants (staff only)
export const getAllCompaniesHandler = withStaffAccess('admin')(
  async (request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const url = new URL(request.url);
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
      const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

      // This would be implemented as a cross-tenant query in the CompanyService
      // For now, we'll return a placeholder response
      return NextResponse.json({
        companies: [],
        pagination: {
          limit,
          offset,
          total: 0,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to get all companies:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to retrieve companies',
          code: 'ADMIN_COMPANIES_FETCH_ERROR',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Route Definitions Using Utility Functions
 * 
 * These demonstrate how to use the utility functions from the middleware
 * to create clean, consistent API route definitions.
 */

// Tenant-scoped company routes
export const tenantCompanyRoutes = {
  GET: getCompaniesHandler,
  POST: createCompanyHandler,
};

// Specific company routes
export const specificCompanyRoutes = {
  GET: getCompanyHandler,
  PUT: updateCompanyHandler,
  DELETE: deleteCompanyHandler,
};

// Company user management routes
export const companyUserRoutes = {
  GET: getCompanyUsersHandler,
  POST: addUserToCompanyHandler,
};

// Staff-only admin routes
export const adminCompanyRoutes = {
  GET: getAllCompaniesHandler,
};

/**
 * Usage Examples
 * 
 * These examples show how to use the route handlers in actual Next.js API routes.
 */

/*
// app/api/tenants/[tenantId]/companies/route.ts
export { GET, POST } from '@/lib/niledb/examples/company-api-routes';

// app/api/tenants/[tenantId]/companies/[companyId]/route.ts
export { 
  GET as getCompanyHandler,
  PUT as updateCompanyHandler,
  DELETE as deleteCompanyHandler 
} from '@/lib/niledb/examples/company-api-routes';

// app/api/tenants/[tenantId]/companies/[companyId]/users/route.ts
export { 
  GET as getCompanyUsersHandler,
  POST as addUserToCompanyHandler 
} from '@/lib/niledb/examples/company-api-routes';

// app/api/tenants/[tenantId]/companies/[companyId]/users/[userId]/route.ts
export { 
  PUT as updateUserRoleHandler,
  DELETE as removeUserFromCompanyHandler 
} from '@/lib/niledb/examples/company-api-routes';

// app/api/users/[userId]/companies/route.ts
export { GET as getUserCompaniesHandler } from '@/lib/niledb/examples/company-api-routes';

// app/api/admin/companies/route.ts
export { GET as getAllCompaniesHandler } from '@/lib/niledb/examples/company-api-routes';
*/
