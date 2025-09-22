'use server';

// ============================================================================
// CROSS-DOMAIN ANALYTICS SERVER ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/cross-domain-analytics.ts
//
// Migration notes:
// - All functions now use ConvexQueryHelper for consistent error handling
// - Standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved type safety and performance monitoring

import {
  getCrossDomainPerformanceComparison,
  getCrossDomainCorrelationAnalysis,
  getCrossDomainTrendAnalysis,
  getCrossDomainAggregatedMetrics,
  getCrossDomainTimeSeries,
  generateCrossDomainInsights,
  exportCrossDomainAnalytics,
  getCrossDomainAnalyticsHealth,
  type CrossDomainPerformanceComparison,
  type CrossDomainCorrelationAnalysis,
  type CrossDomainTrendAnalysis
} from './analytics/cross-domain-analytics';

// Re-export all functions for backward compatibility
export {
  getCrossDomainPerformanceComparison,
  getCrossDomainCorrelationAnalysis,
  getCrossDomainTrendAnalysis,
  getCrossDomainAggregatedMetrics,
  getCrossDomainTimeSeries,
  generateCrossDomainInsights,
  exportCrossDomainAnalytics,
  getCrossDomainAnalyticsHealth,
  type CrossDomainPerformanceComparison,
  type CrossDomainCorrelationAnalysis,
  type CrossDomainTrendAnalysis
};

// Legacy imports for backward compatibility
import { crossDomainAnalyticsService } from "@/lib/services/analytics/CrossDomainAnalyticsService";
import { 
  AnalyticsFilters, 
  PerformanceMetrics,
  AnalyticsComputeOptions 
} from "@/types/analytics/core";
import { MailboxDomainImpactAnalysis } from "@/lib/services/analytics/CrossDomainAnalyticsService";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { safeExtractCompanyId } from "@/lib/utils/analytics-mappers";

/**
 * Get comprehensive mailbox-domain joined analytics.
 * Shows unified view of how mailboxes contribute to domain performance.
 */
export async function getMailboxDomainJoinedAnalyticsAction(
  domainIds?: string[],
  mailboxIds?: string[],
  filters?: AnalyticsFilters
) {
  try {
    const companyId = safeExtractCompanyId(filters, "default");
    const joinedAnalytics = await crossDomainAnalyticsService.getMailboxDomainJoinedAnalytics(
      companyId,
      domainIds,
      mailboxIds,
      filters
    );

    // Enrich with calculated rates and formatted data
    const enrichedAnalytics = joinedAnalytics.map(domain => {
      const domainRates = AnalyticsCalculator.calculateAllRates(domain.domainMetrics);
      const mailboxAggregatedRates = AnalyticsCalculator.calculateAllRates(domain.mailboxAggregatedMetrics);
      
      // Calculate rates for each mailbox
      const enrichedMailboxes = domain.mailboxes.map(mailbox => {
        const mailboxRates = AnalyticsCalculator.calculateAllRates(mailbox.performance);
        
        return {
          ...mailbox,
          rates: mailboxRates,
          formattedRates: {
            deliveryRate: AnalyticsCalculator.formatRateAsPercentage(mailboxRates.deliveryRate),
            openRate: AnalyticsCalculator.formatRateAsPercentage(mailboxRates.openRate),
            clickRate: AnalyticsCalculator.formatRateAsPercentage(mailboxRates.clickRate),
            replyRate: AnalyticsCalculator.formatRateAsPercentage(mailboxRates.replyRate),
          },
          formattedMetrics: {
            sent: AnalyticsCalculator.formatNumber(mailbox.performance.sent),
            delivered: AnalyticsCalculator.formatNumber(mailbox.performance.delivered),
            opened: AnalyticsCalculator.formatNumber(mailbox.performance.opened_tracked),
            clicked: AnalyticsCalculator.formatNumber(mailbox.performance.clicked_tracked),
          },
        };
      });

      return {
        ...domain,
        domainRates,
        mailboxAggregatedRates,
        mailboxes: enrichedMailboxes,
        formattedDomainMetrics: {
          sent: AnalyticsCalculator.formatNumber(domain.domainMetrics.sent),
          delivered: AnalyticsCalculator.formatNumber(domain.domainMetrics.delivered),
          opened: AnalyticsCalculator.formatNumber(domain.domainMetrics.opened_tracked),
          clicked: AnalyticsCalculator.formatNumber(domain.domainMetrics.clicked_tracked),
        },
        formattedDomainRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(domainRates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(domainRates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(domainRates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(domainRates.replyRate),
        },
        // Add comparison between domain and mailbox aggregated metrics
        dataConsistency: {
          sentMatch: domain.domainMetrics.sent === domain.mailboxAggregatedMetrics.sent,
          deliveredMatch: domain.domainMetrics.delivered === domain.mailboxAggregatedMetrics.delivered,
          consistencyScore: calculateConsistencyScore(domain.domainMetrics, domain.mailboxAggregatedMetrics),
        },
      };
    });

    return {
      success: true,
      data: enrichedAnalytics,
      metadata: {
        totalDomains: enrichedAnalytics.length,
        totalMailboxes: enrichedAnalytics.reduce((sum, d) => sum + d.mailboxCount, 0),
        averageDomainHealth: enrichedAnalytics.length > 0
          ? Math.round(enrichedAnalytics.reduce((sum, d) => sum + d.domainHealthScore, 0) / enrichedAnalytics.length)
          : 0,
        averageMailboxHealth: enrichedAnalytics.length > 0
          ? Math.round(enrichedAnalytics.reduce((sum, d) => sum + d.warmupSummary.averageHealthScore, 0) / enrichedAnalytics.length)
          : 0,
        generatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error getting mailbox-domain joined analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get joined analytics",
      data: [],
    };
  }
}

/**
 * Get cross-domain time series data showing mailbox impact on domain metrics.
 */
export async function getCrossDomainTimeSeriesDataAction(
  domainIds?: string[],
  mailboxIds?: string[],
  filters?: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day"
) {
  try {
    const companyId = safeExtractCompanyId(filters, "default");
    const timeSeriesData = await crossDomainAnalyticsService.getCrossDomainTimeSeriesData(
      companyId,
      domainIds,
      mailboxIds,
      filters,
      granularity
    );

    // Enrich with calculated rates
    const enrichedTimeSeriesData = timeSeriesData.map(point => {
      const domainRates = AnalyticsCalculator.calculateAllRates(point.domainMetrics);
      
      return {
        ...point,
        domainRates,
        formattedDomainMetrics: {
          sent: AnalyticsCalculator.formatNumber(point.domainMetrics.sent),
          delivered: AnalyticsCalculator.formatNumber(point.domainMetrics.delivered),
          opened: AnalyticsCalculator.formatNumber(point.domainMetrics.opened_tracked),
          clicked: AnalyticsCalculator.formatNumber(point.domainMetrics.clicked_tracked),
        },
        formattedDomainRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(domainRates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(domainRates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(domainRates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(domainRates.replyRate),
        },
        formattedCorrelationMetrics: {
          capacityUtilization: AnalyticsCalculator.formatRateAsPercentage(point.correlationMetrics.capacityUtilization),
          mailboxContribution: AnalyticsCalculator.formatRateAsPercentage(point.correlationMetrics.mailboxContribution),
        },
      };
    });

    // Calculate summary statistics
    const totalMetrics = AnalyticsCalculator.aggregateMetrics(
      timeSeriesData.map(point => point.domainMetrics)
    );
    const totalRates = AnalyticsCalculator.calculateAllRates(totalMetrics);

    return {
      success: true,
      data: enrichedTimeSeriesData,
      summary: {
        totalMetrics,
        totalRates,
        formattedTotalRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(totalRates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(totalRates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(totalRates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(totalRates.replyRate),
        },
        dataPoints: enrichedTimeSeriesData.length,
        uniqueDomains: [...new Set(timeSeriesData.map(p => p.domainId))].length,
        dateRange: filters?.dateRange,
        granularity,
      },
      metadata: {
        generatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error getting cross-domain time series data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get cross-domain time series data",
      data: [],
    };
  }
}

/**
 * Get mailbox impact analysis showing how individual mailboxes affect domain performance.
 */
export async function getMailboxDomainImpactAnalysisAction(
  domainId: string,
  filters?: AnalyticsFilters
) {
  try {
    const companyId = safeExtractCompanyId(filters, "default");
    const impactAnalysis = await crossDomainAnalyticsService.getMailboxDomainImpactAnalysis(
      companyId,
      domainId,
      filters
    );

    // Enrich with formatted data
    const enrichedAnalysis = {
      ...impactAnalysis,
      formattedDomainMetrics: {
        sent: AnalyticsCalculator.formatNumber(impactAnalysis.totalDomainMetrics.sent),
        delivered: AnalyticsCalculator.formatNumber(impactAnalysis.totalDomainMetrics.delivered),
        opened: AnalyticsCalculator.formatNumber(impactAnalysis.totalDomainMetrics.opened_tracked),
        clicked: AnalyticsCalculator.formatNumber(impactAnalysis.totalDomainMetrics.clicked_tracked),
      },
      formattedDomainRates: {
        deliveryRate: AnalyticsCalculator.formatRateAsPercentage(impactAnalysis.domainPerformanceRates.deliveryRate),
        openRate: AnalyticsCalculator.formatRateAsPercentage(impactAnalysis.domainPerformanceRates.openRate),
        clickRate: AnalyticsCalculator.formatRateAsPercentage(impactAnalysis.domainPerformanceRates.clickRate),
        replyRate: AnalyticsCalculator.formatRateAsPercentage(impactAnalysis.domainPerformanceRates.replyRate),
      },
      mailboxImpactAnalysis: impactAnalysis.mailboxImpactAnalysis.map(mailbox => ({
        ...mailbox,
        formattedMetrics: {
          sent: AnalyticsCalculator.formatNumber(mailbox.metrics.sent),
          delivered: AnalyticsCalculator.formatNumber(mailbox.metrics.delivered),
          opened: AnalyticsCalculator.formatNumber(mailbox.metrics.opened_tracked),
          clicked: AnalyticsCalculator.formatNumber(mailbox.metrics.clicked_tracked),
        },
        formattedRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(mailbox.performanceRates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(mailbox.performanceRates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(mailbox.performanceRates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(mailbox.performanceRates.replyRate),
        },
        formattedContribution: {
          sentContribution: AnalyticsCalculator.formatRateAsPercentage(mailbox.contribution.sentContribution / 100),
          deliveredContribution: AnalyticsCalculator.formatRateAsPercentage(mailbox.contribution.deliveredContribution / 100),
          openedContribution: AnalyticsCalculator.formatRateAsPercentage(mailbox.contribution.openedContribution / 100),
          repliedContribution: AnalyticsCalculator.formatRateAsPercentage(mailbox.contribution.repliedContribution / 100),
        },
        formattedImpact: {
          deliveryImpact: formatImpactValue(mailbox.performanceImpact.deliveryImpact),
          openImpact: formatImpactValue(mailbox.performanceImpact.openImpact),
          replyImpact: formatImpactValue(mailbox.performanceImpact.replyImpact),
          bounceImpact: formatImpactValue(mailbox.performanceImpact.bounceImpact),
          spamImpact: formatImpactValue(mailbox.performanceImpact.spamImpact),
        },
      })),
    };

    return {
      success: true,
      data: enrichedAnalysis,
      insights: generateImpactInsights(enrichedAnalysis),
      metadata: {
        domainId,
        generatedAt: Date.now(),
        filters,
      },
    };
  } catch (error) {
    console.error("Error getting mailbox domain impact analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get impact analysis",
      data: null,
    };
  }
}

/**
 * Update cross-domain analytics when mailbox data changes.
 */
export async function updateCrossDomainAnalyticsAction(
  mailboxId: string,
  domain: string,
  companyId: string,
  date: string,
  mailboxMetrics: PerformanceMetrics
) {
  try {
    const result = await crossDomainAnalyticsService.updateCrossDomainAnalytics({
      mailboxId,
      domain,
      companyId,
      date,
      mailboxMetrics,
    });

    // Calculate rates for the updated metrics
    const rates = AnalyticsCalculator.calculateAllRates(result.aggregatedMetrics);
    const healthScore = AnalyticsCalculator.calculateHealthScore(result.aggregatedMetrics);

    return {
      success: true,
      data: {
        ...result,
        rates,
        healthScore,
        formattedMetrics: {
          sent: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.sent),
          delivered: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.delivered),
          opened: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.opened_tracked),
          clicked: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.clicked_tracked),
        },
        formattedRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(rates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        },
      },
      metadata: {
        updatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error updating cross-domain analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update cross-domain analytics",
      data: null,
    };
  }
}

/**
 * Get filtered cross-domain analytics with advanced filtering.
 */
export async function getFilteredCrossDomainAnalyticsAction(
  filters: AnalyticsFilters,
  options: AnalyticsComputeOptions = {}
) {
  try {
    const companyId = safeExtractCompanyId(filters, "default");
    const result = await crossDomainAnalyticsService.getFilteredCrossDomainAnalytics(
      companyId,
      filters,
      options
    );

    // Format the aggregated metrics
    const formattedResult = {
      ...result,
      formattedAggregatedMetrics: {
        sent: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.sent),
        delivered: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.delivered),
        opened: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.opened_tracked),
        clicked: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.clicked_tracked),
      },
      formattedRates: {
        deliveryRate: AnalyticsCalculator.formatRateAsPercentage(result.calculatedRates.deliveryRate),
        openRate: AnalyticsCalculator.formatRateAsPercentage(result.calculatedRates.openRate),
        clickRate: AnalyticsCalculator.formatRateAsPercentage(result.calculatedRates.clickRate),
        replyRate: AnalyticsCalculator.formatRateAsPercentage(result.calculatedRates.replyRate),
      },
      healthScore: AnalyticsCalculator.calculateHealthScore(result.aggregatedMetrics),
    };

    return {
      success: true,
      data: formattedResult,
      metadata: {
        filters,
        options,
        generatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error getting filtered cross-domain analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get filtered cross-domain analytics",
      data: null,
    };
  }
}

/**
 * Get cross-domain correlation insights.
 */
export async function getCrossDomainCorrelationInsightsAction(
  domainIds?: string[],
  filters?: AnalyticsFilters
) {
  try {
    const companyId = safeExtractCompanyId(filters, "default");
    const correlationInsights = await crossDomainAnalyticsService.getCrossDomainCorrelationInsights(
      companyId,
      domainIds,
      filters
    );

    // Add formatted correlation percentages
    const enrichedInsights = {
      ...correlationInsights,
      correlations: correlationInsights.correlations.map(domain => ({
        ...domain,
        formattedOverallCorrelation: `${domain.overallCorrelation}%`,
        mailboxCorrelations: domain.mailboxCorrelations.map(mailbox => ({
          ...mailbox,
          formattedCorrelationScore: `${mailbox.correlationScore}%`,
        })),
      })),
      formattedSummary: {
        ...correlationInsights.summary,
        averageCorrelation: `${correlationInsights.summary.averageCorrelation}%`,
        strongCorrelationPercentage: correlationInsights.correlations.length > 0
          ? AnalyticsCalculator.formatRateAsPercentage(
              correlationInsights.summary.strongCorrelations / 
              correlationInsights.correlations.flatMap(c => c.mailboxCorrelations).length
            )
          : "0%",
      },
    };

    return {
      success: true,
      data: enrichedInsights,
      recommendations: generateCorrelationRecommendations(enrichedInsights),
      metadata: {
        domainIds,
        generatedAt: Date.now(),
        filters,
      },
    };
  } catch (error) {
    console.error("Error getting cross-domain correlation insights:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get correlation insights",
      data: null,
    };
  }
}

/**
 * Get cross-domain analytics health check.
 */
export async function getCrossDomainAnalyticsHealthCheckAction() {
  try {
    const isHealthy = await crossDomainAnalyticsService.healthCheck();

    return {
      success: true,
      data: {
        healthy: isHealthy,
        service: "cross-domain-analytics",
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error checking cross-domain analytics health:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Health check failed",
      data: {
        healthy: false,
        service: "cross-domain-analytics",
        timestamp: Date.now(),
      },
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate consistency score between domain and mailbox aggregated metrics.
 */
function calculateConsistencyScore(domainMetrics: PerformanceMetrics, mailboxMetrics: PerformanceMetrics): number {
  const fields = ['sent', 'delivered', 'opened_tracked', 'clicked_tracked', 'replied', 'bounced', 'unsubscribed', 'spamComplaints'] as const;
  let matchingFields = 0;

  fields.forEach(field => {
    if (domainMetrics[field] === mailboxMetrics[field]) {
      matchingFields++;
    }
  });

  return Math.round((matchingFields / fields.length) * 100);
}

/**
 * Format impact value with sign and percentage.
 */
function formatImpactValue(impact: number): string {
  const sign = impact >= 0 ? '+' : '';
  return `${sign}${AnalyticsCalculator.formatRateAsPercentage(Math.abs(impact))}`;
}

/**
 * Generate insights from impact analysis.
 */
function generateImpactInsights(analysis: MailboxDomainImpactAnalysis): string[] {
  const insights: string[] = [];

  if (analysis.summary.positiveImpactMailboxes > analysis.summary.negativeImpactMailboxes) {
    insights.push("Most mailboxes are contributing positively to domain performance");
  } else if (analysis.summary.negativeImpactMailboxes > analysis.summary.positiveImpactMailboxes) {
    insights.push("Several mailboxes may be negatively impacting domain performance");
  }

  if (analysis.summary.averageImpactScore >= 70) {
    insights.push("Overall mailbox performance is strong for this domain");
  } else if (analysis.summary.averageImpactScore <= 30) {
    insights.push("Domain performance could be improved by optimizing mailbox strategies");
  }

  const topPerformer = analysis.mailboxImpactAnalysis[0];
  if (topPerformer && topPerformer.impactScore >= 80) {
    insights.push(`${topPerformer.email} is the top performing mailbox for this domain`);
  }

  return insights;
}

/**
 * Generate recommendations from correlation insights.
 */
function generateCorrelationRecommendations(insights: {
  summary: {
    strongCorrelations: number;
    weakCorrelations: number;
    averageCorrelation: number | string;
  };
  correlations: Array<{
    domainId: string;
    domainName: string;
    mailboxCorrelations: Array<{
      mailboxId: string;
      email: string;
      correlationScore: number;
      correlationStrength: 'STRONG' | 'MODERATE' | 'WEAK';
      correlationDirection: 'POSITIVE' | 'NEGATIVE';
      insights: string[];
    }>;
    overallCorrelation: number;
  }>;
}): string[] {
  const recommendations: string[] = [];

  if (insights.summary.strongCorrelations < insights.summary.weakCorrelations) {
    recommendations.push("Consider reviewing mailbox strategies to improve alignment with domain performance");
  }

  const avgCorrelation = typeof insights.summary.averageCorrelation === 'string' 
    ? parseInt(insights.summary.averageCorrelation.replace('%', ''))
    : insights.summary.averageCorrelation;
    
  if (avgCorrelation < 50) {
    recommendations.push("Focus on improving mailbox-domain performance correlation through better warmup and sending practices");
  }

  const domainsWithLowCorrelation = insights.correlations.filter((d: { overallCorrelation: number}) => d.overallCorrelation < 40);
  if (domainsWithLowCorrelation.length > 0) {
    recommendations.push(`Review mailbox performance for domains: ${domainsWithLowCorrelation.map((d: { domainName: string }) => d.domainName).join(', ')}`);
  }

  return recommendations;
}
