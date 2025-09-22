'use server';

/**
 * Cross-Domain Analytics Actions - Standardized Implementation
 * 
 * This module provides consistent cross-domain analytics actions using ConvexQueryHelper
 * for type safety and standardized error handling.
 */

import { api } from '@/convex/_generated/api';
import { createAnalyticsConvexHelper } from '@/lib/utils/convex-query-helper';
import { ConvexHttpClient } from 'convex/browser';
import { 
  createActionResult, 
  withConvexErrorHandling 
} from '../core/errors';
import { 
  withAuth, 
  withAuthAndCompany,
  withContextualRateLimit,
  RateLimits 
} from '../core/auth';
import type { ActionResult, ActionContext } from '../core/types';
import type {
  AnalyticsFilters,
  PerformanceMetrics,
  TimeSeriesDataPoint,
  CalculatedRates,
} from '@/types/analytics/core';

// Initialize Convex client and helper
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const convexHelper = createAnalyticsConvexHelper(convex, 'CrossDomainAnalyticsActions');

/**
 * Cross-domain performance comparison interface
 */
export interface CrossDomainPerformanceComparison {
  domains: Array<{
    domainId: string;
    domainName: string;
    performance: PerformanceMetrics;
    rates: CalculatedRates;
    ranking: number;
    percentileRank: number;
    marketShare: number;
  }>;
  aggregatedMetrics: PerformanceMetrics;
  averageRates: CalculatedRates;
  topPerformer: {
    domainId: string;
    domainName: string;
    advantage: number;
    strongestMetric: string;
  };
  insights: string[];
}

/**
 * Cross-domain correlation analysis interface
 */
export interface CrossDomainCorrelationAnalysis {
  correlations: Array<{
    domain1: string;
    domain2: string;
    correlationCoefficient: number;
    strength: 'strong' | 'moderate' | 'weak';
    direction: 'positive' | 'negative';
    metrics: {
      openRate: number;
      clickRate: number;
      replyRate: number;
      deliveryRate: number;
    };
  }>;
  patterns: Array<{
    pattern: string;
    domains: string[];
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  outliers: Array<{
    domainId: string;
    domainName: string;
    deviation: number;
    reason: string;
  }>;
}

/**
 * Cross-domain trend analysis interface
 */
export interface CrossDomainTrendAnalysis {
  trends: Array<{
    domainId: string;
    domainName: string;
    trend: 'improving' | 'declining' | 'stable';
    trendStrength: number;
    timeframe: string;
    keyMetrics: {
      openRate: { current: number; change: number; trend: string };
      clickRate: { current: number; change: number; trend: string };
      replyRate: { current: number; change: number; trend: string };
      deliveryRate: { current: number; change: number; trend: string };
    };
  }>;
  overallTrend: 'improving' | 'declining' | 'stable';
  seasonalPatterns: Array<{
    pattern: string;
    domains: string[];
    seasonality: 'daily' | 'weekly' | 'monthly';
    strength: number;
  }>;
  forecasts: Array<{
    domainId: string;
    domainName: string;
    projectedPerformance: PerformanceMetrics;
    confidence: number;
    timeframe: string;
  }>;
}

/**
 * Get cross-domain performance comparison
 */
export async function getCrossDomainPerformanceComparison(
  domainIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<CrossDomainPerformanceComparison>> {
  return withContextualRateLimit(
    'cross_domain_performance_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const comparisonData = await convexHelper.query(
          api.crossDomainAnalytics.getPerformanceComparison,
          { 
            companyId: context.companyId,
            domainIds,
            filters: filters || {}
          },
          {
            serviceName: 'CrossDomainAnalyticsActions',
            methodName: 'getCrossDomainPerformanceComparison',
          }
        );

        return createActionResult(comparisonData as CrossDomainPerformanceComparison);
      });
    })
  );
}

/**
 * Get cross-domain correlation analysis
 */
export async function getCrossDomainCorrelationAnalysis(
  domainIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<CrossDomainCorrelationAnalysis>> {
  return withContextualRateLimit(
    'cross_domain_correlation_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const correlationData = await convexHelper.query(
          api.crossDomainAnalytics.getCorrelationAnalysis,
          { 
            companyId: context.companyId,
            domainIds,
            filters: filters || {}
          },
          {
            serviceName: 'CrossDomainAnalyticsActions',
            methodName: 'getCrossDomainCorrelationAnalysis',
          }
        );

        return createActionResult(correlationData as CrossDomainCorrelationAnalysis);
      });
    })
  );
}

/**
 * Get cross-domain trend analysis
 */
export async function getCrossDomainTrendAnalysis(
  domainIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<CrossDomainTrendAnalysis>> {
  return withContextualRateLimit(
    'cross_domain_trend_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const trendData = await convexHelper.query(
          api.crossDomainAnalytics.getTrendAnalysis,
          { 
            companyId: context.companyId,
            domainIds,
            filters: filters || {}
          },
          {
            serviceName: 'CrossDomainAnalyticsActions',
            methodName: 'getCrossDomainTrendAnalysis',
          }
        );

        return createActionResult(trendData as CrossDomainTrendAnalysis);
      });
    })
  );
}

/**
 * Get cross-domain aggregated metrics
 */
export async function getCrossDomainAggregatedMetrics(
  domainIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<{
  totalDomains: number;
  aggregatedPerformance: PerformanceMetrics;
  averageRates: CalculatedRates;
  distributionStats: {
    openRate: { min: number; max: number; avg: number; stdDev: number };
    clickRate: { min: number; max: number; avg: number; stdDev: number };
    replyRate: { min: number; max: number; avg: number; stdDev: number };
    deliveryRate: { min: number; max: number; avg: number; stdDev: number };
  };
  performanceSegments: Array<{
    segment: 'high' | 'medium' | 'low';
    domainCount: number;
    averagePerformance: PerformanceMetrics;
    domains: Array<{ domainId: string; domainName: string }>;
  }>;
}>> {
  return withContextualRateLimit(
    'cross_domain_aggregated_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const aggregatedData = await convexHelper.query(
          api.crossDomainAnalytics.getAggregatedMetrics,
          { 
            companyId: context.companyId,
            domainIds,
            filters: filters || {}
          },
          {
            serviceName: 'CrossDomainAnalyticsActions',
            methodName: 'getCrossDomainAggregatedMetrics',
          }
        );

        return createActionResult(aggregatedData as {
          totalDomains: number;
          aggregatedPerformance: PerformanceMetrics;
          averageRates: CalculatedRates;
          distributionStats: {
            openRate: { min: number; max: number; avg: number; stdDev: number };
            clickRate: { min: number; max: number; avg: number; stdDev: number };
            replyRate: { min: number; max: number; avg: number; stdDev: number };
            deliveryRate: { min: number; max: number; avg: number; stdDev: number };
          };
          performanceSegments: Array<{
            segment: 'high' | 'medium' | 'low';
            domainCount: number;
            averagePerformance: PerformanceMetrics;
            domains: Array<{ domainId: string; domainName: string }>;
          }>;
        });
      });
    })
  );
}

/**
 * Get cross-domain time series data
 */
export async function getCrossDomainTimeSeries(
  domainIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<{
  timeSeries: TimeSeriesDataPoint[];
  domainSeries: Array<{
    domainId: string;
    domainName: string;
    series: TimeSeriesDataPoint[];
  }>;
  aggregatedSeries: TimeSeriesDataPoint[];
}>> {
  return withContextualRateLimit(
    'cross_domain_timeseries_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const timeSeriesData = await convexHelper.query(
          api.crossDomainAnalytics.getTimeSeriesData,
          { 
            companyId: context.companyId,
            domainIds,
            filters: filters || {}
          },
          {
            serviceName: 'CrossDomainAnalyticsActions',
            methodName: 'getCrossDomainTimeSeries',
          }
        );

        return createActionResult(timeSeriesData as {
          timeSeries: TimeSeriesDataPoint[];
          domainSeries: Array<{
            domainId: string;
            domainName: string;
            series: TimeSeriesDataPoint[];
          }>;
          aggregatedSeries: TimeSeriesDataPoint[];
        });
      });
    })
  );
}

/**
 * Generate cross-domain insights
 */
export async function generateCrossDomainInsights(
  domainIds: string[],
  filters?: AnalyticsFilters
): Promise<ActionResult<{
  insights: Array<{
    type: 'performance' | 'trend' | 'correlation' | 'anomaly';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    recommendation: string;
    affectedDomains: string[];
  }>;
  summary: {
    totalInsights: number;
    highImpactInsights: number;
    actionableRecommendations: number;
    overallHealthScore: number;
  };
}>> {
  return withContextualRateLimit(
    'cross_domain_insights_query',
    'company',
    RateLimits.ANALYTICS_QUERY,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const insightsData = await convexHelper.query(
          api.crossDomainAnalytics.generateInsights,
          { 
            companyId: context.companyId,
            domainIds,
            filters: filters || {}
          },
          {
            serviceName: 'CrossDomainAnalyticsActions',
            methodName: 'generateCrossDomainInsights',
          }
        );

        return createActionResult(insightsData as {
          insights: Array<{
            type: 'performance' | 'trend' | 'correlation' | 'anomaly';
            title: string;
            description: string;
            impact: 'high' | 'medium' | 'low';
            confidence: number;
            recommendation: string;
            affectedDomains: string[];
          }>;
          summary: {
            totalInsights: number;
            highImpactInsights: number;
            actionableRecommendations: number;
            overallHealthScore: number;
          };
        });
      });
    })
  );
}

/**
 * Export cross-domain analytics data
 */
export async function exportCrossDomainAnalytics(
  domainIds: string[],
  analysisType: 'performance' | 'correlation' | 'trend' | 'all' = 'all',
  filters?: AnalyticsFilters,
  format: 'csv' | 'json' = 'csv'
): Promise<ActionResult<{ downloadUrl: string; expiresAt: number }>> {
  return withContextualRateLimit(
    'cross_domain_export',
    'company',
    RateLimits.ANALYTICS_EXPORT,
    () => withAuthAndCompany(async (context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const exportData = await convexHelper.mutation(
          api.crossDomainAnalytics.exportAnalytics,
          { 
            companyId: context.companyId,
            domainIds,
            analysisType,
            filters: filters || {},
            format,
            requestedBy: context.userId,
            requestedAt: Date.now()
          },
          {
            serviceName: 'CrossDomainAnalyticsActions',
            methodName: 'exportCrossDomainAnalytics',
          }
        );

        return createActionResult(exportData as { downloadUrl: string; expiresAt: number });
      });
    })
  );
}

/**
 * Get cross-domain analytics health check
 */
export async function getCrossDomainAnalyticsHealth(): Promise<ActionResult<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastUpdated: number;
  dataFreshness: number;
  issues: string[];
}>> {
  return withAuth(async (_context: ActionContext) => {
    return withConvexErrorHandling(async () => {
      // Check ConvexQueryHelper health
      const helperHealthy = await convexHelper.healthCheck();
      
      if (!helperHealthy) {
        return createActionResult({
          status: 'unhealthy' as const,
          lastUpdated: Date.now(),
          dataFreshness: 0,
          issues: ['ConvexQueryHelper health check failed']
        });
      }

      const healthData = await convexHelper.query(
        api.crossDomainAnalytics.getHealthStatus,
        {},
        {
          serviceName: 'CrossDomainAnalyticsActions',
          methodName: 'getCrossDomainAnalyticsHealth',
        }
      );

      return createActionResult(healthData as {
        status: 'healthy' | 'degraded' | 'unhealthy';
        lastUpdated: number;
        dataFreshness: number;
        issues: string[];
      });
    });
  });
}
