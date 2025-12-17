/**
 * Query handlers for TemplateAnalyticsService
 * 
 * This module contains all read operations (queries) for template analytics,
 * including performance metrics, time series data, usage analytics,
 * effectiveness metrics, overview, and filtered computations.
 * 
 * Each handler:
 * - Performs Convex query with validated parameters
 * - Applies computations from calculations.ts
 * - Validates inputs using validation.ts
 * - Returns typed results ready for caching (via executeWithCache in index.ts)
 * 
 * No mutations, caching, or logging here - separation of concerns.
 * Functions are designed to be called from the service class methods.
 * 
 * Dependencies:
 * - ConvexHttpClient for data fetching
 * - api.templateAnalytics.* for query definitions
 * - Types, validation, and calculations from sibling modules
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";
import type {
  AnalyticsFilters,
  AnalyticsComputeOptions,
  TemplateAnalytics,
  TemplateUsageAnalytics,
  TemplateEffectivenessMetrics,
  TemplateAnalyticsOverview,
  FilteredTemplateAnalytics,
  TemplatePerformanceItem
} from "./types";
import type {
  FilteredDataset,
  PerformanceMetrics
} from "@/types/analytics/core";
import {
  validateAndNormalizeTemplateFilters,
  validateTemplateFilteredDataset
} from "./validation";
import {
  computeTemplateEffectivenessMetrics,
  computeTemplateUsageAnalytics,
  computeTemplateAnalyticsOverview,
  computeTemplateAnalyticsOnFilteredData,
} from "./calculations";

/**
 * Perform performance metrics query and mapping.
 * Fetches from Convex, maps to TemplateAnalytics, no further computation needed.
 * 
 * @param convex - Convex client instance
 * @param companyId - Company ID for query filtering
 * @param templateIds - Optional template IDs to filter
 * @param filters - Validated analytics filters
 * @returns Mapped template analytics array
 * @throws {AnalyticsError} on query failure
 */
export async function performPerformanceMetricsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  templateIds: string[] | undefined,
  filters: AnalyticsFilters
): Promise<TemplateAnalytics[]> {
  const validatedFilters = validateAndNormalizeTemplateFilters(filters);
  const convexHelper = createAnalyticsConvexHelper(convex, "TemplateAnalyticsService");

  try {
    const templateMetricsRaw = await convexHelper.query<TemplatePerformanceItem[]>(
      api.templateAnalytics.getTemplatePerformanceMetrics,
      {
        templateIds,
        companyId,
        dateRange: validatedFilters.dateRange,
      },
      {
        serviceName: "TemplateAnalyticsService",
        methodName: "performPerformanceMetricsQuery",
      }
    );
    const templateMetrics: TemplatePerformanceItem[] = templateMetricsRaw;

    return templateMetrics.map((template: TemplatePerformanceItem): TemplateAnalytics => ({
      templateId: template.templateId,
      templateName: template.templateName,
      category: template.category,
      usage: template.usage,
      performance: template.performance,
      id: template.id,
      name: template.name,
      updatedAt: template.updatedAt,
      ...template.performance,
    }));
  } catch (error) {
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get template performance metrics: ${error}`,
      "templates"
    );
  }
}

/**
 * Perform time series data query.
 * Validates dateRange requirement, fetches from Convex, returns as-is.
 * 
 * @param convex - Convex client instance
 * @param companyId - Company ID for query filtering
 * @param templateIds - Optional template IDs to filter
 * @param filters - Validated analytics filters (dateRange required)
 * @param granularity - Data granularity (day/week/month)
 * @returns Time series data points
 * @throws {AnalyticsError} if dateRange missing or query fails
 */
export async function performTimeSeriesDataQuery(
  convex: ConvexHttpClient,
  companyId: string,
  templateIds: string[] | undefined,
  filters: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day"
): Promise<import("@/types/analytics/core").TimeSeriesDataPoint[]> {
  const validatedFilters = validateAndNormalizeTemplateFilters(filters, true); // Requires dateRange
  const convexHelper = createAnalyticsConvexHelper(convex, "TemplateAnalyticsService");

  try {
    const timeSeriesDataRaw = await convexHelper.query<import("@/types/analytics/core").TimeSeriesDataPoint[]>(
      api.templateAnalytics.getTemplateTimeSeriesData,
      {
        templateIds,
        companyId,
        dateRange: validatedFilters.dateRange!,
        granularity,
      },
      {
        serviceName: "TemplateAnalyticsService",
        methodName: "performTimeSeriesDataQuery",
      }
    );

    return timeSeriesDataRaw;
  } catch (error) {
    if (error instanceof AnalyticsError) throw error;
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get template time series data: ${error}`,
      "templates"
    );
  }
}

/**
 * Perform usage analytics query and computation.
 * Fetches from Convex, computes top templates and totals using calculations.ts.
 * 
 * @param convex - Convex client instance
 * @param companyId - Company ID for query filtering
 * @param filters - Validated analytics filters
 * @param limit - Number of top templates (default 10)
 * @returns Usage analytics with top templates and totals
 * @throws {AnalyticsError} on query failure
 */
export async function performUsageAnalyticsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  filters: AnalyticsFilters,
  limit: number = 10
): Promise<TemplateUsageAnalytics> {
  const validatedFilters = validateAndNormalizeTemplateFilters(filters);
  const convexHelper = createAnalyticsConvexHelper(convex, "TemplateAnalyticsService");

  try {
    const usageDataRaw = await convexHelper.query<TemplatePerformanceItem[]>(
      api.templateAnalytics.getTemplateUsageAnalytics,
      {
        companyId,
        dateRange: validatedFilters.dateRange,
        limit,
      },
      {
        serviceName: "TemplateAnalyticsService",
        methodName: "performUsageAnalyticsQuery",
      }
    );

    // Assume usageDataRaw is TemplatePerformanceItem[] (adjust if Convex returns different shape)
    const usageData: TemplatePerformanceItem[] = Array.isArray(usageDataRaw) ? usageDataRaw : [];

    return computeTemplateUsageAnalytics(usageData, limit);
  } catch (error) {
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get template usage analytics: ${error}`,
      "templates"
    );
  }
}

/**
 * Perform effectiveness metrics query and computation.
 * Fetches from Convex, computes scores and ranks using calculations.ts.
 * 
 * @param convex - Convex client instance
 * @param companyId - Company ID for query filtering
 * @param templateIds - Template IDs to compare
 * @param filters - Validated analytics filters
 * @returns Effectiveness metrics with scores and ranks
 * @throws {AnalyticsError} on query failure
 */
export async function performEffectivenessMetricsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  templateIds: string[],
  filters: AnalyticsFilters
): Promise<TemplateEffectivenessMetrics> {
  const validatedFilters = validateAndNormalizeTemplateFilters(filters);
  const convexHelper = createAnalyticsConvexHelper(convex, "TemplateAnalyticsService");

  try {
    const effectivenessDataRaw = await convexHelper.query<TemplatePerformanceItem[]>(
      api.templateAnalytics.getTemplateEffectivenessMetrics,
      {
        templateIds,
        companyId,
        dateRange: validatedFilters.dateRange,
      },
      {
        serviceName: "TemplateAnalyticsService",
        methodName: "performEffectivenessMetricsQuery",
      }
    );

    // Assume raw data is TemplatePerformanceItem[]
    const effectivenessData: TemplatePerformanceItem[] = Array.isArray(effectivenessDataRaw) ? effectivenessDataRaw : [];

    return computeTemplateEffectivenessMetrics(effectivenessData);
  } catch (error) {
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get template effectiveness metrics: ${error}`,
      "templates"
    );
  }
}

/**
 * Perform analytics overview query and computation.
 * Fetches from Convex, computes aggregations using calculations.ts.
 * 
 * @param convex - Convex client instance
 * @param companyId - Company ID for query filtering
 * @param filters - Validated analytics filters
 * @returns Full overview with aggregations, top template, category breakdown
 * @throws {AnalyticsError} on query failure
 */
export async function performAnalyticsOverviewQuery(
  convex: ConvexHttpClient,
  companyId: string,
  filters: AnalyticsFilters
): Promise<TemplateAnalyticsOverview> {
  const validatedFilters = validateAndNormalizeTemplateFilters(filters);
  const convexHelper = createAnalyticsConvexHelper(convex, "TemplateAnalyticsService");

  try {
    const overviewRaw = await convexHelper.query<TemplatePerformanceItem[]>(
      api.templateAnalytics.getTemplateAnalyticsOverview,
      {
        companyId,
        dateRange: validatedFilters.dateRange,
      },
      {
        serviceName: "TemplateAnalyticsService",
        methodName: "performAnalyticsOverviewQuery",
      }
    );

    // Assume raw is TemplatePerformanceItem[]
    const overviewData: TemplatePerformanceItem[] = Array.isArray(overviewRaw) ? overviewRaw : [];

    return computeTemplateAnalyticsOverview(overviewData);
  } catch (error) {
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get template analytics overview: ${error}`,
      "templates"
    );
  }
}

/**
 * Perform filtered analytics query, dataset creation, and computation.
 * Fetches filtered metrics from Convex, builds dataset, validates, computes using calculations.ts.
 * DateRange required.
 * 
 * @param convex - Convex client instance
 * @param companyId - Company ID for query filtering
 * @param filters - Validated analytics filters (dateRange required)
 * @param options - Compute options for additional fields
 * @returns Filtered analytics with aggregations and rates
 * @throws {AnalyticsError} if dateRange missing or computation fails
 */
export async function performFilteredAnalyticsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  filters: AnalyticsFilters,
  options: AnalyticsComputeOptions = {}
): Promise<FilteredTemplateAnalytics> {
  const validatedFilters = validateAndNormalizeTemplateFilters(filters, true); // Requires dateRange

  if (!validatedFilters.dateRange) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Date range is required for filtered analytics",
      "templates"
    );
  }

  try {
    const convexHelper = createAnalyticsConvexHelper(convex, "TemplateAnalyticsService");
    
    const templateMetricsRaw = await convexHelper.query<TemplatePerformanceItem[]>(
      api.templateAnalytics.getTemplatePerformanceMetrics,
      {
        templateIds: validatedFilters.entityIds as string[],
        companyId,
        dateRange: validatedFilters.dateRange,
      },
      {
        serviceName: "TemplateAnalyticsService",
        methodName: "performFilteredAnalyticsQuery",
      }
    );

    const templateMetrics: TemplatePerformanceItem[] = templateMetricsRaw;

    // Create filtered dataset
    const filteredDataset: FilteredDataset<{ metrics: PerformanceMetrics }> = {
      data: templateMetrics.map((t: TemplatePerformanceItem) => ({ metrics: t.performance })),
      totalCount: templateMetrics.length,
      filters: validatedFilters,
      queryExecutionTime: 0, // Measured in production
    };

    validateTemplateFilteredDataset(filteredDataset);

    return computeTemplateAnalyticsOnFilteredData(filteredDataset, options);
  } catch (error) {
    if (error instanceof AnalyticsError) throw error;
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to compute analytics for filtered data: ${error}`,
      "templates"
    );
  }
}
