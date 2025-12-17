import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { CampaignAnalyticsRecord, DBCampaignAnalyticsRecord } from "./types";
import { validateCompanyId } from "./validation";

/**
 * Insert or update campaign analytics data.
 * Used by server actions to store analytics data.
 */
export const upsertCampaignAnalytics = mutation({
  args: {
    campaignId: v.string(),
    campaignName: v.string(),
    date: v.string(),
    companyId: v.string(),
    sent: v.number(),
    delivered: v.number(),
    openedTracked: v.number(),
    clickedTracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    status: v.union(
      v.literal('ACTIVE'),
      v.literal('PAUSED'),
      v.literal('COMPLETED'),
      v.literal('DRAFT')
    ),
    leadCount: v.number(),
    activeLeads: v.number(),
    completedLeads: v.number(),
  },
  handler: async (ctx, args) => {
    validateCompanyId(args.companyId);

    const now = Date.now();

    // Check if record exists using proper query builder
    const existing = await ctx.db
      .query("campaignAnalytics")
      .withIndex("by_campaign_date", q =>
        q.eq("campaignId", args.campaignId)
         .eq("date", args.date)
      )
      .first();

    const data = {
      ...args,
      updatedAt: now,
    };

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, data);
      return { ...existing, ...data };
    } else {
      // Prepare data for database insertion
      const { openedTracked, clickedTracked, ...rest } = data;
      const insertData = {
        ...rest,
        opened_tracked: openedTracked,
        clicked_tracked: clickedTracked,
      };
      return await ctx.db.insert("campaignAnalytics", insertData);
    }
  },
});

/**
 * Batch insert/update campaign analytics data.
 * Used for bulk data imports and migrations.
 */
export const batchUpsertCampaignAnalytics = mutation({
  args: {
    records: v.array(v.object({
      campaignId: v.string(),
      campaignName: v.string(),
      date: v.string(),
      companyId: v.string(),
      sent: v.number(),
      delivered: v.number(),
      openedTracked: v.number(),
      clickedTracked: v.number(),
      replied: v.number(),
      bounced: v.number(),
      unsubscribed: v.number(),
      spamComplaints: v.number(),
      status: v.union(
        v.literal('ACTIVE'),
        v.literal('PAUSED'),
        v.literal('COMPLETED'),
        v.literal('DRAFT')
      ),
      leadCount: v.number(),
      activeLeads: v.number(),
      completedLeads: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];

    for (const record of args.records) {
      validateCompanyId(record.companyId);

      // Check if record exists
      const existing = await ctx.db
        .query("campaignAnalytics")
        .withIndex("by_campaign_date", q =>
          q.eq("campaignId", record.campaignId)
           .eq("date", record.date)
        )
        .first();

      const data = {
        ...record,
        updatedAt: now,
      };

      if (existing) {
        // Update existing
        const { openedTracked, clickedTracked, ...rest } = data;
        const updateData = {
          ...rest,
          opened_tracked: openedTracked,
          clicked_tracked: clickedTracked,
        };
        await ctx.db.patch(existing._id, updateData);
        const updatedRecord = { ...existing, ...updateData } as DBCampaignAnalyticsRecord;
        const { opened_tracked: openedTrackedDb, clicked_tracked: clickedTrackedDb, ...restUpdated } = updatedRecord as DBCampaignAnalyticsRecord;
        results.push({
          ...restUpdated,
          openedTracked: openedTrackedDb,
          clickedTracked: clickedTrackedDb,
        } as CampaignAnalyticsRecord);
      } else {
        // Prepare data for database insertion
        const { openedTracked, clickedTracked, ...rest } = data;
        const insertData = {
          ...rest,
          opened_tracked: openedTracked,
          clicked_tracked: clickedTracked,
        };
        const newId = await ctx.db.insert("campaignAnalytics", insertData);
        const inserted = await ctx.db.get(newId);
        if (inserted) {
          const { opened_tracked: openedTrackedDb, clicked_tracked: clickedTrackedDb, ...restNew } = inserted;
          results.push({
            ...restNew,
            openedTracked: openedTrackedDb,
            clickedTracked: clickedTrackedDb,
          } as CampaignAnalyticsRecord);
        }
      }
    }

    return results;
  },
});

/**
 * Delete campaign analytics data.
 * Used for data cleanup and testing.
 */
export const deleteCampaignAnalytics = mutation({
  args: {
    campaignId: v.string(),
    date: v.optional(v.string()),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    const { campaignId, date, companyId } = args;

    validateCompanyId(companyId);

    // Build the base query
    let query = ctx.db
      .query("campaignAnalytics")
      .withIndex("by_company_campaign", q =>
        q.eq("companyId", companyId).eq("campaignId", campaignId)
      );

    // Add date filter if provided
    if (date) {
      query = query.filter(q => q.eq(q.field("date"), date));
    }

    // Get records to be deleted
    const records = await query.collect();

    // Delete records
    await Promise.all(records.map(record =>
      ctx.db.delete(record._id)
    ));

    return records;
  },
});
