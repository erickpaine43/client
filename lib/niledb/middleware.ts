/**
 * NileDB Authentication Middleware
 * 
 * Provides middleware functions for Next.js API routes with NileDB authentication,
 * tenant context management, and role-based access control.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService, type UserWithProfile, AuthenticationError } from './auth';
import { withoutTenantContext } from './client';
import type { Server } from '@niledatabase/server';

// Middleware Types
export interface AuthenticatedRequest extends NextRequest {
  user: UserWithProfile;
  nile?: Server;
  tenantId?: string;
  isStaff?: boolean;
}

export interface RouteContext {
  params: Awaited<Record<string, string>>;
  user?: UserWithProfile;
  tenant?: { id: string; name: string };
  isStaff: boolean;
}

export type AuthenticatedHandler = (
  request: AuthenticatedRequest,
  context: RouteContext
) => Promise<NextResponse>;

// Role Types
export type CompanyRole = 'member' | 'admin' | 'owner';
export type UserRole = 'user' | 'admin' | 'super_admin';

/**
 * Convert Express-style request to Next.js request for NileDB auth
 */
function createExpressStyleRequest(request: NextRequest) {
  return {
    headers: Object.fromEntries(request.headers.entries()),
    cookies: Object.fromEntries(
      request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    ),
  };
}

/**
 * Basic authentication middleware
 */
export function withAuthentication(handler: AuthenticatedHandler) {
  return async (request: NextRequest, { params: paramsPromise }: { params: Promise<Record<string, string>> }) => {
    try {
      const params = await paramsPromise;
      const authService = getAuthService();
      const expressReq = createExpressStyleRequest(request);
      
      const user = await authService.validateSession(expressReq);
      
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;
      
      const routeContext: RouteContext = {
        params,
        user,
        isStaff: user.profile?.isPenguinMailsStaff || false,
      };

      return await handler(authenticatedRequest, routeContext);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code
          },
          { status: error.code === 'AUTH_REQUIRED' ? 401 : 403 }
        );
      }

      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Staff access middleware
 */
export function withStaffAccess(
  requiredLevel: UserRole = 'admin'
) {
  return function(handler: AuthenticatedHandler) {
    return withAuthentication(async (request, context) => {
      try {
        const authService = getAuthService();
        const expressReq = createExpressStyleRequest(request);
        
        const user = await authService.validateStaffAccess(expressReq);
        
        // Check staff role level
        const roleHierarchy = { user: 1, admin: 2, super_admin: 3 };
        const userLevel = roleHierarchy[user.profile?.role || 'user'];
        const requiredLevelValue = roleHierarchy[requiredLevel];

        if (userLevel < requiredLevelValue) {
          return NextResponse.json(
            {
              error: 'Insufficient staff privileges',
              code: 'INSUFFICIENT_STAFF_LEVEL',
              required: requiredLevel,
              current: user.profile?.role,
            },
            { status: 403 }
          );
        }

        request.user = user;
        request.isStaff = true;
        
        context.user = user;
        context.isStaff = true;

        return await handler(request, context);
      } catch (error) {
        if (error instanceof AuthenticationError) {
          return NextResponse.json(
            { 
              error: error.message, 
              code: error.code 
            },
            { status: error.code === 'STAFF_ACCESS_REQUIRED' ? 403 : 401 }
          );
        }

        console.error('Staff access middleware error:', error);
        return NextResponse.json(
          { error: 'Staff access validation failed' },
          { status: 500 }
        );
      }
    });
  };
}

/**
 * Tenant access middleware
 */
export function withTenantAccess(
  requiredRole?: CompanyRole | CompanyRole[],
  tenantIdParam: string = 'tenantId'
) {
  return function(handler: AuthenticatedHandler) {
    return withAuthentication(async (request, context) => {
      try {
        const tenantId = context.params[tenantIdParam];
        
        if (!tenantId) {
          return NextResponse.json(
            { error: 'Tenant ID required', code: 'TENANT_ID_REQUIRED' },
            { status: 400 }
          );
        }

        const user = request.user;

        // Staff users can access any tenant
        if (user.profile?.isPenguinMailsStaff) {
          request.isStaff = true;
          request.tenantId = tenantId;
          
          // Validate tenant exists
          const tenantExists = await withoutTenantContext(async (nile) => {
            const result = await nile.db.query(
              'SELECT id, name FROM tenants WHERE id = $1 AND deleted IS NULL',
              [tenantId]
            );
            return result.rows[0] || null;
          });

          if (!tenantExists) {
            return NextResponse.json(
              { error: 'Tenant not found', code: 'TENANT_NOT_FOUND' },
              { status: 404 }
            );
          }

          context.tenant = tenantExists;
          context.isStaff = true;

          return await handler(request, context);
        }

        // Validate regular user access to tenant
        const tenantAccess = await validateTenantAccess(user.id, tenantId);

        if (!tenantAccess.hasAccess) {
          return NextResponse.json(
            { error: 'Tenant access denied', code: 'TENANT_ACCESS_DENIED' },
            { status: 403 }
          );
        }

        // Check role requirements if specified
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          const userRole = tenantAccess.role;

          if (userRole && !hasRequiredRole(userRole, roles)) {
            return NextResponse.json(
              {
                error: 'Insufficient permissions',
                code: 'INSUFFICIENT_ROLE',
                required: roles,
                current: userRole,
              },
              { status: 403 }
            );
          }
        }

        // Set tenant context
        request.tenantId = tenantId;
        context.tenant = tenantAccess.tenant;

        return await handler(request, context);
      } catch (error) {
        console.error('Tenant access middleware error:', error);
        return NextResponse.json(
          { error: 'Tenant access validation failed' },
          { status: 500 }
        );
      }
    });
  };
}

/**
 * Validate user access to tenant
 */
interface TenantAccessResult {
  hasAccess: boolean;
  role?: CompanyRole;
  tenant?: { id: string; name: string };
  companies: CompanyAccess[];
}

interface CompanyAccess {
  id: string;
  name: string;
  role: CompanyRole;
  permissions: Record<string, unknown>;
}

async function validateTenantAccess(
  userId: string,
  tenantId: string
): Promise<TenantAccessResult> {
  const result = await withoutTenantContext(async (nile) => {
    return await nile.db.query(
      `
      SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        tu.roles as tenant_roles,
        c.id as company_id,
        c.name as company_name,
        uc.role as company_role,
        uc.permissions
      FROM users.tenant_users tu
      JOIN public.tenants t ON tu.tenant_id = t.id
      LEFT JOIN public.user_companies uc ON tu.user_id = uc.user_id AND tu.tenant_id = uc.tenant_id
      LEFT JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
      WHERE tu.user_id = $1 AND tu.tenant_id = $2 
        AND tu.deleted IS NULL 
        AND t.deleted IS NULL
        AND (uc.deleted IS NULL OR uc.deleted IS NULL)
        AND (c.deleted IS NULL OR c.deleted IS NULL)
    `,
      [userId, tenantId]
    );
  });

  if (result.rows.length === 0) {
    return { hasAccess: false, companies: [] };
  }

  const firstRow = result.rows[0];
  
  // Determine highest role across all companies
  const roles = result.rows.map((row: Record<string, unknown>) => row.company_role).filter(Boolean);
  const highestRole = getHighestRole(roles);

  // Build company access list
  const companies = result.rows
    .filter((row: Record<string, unknown>) => row.company_id)
    .map((row: Record<string, unknown>) => ({
      id: row.company_id,
      name: row.company_name,
      role: row.company_role,
      permissions: row.permissions || {},
    }));

  return {
    hasAccess: true,
    role: highestRole,
    tenant: {
      id: firstRow.tenant_id,
      name: firstRow.tenant_name,
    },
    companies,
  };
}

/**
 * Role hierarchy utilities
 */
const COMPANY_ROLE_HIERARCHY = {
  member: 1,
  admin: 2,
  owner: 3,
};

function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  const userLevel = COMPANY_ROLE_HIERARCHY[userRole as CompanyRole] || 0;
  const requiredLevel = Math.min(
    ...requiredRoles.map((role) => COMPANY_ROLE_HIERARCHY[role as CompanyRole] || 999)
  );

  return userLevel >= requiredLevel;
}

function getHighestRole(roles: string[]): CompanyRole {
  if (roles.includes('owner')) return 'owner';
  if (roles.includes('admin')) return 'admin';
  return 'member';
}

/**
 * Resource permission middleware
 */
interface PermissionMatrix {
  [resource: string]: {
    [action: string]: CompanyRole[];
  };
}

const PERMISSIONS: PermissionMatrix = {
  company: {
    read: ['member', 'admin', 'owner'],
    write: ['admin', 'owner'],
    delete: ['owner'],
  },
  user: {
    read: ['admin', 'owner'],
    write: ['admin', 'owner'],
    delete: ['owner'],
    invite: ['admin', 'owner'],
  },
  billing: {
    read: ['admin', 'owner'],
    write: ['owner'],
    delete: ['owner'],
  },
  audit: {
    read: ['admin', 'owner'],
    write: [], // System only
    delete: [], // System only
  },
};

export function withResourcePermission(resource: string, action: string) {
  return function(handler: AuthenticatedHandler) {
    return async (request: AuthenticatedRequest, context: RouteContext) => {
      // Staff users have all permissions
      if (request.isStaff) {
        return await handler(request, context);
      }

      // Get user's role in current tenant
      const userRole = await getUserTenantRole(request.user.id, request.tenantId!);
      
      // Check if user has required permission
      if (!hasPermission(userRole, resource, action)) {
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            resource,
            action,
            required: PERMISSIONS[resource]?.[action] || [],
            current: userRole,
          },
          { status: 403 }
        );
      }

      return await handler(request, context);
    };
  };
}

async function getUserTenantRole(userId: string, tenantId: string): Promise<CompanyRole> {
  const result = await withoutTenantContext(async (nile) => {
    return await nile.db.query(
      `
      SELECT uc.role
      FROM public.user_companies uc
      WHERE uc.user_id = $1 AND uc.tenant_id = $2 AND uc.deleted IS NULL
      ORDER BY 
        CASE uc.role 
          WHEN 'owner' THEN 3 
          WHEN 'admin' THEN 2 
          WHEN 'member' THEN 1 
          ELSE 0 
        END DESC
      LIMIT 1
    `,
      [userId, tenantId]
    );
  });

  return result.rows[0]?.role || 'member';
}

function hasPermission(
  userRole: CompanyRole,
  resource: string,
  action: string
): boolean {
  const resourcePermissions = PERMISSIONS[resource];
  if (!resourcePermissions) return false;

  const actionPermissions = resourcePermissions[action];
  if (!actionPermissions) return false;

  return actionPermissions.includes(userRole);
}

/**
 * Utility function to create API route handlers with authentication
 */
export function createAuthenticatedRoute(handlers: {
  GET?: AuthenticatedHandler;
  POST?: AuthenticatedHandler;
  PUT?: AuthenticatedHandler;
  DELETE?: AuthenticatedHandler;
  PATCH?: AuthenticatedHandler;
}) {
  const route: Record<string, unknown> = {};

  Object.entries(handlers).forEach(([method, handler]) => {
    route[method] = withAuthentication(handler);
  });

  return route;
}

/**
 * Utility function to create tenant-scoped API route handlers
 */
export function createTenantRoute(
  handlers: {
    GET?: AuthenticatedHandler;
    POST?: AuthenticatedHandler;
    PUT?: AuthenticatedHandler;
    DELETE?: AuthenticatedHandler;
    PATCH?: AuthenticatedHandler;
  },
  requiredRole?: CompanyRole | CompanyRole[]
) {
  const route: Record<string, unknown> = {};

  Object.entries(handlers).forEach(([method, handler]) => {
    route[method] = withTenantAccess(requiredRole)(handler);
  });

  return route;
}

/**
 * Utility function to create staff-only API route handlers
 */
export function createStaffRoute(
  handlers: {
    GET?: AuthenticatedHandler;
    POST?: AuthenticatedHandler;
    PUT?: AuthenticatedHandler;
    DELETE?: AuthenticatedHandler;
    PATCH?: AuthenticatedHandler;
  },
  requiredLevel: UserRole = 'admin'
) {
  const route: Record<string, unknown> = {};

  Object.entries(handlers).forEach(([method, handler]) => {
    route[method] = withStaffAccess(requiredLevel)(handler);
  });

  return route;
}
