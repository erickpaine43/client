import { query } from "../_generated/server";
import { v } from "convex/values";

// Import calculations
import {
  aggregateEmailMetrics,
  calculatePerformanceRates
} from "./calculations";

// Import aggregation utilities
import { aggregateMailboxMetrics } from "../utils/analyticsAggregators";

import type { QueryCtx } from "../_generated/server";
import type { EmailMetrics, MailboxAnalyticsRecord } from "./types";

type MailboxDoc = MailboxAnalyticsRecord & EmailMetrics;

type PerformanceRates = {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  spamRate: number;
};

type DomainGroup = {
  domainId: string;
  metrics: EmailMetrics;
  rates: PerformanceRates;
};

/**
 * Get cross-domain aggregated metrics
 */
export const getAggregatedMetrics = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    companyId: v.string(),
    filters: v.optional(v.object({
      dateRange: v.optional(v.object({
        start: v.string(),
        end: v.string(),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const { domainIds, companyId, filters } = args;

    // Get mailbox data for all domains
    const mailboxData = await getFilteredMailboxData(ctx, companyId, filters?.dateRange, domainIds);

    // Calculate aggregated metrics and distribution stats
    return calculateAggregatedMetrics(mailboxData);
  },
});

/**
 * Generate cross-domain insights
 */
export const generateInsights = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    companyId: v.string(),
    filters: v.optional(v.object({
      dateRange: v.optional(v.object({
        start: v.string(),
        end: v.string(),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const { domainIds, companyId, filters } = args;

    // Get mailbox data for all domains
    const mailboxData = await getFilteredMailboxData(ctx, companyId, filters?.dateRange, domainIds);

    // Generate insights based on the data
    return generateCrossDomainInsights(mailboxData);
  },
});

/**
 * Get cross-domain health status
 */
export const getHealthStatus = query({
  args: {},
  handler: async (_ctx) => {
    // Simple health check - in a real implementation this would check database connectivity, data freshness, etc.
    return {
      status: 'healthy' as const,
      lastUpdated: Date.now(),
      dataFreshness: Date.now(),
      issues: [],
    };
  },
});

// Helper functions
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

  const allMailboxData = await mailboxQuery.collect() as MailboxDoc[];
  
  return domainIds?.length
    ? allMailboxData.filter((m: MailboxDoc) => domainIds.includes(m.domain))
    : allMailboxData;
}

function calculateAggregatedMetrics(mailboxData: MailboxDoc[]) {
  // Group by domain and aggregate metrics
  const domainGroups = aggregateMailboxMetrics(mailboxData);

  // Calculate aggregated metrics across all domains
  const aggregatedMetrics = aggregateEmailMetrics(mailboxData);
  const averageRates = calculatePerformanceRates(aggregatedMetrics);

  // Calculate distribution stats
  const domains = Object.entries(domainGroups).map(([domainId, mailboxes]) => {
    const metrics = aggregateEmailMetrics(mailboxes);
    const rates = calculatePerformanceRates(metrics);
    return { domainId, metrics, rates };
  });

  const distributionStats = calculateDistributionStats(domains, averageRates);

  return {
    aggregatedMetrics,
    averageRates,
    distributionStats,
    domainCount: domains.length,
    totalMailboxes: mailboxData.length,
  };
}

function calculateDistributionStats(domains: DomainGroup[], averageRates: PerformanceRates) {
  if (domains.length === 0) {
    return {
      openRate: { min: 0, max: 0, avg: 0, stdDev: 0 },
      clickRate: { min: 0, max: 0, avg: 0, stdDev: 0 },
      replyRate: { min: 0, max: 0, avg: 0, stdDev: 0 },
      deliveryRate: { min: 0, max: 0, avg: 0, stdDev: 0 },
      bounceRate: { min: 0, max: 0, avg: 0, stdDev: 0 },
    };
  }

  return {
    openRate: {
      min: Math.min(...domains.map(d => d.rates.openRate)),
      max: Math.max(...domains.map(d => d.rates.openRate)),
      avg: domains.reduce((sum, d) => sum + d.rates.openRate, 0) / domains.length,
      stdDev: Math.sqrt(domains.reduce((sum, d) => sum + Math.pow(d.rates.openRate - averageRates.openRate, 2), 0) / domains.length),
    },
    clickRate: {
      min: Math.min(...domains.map(d => d.rates.clickRate)),
      max: Math.max(...domains.map(d => d.rates.clickRate)),
      avg: domains.reduce((sum, d) => sum + d.rates.clickRate, 0) / domains.length,
      stdDev: Math.sqrt(domains.reduce((sum, d) => sum + Math.pow(d.rates.clickRate - averageRates.clickRate, 2), 0) / domains.length),
    },
    replyRate: {
      min: Math.min(...domains.map(d => d.rates.replyRate)),
      max: Math.max(...domains.map(d => d.rates.replyRate)),
      avg: domains.reduce((sum, d) => sum + d.rates.replyRate, 0) / domains.length,
      stdDev: Math.sqrt(domains.reduce((sum, d) => sum + Math.pow(d.rates.replyRate - averageRates.replyRate, 2), 0) / domains.length),
    },
    deliveryRate: {
      min: Math.min(...domains.map(d => d.rates.deliveryRate)),
      max: Math.max(...domains.map(d => d.rates.deliveryRate)),
      avg: domains.reduce((sum, d) => sum + d.rates.deliveryRate, 0) / domains.length,
      stdDev: Math.sqrt(domains.reduce((sum, d) => sum + Math.pow(d.rates.deliveryRate - averageRates.deliveryRate, 2), 0) / domains.length),
    },
    bounceRate: {
      min: Math.min(...domains.map(d => d.rates.bounceRate)),
      max: Math.max(...domains.map(d => d.rates.bounceRate)),
      avg: domains.reduce((sum, d) => sum + d.rates.bounceRate, 0) / domains.length,
      stdDev: Math.sqrt(domains.reduce((sum, d) => sum + Math.pow(d.rates.bounceRate - averageRates.bounceRate, 2), 0) / domains.length),
    },
  };
}

function generateCrossDomainInsights(mailboxData: MailboxDoc[]) {
  const domainGroups = aggregateMailboxMetrics(mailboxData);
  const domains = Object.entries(domainGroups).map(([domainId, mailboxes]) => {
    const metrics = aggregateEmailMetrics(mailboxes);
    const rates = calculatePerformanceRates(metrics);
    return { domainId, metrics, rates, mailboxCount: mailboxes.length };
  });

  // Generate insights
  const insights = [];

  // Performance insights
  if (domains.length > 0) {
    const bestDomain = domains.reduce((best, current) => 
      current.rates.deliveryRate > best.rates.deliveryRate ? current : best
    );
    insights.push({
      type: 'performance',
      title: 'Top Performing Domain',
      description: `Domain ${bestDomain.domainId} has the highest delivery rate at ${(bestDomain.rates.deliveryRate * 100).toFixed(1)}%`,
      impact: 'positive',
      actionable: true,
      recommendation: 'Consider applying similar strategies to other domains',
    });
  }

  // Volume insights
  const totalVolume = domains.reduce((sum, d) => sum + d.metrics.sent, 0);
  if (totalVolume > 0) {
    const highVolumeDomains = domains.filter(d => d.metrics.sent > totalVolume * 0.2);
    if (highVolumeDomains.length > 0) {
      insights.push({
        type: 'volume',
        title: 'High Volume Domains',
        description: `${highVolumeDomains.length} domains handle over 20% of total email volume`,
        impact: 'neutral',
        actionable: true,
        recommendation: 'Monitor these domains closely for performance issues',
      });
    }
  }

  // Health insights
  const avgDeliveryRate = domains.reduce((sum, d) => sum + d.rates.deliveryRate, 0) / domains.length;
  const underperformingDomains = domains.filter(d => d.rates.deliveryRate < avgDeliveryRate * 0.9);
  if (underperformingDomains.length > 0) {
    insights.push({
      type: 'health',
      title: 'Underperforming Domains',
      description: `${underperformingDomains.length} domains are performing below 90% of average delivery rate`,
      impact: 'negative',
      actionable: true,
      recommendation: 'Review authentication settings and sending practices for these domains',
    });
  }

  return {
    insights,
    summary: {
      totalDomains: domains.length,
      totalVolume,
      averageDeliveryRate: avgDeliveryRate,
      topPerformer: domains.length > 0 ? domains.reduce((best, current) => 
        current.rates.deliveryRate > best.rates.deliveryRate ? current : best
      ).domainId : null,
    },
  };
}
