# Component Migration Guide

This guide provides step-by-step instructions for migrating from legacy components to the unified design system components.

## 📊 StatsCard Migration

### Components Migrated

✅ **Completed**: All StatsCard variants have been successfully migrated to `UnifiedStatsCard`

### Migration Summary

| Legacy Component | New Component | Status |
|------------------|---------------|---------|
| `StatsCard` | `UnifiedStatsCard` | ✅ Migrated |
| `MigratedStatsCard` | `UnifiedStatsCard` | ✅ Migrated |
| `KpiCard` | `UnifiedStatsCard` | ✅ Migrated |
| Various dashboard card components | `UnifiedStatsCard` | ✅ Migrated |

### Migration Examples

#### Before (Legacy StatsCard)

```tsx
import StatsCard from "@/components/analytics/cards/StatsCard";

<StatsCard
  title="Open Rate"
  value="24.5%"
  icon={Eye}
  color="bg-blue-100 text-blue-600"
  className="flex-row-reverse gap-2"
/>
```

#### After (UnifiedStatsCard)

```tsx
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";

<UnifiedStatsCard
  title="Open Rate"
  value="24.5%"
  icon={Eye}
  color="info"
  trend="up"
  change="+2.1% from last month"
  benchmark={true}
  target={0.25}
  rawValue={0.245}
/>
```

### Key Changes

1. **Import Path**: Changed from `@/components/analytics/cards/StatsCard` to `@/components/design-system/components/unified-stats-card`
2. **Color System**: Instead of custom Tailwind classes, use predefined color schemes:
   - `"primary"`, `"secondary"`, `"success"`, `"warning"`, `"error"`, `"info"`
3. **Enhanced Props**: New props available:
   - `trend`: "up" | "down" | "stable"
   - `change`: Change description
   - `changeType`: "increase" | "decrease" | "stable"
   - `benchmark`: Show target/benchmark status
   - `target`: Target value for calculations
   - `rawValue`: Raw numeric value for calculations

### Files Successfully Migrated

- ✅ `components/domains/components/overview-cards.tsx`
- ✅ `components/campaigns/reports/StatsCards.tsx`
- ✅ `components/dashboard/cards/KpiCards.tsx`
- ✅ `components/analytics/summary/analytics-statistics.tsx`
- ✅ `components/campaigns/campaignData/StatsTab.tsx`

---

## 📋 DataTable Migration Strategy

### Migration Status

🔄 **In Progress**: Complex DataTable components require careful migration strategy

### Components Identified

#### Complex Cases (Need Migration Strategy)

1. **CampaignsDataTable**
   - Location: `components/campaigns/tables/CampaignsDataTable.tsx`
   - Features: Manual pagination, server-side routing, custom actions
   - Status: Requires enhanced UnifiedDataTable features

2. **InboxDataTable**
   - Location: `components/inbox/inbox-data-table/data-table.tsx`
   - Features: Custom filtering, email-specific features, faceted filters
   - Status: Requires enhanced UnifiedDataTable features

### Migration Strategy for DataTables

#### Phase 1: Enhance UnifiedDataTable

The current `UnifiedDataTable` needs to be enhanced to support:

1. **Manual Pagination**: Support server-side pagination
2. **Custom Actions**: Enhanced row action system
3. **Faceted Filtering**: Support for complex filter patterns
4. **URL Synchronization**: Sync with router/search params
5. **Custom Empty States**: More flexible empty state rendering

#### Phase 2: Gradual Migration

```tsx
// Example: Future migration of CampaignsDataTable

// Before
export function CampaignsDataTable({ data, page, pageSize, totalCount }) {
  // Complex manual implementation
}

// After - Using enhanced UnifiedDataTable
export function CampaignsDataTable({ data, page, pageSize, totalCount }) {
  const columns = [/* column definitions */];
  
  const renderActions = (row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/campaigns/${row.original.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        {/* More actions */}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <UnifiedDataTable
      columns={columns}
      data={data}
      title="Campaigns"
      searchable={true}
      filterable={true}
      paginated={true}
      manualPagination={{
        page,
        pageSize,
        totalCount,
        onPageChange: (newPage) => {
          // Handle page change
        }
      }}
      renderActions={renderActions}
    />
  );
}
```

#### Phase 3: Remove Legacy Components

After successful migration:

- Remove old DataTable implementations
- Update all imports
- Update type definitions

### Currently Working Cases

The existing `UnifiedDataTable` works well for:

- ✅ Simple data tables
- ✅ Client-side search and filtering
- ✅ Basic pagination
- ✅ Row selection
- ✅ Column visibility toggles

### Files Pending Migration Review

- `components/campaigns/tables/CampaignsDataTable.tsx`
- `components/inbox/inbox-data-table/data-table.tsx`
- Any other DataTable implementations

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### StatsCard Migration Issues

**Issue**: "StatsCard is not defined"
**Solution**: Ensure import path is updated:

```tsx
// ❌ Old import
import StatsCard from "@/components/analytics/cards/StatsCard";

// ✅ New import
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";
```

**Issue**: Color scheme not working
**Solution**: Use predefined color schemes:

```tsx
// ❌ Old color prop
color="bg-blue-100 text-blue-600"

// ✅ New color prop
color="info"
```

#### DataTable Migration Issues

**Issue**: Complex pagination not supported
**Solution**: Current version supports client-side pagination. For server-side pagination, keep existing implementation until enhanced version is ready.

**Issue**: Custom actions not rendering
**Solution**: Use `renderActions` prop:

```tsx
<UnifiedDataTable
  // ... other props
  renderActions={(row) => (
    <Button variant="ghost" size="sm">
      Actions
    </Button>
  )}
/>
```

---

## 📈 Benefits of Migration

### For StatsCard

- ✅ **Consistent Design**: All cards now use the same design tokens
- ✅ **Enhanced Features**: Support for trends, benchmarks, and better accessibility
- ✅ **Maintainability**: Single component to maintain instead of multiple variants
- ✅ **Type Safety**: Better TypeScript support with comprehensive prop types

### For DataTable (Future)

- 🔄 **Standardized Features**: Common table functionality across the app
- 🔄 **Better Performance**: Optimized rendering and state management
- 🔄 **Accessibility**: Consistent accessibility patterns
- 🔄 **Developer Experience**: Clear APIs and better documentation

---

## 🚀 Next Steps

1. **Complete DataTable Enhancement**: Add support for complex features
2. **Create Storybook Documentation**: Interactive component documentation
3. **Test Migration**: Ensure all migrated components work correctly
4. **Remove Legacy Code**: Clean up old component files after successful migration
5. **Update Documentation**: Keep this guide updated with new information

---

## 📞 Support

If you encounter issues during migration:

1. Check this guide for common solutions
2. Review the component source code for prop definitions
3. Test changes in development environment
4. Create an issue if you need additional features or find bugs

---

**Last Updated**: November 18, 2025
**Status**: StatsCard migration completed ✅ | DataTable migration in progress 🔄
