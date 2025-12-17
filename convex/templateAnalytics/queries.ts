import { query } from "../_generated/server";
import { v } from "convex/values";
import {
  validateTemplateAnalyticsQueryArgs,
  validateTemplateTimeSeriesQueryArgs,
  validateTemplateUsageQueryArgs,
  validateTemplateEffectivenessQueryArgs
} from "./validation";
import {
  aggregateTemplateMetrics,
  groupTemplatesById,
  groupByDate,
  calculateTemplatePerformanceResults,
  createTimeSeriesDataPoints,
  calculateTemplateUsageResults,
  calculateUsageAnalyticsSummary,
  filterRecordsByTemplateIds,
  calculateCategoryBreakdown,
  calculateEffectivenessScore
} from "./calculations";

/**
 * Get template performance metrics for specified templates.
 * Filters by template IDs and date range, computes analytics on filtered data.
 */
export const getTemplatePerformanceMetrics = query({
  args: {
    templateIds: v.optional(v.array(v.string())),
    companyId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Validate arguments
    const validatedArgs = validateTemplateAnalyticsQueryArgs(args);

    let query = ctx.db
      .query("templateAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", validatedArgs.companyId));

    // Apply date range filter if provided
    if (validatedArgs.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), validatedArgs.dateRange!.start),
          q.lte(q.field("date"), validatedArgs.dateRange!.end)
        )
      );
    }

    const allTemplateAnalytics = await query.collect();

    // Filter by template IDs if provided
    const filteredAnalytics = validatedArgs.templateIds?.length
      ? filterRecordsByTemplateIds(allTemplateAnalytics, validatedArgs.templateIds)
      : allTemplateAnalytics;

    // Group by template and calculate results
    const templateGroups = groupTemplatesById(filteredAnalytics);
    const templateMetrics = calculateTemplatePerformanceResults(templateGroups);

    return templateMetrics;
  },
});

/**
 * Get template time series data for charts.
 * Returns daily/weekly/monthly aggregated data for specified templates.
 */
export const getTemplateTimeSeriesData = query({
  args: {
    templateIds: v.optional(v.array(v.string())),
    companyId: v.string(),
    dateRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
    granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    // Validate arguments
    const validatedArgs = validateTemplateTimeSeriesQueryArgs(args);

    const query = ctx.db
      .query("templateAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", validatedArgs.companyId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), validatedArgs.dateRange!.start),
          q.lte(q.field("date"), validatedArgs.dateRange!.end)
        )
      );

    const allAnalytics = await query.collect();

    // Filter by template IDs if provided
    const filteredAnalytics = validatedArgs.templateIds?.length
      ? filterRecordsByTemplateIds(allAnalytics, validatedArgs.templateIds)
      : allAnalytics;

    // Group by date and create time series data
    const dateGroups = groupByDate(filteredAnalytics);
    const timeSeriesData = createTimeSeriesDataPoints(dateGroups);

    return timeSeriesData;
  },
});

/**
 * Get template usage analytics - most used templates, usage trends.
 */
export const getTemplateUsageAnalytics = query({
  args: {
    companyId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate arguments
    const validatedArgs = validateTemplateUsageQueryArgs(args);

    let query = ctx.db
      .query("templateAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", validatedArgs.companyId));

    // Apply date range filter if provided
    if (validatedArgs.dateRange) {
      const { start, end } = validatedArgs.dateRange;
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), start),
          q.lte(q.field("date"), end)
        )
      );
    }

    const allAnalytics = await query.collect();

    // Group by template and calculate results
    const templateGroups = groupTemplatesById(allAnalytics);
    const templates = calculateTemplateUsageResults(templateGroups);

    // Calculate usage analytics summary
    const result = calculateUsageAnalyticsSummary(templates);

    return result;
  },
});

/**
 * Get template effectiveness metrics - performance comparison.
 */
export const getTemplateEffectivenessMetrics = query({
  args: {
    templateIds: v.array(v.string()),
    companyId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Validate arguments
    const validatedArgs = validateTemplateEffectivenessQueryArgs(args);

    let query = ctx.db
      .query("templateAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", validatedArgs.companyId));

    // Apply date range filter if provided
    if (validatedArgs.dateRange) {
      const { start, end } = validatedArgs.dateRange;
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), start),
          q.lte(q.field("date"), end)
        )
      );
    }

    const allAnalytics = await query.collect();

    // Filter by specified template IDs
    const filteredAnalytics = filterRecordsByTemplateIds(allAnalytics, validatedArgs.templateIds);

    // Calculate effectiveness metrics for each template
    const templateEffectiveness = validatedArgs.templateIds.map((templateId) => {
      const templateAnalytics = filteredAnalytics.filter(
        (analytics) => analytics.templateId === templateId
      );

      if (templateAnalytics.length === 0) {
        return {
          templateId,
          templateName: `Template ${templateId}`,
          category: "OUTREACH",
          effectiveness: {
            usage: 0,
            performance: {
              sent: 0,
              delivered: 0,
              opened_tracked: 0,
              clicked_tracked: 0,
              replied: 0,
              bounced: 0,
              unsubscribed: 0,
              spamComplaints: 0,
            },
            score: 0,
            rank: 0,
          },
        };
      }

      // Aggregate metrics
      const aggregated = aggregateTemplateMetrics(templateAnalytics);

      // Calculate effectiveness score
      const effectivenessScore = calculateEffectivenessScore(aggregated);

      // Calculate total usage separately
      const totalUsage = templateAnalytics.reduce((sum, record) => sum + record.usage, 0);

      const latestRecord = templateAnalytics.sort((a, b) => b.updatedAt - a.updatedAt)[0];

      return {
        templateId,
        templateName: latestRecord.templateName,
        category: latestRecord.category || "OUTREACH",
        effectiveness: {
          usage: totalUsage,
          performance: aggregated,
          score: effectivenessScore,
          rank: 0, // Will be set after sorting
        },
      };
    });

    // Rank templates by effectiveness score
    const rankedTemplates = templateEffectiveness
      .sort((a, b) => b.effectiveness.score - a.effectiveness.score)
      .map((template, index) => ({
        ...template,
        effectiveness: {
          ...template.effectiveness,
          rank: index + 1,
        },
      }));

    return rankedTemplates;
  },
});

/**
 * Get aggregated template analytics overview.
 */
export const getTemplateAnalyticsOverview = query({
  args: {
    companyId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Validate arguments
    const validatedArgs = validateTemplateAnalyticsQueryArgs(args);

    let query = ctx.db
      .query("templateAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", validatedArgs.companyId));

    // Apply date range filter if provided
    if (validatedArgs.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), validatedArgs.dateRange!.start),
          q.lte(q.field("date"), validatedArgs.dateRange!.end)
        )
      );
    }

    const allAnalytics = await query.collect();

    if (allAnalytics.length === 0) {
      return {
        totalTemplates: 0,
        totalUsage: 0,
        aggregatedMetrics: {
          sent: 0,
          delivered: 0,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        },
        topPerformingTemplate: null,
        categoryBreakdown: [],
      };
    }

    // Aggregate all metrics
    const aggregatedMetrics = aggregateTemplateMetrics(allAnalytics);

    // Group by template for additional calculations
    const templateGroups = groupTemplatesById(allAnalytics);
    const templates = calculateTemplatePerformanceResults(templateGroups);

    // Find top performing template
    const topPerformingTemplate = templates
      .sort((a, b) => b.performance.delivered - a.performance.delivered)[0] || null;

    // Calculate category breakdown
    const templateUsageResults = calculateTemplateUsageResults(templateGroups);
    const categoryBreakdown = calculateCategoryBreakdown(templateUsageResults);

    return {
      totalTemplates: templateGroups.size,
      totalUsage: templates.reduce((sum, t) => sum + t.usage, 0),
      aggregatedMetrics,
      topPerformingTemplate,
      categoryBreakdown,
    };
  },
});
