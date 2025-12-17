import { v } from "convex/values";

// ============================================================================
// BILLING ANALYTICS VALIDATION SCHEMAS
// ============================================================================

/**
 * Date range validation schema
 */
export const dateRangeSchema = v.object({
  start: v.string(),
  end: v.string(),
});

/**
 * Usage metrics validation schema
 */
export const usageMetricsSchema = v.object({
  emailsSent: v.number(),
  emailsRemaining: v.number(),
  domainsUsed: v.number(),
  domainsLimit: v.number(),
  mailboxesUsed: v.number(),
  mailboxesLimit: v.number(),
});

/**
 * Cost metrics validation schema
 */
export const costMetricsSchema = v.object({
  currentPeriod: v.number(),
  projectedCost: v.number(),
  currency: v.string(),
});

/**
 * Alert thresholds validation schema
 */
export const alertThresholdsSchema = v.object({
  emailsWarning: v.optional(v.number()),
  emailsCritical: v.optional(v.number()),
  domainsWarning: v.optional(v.number()),
  mailboxesWarning: v.optional(v.number()),
});

/**
 * Granularity validation schema
 */
export const granularitySchema = v.optional(v.union(
  v.literal("day"),
  v.literal("week"),
  v.literal("month")
));

/**
 * Plan limits validation schema
 */
export const planLimitsSchema = v.object({
  emailsLimit: v.number(),
  domainsLimit: v.number(),
  mailboxesLimit: v.number(),
});

/**
 * Billing data validation schema for upsert
 */
export const billingDataSchema = v.object({
  companyId: v.string(),
  date: v.string(),
  planType: v.string(),
  usage: usageMetricsSchema,
  costs: costMetricsSchema,
});

/**
 * Query argument schemas
 */
export const getBillingAnalyticsArgs = v.object({
  companyId: v.string(),
  dateRange: v.optional(dateRangeSchema),
});

export const getCurrentUsageMetricsArgs = v.object({
  companyId: v.string(),
});

export const getBillingTimeSeriesAnalyticsArgs = v.object({
  companyId: v.string(),
  dateRange: dateRangeSchema,
  granularity: granularitySchema,
});

export const getUsageLimitAlertsArgs = v.object({
  companyId: v.string(),
  thresholds: v.optional(alertThresholdsSchema),
});

export const getCostAnalyticsArgs = v.object({
  companyId: v.string(),
  dateRange: dateRangeSchema,
});

/**
 * Mutation argument schemas
 */
export const upsertBillingAnalyticsArgs = billingDataSchema;

export const initializeBillingAnalyticsArgs = v.object({
  companyId: v.string(),
  planType: v.string(),
  planLimits: planLimitsSchema,
  currency: v.optional(v.string()),
});

export const bulkUpdateBillingAnalyticsArgs = v.object({
  updates: v.array(billingDataSchema),
});
