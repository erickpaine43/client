// ============================================================================
// UI ANALYTICS TYPES - Display and interaction concerns only
// ============================================================================

import { DataGranularity } from "./core";

/**
 * Date range presets for UI filtering.
 */
export type DateRangePreset = "7d" | "30d" | "90d" | "1y" | "custom";

/**
 * UI filter state interface - manages only UI state, not data.
 */
export interface AnalyticsUIFilters {
  /** Date range preset selection */
  dateRange: DateRangePreset;
  /** Custom date range (when preset is 'custom') */
  customDateRange?: {
    start: string;
    end: string;
  };
  /** Data granularity for charts */
  granularity: DataGranularity;
  /** Whether custom date picker is visible (UI helper) */
  showCustomDate?: boolean;
  /** Setter for showCustomDate (UI helper) */
  setShowCustomDate?: (show: boolean) => void;
  /** Shortcuts for custom date fields used by UI components */
  customDateStart?: string;
  setCustomDateStart?: (d: string) => void;
  customDateEnd?: string;
  setCustomDateEnd?: (d: string) => void;
  /** Allowed granularities for UI pickers */
  allowedGranularities?: DataGranularity[];
  /** Convenience setters used by UI components */
  setDateRange?: (r: DateRangePreset) => void;
  setGranularity?: (g: DataGranularity) => void;
  /** Selected campaign IDs */
  selectedCampaigns: string[];
  /** Setter for selected campaigns (UI helper) */
  setSelectedCampaigns?: (ids: string[]) => void;
  /** Selected mailbox IDs */
  selectedMailboxes: string[];
  /** Setter for selected mailboxes (UI helper) */
  setSelectedMailboxes?: (ids: string[]) => void;
  /** Selected domain IDs */
  selectedDomains: string[];
  /** Visible metrics for charts */
  visibleMetrics: string[];
  setVisibleMetrics?: (metrics: string[]) => void;
  // ... no-op: setters are defined alongside the primary properties above
}

/**
 * Analytics metric configuration for UI display.
 */
export interface AnalyticsMetricConfig {
  /** Unique key identifier */
  key: string;
  /** Display label */
  label: string;
  /** Chart color (hex) */
  color: string;
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Whether visible by default */
  visible: boolean;
  /** Tooltip description */
  tooltip?: string;
}

/**
 * KPI display configuration for dashboard cards.
 */
export interface KPIDisplayConfig {
  /** KPI identifier */
  id: string;
  /** Display name */
  name: string;
  /** Current value (formatted for display) */
  displayValue: string;
  /** Raw numeric value */
  rawValue: number;
  /** Target/benchmark value */
  target?: number;
  /** Display unit (%, #, $, etc.) */
  unit: string;
  /** Trend direction */
  trend?: "up" | "down" | "stable";
  /** Color theme */
  color?: "positive" | "warning" | "danger" | "neutral";
  /** Change from previous period */
  change?: string;
  /** Change type for styling */
  changeType?: "increase" | "decrease" | "stable";
}

/**
 * Chart data point for UI rendering.
 * Contains formatted data ready for chart display.
 */
export interface ChartDataPoint {
  /** Display name/label */
  name: string;
  /** Date for time series */
  date?: string;
  /** Formatted values for display */
  [key: string]: string | number | undefined;
}

/**
 * Smart insight item for dashboard display.
 */
export interface SmartInsightDisplay {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Formatted count/value */
  displayValue: string;
  /** Raw numeric value */
  rawValue: number;
  /** Icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** CSS classes for styling */
  styling: {
    borderColor: string;
    iconBackground: string;
    iconColor: string;
  };
}

/**
 * Loading state interface for progressive analytics loading.
 */
export interface AnalyticsLoadingState {
  /** Loading states by domain */
  domains: Record<AnalyticsDomain, boolean>;
  /** Error states by domain */
  errors: Record<AnalyticsDomain, string | null>;
  /** Overall loading state */
  isLoading: boolean;
  /** Whether any domain has errors */
  hasErrors: boolean;
}

/**
 * Analytics domain types for state management.
 */
export type AnalyticsDomain = 
  | "campaigns" 
  | "domains" 
  | "mailboxes" 
  | "crossDomain"
  | "leads" 
  | "templates" 
  | "billing";

/**
 * UI component props for metric toggles.
 */
export interface MetricToggleProps {
  /** Available metrics */
  metrics: AnalyticsMetricConfig[];
  /** Currently visible metrics */
  visibleMetrics: Record<string, boolean>;
  /** Callback when visibility changes */
  onVisibilityChange: (metrics: Record<string, boolean>) => void;
}

/**
 * UI component props for date range picker.
 */
export interface DateRangePickerProps {
  /** Selected date range preset */
  selectedRange: DateRangePreset;
  /** Custom date range */
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
 * UI component props for entity filters (campaigns, mailboxes, etc.).
 */
export interface EntityFilterProps<T = { id: string; name: string }> {
  /** Available entities */
  entities: T[];
  /** Selected entity IDs */
  selectedEntities: string[];
  /** Callback when selection changes */
  onSelectionChange: (selectedIds: string[]) => void;
  /** Display label */
  label: string;
  /** Icon component */
  icon?: React.ReactNode;
}

/**
 * Formatted analytics statistics for UI display.
 */
export interface FormattedAnalyticsStats {
  /** Total emails sent (formatted) */
  totalSent: string;
  /** Open rate (formatted as percentage) */
  openRate: string;
  /** Click rate (formatted as percentage) */
  clickRate: string;
  /** Reply rate (formatted as percentage) */
  replyRate: string;
  /** Bounce rate (formatted as percentage) */
  bounceRate: string;
  /** Delivery rate (formatted as percentage) */
  deliveryRate: string;
}

/**
 * Account performance thresholds for UI alerts.
 */
export interface PerformanceThresholds {
  /** Maximum acceptable bounce rate */
  maxBounceRate: number;
  /** Maximum acceptable spam complaint rate */
  maxSpamComplaintRate: number;
  /** Minimum acceptable open rate */
  minOpenRate: number;
  /** Minimum acceptable reply rate */
  minReplyRate: number;
}
