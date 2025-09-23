/**
 * Campaign Actions Types
 *
 * Type definitions for campaign-related actions and data structures.
 */

/**
 * Campaign filters for querying
 */
export interface CampaignFilters {
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  userId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Campaign summary statistics
 */
export interface CampaignSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  emailsSent: number;
  totalReplies: number;
  averageOpenRate: number;
  averageReplyRate: number;
}

/**
 * Campaign creation data
 */
export interface CampaignCreateData {
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  tags?: string[];
  settings?: {
    timezone?: string;
    sendingSchedule?: {
      startTime: string;
      endTime: string;
      days: number[];
    };
  };
}

/**
 * Campaign update data
 */
export interface CampaignUpdateData extends Partial<CampaignCreateData> {
  id: string;
}

/**
 * Campaign analytics data
 */
export interface CampaignAnalyticsData {
  campaignId: string;
  date: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed?: number;
  spamComplaints?: number;
}

/**
 * Time series data point for campaign analytics
 */
export interface CampaignTimeSeriesPoint {
  date: string;
  formattedDate: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  // Legacy fields for backward compatibility
  opened: number;
  clicked: number;
}

/**
 * Sending account information
 */
export interface SendingAccount {
  id: string;
  email: string;
  provider: string;
  status: 'active' | 'inactive' | 'warming';
  dailyLimit: number;
  currentVolume: number;
}

/**
 * Sequence step information
 */
export interface SequenceStep {
  id: number;
  campaignId: number;
  stepNumber: number;
  type: 'email' | 'wait';
  subject?: string;
  content?: string;
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
}

/**
 * Campaign leads data
 */
export interface CampaignLead {
  id: number;
  name: string;
  email: string;
  company: string;
  status: string;
  currentStep: number;
  lastActivity: string;
  addedAt: string;
}
