import { Id } from "../_generated/dataModel";
import { CampaignStatus } from "../../types/analytics/domain-specific";

/**
 * Database record interface that matches the Convex schema
 */
export interface DBCampaignAnalyticsRecord {
  _id: Id<"campaignAnalytics">;
  _creationTime: number;
  campaignId: string;
  campaignName: string;
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
  status: CampaignStatus;
  leadCount: number;
  activeLeads: number;
  completedLeads: number;
  updatedAt: number;
}

/**
 * Application-facing interface with camelCase field names
 */
export interface CampaignAnalyticsRecord extends Omit<DBCampaignAnalyticsRecord, 'opened_tracked' | 'clicked_tracked'> {
  openedTracked: number;
  clickedTracked: number;
}

/**
 * Represents aggregated metrics for a campaign
 */
export interface AggregatedCampaignMetrics {
  sent: number;
  delivered: number;
  openedTracked: number;
  clickedTracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  // Performance metrics
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  complaintRate: number;
}

/**
 * Represents aggregated analytics for a campaign
 */
export interface AggregatedCampaignAnalytics {
  campaignId: string;
  campaignName: string;
  status: CampaignStatus;
  leadCount: number;
  activeLeads: number;
  completedLeads: number;
  updatedAt: number;
  aggregatedMetrics: AggregatedCampaignMetrics;
}

/**
 * Query arguments for campaign analytics
 */
export interface CampaignAnalyticsQueryArgs {
  campaignIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  companyId: string;
  cursor?: string;
  numItems?: number;
  granularity?: "day" | "week" | "month";
}

/**
 * Time series data structure for charting
 */
export interface TimeSeriesData {
  timeKey: string;
  timeLabel: string;
  metrics: {
    sent: number;
    delivered: number;
    openedTracked: number;
    clickedTracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    complaintRate: number;
  };
}
