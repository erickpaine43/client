/**
 * Authentication validation utilities
 * 
 * This module provides authentication validation functions extracted from auth.ts
 * to improve modularity and maintainability.
 */

import { ActionResult, ActionContext, ActionError } from './types';
import { ErrorFactory } from './errors';
import { Permission, UserRole, RolePermissions } from '../../../types/auth';
import {
  getCurrentUser,
  getCurrentUserId as getAuthUserId,
  requireAuth as requireAuthUser,
} from '../../utils/auth';
import { headers } from 'next/headers';

/**
 * Generate a unique request ID for tracking
 */
export function generateRequestId(): string {
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
export async function getRequestMetadata(): Promise<{
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
export async function getUserProfile(_userId: string): Promise<{
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
