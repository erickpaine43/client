/**
 * Authentication Middleware Tests
 * 
 * Unit tests for NileDB authentication middleware including tenant access,
 * role-based permissions, and staff access control.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withAuthentication,
  withTenantAccess,
  withStaffAccess,
  createAuthenticatedRoute,
  createTenantRoute,
  createStaffRoute,
} from '../middleware';
import { AuthenticationError, UserWithProfile } from '../auth';
import {
  createTestNileClient,
  cleanupTestData,
  mockNextRequest,
} from './test-utils';
import type { Server } from '@niledatabase/server';
import { withoutTenantContext } from '../client';

// Mock the auth service
interface MockAuthService {
  validateSession: jest.Mock<Promise<UserWithProfile>, [NextRequest]>;
  validateStaffAccess: jest.Mock<Promise<UserWithProfile>, [NextRequest, string?]>;
  getUserWithProfile: jest.Mock<Promise<UserWithProfile | null>, [string]>;
  isStaffUser: jest.Mock<Promise<boolean>, [UserWithProfile]>;
}

const mockAuthService: MockAuthService = {
  validateSession: jest.fn(),
  validateStaffAccess: jest.fn(),
  getUserWithProfile: jest.fn(),
  isStaffUser: jest.fn(),
};

jest.mock('../auth', () => ({
  ...jest.requireActual('../auth'),
  getAuthService: jest.fn(() => mockAuthService),
}));

describe('Authentication Middleware', () => {
  let testNile: Server;

  beforeAll(() => {
    testNile = createTestNileClient();
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Clear auth service mocks
    mockAuthService.validateSession.mockReset();
    mockAuthService.validateStaffAccess.mockReset();
    mockAuthService.getUserWithProfile.mockReset();
    mockAuthService.isStaffUser.mockReset();
  });

  afterAll(async () => {
    await cleanupTestData(testNile);
  });

  describe('withAuthentication', () => {
    it('should call handler with authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        profile: { isPenguinMailsStaff: false, role: 'user' },
      } as UserWithProfile;

      mockAuthService.validateSession.mockResolvedValue(mockUser);

      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const authenticatedHandler = withAuthentication(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({ id: '123' }) };
    
      const response = await authenticatedHandler(request, context);
      expect(response.status).toBe(200);

      expect(mockAuthService.validateSession).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({ user: mockUser }),
        expect.objectContaining({
          params: { id: '123' },
          user: mockUser,
          isStaff: false,
        })
      );
    });

    it('should return 401 for authentication error', async () => {
      mockAuthService.validateSession.mockRejectedValue(
        new AuthenticationError('Authentication required', 'AUTH_REQUIRED')
      );

      const mockHandler = jest.fn();
      const authenticatedHandler = withAuthentication(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };
    
      const response = await authenticatedHandler(request, context);

      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();

      const responseData = await response.json<{ error: string; code: string }>();
      expect(responseData.error).toBe('Authentication required');
      expect(responseData.code).toBe('AUTH_REQUIRED');
    });

    it('should return 500 for unexpected errors', async () => {
      mockAuthService.validateSession.mockRejectedValue(new Error('Database error'));

      const mockHandler = jest.fn();
      const authenticatedHandler = withAuthentication(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };
    
      const response = await authenticatedHandler(request, context);

      expect(response.status).toBe(500);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('withStaffAccess', () => {
    it('should allow staff user with sufficient privileges', async () => {
      const mockStaffUser = {
        id: 'staff-123',
        email: 'staff@example.com',
        profile: { isPenguinMailsStaff: true, role: 'admin' },
      } as UserWithProfile;

      mockAuthService.validateStaffAccess.mockResolvedValue(mockStaffUser);

      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const staffHandler = withStaffAccess('admin')(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };
    
      const response = await staffHandler(request, context);
      expect(response.status).toBe(200);

      expect(mockAuthService.validateStaffAccess).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({ user: mockStaffUser, isStaff: true }),
        expect.objectContaining({ isStaff: true })
      );
    });

    it('should reject staff user with insufficient privileges', async () => {
      const mockStaffUser = {
        id: 'staff-123',
        email: 'staff@example.com',
        profile: { isPenguinMailsStaff: true, role: 'user' },
      } as UserWithProfile;

      mockAuthService.validateStaffAccess.mockResolvedValue(mockStaffUser);

      const mockHandler = jest.fn();
      const staffHandler = withStaffAccess('admin')(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };
    
      const response = await staffHandler(request, context);

      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();

      const responseData = await response.json<{
        error: string;
        code: string;
        required: string;
        current: string;
      }>();
      expect(responseData.error).toBe('Insufficient staff privileges');
      expect(responseData.code).toBe('INSUFFICIENT_STAFF_LEVEL');
    });

    it('should reject non-staff user', async () => {
      mockAuthService.validateStaffAccess.mockRejectedValue(
        new AuthenticationError('Staff access required', 'STAFF_ACCESS_REQUIRED')
      );

      const mockHandler = jest.fn();
      const staffHandler = withStaffAccess()(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };
    
      const response = await staffHandler(request, context);

      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('withTenantAccess', () => {
    let withoutTenantContextSpy: jest.SpyInstance;

    beforeEach(() => {
      withoutTenantContextSpy = jest.spyOn({ withoutTenantContext }, 'withoutTenantContext');
    });

    afterEach(() => {
      withoutTenantContextSpy.mockRestore();
    });

    it('should allow staff user to access any tenant', async () => {
      const mockStaffUser = {
        id: 'staff-123',
        email: 'staff@example.com',
        profile: { isPenguinMailsStaff: true, role: 'admin' },
      } as UserWithProfile;

      mockAuthService.validateSession.mockResolvedValue(mockStaffUser);

      // Mock tenant existence check
      withoutTenantContextSpy.mockImplementationOnce(async (callback: (nile: Server) => Promise<unknown>) =>
        callback({
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [{ id: 'tenant-123', name: 'Test Tenant' }]
            })
          }
        } as Server)
      );

      const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const tenantHandler = withTenantAccess('member')(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({ tenantId: 'tenant-123' }) };
    
      const response = await tenantHandler(request, context);
      expect(response.status).toBe(200);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockStaffUser,
          isStaff: true,
          tenantId: 'tenant-123'
        }),
        expect.objectContaining({
          isStaff: true,
          tenant: { id: 'tenant-123', name: 'Test Tenant' }
        })
      );
    });

    it('should return 400 when tenant ID is missing', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        profile: { isPenguinMailsStaff: false, role: 'user' },
      } as UserWithProfile;

      mockAuthService.validateSession.mockResolvedValue(mockUser);

      const mockHandler = jest.fn();
      const tenantHandler = withTenantAccess()(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) }; // No tenantId
    
      const response = await tenantHandler(request, context);

      expect(response.status).toBe(400);
      expect(mockHandler).not.toHaveBeenCalled();

      const responseData = await response.json<{ error: string; code: string }>();
      expect(responseData.error).toBe('Tenant ID required');
    });

    it('should return 404 when tenant does not exist', async () => {
      const mockStaffUser = {
        id: 'staff-123',
        email: 'staff@example.com',
        profile: { isPenguinMailsStaff: true, role: 'admin' },
      } as UserWithProfile;

      mockAuthService.validateSession.mockResolvedValue(mockStaffUser);

      // Mock tenant not found
      withoutTenantContextSpy.mockImplementationOnce(async (callback: (nile: Server) => Promise<unknown>) =>
        callback({
          db: {
            query: jest.fn().mockResolvedValue({ rows: [] })
          }
        } as Server)
      );

      const mockHandler = jest.fn();
      const tenantHandler = withTenantAccess()(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({ tenantId: 'non-existent-tenant' }) };
    
      const response = await tenantHandler(request, context);

      expect(response.status).toBe(404);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('createAuthenticatedRoute', () => {
    it('should create route handlers with authentication', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        profile: { isPenguinMailsStaff: false, role: 'user' },
      } as UserWithProfile;

      mockAuthService.validateSession.mockResolvedValue(mockUser);

      const getHandler = jest.fn().mockResolvedValue(NextResponse.json({ method: 'GET' }));
      const postHandler = jest.fn().mockResolvedValue(NextResponse.json({ method: 'POST' }));

      const route = createAuthenticatedRoute({
        GET: getHandler,
        POST: postHandler,
      }) as {
        GET: (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;
        POST: (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;
      };

      expect(route.GET).toBeDefined();
      expect(route.POST).toBeDefined();

      // Test GET handler
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };

      const getResponse = await ((route.GET as unknown) as (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>)(request, context);
      expect(getResponse.status).toBe(200);
      expect(getHandler).toHaveBeenCalled();

      const postResponse = await ((route.POST as unknown) as (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>)(request, context);
      expect(postResponse.status).toBe(200);
      expect(postHandler).toHaveBeenCalled();
    });
  });

  describe('createTenantRoute', () => {
    let withoutTenantContextSpy: jest.SpyInstance;

    beforeEach(() => {
      withoutTenantContextSpy = jest.spyOn({ withoutTenantContext }, 'withoutTenantContext');
    });

    afterEach(() => {
      withoutTenantContextSpy.mockRestore();
    });

    it('should create tenant-scoped route handlers', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        profile: { isPenguinMailsStaff: true, role: 'admin' },
      } as UserWithProfile;

      mockAuthService.validateSession.mockResolvedValue(mockUser);

      // Mock tenant existence
      withoutTenantContextSpy.mockImplementationOnce(async (callback: (nile: Server) => Promise<unknown>) =>
        callback({
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [{ id: 'tenant-123', name: 'Test Tenant' }]
            })
          }
        } as Server)
      );

      const getHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const route = createTenantRoute({
        GET: getHandler,
      }, 'member') as {
        GET: (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;
      };
    
      expect(route.GET).toBeDefined();
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({ tenantId: 'tenant-123' }) };

      const response = await ((route.GET as unknown) as (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>)(request, context);
      expect(response.status).toBe(200);
      expect(getHandler).toHaveBeenCalled();
    });
  });

  describe('createStaffRoute', () => {
    it('should create staff-only route handlers', async () => {
      const mockStaffUser = {
        id: 'staff-123',
        email: 'staff@example.com',
        profile: { isPenguinMailsStaff: true, role: 'admin' },
      } as UserWithProfile;

      mockAuthService.validateStaffAccess.mockResolvedValue(mockStaffUser);

      const getHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const route = createStaffRoute({
        GET: getHandler,
      }, 'admin') as {
        GET: (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;
      };
    
      expect(route.GET).toBeDefined();
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };

      const response = await ((route.GET as unknown) as (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>)(request, context);
      expect(response.status).toBe(200);
      expect(getHandler).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle middleware chain errors gracefully', async () => {
      mockAuthService.validateSession.mockRejectedValue(new Error('Unexpected error'));

      const mockHandler = jest.fn();
      const authenticatedHandler = withAuthentication(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };
    
      const response = await authenticatedHandler(request, context);

      expect(response.status).toBe(500);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle handler errors', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        profile: { isPenguinMailsStaff: false, role: 'user' },
      } as UserWithProfile;

      mockAuthService.validateSession.mockResolvedValue(mockUser);

      const mockHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
      const authenticatedHandler = withAuthentication(mockHandler);
    
      const request = (mockNextRequest() as unknown) as NextRequest;
      const context = { params: Promise.resolve({}) };

      // Should propagate handler errors
      await expect(authenticatedHandler(request, context)).rejects.toThrow('Handler error');
    });
  });
});
