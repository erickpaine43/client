/**
 * Enhanced Middleware Test Suite
 * 
 * Comprehensive tests for the enhanced middleware system including
 * error handling, validation, rate limiting, and monitoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  EnhancedRequest,
  withEnhancedAuthentication,
  withEnhancedTenantAccess,
  withEnhancedStaffAccess,
  withValidation,
  createEnhancedRoute,
} from '../enhanced-middleware';
import { getAuthService } from '../auth';
import { withoutTenantContext } from '../client';
import { AuthenticationError } from '../errors';
import { z } from 'zod';

// Mock dependencies
jest.mock('../auth');
jest.mock('../client', () => ({
  withoutTenantContext: jest.fn(),
}));

const mockAuthService = {
  validateSession: jest.fn(),
  validateStaffAccess: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (getAuthService as jest.Mock).mockReturnValue(mockAuthService);
});

// Test utilities
function createMockRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  headers: Record<string, string> = {},
  body?: unknown
): NextRequest {
  const request = new NextRequest(url, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  // Mock cookies
  Object.defineProperty(request, 'cookies', {
    value: {
      getAll: () => [{ name: 'session', value: 'test-session' }],
    },
  });

  return request;
}

function createMockContext(params: Record<string, string> = {}) {
  return {
    params: Promise.resolve(params)
  };
}

function createMockRouteContext(params: Record<string, string> = {}) {
  return {
    params,
    isStaff: false,
    requestId: 'test-request-id',
  };
}

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  profile: {
    userId: 'user-123',
    role: 'admin' as const,
    isPenguinMailsStaff: false,
    preferences: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const mockStaffUser = {
  ...mockUser,
  profile: {
    ...mockUser.profile,
    isPenguinMailsStaff: true,
    role: 'super_admin' as const,
  },
};

describe('Enhanced Authentication Middleware', () => {
  test('should authenticate valid user', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);

    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const middleware = withEnhancedAuthentication()(handler);

    const request = createMockRequest();
    const context = createMockContext();

    const response = await middleware(request, context);

    expect(mockAuthService.validateSession).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('should reject unauthenticated request', async () => {
    mockAuthService.validateSession.mockRejectedValue(
      new AuthenticationError('Authentication required')
    );

    const handler = jest.fn();
    const middleware = withEnhancedAuthentication()(handler);

    const request = createMockRequest();
    const context = createMockContext();

    const response = await middleware(request, context);

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect((body as Record<string, unknown>).error).toBe('Authentication required');
    expect((body as Record<string, unknown>).code).toBe('AUTH_REQUIRED');
  });

  test('should enforce rate limiting', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);

    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const middleware = withEnhancedAuthentication({
      rateLimit: {
        windowMs: 60000,
        maxRequests: 1,
      },
    })(handler);

    const request1 = createMockRequest();
    const request2 = createMockRequest();
    const context = createMockContext();

    // First request should succeed
    const response1 = await middleware(request1, context);
    expect(response1.status).toBe(200);

    // Second request should be rate limited
    const response2 = await middleware(request2, context);
    expect(response2.status).toBe(429);

    const body = await response2.json();
    expect((body as Record<string, unknown>).code).toBe('RATE_LIMIT_EXCEEDED');
  });

  test('should require profile when specified', async () => {
    const userWithoutProfile = { ...mockUser, profile: undefined };
    mockAuthService.validateSession.mockResolvedValue(userWithoutProfile);

    const handler = jest.fn();
    const middleware = withEnhancedAuthentication({ requireProfile: true })(handler);

    const request = createMockRequest();
    const context = createMockContext();

    const response = await middleware(request, context);

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect((body as Record<string, unknown>).code).toBe('PROFILE_REQUIRED');
  });
});

describe('Enhanced Tenant Access Middleware', () => {
  test('should allow staff access to any tenant', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockStaffUser);
    (withoutTenantContext as jest.Mock).mockImplementation(async (callback) => {
      return await callback({
        db: {
          query: jest.fn().mockResolvedValue({
            rows: [{ id: 'tenant-123', name: 'Test Tenant' }],
          }),
        },
      });
    });

    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const middleware = withEnhancedTenantAccess()(handler);

    const request = createMockRequest();
    const context = createMockContext({ tenantId: 'tenant-123' });

    const response = await middleware(request, context);

    expect(handler).toHaveBeenCalled();
    expect(response.status).toBe(200);

    const handlerCall = handler.mock.calls[0];
    expect(handlerCall[0].isStaff).toBe(true);
    expect(handlerCall[1].isStaff).toBe(true);
  });

  test('should validate regular user tenant access', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);
    (withoutTenantContext as jest.Mock).mockImplementation(async (callback) => {
      return await callback({
        db: {
          query: jest.fn().mockResolvedValue({
            rows: [{
              tenant_id: 'tenant-123',
              tenant_name: 'Test Tenant',
              max_role_level: 2, // admin
            }],
          }),
        },
      });
    });

    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const middleware = withEnhancedTenantAccess('member')(handler);

    const request = createMockRequest();
    const context = createMockContext({ tenantId: 'tenant-123' });

    const response = await middleware(request, { params: Promise.resolve(context.params) });

    expect(handler).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('should reject access to non-existent tenant', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);
    (withoutTenantContext as jest.Mock).mockImplementation(async (callback) => {
      return await callback({
        db: {
          query: jest.fn().mockResolvedValue({ rows: [] }),
        },
      });
    });

    const handler = jest.fn();
    const middleware = withEnhancedTenantAccess()(handler);

    const request = createMockRequest();
    const context = createMockContext({ tenantId: 'nonexistent-tenant' });

    const response = await middleware(request, { params: Promise.resolve(context.params) });

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);

    const body = await response.json();
    expect((body as Record<string, unknown>).code).toBe('TENANT_ACCESS_DENIED');
  });

  test('should validate tenant ID format', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);

    const handler = jest.fn();
    const middleware = withEnhancedTenantAccess()(handler);

    const request = createMockRequest();
    const context = createMockContext({ tenantId: 'invalid-uuid' });

    const response = await middleware(request, { params: Promise.resolve(context.params) });

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(400);

    const body = await response.json();
    expect((body as Record<string, unknown>).code).toBe('VALIDATION_ERROR');
  });

  test('should enforce role requirements', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);
    (withoutTenantContext as jest.Mock).mockImplementation(async (callback) => {
      return await callback({
        db: {
          query: jest.fn().mockResolvedValue({
            rows: [{
              tenant_id: 'tenant-123',
              tenant_name: 'Test Tenant',
              max_role_level: 1, // member
            }],
          }),
        },
      });
    });

    const handler = jest.fn();
    const middleware = withEnhancedTenantAccess('admin')(handler); // Requires admin

    const request = createMockRequest();
    const context = createMockContext({ tenantId: 'tenant-123' });

    const response = await middleware(request, { params: Promise.resolve(context.params) });

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect((body as Record<string, unknown>).code).toBe('INSUFFICIENT_ROLE');
  });
});

describe('Enhanced Staff Access Middleware', () => {
  test('should allow staff user access', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockStaffUser);

    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const middleware = withEnhancedStaffAccess('admin')(handler);

    const request = createMockRequest();
    const context = createMockContext();

    const response = await middleware(request, context);

    expect(handler).toHaveBeenCalled();
    expect(response.status).toBe(200);

    const handlerCall = handler.mock.calls[0];
    expect(handlerCall[0].isStaff).toBe(true);
    expect(handlerCall[1].isStaff).toBe(true);
  });

  test('should reject non-staff user', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);

    const handler = jest.fn();
    const middleware = withEnhancedStaffAccess()(handler);

    const request = createMockRequest();
    const context = createMockContext();

    const response = await middleware(request, context);

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect((body as Record<string, unknown>).code).toBe('STAFF_ACCESS_REQUIRED');
  });

  test('should enforce staff role hierarchy', async () => {
    const adminStaffUser = {
      ...mockStaffUser,
      profile: {
        ...mockStaffUser.profile,
        role: 'admin' as const,
      },
    };

    mockAuthService.validateSession.mockResolvedValue(adminStaffUser);

    const handler = jest.fn();
    const middleware = withEnhancedStaffAccess('super_admin')(handler); // Requires super_admin

    const request = createMockRequest();
    const context = createMockContext();

    const response = await middleware(request, context);

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect((body as Record<string, unknown>).code).toBe('INSUFFICIENT_STAFF_LEVEL');
  });
});

describe('Input Validation Middleware', () => {
  const TestSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(0).optional(),
  });

  test('should validate valid input', async () => {
    const validData = {
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
    };

    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const middleware = withValidation(TestSchema)(handler);

    const request = createMockRequest('POST', 'http://localhost:3000/api/test', {
      'content-type': 'application/json',
    });
    
    // Mock request.json()
    jest.spyOn(request, 'json').mockResolvedValue(validData);

    const context = createMockRouteContext();

    const response = await middleware(request as unknown as EnhancedRequest, context);

    expect(handler).toHaveBeenCalledWith(request, context, validData);
    expect(response.status).toBe(200);
  });

  test('should reject invalid input', async () => {
    const invalidData = {
      name: '', // Invalid: empty string
      email: 'invalid-email', // Invalid: not an email
      age: -5, // Invalid: negative number
    };

    const handler = jest.fn();
    const middleware = withValidation(TestSchema)(handler);

    const request = createMockRequest('POST', 'http://localhost:3000/api/test', {
      'content-type': 'application/json',
    });
    
    jest.spyOn(request, 'json').mockResolvedValue(invalidData);

    const response = await middleware(request as EnhancedRequest, createMockRouteContext());

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(400);

    const body = await response.json();
    expect((body as Record<string, unknown>).code).toBe('VALIDATION_ERROR');
    expect((body as { code: string; context: { validationErrors: Record<string, string[]> } }).context.validationErrors).toBeDefined();
  });

  test('should handle form data input', async () => {
    const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const middleware = withValidation(TestSchema)(handler);

    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');

    const request = createMockRequest('POST', 'http://localhost:3000/api/test', {
      'content-type': 'application/x-www-form-urlencoded',
    });
    
    jest.spyOn(request, 'formData').mockResolvedValue(formData);

    const response = await middleware(request as EnhancedRequest, createMockRouteContext());

    expect(handler).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
});

describe('Enhanced Route Creation', () => {
  test('should create route with authentication', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);

    const handlers = {
      GET: jest.fn().mockResolvedValue(NextResponse.json({ success: true })),
      POST: jest.fn().mockResolvedValue(NextResponse.json({ created: true })),
    };

    const route = createEnhancedRoute(handlers, {
      requireAuth: true,
      auditLog: 'test_operation',
    });

    expect(route.GET).toBeDefined();
    expect(route.POST).toBeDefined();

    // Test GET handler
    const request = createMockRequest();
    const context = createMockContext();

    const response = await (route.GET as (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>)(request, context);
    expect(response.status).toBe(200);
    expect(handlers.GET).toHaveBeenCalled();
  });

  test('should create route with staff access', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockStaffUser);

    const handlers = {
      GET: jest.fn().mockResolvedValue(NextResponse.json({ success: true })),
    };

    const route = createEnhancedRoute(handlers, {
      requireStaff: true,
    });

    const request = createMockRequest();
    const context = createMockContext();

    const response = await (route.GET as (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>)(request, context);
    expect(response.status).toBe(200);
    expect(handlers.GET).toHaveBeenCalled();
  });

  test('should create route with tenant access', async () => {
    mockAuthService.validateSession.mockResolvedValue(mockUser);
    (withoutTenantContext as jest.Mock).mockImplementation(async (callback) => {
      return await callback({
        db: {
          query: jest.fn().mockResolvedValue({
            rows: [{
              tenant_id: 'tenant-123',
              tenant_name: 'Test Tenant',
              max_role_level: 2,
            }],
          }),
        },
      });
    });

    const handlers = {
      GET: jest.fn().mockResolvedValue(NextResponse.json({ success: true })),
    };

    const route = createEnhancedRoute(handlers, {
      requireTenant: true,
    });

    const request = createMockRequest();
    const context = createMockContext({ tenantId: 'tenant-123' });

    const response = await (route.GET as (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>)(request, context);
    expect(response.status).toBe(200);
    expect(handlers.GET).toHaveBeenCalled();
  });
});
