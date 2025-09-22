# Convex Migration Plan

## Overview

This document outlines the migration plan from current conflicting mock data to standardized Convex tables using the new analytics types and field names.

## Migration Strategy

### Phase 1: Data Structure Standardization

1. **Field Name Mapping**
   - `opens` → `opened_tracked`
   - `clicks` → `clicked_tracked`
   - `spamFlags` → `spamComplaints`
   - Remove all stored rate fields (calculate on-demand)

2. **Data Validation**
   - Ensure `delivered ≤ sent`
   - Ensure `opened_tracked ≤ delivered`
   - Ensure `clicked_tracked ≤ opened_tracked`
   - Add missing fields with sensible defaults

3. **Type Safety**
   - All analytics data implements `PerformanceMetri interface
   - Domain-specific types extend `BaseAnalytics`
   - No functions or non-serializable data

### Phase 2: Mock Data Migration

#### Campaign Analytics Migration

**Source Files:**

- `lib/data/analytics.mock.ts` - `campaignData`
- `lib/data/campaigns.ts` - `mockedCampaigns`, `sequenceSteps`

**Migration Steps:**

```typescript
// Before (conflicting data)
const legacyCampaign = {
  name: "Q1 SaaS Outreach",
  sent: 847,
  opens: 289, // → opened_tracked
  clicks: 73, // → clicked_tracked
  replies: 42, // → replied
  openRate: "34.2%", // REMOVE - calculate on-demand
  replyRate: "8.6%", // REMOVE - calculate on-demand
};

// After (standardized)
const migratedCampaign: CampaignAnalytics = {
  campaignId: "q1-saas-outreach",
  campaignName: "Q1 SaaS Outreach",
  sent: 847,
  delivered: 837, // calculated: sent - bounced
  opened_tracked: 289,
  clicked_tracked: 73,
  replied: 42,
  bounced: 10,
  unsubscribed: 8,
  spamComplaints: 2,
  // Rates calculated on-demand using AnalyticsCalculator
};
```

#### Domain Analytics Migration

**Source Files:**

- `lib/data/domains.mock.ts` - `domains`

**Migration Steps:**

```typescript
// Before (mixed concerns)
const legacyDomain = {
  domain: "mycompany.com",
  reputation: 8.5, // REMOVE - calculate from mailbox data
  metrics: {
    sent: 245,
    opens: 108, // → opened_tracked
    clicks: 25, // → clicked_tracked
    bounceRate: 0.02, // REMOVE - calculate on-demand
  },
};

// After (standardized)
const migratedDomain: DomainAnalytics = {
  domainId: "mycompany-com",
  domainName: "mycompany.com",
  authentication: { spf: true, dkim: true, dmarc: true },
  aggregatedMetrics: {
    sent: 245,
    delivered: 240,
    opened_tracked: 108,
    clicked_tracked: 25,
    replied: 29,
    bounced: 5,
    unsubscribed: 2,
    spamComplaints: 0,
  },
  // Health score calculated using AnalyticsCalculator.calculateHealthScore()
};
```

#### Mailbox Analytics Migration

**Source Files:**

- `lib/data/domains.mock.ts` - `mailboxes`
- `lib/data/mailboxes.ts`

**Migration Steps:**

```typescript
// Before (stored reputation)
const legacyMailbox = {
  email: "john@mycompany.com",
  reputation: 9.2, // REMOVE - calculate from performance
  sent: 847,
  opens: 340, // → opened_tracked
  clicks: 85, // → clicked_tracked
  engagement: "40.1%", // REMOVE - calculate on-demand
};

// After (standardized)
const migratedMailbox: MailboxAnalytics = {
  mailboxId: "john-mycompany-com",
  email: "john@mycompany.com",
  domain: "mycompany.com",
  provider: "Gmail",
  warmupStatus: "WARMED",
  warmupProgress: 100,
  dailyLimit: 50,
  currentVolume: 89,
  sent: 847,
  delivered: 820,
  opened_tracked: 340,
  clicked_tracked: 85,
  replied: 189,
  bounced: 27,
  unsubscribed: 8,
  spamComplaints: 2,
  healthScore: 92, // calculated using AnalyticsCalculator
};
```

### Phase 3: Convex Schema Implementation

#### Table Structure

```typescript
// Campaign Analytics Table
campaignAnalytics: {
  campaignId: string,
  campaignName: string,
  date: string, // ISO date
  sent: number,
  delivered: number,
  opened_tracked: number,
  clicked_tracked: number,
  replied: number,
  bounced: number,
  unsubscribed: number,
  spamComplaints: number,
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT",
  leadCount: number,
  activeLeads: number,
  completedLeads: number,
  companyId: string,
  updatedAt: number,
}
```

#### Indexes for Performance

```typescript
.index("by_campaign", ["campaignId"])
.index("by_company_date", ["companyId", "date"])
.index("by_campaign_date", ["campaignId", "date"])
```

### Phase 4: Migration Utilities

#### ConvexMigrationUtils Usage

```typescript
import { ConvexMigrationUtils } from "@/lib/utils/convex-migration";
import { campaignData } from "@/lib/data/analytics.mock";

// Migrate campaign data
const migratedCampaigns = ConvexMigrationUtils.batchMigrate(
  campaignData,
  ConvexMigrationUtils.migrateCampaignData,
  (error, record) => console.error("Failed to migrate:", record, error)
);

// Validate migrated data
migratedCampaigns.forEach((campaign) => {
  const validation = AnalyticsCalculator.validateMetrics(campaign);
  if (!validation.isValid) {
    console.warn("Validation failed:", validation.errors);
  }
});
```

## Data Integrity Checks

### Pre-Migration Validation

1. **Field Existence Check**

   ```typescript
   const requiredFields = [
     "sent",
     "delivered",
     "opened_tracked",
     "clicked_tracked",
   ];
   const missingFields = requiredFields.filter((field) => !(field in record));
   ```

2. **Logical Consistency**

   ```typescript
   if (record.delivered > record.sent) {
     console.warn("Delivered > Sent - correcting");
     record.delivered = record.sent;
   }
   ```

3. **Rate Calculation Verification**
   ```typescript
   const calculatedOpenRate = AnalyticsCalculator.calculateOpenRate(
     record.opened_tracked,
     record.delivered
   );
   // Compare with legacy stored rate if available
   ```

### Post-Migration Validation

1. **Data Completeness**
   - All required fields present
   - No null/undefined values in critical fields
   - Proper data types (numbers, strings, booleans)

2. **Business Logic Validation**
   - Performance metrics follow logical constraints
   - Dates are valid ISO strings
   - Enum values match defined types

3. **Cross-Reference Validation**
   - Campaign analytics reference valid campaigns
   - Mailbox analytics reference valid domains
   - Sequence steps reference valid campaigns

## Migration Timeline

### Phase 1: Foundation (✅ COMPLETED - Task 1.4)

- ✅ Create standardized types (`types/analytics/`)
- ✅ Implement `AnalyticsCalculator` utility
- ✅ Create Convex schema (`convex/schema.ts`)
- ✅ Build migration utilities (`lib/utils/convex-migration.ts`)
- ✅ Create Convex-compatible mock data (`lib/data/analytics-convex.mock.ts`)
- ✅ Validation system (`scripts/validate-convex-migration.ts`)

### Phase 2: Convex Functions (Tasks 2.1-2.3)

- [ ] Implement Convex queries for analytics data retrieval
- [ ] Create Convex mutations for data updates
- [ ] Set up real-time subscriptions for live analytics
- [ ] Add server-side analytics computations
- [ ] Implement data aggregation functions

### Phase 3: Service Layer Integration (Tasks 3.1-3.4)

- [ ] Update domain services to use standardized data structures
- [ ] Migrate existing analytics services to use new types
- [ ] Implement service layer validation using migration utilities
- [ ] Test service integration with Convex functions

### Phase 4: Component Updates (Tasks 8.1-8.3)

- [ ] Update analytics components to use new data structures
- [ ] Replace stored rates with `AnalyticsCalculator` methods
- [ ] Update chart components with standardized field names
- [ ] Test UI components with migrated mock data

### Phase 5: Final Migration & Cleanup

- [ ] Migrate production data using migration utilities
- [ ] Remove legacy mock data files
- [ ] Update all documentation references
- [ ] Performance testing and optimization
- [ ] Final validation across all systems

## Breaking Changes

### For Developers

1. **Import Changes**

   ```typescript
   // OLD
   import { CampaignPerformanceData } from "@/types/analytics";

   // NEW
   import { CampaignAnalytics } from "@/types/analytics/domain-specific";
   ```

2. **Field Name Changes**

   ```typescript
   // OLD
   campaign.opens;
   campaign.clicks;
   campaign.openRate;

   // NEW
   campaign.opened_tracked;
   campaign.clicked_tracked;
   AnalyticsCalculator.calculateOpenRate(
     campaign.opened_tracked,
     campaign.delivered
   );
   ```

3. **Rate Calculations**

   ```typescript
   // OLD
   const openRate = campaign.openRate; // stored as percentage string

   // NEW
   const openRate = AnalyticsCalculator.calculateOpenRate(
     campaign.opened_tracked,
     campaign.delivered
   ); // returns decimal (0.0-1.0)
   const displayRate = AnalyticsCalculator.formatRateAsPercentage(openRate);
   ```

### For UI Components

1. **Chart Data Preparation**

   ```typescript
   // OLD
   const chartData = campaigns.map((c) => ({
     name: c.name,
     opens: c.opens,
     openRate: parseFloat(c.openRate),
   }));

   // NEW
   const chartData = campaigns.map((c) => {
     const rates = AnalyticsCalculator.calculateAllRates(c);
     return {
       name: c.campaignName,
       opened_tracked: c.opened_tracked,
       openRate: rates.openRate * 100, // convert to percentage for charts
     };
   });
   ```

## Testing Strategy

### Unit Tests

```typescript
describe("ConvexMigrationUtils", () => {
  it("should migrate campaign data correctly", () => {
    const legacy = { name: "Test", sent: 100, opens: 30 };
    const migrated = ConvexMigrationUtils.migrateCampaignData(legacy);

    expect(migrated.campaignName).toBe("Test");
    expect(migrated.sent).toBe(100);
    expect(migrated.opened_tracked).toBe(30);
    expect(migrated.delivered).toBeLessThanOrEqual(migrated.sent);
  });
});
```

### Integration Tests

```typescript
describe("Analytics Migration Integration", () => {
  it("should maintain rate calculation consistency", () => {
    const legacyData = mockCampaigns[0];
    const migrated = ConvexMigrationUtils.migrateCampaignData(legacyData);

    const newOpenRate = AnalyticsCalculator.calculateOpenRate(
      migrated.opened_tracked,
      migrated.delivered
    );

    // Should be close to legacy rate (within reasonable tolerance)
    expect(newOpenRate).toBeCloseTo(0.342, 2); // 34.2%
  });
});
```

## Rollback Plan

If migration issues occur:

1. **Immediate Rollback**
   - Revert to legacy mock data files
   - Disable new analytics components
   - Use deprecated type markers

2. **Gradual Rollback**
   - Keep both old and new data structures
   - Feature flag new analytics
   - Gradual component migration

3. **Data Recovery**
   - All migration utilities preserve original data
   - Validation logs help identify issues
   - Batch migration allows partial rollback

## Success Metrics

1. **Data Integrity**: 100% of migrated records pass validation
2. **Performance**: No degradation in analytics loading times
3. **Functionality**: All existing analytics features work with new data
4. **Type Safety**: Zero TypeScript errors in analytics components
5. **Test Coverage**: 90%+ coverage for migration utilities

## Using Completed Migration Assets in Future Tasks

### For Convex Function Development (Tasks 2.1-2.3)

**Schema Reference:**

```typescript
// Use the completed schema from convex/schema.ts
import { Doc } from "./_generated/dataModel";

// Query campaign analytics
export const getCampaignAnalytics = query({
  args: { campaignId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaignAnalytics")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});
```

**Mock Data for Testing:**

```typescript
// Use standardized mock data from lib/data/analytics-convex.mock.ts
import { convexCampaignAnalytics } from "@/lib/data/analytics-convex.mock";

// Test Convex functions with realistic data
const testData = convexCampaignAnalytics[0]; // Already Convex-compatible
```

### For Service Layer Integration (Tasks 3.1-3.4)

**Migration Utilities:**

```typescript
// Use migration utilities for data transformation
import { ConvexMigrationUtils } from "@/lib/utils/convex-migration";

// Migrate legacy data in services
const migratedCampaigns = ConvexMigrationUtils.batchMigrate(
  legacyData,
  ConvexMigrationUtils.migrateCampaignData
);
```

**Validation:**

```typescript
// Use validation for data integrity
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

const validation = AnalyticsCalculator.validateMetrics(campaignData);
if (!validation.isValid) {
  throw new Error(`Invalid data: ${validation.errors.join(", ")}`);
}
```

### For Component Updates (Tasks 8.1-8.3)

**Rate Calculations:**

```typescript
// Replace stored rates with calculated rates
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

// OLD: const openRate = campaign.openRate;
// NEW:
const rates = AnalyticsCalculator.calculateAllRates(campaign);
const displayRate = AnalyticsCalculator.formatRateAsPercentage(rates.openRate);
```

**Chart Data:**

```typescript
// Use standardized field names for charts
const chartData = campaigns.map((campaign) => ({
  name: campaign.campaignName,
  opened_tracked: campaign.opened_tracked, // standardized field
  clicked_tracked: campaign.clicked_tracked, // standardized field
  openRate:
    AnalyticsCalculator.calculateOpenRate(
      campaign.opened_tracked,
      campaign.delivered
    ) * 100,
}));
```

## Support and Documentation

### Completed Assets (Task 1.4)

- ✅ Migration guide: `types/analytics/MIGRATION_GUIDE.md`
- ✅ Convex schema: `convex/schema.ts`
- ✅ Migration utilities: `lib/utils/convex-migration.ts`
- ✅ Standardized mock data: `lib/data/analytics-convex.mock.ts`
- ✅ Validation script: `scripts/validate-convex-migration.ts`
- ✅ Migration plan: `lib/data/convex-migration-plan.md`
- ✅ Task summary: `.kiro/specs/analytics-domain-refactoring/CONVEX_MIGRATION_SUMMARY.md`

### Future Task References

- Field mapping examples in migration guide
- Type definitions in `types/analytics/`
- Calculator utilities for consistent rate calculations
- Validation patterns for data integrity
