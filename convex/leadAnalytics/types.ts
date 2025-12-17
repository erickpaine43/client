import { Id } from "../_generated/dataModel";

/**
 * Core Lead Analytics Record Interface
 * Represents a single lead analytics data point in the database
 */
export interface LeadAnalyticsRecord {
  _id: Id<"leadAnalytics">;
  _creationTime: number;
  leadId: string;
  email: string;
  company?: string;
  companyId: string;
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
  updatedAt: number;
}

/**
 * Lead Status Types
 * Defines the possible states a lead can be in
 */
export type LeadStatus = "ACTIVE" | "REPLIED" | "BOUNCED" | "UNSUBSCRIBED" | "COMPLETED";

/**
 * Query Arguments for Lead Analytics
 * Standardized arguments for querying lead analytics data
 */
export interface LeadAnalyticsQueryArgs {
  leadIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  companyId: string;
}

/**
 * Time Series Query Arguments
 * Extended arguments for time series analytics
 */
export interface LeadTimeSeriesQueryArgs extends LeadAnalyticsQueryArgs {
  granularity?: "day" | "week" | "month";
}

/**
 * Mutation Arguments for Lead Analytics
 * Arguments for creating/updating lead analytics records
 */
export interface LeadAnalyticsMutationArgs {
  leadId: string;
  email: string;
  company?: string;
  companyId: string;
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
 * Aggregated Metrics Interface
 * Represents calculated metrics for lead analytics
 */
export interface LeadAggregatedMetrics {
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}

/**
 * Lead Engagement Summary
 * Summary of lead engagement across different categories
 */
export interface LeadEngagementSummary {
  activeLeads: number;
  repliedLeads: number;
  bouncedLeads: number;
  unsubscribedLeads: number;
  completedLeads: number;
}

/**
 * Status Breakdown Item
 * Individual status metrics for lead list analysis
 */
export interface LeadStatusBreakdownItem {
  status: LeadStatus;
  count: number;
  percentage: number;
}

/**
 * Lead List Metrics Response
 * Complete metrics response for lead list analysis
 */
export interface LeadListMetricsResponse {
  totalLeads: number;
  totalMetrics: LeadAggregatedMetrics;
  statusBreakdown: LeadStatusBreakdownItem[];
  engagementSummary: LeadEngagementSummary;
}

/**
 * Time Series Data Point
 * Individual data point for time series analytics
 */
export interface LeadTimeSeriesDataPoint {
  date: string;
  label: string;
  metrics: LeadAggregatedMetrics;
  leadCount: number;
}

/**
 * Lead Aggregation Response
 * Response structure for lead aggregation queries
 */
export interface LeadAggregationResponse {
  leadId: string;
  email: string;
  company?: string;
  status: LeadStatus;
  companyId: string;
  date: string;
  aggregatedMetrics: LeadAggregatedMetrics;
  recordCount: number;
  updatedAt: number;
}

/**
 * Validation Result Interface
 * Result of input validation operations
 */
export interface LeadAnalyticsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
