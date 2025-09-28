// ============================================================================
// ANALYTICS TYPES - DEPRECATED - Use ./analytics/index.ts instead
// ============================================================================
// 
// 🚨 MIGRATION COMPLETE - THIS FILE IS NOW FULLY DEPRECATED 🚨
//
// All analytics types have been successfully migrated to the new structured system.
// This file is kept only for reference and will be removed in a future version.
//
// ✅ MIGRATION STATUS: COMPLETE
// - All imports have been updated to use new structured types
// - All components have been migrated to new interfaces
// - All deprecated interfaces are no longer in active use
//
// 📁 NEW TYPE LOCATIONS:
// - Core data types: ./analytics/core.ts
// - Domain-specific types: ./analytics/domain-specific.ts  
// - UI/display types: ./analytics/ui.ts
// - Billing types: ./analytics/billing.ts
//
// 🔧 UTILITIES:
// - Rate calculations: ../lib/utils/analytics-calculator.ts
// - Service layer: ../lib/services/analytics/
//
// 📖 DOCUMENTATION:
// - Migration guide: ./analytics/MIGRATION_GUIDE.md
// - Usage examples: ./analytics/USAGE_EXAMPLES.md
// - Architecture: ./analytics/ARCHITECTURE.md
//
// ⚠️  DO NOT ADD NEW IMPORTS FROM THIS FILE
// ⚠️  USE THE NEW STRUCTURED TYPES INSTEAD
// ============================================================================

// ⚠️ WARNING: This file exports deprecated types for backward compatibility only
// ⚠️ All new code should import directly from ./analytics/ subdirectories
// ⚠️ This file will be removed in a future version

// Import standardized types (for backward compatibility only)
export * from "./analytics/index";

import { TimeSeriesDataPoint } from "./analytics/core";
// Import specific UI types for deprecated interfaces
import type { AnalyticsMetricConfig } from "./analytics/ui";

// ============================================================================
// RECOMMENDED IMPORTS FOR MIGRATION
// ============================================================================
// 
// Instead of importing from this file, use these standardized imports:
//
// For data layer operations:
// import { AnalyticsFilters, PerformanceMetrics } from "@/types/analytics/core";
//
// For UI state management:
// import { AnalyticsUIFilters, DateRangePreset } from "@/types/analytics/ui";
//
// For domain-specific analytics:
// import { CampaignAnalytics, DomainAnalytics } from "@/types/analytics/domain-specific";
//
// For calculations:
// import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
// ============================================================================

// ============================================================================
// DEPRECATED TYPES - Use standardized types from ./analytics instead
// ============================================================================

/**
 * @deprecated Use DataGranularity from ./analytics instead
 */
export type DataGranularity = "day" | "week" | "month";

/**
 * @deprecated Use DateRangePreset from ./analytics instead
 */
export type DateRangePreset = "7d" | "30d" | "90d" | "1y" | "custom";

/**
 * @deprecated Use TimeSeriesDataPoint from ./analytics/core.ts instead
 * 
 * This interface has been REMOVED. Use the standardized TimeSeriesDataPoint from core.ts
 * which uses proper field names and structure.
 * 
 * MIGRATION:
 * ```typescript
 * import { TimeSeriesDataPoint } from "@/types/analytics/core";
 * 
 * // OLD structure with mixed concerns
 * const oldData = { date, label, sent, opens, clicks, replies, bounces };
 * 
 * // NEW standardized structure
 * const newData: TimeSeriesDataPoint = {
 *   date,
 *   label,
 *   metrics: {
 *     sent,
 *     delivered: sent - bounces,
 *     opened_tracked: opens,
 *     clicked_tracked: clicks,
 *     replied: replies,
 *     bounced: bounces,
 *     unsubscribed: 0,
 *     spamComplaints: 0
 *   }
 * };
 * ```
 */
// REMOVED: Use TimeSeriesDataPoint from @/types/analytics/core instead

/**
 * Generic chart data point with flexible properties for different chart types
 */
export interface ChartDataPoint {
  /** Name or label for the data point */
  name: string;
  /** Number of opens (optional for flexibility) */
  opens?: number;
  /** Number of clicks (optional for flexibility) */
  clicks?: number;
  /** Number of replies (optional for flexibility) */
  replies?: number;
  /** Any additional properties */
  [key: string]: unknown;
}

// ============================================================================
// ANALYTICS METRICS TYPES
// ============================================================================

/**
 * @deprecated Use AnalyticsMetricConfig from ./analytics/ui.ts instead
 * 
 * This interface has been REMOVED. Use AnalyticsMetricConfig from ui.ts
 * which includes additional fields like tooltip.
 * 
 * MIGRATION:
 * ```typescript
 * import { AnalyticsMetricConfig } from "@/types/analytics/ui";
 * 
 * // Same structure, just use the new interface name
 * const metric: AnalyticsMetricConfig = {
 *   key: "opens",
 *   label: "Opens",
 *   color: "#3b82f6",
 *   icon: MailOpenIcon,
 *   visible: true,
 *   tooltip: "Number of email opens tracked" // Optional new field
 * };
 * ```
 */
// REMOVED: Use AnalyticsMetricConfig from @/types/analytics/ui instead

/**
 * @deprecated Use FormattedAnalyticsStats from ./analytics instead
 * This interface mixed data types (number | string) which is a UI concern.
 */
export interface AnalyticsStatistics {
  /** @deprecated Use separate raw and formatted values */
  totalSent: number | string;
  /** @deprecated Use separate raw and formatted values */
  openRate: number | string;
  /** @deprecated Use separate raw and formatted values */
  replyRate: number | string;
  /** @deprecated Use separate raw and formatted values */
  clickRate: number | string;
}

/**
 * KPI (Key Performance Indicator) metrics configuration
 */
export interface KPIMetric {
  /** KPI identifier */
  id: string;
  /** Display name */
  name: string;
  /** Current value */
  value: number | string;
  /** Target/benchmark value for comparison */
  target?: number;
  /** Unit for display (%, #, $, etc.) */
  unit?: string;
  /** Trend direction */
  trend?: "up" | "down" | "stable";
  /** Color theme for UI */
  color?: "positive" | "warning" | "danger" | "neutral";
}


// ============================================================================
// CAMPAIGN ANALYTICS TYPES
// ============================================================================

/**
 * @deprecated Use CampaignAnalytics from ./analytics/domain-specific.ts instead
 * 
 * MIGRATION: This interface mixed UI and data concerns with stored rates.
 * Replace with:
 * ```typescript
 * import { CampaignAnalytics } from "@/types/analytics/domain-specific";
 * import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
 * 
 * // Use raw data structure
 * const campaign: CampaignAnalytics = { ... };
 * 
 * // Calculate rates on-demand
 * const rates = AnalyticsCalculator.calculateAllRates(campaign);
 * ```
 */
export interface CampaignPerformanceData {
  /** @deprecated Use campaignName instead */
  name: string;
  /** Number of emails sent */
  sent: number;
  /** @deprecated Use opened_tracked (non-nullable) instead */
  opens: number | null;
  /** @deprecated Use clicked_tracked (non-nullable) instead */
  clicks: number | null;
  /** Number of replies received */
  replies: number;
  /** @deprecated Should be required, use bounced instead */
  bounced?: number;
  /** @deprecated Rates should be calculated on-demand using AnalyticsCalculator.calculateOpenRate() */
  openRate: number;
  /** @deprecated Rates should be calculated on-demand using AnalyticsCalculator.calculateReplyRate() */
  replyRate: number;
}

/**
 * Campaign filter and selection options
 */
export interface CampaignFilter {
  /** Unique campaign identifier */
  id: string;
  /** Display name */
  name: string;
  /** Whether campaign is selected for filtering */
  selected?: boolean;
}

// ============================================================================
// WARMUP ANALYTICS TYPES
// ============================================================================

/**
 * Data point for warmup analytics charts
 */
export interface WarmupChartData {
  /** Date in readable format (e.g., "Aug 11") */
  date: string;
  /** Total number of warmup emails sent */
  totalWarmups: number;
  /** Number of emails marked as spam */
  spamFlags: number;
  /** Number of replies received */
  replies: number;
}

/**
 * Configuration for warmup analytics metrics
 */
export interface WarmupMetric {
  /** Unique key identifier for the metric */
  key: "totalWarmups" | "spamFlags" | "replies";
  /** Display label for the metric */
  label: string;
  /** Hex color code for chart representation */
  color: string;
  /** Icon component for the metric */
  icon: React.ComponentType<{ className?: string }>;
  /** Whether this metric is currently visible */
  visible: boolean;
  /** Tooltip description for the metric */
  tooltip: string;
}

/**
 * Daily warmup statistics for a specific mailbox
 */
export interface DailyWarmupStats {
  /** Date in readable format (e.g., "Aug 11") */
  date: string;
  /** Number of emails warmed on this day */
  emailsWarmed: number;
  /** Number of emails successfully delivered */
  delivered: number;
  /** Number of emails marked as spam */
  spam: number;
  /** Number of replies received */
  replies: number;
  /** Number of bounced emails */
  bounce: number;
  /** Health score out of 100 */
  healthScore: number;
}

/**
 * Mailbox warmup data and configuration
 */
export interface MailboxWarmupData {
  /** Unique mailbox identifier */
  id: string;
  /** Display name for the mailbox */
  name: string;
  /** Email address */
  email: string;
  /** Current warmup status */
  status: "active" | "warming" | "paused" | "inactive";
  /** Warmup progress as percentage (0-100) */
  warmupProgress: number;
  /** Daily email volume capacity */
  dailyVolume: number;
  /** Reputation health score (0-100) */
  healthScore: number;
  /** Domain of the email */
  domain?: string;
  /** Created at date string */
  createdAt?: string;
}

/**
 * Progressive analytics state for individual mailboxes
 */
export interface ProgressiveAnalyticsState {
  [mailboxId: string]: {
    data: MailboxAnalyticsData | null;
    loading: boolean;
    error: string | null;
  };
}

/**
 * Progressive mailbox analytics data interface
 */
export interface MailboxAnalyticsData {
  /** Unique mailbox identifier */
  mailboxId: string;
  /** Warmup progress as percentage (0-100) */
  warmupProgress: number;
  /** Total number of warmup emails sent */
  totalWarmups: number;
  /** Number of emails marked as spam */
  spamFlags: number;
  /** Number of replies received */
  replies: number;
  /** Health score out of 100 */
  healthScore: number;
  /** Last updated timestamp */
  lastUpdated: Date;
}

// ============================================================================
// ANALYTICS CONTEXT AND STATE TYPES
// ============================================================================

/**
 * Analytics context state interface
 */
export interface AnalyticsContextState {
  /** Total emails sent */
  totalSent: number | string;
  /** Open rate percentage */
  openRate: number | string;
  /** Reply rate percentage */
  replyRate: number | string;
  /** Click rate percentage */
  clickRate: number | string;
  /** Time series chart data */
  chartData: TimeSeriesDataPoint[];
  /** Available analytics metrics */
  metrics: AnalyticsMetricConfig[];
  /** Visible metrics configuration */
  visibleMetrics: string[];
  /** Function to update visible metrics */
  setVisibleMetrics: (metrics: string[]) => void;
  /** Whether custom date range is active */
  showCustomDate: boolean;
  /** Function to toggle custom date visibility */
  setShowCustomDate: (show: boolean) => void;
  /** Current date range preset */
  dateRange: DateRangePreset;
  /** Function to set date range */
  setDateRange: (range: DateRangePreset) => void;
  /** Current data granularity */
  granularity: DataGranularity;
  /** Function to set granularity */
  setGranularity: (granularity: DataGranularity) => void;
  /** Allowed granularity options based on date range */
  allowedGranularities: DataGranularity[];
  /** Custom date range start (ISO string) */
  customDateStart: string;
  /** Function to set custom start date */
  setCustomDateStart: (date: string) => void;
  /** Custom date range end (ISO string) */
  customDateEnd: string;
  /** Function to set custom end date */
  setCustomDateEnd: (date: string) => void;
  /** Selected campaign IDs for filtering */
  selectedCampaigns: string[];
  /** Function to update selected campaigns */
  setSelectedCampaigns: (campaigns: string[]) => void;
  /** Selected mailbox IDs for filtering */
  selectedMailboxes: string[];
  /** Function to update selected mailboxes */
  setSelectedMailboxes: (mailboxes: string[]) => void;
  /** Filters state object for easier access to filter-related properties */
  filters: AnalyticsFilterState;
  /** Campaign performance data for tables and comparisons */
  campaignPerformanceData: CampaignPerformanceData[];
  /** Available campaigns for filtering */
  campaigns: CampaignFilter[];
  /** Warmup analytics metrics */
  warmupMetrics: WarmupMetric[];
  /** Visible warmup metrics configuration */
  visibleWarmupMetrics: Record<string, boolean>;
  /** Function to update visible warmup metrics */
  setVisibleWarmupMetrics: (metrics: Record<string, boolean>) => void;
  /** Warmup chart data */
  warmupChartData: WarmupChartData[];
  /** Smart insights data for inbox analytics */
  smartInsightsList: SmartInsight[];
  /** Function to fetch mailboxes */
  fetchMailboxes: (userid?: string, companyid?: string) => Promise<MailboxWarmupData[]>;
  /** Function to fetch analytics for a single mailbox */
  fetchMailboxAnalytics: (mailboxId: string, dateRangePreset?: DateRangePreset, granularityLevel?: DataGranularity, userid?: string, companyid?: string) => Promise<MailboxAnalyticsData>;
  /** Function to fetch analytics for multiple mailboxes */
  fetchMultipleMailboxAnalytics: (mailboxIds: string[], dateRangePreset?: DateRangePreset, granularityLevel?: DataGranularity, userid?: string, companyid?: string) => Promise<Record<string, MailboxAnalyticsData>>;
  /** Function to fetch domains with mailboxes data */
  fetchDomainsWithMailboxes: (userid?: string, companyid?: string) => Promise<import("@/lib/actions/domains").DomainWithMailboxesData[]>;
  /** Function to get account performance metrics */
  getAccountMetrics: () => AccountMetrics;
}

/**
 * Analytics filter state interface - subset for filter-related properties
 */
export interface AnalyticsFilterState {
  /** Visible metrics configuration */
  visibleMetrics: string[];
  /** Function to update visible metrics */
  setVisibleMetrics: (metrics: string[]) => void;
  /** Whether custom date range is active */
  showCustomDate: boolean;
  /** Function to toggle custom date visibility */
  setShowCustomDate: (show: boolean) => void;
  /** Current date range preset */
  dateRange: DateRangePreset;
  /** Function to set date range */
  setDateRange: (range: DateRangePreset) => void;
  /** Current data granularity */
  granularity: DataGranularity;
  /** Function to set granularity */
  setGranularity: (granularity: DataGranularity) => void;
  /** Allowed granularity options based on date range */
  allowedGranularities: DataGranularity[];
  /** Custom date range start (ISO string) */
  customDateStart: string;
  /** Function to set custom start date */
  setCustomDateStart: (date: string) => void;
  /** Custom date range end (ISO string) */
  customDateEnd: string;
  /** Function to set custom end date */
  setCustomDateEnd: (date: string) => void;
  /** Selected campaign IDs for filtering */
  selectedCampaigns: string[];
  /** Function to update selected campaigns */
  setSelectedCampaigns: (campaigns: string[]) => void;
  /** Selected mailbox IDs for filtering */
  selectedMailboxes: string[];
  /** Function to update selected mailboxes */
  setSelectedMailboxes: (mailboxes: string[]) => void;
}

/**
 * @deprecated Use AnalyticsFilters from ./analytics/core.ts for data layer operations
 * or AnalyticsUIFilters from ./analytics/ui.ts for UI state management.
 * 
 * MIGRATION:
 * - For server-side filtering: Use AnalyticsFilters from ./analytics/core.ts
 * - For UI state management: Use AnalyticsUIFilters from ./analytics/ui.ts
 * 
 * This interface mixed data and UI concerns and has been split into separate types.
 */
export interface AnalyticsFilters {
  /** @deprecated Use AnalyticsFilters.dateRange from core.ts or AnalyticsUIFilters.dateRange from ui.ts */
  dateRange?: DateRangePreset;
  /** @deprecated Use AnalyticsFilters.dateRange from core.ts or AnalyticsUIFilters.customDateRange from ui.ts */
  customDateRange?: {
    start: string;
    end: string;
  };
  /** @deprecated Use AnalyticsUIFilters.granularity from ui.ts */
  granularity?: DataGranularity;
  /** @deprecated Use AnalyticsUIFilters.selectedCampaigns from ui.ts */
  campaigns?: string[];
  /** @deprecated Use AnalyticsUIFilters.selectedMailboxes from ui.ts */
  mailboxes?: string[];
  /** @deprecated Use AnalyticsUIFilters.visibleMetrics from ui.ts */
  visibleMetrics?: string[];
  /** @deprecated Use AnalyticsFilters.additionalFilters from core.ts */
  additionalFilters?: {
    [key: string]: string | number | boolean;
  };
  /** @deprecated Use AnalyticsFilters.entityIds from core.ts */
  entityIds?: string[];
}

// ============================================================================
// PERFORMANCE TRACKING TYPES
// ============================================================================

/**
 * @deprecated Use PerformanceMetrics from ./analytics/core.ts instead
 * 
 * This interface has been REMOVED. Use the standardized PerformanceMetrics from core.ts
 * which stores raw counts instead of calculated rates.
 * 
 * MIGRATION:
 * ```typescript
 * import { PerformanceMetrics } from "@/types/analytics/core";
 * import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
 * 
 * // Use raw performance metrics
 * const metrics: PerformanceMetrics = {
 *   sent: 1000,
 *   delivered: 980,
 *   opened_tracked: 300,
 *   clicked_tracked: 50,
 *   replied: 25,
 *   bounced: 20,
 *   unsubscribed: 10,
 *   spamComplaints: 2
 * };
 * 
 * // Calculate rates and health score on-demand
 * const rates = AnalyticsCalculator.calculateAllRates(metrics);
 * const healthScore = AnalyticsCalculator.calculateHealthScore(metrics);
 * ```
 */
// REMOVED: Use PerformanceMetrics from @/types/analytics/core instead

/**
 * Performance tracking configuration
 */
export interface PerformanceTracking {
  /** Whether to track this metric */
  enabled: boolean;
  /** Tracking threshold for alerts */
  threshold?: number;
  /** Alert when threshold is exceeded */
  alertOnExceed?: boolean;
}

// ============================================================================
// UI COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for metric toggle/filter interface
 */
export interface MetricToggleProps {
  /** Available metrics to toggle */
  metrics: AnalyticsMetricConfig[];
  /** Currently visible metrics */
  visibleMetrics: string[];
  /** Callback when visibility changes */
  onVisibilityChange: (metrics: string[]) => void;
}

/**
 * Props for date range picker components
 */
export interface DateRangeFilterProps {
  /** Selected date range preset */
  selectedRange: DateRangePreset;
  /** Custom date range (if preset is 'custom') */
  customRange?: {
    start: string;
    end: string;
  };
  /** Callback when range changes */
  onRangeChange: (
    range: DateRangePreset,
    customStart?: string,
    customEnd?: string,
  ) => void;
  /** Available granularity options */
  allowedGranularities: DataGranularity[];
  /** Selected granularity */
  selectedGranularity: DataGranularity;
  /** Callback when granularity changes */
  onGranularityChange: (granularity: DataGranularity) => void;
}

/**
 * Props for campaign/mailbox filter components
 */
export interface EntityFilterProps<T = { id: string; name: string }> {
  /** Available entities to filter by */
  entities: T[];
  /** Selected entity IDs */
  selectedEntities: string[];
  /** Callback when selection changes */
  onSelectionChange: (selectedIds: string[]) => void;
  /** Display label for the filter */
  label: string;
  /** Icon to display */
  icon?: React.ReactNode;
}

/**
 * Individual smart insight item structure
 */
export interface SmartInsight {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Value to display (number or string) */
  count: number | string;
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Border color class */
  borderColor: string;
  /** Icon background color class */
  iconBackground: string;
  /** Icon color class */
  iconColor: string;

}

/**
 * Account performance metrics data structure
 */
export interface AccountMetrics {
  /** Bounce rate as decimal (0-1) */
  bounceRate: number;
  /** Spam complaints rate as decimal (0-1) */
  spamComplaints: number;
  /** Open rate as decimal (0-1) */
  openRate: number;
  /** Reply rate as decimal (0-1) */
  replyRate: number;
  /** Maximum acceptable bounce rate threshold */
  maxBounceRateThreshold: number;
  /** Maximum acceptable spam complaint rate threshold */
  maxSpamComplaintRateThreshold: number;
  /** Minimum acceptable open rate threshold */
  minOpenRateThreshold: number;
  /** Minimum acceptable reply rate threshold */
  minReplyRateThreshold: number;
}
