import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { PerformanceMetrics } from "@/types/analytics/core";
import type { DomainAnalyticsRecord } from "./types";
import {
  validateDate,
  validateMetrics,
  validateInvariants,
} from "./validation";
import { createZeroMetrics } from "./calculations";

/**
 * Initialize Domain Analytics
 */
export const initializeDomainAnalytics = mutation({
  args: {
    domainId: v.string(),
    domainName: v.string(),
    companyId: v.string(),
    authentication: v.object({
      spf: v.boolean(),
      dkim: v.boolean(),
      dmarc: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const now = Date.now();

    const zeroMetrics = createZeroMetrics();

    const record: Omit<DomainAnalyticsRecord, '_id' | '_creationTime' | 'aggregatedMetrics'> = {
      ...zeroMetrics,
      domainId: args.domainId,
      domainName: args.domainName,
      companyId: args.companyId,
      date: today,
      updatedAt: now,
      authentication: {
        spf: args.authentication.spf,
        dkim: args.authentication.dkim,
        dmarc: args.authentication.dmarc,
      },
    };

    const analyticsId = await ctx.db.insert("domainAnalytics", record);
    return { analyticsId, domainId: args.domainId, initializedAt: now };
  },
});

/**
 * Upsert Domain Analytics
 */
export const upsertDomainAnalytics = mutation({
  args: {
    domainId: v.string(),
    domainName: v.string(),
    date: v.string(),
    companyId: v.string(),
    authentication: v.object({
      spf: v.boolean(),
      dkim: v.boolean(),
      dmarc: v.boolean(),
    }),
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Validate inputs
    validateDate(args.date);
    validateMetrics({
      sent: args.sent,
      delivered: args.delivered,
      opened_tracked: args.opened_tracked,
      clicked_tracked: args.clicked_tracked,
      replied: args.replied,
      bounced: args.bounced,
      unsubscribed: args.unsubscribed,
      spamComplaints: args.spamComplaints,
    });
    validateInvariants(args);

    const metrics: PerformanceMetrics = {
      sent: args.sent,
      delivered: args.delivered,
      opened_tracked: args.opened_tracked,
      clicked_tracked: args.clicked_tracked,
      replied: args.replied,
      bounced: args.bounced,
      unsubscribed: args.unsubscribed,
      spamComplaints: args.spamComplaints,
    };

    const record: Omit<DomainAnalyticsRecord, '_id' | '_creationTime' | 'aggregatedMetrics'> = {
      ...metrics,
      domainId: args.domainId,
      domainName: args.domainName,
      companyId: args.companyId,
      date: args.date,
      updatedAt: now,
      authentication: {
        spf: args.authentication.spf,
        dkim: args.authentication.dkim,
        dmarc: args.authentication.dmarc,
      },
    };

    const existingRecord = await ctx.db
      .query("domainAnalytics")
      .withIndex("by_company_domain", q =>
        q.eq("companyId", args.companyId)
         .eq("domainId", args.domainId)
      )
      .filter(q => q.eq(q.field("date"), args.date))
      .first();

    if (existingRecord) {
      await ctx.db.patch(existingRecord._id, record);
      return existingRecord._id;
    } else {
      return await ctx.db.insert("domainAnalytics", record);
    }
  },
});
