# Design System Components

This design system provides unified, consolidated components that use existing UI primitives from `components/ui/` and follow Tailwind-first design principles.

## 🎯 Philosophy

**Use existing components only.** No new components are created - instead, we consolidate duplicate implementations into unified wrappers that leverage the perfect UI components already available.

## 📦 Available Components

### UnifiedStatsCard

Consolidates all StatsCard variants (StatsCard, MigratedStatsCard, KpiCard, etc.) into a single, flexible component.

```tsx
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";
import { Send, Eye, TrendingUp } from "lucide-react";

// Basic usage
<UnifiedStatsCard
  title="Total Campaigns"
  value="42"
  icon={Send}
  color="primary"
/>

// With trends and benchmarks
<UnifiedStatsCard
  title="Open Rate"
  value="24.5%"
  icon={Eye}
  color="success"
  trend="up"
  change="+2.1% from last month"
  benchmark={true}
  target={0.25}
  rawValue={0.245}
/>

// Different sizes and variants
<UnifiedStatsCard
  size="lg"
  color="success"
  variant="highlighted"
  title="Health Score"
  value="85/100"
  icon={TrendingUp}
/>
```

**Props:**

- `title`: Card title
- `value`: Display value
- `icon`: Lucide icon component
- `color`: "primary" | "secondary" | "success" | "warning" | "error" | "info"
- `size`: "sm" | "default" | "lg"
- `variant`: "default" | "highlighted" | "muted"
- `trend`: "up" | "down" | "stable"
- `change`: Change description
- `benchmark`: Show target/benchmark status
- `target`: Target value for benchmark
- `rawValue`: Raw numeric value for calculations

### UnifiedDataTable

Consolidates all data table implementations into a single component with search, filtering, and pagination.

```tsx
import { UnifiedDataTable } from "@/components/design-system/components/unified-data-table";

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("status") === "active" ? "default" : "secondary"}
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
];

<UnifiedDataTable
  columns={columns}
  data={campaigns}
  title="Campaigns"
  searchable={true}
  filterable={true}
  paginated={true}
  onRowSelect={(rows) => console.log("Selected:", rows)}
  renderActions={(row) => (
    <Button variant="ghost" size="sm">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  )}
/>;
```

**Props:**

- `columns`: TanStack table column definitions
- `data`: Array of data objects
- `title`: Optional table title
- `searchable`: Enable global search
- `filterable`: Enable column visibility controls
- `paginated`: Enable pagination
- `loading`: Show loading skeleton
- `emptyMessage`: Custom empty state message
- `onRowSelect`: Callback for row selection
- `renderActions`: Function to render row actions

### UnifiedFormField

Consolidates all form field implementations (text inputs, select dropdowns, and checkboxes) into a single component with consistent styling and error handling.

```tsx
import { TextFormField, SelectFormField, CheckboxFormField } from "@/components/design-system/components/unified-form-field";

// Text input field
<TextFormField
  name="email"
  control={form.control}
  label="Email Address"
  placeholder="john.doe@example.com"
  inputType="email"
  description="We'll use this for account verification"
  required
/>

// Select dropdown field
const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Administrator" },
  { value: "moderator", label: "Moderator" }
];

<SelectFormField
  name="role"
  control={form.control}
  label="User Role"
  placeholder="Choose a role"
  options={roleOptions}
  description="Select your role in the system"
  required
/>

// Checkbox field
<CheckboxFormField
  name="agreeToTerms"
  control={form.control}
  label="I agree to the terms and conditions"
  description="You must agree to our terms before proceeding"
  required
/>
```

**Props:**

- `name`: Field name for form registration
- `control`: React Hook Form control object
- `label`: Field label text
- `description`: Helper text displayed below field
- `placeholder`: Placeholder text
- `disabled`: Disable the field (default: `false`)
- `required`: Mark field as required (default: `false`)
- `className`: Additional CSS classes

**Type-specific props:**

- `TextFormField`: `inputType`, `onValueChange`
- `SelectFormField`: `options`, `onValueChange`
- `CheckboxFormField`: `onCheckedChange`

### DashboardLayout

Provides consistent dashboard layout structure using existing Sidebar component.

```tsx
import { DashboardLayout } from "@/components/design-system/components/dashboard-layout";

<DashboardLayout
  title="Campaign Analytics"
  description="Monitor your campaign performance"
  breadcrumbs={[
    { label: "Campaigns", href: "/dashboard/campaigns" },
    { label: "Analytics" }
  ]}
  actions={
    <Button>
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  }
  showBackButton={true}
  backHref="/dashboard/campaigns"
>
  <UnifiedStatsCard ... />
  <UnifiedDataTable ... />
</DashboardLayout>
```

**Props:**

- `title`: Page title
- `description`: Page description
- `breadcrumbs`: Breadcrumb navigation array
- `actions`: Action buttons/component
- `showBackButton`: Show back navigation
- `backHref`: Back button destination

### PageHeader

Standardized page header that can be used independently without full DashboardLayout.

```tsx
import { PageHeader } from "@/components/design-system/components/page-header";
import { Download } from "lucide-react";

<PageHeader
  title="Settings"
  description="Manage your account settings and preferences"
  breadcrumbs={[
    { label: "Settings" }
  ]}
  actions={
    <Button variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export Settings
    </Button>
  }
/>
```

**Props:**

- `title`: Page title
- `description`: Optional page description
- `breadcrumbs`: Breadcrumb items array
- `actions`: Optional action buttons
- `showBackButton`: Show back button
- `backHref`: Back button URL

### EmptyState

Friendly empty state placeholder for when there's no data to display.

```tsx
import { EmptyState } from "@/components/design-system/components/empty-state";
import { Inbox, Folder, Users } from "lucide-react";

// Simple empty state
<EmptyState
  icon={Inbox}
  title="No messages yet"
  description="Your inbox is empty. Start a conversation to see messages here."
/>

// With action button (link)
<EmptyState
  icon={Folder}
  title="No campaigns found"
  description="Get started by creating your first campaign."
  actionLabel="Create Campaign"
  actionHref="/campaigns/create"
/>

// With action button (click handler)
<EmptyState
  icon={Users}
  title="No contacts"
  actionLabel="Import Contacts"
  onAction={() => openImportDialog()}
  size="lg"
/>
```

**Props:**

- `icon`: Lucide icon component
- `title`: Empty state title (required)
- `description`: Optional description text
- `actionLabel`: Optional button label
- `onAction`: Button click handler
- `actionHref`: Button link destination
- `size`: "sm" | "default" | "lg"

## 🔄 Migration Guide

### From Old Components to Unified Components

#### StatsCard Variants → UnifiedStatsCard

```tsx
// Old: Multiple different components
import StatsCard from "@/components/analytics/cards/StatsCard";
import MigratedStatsCard from "@/components/analytics/dashboard/MigratedStatsCard";
import KpiCards from "@/components/dashboard/cards/KpiCards";

// New: Single unified component
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";

// Usage remains similar but with standardized props
<UnifiedStatsCard
  title="Open Rate"
  value="24.5%"
  icon={Eye}
  trend="up"
  change="+2.1% from last month"
  benchmark={true}
  target={0.25}
  rawValue={0.245}
/>;
```

#### DataTable Components → UnifiedDataTable

```tsx
// Old: Custom table implementations
import { CampaignsDataTable } from "@/components/campaigns/tables/CampaignsDataTable";
import { InboxDataTable } from "@/components/inbox/inbox-data-table/data-table";

// New: Single unified component
import { UnifiedDataTable } from "@/components/design-system/components/unified-data-table";

// Configure with TanStack column definitions
<UnifiedDataTable
  columns={columns}
  data={data}
  title="Campaigns"
  searchable={true}
  filterable={true}
/>;
```

#### Layout Components → DashboardLayout

```tsx
// Old: Custom layout implementations
// Various page layouts with repeated sidebar/header patterns

// New: Consistent layout wrapper
import { DashboardLayout } from "@/components/design-system/components/dashboard-layout";

<DashboardLayout
  title="Page Title"
  breadcrumbs={[{ label: "Section" }]}
  actions={<Button>Action</Button>}
>
  {/* Page content */}
</DashboardLayout>;
```

## 🎨 Design Principles

1. **Tailwind First**: All styling uses Tailwind utilities and CSS custom properties
2. **Component Composition**: Build complex UIs by composing existing UI components
3. **No New Styles**: Never create new CSS classes or component-specific styles
4. **TypeScript Strict**: Full type safety with comprehensive prop interfaces
5. **Accessibility**: All components maintain existing accessibility features

## 📚 Component Dependencies

All design system components depend on existing UI components:

- `components/ui/card` - Card, CardHeader, CardContent, CardTitle
- `components/ui/table` - Table, TableHeader, TableBody, TableRow, TableCell, TableHead
- `components/ui/button` - Button variants and sizes
- `components/ui/badge` - Status indicators and badges
- `components/ui/input` - Form inputs
- `components/ui/select` - Select components
- `components/ui/checkbox` - Checkbox component
- `components/ui/form` - Form field components
- `components/ui/breadcrumb` - Navigation breadcrumbs
- `components/layout/DashboardSidebar` - Sidebar navigation

## ✅ Benefits

- **Reduced Duplication**: Single source of truth for common UI patterns
- **Consistency**: Unified behavior and styling across the application
- **Maintainability**: Fewer components to maintain and update
- **Performance**: No additional CSS or component overhead
- **Developer Experience**: Clear APIs and comprehensive TypeScript support
