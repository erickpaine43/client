import { mutation, MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { 
  validateCompanyId, 
  validateDateRange, 
  validateMetrics, 
  validateMetricInvariants 
} from "./validation";

type UpsertMailboxAnalyticsArgs = {
  mailboxId: string;
  email: string;
  domain: string;
  provider: string;
  companyId: string;
  date: string;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  warmupStatus: "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED";
  warmupProgress: number;
  dailyLimit: number;
  currentVolume: number;
};

/**
 * Handler function for upserting mailbox analytics record.
 */
async function upsertMailboxAnalyticsHandler(ctx: MutationCtx, args: UpsertMailboxAnalyticsArgs): Promise<string> {
  // Input validation
  validateCompanyId(args.companyId);
    
    // Date format validation using validateDateRange pattern
    validateDateRange({ start: args.date, end: args.date });
    
    // Validate mailbox ID
    if (!args.mailboxId || typeof args.mailboxId !== "string" || args.mailboxId.trim().length === 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "mailboxId is required and must be a non-empty string",
      });
    }
    
    // Validate email format (basic check)
    if (!args.email || typeof args.email !== "string" || !args.email.includes("@")) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "email is required and must be a valid email address",
      });
    }
    
    // Validate domain and provider
    if (!args.domain || typeof args.domain !== "string" || args.domain.trim().length === 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "domain is required and must be a non-empty string",
      });
    }
    
    if (!args.provider || typeof args.provider !== "string" || args.provider.trim().length === 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "provider is required and must be a non-empty string",
      });
    }
    
    // Validate warmup progress (0-100)
    if (!Number.isFinite(args.warmupProgress) || args.warmupProgress < 0 || args.warmupProgress > 100) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "warmupProgress must be a finite number between 0 and 100",
      });
    }
    
    // Validate daily limit and current volume
    if (!Number.isFinite(args.dailyLimit) || args.dailyLimit < 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "dailyLimit must be a finite, non-negative number",
      });
    }
    
    if (!Number.isFinite(args.currentVolume) || args.currentVolume < 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "currentVolume must be a finite, non-negative number",
      });
    }
    
    // Create metrics object for validation
    const metrics = {
      sent: args.sent,
      delivered: args.delivered,
      opened_tracked: args.opened_tracked,
      clicked_tracked: args.clicked_tracked,
      replied: args.replied,
      bounced: args.bounced,
      unsubscribed: args.unsubscribed,
      spamComplaints: args.spamComplaints,
    };
    
    // Metrics validation
    validateMetrics(metrics);
    validateMetricInvariants(metrics);
    
    // Use by_mailbox_date index for efficient upsert operations
    const existing = await ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_mailbox_date", (q) =>
        q.eq("mailboxId", args.mailboxId).eq("date", args.date)
      )
      .first();

    const data = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("mailboxAnalytics", data);
    }
}

/**
* Insert or update mailbox analytics record.
*/
export const upsertMailboxAnalytics = mutation({
 args: {
   mailboxId: v.string(),
   email: v.string(),
   domain: v.string(),
   provider: v.string(),
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
   warmupStatus: v.union(
     v.literal("NOT_STARTED"),
     v.literal("WARMING"),
     v.literal("WARMED"),
     v.literal("PAUSED")
   ),
   warmupProgress: v.number(),
   dailyLimit: v.number(),
   currentVolume: v.number(),
 },
 handler: upsertMailboxAnalyticsHandler,
});

/**
* Insert or update warmup analytics record.
*/
export const upsertWarmupAnalytics = mutation({
  args: {
    mailboxId: v.string(),
    companyId: v.string(),
    date: v.string(),
    totalWarmups: v.number(),
    delivered: v.number(),
    spamComplaints: v.number(),
    replies: v.number(),
    bounced: v.number(),
    emailsWarmed: v.number(),
    healthScore: v.number(),
    progressPercentage: v.number(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Input validation
    validateCompanyId(args.companyId);
    
    // Date format validation
    validateDateRange({ start: args.date, end: args.date });
    
    // Validate mailbox ID
    if (!args.mailboxId || typeof args.mailboxId !== "string" || args.mailboxId.trim().length === 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "mailboxId is required and must be a non-empty string",
      });
    }
    
    // Warmup field validation (non-negative, reasonable bounds)
    const warmupFields = [
      { name: "totalWarmups", value: args.totalWarmups },
      { name: "delivered", value: args.delivered },
      { name: "spamComplaints", value: args.spamComplaints },
      { name: "replies", value: args.replies },
      { name: "bounced", value: args.bounced },
      { name: "emailsWarmed", value: args.emailsWarmed },
    ];
    
    for (const field of warmupFields) {
      if (!Number.isFinite(field.value) || field.value < 0) {
        throw new ConvexError({
          code: "ANALYTICS_INVALID_INPUT",
          message: `${field.name} must be a finite, non-negative number`,
        });
      }
      
      // Reasonable bounds check (prevent extremely large values)
      if (field.value > 1000000) {
        throw new ConvexError({
          code: "ANALYTICS_INVALID_INPUT",
          message: `${field.name} value ${field.value} exceeds reasonable bounds (max: 1,000,000)`,
        });
      }
    }
    
    // Validate health score (0-100)
    if (!Number.isFinite(args.healthScore) || args.healthScore < 0 || args.healthScore > 100) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "healthScore must be a finite number between 0 and 100",
      });
    }
    
    // Validate progress percentage (0-100)
    if (!Number.isFinite(args.progressPercentage) || args.progressPercentage < 0 || args.progressPercentage > 100) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "progressPercentage must be a finite number between 0 and 100",
      });
    }
    
    // Invariant checking for warmup-specific constraints
    if (args.delivered > args.totalWarmups) {
      throw new ConvexError({
        code: "ANALYTICS_INVARIANT_VIOLATION",
        message: "delivered cannot be greater than totalWarmups",
      });
    }
    
    if (args.bounced > args.totalWarmups) {
      throw new ConvexError({
        code: "ANALYTICS_INVARIANT_VIOLATION",
        message: "bounced cannot be greater than totalWarmups",
      });
    }
    
    if (args.spamComplaints > args.delivered) {
      throw new ConvexError({
        code: "ANALYTICS_INVARIANT_VIOLATION",
        message: "spamComplaints cannot be greater than delivered",
      });
    }
    
    if (args.replies > args.delivered) {
      throw new ConvexError({
        code: "ANALYTICS_INVARIANT_VIOLATION",
        message: "replies cannot be greater than delivered",
      });
    }
    
    // Additional warmup-specific constraint: delivered + bounced should not exceed totalWarmups
    if (args.delivered + args.bounced > args.totalWarmups) {
      throw new ConvexError({
        code: "ANALYTICS_INVARIANT_VIOLATION",
        message: "delivered + bounced cannot be greater than totalWarmups",
      });
    }
    
    // Use by_mailbox_date index for warmup analytics table
    const existing = await ctx.db
      .query("warmupAnalytics")
      .withIndex("by_mailbox_date", (q) =>
        q.eq("mailboxId", args.mailboxId).eq("date", args.date)
      )
      .first();

    const data = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("warmupAnalytics", data);
    }
  },
});

/**
 * Batch insert mailbox analytics data.
 */
export const batchInsertMailboxAnalytics = mutation({
  args: {
    records: v.array(v.object({
      mailboxId: v.string(),
      email: v.string(),
      domain: v.string(),
      provider: v.string(),
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
      warmupStatus: v.union(
        v.literal("NOT_STARTED"),
        v.literal("WARMING"),
        v.literal("WARMED"),
        v.literal("PAUSED")
      ),
      warmupProgress: v.number(),
      dailyLimit: v.number(),
      currentVolume: v.number(),
    })),
  },
  handler: async (ctx, args): Promise<{
    totalRecords: number;
    successful: number;
    failed: number;
    results: Array<{
      success: boolean;
      id?: string;
      error?: string;
      mailboxId: string;
    }>;
  }> => {
    const results: Array<{
      success: boolean;
      id?: string;
      error?: string;
      mailboxId: string;
    }> = [];
    
    for (const record of args.records) {
      try {
        const id = await upsertMailboxAnalyticsHandler(ctx, record);
        results.push({ success: true, id, mailboxId: record.mailboxId });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          mailboxId: record.mailboxId,
        });
      }
    }
    
    return {
      totalRecords: args.records.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  },
});

/**
 * Delete mailbox analytics data for a specific mailbox and optional date range.
 */
export const deleteMailboxAnalytics = mutation({
  args: {
    mailboxId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    deletedCount: number;
    mailboxId: string;
  }> => {
    // Input validation for companyId
    validateCompanyId(args.companyId);
    
    // Validate mailbox ID
    if (!args.mailboxId || typeof args.mailboxId !== "string" || args.mailboxId.trim().length === 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: "mailboxId is required and must be a non-empty string",
      });
    }
    
    // Input validation for dateRange if provided
    if (args.dateRange) {
      validateDateRange(args.dateRange);
    }
    
    // Use by_company_mailbox index for efficient querying
    const query = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_mailbox", (q) =>
        q.eq("companyId", args.companyId).eq("mailboxId", args.mailboxId)
      );

    let records = await query.collect();

    // Implement deterministic filtering with proper validation
    if (args.dateRange) {
      const { start, end } = args.dateRange;
      
      // Apply deterministic filtering - ensure consistent behavior
      records = records.filter((record) => {
        // Use string comparison for YYYY-MM-DD format dates
        return record.date >= start && record.date <= end;
      });
      
      // Sort records deterministically for consistent deletion order
      records.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a._id.localeCompare(b._id); // Secondary sort by ID for full determinism
      });
    } else {
      // Sort all records deterministically when no date filter
      records.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a._id.localeCompare(b._id);
      });
    }

    // Error handling for edge cases
    if (records.length === 0) {
      // Not an error - just no records to delete
      return {
        deletedCount: 0,
        mailboxId: args.mailboxId,
      };
    }
    
    // Ensure consistent deletion behavior with proper error handling
    try {
      const deletePromises = records.map((record) => ctx.db.delete(record._id));
      await Promise.all(deletePromises);
      
      return {
        deletedCount: records.length,
        mailboxId: args.mailboxId,
      };
    } catch (error) {
      // Handle deletion errors gracefully
      throw new ConvexError({
        code: "ANALYTICS_DELETION_FAILED",
        message: `Failed to delete mailbox analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  },
});
