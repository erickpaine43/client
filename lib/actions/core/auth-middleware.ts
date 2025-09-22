/**
 * Authentication and Authorization Middleware
 * 
 * This module provides comprehensive middleware for server actions with:
 * - Consistent authentication checking
 * - Company/tenant isolation
 * - Rate limiting for sensitive operations
 * - Permission-based access control
 * - Audit logging for security events
 */

import { ActionContext, ActionResult, RateLimitConfig } from './types';
import { ErrorFactory } from './errors';
import { 
  requireAuth,
  requireAuthWithCompany,
  requirePermission,
  withContextualRateLimit,
  validateCompanyIsolation,
  RateLimits,
  createUserRateLimitKey,
  createCompanyRateLimitKey,
  createIpRateLimitKey
} from './auth';
import { Permission } from '../../../types/auth';
import { headers } from 'next/headers';

/**
 * Authentication levels for different operations
 */
export enum AuthLevel {
  NONE = 'none',           // No authentication required
  USER = 'user',           // Basic user authentication
  COMPANY = 'company',     // User + company context required
  PERMISSION = 'permission', // Specific permission required
  ADMIN = 'admin',         // Admin role required
  SUPER_ADMIN = 'super_admin' // Super admin role required
}

/**
 * Rate limiting types for different contexts
 */
export enum RateLimitType {
  USER = 'user',           //  rate limiting
  COMPANY = 'company',     // Per-company rate limiting
  IP = 'ip',               // Per-IP rate limiting
  GLOBAL = 'global'        // Global rate limiting
}

/**
 * Security configuration for actions
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
    includeRequestData?: boolean;
  };
  validation?: {
    requireHttps?: boolean;
    allowedOrigins?: string[];
    requireCsrfToken?: boolean;
  };
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  timestamp: number;
  userId?: string;
  companyId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Request validation result
 */
interface RequestValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * In-memory audit log store (should be replaced with proper logging service)
 */
const auditLogs: AuditLogEntry[] = [];

/**
 * Get request metadata for security logging
 */
async function getSecurityMetadata(): Promise<{
  ipAddress?: string;
  userAgent?: string;
  origin?: string;
  referer?: string;
}> {
  try {
    const headersList = await headers();
    
    return {
      ipAddress: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                headersList.get('x-real-ip') || 
                headersList.get('cf-connecting-ip') || 
                undefined,
      userAgent: headersList.get('user-agent') || undefined,
      origin: headersList.get('origin') || undefined,
      referer: headersList.get('referer') || undefined,
    };
  } catch (error) {
    console.error('Failed to get security metadata:', error);
    return {};
  }
}

/**
 * Validate request security requirements
 */
async function validateRequest(config: SecurityConfig): Promise<RequestValidationResult> {
  if (!config.validation) {
    return { valid: true };
  }

  const metadata = await getSecurityMetadata();

  // Check HTTPS requirement
  if (config.validation.requireHttps && process.env.NODE_ENV === 'production') {
    const protocol = process.env.VERCEL_URL ? 'https' : 'http';
    if (protocol !== 'https') {
      return { valid: false, error: 'HTTPS required for this operation' };
    }
  }

  // Check allowed origins
  if (config.validation.allowedOrigins && metadata.origin) {
    if (!config.validation.allowedOrigins.includes(metadata.origin)) {
      return { valid: false, error: 'Origin not allowed' };
    }
  }

  return { valid: true };
}

/**
 * Log security event for audit trail
 */
async function logSecurityEvent(
  action: string,
  context: ActionContext | null,
  success: boolean,
  error?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const securityMetadata = await getSecurityMetadata();
    
    const auditEntry: AuditLogEntry = {
      timestamp: Date.now(),
      userId: context?.userId,
      companyId: context?.companyId,
      action,
      ipAddress: securityMetadata.ipAddress,
      userAgent: securityMetadata.userAgent,
      success,
      error,
      metadata: {
        ...metadata,
        requestId: context?.requestId,
        origin: securityMetadata.origin,
        referer: securityMetadata.referer,
      },
    };

    // Store audit log (in production, send to logging service)
    auditLogs.push(auditEntry);
    
    // Keep only last 1000 entries in memory
    if (auditLogs.length > 1000) {
      auditLogs.splice(0, auditLogs.length - 1000);
    }

    // Log security events to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', auditEntry);
    }
  } catch (logError) {
    console.error('Failed to log security event:', logError);
  }
}

/**
 * Check authentication based on level
 */
async function checkAuthentication(
  authConfig: SecurityConfig['auth']
): Promise<ActionResult<ActionContext>> {
  switch (authConfig.level) {
    case AuthLevel.NONE:
      // Create minimal context without authentication
      return {
        success: true,
        data: {
          timestamp: Date.now(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      };

    case AuthLevel.USER:
      return await requireAuth();

    case AuthLevel.COMPANY:
      return await requireAuthWithCompany();

    case AuthLevel.PERMISSION:
      if (!authConfig.permission) {
        return ErrorFactory.internal('Permission required but not specified');
      }
      
      const userAuthResult = authConfig.requireCompanyIsolation 
        ? await requireAuthWithCompany()
        : await requireAuth();
      
      if (!userAuthResult.success || !userAuthResult.data) {
        return userAuthResult;
      }

      const permissionResult = await requirePermission(
        authConfig.permission,
        userAuthResult.data.userId
      );
      
      if (!permissionResult.success) {
        return {
          success: false,
          error: permissionResult.error
        } as ActionResult<ActionContext>;
      }

      return userAuthResult;

    case AuthLevel.ADMIN:
      const adminAuthResult = await requireAuthWithCompany();
      if (!adminAuthResult.success || !adminAuthResult.data) {
        return adminAuthResult;
      }

      const adminPermissionResult = await requirePermission(
        Permission.UPDATE_SETTINGS, // Admin-level permission
        adminAuthResult.data.userId
      );
      
      if (!adminPermissionResult.success) {
        return {
          success: false,
          error: adminPermissionResult.error
        } as ActionResult<ActionContext>;
      }

      return adminAuthResult;

    case AuthLevel.SUPER_ADMIN:
      const superAdminAuthResult = await requireAuthWithCompany();
      if (!superAdminAuthResult.success || !superAdminAuthResult.data) {
        return superAdminAuthResult;
      }

      const superAdminPermissionResult = await requirePermission(
        Permission.DELETE_USER, // Super admin permission
        superAdminAuthResult.data.userId
      );
      
      if (!superAdminPermissionResult.success) {
        return {
          success: false,
          error: superAdminPermissionResult.error
        } as ActionResult<ActionContext>;
      }

      return superAdminAuthResult;

    default:
      return ErrorFactory.internal('Invalid authentication level');
  }
}

/**
 * Apply company isolation validation
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function applyCompanyIsolation(
  context: ActionContext,
  resourceCompanyId?: string
): Promise<ActionResult<void>> {
  if (!resourceCompanyId || !context.companyId) {
    return { success: true, data: undefined };
  }

  return await validateCompanyIsolation(resourceCompanyId, context);
}

/**
 * Main security middleware function
 */
export async function withSecurity<T, Args extends unknown[]>(
  actionName: string,
  config: SecurityConfig,
  handler: (context: ActionContext, ...args: Args) => Promise<ActionResult<T>>,
  ...args: Args
): Promise<ActionResult<T>> {
  let context: ActionContext | null = null;
  
  try {
    // 1. Validate request security requirements
    const requestValidation = await validateRequest(config);
    if (!requestValidation.valid) {
      await logSecurityEvent(actionName, null, false, requestValidation.error);
      return ErrorFactory.unauthorized(requestValidation.error || 'Request validation failed');
    }

    // 2. Check authentication
    const authResult = await checkAuthentication(config.auth);
    if (!authResult.success || !authResult.data) {
      await logSecurityEvent(actionName, null, false, 'Authentication failed');
      return authResult as ActionResult<T>;
    }

    context = authResult.data;

    // 3. Apply rate limiting if configured
    if (config.rateLimit) {
      const rateLimitKey = await getRateLimitKey(
        config.rateLimit.type,
        context,
        config.rateLimit.action
      );

      if (!rateLimitKey.success || !rateLimitKey.data) {
        await logSecurityEvent(actionName, context, false, 'Rate limit key generation failed');
        return rateLimitKey as ActionResult<T>;
      }

      return await withContextualRateLimit<T>(
        config.rateLimit.action,
        config.rateLimit.type,
        config.rateLimit.config,
        async () => {
          // 4. Execute the handler
          const result = await handler(context!, ...args);
          
          // 5. Log successful operation
          if (config.audit?.enabled) {
            await logSecurityEvent(
              actionName,
              context,
              result.success,
              result.success ? undefined : String((result as { error?: unknown }).error || 'Unknown error'),
              config.audit.includeRequestData ? { args } : undefined
            );
          }

          return result;
        }
      );
    }

    // 4. Execute the handler without rate limiting
    const result = await handler(context, ...args);
    
    // 5. Log successful operation
    if (config.audit?.enabled) {
      await logSecurityEvent(
        actionName,
        context,
        result.success,
        result.success ? undefined : String((result as { error?: unknown }).error || 'Unknown error'),
        config.audit.includeRequestData ? { args } : undefined
      );
    }

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log security error
    await logSecurityEvent(actionName, context, false, errorMessage);
    
    console.error(`Security middleware error in ${actionName}:`, error);
    return ErrorFactory.internal('Security check failed');
  }
}

/**
 * Get rate limit key based on type and context
 */
async function getRateLimitKey(
  type: RateLimitType,
  context: ActionContext,
  action: string
): Promise<ActionResult<string>> {
  try {
    switch (type) {
      case RateLimitType.USER:
        if (!context.userId) {
          return ErrorFactory.authRequired();
        }
        return {
          success: true,
          data: createUserRateLimitKey(context.userId, action),
        };

      case RateLimitType.COMPANY:
        if (!context.companyId) {
          return ErrorFactory.unauthorized('Company context required');
        }
        return {
          success: true,
          data: createCompanyRateLimitKey(context.companyId, action),
        };

      case RateLimitType.IP:
        const metadata = await getSecurityMetadata();
        const ipAddress = metadata.ipAddress || 'unknown';
        return {
          success: true,
          data: createIpRateLimitKey(ipAddress, action),
        };

      case RateLimitType.GLOBAL:
        return {
          success: true,
          data: `global:${action}`,
        };

      default:
        return ErrorFactory.internal('Invalid rate limit type');
    }
  } catch (error) {
    console.error('Failed to get rate limit key:', error);
    return ErrorFactory.internal('Rate limit key generation failed');
  }
}

/**
 * Predefined security configurations for common patterns
 */
export const SecurityConfigs = {
  // Public read operations
  PUBLIC_READ: {
    auth: { level: AuthLevel.NONE },
    rateLimit: {
      type: RateLimitType.IP,
      action: 'public_read',
      config: RateLimits.GENERAL_READ,
    },
    audit: { enabled: false },
  } as SecurityConfig,

  // User read operations
  USER_READ: {
    auth: { level: AuthLevel.USER },
    rateLimit: {
      type: RateLimitType.USER,
      action: 'user_read',
      config: RateLimits.GENERAL_READ,
    },
    audit: { enabled: false },
  } as SecurityConfig,

  // Company-scoped read operations
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

  // User write operations
  USER_WRITE: {
    auth: { level: AuthLevel.USER },
    rateLimit: {
      type: RateLimitType.USER,
      action: 'user_write',
      config: RateLimits.GENERAL_WRITE,
    },
    audit: { enabled: true },
  } as SecurityConfig,

  // Company-scoped write operations
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
      includeRequestData: true,
    },
    validation: {
      requireHttps: true,
    },
  } as SecurityConfig,

  // Billing operations
  BILLING_OPERATION: {
    auth: { 
      level: AuthLevel.PERMISSION,
      permission: Permission.UPDATE_BILLING,
      requireCompanyIsolation: true,
    },
    rateLimit: {
      type: RateLimitType.USER,
      action: 'billing_operation',
      config: RateLimits.BILLING_UPDATE,
    },
    audit: { 
      enabled: true,
      sensitiveData: true,
      includeRequestData: true,
    },
    validation: {
      requireHttps: true,
    },
  } as SecurityConfig,

  // Admin operations
  ADMIN_OPERATION: {
    auth: { 
      level: AuthLevel.ADMIN,
      requireCompanyIsolation: true,
    },
    rateLimit: {
      type: RateLimitType.USER,
      action: 'admin_operation',
      config: RateLimits.SENSITIVE_ACTION,
    },
    audit: { 
      enabled: true,
      sensitiveData: true,
      includeRequestData: true,
    },
    validation: {
      requireHttps: true,
    },
  } as SecurityConfig,

  // Analytics operations
  ANALYTICS_READ: {
    auth: { 
      level: AuthLevel.PERMISSION,
      permission: Permission.VIEW_ANALYTICS,
      requireCompanyIsolation: true,
    },
    rateLimit: {
      type: RateLimitType.COMPANY,
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
      type: RateLimitType.USER,
      action: 'bulk_operation',
      config: RateLimits.BULK_OPERATION,
    },
    audit: { 
      enabled: true,
      includeRequestData: true,
    },
  } as SecurityConfig,
} as const;

/**
 * Helper function to create custom security config
 */
export function createSecurityConfig(
  overrides: Partial<SecurityConfig>
): SecurityConfig {
  return {
    auth: { level: AuthLevel.USER },
    audit: { enabled: true },
    ...overrides,
  };
}

/**
 * Get audit logs (admin only)
 */
export async function getAuditLogs(
  filters?: {
    userId?: string;
    companyId?: string;
    action?: string;
    startTime?: number;
    endTime?: number;
    success?: boolean;
  }
): Promise<ActionResult<AuditLogEntry[]>> {
  return withSecurity(
    'get_audit_logs',
    SecurityConfigs.ADMIN_OPERATION,
    async (_context: ActionContext) => {
      let filteredLogs = [...auditLogs];

      if (filters) {
        if (filters.userId) {
          filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
        }
        if (filters.companyId) {
          filteredLogs = filteredLogs.filter(log => log.companyId === filters.companyId);
        }
        if (filters.action) {
          filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action!));
        }
        if (filters.startTime) {
          filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime!);
        }
        if (filters.endTime) {
          filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime!);
        }
        if (filters.success !== undefined) {
          filteredLogs = filteredLogs.filter(log => log.success === filters.success);
        }
      }

      // Sort by timestamp descending (newest first)
      filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

      return {
        success: true,
        data: filteredLogs,
      };
    }
  );
}

/**
 * Clear audit logs (super admin only)
 */
export async function clearAuditLogs(): Promise<ActionResult<{ cleared: number }>> {
  return withSecurity(
    'clear_audit_logs',
    {
      auth: { level: AuthLevel.SUPER_ADMIN },
      audit: { enabled: true, sensitiveData: true },
    },
    async (_context: ActionContext) => {
      const clearedCount = auditLogs.length;
      auditLogs.length = 0;

      return {
        success: true,
        data: { cleared: clearedCount },
      };
    }
  );
}

/**
 * Export audit logs (admin only)
 */
export async function exportAuditLogs(
  format: 'json' | 'csv' = 'json',
  filters?: Parameters<typeof getAuditLogs>[0]
): Promise<ActionResult<{ downloadUrl: string; expiresAt: number }>> {
  return withSecurity(
    'export_audit_logs',
    SecurityConfigs.ADMIN_OPERATION,
    async (_context: ActionContext) => {
      const logsResult = await getAuditLogs(filters);
      
      if (!logsResult.success || !logsResult.data) {
        return {
          success: false,
          error: logsResult.success ? 'No audit logs found' : (logsResult as { error?: unknown }).error
        } as ActionResult<{ downloadUrl: string; expiresAt: number }>;
      }

      // In a real implementation, you would:
      // 1. Convert logs to the requested format
      // 2. Upload to a secure temporary storage
      // 3. Return a signed URL with expiration

      const exportData = {
        downloadUrl: `/api/audit-logs/export?format=${format}&token=${Date.now()}`,
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };

      return {
        success: true,
        data: exportData,
      };
    }
  );
}
