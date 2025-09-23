/**
 * Authentication and authorization utilities for server actions
 * 
 * This module provides consistent authentication checking, rate limiting,
 * company/tenant isolation, and request context generation across all action modules.
 */

import { ActionContext, ActionResult, RateLimitConfig, ActionError } from './types';
import { ErrorFactory } from './errors';
import {
  getCurrentUser,
  getCurrentUserId as getAuthUserId,
  requireAuth as requireAuthUser,
  checkRateLimit as checkBasicRateLimit
} from '../../utils/auth';
import { Permission, UserRole, RolePermissions } from '../../../types/auth';
import { headers } from 'next/headers';

// Re-export auth utilities for consistency
export { getCurrentUser, getCurrentUserId, requireAuth as requireAuthUser } from '../../utils/auth';

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current company/tenant ID from user context
 * In NileDB, the tenant context is typically managed at the connection level
 */
export async function getCurrentCompanyId(): Promise<string | null> {
  try {
    // First try to get from authenticated user context
    const user = await getCurrentUser();
    if (user && 'companyId' in user) {
      return (user as { companyId: string }).companyId;
    }

    // Fallback to environment variable for default company
    // In production, this should be derived from the tenant context
    // In development, use a default if no company context available
    const defaultCompanyId = process.env.COMPANY_ID || process.env.DEFAULT_TENANT_ID;
    if (defaultCompanyId) {
      return defaultCompanyId;
    }

    // For development/demo purposes, return a default company ID
    if (process.env.NODE_ENV === 'development') {
      return 'dev-company-001';
    }

    return null;
  } catch (error) {
    console.error('Failed to get company ID:', error);
    // For development, still return default
    if (process.env.NODE_ENV === 'development') {
      return 'dev-company-001';
    }
    return null;
  }
}

/**
 * Require company/tenant context
 */
export async function requireCompanyId(): Promise<ActionResult<string>> {
  try {
    const companyId = await getCurrentCompanyId();
    
    if (!companyId) {
      return ErrorFactory.unauthorized('Company context required for this operation');
    }

    return {
      success: true,
      data: companyId,
    };
  } catch (error) {
    console.error('Failed to require company ID:', error);
    return ErrorFactory.internal('Failed to get company context');
  }
}

/**
 * Get request metadata from headers
 */
async function getRequestMetadata(): Promise<{
  userAgent?: string;
  ipAddress?: string;
}> {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     headersList.get('x-real-ip') || 
                     headersList.get('cf-connecting-ip') || 
                     undefined;

    return { userAgent, ipAddress };
  } catch (error) {
    console.error('Failed to get request metadata:', error);
    return {};
  }
}

/**
 * Create action context with authentication and metadata
 */
export async function createActionContext(
  userAgent?: string,
  ipAddress?: string
): Promise<ActionContext> {
  const userId = await getAuthUserId();
  const companyId = await getCurrentCompanyId();
  
  // Get request metadata if not provided
  if (!userAgent || !ipAddress) {
    const metadata = await getRequestMetadata();
    userAgent = userAgent || metadata.userAgent;
    ipAddress = ipAddress || metadata.ipAddress;
  }

  return {
    userId: userId || undefined,
    companyId: companyId || undefined,
    timestamp: Date.now(),
    requestId: generateRequestId(),
    userAgent,
    ipAddress,
  };
}

/**
 * Require authentication and return action context
 */
export async function requireAuth(
  userAgent?: string,
  ipAddress?: string
): Promise<ActionResult<ActionContext>> {
  try {
    // Use the existing requireAuth from utils/auth to ensure user is authenticated
    await requireAuthUser();
    
    const context = await createActionContext(userAgent, ipAddress);
    
    if (!context.userId) {
      return ErrorFactory.authRequired();
    }

    return {
      success: true,
      data: context,
    };
  } catch (error) {
    console.error('Authentication failed:', error);
    return ErrorFactory.authRequired();
  }
}

/**
 * Require authentication with company context
 */
export async function requireAuthWithCompany(
  userAgent?: string,
  ipAddress?: string
): Promise<ActionResult<ActionContext & { companyId: string }>> {
  try {
    const authResult = await requireAuth(userAgent, ipAddress);
    
    if (!authResult.success || !authResult.data) {
      return authResult as ActionResult<ActionContext & { companyId: string }>;
    }

    const context = authResult.data;
    
    if (!context.companyId) {
      return ErrorFactory.unauthorized('Company context required for this operation');
    }

    return {
      success: true,
      data: { ...context, companyId: context.companyId },
    };
  } catch (error) {
    console.error('Authentication with company context failed:', error);
    return ErrorFactory.internal('Failed to authenticate with company context');
  }
}

/**
 * Get current user ID with error handling
 */
export async function requireUserId(): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return ErrorFactory.authRequired();
    }

    return {
      success: true,
      data: userId,
    };
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return ErrorFactory.internal('Failed to get user ID');
  }
}

/**
 * Get user profile with role and permissions from database
 */
async function getUserProfile(_userId: string): Promise<{
  role: UserRole;
  permissions: Permission[];
  companyId: string;
  companyName: string;
  plan: string;
} | null> {
  try {
    // In a real implementation, this would fetch from your user profile database
    // For now, we'll use environment variables or defaults
    const defaultRole = (process.env.DEFAULT_USER_ROLE as UserRole) || UserRole.USER;
    const companyId = await getCurrentCompanyId();
    
    if (!companyId) {
      return null;
    }

    // Get role-based permissions
    const permissions = RolePermissions[defaultRole] || [];

    return {
      role: defaultRole,
      permissions,
      companyId,
      companyName: process.env.DEFAULT_COMPANY_NAME || 'Default Company',
      plan: process.env.DEFAULT_PLAN || 'free',
    };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

/**
 * Check if user has required permissions
 * Integrates with the existing permission system from types/auth.ts
 */
export async function checkPermission(
  permission: Permission,
  userId?: string,
  _resourceId?: string
): Promise<boolean> {
  try {
    const currentUserId = userId || await getAuthUserId();
    if (!currentUserId) {
      return false;
    }

    // Get user profile with role and permissions
    const profile = await getUserProfile(currentUserId);
    if (!profile) {
      return false;
    }

    // Check if user has the specific permission
    return profile.permissions.includes(permission);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

/**
 * Require specific permission
 */
export async function requirePermission(
  permission: Permission,
  userId?: string,
  resourceId?: string
): Promise<ActionResult<void>> {
  try {
    const hasRequiredPermission = await checkPermission(permission, userId, resourceId);
    
    if (!hasRequiredPermission) {
      return ErrorFactory.unauthorized(
        `Permission '${permission}' required for this operation`
      );
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Permission requirement check failed:', error);
    return ErrorFactory.internal('Failed to check permissions');
  }
}

/**
 * Check if user owns a resource (company/tenant isolation)
 */
export async function checkResourceOwnership(
  resourceCompanyId: string,
  userId?: string
): Promise<boolean> {
  try {
    const currentUserId = userId || await getAuthUserId();
    if (!currentUserId) {
      return false;
    }

    const userCompanyId = await getCurrentCompanyId();
    if (!userCompanyId) {
      return false;
    }

    // User can only access resources from their own company/tenant
    return userCompanyId === resourceCompanyId;
  } catch (error) {
    console.error('Resource ownership check failed:', error);
    return false;
  }
}

/**
 * Require resource ownership (company/tenant isolation)
 */
export async function requireResourceOwnership(
  resourceCompanyId: string,
  userId?: string
): Promise<ActionResult<void>> {
  try {
    const ownsResource = await checkResourceOwnership(resourceCompanyId, userId);
    
    if (!ownsResource) {
      return ErrorFactory.unauthorized(
        'Access denied: resource belongs to a different organization'
      );
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Resource ownership requirement check failed:', error);
    return ErrorFactory.internal('Failed to verify resource ownership');
  }
}

// Enhanced rate limiting store (in-memory for now - should use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number; firstRequest: number }>();

/**
 * Check rate limit for a given key with enhanced tracking
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<ActionResult<{ allowed: boolean; remaining: number; resetTime: number; retryAfter?: number }>> {
  try {
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up on each call
      const entries = Array.from(rateLimitStore.entries());
      for (const [key, data] of entries) {
        if (data.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }
    }

    const existing = rateLimitStore.get(config.key);
    
    if (!existing || existing.resetTime < now) {
      // First request in window or window expired
      const resetTime = now + config.windowMs;
      rateLimitStore.set(config.key, { 
        count: 1, 
        resetTime,
        firstRequest: now 
      });
      
      return {
        success: true,
        data: {
          allowed: true,
          remaining: config.limit - 1,
          resetTime,
        },
      };
    }

    if (existing.count >= config.limit) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
      
      return {
        success: true,
        data: {
          allowed: false,
          remaining: 0,
          resetTime: existing.resetTime,
          retryAfter,
        },
      };
    }

    // Increment count
    existing.count++;
    rateLimitStore.set(config.key, existing);

    return {
      success: true,
      data: {
        allowed: true,
        remaining: config.limit - existing.count,
        resetTime: existing.resetTime,
      },
    };
  } catch (error) {
    // On error, allow the request but log the issue
    console.error('Rate limit check failed:', error);
    return {
      success: true,
      data: {
        allowed: true,
        remaining: config.limit,
        resetTime: Date.now() + config.windowMs,
      },
    };
  }
}

/**
 * Enhanced rate limit check using the existing utility with fallback
 */
export async function checkRateLimitEnhanced(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<ActionResult<{ allowed: boolean; remaining: number; resetTime: number }>> {
  try {
    // Try to use the existing rate limit utility first
    const allowed = await checkBasicRateLimit(identifier, limit, windowMs);
    
    if (allowed) {
      return {
        success: true,
        data: {
          allowed: true,
          remaining: limit - 1, // Approximate
          resetTime: Date.now() + windowMs,
        },
      };
    } else {
      return {
        success: true,
        data: {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + windowMs,
        },
      };
    }
  } catch (error) {
    // Fallback to our enhanced rate limiting
    console.warn('Basic rate limit check failed, using enhanced:', error);
    return await checkRateLimit({
      key: identifier,
      limit,
      windowMs,
    });
  }
}

/**
 * Apply rate limiting to an action with enhanced error information
 */
export async function withRateLimit<T>(
  config: RateLimitConfig,
  operation: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  const rateLimitResult = await checkRateLimit(config);

  if (!rateLimitResult.success) {
    return ErrorFactory.internal('Rate limit check failed') as ActionResult<T>;
  }

  if (!rateLimitResult.data?.allowed) {
    const retryAfter = rateLimitResult.data?.retryAfter ||
                      Math.ceil(((rateLimitResult.data?.resetTime || Date.now()) - Date.now()) / 1000);

    return ErrorFactory.rateLimit(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`
    ) as ActionResult<T>;
  }

  return await operation();
}

/**
 * Internal helper to adapt error results across generics.
 */
type AnyErrorResult = ActionResult<never>;
function asError<T>(err: AnyErrorResult): ActionResult<T> {
  return err as ActionResult<T>;
}

/**
 * Resolve rate limit key for contextual rate limiting.
 */
async function resolveRateLimitKey(
  action: string,
  rateLimitType: 'user' | 'company' | 'ip' | 'global'
): Promise<ActionResult<string>> {
  try {
    switch (rateLimitType) {
      case 'user': {
        const userId = await getAuthUserId();
        if (!userId) {
          return ErrorFactory.authRequired();
        }
        return {
          success: true,
          data: createUserRateLimitKey(userId, action),
        };
      }
      case 'company': {
        const companyId = await getCurrentCompanyId();
        if (!companyId) {
          return ErrorFactory.unauthorized('Company context required');
        }
        return {
          success: true,
          data: createCompanyRateLimitKey(companyId, action),
        };
      }
      case 'ip': {
        const metadata = await getRequestMetadata();
        const ipAddress = metadata.ipAddress || 'unknown';
        return {
          success: true,
          data: createIpRateLimitKey(ipAddress, action),
        };
      }
      case 'global': {
        return {
          success: true,
          data: `global:${action}`,
        };
      }
      default:
        return ErrorFactory.internal('Invalid rate limit type');
    }
  } catch (error) {
    console.error('Failed to resolve rate limit key:', error);
    return ErrorFactory.internal('Rate limiting failed');
  }
}

/**
 * Apply rate limiting with automatic key generation based on context
 */
export async function withContextualRateLimit<T>(
  action: string,
  rateLimitType: 'user' | 'company' | 'ip' | 'global',
  config: Omit<RateLimitConfig, 'key'>,
  operation: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  const keyResult = await resolveRateLimitKey(action, rateLimitType);
  if (!keyResult.success || !keyResult.data) {
    return asError<T>(keyResult as AnyErrorResult);
  }

  try {
    return await withRateLimit<T>(
      { ...config, key: keyResult.data },
      operation
    );
  } catch (error) {
    console.error('Contextual rate limit failed:', error);
    return asError<T>(ErrorFactory.internal('Rate limiting failed'));
  }
}

/**
 * Create rate limit key for user-specific actions
 */
export function createUserRateLimitKey(
  userId: string,
  action: string
): string {
  return `user:${userId}:${action}`;
}

/**
 * Create rate limit key for company-specific actions
 */
export function createCompanyRateLimitKey(
  companyId: string,
  action: string
): string {
  return `company:${companyId}:${action}`;
}

/**
 * Create rate limit key for IP-based actions
 */
export function createIpRateLimitKey(
  ipAddress: string,
  action: string
): string {
  return `ip:${ipAddress}:${action}`;
}

/**
 * Standard rate limit configurations organized by domain and sensitivity
 */
export const RateLimits = {
  // Authentication actions
  AUTH_LOGIN: { limit: 5, windowMs: 300000 }, // 5 per 5 minutes
  AUTH_SIGNUP: { limit: 3, windowMs: 3600000 }, // 3 per hour
  AUTH_PASSWORD_RESET: { limit: 3, windowMs: 3600000 }, // 3 per hour
  AUTH_PASSWORD_CHANGE: { limit: 3, windowMs: 300000 }, // 3 per 5 minutes
  
  // User actions
  USER_PROFILE_UPDATE: { limit: 10, windowMs: 60000 }, // 10 per minute
  USER_SETTINGS_UPDATE: { limit: 10, windowMs: 60000 }, // 10 per minute
  USER_AVATAR_UPLOAD: { limit: 5, windowMs: 300000 }, // 5 per 5 minutes
  
  // Team actions
  TEAM_INVITE: { limit: 20, windowMs: 3600000 }, // 20 per hour
  TEAM_MEMBER_UPDATE: { limit: 50, windowMs: 3600000 }, // 50 per hour
  TEAM_MEMBER_REMOVE: { limit: 10, windowMs: 3600000 }, // 10 per hour
  TEAM_ROLE_UPDATE: { limit: 20, windowMs: 3600000 }, // 20 per hour
  
  // Billing actions
  BILLING_UPDATE: { limit: 5, windowMs: 300000 }, // 5 per 5 minutes
  PAYMENT_METHOD_ADD: { limit: 10, windowMs: 3600000 }, // 10 per hour
  PAYMENT_METHOD_DELETE: { limit: 10, windowMs: 3600000 }, // 10 per hour
  SUBSCRIPTION_UPDATE: { limit: 5, windowMs: 3600000 }, // 5 per hour
  
  // Campaign actions
  CAMPAIGN_CREATE: { limit: 20, windowMs: 3600000 }, // 20 per hour
  CAMPAIGN_UPDATE: { limit: 100, windowMs: 3600000 }, // 100 per hour
  CAMPAIGN_DELETE: { limit: 10, windowMs: 3600000 }, // 10 per hour
  CAMPAIGN_SEND: { limit: 50, windowMs: 3600000 }, // 50 per hour
  
  // Domain actions
  DOMAIN_CREATE: { limit: 5, windowMs: 3600000 }, // 5 per hour
  DOMAIN_UPDATE: { limit: 20, windowMs: 3600000 }, // 20 per hour
  DOMAIN_DELETE: { limit: 5, windowMs: 3600000 }, // 5 per hour
  DOMAIN_VERIFY: { limit: 10, windowMs: 3600000 }, // 10 per hour
  
  // Mailbox actions
  MAILBOX_CREATE: { limit: 10, windowMs: 3600000 }, // 10 per hour
  MAILBOX_UPDATE: { limit: 50, windowMs: 3600000 }, // 50 per hour
  MAILBOX_DELETE: { limit: 10, windowMs: 3600000 }, // 10 per hour
  
  // Template actions
  TEMPLATE_CREATE: { limit: 50, windowMs: 3600000 }, // 50 per hour
  TEMPLATE_UPDATE: { limit: 100, windowMs: 3600000 }, // 100 per hour
  TEMPLATE_DELETE: { limit: 20, windowMs: 3600000 }, // 20 per hour
  
  // Analytics actions
  ANALYTICS_QUERY: { limit: 200, windowMs: 60000 }, // 200 per minute
  ANALYTICS_EXPORT: { limit: 10, windowMs: 3600000 }, // 10 per hour
  
  // Notification actions
  NOTIFICATION_SEND: { limit: 100, windowMs: 3600000 }, // 100 per hour
  NOTIFICATION_PREFERENCES_UPDATE: { limit: 20, windowMs: 60000 }, // 20 per minute
  
  // General actions
  GENERAL_READ: { limit: 1000, windowMs: 60000 }, // 1000 per minute
  GENERAL_WRITE: { limit: 100, windowMs: 60000 }, // 100 per minute
  SENSITIVE_ACTION: { limit: 5, windowMs: 60000 }, // 5 per minute
  BULK_OPERATION: { limit: 10, windowMs: 300000 }, // 10 per 5 minutes
} as const;

/**
 * Helper to get rate limit config by action type
 */
export function getRateLimitConfig(action: keyof typeof RateLimits): RateLimitConfig {
  const config = RateLimits[action];
  return {
    key: '', // Will be set by the calling function
    ...config,
  };
}

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
 * Type guard helpers to stabilize success/error narrowing for ActionResult
 */
export function isSuccessfulResult<T>(
  result: ActionResult<T>
): result is ActionResult<T> & { success: true; data: T } {
  return result.success === true && (result as { data?: unknown }).data !== undefined;
}

export function isErrorResult<T>(
  result: ActionResult<T>
): result is ActionResult<T> & { success: false; error: ActionError } {
  return result.success === false && (result as { error?: unknown }).error !== undefined;
}

/**
 * Utility to validate company isolation for resources
 */
export async function validateCompanyIsolation(
  resourceCompanyId: string,
  context?: ActionContext
): Promise<ActionResult<void>> {
  try {
    const currentCompanyId = context?.companyId || await getCurrentCompanyId();
    
    if (!currentCompanyId) {
      return ErrorFactory.unauthorized('Company context required');
    }

    if (currentCompanyId !== resourceCompanyId) {
      return ErrorFactory.unauthorized(
        'Access denied: resource belongs to a different organization'
      );
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Company isolation validation failed:', error);
    return ErrorFactory.internal('Failed to validate company isolation');
  }
}

/**
 * Get rate limit key for different contexts
 */
export function getRateLimitKey(
  type: 'user' | 'company' | 'ip' | 'global',
  identifier: string,
  action: string
): string {
  switch (type) {
    case 'user':
      return createUserRateLimitKey(identifier, action);
    case 'company':
      return createCompanyRateLimitKey(identifier, action);
    case 'ip':
      return createIpRateLimitKey(identifier, action);
    case 'global':
      return `global:${action}`;
    default:
      throw new Error(`Invalid rate limit type: ${type}`);
  }
}

/**
 * Cleanup rate limit store (should be called periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  let cleaned = 0;
  
  Array.from(rateLimitStore.entries()).forEach(([key, data]) => {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired rate limit entries`);
  }
}

/**
 * Get rate limit statistics for monitoring
 */
export function getRateLimitStats(): {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
} {
  const now = Date.now();
  let activeKeys = 0;
  let expiredKeys = 0;
  
  Array.from(rateLimitStore.entries()).forEach(([ , data]) => {
    if (data.resetTime >= now) {
      activeKeys++;
    } else {
      expiredKeys++;
    }
  });
  
  return {
    totalKeys: rateLimitStore.size,
    activeKeys,
    expiredKeys,
  };
}

// Periodic cleanup of rate limit store (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
