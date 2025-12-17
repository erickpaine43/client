/**
 * Profile Actions Module
 * 
 * This module provides user profile management actions with standardized
 * error handling, authentication, and type safety.
 */

'use server';

import { ActionResult } from '../core/types';
import { ErrorFactory } from '../core/errors';

// Import the legacy function and wrap it with new types
import { getUserProfile as legacyGetUserProfile, updateUserProfile as legacyUpdateUserProfile } from '../profileActions';
import { NileUser, ProfileFormData } from '@/lib/utils';

/**
 * Get user profile for the authenticated user
 * Wraps the legacy implementation with new ActionResult type
 */
export async function getUserProfile(): Promise<ActionResult<NileUser>> {
  try {
    const legacyResult = await legacyGetUserProfile();
    
    // Convert ProfileActionResponse to ActionResult
    if (legacyResult.success && legacyResult.data) {
      return {
        success: true,
        data: legacyResult.data,
      };
    } else if (legacyResult.error) {
      return {
        success: false,
        error: {
          type: legacyResult.error.type,
          message: legacyResult.error.message,
          field: legacyResult.error.field,
        },
      };
    } else {
      return ErrorFactory.internal('Failed to fetch user profile');
    }
  } catch {
    return ErrorFactory.internal('Failed to fetch user profile');
  }
}

/**
 * Update user profile for the authenticated user
 * Wraps the legacy implementation with new ActionResult type
 */
export async function updateUserProfile(profileData: Partial<ProfileFormData>): Promise<ActionResult<NileUser>> {
  try {
    const legacyResult = await legacyUpdateUserProfile(profileData);
    
    // Convert ProfileActionResponse to ActionResult
    if (legacyResult.success && legacyResult.data) {
      return {
        success: true,
        data: legacyResult.data,
      };
    } else if (legacyResult.error) {
      return {
        success: false,
        error: {
          type: legacyResult.error.type,
          message: legacyResult.error.message,
          field: legacyResult.error.field,
        },
      };
    } else {
      return ErrorFactory.internal('Failed to update user profile');
    }
  } catch {
    return ErrorFactory.internal('Failed to update user profile');
  }
}
