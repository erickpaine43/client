# Core Action Utilities

This directory contains the foundational utilities and types used across all server action modules in the application. These utilities provide consistent patterns for error handling, validation, authentication, and more.

## Overview

The core utilities are designed to:

- **Standardize error handling** across all actions
- **Provide consistent validation** patterns and utilities
- **Simplify authentication and authorization** checking
- **Ensure type safety** with comprehensive TypeScript types
- **Enable consistent rate limiting** and caching patterns

## Modules

### `types.ts`

Defines the core TypeScript interfaces and types used throughout the action system:

- `ActionResult<T>` - Standardized response type for all actions
- `ActionError` - Comprehensive error information interface
- `ActionContext` - Request context with user and metadata
- `ValidationResult<T>` - Validation response type
- And more utility types for pagination, filtering, etc.

### `errors.ts`

Provides standardized error handling utilities:

```typescript
import {
  ErrorFactory,
  createActionResult,
  handleUnknownError,
} from "@/lib/actions/core";

// Create success result
const success = createActionResult({ id: "1", name: "John" });

// Create specific error types
const authError = ErrorFactory.authRequired();
const validationError = ErrorFactory.validation("Invalid email", "email");
const rateLimitError = ErrorFactory.rateLimit();

// Handle unknown errors consistently
const result = await withErrorHandling(async () => {
  // Your operation here
  return await someAsyncOperation();
});

// Handle Convex operations with enhanced error handling
const convexResult = await withConvexErrorHandling(
  async () => {
    return await convex.query(api.users.get, { userId });
  },
  {
    actionName: "getUser",
    userId: "user123",
  }
);
```

### `auth.ts`

Authentication and authorization utilities:

```typescript
import {
  requireAuth,
  requireUserId,
  withRateLimit,
  RateLimits,
} from "@/lib/actions/core";

// Require authentication
const authResult = await requireAuth();
if (!authResult.success) {
  return authResult; // Return auth error
}
const context = authResult.data;

// Simple user ID requirement
const userIdResult = await requireUserId();
if (!userIdResult.success) {
  return userIdResult;
}

// Apply rate limiting
const result = await withRateLimit(
  {
    key: createUserRateLimitKey(userId, "update-settings"),
    ...RateLimits.USER_SETTINGS_UPDATE,
  },
  async () => {
    // Your rate-limited operation
    return await updateUserSettings(settings);
  }
);
```

### `validation.ts`

Comprehensive validation utilities:

```typescript
import {
  validateEmail,
  validateRequired,
  validateObject,
  Validators,
  validationToActionResult,
} from "@/lib/actions/core";

// Individual field validation
const emailValidation = validateEmail("user@example.com");
if (!emailValidation.isValid) {
  return validationToActionResult(emailValidation);
}

// Object validation with multiple fields
const validation = validateObject(userData, {
  name: Validators.name,
  email: Validators.email,
  phone: Validators.phone,
});

if (!validation.isValid) {
  return validationToActionResult(validation);
}

// Use validated data
const validatedData = validation.data;
```

### `constants.ts`

Standardized constants and error codes:

```typescript
import { ERROR_CODES, PAGINATION, VALIDATION_LIMITS } from "@/lib/actions/core";

// Use standardized error codes
if (!user) {
  return createActionError("auth", "User not found", ERROR_CODES.AUTH_REQUIRED);
}

// Use standard pagination limits
const limit = Math.min(requestedLimit, PAGINATION.MAX_LIMIT);

// Use validation limits
if (name.length > VALIDATION_LIMITS.NAME_MAX_LENGTH) {
  return ErrorFactory.validation("Name too long", "name");
}
```

## Usage Patterns

### Basic Action Structure

```typescript
import {
  ActionResult,
  requireAuth,
  validateObject,
  Validators,
  ErrorFactory,
  withErrorHandling,
} from "@/lib/actions/core";

export async function updateUserProfile(data: {
  name: string;
  email: string;
}): Promise<ActionResult<UserProfile>> {
  // 1. Authentication
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }
  const { userId } = authResult.data;

  // 2. Validation
  const validation = validateObject(data, {
    name: Validators.name,
    email: Validators.email,
  });

  if (!validation.isValid) {
    return validationToActionResult(validation);
  }

  // 3. Business logic with error handling
  return await withErrorHandling(async () => {
    const updatedProfile = await updateProfile(userId, validation.data);
    return updatedProfile;
  });
}
```

### Rate Limited Action

```typescript
import {
  withRateLimit,
  createUserRateLimitKey,
  RateLimits,
} from "@/lib/actions/core";

export async function sendInvitation(
  email: string
): Promise<ActionResult<Invitation>> {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult;

  const { userId } = authResult.data;

  return await withRateLimit(
    {
      key: createUserRateLimitKey(userId, "send-invitation"),
      ...RateLimits.TEAM_INVITE,
    },
    async () => {
      // Your invitation logic here
      return await createInvitation(email, userId);
    }
  );
}
```

### Complex Validation

```typescript
import {
  validateObject,
  validateArray,
  validateEnum,
  TEAM_ROLES,
} from "@/lib/actions/core";

export async function bulkUpdateTeamMembers(
  updates: Array<{ id: string; role: string }>
): Promise<ActionResult<TeamMember[]>> {
  // Validate array structure
  const arrayValidation = validateArray(updates, "updates", 1, 50);
  if (!arrayValidation.isValid) {
    return validationToActionResult(arrayValidation);
  }

  // Validate each update object
  const validationResults = updates.map((update, index) =>
    validateObject(update, {
      id: (value) => validateRequired(value, `updates[${index}].id`),
      role: (value) =>
        validateEnum(
          value,
          `updates[${index}].role`,
          Object.values(TEAM_ROLES)
        ),
    })
  );

  const errors = validationResults
    .filter((result) => !result.isValid)
    .flatMap((result) => result.errors || []);

  if (errors.length > 0) {
    return ErrorFactory.validation(
      "Validation failed",
      undefined,
      "BULK_VALIDATION_FAILED"
    );
  }

  // Process validated updates
  const validatedUpdates = validationResults.map((result) => result.data!);

  return await withErrorHandling(async () => {
    return await processBulkUpdates(validatedUpdates);
  });
}
```

## Error Handling Best Practices

1. **Always use ActionResult type** for consistent error handling
2. **Use ErrorFactory methods** for common error scenarios
3. **Include field information** in validation errors
4. **Log errors appropriately** using logActionError
5. **Handle unknown errors** with handleUnknownError

## Validation Best Practices

1. **Validate early** - check inputs before processing
2. **Use specific validators** - prefer Validators.email over generic validation
3. **Provide clear error messages** - help users understand what went wrong
4. **Sanitize inputs** - use sanitizeHtml and sanitizeString when needed
5. **Validate business rules** - not just format validation

## Authentication Best Practices

1. **Always check authentication** for protected actions
2. **Use rate limiting** for sensitive operations
3. **Check permissions** when accessing resources
4. **Log security events** for audit trails
5. **Handle auth errors gracefully** with clear messages

## Testing

The core utilities include comprehensive tests. Run them with:

```bash
npm test lib/actions/core/__tests__/core.test.ts
```

## Migration from Legacy Patterns

When migrating existing actions to use these core utilities:

1. **Replace custom ActionResult types** with the standardized one
2. **Update error handling** to use ErrorFactory methods
3. **Standardize validation** using the validation utilities
4. **Add rate limiting** where appropriate
5. **Update imports** to use the core utilities

Example migration:

```typescript
// Before
export async function oldAction(data: any): Promise<any> {
  try {
    if (!data.email) {
      return { success: false, error: "Email required" };
    }
    // ... rest of logic
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// After
export async function newAction(data: {
  email: string;
}): Promise<ActionResult<Result>> {
  const validation = validateObject(data, {
    email: Validators.email,
  });

  if (!validation.isValid) {
    return validationToActionResult(validation);
  }

  return await withErrorHandling(async () => {
    // ... rest of logic
    return result;
  });
}
```

This migration provides better type safety, consistent error handling, and improved maintainability.

### `monitoring.ts`

Provides comprehensive monitoring and performance tracking utilities:

```typescript
import {
  recordError,
  recordPerformance,
  recordConvexPerformance,
  withPerformanceMonitoring,
  getMetrics,
} from "@/lib/actions/core";

// Record error metrics
recordError(error, "actionName", { userId, companyId });

// Record performance metrics
recordPerformance("actionName", duration, success, { userId });

// Record Convex-specific metrics
recordConvexPerformance("queryName", executionTime, success, args, context);

// Monitor function performance automatically
const monitoredFunction = withPerformanceMonitoring(
  "functionName",
  async (param1, param2) => {
    // Your function logic
    return result;
  }
);

// Get comprehensive metrics for debugging
const metrics = getMetrics();
console.log("Error summary:", metrics.summary);
console.log("Slow actions:", getSlowActions(5000));
console.log("High error rates:", hasHighErrorRates());
```

## ConvexQueryError Integration

The error handling system provides seamless integration with ConvexQueryError:

### Automatic ConvexQueryError Handling

```typescript
import { withConvexErrorHandling } from "@/lib/actions/core";

export async function getAnalyticsData(
  filters: AnalyticsFilters
): Promise<ActionResult<AnalyticsData>> {
  return withConvexErrorHandling(
    async () => {
      // ConvexQueryHelper will throw ConvexQueryError on failure
      const data = await convexHelper.query("analytics.getData", filters);
      return data;
    },
    {
      actionName: "getAnalyticsData",
      userId: "user123",
      companyId: "company456",
    }
  );
}
```

### Enhanced ConvexQueryError Logging

ConvexQueryError instances are automatically logged with enhanced context:

```typescript
// Automatic logging includes:
{
  error: {
    type: 'convex_query_error',
    queryName: 'analytics.getData',
    executionTime: 5000,
    retryable: true,
    args: { filters },
    context: 'analytics-service'
  },
  performance: {
    slow: true,      // executionTime > 3000ms
    timeout: false   // message includes 'timeout'
  },
  actionContext: {
    actionName: 'getAnalyticsData',
    userId: 'user123',
    companyId: 'company456'
  }
}
```

### Performance Monitoring for Convex Operations

```typescript
import { recordConvexPerformance } from "@/lib/actions/core";

// Manual performance recording
const startTime = Date.now();
try {
  const result = await convex.query("users.get", { userId });

  recordConvexPerformance(
    "users.get",
    Date.now() - startTime,
    true,
    { userId },
    "user-service",
    { cacheHit: false }
  );

  return result;
} catch (error) {
  recordConvexPerformance(
    "users.get",
    Date.now() - startTime,
    false,
    { userId },
    "user-service"
  );
  throw error;
}
```

### Error Rate Monitoring

The monitoring system automatically tracks error rates and can detect problematic patterns:

```typescript
// Check for high error rates
if (hasHighErrorRates()) {
  const highErrorActions = getMetrics().highErrorRates;
  console.warn("Actions with high error rates:", highErrorActions);
}

// Get slow Convex queries
const slowQueries = getSlowConvexQueries(3000); // > 3 seconds
console.log("Slow Convex queries:", slowQueries);
```

## Migration from Legacy Patterns

### Before (Legacy Pattern)

```typescript
export async function legacyAction(): Promise<ActionResult<Data>> {
  try {
    const data = await convex.query(api.getData, {});
    return { success: true, data };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: "Something went wrong",
    };
  }
}
```

### After (Enhanced Pattern)

```typescript
import { withConvexErrorHandling } from "@/lib/actions/core";

export async function enhancedAction(): Promise<ActionResult<Data>> {
  return withConvexErrorHandling(
    async () => {
      const data = await convex.query(api.getData, {});
      return data;
    },
    {
      actionName: "enhancedAction",
      userId: await getCurrentUserId(),
    }
  );
}
```

### Benefits of Enhanced Pattern

1. **Automatic ConvexQueryError handling** with proper categorization
2. **Enhanced logging** with performance indicators
3. **Consistent error response format** across all actions
4. **Performance monitoring** with automatic metrics collection
5. **Error rate tracking** for operational insights
6. **Retry logic support** through error metadata
7. **User-friendly error messages** through error transformation

## Best Practices

### 1. Always Use Enhanced Error Handling

```typescript
// ✅ Good - Enhanced error handling
return withConvexErrorHandling(
  async () => {
    return await convexOperation();
  },
  { actionName: "myAction" }
);

// ❌ Bad - Manual error handling
try {
  return await convexOperation();
} catch (error) {
  return { success: false, error: "Failed" };
}
```

### 2. Provide Action Context

```typescript
// ✅ Good - Rich context for debugging
return withConvexErrorHandling(async () => convexOperation(), {
  actionName: "updateUserProfile",
  userId: "user123",
  companyId: "company456",
});

// ❌ Bad - No context
return withConvexErrorHandling(async () => convexOperation());
```

### 3. Monitor Performance-Critical Operations

```typescript
// ✅ Good - Performance monitoring
const monitoredFunction = withPerformanceMonitoring(
  "criticalOperation",
  async (params) => {
    return await heavyConvexOperation(params);
  }
);

// ✅ Good - Manual performance recording
recordConvexPerformance(
  "heavy.query",
  executionTime,
  success,
  args,
  "critical-path"
);
```

### 4. Handle Retryable Errors

```typescript
// ✅ Good - Retry logic for transient failures
let retryCount = 0;
while (retryCount < 3) {
  const result = await withConvexErrorHandling(operation);

  if (result.success || !result.error?.details?.retryable) {
    return result;
  }

  retryCount++;
  await delay(Math.pow(2, retryCount) * 1000);
}
```

## Examples

### Authentication and Authorization Examples

Here are comprehensive examples showing how to use the authentication and authorization utilities:

#### Simple Authenticated Action
```typescript
import {
  requireAuth,
  ErrorFactory,
  createActionResult,
} from "@/lib/actions/core";

export async function simpleAuthenticatedAction(
  data: { name: string }
): Promise<ActionResult<{ id: string; name: string }>> {
  // Authentication check
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }

  // Action logic
  return createActionResult({
    id: 'generated-id',
    name: data.name,
  });
}
```

#### Company Context Action
```typescript
import {
  requireAuthWithCompany,
  createActionResult,
} from "@/lib/actions/core";

export async function companyContextAction(
  data: { companyName: string }
): Promise<ActionResult<{ companyId: string; name: string }>> {
  // Both user and company context required
  const authResult = await requireAuthWithCompany();
  if (!authResult.success) {
    return authResult;
  }

  const context = authResult.data;
  return createActionResult({
    companyId: context.companyId,
    name: data.companyName,
  });
}
```

#### Permission-Based Action
```typescript
import {
  withPermission,
  Permission,
  createActionResult,
} from "@/lib/actions/core";

export async function permissionRequiredAction(
  campaignId: string
): Promise<ActionResult<{ campaignId: string; status: string }>> {
  return await withPermission(
    Permission.UPDATE_CAMPAIGN,
    async (context) => {
      return createActionResult({
        campaignId,
        status: 'updated',
      });
    }
  );
}
```

#### Rate Limiting Examples
```typescript
import {
  withContextualRateLimit,
  createUserRateLimitKey,
  RateLimits,
  getRateLimitConfig,
} from "@/lib/actions/core";

// User-based rate limiting
const userLimitedAction = async (userId: string) => {
  return await withContextualRateLimit(
    'user_action',
    'user',
    { limit: 10, windowMs: 60000 },
    async () => createActionResult({ message: 'User action completed' })
  );
};

// Company-based rate limiting
const companyLimitedAction = async () => {
  return await withContextualRateLimit(
    'company_action',
    'company',
    { limit: 100, windowMs: 3600000 },
    async () => createActionResult({ message: 'Company action completed' })
  );
};

// Available rate limit configurations
const rateLimitExamples = {
  login: getRateLimitConfig('AUTH_LOGIN'), // 5 per 5 minutes
  signup: getRateLimitConfig('AUTH_SIGNUP'), // 3 per hour
  analyticsQuery: getRateLimitConfig('ANALYTICS_QUERY'), // 200 per minute
  generalWrite: getRateLimitConfig('GENERAL_WRITE'), // 100 per minute
};
```

### Core Utilities Usage Examples

#### Complete Action with Validation and Error Handling
```typescript
import {
  ActionResult,
  requireAuth,
  Validators,
  ErrorFactory,
  withErrorHandling,
  withRateLimit,
  createUserRateLimitKey,
  RateLimits,
} from "@/lib/actions/core";

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

export async function updateUserProfile(
  data: UpdateProfileData
): Promise<ActionResult<UserProfile>> {
  // 1. Authentication
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult;
  }
  const userId = authResult.data!.userId!;

  // 2. Input validation
  const nameValidation = Validators.name(data.name, 'name');
  if (!nameValidation.isValid) {
    return ErrorFactory.validation(
      nameValidation.errors?.[0]?.message || 'Invalid name',
      'name'
    );
  }

  const emailValidation = Validators.email(data.email, 'email');
  if (!emailValidation.isValid) {
    return ErrorFactory.validation(
      emailValidation.errors?.[0]?.message || 'Invalid email',
      'email'
    );
  }

  let phoneValidationData: string | undefined = undefined;
  if (data.phone) {
    const phoneValidation = Validators.phone(data.phone, 'phone');
    if (!phoneValidation.isValid) {
      return ErrorFactory.validation(
        phoneValidation.errors?.[0]?.message || 'Invalid phone',
        'phone'
      );
    }
    phoneValidationData = phoneValidation.data;
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
          name: nameValidation.data!,
          email: emailValidation.data!,
          phone: phoneValidationData,
        };

        // In real implementation, you would update the database
        return updatedProfile;
      });
    }
  );
}
```

#### Simple Validation Action
```typescript
import { Validators, ErrorFactory } from "@/lib/actions/core";

export async function validateEmailAddress(
  email: string
): Promise<ActionResult<{ valid: boolean; normalized: string }>> {
  const validation = Validators.email(email, 'email');

  if (!validation.isValid) {
    return ErrorFactory.validation(
      validation.errors?.[0]?.message || 'Invalid email',
      'email'
    );
  }

  return {
    success: true,
    data: {
      valid: true,
      normalized: validation.data!,
    },
  };
}
```

#### Error Handling Scenarios
```typescript
import { ErrorFactory } from "@/lib/actions/core";

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
```

## Examples

See `convex-integration-examples.ts` for comprehensive examples of:

- Basic Convex operations with error handling
- Performance monitoring integration
- Batch operations with individual error handling
- Retry logic for transient failures
- Caching integration patterns
- User-friendly error message transformation
- Integration with existing ConvexQueryHelper
