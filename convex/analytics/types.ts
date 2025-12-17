// ============================================================================
// ANALYTICS TYPES - EXTRACTED FROM MAIN ANALYTICS FILE
// ============================================================================

// Import the centralized CampaignStatus type
import type { CampaignStatus } from '@/types/campaign';

// ============================================================================
// CORE METRICS INTERFACES
// ============================================================================

/** Base interface for all metrics */
export interface BaseMetrics {
  /** Number of emails sent */
  sent: number;
  /** Number of emails successfully delivered */
  delivered: number;
  /** Number of emails that were opened (tracked) */
  opened_tracked: number;
  /** Number of tracked links that were clicked */
  clicked_tracked: number;
  /** Number of replies received */
  replied: number;
  /** Number of emails that bounced */
  bounced: number;
  /** Number of unsubscribes */
  unsubscribed: number;
  /** Number of spam complaints received */
  spamComplaints: number;
}

/** Base interface for campaign-related data */
export interface CampaignBase {
  /** Unique identifier for the campaign */
  campaignId: string;
  /** Human-readable name of the campaign */
  campaignName: string;
  /** Current status of the campaign */
  status: CampaignStatus;
  /** Total number of leads in the campaign */
  leadCount: number;
  /** Number of active leads in the campaign */
  activeLeads: number;
  /** Number of completed leads in the campaign */
  completedLeads: number;
  /** Timestamp of last update */
  updatedAt: number;
}

/**
 * Complete analytics data for a campaign
 */
export interface CampaignAnalytics extends CampaignBase {
  /** Aggregated metrics for the campaign */
  aggregatedMetrics: BaseMetrics;
}

/**
 * Performance metrics for a campaign
 * @deprecated Use CampaignAnalytics instead - this will be removed in v2.0.0
 * @see CampaignAnalytics
 */
export interface CampaignPerformanceMetrics extends CampaignBase, BaseMetrics {
  // This interface combines CampaignBase and BaseMetrics directly
  // No need for a separate metrics property as the fields are flattened
}

// ============================================================================
// DATE AND FILTER INTERFACES
// ============================================================================

/** Date range for filtering analytics data */
export interface DateRange {
  start: string;
  end: string;
}

/** Arguments for filtering analytics data */
export interface GetAnalyticsFilterArgs {
  filters: {
    campaignIds?: string[];
    dateRange?: DateRange;
    campaignStatus?: CampaignStatus[];
    minSent?: number;
    maxSent?: number;
    minReplies?: number;
  };
  companyId: string;
  computeOptions?: {
    includeTimeSeriesData?: boolean;
    includeSequenceData?: boolean;
    granularity?: 'day' | 'week' | 'month';
  };
}

// ============================================================================
// COMPREHENSIVE ANALYTICS INTERFACES
// ============================================================================

/** Parameters for getting comprehensive campaign analytics */
export interface GetComprehensiveCampaignAnalyticsArgs {
  /** Optional array of campaign IDs to filter by */
  campaignIds?: string[];
  /** Optional date range to filter the data */
  dateRange?: DateRange;
  /** Company ID to scope the analytics to */
  companyId: string;
  /** Whether to include sequence step analytics */
  includeSequenceData?: boolean;
  /** Whether to include time series data */
  includeTimeSeriesData?: boolean;
}

/** Response type for comprehensive campaign analytics */
export interface ComprehensiveCampaignAnalyticsResponse<T = unknown> {
  /** Array of campaign analytics */
  campaigns: CampaignAnalytics[];
  /** Time series data if requested */
  timeSeriesData: T | null;
  /** Sequence analytics keyed by campaign ID if requested */
  sequenceAnalytics: Record<string, unknown> | null;
  /** Metadata about the response */
  metadata: {
    /** The date range used for the query */
    dateRange?: DateRange;
    /** Number of campaigns included in the response */
    campaignCount: number;
    /** Whether sequence data is included */
    includesSequenceData: boolean;
    /** Whether time series data is included */
    includesTimeSeriesData: boolean;
    /** Timestamp when the response was generated */
    generatedAt: number;
  };
}

// ============================================================================
// CAMPAIGN COMPARISON INTERFACES
// ============================================================================

/** Result of comparing multiple campaigns */
export interface CampaignComparisonResult {
  /** List of campaigns being compared */
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    status: CampaignStatus;
    metrics: Record<keyof BaseMetrics | 'leadCount' | 'activeLeads' | 'completedLeads', number>;
  }>;

  /** Relative performance metrics (0-100%) for each campaign */
  relativePerformance: Record<string, Record<string, number>>;

  /** Best performing campaign for each metric */
  bestPerformers: Record<string, { campaignId: string; campaignName: string; value: number }>;

  /** Worst performing campaign for each metric */
  worstPerformers: Record<string, { campaignId: string; campaignName: string; value: number }>;

  /** Summary of the comparison */
  summary: {
    totalCampaigns: number;
    metrics: string[];
    dateRange?: DateRange;
    generatedAt: number;
  };
}

// ============================================================================
// ANALYTICS OVERVIEW INTERFACES
// ============================================================================

/** Parameters for getting analytics overview */
export interface GetAnalyticsOverviewArgs {
  /** Optional date range to filter the data */
  dateRange?: DateRange;
  /** Company ID to scope the analytics to */
  companyId: string;
}

/** Analytics overview response */
export interface AnalyticsOverviewResponse {
  /** Aggregated metrics across all campaigns */
  totalMetrics: BaseMetrics;
  /** Count of campaigns by status */
  statusCounts: Record<CampaignStatus, number>;
  /** Top performing campaigns by reply rate */
  topCampaigns: Array<{
    campaignId: string;
    campaignName: string;
    replyRate: number;
    openRate: number;
    clickRate: number;
  }>;
  /** Total number of campaigns */
  campaignCount: number;
  /** Date range used for the query */
  dateRange: DateRange;
  /** Timestamp when the response was generated */
  generatedAt: number;
}
