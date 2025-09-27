/**
 * Authentication middleware utilities
 * 
 * This module provides middleware helpers for actions that require
 * authentication, permissions, and rate limiting.
 */

import { ActionResult, ActionContext, RateLimitConfig } from './types';
import { Permission } from '../../../types/auth';
import { requireAuth, requireAuthWithCompany, isSuccessfulResult } from './auth-validators';
import { requirePermission } from './permission-handlers';
import { withContextualRateLimit, RateLimits } from './rate-limit-utils';
import { ErrorFactory } from './errors';

/**
 * Authentication levels for security configurations
 */
export enum AuthLevel {
  NONE = 'none',
  USER = 'user',
  COMPANY = 'company',
}

/**
 * Rate limit types for security configurations
 */
export enum RateLimitType {
  IP = 'ip',
  USER = 'user',
  COMPANY = 'company',
  GLOBAL = 'global',
}

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  auth: {
    level: AuthLevel;
    permission?: Permission;
    requireCompanyIsolation?: boolean;
  };
  rateLimit?: {
    type: RateLimitType;
    action: string;
    config: Omit<RateLimitConfig, 'key'>;
  };
  audit?: {
    enabled: boolean;
    sensitiveData?: boolean;
  };
  validation?: {
    requireHttps?: boolean;
  };
}

/**
 * Pre-configured security configurations for common use cases
 */
export const SecurityConfigs = {
  // Public operations (no auth required)
  PUBLIC_READ: {
    auth: { level: AuthLevel.NONE },
    rateLimit: {
      type: RateLimitType.IP,
      action: 'public_read',
      config: RateLimits.GENERAL_READ,
    },
    audit: { enabled: false },
  } as SecurityConfig,

  // User-level operations
  USER_READ: {
    auth: { level: AuthLevel.USER },
    rateLimit: {
      type: RateLimitType.USER,
      action: 'user_read',
      config: RateLimits.GENERAL_READ,
    },
    audit: { enabled: false },
  } as SecurityConfig,

  USER_WRITE: {
    auth: { level: AuthLevel.USER },
    rateLimit: {
      type: RateLimitType.USER,
      action: 'user_write',
      config: RateLimits.GENERAL_WRITE,
    },
    audit: { enabled: true },
  } as SecurityConfig,

  // Company-level operations
  COMPANY_READ: {
    auth: { 
      level: AuthLevel.COMPANY,
      requireCompanyIsolation: true,
    },
    rateLimit: {
      type: RateLimitType.COMPANY,
      action: 'company_read',
      config: RateLimits.GENERAL_READ,
    },
    audit: { enabled: false },
  } as SecurityConfig,

  COMPANY_WRITE: {
    auth: { 
      level: AuthLevel.COMPANY,
      requireCompanyIsolation: true,
    },
    rateLimit: {
      type: RateLimitType.COMPANY,
      action: 'company_write',
      config: RateLimits.GENERAL_WRITE,
    },
    audit: { enabled: true },
  } as SecurityConfig,

  // Analytics operations
  ANALYTICS_READ: {
    auth: { 
      level: AuthLevel.USER,
      permission: Permission.VIEW_ANALYTICS,
    },
    rateLimit: {
      type: RateLimitType.USER,
      action: 'analytics_read',
      config: RateLimits.ANALYTICS_QUERY,
    },
    audit: { enabled: false },
  } as SecurityConfig,

  // Bulk operations
  BULK_OPERATION: {
    auth: { 
      level: AuthLevel.COMPANY,
      requireCompanyIsolation: true,
    },
    rateLimit: {
      type: RateLimitType.COMPANY,
      action: 'bulk_operation',
      config: RateLimits.BULK_OPERATION,
    },
    audit: { enabled: true },
  } as SecurityConfig,

  // Sensitive operations
  SENSITIVE_OPERATION: {
    auth: { 
      level: AuthLevel.COMPANY,
      requireCompanyIsolation: true,
    },
    rateLimit: {
      type: RateLimitType.USER,
      action: 'sensitive_operation',
      config: RateLimits.SENSITIVE_ACTION,
    },
    audit: { 
      enabled: true,
      sensitiveData: true,
    },
    validation: {
      requireHttps: true,
    },
  } as SecurityConfig,
} as const;

/**
 * Middleware helper for actions that require authentication
 */
export async function withAuth<T, Args extends unknown[]>(
  handler: (context: ActionContext, ...args: Args) => Promise<ActionResult<T>>,
  ...args: Args
): Promise<ActionResult<T>> {
  const authResult = await requireAuth();
  
  if (!authResult.success || !authResult.data) {
    return authResult as ActionResult<T>;
  }

  return await handler(authResult.data, ...args);
}

/**
 * Middleware helper for actions that require authentication and company context
 */
export async function withAuthAndCompany<T, Args extends unknown[]>(
  handler: (context: ActionContext & { companyId: string }, ...args: Args) => Promise<ActionResult<T>>,
  ...args: Args
): Promise<ActionResult<T>> {
  const authResult = await requireAuthWithCompany();
  
  if (!authResult.success || !authResult.data) {
    return authResult as ActionResult<T>;
  }

  return await handler(authResult.data, ...args);
}

/**
 * Middleware helper for actions that require specific permissions
 */
export async function withPermission<T, Args extends unknown[]>(
  permission: Permission,
  handler: (context: ActionContext, ...args: Args) => Promise<ActionResult<T>>,
  ...args: Args
): Promise<ActionResult<T>> {
  const authResult = await requireAuth();
  
  if (!authResult.success || !authResult.data) {
    return authResult as ActionResult<T>;
  }

  const permissionResult = await requirePermission(permission, authResult.data.userId);
  
  if (!permissionResult.success) {
    return permissionResult as ActionResult<T>;
  }

  return await handler(authResult.data, ...args);
}

/**
 * Comprehensive middleware that combines auth, company context, permissions, and rate limiting
 */
export async function withFullAuth<T, Args extends unknown[]>(
  options: {
    permission?: Permission;
    rateLimit?: {
      action: string;
      type: 'user' | 'company' | 'ip' | 'global';
      config: Omit<RateLimitConfig, 'key'>;
    };
    requireCompany?: boolean;
  },
  handler: (context: ActionContext, ...args: Args) => Promise<ActionResult<T>>,
  ...args: Args
): Promise<ActionResult<T>> {
  // Apply rate limiting first if configured
  if (options.rateLimit) {
    return await withContextualRateLimit<T>(
      options.rateLimit.action,
      options.rateLimit.type,
      options.rateLimit.config,
      async () => {
        return await executeWithAuthChecks(options, handler, ...args);
      }
    );
  }

  return await executeWithAuthChecks(options, handler, ...args);
}

/**
 * Internal helper for executing auth checks
 */
async function executeWithAuthChecks<T, Args extends unknown[]>(
  options: {
    permission?: Permission;
    requireCompany?: boolean;
  },
  handler: (context: ActionContext, ...args: Args) => Promise<ActionResult<T>>,
  ...args: Args
): Promise<ActionResult<T>> {
  // Get authentication context
  const authResult = options.requireCompany
    ? await requireAuthWithCompany()
    : await requireAuth();

  if (!isSuccessfulResult(authResult)) {
    return { success: false, error: authResult.error } as ActionResult<T>;
  }

  const context = authResult.data;

  // Check permissions if required
  if (options.permission) {
    const permissionResult = await requirePermission(options.permission, context.userId);

    if (!permissionResult.success) {
      return { success: false, error: permissionResult.error } as ActionResult<T>;
    }
  }

  return await handler(context, ...args);
}

/**
 * Comprehensive security middleware that applies authentication, authorization,
 * rate limiting, and auditing based on security configuration
 */
export async function withSecurity<T, Args extends unknown[]>(
  action: string,
  config: SecurityConfig,
  handler: (context: ActionContext, ...args: Args) => Promise<ActionResult<T>>,
  ...args: Args
): Promise<ActionResult<T>> {
  try {
    // Apply rate limiting first if configured
    if (config.rateLimit) {
      return await withContextualRateLimit<T>(
        config.rateLimit.action,
        config.rateLimit.type,
        config.rateLimit.config,
        async () => {
          return await executeSecurityChecks(action, config, handler, ...args);
        }
      );
    }

    return await executeSecurityChecks(action, config, handler, ...args);
  } catch (error) {
    console.error(`Security middleware error for action ${action}:`, error);
    return ErrorFactory.internal('Security check failed') as ActionResult<T>;
  }
}

/**
 * Internal helper for executing security checks
 */
async function executeSecurityChecks<T, Args extends unknown[]>(
  action: string,
  config: SecurityConfig,
  handler: (context: ActionContext, ...args: Args) => Promise<ActionResult<T>>,
  ...args: Args
): Promise<ActionResult<T>> {
  let context: ActionContext;

  // Apply authentication based on level
  switch (config.auth.level) {
    case AuthLevel.NONE:
      // No authentication required - create a minimal context
      context = {
        userId: undefined,
        companyId: undefined,
        timestamp: Date.now(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userAgent: undefined,
        ipAddress: undefined,
      };
      break;

    case AuthLevel.USER: {
      const authResult = await requireAuth();
      if (!isSuccessfulResult(authResult)) {
        return { success: false, error: authResult.error } as ActionResult<T>;
      }
      context = authResult.data;
      break;
    }

    case AuthLevel.COMPANY: {
      const authResult = await requireAuthWithCompany();
      if (!isSuccessfulResult(authResult)) {
        return { success: false, error: authResult.error } as ActionResult<T>;
      }
      context = authResult.data;
      break;
    }

    default:
      return ErrorFactory.internal('Invalid authentication level') as ActionResult<T>;
  }

  // Check permissions if required
  if (config.auth.permission && context) {
    const permissionResult = await requirePermission(config.auth.permission, context.userId);
    if (!permissionResult.success) {
      return { success: false, error: permissionResult.error } as ActionResult<T>;
    }
  }

  // TODO: Add audit logging if enabled
  if (config.audit?.enabled) {
    console.log(`Audit: Action ${action} executed by user ${context?.userId || 'anonymous'}`);
  }

  // TODO: Add HTTPS validation if required
  if (config.validation?.requireHttps) {
    // In a real implementation, check request protocol
  }

  return await handler(context, ...args);
}
