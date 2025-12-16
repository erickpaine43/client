/**
 * Cross-Domain Analytics Service
 * 
 * Provides type definitions and business logic for analyzing the relationship
 * between mailboxes and domains in the email marketing system.
 */

import { DomainAnalytics } from "@/types/analytics/domain-specific";
import { MailboxAnalytics } from "@/types/analytics/domain-specific";

/**
 * Result of cross-domain performance analysis
 * Shows how mailboxes contribute to overall domain performance
 */
export interface CrossDomainAnalyticsResult {
    domainId: string;
    domainName: string;
    mailboxCount: number;
    domainHealthScore: number;

    // Capacity summary
    capacitySummary: {
        totalDailyLimit: number;
        totalCurrentVolume: number;
        utilizationRate: number;
    };

    // Warmup summary
    warmupSummary: {
        totalMailboxes: number;
        warmingMailboxes: number;
        warmedMailboxes: number;
        averageHealthScore: number;
    };

    // Performance metrics
    performanceMetrics: {
        totalSent: number;
        totalDelivered: number;
        totalOpened: number;
        totalClicked: number;
        totalReplied: number;
        totalBounced: number;
        deliveryRate: number;
        openRate: number;
        clickRate: number;
        replyRate: number;
        bounceRate: number;
    };
}

/**
 * Time series data point for cross-domain analytics
 */
export interface CrossDomainTimeSeriesDataPoint {
    date: string;
    label: string;
    domainId: string;

    // Domain metrics
    domainMetrics: {
        sent: number;
        delivered: number;
        opened_tracked: number;
        clicked_tracked: number;
        replied: number;
        bounced: number;
    };

    // Domain health
    domainHealthScore: number;

    // Mailbox insights
    mailboxInsights: {
        activeMailboxes: number;
        warmingMailboxes: number;
        totalCapacity: number;
        currentVolume: number;
    };

    // Correlation metrics
    correlationMetrics: {
        capacityUtilization: number;
        averageMailboxHealth: number;
        performanceIndex: number;
    };
}

/**
 * Mailbox impact analysis for a specific domain
 */
export interface MailboxDomainImpactAnalysis {
    domainId: string;
    domainName: string;

    // Summary statistics
    summary: {
        totalMailboxes: number;
        positiveImpactMailboxes: number;
        negativeImpactMailboxes: number;
        neutralImpactMailboxes: number;
        averageImpactScore: number;
    };

    // Individual mailbox impact
    mailboxImpactAnalysis: Array<{
        mailboxId: string;
        email: string;
        impactScore: number;
        impactClassification: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
        contributionMetrics: {
            volumeContribution: number;
            deliveryContribution: number;
            engagementContribution: number;
        };
        healthFactors: {
            warmupStatus: string;
            healthScore: number;
            reputationScore: number;
        };
    }>;
}

/**
 * Correlation analysis between mailbox and domain performance
 */
export interface CorrelationAnalysis {
    domainId: string;
    domainName: string;

    // Overall correlation
    overallCorrelation: number;
    correlationStrength: "STRONG" | "MODERATE" | "WEAK";

    // Mailbox correlations
    mailboxCorrelations: Array<{
        mailboxId: string;
        email: string;
        correlationScore: number;
        correlationDirection: "POSITIVE" | "NEGATIVE";
        insights: string[];
    }>;
}

/**
 * Helper function to calculate domain health score
 */
export function calculateDomainHealthScore(
    deliveryRate: number,
    bounceRate: number,
    spamRate: number,
    engagementRate: number
): number {
    // Weighted scoring algorithm
    const deliveryWeight = 0.4;
    const bounceWeight = 0.3;
    const spamWeight = 0.2;
    const engagementWeight = 0.1;

    const deliveryScore = deliveryRate * 100;
    const bounceScore = (1 - bounceRate) * 100;
    const spamScore = (1 - spamRate) * 100;
    const engagementScore = engagementRate * 100;

    const healthScore =
        deliveryScore * deliveryWeight +
        bounceScore * bounceWeight +
        spamScore * spamWeight +
        engagementScore * engagementWeight;

    return Math.round(Math.max(0, Math.min(100, healthScore)));
}

/**
 * Helper function to calculate mailbox impact score
 */
export function calculateMailboxImpactScore(
    mailbox: MailboxAnalytics,
    domainAverage: {
        deliveryRate: number;
        engagementRate: number;
        bounceRate: number;
    }
): number {
    const mailboxDeliveryRate = mailbox.delivered / (mailbox.sent || 1);
    const mailboxEngagementRate =
        (mailbox.opened_tracked + mailbox.clicked_tracked + mailbox.replied) /
        (mailbox.delivered || 1);
    const mailboxBounceRate = mailbox.bounced / (mailbox.sent || 1);

    // Compare to domain average
    const deliveryDelta = mailboxDeliveryRate - domainAverage.deliveryRate;
    const engagementDelta = mailboxEngagementRate - domainAverage.engagementRate;
    const bounceDelta = domainAverage.bounceRate - mailboxBounceRate; // Inverse (lower is better)

    // Weighted impact score
    const impactScore =
        deliveryDelta * 40 +
        engagementDelta * 30 +
        bounceDelta * 30 +
        50; // Base score

    return Math.round(Math.max(0, Math.min(100, impactScore)));
}

/**
 * Classify impact based on score
 */
export function classifyImpact(
    score: number
): "POSITIVE" | "NEGATIVE" | "NEUTRAL" {
    if (score >= 60) return "POSITIVE";
    if (score <= 40) return "NEGATIVE";
    return "NEUTRAL";
}

/**
 * Calculate correlation strength
 */
export function calculateCorrelationStrength(
    correlation: number
): "STRONG" | "MODERATE" | "WEAK" {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation >= 0.7) return "STRONG";
    if (absCorrelation >= 0.4) return "MODERATE";
    return "WEAK";
}
