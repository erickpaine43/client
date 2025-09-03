// ============================================================================
// ANALYTICS TYPES - Centralized type definitions for analytics components
// ============================================================================

// ============================================================================
// TIME SERIES AND CHART DATA TYPES
// ============================================================================

/**
 * Granularity options for time series data aggregation
 */
/** Granularity options for time series data aggregation */
export type DataGranularity = "day" | "week" | "month";

/**
 * Date range presets for analytics filtering
 */
export type DateRangePreset = "7d" | "30d" | "90d" | "1y" | "custom";

/**
 * Represents a single data point in time series charts
 */
export interface TimeSeriesDataPoint {
  /** ISO date string in YYYY-MM-DD format */
  date: string;
  /** Human-readable label for display */
  label: string;
  /** Number of emails sent */
  sent: number;
  /** Number of opens tracked */
  opens: number;
  /** Number of clicks tracked */
  clicks: number;
  /** Number of replies received */
  replies: number;
  /** Number of bounced emails */
  bounces: number;
}

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
 * Configuration for individual analytics metrics
 */
export interface AnalyticsMetric {
  /** Unique key identifier for the metric */
  key: string;
  /** Display label for the metric */
  label: string;
  /** Hex color code for chart representation */
  color: string;
  /** Lucide React icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Whether this metric is currently visible in charts */
  visible: boolean;
}

/**
 * Analytics summary statistics for dashboard display
 */
export interface AnalyticsStatistics {
  /** Total emails sent (can be number or string for formatting) */
  totalSent: number | string;
  /** Email open rate as percentage */
  openRate: number | string;
  /** Email reply rate as percentage */
  replyRate: number | string;
  /** Email click rate as percentage */
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
 * Campaign performance data structure
 */
export interface CampaignPerformanceData {
  /** Campaign name */
  name: string;
  /** Number of emails sent */
  sent: number;
  /** Number of opens tracked */
  opens: number | null;
  /** Number of clicks tracked */
  clicks: number | null;
  /** Number of replies received */
  replies: number;
  /** Number of bounced emails */
  bounced?: number;
  /** Open rate as percentage */
  openRate: number;
  /** Reply rate as percentage */
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
  /** Visible metrics configuration */
  visibleMetrics: Record<string, boolean>;
  /** Function to update visible metrics */
  setVisibleMetrics: (metrics: Record<string, boolean>) => void;
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
 * Analytics filter configuration
 */
export interface AnalyticsFilters {
  /** Date range settings */
  dateRange: DateRangePreset;
  /** Custom date range */
  customDateRange?: {
    start: string;
    end: string;
  };
  /** Granularity for data aggregation */
  granularity: DataGranularity;
  /** Selected campaigns */
  campaigns: string[];
  /** Selected mailboxes */
  mailboxes: string[];
  /** Visible metric keys */
  visibleMetrics: string[];
}

// ============================================================================
// PERFORMANCE TRACKING TYPES
// ============================================================================

/**
 * Performance metrics for email deliverability
 */
export interface PerformanceMetrics {
  /** Delivery rate (sent vs delivered) */
  deliveryRate: number;
  /** Overall health score */
  healthScore: number;
  /** Spam rate */
  spamRate: number;
  /** Bounce rate */
  bounceRate: number;
  /** Reply rate for engagement tracking */
  replyRate: number;
}

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
  metrics: AnalyticsMetric[];
  /** Currently visible metrics */
  visibleMetrics: Record<string, boolean>;
  /** Callback when visibility changes */
  onVisibilityChange: (metrics: Record<string, boolean>) => void;
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
