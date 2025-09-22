'use server';

// ============================================================================
// DOMAIN ANALYTICS SERVER ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/domain-analytics.ts
//
// Migration notes:
// - All functions now use ConvexQueryHelper for consistent error handling
// - Standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved type safety and performance monitoring

import {
  getDomainHealthMetrics,
  getDomainAnalytics,
  getDomainAnalyticsSummary,
  getDomainPerformanceComparison,
  getDomainTimeSeries,
  updateDomainAnalytics,
  refreshDomainReputationScores,
  exportDomainAnalytics,
  getDomainAnalyticsHealth,
  type DomainHealthMetrics,
  type DomainAnalyticsSummary
} from './analytics/domain-analytics';

// Re-export all functions for backward compatibility
export {
  getDomainHealthMetrics,
  getDomainAnalytics,
  getDomainAnalyticsSummary,
  getDomainPerformanceComparison,
  getDomainTimeSeries,
  updateDomainAnalytics,
  refreshDomainReputationScores,
  exportDomainAnalytics,
  getDomainAnalyticsHealth,
  type DomainHealthMetrics,
  type DomainAnalyticsSummary
};

// Legacy imports for backward compatibility
import { domainAnalyticsService } from "@/lib/services/analytics/DomainAnalyticsService";
import { 
  AnalyticsFilters,
} from "@/types/analytics/core";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

/**
 * Get domain health metrics with calculated scores.
 * Replaces scattered domain health logic from domainsActions.ts.
 */
export async function getDomainHealthMetricsAction(
  domainIds?: string[],
  filters?: AnalyticsFilters
) {
  try {
    const healthMetrics = await domainAnalyticsService.getDomainHealth(domainIds, filters);
    
    // Calculate rates for each domain using AnalyticsCalculator
    const enrichedMetrics = healthMetrics.map(domain => {
      const rates = AnalyticsCalculator.calculateAllRates(domain.performance);
      
      return {
        ...domain,
        rates,
        formattedRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(rates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
          bounceRate: AnalyticsCalculator.formatRateAsPercentage(rates.bounceRate),
          spamRate: AnalyticsCalculator.formatRateAsPercentage(rates.spamRate),
        },
      };
    });

    return {
      success: true,
      data: enrichedMetrics,
      metadata: {
        totalDomains: enrichedMetrics.length,
        healthyDomains: enrichedMetrics.filter(d => d.healthScore >= 80).length,
        averageHealthScore: enrichedMetrics.length > 0
          ? Math.round(enrichedMetrics.reduce((sum, d) => sum + d.healthScore, 0) / enrichedMetrics.length)
          : 0,
        generatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error getting domain health metrics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get domain health metrics",
      data: [],
    };
  }
}

/**
 * Get domain performance metrics for specific domains.
 */
export async function getDomainPerformanceMetricsAction(
  domainIds: string[],
  filters?: AnalyticsFilters
) {
  try {
    const performance = await domainAnalyticsService.getDomainPerformance(domainIds, filters);
    
    // Calculate rates and format for display
    const enrichedPerformance = performance.map(metrics => {
      const rates = AnalyticsCalculator.calculateAllRates(metrics);
      const healthScore = AnalyticsCalculator.calculateHealthScore(metrics);
      
      return {
        metrics,
        rates,
        healthScore,
        formattedMetrics: {
          sent: AnalyticsCalculator.formatNumber(metrics.sent),
          delivered: AnalyticsCalculator.formatNumber(metrics.delivered),
          opened: AnalyticsCalculator.formatNumber(metrics.opened_tracked),
          clicked: AnalyticsCalculator.formatNumber(metrics.clicked_tracked),
          replied: AnalyticsCalculator.formatNumber(metrics.replied),
        },
        formattedRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(rates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        },
      };
    });

    return {
      success: true,
      data: enrichedPerformance,
      metadata: {
        domainCount: enrichedPerformance.length,
        totalSent: enrichedPerformance.reduce((sum, p) => sum + p.metrics.sent, 0),
        totalDelivered: enrichedPerformance.reduce((sum, p) => sum + p.metrics.delivered, 0),
        generatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error getting domain performance metrics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get domain performance metrics",
      data: [],
    };
  }
}

/**
 * Get domain authentication status.
 */
export async function getDomainAuthenticationStatusAction(domainIds?: string[]) {
  try {
    const authStatus = await domainAnalyticsService.getAuthenticationStatus(domainIds);
    
    // Add summary statistics
    const summary = {
      totalDomains: authStatus.length,
      fullyAuthenticated: authStatus.filter(d => d.overallStatus === "FULLY_AUTHENTICATED").length,
      partiallyAuthenticated: authStatus.filter(d => d.overallStatus === "PARTIALLY_AUTHENTICATED").length,
      notAuthenticated: authStatus.filter(d => d.overallStatus === "NOT_AUTHENTICATED").length,
      spfVerified: authStatus.filter(d => d.authentication.spf.verified).length,
      dkimVerified: authStatus.filter(d => d.authentication.dkim.verified).length,
      dmarcVerified: authStatus.filter(d => d.authentication.dmarc.verified).length,
    };

    return {
      success: true,
      data: authStatus,
      summary,
      metadata: {
        generatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error getting domain authentication status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get domain authentication status",
      data: [],
    };
  }
}

/**
 * Get domain time series analytics data.
 */
export async function getDomainTimeSeriesDataAction(
  domainIds?: string[],
  filters?: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day"
) {
  try {
    const timeSeriesData = await domainAnalyticsService.getTimeSeriesData(
      domainIds,
      filters,
      granularity
    );

    // Calculate rates for each time point
    const enrichedTimeSeriesData = timeSeriesData.map(point => {
      const rates = AnalyticsCalculator.calculateAllRates(point.metrics);
      
      return {
        ...point,
        rates,
        formattedMetrics: {
          sent: AnalyticsCalculator.formatNumber(point.metrics.sent),
          delivered: AnalyticsCalculator.formatNumber(point.metrics.delivered),
          opened: AnalyticsCalculator.formatNumber(point.metrics.opened_tracked),
          clicked: AnalyticsCalculator.formatNumber(point.metrics.clicked_tracked),
        },
      };
    });

    // Calculate summary statistics
    const totalMetrics = AnalyticsCalculator.aggregateMetrics(
      timeSeriesData.map(point => point.metrics)
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
        dateRange: filters?.dateRange,
        granularity,
      },
      metadata: {
        generatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error getting domain time series data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get domain time series data",
      data: [],
    };
  }
}

/**
 * Get aggregated domain statistics.
 */
export async function getAggregatedDomainStatsAction(filters?: AnalyticsFilters) {
  try {
    const stats = await domainAnalyticsService.getAggregatedDomainStats(filters);
    
    // Calculate rates for aggregated metrics
    const aggregatedRates = AnalyticsCalculator.calculateAllRates(stats.aggregatedMetrics);

    return {
      success: true,
      data: {
        ...stats,
        aggregatedRates,
        formattedMetrics: {
          sent: AnalyticsCalculator.formatNumber(stats.aggregatedMetrics.sent),
          delivered: AnalyticsCalculator.formatNumber(stats.aggregatedMetrics.delivered),
          opened: AnalyticsCalculator.formatNumber(stats.aggregatedMetrics.opened_tracked),
          clicked: AnalyticsCalculator.formatNumber(stats.aggregatedMetrics.clicked_tracked),
          replied: AnalyticsCalculator.formatNumber(stats.aggregatedMetrics.replied),
        },
        formattedRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(aggregatedRates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(aggregatedRates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(aggregatedRates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(aggregatedRates.replyRate),
        },
        authenticationPercentages: {
          spfVerified: stats.totalDomains > 0 
            ? Math.round((stats.authenticationSummary.spfVerified / stats.totalDomains) * 100)
            : 0,
          dkimVerified: stats.totalDomains > 0
            ? Math.round((stats.authenticationSummary.dkimVerified / stats.totalDomains) * 100)
            : 0,
          dmarcVerified: stats.totalDomains > 0
            ? Math.round((stats.authenticationSummary.dmarcVerified / stats.totalDomains) * 100)
            : 0,
          fullyAuthenticated: stats.totalDomains > 0
            ? Math.round((stats.authenticationSummary.fullyAuthenticated / stats.totalDomains) * 100)
            : 0,
        },
      },
      metadata: {
        generatedAt: Date.now(),
        filters,
      },
    };
  } catch (error) {
    console.error("Error getting aggregated domain stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get aggregated domain stats",
      data: null,
    };
  }
}

/**
 * Compute analytics on filtered domain data.
 */
export async function computeDomainAnalyticsForFilteredDataAction(
  filters: AnalyticsFilters,
  options: {
    includeTimeSeriesData?: boolean;
    includeHealthMetrics?: boolean;
    includeAuthenticationStatus?: boolean;
    granularity?: "day" | "week" | "month";
  } = {}
) {
  try {
    // Convert options to AnalyticsComputeOptions format
    const computeOptions = {
      includeTimeSeriesData: options.includeTimeSeriesData,
      granularity: options.granularity || "day",
      customMetrics: [
        ...(options.includeHealthMetrics ? ["health"] : []),
        ...(options.includeAuthenticationStatus ? ["authentication"] : []),
      ],
    };

    const result = await domainAnalyticsService.computeAnalyticsForFilteredData(
      filters,
      computeOptions
    );

    // Calculate rates and format data
    const rates = AnalyticsCalculator.calculateAllRates(result.aggregatedMetrics);

    return {
      success: true,
      data: {
        aggregatedMetrics: result.aggregatedMetrics,
        rates,
        timeSeriesData: result.timeSeriesData,
        healthMetrics: result.healthMetrics,
        authenticationStatus: result.authenticationStatus,
        formattedMetrics: {
          sent: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.sent),
          delivered: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.delivered),
          opened: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.opened_tracked),
          clicked: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.clicked_tracked),
          replied: AnalyticsCalculator.formatNumber(result.aggregatedMetrics.replied),
        },
        formattedRates: {
          deliveryRate: AnalyticsCalculator.formatRateAsPercentage(rates.deliveryRate),
          openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
          clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
          replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        },
      },
      metadata: {
        filters,
        options,
        generatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error computing domain analytics for filtered data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to compute domain analytics",
      data: null,
    };
  }
}

/**
 * Update domain analytics data.
 */
export async function updateDomainAnalyticsAction(data: {
  domainId: string;
  domainName: string;
  date: string;
  companyId: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  authentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
}) {
  try {
    const id = await domainAnalyticsService.updateAnalytics(data);

    return {
      success: true,
      data: { id, domainId: data.domainId },
      metadata: {
        updatedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error updating domain analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update domain analytics",
      data: null,
    };
  }
}

/**
 * Initialize domain analytics for a new domain.
 */
export async function initializeDomainAnalyticsAction(
  domainId: string,
  domainName: string,
  companyId: string,
  authentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  }
) {
  try {
    const analyticsId = await domainAnalyticsService.initializeDomain(
      domainId,
      domainName,
      companyId,
      authentication
    );

    return {
      success: true,
      data: {
        analyticsId,
        domainId,
        domainName,
      },
      metadata: {
        initializedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error initializing domain analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initialize domain analytics",
      data: null,
    };
  }
}

/**
 * Get domain analytics health check.
 */
export async function getDomainAnalyticsHealthCheckAction() {
  try {
    const isHealthy = await domainAnalyticsService.healthCheck();

    return {
      success: true,
      data: {
        healthy: isHealthy,
        service: "domain-analytics",
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error checking domain analytics health:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Health check failed",
      data: {
        healthy: false,
        service: "domain-analytics",
        timestamp: Date.now(),
      },
    };
  }
}
