import { mutation } from "../_generated/server";
import type { BulkUpdateResult, BulkUpdateResponse, InitializeBillingResponse } from "./types";
import {
  upsertBillingAnalyticsArgs,
  initializeBillingAnalyticsArgs,
  bulkUpdateBillingAnalyticsArgs
} from "./validation";


// ============================================================================
// BILLING ANALYTICS MUTATION HANDLERS
// ============================================================================

/**
 * Update or insert billing analytics data.
 */
export const upsertBillingAnalytics = mutation({
  args: upsertBillingAnalyticsArgs,
  handler: async (ctx, args) => {
    // Check if record exists for this company and date
    const existing = await ctx.db
      .query("billingAnalytics")
      .withIndex("by_company_date", (q) =>
        q.eq("companyId", args.companyId).eq("date", args.date)
      )
      .first();

    const billingData = {
      companyId: args.companyId,
      date: args.date,
      planType: args.planType,
      emailsSent: args.usage.emailsSent,
      emailsRemaining: args.usage.emailsRemaining,
      domainsUsed: args.usage.domainsUsed,
      domainsLimit: args.usage.domainsLimit,
      mailboxesUsed: args.usage.mailboxesUsed,
      mailboxesLimit: args.usage.mailboxesLimit,
      currentPeriodCost: args.costs.currentPeriod,
      projectedCost: args.costs.projectedCost,
      currency: args.costs.currency,
      updatedAt: Date.now(),
    };

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, billingData);
      return existing._id;
    } else {
      // Insert new record
      return await ctx.db.insert("billingAnalytics", billingData);
    }
  },
});

/**
 * Initialize billing analytics for a new company.
 */
export const initializeBillingAnalytics = mutation({
  args: initializeBillingAnalyticsArgs,
  handler: async (ctx, args): Promise<InitializeBillingResponse> => {
    const today = new Date().toISOString().split("T")[0];
    const currency = args.currency || "USD";

    // Create initial billing analytics record using direct database operations
    const billingData = {
      companyId: args.companyId,
      date: today,
      planType: args.planType,
      emailsSent: 0,
      emailsRemaining: args.planLimits.emailsLimit,
      domainsUsed: 0,
      domainsLimit: args.planLimits.domainsLimit,
      mailboxesUsed: 0,
      mailboxesLimit: args.planLimits.mailboxesLimit,
      currentPeriodCost: 0,
      projectedCost: 0,
      currency,
      updatedAt: Date.now(),
    };
    
    const billingId = await ctx.db.insert("billingAnalytics", billingData);

    return {
      billingId,
      companyId: args.companyId,
      planType: args.planType,
      initializedAt: Date.now(),
    };
  },
});

/**
 * Bulk update billing analytics for multiple companies.
 */
export const bulkUpdateBillingAnalytics = mutation({
  args: bulkUpdateBillingAnalyticsArgs,
  handler: async (ctx, args): Promise<BulkUpdateResponse> => {
    const results: BulkUpdateResult[] = [];

    for (const update of args.updates) {
      try {
        // Directly use the database operations instead of nested mutations
        const existing = await ctx.db
          .query("billingAnalytics")
          .withIndex("by_company_date", (q) =>
            q.eq("companyId", update.companyId).eq("date", update.date)
          )
          .first();

        const billingData = {
          companyId: update.companyId,
          date: update.date,
          planType: update.planType,
          emailsSent: update.usage.emailsSent,
          emailsRemaining: update.usage.emailsRemaining,
          domainsUsed: update.usage.domainsUsed,
          domainsLimit: update.usage.domainsLimit,
          mailboxesUsed: update.usage.mailboxesUsed,
          mailboxesLimit: update.usage.mailboxesLimit,
          currentPeriodCost: update.costs.currentPeriod,
          projectedCost: update.costs.projectedCost,
          currency: update.costs.currency,
          updatedAt: Date.now(),
        };

        const id = existing
          ? (await ctx.db.patch(existing._id, billingData), existing._id)
          : await ctx.db.insert("billingAnalytics", billingData);
        results.push({ success: true, id, companyId: update.companyId });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          companyId: update.companyId
        });
      }
    }

    return {
      totalUpdates: args.updates.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  },
});
