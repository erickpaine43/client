// ============================================================================
// CORE ANALYTICS TYPES - Standardized data models (no UI concerns)
// ============================================================================

/**
 * Standardized performance metrics for raw counts.
 * Rates will be calculated on-demand based on these counts.
 * This interface contains only raw data, no UI formatting or display logic.
 */
export interface PerformanceMetrics {
  /** Number of emails sent */
  sent: number;
  /** Number of emails successfully delivered */
  delivered: number;
  /** Number of opens tracked via tracking pixel */
  opened_tracked: number;
  /** Number of clicks tracked via tracking links */
  clicked_tracked: number;
  /** Number of replies received */
  replied: number;
  /** Number of bounced emails */
  bounced: number;
  /** Number of unsubscribed recipients */
  unsubscribed: number;
  /** Number of spam complaints */
  spamComplaints: number;
}

/**
 * Calculated rates interface (computed on-demand, not stored).
 * All rates are decimals between 0.0 and 1.0.
 */
export interface CalculatedRates {
  /** Delivery rate: delivered / sent */
  deliveryRate: number;
  /** Open rate: opened_tracked / delivered */
  openRate: number;
  /** Click rate: clicked_tracked / delivered */
  clickRate: number;
  /** Reply rate: replied / delivered */
  replyRate: number;
  /** Bounce rate: bounced / sent */
  bounceRate: number;
  /** Unsubscribe rate: unsubscribed / delivered */
  unsubscribeRate: number;
  /** Spam rate: spamComplaints / delivered */
  spamRate: number;
}

/**
 * Time series data point with standardized field names.
 * Contains only raw data, no display formatting.
 */
export interface TimeSeriesDataPoint {
  /** ISO date string in YYYY-MM-DD format */
  date: string;
  /** Human-readable label for display (UI concern, but needed for charts) */
  label: string;
  /** Performance metrics for this time period */
  metrics: PerformanceMetrics;
}

/**
 * Base analytics interface that all domain-specific analytics extend.
 */
export interface BaseAnalytics extends PerformanceMetrics {
  /** Unique identifier for the entity */
  id: string;
  /** Display name for the entity */
  name: string;
  /** Last updated timestamp */
  updatedAt: number;
}

/**
 * Analytics filters for database queries (data layer).
 * Contains only filter criteria, no UI state.
 * 
 * NOTE: This is different from AnalyticsUIFilters in ./ui.ts which handles UI state.
 * Use this interface for server-side filtering and data operations.
 * Use AnalyticsUIFilters for component state and UI interactions.
 */
export interface AnalyticsFilters {
  /** Date range for filtering */
  dateRange?: {
    start: string; // ISO date string
    end: string;   // ISO date string
  };
  /** Entity IDs to include (optional) */
  entityIds?: string[];
  /** Domain IDs to include (optional) */
  domainIds?: string[];
  /** Mailbox IDs to include (optional) */
  mailboxIds?: string[];
  /** Additional filter criteria */
  additionalFilters?: Record<string, unknown>;
  /** Data granularity for time series */
  granularity?: DataGranularity;
  /** Company ID for filtering */
  companyId?: string;
  _hash?: string;
}

/**
 * Data granularity options for time series aggregation.
 */
export type DataGranularity = "day" | "week" | "month";

/**
 * Analytics computation options for server-side processing.
 */
export interface AnalyticsComputeOptions {
  /** Whether to include time series data */
  includeTimeSeriesData?: boolean;
  /** Whether to include performance metrics */
  includePerformanceMetrics?: boolean;
  /** Whether to include comparative data */
  includeComparativeData?: boolean;
  /** Data granularity for time series */
  granularity?: DataGranularity;
  /** Custom metrics to compute */
  customMetrics?: string[];
}

/**
 * Filtered dataset interface for analytics computation.
 */
export interface FilteredDataset<T = unknown> {
  /** The filtered data */
  data: T[];
  /** Total count before filtering */
  totalCount: number;
  /** Applied filters */
  filters: AnalyticsFilters;
  /** Query execution time in milliseconds */
  queryExecutionTime: number;
}
