import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { LeadAnalyticsMutationArgs } from "./types";
import { validateLeadAnalyticsMutationArgs, sanitizeLeadAnalyticsMutationArgs } from "./validation";

/**
 * Upsert Lead Analytics Data
 * Creates or updates lead analytics records
 */
export const upsertLeadAnalytics = mutation({
  args: {
    leadId: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    companyId: v.string(),
    date: v.string(),
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("REPLIED"),
      v.literal("BOUNCED"),
      v.literal("UNSUBSCRIBED"),
      v.literal("COMPLETED")
    ),
  },
  handler: async (ctx, args: LeadAnalyticsMutationArgs) => {
    // Validate input arguments
    const validation = validateLeadAnalyticsMutationArgs(args);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    if (validation.warnings.length > 0) {
      console.warn("Lead analytics validation warnings:", validation.warnings);
    }

    // Sanitize the arguments
    const sanitizedArgs = sanitizeLeadAnalyticsMutationArgs(args);

    // Check if record exists
    const existing = await ctx.db
      .query("leadAnalytics")
      .withIndex("by_lead_date", (q) =>
        q.eq("leadId", sanitizedArgs.leadId).eq("date", sanitizedArgs.date)
      )
      .first();

    const data = {
      ...sanitizedArgs,
      updatedAt: Date.now()
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("leadAnalytics", data);
    }
  },
});

/**
 * Batch Insert Lead Analytics Data
 * Creates multiple lead analytics records in a single operation
 */
export const batchInsertLeadAnalytics = mutation({
  args: {
    records: v.array(v.object({
      leadId: v.string(),
      email: v.string(),
      company: v.optional(v.string()),
      companyId: v.string(),
      date: v.string(),
      sent: v.number(),
      delivered: v.number(),
      opened_tracked: v.number(),
      clicked_tracked: v.number(),
      replied: v.number(),
      bounced: v.number(),
      unsubscribed: v.number(),
      spamComplaints: v.number(),
      status: v.union(
        v.literal("ACTIVE"),
        v.literal("REPLIED"),
        v.literal("BOUNCED"),
        v.literal("UNSUBSCRIBED"),
        v.literal("COMPLETED")
      ),
    })),
  },
  handler: async (ctx, args) => {
    if (!args.records || args.records.length === 0) {
      throw new Error("Records array is required and cannot be empty");
    }

    const insertedIds: Id<"leadAnalytics">[] = [];
    const errors: string[] = [];

    // Process each record with individual validation
    for (let i = 0; i < args.records.length; i++) {
      const record = args.records[i];

      try {
        // Validate each record
        const validation = validateLeadAnalyticsMutationArgs(record);
        if (!validation.isValid) {
          errors.push(`Record ${i}: ${validation.errors.join(", ")}`);
          continue;
        }

        if (validation.warnings.length > 0) {
          console.warn(`Record ${i} warnings:`, validation.warnings);
        }

        // Sanitize and insert
        const sanitizedRecord = sanitizeLeadAnalyticsMutationArgs(record);
        const data = {
          ...sanitizedRecord,
          updatedAt: Date.now()
        };

        const id = await ctx.db.insert("leadAnalytics", data);
        insertedIds.push(id);

      } catch (error) {
        errors.push(`Record ${i}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // If all records failed, throw an error
    if (insertedIds.length === 0) {
      throw new Error(`All records failed validation: ${errors.join("; ")}`);
    }

    // Log any partial failures
    if (errors.length > 0) {
      console.warn(`Batch insert completed with ${insertedIds.length} successes and ${errors.length} failures:`, errors);
    }

    return {
      insertedIds,
      successCount: insertedIds.length,
      failureCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    };
  },
});

/**
 * Batch Update Lead Analytics Data
 * Updates multiple existing lead analytics records
 */
export const batchUpdateLeadAnalytics = mutation({
  args: {
    updates: v.array(v.object({
      leadId: v.string(),
      date: v.string(),
      updates: v.object({
        sent: v.optional(v.number()),
        delivered: v.optional(v.number()),
        opened_tracked: v.optional(v.number()),
        clicked_tracked: v.optional(v.number()),
        replied: v.optional(v.number()),
        bounced: v.optional(v.number()),
        unsubscribed: v.optional(v.number()),
        spamComplaints: v.optional(v.number()),
        status: v.optional(v.union(
          v.literal("ACTIVE"),
          v.literal("REPLIED"),
          v.literal("BOUNCED"),
          v.literal("UNSUBSCRIBED"),
          v.literal("COMPLETED")
        )),
      }),
    })),
  },
  handler: async (ctx, args) => {
    if (!args.updates || args.updates.length === 0) {
      throw new Error("Updates array is required and cannot be empty");
    }

    const updatedIds: Id<"leadAnalytics">[] = [];
    const errors: string[] = [];

    for (let i = 0; i < args.updates.length; i++) {
      const update = args.updates[i];

      try {
        // Find the existing record
        const existing = await ctx.db
          .query("leadAnalytics")
          .withIndex("by_lead_date", (q) =>
            q.eq("leadId", update.leadId).eq("date", update.date)
          )
          .first();

        if (!existing) {
          errors.push(`Record ${i}: No existing record found for leadId=${update.leadId}, date=${update.date}`);
          continue;
        }

        // Prepare update data
        const updateData = {
          ...update.updates,
          updatedAt: Date.now()
        };

        await ctx.db.patch(existing._id, updateData);
        updatedIds.push(existing._id);

      } catch (error) {
        errors.push(`Record ${i}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return {
      updatedIds,
      successCount: updatedIds.length,
      failureCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    };
  },
});

/**
 * Delete Lead Analytics Data
 * Removes lead analytics records based on filters
 */
export const deleteLeadAnalytics = mutation({
  args: {
    leadId: v.string(),
    date: v.optional(v.string()),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.leadId || !args.companyId) {
      throw new Error("leadId and companyId are required");
    }

    let query = ctx.db
      .query("leadAnalytics")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .filter((q) => q.eq(q.field("companyId"), args.companyId));

    if (args.date) {
      query = query.filter((q) => q.eq(q.field("date"), args.date));
    }

    const records = await query.collect();

    if (records.length === 0) {
      return {
        deletedCount: 0,
        message: "No records found matching the criteria"
      };
    }

    // Delete all matching records
    for (const record of records) {
      await ctx.db.delete(record._id);
    }

    return {
      deletedCount: records.length,
      message: `Successfully deleted ${records.length} record(s)`
    };
  },
});

/**
 * Initialize Lead Analytics
 * Sets up initial analytics data for a new lead
 */
export const initializeLeadAnalytics = mutation({
  args: {
    leadId: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    companyId: v.string(),
    initialStatus: v.optional(v.union(
      v.literal("ACTIVE"),
      v.literal("REPLIED"),
      v.literal("BOUNCED"),
      v.literal("UNSUBSCRIBED"),
      v.literal("COMPLETED")
    )),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    const initialData = {
      leadId: args.leadId,
      email: args.email,
      company: args.company,
      companyId: args.companyId,
      date: today,
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
      status: args.initialStatus || "ACTIVE",
      updatedAt: Date.now()
    };

    // Validate the initial data
    const validation = validateLeadAnalyticsMutationArgs(initialData);
    if (!validation.isValid) {
      throw new Error(`Invalid initial data: ${validation.errors.join(", ")}`);
    }

    const id = await ctx.db.insert("leadAnalytics", initialData);

    return {
      id,
      message: "Lead analytics initialized successfully"
    };
  },
});
