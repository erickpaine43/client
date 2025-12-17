import { mutation, MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

/**
 * Update cross-domain analytics by aggregating mailbox metrics into domain analytics.
 */
export const updateCrossDomainAnalytics = mutation({
  args: {
    mailboxId: v.string(),
    domain: v.string(),
    companyId: v.string(),
    date: v.string(),
    mailboxMetrics: v.object({
      sent: v.number(),
      delivered: v.number(),
      opened_tracked: v.number(),
      clicked_tracked: v.number(),
      replied: v.number(),
      bounced: v.number(),
      unsubscribed: v.number(),
      spamComplaints: v.number(),
    }),
  },
  handler: async (ctx: MutationCtx, args) => {
    // Input validation
    if (!args.companyId || typeof args.companyId !== "string") {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "companyId is required and must be a string",
      });
    }

    if (!args.domain || typeof args.domain !== "string") {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "domain is required and must be a string",
      });
    }

    if (!args.date || typeof args.date !== "string") {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "date is required and must be a string",
      });
    }

    // Query for existing domain analytics record for this company, date, and domain
    const existing = await ctx.db
      .query("domainAnalytics")
      .withIndex("by_company_date", (q) =>
        q.eq("companyId", args.companyId).eq("date", args.date)
      )
      .filter((q) => q.eq("domainId", args.domain))
      .first();

    const now = Date.now();
    let updated;

    if (existing) {
      // Aggregate metrics with existing data
      const aggregatedMetrics = {
        sent: existing.sent + args.mailboxMetrics.sent,
        delivered: existing.delivered + args.mailboxMetrics.delivered,
        opened_tracked: existing.opened_tracked + args.mailboxMetrics.opened_tracked,
        clicked_tracked: existing.clicked_tracked + args.mailboxMetrics.clicked_tracked,
        replied: existing.replied + args.mailboxMetrics.replied,
        bounced: existing.bounced + args.mailboxMetrics.bounced,
        unsubscribed: existing.unsubscribed + args.mailboxMetrics.unsubscribed,
        spamComplaints: existing.spamComplaints + args.mailboxMetrics.spamComplaints,
      };

      // Update existing record
      await ctx.db.patch(existing._id, {
        ...aggregatedMetrics,
        updatedAt: now,
      });

      updated = await ctx.db.get(existing._id);
    } else {
      // Create new record
      const newRecord = {
        domainId: args.domain,
        domainName: args.domain,
        companyId: args.companyId,
        date: args.date,
        sent: args.mailboxMetrics.sent,
        delivered: args.mailboxMetrics.delivered,
        opened_tracked: args.mailboxMetrics.opened_tracked,
        clicked_tracked: args.mailboxMetrics.clicked_tracked,
        replied: args.mailboxMetrics.replied,
        bounced: args.mailboxMetrics.bounced,
        unsubscribed: args.mailboxMetrics.unsubscribed,
        spamComplaints: args.mailboxMetrics.spamComplaints,
        authentication: {
          spf: false,
          dkim: false,
          dmarc: false,
        },
        updatedAt: now,
      };

      const id = await ctx.db.insert("domainAnalytics", newRecord);
      updated = await ctx.db.get(id);
    }

    // Return formatted response matching frontend expectation
    return {
      mailboxUpdated: args.mailboxId,
      domainUpdated: args.domain,
      domainAnalyticsId: updated!._id,
      aggregatedMetrics: {
        sent: updated!.sent,
        delivered: updated!.delivered,
        opened_tracked: updated!.opened_tracked,
        clicked_tracked: updated!.clicked_tracked,
        replied: updated!.replied,
        bounced: updated!.bounced,
        unsubscribed: updated!.unsubscribed,
        spamComplaints: updated!.spamComplaints,
      },
    };
  },
});

/**
 * Export cross-domain analytics data
 */
export const exportAnalytics = mutation({
  args: {
    domainIds: v.optional(v.array(v.string())),
    analysisType: v.union(v.literal("performance"), v.literal("correlation"), v.literal("trend"), v.literal("all")),
    companyId: v.string(),
    filters: v.optional(v.object({
      dateRange: v.optional(v.object({
        start: v.string(),
        end: v.string(),
      })),
    })),
    format: v.union(v.literal("csv"), v.literal("json")),
    requestedBy: v.string(),
    requestedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { analysisType, format } = args;

    // Generate download URL (simplified - in real implementation this would generate actual export)
    const downloadUrl = `https://exports.example.com/${Date.now()}-${analysisType}.${format}`;
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    return {
      downloadUrl,
      expiresAt,
    };
  },
});
