import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { v } from "convex/values";

// Import types
import {
  TimeSeriesAnalyticsResult,
  TimeSeriesGroup,
  MailboxAnalyticsRecord,
  EmailMetrics
} from "./types";

// Import validation
import { validateQueryArgs } from "./validation";

// Import calculations
import {
  formatTimeLabel,
  groupByTimePeriod,
  calculateCorrelationMetrics,
  calculateMailboxInsights
} from "./calculations";

type MailboxRecord = MailboxAnalyticsRecord & EmailMetrics;

/**
 * Get cross-domain time series data showing how mailbox changes affect domain metrics.
 */
export const getCrossDomainTimeSeriesAnalytics = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
    companyId: v.string(),
    granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    const validatedArgs = validateQueryArgs(args);
    const { domainIds, mailboxIds, dateRange, companyId, granularity = "day" } = validatedArgs;

    // Get raw mailbox data for time series grouping
    const mailboxData = await getTimeSeriesMailboxData(ctx, companyId, dateRange!, domainIds, mailboxIds);

    // Group by time period and domain
    const timeGroups = groupByTimePeriod(mailboxData, granularity);

    // Convert to time series format with cross-domain insights
    return processTimeSeriesData(timeGroups, granularity);
  },
});

/**
 * Get cross-domain time series data
 */
export const getTimeSeriesData = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    companyId: v.string(),
    filters: v.optional(v.object({
      dateRange: v.optional(v.object({
        start: v.string(),
        end: v.string(),
      })),
      granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
    })),
  },
  handler: async (ctx, args) => {
    const { domainIds, companyId, filters } = args;
    const granularity = filters?.granularity || "day";

    // Get mailbox data for time series
    const mailboxData = await getFilteredMailboxData(ctx, companyId, filters?.dateRange, domainIds);

    // Group by time period
    const timeGroups = groupByTimePeriod(mailboxData, granularity);

    // Process into time series format
    return processSimpleTimeSeriesData(timeGroups, granularity);
  },
});

// Helper functions
async function getTimeSeriesMailboxData(
  ctx: QueryCtx,
  companyId: string,
  dateRange: { start: string; end: string },
  domainIds?: string[],
  mailboxIds?: string[]
) {
  const mailboxQuery = ctx.db
    .query("mailboxAnalytics")
    .withIndex("by_company_date", (q) => q.eq("companyId", companyId))
    .filter((q) =>
      q.and(
        q.gte(q.field("date"), dateRange.start),
        q.lte(q.field("date"), dateRange.end)
      )
    );

  const allMailboxData = await mailboxQuery.collect();

  // Apply domain and mailbox filters
  let filteredMailboxData: MailboxRecord[] = allMailboxData as MailboxRecord[];
  if (domainIds?.length) {
    filteredMailboxData = filteredMailboxData.filter((m: MailboxRecord) =>
      domainIds.includes(m.domain)
    );
  }
  if (mailboxIds?.length) {
    filteredMailboxData = filteredMailboxData.filter((m: MailboxRecord) =>
      mailboxIds.includes(m.mailboxId)
    );
  }

  return filteredMailboxData;
}

async function getFilteredMailboxData(
  ctx: QueryCtx,
  companyId: string,
  dateRange?: { start: string; end: string },
  domainIds?: string[]
) {
  let mailboxQuery = ctx.db
    .query("mailboxAnalytics")
    .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

  if (dateRange) {
    mailboxQuery = mailboxQuery.filter((q) =>
      q.and(
        q.gte(q.field("date"), dateRange.start),
        q.lte(q.field("date"), dateRange.end)
      )
    );
  }

  const allMailboxData = await mailboxQuery.collect();
  
  const result: MailboxRecord[] = allMailboxData as MailboxRecord[];
  return domainIds?.length
    ? result.filter((m: MailboxRecord) => domainIds.includes(m.domain))
    : result;
}

function processTimeSeriesData(timeGroups: TimeSeriesGroup[], granularity: "day" | "week" | "month"): TimeSeriesAnalyticsResult[] {
  return timeGroups
    .map((group) => {
      // Calculate domain health from mailbox aggregation
      const bounceRate = group.aggregatedMetrics.sent > 0
        ? group.aggregatedMetrics.bounced / group.aggregatedMetrics.sent
        : 0;
      const spamRate = group.aggregatedMetrics.delivered > 0
        ? group.aggregatedMetrics.spamComplaints / group.aggregatedMetrics.delivered
        : 0;

      let healthScore = 100;
      healthScore -= bounceRate * 100 * 2;
      healthScore -= spamRate * 100 * 5;
      healthScore = Math.max(0, Math.min(100, healthScore));

      // Calculate mailbox-level insights
      const mailboxInsights = calculateMailboxInsights(group.mailboxes);

      return {
        date: group.date,
        domainId: group.domainId,
        label: formatTimeLabel(group.date, granularity),

        // Domain metrics (aggregated from mailboxes)
        domainMetrics: group.aggregatedMetrics,
        domainHealthScore: Math.round(healthScore),

        // Mailbox insights that affect domain performance
        mailboxInsights,

        // Cross-domain correlation metrics
        correlationMetrics: calculateCorrelationMetrics(group.aggregatedMetrics, {
          totalCapacity: mailboxInsights.totalCapacity,
          totalVolume: mailboxInsights.totalVolume
        }),
      };
    })
    .sort((a, b) => `${a.date}:${a.domainId}`.localeCompare(`${b.date}:${b.domainId}`));
}

function processSimpleTimeSeriesData(timeGroups: TimeSeriesGroup[], granularity: "day" | "week" | "month") {
  return timeGroups.map((group) => ({
    date: group.date,
    domainId: group.domainId,
    label: formatTimeLabel(group.date, granularity),
    metrics: group.aggregatedMetrics,
    mailboxCount: group.mailboxes.length,
  })).sort((a, b) => `${a.date}:${a.domainId}`.localeCompare(`${b.date}:${b.domainId}`));
}
