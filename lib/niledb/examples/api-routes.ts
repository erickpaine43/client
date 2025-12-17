/**
 * Example API Routes using NileDB Authentication
 * 
 * Demonstrates how to use the authentication service and middleware
 * in Next.js API routes with proper error handling and access control.
 */

import { NextResponse } from 'next/server';
import {
  withAuthentication,
  withTenantAccess,
  withResourcePermission,
  createAuthenticatedRoute,
  createTenantRoute,
  createStaffRoute,
  type AuthenticatedRequest,
  type RouteContext,
} from '../middleware';
import { getAuthService, type UserProfileUpdates } from '../auth';
import { withTenantContext, withoutTenantContext } from '../client';

// Example 1: Basic authenticated route
// app/api/user/profile/route.ts
export const userProfileRoute = createAuthenticatedRoute({
  GET: async (request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const user = request.user;
      
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve user profile' },
        { status: 500 }
      );
    }
  },

  PUT: async (request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const user = request.user;
      const updates = await request.json() as UserProfileUpdates;
      
      const authService = getAuthService();
      const updatedUser = await authService.updateUserProfile(user.id, updates);
      
      return NextResponse.json({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }
  },
});

// Example 2: Tenant-scoped route with role requirements
// app/api/tenants/[tenantId]/companies/route.ts
export const companiesRoute = createTenantRoute({
  GET: async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const tenantId = context.params.tenantId;
      
      const companies = await withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(`
          SELECT id, name, email, settings, created, updated
          FROM companies
          WHERE deleted IS NULL
          ORDER BY name
        `);
      });

      return NextResponse.json({ companies: companies.rows });
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }
  },

  POST: async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const tenantId = context.params.tenantId;
      const { name, email, settings } = await request.json() as {
        name: string;
        email?: string;
        settings?: Record<string, unknown>;
      };

      if (!name) {
        return NextResponse.json(
          { error: 'Company name is required' },
          { status: 400 }
        );
      }

      const company = await withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          INSERT INTO companies (tenant_id, name, email, settings)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, email, settings, created
        `,
          [tenantId, name, email || null, settings || {}]
        );
      });

      return NextResponse.json(
        { company: company.rows[0] },
        { status: 201 }
      );
    } catch (error) {
      console.error('Failed to create company:', error);
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      );
    }
  },
}, 'member'); // Requires at least 'member' role

// Example 3: Company management with admin role requirement
// app/api/tenants/[tenantId]/companies/[companyId]/route.ts
export const companyManagementRoute = {
  GET: withTenantAccess('member')(async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const { tenantId, companyId } = context.params;
      
      const company = await withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            c.id, c.name, c.email, c.settings, c.created, c.updated,
            COUNT(uc.user_id) as user_count
          FROM companies c
          LEFT JOIN user_companies uc ON c.id = uc.company_id 
            AND c.tenant_id = uc.tenant_id 
            AND uc.deleted IS NULL
          WHERE c.id = $1 AND c.deleted IS NULL
          GROUP BY c.id, c.name, c.email, c.settings, c.created, c.updated
        `,
          [companyId]
        );
      });

      if (company.rows.length === 0) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ company: company.rows[0] });
    } catch (error) {
      console.error('Failed to fetch company:', error);
      return NextResponse.json(
        { error: 'Failed to fetch company' },
        { status: 500 }
      );
    }
  }),

  PUT: withTenantAccess('admin')(
    withResourcePermission('company', 'write')(
      async (request: AuthenticatedRequest, context: RouteContext) => {
        try {
          const { tenantId, companyId } = context.params;
          const updates = await request.json() as Record<string, unknown>;

          const company = await withTenantContext(tenantId, async (nile) => {
            const setClause = Object.keys(updates)
              .map((key, index) => `${key} = $${index + 2}`)
              .join(', ');
            
            const values = [companyId, ...Object.values(updates)];
            
            return await nile.db.query(
              `
              UPDATE companies 
              SET ${setClause}, updated = CURRENT_TIMESTAMP
              WHERE id = $1 AND deleted IS NULL
              RETURNING id, name, email, settings, updated
            `,
              values
            );
          });

          if (company.rows.length === 0) {
            return NextResponse.json(
              { error: 'Company not found' },
              { status: 404 }
            );
          }

          return NextResponse.json({ company: company.rows[0] });
        } catch (error) {
          console.error('Failed to update company:', error);
          return NextResponse.json(
            { error: 'Failed to update company' },
            { status: 500 }
          );
        }
      }
    )
  ),

  DELETE: withTenantAccess('owner')(
    withResourcePermission('company', 'delete')(
      async (request: AuthenticatedRequest, context: RouteContext) => {
        try {
          const { tenantId, companyId } = context.params;

          const result = await withTenantContext(tenantId, async (nile) => {
            return await nile.db.query(
              `
              UPDATE companies 
              SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
              WHERE id = $1 AND deleted IS NULL
              RETURNING id
            `,
              [companyId]
            );
          });

          if (result.rows.length === 0) {
            return NextResponse.json(
              { error: ' found' },
              { status: 404 }
            );
          }

          return NextResponse.json({ success: true });
        } catch (error) {
          console.error('Failed to delete company:', error);
          return NextResponse.json(
            { error: 'Failed to delete company' },
            { status: 500 }
          );
        }
      }
    )
  ),
};

// Example 4: Staff-only administrative routes
// app/api/admin/users/route.ts
export const adminUsersRoute = createStaffRoute({
  GET: async (request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      const users = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            u.id,
            u.email,
            u.name,
            u.created,
            u.email_verified,
            up.role,
            up.is_penguinmails_staff,
            COUNT(DISTINCT tu.tenant_id) as tenant_count,
            COUNT(DISTINCT uc.company_id) as company_count
          FROM users.users u
          LEFT JOIN public.user_profiles up ON u.id = up.user_id AND up.deleted IS NULL
          LEFT JOIN users.tenant_users tu ON u.id = tu.user_id AND tu.deleted IS NULL
          LEFT JOIN public.user_companies uc ON u.id = uc.user_id AND uc.deleted IS NULL
          WHERE u.deleted IS NULL
          GROUP BY u.id, u.email, u.name, u.created, u.email_verified, up.role, up.is_penguinmails_staff
          ORDER BY u.created DESC
          LIMIT $1 OFFSET $2
        `,
          [limit, offset]
        );
      });

      const totalResult = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT COUNT(*) as total FROM users.users WHERE deleted IS NULL'
        );
      });

      return NextResponse.json({
        users: users.rows,
        pagination: {
          page,
          limit,
          total: parseInt(totalResult.rows[0].total),
          totalPages: Math.ceil(totalResult.rows[0].total / limit),
        },
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
  },
}, 'admin');

// Example 5: Cross-tenant analytics (staff only)
// app/api/admin/analytics/overview/route.ts
export const adminAnalyticsRoute = createStaffRoute({
  GET: async (_request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const stats = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT 
            (SELECT COUNT(*) FROM public.tenants WHERE deleted IS NULL) as total_tenants,
            (SELECT COUNT(*) FROM users.users WHERE deleted IS NULL) as total_users,
            (SELECT COUNT(*) FROM public.companies WHERE deleted IS NULL) as total_companies,
            (SELECT COUNT(*) FROM public.user_companies WHERE deleted IS NULL) as total_relationships,
            (SELECT COUNT(*) FROM public.user_profiles WHERE is_penguinmails_staff = true) as staff_users,
            (SELECT COUNT(DISTINCT tenant_id) FROM public.tenant_billing WHERE subscription_status = 'active') as active_subscriptions
        `);
      });

      const recentActivity = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT 
            'user_created' as activity_type,
            u.email as description,
            u.created as timestamp
          FROM users.users u
          WHERE u.created > NOW() - INTERVAL '7 days' AND u.deleted IS NULL
          
          UNION ALL
          
          SELECT 
            'tenant_created' as activity_type,
            t.name as description,
            t.created as timestamp
          FROM public.tenants t
          WHERE t.created > NOW() - INTERVAL '7 days' AND t.deleted IS NULL
          
          ORDER BY timestamp DESC
          LIMIT 20
        `);
      });

      return NextResponse.json({
        stats: stats.rows[0],
        recentActivity: recentActivity.rows,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }
  },
}, 'super_admin');

// Example 6: User management within tenant
// app/api/tenants/[tenantId]/users/route.ts
export const tenantUsersRoute = createTenantRoute({
  GET: async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const tenantId = context.params.tenantId;
      
      const users = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            u.id,
            u.email,
            u.name,
            uc.role as company_role,
            uc.permissions,
            c.name as company_name,
            tu.created as joined_at
          FROM users.tenant_users tu
          JOIN users.users u ON tu.user_id = u.id
          LEFT JOIN public.user_companies uc ON u.id = uc.user_id AND tu.tenant_id = uc.tenant_id
          LEFT JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
          WHERE tu.tenant_id = $1 
            AND tu.deleted IS NULL 
            AND u.deleted IS NULL
            AND (uc.deleted IS NULL OR uc.deleted IS NULL)
            AND (c.deleted IS NULL OR c.deleted IS NULL)
          ORDER BY tu.created DESC
        `,
          [tenantId]
        );
      });

      return NextResponse.json({ users: users.rows });
    } catch (error) {
      console.error('Failed to fetch tenant users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenant users' },
        { status: 500 }
      );
    }
  },

  POST: async (request: AuthenticatedRequest, context: RouteContext) => {
    try {
      const tenantId = context.params.tenantId;
      const { email, role = 'member', companyId } = await request.json() as {
        email: string;
        role?: 'member' | 'admin' | 'owner';
        companyId?: string;
      };

      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        );
      }

      // Check if user exists
      const existingUser = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT id FROM users.users WHERE email = $1 AND deleted IS NULL',
          [email]
        );
      });

      if (existingUser.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const userId = existingUser.rows[0].id;

      // Add user to tenant
      await withoutTenantContext(async (nile) => {
        await nile.db.query(
          `
          INSERT INTO users.tenant_users (tenant_id, user_id, email)
          VALUES ($1, $2, $3)
          ON CONFLICT (tenant_id, user_id) DO NOTHING
        `,
          [tenantId, userId, email]
        );
      });

      // Add user to company if specified
      if (companyId) {
        await withTenantContext(tenantId, async (nile) => {
          await nile.db.query(
            `
            INSERT INTO user_companies (tenant_id, user_id, company_id, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (tenant_id, user_id, company_id) DO UPDATE SET
              role = EXCLUDED.role,
              updated = CURRENT_TIMESTAMP
          `,
            [tenantId, userId, companyId, role]
          );
        });
      }

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
  },
}, 'admin');

// Example 7: Health check with authentication status
// app/api/health/auth/route.ts
export const authHealthRoute = {
  GET: withAuthentication(async (request: AuthenticatedRequest, _context: RouteContext) => {
    try {
      const user = request.user;
      
      // Test database connectivity
      const dbTest = await withoutTenantContext(async (nile) => {
        return await nile.db.query('SELECT 1 as test');
      });

      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          isStaff: user.profile?.isPenguinMailsStaff || false,
          tenantCount: user.tenants?.length || 0,
        },
        database: {
          connected: dbTest.rows.length > 0,
        },
      });
    } catch (error) {
      console.error('Auth health check failed:', error);
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }),
};
