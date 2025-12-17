# Billing Module Testing Guide

## Overview

This document provides comprehensive testing strategies and procedures for the billing module. The testing approach covers unit tests, integration tests, end-to-end testing, and production validation.

## Testing Strategy

### Testing Pyramid

1. **Unit Tests (70%)** - Individual function testing with mocks
2. **Integration Tests (20%)** - Component interaction testing
3. **End-to-End Tests (10%)** - Complete user flow testing

### Test Categories

- **Functional Testing** - Core billing operations
- **Security Testing** - Authentication, authorization, and a protection
- **Performance Testing** - Response times and scalability
- **Error Handling Testing** - Edge cases and failure scenarios
- **Payment Processing Testing** - Stripe integration and payment flows

## Unit Testing

### Test Setup

```typescript
// __tests__/billing.test.ts
import { jest } from "@jest/globals";
import {
  getBillingInfo,
  updateBillingInfo,
  updateSubscriptionPlan,
  addPaymentMethod,
} from "../billing/index";

// Mock dependencies
jest.mock("../core/auth");
jest.mock("../core/errors");
jest.mock("../../utils/rate-limit");
jest.mock("../../services/stripe");

const mockRequireAuthUser = jest.mocked(requireAuthUser);
const mockGetCurrentUserId = jest.mockrrentUserId);
const mockRateLimiter = jest.mocked(rateLimiter);
```

### Core Function Tests

#### getBillingInfo() Tests

```typescript
describe("getBillingInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return billing info for authenticated user", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockRateLimiter.checkLimit.mockResolvedValue(true);

    const mockBillingInfo = {
      userId: "user123",
      currentPlan: { id: "pro", name: "Pro Plan" },
      billingAddress: { country: "US" },
    };
    mockFetchBillingInfo.mockResolvedValue(mockBillingInfo);

    // Act
    const result = await getBillingInfo();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockBillingInfo);
    expect(mockRequireAuthUser).toHaveBeenCalledTimes(1);
    expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
      "billing_info_user123",
      10,
      60000
    );
  });

  it("should handle authentication failure", async () => {
    // Arrange
    mockRequireAuthUser.mockRejectedValue(new Error("Not authenticated"));

    // Act
    const result = await getBillingInfo();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("internal");
    expect(result.error?.message).toBe(
      "Failed to retrieve billing information"
    );
  });

  it("should handle rate limiting", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockRateLimiter.checkLimit.mockResolvedValue(false);
    mockRateLimiter.getRemainingTime.mockReturnValue(30000);

    // Act
    const result = await getBillingInfo();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("rate_limit");
    expect(result.error?.message).toBe("Too many billing requests");
  });

  it("should handle missing user ID", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue(null);

    // Act
    const result = await getBillingInfo();

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("auth");
  });
});
```

#### updateBillingInfo() Tests

```typescript
describe("updateBillingInfo", () => {
  const validBillingData = {
    email: "user@example.com",
    billingAddress: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      postalCode: "12345",
      country: "US",
    },
  };

  it("should update billing info with valid data", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockRateLimiter.checkLimit.mockResolvedValue(true);
    mockValidateBillingData.mockReturnValue({ valid: true, errors: [] });

    const updatedBillingInfo = { ...validBillingData, userId: "user123" };
    mockUpdateBillingData.mockResolvedValue(updatedBillingInfo);

    // Act
    const result = await updateBillingInfo(validBillingData);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual(updatedBillingInfo);
    expect(mockValidateBillingData).toHaveBeenCalledWith(validBillingData);
    expect(mockUpdateBillingData).toHaveBeenCalledWith(
      "user123",
      validBillingData
    );
  });

  it("should handle validation errors", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockValidateBillingData.mockReturnValue({
      valid: false,
      errors: ["Invalid email address"],
    });

    const invalidData = { email: "invalid-email" };

    // Act
    const result = await updateBillingInfo(invalidData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("validation");
    expect(result.error?.message).toBe("Invalid billing data");
  });

  it("should handle rate limiting for updates", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockRateLimiter.checkLimit.mockResolvedValue(false);

    // Act
    const result = await updateBillingInfo(validBillingData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("rate_limit");
    expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
      "billing_update_user123",
      5,
      300000
    );
  });
});
```

#### Payment Method Tests

```typescript
describe("addPaymentMethod", () => {
  const validPaymentData = {
    type: "card" as const,
    cardNumber: "4242424242424242",
    expiryMonth: 12,
    expiryYear: 2025,
    cvc: "123",
  };

  it("should add valid payment method", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockRateLimiter.checkLimit.mockResolvedValue(true);
    mockValidatePaymentMethod.mockReturnValue({ valid: true, errors: [] });

    const stripePaymentMethod = { id: "pm_123", last4: "4242" };
    mockCreateStripePaymentMethod.mockResolvedValue(stripePaymentMethod);

    const storedMethod = { ...stripePaymentMethod, userId: "user123" };
    mockStorePaymentMethod.mockResolvedValue(storedMethod);

    // Act
    const result = await addPaymentMethod(validPaymentData);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual(storedMethod);
    expect(mockCreateStripePaymentMethod).toHaveBeenCalledWith(
      validPaymentData
    );
    expect(mockStorePaymentMethod).toHaveBeenCalledWith(
      "user123",
      stripePaymentMethod
    );
  });

  it("should handle Stripe card errors", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockRateLimiter.checkLimit.mockResolvedValue(true);
    mockValidatePaymentMethod.mockReturnValue({ valid: true, errors: [] });

    const stripeError = new Error("Your card was declined");
    stripeError.type = "StripeCardError";
    mockCreateStripePaymentMethod.mockRejectedValue(stripeError);

    // Act
    const result = await addPaymentMethod(validPaymentData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("validation");
    expect(result.error?.message).toBe("Invalid payment method");
  });
});
```

### Subscription Management Tests

```typescript
describe("updateSubscriptionPlan", () => {
  it("should update subscription plan successfully", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");

    const targetPlan = { id: "pro", name: "Pro Plan", price: 29.99 };
    mockGetSubscriptionPlan.mockResolvedValue(targetPlan);

    const currentSubscription = { id: "sub_123", planId: "basic" };
    mockGetCurrentSubscription.mockResolvedValue(currentSubscription);

    const proratedAmount = 15.0;
    mockCalculateProration.mockReturnValue(proratedAmount);

    const updatedSubscription = { ...currentSubscription, planId: "pro" };
    mockProcessSubscriptionChange.mockResolvedValue(updatedSubscription);

    // Act
    const result = await updateSubscriptionPlan("pro");

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual(updatedSubscription);
    expect(mockCalculateProration).toHaveBeenCalledWith(
      currentSubscription,
      targetPlan
    );
    expect(mockProcessSubscriptionChange).toHaveBeenCalledWith(
      "user123",
      "pro",
      proratedAmount
    );
  });

  it("should handle invalid plan ID", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockGetSubscriptionPlan.mockResolvedValue(null);

    // Act
    const result = await updateSubscriptionPlan("invalid-plan");

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("not_found");
    expect(result.error?.message).toBe("Subscription plan not found");
  });

  it("should handle missing current subscription", async () => {
    // Arrange
    mockRequireAuthUser.mockResolvedValue(undefined);
    mockGetCurrentUserId.mockResolvedValue("user123");
    mockGetSubscriptionPlan.mockResolvedValue({ id: "pro" });
    mockGetCurrentSubscription.mockResolvedValue(null);

    // Act
    const result = await updateSubscriptionPlan("pro");

    // Assert
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("bad_request");
    expect(result.error?.message).toBe("No active subscription found");
  });
});
```

## Integration Testing

### Database Integration Tests

```typescript
describe("Billing Database Integration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await clearBillingData();
  });

  it("should persist billing info updates", async () => {
    // Create test user
    const userId = await createTestUser();

    // Update billing info
    const billingData = {
      email: "test@example.com",
      billingAddress: { country: "US", postalCode: "12345" },
    };

    const result = await updateBillingInfo(billingData);
    expect(result.success).toBe(true);

    // Verify persistence
    const retrievedInfo = await getBillingInfo();
    expect(retrievedInfo.data?.email).toBe("test@example.com");
    expect(retrievedInfo.data?.billingAddress.country).toBe("US");
  });

  it("should handle concurrent billing updates", async () => {
    const userId = await createTestUser();

    // Simulate concurrent updates
    const updates = [
      updateBillingInfo({ email: "user1@example.com" }),
      updateBillingInfo({ email: "user2@example.com" }),
      updateBillingInfo({ email: "user3@example.com" }),
    ];

    const results = await Promise.all(updates);

    // At least one should succeed
    const successCount = results.filter((r) => r.success).length;
    expect(successCount).toBeGreaterThan(0);

    // Final state should be consistent
    const finalInfo = await getBillingInfo();
    expect(finalInfo.success).toBe(true);
  });
});
```

### Stripe Integration Tests

```typescript
describe("Stripe Integration", () => {
  beforeAll(() => {
    // Use Stripe test keys
    process.env.STRIPE_SECRET_KEY = "sk_test_...";
  });

  it("should create payment method with Stripe", async () => {
    const paymentData = {
      type: "card" as const,
      cardNumber: "4242424242424242", // Stripe test card
      expiryMonth: 12,
      expiryYear: 2025,
      cvc: "123",
    };

    const result = await addPaymentMethod(paymentData);

    expect(result.success).toBe(true);
    expect(result.data?.id).toMatch(/^pm_/); // Stripe payment method ID format
    expect(result.data?.last4).toBe("4242");
  });

  it("should handle declined cards", async () => {
    const paymentData = {
      type: "card" as const,
      cardNumber: "4000000000000002", // Stripe declined test card
      expiryMonth: 12,
      expiryYear: 2025,
      cvc: "123",
    };

    const result = await addPaymentMethod(paymentData);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("validation");
  });

  it("should process subscription changes", async () => {
    // Create test subscription
    const subscription = await createTestSubscription();

    const result = await updateSubscriptionPlan("pro-plan");

    expect(result.success).toBe(true);
    expect(result.data?.planId).toBe("pro-plan");
  });
});
```

## End-to-End Testing

### Complete Billing Flow Tests

```typescript
describe("Complete Billing Flows", () => {
  it("should complete subscription upgrade flow", async () => {
    // 1. Get current billing info
    const initialInfo = await getBillingInfo();
    expect(initialInfo.success).toBe(true);

    // 2. Add payment method
    const paymentResult = await addPaymentMethod({
      type: "card",
      cardNumber: "4242424242424242",
      expiryMonth: 12,
      expiryYear: 2025,
      cvc: "123",
    });
    expect(paymentResult.success).toBe(true);

    // 3. Update subscription plan
    const upgradeResult = await updateSubscriptionPlan("pro-plan");
    expect(upgradeResult.success).toBe(true);

    // 4. Verify billing info reflects changes
    const updatedInfo = await getBillingInfo();
    expect(updatedInfo.data?.currentPlan.id).toBe("pro-plan");
    expect(updatedInfo.data?.paymentMethods).toHaveLength(1);
  });

  it("should handle payment failure gracefully", async () => {
    // Use declined test card
    const paymentResult = await addPaymentMethod({
      type: "card",
      cardNumber: "4000000000000002",
      expiryMonth: 12,
      expiryYear: 2025,
      cvc: "123",
    });

    expect(paymentResult.success).toBe(false);

    // Subscription should remain unchanged
    const billingInfo = await getBillingInfo();
    expect(billingInfo.data?.paymentMethods).toHaveLength(0);
  });
});
```

### User Journey Tests

```typescript
describe("User Journey Tests", () => {
  it("should support new user onboarding", async () => {
    // New user signs up
    const userId = await createTestUser();

    // Gets default billing info
    const initialInfo = await getBillingInfo();
    expect(initialInfo.success).toBe(true);
    expect(initialInfo.data?.currentPlan.id).toBe("free");

    // Adds billing address
    const addressResult = await updateBillingInfo({
      billingAddress: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        postalCode: "12345",
        country: "US",
      },
    });
    expect(addressResult.success).toBe(true);

    // Adds payment method
    const paymentResult = await addPaymentMethod({
      type: "card",
      cardNumber: "4242424242424242",
      expiryMonth: 12,
      expiryYear: 2025,
      cvc: "123",
    });
    expect(paymentResult.success).toBe(true);

    // Upgrades to paid plan
    const upgradeResult = await updateSubscriptionPlan("starter");
    expect(upgradeResult.success).toBe(true);
  });
});
```

## Performance Testing

### Load Testing

```typescript
describe("Billing Performance", () => {
  it("should handle concurrent billing requests", async () => {
    const concurrentRequests = 50;
    const startTime = Date.now();

    const requests = Array(concurrentRequests)
      .fill(null)
      .map(() => getBillingInfo());

    const results = await Promise.all(requests);
    const endTime = Date.now();

    // All requests should succeed
    const successCount = results.filter((r) => r.success).length;
    expect(successCount).toBe(concurrentRequests);

    // Average response time should be reasonable
    const avgResponseTime = (endTime - startTime) / concurrentRequests;
    expect(avgResponseTime).toBeLessThan(100); // 100ms average
  });

  it("should respect rate limits", async () => {
    const userId = "test-user";
    const requests = [];

    // Make requests beyond rate limit
    for (let i = 0; i < 15; i++) {
      requests.push(getBillingInfo());
    }

    const results = await Promise.all(requests);

    // Some requests should be rate limited
    const rateLimitedCount = results.filter(
      (r) => !r.success && r.error?.type === "rate_limit"
    ).length;

    expect(rateLimitedCount).toBeGreaterThan(0);
  });
});
```

### Memory and Resource Testing

```typescript
describe("Resource Usage", () => {
  it("should not leak memory during billing operations", async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Perform many billing operations
    for (let i = 0; i < 1000; i++) {
      await getBillingInfo();
    }

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});
```

## Security Testing

### Authentication Tests

```typescript
describe("Billing Security", () => {
  it("should reject unauthenticated requests", async () => {
    // Mock authentication failure
    mockRequireAuthUser.mockRejectedValue(new Error("Not authenticated"));

    const result = await getBillingInfo();

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("internal");
  });

  it("should prevent cross-user data access", async () => {
    // User A tries to access User B's billing info
    mockGetCurrentUserId.mockResolvedValue("userA");

    // Mock database to return User B's data
    mockFetchBillingInfo.mockResolvedValue({
      userId: "userB",
      currentPlan: { id: "pro" },
    });

    const result = await getBillingInfo();

    // Should either fail or return only User A's data
    if (result.success) {
      expect(result.data?.userId).toBe("userA");
    }
  });
});
```

### Input Validation Tests

```typescript
describe("Input Validation", () => {
  it("should reject malicious input", async () => {
    const maliciousData = {
      email: '<script>alert("xss")</script>',
      billingAddress: {
        street: '"; DROP TABLE billing; --',
        country: "US",
      },
    };

    const result = await updateBillingInfo(maliciousData);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe("validation");
  });

  it("should sanitize input data", async () => {
    const inputWithWhitespace = {
      email: "  user@example.com  ",
      billingAddress: {
        street: "  123 Main St  ",
        country: "US",
      },
    };

    const result = await updateBillingInfo(inputWithWhitespace);

    if (result.success) {
      expect(result.data?.email).toBe("user@example.com");
      expect(result.data?.billingAddress.street).toBe("123 Main St");
    }
  });
});
```

## Test Data Management

### Test Fixtures

```typescript
// __tests__/fixtures/billing.ts
export const testBillingInfo = {
  userId: "test-user-123",
  currentPlan: {
    id: "starter",
    name: "Starter Plan",
    price: 9.99,
    currency: "usd",
    interval: "month",
  },
  billingAddress: {
    street: "123 Test St",
    city: "Test City",
    state: "CA",
    postalCode: "12345",
    country: "US",
  },
  paymentMethods: [
    {
      id: "pm_test_123",
      type: "card",
      last4: "4242",
      brand: "visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
  ],
};

export const testSubscriptionPlans = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    currency: "usd",
    interval: "month",
    features: ["Basic features"],
  },
  {
    id: "starter",
    name: "Starter Plan",
    price: 9.99,
    currency: "usd",
    interval: "month",
    features: ["All basic features", "Email support"],
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 29.99,
    currency: "usd",
    interval: "month",
    features: ["All features", "Priority support", "Advanced analytics"],
  },
];
```

### Mock Utilities

```typescript
// __tests__/utils/mocks.ts
export function createMockBillingInfo(overrides = {}) {
  return {
    ...testBillingInfo,
    ...overrides,
  };
}

export function createMockPaymentMethod(overrides = {}) {
  return {
    id: "pm_test_" + Math.random().toString(36).substr(2, 9),
    type: "card",
    last4: "4242",
    brand: "visa",
    isDefault: false,
    ...overrides,
  };
}

export function mockStripeSuccess() {
  mockCreateStripePaymentMethod.mockResolvedValue({
    id: "pm_test_success",
    last4: "4242",
  });
}

export function mockStripeError(errorType = "card_declined") {
  const error = new Error("Card was declined");
  error.type = "StripeCardError";
  error.code = errorType;
  mockCreateStripePaymentMethod.mockRejectedValue(error);
}
```

## Test Execution

### Running Tests

```bash
# Run all billing tests
npm test -- --testPathPattern="billing"

# Run specific test file
npm test -- billing/index.test.ts

# Run tests with coverage
npm test -- --coverage --testPathPattern="billing"

# Run integration tests only
npm test -- --testNamePattern="Integration"

# Run performance tests
npm test -- --testNamePattern="Performance"
```

### Continuous Integration

```yaml
# .github/workflows/billing-tests.yml
name: Billing Module Tests

on:
  push:
    paths:
      - "lib/actions/billing/**"
      - "__tests__/billing/**"
  pull_request:
    paths:
      - "lib/actions/billing/**"
      - "__tests__/billing/**"

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --testPathPattern="billing" --coverage

      - name: Run integration tests
        run: npm test -- --testNamePattern="Integration"
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

## Test Maintenance

### Regular Test Review

1. **Monthly Review** - Check test coverage and update as needed
2. **Quarterly Cleanup** - Remove obsolete tests and update fixtures
3. **Annual Audit** - Comprehensive review of testing strategy

### Test Quality Metrics

- **Coverage Target**: 90%+ for billing module
- **Test Execution Time**: <30 seconds for unit tests
- **Integration Test Success Rate**: 95%+
- **Performance Test Thresholds**: <100ms average response time

### Troubleshooting Test Issues

1. **Flaky Tests** - Identify and fix non-deterministic tests
2. **Slow Tests** - Optimize or parallelize slow-running tests
3. **Mock Issues** - Ensure mocks accurately represent real behavior
4. **Environment Issues** - Verify test environment configuration

This comprehensive testing guide ensures the billing module maintains high quality, security, and performance standards through systematic testing at all levels.
