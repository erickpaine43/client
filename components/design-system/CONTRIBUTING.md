# Contributing to the Design System

Welcome to the PenguinMails Design System! This guide will help you understand how to use and contribute to our design system effectively.

---

## 🎯 Philosophy

Our design system follows these core principles:

1. **Extract, Don't Invent** - We document existing patterns, not create new ones
2. **Tailwind-First** - Design tokens are Tailwind class constants, not CSS abstractions
3. **Component Reuse** - Use existing unified components before creating new ones
4. **Consistency** - Maintain visual consistency across all modules
5. **Accessibility** - WCAG AA compliance is mandatory

---

## 🚀 Quick Start

### Using Design Tokens

**Always use design tokens instead of hardcoding Tailwind classes:**

```tsx
// ❌ Bad - Hardcoded colors
<div className="text-blue-600 dark:text-blue-400">
  <Plus className="w-4 h-4" />
</div>;

// ✅ Good - Design tokens
import { iconTextColors } from "@/lib/design-tokens";

<div className={iconTextColors.blue}>
  <Plus className="w-4 h-4" />
</div>;
```

### Using Unified Components

**Prefer unified components over custom implementations:**

```tsx
// ❌ Bad - Custom stats card
<Card>
  <CardHeader>
    <h3>Total Campaigns</h3>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold">42</p>
  </CardContent>
</Card>;

// ✅ Good - UnifiedStatsCard
import { UnifiedStatsCard } from "@/components/design-system/components";

<UnifiedStatsCard
  title="Total Campaigns"
  value="42"
  icon={Send}
  color="primary"
/>;
```

---

## 📚 Design Token Categories

### 1. Icon Styles

```tsx
import { iconContainerStyles, iconTextColors } from "@/lib/design-tokens";

// Icon with background container
<div className={iconContainerStyles.blue}>
  <Plus className={iconTextColors.blue} />
</div>;

// Standalone icon (no background)
import { standaloneIconColors } from "@/lib/design-tokens";

<Calendar className={standaloneIconColors.blue} />;
```

**Available colors**: `blue`, `green`, `purple`, `orange`, `gray`

### 2. Status Colors

```tsx
import { statusColors, statusBadgeStyles } from "@/lib/design-tokens";

// Status text
<span className={cn("font-medium", statusColors.success)}>
  Active
</span>

// Status badge
<Badge className={statusBadgeStyles.warning}>
  Pending
</Badge>
```

**Available statuses**: `success`, `warning`, `error`, `info`, `alert`

### 3. Text Colors

```tsx
import { textColors } from "@/lib/design-tokens";

// Primary text (replaces text-foreground)
<h1 className={cn("text-2xl font-bold", textColors.primary)}>
  Dashboard
</h1>

// Secondary text (replaces text-muted-foreground)
<p className={textColors.secondary}>
  Welcome back!
</p>

// Link hover
<Link className={textColors.linkHover}>
  View Details
</Link>
```

### 4. Typography

```tsx
import { typography } from "@/lib/design-tokens";

<h1 className={typography.h1}>Main Heading</h1>
<h2 className={typography.h2}>Sub Heading</h2>
<p className={typography.bodyDefault}>Body text</p>
<label className={typography.label}>Form Label</label>
```

### 5. Spacing

```tsx
import { spacing } from "@/lib/design-tokens";

// Vertical stacks
<div className={spacing.stackLg}>
  <Component1 />
  <Component2 />
</div>

// Horizontal gaps
<div className={spacing.gapMd}>
  <Button>Save</Button>
  <Button>Cancel</Button>
</div>
```

### 6. Grid Layouts

```tsx
import { gridLayouts } from "@/lib/design-tokens";

// Stats grid (responsive 1-2-4 columns)
<div className={gridLayouts.statsGrid}>
  {stats.map(stat => <UnifiedStatsCard {...stat} />)}
</div>

// Dashboard grid (2/3 main + 1/3 sidebar)
<div className={gridLayouts.dashboardGrid}>
  <main className="lg:col-span-2">{/* Main content */}</main>
  <aside>{/* Sidebar */}</aside>
</div>
```

---

## 🧩 Component Guidelines

### When to Use Unified Components

Use unified components when:

- ✅ Displaying statistics/metrics → `UnifiedStatsCard`
- ✅ Showing tabular data → `UnifiedDataTable`
- ✅ Creating forms → `UnifiedFormField`
- ✅ Page layouts → `DashboardLayout`, `PageHeader`
- ✅ Empty states → `EmptyState`

### When to Create Custom Components

Create custom components only when:

- ⚠️ No existing component fits your use case
- ⚠️ The component is highly domain-specific
- ⚠️ Reusing would require excessive configuration

**Before creating**, check:

1. Can an existing component be extended?
2. Can you combine multiple unified components?
3. Is this pattern used elsewhere? (Consider adding to design system)

---

## ✅ Code Review Checklist

### Design Tokens

- [ ] No hardcoded Tailwind color classes (`text-blue-600`, etc.)
- [ ] All colors use semantic tokens (`statusColors.success`, etc.)
- [ ] Text colors use `textColors.primary/secondary`
- [ ] Icons use appropriate token category (container vs standalone)
- [ ] Grid layouts use `gridLayouts` tokens where applicable

### Components

- [ ] Unified components used where appropriate
- [ ] No duplicate component implementations
- [ ] Props are TypeScript typed
- [ ] Component follows existing patterns

### Accessibility

- [ ] All interactive elements have accessible labels
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Keyboard navigation works
- [ ] Screen reader tested (basic)
- [ ] Focus states visible

### Responsive Design

- [ ] Mobile tested (320px - 768px)
- [ ] Tablet tested (768px - 1024px)
- [ ] Desktop tested (1024px+)
- [ ] No horizontal scroll on mobile
- [ ] Touch targets ≥ 44x44px

### Dark Mode

- [ ] Component works in dark mode
- [ ] Design tokens handle dark mode automatically
- [ ] No hardcoded light/dark variants

---

## 🎨 Design Token Best Practices

### DO ✅

```tsx
// Use semantic tokens
import { statusColors, textColors } from "@/lib/design-tokens";

<span className={statusColors.success}>Active</span>
<p className={textColors.secondary}>Description</p>

// Combine with cn() for multiple classes
import { cn } from "@/lib/utils";

<h1 className={cn("text-2xl font-bold", textColors.primary)}>
  Title
</h1>

// Use appropriate token category
// Icon with background → iconContainerStyles
// Icon standalone → standaloneIconColors
// Status indicator → statusColors
// Regular text → textColors
```

### DON'T ❌

```tsx
// ❌ Don't hardcode colors
<span className="text-green-600 dark:text-green-400">Active</span>

// ❌ Don't mix hardcoded with tokens
<span className="font-bold text-blue-500">  // Wrong!

// ❌ Don't create inline dark mode variants
<p className="text-gray-900 dark:text-gray-100">  // Use textColors.primary

// ❌ Don't use wrong token category
<Mail className={iconContainerStyles.blue} />  // Should use standaloneIconColors
```

---

## 🔄 Migration Guide

### Step 1: Identify Hardcoded Patterns

Search for common patterns:

```bash
# Find hardcoded colors
grep -r "text-blue-" components/
grep -r "bg-green-" components/
grep -r "text-gray-800" components/

# Find inline dark mode
grep -r "dark:text-" components/
```

### Step 2: Map to Tokens

| Hardcoded Pattern                        | Token Replacement                                  |
| ---------------------------------------- | -------------------------------------------------- |
| `text-gray-800`, `text-gray-900`         | `textColors.primary`                               |
| `text-gray-500`, `text-gray-600`         | `textColors.secondary`                             |
| `text-blue-600 dark:text-blue-400`       | `standaloneIconColors.blue`                        |
| `bg-blue-100 dark:bg-blue-900/30` + icon | `iconContainerStyles.blue` + `iconTextColors.blue` |
| `text-green-600 dark:text-green-400`     | `statusColors.success`                             |
| `text-orange-600`                        | `statusColors.warning`                             |

### Step 3: Import and Apply

```tsx
// Add imports
import { statusColors, textColors } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// Replace classes
- <h1 className="text-2xl font-bold text-foreground">
+ <h1 className={cn("text-2xl font-bold", textColors.primary)}>

- <span className="text-green-600 dark:text-green-400">
+ <span className={statusColors.success}>
```

### Step 4: Verify

- Visual comparison (before/after screenshots)
- Dark mode toggle test
- Responsive breakpoint test

---

## 🐛 Common Issues & Solutions

### Issue: Token not applying dark mode

**Problem**:

```tsx
<span className={statusColors.success}>  // Not working
```

**Solution**: Tokens already include dark mode, ensure parent has `dark` class:

```tsx
// In root layout
<html className={isDark ? 'dark' : ''}>
```

### Issue: Multiple classes conflict

**Problem**:

```tsx
<div className="text-blue-500" className={textColors.secondary}>
```

**Solution**: Use `cn()` to merge:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("font-medium", textColors.secondary)}>
```

### Issue: Icon color not showing

**Problem**:

```tsx
<Calendar className={iconContainerStyles.blue} /> // Wrong token
```

**Solution**: Use correct token category:

```tsx
<Calendar className={standaloneIconColors.blue} /> // Correct
```

---

## 📖 Additional Resources

- [Design Tokens Documentation](../lib/design-tokens.ts)
- [Visual Token Reference](./docs/DESIGN_TOKENS_VISUAL_REFERENCE.md)
- [Component Migration Guide](./docs/COMPONENT_MIGRATION_GUIDE.md)
- [Dashboard Migration Example](./docs/dashboard_migration_walkthrough.md) _(Note: File not found)_

---

## 🤝 Getting Help

1. **Check Documentation** - Read the guides above
2. **Search Examples** - Look at migrated Dashboard components
3. **Ask the Team** - Reach out in #design-system channel
4. **Review PRs** - See how others use the system

---

## 📝 Pull Request Template

When submitting PRs that use the design system:

```markdown
## Design System Checklist

- [ ] All design tokens used (no hardcoded colors)
- [ ] Unified components used where applicable
- [ ] Dark mode verified
- [ ] Responsive tested (mobile, tablet, desktop)
- [ ] Accessibility checked (contrast, keyboard, labels)
- [ ] No visual regressions

## Token Usage

List tokens used:

- `statusColors.success` - for active status indicators
- `textColors.primary` - for headings
- `gridLayouts.statsGrid` - for stats layout

## Screenshots

[Before/After if applicable]
```

---

## 🎯 Success Criteria

Your contribution is ready when:

✅ No hardcoded Tailwind color classes  
✅ Design tokens used consistently  
✅ Unified components preferred over custom  
✅ Dark mode works properly  
✅ Responsive across all breakpoints  
✅ Accessible to keyboard and screen readers  
✅ Code reviewed and approved  
✅ Visual testing passed

---

**Thank you for contributing to PenguinMails Design System!** 🎉
