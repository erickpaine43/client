import { query } from "../_generated/server";
import { v } from "convex/values";
import { CampaignStatus } from "../../types/analytics/domain-specific";
import {
  CampaignAnalyticsRecord,
  DBCampaignAnalyticsRecord,
  CampaignAnalyticsQueryArgs
} from "./types";
import { validateQueryArgs } from "./validation";
import {
  aggregateCampaignData,
  groupByTimePeriod
} from "./calculations";

/**
 * Get campaign analytics data for specific campaigns.
 * Supports filtering by campaign IDs, date range, and company.
 * Includes pagination support.
 */
export const getCampaignAnalytics = query({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
    cursor: v.optional(v.string()),
    numItems: v.optional(v.number()),
  },
  handler: async (ctx, args: CampaignAnalyticsQueryArgs): Promise<{
    results: CampaignAnalyticsRecord[];
    nextCursor?: string;
    hasMore: boolean;
  }> => {
    const validatedArgs = validateQueryArgs(args);
    const { campaignIds = [], dateRange, companyId, cursor, numItems = 100 } = validatedArgs;

    try {
      // Determine which index to use based on the query parameters
      const useCampaignIndex = campaignIds.length === 1;
      const indexName = useCampaignIndex ? "by_campaign_date" : "by_company_date";

      // Start with the base query and apply the appropriate index
      const query = ctx.db.query("campaignAnalytics");
      const queryWithIndex = query.withIndex(indexName, (q) => {
        if (useCampaignIndex) {
          return q.eq("campaignId", campaignIds[0]);
        } else {
          return q.eq("companyId", companyId);
        }
      });

      // Apply filters using the query builder
      const filteredQuery = queryWithIndex.filter((q) => {
        type BoolExpr = ReturnType<typeof q.and>;
        let pred: BoolExpr | boolean | undefined;
        const add = (e: BoolExpr | boolean) => {
          pred = pred ? q.and(pred, e) : e;
        };

        // Always filter by companyId if not using the company index
        if (!useCampaignIndex) {
          add(q.eq(q.field("companyId" as const), companyId));
        }

        // Add date range filters if provided
        if (dateRange?.start) {
          add(q.gte(q.field("date" as const), dateRange.start));
        }
        if (dateRange?.end) {
          add(q.lte(q.field("date" as const), dateRange.end));
        }

        // Add campaign ID filter if multiple campaigns are provided
        if (campaignIds.length > 1) {
          add(
            q.or(
              ...campaignIds.map(id =>
                q.eq(q.field("campaignId" as const), id)
              )
            )
          );
        }

        // Return the combined conditions or a truthy expression if no conditions
        return pred ?? true;
      });

      // Apply pagination with proper type safety
      const paginationOptions = {
        numItems,
        cursor: cursor ? JSON.parse(cursor) : undefined,
      };

      const results = await filteredQuery.paginate(paginationOptions);

      // Map database records to application model with proper type safety
      const mappedResults: CampaignAnalyticsRecord[] = results.page.map(record => {
        const { opened_tracked, clicked_tracked, ...rest } = record as DBCampaignAnalyticsRecord;
        return {
          ...rest,
          openedTracked: opened_tracked,
          clickedTracked: clicked_tracked,
        } as CampaignAnalyticsRecord;
      });

      return {
        results: mappedResults,
        nextCursor: results.continueCursor ? JSON.stringify(results.continueCursor) : undefined,
        hasMore: results.isDone === false,
      };
    } catch (error) {
      console.error("Error in getCampaignAnalytics:", error);
      throw error;
    }
  },
});

/**
 * Get campaign analytics aggregated by campaign (all dates combined).
 * Returns aggregated metrics for each campaign with pagination support.
 */
export const getCampaignAggregatedAnalytics = query({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
    cursor: v.optional(v.string()),
    numItems: v.optional(v.number()),
  },
  handler: async (ctx, args: CampaignAnalyticsQueryArgs) => {
    const validatedArgs = validateQueryArgs(args);
    const { campaignIds, dateRange, companyId, cursor, numItems = 100 } = validatedArgs;

    // Build the base query with proper type safety
    const baseQuery = ctx.db.query("campaignAnalytics");

    // Determine the best index to use
    let queryWithIndex;
    if (campaignIds?.length === 1) {
      // Single campaign ID - use by_campaign_date index
      queryWithIndex = baseQuery.withIndex("by_campaign_date", (q) =>
        q.eq("campaignId", campaignIds[0])
      );
    } else {
      // Default to company_date index for all other cases
      queryWithIndex = baseQuery.withIndex("by_company_date", (q) =>
        q.eq("companyId", companyId)
      );
    }

    // Apply filters using the query builder's filter method
    const filteredQuery = queryWithIndex.filter((q) => {
      type BoolExpr = ReturnType<typeof q.and>;
      let pred: BoolExpr | boolean | undefined;
      const add = (e: BoolExpr | boolean) => {
        pred = pred ? q.and(pred, e) : e;
      };

      // Filter by campaign IDs if provided (for the case where we used company_date index)
      if (campaignIds?.length && campaignIds.length > 1) {
        add(
          q.or(...campaignIds.map(id =>
            q.eq(q.field("campaignId" as const), id)
          ))
        );
      }

      // Filter by date range if provided
      if (dateRange?.start) {
        add(q.gte(q.field("date" as const), dateRange.start));
      }
      if (dateRange?.end) {
        add(q.lte(q.field("date" as const), dateRange.end));
      }

      return pred ?? true;
    });

    // Apply pagination
    const paginationOptions = {
      numItems,
      cursor: cursor ? JSON.parse(cursor) : undefined
    };

    const queryResult = await filteredQuery.order("asc").paginate(paginationOptions);

    // Map database records to application model with proper field mapping
    const results: CampaignAnalyticsRecord[] = [];
    for (const record of queryResult.page) {
      const { opened_tracked, clicked_tracked, ...rest } = record;
      results.push({
        ...rest,
        openedTracked: opened_tracked,
        clickedTracked: clicked_tracked
      });
    }

    const nextCursor = queryResult.isDone ? undefined : JSON.stringify(queryResult.continueCursor);
    const hasMore = !queryResult.isDone;

    // Use the aggregateCampaignData utility function
    const aggregatedResults = aggregateCampaignData(results);

    // Convert map values to array and ensure valid CampaignStatus
    const finalResults = aggregatedResults.map(campaign => {
      // Ensure status is a valid CampaignStatus
      const validStatus: CampaignStatus =
        (['ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'] as const).includes(campaign.status as CampaignStatus)
          ? (campaign.status as CampaignStatus)
          : 'DRAFT';
      return {
        ...campaign,
        status: validStatus,
      };
    });

    return {
      results: finalResults,
      nextCursor,
      hasMore,
    };
  },
});

/**
 * Get time series analytics data for campaigns.
 * Returns daily/weekly/monthly aggregated data for charting.
 */
export const getCampaignTimeSeriesAnalytics = query({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    dateRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
    companyId: v.string(),
    granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    const validatedArgs = validateQueryArgs(args);
    const { campaignIds, dateRange, companyId, granularity = 'day' } = validatedArgs;

    if (!dateRange) {
      throw new Error("Date range is required for time series analytics");
    }

    const { start: startDate, end: endDate } = dateRange;

    // Get all relevant analytics data
    const allResults: DBCampaignAnalyticsRecord[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    // Build the base query with proper type handling
    // Using the typed Convex builder directly avoids 'any' and preserves type inference
    const baseQuery = ctx.db
      .query("campaignAnalytics")
      .withIndex("by_company_date", (q) =>
        q
          .eq("companyId", companyId)
          .gte("date", startDate)
          .lte("date", endDate)
      );

    // Execute paginated query with campaign filters
    while (hasMore) {
      let result;

      if (campaignIds?.length) {
        // If we have campaign IDs, we'll use the by_company_campaign index
        // and filter by date in memory since we can't use both indexes together
        const campaignPromises = campaignIds.map(async (campaignId) => {
          const query = ctx.db.query("campaignAnalytics")
            .withIndex("by_company_campaign", (q) =>
              q.eq("companyId", companyId)
                .eq("campaignId", campaignId)
            );
          const results = await query.collect();
          // Filter by date in memory
          return results.filter(record =>
            record.date >= startDate && record.date <= endDate
          );
        });

        // Execute all queries in parallel and flatten results
        const results = await Promise.all(campaignPromises);
        const allCampaignResults = results.flat();

        // Sort by date for consistent pagination
        allCampaignResults.sort((a, b) => a.date.localeCompare(b.date));

        // Manually handle pagination
        const startIndex = cursor ? parseInt(JSON.parse(cursor), 10) : 0;
        const endIndex = Math.min(startIndex + 100, allCampaignResults.length);

        result = {
          page: allCampaignResults.slice(startIndex, endIndex),
          isDone: endIndex >= allCampaignResults.length,
          continueCursor: endIndex < allCampaignResults.length ? JSON.stringify(endIndex) : undefined
        };
      } else {
        // Simple case: no campaign filters - use the by_company_date index
        result = await baseQuery.paginate({
          numItems: 100,
          cursor: cursor ? JSON.parse(cursor) : null
        });
      }

      // Process results
      allResults.push(...result.page);

      // Update cursor and hasMore flag
      cursor = result.continueCursor ? JSON.stringify(result.continueCursor) : undefined;
      hasMore = !result.isDone && !!result.continueCursor && result.page.length > 0;

      // Additional safety check to prevent infinite loops
      if (allResults.length >= 1000) { // Limit total results to prevent memory issues
        hasMore = false;
      }
    }

    // Map database records to application model
    const mappedResults: CampaignAnalyticsRecord[] = allResults.map(record => {
      const { opened_tracked, clicked_tracked, ...rest } = record as DBCampaignAnalyticsRecord;
      return {
        ...rest,
        openedTracked: opened_tracked,
        clickedTracked: clicked_tracked,
      } as CampaignAnalyticsRecord;
    });

    // Use the groupByTimePeriod utility function
    const timeSeriesMap = groupByTimePeriod(mappedResults, granularity);

    // Convert to array and sort by time
    const sortedResults = Array.from(timeSeriesMap.values()).sort((a, b) =>
      new Date(a.timeKey).getTime() - new Date(b.timeKey).getTime()
    );

    return sortedResults;
  },
});

/**
 * Get performance metrics for specific campaigns.
 * Returns aggregated performance data with calculated rates.
 */
export const getCampaignPerformanceMetrics = query({
  args: {
    campaignIds: v.array(v.string()),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args: {
    campaignIds: string[];
    dateRange?: { start: string; end: string };
    companyId: string;
  }) => {
    const validatedArgs = validateQueryArgs(args);
    const { campaignIds, dateRange, companyId } = validatedArgs;

    if (!campaignIds || campaignIds.length === 0) {
      throw new Error("Campaign IDs are required for performance metrics");
    }

    // Build a query similar to getCampaignAggregatedAnalytics (cannot call queries from queries)
    const baseQuery = ctx.db.query("campaignAnalytics");
    const useCampaignIndex = campaignIds.length === 1;
    const queryWithIndex = useCampaignIndex
      ? baseQuery.withIndex("by_campaign_date", q => q.eq("campaignId", campaignIds[0]))
      : baseQuery.withIndex("by_company_date", q => q.eq("companyId", companyId));

    const filteredQuery = queryWithIndex.filter((q) => {
      type BoolExpr = ReturnType<typeof q.and>;
      let pred: BoolExpr | boolean | undefined;
      const add = (e: BoolExpr | boolean) => {
        pred = pred ? q.and(pred, e) : e;
      };
      // If using campaign index, optionally constrain by date and company; if using company index, filter campaigns
      if (dateRange?.start) add(q.gte(q.field("date" as const), dateRange.start));
      if (dateRange?.end) add(q.lte(q.field("date" as const), dateRange.end));
      if (!useCampaignIndex) {
        // Multiple campaigns: filter by all campaignIds
        if (campaignIds.length > 0) {
          add(q.or(...campaignIds.map(id => q.eq(q.field("campaignId" as const), id))));
        }
      } else {
        // Single campaign index in use; if campaignId duplicates across companies are possible, also filter companyId
        add(q.eq(q.field("companyId" as const), companyId));
      }
      return pred ?? true;
    });

    const page = await filteredQuery.collect();

    // Map DB records to app records
    const mapped: CampaignAnalyticsRecord[] = page.map(r => {
      const { opened_tracked, clicked_tracked, ...rest } = r as DBCampaignAnalyticsRecord;
      return {
        ...rest,
        openedTracked: opened_tracked,
        clickedTracked: clicked_tracked,
      } as CampaignAnalyticsRecord;
    });

    // Use the aggregateCampaignData utility function
    const aggregatedResults = aggregateCampaignData(mapped);

    return aggregatedResults.map(campaign => {
      const metrics = campaign.aggregatedMetrics;
      const performanceMetrics = {
        sent: metrics.sent,
        delivered: metrics.delivered,
        openedTracked: metrics.openedTracked,
        clickedTracked: metrics.clickedTracked,
        replied: metrics.replied,
        bounced: metrics.bounced,
        unsubscribed: metrics.unsubscribed,
        spamComplaints: metrics.spamComplaints,
        deliveryRate: metrics.deliveryRate,
        openRate: metrics.openRate,
        clickRate: metrics.clickRate,
        replyRate: metrics.replyRate,
        bounceRate: metrics.bounceRate,
        unsubscribeRate: metrics.unsubscribeRate,
        complaintRate: metrics.complaintRate,
      } as const;
      return {
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        status: campaign.status,
        metrics: performanceMetrics,
        updatedAt: campaign.updatedAt,
      };
    });
  },
});
