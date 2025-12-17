/**
 * Types for TemplateAnalyticsService
 * 
 * This module contains all type definitions specific to template analytics,
 * including local types for Convex responses, update payloads, and return types
 * for analytics methods. All types extend or compose core analytics types
 * from @/types/analytics/core.
 * 
 * Usage:
 * - Import specific interfaces for method parameters/returns
 * - Types ensure consistency with BaseAnalyticsService and Convex schemas
 * - All numeric metrics use number type (no unions or optionals unless specified)
 * - JSDoc provides detailed descriptions for each property and usage context
 */

import type {
  PerformanceMetrics,
  AnalyticsFilters,
  AnalyticsComputeOptions,
  FilteredDataset,
  TimeSeriesDataPoint,
  DataGranularity
} from "@/types/analytics/core";
import type { TemplateAnalytics } from "@/types/analytics/domain-specific";

/**
 * Local type for Convex response items in template performance metrics.
 * Mirrors the shape returned by api.templateAnalytics.getTemplatePerformanceMetrics.
 * Used for mapping raw query results to TemplateAnalytics interface.
 * 
 * @example
 * const item: TemplatePerformanceItem = {
 *   templateId: "tpl_123",
 *   templateName: "Welcome Email",
 *   category: "Onboarding",
 *   usage: 150,
 *   performance: { openRate: 0.45, replyRate: 0.12 },
 *   id: "tpl_123",
 *   name: "Welcome Email",
 *   updatedAt: 1690000000000
 * };
 */
export type TemplatePerformanceItem = {
  templateId: string;
  templateName: string;
  category: string;
  usage: number;
  performance: PerformanceMetrics;
  id: string;
  name: string;
  updatedAt: number;
};

/**
 * Payload for updating individual template analytics.
 * Used in updateAnalytics mutation.
 * All metrics are required and must be validated before storage.
 * 
 * @example
 * const updateData: TemplateAnalyticsUpdatePayload = {
 *   templateId: "tpl_123",
 *   templateName: "Welcome Email",
 *   category: "Onboarding",
 *   companyId: "cmp_456",
 *   date: "2023-09-18",
 *   sent: 100,
 *   delivered: 95,
 *   opened_tracked: 45,
 *   clicked_tracked: 20,
 *   replied: 12,
 *   bounced: 2,
 *   unsubscribed: 1,
 *   spamComplaints: 0,
 *   usage: 150
 * };
 */
export interface TemplateAnalyticsUpdatePayload {
  templateId: string;
  templateName: string;
  category?: string;
  companyId: string;
  date: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  usage: number;
}

/**
 * Array of TemplateAnalyticsUpdatePayload for batch operations.
 * Used in batchUpdateAnalytics mutation.
 * Each item follows the same validation rules as single update.
 */
export type TemplateAnalyticsBatchUpdatePayload = TemplateAnalyticsUpdatePayload[];

/**
 * Return type for getUsageAnalytics.
 * Contains top templates by usage, totals, and aggregated metrics.
 * 
 * @example
 * const usage: TemplateUsageAnalytics = {
 *   topTemplates: [{ templateId: "tpl_123", templateName: "Welcome", ... }],
 *   totalTemplates: 50,
 *   totalUsage: 1000
 * };
 */
export interface TemplateUsageAnalytics {
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    category: string;
    totalUsage: number;
    totalSent: number;
    totalReplies: number;
    performance: PerformanceMetrics;
  }>;
  totalTemplates: number;
  totalUsage: number;
}

/**
 * Effectiveness metrics for a template.
 * Includes score (composite: (openRate + replyRate + usage/1000) / 3) and rank.
 * Used in getEffectivenessMetrics return.
 */
export interface TemplateEffectiveness {
  usage: number;
  performance: PerformanceMetrics;
  score: number; // 0-1 scale
  rank: number;
}

/**
 * Return type for getEffectivenessMetrics.
 * Array of templates with effectiveness data.
 */
export type TemplateEffectivenessMetrics = Array<{
  templateId: string;
  templateName: string;
  category: string;
  effectiveness: TemplateEffectiveness;
}>;

/**
 * Top performing template summary.
 * Optional in overview; highest replyRate.
 */
export interface TopPerformingTemplate {
  templateId: string;
  templateName: string;
  replyRate: number;
}

/**
 * Category breakdown in overview.
 * Aggregated metrics per category.
 */
export interface CategoryBreakdown {
  category: string;
  count: number;
  usage: number;
  performance: PerformanceMetrics;
}

/**
 * Return type for getAnalyticsOverview.
 * High-level aggregated template analytics.
 */
export interface TemplateAnalyticsOverview {
  totalTemplates: number;
  totalUsage: number;
  aggregatedMetrics: PerformanceMetrics;
  topPerformingTemplate: TopPerformingTemplate | null;
  categoryBreakdown: CategoryBreakdown[];
}

/**
 * Return type for computeAnalyticsForFilteredData.
 * Computed results on filtered template data.
 * Optional fields populated based on options.
 */
export interface FilteredTemplateAnalytics {
  aggregatedMetrics: PerformanceMetrics;
  rates: ReturnType<typeof import("@/lib/utils/analytics-calculator").AnalyticsCalculator.calculateAllRates>;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceMetrics?: ReturnType<typeof import("@/lib/utils/analytics-calculator").AnalyticsCalculator.calculateAllRates>;
  comparativeData?: Record<string, unknown>;
}

/**
 * Health check result for the service.
 * Includes status and individual check details.
 * Used in getHealthCheck.
 */
export interface TemplateAnalyticsHealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  checks: Array<{
    name: string;
    status: "pass" | "fail";
    message: string;
    responseTime?: number;
  }>;
}

/**
 * Re-export core types for convenience in this service.
 */
export type {
  PerformanceMetrics,
  AnalyticsFilters,
  AnalyticsComputeOptions,
  FilteredDataset,
  TimeSeriesDataPoint,
  DataGranularity,
  TemplateAnalytics
};
