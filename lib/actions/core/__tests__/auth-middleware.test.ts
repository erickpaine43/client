/**
 * Authentication Middleware Tests
 * 
 * Tests for the comprehensive security middleware system
 */

import { withSecurity, SecurityConfigs, AuthLevel, RateLimitType } from '../auth-middleware';
import { ActionContext, ActionResult } from '../types';
import { ErrorFactory } from '../errors';
import { requireAuth, requireAuthWithCompany, requirePermission, withContextualRateLimit } from '../auth';

// Get mocked versions - cast to mocked functions since the module is mocked
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockRequireAuthWithCompany = requireAuthWithCompany as jest.MockedFunction<typeof requireAuthWithCompany>;
const mockRequirePermission = requirePermission as jest.MockedFunction<typeof requirePermission>;
const mockWithContextualRateLimit = withContextualRateLimit as jest.MockedFunction<typeof withContextualRateLimit>;

// Mock the auth utilities
jest.mock('../../utils/auth', () => ({
  getCurrentUser: jest.fn(),
  getCurrentUserId: jest.fn(),
  requireAuth: jest.fn(),
  hasPermission: jest.fn(),
  checkRateLimit: jest.fn(),
}));

jest.mock('../auth', () => ({
  requireAuth: jest.fn(),
  requireAuthWithCompany: jest.fn(),
  requirePermission: jest.fn(),
  withContextualRateLimit: jest.fn(),
  validateCompanyIsolation: jest.fn(),
  RateLimits: {
    GENERAL_READ: { limit: 1000, windowMs: 60000 },
    GENERAL_WRITE: { limit: 100, windowMs: 60000 },
    ANALYTICS_QUERY: { limit: 200, windowMs: 60000 },
  },
  createUserRateLimitKey: jest.fn(),
  createCompanyRateLimitKey: jest.fn(),
  createIpRateLimitKey: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve(new Map([
    ['user-agent', 'test-agent'],
    ['x-forwarded-for', '127.0.0.1'],
    ['origin', 'https://test.com'],
  ]))),
}));

describe('Authentication Middleware', () => {
  const mockContext: ActionContext = {
    userId: 'test-user-id',
    companyId: 'test-company-id',
    timestamp: Date.now(),
    requestId: 'test-request-id',
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withSecurity', () => {
    it('should handle public read operations', async () => {
      const mockHandler = jest.fn().mockResolvedValue({
        success: true,
        data: 'test-data',
      });

      const result = await withSecurity(
        'test_public_action',
        SecurityConfigs.PUBLIC_READ,
        mockHandler
      );

      expect(result.success).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should require authentication for user operations', async () => {
      mockRequireAuth.mockResolvedValue({
        success: true,
        data: mockContext,
      });

      const mockHandler = jest.fn().mockResolvedValue({
        success: true,
        data: 'test-data',
      });

      const result = await withSecurity(
        'test_user_action',
        SecurityConfigs.USER_READ,
        mockHandler
      );

      expect(requireAuth).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
    });

    it('should require company context for company operations', async () => {
      mockRequireAuthWithCompany.mockResolvedValue({
        success: true,
        data: mockContext as ActionContext & { companyId: string },
      });

      const mockHandler = jest.fn().mockResolvedValue({
        success: true,
        data: 'test-data',
      });

      const result = await withSecurity(
        'test_company_action',
        SecurityConfigs.COMPANY_READ,
        mockHandler
      );

      expect(mockRequireAuthWithCompany).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
    });

    it('should handle authentication failures', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: ErrorFactory.authRequired().error,
      });

      const mockHandler = jest.fn();

      const result = await withSecurity(
        'test_user_action',
        SecurityConfigs.USER_READ,
        mockHandler
      );

      expect(mockRequireAuth).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle permission checks', async () => {
      mockRequireAuth.mockResolvedValue({
        success: true,
        data: mockContext,
      });

      mockRequirePermission.mockResolvedValue({
        success: false,
        error: ErrorFactory.unauthorized('Permission denied').error,
      });

      const mockHandler = jest.fn();

      const result = await withSecurity(
        'test_permission_action',
        SecurityConfigs.ANALYTICS_READ,
        mockHandler
      );

      expect(mockRequireAuth).toHaveBeenCalled();
      expect(mockRequirePermission).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should apply rate limiting', async () => {
      mockRequireAuth.mockResolvedValue({
        success: true,
        data: mockContext,
      });

      // Mock rate limiting to call the operation function
      mockWithContextualRateLimit.mockImplementation(
        (action: string, type: string, config: unknown, operation: () => Promise<ActionResult<unknown>>) => {
          return operation();
        }
      );

      const mockHandler = jest.fn().mockResolvedValue({
        success: true,
        data: 'test-data',
      });

      const result = await withSecurity(
        'test_rate_limited_action',
        SecurityConfigs.USER_WRITE,
        mockHandler
      );

      expect(mockWithContextualRateLimit).toHaveBeenCalledWith(
        'user_write',
        'user',
        expect.any(Object),
        expect.any(Function)
      );
      expect(result.success).toBe(true);
    });

    it('should handle rate limit exceeded', async () => {
      mockRequireAuth.mockResolvedValue({
        success: true,
        data: mockContext,
      });

      // Mock rate limiting to return rate limit exceeded
      mockWithContextualRateLimit.mockResolvedValue({
        success: false,
        error: ErrorFactory.rateLimit('Rate limit exceeded').error,
      });

      const mockHandler = jest.fn();

      const result = await withSecurity(
        'test_rate_limited_action',
        SecurityConfigs.USER_WRITE,
        mockHandler
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Database connection failed'));

      const mockHandler = jest.fn();

      const result = await withSecurity(
        'test_error_action',
        SecurityConfigs.USER_READ,
        mockHandler
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Security check failed');
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('Security Configurations', () => {
    it('should have correct PUBLIC_READ configuration', () => {
      expect(SecurityConfigs.PUBLIC_READ.auth.level).toBe(AuthLevel.NONE);
      expect(SecurityConfigs.PUBLIC_READ.rateLimit?.type).toBe(RateLimitType.IP);
      expect(SecurityConfigs.PUBLIC_READ.audit?.enabled).toBe(false);
    });

    it('should have correct USER_READ configuration', () => {
      expect(SecurityConfigs.USER_READ.auth.level).toBe(AuthLevel.USER);
      expect(SecurityConfigs.USER_READ.rateLimit?.type).toBe(RateLimitType.USER);
      expect(SecurityConfigs.USER_READ.audit?.enabled).toBe(false);
    });

    it('should have correct COMPANY_WRITE configuration', () => {
      expect(SecurityConfigs.COMPANY_WRITE.auth.level).toBe(AuthLevel.COMPANY);
      expect(SecurityConfigs.COMPANY_WRITE.auth.requireCompanyIsolation).toBe(true);
      expect(SecurityConfigs.COMPANY_WRITE.rateLimit?.type).toBe(RateLimitType.COMPANY);
      expect(SecurityConfigs.COMPANY_WRITE.audit?.enabled).toBe(true);
    });

    it('should have correct SENSITIVE_OPERATION configuration', () => {
      expect(SecurityConfigs.SENSITIVE_OPERATION.auth.level).toBe(AuthLevel.COMPANY);
      expect(SecurityConfigs.SENSITIVE_OPERATION.auth.requireCompanyIsolation).toBe(true);
      expect(SecurityConfigs.SENSITIVE_OPERATION.rateLimit?.type).toBe(RateLimitType.USER);
      expect(SecurityConfigs.SENSITIVE_OPERATION.audit?.enabled).toBe(true);
      expect(SecurityConfigs.SENSITIVE_OPERATION.audit?.sensitiveData).toBe(true);
      expect(SecurityConfigs.SENSITIVE_OPERATION.validation?.requireHttps).toBe(true);
    });
  });

  describe('Custom Security Configuration', () => {
    it('should allow creating custom security configurations', async () => {
      mockRequireAuth.mockResolvedValue({
        success: true,
        data: mockContext,
      });

      const customConfig = {
        auth: { level: AuthLevel.USER },
        rateLimit: {
          type: RateLimitType.USER,
          action: 'custom_action',
          config: { limit: 5, windowMs: 60000 },
        },
        audit: { enabled: true },
      };

      const mockHandler = jest.fn().mockResolvedValue({
        success: true,
        data: 'custom-data',
      });

      const result = await withSecurity(
        'custom_action',
        customConfig,
        mockHandler
      );

      expect(result.success).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(mockContext);
    });
  });
});

describe('Error Handling', () => {
  it('should return proper error structure', () => {
    const error = ErrorFactory.unauthorized('Test error message');
    
    expect(error.success).toBe(false);
    expect(error.error).toBeDefined();
    expect(typeof error.error).toBe('object');
  });

  it('should handle validation errors', () => {
    const error = ErrorFactory.validation('Invalid input', 'fieldName', 'INVALID_FORMAT');
    
    expect(error.success).toBe(false);
    expect(error.error).toBeDefined();
  });

  it('should handle rate limit errors', () => {
    const error = ErrorFactory.rateLimit('Rate limit exceeded');
    
    expect(error.success).toBe(false);
    expect(error.error).toBeDefined();
  });
});
