/**
 * Types for LeadAnalyticsService
 * 
 * This module contains all type definitions specific to lead analytics,
 * including interfaces for metrics, analytics results, and local types for
 * Convex responses, update payloads, and return types for analytics methods.
 * All types extend or compose core analytics types from @/types/analytics/core.
 * 
 * Usage:
 * - Import specific interfaces for method parameters/returns
 * - Types ensure consistency with BaseAnalyticsService and Convex schemas
 * - All numeric metrics use number type (no unions or optionals unless specified)
 * - JSDoc provides detailed descriptions for each property and usage context
 */

import type {
  PerformanceMetrics,
  AnalyticsFilters,
  TimeSeriesDataPoint,
  AnalyticsComputeOptions
} from "@/types/analytics/core";
import type { LeadStatus } from "@/types/analytics/domain-specific";

/**
 * Lead list metrics interface.
 */
export interface LeadListMetrics {
  totalLeads: number;
  totalMetrics: PerformanceMetrics;
  statusBreakdown: Array<{
    status: LeadStatus;
    count: number;
    percentage: number;
  }>;
  engagementSummary: {
    activeLeads: number;
    repliedLeads: number;
    bouncedLeads: number;
    unsubscribedLeads: number;
    completedLeads: number;
  };
}

/**
 * Lead engagement analytics interface.
 */
export interface LeadEngagementAnalytics {
  timeSeriesData: Array<TimeSeriesDataPoint & { leadCount: number }>;
  totalEngagement: PerformanceMetrics;
  engagementTrends: {
    openTrend: number;
    clickTrend: number;
    replyTrend: number;
  };
  topEngagingLeads: Array<{
    leadId: string;
    email: string;
    company?: string;
    engagementScore: number;
    totalInteractions: number;
  }>;
}

/**
 * Lead source analytics interface.
 */
export interface LeadSourceAnalytics {
  sourceBreakdown: Array<{
    source: string;
    leadCount: number;
    engagementRate: number;
    conversionRate: number;
  }>;
  topPerformingSources: Array<{
    source: string;
    metrics: PerformanceMetrics;
    conversionRate: number;
  }>;
}

/**
 * Lead segmentation analytics interface.
 */
export interface SegmentationAnalytics {
  companySegments: Array<{
    company: string;
    leadCount: number;
    metrics: PerformanceMetrics;
    averageEngagement: number;
  }>;
  statusSegments: Array<{
    status: LeadStatus;
    leadCount: number;
    metrics: PerformanceMetrics;
    conversionRate: number;
  }>;
}

/**
 * Conversion funnel data interface.
 */
export interface ConversionFunnelData {
  funnelSteps: Array<{
    step: string;
    leadCount: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
  overallConversion: number;
  bottlenecks: Array<{
    step: string;
    dropoffRate: number;
    improvement: string;
  }>;
}

/**
 * Payload for updating individual lead analytics.
 * Used in updateAnalytics mutation.
 * All metrics are required and must be validated before storage.
 * 
 * @example
 * const updateData: LeadAnalyticsUpdatePayload = {
 *   leadId: "lead_123",
 *   email: "user@example.com",
 *   company: "Acme Corp",
 *   date: "2023-09-18",
 *   sent: 100,
 *   delivered: 95,
 *   opened_tracked: 45,
 *   clicked_tracked: 20,
 *   replied: 12,
 *   bounced: 2,
 *   unsubscribed: 1,
 *   spamComplaints: 0,
 *   status: "active"
 * };
 */
export interface LeadAnalyticsUpdatePayload {
  leadId: string;
  email: string;
  company?: string;
  date: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  status: LeadStatus;
}

/**
 * Array of LeadAnalyticsUpdatePayload for batch operations.
 * Used in batchUpdateAnalytics mutation if implemented.
 */
export type LeadAnalyticsBatchUpdatePayload = LeadAnalyticsUpdatePayload[];

/**
 * Return type for computeAnalyticsForFilteredData.
 * Computed results on filtered lead data.
 * Optional fields populated based on options.
 */
export interface FilteredLeadAnalytics {
  aggregatedMetrics: PerformanceMetrics;
  rates: ReturnType<typeof import("@/lib/utils/analytics-calculator").AnalyticsCalculator.calculateAllRates>;
  timeSeriesData?: TimeSeriesDataPoint[];
  leadCount: number;
}

/**
 * Re-export core types for convenience in this service.
 */
export type {
  PerformanceMetrics,
  AnalyticsFilters,
  TimeSeriesDataPoint,
  AnalyticsComputeOptions,
  LeadStatus
};
