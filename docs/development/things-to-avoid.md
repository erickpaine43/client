# Common Pitfalls and Anti-Patterns

This document outlines common mistakes, anti-patterns, and things to avoid when working with the codebase. Learning from these patterns helps maintain code quality and prevents recurring issues.

## Analytics System Anti-Patterns

### ❌ Storing Calculated Rates in Database

**Problem**: Storing calculated percentages (open rates, click rates) in the database leads to data inconsistency.

```typescript
// ❌ DON'T: Store calculated rates
interface CampaignMetrics {
  sent: number;
  opened: number;
  openRate: number; // This will become stale
}
```

**Solution**: Calculate rates on-demand using standardized methods.

```typescript
// ✅ DO: Calculate rates dynamically
import { AnalyticsCalculator } from "@/lib/services/analytics";

const openRate = AnalyticsCalculator.calculateOpenRate(
  metrics.opened,
  metrics.sent
);
```

**Why**: Stored rates become stale when base metrics are updated, leading to inconsistent data across the application.

### ❌ Mixing Analytics Logic Across Multiple Files

**Problem**: Scattering analytics calculations across different server actions and components.

```typescript
// ❌ DON'T: Duplicate calculation logic
// In campaignActions.ts
const openRate = (opened / sent) * 100;

// In dashboardActions.ts
const openRate = opened / sent; // Different calculation!

// In AnalyticsCard.tsx
const openRate = Math.round((opened / sent) * 100); // Yeriation!
```

**Solution**: Centralize all analytics calculations in dedicated services.

```typescript
// ✅ DO: Use centralized analytics service
import { analyticsService } from "@/lib/services/analytics";

const metrics = await analyticsService.getCampaignMetrics(campaignId);
```

### ❌ Heavy Reliance on Mock Data

**Problem**: Building features that only work with mock data and fail with real data.

```typescript
// ❌ DON'T: Assume mock data structure
function processCampaigns(campaigns: any[]) {
  return campaigns.map((c) => ({
    ...c,
    openRate: c.mockOpenRate, // Only exists in mock data
  }));
}
```

**Solution**: Use proper TypeScript interfaces and handle real data scenarios.

```typescript
// ✅ DO: Use proper interfaces and calculate real metrics
function processCampaigns(campaigns: Campaign[]): CampaignWithMetrics[] {
  return campaigns.map((campaign) => ({
    ...campaign,
    openRate: AnalyticsCalculator.calculateOpenRate(
      campaign.metrics.opened,
      campaign.metrics.sent
    ),
  }));
}
```

## Convex Integration Anti-Patterns

### ❌ Ignoring Type System Limitations

**Problem**: Fighting TypeScript instead of working with Convex type constraints.

```typescript
// ❌ DON'T: Complex nested generics that break Convex
type DeepAnalytics<T extends Record<string, ComplexType<U>>> = {
  [K in keyof T]: T[K] extends ComplexType<infer U> ? ProcessedType<U> : never;
};
```

**Solution**: Use type simplification and @ts-expect-error for known Convex limitations.

```typescript
// ✅ DO: Simplify types and use pragmatic workarounds
type SimplifiedAnalytics = Pick<
  ComplexAnalytics,
  "id" | "metrics" | "timestamp"
>;

// @ts-expect-error - Convex type instantiation is excessively deep
const result = await convex.query(api.analytics.getMetrics, args);
```

### ❌ Inefficient Query Patterns

**Problem**: Making multiple individual queries instead of batch operations.

```typescript
// ❌ DON'T: Multiple individual queries
const results = [];
for (const campaignId of campaignIds) {
  const metrics = await convex.query(api.analytics.getCampaignMetrics, {
    campaignId,
  });
  results.push(metrics);
}
```

**Solution**: Use batch queries and proper indexing.

```typescript
// ✅ DO: Single batch query with proper indexing
const metrics = await convex.query(api.analytics.getBatchCampaignMetrics, {
  campaignIds,
});
```

### ❌ Missing Company Scoping

**Problem**: Forgetting to scope queries by company, leading to data leaks.

```typescript
// ❌ DON'T: Unscoped queries
export const getCampaigns = query({
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").collect(); // Returns all companies' data!
  },
});
```

**Solution**: Always include company scoping in queries.

```typescript
// ✅ DO: Company-scoped queries
export const getCampaigns = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db
      .query("campaigns")
      .withIndex("by_company", (q) => q.eq("companyId", identity.companyId))
      .collect();
  },
});
```

## React Component Anti-Patterns

### ❌ Prop Drilling Analytics Data

**Problem**: Passing analytics data through multiple component layers.

```typescript
// ❌ DON'T: Prop drilling
function Dashboard({ campaigns }) {
  return <CampaignList campaigns={campaigns} />;
}

function CampaignList({ campaigns }) {
  return campaigns.map(c => <CampaignCard campaign={c} />);
}

function CampaignCard({ campaign }) {
  // Finally use the data here
}
```

**Solution**: Use context or fetch data at the component level.

```typescript
// ✅ DO: Use context or local data fetching
function CampaignCard({ campaignId }) {
  const { data: campaign, loading } = useCampaignAnalytics(campaignId);

  if (loading) return <Skeleton />;
  return <div>{/* Render campaign */}</div>;
}
```

### ❌ Mixing Data Fetching with UI Logic

**Problem**: Combining data fetching, processing, and UI rendering in single components.

```typescript
// ❌ DON'T: Mix concerns in components
function AnalyticsCard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Data fetching
    fetch('/api/analytics').then(res => {
      // Data processing
      const processed = res.data.map(item => ({
        ...item,
        openRate: (item.opened / item.sent) * 100
      }));
      setData(processed);
    });
  }, []);

  // UI rendering mixed with data logic
  return <div>{/* Complex rendering logic */}</div>;
}
```

**Solution**: Separate data fetching, processing, and UI concerns.

```typescript
// ✅ DO: Separate concerns
function AnalyticsCard() {
  const { data, loading, error } = useAnalyticsData();

  if (loading) return <AnalyticsCardSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <AnalyticsCardContent data={data} />;
}
```

## TypeScript Anti-Patterns

### ❌ Using `any` Type

**Problem**: Disabling TypeScript's type checking with `any`.

```typescript
// ❌ DON'T: Use any type
function processAnalytics(data: any) {
  return data.metrics.openRate; // No type safety
}
```

**Solution**: Use proper interfaces or unknown with type guards.

```typescript
// ✅ DO: Use proper types
interface AnalyticsData {
  metrics: {
    opened: number;
    sent: number;
  };
}

function processAnalytics(data: AnalyticsData) {
  return AnalyticsCalculator.calculateOpenRate(
    data.metrics.opened,
    data.metrics.sent
  );
}
```

### ❌ Overly Complex Generic Types

**Problem**: Creating generic types that are hard to understand and maintain.

```typescript
// ❌ DON'T: Overly complex generics
type ComplexAnalytics<
  T extends Record<string, any>,
  U extends keyof T,
  V extends T[U] extends number ? T[U] : never,
> = {
  [K in U]: T[K] extends V ? ProcessedMetric<T[K]> : never;
};
```

**Solution**: Keep types simple and readable.

```typescript
// ✅ DO: Simple, clear types
type AnalyticsMetrics = {
  sent: number;
  opened: number;
  clicked: number;
};

type ProcessedMetrics = AnalyticsMetrics & {
  openRate: number;
  clickRate: number;
};
```

## Performance Anti-Patterns

### ❌ Unnecessary Re-renders

**Problem**: Components re-rendering on every analytics update.

```typescript
// ❌ DON'T: Create new objects in render
function AnalyticsCard({ metrics }) {
  const processedMetrics = {
    ...metrics,
    openRate: (metrics.opened / metrics.sent) * 100
  }; // New object every render!

  return <MetricsDisplay metrics={processedMetrics} />;
}
```

**Solution**: Memoize calculations and use stable references.

```typescript
// ✅ DO: Memoize expensive calculations
function AnalyticsCard({ metrics }) {
  const processedMetrics = useMemo(() => ({
    ...metrics,
    openRate: AnalyticsCalculator.calculateOpenRate(metrics.opened, metrics.sent)
  }), [metrics.opened, metrics.sent]);

  return <MetricsDisplay metrics={processedMetrics} />;
}
```

### ❌ Inefficient Data Structures

**Problem**: Using inefficient data structures for large datasets.

```typescript
// ❌ DON'T: Linear search through large arrays
function findCampaignMetrics(campaigns: Campaign[], campaignId: string) {
  return campaigns.find((c) => c.id === campaignId); // O(n) lookup
}
```

**Solution**: Use Maps or other efficient data structures.

```typescript
// ✅ DO: Use efficient data structures
const campaignMap = new Map(campaigns.map((c) => [c.id, c])); // O(1) lookup
const campaign = campaignMap.get(campaignId);
```

## Error Handling Anti-Patterns

### ❌ Silent Failures

**Problem**: Catching errors without proper handling or logging.

```typescript
// ❌ DON'T: Silent failures
try {
  const metrics = await getAnalytics();
} catch (error) {
  // Silent failure - user has no idea what happened
}
```

**Solution**: Proper error handling with user feedback.

```typescript
// ✅ DO: Proper error handling
try {
  const metrics = await getAnalytics();
  return metrics;
} catch (error) {
  console.error("Failed to load analytics:", error);
  throw new AnalyticsError("Unable to load analytics data", { cause: error });
}
```

### ❌ Generic Error Messages

**Problem**: Showing technical error messages to users.

```typescript
// ❌ DON'T: Technical error messages
catch (error) {
  setError(error.message); // "TypeError: Cannot read property 'metrics' of undefined"
}
```

**Solution**: User-friendly error messages with technical details logged.

```typescript
// ✅ DO: User-friendly error messages
catch (error) {
  console.error('Analytics error:', error); // Log technical details
  setError('Unable to load analytics data. Please try again.'); // User-friendly message
}
```

## Security Anti-Patterns

### ❌ Client-Side Data Filtering

**Problem**: Filtering sensitive data on the client side.

```typescript
// ❌ DON'T: Client-side filtering
function getCompanyAnalytics(allAnalytics: Analytics[], companyId: string) {
  return allAnalytics.filter((a) => a.companyId === companyId); // All data sent to client!
}
```

**Solution**: Server-side filtering with proper authorization.

```typescript
// ✅ DO: Server-side filtering
export const getCompanyAnalytics = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db
      .query("analytics")
      .withIndex("by_company", (q) => q.eq("companyId", identity.companyId))
      .collect();
  },
});
```

### ❌ Exposing Sensitive Data in Logs

**Problem**: Logging sensitive information in error messages.

```typescript
// ❌ DON'T: Log sensitive data
console.error("Authentication failed for user:", {
  email: user.email,
  password: user.password, // Never log passwords!
  apiKey: user.apiKey, // Never log API keys!
});
```

**Solution**: Log only non-sensitive information.

```typescript
// ✅ DO: Log safely
console.error("Authentication failed for user:", {
  userId: user.id,
  timestamp: new Date().toISOString(),
  errorCode: "AUTH_FAILED",
});
```

## Testing Anti-Patterns

### ❌ Testing Implementation Details

**Problem**: Testing internal implementation instead of behavior.

```typescript
// ❌ DON'T: Test implementation details
test('should call calculateOpenRate with correct parameters', () => {
  const spy = jest.spyOn(AnalyticsCalculator, 'calculateOpenRate');
  render(<AnalyticsCard metrics={mockMetrics} />);
  expect(spy).toHaveBeenCalledWith(100, 1000);
});
```

**Solution**: Test user-visible behavior.

```typescript
// ✅ DO: Test behavior
test('should display correct open rate', () => {
  render(<AnalyticsCard metrics={{ opened: 100, sent: 1000 }} />);
  expect(screen.getByText('10.0%')).toBeInTheDocument();
});
```

### ❌ Brittle Test Data

**Problem**: Tests that break when unrelated data changes.

```typescript
// ❌ DON'T: Brittle test data
test('should display campaign metrics', () => {
  const campaign = mockCampaigns[0]; // Breaks if mock data changes
  render(<CampaignCard campaign={campaign} />);
});
```

**Solution**: Create specific test data for each test.

```typescript
// ✅ DO: Specific test data
test('should display campaign metrics', () => {
  const campaign = {
    id: 'test-campaign',
    name: 'Test Campaign',
    metrics: { sent: 1000, opened: 100 }
  };
  render(<CampaignCard campaign={campaign} />);
});
```

## Code Organization Anti-Patterns

### ❌ Circular Dependencies

**Problem**: Files importing each other, creating circular dependencies.

```typescript
// ❌ DON'T: Circular dependencies
// analytics.ts
import { formatMetrics } from "./utils";

// utils.ts
import { AnalyticsService } from "./analytics"; // Circular!
```

**Solution**: Extract shared code to separate modules.

```typescript
// ✅ DO: Proper dependency hierarchy
// shared/formatters.ts
export function formatMetrics(metrics: Metrics) {
  /* ... */
}

// analytics.ts
import { formatMetrics } from "../shared/formatters";

// utils.ts
import { formatMetrics } from "../shared/formatters";
```

### ❌ God Objects/Services

**Problem**: Single classes or services that do too many things.

```typescript
// ❌ DON'T: God service
class AnalyticsService {
  getCampaignMetrics() {
    /* ... */
  }
  getDomainMetrics() {
    /* ... */
  }
  getMailboxMetrics() {
    /* ... */
  }
  sendEmails() {
    /* ... */
  } // Not analytics!
  manageUsers() {
    /* ... */
  } // Not analytics!
  processPayments() {
    /* ... */
  } // Definitely not analytics!
}
```

**Solution**: Single responsibility principle with focused services.

```typescript
// ✅ DO: Focused services
class CampaignAnalyticsService {
  getCampaignMetrics() {
    /* ... */
  }
  calculateCampaignRates() {
    /* ... */
  }
}

class EmailService {
  sendEmails() {
    /* ... */
  }
}

class UserService {
  manageUsers() {
    /* ... */
  }
}
```

## Migration Anti-Patterns

### ❌ Big Bang Migrations

**Problem**: Changing everything at once without gradual migration.

```typescript
// ❌ DON'T: Change everything at once
// Suddenly replace all analytics with new system
// Old code breaks immediately
```

**Solution**: Gradual migration with backward compatibility.

```typescript
// ✅ DO: Gradual migration
// Phase 1: New system alongside old
// Phase 2: Migrate components one by one
// Phase 3: Remove old system after validation
```

### ❌ No Rollback Plan

**Problem**: Deploying changes without ability to rollback.

**Solution**: Always have a rollback strategy and feature flags for new functionality.

## Summary

### Key Principles to Follow:

1. **Single Source of Truth**: Centralize calculations and data definitions
2. **Separation of Concerns**: Keep data, business logic, and UI separate
3. **Type Safety**: Use TypeScript properly, avoid `any`
4. **Performance**: Memoize calculations, use efficient data structures
5. **Error Handling**: Proper error handling with user-friendly messages
6. **Security**: Server-side filtering, never expose sensitive data
7. **Testing**: Test behavior, not implementation
8. **Organization**: Avoid circular dependencies and god objects

### When in Doubt:

- Check existing patterns in the codebase
- Consult feature-specific documentation
- Ask for code review on complex changes
- Test with real data, not just mocks
- Consider performance implications
- Think about error scenarios

For specific guidance on any of these patterns, refer to:

- [Analytics Service Documentation](../../lib/services/analytics/README.md)
- [Development Patterns](./README.md#common-development-patterns)
- [Troubleshooting Guide](./troubleshooting.md)
- [Testing Strategies](./testing.md)
