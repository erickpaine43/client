# Legacy Actions Deprecation Plan

This directory contains legacy action files that are being phased out in favor of the new modular structure. These files are marked as deprecated and will be removed in a future version.

## Deprecation Timeline

- **Phase 1 (Current)**: Legacy files moved to this directory with deprecation warnings
- **Phase 2 (Next Release)**: Legacy files marked for removal with console warnings
- **Phase 3 (Future Release)**: Legacy files completely removed

## Migration Status

### ✅ Migrated to Modular Structure

These actions have been successfully migrated to the new modular structure:

- `billingActions.ts` → `lib/actions/billing/`
- `teamActions.ts` → `lib/actions/team/`
- `settingsActions.ts` → `lib/actions/settings/`
- `notificationActions.ts` → `lib/actions/notifications/`
- `templateActions.ts` → `lib/actions/templates/`
- Analytics actions → `lib/actions/analytics/`

### 🔄 Pending Migration

These actions still need to be migrated to the modular structure:

- `campaignActions.ts` → `lib/actions/campaigns/` (planned)
- `domainsActions.ts` → `lib/actions/domains/` (planned)
- `inboxActions.ts` → `lib/actions/inbox/` (planned)
- `leadsActions.ts` → `lib/actions/leads/` (planned)
- `mailboxActions.ts` → `lib/actions/mailboxes/` (planned)
- `clientActions.ts` → `lib/actions/clients/` (planned)
- `dashboardActions.ts` → `lib/actions/dashboard/` (planned)
- `profileActions.ts` → `lib/actions/profile/` (planned)
- `warmupActions.ts` → `lib/actions/warmup/` (planned)

### 📋 Legacy Analytics Files

These analytics files are deprecated in favor of the new standardized analytics module:

- `billing.analytics.actions.ts` → `lib/actions/analytics/billing-analytics.ts` ✅
- `campaign.analytics.actions.ts` → `lib/actions/analytics/campaign-analytics.ts` ✅
- `cross-domain.analytics.actions.ts` → `lib/actions/analytics/cross-domain-analytics.ts` ✅
- `domain.analytics.actions.ts` → `lib/actions/analytics/domain-analytics.ts` ✅
- `lead.analytics.actions.ts` → `lib/actions/analytics/lead-analytics.ts` ✅
- `mailbox.analytics.actions.ts` → `lib/actions/analytics/mailbox-analytics.ts` ✅
- `template.analytics.actions.ts` → `lib/actions/analytics/template-analytics.ts` ✅
- `optimized.analytics.actions.ts` → `lib/actions/analytics/index.ts` ✅

## Migration Guide

### For Developers

When updating imports, use the new modular structure:

```typescript
// ❌ Old (deprecated)
import { createBillingSubscription } from "@/lib/actions/billing";
import { getBillingAnalytics } from "@/lib/actions/analytics/billing-analytics";

// ✅ New (recommended)
import { createBillingSubscription } from "@/lib/actions/billing";
import { getBillingAnalytics } from "@/lib/actions/analytics/billing-analytics";
```

### For UI Components

Update your imports to use the new modular structure:

```typescript
// ❌ Old (deprecated)
import { getTeamMembers } from "@/lib/actions/team";

// ✅ New (recommended)
import { getTeamMembers } from "@/lib/actions/team/members";
```

## Backward Compatibility

All legacy files in this directory maintain backward compatibility through re-exports:

```typescript
// Legacy file structure maintained for compatibility
export * from "../billing";
export * from "../team";
// ... etc
```

## Deprecation Warnings

Legacy files include deprecation warnings that will be logged to the console:

```typescript
console.warn(
  "DEPRECATED: This action file is deprecated. " +
    "Please use the new modular structure at lib/actions/[module]/"
);
```

## Benefits of New Structure

The new modular structure provides:

- **Better Organization**: Related functions grouped together
- **Improved Maintainability**: Smaller, focused files
- **Enhanced Type Safety**: Consistent typing across modules
- **Better Testing**: Isolated test suites per module
- **Clearer Dependencies**: Explicit imports and exports
- **Standardized Patterns**: Consistent error handling and validation

## Support

For questions about migration or the new structure, see:

- [Core Module Documentation](../core/README.md)
- [Analytics Module Documentation](../analytics/README.md)
- [Migration Examples](../core/example-usage.ts)
