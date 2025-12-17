# Analytics Type Migration Guide

## Overview

This guide provides comprehensive instructions for migrating analytics types during system refactoring and evolution. It covers common migration patterns, type transformation strategies, and best practices for maintaining type safety during transitions.

## Recent Migration History

Following the successful modular refactoring of analytics services including CampaignAnalyticsService, LeadAnalyticsService and recent ESLint fixes, this guide documents the migration of analytics types to the organized `types/analytics/` directory. This ensures consistent typing across all services, including the TemplateAnalyticsService ESLint fixes and the completed modular refactorings.

### Directory Structure

```
types/analytics/
├── core.ts     # Core types: AnalyticsFilters, PerformanceMetrics
├── ui.ts       # UI types: AnalyticsDomain, UIFilters
├── campaign.ts # Campaign-specific types
├── mailbox.ts  # Mailbox-specific types (completed)
├── domain.ts   # Domain-specific types
├── template.ts # Template-specific types
├── billing.ts  # Billing-specific types
└── index.ts    # Barrel exports for compatibility
```

### Recent ESLint Fixes Completed

- ✅ **TemplateAnalyticsService.ts**: Fixed 11 ESLint warnings (unused variables, imports, type safety)
- ✅ **calculations.ts**: Removed unused `AnalyticsError` import, fixed variable shadowing bug
- ✅ **validation.ts**: Removed unused type imports (`TemplateUsageAnalytics`, `TemplateEffectivenessMetrics`, `TemplateAnalyticsOverview`, `FilteredTemplateAnalytics`)
- ✅ **mutations.ts & queries.ts**: Cleaned up TypeScript compilation warnings
- ✅ **All Services**: ESLint compliance achieved across all modular analytics services
- ✅ **CampaignAnalyticsService.ts**: Successfully refactored from 556 lines → modular structure (COMPLETED TODAY) ✅
- ✅ **LeadAnalyticsService.ts**: Modular refactoring from 794 lines to ~750 lines across 6 modules; ESLint fixes including @ts-expect-error for Convex types, removed unused variables/imports

## Migration Patterns

### Interface Evolution

When evolving analytics interfaces, follow these patterns:

```typescript
// Before: Simple interface
interface CampaignAnalyticsV1 {
  id: string;
  name: string;
  stats: {
    sent: number;
    opened: number;
  };
}

// After: Extended interface with backward compatibility
interface CampaignAnalyticsV2 {
  id: string;
  name: string;
  description?: string; // Optional new field
  stats: {
    sent: number;
    opened: number;
    clicked: number; // New required field with default
    bounced: number; // New required field with default
  };
  metadata?: Record<string, any>; // Optional extensibility
}

// Migration utility
function migrateCampaignAnalyticsV1ToV2(
  v1: CampaignAnalyticsV1
): CampaignAnalyticsV2 {
  return {
    ...v1,
    stats: {
      ...v1.stats,
      clicked: 0, // Default value for new field
      bounced: 0, // Default value for new field
    },
  };
}
```

### Type Consolidation

When consolidating multiple types into unified interfaces:

```typescript
// Before: Separate domain types
interface CampaignStats {
  sent: number;
  opened: number;
}

interface DomainStats {
  delivered: number;
  bounced: number;
}

// After: Unified analytics type
interface UnifiedAnalytics {
  type: "campaign" | "domain" | "mailbox";
  id: string;
  stats: {
    // Common fields
    sent?: number;
    delivered?: number;
    opened?: number;
    clicked?: number;
    bounced?: number;
    // Domain-specific fields
    [key: string]: number | undefined;
  };
}

// Type guards for domain-specific access
function isCampaignAnalytics(
  analytics: UnifiedAnalytics
): analytics is UnifiedAnalytics & { type: "campaign" } {
  return analytics.type === "campaign";
}
```

### Data vs UI Type Separation

Separate data types from UI-specific types:

```typescript
// Data types (from API/database)
interface CampaignAnalyticsData {
  id: string;
  name: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
  };
  createdAt: string; // ISO string from API
  updatedAt: string; // ISO string from API
}

// UI types (for components)
interface CampaignAnalyticsUI {
  id: string;
  name: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    openRate: string; // Calculated percentage
    clickRate: string; // Calculated percentage
  };
  createdAt: Date; // Parsed date object
  updatedAt: Date; // Parsed date object
  isLoading?: boolean; // UI state
  error?: string; // UI state
}

// Transformation utility
function transformAnalyticsDataToUI(
  data: CampaignAnalyticsData
): CampaignAnalyticsUI {
  const openRate =
    data.stats.sent > 0
      ? ((data.stats.opened / data.stats.sent) * 100).toFixed(1) + "%"
      : "0%";

  const clickRate =
    data.stats.opened > 0
      ? ((data.stats.clicked / data.stats.opened) * 100).toFixed(1) + "%"
      : "0%";

  return {
    id: data.id,
    name: data.name,
    stats: {
      ...data.stats,
      openRate,
      clickRate,
    },
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}
```

## Common Migration Scenarios

### Convex Schema Updates

When updating Convex schemas, maintain backward compatibility:

```typescript
// Before: Simple schema
const campaignAnalytics = defineTable({
  campaignId: v.string(),
  stats: v.object({
    sent: v.number(),
    opened: v.number(),
  }),
});

// After: Extended schema with optional fields
const campaignAnalytics = defineTable({
  campaignId: v.string(),
  stats: v.object({
    sent: v.number(),
    opened: v.number(),
    clicked: v.optional(v.number()), // Optional for backward compatibility
    bounced: v.optional(v.number()), // Optional for backward compatibility
  }),
  metadata: v.optional(v.any()), // Optional extensibility
});

// Migration query to update existing records
export const migrateCampaignAnalytics = mutation({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaignAnalytics").collect();

    for (const campaign of campaigns) {
      if (!campaign.stats.clicked) {
        await ctx.db.patch(campaign._id, {
          stats: {
            ...campaign.stats,
            clicked: 0,
            bounced: 0,
          },
        });
      }
    }
  },
});
```

### Component Prop Migration

When updating component interfaces:

```typescript
// Before: Simple props
interface AnalyticsCardProps {
  data: CampaignAnalytics;
  loading?: boolean;
}

// After: Extended props with backward compatibility
interface AnalyticsCardPropsV2 {
  data: CampaignAnalytics;
  loading?: boolean;
  error?: string; // New optional prop
  onRefresh?: () => void; // New optional prop
  variant?: "default" | "compact"; // New optional prop
}

// Backward compatible component
function AnalyticsCard(props: AnalyticsCardPropsV2) {
  const {
    data,
    loading = false,
    error,
    onRefresh,
    variant = "default",
  } = props;

  // Component implementation with defaults
}

// Legacy prop adapter (if needed)
function adaptLegacyProps(
  legacyProps: AnalyticsCardProps
): AnalyticsCardPropsV2 {
  return {
    ...legacyProps,
    variant: "default",
  };
}
```

## Migration Utilities

### Type Assertion Helpers

```typescript
// Safe type assertion with validation
function assertCampaignAnalytics(
  obj: unknown
): asserts obj is CampaignAnalytics {
  if (!obj || typeof obj !== "object") {
    throw new Error("Invalid campaign analytics: not an object");
  }

  const analytics = obj as any;

  if (typeof analytics.id !== "string") {
    throw new Error("Invalid campaign analytics: missing id");
  }

  if (!analytics.stats || typeof analytics.stats !== "object") {
    throw new Error("Invalid campaign analytics: missing stats");
  }

  // Additional validation as needed
}

// Safe type conversion with fallbacks
function safeCampaignAnalyticsConversion(
  data: unknown
): CampaignAnalytics | null {
  try {
    assertCampaignAnalytics(data);
    return data;
  } catch {
    return null;
  }
}
```

### Migration Validation

```typescript
// Validate migration completeness
interface MigrationValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  migratedCount: number;
  totalCount: number;
}

function validateAnalyticsMigration(
  originalData: any[],
  migratedData: CampaignAnalytics[]
): MigrationValidationResult {
  const result: MigrationValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    migratedCount: migratedData.length,
    totalCount: originalData.length,
  };

  // Check counts match
  if (originalData.length !== migratedData.length) {
    result.errors.push(
      `Count mismatch: ${originalData.length} original, ${migratedData.length} migrated`
    );
    result.success = false;
  }

  // Validate each migrated item
  migratedData.forEach((item, index) => {
    try {
      assertCampaignAnalytics(item);
    } catch (error) {
      result.errors.push(`Item ${index}: ${error.message}`);
      result.success = false;
    }
  });

  return result;
}
```

## Best Practices

### 1. Gradual Migration

- Implement new types alongside old ones
- Use feature flags to control rollout
- Maintain backward compatibility during transition

### 2. Type Safety During Migration

- Use strict TypeScript settings
- Implement comprehensive type guards
- Add runtime validation for critical paths

### 3. Documentation

- Document breaking changes clearly
- Provide migration examples
- Update component documentation

### 4. Testing

- Test both old and new type paths
- Validate migration utilities
- Include integration tests for type changes

## Common Pitfalls

### 1. Breaking Changes Without Notice

```typescript
// ❌ Bad: Breaking change without migration path
interface CampaignAnalytics {
  // id: string; // Removed without migration
  campaignId: string; // Renamed field
}

// ✅ Good: Gradual migration with deprecation
interface CampaignAnalytics {
  /** @deprecated Use campaignId instead */
  id: string;
  campaignId: string;
}
```

### 2. Missing Default Values

```typescript
// ❌ Bad: New required field without default
interface CampaignAnalytics {
  stats: {
    sent: number;
    opened: number;
    clicked: number; // New required field - breaks existing code
  };
}

// ✅ Good: Optional field or provide migration
interface CampaignAnalytics {
  stats: {
    sent: number;
    opened: number;
    clicked?: number; // Optional during migration
  };
}
```

### 3. Inadequate Type Guards

```typescript
// ❌ Bad: Weak type checking
function isCampaignAnalytics(obj: any): obj is CampaignAnalytics {
  return obj && obj.id; // Too weak
}

// ✅ Good: Comprehensive validation
function isCampaignAnalytics(obj: any): obj is CampaignAnalytics {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    obj.stats &&
    typeof obj.stats === "object" &&
    typeof obj.stats.sent === "number" &&
    typeof obj.stats.opened === "number"
  );
}
```

## Migration Checklist

- [ ] Plan migration strategy (gradual vs. big bang)
- [ ] Create new types with backward compatibility
- [ ] Implement migration utilities
- [ ] Add comprehensive tests
- [ ] Update component interfaces
- [ ] Document breaking changes
- [ ] Validate migration completeness
- [ ] Monitor for runtime errors
- [ ] Clean up deprecated types after migration

## Related Documentation

- [Analytics Type Organization](../../types/analytics/README.md)
- [Analytics Type Limitations](./analytics-type-limitations.md)
- [Development Patterns](./README.md#type-patterns)
