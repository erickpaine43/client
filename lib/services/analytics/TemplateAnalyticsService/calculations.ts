/**
 * Calculations for TemplateAnalyticsService
 * 
 * This module contains core business logic and computations for template analytics,
 * including rate calculations, effectiveness scoring, aggregations for overview
 * and category breakdowns, and filtered dataset processing.
 * 
 * All functions are pure (no side effects) and type-safe. Use validation.ts
 * before calling these to ensure input integrity.
 * 
 * Dependencies:
 * - AnalyticsCalculator for base rate calculations
 * - FilteredDatasetUtils for dataset aggregations
 * - Types from types.ts for input/output shapes
 * 
 * Usage:
 * - Call specific calculators in queries.ts or mutations.ts
 * - Functions return computed results ready for caching or response
 * - No direct Convex or cache interactions here (separation of concerns)
 */

import type {
  PerformanceMetrics,
  AnalyticsComputeOptions,
  FilteredDataset,
  TemplatePerformanceItem,
  TemplateUsageAnalytics,
  TemplateEffectivenessMetrics,
  TemplateAnalyticsOverview,
  FilteredTemplateAnalytics,
  CategoryBreakdown,
  TopPerformingTemplate
} from "./types";
import { AnalyticsCalculator, FilteredDatasetUtils } from "@/lib/utils/analytics-calculator";
import { validateTemplateFilteredDataset, validateTemplateMetrics } from "./validation";

/**
 * Calculate all rates for template performance metrics.
 * Wraps AnalyticsCalculator.calculateAllRates with template-specific normalization.
 * Ensures metrics are validated before calculation.
 * 
 * @param metrics - Template performance metrics
 * @returns Object with openRate, clickRate, replyRate, bounceRate, etc. (0-1 scale)
 * @throws {AnalyticsError} if metrics invalid (via validateTemplateMetrics)
 */
export function calculateTemplateRates(metrics: PerformanceMetrics): ReturnType<typeof AnalyticsCalculator.calculateAllRates> {
  validateTemplateMetrics(metrics);
  
  const rates = AnalyticsCalculator.calculateAllRates(metrics);
  
  // Normalize rates to 0-1 if not already (ensure consistency)
  return {
    openRate: Math.min(1, Math.max(0, rates.openRate)),
    clickRate: Math.min(1, Math.max(0, rates.clickRate)),
    replyRate: Math.min(1, Math.max(0, rates.replyRate)),
    bounceRate: Math.min(1, Math.max(0, rates.bounceRate)),
    unsubscribeRate: Math.min(1, Math.max(0, rates.unsubscribeRate)),
    spamRate: Math.min(1, Math.max(0, rates.spamRate)),
    deliveryRate: Math.min(1, Math.max(0, rates.deliveryRate)),
  };
}

/**
 * Compute effectiveness score for a template.
 * Formula: (openRate * 0.4 + replyRate * 0.4 + normalizedUsage * 0.2), clamped 0-1.
 * Normalized usage = usage / 1000 (diminishing returns for high usage).
 * Used in getEffectivenessMetrics.
 * 
 * @param performance - Template performance metrics
 * @param usage - Template usage count
 * @returns Effectiveness score (0-1)
 */
export function computeTemplateEffectivenessScore(
  performance: PerformanceMetrics,
  usage: number
): number {
  const rates = calculateTemplateRates(performance);
  const normalizedUsage = Math.min(1, usage / 1000); // Cap at 1000 for scoring
  
  const score = (rates.openRate * 0.4) + (rates.replyRate * 0.4) + (normalizedUsage * 0.2);
  
  return Math.min(1, Math.max(0, score));
}

/**
 * Compute effectiveness metrics for multiple templates.
 * Applies computeTemplateEffectivenessScore and assigns ranks based on score.
 * Used in getEffectivenessMetrics after fetching raw data.
 * 
 * @param templates - Array of template data (from Convex query)
 * @returns Ranked effectiveness metrics
 */
export function computeTemplateEffectivenessMetrics(
  templates: TemplatePerformanceItem[]
): TemplateEffectivenessMetrics {
  const effectivenessList = templates.map((template) => ({
    templateId: template.templateId,
    templateName: template.templateName,
    category: template.category,
    effectiveness: {
      usage: template.usage,
      performance: template.performance,
      score: computeTemplateEffectivenessScore(template.performance, template.usage),
    },
  }));

  // Sort by score descending and assign ranks
  const sorted = effectivenessList.sort((a, b) => b.effectiveness.score - a.effectiveness.score);
  return sorted.map((item, index) => ({
    ...item,
    effectiveness: {
      ...item.effectiveness,
      rank: index + 1,
    },
  }));
}

/**
 * Aggregate performance metrics across templates or categories.
 * Sums counts (sent, delivered, etc.), averages rates.
 * Used for overview aggregatedMetrics and categoryBreakdown.
 * 
 * @param items - Array of template items or performance data
 * @param field - Optional field to group by (e.g., 'category' for breakdown)
 * @returns Aggregated metrics or map of grouped aggregations
 */
export function aggregateTemplateMetrics(
  items: TemplatePerformanceItem[],
  field?: keyof Pick<TemplatePerformanceItem, "category">
): PerformanceMetrics | Record<string, PerformanceMetrics> {
  if (!items || items.length === 0) {
    return { sent: 0, delivered: 0, opened_tracked: 0, clicked_tracked: 0, replied: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0 };
  }

  if (field) {
    const grouped: Record<string, PerformanceMetrics> = {};

    items.forEach((item) => {
      const categoryKey = item[field] || "uncategorized";
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = { sent: 0, delivered: 0, opened_tracked: 0, clicked_tracked: 0, replied: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0 };
      }
      Object.keys(item.performance).forEach((metricKey) => {
        grouped[categoryKey][metricKey as keyof PerformanceMetrics] += (item.performance as unknown as Record<string, number>)[metricKey];
      });
    });

    return Object.fromEntries(
      Object.entries(grouped).map(([groupKey, metrics]) => [
        groupKey,
        {
          ...metrics,
          // Average rates if needed, but for counts sum is fine; rates calculated on aggregated
        },
      ])
    );
  }

  // Simple aggregate
  const total: PerformanceMetrics = { sent: 0, delivered: 0, opened_tracked: 0, clicked_tracked: 0, replied: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0 };
  items.forEach((item) => {
    Object.keys(total).forEach((key) => {
      total[key as keyof PerformanceMetrics]! += item.performance[key as keyof PerformanceMetrics];
    });
  });

  return total;
}

/**
 * Find top performing template by reply rate.
 * Used in getAnalyticsOverview.
 * Returns null if no templates.
 * 
 * @param templates - Array of template items
 * @returns Top template or null
 */
export function findTopPerformingTemplate(templates: TemplatePerformanceItem[]): TopPerformingTemplate | null {
  if (!templates || templates.length === 0) return null;

  const top = templates.reduce((prev, current) => {
    const prevRate = calculateTemplateRates(prev.performance).replyRate;
    const currentRate = calculateTemplateRates(current.performance).replyRate;
    return currentRate > prevRate ? current : prev;
  });

  return {
    templateId: top.templateId,
    templateName: top.templateName,
    replyRate: calculateTemplateRates(top.performance).replyRate,
  };
}

/**
 * Compute template analytics overview aggregations.
 * Aggregates totals, metrics, top template, and category breakdown.
 * Used in getAnalyticsOverview after fetching raw data.
 * 
 * @param templates - Raw template data from query
 * @returns Full overview object
 */
export function computeTemplateAnalyticsOverview(templates: TemplatePerformanceItem[]): TemplateAnalyticsOverview {
  if (!templates || templates.length === 0) {
    return {
      totalTemplates: 0,
      totalUsage: 0,
      aggregatedMetrics: { sent: 0, delivered: 0, opened_tracked: 0, clicked_tracked: 0, replied: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0 },
      topPerformingTemplate: null,
      categoryBreakdown: [],
    };
  }

  const totalTemplates = templates.length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usage, 0);
  const aggregatedMetrics = aggregateTemplateMetrics(templates) as PerformanceMetrics;
  const topPerformingTemplate = findTopPerformingTemplate(templates);
  const categoryAggregations = aggregateTemplateMetrics(templates, "category") as Record<string, PerformanceMetrics>;

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryAggregations).map(([category, perf]) => ({
    category,
    count: templates.filter(t => t.category === category).length,
    usage: templates.filter(t => t.category === category).reduce((sum, t) => sum + t.usage, 0),
    performance: perf,
  }));

  return {
    totalTemplates,
    totalUsage,
    aggregatedMetrics,
    topPerformingTemplate,
    categoryBreakdown,
  };
}

/**
 * Compute analytics on filtered template dataset.
 * Validates dataset, computes aggregations and rates using FilteredDatasetUtils.
 * Adapts to template-specific return type, populating optional fields based on options.
 * Used in computeAnalyticsForFilteredData.
 * 
 * @param dataset - Validated filtered dataset of template metrics
 * @param options - Compute options (e.g., includeTimeSeries, comparative)
 * @returns Filtered analytics result
 * @template T - Dataset item type
 */
export function computeTemplateAnalyticsOnFilteredData<T extends { metrics: PerformanceMetrics }>(
  dataset: FilteredDataset<T>,
  options: AnalyticsComputeOptions = {}
): FilteredTemplateAnalytics {
  validateTemplateFilteredDataset(dataset);

  const baseResult = FilteredDatasetUtils.computeAnalyticsOnFilteredData(dataset, options);
  const rates = calculateTemplateRates(baseResult.aggregatedMetrics);

  const result: FilteredTemplateAnalytics = {
    aggregatedMetrics: baseResult.aggregatedMetrics,
    rates,
  };

  // Optional time series (if options specify, but since dataset doesn't have it, placeholder or empty)
  if (options.includeTimeSeriesData) {
    result.timeSeriesData = []; // Would require separate query; handled in queries.ts
  }

  // Optional performance metrics (duplicate of rates if needed)
  if (options.includePerformanceMetrics) {
    result.performanceMetrics = rates;
  }

  // Optional comparative data (e.g., vs previous period)
  if (options.includeComparativeData) {
    result.comparativeData = {}; // Placeholder; implement if needed in queries.ts
  }

  return result;
}

/**
 * Compute usage analytics aggregations.
 * Counts top templates by usage, totals.
 * Used in getUsageAnalytics after fetching raw data.
 * 
 * @param templates - Raw template data
 * @param limit - Number of top templates (default 10)
 * @returns Usage analytics object
 */
export function computeTemplateUsageAnalytics(
  templates: TemplatePerformanceItem[],
  limit: number = 10
): TemplateUsageAnalytics {
  const totalTemplates = templates.length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usage, 0);

  const topTemplates = templates
    .sort((a, b) => b.usage - a.usage)
    .slice(0, limit)
    .map((t) => ({
      templateId: t.templateId,
      templateName: t.templateName,
      category: t.category,
      totalUsage: t.usage,
      totalSent: t.performance.sent,
      totalReplies: t.performance.replied,
      performance: t.performance,
    }));

  return {
    topTemplates,
    totalTemplates,
    totalUsage,
  };
}
