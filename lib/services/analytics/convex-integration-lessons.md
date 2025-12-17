# Convex Integration Lessons Learned

## Overview

This document captures key lessons learned from integrating Convex with the analytics system, including type safety challenges, performance optimizations, and architectural patterns that emerged during development.

## Type Safety Challenges and Solutions

### The "Excessively Deep Type Instantiation" Problem

**Challenge**: Convex TypeScript integration frequently produces "type instantiation is excessively deep" warnings, particularly in analytics services with complex query patterns.

**Root Cause**: Convex's type system generates deeply nested types for function references, which can exceed TypeScript's type instantiation depth limits when combined with complex generic types.

**Solution Pattern**: Centralized ConvexQueryHelper utility

```typescript
// lib/utils/convex-query-helper.ts
export class ConvexQueryHelper {
  constructor(private convex: ConvexHttpClient) {}

  async query<T>(
    queryFn: FunctionReference<"query">,
    args: Record<string, any>
  ): Promise<T> {
    // @ts-expect-error - Convex type instantiation is excessively deep (platform limitation)
    const result = await this.convex.query(queryFn, args);
    return result as T;
  }

  async mutation<T>(
    mutationFn: FunctionReference<"mutation">,
    args: Record<string, any>
  ): Promise<T> {
    // @ts-expect-error - Convex type instantiation is excessively deep (platform limitation)
    const result = await this.convex.mutation(mutationFn, args);
    return result as T;
  }
}
```

**Key Lessons**:

1. **Centralize type assertions** - Single location for all Convex type workarounds
2. **Document platform limitations** - Clear comments explaining why type assertions are necessary
3. **Maintain runtime type safety** - Use generic types to preserve type information at the application level
4. **Consistent patterns** - All services use the same helper to avoid scattered type assertions

### Type Safety Best Practices

**Lesson**: Always use generic types with ConvexQueryHelper to maintain type safety:

```typescript
// ✅ Good - Maintains type safety
const analytics = await convexHelper.query<CampaignAnalytics[]>(
  api.analytics.getCampaignAnalytics,
  { campaignIds, filters }
);

// ❌ Bad - Loses type information
const analytics = await convexHelper.query(api.analytics.getCampaignAnalytics, {
  campaignIds,
  filters,
});
```

**Lesson**: Validate types at runtime when dealing with external data:

```typescript
function validateAnalyticsData(data: unknown): CampaignAnalytics[] {
  if (!Array.isArray(data)) {
    throw new Error("Expected analytics data to be an array");
  }

  return data.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid analytics item");
    }

    // Validate required fields
    if (typeof item.campaignId !== "string") {
      throw new Error("campaignId must be a string");
    }

    return item as CampaignAnalytics;
  });
}
```

## Performance Optimization Patterns

### Query Optimization

**Lesson**: Use compound indexes for efficient filtering:

```typescript
// Convex schema design for optimal performance
export default defineSchema({
  campaignAnalytics: defineTable({
    campaignId: v.id("campaigns"),
    companyId: v.string(),
    date: v.string(),
    metrics: v.object({
      sent: v.number(),
      delivered: v.number(),
      // ... other metrics
    }),
  })
    .index("by_company_date", ["companyId", "date"])
    .index("by_campaign_date", ["campaignId", "date"])
    .index("by_company_campaign", ["companyId", "campaignId"]),
});
```

**Lesson**: Avoid inter-query calls within Convex functions:

```typescript
// ❌ Bad - Inefficient inter-query calls
export const getAnalyticsSummary = query({
  handler: async (ctx, args) => {
    const campaigns = await ctx.runQuery(api.analytics.getCampaigns, args);
    const metrics = await ctx.runQuery(api.analytics.getMetrics, args);
    return { campaigns, metrics };
  },
});

// ✅ Good - Local data composition
export const getAnalyticsSummary = query({
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const metrics = await ctx.db
      .query("analytics")
      .withIndex("by_company_date", (q) =>
        q.eq("companyId", args.companyId).gte("date", args.startDate)
      )
      .collect();

    return { campaigns, metrics };
  },
});
```

### Caching Strategies

**Lesson**: Implement multi-layer caching for analytics data:

```typescript
// Server-side caching with Redis
export async function getCachedAnalytics(
  cacheKey: string,
  queryFn: () => Promise<any>,
  ttl: number = 300
) {
  // Try Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Execute query if not cached
  const result = await queryFn();

  // Cache result
  await redis.setex(cacheKey, ttl, JSON.stringify(result));

  return result;
}

// Usage pattern
const analytics = await getCachedAnalytics(
  `analytics:campaign:${campaignId}:${dateRange}`,
  () => convexHelper.query(api.analytics.getCampaignAnalytics, args),
  300 // 5 minutes TTL
);
```

**Lesson**: Use deterministic cache keys for consistency:

```typescript
function generateCacheKey(
  domain: string,
  operation: string,
  filters: AnalyticsFilters
): string {
  // Sort and normalize filters for consistent keys
  const normalizedFilters = {
    ...filters,
    campaignIds: filters.campaignIds?.sort(),
    mailboxIds: filters.mailboxIds?.sort(),
  };

  const filterHash = createHash("md5")
    .update(JSON.stringify(normalizedFilters))
    .digest("hex");

  return `analytics:${domain}:${operation}:${filterHash}`;
}
```

## Real-time Data Patterns

### Subscription Management

**Lesson**: Use Convex subscriptions for real-time analytics updates:

```typescript
// React component with real-time updates
export function AnalyticsDashboard({ companyId }: { companyId: string }) {
  // This automatically updates when underlying data changes
  const analytics = useQuery(api.analytics.getCompanyAnalytics, {
    companyId,
    dateRange: "last30d"
  });

  // Handle loading and error states
  if (analytics === undefined) {
    return <AnalyticsSkeletonLoader />;
  }

  return <AnalyticsDisplay data={analytics} />;
}
```

**Lesson**: Optimize subscription queries to minimize re-renders:

```typescript
// ✅ Good - Specific, focused queries
const campaignMetrics = useQuery(api.analytics.getCampaignMetrics, {
  campaignId,
  dateRange: "today",
});

// ❌ Bad - Overly broad queries that trigger unnecessary updates
const allAnalytics = useQuery(api.analytics.getAllAnalytics, {
  companyId,
});
```

### Data Consistency Patterns

**Lesson**: Use Convex transactions for consistent analytics updates:

```typescript
export const updateCampaignAnalytics = mutation({
  handler: async (ctx, args) => {
    // All updates happen atomically
    await ctx.db.patch(args.campaignId, {
      status: "completed",
      completedAt: Date.now(),
    });

    await ctx.db.insert("campaignAnalytics", {
      campaignId: args.campaignId,
      finalMetrics: args.metrics,
      date: new Date().toISOString().split("T")[0],
    });

    // Update aggregate statistics
    await ctx.db.patch(args.companyStatsId, {
      totalCampaigns: args.newTotal,
      lastUpdated: Date.now(),
    });
  },
});
```

## Error Handling and Resilience

### Structured Error Handling

**Lesson**: Use ConvexError for structured error responses:

```typescript
import { ConvexError } from "convex/values";

export const getAnalytics = query({
  handler: async (ctx, args) => {
    // Input validation
    if (!args.companyId) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_COMPANY_ID",
        message: "Company ID is required",
      });
    }

    // Business rule validation
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new ConvexError({
        code: "ANALYTICS_COMPANY_NOT_FOUND",
        message: "Company not found",
      });
    }

    // Data integrity validation
    if (args.startDate > args.endDate) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_DATE_RANGE",
        message: "Start date must be before end date",
      });
    }

    return await fetchAnalytics(ctx, args);
  },
});
```

### Graceful Degradation

**Lesson**: Implement fallback strategies for analytics failures:

```typescript
export async function getAnalyticsWithFallback(
  convexHelper: ConvexQueryHelper,
  args: AnalyticsArgs
): Promise<AnalyticsData> {
  try {
    // Try to get fresh data
    return await convexHelper.query(api.analytics.getAnalytics, args);
  } catch (error) {
    console.warn("Fresh analytics failed, trying cache:", error);

    try {
      // Fall back to cached data
      const cached = await getCachedAnalytics(args);
      if (cached) {
        return { ...cached, isStale: true };
      }
    } catch (cacheError) {
      console.warn("Cache fallback failed:", cacheError);
    }

    // Final fallback to empty state
    return {
      metrics: getEmptyMetrics(),
      timeSeriesData: [],
      isStale: true,
      error: "Unable to load analytics data",
    };
  }
}
```

## Schema Design Lessons

### Efficient Indexing

**Lesson**: Design indexes based on query patterns, not just data structure:

```typescript
// Analytics queries typically filter by:
// 1. Company (for multi-tenancy)
// 2. Date range (for time-based analysis)
// 3. Entity type (campaign, mailbox, etc.)

export default defineSchema({
  analytics: defineTable({
    companyId: v.string(),
    entityType: v.union(
      v.literal("campaign"),
      v.literal("mailbox"),
      v.literal("domain")
    ),
    entityId: v.string(),
    date: v.string(), // YYYY-MM-DD format
    metrics: v.object({
      sent: v.number(),
      delivered: v.number(),
      opened: v.number(),
      clicked: v.number(),
    }),
  })
    // Primary query pattern: company + date range
    .index("by_company_date", ["companyId", "date"])
    // Entity-specific queries
    .index("by_company_entity", ["companyId", "entityType", "entityId"])
    // Time series queries
    .index("by_entity_date", ["entityId", "date"]),
});
```

### Data Normalization

**Lesson**: Balance normalization with query efficiency:

```typescript
// ✅ Good - Denormalized for query efficiency
interface CampaignAnalytics {
  campaignId: string;
  campaignName: string; // Denormalized for display
  companyId: string;
  date: string;
  metrics: PerformanceMetrics;
}

// ❌ Bad - Over-normalized requiring joins
interface CampaignAnalytics {
  campaignId: string; // Requires separate query to get name
  companyId: string;
  date: string;
  metrics: PerformanceMetrics;
}
```

## Development Workflow Lessons

### Testing Strategies

**Lesson**: Test Convex functions with realistic data volumes:

```typescript
// Test with realistic data sizes
describe("Analytics Queries", () => {
  it("should handle large datasets efficiently", async () => {
    // Create 1000+ analytics records
    const records = Array.from({ length: 1000 }, (_, i) => ({
      campaignId: `campaign-${i % 10}`,
      date: `2024-01-${String((i % 30) + 1).padStart(2, "0")}`,
      metrics: generateRandomMetrics(),
    }));

    await Promise.all(
      records.map((record) => ctx.db.insert("analytics", record))
    );

    const startTime = Date.now();
    const result = await getAnalytics(ctx, {
      companyId: "test-company",
      dateRange: "2024-01-01:2024-01-31",
    });
    const duration = Date.now() - startTime;

    expect(result).toBeDefined();
    expect(duration).toBeLessThan(1000); // Should complete in <1s
  });
});
```

### Debugging Techniques

**Lesson**: Use structured logging for Convex function debugging:

```typescript
export const debugAnalyticsQuery = query({
  handler: async (ctx, args) => {
    const startTime = Date.now();

    console.log("Analytics query started", {
      companyId: args.companyId,
      filters: args.filters,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await fetchAnalyticsData(ctx, args);

      console.log("Analytics query completed", {
        companyId: args.companyId,
        resultCount: result.length,
        duration: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      console.error("Analytics query failed", {
        companyId: args.companyId,
        error: error.message,
        duration: Date.now() - startTime,
      });

      throw error;
    }
  },
});
```

## Migration and Deployment Lessons

### Schema Evolution

**Lesson**: Plan for schema changes with backward compatibility:

```typescript
// Version 1: Original schema
interface AnalyticsV1 {
  sent: number;
  opened: number;
  clicked: number;
}

// Version 2: Added new fields with defaults
interface AnalyticsV2 {
  sent: number;
  opened: number;
  clicked: number;
  replied: number; // New field
  bounced: number; // New field
}

// Migration function
export const migrateAnalyticsSchema = mutation({
  handler: async (ctx) => {
    const oldRecords = await ctx.db
      .query("analytics")
      .filter((q) => q.eq(q.field("version"), undefined))
      .collect();

    for (const record of oldRecords) {
      await ctx.db.patch(record._id, {
        replied: 0, // Default value
        bounced: 0, // Default value
        version: 2,
      });
    }
  },
});
```

### Performance Monitoring

**Lesson**: Monitor Convex function performance in production:

```typescript
export const monitoredAnalyticsQuery = query({
  handler: async (ctx, args) => {
    const metrics = {
      startTime: Date.now(),
      queryCount: 0,
      resultSize: 0,
    };

    // Wrap database queries to count them
    const originalQuery = ctx.db.query;
    ctx.db.query = (...queryArgs) => {
      metrics.queryCount++;
      return originalQuery.apply(ctx.db, queryArgs);
    };

    try {
      const result = await fetchAnalytics(ctx, args);
      metrics.resultSize = JSON.stringify(result).length;

      // Log performance metrics
      console.log("Query performance", {
        duration: Date.now() - metrics.startTime,
        queryCount: metrics.queryCount,
        resultSize: metrics.resultSize,
        companyId: args.companyId,
      });

      return result;
    } catch (error) {
      console.error("Query failed", {
        duration: Date.now() - metrics.startTime,
        error: error.message,
      });
      throw error;
    }
  },
});
```

## Key Takeaways

1. **Type Safety**: Use centralized utilities to handle Convex type limitations while maintaining application-level type safety
2. **Performance**: Design schemas and queries for your specific access patterns, not generic use cases
3. **Real-time**: Leverage Convex subscriptions for live updates, but keep queries focused and specific
4. **Error Handling**: Use structured errors and implement graceful degradation strategies
5. **Caching**: Implement multi-layer caching with deterministic keys for optimal performance
6. **Testing**: Test with realistic data volumes and monitor performance in production
7. **Migration**: Plan for schema evolution and maintain backward compatibility during transitions

These lessons learned provide a foundation for building robust, performant analytics systems with Convex while avoiding common pitfalls and leveraging platform strengths.
