# Analytics Testing Strategies

## Overview

This guide outlines testing strategies and patterns for the analytics services, based on lessons learned during the analytics migration and refactoring process.

## Testing Architecture

### Test Structure

```
lib/services/analytics/__tests__/
├── infrastructure.test.ts     # Core infrastructure tests
├── services/                  # Service-specific tests
│   ├── campaign.test.ts
│   ├── mailbox.test.ts
│   └── template.test.ts
├── integration/               # Integration tests
│   ├── convex-integration.test.ts
│   └── cache-integration.test.ts
└── mocks/                     # Test data and mocks
    ├── analytics-data.mock.ts
    └── convex.mock.ts
```

## Core Testing Patterns

### 1. Service Testing with BaseAnalyticsService

```typescript
import { BaseAnalyticsService } from "@/lib/services/analytics";

class TestAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super("test-domain");
  }

  async getTestMetrics(ids: string[]) {
    return this.executeWithCache("test", ids, {}, async () => {
      return { sent: 100, delivered: 95, opened_tracked: 38 };
    });
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

describe("BaseAnalyticsService", () => {
  let service: TestAnalyticsService;

  beforeEach(() => {
    service = new TestAnalyticsService();
  });

  it("should cache results correctly", async () => {
    const result1 = await service.getTestMetrics(["test1"]);
    const result2 = await service.getTestMetrics(["test1"]); // Should use cache

    expect(result1).toEqual(result2);
  });
});
```

### 2. Data Validation Testing

```typescript
import { AnalyticsCalculator } from "@/lib/services/analytics";

describe("Data Validation", () => {
  it("should validate metrics correctly", () => {
    const validMetrics = {
      sent: 1000,
      delivered: 950,
      opened_tracked: 380,
      clicked_tracked: 95,
      replied: 25,
      bounced: 50,
      unsubscribed: 5,
      spamComplaints: 2,
    };

    const validation = AnalyticsCalculator.validateMetrics(validMetrics);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("should detect invalid metrics", () => {
    const invalidMetrics = {
      sent: 100,
      delivered: 150, // More delivered than sent - invalid
      opened_tracked: 380,
      clicked_tracked: 95,
    };

    const validation = AnalyticsCalculator.validateMetrics(invalidMetrics);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("Delivered cannot exceed sent");
  });
});
```

### 3. Rate Calculation Testing

```typescript
describe("Rate Calculations", () => {
  it("should calculate rates correctly", () => {
    const metrics = {
      sent: 1000,
      delivered: 950,
      opened_tracked: 380,
      clicked_tracked: 95,
    };

    const rates = AnalyticsCalculator.calculateAllRates(metrics);

    expect(rates.deliveryRate).toBeCloseTo(0.95, 3); // 95%
    expect(rates.openRate).toBeCloseTo(0.4, 3); // 40%
    expect(rates.clickRate).toBeCloseTo(0.1, 3); // 10%
  });

  it("should handle zero denominators", () => {
    const metrics = {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
    };

    const rates = AnalyticsCalculator.calculateAllRates(metrics);

    expect(rates.deliveryRate).toBe(0);
    expect(rates.openRate).toBe(0);
    expect(rates.clickRate).toBe(0);
  });
});
```

## Error Handling Testing

### 1. Domain Isolation Testing

```typescript
describe("Error Handling", () => {
  it("should isolate domain failures", async () => {
    const isolationResult = await analyticsService.testDomainIsolation(
      "campaigns",
      true // Force failure
    );

    expect(isolationResult.targetDomainFailed).toBe(true);
    expect(isolationResult.otherDomainsWorking).toBe(true);
    expect(isolationResult.isolationSuccessful).toBe(true);
  });

  it("should fallback to cached data", async () => {
    const fallbackResult =
      await analyticsService.testCachedDataFallback("campaigns");

    expect(fallbackResult.fallbackSuccessful).toBe(true);
    expect(fallbackResult.usedCachedData).toBe(true);
  });
});
```

### 2. Retry Logic Testing

```typescript
describe("Retry Logic", () => {
  it("should retry transient errors", async () => {
    let attempts = 0;
    const mockService = {
      async getMetrics() {
        attempts++;
        if (attempts < 3) {
          throw new AnalyticsError("Network error", "campaigns", true);
        }
        return { sent: 100, delivered: 95 };
      },
    };

    const result = await mockService.getMetrics();
    expect(attempts).toBe(3);
    expect(result.sent).toBe(100);
  });

  it("should not retry non-retryable errors", async () => {
    let attempts = 0;
    const mockService = {
      async getMetrics() {
        attempts++;
        throw new AnalyticsError("Authentication error", "campaigns", false);
      },
    };

    await expect(mockService.getMetrics()).rejects.toThrow(
      "Authentication error"
    );
    expect(attempts).toBe(1);
  });
});
```

## Cache Testing

### 1. Cache Key Generation

```typescript
describe("Cache Management", () => {
  it("should generate consistent cache keys", () => {
    const key1 = analyticsCache.generateCacheKey(
      "campaigns",
      "performance",
      ["campaign1", "campaign2"],
      { dateRange: "30d" }
    );

    const key2 = analyticsCache.generateCacheKey(
      "campaigns",
      "performance",
      ["campaign1", "campaign2"],
      { dateRange: "30d" }
    );

    expect(key1).toBe(key2);
  });

  it("should generate different keys for different parameters", () => {
    const key1 = analyticsCache.generateCacheKey("campaigns", "performance", [
      "campaign1",
    ]);
    const key2 = analyticsCache.generateCacheKey("campaigns", "performance", [
      "campaign2",
    ]);

    expect(key1).not.toBe(key2);
  });
});
```

### 2. Cache Invation

```typescript
describe("Cache Invalidation", () => {
  it("should invalidate domain cache", async () => {
    // Set cache
    await analyticsCache.set("test-key", { data: "test" }, 300);

    // Verify cache exists
    const cached = await analyticsCache.get("test-key");
    expect(cached).toEqual({ data: "test" });

    // Invalidate domain
    await analyticsCache.invalidateDomain("campaigns");

    // Verify cache is cleared
    const afterInvalidation = await analyticsCache.get("test-key");
    expect(afterInvalidation).toBeNull();
  });
});
```

## Integration Testing

### 1. Convex Integration

```typescript
describe("Convex Integration", () => {
  beforeEach(() => {
    // Mock Convex client
    jest.mock("@/lib/convex", () => ({
      convex: {
        query: jest.fn(),
        mutation: jest.fn(),
      },
    }));
  });

  it("should handle Convex query responses", async () => {
    const mockData = [{ campaignId: "campaign1", sent: 100, delivered: 95 }];

    (convex.query as jest.Mock).mockResolvedValue(mockData);

    const result = await campaignService.getPerformanceMetrics(["campaign1"]);
    expect(result).toEqual(mockData);
  });

  it("should handle Convex errors gracefully", async () => {
    (convex.query as jest.Mock).mockRejectedValue(new Error("Network error"));

    await expect(
      campaignService.getPerformanceMetrics(["campaign1"])
    ).rejects.toThrow("Network error");
  });
});
```

### 2. End-to-End Testing

```typescript
describe("End-to-End Analytics Flow", () => {
  it("should complete full analytics workflow", async () => {
    // 1. Get overview metrics
    const overview = await analyticsService.getOverviewMetrics();
    expect(overview).toBeDefined();

    // 2. Get domain-specific metrics
    const campaigns = await campaignService.getPerformanceMetrics([
      "campaign1",
    ]);
    expect(campaigns).toHaveLength(1);

    // 3. Calculate rates
    const rates = AnalyticsCalculator.calculateAllRates(campaigns[0]);
    expect(rates.openRate).toBeGreaterThanOrEqual(0);

    // 4. Verify health check
    const health = await analyticsService.healthCheck();
    expect(health).toBe(true);
  });
});
```

## Mock Data and Utilities

### 1. Standardized Mock Data

```typescript
// lib/services/analytics/__tests__/mocks/analytics-data.mock.ts
export const mockPerformanceMetrics = {
  sent: 1000,
  delivered: 950,
  opened_tracked: 380,
  clicked_tracked: 95,
  replied: 25,
  bounced: 50,
  unsubscribed: 5,
  spamComplaints: 2,
};

export const mockCampaignAnalytics = [
  {
    campaignId: "campaign1",
    name: "Test Campaign",
    ...mockPerformanceMetrics,
  },
];
```

### 2. Test Utilities

```typescript
// lib/services/analytics/__tests__/utils/test-utils.ts
export function createMockAnalyticsService(domain: string) {
  return new (class extends BaseAnalyticsService {
    constructor() {
      super(domain);
    }

    async getTestData() {
      return mockPerformanceMetrics;
    }

    async healthCheck() {
      return true;
    }
  })();
}

export function expectValidMetrics(metrics: any) {
  expect(metrics).toHaveProperty("sent");
  expect(metrics).toHaveProperty("delivered");
  expect(metrics).toHaveProperty("opened_tracked");
  expect(metrics).toHaveProperty("clicked_tracked");
  expect(typeof metrics.sent).toBe("number");
  expect(typeof metrics.delivered).toBe("number");
}
```

## Performance Testing

### 1. Load Testing

```typescript
describe("Performance Testing", () => {
  it("should handle large datasets efficiently", async () => {
    const largeCampaignList = Array.from(
      { length: 1000 },
      (_, i) => `campaign${i}`
    );

    const startTime = Date.now();
    const result =
      await campaignService.getPerformanceMetrics(largeCampaignList);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    expect(result).toHaveLength(1000);
  });

  it("should use cache for repeated requests", async () => {
    const campaignIds = ["campaign1", "campaign2"];

    // First request
    const start1 = Date.now();
    await campaignService.getPerformanceMetrics(campaignIds);
    const time1 = Date.now() - start1;

    // Second request (should use cache)
    const start2 = Date.now();
    await campaignService.getPerformanceMetrics(campaignIds);
    const time2 = Date.now() - start2;

    expect(time2).toBeLessThan(time1 * 0.5); // Cache should be significantly faster
  });
});
```

### 2. Memory Usage Testing

```typescript
describe("Memory Usage", () => {
  it("should not leak memory with repeated operations", async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Perform many operations
    for (let i = 0; i < 100; i++) {
      await campaignService.getPerformanceMetrics([`campaign${i}`]);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/lib/services/analytics/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "lib/services/analytics/**/*.ts",
    "!lib/services/analytics/**/*.d.ts",
    "!lib/services/analytics/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Setup

```typescript
// jest.setup.js
import { jest } from "@jest/globals";

// Mock Redis for testing
jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  })),
}));

// Mock Convex for testing
jest.mock("@/lib/convex", () => ({
  convex: {
    query: jest.fn(),
    mutation: jest.fn(),
  },
}));
```

## Running Tests

### Basic Test Commands

```bash
# Run all analytics tests
npm test -- lib/services/analytics/__tests__/

# Run specific test file
npm test -- lib/services/analytics/__tests__/infrastructure.test.ts

# Run tests with coverage
npm test -- --coverage lib/services/analytics/__tests__/

# Run tests in watch mode
npm test -- --watch lib/services/analytics/__tests__/
```

### Test Coverage Goals

- **Unit Tests**: 90%+ coverage for core logic
- **Integration Tests**: Cover all service interactions
- **Error Handling**: Test all error scenarios
- **Performance**: Validate response times and memory usage

## Validation Patterns

### 1. Mailbox Analytics Validation

Based on the mailbox analytics validation summary, implement these patterns:

```typescript
describe("Mailbox Analytics Validation", () => {
  it("should use deterministic operations", () => {
    // Ensure operations are cache-friendly and deterministic
    const metrics1 = AnalyticsCalculator.calculateAllRates(mockData);
    const metrics2 = AnalyticsCalculator.calculateAllRates(mockData);

    expect(metrics1).toEqual(metrics2);
  });

  it("should optimize index usage", async () => {
    // Test that queries use proper indexes
    const result = await mailboxService.getWarmupMetrics("mailbox123");

    // Verify query performance
    expect(result).toBeDefined();
  });
});
```

### 2. Cross-Domain Validation

```typescript
describe("Cross-Domain Analytics", () => {
  it("should maintain API compatibility", async () => {
    const result = await crossDomainService.getCorrelationAnalysis();

    // Verify the modular refactoring maintained compatibility
    expect(result).toHaveProperty("correlations");
    expect(result).toHaveProperty("impactAnalysis");
  });
});
```

## Related Documentation

- [Analytics Service Architecture](./README.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Convex Setup Guide](./convex-setup.md)
- [Migration Lessons](./migration-lessons.md)
