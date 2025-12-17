import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// ============================================================================
// SEQUENCE STEP ANALYTICS CONVEX FUNCTIONS
// ============================================================================

// Type definitions
type SequenceStepAnalytics = Doc<"sequenceStepAnalytics">;

type AggregatedStepMetrics = {
  stepId: string;
  campaignId: string;
  stepType: "email" | "wait" | "action";
  subject?: string;
  waitDuration?: number;
  sequenceOrder: number;
  aggregatedMetrics: {
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
  };
  updatedAt: number;
};

type StepComparison = {
  stepId: string;
  stepType: "email" | "wait" | "action";
  subject?: string;
  waitDuration?: number;
  sequenceOrder: number;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  conversionFromPrevious: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  updatedAt: number;
};

type FunnelStep = {
  stepId: string;
  stepType: "email" | "wait" | "action";
  subject?: string;
  sequenceOrder: number;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  retentionFromFirst: number;
  dropoffFromPrevious: number;
  dropoffRate: number;
  stepIndex: number;
  totalSteps: number;
};

/**
 * Get sequence step analytics for specific campaigns.
 * Returns analytics data for each step in campaign sequences.
 */
export const getSequenceStepAnalytics = query({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    stepIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("sequenceStepAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    // Apply date range filter if provided
    if (args.dateRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    const results = await query.collect();

    // Filter by campaign IDs if provided
    let filteredResults = results;
    if (args.campaignIds && args.campaignIds.length > 0) {
      filteredResults = filteredResults.filter(record => 
        args.campaignIds!.includes(record.campaignId)
      );
    }

    // Filter by step IDs if provided
    if (args.stepIds && args.stepIds.length > 0) {
      filteredResults = filteredResults.filter(record => 
        args.stepIds!.includes(record.stepId)
      );
    }

    return filteredResults;
  },
});

/**
 * Get sequence analytics aggregated by campaign.
 * Returns step-by-step performance for each campaign sequence.
 */
export const getCampaignSequenceAnalytics = query({
  args: {
    campaignId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<AggregatedStepMetrics[]> => {
    // Get all steps for the campaign directly from database
    let query = ctx.db
      .query("sequenceStepAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    // Apply date range filter if provided
    if (args.dateRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    const results = await query.collect();

    // Filter by campaign ID
    const steps = results.filter(record => record.campaignId === args.campaignId);

    // Group by step and aggregate across dates
    const stepMap = new Map<string, AggregatedStepMetrics>();

    steps.forEach((step: SequenceStepAnalytics) => {
      const existing = stepMap.get(step.stepId);
      
      if (existing) {
        // Aggregate metrics
        existing.aggregatedMetrics.sent += step.sent;
        existing.aggregatedMetrics.delivered += step.delivered;
        existing.aggregatedMetrics.opened_tracked += step.opened_tracked;
        existing.aggregatedMetrics.clicked_tracked += step.clicked_tracked;
        existing.aggregatedMetrics.replied += step.replied;
        existing.aggregatedMetrics.bounced += step.bounced;
        existing.aggregatedMetrics.unsubscribed += step.unsubscribed;
        existing.aggregatedMetrics.spamComplaints += step.spamComplaints;
        existing.updatedAt = Math.max(existing.updatedAt, step.updatedAt);
      } else {
        // Create new aggregated step
        stepMap.set(step.stepId, {
          stepId: step.stepId,
          campaignId: step.campaignId,
          stepType: step.stepType,
          subject: step.subject,
          waitDuration: step.waitDuration,
          sequenceOrder: step.sequenceOrder,
          aggregatedMetrics: {
            sent: step.sent,
            delivered: step.delivered,
            opened_tracked: step.opened_tracked,
            clicked_tracked: step.clicked_tracked,
            replied: step.replied,
            bounced: step.bounced,
            unsubscribed: step.unsubscribed,
            spamComplaints: step.spamComplaints,
          },
          updatedAt: step.updatedAt,
        });
      }
    });

    // Sort by sequence order and return
    return Array.from(stepMap.values())
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  },
});

/**
 * Get sequence step performance comparison.
 * Compares performance across different steps in a sequence.
 */
export const getSequenceStepComparison = query({
  args: {
    campaignId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<StepComparison[]> => {
    // Get aggregated sequence analytics by inlining the logic
    let query = ctx.db
      .query("sequenceStepAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    // Apply date range filter if provided
    if (args.dateRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    const results = await query.collect();

    // Filter by campaign ID
    const steps = results.filter(record => record.campaignId === args.campaignId);

    // Group by step and aggregate across dates
    const stepMap = new Map<string, AggregatedStepMetrics>();

    steps.forEach((step: SequenceStepAnalytics) => {
      const existing = stepMap.get(step.stepId);
      
      if (existing) {
        // Aggregate metrics
        existing.aggregatedMetrics.sent += step.sent;
        existing.aggregatedMetrics.delivered += step.delivered;
        existing.aggregatedMetrics.opened_tracked += step.opened_tracked;
        existing.aggregatedMetrics.clicked_tracked += step.clicked_tracked;
        existing.aggregatedMetrics.replied += step.replied;
        existing.aggregatedMetrics.bounced += step.bounced;
        existing.aggregatedMetrics.unsubscribed += step.unsubscribed;
        existing.aggregatedMetrics.spamComplaints += step.spamComplaints;
        existing.updatedAt = Math.max(existing.updatedAt, step.updatedAt);
      } else {
        // Create new aggregated step
        stepMap.set(step.stepId, {
          stepId: step.stepId,
          campaignId: step.campaignId,
          stepType: step.stepType,
          subject: step.subject,
          waitDuration: step.waitDuration,
          sequenceOrder: step.sequenceOrder,
          aggregatedMetrics: {
            sent: step.sent,
            delivered: step.delivered,
            opened_tracked: step.opened_tracked,
            clicked_tracked: step.clicked_tracked,
            replied: step.replied,
            bounced: step.bounced,
            unsubscribed: step.unsubscribed,
            spamComplaints: step.spamComplaints,
          },
          updatedAt: step.updatedAt,
        });
      }
    });

    // Sort by sequence order
    const sequenceSteps = Array.from(stepMap.values())
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    // Calculate step-to-step conversion rates
    const stepComparison = sequenceSteps.map((step: AggregatedStepMetrics, index: number) => {
      const previousStep = index > 0 ? sequenceSteps[index - 1] : null;
      
      // Calculate conversion from previous step (for email steps)
      let conversionFromPrevious = 0;
      if (previousStep && step.stepType === "email" && previousStep.aggregatedMetrics.delivered > 0) {
        conversionFromPrevious = step.aggregatedMetrics.sent / previousStep.aggregatedMetrics.delivered;
      }

      return {
        stepId: step.stepId,
        stepType: step.stepType,
        subject: step.subject,
        waitDuration: step.waitDuration,
        sequenceOrder: step.sequenceOrder,
        
        // Raw metrics
        sent: step.aggregatedMetrics.sent,
        delivered: step.aggregatedMetrics.delivered,
        opened_tracked: step.aggregatedMetrics.opened_tracked,
        clicked_tracked: step.aggregatedMetrics.clicked_tracked,
        replied: step.aggregatedMetrics.replied,
        bounced: step.aggregatedMetrics.bounced,
        unsubscribed: step.aggregatedMetrics.unsubscribed,
        spamComplaints: step.aggregatedMetrics.spamComplaints,
        
        // Step-specific metrics
        conversionFromPrevious,
        isFirstStep: index === 0,
        isLastStep: index === sequenceSteps.length - 1,
        
        updatedAt: step.updatedAt,
      };
    });

    return stepComparison;
  },
});

/**
 * Get sequence funnel analytics.
 * Shows how leads progress through the sequence steps.
 */
export const getSequenceFunnelAnalytics = query({
  args: {
    campaignId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    campaignId: string;
    totalSteps: number;
    funnelSteps: FunnelStep[];
    overallConversion: number;
  }> => {
    // Get sequence step comparison data by inlining the logic
    let query = ctx.db
      .query("sequenceStepAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    // Apply date range filter if provided
    if (args.dateRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    const results = await query.collect();

    // Filter by campaign ID
    const steps = results.filter(record => record.campaignId === args.campaignId);

    // Group by step and aggregate across dates
    const stepMap = new Map<string, AggregatedStepMetrics>();

    steps.forEach((step: SequenceStepAnalytics) => {
      const existing = stepMap.get(step.stepId);
      
      if (existing) {
        // Aggregate metrics
        existing.aggregatedMetrics.sent += step.sent;
        existing.aggregatedMetrics.delivered += step.delivered;
        existing.aggregatedMetrics.opened_tracked += step.opened_tracked;
        existing.aggregatedMetrics.clicked_tracked += step.clicked_tracked;
        existing.aggregatedMetrics.replied += step.replied;
        existing.aggregatedMetrics.bounced += step.bounced;
        existing.aggregatedMetrics.unsubscribed += step.unsubscribed;
        existing.aggregatedMetrics.spamComplaints += step.spamComplaints;
        existing.updatedAt = Math.max(existing.updatedAt, step.updatedAt);
      } else {
        // Create new aggregated step
        stepMap.set(step.stepId, {
          stepId: step.stepId,
          campaignId: step.campaignId,
          stepType: step.stepType,
          subject: step.subject,
          waitDuration: step.waitDuration,
          sequenceOrder: step.sequenceOrder,
          aggregatedMetrics: {
            sent: step.sent,
            delivered: step.delivered,
            opened_tracked: step.opened_tracked,
            clicked_tracked: step.clicked_tracked,
            replied: step.replied,
            bounced: step.bounced,
            unsubscribed: step.unsubscribed,
            spamComplaints: step.spamComplaints,
          },
          updatedAt: step.updatedAt,
        });
      }
    });

    // Sort by sequence order
    const sequenceSteps = Array.from(stepMap.values())
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    // Calculate step-to-step conversion rates
    const stepComparison = sequenceSteps.map((step: AggregatedStepMetrics, index: number) => {
      const previousStep = index > 0 ? sequenceSteps[index - 1] : null;
      
      // Calculate conversion from previous step (for email steps)
      let conversionFromPrevious = 0;
      if (previousStep && step.stepType === "email" && previousStep.aggregatedMetrics.delivered > 0) {
        conversionFromPrevious = step.aggregatedMetrics.sent / previousStep.aggregatedMetrics.delivered;
      }

      return {
        stepId: step.stepId,
        stepType: step.stepType,
        subject: step.subject,
        waitDuration: step.waitDuration,
        sequenceOrder: step.sequenceOrder,
        
        // Raw metrics
        sent: step.aggregatedMetrics.sent,
        delivered: step.aggregatedMetrics.delivered,
        opened_tracked: step.aggregatedMetrics.opened_tracked,
        clicked_tracked: step.aggregatedMetrics.clicked_tracked,
        replied: step.aggregatedMetrics.replied,
        bounced: step.aggregatedMetrics.bounced,
        unsubscribed: step.aggregatedMetrics.unsubscribed,
        spamComplaints: step.aggregatedMetrics.spamComplaints,
        
        // Step-specific metrics
        conversionFromPrevious,
        isFirstStep: index === 0,
        isLastStep: index === sequenceSteps.length - 1,
        
        updatedAt: step.updatedAt,
      };
    });
    
    // Calculate funnel metrics
    const funnelSteps = stepComparison
      .filter((step: StepComparison) => step.stepType === "email") // Only include email steps in funnel
      .map((step: StepComparison, index: number, emailSteps: StepComparison[]) => {
        const firstStep = emailSteps[0];
        const dropoffFromPrevious = index > 0 
          ? emailSteps[index - 1].sent - step.sent 
          : 0;
        const dropoffRate = index > 0 && emailSteps[index - 1].sent > 0
          ? dropoffFromPrevious / emailSteps[index - 1].sent
          : 0;

        return {
          stepId: step.stepId,
          stepType: step.stepType,
          subject: step.subject,
          sequenceOrder: step.sequenceOrder,
          
          // Funnel metrics
          sent: step.sent,
          delivered: step.delivered,
          opened_tracked: step.opened_tracked,
          clicked_tracked: step.clicked_tracked,
          replied: step.replied,
          
          // Funnel-specific calculations
          retentionFromFirst: firstStep.sent > 0 ? step.sent / firstStep.sent : 0,
          dropoffFromPrevious,
          dropoffRate,
          
          // Engagement rates (calculated client-side for consistency)
          stepIndex: index,
          totalSteps: emailSteps.length,
        };
      });

    return {
      campaignId: args.campaignId,
      totalSteps: funnelSteps.length,
      funnelSteps,
      overallConversion: funnelSteps.length > 0 && funnelSteps[0].sent > 0
        ? funnelSteps[funnelSteps.length - 1].delivered / funnelSteps[0].sent
        : 0,
    };
  },
});

/**
 * Insert or update sequence step analytics data.
 */
export const upsertSequenceStepAnalytics = mutation({
  args: {
    stepId: v.string(),
    campaignId: v.string(),
    date: v.string(),
    companyId: v.string(),
    
    // Performance metrics
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Step-specific data
    stepType: v.union(v.literal("email"), v.literal("wait"), v.literal("action")),
    subject: v.optional(v.string()),
    waitDuration: v.optional(v.number()),
    sequenceOrder: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if record already exists
    const existing = await ctx.db
      .query("sequenceStepAnalytics")
      .withIndex("by_step_date", (q) => 
        q.eq("stepId", args.stepId).eq("date", args.date)
      )
      .first();

    const data = {
      stepId: args.stepId,
      campaignId: args.campaignId,
      date: args.date,
      companyId: args.companyId,
      sent: args.sent,
      delivered: args.delivered,
      opened_tracked: args.opened_tracked,
      clicked_tracked: args.clicked_tracked,
      replied: args.replied,
      bounced: args.bounced,
      unsubscribed: args.unsubscribed,
      spamComplaints: args.spamComplaints,
      stepType: args.stepType,
      subject: args.subject,
      waitDuration: args.waitDuration,
      sequenceOrder: args.sequenceOrder,
      updatedAt: Date.now(),
    };

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      // Insert new record
      return await ctx.db.insert("sequenceStepAnalytics", data);
    }
  },
});

/**
 * Batch insert sequence step analytics data.
 */
export const batchInsertSequenceStepAnalytics = mutation({
  args: {
    records: v.array(v.object({
      stepId: v.string(),
      campaignId: v.string(),
      date: v.string(),
      companyId: v.string(),
      sent: v.number(),
      delivered: v.number(),
      opened_tracked: v.number(),
      clicked_tracked: v.number(),
      replied: v.number(),
      bounced: v.number(),
      unsubscribed: v.number(),
      spamComplaints: v.number(),
      stepType: v.union(v.literal("email"), v.literal("wait"), v.literal("action")),
      subject: v.optional(v.string()),
      waitDuration: v.optional(v.number()),
      sequenceOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const insertedIds: string[] = [];
    
    for (const record of args.records) {
      const id = await ctx.db.insert("sequenceStepAnalytics", {
        ...record,
        updatedAt: Date.now(),
      });
      insertedIds.push(id);
    }
    
    return insertedIds;
  },
});

/**
 * Delete sequence step analytics data.
 */
export const deleteSequenceStepAnalytics = mutation({
  args: {
    stepId: v.optional(v.string()),
    campaignId: v.optional(v.string()),
    date: v.optional(v.string()),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("sequenceStepAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    // Apply filters
    if (args.stepId) {
      query = query.filter((q) => q.eq(q.field("stepId"), args.stepId));
    }
    if (args.campaignId) {
      query = query.filter((q) => q.eq(q.field("campaignId"), args.campaignId));
    }
    if (args.date) {
      query = query.filter((q) => q.eq(q.field("date"), args.date));
    }

    const records = await query.collect();
    const deletedIds: string[] = [];
    
    for (const record of records) {
      await ctx.db.delete(record._id);
      deletedIds.push(record._id);
    }
    
    return deletedIds;
  },
});
