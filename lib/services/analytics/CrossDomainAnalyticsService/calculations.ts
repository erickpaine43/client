import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { PerformanceMetrics } from "@/types/analytics/core";
import { CrossDomainAnalyticsResult } from "./types";

/**
 * Calculate correlation between mailbox and domain performance
 */
export function calculateMailboxDomainCorrelation(
  mailboxRates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>,
  domainRates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>
): {
  correlationScore: number;
  correlationStrength: "STRONG" | "MODERATE" | "WEAK";
  correlationDirection: "POSITIVE" | "NEGATIVE";
} {
  // Simple correlation calculation based on performance alignment
  let correlationScore = 0;
  const weights = { delivery: 0.3, open: 0.25, reply: 0.2, bounce: 0.15, spam: 0.1 };

  correlationScore += (mailboxRates.deliveryRate - domainRates.deliveryRate) * weights.delivery;
  correlationScore += (mailboxRates.openRate - domainRates.openRate) * weights.open;
  correlationScore += (mailboxRates.replyRate - domainRates.replyRate) * weights.reply;
  correlationScore -= Math.abs(mailboxRates.bounceRate - domainRates.bounceRate) * weights.bounce;
  correlationScore -= Math.abs(mailboxRates.spamRate - domainRates.spamRate) * weights.spam;

  // Normalize to 0-100 scale
  correlationScore = Math.max(0, Math.min(100, (correlationScore + 1) * 50));

  // Determine correlation strength and direction
  const correlationStrength = correlationScore >= 70 ? "STRONG" :
                             correlationScore >= 40 ? "MODERATE" : "WEAK";
  const correlationDirection = correlationScore >= 50 ? "POSITIVE" : "NEGATIVE";

  return {
    correlationScore: Math.round(correlationScore),
    correlationStrength,
    correlationDirection,
  };
}

/**
 * Generate insights based on mailbox performance relative to domain
 */
export function generateCorrelationInsights(
  mailboxRates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>,
  domainRates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>,
  warmupStatus: string,
  warmupProgress: number
): string[] {
  const insights: string[] = [];

  if (mailboxRates.deliveryRate > domainRates.deliveryRate + 0.05) {
    insights.push("Above-average delivery performance");
  }
  if (mailboxRates.openRate > domainRates.openRate + 0.05) {
    insights.push("Strong engagement rates");
  }
  if (mailboxRates.bounceRate > domainRates.bounceRate + 0.02) {
    insights.push("Higher bounce rate than domain average");
  }
  if (warmupStatus === "WARMING" && warmupProgress < 50) {
    insights.push("Still in warmup phase");
  }

  return insights;
}

/**
 * Aggregate mailbox metrics for domain-level calculations
 */
export function aggregateMailboxMetricsForDomain(mailboxes: CrossDomainAnalyticsResult['mailboxes']): {
  aggregatedMetrics: PerformanceMetrics;
  warmupSummary: CrossDomainAnalyticsResult['warmupSummary'];
  capacitySummary: CrossDomainAnalyticsResult['capacitySummary'];
} {
  const totalMailboxes = mailboxes.length;
  const warmingMailboxes = mailboxes.filter(m => m.warmupStatus === 'WARMING').length;
  const warmedMailboxes = mailboxes.filter(m => m.warmupStatus === 'WARMED').length;
  const averageWarmupProgress = totalMailboxes > 0 ? mailboxes.reduce((sum, m) => sum + m.warmupProgress, 0) / totalMailboxes : 0;
  const averageHealthScore = totalMailboxes > 0 ? mailboxes.reduce((sum, m) => sum + m.healthScore, 0) / totalMailboxes : 0;

  const totalDailyLimit = mailboxes.reduce((sum, m) => sum + m.dailyLimit, 0);
  const totalCurrentVolume = mailboxes.reduce((sum, m) => sum + m.currentVolume, 0);
  const utilizationRate = totalDailyLimit > 0 ? totalCurrentVolume / totalDailyLimit : 0;

  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(mailboxes.map(m => m.performance));

  return {
    aggregatedMetrics,
    warmupSummary: {
      totalMailboxes,
      warmingMailboxes,
      warmedMailboxes,
      averageWarmupProgress,
      averageHealthScore,
    },
    capacitySummary: {
      totalDailyLimit,
      totalCurrentVolume,
      utilizationRate,
    },
  };
}

/**
 * Calculate domain health score based on authentication and performance
 */
export function calculateDomainHealthScore(
  authentication: { spf: boolean; dkim: boolean; dmarc: boolean },
  performanceMetrics: PerformanceMetrics
): number {
  let score = 0;

  // Authentication score (40% weight)
  const authCount = [authentication.spf, authentication.dkim, authentication.dmarc].filter(Boolean).length;
  score += (authCount / 3) * 40;

  // Performance score (60% weight)
  const deliveryRate = performanceMetrics.delivered / Math.max(performanceMetrics.sent, 1);
  const bounceRate = performanceMetrics.bounced / Math.max(performanceMetrics.sent, 1);
  const performanceScore = Math.max(0, (deliveryRate - bounceRate) * 100);
  score += Math.min(60, performanceScore * 0.6);

  return Math.round(Math.min(100, Math.max(0, score)));
}
