/**
 * Example usage patterns for authentication and authorization utilities
 * 
 * This file demonstrates how to use the authentication utilities in different scenarios.
 * These examples can be used as templates for implementing actions across the application.
 */

import { 
  requireAuth,
  requireAuthWithCompany,
  requirePermission,
  withAuth,
  withAuthAndCompany,
  withPermission,
  withFullAuth,
  withContextualRateLimit,
  validateCompanyIsolation,
  RateLimits,
  getRateLimitConfig
} from './auth';
import { Permission } from '@/types/auth';
import { ActionResult, ActionContext } from './types';
import { createActionResult, ErrorFactory } from './errors';

// Example 1: Simple authenticated action
export async function simpleAuthenticatedAction(
  data: { name: string }
): Promise<ActionResult<{ id: string; name: string }>> {
  return await withAuth(async (context: ActionContext) => {
    // Action logic here - context.userId is guaranteed to exist
    console.log(`User ${context.userId} is performing action`);
    
    return createActionResult({
      id: 'generated-id',
      name: data.name,
    });
  });
}

// Example 2: Action requiring company context
export async function companyContextAction(
  data: { companyName: string }
): Promise<ActionResult<{ companyId: string; name: string }>> {
  return await withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
    // Both userId and companyId are guaranteed to exist
    console.log(`User ${context.userId} from company ${context.companyId} is updating company`);
    
    return createActionResult({
      companyId: context.companyId,
      name: data.companyName,
    });
  });
}

// Example 3: Action requiring specific permissions
export async function permissionRequiredAction(
  campaignId: string
): Promise<ActionResult<{ campaignId: string; status: string }>> {
  return await withPermission(
    Permission.UPDATE_CAMPAIGN,
    async (context: ActionContext) => {
      // User is guaranteed to have UPDATE_CAMPAIGN permission
      console.log(`User ${context.userId} is updating campaign ${campaignId}`);
      
      return createActionResult({
        campaignId,
        status: 'updated',
      });
    }
  );
}

// Example 4: Comprehensive action with all protections
export async function comprehensiveProtectedAction(
  data: { templateName: string; content: string }
): Promise<ActionResult<{ templateId: string; name: string }>> {
  return await withFullAuth(
    {
      permission: Permission.CREATE_CAMPAIGN,
      requireCompany: true,
      rateLimit: {
        action: 'template_create',
        type: 'user',
        config: getRateLimitConfig('TEMPLATE_CREATE'),
      },
    },
    async (context: ActionContext) => {
      // User is authenticated, has permission, company context exists, and rate limiting is applied
      console.log(`Creating template for user ${context.userId} in company ${context.companyId}`);
      
      return createActionResult({
        templateId: 'generated-template-id',
        name: data.templateName,
      });
    }
  );
}

// Example 5: Manual authentication and validation
export async function manualAuthAction(
  resourceId: string,
  resourceCompanyId: string
): Promise<ActionResult<{ resourceId: string; accessed: boolean }>> {
  // Manual authentication
  const authResult = await requireAuthWithCompany();
  if (!authResult.success || !authResult.data) {
    return {
      success: false,
      error: authResult.error,
    };
  }

  const context = authResult.data;

  // Validate company isolation
  const isolationResult = await validateCompanyIsolation(resourceCompanyId, context);
  if (!isolationResult.success) {
    return isolationResult as ActionResult<{ resourceId: string; accessed: boolean }>;
  }

  // Action logic
  return createActionResult({
    resourceId,
    accessed: true,
  });
}

// Example 6: Rate limiting with different strategies
export async function rateLimitedActions() {
  // User-based rate limiting
  const userLimitedAction = async (userId: string) => {
    console.log(`User ${userId} is performing an action`);
    return await withContextualRateLimit(
      'user_action',
      'user',
      { limit: 10, windowMs: 60000 },
      async () => {
        return createActionResult({ message: 'User action completed' });
      }
    );
  };

  // Company-based rate limiting
  const companyLimitedAction = async () => {
    return await withContextualRateLimit(
      'company_action',
      'company',
      { limit: 100, windowMs: 3600000 },
      async () => {
        return createActionResult({ message: 'Company action completed' });
      }
    );
  };

  // IP-based rate limiting
  const ipLimitedAction = async () => {
    return await withContextualRateLimit(
      'public_action',
      'ip',
      { limit: 5, windowMs: 60000 },
      async () => {
        return createActionResult({ message: 'Public action completed' });
      }
    );
  };

  // Global rate limiting
  const globalLimitedAction = async () => {
    return await withContextualRateLimit(
      'system_action',
      'global',
      { limit: 1000, windowMs: 60000 },
      async () => {
        return createActionResult({ message: 'System action completed' });
      }
    );
  };

  return {
    userLimitedAction,
    companyLimitedAction,
    ipLimitedAction,
    globalLimitedAction,
  };
}

// Example 7: Different rate limit configurations
export function getRateLimitExamples() {
  return {
    // Authentication actions - strict limits
    login: getRateLimitConfig('AUTH_LOGIN'), // 5 per 5 minutes
    signup: getRateLimitConfig('AUTH_SIGNUP'), // 3 per hour
    passwordReset: getRateLimitConfig('AUTH_PASSWORD_RESET'), // 3 per hour

    // User actions - moderate limits
    profileUpdate: getRateLimitConfig('USER_PROFILE_UPDATE'), // 10 per minute
    settingsUpdate: getRateLimitConfig('USER_SETTINGS_UPDATE'), // 10 per minute

    // Team actions - higher limits for collaboration
    teamInvite: getRateLimitConfig('TEAM_INVITE'), // 20 per hour
    memberUpdate: getRateLimitConfig('TEAM_MEMBER_UPDATE'), // 50 per hour

    // Billing actions - strict limits for security
    billingUpdate: getRateLimitConfig('BILLING_UPDATE'), // 5 per 5 minutes
    paymentMethodAdd: getRateLimitConfig('PAYMENT_METHOD_ADD'), // 10 per hour

    // Campaign actions - balanced for productivity
    campaignCreate: getRateLimitConfig('CAMPAIGN_CREATE'), // 20 per hour
    campaignUpdate: getRateLimitConfig('CAMPAIGN_UPDATE'), // 100 per hour

    // Analytics actions - high limits for dashboards
    analyticsQuery: getRateLimitConfig('ANALYTICS_QUERY'), // 200 per minute
    analyticsExport: getRateLimitConfig('ANALYTICS_EXPORT'), // 10 per hour

    // General actions
    generalRead: getRateLimitConfig('GENERAL_READ'), // 1000 per minute
    generalWrite: getRateLimitConfig('GENERAL_WRITE'), // 100 per minute
    sensitiveAction: getRateLimitConfig('SENSITIVE_ACTION'), // 5 per minute
  };
}

// Example 8: Error handling patterns
export async function errorHandlingExamples() {
  // Handle authentication errors
  const handleAuthError = async (_userId?: string) => {
    const authResult = await requireAuth();
    if (!authResult.success) {
      switch (authResult.error?.code) {
        case 'AUTH_REQUIRED':
          return ErrorFactory.authRequired('Please log in to continue');
        case 'SESSION_EXPIRED':
          return ErrorFactory.authRequired('Your session has expired. Please log in again');
        default:
          return ErrorFactory.internal('Authentication failed');
      }
    }
    return authResult;
  };

  // Handle permission errors
  const handlePermissionError = async (permission: Permission) => {
    const permissionResult = await requirePermission(permission);
    if (!permissionResult.success) {
      return ErrorFactory.unauthorized(
        `You don't have permission to perform this action. Required: ${permission}`
      );
    }
    return permissionResult;
  };

  // Handle rate limit errors
  const handleRateLimitError = (error: { type?: string; details?: { retryAfter?: number } }) => {
    if (error?.type === 'rate_limit') {
      const retryAfter = error.details?.retryAfter || 60;
      return ErrorFactory.rateLimit(
        `Too many requests. Please try again in ${retryAfter} seconds.`
      );
    }
    return ErrorFactory.internal('Rate limiting failed');
  };

  return {
    handleAuthError,
    handlePermissionError,
    handleRateLimitError,
  };
}

// Example 9: Testing utilities
export function createMockContext(overrides: Partial<ActionContext> = {}): ActionContext {
  return {
    userId: 'test-user-123',
    companyId: 'test-company-123',
    timestamp: Date.now(),
    requestId: 'test-request-123',
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
    ...overrides,
  };
}

export function createMockAuthResult<T>(
  data: T,
  overrides: Partial<ActionContext> = {}
): ActionResult<ActionContext> {
  return {
    success: true,
    data: createMockContext(overrides),
  };
}

// Example 10: Migration helpers for existing actions
export function migrateExistingAction<T, Args extends unknown[]>(
  legacyAction: (...args: Args) => Promise<T>,
  options: {
    requireAuth?: boolean;
    requireCompany?: boolean;
    permission?: Permission;
    rateLimit?: keyof typeof RateLimits;
  } = {}
) {
  return async (...args: Args): Promise<ActionResult<T>> => {
    try {
      if (options.requireAuth || options.requireCompany || options.permission) {
        const authOptions = {
          requireCompany: options.requireCompany,
          permission: options.permission,
          rateLimit: options.rateLimit ? {
            action: options.rateLimit,
            type: 'user' as const,
            config: getRateLimitConfig(options.rateLimit),
          } : undefined,
        };

        return await withFullAuth(
          authOptions,
          async () => {
            const result = await legacyAction(...args);
            return createActionResult(result);
          }
        );
      } else {
        const result = await legacyAction(...args);
        return createActionResult(result);
      }
    } catch (error) {
      console.error('Legacy action migration error:', error);
      return ErrorFactory.internal('Action failed');
    }
  };
}
