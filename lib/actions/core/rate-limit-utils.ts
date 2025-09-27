/**
 * Rate limiting utilities
 * 
 * This module provides comprehensive rate limiting functionality
 * extracted from auth.ts for better modularity and maintainability.
 */

import { ActionResult, RateLimitConfig } from './types';
import { ErrorFactory } from './errors';
import { checkRateLimit as checkBasicRateLimit } from '../../utils/auth';
import { getCurrentUserId as getAuthUserId } from '../../utils/auth';
import { getCurrentCompanyId, getRequestMetadata } from './auth-validators';

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

// Periodic cleanup of rate limit store (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
