# Analytics Type Limitations and Constraints

## Overview

This document outlines the specific type limitations, constraints, and workarounds encountered in the analytics system, particularly related to Convex integration, TypeScript compiler limitations, and platform-specific constraints.

## Convex Type Limitations

### Deep Type Instantiation Issues

**Problem**: Convex's generated types can cause "type instantiation is excessively deep" errors when used with complex generic types.

**Affected Areas**:

- Analytics service methods with multiple generic parameters
- Complex query functions with nested data structures
- Mutation functions with extensive validation schemas

**Example of Problematic Code**:

```typescript
// This can cause deep instantiation errors
export const getComplexAnalytics = query({
  args: {
    fiv.object({
      dateRange: v.union(v.literal('last7d'), v.literal('last30d')),
      campaigns: v.optional(v.array(v.string())),
      mailboxes: v.optional(v.array(v.string())),
      domains: v.optional(v.array(v.string())),
      // ... many more nested properties
    }),
    options: v.object({
      includeTimeSeries: v.boolean(),
      includeComparison: v.boolean(),
      granularity: v.union(v.literal('day'), v.literal('week'), v.literal('month')),
      // ... more nested options
    })
  },
  handler: async (ctx, args) => {
    // Complex query logic
  }
});
```

**Workaround Pattern**:

```typescript
// Simplify argument validation
export const getComplexAnalytics = query({
  args: {
    // Use simpler validation schemas
    companyId: v.string(),
    filtersJson: v.string(), // Pass complex objects as JSON strings
    optionsJson: v.string(),
  },
  handler: async (ctx, args) => {
    // Parse and validate JSON on the server side
    const filters = JSON.parse(args.filtersJson) as AnalyticsFilters;
    const options = JSON.parse(args.optionsJson) as AnalyticsOptions;

    // Validate parsed objects
    validateAnalyticsFilters(filters);
    validateAnalyticsOptions(options);

    // Proceed with query logic
  },
});

// Client-side helper
export async function getComplexAnalyticsHelper(
  filters: AnalyticsFilters,
  options: AnalyticsOptions
): Promise<AnalyticsResult> {
  return await convex.query(api.analytics.getComplexAnalytics, {
    companyId: filters.companyId,
    filtersJson: JSON.stringify(filters),
    optionsJson: JSON.stringify(options),
  });
}
```

### ConvexQueryHelper Type Assertions

**Problem**: The ConvexQueryHelper requires type assertions to work around Convex's type system limitations.

**Implementation**:

```typescript
export class ConvexQueryHelper {
  async query<T>(
    queryFn: FunctionReference<"query">,
    args: Record<string, any>
  ): Promise<T> {
    // @ts-expect-error - Convex type instantiation is excessively deep (platform limitation)
    // This is a known limitation of the Convex TypeScript integration
    const result = await this.convex.query(queryFn, args);
    return result as T;
  }

  async mutation<T>(
    mutationFn: FunctionReference<"mutation">,
    args: Record<string, any>
  ): Promise<T> {
    // @ts-expect-error - Convex type instantiation is excessively deep (platform limitation)
    // This is a known limitation of the Convex TypeScript integration
    const result = await this.convex.mutation(mutationFn, args);
    return result as T;
  }
}
```

**Type Safety Preservation**:

```typescript
// Maintain type safety at the application level
export class CampaignAnalyticsService {
  async getPerformanceMetrics(
    campaignIds?: string[],
    filters?: AnalyticsFilters
  ): Promise<CampaignAnalytics[]> {
    // Type is preserved through generic parameter
    return await this.convexHelper.query<CampaignAnalytics[]>(
      api.campaigns.getPerformanceMetrics,
      { campaignIds, filters }
    );
  }
}
```

### Schema Complexity Limitations

**Problem**: Overly complex Convex schemas can cause compilation issues and poor IDE performance.

**Constraint**: Keep schema definitions simple and avoid deeply nested objects.

**Example of Complex Schema (Problematic)**:

```typescript
// This can cause issues
export default defineSchema({
  analytics: defineTable({
    companyId: v.string(),
    data: v.object({
      campaigns: v.array(
        v.object({
          id: v.string(),
          metrics: v.object({
            sent: v.number(),
            delivered: v.number(),
            opened: v.number(),
            // ... many more nested properties
            breakdown: v.object({
              byDay: v.array(
                v.object({
                  date: v.string(),
                  metrics: v.object({
                    // ... deeply nested structure
                  }),
                })
              ),
            }),
          }),
        })
      ),
    }),
  }),
});
```

**Simplified Schema (Recommended)**:

```typescript
// Flatten the structure
export default defineSchema({
  campaignAnalytics: defineTable({
    companyId: v.string(),
    campaignId: v.string(),
    date: v.string(),
    sent: v.number(),
    delivered: v.number(),
    opened: v.number(),
    // ... flat structure
  }).index("by_company_campaign", ["companyId", "campaignId"]),

  campaignAnalyticsDaily: defineTable({
    companyId: v.string(),
    campaignId: v.string(),
    date: v.string(),
    // ... daily breakdown data
  }).index("by_campaign_date", ["campaignId", "date"]),
});
```

## TypeScript Compiler Limitations

### Union Type Complexity

**Problem**: Large union types can cause performance issues and compilation errors.

**Example of Problematic Union**:

```typescript
// This can cause compilation slowdowns
type AllAnalyticsMetrics =
  | CampaignMetrics
  | DomainMetrics
  | MailboxMetrics
  | LeadMetrics
  | TemplateMetrics
  | BillingMetrics
  | CustomMetrics1
  | CustomMetrics2
  // ... many more types
  | CustomMetrics50;
```

**Workaround Using Discriminated Unions**:

```typescript
// Use discriminated unions for better performance
interface CampaignMetricsData {
  type: "campaign";
  data: CampaignMetrics;
}

interface DomainMetricsData {
  type: "domain";
  data: DomainMetrics;
}

interface MailboxMetricsData {
  type: "mailbox";
  data: MailboxMetrics;
}

type AnalyticsMetricsData =
  | CampaignMetricsData
  | DomainMetricsData
  | MailboxMetricsData;

// Type guards for safe access
export function isCampaignMetrics(
  data: AnalyticsMetricsData
): data is CampaignMetricsData {
  return data.type === "campaign";
}
```

### Recursive Type Limitations

**Problem**: TypeScript has limitations on recursive type depth.

**Example of Problematic Recursive Type**:

```typescript
// This can hit recursion limits
interface NestedAnalyticsFilter {
  field: string;
  operator: "eq" | "gt" | "lt" | "in";
  value: any;
  and?: NestedAnalyticsFilter[];
  or?: NestedAnalyticsFilter[];
}
```

**Workaround with Depth Limitation**:

```typescript
// Limit recursion depth
interface AnalyticsFilter {
  field: string;
  operator: "eq" | "gt" | "lt" | "in";
  value: any;
}

interface AnalyticsFilterGroup {
  filters: AnalyticsFilter[];
  operator: "and" | "or";
  groups?: AnalyticsFilterGroup[]; // Limited to one level of nesting
}
```

## Performance Type Constraints

### Large Interface Limitations

**Problem**: Very large interfaces can slow down TypeScript compilation and IDE performance.

**Constraint**: Keep interfaces focused and split large ones into smaller, composable pieces.

**Example of Large Interface (Problematic)**:

```typescript
// This can cause performance issues
interface MassiveAnalyticsInterface {
  // 100+ properties
  campaignMetric1: number;
  campaignMetric2: number;
  // ... 50 more campaign metrics
  domainMetric1: number;
  domainMetric2: number;
  // ... 50 more domain metrics
  // ... continues for many more domains
}
```

**Improved Approach with Composition**:

```typescript
// Split into focused interfaces
interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  // ... campaign-specific metrics
}

interface DomainMetrics {
  reputation: number;
  healthScore: number;
  // ... domain-specific metrics
}

interface AnalyticsData {
  campaigns: Record<string, CampaignMetrics>;
  domains: Record<string, DomainMetrics>;
  // ... other domain data
}
```

### Generic Type Parameter Limitations

**Problem**: Too many generic type parameters can cause compilation issues.

**Example of Problematic Generics**:

```typescript
// This can cause issues
interface AnalyticsService<
  TCampaign,
  TDomain,
  TMailbox,
  TLead,
  TTemplate,
  TBilling,
  TFilters,
  TOptions,
  TResult,
> {
  getCampaignAnalytics(filters: TFilters): Promise<TResult<TCampaign>>;
  // ... more methods
}
```

**Simplified Approach**:

```typescript
// Use fewer, more focused generics
interface AnalyticsService<TData = any, TFilters = AnalyticsFilters> {
  getAnalytics(domain: AnalyticsDomain, filters: TFilters): Promise<TData>;
}

// Or use specific interfaces
interface CampaignAnalyticsService {
  getAnalytics(filters: AnalyticsFilters): Promise<CampaignAnalytics[]>;
}
```

## Runtime Type Validation Constraints

### JSON Schema Limitations

**Problem**: Complex TypeScript types don't always translate well to runtime validation schemas.

**Constraint**: Keep validation schemas simple and use custom validators for complex logic.

**Example**:

```typescript
// Complex TypeScript type
interface ComplexAnalyticsFilters {
  dateRange: DateRangePreset | { start: string; end: string };
  entities: {
    campaigns?: string[];
    mailboxes?: string[];
  };
  advanced?: {
    minVolume?: number;
    performance?: Partial<PerformanceMetrics>;
  };
}

// Simplified validation schema
const analyticsFiltersSchema = {
  type: "object",
  properties: {
    dateRange: { type: "string" }, // Simplified - validate complex logic separately
    entities: { type: "object" },
    advanced: { type: "object" },
  },
  required: ["dateRange"],
};

// Custom validation function
function validateAnalyticsFilters(
  filters: unknown
): filters is ComplexAnalyticsFilters {
  // Basic schema validation
  if (!isValidSchema(filters, analyticsFiltersSchema)) {
    return false;
  }

  // Custom validation logic
  const f = filters as ComplexAnalyticsFilters;

  // Validate date range
  if (typeof f.dateRange === "object") {
    if (!f.dateRange.start || !f.dateRange.end) {
      return false;
    }
  }

  // More custom validation...
  return true;
}
```

## Memory and Bundle Size Constraints

### Type Definition Size

**Problem**: Large type definition files can increase bundle size and memory usage.

**Constraint**: Keep type definitions focused and avoid unnecessary complexity.

**Best Practices**:

```typescript
// ✅ Good - Focused type definitions
// types/analytics/campaign.ts
export interface CampaignAnalytics {
  // Only campaign-related types
}

// types/analytics/domain.ts
export interface DomainAnalytics {
  // Only domain-related types
}

// ❌ Bad - Everything in one file
// types/analytics/all.ts
export interface CampaignAnalytics {
  /* ... */
}
export interface DomainAnalytics {
  /* ... */
}
export interface MailboxAnalytics {
  /* ... */
}
// ... 50+ more interfaces
```

### Conditional Type Complexity

**Problem**: Overly complex conditional types can impact compilation performance.

**Example of Complex Conditional Type**:

```typescript
// This can be slow to compile
type AnalyticsResult<T> = T extends CampaignAnalytics
  ? CampaignAnalyticsResult
  : T extends DomainAnalytics
    ? DomainAnalyticsResult
    : T extends MailboxAnalytics
      ? MailboxAnalyticsResult
      : // ... many more conditions
        DefaultAnalyticsResult;
```

**Simplified Approach**:

```typescript
// Use function overloads instead
interface AnalyticsService {
  getAnalytics(type: "campaign"): Promise<CampaignAnalyticsResult>;
  getAnalytics(type: "domain"): Promise<DomainAnalyticsResult>;
  getAnalytics(type: "mailbox"): Promise<MailboxAnalyticsResult>;
  getAnalytics(type: string): Promise<DefaultAnalyticsResult>;
}
```

## Workaround Patterns

### Type Assertion Utilities

```typescript
// Utility functions for safe type assertions
export function assertCampaignAnalytics(
  data: unknown
): asserts data is CampaignAnalytics {
  if (!isCampaignAnalytics(data)) {
    throw new Error("Invalid campaign analytics data");
  }
}

export function safeCast<T>(
  data: unknown,
  validator: (data: unknown) => data is T
): T | null {
  return validator(data) ? data : null;
}
```

### Branded Types for IDs

```typescript
// Use branded types to distinguish different ID types
type CampaignId = string & { __brand: "CampaignId" };
type MailboxId = string & { __brand: "MailboxId" };
type DomainId = string & { __brand: "DomainId" };

// Helper functions to create branded types
export function createCampaignId(id: string): CampaignId {
  return id as CampaignId;
}

export function createMailboxId(id: string): MailboxId {
  return id as MailboxId;
}
```

### Gradual Type Adoption

```typescript
// Use gradual typing for complex migrations
interface AnalyticsData {
  // Fully typed properties
  campaigns: CampaignAnalytics[];
  domains: DomainAnalytics[];

  // Gradually typed properties
  mailboxes: any[]; // TODO: Type as MailboxAnalytics[]
  leads: unknown; // TODO: Type as LeadAnalytics[]

  // Legacy properties (to be removed)
  /** @deprecated Use campaigns instead */
  legacyCampaigns?: any;
}
```

## Best Practices for Working with Limitations

1. **Keep schemas simple** - Avoid deeply nested Convex schemas
2. **Use type assertions judiciously** - Document why they're necessary
3. **Split large types** - Break complex types into smaller, focused interfaces
4. **Limit generic complexity** - Use fewer, more focused generic parameters
5. **Validate at boundaries** - Use runtime validation for external data
6. **Document workarounds** - Clearly document why workarounds are needed
7. **Monitor performance** - Watch for TypeScript compilation slowdowns
8. **Use branded types** - Distinguish between similar string types
9. **Gradual migration** - Adopt types gradually in complex systems
10. **Regular cleanup** - Remove unnecessary type complexity over time

## Future Considerations

### Convex Type System Improvements

Monitor Convex updates for improvements to the TypeScript integration that might allow removal of current workarounds.

### TypeScript Version Updates

New TypeScript versions may increase recursion limits or improve performance with complex types.

### Alternative Validation Libraries

Consider adopting validation libraries that provide better TypeScript integration (e.g., Zod, io-ts) for runtime type checking.

This document should be updated as new limitations are discovered or existing ones are resolved through platform updates or improved workarounds.
