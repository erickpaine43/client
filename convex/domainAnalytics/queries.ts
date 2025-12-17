import { query } from "../_generated/server";
import { v } from "convex/values";
import type { GetDomainAnalyticsArgs, DomainAnalyticsResult } from "./types";
import {
  validateCompanyId,
  validateDateRange,
  validateAndNormalizeDomainIds,
} from "./validation";
import {
  validateAndPrepareRecords,
  aggregateDomainAnalytics,
  aggregateAggregatedDomainAnalytics,
  convertAggregatedToDomainAnalytics,
} from "./calculations";

/**
 * Get domain analytics data for the specified domains and date range
 */
export const getDomainAnalytics = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    dateRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
    companyId: v.string(),
  },
  handler: async (ctx, args: GetDomainAnalyticsArgs): Promise<DomainAnalyticsResult[]> => {
    // Input validation
    validateCompanyId(args.companyId);
    validateDateRange(args.dateRange);
    const normalizedDomainIds = validateAndNormalizeDomainIds(args.domainIds);

    // Build the base query
    let query = ctx.db
      .query("domainAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.dateRange.start),
          q.lte(q.field("date"), args.dateRange.end)
        )
      );

    // Apply domain filter if specified
    if (normalizedDomainIds?.length) {
      query = query.filter((q) =>
        q.or(...normalizedDomainIds.map(id => q.eq("domainId", id)))
      );
    }

    // Execute the query and validate records
    const records = await query.collect();
    const validatedRecords = validateAndPrepareRecords(records);

    // Group records by domain
    return aggregateDomainAnalytics(validatedRecords);
  },
});

/**
 * Get aggregated domain analytics (sums) for specified domains and optional date range.
 * Returns a simplified structure matching DomainAnalytics (data layer type).
 */
export const getDomainAggregatedAnalytics = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    companyId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    validateCompanyId(args.companyId);

    // Default to last 30 days if no range provided
    const today = new Date();
    const startDefault = new Date();
    startDefault.setDate(today.getDate() - 30);
    const start = (args.dateRange?.start ?? startDefault.toISOString().split("T")[0]);
    const end = (args.dateRange?.end ?? today.toISOString().split("T")[0]);

    validateDateRange({ start, end });
    const normalizedDomainIds = validateAndNormalizeDomainIds(args.domainIds);

    // Build base query
    let q = ctx.db
      .query("domainAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.and(q.gte(q.field("date"), start), q.lte(q.field("date"), end)));

    if (normalizedDomainIds?.length) {
      q = q.filter((q) => q.or(...normalizedDomainIds.map((id) => q.eq("domainId", id))));
    }

    const records = await q.collect();
    if (!records.length) return [];

    // Aggregate by domain
    const aggregated = aggregateAggregatedDomainAnalytics(validateAndPrepareRecords(records));

    // Shape to DomainAnalytics-compatible objects
    return convertAggregatedToDomainAnalytics(aggregated);
  },
});
