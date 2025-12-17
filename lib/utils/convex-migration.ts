// ============================================================================
// CONVEX MIGRATION UTILITIES - Data structure preparation for Convex
// ============================================================================

import { 
  CampaignAnalytics, 
  DomainAnalytics, 
  MailboxAnalytics, 
  LeadAnalytics, 
  TemplateAnalytics, 
  WarmupAnalytics,
  SequenceStepAnalytics,
  DailyWarmupStats
} from "@/types/analytics/domain-specific";
import { PerformanceMetrics, TimeSeriesDataPoint } from "@/types/analytics/core";
import { AnalyticsCalculator } from "./analytics-calculator";

/**
 * Type definitions for legacy data structures
 */
interface LegacyDataBase {
  id?: string;
  name?: string;
  sent?: number;
  delivered?: number;
  opens?: number;
  opened_tracked?: number;
  clicks?: number;
  clicked_tracked?: number;
  replied?: number;
  replies?: number;
  bounced?: number;
  unsubscribed?: number;
  spamFlags?: number;
  spamComplaints?: number;
  status?: string;
  [key: string]: unknown;
}

interface LegacyCampaignData extends LegacyDataBase {
  campaignId?: string;
  campaignName?: string;
  leadCount?: number;
  totalLeads?: number;
  activeLeads?: number;
  completedLeads?: number;
}

interface LegacyDomainData extends LegacyDataBase {
  domainId?: string;
  domainName?: string;
  domain?: string;
  spf?: boolean;
  dkim?: boolean;
  dmarc?: boolean;
  authentication?: {
    spf?: boolean;
    dkim?: boolean;
    dmarc?: boolean;
  };
  metrics?: LegacyDataBase;
}

interface LegacyMailboxData extends LegacyDataBase {
  mailboxId?: string;
  email?: string;
  domain?: string;
  provider?: string;
  warmupStatus?: string;
  warmupProgress?: number;
  dailyLimit?: number;
  currentVolume?: number;
  sent24h?: number;
  reputation?: string | number;
  healthScore?: number;
}

interface LegacySequenceStepData extends LegacyDataBase {
  stepId?: string;
  type?: string;
  subject?: string;
  duration?: string | number;
  sequenceOrder?: number;
}

interface LegacyLeadData extends LegacyDataBase {
  leadId?: string;
  email?: string;
  company?: string;
  companyName?: string;
  engagement?: LegacyDataBase;
}

interface LegacyTemplateData extends LegacyDataBase {
  templateId?: string;
  templateName?: string;
  category?: string;
  usage?: number;
  usageCount?: number;
  performance?: LegacyDataBase;
}

interface LegacyWarmupData {
  totalWarmups?: number;
  spamFlags?: number;
  spamComplaints?: number;
  replies?: number;
  progressPercentage?: number;
  warmupProgress?: number;
  dailyStats?: LegacyDailyWarmupStats[];
}

interface LegacyDailyWarmupStats {
  date?: string;
  emailsWarmed?: number;
  totalWarmups?: number;
  delivered?: number;
  spamFlags?: number;
  spamComplaints?: number;
  replies?: number;
  bounced?: number;
  healthScore?: number;
}

interface LegacyTimeSeriesPoint {
  date?: string;
  label?: string;
  sent?: number;
  delivered?: number;
  opens?: number;
  opened_tracked?: number;
  clicks?: number;
  clicked_tracked?: number;
  replied?: number;
  replies?: number;
  bounced?: number;
  unsubscribed?: number;
  spamFlags?: number;
  spamComplaints?: number;
}

export interface LegacyBillingData {
  date?: string;
  planType?: string;
  plan?: string;
  usage?: {
    emailsSent?: number;
    emails_sent?: number;
    sent?: number;
    emailsRemaining?: number;
    emails_remaining?: number;
    remaining?: number;
    domainsUsed?: number;
    domains_used?: number;
    domains?: number;
    domainsLimit?: number;
    domains_limit?: number;
    max_domains?: number;
    mailboxesUsed?: number;
    mailboxes_used?: number;
    mailboxes?: number;
    mailboxesLimit?: number;
    mailboxes_limit?: number;
    max_mailboxes?: number;
  };
  costs?: {
    currentPeriod?: number;
    current_period?: number;
    amount?: number;
    projectedCost?: number;
    projected_cost?: number;
    projected?: number;
    currency?: string;
  };
  billing?: {
    currentPeriod?: number;
    current_period?: number;
    amount?: number;
    projectedCost?: number;
    projected_cost?: number;
    projected?: number;
    currency?: string;
  };
  [key: string]: unknown;
}

/**
 * Utilities for preparing analytics data structures for Convex migration.
 * Ensures all data is Convex-compatible (JSON serializable, no functions).
 */
export class ConvexMigrationUtils {
  
  // ============================================================================
  // CAMPAIGN ANALYTICS MIGRATION
  // ====================================================================
  
  /**
   * Convert legacy campaign data to Convex-compatible CampaignAnalytics format.
   */
  static migrateCampaignData(legacyData: LegacyCampaignData): CampaignAnalytics {
    // Handle field name migrations
    const opened_tracked = legacyData.opens ?? legacyData.opened_tracked ?? 0;
    const clicked_tracked = legacyData.clicks ?? legacyData.clicked_tracked ?? 0;
    const spamComplaints = legacyData.spamFlags ?? legacyData.spamComplaints ?? 0;
    
    // Calculate delivered if not provided
    const delivered = legacyData.delivered ?? (legacyData?.sent ?? 0 - (legacyData.bounced ?? 0));
    
    // Ensure all required fields are present with defaults
    const migratedData: CampaignAnalytics = {
      id: legacyData.campaignId ?? legacyData.id ?? "",
      name: legacyData.campaignName ?? legacyData.name ?? "",
      campaignId: legacyData.campaignId ?? legacyData.id ?? "",
      campaignName: legacyData.campaignName ?? legacyData.name ?? "",
      status: this.normalizeCampaignStatus(legacyData.status),
      leadCount: legacyData.leadCount ?? legacyData.totalLeads ?? 0,
      activeLeads: legacyData.activeLeads ?? 0,
      completedLeads: legacyData.completedLeads ?? 0,
      
      // Standardized performance metrics
      sent: legacyData.sent ?? 0,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied: legacyData.replied ?? legacyData.replies ?? 0,
      bounced: legacyData.bounced ?? 0,
      unsubscribed: legacyData.unsubscribed ?? 0,
      spamComplaints,
      
      updatedAt: Date.now(),
    };
    
    // Validate the migrated data using base performance metrics
    const baseMetrics: PerformanceMetrics = {
      sent: migratedData.sent,
      delivered: migratedData.delivered,
      opened_tracked: migratedData.opened_tracked,
      clicked_tracked: migratedData.clicked_tracked,
      replied: migratedData.replied,
      bounced: migratedData.bounced,
      unsubscribed: migratedData.unsubscribed,
      spamComplaints: migratedData.spamComplaints,
    };
    
    const validation = AnalyticsCalculator.validateMetrics(baseMetrics);
    if (!validation.isValid) {
      console.warn("Campaign data validation failed:", validation.errors);
      // Apply corrections for common issues
      migratedData.delivered = Math.min(migratedData.delivered, migratedData.sent);
      migratedData.opened_tracked = Math.min(migratedData.opened_tracked, migratedData.delivered);
      migratedData.clicked_tracked = Math.min(migratedData.clicked_tracked, migratedData.opened_tracked);
    }
    
    return migratedData;
  }
  
  /**
   * Convert legacy sequence step data to Convex-compatible format.
   */
  static migrateSequenceStepData(legacyStep: LegacySequenceStepData, _campaignId: string): SequenceStepAnalytics {
    const opened_tracked = legacyStep.opens ?? legacyStep.opened_tracked ?? 0;
    const clicked_tracked = legacyStep.clicks ?? legacyStep.clicked_tracked ?? 0;
    const delivered = legacyStep.delivered ?? (legacyStep.sent ?? 0 - (legacyStep.bounced ?? 0));
    
    return {
      stepId: legacyStep.stepId ?? legacyStep.id ?? "",
      stepType: legacyStep.type ?? "email",
      subject: legacyStep.subject,
      waitDuration: legacyStep.duration ? this.parseDuration(legacyStep.duration) : undefined,
      sequenceOrder: legacyStep.sequenceOrder ?? 0,
      
      // Performance metrics
      sent: legacyStep.sent ?? 0,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied: legacyStep.replied ?? legacyStep.replies ?? 0,
      bounced: legacyStep.bounced ?? 0,
      unsubscribed: legacyStep.unsubscribed ?? 0,
      spamComplaints: legacyStep.spamFlags ?? legacyStep.spamComplaints ?? 0,
    };
  }
  
  // ============================================================================
  // DOMAIN ANALYTICS MIGRATION
  // ============================================================================
  
  /**
   * Convert legacy domain data to Convex-compatible DomainAnalytics format.
   */
  static migrateDomainData(legacyData: LegacyDomainData): DomainAnalytics {
    // Extract metrics from nested structure if present
    const metrics = legacyData.metrics ?? legacyData;
    const opened_tracked = metrics.opens ?? metrics.opened_tracked ?? 0;
    const clicked_tracked = metrics.clicks ?? metrics.clicked_tracked ?? 0;
    const delivered = metrics.delivered ?? (metrics.sent ?? 0 - (metrics.bounced ?? 0));
    
    return {
      id: legacyData.domainId ?? legacyData.id ?? "",
      name: legacyData.domainName ?? legacyData.name ?? legacyData.domain ?? "",
      domainId: legacyData.domainId ?? legacyData.id ?? "",
      domainName: legacyData.domainName ?? legacyData.name ?? legacyData.domain ?? "",
      
      // Authentication status
      authentication: {
        spf: legacyData.spf ?? legacyData.authentication?.spf ?? false,
        dkim: legacyData.dkim ?? legacyData.authentication?.dkim ?? false,
        dmarc: legacyData.dmarc ?? legacyData.authentication?.dmarc ?? false,
      },
      
      // Aggregated performance metrics (from all mailboxes in domain)
      aggregatedMetrics: {
        sent: metrics.sent ?? 0,
        delivered,
        opened_tracked,
        clicked_tracked,
        replied: metrics.replied ?? metrics.replies ?? 0,
        bounced: metrics.bounced ?? 0,
        unsubscribed: metrics.unsubscribed ?? 0,
        spamComplaints: metrics.spamFlags ?? metrics.spamComplaints ?? 0,
      },
      
      // Base analytics fields
      sent: metrics.sent ?? 0,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied: metrics.replied ?? metrics.replies ?? 0,
      bounced: metrics.bounced ?? 0,
      unsubscribed: metrics.unsubscribed ?? 0,
      spamComplaints: metrics.spamFlags ?? metrics.spamComplaints ?? 0,
      
      updatedAt: Date.now(),
    };
  }
  
  // ============================================================================
  // MAILBOX ANALYTICS MIGRATION
  // ============================================================================
  
  /**
   * Convert legacy mailbox data to Convex-compatible MailboxAnalytics format.
   */
  static migrateMailboxData(legacyData: LegacyMailboxData): MailboxAnalytics {
    const opened_tracked = legacyData.opens ?? legacyData.opened_tracked ?? 0;
    const clicked_tracked = legacyData.clicks ?? legacyData.clicked_tracked ?? 0;
    const delivered = legacyData.delivered ?? (legacyData.sent ?? 0- (legacyData.bounced ?? 0));
    
    return {
      id: legacyData.mailboxId ?? legacyData.id ?? "",
      name: legacyData.email ?? legacyData.name ?? "",
      mailboxId: legacyData.mailboxId ?? legacyData.id ?? "",
      email: legacyData.email ?? "",
      domain: legacyData.domain ?? "",
      provider: legacyData.provider ?? "",
      
      // Warmup data
      warmupStatus: this.normalizeWarmupStatus(legacyData.warmupStatus),
      warmupProgress: legacyData.warmupProgress ?? 0,
      dailyLimit: legacyData.dailyLimit ?? 0,
      currentVolume: legacyData.currentVolume ?? legacyData.sent24h ?? 0,
      
      // Health score (calculated, not stored)
      healthScore: this.calculateHealthScoreFromLegacy(legacyData),
      
      // Performance metrics
      sent: legacyData.sent ?? 0,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied: legacyData.replied ?? legacyData.replies ?? 0,
      bounced: legacyData.bounced ?? 0,
      unsubscribed: legacyData.unsubscribed ?? 0,
      spamComplaints: legacyData.spamFlags ?? legacyData.spamComplaints ?? 0,
      
      updatedAt: Date.now(),
    };
  }
  
  /**
   * Convert legacy warmup data to Convex-compatible WarmupAnalytics format.
   */
  static migrateWarmupData(legacyData: LegacyWarmupData, mailboxId: string): WarmupAnalytics {
    return {
      mailboxId,
      totalWarmups: legacyData.totalWarmups ?? 0,
      spamComplaints: legacyData.spamFlags ?? legacyData.spamComplaints ?? 0,
      replies: legacyData.replies ?? 0,
      progressPercentage: legacyData.progressPercentage ?? legacyData.warmupProgress ?? 0,
      dailyStats: legacyData.dailyStats?.map((stat: LegacyDailyWarmupStats) => this.migrateDailyWarmupStats(stat)) ?? [],
    };
  }
  
  /**
   * Convert legacy daily warmup stats to standardized format.
   */
  static migrateDailyWarmupStats(legacyStats: LegacyDailyWarmupStats): DailyWarmupStats {
    return {
      date: legacyStats.date ?? "",
      emailsWarmed: legacyStats.emailsWarmed ?? legacyStats.totalWarmups ?? 0,
      delivered: legacyStats.delivered ?? legacyStats.emailsWarmed ?? 0,
      spamComplaints: legacyStats.spamFlags ?? legacyStats.spamComplaints ?? 0,
      replies: legacyStats.replies ?? 0,
      bounced: legacyStats.bounced ?? 0,
      healthScore: legacyStats.healthScore ?? 0,
    };
  }
  
  // ============================================================================
  // TIME SERIES DATA MIGRATION
  // ============================================================================
  
  /**
   * Convert legacy time series data to standardized format.
   */
  static migrateTimeSeriesData(legacyData: LegacyTimeSeriesPoint[]): TimeSeriesDataPoint[] {
    return legacyData.map(point => ({
      date: point.date ?? "",
      label: point.label ?? point.date ?? "",
      metrics: {
        sent: point.sent ?? 0,
        delivered: point.delivered ?? (point.sent ?? 0- (point.bounced ?? 0)),
        opened_tracked: point.opens ?? point.opened_tracked ?? 0,
        clicked_tracked: point.clicks ?? point.clicked_tracked ?? 0,
        replied: point.replied ?? point.replies ?? 0,
        bounced: point.bounced ?? 0,
        unsubscribed: point.unsubscribed ?? 0,
        spamComplaints: point.spamFlags ?? point.spamComplaints ?? 0,
      },
    }));
  }
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Normalize campaign status to standard enum values.
   */
  private static normalizeCampaignStatus(status: unknown): "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT" {
    if (!status) return "DRAFT";
    const normalized = status.toString().toUpperCase();
    if (["ACTIVE", "RUNNING"].includes(normalized)) return "ACTIVE";
    if (["PAUSED", "STOPPED"].includes(normalized)) return "PAUSED";
    if (["COMPLETED", "FINISHED", "DONE"].includes(normalized)) return "COMPLETED";
    return "DRAFT";
  }
  
  /**
   * Normalize warmup status to standard enum values.
   */
  private static normalizeWarmupStatus(status: unknown): "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED" {
    if (!status) return "NOT_STARTED";
    const normalized = status.toString().toUpperCase();
    if (["WARMING", "ACTIVE"].includes(normalized)) return "WARMING";
    if (["WARMED", "READY", "COMPLETED"].includes(normalized)) return "WARMED";
    if (["PAUSED", "STOPPED", "SUSPENDED"].includes(normalized)) return "PAUSED";
    return "NOT_STARTED";
  }
  
  /**
   * Parse duration string to hours (for wait steps).
   */
  private static parseDuration(duration: string | number): number {
    if (typeof duration === "number") return duration;
    
    const match = duration.match(/(\d+)\s*(day|hour|minute)s?/i);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case "day": return value * 24;
      case "hour": return value;
      case "minute": return value / 60;
      default: return 0;
    }
  }
  
  /**
   * Calculate health score from legacy data that might have stored reputation.
   */
  private static calculateHealthScoreFromLegacy(legacyData: LegacyMailboxData): number {
    // If we have performance metrics, calculate from those
    if (legacyData.sent || legacyData.delivered) {
      const baseMetrics: PerformanceMetrics = {
        sent: legacyData.sent ?? 0,
        delivered: legacyData.delivered ?? ((legacyData.sent ?? 0) - (legacyData.bounced ?? 0)),
        opened_tracked: legacyData.opens ?? legacyData.opened_tracked ?? 0,
        clicked_tracked: legacyData.clicks ?? legacyData.clicked_tracked ?? 0,
        replied: legacyData.replied ?? legacyData.replies ?? 0,
        bounced: legacyData.bounced ?? 0,
        unsubscribed: legacyData.unsubscribed ?? 0,
        spamComplaints: legacyData.spamFlags ?? legacyData.spamComplaints ?? 0,
      };
      return AnalyticsCalculator.calculateHealthScore(baseMetrics);
    }
    
    // Fallback to legacy reputation if available
    if (legacyData.reputation) {
      const reputation = typeof legacyData.reputation === "string" 
        ? parseFloat(legacyData.reputation) 
        : legacyData.reputation;
      
      // Convert different reputation scales to 0-100
      if (reputation <= 1) return Math.round(reputation * 100); // 0-1 scale
      if (reputation <= 10) return Math.round(reputation * 10); // 0-10 scale
      return Math.min(100, Math.round(reputation)); // Already 0-100 scale
    }
    
    return 0; // No data available
  }
  
  // ============================================================================
  // BILLING ANALYTICS MIGRATION
  // ============================================================================
  
  /**
   * Convert legacy billing data to Convex-compatible BillingAnalytics format.
   */
  static transformBillingData(legacyData: LegacyBillingData, companyId: string): {
    companyId: string;
    date: string;
    planType: string;
    usage: {
      emailsSent: number;
      emailsRemaining: number;
      domainsUsed: number;
      domainsLimit: number;
      mailboxesUsed: number;
      mailboxesLimit: number;
    };
    costs: {
      currentPeriod: number;
      projectedCost: number;
      currency: string;
    };
  } {
    // Handle different legacy billing data formats
    const usage = legacyData.usage ?? legacyData;
    const costs = legacyData.costs ?? legacyData.billing ?? {};
    
    return {
      companyId,
      date: legacyData.date ?? new Date().toISOString().split("T")[0],
      planType: legacyData.planType ?? legacyData.plan ?? "starter",
      
      // Usage metrics with field name normalization
      usage: {
        emailsSent: Number(usage.emailsSent ?? usage.emails_sent ?? usage.sent ?? 0),
        emailsRemaining: Number(usage.emailsRemaining ?? usage.emails_remaining ?? usage.remaining ?? 0),
        domainsUsed: Number(usage.domainsUsed ?? usage.domains_used ?? usage.domains ?? 0),
        domainsLimit: Number(usage.domainsLimit ?? usage.domains_limit ?? usage.max_domains ?? 0),
        mailboxesUsed: Number(usage.mailboxesUsed ?? usage.mailboxes_used ?? usage.mailboxes ?? 0),
        mailboxesLimit: Number(usage.mailboxesLimit ?? usage.mailboxes_limit ?? usage.max_mailboxes ?? 0),
      },
      
      // Cost metrics with currency normalization
      costs: {
        currentPeriod: costs.currentPeriod ?? costs.current_period ?? costs.amount ?? 0,
        projectedCost: costs.projectedCost ?? costs.projected_cost ?? costs.projected ?? 0,
        currency: costs.currency ?? "USD",
      },
    };
  }
  
  /**
   * Migrate legacy lead data to Convex-compatible LeadAnalytics format.
   */
  static migrateLeadData(legacyData: LegacyLeadData): LeadAnalytics {
    const engagement = legacyData.engagement ?? legacyData;
    const opened_tracked = engagement.opens ?? engagement.opened_tracked ?? 0;
    const clicked_tracked = engagement.clicks ?? engagement.clicked_tracked ?? 0;
    const delivered = engagement.delivered ?? (engagement.sent ?? 0 - (engagement.bounced ?? 0));
    
    return {
      id: legacyData.leadId ?? legacyData.id ?? "",
      name: legacyData.email ?? legacyData.name ?? "",
      leadId: legacyData.leadId ?? legacyData.id ?? "",
      email: legacyData.email ?? "",
      company: legacyData.company ?? (legacyData.companyName || ''),
      status: this.normalizeLeadStatus(legacyData.status),
      
      // Engagement metrics
      engagement: {
        sent: engagement.sent ?? 0,
        delivered,
        opened_tracked,
        clicked_tracked,
        replied: engagement.replied ?? engagement.replies ?? 0,
        bounced: engagement.bounced ?? 0,
        unsubscribed: engagement.unsubscribed ?? 0,
        spamComplaints: engagement.spamFlags ?? engagement.spamComplaints ?? 0,
      },
      
      // Base analytics fields
      sent: engagement.sent ?? 0,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied: engagement.replied ?? engagement.replies ?? 0,
      bounced: engagement.bounced ?? 0,
      unsubscribed: engagement.unsubscribed ?? 0,
      spamComplaints: engagement.spamFlags ?? engagement.spamComplaints ?? 0,
      
      updatedAt: Date.now(),
    };
  }
  
  /**
   * Migrate legacy template data to Convex-compatible TemplateAnalytics format.
   */
  static migrateTemplateData(legacyData: LegacyTemplateData): TemplateAnalytics {
    const performance = legacyData.performance ?? legacyData;
    const opened_tracked = performance.opens ?? performance.opened_tracked ?? 0;
    const clicked_tracked = performance.clicks ?? performance.clicked_tracked ?? 0;
    const delivered = performance.delivered ?? (performance.sent ?? 0- (performance.bounced ?? 0));
    
    return {
      id: legacyData.templateId ?? legacyData.id ?? "",
      name: legacyData.templateName ?? legacyData.name ?? "",
      templateId: legacyData.templateId ?? legacyData.id ?? "",
      templateName: legacyData.templateName ?? legacyData.name ?? "",
      category: legacyData.category ?? "",
      usage: legacyData.usage ?? legacyData.usageCount ?? 0,
      
      // Performance metrics from template usage
      performance: {
        sent: performance.sent ?? 0,
        delivered,
        opened_tracked,
        clicked_tracked,
        replied: performance.replied ?? performance.replies ?? 0,
        bounced: performance.bounced ?? 0,
        unsubscribed: performance.unsubscribed ?? 0,
        spamComplaints: performance.spamFlags ?? performance.spamComplaints ?? 0,
      },
      
      // Base analytics fields
      sent: performance.sent ?? 0,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied: performance.replied ?? performance.replies ?? 0,
      bounced: performance.bounced ?? 0,
      unsubscribed: performance.unsubscribed ?? 0,
      spamComplaints: performance.spamFlags ?? performance.spamComplaints ?? 0,
      
      updatedAt: Date.now(),
    };
  }
  
  /**
   * Normalize lead status to standard enum values.
   */
  private static normalizeLeadStatus(status: unknown): "ACTIVE" | "REPLIED" | "BOUNCED" | "UNSUBSCRIBED" | "COMPLETED" {
    if (!status) return "ACTIVE";
    const normalized = status.toString().toUpperCase();
    if (["REPLIED", "RESPONDED"].includes(normalized)) return "REPLIED";
    if (["BOUNCED", "BOUNCE"].includes(normalized)) return "BOUNCED";
    if (["UNSUBSCRIBED", "UNSUBSCRIBE", "OPTED_OUT"].includes(normalized)) return "UNSUBSCRIBED";
    if (["COMPLETED", "FINISHED", "DONE"].includes(normalized)) return "COMPLETED";
    return "ACTIVE";
  }
  
  /**
   * Ensure all data is JSON serializable for Convex.
   */
  static ensureConvexCompatible<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }
  
  /**
   * Batch migrate multiple records with error handling.
   */
  static batchMigrate<T, U>(
    records: T[], 
    migrationFn: (record: T) => U,
    onError?: (error: Error, record: T) => void
  ): U[] {
    const migrated: U[] = [];
    
    for (const record of records) {
      try {
        const migratedRecord = migrationFn(record);
        migrated.push(migratedRecord);
      } catch (error) {
        if (onError) {
          onError(error as Error, record);
        } else {
          console.error("Migration error:", error, record);
        }
      }
    }
    
    return migrated;
  }
}
