# Convex Platform Limitations and Workarounds

## Overview

This document outlines known limitations of the Convex platform and provides proven workarounds. These limitations primarily affect TypeScript type system integration, query complexity, and performance characteristics.

## Quick Reference for Developers

### ⚠️ Expected TypeScript Warnings

If you see TypeScript warnings like **"Convex type instantiation is excessively deep"** in analytics services, **this is expected and not a code quality issue**.

**Key Points**:

- **Platform Limitation**: Convex's type system + TypeScript's type inference = complexity overload
- **Not Our Code**: The issue is in how these two systems interact, not in our implementation
- **Runtime Works**: All functionality works perfectly - this is only a compile-time warning

### ✅ Standard Patterns to Use

**For New Analytics Code**:
Always use the ConvexQueryHelper pattern:

```typescript
// ❌ Don't do this (triggers warnings):
const result = await convex.query(api.analytics.someQuery, args);

// ✅ Do this instead:
const convexHelper = createAnalyticsConvexHelper(convex, "YourServiceName");
const result = await convexHelper.query<ExpectedType>(
  api.analytics.someQuery,
  args,
  { serviceName: "YourServiceName", methodName: "yourMethod" }
);
```

**For Code Reviews**:

- ✅ **Accept**: ConvexQueryHelper usage patterns
- ✅ **Accept**: `@ts-expect-error` comments in ConvexQueryHelper utility
- ❌ **Reject**: Direct Convex client usage in analytics services
- ❌ **Reject**: Attempts to "fix" the warnings by changing schemas

## Type System Limitations

### Type Instantiation Depth Issues

**Problem**: Convex's type system can create excessively deep type instantiations that exceed TypeScript's limits.

**Symptoms**:

```
Type instantiation is excessively deep and possibly infinite. TS2589
```

**Root Cause**: Complex Convex schema definitions combined with TypeScript's type inference create deeply nested types that exceed the compiler's recursion limits.

**Workarounds**:

#### 1. Type Assertions with Documentation

```typescript
// @ts-expect-error - Convex type instantiation is excessively deep (platform limitation)
const result = await convex.query(api.analytics.getCampaignStats, args);

// Document the expected type for clarity
const campaignStats: CampaignStats = result;
```

#### 2. Type Simplification

```typescript
// Instead of using the full Convex-generated type
type FullConvexType = Doc<"campaigns"> & { analytics: ComplexAnalytics };

// Create a simplified interface
interface Siaign {
  id: string;
  name: string;
  status: string;
  analytics: {
    openRate: number;
    clickRate: number;
  };
}

// Use the simplified type
const campaign: SimplifiedCampaign = result;
```

#### 3. Utility Types for Common Patterns

```typescript
// Create utility types to avoid repetition
type ConvexDoc<T extends string> = {
  _id: Id<T>;
  _creationTime: number;
};

type CampaignBase = ConvexDoc<"campaigns"> & {
  name: string;
  status: string;
};

// Use utility types consistently
const campaign: CampaignBase = await convex.query(api.campaigns.get, { id });
```

### Schema Complexity Issues

**Problem**: Complex schema relationships can cause TypeScript compilation slowdowns and errors.

**Solution**: Simplify schema relationships and use explicit typing.

```typescript
// ❌ Complex nested schema
defineSchema({
  campaigns: defineTable({
    name: v.string(),
    analytics: v.object({
      daily: v.array(
        v.object({
          date: v.string(),
          metrics: v.object({
            opens: v.number(),
            clicks: v.number(),
            // ... many more nested fields
          }),
        })
      ),
    }),
  }),
});

// ✅ Simplified schema with separate tables
defineSchema({
  campaigns: defineTable({
    name: v.string(),
    status: v.string(),
  }),
  campaignAnalytics: defineTable({
    campaignId: v.id("campaigns"),
    date: v.string(),
    opens: v.number(),
    clicks: v.number(),
  }).index("by_campaign", ["campaignId"]),
});
```

## Query Performance Limitations

### Index Usage Requirements

**Problem**: Convex requires proper index usage for efficient queries, especially with large datasets.

**Best Practices**:

#### 1. Always Use Indexes for Filtering

```typescript
// ❌ Inefficient - scans entire table
const userCampaigns = await ctx.db
  .query("campaigns")
  .filter((q) => q.eq(q.field("userId"), userId))
  .collect();

// ✅ Efficient - uses index
const userCampaigns = await ctx.db
  .query("campaigns")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .collect();
```

#### 2. Compound Indexes for Complex Queries

```typescript
// Schema with compound index
defineTable({
  campaignId: v.id("campaigns"),
  status: v.string(),
  createdAt: v.number(),
})
  .index("by_campaign_status", ["campaignId", "status"])
  .index("by_status_date", ["status", "createdAt"]);

// Query using compound index
const activeCampaignAnalytics = await ctx.db
  .query("campaignAnalytics")
  .withIndex("by_campaign_status", (q) =>
    q.eq("campaignId", campaignId).eq("status", "active")
  )
  .collect();
```

#### 3. Pagination for Large Result Sets

```typescript
// Paginated query pattern
async function getPaginatedCampaigns(
  ctx: QueryCtx,
  cursor?: string,
  limit: number = 50
) {
  let query = ctx.db.query("campaigns").withIndex("by_creation_time");

  if (cursor) {
    query = query.filter((q) =>
      q.gt(q.field("_creationTime"), parseInt(cursor))
    );
  }

  const results = await query.take(limit + 1);
  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore
    ? items[items.length - 1]._creationTime.toString()
    : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}
```

### Query Complexity Limits

**Problem**: Very complex queries can hit Convex's execution time limits.

**Solutions**:

#### 1. Break Complex Queries into Smaller Parts

```typescript
// ❌ Complex single query
async function getComplexAnalytics(ctx: QueryCtx, campaignId: Id<"campaigns">) {
  const campaign = await ctx.db.get(campaignId);
  const analytics = await ctx.db
    .query("campaignAnalytics")
    .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
    .collect();

  // Complex calculations...
  const processedData = analytics.map(/* complex processing */);

  return {
    campaign,
    analytics: processedData,
    summary: calculateSummary(processedData),
  };
}

// ✅ Split into multiple focused queries
async function getCampaignBasics(ctx: QueryCtx, campaignId: Id<"campaigns">) {
  return await ctx.db.get(campaignId);
}

async function getCampaignAnalytics(
  ctx: QueryCtx,
  campaignId: Id<"campaigns">
) {
  return await ctx.db
    .query("campaignAnalytics")
    .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
    .collect();
}

async function getCampaignSummary(ctx: QueryCtx, campaignId: Id<"campaigns">) {
  const analytics = await getCampaignAnalytics(ctx, campaignId);
  return calculateSummary(analytics);
}
```

#### 2. Use Actions for Heavy Processing

```typescript
// Move complex processing to actions
export const processAnalyticsData = action({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    // Actions can run longer and use external APIs
    const rawData = await ctx.runQuery(api.analytics.getRawData, {
      campaignId,
    });

    // Complex processing that might timeout in a query
    const processedData = await heavyProcessing(rawData);

    // Store results back to database
    await ctx.runMutation(api.analytics.storeProcessedData, {
      campaignId,
      data: processedData,
    });

    return processedData;
  },
});
```

## Data Structure Limitations

### Document Size Limits

**Problem**: Convex has limits on document size and nested object depth.

**Solutions**:

#### 1. Normalize Data Structure

```typescript
// ❌ Large nested document
interface CampaignWithEverything {
  id: string;
  name: string;
  analytics: {
    daily: Array<{
      date: string;
      metrics: {
        opens: number;
        clicks: number;
        // ... hundreds of fields
      };
    }>;
  };
  templates: Array<{
    // ... large template data
  }>;
}

// ✅ Normalized structure
interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface CampaignAnalytics {
  campaignId: Id<"campaigns">;
  date: string;
  opens: number;
  clicks: number;
}

interface CampaignTemplate {
  campaignId: Id<"campaigns">;
  templateId: Id<"templates">;
  order: number;
}
```

#### 2. Use References Instead of Embedding

```typescript
// ❌ Embedded large objects
const campaignWithTemplates = {
  id: "campaign-1",
  name: "My Campaign",
  templates: [
    { id: "template-1", content: "..." }, // Large content
    { id: "template-2", content: "..." }, // Large content
  ],
};

// ✅ Use references
const campaign = {
  id: "campaign-1",
  name: "My Campaign",
  templateIds: ["template-1", "template-2"],
};

// Load templates separately when needed
const templates = await Promise.all(
  campaign.templateIds.map((id) => ctx.db.get(id))
);
```

## Real-time Limitations

### Subscription Performance

**Problem**: Too many active subscriptions can impact performance.

**Solutions**:

#### 1. Optimize Subscription Scope

```typescript
// ❌ Broad subscription
const allCampaigns = useQuery(api.campaigns.list, {});

// ✅ Scoped subscription
const userCampaigns = useQuery(api.campaigns.listByUser, {
  userId: currentUser.id,
});
```

#### 2. Use Polling for Less Critical Data

```typescript
// For data that doesn't need real-time updates
function usePolledData<T>(
  query: FunctionReference<"query">,
  args: any,
  interval: number = 30000
) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await convex.query(query, args);
      setData(result);
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [query, args, interval]);

  return data;
}
```

## Error Handling Limitations

### Limited Error Context

**Problem**: Convex error messages can be generic and lack context.

**Solutions**:

#### 1. Add Contextual Error Handling

```typescript
// Enhanced error handling in queries
export const getCampaignStats = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    try {
      const campaign = await ctx.db.get(campaignId);

      if (!campaign) {
        throw new Error(`Campaign not found: ${campaignId}`);
      }

      const analytics = await ctx.db
        .query("campaignAnalytics")
        .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
        .collect();

      if (analytics.length === 0) {
        console.warn(`No analytics data found for campaign: ${campaignId}`);
        return { campaign, analytics: [], summary: null };
      }

      return {
        campaign,
        analytics,
        summary: calculateSummary(analytics),
      };
    } catch (error) {
      console.error(`Error fetching campaign stats for ${campaignId}:`, error);
      throw new Error(`Failed to fetch campaign statistics: ${error.message}`);
    }
  },
});
```

#### 2. Client-Side Error Boundaries

```typescript
// Error boundary for Convex queries
function ConvexErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div className="error-container">
          <h3>Something went wrong</h3>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Development Workflow Limitations

### Hot Reload Issues

**Problem**: Changes to Convex functions sometimes require manual restart.

**Solutions**:

#### 1. Structured Development Workflow

```bash
# Terminal 1: Convex development
npx convex dev

# Terminal 2: Next.js development
npm run dev

# When making schema changes:
# 1. Stop convex dev
# 2. Make schema changes
# 3. Restart convex dev
# 4. Verify types are regenerated
```

#### 2. Type Generation Monitoring

```typescript
// Add to package.json scripts
{
  "scripts": {
    "convex:types": "npx convex dev --once",
    "dev:full": "concurrently \"npx convex dev\" \"npm run dev\"",
    "type-check": "tsc --noEmit && npm run convex:types"
  }
}
```

## Performance Optimization Patterns

### Caching Strategies

```typescript
// Client-side caching for expensive queries
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function useCachedQuery<T>(
  query: FunctionReference<"query">,
  args: any
): T | null {
  const cacheKey = JSON.stringify({ query: query._name, args });
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = useQuery(query, args);

  if (data) {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}
```

### Batch Operations

```typescript
// Batch multiple operations
export const batchUpdateCampaigns = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("campaigns"),
        changes: v.object({
          name: v.optional(v.string()),
          status: v.optional(v.string()),
        }),
      })
    ),
  },
  handler: async (ctx, { updates }) => {
    const results = [];

    for (const update of updates) {
      const existing = await ctx.db.get(update.id);
      if (existing) {
        const updated = await ctx.db.patch(update.id, update.changes);
        results.push(updated);
      }
    }

    return results;
  },
});
```

## Monitoring and Debugging

### Performance Monitoring

```typescript
// Query performance monitoring
export const monitoredQuery = query({
  args: {
    /* args */
  },
  handler: async (ctx, args) => {
    const start = Date.now();

    try {
      const result = await actualQueryLogic(ctx, args);
      const duration = Date.now() - start;

      if (duration > 1000) {
        // Log slow queries
        console.warn(`Slow query detected: ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`Query failed after ${duration}ms:`, error);
      throw error;
    }
  },
});
```

### Debug Logging

```typescript
// Structured debug logging
const debug = {
  query: (name: string, args: any, duration?: number) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[CONVEX QUERY] ${name}`, { args, duration });
    }
  },
  mutation: (name: string, args: any, result?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[CONVEX MUTATION] ${name}`, { args, result });
    }
  },
};
```

## Best Practices Summary

### Type Safety

- Use type assertions with explanatory comments for complex types
- Create simplified interfaces for common use cases
- Leverage utility types to reduce repetition

### Performance

- Always use appropriate indexes
- Implement pagination for large datasets
- Move heavy processing to actions
- Use caching for expensive operations

### Error Handling

- Add contextual error messages
- Implement proper error boundaries
- Log errors with sufficient context

### Development

- Monitor query performance
- Use structured logging
- Implement proper testing strategies

## Related Documentation

- [Analytics Type Limitations](./analytics-type-limitations.md) - Detailed analytics-specific type constraints
- [Authentication Implementation](./authentication-implementation.md) - Security patterns and implementation
- [Type System Documentation](../types/README.md) - Type organization and patterns
- [Performance Troubleshooting](./troubleshooting.md) - Performance issues and solutions
