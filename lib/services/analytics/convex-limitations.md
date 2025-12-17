# Convex Platform Limitations for Analytics

## Overview

This document outlines the specific limitations encountered when using Convex with the analytics system, along with workarounds and best practices developed during the analytics migration.

## Core Limitations

### 1. TypeScript Type Instantiation Depth

**Problem**: "Convex type instantiation is excessively deep" errors occur frequently when working with complex analytics queries.

**Root Cause**: Convex's TypeScript integration creates deeply nested type definitions that exceed TypeScript's recursion limits, especially with:

- Complex query filters
- Nested object structures
- Large union types
- Deeply nested API calls

**Impact**:

- 25+ ESLint warnings across analytics services
- Compilation slowdowns
- IDE performance issues
- Developer experience degradation

**Workarounds**:

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
 * Bypasses TypeScript type expansion by loading API at runtime
 */
async function loadConvexApi(): Promise<unknown> {
  const importer = Function("return import")() as unknown;
  return (importer as (path: string) => Promise<unknown>)(
    "@/convex/_generated/api"
  );
}
```

### 2. Schema Complexity Limitations

**Problem**: Complex analytics schemas can cause performance issues and type generation problems.

**Limitations**:

- Maximum practical table size: ~1M documents per table
- Index limitations: 16 indexes per table
- Query complexity: Nested filters can be slow
- Type generation: Complex schemas slow down development

**Workarounds**:

#### Partition Large Tables

```typescript
// Instead of one large table
campaignAnalytics: defineTable({...})

// Use time-based partitioning
campaignAnalytics_2024_01: defineTable({...})
campaignAnalytics_2024_02: defineTable({...})
```

#### Optimize Index Usage

```typescript
// Good: Single compound index
.index("by_campaign_date", ["campaignId", "timestamp"])

// Avoid: Multiple single indexes
.index("by_campaign", ["campaignId"])
.index("by_date", ["timestamp"])
```

### 3. Query Performance Constraints

**Problem**: Complex analytics queries can be slow or timeout.

**Limitations**:

- Query timeout: 30 seconds maximum
- Memory limits: ~128MB per query
- CPU lims: Complex calculations can timeout
- Concurrent query limits: ~100 concurrent queries

**Workarounds**:

#### Batch Processing

```typescript
export const getBatchAnalytics = query({
  args: { entityIds: v.array(v.string()), batchSize: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 50;
    const results = [];

    for (let i = 0; i < args.entityIds.length; i += batchSize) {
      const batch = args.entityIds.slice(i, i + batchSize);
      const batchResults = await processBatch(ctx, batch);
      results.push(...batchResults);
    }

    return results;
  },
});
```

#### Pre-aggregation

```typescript
// Store pre-calculated aggregates
dailyAnalytics: defineTable({
  date: v.string(),
  campaignId: v.string(),
  totalSent: v.number(),
  totalOpened: v.number(),
  // ... other aggregates
});
```

### 4. Real-Time Subscription Limitations

**Problem**: Real-time subscriptions have scalability and performance constraints.

**Limitations**:

- Maximum subscriptions per client: ~100
- Update frequency: Limited by client processing
- Memory usage: Subscriptions consume client memory
- Network overhead: Frequent updates can be expensive

**Workarounds**:

#### Selective Subscriptions

```typescript
// Instead of subscribing to all campaigns
const allCampaigns = useQuery(api.campaigns.getAll);

// Subscribe only to active campaigns
const activeCampaigns = useQuery(api.campaigns.getActive, {
  status: "running",
});
```

#### Debounced Updates

```typescript
// Custom hook with debouncing
function useDebouncedAnalytics(campaignIds: string[], delay = 1000) {
  const [debouncedIds, setDebouncedIds] = useState(campaignIds);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIds(campaignIds);
    }, delay);

    return () => clearTimeout(timer);
  }, [campaignIds, delay]);

  return useQuery(api.analytics.getCampaignPerformance, {
    campaignIds: debouncedIds,
  });
}
```

### 5. Data Consistency Limitations

**Problem**: Eventual consistency can cause temporary data inconsistencies in analytics.

**Limitations**:

- Write propagation delay: ~100ms typical
- Cross-table consistency: Not guaranteed
- Transaction limitations: No multi-table transactions
- Rollback complexity: Manual rollback required

**Workarounds**:

#### Optimistic Updates with Rollback

```typescript
async function updateAnalyticsWithRollback(updates: AnalyticsUpdate[]) {
  const rollbackData = [];

  try {
    for (const update of updates) {
      const previous = await ctx.db.get(update.id);
      rollbackData.push(previous);

      await ctx.db.patch(update.id, update.data);
    }
  } catch (error) {
    // Rollback on failure
    for (let i = rollbackData.length - 1; i >= 0; i--) {
      await ctx.db.patch(rollbackData[i]._id, rollbackData[i]);
    }
    throw error;
  }
}
```

#### Event Sourcing Pattern

```typescript
// Store events instead of state
analyticsEvents: defineTable({
  entityId: v.string(),
  eventType: v.string(),
  eventData: v.any(),
  timestamp: v.number(),
});

// Rebuild state from events
export const getAnalyticsState = query({
  args: { entityId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .order("asc")
      .collect();

    return events.reduce((state, event) => {
      return applyEvent(state, event);
    }, initialState);
  },
});
```

## Service-Specific Limitations

### Campaign Analytics

**Limitations**:

- Large campaign datasets (>10k campaigns) cause slow queries
- Complex filtering across multiple dimensions is expensive
- Real-time updates for high-volume campaigns can overwhelm clients

**Solutions**:

```typescript
// Use pagination for large datasets
export const getPaginatedCampaigns = query({
  args: {
    companyId: v.string(),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit || 50, 100);

    let query = ctx.db
      .query("campaignAnalytics")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId));

    if (args.cursor) {
      query = query.filter((q) => q.gt(q.field("_id"), args.cursor));
    }

    const results = await query.take(limit + 1);
    const hasMore = results.length > limit;

    return {
      campaigns: results.slice(0, limit),
      nextCursor: hasMore ? results[limit]._id : null,
      hasMore,
    };
  },
});
```

### Mailbox Analytics

**Limitations**:

- Warmup progress calculations are CPU-intensive
- Reputation tracking requires frequent updates
- Cross-mailbox correlation queries are slow

**Solutions**:

```typescript
// Pre-calculate warmup progress
export const updateWarmupProgress = mutation({
  args: { mailboxId: v.string(), progress: v.number() },
  handler: async (ctx, args) => {
    // Update pre-calculated progress instead of calculating on-demand
    await ctx.db.patch(args.mailboxId, {
      warmupProgress: args.progress,
      lastUpdated: Date.now(),
    });
  },
});
```

### Cross-Domain Analytics

**Limitations**:

- Correlation calculations across domains are memory-intensive
- Complex joins between tables are not supported
- Large dataset correlations can timeout

**Solutions**:

```typescript
// Use materialized views for complex correlations
crossDomainCorrelations: defineTable({
  domain1Id: v.string(),
  domain2Id: v.string(),
  correlationScore: v.number(),
  lastCalculated: v.number(),
});

// Update correlations asynchronously
export const updateCorrelations = internalMutation({
  args: { domain1Id: v.string(), domain2Id: v.string() },
  handler: async (ctx, args) => {
    const score = await calculateCorrelation(
      ctx,
      args.domain1Id,
      args.domain2Id
    );

    await ctx.db.insert("crossDomainCorrelations", {
      domain1Id: args.domain1Id,
      domain2Id: args.domain2Id,
      correlationScore: score,
      lastCalculated: Date.now(),
    });
  },
});
```

## Performance Optimization Strategies

### 1. Intelligent Caching

```typescript
// Multi-level caching strategy
class ConvexCacheManager {
  private memoryCache = new Map();
  private redisCache: Redis;

  async get(key: string) {
    // Level 1: Memory cache
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Level 2: Redis cache
    const redisResult = await this.redisCache.get(key);
    if (redisResult) {
      this.memoryCache.set(key, redisResult);
      return redisResult;
    }

    // Level 3: Convex query
    const convexResult = await this.queryConvex(key);

    // Cache at all levels
    this.memoryCache.set(key, convexResult);
    await this.redisCache.set(key, convexResult, { ex: 300 });

    return convexResult;
  }
}
```

### 2. Query Optimization

```typescript
// Optimize queries with proper indexing
export const getOptimizedAnalytics = query({
  args: {
    companyId: v.string(),
    dateRange: v.object({ start: v.number(), end: v.number() }),
    entityIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Use compound index for efficient filtering
    return await ctx.db
      .query("analytics")
      .withIndex("by_company_date", (q) =>
        q
          .eq("companyId", args.companyId)
          .gte("timestamp", args.dateRange.start)
          .lte("timestamp", args.dateRange.end)
      )
      .filter((q) =>
        q.or(...args.entityIds.map((id) => q.eq(q.field("entityId"), id)))
      )
      .collect();
  },
});
```

### 3. Background Processing

```typescript
// Use internal mutations for heavy processing
export const processAnalyticsBackground = internalMutation({
  args: { companyId: v.string() },
  handler: async (ctx, args) => {
    // Heavy processing that doesn't block user queries
    const rawData = await ctx.db
      .query("rawEvents")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const aggregated = await processLargeDataset(rawData);

    await ctx.db.insert("processedAnalytics", aggregated);
  },
});

// Schedule background processing
export const scheduleAnalyticsProcessing = action({
  args: { companyId: v.string() },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.analytics.processAnalyticsBackground,
      {
        companyId: args.companyId,
      }
    );
  },
});
```

## Monitoring and Alerting

### Performance Monitoring

```typescript
// Monitor query performance
export const monitoredQuery = query({
  args: {
    /* query args */
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      const result = await performQuery(ctx, args);
      const duration = Date.now() - startTime;

      // Log slow queries
      if (duration > 5000) {
        console.warn(`Slow query detected: ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Query failed after ${duration}ms:`, error);
      throw error;
    }
  },
});
```

### Health Checks

```typescript
export const healthCheck = query({
  args: {},
  handler: async (ctx) => {
    const checks = {
      database: false,
      indexes: false,
      performance: false,
    };

    try {
      // Test basic query
      await ctx.db.query("analytics").take(1);
      checks.database = true;

      // Test index usage
      const startTime = Date.now();
      await ctx.db
        .query("analytics")
        .withIndex("by_company", (q) => q.eq("companyId", "test"))
        .take(1);

      const indexTime = Date.now() - startTime;
      checks.indexes = indexTime < 100; // Should be fast with index
      checks.performance = indexTime < 1000;
    } catch (error) {
      console.error("Health check failed:", error);
    }

    return {
      status: Object.values(checks).every(Boolean) ? "healthy" : "degraded",
      checks,
      timestamp: Date.now(),
    };
  },
});
```

## Best Practices

### 1. Schema Design

- Keep tables focused and normalized
- Use appropriate indexes for query patterns
- Limit table size through partitioning
- Pre-calculate expensive aggregations

### 2. Query Design

- Use indexes effectively
- Batch operations when possible
- Implement pagination for large datasets
- Cache frequently accessed data

### 3. Error Handling

- Implement retry logic for transient errors
- Use circuit breakers for failing services
- Provide fallback data when possible
- Log errors with sufficient context

### 4. Performance

- Monitor query performance continuously
- Use background processing for heavy operations
- Implement intelligent caching strategies
- Optimize client-side data handling

## Migration Considerations

When migrating to or from Convex:

1. **Data Export**: Implement comprehensive data export functionality
2. **Schema Versioning**: Plan for schema evolution
3. **Gradual Migration**: Support hybrid systems during transition
4. **Rollback Plans**: Maintain ability to rollback changes
5. **Performance Testing**: Validate performance at scale

## Related Documentation

- [Analytics Service Architecture](./README.md)
- [Convex Setup Guide](./convex-setup.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Testing Strategies](./testing.md)
