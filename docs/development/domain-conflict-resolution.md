# Analytics Conflicts Analysis and Resolution

## Executive Summary

This document identifies and resolves conflicting analytics definitions found throughout the codebase. Based on the business decisions in `ANALYTICS_REFACTORING_DECISIONS.md`, we have standardized all analytics metrics and created a mapping from current inconsistent definitions to the new standardized format.

## 1. Conflicting Type Definitions

### 1.1 Campaign Performance Metrics

**Conflict**: Multiple inconsistent data structures for campaign analytics across different files.

**Current Conflicting Definitions**:

1. **`types/analytics.ts` - CampaignPerformanceData`**:

   ```typescript
   interface CampaignPerformanceData {
     name: string;
     sent: number;
     opens: number | null; // ❌ Nullable, ambiguous name
     clicks: number | null; // ❌ Nullable, ambiguous name
     replies: number;
     bounced?: number; // ❌ Optional field
     openRate: number; // ❌ Rate stored as number (unclear if decimal or percentage)
     replyRate: number; // ❌ Rate stored as number
   }
   ```

2. **`lib/data/campaigns.ts` - campaignData`**:

   ```typescript
   {
     name: "Q1 SaaS Outreach",
     bounced: 10,
     sent: 847,
     opens: 289,           // ❌ Different field name
     clicks: 73,
     replies: 42,
     openRate: 34.1,       // ❌ Rate as percentage number
     replyRate: 5.0,       // ❌ Rate as percentage number
   }
   ```

3. **`lib/data/campaigns.ts` - mockedCampaigns`**:
   ```typescript
   {
     opens: 840,
     opensPercent: 65.4,   // ❌ Different naming convention
     clicks: 210,
     clicksPercent: 16.3,  // ❌ Different naming convention
     replies: 84,
     repliesPercent: 6.5,  // ❌ Different naming convention
   }
   ```

**Resolution**: Standardize on the following structure based on business decisions:

```typescript
interface CampaignPerformanceMetrics {
  campaignId: string;
  campaignName: string;
  // Raw counts (always numbers, never null)
  sent: number;
  delivered: number;
  opened_tracked: number; // Explicit tracking pixel opens
  clicked_tracked: number; // Explicit tracked clicks
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;

  // Rates calculated on-demand (as decimals, e.g., 0.25 for 25%)
  // These will be computed in services, not stored
}
```

### 1.2 Rate Calculation Conflicts

**Conflict**: Inconsistent calculation methods and storage formats for rates.

**Current Issues**:

1. **Storage Format**: Some rates stored as strings ("34.2%"), others as numbers (34.2), others as decimals (0.342)
2. **Calculation Base**: Some rates calculated from `sent`, others from `delivered`
3. **Null Handling**: Inconsistent handling of null/undefined values

**Examples of Conflicts**:

1. **`lib/data/analytics.mock.ts`**:

   ```typescript
   // Rates calculated from sent emails
   openRate: (opens / sent) * 100; // ❌ Percentage number
   ```

2. **`lib/actions/dashboardActions.ts`**:

   ```typescript
   openRate: {
     value: "65.4%",  // ❌ String with percentage symbol
   }
   ```

3. **`lib/actions/templateActions.ts`**:
   ```typescript
   openRate: string | null; // ❌ String type, nullable
   ```

**Resolution**: Based on business decisions:

- All rates calculated as decimals (0.0 to 1.0)
- Open rate = `opened_tracked / delivered` (not sent)
- Click rate = `clicked_tracked / delivered`
- Reply rate = `replied / delivered`
- Bounce rate = `bounced / sent`
- Rates computed on-demand, not stored

### 1.3 Time Series Data Conflicts

**Conflict**: Different field names and structures for time series data.

**Current Conflicting Definitions**:

1. **`types/analytics.ts` - TimeSeriesDataPoint`**:

   ```typescript
   interface TimeSeriesDataPoint {
     opens: number; // ❌ Ambiguous name
     clicks: number; // ❌ Ambiguous name
     replies: number;
     bounces: number;
   }
   ```

2. **`lib/data/analytics.mock.ts` - generateTimeSeriesData`**:
   ```typescript
   {
     sent: number,
     opens: number,    // ❌ Different from above
     clicks: number,
     replies: number,
     bounces: number,  // ❌ Different field name
   }
   ```

**Resolution**: Standardize on explicit field names:

```typescript
interface TimeSeriesDataPoint {
  date: string;
  label: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}
```

## 2. Mock Data Conflicts

### 2.1 Inconsistent Mock Data Structures

**Conflict**: Mock data doesn't match type definitions and uses inconsistent field names.

**Issues Found**:

1. **`lib/data/analytics.mock.ts`**:
   - Uses `opens` instead of `opened_tracked`
   - Uses `clicks` instead of `clicked_tracked`
   - Missing `delivered` field
   - Missing `unsubscribed` and `spamComplaints` fields

2. **`lib/data/campaigns.ts`**:
   - Multiple different structures for the same concept
   - Inconsistent rate calculations
   - Mixed string and number types for rates

3. **`lib/data/domains.mock.ts`**:
   - `reputation` stored as number in domain objects (conflicts with business decision)
   - Rates stored as decimals in some places, percentages in others

**Resolution**: Create standardized mock data that matches the new type definitions.

### 2.2 Domain Reputation Conflicts

**Conflict**: Domain reputation stored in multiple places with different calculation methods.

**Current Issues**:

1. **`lib/data/domains.mock.ts`**: `reputation: 95` (stored as domain property)
2. **`lib/data/domains.mock.ts`**: `reputation: 9.2` (stored as mailbox property)
3. **Business Decision**: Reputation should be calculated from mailbox + IP, not stored at domain level

**Resolution**: Remove `reputation` from domain types, calculate on-demand from mailbox data.

## 3. Server Action Analytics Logic Conflicts

### 3.1 Scattered Analytics Calculations

**Conflict**: Analytics calculations spread across multiple server actions with different implementations.

**Files with Analytics Logic**:

1. **`lib/actions/mailboxActions.ts`**: Mailbox analytics with mock calculations
2. **`lib/actions/campaignActions.ts`**: Campaign analytics with different mock calculations
3. **`lib/actions/templateActions.ts`**: Template performance rates stored as strings
4. **`lib/actions/dashboardActions.ts`**: Dashboard KPIs with different rate formats
5. **`lib/actions/domainsActions.ts`**: Domain warmup rates stored as strings

**Issues**:

- Each file implements analytics differently
- No shared calculation utilities
- Inconsistent data formats returned
- Different mock data generation methods

**Resolution**: Consolidate all analytics logic into domain-specific services with shared utilities.

### 3.2 Template Analytics Conflicts

**Conflict**: Template analytics stored as strings in database but used as numbers in calculations.

**Current Implementation**:

```typescript
// Database stores as string
openRate: string | null;
replyRate: string | null;

// But used in calculations as numbers
openRate: mockTemplate.openRate || ""; // ❌ Empty string fallback
```

**Resolution**: Store template analytics as numbers (decimals) and calculate rates on-demand.

## 4. UI Component Data Conflicts

### 4.1 Chart Data Inconsistencies

**Conflict**: Chart components expect different data structures than what's provided.

**Issues**:

1. Some charts expect `opens`, others expect `opened`
2. Rate formatting inconsistent (string vs number vs percentage)
3. Missing fields in some data structures

**Resolution**: Standardize all chart data to use the new `TimeSeriesDataPoint` interface.

### 4.2 Analytics Context State Conflicts

**Conflict**: `AnalyticsContextState` mixes UI state with data fetching and has inconsistent types.

**Issues**:

1. Rates stored as `number | string` (ambiguous)
2. Context handles data fetching (should be in services)
3. Inconsistent field names across different parts of state

**Resolution**: Simplify context to only handle UI state, move data fetching to services.

## 5. Standardized Data Model Resolution

Based on the business decisions, here's the standardized data model that resolves all conflicts:

### 5.1 Core Performance Metrics

```typescript
/**
 * Standardized performance metrics for raw counts.
 * Rates will be calculated on-demand based on these counts.
 */
interface PerformanceMetrics {
  sent: number;
  delivered: number;
  opened_tracked: number; // Explicitly named for tracking pixel opens
  clicked_tracked: number; // Explicitly named for tracked clicks
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}

/**
 * Calculated rates (computed on-demand, not stored)
 */
interface CalculatedRates {
  deliveryRate: number; // delivered / sent
  openRate: number; // opened_tracked / delivered
  clickRate: number; // clicked_tracked / delivered
  replyRate: number; // replied / delivered
  bounceRate: number; // bounced / sent
  unsubscribeRate: number; // unsubscribed / delivered
  spamRate: number; // spamComplaints / delivered
}
```

### 5.2 Domain-Specific Analytics Interfaces

```typescript
interface CampaignAnalytics extends PerformanceMetrics {
  campaignId: string;
  campaignName: string;
  status: CampaignStatus;
  leadCount: number;
  activeLeads: number;
  completedLeads: number;
}

interface MailboxAnalytics extends PerformanceMetrics {
  mailboxId: string;
  email: string;
  domain: string;
  provider: string;
  warmupStatus: WarmupStatus;
  warmupProgress: number; // 0-100
  dailyLimit: number; // From subscription plan, not stored in analytics
  currentVolume: number;
  healthScore: number; // Calculated from reputation factors
}

interface DomainAnalytics {
  domainId: string;
  domainName: string;
  // No stored reputation - calculated from mailbox data
  authentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
  // Aggregated metrics from all mailboxes in domain
  aggregatedMetrics: PerformanceMetrics;
}
```

## 6. Migration Strategy

### 6.1 Type Definition Updates

1. **Update `types/analytics.ts`**:
   - Replace all conflicting interfaces with standardized ones
   - Remove rate fields from base interfaces
   - Add explicit `_tracked` suffixes where needed

2. **Update Mock Data**:
   - Standardize all mock data to use new field names
   - Remove rate calculations from mock data
   - Ensure consistent data types (numbers only, no strings)

3. **Update Server Actions**:
   - Remove analytics calculations from non-analytics actions
   - Consolidate into domain-specific analytics services
   - Use shared calculation utilities

### 6.2 Calculation Standardization

1. **Create Shared Utilities**:

   ```typescript
   class KPICalculator {
     static calculateOpenRate(opened: number, delivered: number): number {
       return delivered > 0 ? opened / delivered : 0;
     }

     static calculateClickRate(clicked: number, delivered: number): number {
       return delivered > 0 ? clicked / delivered : 0;
     }

     // ... other standardized calculations
   }
   ```

2. **Remove Stored Rates**:
   - Remove rate fields from database schemas
   - Remove rate fields from type definitions
   - Calculate rates on-demand in services

### 6.3 Component Updates

1. **Update Chart Components**:
   - Use standardized field names
   - Format rates consistently (as percentages for display)
   - Handle null/undefined values consistently

2. **Update Analytics Context**:
   - Remove data fetching logic
   - Keep only UI state management
   - Use services for data operations

## 7. Validation Checklist

- [ ] All analytics types use consistent field names
- [ ] All rates calculated as decimals (0.0-1.0)
- [ ] No rates stored in database or types
- [ ] Mock data matches type definitions
- [ ] Server actions use shared calculation utilities
- [ ] UI components format data consistently
- [ ] Analytics context only manages UI state
- [ ] Domain reputation calculated from mailbox data
- [ ] Template analytics use numbers, not strings
- [ ] Time series data uses explicit field names

## 8. Breaking Changes Summary

1. **Field Name Changes**:
   - `opens` → `opened_tracked`
   - `clicks` → `clicked_tracked`
   - `bounces` → `bounced`

2. **Type Changes**:
   - All rates removed from stored types
   - All rates calculated as decimals
   - Nullable fields made required with defaults

3. **API Changes**:
   - Analytics services return raw counts only
   - Rates calculated in UI layer or service layer
   - Consistent error handling across all services

This resolution ensures a single source of truth for all analytics definitions and eliminates the conflicts identified in the audit.
