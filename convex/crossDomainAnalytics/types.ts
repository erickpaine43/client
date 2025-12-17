// ============================================================================
// CROSS-DOMAIN ANALYTICS TYPES
// ============================================================================

/**
 * Metrics interface for email analytics
 */
export interface EmailMetrics {
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
 * Mailbox analytics record interface
 */
export interface MailboxAnalyticsRecord {
  mailboxId: string;
  email: string;
  provider: string;
  domain: string;
  date: string;
  companyId: string;
  dailyLimit: number;
  currentVolume: number;
  warmupStatus: string;
  warmupProgress: number;
  updatedAt: number;
}

/**
 * Time series group interface
 */
export interface TimeSeriesGroup {
  date: string;
  domainId: string;
  mailboxes: (MailboxAnalyticsRecord & EmailMetrics)[];
  aggregatedMetrics: EmailMetrics;
}

/**
 * Mailbox group interface for impact analysis
 */
export interface MailboxGroup {
  mailboxId: string;
  email: string;
  provider: string;
  warmupStatus: string;
  warmupProgress: number;
  records: (MailboxAnalyticsRecord & EmailMetrics)[];
}

/**
 * Query arguments for cross-domain analytics
 */
export interface CrossDomainAnalyticsQueryArgs {
  domainIds?: string[];
  mailboxIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  companyId: string;
  granularity?: "day" | "week" | "month";
}

/**
 * Domain analytics result interface
 */
export interface DomainAnalyticsResult {
  domainId: string;
  domainName: string;
  authentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
  domainMetrics: EmailMetrics;
  domainHealthScore: number;
  domainReputation: number;
  mailboxAggregatedMetrics: EmailMetrics;
  mailboxes: MailboxHealthData[];
  mailboxCount: number;
  warmupSummary: {
    totalMailboxes: number;
    warmingMailboxes: number;
    warmedMailboxes: number;
    averageWarmupProgress: number;
    averageHealthScore: number;
  };
  capacitySummary: {
    totalDailyLimit: number;
    totalCurrentVolume: number;
    utilizationRate: number;
  };
  updatedAt: number;
}

/**
 * Mailbox health data interface
 */
export interface MailboxHealthData {
  mailboxId: string;
  email: string;
  provider: string;
  warmupStatus: string;
  warmupProgress: number;
  healthScore: number;
  dailyLimit: number;
  currentVolume: number;
  performance: EmailMetrics;
}

/**
 * Time series analytics result interface
 */
export interface TimeSeriesAnalyticsResult {
  date: string;
  domainId: string;
  label: string;
  domainMetrics: EmailMetrics;
  domainHealthScore: number;
  mailboxInsights: {
    totalMailboxes: number;
    activeMailboxes: number;
    warmingMailboxes: number;
    averageWarmupProgress: number;
    totalCapacity: number;
    totalVolume: number;
  };
  correlationMetrics: {
    mailboxContribution: number;
    healthImpact: number;
    capacityUtilization: number;
  };
}

/**
 * Impact analysis result interface
 */
export interface ImpactAnalysisResult {
  domainId: string;
  totalDomainMetrics: EmailMetrics;
  mailboxGroups: {
    mailboxId: string;
    email: string;
    provider: string;
    warmupStatus: string;
    warmupProgress: number;
    metrics: EmailMetrics;
    healthScore: number;
    contributionPercentage: number;
    impactOnDomain: {
      deliveryImpact: number;
      reputationImpact: number;
      volumeImpact: number;
    };
  }[];
  domainHealthScore: number;
  averageMailboxHealthScore: number;
  updatedAt: number;
}
