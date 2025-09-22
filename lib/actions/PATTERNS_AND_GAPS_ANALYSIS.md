# Actions Directory - Patterns and Gaps Analysis

## Convex Integration Patterns

### Pattern 1: Direct ConvexHttpClient Usage (Analytics Actions)

**Implementation Example:**

```typescript
// From billing.analytics.actions.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getCurrentUsageMetrics(
  companyId: string
): Promise<UsageMetrics> {
  try {
    const currentUsage = await convex.query(
      api.billingAnalytics.getCurrentUsageMetrics,
      {
        companyId,
      }
    );
    return currentUsage;
  } catch (error) {
    console.error("Error fetching usage metrics:", error);
    throw error;
  }
}
```

**Files Using This Pattern:**

- billing.analytics.actions.ts
- campaign.analytics.actions.ts
- optimized.analytics.actions.ts

**Strengths:**

- Direct Convex integration
- Type-safe API calls
- Proper async/await usage

**Gaps:**

- Inconsistent error handling
- No standardized error types
- Missing performance monitoring
- No caching strategy
- No rate limiting

### Pattern 2: Mock Data with Migration Comments

**Implementation Example:**

```typescript
// From billingActions.ts
export async function getBillingInfo(): Promise<ActionResult<BillingInfo>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view billing information",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // For now, return mock data
    const billingInfo: BillingInfo = {
      ...mockBillingInfo,
      userId,
    };

    return {
      success: true,
      data: billingInfo,
    };
  } catch (error) {
    // Error handling...
  }
}
```

**Files Using This Pattern:**

- billingActions.ts
- teamActions.ts
- notificationActions.ts
- domainsActions.ts
- campaignActions.ts
- inboxActions.ts

**Strengths:**

- Consistent ActionResult type
- Proper authentication checking
- Structured error handling

**Gaps:**

- No real data persistence
- Temporary solution only
- No data validation
- No caching considerations

### Pattern 3: Nile Integration

**Implementation Example:**

```typescript
// From settingsActions.ts
import { nile } from "@/app/api/[...nile]/nile";

export async function getUserSettings(): Promise<ActionResult<UserSettings>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view settings",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Get user from Nile
    const user = await nile.users.getUser(userId);

    // Merge real user data with mock settings
    const settings: UserSettings = {
      ...mockUserSettings,
      userId,
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    // Error handling...
  }
}
```

**Files Using This Pattern:**

- settingsActions.ts
- templateActions.ts

**Strengths:**

- Real user data integration
- Consistent error handling
- Proper authentication

**Gaps:**

- Mixed data sources (Nile + mock)
- No standardized Nile error handling
- Unclear migration path to Convex

## Error Handling Patterns Analysis

### Pattern 1: ActionResult Type (Recommended)

**Implementation:**

```typescript
export type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
      field?: string;
    };
```

**Usage Example:**

```typescript
export async function updateSettings(
  settings: Partial<Settings>
): Promise<ActionResult<Settings>> {
  try {
    // Validation
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: ERROR_CODES.VALIDATION_FAILED,
        field: "email",
      };
    }

    // Success case
    return {
      success: true,
      data: updatedSettings,
    };
  } catch (error) {
    return {
      success: false,
      error: "Internal server error",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}
```

**Files Using This Pattern:**

- settingsActions.ts
- billingActions.ts
- teamActions.ts

**Strengths:**

- Type-safe error handling
- Consistent response format
- Field-specific error reporting
- Structured error codes

**Gaps:**

- Not used consistently across all files
- Error codes not standardized
- No error categorization system

### Pattern 2: Direct Error Throwing (Problematic)

**Implementation:**

```typescript
// From analytics actions
export async function getAnalytics(filters: AnalyticsFilters) {
  try {
    const data = await convex.query(api.analytics.getData, filters);
    return data;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error; // Problematic - inconsistent with other patterns
  }
}
```

**Files Using This Pattern:**

- Most analytics actions
- Some utility functions

**Issues:**

- Inconsistent with ActionResult pattern
- Harder to handle in UI components
- No standardized error format
- Poor error categorization

### Pattern 3: Mixed Error Formats (Inconsistent)

**Examples Found:**

```typescript
// Format 1: String error
{ success: false, error: "Error message" }

// Format 2: Error object
{ success: false, error: { type: "validation", message: "Invalid input" } }

// Format 3: Thrown exceptions
throw new Error("Something went wrong");
```

**Issues:**

- Inconsistent error handling in UI
- Different error parsing logic needed
- Poor developer experience

## Authentication Patterns Analysis

### Pattern 1: getCurrentUserId() (Recommended)

**Implementation:**

```typescript
import { getCurrentUserId } from "@/lib/uti

export async function protectedAction(): Promise<ActionResult<Data>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Action logic...
  } catch (error) {
    // Error handling...
  }
}
```

**Files Using This Pattern:**

- settingsActions.ts
- templateActions.ts
- notificationActions.ts

**Strengths:**

- Consistent auth checking
- Proper error handling for auth failures
- Clear separation of concerns

### Pattern 2: requireUserId() (Alternative)

**Implementation:**

```typescript
import { requireUserId } from "../utils/auth";

export async function protectedAction(): Promise<ActionResult<Data>> {
  try {
    const userId = await requireUserId(); // Throws if not authenticated

    // Action logic...
  } catch (error) {
    // Handle auth errors and others
  }
}
```

**Files Using This Pattern:**

- billingActions.ts
- teamActions.ts

**Strengths:**

- Simpler code flow
- Automatic auth error handling

**Gaps:**

- Less explicit error handling
- Harder to customize auth error messages

### Pattern 3: Rate Limiting Integration

**Implementation:**

```typescript
import { checkRateLimit } from "../utils/auth";

export async function rateLimitedAction(): Promise<ActionResult<Data>> {
  try {
    const userId = await getCurrentUserId();

    // Check rate limit
    const rateLimitOk = await checkRateLimit(`action:${userId}`, 10, 60000);
    if (!rateLimitOk) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }

    // Action logic...
  } catch (error) {
    // Error handling...
  }
}
```

**Files Using This Pattern:**

- billingActions.ts
- teamActions.ts
- notificationActions.ts

**Gaps:**

- Not applied consistently
- No standardized rate limit keys
- Missing company-level rate limiting

## Data Validation Patterns

### Pattern 1: Inline Validation (Current)

**Implementation:**

```typescript
export async function updateEmail(email: string): Promise<ActionResult<User>> {
  try {
    // Inline validation
    if (!email || !email.includes("@")) {
      return {
        success: false,
        error: "Invalid email address",
        code: ERROR_CODES.VALIDATION_FAILED,
        field: "email",
      };
    }

    // Action logic...
  } catch (error) {
    // Error handling...
  }
}
```

**Issues:**

- Validation logic scattered across files
- No reusable validation functions
- Inconsistent validation messages
- No schema-based validation

### Pattern 2: Utility-Based Validation (Needed)

**Recommended Implementation:**

```typescript
import { validateEmail, validateRequired } from "../utils/validation";

export async function updateEmail(email: string): Promise<ActionResult<User>> {
  try {
    const validation = validateRequired(email, "email") || validateEmail(email);
    if (validation.error) {
      return {
        success: false,
        error: validation.error,
        code: ERROR_CODES.VALIDATION_FAILED,
        field: validation.field,
      };
    }

    // Action logic...
  } catch (error) {
    // Error handling...
  }
}
```

**Benefits:**

- Reusable validation logic
- Consistent error messages
- Centralized validation rules
- Better maintainability

## Import Patterns Analysis

### Pattern 1: Relative Imports (Inconsistent)

**Examples:**

```typescript
import { getCurrentUserId } from "../utils/auth";
import { mockData } from "../data/mock";
```

**Files Using This Pattern:**

- billingActions.ts
- teamActions.ts
- notificationActions.ts

### Pattern 2: Absolute Imports (Preferred)

**Examples:**

```typescript
import { getCurrentUserId } from "@/lib/utils/auth";
import { api } from "@/convex/_generated/api";
```

**Files Using This Pattern:**

- All analytics actions
- settingsActions.ts
- templateActions.ts

**Recommendation:** Standardize on absolute imports for consistency

## Testing Patterns Analysis

### Current Testing Pattern (Limited)

**From teamActions.test.ts:**

```typescript
// Mock the auth utilities
jest.mock("../../utils/auth", () => ({
  getCurrentUserId: jest.fn().mockResolvedValue("test-user-1"),
  requireUserId: jest.fn().mockResolvedValue("test-user-1"),
  checkRateLimit: jest.fn().mockResolvedValue(true),
}));

describe("Team Actions", () => {
  it("should return team members successfully", async () => {
    const result = await getTeamMembers();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.members).toBeDefined();
      expect(Array.isArray(result.data.members)).toBe(true);
    }
  });
});
```

**Strengths:**

- Proper mocking of dependencies
- Type-safe test assertions
- Good test structure

**Gaps:**

- Only 1 test file for 24 action files
- No integration tests for Convex operations
- No mock factories for consistent test data
- No error scenario testing

## Shared Utilities Analysis

### Currently Used Utilities

#### Auth Utilities

```typescript
// Used in 8 files with inconsistent imports
import { getCurrentUserId, requireUserId, checkRateLimit } from "utils/auth";
```

#### Analytics Utilities

```typescript
// Used in 5 analytics files
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { ConvexMigrationUtils } from "@/lib/utils/convex-migration";
```

#### Data Transformation

```typescript
// Used in specific domains
import { calculateUsagePercentages } from "../utils/billingUtils";
import { mapServiceMailboxToLegacy } from "@/lib/utils/analytics-mappers";
```

### Missing Shared Utilities

#### 1. Validation Utilities (Critical Gap)

```typescript
// Needed: lib/actions/core/validation.ts
export function validateEmail(email: string): ValidationResult;
export function validateRequired(value: any, field: string): ValidationResult;
export function validateSchema<T>(
  data: unknown,
  schema: Schema<T>
): ValidationResult<T>;
```

#### 2. Error Handling Utilities (Critical Gap)

```typescript
// Needed: lib/actions/core/errors.ts
export class ActionError extends Error;
export function createActionResult<T>(data: T): ActionResult<T>;
export function createActionError(type: string, message: string): ActionResult<never>;
```

#### 3. Convex Integration Utilities (High Priority Gap)

```typescript
// Needed: lib/actions/core/convex.ts
export class ConvexQueryHelper;
export function withConvexErrorHandling<T>(operation: () => Promise<T>): Promise<ActionResult<T>>;
```

#### 4. Caching Utilities (Medium Priority Gap)

```typescript
// Needed: lib/actions/core/cache.ts
export function withCache<T>(
  key: string,
  operation: () => Promise<T>,
  ttl?: number
): Promise<T>;
export function invalidateCache(pattern: string): void;
```

## Performance Patterns Analysis

### Current Performance Considerations

#### 1. Caching (Limited Implementation)

```typescript
// From optimized.analytics.actions.ts
import { analyticsCache } from "@/lib/services/analytics";

// Basic caching implementation exists but not standardized
```

#### 2. Batch Operations (Inconsistent)

```typescript
// Some analytics actions support batch operations
const batchResult = await convex.mutation(api.analytics.bulkUpdate, {
  updates,
});
```

### Performance Gaps

#### 1. No Standardized Caching Strategy

- Each file implements caching differently
- No cache invalidation strategy
- No performance monitoring

#### 2. Missing Request Optimization

- No request deduplication
- No batch request handling
- No connection pooling considerations

#### 3. No Performance Monitoring

- No timing metrics
- No error rate tracking
- No performance regression detection

## Security Patterns Analysis

### Current Security Measures

#### 1. Authentication Checking

```typescript
const userId = await getCurrentUserId();
if (!userId) {
  return { success: false, error: "Authentication required" };
}
```

#### 2. Rate Limiting (Partial)

```typescript
const rateLimitOk = await checkRateLimit(`action:${userId}`, 10, 60000);
```

### Security Gaps

#### 1. Missing Authorization Patterns

- No role-based access control
- No resource-level permissions
- No company/tenant isolation

#### 2. Input Sanitization

- No standardized input sanitization
- No XSS protection patterns
- No SQL injection prevention (for non-Convex operations)

#### 3. Audit Logging

- No action audit trails
- No security event logging
- No suspicious activity detection

## Migration Strategy Recommendations

### Phase 1: Foundation (Week 1)

1. **Create Core Utilities**
   - Standardized error handling
   - Common validation functions
   - Consistent auth patterns

2. **Fix TypeScript Errors**
   - Resolve missing imports
   - Add proper type definitions
   - Configure compilation settings

### Phase 2: Large File Refactoring (Weeks 2-3)

1. **Split Critical Files**
   - billingActions.ts → billing module
   - teamActions.ts → team module
   - settingsActions.ts → settings module
   - notificationActions.ts → notifications module

### Phase 3: Pattern Standardization (Week 4)

1. **Standardize Convex Integration**
   - Create ConvexQueryHelper utility
   - Implement consistent error handling
   - Add performance monitoring

2. **Implement Consistent Error Handling**
   - Migrate all actions to ActionResult pattern
   - Standardize error codes
   - Add field-specific validation

### Phase 4: Testing and Quality (Weeks 5-6)

1. **Add Comprehensive Testing**
   - Unit tests for all action modules
   - Integration tests for Convex operations
   - Mock factories for test data

2. **Performance Optimization**
   - Implement caching strategies
   - Add performance monitoring
   - Optimize bundle size

### Phase 5: Legacy Migration (Week 7)

1. **Complete Data Migration**
   - Migrate remaining mock data to Convex
   - Deprecate legacy patterns
   - Update import paths

---

_Analysis completed: Comprehensive review of 24 action files_
_Key findings: 50+ TypeScript errors, 4 critical large files, inconsistent patterns across domains_
