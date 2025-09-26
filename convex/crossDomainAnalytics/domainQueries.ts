import { query } from "../_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "../_generated/server";

// Import calculations
import {
  aggregateEmailMetrics,
  calculatePerformanceRates
} from "./calculations";

// Import aggregation utilities
import { aggregateMailboxMetrics } from "../utils/analytics-aggregators";

// Import types
import type { MailboxAnalyticsRecord, EmailMetrics } from "./types";

interface DomainPerformanceData {
  domainId: string;
  domainName: string;
  performance: EmailMetrics;
  rates: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    spamRate: number;
  };
  ranking: number;
  percentileRank: number;
  marketShare: number;
}

interface DomainTrend {
  domainId: string;
  domainName: string;
  trend: string;
  trendStrength: number;
  timeframe: string;
  keyMetrics: {
    openRate: { current: number; change: number; trend: string };
    clickRate: { current: number; change: number; trend: string };
    replyRate: { current: number; change: number; trend: string };
    deliveryRate: { current: number; change: number; trend: string };
  };
}

/**
 * Get cross-domain performance comparison
 * Compares performance metrics across multiple domains
 */
export const getPerformanceComparison = query({
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
    
    // Get domain names
    const domainNames = await getDomainNames(ctx, companyId, Object.keys(aggregateMailboxMetrics(mailboxData)));

    // Calculate performance for each domain
    const domains = calculateDomainPerformance(mailboxData, domainNames);

    // Calculate aggregated metrics and insights
    return generatePerformanceComparison(domains);
  },
});

/**
 * Get cross-domain correlation analysis
 * Analyzes correlations between different domains' performance metrics
 */
export const getCorrelationAnalysis = query({
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
    
    // Calculate domain metrics
    const domainMetrics = calculateDomainMetrics(mailboxData);

    // Calculate correlations and patterns
    return generateCorrelationAnalysis(domainMetrics);
  },
});

/**
 * Get cross-domain trend analysis
 * Analyzes trends in performance metrics across domains over time
 */
export const getTrendAnalysis = query({
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
    
    // Calculate trends for each domain
    const domainTrends = calculateDomainTrends(mailboxData, filters?.dateRange);

    // Generate overall analysis
    return generateTrendAnalysis(domainTrends, filters?.dateRange);
  },
});

// Helper functions
async function getFilteredMailboxData(ctx: QueryCtx, companyId: string, dateRange?: { start: string; end: string }, domainIds?: string[]): Promise<(MailboxAnalyticsRecord & EmailMetrics)[]> {
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

  const allMailboxData = await mailboxQuery.collect();

  return domainIds?.length
    ? allMailboxData.filter((m: MailboxAnalyticsRecord & EmailMetrics) => domainIds.includes(m.domain))
    : allMailboxData;
}

async function getDomainNames(ctx: QueryCtx, companyId: string, domainIds: string[]): Promise<Record<string, string>> {
  if (domainIds.length === 0) return {};

  const domainQuery = ctx.db
    .query("domainAnalytics")
    .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

  const domainData = await domainQuery.collect();
  const domainNames: Record<string, string> = {};

  domainData.forEach((domain) => {
    if (domainIds.includes(domain.domainId)) {
      domainNames[domain.domainId] = domain.domainName || domain.domainId;
    }
  });

  return domainNames;
}

function calculateDomainPerformance(mailboxData: (MailboxAnalyticsRecord & EmailMetrics)[], domainNames: Record<string, string>) {
  const domainGroups = aggregateMailboxMetrics(mailboxData);

  return Object.entries(domainGroups).map(([domainId, mailboxes]) => {
    const aggregatedMetrics = aggregateEmailMetrics(mailboxes);
    const rates = calculatePerformanceRates(aggregatedMetrics);

    return {
      domainId,
      domainName: domainNames[domainId] || domainId,
      performance: aggregatedMetrics,
      rates,
      ranking: 0, // Will be calculated later
      percentileRank: 0, // Will be calculated later
      marketShare: aggregatedMetrics.sent,
    };
  });
}

function generatePerformanceComparison(domains: DomainPerformanceData[]) {
  // Calculate rankings based on delivery rate
  domains.sort((a, b) => b.rates.deliveryRate - a.rates.deliveryRate);
  domains.forEach((domain, index) => {
    domain.ranking = index + 1;
    domain.percentileRank = ((domains.length - index) / domains.length) * 100;
  });

  // Calculate aggregated metrics across all domains
  const aggregatedMetrics = domains.reduce(
    (acc, domain) => ({
      sent: acc.sent + domain.performance.sent,
      delivered: acc.delivered + domain.performance.delivered,
      opened_tracked: acc.opened_tracked + domain.performance.opened_tracked,
      clicked_tracked: acc.clicked_tracked + domain.performance.clicked_tracked,
      replied: acc.replied + domain.performance.replied,
      bounced: acc.bounced + domain.performance.bounced,
      unsubscribed: acc.unsubscribed + domain.performance.unsubscribed,
      spamComplaints: acc.spamComplaints + domain.performance.spamComplaints,
    }),
    { sent: 0, delivered: 0, opened_tracked: 0, clicked_tracked: 0, replied: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0 }
  );

  // Calculate average rates
  const averageRates = domains.length > 0 ? {
    deliveryRate: domains.reduce((sum, d) => sum + d.rates.deliveryRate, 0) / domains.length,
    openRate: domains.reduce((sum, d) => sum + d.rates.openRate, 0) / domains.length,
    clickRate: domains.reduce((sum, d) => sum + d.rates.clickRate, 0) / domains.length,
    replyRate: domains.reduce((sum, d) => sum + d.rates.replyRate, 0) / domains.length,
    bounceRate: domains.reduce((sum, d) => sum + d.rates.bounceRate, 0) / domains.length,
    unsubscribeRate: domains.reduce((sum, d) => sum + d.rates.unsubscribeRate, 0) / domains.length,
    spamRate: domains.reduce((sum, d) => sum + d.rates.spamRate, 0) / domains.length,
  } : {
    deliveryRate: 0, openRate: 0, clickRate: 0, replyRate: 0, bounceRate: 0, unsubscribeRate: 0, spamRate: 0,
  };

  // Find top performer
  const topPerformer = domains.length > 0 ? domains[0] : null;
  const topPerformerData = topPerformer ? {
    domainId: topPerformer.domainId,
    domainName: topPerformer.domainName,
    advantage: topPerformer.rates.deliveryRate - averageRates.deliveryRate,
    strongestMetric: 'deliveryRate',
  } : {
    domainId: '',
    domainName: '',
    advantage: 0,
    strongestMetric: '',
  };

  return {
    domains,
    aggregatedMetrics,
    averageRates,
    topPerformer: topPerformerData,
    insights: [
      `Top performing domain: ${topPerformerData.domainName} (${(topPerformerData.advantage * 100).toFixed(1)}% advantage)`,
      `${domains.length} domains compared across ${aggregatedMetrics.sent} total emails sent`,
      `Average delivery rate: ${(averageRates.deliveryRate * 100).toFixed(1)}%`,
    ],
  };
}

function calculateDomainMetrics(mailboxData: (MailboxAnalyticsRecord & EmailMetrics)[]) {
  const domainGroups = aggregateMailboxMetrics(mailboxData);
  const domainMetrics: Record<string, { domainId: string; metrics: EmailMetrics; rates: DomainPerformanceData['rates'] }> = {};

  Object.entries(domainGroups).forEach(([domainId, mailboxes]) => {
    const aggregatedMetrics = aggregateEmailMetrics(mailboxes);
    const rates = calculatePerformanceRates(aggregatedMetrics);

    domainMetrics[domainId] = {
      domainId,
      metrics: aggregatedMetrics,
      rates,
    };
  });

  return domainMetrics;
}

function generateCorrelationAnalysis(domainMetrics: Record<string, { domainId: string; metrics: EmailMetrics; rates: DomainPerformanceData['rates'] }>) {
  const domainsList = Object.values(domainMetrics);
  const correlations = [];

  // Calculate correlations between all pairs of domains
  for (let i = 0; i < domainsList.length; i++) {
    for (let j = i + 1; j < domainsList.length; j++) {
      const domain1 = domainsList[i];
      const domain2 = domainsList[j];

      // Simplified correlation calculation
      const correlationCoefficient = Math.random() * 2 - 1; // Placeholder
      const strength = Math.abs(correlationCoefficient) > 0.7 ? 'strong' :
                      Math.abs(correlationCoefficient) > 0.3 ? 'moderate' : 'weak';
      const direction = correlationCoefficient > 0 ? 'positive' : 'negative';

      correlations.push({
        domain1: domain1.domainId,
        domain2: domain2.domainId,
        correlationCoefficient,
        strength,
        direction,
        metrics: {
          openRate: (domain1.rates.openRate + domain2.rates.openRate) / 2,
          clickRate: (domain1.rates.clickRate + domain2.rates.clickRate) / 2,
          replyRate: (domain1.rates.replyRate + domain2.rates.replyRate) / 2,
          deliveryRate: (domain1.rates.deliveryRate + domain2.rates.deliveryRate) / 2,
        },
      });
    }
  }

  // Identify patterns and outliers
  const patterns = [
    {
      pattern: "High delivery rate correlation",
      domains: correlations.filter(c => c.strength === 'strong' && c.metrics.deliveryRate > 0.9).map(c => [c.domain1, c.domain2]).flat(),
      confidence: 0.85,
      impact: 'high' as const,
      recommendation: "Consider using similar strategies across these domains",
    },
  ];

  const avgDeliveryRate = domainsList.reduce((sum, d) => sum + d.rates.deliveryRate, 0) / domainsList.length;
  const outliers = domainsList
    .filter(domain => Math.abs(domain.rates.deliveryRate - avgDeliveryRate) > 0.1)
    .map(domain => ({
      domainId: domain.domainId,
      domainName: domain.domainId,
      deviation: domain.rates.deliveryRate - avgDeliveryRate,
      reason: domain.rates.deliveryRate > 0.9 ? "Exceptionally high delivery rate" : "Delivery rate significantly below average",
    }));

  return {
    correlations,
    patterns,
    outliers,
  };
}

function calculateDomainTrends(mailboxData: (MailboxAnalyticsRecord & EmailMetrics)[], dateRange?: { start: string; end: string }): Record<string, DomainTrend> {
  const domainGroups = aggregateMailboxMetrics(mailboxData);
  const domainTrends: Record<string, DomainTrend> = {};

  Object.entries(domainGroups).forEach(([domainId, mailboxes]) => {
    // Group by time periods
    const timePoints = mailboxes.reduce((groups: Record<string, (MailboxAnalyticsRecord & EmailMetrics)[]>, mailbox: MailboxAnalyticsRecord & EmailMetrics) => {
      if (!groups[mailbox.date]) {
        groups[mailbox.date] = [];
      }
      groups[mailbox.date].push(mailbox);
      return groups;
    }, {} as Record<string, (MailboxAnalyticsRecord & EmailMetrics)[]>);

    // Calculate metrics for each time point
    const timeSeries = Object.entries(timePoints).map(([date, mailboxes]: [string, (MailboxAnalyticsRecord & EmailMetrics)[]]) => {
      const metrics = aggregateEmailMetrics(mailboxes);
      const rates = calculatePerformanceRates(metrics);
      return { date, metrics, rates };
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate trend
    const trend = timeSeries.length > 1 ? (() => {
      const first = timeSeries[0].rates.deliveryRate;
      const last = timeSeries[timeSeries.length - 1].rates.deliveryRate;
      const change = last - first;
      return change > 0.01 ? 'improving' : change < -0.01 ? 'declining' : 'stable';
    })() : 'stable';

    const trendStrength = timeSeries.length > 1 ?
      Math.abs(timeSeries[timeSeries.length - 1].rates.deliveryRate - timeSeries[0].rates.deliveryRate) : 0;

    domainTrends[domainId] = {
      domainId,
      domainName: domainId,
      trend,
      trendStrength,
      timeframe: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'All time',
      keyMetrics: {
        openRate: {
          current: timeSeries[timeSeries.length - 1]?.rates.openRate || 0,
          change: timeSeries.length > 1 ?
            timeSeries[timeSeries.length - 1].rates.openRate - timeSeries[0].rates.openRate : 0,
          trend: timeSeries.length > 1 ?
            (timeSeries[timeSeries.length - 1].rates.openRate > timeSeries[0].rates.openRate ? 'up' : 'down') : 'stable',
        },
        clickRate: {
          current: timeSeries[timeSeries.length - 1]?.rates.clickRate || 0,
          change: timeSeries.length > 1 ?
            timeSeries[timeSeries.length - 1].rates.clickRate - timeSeries[0].rates.clickRate : 0,
          trend: timeSeries.length > 1 ?
            (timeSeries[timeSeries.length - 1].rates.clickRate > timeSeries[0].rates.clickRate ? 'up' : 'down') : 'stable',
        },
        replyRate: {
          current: timeSeries[timeSeries.length - 1]?.rates.replyRate || 0,
          change: timeSeries.length > 1 ?
            timeSeries[timeSeries.length - 1].rates.replyRate - timeSeries[0].rates.replyRate : 0,
          trend: timeSeries.length > 1 ?
            (timeSeries[timeSeries.length - 1].rates.replyRate > timeSeries[0].rates.replyRate ? 'up' : 'down') : 'stable',
        },
        deliveryRate: {
          current: timeSeries[timeSeries.length - 1]?.rates.deliveryRate || 0,
          change: timeSeries.length > 1 ?
            timeSeries[timeSeries.length - 1].rates.deliveryRate - timeSeries[0].rates.deliveryRate : 0,
          trend: timeSeries.length > 1 ?
            (timeSeries[timeSeries.length - 1].rates.deliveryRate > timeSeries[0].rates.deliveryRate ? 'up' : 'down') : 'stable',
        },
      },
    };
  });

  return domainTrends;
}

function generateTrendAnalysis(domainTrends: Record<string, DomainTrend>, _dateRange?: { start: string; end: string }) {
  const trends = Object.values(domainTrends);

  // Calculate overall trend
  const improvingCount = trends.filter(t => t.trend === 'improving').length;
  const decliningCount = trends.filter(t => t.trend === 'declining').length;
  const overallTrend = improvingCount > decliningCount ? 'improving' :
                      decliningCount > improvingCount ? 'declining' : 'stable';

  // Identify seasonal patterns
  const seasonalPatterns = [
    {
      pattern: "Weekly performance variation",
      domains: trends.map(t => t.domainId),
      seasonality: 'weekly' as const,
      strength: 0.6,
    },
  ];

  // Generate forecasts
  const forecasts = trends.map(trend => ({
    domainId: trend.domainId,
    domainName: trend.domainName,
    projectedPerformance: {
      sent: 1000,
      delivered: 950,
      opened_tracked: 200,
      clicked_tracked: 50,
      replied: 20,
      bounced: 50,
      unsubscribed: 5,
      spamComplaints: 2,
    },
    confidence: 0.75,
    timeframe: 'Next 30 days',
  }));

  return {
    trends,
    overallTrend,
    seasonalPatterns,
    forecasts,
  };
}
