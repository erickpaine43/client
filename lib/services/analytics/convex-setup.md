# Convex Setup and Configuration for Analytics

## Overview

This guide provides comprehensive setup instructions for Convex integration with the analytics system, including configuration, deployment, and troubleshooting specific to analytics use cases.

## Quick Setup

### 1. Install Convex CLI

```bash
npm install -g convex
```

### 2. Initialize Convex Project

```bash
# Login to Convex (creates account if needed)
npx convex login

# Initialize Convex in your project
npx convex dev
```

This will:

- Create a new Convex deployment
- Generate the `NEXT_PUBLIC_CONVEX_URL` for your project
- Start the development server
- Generate the `_generated` files automatically

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Convex URL:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud

# Optional: Redis for caching (recommended for production)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

### 4. Deploy Analytics Schema and Functions

```bash
npx convex deploy
```

## Analytics-Specific Configuration

### Schema Structure

The analytics system uses the following Convex tables:

```typescript
// convex/schema.ts
export default defineSchema({
  // Campaign Analytics
  campaignAnalytics: defineTable({
    campaignId: v.string(),
    companyId: v.string(),
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    timestamp: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_company", ["companyId"])
    .index("by_timestamp", ["timestamp"]),

  // Mailbox Analytics
  mailboxAnalytics: defineTable({
    mailboxId: v.string(),
    companyId: v.string(),
    domainId: v.string(),
    // ... performance metrics
    warmupProgress: v.optional(v.number()),
    reputation: v.optional(v.number()),
  })
    .index("by_mailbox", ["mailboxId"])
    .index("by_domain", ["domainId"])
    .index("by_company", ["companyId"]),

  // Domain Analytics
  domainAnalytics: defineTable({
    domainId: v.string(),
    companyId: v.string(),
    // ... aggregated metrics
  })
    .index("by_domain",mainId"])
    .index("by_company", ["companyId"]),

  // Template Analytics
  templateAnalytics: defineTable({
    templateId: v.string(),
    companyId: v.string(),
    // ... performance metrics
  })
    .index("by_template", ["templateId"])
    .index("by_company", ["companyId"]),
});
```

### Analytics Functions

Key Convex functions for analytics:

#### Campaign Analytics

```typescript
// convex/campaignAnalytics.ts
export const getCampaignPerformance = query({
  args: {
    campaignIds: v.array(v.string()),
    companyId: v.string(),
    dateRange: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaignAnalytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), args.companyId),
          q.or(...args.campaignIds.map((id) => q.eq(q.field("campaignId"), id)))
        )
      )
      .collect();
  },
});
```

#### Mailbox Analytics

```typescript
// convex/mailboxAnalytics.ts
export const getMailboxWarmupProgress = query({
  args: {
    mailboxIds: v.array(v.string()),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mailboxAnalytics")
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), args.companyId),
          q.or(...args.mailboxIds.map((id) => q.eq(q.field("mailboxId"), id)))
        )
      )
      .collect();
  },
});
```

## Type Safety Patterns

### Handling Convex Type Instantiation Issues

The analytics system implements several patterns to handle Convex's TypeScript limitations:

#### Pattern 1: Type Assertion (Recommended)

```typescript
// @ts-expect-error - Convex type instantiation is excessively deep (platform limitation)
const result = await convex.query(api.analytics.getCampaignPerformance, {
  campaignIds: ["campaign1"],
  companyId: "company123",
});
```

#### Pattern 2: Runtime API Loading (Advanced)

```typescript
/**
 * Runtime-only loader for Convex generated api that avoids TypeScript expanding types.
 */
async function loadConvexApi(): Promise<unknown> {
  const importer = Function("return import")() as unknown;
  return (importer as (path: string) => Promise<unknown>)(
    "@/convex/_generated/api"
  );
}

async function callConvexQuery<T>(fn: unknown, args: unknown): Promise<T> {
  const client = convex as unknown as {
    query: (fn: unknown, args: unknown) => Promise<unknown>;
  };

  return (await client.query(fn, args)) as T;
}
```

#### Pattern 3: Service Wrapper

```typescript
class ConvexAnalyticsService {
  async getCampaignMetrics(campaignIds: string[], companyId: string) {
    try {
      // @ts-expect-error - Convex type instantiation limitation
      return await convex.query(api.campaignAnalytics.getCampaignPerformance, {
        campaignIds,
        companyId,
      });
    } catch (error) {
      console.error("Convex query failed:", error);
      throw new AnalyticsError(
        "Failed to fetch campaign metrics",
        "campaigns",
        true
      );
    }
  }
}
```

## Query Optimization

### Index Usage Patterns

Ensure efficient queries by using proper indexes:

```typescript
// Good: Uses index
const campaignMetrics = await ctx.db
  .query("campaignAnalytics")
  .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
  .collect();

// Good: Compound filtering with index
const recentMetrics = await ctx.db
  .query("campaignAnalytics")
  .withIndex("by_timestamp", (q) =>
    q.gte("timestamp", startTime).lte("timestamp", endTime)
  )
  .filter((q) => q.eq(q.field("companyId"), companyId))
  .collect();
```

### Batch Operations

Handle large datasets efficiently:

```typescript
// Process campaigns in batches
export const getBatchCampaignAnalytics = query({
  args: {
    campaignIds: v.array(v.string()),
    companyId: v.string(),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 50;
    const results = [];

    for (let i = 0; i < args.campaignIds.length; i += batchSize) {
      const batch = args.campaignIds.slice(i, i + batchSize);
      const batchResults = await ctx.db
        .query("campaignAnalytics")
        .filter((q) =>
          q.and(
            q.eq(q.field("companyId"), args.companyId),
            q.or(...batch.map((id) => q.eq(q.field("campaignId"), id)))
          )
        )
        .collect();

      results.push(...batchResults);
    }

    return results;
  },
});
```

## Error Handling

### Convex-Specific Error Patterns

```typescript
export class ConvexAnalyticsError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = "ConvexAnalyticsError";
  }
}

async function executeConvexQuery<T>(
  queryFn: () => Promise<T>,
  operation: string,
  retries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isRetryable =
        error.message.includes("network") || error.message.includes("timeout");

      if (isLastAttempt || !isRetryable) {
        throw new ConvexAnalyticsError(
          `${operation} failed: ${error.message}`,
          operation,
          isRetryable
        );
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
```

## Performance Optimization

### Caching Strategy

Implement intelligent caching for analytics data:

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getCachedCampaignMetrics(
  campaignIds: string[],
  companyId: string
) {
  const cacheKey = `analytics:campaigns:${companyId}:${campaignIds.join(",")}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from Convex
  // @ts-expect-error - Convex type instantiation limitation
  const data = await convex.query(
    api.campaignAnalytics.getCampaignPerformance,
    {
      campaignIds,
      companyId,
    }
  );

  // Cache for 5 minutes
  await redis.set(cacheKey, data, { ex: 300 });

  return data;
}
```

### Real-Time Subscriptions

Use Convex subscriptions for real-time analytics:

```typescript
// hooks/useRealtimeCampaignAnalytics.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useRealtimeCampaignAnalytics(
  campaignIds: string[],
  companyId: string
) {
  return useQuery(api.campaignAnalytics.getCampaignPerformance, {
    campaignIds,
    companyId,
  });
}
```

## Development Workflow

### Local Development

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start Next.js dev server
npm run dev
```

### Testing Convex Functions

```bash
# Test a specific function
npx convex run campaignAnalytics:getCampaignPerformance \
  --arg campaignIds '["campaign1"]' \
  --arg companyId '"company123"'

# View logs
npx convex logs
```

### Deployment

```bash
# Deploy to production
npx convex deploy --prod

# Verify deployment
npx convex dashboard
```

## Monitoring and Debugging

### Health Checks

Implement health checks for Convex connectivity:

```typescript
export async function checkConvexHealth(): Promise<boolean> {
  try {
    // @ts-expect-error - Convex type instantiation limitation
    await convex.query(api.analytics.healthCheck);
    return true;
  } catch (error) {
    console.error("Convex health check failed:", error);
    return false;
  }
}
```

### Performance Monitoring

Track query performance:

```typescript
export async function monitoredQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;

    console.log(`Query ${queryName} completed in ${duration}ms`);

    if (duration > 5000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Query ${queryName} failed after ${duration}ms:`, error);
    throw error;
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module './\_generated/dataModel'"

**Solution**: Run `npx convex dev` to generate the files.

#### 2. "NEXT_PUBLIC_CONVEX_URL not found"

**Solution**:

1. Run `npx convex dev` to get your URL
2. Add it to `.env.local`
3. Restart your Next.js dev server

#### 3. Functions not updating

**Solution**:

1. Stop `npx convex dev`
2. Run `npx convex dev` again
3. Check for TypeScript errors in functions

#### 4. Real-time updates not working

**Solution**:

1. Verify WebSocket connection in browser dev tools
2. Check Convex dashboard for connection status
3. Ensure proper subscription setup in React components

#### 5. Type instantiation errors

**Solution**: Use the patterns documented above:

- `@ts-expect-error` comments
- Runtime API loading
- Service wrapper patterns

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
process.env.CONVEX_DEBUG = "true";

// Or use console logging
console.log("Convex query:", { campaignIds, companyId });
```

## Security Considerations

### Data Access Control

Ensure all queries include company-scoped filtering:

```typescript
// Always include companyId in queries
export const getCompanyAnalytics = query({
  args: { companyId: v.string() },
  handler: async (ctx, args) => {
    // Verify user has access to this company
    const user = await getCurrentUser(ctx);
    if (user.companyId !== args.companyId) {
      throw new Error("Unauthorized access");
    }

    return await ctx.db
      .query("campaignAnalytics")
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .collect();
  },
});
```

### Input Validation

Validate all inputs to prevent injection attacks:

```typescript
import { v } from "convex/values";

export const getCampaignAnalytics = query({
  args: {
    campaignIds: v.array(v.string()),
    companyId: v.string(),
    dateRange: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Validate campaign IDs format
    for (const id of args.campaignIds) {
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        throw new Error("Invalid campaign ID format");
      }
    }

    // Validate date range
    if (args.dateRange && args.dateRange.start > args.dateRange.end) {
      throw new Error("Invalid date range");
    }

    // Continue with query...
  },
});
```

## Related Documentation

- [Analytics Service Architecture](./README.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Testing Strategies](./testing.md)
- [Convex Platform Limitations](./convex-limitations.md)
