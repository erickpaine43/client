// ============================================================================
// ANALYTICS SERVICE CALCULATIONS - Core analytics computation logic
// ============================================================================

import { PerformanceMetrics } from "@/types/analytics/core";
import { AnalyticsDomain } from "@/types/analytics/ui";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

/**
 * Aggregates performance metrics across multiple domains.
 * Combines metrics from different analytics domains into a single aggregated result.
 *
 * @param domainMetrics - Performance metrics grouped by domain
 * @returns Aggregated performance metrics across all domains
 */
export function aggregatePerformanceMetrics(
  domainMetrics: Record<AnalyticsDomain, PerformanceMetrics[]>
): PerformanceMetrics {
  const allMetrics: PerformanceMetrics[] = [];

  // Flatten all metrics from all domains into a single array
  Object.values(domainMetrics).forEach(metrics => {
    allMetrics.push(...metrics);
  });

  // Use AnalyticsCalculator to aggregate all metrics
  return AnalyticsCalculator.aggregateMetrics(allMetrics);
}

/**
 * Calculates weighted average metrics across domains.
 * Useful for computing overall rates when domains have different sample sizes.
 *
 * @param domainMetrics - Performance metrics grouped by domain
 * @returns Weighted average metrics
 */
export function calculateWeightedAverageMetrics(
  domainMetrics: Record<AnalyticsDomain, PerformanceMetrics[]>
): {
  weightedOpenRate: number;
  weightedClickRate: number;
  weightedReplyRate: number;
  weightedDeliveryRate: number;
  totalSent: number;
} {
  let totalSent = 0;
  let weightedOpenRateSum = 0;
  let weightedClickRateSum = 0;
  let weightedReplyRateSum = 0;
  let weightedDeliveryRateSum = 0;

  // Calculate weighted averages based on sent volume
  Object.values(domainMetrics).forEach(metrics => {
    metrics.forEach(metric => {
      if (metric.sent > 0) {
        totalSent += metric.sent;
        const weight = metric.sent;

        weightedOpenRateSum += (metric.opened_tracked / metric.sent) * weight;
        weightedClickRateSum += (metric.clicked_tracked / metric.sent) * weight;
        weightedReplyRateSum += (metric.replied / metric.sent) * weight;
        weightedDeliveryRateSum += (metric.delivered / metric.sent) * weight;
      }
    });
  });

  return {
    weightedOpenRate: totalSent > 0 ? (weightedOpenRateSum / totalSent) * 100 : 0,
    weightedClickRate: totalSent > 0 ? (weightedClickRateSum / totalSent) * 100 : 0,
    weightedReplyRate: totalSent > 0 ? (weightedReplyRateSum / totalSent) * 100 : 0,
    weightedDeliveryRate: totalSent > 0 ? (weightedDeliveryRateSum / totalSent) * 100 : 0,
    totalSent,
  };
}

/**
 * Identifies top-performing domains based on specified criteria.
 * Useful for highlighting best-performing areas in dashboards.
 *
 * @param domainMetrics - Performance metrics grouped by domain
 * @param criteria - The metric to use for ranking (default: 'openRate')
 * @returns Ranked list of domains with their performance scores
 */
export function identifyTopPerformingDomains(
  domainMetrics: Record<AnalyticsDomain, PerformanceMetrics[]>,
  criteria: 'openRate' | 'clickRate' | 'replyRate' | 'deliveryRate' = 'openRate'
): Array<{ domain: AnalyticsDomain; score: number; rank: number }> {
  const domainScores: Array<{ domain: AnalyticsDomain; score: number }> = [];

  // Calculate average score for each domain
  Object.entries(domainMetrics).forEach(([domain, metrics]) => {
    if (metrics.length > 0) {
      const aggregated = AnalyticsCalculator.aggregateMetrics(metrics);
      const rates = AnalyticsCalculator.calculateAllRates(aggregated);

      let score = 0;
      switch (criteria) {
        case 'openRate':
          score = rates.openRate;
          break;
        case 'clickRate':
          score = rates.clickRate;
          break;
        case 'replyRate':
          score = rates.replyRate;
          break;
        case 'deliveryRate':
          score = rates.deliveryRate;
          break;
      }

      domainScores.push({ domain: domain as AnalyticsDomain, score });
    }
  });

  // Sort by score descending and assign ranks
  domainScores.sort((a, b) => b.score - a.score);
  return domainScores.map((item, index) => ({ ...item, rank: index + 1 }));
}

/**
 * Calculates comparative metrics between different time periods or segments.
 * Useful for trend analysis and performance comparisons.
 *
 * @param currentMetrics - Current period metrics
 * @param previousMetrics - Previous period metrics for comparison
 * @returns Comparative analysis results
 */
export function calculateComparativeMetrics(
  currentMetrics: PerformanceMetrics[],
  previousMetrics: PerformanceMetrics[]
): {
  changePercentages: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  significance: 'high' | 'medium' | 'low';
} {
  const currentAggregated = AnalyticsCalculator.aggregateMetrics(currentMetrics);
  const previousAggregated = AnalyticsCalculator.aggregateMetrics(previousMetrics);

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const changePercentages = {
    sent: calculateChange(currentAggregated.sent, previousAggregated.sent),
    delivered: calculateChange(currentAggregated.delivered, previousAggregated.delivered),
    opened: calculateChange(currentAggregated.opened_tracked, previousAggregated.opened_tracked),
    clicked: calculateChange(currentAggregated.clicked_tracked, previousAggregated.clicked_tracked),
    replied: calculateChange(currentAggregated.replied, previousAggregated.replied),
  };

  // Determine overall trend
  const avgChange = Object.values(changePercentages).reduce((sum, change) => sum + change, 0) / 5;
  let trend: 'improving' | 'declining' | 'stable';
  if (avgChange > 5) trend = 'improving';
  else if (avgChange < -5) trend = 'declining';
  else trend = 'stable';

  // Determine significance based on magnitude of changes
  const maxChange = Math.max(...Object.values(changePercentages).map(Math.abs));
  let significance: 'high' | 'medium' | 'low';
  if (maxChange > 50) significance = 'high';
  else if (maxChange > 20) significance = 'medium';
  else significance = 'low';

  return { changePercentages, trend, significance };
}

/**
 * Calculates health score for analytics system based on multiple factors.
 * Provides a comprehensive health assessment for monitoring purposes.
 *
 * @param metrics - Performance metrics to analyze
 * @param domainHealth - Health status of individual domains
 * @returns Health score between 0-100 and contributing factors
 */
export function calculateSystemHealthScore(
  metrics: PerformanceMetrics[],
  domainHealth: Record<AnalyticsDomain, boolean>
): {
  score: number;
  factors: {
    deliveryRate: number;
    openRate: number;
    domainAvailability: number;
    dataCompleteness: number;
  };
} {
  const aggregated = AnalyticsCalculator.aggregateMetrics(metrics);
  const rates = AnalyticsCalculator.calculateAllRates(aggregated);

  // Factor 1: Delivery rate (30% weight)
  const deliveryRate = rates.deliveryRate;
  const deliveryScore = Math.min(100, Math.max(0, deliveryRate));

  // Factor 2: Engagement rate (open rate) (30% weight)
  const openRate = rates.openRate;
  const engagementScore = Math.min(100, Math.max(0, openRate));

  // Factor 3: Domain availability (25% weight)
  const healthyDomains = Object.values(domainHealth).filter(Boolean).length;
  const totalDomains = Object.keys(domainHealth).length;
  const availabilityScore = totalDomains > 0 ? (healthyDomains / totalDomains) * 100 : 100;

  // Factor 4: Data completeness (15% weight)
  const requiredFields = ['sent', 'delivered', 'opened_tracked', 'clicked_tracked', 'replied'];
  const presentFields = requiredFields.filter(field =>
    aggregated[field as keyof PerformanceMetrics] !== undefined &&
    aggregated[field as keyof PerformanceMetrics] !== null
  );
  const completenessScore = (presentFields.length / requiredFields.length) * 100;

  // Calculate weighted score
  const score = (
    deliveryScore * 0.3 +
    engagementScore * 0.3 +
    availabilityScore * 0.25 +
    completenessScore * 0.15
  );

  return {
    score: Math.round(score),
    factors: {
      deliveryRate: Math.round(deliveryScore),
      openRate: Math.round(engagementScore),
      domainAvailability: Math.round(availabilityScore),
      dataCompleteness: Math.round(completenessScore),
    },
  };
}
