# Actions Best Practices and Common Patterns

## Overview

This document outlines best practices and common patterns for working with the refactored actions system. Following these guidelines ensures consistency, maintainability, and optimal performance across the application.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Action Structure](#action-structure)
3. [Error Handling Best Practices](#error-handling-best-practices)
4. [Validation Patterns](#validation-patterns)
5. [Authentication and Authorization](#authentication-and-authorization)
6. [Performance Optimization](#performance-optimization)
7. [Testing Best Practices](#testing-best-practices)
8. [Code Organization](#code-organization)
9. [Common Anti-Patterns](#common-anti-patterns)
10. [Migration Guidelines](#migration-guidelines)

## Core Principles

### 1. Consistency First

All actions should follow the same patterns for:

- Return types (`ActionResult<T>`)
- Error handling (standardized error types)
- Authentication (using `requireAuth()`)
- Validation (using validation utilities)
- Rate limiting (consistent limits and keys)

### 2. Type Safety

- Use TypeScript throughout
- Define proper interfaces for all data structures
- Avoid `any` and `unknown` types
- Leverage type inference where possible

### 3. Fail Fast

- Validate inputs early
- Check authentication before processing
- Return errors immediately when detected
- Don't continue processing with invalid data

### 4. Predictable Behavior

- Actions should behave consistently across different contexts
- Error messages should be clear and actionable
- Response formats should be standardized
- Side effects should be minimal and documented

## Action Structure

### Standard Action Template

```typescript
import {
  ActionResult,
  requireAuth,
  validateObject,
  Validators,
  validationToActionResult,
  withErrorHandling,
  withRateLimit,
  RateLimits,
  createUserRateLimitKey,
} from "@/lib/actions/core";

export async function myAction(
  data: MyActionData
): Promise<ActionResult<MyActionResult>> {
  // 1. Authentication (if required)
  const authResult = await requireAuth();
  if (!autsuccess) {
    return authResult;
  }

  const { userId, companyId } = authResult.data;

  // 2. Input validation
  const validation = validateObject(data, {
    field1: Validators.email,
    field2: Validators.name,
    field3: (value) => validateCustomField(value),
  });

  if (!validation.isValid) {
    return validationToActionResult(validation);
  }

  // 3. Rate limiting (if needed)
  return await withRateLimit(
    {
      key: createUserRateLimitKey(userId, "my-action"),
      ...RateLimits.GENERAL_WRITE,
    },
    async () => {
      // 4. Business logic with error handling
      return await withErrorHandling(async () => {
        const result = await performBusinessLogic(validation.data, userId);
        return result;
      });
    }
  );
}
```

### Action Naming Conventions

```typescript
// ✅ Good - Clear, descriptive names
export async function getUserProfile(): Promise<ActionResult<UserProfile>>
export async function updateUserProfile(data: UpdateProfileData): Promise<ActionResult<UserProfile>>
export async function deleteUserAccount(): Promise<ActionResult<void>>
export async function sendTeamInvitation(data: InvitationData): Promise<ActionResult<Invitation>>

// ❌ Bad - Vague or inconsistent names
export async function getUser(): Promise<ActionResult<any>>
export async function updateProfile(data: any): Promise<any>
export async function delete(): Promise<ActionResult<void>>
export async function invite(data: any): Promise<ActionResult<any>>
```

## Error Handling Best Practices

### Use ErrorFactory for Consistent Errors

```typescript
import { ErrorFactory } from "@/lib/actions/core";

// ✅ Good - Use ErrorFactory methods
if (!user) {
  return ErrorFactory.notFound("User not found", "USER_NOT_FOUND");
}

if (!hasPermission) {
  return ErrorFactory.permission(
    "Insufficient permissions",
    "INSUFFICIENT_PERMISSIONS"
  );
}

// ❌ Bad - Manual error creation
if (!user) {
  return { success: false, error: "User not found" };
}
```

### Provide Context in Error Messages

```typescript
// ✅ Good - Specific, actionable error messages
return ErrorFactory.validation(
  "Email address must be in valid format (e.g., user@domain.com)",
  "email",
  "INVALID_EMAIL_FORMAT"
);

return ErrorFactory.conflict(
  "A user with this email address already exists. Please use a different email or sign in.",
  "EMAIL_ALREADY_EXISTS"
);

// ❌ Bad - Vague error messages
return ErrorFactory.validation("Invalid input", "email");
return ErrorFactory.conflict("Conflict occurred");
```

### Handle Different Error Types Appropriately

```typescript
// ✅ Good - Specific handling for different error types
export async function handleActionResult<T>(
  result: ActionResult<T>,
  options: {
    onSuccess: (data: T) => void;
    onAuthError?: () => void;
    onValidationError?: (error: ActionError) => void;
    onRateLimit?: (retryAfter: number) => void;
    onGenericError?: (error: ActionError) => void;
  }
) {
  if (result.success) {
    options.onSuccess(result.data);
    return;
  }

  const error = result.error;

  switch (error.type) {
    case "auth":
      options.onAuthError?.() || redirectToLogin();
      break;

    case "validation":
      options.onValidationError?.(error) || showValidationError(error);
      break;

    case "rate_limit":
      const retryAfter = (error.details?.retryAfter as number) || 60;
      options.onRateLimit?.(retryAfter) || showRateLimitError(retryAfter);
      break;

    default:
      options.onGenericError?.(error) || showGenericError(error.message);
  }
}
```

## Validation Patterns

### Use Appropriate Validators

```typescript
import {
  validateObject,
  Validators,
  validateArray,
  validateEnum,
} from "@/lib/actions/core";

// ✅ Good - Use specific validators
const validation = validateObject(data, {
  email: Validators.email,
  name: Validators.name,
  phone: Validators.phone,
  url: Validators.url,
  description: Validators.description,
  age: (value) => validateNumber(value, "age", 18, 120),
  tags: (value) => validateArray(value, "tags", 0, 10),
  role: (value) => validateEnum(value, "role", ["admin", "member", "viewer"]),
});

// ❌ Bad - Generic validation without specific rules
const validation = validateObject(data, {
  email: (value) => validateRequired(value, "email"),
  name: (value) => validateRequired(value, "name"),
});
```

### Custom Validation Functions

```typescript
// ✅ Good - Reusable custom validators
export function validatePassword(
  value: unknown,
  fieldName: string
): ValidationResult<string> {
  const stringResult = validateString(value, fieldName, 8, 128);
  if (!stringResult.isValid) {
    return stringResult;
  }

  const password = stringResult.data;

  // Check password strength
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChars) {
    return {
      isValid: false,
      errors: [
        {
          field: fieldName,
          message:
            "Password must contain uppercase, lowercase, numbers, and special characters",
          code: "WEAK_PASSWORD",
        },
      ],
    };
  }

  return { isValid: true, data: password };
}

// Usage
const validation = validateObject(data, {
  password: validatePassword,
  confirmPassword: (value) => {
    const result = validatePassword(value, "confirmPassword");
    if (!result.isValid) return result;

    if (result.data !== data.password) {
      return {
        isValid: false,
        errors: [
          {
            field: "confirmPassword",
            message: "Passwords do not match",
            code: "PASSWORD_MISMATCH",
          },
        ],
      };
    }

    return result;
  },
});
```

### Validation Error Handling

```typescript
// ✅ Good - Comprehensive validation error handling
export async function createUser(
  data: CreateUserData
): Promise<ActionResult<User>> {
  const validation = validateObject(data, {
    email: Validators.email,
    name: Validators.name,
    password: validatePassword,
  });

  if (!validation.isValid) {
    // Log validation errors for debugging
    console.warn("User creation validation failed:", validation.errors);

    return validationToActionResult(validation);
  }

  // Additional business rule validation
  const existingUser = await findUserByEmail(validation.data.email);
  if (existingUser) {
    return ErrorFactory.conflict(
      "A user with this email address already exists",
      "EMAIL_ALREADY_EXISTS",
      "email"
    );
  }

  // Continue with validated data
  return await withErrorHandling(async () => {
    const user = await createUserInDatabase(validation.data);
    return user;
  });
}
```

## Authentication and Authorization

### Standard Authentication Pattern

```typescript
// ✅ Good - Standard auth pattern
export async function protectedAction(): Promise<ActionResult<Data>> {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  const { userId, companyId } = authResult.data;

  // Use authenticated context
  return await performAction(userId, companyId);
}

// ✅ Good - Optional auth pattern
export async function optionalAuthAction(): Promise<ActionResult<Data>> {
  const authResult = await requireAuth();
  const userId = authResult.success ? authResult.data.userId : null;

  // Adjust behavior based on auth status
  return await performAction(userId);
}
```

### Permission Checking

```typescript
// ✅ Good - Explicit permission checking
export async function adminOnlyAction(): Promise<ActionResult<Data>> {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  const { userId } = authResult.data;

  const hasPermission = await checkUserPermission(userId, "admin");
  if (!hasPermission) {
    return ErrorFactory.permission(
      "This action requires administrator privileges",
      "ADMIN_REQUIRED"
    );
  }

  return await performAdminAction(userId);
}

// ✅ Good - Resource-specific permissions
export async function updateResource(
  resourceId: string,
  data: UpdateData
): Promise<ActionResult<Resource>> {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  const { userId } = authResult.data;

  const canEdit = await checkResourcePermission(userId, resourceId, "edit");
  if (!canEdit) {
    return ErrorFactory.permission(
      "You don't have permission to edit this resource",
      "INSUFFICIENT_RESOURCE_PERMISSIONS"
    );
  }

  return await updateResourceInDatabase(resourceId, data);
}
```

### Rate Limiting Best Practices

```typescript
// ✅ Good - Appropriate rate limiting
export async function sendEmail(data: EmailData): Promise<ActionResult<void>> {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  const { userId } = authResult.data;

  // Different rate limits for different user types
  const userType = await getUserType(userId);
  const rateLimit =
    userType === "premium"
      ? { limit: 1000, window: 3600000 } // 1000/hour for premium
      : { limit: 100, window: 3600000 }; // 100/hour for free

  return await withRateLimit(
    {
      key: createUserRateLimitKey(userId, "send-email"),
      ...rateLimit,
    },
    async () => {
      return await sendEmailMessage(data);
    }
  );
}

// ✅ Good - Bulk operation rate limiting
export async function bulkOperation(
  items: BulkItem[]
): Promise<ActionResult<BulkResult>> {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  const { userId } = authResult.data;

  // Stricter limits for bulk operations
  return await withRateLimit(
    {
      key: createUserRateLimitKey(userId, "bulk-operation"),
      ...RateLimits.BULK_OPERATION,
    },
    async () => {
      return await processBulkItems(items);
    }
  );
}
```

## Performance Optimization

### Efficient Data Loading

```typescript
// ✅ Good - Load only necessary data
export async function getUserDashboard(
  userId: string
): Promise<ActionResult<DashboardData>> {
  return await withErrorHandling(async () => {
    // Load data in parallel
    const [user, recentActivity, notifications] = await Promise.all([
      getUserBasicInfo(userId),
      getRecentActivity(userId, { limit: 10 }),
      getUnreadNotifications(userId, { limit: 5 }),
    ]);

    return {
      user,
      recentActivity,
      notifications,
    };
  });
}

// ❌ Bad - Load unnecessary data
export async function getUserDashboard(
  userId: string
): Promise<ActionResult<DashboardData>> {
  return await withErrorHandling(async () => {
    const user = await getFullUserProfile(userId); // Too much data
    const allActivity = await getAllActivity(userId); // Too much data
    const allNotifications = await getAllNotifications(userId); // Too much data

    return { user, allActivity, allNotifications };
  });
}
```

### Caching Strategies

```typescript
// ✅ Good - Appropriate caching
const CACHE_TTL = {
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
  SETTINGS: 10 * 60 * 1000, // 10 minutes
  ANALYTICS: 60 * 60 * 1000, // 1 hour
  STATIC_DATA: 24 * 60 * 60 * 1000, // 24 hours
};

export async function getUserProfile(
  userId: string
): Promise<ActionResult<UserProfile>> {
  const cacheKey = `user-profile:${userId}`;

  // Try cache first
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return createActionResult(cached);
  }

  return await withErrorHandling(async () => {
    const profile = await loadUserProfile(userId);

    // Cache the result
    await setCache(cacheKey, profile, CACHE_TTL.USER_PROFILE);

    return profile;
  });
}

// ✅ Good - Cache invalidation
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData
): Promise<ActionResult<UserProfile>> {
  return await withErrorHandling(async () => {
    const updatedProfile = await updateProfileInDatabase(userId, data);

    // Invalidate related caches
    await invalidateCache(`user-profile:${userId}`);
    await invalidateCache(`user-settings:${userId}`);

    return updatedProfile;
  });
}
```

### Pagination Best Practices

```typescript
// ✅ Good - Efficient pagination
export async function getItems(params: {
  limit?: number;
  offset?: number;
  cursor?: string;
  filters?: ItemFilters;
}): Promise<ActionResult<PaginatedItems>> {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  // Validate pagination parameters
  const limit = Math.min(params.limit || 20, 100); // Max 100 items
  const offset = Math.max(params.offset || 0, 0);

  return await withErrorHandling(async () => {
    const items = await loadItems({
      ...params,
      limit: limit + 1, // Load one extra to check if there are more
      offset,
    });

    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;

    return {
      items: resultItems,
      pagination: {
        limit,
        offset,
        hasMore,
        total: hasMore ? undefined : offset + resultItems.length,
      },
    };
  });
}
```

## Testing Best Practices

### Comprehensive Test Coverage

```typescript
// ✅ Good - Comprehensive test suite
describe("createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("success cases", () => {
    it("should create user with valid data", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "SecurePass123!",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
      expect(result.data.password).toBeUndefined(); // Password should not be returned
    });
  });

  describe("validation errors", () => {
    it("should reject invalid email", async () => {
      const userData = {
        email: "invalid-email",
        name: "Test User",
        password: "SecurePass123!",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("validation");
      expect(result.error?.field).toBe("email");
    });

    it("should reject weak password", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "weak",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("validation");
      expect(result.error?.field).toBe("password");
      expect(result.error?.code).toBe("WEAK_PASSWORD");
    });
  });

  describe("business logic errors", () => {
    it("should reject duplicate email", async () => {
      mockFindUserByEmail.mockResolvedValue({ id: "existing-user" });

      const userData = {
        email: "existing@example.com",
        name: "Test User",
        password: "SecurePass123!",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("conflict");
      expect(result.error?.code).toBe("EMAIL_ALREADY_EXISTS");
    });
  });

  describe("error handling", () => {
    it("should handle database errors", async () => {
      mockCreateUserInDatabase.mockRejectedValue(new Error("Database error"));

      const userData = {
        email: "test@example.com",
        name: "Test User",
        password: "SecurePass123!",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("server");
    });
  });
});
```

### Mock Utilities

```typescript
// ✅ Good - Reusable mock utilities
export const mockActionResult = <T>(data: T): ActionResult<T> => ({
  success: true,
  data,
});

export const mockActionError = (
  type: ActionError["type"],
  message: string,
  code?: string,
  field?: string
): ActionResult<never> => ({
  success: false,
  error: { type, message, code, field },
});

export const mockAuthContext = (
  overrides?: Partial<ActionContext>
): ActionContext => ({
  userId: "test-user-id",
  companyId: "test-company-id",
  timestamp: Date.now(),
  requestId: "test-request-id",
  ...overrides,
});

// Usage in tests
it("should handle auth success", async () => {
  mockRequireAuth.mockResolvedValue(mockActionResult(mockAuthContext()));

  const result = await myProtectedAction();

  expect(result.success).toBe(true);
});
```

## Code Organization

### Module Structure

```typescript
// ✅ Good - Clear module organization
// lib/actions/users/
// ├── index.ts          # Main user operations
// ├── profile.ts        # Profile management
// ├── preferences.ts    # User preferences
// ├── validation.ts     # User-specific validation
// ├── types.ts          # Type definitions
// └── __tests__/        # Test files

// lib/actions/users/index.ts
export { getUserProfile, updateUserProfile } from "./profile";
export { getUserPreferences, updateUserPreferences } from "./preferences";
export { validateUserData, validateProfileData } from "./validation";
export * from "./types";
```

### Import Organization

```typescript
// ✅ Good - Organized imports
// 1. Node modules
import { z } from "zod";

// 2. Core utilities (grouped)
import {
  ActionResult,
  requireAuth,
  validateObject,
  Validators,
  ErrorFactory,
  withErrorHandling,
} from "@/lib/actions/core";

// 3. Related modules
import { getUserById, updateUserInDatabase } from "@/lib/data/users";
import { sendWelcomeEmail } from "@/lib/services/email";

// 4. Types
import type { User, UpdateUserData } from "./types";
```

## Common Anti-Patterns

### ❌ Avoid These Patterns

#### 1. Inconsistent Return Types

```typescript
// ❌ Bad - Inconsistent return types
export async function badAction1(): Promise<User | null> {
  // Sometimes returns null, sometimes throws
}

export async function badAction2(): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  // Different error format
}

// ✅ Good - Consistent ActionResult
export async function goodAction(): Promise<ActionResult<User>> {
  // Always returns ActionResult<T>
}
```

#### 2. Manual Error Handling

```typescript
// ❌ Bad - Manual error handling
export async function badAction(): Promise<ActionResult<Data>> {
  try {
    const data = await someOperation();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ✅ Good - Use error handling utilities
export async function goodAction(): Promise<ActionResult<Data>> {
  return await withErrorHandling(async () => {
    const data = await someOperation();
    return data;
  });
}
```

#### 3. No Input Validation

```typescript
// ❌ Bad - No validation
export async function badAction(data: any): Promise<ActionResult<any>> {
  // Directly use unvalidated data
  return await processData(data);
}

// ✅ Good - Proper validation
export async function goodAction(
  data: CreateUserData
): Promise<ActionResult<User>> {
  const validation = validateObject(data, {
    email: Validators.email,
    name: Validators.name,
  });

  if (!validation.isValid) {
    return validationToActionResult(validation);
  }

  return await processData(validation.data);
}
```

#### 4. Missing Authentication

```typescript
// ❌ Bad - No auth check for protected action
export async function badProtectedAction(): Promise<ActionResult<Data>> {
  // Assumes user is authenticated
  const userId = getCurrentUserId(); // Might be null
  return await loadUserData(userId);
}

// ✅ Good - Proper auth check
export async function goodProtectedAction(): Promise<ActionResult<Data>> {
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  const { userId } = authResult.data;
  return await loadUserData(userId);
}
```

## Migration Guidelines

### Gradual Migration Strategy

1. **Start with Core Utilities**: Migrate to use core error handling and validation first
2. **Update Return Types**: Change all actions to return `ActionResult<T>`
3. **Add Authentication**: Implement proper auth checking
4. **Standardize Validation**: Use validation utilities consistently
5. **Add Rate Limiting**: Implement appropriate rate limits
6. **Update Tests**: Migrate tests to use new patterns
7. **Update UI Components**: Update consuming code to handle new patterns

### Migration Checklist

For each action being migrated:

- [ ] Returns `ActionResult<T>` type
- [ ] Uses `requireAuth()` for authentication
- [ ] Implements proper input validation
- [ ] Uses `ErrorFactory` for error creation
- [ ] Includes appropriate rate limiting
- [ ] Has comprehensive test coverage
- [ ] Follows naming conventions
- [ ] Includes proper TypeScript types
- [ ] Uses performance monitoring
- [ ] Handles edge cases appropriately

### Backward Compatibility

During migration, maintain backward compatibility:

```typescript
// ✅ Good - Maintain backward compatibility
// legacy/userActions.ts
import {
  getUserProfile as newGetUserProfile,
  updateUserProfile as newUpdateUserProfile,
} from "../users";

// Legacy wrapper with deprecation warning
export async function getUserProfile(userId: string) {
  console.warn(
    "getUserProfile is deprecated. Use the new actions/users module."
  );

  const result = await newGetUserProfile();

  // Convert to legacy format if needed
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

Following these best practices ensures that your actions are consistent, maintainable, and provide a great developer experience while maintaining high code quality and performance.
