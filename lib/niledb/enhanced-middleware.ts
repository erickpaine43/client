/**
 * Enhanced NileDB Middleware System
 * 
 * Comprehensive middleware functions with advanced error handling, logging,
 * performance monitoring, and security features for Next.js API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthService, type UserWithProfile } from './auth';
import { withoutTenantContext } from './client';
import { 
  AuthenticationError,
  TenantAccessError,
  ValidationError,
  RateLimitError,
  createErrorResponse,
  logError,
  withRetry,
  type ErrorLogContext,
} from './errors';

// Enhanced Types
export interface EnhancedRequest extends NextRequest {
  user: UserWithProfile;
  tenantId?: string;
  isStaff?: boolean;
  requestId: string;
  startTime: number;
  context: RequestContext;
}

export interface RequestContext {
  requestId: string;
  userId?: string;
  tenantId?: string;
  companyId?: string;
  operation: string;
  userAgent?: string;
  ip?: string;
  startTime: number;
  [key: string]: unknown;
}

export interface RouteContext {
  params: Awaited<Record<string, string>>;
  user?: UserWithProfile;
  tenant?: { id: string; name: string };
  isStaff: boolean;
  requestId: string;
}

export type EnhancedHandler = (
  request: EnhancedRequest,
  context: RouteContext
) => Promise<NextResponse>;

// Validation Schemas
const UUIDSchema = z.string().uuid();

// Rate Limiting
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  constructor(private config: RateLimitConfig) {}

  check(request: NextRequest): { allowed: boolean; resetTime?: Date } {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request);
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Clean up old entries
    this.cleanup(windowStart);
    
    const entry = this.requests.get(key);
    
    if (!entry) {
      this.requests.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return { allowed: true };
    }
    
    if (entry.resetTime <= now) {
      this.requests.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return { allowed: true };
    }
    
    if (entry.count >= this.config.maxRequests) {
      return { 
        allowed: false, 
        resetTime: new Date(entry.resetTime) 
      };
    }
    
    entry.count++;
    return { allowed: true };
  }

  private getDefaultKey(request: NextRequest): string {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    return `${ip}:${request.nextUrl.pathname}`;
  }

  private cleanup(windowStart: number): void {
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetTime <= windowStart) {
        this.requests.delete(key);
      }
    }
  }
}

// Request Context Utilities
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createRequestContext(request: NextRequest, operation: string): RequestContext {
  return {
    requestId: generateRequestId(),
    operation,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
    startTime: Date.now(),
  };
}

function createExpressStyleRequest(request: NextRequest) {
  return {
    headers: Object.fromEntries(request.headers.entries()),
    cookies: Object.fromEntries(
      request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    ),
  };
}

// Performance Monitoring
interface PerformanceMetrics {
  requestId: string;
  operation: string;
  duration: number;
  statusCode: number;
  userId?: string;
  tenantId?: string;
  error?: string;
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  record(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (metrics.duration > 5000) { // 5 seconds
      console.warn('Slow request detected:', {
        requestId: metrics.requestId,
        operation: metrics.operation,
        duration: metrics.duration,
        userId: metrics.userId,
        tenantId: metrics.tenantId,
      });
    }
  }

  getMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  getAverageResponseTime(operation?: string): number {
    const filtered = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;
    
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }
}

const performanceMonitor = new PerformanceMonitor();

// Enhanced Authentication Middleware
export function withEnhancedAuthentication(
  options: {
    requireProfile?: boolean;
    rateLimit?: RateLimitConfig;
  } = {}
) {
  return function(handler: EnhancedHandler) {
    const rateLimiter = options.rateLimit ? new RateLimiter(options.rateLimit) : null;

    return async (request: NextRequest, { params: paramsPromise }: { params: Promise<Record<string, string>> }) => {
      const requestContext = createRequestContext(request, 'authentication');
      const startTime = Date.now();

      try {
        const params = await paramsPromise;

        // Rate limiting
        if (rateLimiter) {
          const rateCheck = rateLimiter.check(request);
          if (!rateCheck.allowed) {
            throw new RateLimitError(
              'Too many requests',
              options.rateLimit!.maxRequests,
              rateCheck.resetTime
            );
          }
        }

        // Authentication
        const authService = getAuthService();
        const expressReq = createExpressStyleRequest(request);
        
        const user = await withRetry(
          () => authService.validateSession(expressReq),
          { maxRetries: 2, retryDelay: 500 }
        );

        // Profile requirement check
        if (options.requireProfile && !user.profile) {
          throw new AuthenticationError(
            'User profile required',
            'PROFILE_REQUIRED'
          );
        }

        // Enhance request object
        const enhancedRequest = request as EnhancedRequest;
        enhancedRequest.user = user;
        enhancedRequest.requestId = requestContext.requestId;
        enhancedRequest.startTime = startTime;
        enhancedRequest.context = {
          ...requestContext,
          userId: user.id,
        };

        const routeContext: RouteContext = {
          params,
          user,
          isStaff: user.profile?.isPenguinMailsStaff || false,
          requestId: requestContext.requestId,
        };

        // Execute handler
        const response = await handler(enhancedRequest, routeContext);

        // Record performance metrics
        performanceMonitor.record({
          requestId: requestContext.requestId,
          operation: requestContext.operation,
          duration: Date.now() - startTime,
          statusCode: response.status,
          userId: user.id,
          timestamp: new Date().toISOString(),
        });

        return response;

      } catch (error) {
        const errorContext: ErrorLogContext = {
          ...requestContext,
          userId: (request as Partial<EnhancedRequest>).user?.id,
        };

        const { body, status } = createErrorResponse(error, errorContext);

        // Record error metrics
        performanceMonitor.record({
          requestId: requestContext.requestId,
          operation: requestContext.operation,
          duration: Date.now() - startTime,
          statusCode: status,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(body, { status });
      }
    };
  };
}

// Enhanced Tenant Access Middleware
export function withEnhancedTenantAccess(
  requiredRole?: string | string[],
  options: {
    tenantIdParam?: string;
    validateTenantExists?: boolean;
    rateLimit?: RateLimitConfig;
  } = {}
) {
  return function(handler: EnhancedHandler) {
    return withEnhancedAuthentication({
      requireProfile: true,
      rateLimit: options.rateLimit,
    })(async (request, context) => {
      const tenantIdParam = options.tenantIdParam || 'tenantId';
      const tenantId = context.params[tenantIdParam];

      try {
        if (!tenantId) {
          throw new ValidationError('Tenant ID required', {
            [tenantIdParam]: ['Tenant ID parameter is required'],
          });
        }

        // Validate UUID format
        UUIDSchema.parse(tenantId);

        const user = request.user;

        // Staff users can access any tenant
        if (user.profile?.isPenguinMailsStaff) {
          request.isStaff = true;
          request.tenantId = tenantId;

          // Validate tenant exists if required
          if (options.validateTenantExists) {
            const tenantExists = await withRetry(
              () => validateTenantExists(tenantId),
              { maxRetries: 2 }
            );

            if (!tenantExists) {
              throw new TenantAccessError('Tenant not found', tenantId);
            }

            context.tenant = tenantExists;
          }

          context.isStaff = true;
          request.context.tenantId = tenantId;

          return await handler(request, context);
        }

        // Validate regular user access
        const tenantAccess = await withRetry(
          () => validateTenantAccess(user.id, tenantId),
          { maxRetries: 2 }
        );

        if (!tenantAccess.hasAccess) {
          throw new TenantAccessError('Tenant access denied', tenantId);
        }

        // Check role requirements
        if (requiredRole) {
          const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          const userRole = tenantAccess.role;

          if (userRole && !hasRequiredRole(userRole, roles)) {
            throw new AuthenticationError(
              'Insufficient permissions',
              'INSUFFICIENT_ROLE',
              {
                required: roles,
                current: userRole,
                tenantId,
              }
            );
          }
        }

        // Set tenant context
        request.tenantId = tenantId;
        request.context.tenantId = tenantId;
        context.tenant = tenantAccess.tenant;

        return await handler(request, context);

      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ValidationError('Invalid tenant ID format', {
            tenantId: ['Must be a valid UUID'],
          });
        }
        throw error;
      }
    });
  };
}

// Enhanced Staff Access Middleware
export function withEnhancedStaffAccess(
  requiredLevel: string = 'admin',
  options: {
    rateLimit?: RateLimitConfig;
  } = {}
) {
  return function(handler: EnhancedHandler) {
    return withEnhancedAuthentication({
      requireProfile: true,
      rateLimit: options.rateLimit,
    })(async (request, context) => {
      try {
        const user = request.user;

        if (!user.profile?.isPenguinMailsStaff) {
          throw new AuthenticationError(
            'Staff access required',
            'STAFF_ACCESS_REQUIRED'
          );
        }

        // Check staff role level
        const roleHierarchy = { user: 1, admin: 2, super_admin: 3 };
        const userLevel = roleHierarchy[user.profile.role as keyof typeof roleHierarchy] || 0;
        const requiredLevelValue = roleHierarchy[requiredLevel as keyof typeof roleHierarchy] || 999;

        if (userLevel < requiredLevelValue) {
          throw new AuthenticationError(
            'Insufficient staff privileges',
            'INSUFFICIENT_STAFF_LEVEL',
            {
              required: requiredLevel,
              current: user.profile.role,
            }
          );
        }

        request.isStaff = true;
        context.isStaff = true;

        return await handler(request, context);

      } catch (error) {
        throw error;
      }
    });
  };
}

// Input Validation Middleware
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return function(handler: (request: EnhancedRequest, context: RouteContext, body: T) => Promise<NextResponse>) {
    return async (request: EnhancedRequest, context: RouteContext) => {
      try {
        let body: unknown = {};

        if (request.method !== 'GET' && request.method !== 'DELETE') {
          const contentType = request.headers.get('content-type');
          
          if (contentType?.includes('application/json')) {
            body = await request.json();
          } else if (contentType?.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            body = Object.fromEntries(formData.entries());
          }
        }

        const validatedBody = schema.parse(body);
        return await handler(request, context, validatedBody);

      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors: Record<string, string[]> = {};
          
          error.issues.forEach((err: z.ZodIssue) => {
            const path = err.path.join('.');
            if (!validationErrors[path]) {
              validationErrors[path] = [];
            }
            validationErrors[path].push(err.message);
          });

          throw new ValidationError('Input validation failed', validationErrors);
        }
        throw error;
      }
    };
  };
}

// Health Check Middleware
export function withHealthCheck() {
  return function(handler: EnhancedHandler) {
    return async (request: EnhancedRequest, context: RouteContext) => {
      try {
        // Basic health checks before processing request
        const healthChecks = await Promise.allSettled([
          // Database connectivity check
          withoutTenantContext(async (nile) => {
            await nile.db.query('SELECT 1');
          }),
        ]);

        const failedChecks = healthChecks.filter(check => check.status === 'rejected');
        
        if (failedChecks.length > 0) {
          logError(
            new Error('Health check failed before request processing'),
            request.context,
            'warn'
          );
        }

        return await handler(request, context);

      } catch (error) {
        throw error;
      }
    };
  };
}

// Audit Logging Middleware
export function withAuditLogging(operation: string) {
  return function(handler: EnhancedHandler) {
    return async (request: EnhancedRequest, context: RouteContext) => {
      const auditData = {
        operation,
        requestId: request.requestId,
        userId: request.user?.id,
        tenantId: request.tenantId,
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await handler(request, context);
        
        // Log successful operations
        console.info('Audit Log:', {
          ...auditData,
          status: 'success',
          statusCode: response.status,
          duration: Date.now() - request.startTime,
        });

        return response;

      } catch (error) {
        // Log failed operations
        console.error('Audit Log:', {
          ...auditData,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - request.startTime,
        });

        throw error;
      }
    };
  };
}

// Utility Functions
async function validateTenantExists(tenantId: string): Promise<{ id: string; name: string } | null> {
  const result = await withoutTenantContext(async (nile) => {
    return await nile.db.query(
      'SELECT id, name FROM tenants WHERE id = $1 AND deleted IS NULL',
      [tenantId]
    );
  });

  return result.rows[0] || null;
}

async function validateTenantAccess(userId: string, tenantId: string): Promise<{
  hasAccess: boolean;
  role?: string;
  tenant?: { id: string; name: string };
}> {
  const result = await withoutTenantContext(async (nile) => {
    return await nile.db.query(
      `
      SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        tu.roles as tenant_roles,
        COALESCE(
          MAX(CASE uc.role 
            WHEN 'owner' THEN 3 
            WHEN 'admin' THEN 2 
            WHEN 'member' THEN 1 
            ELSE 0 
          END), 0
        ) as max_role_level
      FROM users.tenant_users tu
      JOIN public.tenants t ON tu.tenant_id = t.id
      LEFT JOIN public.user_companies uc ON tu.user_id = uc.user_id AND tu.tenant_id = uc.tenant_id
      WHERE tu.user_id = $1 AND tu.tenant_id = $2 
        AND tu.deleted IS NULL 
        AND t.deleted IS NULL
        AND (uc.deleted IS NULL OR uc.deleted IS NULL)
      GROUP BY t.id, t.name, tu.roles
    `,
      [userId, tenantId]
    );
  });

  if (result.rows.length === 0) {
    return { hasAccess: false };
  }

  const row = result.rows[0];
  const roleMap = { 0: 'member', 1: 'member', 2: 'admin', 3: 'owner' };
  const role = roleMap[row.max_role_level as keyof typeof roleMap] || 'member';

  return {
    hasAccess: true,
    role,
    tenant: {
      id: row.tenant_id,
      name: row.tenant_name,
    },
  };
}

function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy: Record<string, number> = {
    member: 1,
    admin: 2,
    owner: 3,
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = Math.min(
    ...requiredRoles.map(role => roleHierarchy[role] || 999)
  );

  return userLevel >= requiredLevel;
}

// Utility function to create enhanced API route handlers
export function createEnhancedRoute(handlers: {
  GET?: EnhancedHandler;
  POST?: EnhancedHandler;
  PUT?: EnhancedHandler;
  DELETE?: EnhancedHandler;
  PATCH?: EnhancedHandler;
}, options: {
  requireAuth?: boolean;
  requireStaff?: boolean;
  requireTenant?: boolean;
  rateLimit?: RateLimitConfig;
  auditLog?: string;
} = {}) {
  const route: Record<string, unknown> = {};

  Object.entries(handlers).forEach(([method, handler]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wrappedHandler: any = handler;

    // Apply audit logging
    if (options.auditLog) {
      wrappedHandler = withAuditLogging(options.auditLog)(wrappedHandler);
    }

    // Apply health check
    wrappedHandler = withHealthCheck()(wrappedHandler);

    // Apply authentication/authorization
    if (options.requireStaff) {
      wrappedHandler = withEnhancedStaffAccess('admin', { rateLimit: options.rateLimit })(wrappedHandler);
    } else if (options.requireTenant) {
      wrappedHandler = withEnhancedTenantAccess(undefined, { rateLimit: options.rateLimit })(wrappedHandler);
    } else if (options.requireAuth) {
      wrappedHandler = withEnhancedAuthentication({ rateLimit: options.rateLimit })(wrappedHandler);
    }

    route[method] = wrappedHandler;
  });

  return route;
}

// Export performance monitor for monitoring endpoints
export { performanceMonitor };
