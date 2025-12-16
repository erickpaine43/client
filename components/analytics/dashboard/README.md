# Analytics Dashboard Components

## ✅ Recommended: DomainAnalyticsDashboard

**Location:** `@/components/analytics/components/DomainAnalyticsDashboard`

**Status:** Fully migrated to NileDB ✅

**Features:**
- Uses `useDomainHealthMonitoring` hook (migrated)
- Displays domain health scores
- Shows authentication status (SPF, DKIM, DMARC)
- Performance metrics with calculated rates
- Real-time updates via auto-refresh

**Usage:**
```tsx
import { DomainAnalyticsDashboard } from '@/components/analytics/components/DomainAnalyticsDashboard';

export default function AnalyticsPage() {
  return <DomainAnalyticsDashboard domainIds={['domain-1', 'domain-2']} />;
}
```

---

## ⚠️ Deprecated: AnalyticsDashboardMigrated

**Location:** `@/components/analytics/dashboard/AnalyticsDashboardMigrated`

**Status:** Partially migrated - Has type errors

**Issues:**
- Child components expect `CampaignAnalytics` but receive `DomainAnalytics`
- Missing hooks: `useMailboxes`, `useCampaignAnalytics`
- Type mismatches in props

**Do not use** - Use `DomainAnalyticsDashboard` instead.

---

## Migration Summary

All analytics functionality has been migrated from Convex to NileDB:
- ✅ Hooks migrated: `useDomainAnalytics`, `useDomainHealthMonitoring`, `useCrossDomainAnalytics`
- ✅ API routes created: `/api/analytics/domains`, `/api/analytics/cross-domain`
- ✅ Database schema created with seed data
- ✅ Utility created: `AnalyticsCalculator`
