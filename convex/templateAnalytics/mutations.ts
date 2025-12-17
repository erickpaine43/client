import { mutation } from "../_generated/server";
import { v } from "convex/values";
import {
  validateUpdateTemplateAnalyticsArgs,
  validateBatchUpdateTemplateAnalyticsArgs
} from "./validation";

/**
 * Update template analytics for a specific template and date.
 * Creates or updates analytics record with provided metrics.
 */
export const updateTemplateAnalytics = mutation({
  args: {
    templateId: v.string(),
    companyId: v.string(),
    date: v.string(),
    sent: v.optional(v.number()),
    delivered: v.optional(v.number()),
    opened_tracked: v.optional(v.number()),
    clicked_tracked: v.optional(v.number()),
    replied: v.optional(v.number()),
    bounced: v.optional(v.number()),
    unsubscribed: v.optional(v.number()),
    spamComplaints: v.optional(v.number()),
    usage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate arguments
    const validatedArgs = validateUpdateTemplateAnalyticsArgs(args);

    // Check if record exists
    const existing = await ctx.db
      .query("templateAnalytics")
      .withIndex("by_template_date", (q) =>
        q.eq("templateId", validatedArgs.templateId).eq("date", validatedArgs.date)
      )
      .first();

    const updateData = {
      templateId: validatedArgs.templateId,
      companyId: validatedArgs.companyId,
      date: validatedArgs.date,
      sent: validatedArgs.sent || 0,
      delivered: validatedArgs.delivered || 0,
      opened_tracked: validatedArgs.opened_tracked || 0,
      clicked_tracked: validatedArgs.clicked_tracked || 0,
      replied: validatedArgs.replied || 0,
      bounced: validatedArgs.bounced || 0,
      unsubscribed: validatedArgs.unsubscribed || 0,
      spamComplaints: validatedArgs.spamComplaints || 0,
      usage: validatedArgs.usage || 0,
      updatedAt: Date.now(),
    };

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, updateData);
      return existing._id;
    } else {
      // Get template name from templates table (assuming it exists)
      // For now, use a placeholder - this would need to be adjusted based on actual schema
      const templateName = `Template ${validatedArgs.templateId}`;

      // Create new record
      const newRecord = await ctx.db.insert("templateAnalytics", {
        ...updateData,
        templateName,
        category: "OUTREACH", // Default category
      });

      return newRecord;
    }
  },
});

/**
 * Batch update template analytics for multiple records.
 * Processes multiple updates in a single transaction.
 */
export const batchUpdateTemplateAnalytics = mutation({
  args: {
    updates: v.array(v.object({
      templateId: v.string(),
      companyId: v.string(),
      date: v.string(),
      sent: v.optional(v.number()),
      delivered: v.optional(v.number()),
      opened_tracked: v.optional(v.number()),
      clicked_tracked: v.optional(v.number()),
      replied: v.optional(v.number()),
      bounced: v.optional(v.number()),
      unsubscribed: v.optional(v.number()),
      spamComplaints: v.optional(v.number()),
      usage: v.optional(v.number()),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate arguments
    const validatedArgs = validateBatchUpdateTemplateAnalyticsArgs(args);

    const results = [];

    for (const update of validatedArgs.updates) {
      // Check if record exists
      const existing = await ctx.db
        .query("templateAnalytics")
        .withIndex("by_template_date", (q) =>
          q.eq("templateId", update.templateId).eq("date", update.date)
        )
        .first();

      const updateData = {
        templateId: update.templateId,
        companyId: update.companyId,
        date: update.date,
        sent: update.sent || 0,
        delivered: update.delivered || 0,
        opened_tracked: update.opened_tracked || 0,
        clicked_tracked: update.clicked_tracked || 0,
        replied: update.replied || 0,
        bounced: update.bounced || 0,
        unsubscribed: update.unsubscribed || 0,
        spamComplaints: update.spamComplaints || 0,
        usage: update.usage || 0,
        updatedAt: Date.now(),
      };

      if (existing) {
        // Update existing record
        await ctx.db.patch(existing._id, updateData);
        results.push({ id: existing._id, action: "updated" });
      } else {
        // Get template name from templates table (assuming it exists)
        const templateName = `Template ${update.templateId}`;

        // Create new record
        const newRecord = await ctx.db.insert("templateAnalytics", {
          ...updateData,
          templateName,
          category: "OUTREACH", // Default category
        });

        results.push({ id: newRecord, action: "created" });
      }
    }

    return {
      success: true,
      processed: results.length,
      results,
    };
  },
});
