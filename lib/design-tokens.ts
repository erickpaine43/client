/**
 * Design Tokens - PenguinMails Design System
 * 
 * These tokens are EXTRACTED from existing components in the codebase.
 * They document and standardize patterns already in use.
 * 
 * DO NOT modify these values without reviewing the visual impact across:
 * - Dashboard components
 * - Admin components
 * - Auth components
 * - Landing pages
 * 
 * @module design-tokens
 */

// ============================================================================
// COLOR TOKENS - Icon Patterns
// ============================================================================

/**
 * Icon container styles (background + layout)
 * 
 * Pattern: bg-{color}-100 dark:bg-{color}-900/30 + rounded-lg
 * Extracted from: components/dashboard/actions/QuickActions.tsx
 * 
 * Usage:
 * ```tsx
 * <div className={iconContainerStyles.blue}>
 *   <Icon className={iconTextColors.blue} />
 * </div>
 * ```
 */
export const iconContainerStyles = {
  blue: "w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center",
  green: "w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center",
  purple: "w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center",
  orange: "w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center",
  red: "w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center",
} as const;

/**
 * Icon text colors (for lucide icons inside colored containers)
 * 
 * Pattern: text-{color}-600 dark:text-{color}-400 + w-4 h-4
 * Extracted from: components/dashboard/actions/QuickActions.tsx
 * 
 * Usage:
 * ```tsx
 * <Plus className={iconTextColors.blue} />
 * ```
 */
export const iconTextColors = {
  blue: "w-4 h-4 text-blue-600 dark:text-blue-400",
  green: "w-4 h-4 text-green-600 dark:text-green-400",
  purple: "w-4 h-4 text-purple-600 dark:text-purple-400",
  orange: "w-4 h-4 text-orange-600 dark:text-orange-400",
  red: "w-4 h-4 text-red-600 dark:text-red-400",
} as const;

/**
 * Standalone icon colors (no background container)
 * 
 * Pattern: text-{color}-500
 * Extracted from: components/dashboard/lists/UpcomingTasksList.tsx
 * 
 * Usage:
 * ```tsx
 * <Calendar size={16} className={standaloneIconColors.blue} />
 * ```
 */
export const standaloneIconColors = {
  blue: "text-blue-500",
  green: "text-green-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
  gray: "text-gray-500",
} as const;

// ============================================================================
// COLOR TOKENS - Status & State
// ============================================================================

/**
 * Status text colors with dark mode support
 * 
 * Pattern: text-{color}-600 dark:text-{color}-400
 * Extracted from: components/dashboard/summaries/WarmupSummary.tsx
 * 
 * Usage:
 * ```tsx
 * <span className={statusColors.success}>{value}</span>
 * ```
 */
export const statusColors = {
  success: "text-green-600 dark:text-green-400",
  warning: "text-orange-600 dark:text-orange-400",
  alert: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
} as const;

/**
 * Status badge styles (background + text)
 * 
 * Pattern: bg-{color}-100 dark:bg-{color}-900/30 text-{color}-600 dark:text-{color}-400
 * Extracted from: components/dashboard/cards/MigratedKpiCards.tsx
 * 
 * Usage:
 * ```tsx
 * <Badge className={statusBadgeStyles.success}>Active</Badge>
 * ```
 */
export const statusBadgeStyles = {
  success: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  error: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
} as const;

// ============================================================================
// COLOR TOKENS - Semantic Text
// ============================================================================

/**
 * Semantic text colors
 * 
 * These replace hardcoded gray values for better theme support.
 * Use these instead of text-gray-* for consistency across light/dark modes.
 * 
 * Replaces:
 * - text-gray-800 → textColors.primary
 * - text-gray-900 dark:text-gray-100 → textColors.primary
 * - text-gray-500 → textColors.secondary
 * - text-gray-500 dark:text-gray-400 → textColors.secondary
 */
export const textColors = {
  /** Primary text color (replaces text-gray-800, text-gray-900) */
  primary: "text-foreground",
  
  /** Secondary/muted text (replaces text-gray-500, text-gray-600) */
  secondary: "text-muted-foreground",
  
  /** Link hover state */
  linkHover: "hover:text-blue-500",
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

/**
 * Typography styles for common text patterns
 * 
 * Extracted from various components to ensure consistency
 */
export const typography = {
  // Headings
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-bold",
  h3: "text-xl font-semibold",
  h4: "text-lg font-semibold",
  
  // Body text
  bodyLarge: "text-base",
  bodyDefault: "text-sm",
  bodySmall: "text-xs",
  
  // Special text styles
  cardTitle: "text-lg font-semibold text-foreground",
  cardSubtitle: "text-sm text-muted-foreground",
  metricValue: "text-2xl font-bold",
  metricLabel: "text-sm font-medium text-muted-foreground",
  
  // Labels
  label: "text-sm font-medium leading-none",
  labelMuted: "text-sm text-muted-foreground",
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * Spacing tokens for consistent gaps and padding
 * 
 * Extracted from grid and layout patterns across Dashboard
 */
export const spacing = {
  // Gaps (between elements)
  gapXs: "gap-2",
  gapSm: "gap-3",
  gapMd: "gap-4",
  gapLg: "gap-6",
  gapXl: "gap-8",
  
  // Vertical spacing (space-y)
  stackXs: "space-y-2",
  stackSm: "space-y-3",
  stackMd: "space-y-4",
  stackLg: "space-y-6",
  stackXl: "space-y-8",
  
  // Horizontal spacing (space-x)
  inlineXs: "space-x-2",
  inlineSm: "space-x-3",
  inlineMd: "space-x-4",
  inlineLg: "space-x-6",
  
  // Padding
  paddingXs: "p-2",
  paddingSm: "p-3",
  paddingMd: "p-4",
  paddingLg: "p-6",
  paddingXl: "p-8",
  
  // Common component spacing
  cardGap: "gap-6",
  sectionGap: "space-y-6",
  componentGap: "space-y-3",
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

/**
 * Shadow tokens for elevation
 * 
 * Using Tailwind's default shadow scale
 */
export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  default: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

/**
 * Border radius tokens
 * 
 * Extracted from existing component patterns
 */
export const borderRadius = {
  none: "rounded-none",
  sm: "rounded-sm",
  default: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

// ============================================================================
// COMPONENT PATTERN TOKENS
// ============================================================================

/**
 * Common component patterns extracted from existing code
 */
export const componentPatterns = {
  /**
   * Action button style
   * From: components/dashboard/actions/QuickActions.tsx
   */
  actionButton: "w-full justify-start h-fit gap-3 p-3 text-left hover:bg-accent rounded-lg",
  
  /**
   * Card base
   */
  card: "bg-card rounded-xl shadow-sm border border-border",
  
  /**
   * Card with hover effect
   */
  cardInteractive: "bg-card rounded-xl shadow-sm border border-border transition-all duration-200 hover:shadow-md",
} as const;

// ============================================================================
// GRID & LAYOUT TOKENS
// ============================================================================

/**
 * Responsive grid patterns
 * 
 * Common grid layouts extracted from Dashboard
 */
export const gridLayouts = {
  /**
   * Stats/KPI cards grid
   * Pattern: 1 col mobile → 2-3 cols tablet → 4 cols desktop
   */
  statsGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  
  /**
   * Main dashboard grid
   * Pattern: Full width mobile → 2/3 + 1/3 desktop
   */
  dashboardGrid: "grid grid-cols-1 lg:grid-cols-3 gap-6",
  
  /**
   * Two column layout
   */
  twoColumn: "grid grid-cols-1 md:grid-cols-2 gap-6",
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All design tokens grouped by category
 */
export const designTokens = {
  // Colors
  iconContainerStyles,
  iconTextColors,
  standaloneIconColors,
  statusColors,
  statusBadgeStyles,
  textColors,
  
  // Typography
  typography,
  
  // Spacing
  spacing,
  
  // Shadows
  shadows,
  
  // Border Radius
  borderRadius,
  
  // Component Patterns
  componentPatterns,
  
  // Grids
  gridLayouts,
} as const;

export default designTokens;
