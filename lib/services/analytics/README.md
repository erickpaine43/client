# Analytics Services Architecture

## Overview

This directory contains the complete analytics infrastructure for the domain-driven analytics system. The infrastructure provides standardized types, caching, error handling, and service coordination for all analytics domains.

The analytics system follows a **domain-driven architecture** that separates analytics concerns by domain (campaigns, domains, mailboxes, etc.) into dedicated services. This provides a single source of truth for all analytics data, improves performance, and creates a scalable foundation for future features.

## Core Principles

- **Single Source of Truth**: All analytics types and interfaces are centralized with no duplicate definitions
- **Data Over UI**: Backend and data layers deal with raw, numeric data; formatting is UI responsibility
- **Database of Record**: Convex stores raw event logs and aggregated metrics; NileDB handles transactional data
- **Clarity and Explicitness**: Metric names and calculations are unambiguous (e.g., `openRateOfDelivered` vs generic `rate`)

## Business Context

The analytics system was refactored from a fragmented system with scattered logic, inconsistent data definitions, and heavy reliance on mock data. The new architecture addresses:

- **Scattered Logic**: Analytics calculations were spread across multiple server action files
- **Inconsistent Data**: Multiple conflicting definitions for the same metrics
- **Mixed Concerns**: Analytics data mixed into core business objects
- **Mock Data Dependency**: Heavy reliance on mock data preventing production readiness

## Standardized Metrics

The system uses standardized KPIs across all domains:

### Core Performance Metrics

- **Emails Sent**: Total number of emails sent
- **Emails Delivered**: Total number of emails successfully delivered
- **Opens**: Number of unique opens (tracked via pixel)
- **Clicks**: Number of unique clicks (tracked)
- **Replies**: Number of unique replies
- **Bounces**: Number of bounced emails
- **Unsubscribes**: Number of users who unsubscribed
- **Spam Complaints**: Number of spam complaints

### Calculated Rate Metrics

- **Delivery Rate**: (Delivered / Sent) \* 100
- **Open Rate**: (Opens / Delivered) \* 100
- **Click Rate**: (Clicks / Delivered) \* 100
- **Reply Rate**: (Replies / Delivered) \* 100
- **Bounce Rate**: (Bounces / Sent) \* 100

### Domain-Specific Metrics

- **Domain Health/Reputation**: Score representing sending domain health
- **Mailbox Warmup Analytics**: Warmup progress, emails sent, replies received

## Architecture

```
lib/services/analytics/
├── AnalyticsService.ts          # Main coordinator service
├── BaseAnalyticsService.ts      # Abste for domain services
├── index.ts                     # Centralized exports
├── __tests__/                   # Infrastructure tests
└── README.md                    # This documentation
```

## Core Components

### 1. AnalyticsService (Main Coordinator)

The main service that coordinates all domain-specific analytics services.

```typescript
import { analyticsService } from "@/lib/services/analytics";

// Get overview metrics across all domains
const overview = await analyticsService.getOverviewMetrics();

// Invalidate cache for specific domain
await analyticsService.invalidateCache("campaigns");

// Check service health (detailed)
const health = await analyticsService.getDetailedHealthCheck();

// Check simple health status
const isHealthy = await analyticsService.healthCheck();

// Refresh all analytics data
await analyticsService.refreshAll();

// Refresh specific domain
await analyticsService.refreshDomain("campaigns");

// Get cache statistics
const stats = await analyticsService.getCacheStats();

// Get service configuration
const config = analyticsService.getConfiguration();

// Test error handling and domain isolation
const isolationResult = await analyticsService.testDomainIsolation(
  "campaigns",
  true
);
console.log(
  `Domain isolation successful: ${isolationResult.isolationSuccessful}`
);

// Test cached data fallback
const fallbackResult =
  await analyticsService.testCachedDataFallback("campaigns");
console.log(`Fallback successful: ${fallbackResult.fallbackSuccessful}`);
```

**Features:**

- Cross-domain analytics aggregation with error handling
- Intelligent cache management with cascade invalidation
- Service health monitoring with domain-specific tracking
- Singleton pattern for consistency
- Exponential backoff retry logic
- Comprehensive error handling and resilience
- Domain health status tracking
- Cache statistics and monitoring

### 2. BaseAnalyticsService (Abstract Base)

Abstract base class that all domain services extend, providing common functionality.

```typescript
import { BaseAnalyticsService } from "@/lib/services/analytics";

class CampaignAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super("campaigns"); // Domain identifier
  }

  async getPerformanceMetrics(campaignIds: string[]) {
    return this.executeWithCache("performance", campaignIds, {}, async () => {
      // Your implementation here
      return await this.fetchFromConvex(campaignIds);
    });
  }

  async healthCheck(): Promise<boolean> {
    // Implementation specific to campaigns
    return true;
  }
}
```

**Features:**

- Automatic caching with configurable TTL
- Exponential backoff retry logic
- Comprehensive error handling
- Input validation
- Operation logging
- Cache invalidation

### 3. Redis Caching Infrastructure

Intelligent caching system using Upstash Redis with domain-specific key structure.

```typescript
import { analyticsCache, CACHE_TTL } from "@/lib/services/analytics";
import { Redis } from "@upstash/redis";

// Simple Redis usage (recommended approach)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

await redis.set("foo", "bar");
const value = await redis.get("foo");

// Or use the analytics cache wrapper for structured caching
const key = analyticsCache.generateCacheKey(
  "campaigns",
  "performance",
  ["campaign1", "campaign2"],
  { dateRange: "30d" }
);

await analyticsCache.set(key, data, CACHE_TTL.RECENT);
const cached = await analyticsCache.get(key);
await analyticsCache.invalidateDomain("campaigns");
```

**Cache Key Structure:**

```
analytics:{domain}:{operation}:{entityIds}:{filters}:{timestamp}

Examples:
- analytics:campaigns:performance:campaign1,campaign2:last30d:1701234567
- analytics:mailboxes:warmup:mailbox123:custom:1701234567
- analytics:overview:metrics:all:nofilters:1701234567
```

**TTL Configuration:**

- `REAL_TIME`: 60 seconds (live data)
- `RECENT`: 300 seconds (5 minutes)
- `HOURLY`: 900 seconds (15 minutes)
- `DAILY`: 3600 seconds (1 hour)
- `HISTORICAL`: 86400 seconds (24 hours)

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

### Redis Setup

1. Create an Upstash Redis instance at [upstash.com](https://upstash.com)
2. Copy the REST URL and token to your environment variables
3. The system will automatically detect and configure Redis

**Graceful Degradation:**

- If Redis is not configured, caching is disabled
- All operations continue to work without caching
- Warnings are logged but don't break functionality

## Error Handling

The infrastructure provides comprehensive error handling with retry logic:

### Error Types

```typescript
enum AnalyticsErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  DATA_NOT_FOUND = "DATA_NOT_FOUND",
  INVALID_FILTERS = "INVALID_FILTERS",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMITED = "RATE_LIMITED",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  CACHE_ERROR = "CACHE_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}
```

### Retry Configuration

```typescript
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};
```

### Error Handling Example

```typescript
try {
  const metrics = await campaignService.getPerformanceMetrics(["campaign1"]);
} catch (error) {
  if (error instanceof AnalyticsError) {
    console.error(`Analytics error in ${error.domain}:`, error.message);

    if (error.retryable) {
      // Retry after delay
      setTimeout(() => retry(), error.retryAfter || 5000);
    } else {
      // Show user-friendly error message
      showErrorToUser("Unable to load analytics data");
    }
  }
}
```

## Data Validation

### Performance Metrics Validation

```typescript
import { AnalyticsCalculator } from "@/lib/services/analytics";

const metrics = {
  sent: 1000,
  delivered: 950,
  opened_tracked: 380,
  clicked_tracked: 95,
  // ... other fields
};

// Validate data integrity
const validation = AnalyticsCalculator.validateMetrics(metrics);
if (!validation.isValid) {
  console.error("Invalid metrics:", validation.errors);
}
```

### Filter Validation

```typescript
const filters = {
  dateRange: {
    start: "2024-01-01",
    end: "2024-01-31",
  },
  entityIds: ["campaign1", "campaign2"],
};

// Validation is automatic in BaseAnalyticsService
// Throws AnalyticsError if invalid
```

## Rate Calculations

All rate calculations use the standardized `AnalyticsCalculator`:

```typescript
import { AnalyticsCalculator } from "@/lib/services/analytics";

// Calculate individual rates
const openRate = AnalyticsCalculator.calculateOpenRate(
  metrics.opened_tracked,
  metrics.delivered
);

// Calculate all rates at once
const rates = AnalyticsCalculator.calculateAllRates(metrics);

// Format for display
const displayRate = AnalyticsCalculator.formatRateAsPercentage(rates.openRate);
// Result: "40.0%"

// Calculate health score
const healthScore = AnalyticsCalculator.calculateHealthScore(metrics);
// Result: 85 (0-100 scale)
```

## Testing

### Running Tests

```bash
npm test -- lib/services/analytics/__tests__/infrastructure.test.ts
```

### Test Coverage

The infrastructure tests cover:

- ✅ Service singleton pattern
- ✅ Configuration management
- ✅ Health checks
- ✅ Cache key generation
- ✅ Rate calculations
- ✅ Data validation
- ✅ Metric aggregation
- ✅ TTL configuration

### Mock Data

Use the standardized mock data for testing:

```typescript
import { convexCampaignAnalytics } from "@/lib/data/analytics-convex.mock";

// Test with realistic, validated data
const testData = convexCampaignAnalytics[0];
```

## Integration with Future Tasks

### Task 3.1: Domain Services

```typescript
// Extend BaseAnalyticsService for each domain
class CampaignAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super("campaigns");
  }

  async getPerformanceMetrics(campaignIds: string[]) {
    return this.executeWithCache(
      "performance",
      campaignIds,
      {},
      async () => {
        // Convex query implementation
        return await convex.query(api.analytics.getCampaignPerformance, {
          campaignIds,
        });
      },
      CACHE_TTL.RECENT
    );
  }
}
```

### Task 4.1: Convex Functions

```typescript
// Use infrastructure in Convex functions
export const getCampaignAnalytics = query({
  args: { campaignIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    // Query using standardized schema
    const analytics = await ctx.db
      .query("campaignAnalytics")
      .filter((q) =>
        q.or(...args.campaignIds.map((id) => q.eq(q.field("campaignId"), id)))
      )
      .collect();

    // Validate using AnalyticsCalculator
    analytics.forEach((metric) => {
      const validation = AnalyticsCalculator.validateMetrics(metric);
      if (!validation.isValid) {
        throw new Error(`Invalid data: ${validation.errors.join(", ")}`);
      }
    });

    return analytics;
  },
});
```

### Task 8.1: UI Components

```typescript
// Use services in React components
import { analyticsService } from "@/lib/services/analytics";

function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const data = await analyticsService.getOverviewMetrics();
        setOverview(data);
      } catch (error) {
        console.error("Failed to load overview:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <div>
      <h1>Analytics Overview</h1>
      <p>Total Emails: {overview.totalEmailsSent.toLocaleString()}</p>
      <p>Open Rate: {(overview.overallOpenRate * 100).toFixed(1)}%</p>
    </div>
  );
}
```

## Monitoring and Observability

### Health Checks

```typescript
// Check overall system health
const health = await analyticsService.healthCheck();
console.log("System status:", health.status);
console.log("Service availability:", health.services);
console.log("Cache status:", health.cache);
```

### Cache Statistics

```typescript
// Monitor cache performance
const stats = await analyticsService.getCacheStats();
console.log("Cache hit ratio:", stats.analyticsKeys / stats.totalKeys);
```

### Operation Logging

All operations are automatically logged with:

- Domain and operation type
- Entity count and duration
- Success/failure status
- Error details (if applicable)
- Timestamp

## Performance Considerations

### Caching Strategy

1. **Layered Caching**: Redis for server-side, React Query for client-side
2. **Smart TTL**: Different TTL based on data freshness requirements
3. **Key Structure**: Hierarchical keys for efficient invalidation
4. **Graceful Degradation**: System works without cache

### Query Optimization

1. **Filtered Queries**: Filter at database level before analytics computation
2. **Parallel Loading**: Load multiple domains simultaneously
3. **Progressive Loading**: Show data as it becomes available
4. **Request Deduplication**: Prevent duplicate requests

### Memory Management

1. **Efficient Data Structures**: Use standardized interfaces
2. **Garbage Collection**: Automatic cleanup of unused data
3. **Resource Limits**: Reasonable date range limits
4. **Batch Processing**: Handle large datasets efficiently

## Security Considerations

### Data Access Control

- Company-scoped analytics (all queries include companyId)
- User-based data filtering
- Audit logging for sensitive operations

### Input Validation

- Comprehensive filter validation
- SQL injection prevention
- Rate limiting protection
- Authentication token management

### Error Handling

- Secure error messages (no sensitive data exposure)
- Proper error logging without credentials
- Graceful degradation on security failures

## Migration from Legacy System

### Breaking Changes

1. **Field Names**: `opens` → `opened_tracked`, `clicks` → `clicked_tracked`
2. **Rate Storage**: No stored rates, calculate on-demand
3. **Import Paths**: New centralized exports from `@/lib/services/analytics`

### Migration Steps

1. Update imports to use new infrastructure
2. Replace stored rates with `AnalyticsCalculator` methods
3. Update field names in components
4. Test with new mock data
5. Validate data integrity

### Backward Compatibility

- Deprecated type markers for gradual migration
- Legacy field support during transition
- Feature flags for new analytics

## Support and Troubleshooting

### Common Issues

1. **Redis Connection**: Check environment variables
2. **Cache Misses**: Verify key generation logic
3. **Rate Calculations**: Use `AnalyticsCalculator` methods
4. **Data Validation**: Check metric constraints

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
process.env.ANALYTICS_DEBUG = "true";

// Or use console logging
console.log("Cache key:", analyticsCache.generateCacheKey(...));
```

### Performance Monitoring

Monitor these metrics:

- Cache hit/miss ratios
- Query execution times
- Error rates by domain
- Memory usage patterns

## Error Handling and Resilience

### Domain-Specific Error Handling (Task 9.1)

The analytics infrastructure implements comprehensive error handling with graceful degradation:

#### 1. Graceful Degradation

When individual domains fail, other domains continue to function:

```typescript
// Test domain isolation
const isolationResult = await analyticsService.testDomainIsolation(
  "campaigns",
  true
);
console.log({
  targetDomainFailed: isolationResult.targetDomainFailed, // true
  otherDomainsWorking: isolationResult.otherDomainsWorking, // true
  isolationSuccessful: isolationResult.isolationSuccessful, // true
});
```

#### 2. Cached Data Fallback

Automatic fallback to cached data when services are unavailable:

```typescript
// Service automatically uses cached data when Convex is down
const metrics = await campaignService.getPerformanceMetrics(["campaign1"]);
// Returns cached data if service unavailable, throws only if no cache available
```

#### 3. Retry Logic with Exponential Backoff

Automatic retry for transient errors:

```typescript
// Retryable errors (network, service unavailable, rate limited)
// are automatically retried with exponential backoff:
// Attempt 1: immediate
// Attempt 2: 1 second delay
// Attempt 3: 2 second delay
// Attempt 4: 4 second delay (up to maxDelay)
```

#### 4. Health Monitoring

Track domain health and error patterns:

```typescript
// Get health status for all domains
const healthStatus = analyticsService.getDomainHealthStatus();
Object.entries(healthStatus).forEach(([domain, status]) => {
  console.log(`${domain}: ${status.isHealthy ? "✅" : "❌"}`);
  console.log(`  Errors: ${status.errorCount}`);
  console.log(`  Last Error: ${status.lastError || "None"}`);
});

// Detailed health check
const health = await analyticsService.getDetailedHealthCheck();
console.log(`Status: ${health.status}`); // healthy, degraded, or unhealthy
```

#### 5. Error Testing Utilities

Comprehensive testing for error scenarios:

```typescript
import { createErrorHandlingTestUtils } from "@/lib/services/analytics";

const testUtils = createErrorHandlingTestUtils(analyticsService);

// Run comprehensive error handling tests
const results = await testUtils.runComprehensiveTests();
console.log(
  `Tests passed: ${results.summary.passed}/${results.summary.totalTests}`
);

// Test specific scenarios
const gracefulDegradation = await testUtils.testGracefulDegradation();
const cachedFallback = await testUtils.testCachedDataFallback();
const retryLogic = await testUtils.testRetryLogic();
```

#### Error Types and Handling

| Error Type          | Retryable | Fallback Strategy   |
| ------------------- | --------- | ------------------- |
| Network Error       | ✅        | Cached data         |
| Service Unavailable | ✅        | Cached data         |
| Rate Limited        | ✅        | Exponential backoff |
| Authentication      | ❌        | User notification   |
| Data Not Found      | ❌        | Empty state         |
| Validation Error    | ❌        | Error message       |

For detailed error handling documentation, see [ERROR_HANDLING_IMPLEMENTATION.md](./ERROR_HANDLING_IMPLEMENTATION.md).

## Documentation Navigation

### Setup and Configuration

- **[Convex Setup Guide](./convex-setup.md)** - Complete Convex configuration for analytics
- **[Convex Platform Limitations](./convex-limitations.md)** - Known limitations and workarounds

### Development and Maintenance

- **[Troubleshooting Guide](./troubleshooting.md)** - Common issues and solutions
- **[Testing Strategies](./testing.md)** - Testing patterns and validation approaches
- **[Migration Lessons](./migration-lessons.md)** - Historical context and lessons learned

### Component Documentation

- **[Mailbox Analytics](./mailbox/README.md)** - Mailbox-specific analytics service
- **[Template Analytics](./template/README.md)** - Template performance analytics
- **[Campaign Analytics](./campaign/README.md)** - Campaign analytics service

### Central Hub Documentation

- **[Analytics Architecture Overview](../../docs/analytics/README.md)** - High-level system architecture
- **[Development Patterns](../../docs/development/README.md)** - General development workflow

## Future Enhancements

### Planned Features

1. **Real-time Subscriptions**: Convex real-time updates
2. **Advanced Caching**: Multi-level cache hierarchy
3. **Analytics ML**: Predictive analytics and insights
4. **Custom Metrics**: User-defined KPIs
5. **Export/Import**: Data portability features

### Extensibility

The infrastructure is designed for easy extension:

- Add new domains by extending `BaseAnalyticsService`
- Custom cache strategies via configuration
- Plugin system for custom analytics
- Webhook integration for external systems
