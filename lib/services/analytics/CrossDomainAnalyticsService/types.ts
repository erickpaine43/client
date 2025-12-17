import { PerformanceMetrics } from "@/types/analytics/core";

/**
 * Cross-domain analytics result combining mailbox and domain data.
 */
export interface CrossDomainAnalyticsResult {
  domainId: string;
  domainName: string;
  authentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };

  // Domain-level metrics
  domainMetrics: PerformanceMetrics;
  domainHealthScore: number;
  domainReputation: number;

  // Mailbox-level aggregated metrics
  mailboxAggregatedMetrics: PerformanceMetrics;

  // Mailbox details
  mailboxes: Array<{
    mailboxId: string;
    email: string;
    provider: string;
    warmupStatus: string;
    warmupProgress: number;
    healthScore: number;
    dailyLimit: number;
    currentVolume: number;
    performance: PerformanceMetrics;
  }>;

  mailboxCount: number;

  // Summary insights
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
 * Cross-domain time series data point.
 */
export interface CrossDomainTimeSeriesDataPoint {
  date: string;
  domainId: string;
  label: string;

  // Domain metric from mailboxes
  domainMetrics: PerformanceMetrics;
  domainHealthScore: number;

  // Mailbox insights affecting domain performance
  mailboxInsights: {
    totalMailboxes: number;
    activeMailboxes: number;
    warmingMailboxes: number;
    averageWarmupProgress: number;
    totalCapacity: number;
    totalVolume: number;
  };

  // Cross-domain correlation metrics
  correlationMetrics: {
    mailboxContribution: number;
    healthImpact: number;
    capacityUtilization: number;
  };
}

/**
 * Mailbox impact analysis on domain performance.
 */
export interface MailboxDomainImpactAnalysis {
  domainId: string;
  totalDomainMetrics: PerformanceMetrics;
  domainPerformanceRates: {
    deliveryRate: number;
    clickRate: number;
    openRate: number;
    replyRate: number;
    bounceRate: number;
    spamRate: number;
  };

  mailboxImpactAnalysis: Array<{
    mailboxId: string;
    email: string;
    provider: string;
    warmupStatus: string;
    warmupProgress: number;

    metrics: PerformanceMetrics;
    contribution: {
      sentContribution: number;
      deliveredContribution: number;
      openedContribution: number;
      repliedContribution: number;
      bouncedContribution: number;
      spamContribution: number;
    };

    performanceRates: {
      deliveryRate: number;
      openRate: number;
      replyRate: number;
      bounceRate: number;
      spamRate: number;
      clickRate: number;
    };

    performanceImpact: {
      deliveryImpact: number;
      openImpact: number;
      replyImpact: number;
      bounceImpact: number;
      spamImpact: number;
    };

    impactScore: number;
    impactClassification: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  }>;

  summary: {
    totalMailboxes: number;
    positiveImpactMailboxes: number;
    neutralImpactMailboxes: number;
    negativeImpactMailboxes: number;
    averageImpactScore: number;
  };
}
