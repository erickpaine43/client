// ============================================================================
// DOMAIN-SPECIFIC ANALYTICS TYPES - Data models for each domain
// ============================================================================

import { BaseAnalytics, PerformanceMetrics } from "./core";

/**
 * Campaign analytics data structure (data layer only).
 * Contains only raw data, no UI formatting or display logic.
 */
export interface CampaignAnalytics extends BaseAnalytics {
  /** Campaign ID */
  campaignId: string;
  /** Campaign name */
  campaignName: string;
  /** Campaign status */
  status: CampaignStatus;
  /** Total number of leads in campaign */
  leadCount: number;
  /** Number of active leads */
  activeLeads: number;
  /** Number of completed leads */
  completedLeads: number;
}

/**
 * Domain analytics data structure (data layer only).
 * No stored reputation - calculated from mailbox data.
 */
export interface DomainAnalytics extends BaseAnalytics {
  /** Domain ID */
  domainId: string;
  /** Domain name */
  domainName: string;
  /** Authentication status */
  authentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
  /** Aggregated metrics from all mailboxes in domain */
  aggregatedMetrics: PerformanceMetrics;
}

/**
 * Mailbox analytics data structure (data layer only).
 * Contains only raw data, no UI formatting.
 */
export interface MailboxAnalytics extends BaseAnalytics {
  /** Mailbox ID */
  mailboxId: string;
  /** Email address */
  email: string;
  /** Domain name */
  domain: string;
  /** Email provider */
  provider: string;
  /** Warmup status */
  warmupStatus: WarmupStatus;
  /** Warmup progress (0-100) */
  warmupProgress: number;
  /** Daily sending limit */
  dailyLimit: number;
  /** Current daily volume */
  currentVolume: number;
  /** Health score (calculated from reputation factors) */
  healthScore: number;
}

/**
 * Lead analytics data structure (data layer only).
 */
export interface LeadAnalytics extends BaseAnalytics {
  /** Lead ID */
  leadId: string;
  /** Lead email */
  email: string;
  /** Company name */
  company: string;
  /** Lead status */
  status: LeadStatus;
  /** Engagement metrics */
  engagement: PerformanceMetrics;
}

/**
 * Template analytics data structure (data layer only).
 * No stored rates - calculated from usage statistics.
 */
export interface TemplateAnalytics extends BaseAnalytics {
  /** Template ID */
  templateId: string;
  /** Template name */
  templateName: string;
  /** Template category */
  category: string;
  /** Usage count */
  usage: number;
  /** Performance metrics from template usage */
  performance: PerformanceMetrics;
}

/**
 * Billing analytics data structure (data layer only).
 */
export interface BillingAnalytics extends BaseAnalytics {
  /** Company ID */
  companyId: string;
  /** Plan type */
  planType: string;
  /** Usage metrics */
  usage: {
    emailsSent: number;
    emailsRemaining: number;
    domainsUsed: number;
    domainsLimit: number;
    mailboxesUsed: number;
    mailboxesLimit: number;
  };
  /** Cost metrics */
  costs: {
    currentPeriod: number;
    projectedCost: number;
    currency: string;
  };
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export type CampaignStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT";

export type WarmupStatus = "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED";

export type LeadStatus = "ACTIVE" | "REPLIED" | "BOUNCED" | "UNSUBSCRIBED" | "COMPLETED";

/**
 * Sequence step analytics (part of campaign analytics).
 */
export interface SequenceStepAnalytics extends PerformanceMetrics {
  /** Step ID */
  stepId: string;
  /** Step type */
  stepType: "email" | "wait" | "action" | string;
  /** Email subject (if email step) */
  subject?: string;
  /** Wait duration (if wait step) */
  waitDuration?: number;
  sequenceOrder?: number;
}

/**
 * Warmup analytics data structure (data layer only).
 */
export interface WarmupAnalytics {
  /** Mailbox ID */
  mailboxId: string;
  /** Total warmup emails sent */
  totalWarmups: number;
  /** Spam complaints during warmup */
  spamComplaints: number;
  /** Replies during warmup */
  replies: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** Daily warmup statistics */
  dailyStats: DailyWarmupStats[];
}

/**
 * Daily warmup statistics (data layer only).
 */
export interface DailyWarmupStats {
  /** Date in ISO format */
  date: string;
  /** Emails warmed on this day */
  emailsWarmed: number;
  /** Emails delivered */
  delivered: number;
  /** Spam complaints */
  spamComplaints: number;
  /** Replies received */
  replies: number;
  /** Bounced emails */
  bounced: number;
  /** Health score (0-100) */
  healthScore: number;
}
