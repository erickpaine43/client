// ============================================================================
// TEMPLATE ANALYTICS TYPES
// ============================================================================

import { PerformanceMetrics } from "../../types/analytics/core";

// Re-export for convenience
export type { PerformanceMetrics };

/**
 * Template performance result interface
 */
export interface TemplatePerformanceResult {
  templateId: string;
  templateName: string;
  category: string;
  usage: number;
  performance: PerformanceMetrics;
  id: string;
  name: string;
  updatedAt: number;
}

/**
 * Time series data point interface
 */
export interface TemplateTimeSeriesDataPoint {
  date: string;
  label: string;
  metrics: PerformanceMetrics;
}

/**
 * Template usage result interface
 */
export interface TemplateUsageResult {
  templateId: string;
  templateName: string;
  category: string;
  totalUsage: number;
  totalSent: number;
  totalReplies: number;
  performance: PerformanceMetrics;
}

/**
 * Template usage analytics response interface
 */
export interface TemplateUsageAnalyticsResponse {
  topTemplates: TemplateUsageResult[];
  totalTemplates: number;
  totalUsage: number;
}

/**
 * Template effectiveness result interface
 */
export interface TemplateEffectivenessResult {
  templateId: string;
  templateName: string;
  category: string;
  effectiveness: {
    usage: number;
    performance: PerformanceMetrics;
    score: number;
    rank: number;
  };
}

/**
 * Category breakdown interface
 */
export interface CategoryBreakdown {
  category: string;
  templateCount: number;
  totalUsage: number;
  averagePerformance: PerformanceMetrics;
  topTemplate: {
    templateId: string;
    templateName: string;
    usage: number;
  };
}

/**
 * Template analytics overview interface
 */
export interface TemplateAnalyticsOverview {
  totalTemplates: number;
  totalUsage: number;
  aggregatedMetrics: PerformanceMetrics;
  topPerformingTemplate: TemplatePerformanceResult | null;
  categoryBreakdown: CategoryBreakdown[];
}

/**
 * Template analytics record interface (based on database schema)
 */
export interface TemplateAnalyticsRecord {
  templateId: string;
  templateName: string;
  category?: string;
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
  usage: number;
  updatedAt: number;
}

/**
 * Query arguments interface for template analytics
 */
export interface TemplateAnalyticsQueryArgs {
  templateIds?: string[];
  companyId: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Time series query arguments interface
 */
export interface TemplateTimeSeriesQueryArgs extends TemplateAnalyticsQueryArgs {
  granularity?: "day" | "week" | "month";
}

/**
 * Usage analytics query arguments interface
 */
export interface TemplateUsageQueryArgs {
  companyId: string;
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;
}

/**
 * Effectiveness query arguments interface
 */
export interface TemplateEffectivenessQueryArgs {
  templateIds: string[];
  companyId: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Update template analytics arguments interface
 */
export interface UpdateTemplateAnalyticsArgs {
  templateId: string;
  companyId: string;
  date: string;
  sent?: number;
  delivered?: number;
  opened_tracked?: number;
  clicked_tracked?: number;
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  spamComplaints?: number;
  usage?: number;
}

/**
 * Batch update template analytics arguments interface
 */
export interface BatchUpdateTemplateAnalyticsArgs {
  updates: UpdateTemplateAnalyticsArgs[];
  companyId: string;
}
