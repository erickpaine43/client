/**
 * Permission and authorization utilities
 * 
 * This module provides permission checking and resource ownership validation
 * functions extracted from auth.ts for better modularity.
 */

import { ActionResult } from './types';
import { ErrorFactory } from './errors';
import { Permission } from '../../../types/auth';
import { getCurrentUserId as getAuthUserId } from '../../utils/auth';
import { getCurrentCompanyId, getUserProfile } from './auth-validators';

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

/**
 * Utility to validate company isolation for resources
 */
export async function validateCompanyIsolation(
  resourceCompanyId: string,
  companyId?: string
): Promise<ActionResult<void>> {
  try {
    const currentCompanyId = companyId || await getCurrentCompanyId();
    
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
