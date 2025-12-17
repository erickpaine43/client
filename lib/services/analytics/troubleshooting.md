# Analytics Services Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered when working with the analytics services. It consolidates troubleshooting knowledge from the analytics migration and refactoring process.

## Common Issues

### Convex Type Instantiation Issues

**Problem**: "Convex type instantiation is excessively deep" warnings across multiple analytics services.

**Root Cause**: This is a systemic issue with Convex's TypeScript type inference where deeply nested type inference causes the compiler to hit recursion limits.

**Solutions**:

#### Option 1: Type Assertion (Recommended)

```typescript
// @ts-expect-error - Convex type instantiation is excessively deep (platform limitation)
const result = await convex.query(api.analytics.getCampaignPerformance, args);
```

#### Option 2: Unknown Cast

```typescript
const result = await convex.query(
  api.analytics.getCampaignPerformance as unknown as EmptyObject,
  args
);
```

#### Option 3: Runtime API Loading (Advanced)

```typescript
/**
 * Runtime-only loader for Convex generated api that avoids TypeScript expanding types.
 * This uses the Function('return import') trick so TS treats the import as any at compile time.
 */
async function loadConvexApi(): Promise<unknown> {
  const importer = Function("return import")() as unknown;
  return (importer as (path: string) => Promise<unknown>)(
    "@/convex/_generated/api"
  );
}
```

**Current Patterns Across Services**:

- **DomainAnalyticsService**: Uses `as unknown as EmptyObject`
- **TemplateAnalyticsService**: Uses `@ts-expect-error` with comment
- **LeadAnalyticsService**: Mixed approach
- **CrossDomainAnalyticsService**: Uses `@ts-expect-error`

### Type Import Problems

**Problem**: Import errors when accessing analytics types or service methods.

**Solutions**:

1. **Use centralized imports**:

```typescript
import { AnalyticsCalculator } from "@/lib/services/analytics";
import type { PerformanceMetrics } from "@/types/analytics";
```

2. **Check field name mappings**:

```typescript
// Old field names (deprecated)
(opened, clicked, spamFlags);

// New field names (current)
(opened_tracked, clicked_tracked, spamComplaints);
```

3. **Use backward compatibility mappers**:

```typescript
import { mapServiceMailboxToLegacy } from "@/lib/utils/analytics-mappers";

const legacyData = mapServiceMailboxToLegacy(newServiceData);
```

### Service Integration Patterns

**Problem**: Inconsistent service integration across components.

**Solutions**:

1. **Use BaseAnalyticsService pattern**:

```typescript
class CampaignAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super("campaigns"); // Domain identifier
  }

  async getPerformanceMetrics(campaignIds: string[]) {
    return this.executeWithCache("performance", campaignIds, {}, async () => {
      return await this.fetchFromConvex(campaignIds);
    });
  }
}
```

2. **Implement proper error handling**:

```typescript
try {
  const metrics = await campaignService.getPerformanceMetrics(["campaign1"]);
} catch (error) {
  if (error instanceof AnalyticsError) {
    console.error(`Analytics error in ${error.domain}:`, error.message);

    if (error.retryable) {
      setTimeout(() => retry(), error.retryAfter || 5000);
    }
  }
}
```

### Data Structure Access Patterns

**Problem**: Accessing nested data structures incorrectly.

**Solutions**:

1. **Use safe property access**:

```typescript
// Instead of direct access
const openRate = data.metrics.openRate;

// Use safe access with fallbacks
const openRate = data?.metrics?.openRate ?? 0;
```

2. **Validate data before use**:

```typescript
import { AnalyticsCalculator } from "@/lib/services/analytics";

const validation = AnalyticsCalculator.validateMetrics(metrics);
if (!validation.isValid) {
  console.error("Invalid metrics:", validation.errors);
  return;
}
```

### Cache-Related Issues

**Problem**: Cache misses or stale data in analytics services.

**Solutions**:

1. **Check cache key generation**:

```typescript
const key = analyticsCache.generateCacheKey(
  "campaigns",
  "performance",
  ["campaign1", "campaign2"],
  { dateRange: "30d" }
);
```

2. **Verify TTL configuration**:

```typescript
// Use appropriate TTL for data freshness
await analyticsCache.set(key, data, CACHE_TTL.RECENT); // 5 minutes
```

3. **Manual cache invalidation**:

```typescript
// Invalidate specific domain
await analyticsService.invalidateCache("campaigns");

// Invalidate all analytics cache
await analyticsService.refreshAll();
```

### Performance Issues

**Problem**: Slow analytics queries or high memory usage.

**Solutions**:

1. **Use filtered queries**:

```typescript
// Filter at database level before analytics computation
const analytics = await ctx.db
  .query("campaignAnalytics")
  .filter((q) => q.eq(q.field("companyId"), companyId))
  .collect();
```

2. **Implement batch processing**:

```typescript
// Process large datasets in chunks
const batchSize = 100;
for (let i = 0; i < campaignIds.length; i += batchSize) {
  const batch = campaignIds.slice(i, i + batchSize);
  await processBatch(batch);
}
```

3. **Use parallel loading**:

```typescript
// Load multiple domains simultaneously
const [campaigns, domains, mailboxes] = await Promise.all([
  campaignService.getMetrics(),
  domainService.getMetrics(),
  mailboxService.getMetrics(),
]);
```

## Migration-Specific Issues

### Field Name Mismatches

**Problem**: Components expecting old field names after migration.

**Solutions**:

1. **Use the analytics context shim**:

```typescript
// AnalyticsContext provides backward compatibility
const { totalSent, openRate } = useAnalyticsContext();
```

2. **Update component prop access**:

```typescript
// Old way
const openRate = data.openRate;

// New way with fallback
const openRate = data.opened_tracked
  ? (data.opened_tracked / data.delivered) * 100
  : 0;
```

### Type Compatibility Issues

**Problem**: TypeScript errors when mixing old and new analytics types.

**Solutions**:

1. **Use type guards**:

```typescript
function isLegacyData(data: any): data is LegacyAnalyticsData {
  return "openRate" in data && typeof data.openRate === "string";
}
```

2. **Implement gradual migration**:

```typescript
// Support both old and new formats
function normalizeMetrics(
  data: PerformanceMetrics | LegacyData
): PerformanceMetrics {
  if (isLegacyData(data)) {
    return convertLegacyToNew(data);
  }
  return data;
}
```

## Error Handling Patterns

### Graceful Degradation

```typescript
// Domain isolation - other domains continue working if one fails
const isolationResult = await analyticsService.testDomainIsolation(
  "campaigns",
  true
);
console.log(`Isolation successful: ${isolationResult.isolationSuccessful}`);
```

### Cached Data Fallback

```typescript
// Automatic fallback to cached data when services are unavailable
const fallbackResult =
  await analyticsService.testCachedDataFallback("campaigns");
console.log(`Fallback successful: ${fallbackResult.fallbackSuccessful}`);
```

### Retry Logic

```typescript
// Exponential backoff retry for transient errors
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};
```

## Debugging Tips

### Enable Debug Logging

```typescript
// Set environment variable
process.env.ANALYTICS_DEBUG = "true";

// Or use console logging
console.log("Cache key:", analyticsCache.generateCacheKey(...));
```

### Monitor Performance

Track these metrics:

- Cache hit/miss ratios
- Query execution times
- Error rates by domain
- Memory usage patterns

### Health Checks

```typescript
// Check overall system health
const health = await analyticsService.healthCheck();
console.log("System status:", health.status);
console.log("Service availability:", health.services);
console.log("Cache status:", health.cache);
```

## Getting Help

1. **Check the main README**: [README.md](./README.md) for architecture overview
2. **Review setup guide**: [convex-setup.md](./convex-setup.md) for configuration issues
3. **Check testing guide**: [testing.md](./testing.md) for validation patterns
4. **Review migration lessons**: [migration-lessons.md](./migration-lessons.md) for historical context

## Related Documentation

- [Analytics Service Architecture](./README.md)
- [Convex Setup Guide](./convex-setup.md)
- [Testing Strategies](./testing.md)
- [Convex Platform Limitations](./convex-limitations.md)
