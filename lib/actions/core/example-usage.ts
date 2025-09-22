/**
 * Example usage of core action utilities
 * This file demonstrates how to use the core utilities in a real action
 */

import {
  ActionResult,
  requireAuth,
  validateObject,
  Validators,
  ErrorFactory,
  withErrorHandling,
  withRateLimit,
  createUserRateLimitKey,
  RateLimits,
} from './index';

// Example data types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
}

/**
 * Example action: Update user profile
 * Demonstrates authentication, validation, rate limiting, and error handling
 */
export async function updateUserProfile(
  data: UpdateProfileData
): Promise<ActionResult<UserProfile>> {
  // 1. Authentication
  const authResult = await requireAuth();
  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    };
  }
  const userId = authResult.data!.userId!;

  // 2. Input validation
  const validation = validateObject(data, {
    name: Validators.name,
    email: Validators.email,
    phone: (value, field) => {
      // Optional phone validation
      if (!value) return { isValid: true, data: undefined };
      return Validators.phone(value, field);
    },
  });

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors?.[0] ? {
        type: 'validation' as const,
        message: validation.errors[0].message,
        code: validation.errors[0].code,
        field: validation.errors[0].field,
      } : undefined,
    };
  }

  // 3. Rate limiting
  return await withRateLimit(
    {
      key: createUserRateLimitKey(userId, 'update-profile'),
      ...RateLimits.USER_SETTINGS_UPDATE,
    },
    async () => {
      // 4. Business logic with error handling
      return await withErrorHandling(async () => {
        // Simulate database update
        const updatedProfile: UserProfile = {
          id: userId,
          name: validation.data!.name!,
          email: validation.data!.email!,
          phone: validation.data!.phone,
        };

        // In real implementation, you would:
        // - Update the database
        // - Handle any business logic
        // - Return the updated profile

        return updatedProfile;
      });
    }
  );
}

/**
 * Example action: Simple validation-only action
 */
export async function validateEmailAddress(
  email: string
): Promise<ActionResult<{ valid: boolean; normalized: string }>> {
  const validation = Validators.email(email, 'email');
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors?.[0] ? {
        type: 'validation' as const,
        message: validation.errors[0].message,
        code: validation.errors[0].code,
        field: validation.errors[0].field,
      } : undefined,
    };
  }

  return {
    success: true,
    data: {
      valid: true,
      normalized: validation.data!,
    },
  };
}

/**
 * Example action: Error handling scenarios
 */
export async function demonstrateErrorHandling(
  scenario: 'auth' | 'validation' | 'rate_limit' | 'server'
): Promise<ActionResult<string>> {
  switch (scenario) {
    case 'auth':
      return ErrorFactory.authRequired('Please log in to continue');

    case 'validation':
      return ErrorFactory.validation('Invalid input provided', 'email');

    case 'rate_limit':
      return ErrorFactory.rateLimit('Too many requests. Please wait.');

    case 'server':
      return ErrorFactory.internal('Something went wrong on our end');

    default:
      return {
        success: true,
        data: 'All scenarios handled successfully',
      };
  }
}
