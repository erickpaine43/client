/**
 * Example API Routes for Tenant Management
 * 
 * Demonstrates how to use the TenantService with the authentication middleware
 * from Task 4 to create secure, tenant-aware API endpoints.
 */

import { NextResponse } from 'next/server';
import { withAuthentication, withTenantAccess, withStaffAccess, withResourcePermission } from '../middleware';
import { getTenantService } from '../tenant';
import type { AuthenticatedRequest, RouteContext } from '../middleware';

interface UpdateTenantRequest {
  name?: string;
  subscriptionPlan?: string;
  billingStatus?: 'active' | 'suspended' | 'cancelled';
}

interface AddUserRequest {
  userId: string;
  roles?: string[];
}

interface UpdateRolesRequest {
  roles: string[];
}

interface CreateTenantRequest {
  name: string;
  subscriptionPlan?: string;
  billingStatus?: 'active' | 'suspended' | 'cancelled';
}

interface AdminTenantRow {
  id: string;
  name: string;
  created: string;
  updated: string;
  user_count: string;
  company_count: string;
  subscription_status: string;
  plan: string;
}

/**
 * GET /api/tenants/:tenantId
 * Get tenant information (member access required)
 */
export const getTenant = withTenantAccess('member')(
  async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const tenantService = getTenantService();
      const { tenantId } = context.params;

      const tenant = await tenantService.getTenantById(tenantId);

      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ tenant });
    } catch (error) {
      console.error('Failed to get tenant:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve tenant' },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/tenants/:tenantId
 * Update tenant information (admin access required)
 */
export const updateTenant = withTenantAccess('admin')(
  withResourcePermission('company', 'write')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
      try {
        const tenantService = getTenantService();
        const { tenantId } = context.params;
        const body = await request.json() as UpdateTenantRequest;

        const { name, subscriptionPlan, billingStatus } = body;

        const updatedTenant = await tenantService.updateTenant(
          tenantId,
          { name, subscriptionPlan, billingStatus },
          request.user.id
        );

        return NextResponse.json({ tenant: updatedTenant });
      } catch (error) {
        console.error('Failed to update tenant:', error);
        return NextResponse.json(
          { error: 'Failed to update tenant' },
          { status: 500 }
        );
      }
    }
  )
);

/**
 * GET /api/tenants/:tenantId/users
 * Get all users in a tenant (admin access required)
 */
export const getTenantUsers = withTenantAccess('admin')(
  withResourcePermission('user', 'read')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
      try {
        const tenantService = getTenantService();
        const { tenantId } = context.params;

        const users = await tenantService.getTenantUsers(tenantId, request.user.id);

        return NextResponse.json({ users });
      } catch (error) {
        console.error('Failed to get tenant users:', error);
        return NextResponse.json(
          { error: 'Failed to retrieve tenant users' },
          { status: 500 }
        );
      }
    }
  )
);

/**
 * POST /api/tenants/:tenantId/users
 * Add user to tenant (admin access required)
 */
export const addUserToTenant = withTenantAccess('admin')(
  withResourcePermission('user', 'write')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
      try {
        const tenantService = getTenantService();
        const { tenantId } = context.params;
        const body = await request.json() as AddUserRequest;

        const { userId, roles = ['member'] } = body;

        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          );
        }

        await tenantService.addUserToTenant(
          userId,
          tenantId,
          roles,
          request.user.id
        );

        return NextResponse.json(
          { message: 'User added to tenant successfully' },
          { status: 201 }
        );
      } catch (error) {
        console.error('Failed to add user to tenant:', error);
        return NextResponse.json(
          { error: 'Failed to add user to tenant' },
          { status: 500 }
        );
      }
    }
  )
);

/**
 * DELETE /api/tenants/:tenantId/users/:userId
 * Remove user from tenant (admin access required)
 */
export const removeUserFromTenant = withTenantAccess('admin')(
  withResourcePermission('user', 'delete')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
      try {
        const tenantService = getTenantService();
        const { tenantId, userId } = context.params;

        await tenantService.removeUserFromTenant(
          userId,
          tenantId,
          request.user.id
        );

        return NextResponse.json(
          { message: 'User removed from tenant successfully' }
        );
      } catch (error) {
        console.error('Failed to remove user from tenant:', error);
        return NextResponse.json(
          { error: 'Failed to remove user from tenant' },
          { status: 500 }
        );
      }
    }
  )
);

/**
 * PUT /api/tenants/:tenantId/users/:userId/roles
 * Update user roles in tenant (admin access required)
 */
export const updateUserTenantRoles = withTenantAccess('admin')(
  withResourcePermission('user', 'write')(
    async (request: AuthenticatedRequest, context: RouteContext) => {
      try {
        const tenantService = getTenantService();
        const { tenantId, userId } = context.params;
        const body = await request.json() as UpdateRolesRequest;

        const { roles } = body;

        if (!Array.isArray(roles)) {
          return NextResponse.json(
            { error: 'Roles must be an array' },
            { status: 400 }
          );
        }

        await tenantService.updateUserTenantRoles(
          userId,
          tenantId,
          roles,
          request.user.id
        );

        return NextResponse.json(
          { message: 'User roles updated successfully' }
        );
      } catch (error) {
        console.error('Failed to update user roles:', error);
        return NextResponse.json(
          { error: 'Failed to update user roles' },
          { status: 500 }
        );
      }
    }
  )
);

/**
 * GET /api/user/tenants
 * Get all tenants for the current user
 */
export const getUserTenants = withAuthentication(
  async (request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const tenantService = getTenantService();

      const tenants = await tenantService.getUserTenants(request.user.id);

      return NextResponse.json({ tenants });
    } catch (error) {
      console.error('Failed to get user tenants:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve user tenants' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/tenants
 * Create a new tenant (authenticated users only)
 */
export const createTenant = withAuthentication(
  async (request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const tenantService = getTenantService();
      const body = await request.json() as CreateTenantRequest;

      const { name, subscriptionPlan, billingStatus } = body;

      if (!name) {
        return NextResponse.json(
          { error: 'Tenant name is required' },
          { status: 400 }
        );
      }

      const tenant = await tenantService.createTenant(
        name,
        request.user.id, // Creator becomes owner
        { subscriptionPlan, billingStatus }
      );

      return NextResponse.json({ tenant }, { status: 201 });
    } catch (error) {
      console.error('Failed to create tenant:', error);
      return NextResponse.json(
        { error: 'Failed to create tenant' },
        { status: 500 }
      );
    }
  }
);

/**
 * GET /api/tenants/:tenantId/statistics
 * Get tenant statistics (admin access required)
 */
export const getTenantStatistics = withTenantAccess('admin')(
  async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const tenantService = getTenantService();
      const { tenantId } = context.params;

      const statistics = await tenantService.getTenantStatistics(
        tenantId,
        request.user.id
      );

      return NextResponse.json({ statistics });
    } catch (error) {
      console.error('Failed to get tenant statistics:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve tenant statistics' },
        { status: 500 }
      );
    }
  }
);

/**
 * Staff-only routes for cross-tenant administration
 */

/**
 * GET /api/admin/tenants
 * Get all tenants (staff only)
 */
export const getAllTenants = withStaffAccess('admin')(
  async (_request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const tenantService = getTenantService();

      // Use withoutTenantContext for cross-tenant queries
      const tenants = await tenantService.withoutTenantContext(async (nile) => {
        const result = await nile.db.query(`
          SELECT 
            t.id,
            t.name,
            t.created,
            t.updated,
            COUNT(DISTINCT tu.user_id) as user_count,
            COUNT(DISTINCT c.id) as company_count,
            tb.subscription_status,
            tb.plan
          FROM tenants t
          LEFT JOIN users.tenant_users tu ON t.id = tu.tenant_id AND tu.deleted IS NULL
          LEFT JOIN public.companies c ON t.id = c.tenant_id AND c.deleted IS NULL
          LEFT JOIN public.tenant_billing tb ON t.id = tb.tenant_id AND tb.deleted IS NULL
          WHERE t.deleted IS NULL
          GROUP BY t.id, t.name, t.created, t.updated, tb.subscription_status, tb.plan
          ORDER BY t.created DESC
        `);

        return result.rows.map((row: AdminTenantRow) => ({
          id: row.id,
          name: row.name,
          created: row.created,
          updated: row.updated,
          userCount: parseInt(row.user_count || '0'),
          companyCount: parseInt(row.company_count || '0'),
          subscriptionStatus: row.subscription_status || 'unknown',
          plan: row.plan || 'free',
        }));
      });

      return NextResponse.json({ tenants });
    } catch (error) {
      console.error('Failed to get all tenants:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve tenants' },
        { status: 500 }
      );
    }
  }
);

/**
 * GET /api/admin/tenants/:tenantId
 * Get detailed tenant information (staff only)
 */
export const getAdminTenantDetails = withStaffAccess('admin')(
  async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const tenantService = getTenantService();
      const { tenantId } = context.params;

      const [tenant, statistics, users] = await Promise.all([
        tenantService.getTenantById(tenantId),
        tenantService.getTenantStatistics(tenantId, request.user.id),
        tenantService.getTenantUsers(tenantId, request.user.id),
      ]);

      if (!tenant) {
        return NextResponse.json(
          { error: 'Tenant not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        tenant,
        statistics,
        users,
      });
    } catch (error) {
      console.error('Failed to get admin tenant details:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve tenant details' },
        { status: 500 }
      );
    }
  }
);

/**
 * Example Next.js API route file structure
 * 
 * File: app/api/tenants/[tenantId]/route.ts
 */
export const tenantRouteHandlers = {
  GET: getTenant,
  PUT: updateTenant,
};

/**
 * File: app/api/tenants/[tenantId]/users/route.ts
 */
export const tenantUsersRouteHandlers = {
  GET: getTenantUsers,
  POST: addUserToTenant,
};

/**
 * File: app/api/tenants/[tenantId]/users/[userId]/route.ts
 */
export const tenantUserRouteHandlers = {
  DELETE: removeUserFromTenant,
};

/**
 * File: app/api/tenants/[tenantId]/users/[userId]/roles/route.ts
 */
export const tenantUserRolesRouteHandlers = {
  PUT: updateUserTenantRoles,
};

/**
 * File: app/api/user/tenants/route.ts
 */
export const userTenantsRouteHandlers = {
  GET: getUserTenants,
};

/**
 * File: app/api/tenants/route.ts
 */
export const tenantsRouteHandlers = {
  POST: createTenant,
};

/**
 * File: app/api/tenants/[tenantId]/statistics/route.ts
 */
export const tenantStatisticsRouteHandlers = {
  GET: getTenantStatistics,
};

/**
 * File: app/api/admin/tenants/route.ts
 */
export const adminTenantsRouteHandlers = {
  GET: getAllTenants,
};

/**
 * File: app/api/admin/tenants/[tenantId]/route.ts
 */
export const adminTenantDetailsRouteHandlers = {
  GET: getAdminTenantDetails,
};
