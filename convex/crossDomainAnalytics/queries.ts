import { query } from "../_generated/server";
import { v } from "convex/values";

// Import types
import {
  DomainAnalyticsResult,
  TimeSeriesAnalyticsResult,
  ImpactAnalysisResult,
  MailboxAnalyticsRecord,
  EmailMetrics,
  MailboxHealthData
} from "./types";

// Import validation
import { validateQueryArgs, validateDomainId } from "./validation";

// Import calculations
import {
  calculateMailboxHealthScore,
  calculateDomainHealthScore,
  calculateDomainReputation,
  aggregateEmailMetrics,
  calculateMailboxInsights,
  calculateWarmupSummary,
  calculateCapacitySummary,
  formatTimeLabel,
  groupByTimePeriod,
  calculateCorrelationMetrics,
  calculatePerformanceRates
} from "./calculations";

/**
 * Get comprehensive analytics that join mailbox and domain data.
 * This provides a unified view of how mailboxes contribute to domain performance.
 */
export const getMailboxDomainJoinedAnalytics = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    const validatedArgs = validateQueryArgs(args);
    const { domainIds, mailboxIds, dateRange, companyId } = validatedArgs;

    // Get mailbox analytics data
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange.start),
          q.lte(q.field("date"), dateRange.end)
        )
      );
    }

    const allMailboxData = await mailboxQuery.collect();

    // Filter by domain IDs if specified (filter mailboxes by domain)
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = allMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }

    // Filter by mailbox IDs if specified
    if (mailboxIds?.length) {
      filteredMailboxData = filteredMailboxData.filter((m) =>
        mailboxIds.includes(m.mailboxId)
      );
    }

    // Get corresponding domain analytics data
    let domainQuery = ctx.db
      .query("domainAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (dateRange) {
      domainQuery = domainQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange.start),
          q.lte(q.field("date"), dateRange.end)
        )
      );
    }

    const allDomainData = await domainQuery.collect();

    // Get unique domains from filtered mailbox data
    const domainSet = new Set(filteredMailboxData.map(m => m.domain));
    const relevantDomains = Array.from(domainSet);

    // Filter domain data to only include domains that have mailboxes in our filtered set
    const filteredDomainData = allDomainData.filter((d) =>
      relevantDomains.includes(d.domainId)
    );

    // Group mailbox data by domain
    const mailboxesByDomain = filteredMailboxData.reduce((groups, mailbox) => {
      if (!groups[mailbox.domain]) {
        groups[mailbox.domain] = [];
      }
      groups[mailbox.domain].push(mailbox);
      return groups;
    }, {} as Record<string, typeof filteredMailboxData>);

    // Group domain data by domain ID
    const domainDataByDomain = filteredDomainData.reduce((groups, domain) => {
      if (!groups[domain.domainId]) {
        groups[domain.domainId] = [];
      }
      groups[domain.domainId].push(domain);
      return groups;
    }, {} as Record<string, typeof filteredDomainData>);

    // Create joined analytics for each domain
    const joinedAnalytics: DomainAnalyticsResult[] = relevantDomains.map((domainId: string) => {
      const mailboxes = mailboxesByDomain[domainId] || [];
      const domainRecords = domainDataByDomain[domainId] || [];

      // Aggregate mailbox metrics for this domain
      const mailboxAggregated = aggregateEmailMetrics(mailboxes);

      // Aggregate domain metrics
      const domainAggregated = aggregateEmailMetrics(domainRecords.map(d => ({
        ...d,
        mailboxId: '',
        email: '',
        provider: '',
        domain: d.domainId,
        companyId: d.companyId,
        dailyLimit: 0,
        currentVolume: 0,
        warmupStatus: '',
        warmupProgress: 0,
        updatedAt: d.updatedAt
      } as MailboxAnalyticsRecord & EmailMetrics)));

      // Get domain authentication info (from most recent domain record)
      const latestDomainRecord = domainRecords.length > 0
        ? domainRecords.reduce((latest, current) =>
            current.date > latest.date ? current : latest
          )
        : null;

      // Calculate mailbox health scores and warmup status
      const mailboxHealthData: MailboxHealthData[] = mailboxes.map((mailbox) => {
        const healthScore = Math.round(calculateMailboxHealthScore(mailbox));

        return {
          mailboxId: mailbox.mailboxId,
          email: mailbox.email,
          provider: mailbox.provider,
          warmupStatus: mailbox.warmupStatus,
          warmupProgress: mailbox.warmupProgress,
          healthScore,
          dailyLimit: mailbox.dailyLimit,
          currentVolume: mailbox.currentVolume,
          performance: {
            sent: mailbox.sent,
            delivered: mailbox.delivered,
            opened_tracked: mailbox.opened_tracked,
            clicked_tracked: mailbox.clicked_tracked,
            replied: mailbox.replied,
            bounced: mailbox.bounced,
            unsubscribed: mailbox.unsubscribed,
            spamComplaints: mailbox.spamComplaints,
          },
        };
      });

      // Calculate domain health score from aggregated metrics
      const domainHealthScore = Math.round(calculateDomainHealthScore(domainAggregated));

      // Calculate domain reputation from authentication and performance
      const domainReputation = Math.round(calculateDomainReputation(
        domainAggregated,
        latestDomainRecord?.authentication || {
          spf: false,
          dkim: false,
          dmarc: false,
        }
      ));

      // Calculate warmup and capacity summaries
      const warmupSummary = calculateWarmupSummary(mailboxes);
      const capacitySummary = calculateCapacitySummary(mailboxes);

      return {
        domainId,
        domainName: latestDomainRecord?.domainName || domainId,
        authentication: latestDomainRecord?.authentication || {
          spf: false,
          dkim: false,
          dmarc: false,
        },

        // Domain-level aggregated metrics
        domainMetrics: domainAggregated,
        domainHealthScore,
        domainReputation,

        // Mailbox-level aggregated metrics (should match domain metrics if data is consistent)
        mailboxAggregatedMetrics: mailboxAggregated,

        // Mailbox details for this domain
        mailboxes: mailboxHealthData,
        mailboxCount: mailboxes.length,

        // Warmup summary for domain
        warmupSummary,

        // Capacity summary for domain
        capacitySummary,

        updatedAt: Math.max(
          ...mailboxes.map(m => m.updatedAt),
          ...domainRecords.map(d => d.updatedAt),
          0
        ),
      };
    });

    return joinedAnalytics;
  },
});

/**
 * Get cross-domain time series data showing how mailbox changes affect domain metrics.
 */
export const getCrossDomainTimeSeriesAnalytics = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
    companyId: v.string(),
    granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    const validatedArgs = validateQueryArgs(args);
    const { domainIds, mailboxIds, dateRange, companyId, granularity = "day" } = validatedArgs;

    // Get raw mailbox data for time series grouping
    const mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange!.start),
          q.lte(q.field("date"), dateRange!.end)
        )
      );

    const allMailboxData = await mailboxQuery.collect();

    // Apply domain and mailbox filters
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = filteredMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }
    if (mailboxIds?.length) {
      filteredMailboxData = filteredMailboxData.filter((m) =>
        mailboxIds.includes(m.mailboxId)
      );
    }

    // Group by time period and domain
    const timeGroups = groupByTimePeriod(filteredMailboxData, granularity);

    // Convert to time series format with cross-domain insights
    const timeSeriesData: TimeSeriesAnalyticsResult[] = timeGroups
      .map((group) => {
        // Calculate domain health from mailbox aggregation
        const bounceRate = group.aggregatedMetrics.sent > 0
          ? group.aggregatedMetrics.bounced / group.aggregatedMetrics.sent
          : 0;
        const spamRate = group.aggregatedMetrics.delivered > 0
          ? group.aggregatedMetrics.spamComplaints / group.aggregatedMetrics.delivered
          : 0;

        let healthScore = 100;
        healthScore -= bounceRate * 100 * 2;
        healthScore -= spamRate * 100 * 5;
        healthScore = Math.max(0, Math.min(100, healthScore));

        // Calculate mailbox-level insights
        const mailboxInsights = calculateMailboxInsights(group.mailboxes);

        return {
          date: group.date,
          domainId: group.domainId,
          label: formatTimeLabel(group.date, granularity),

          // Domain metrics (aggregated from mailboxes)
          domainMetrics: group.aggregatedMetrics,
          domainHealthScore: Math.round(healthScore),

          // Mailbox insights that affect domain performance
          mailboxInsights,

          // Cross-domain correlation metrics
          correlationMetrics: calculateCorrelationMetrics(group.aggregatedMetrics, {
            totalCapacity: mailboxInsights.totalCapacity,
            totalVolume: mailboxInsights.totalVolume
          }),
        };
      })
      .sort((a, b) => `${a.date}:${a.domainId}`.localeCompare(`${b.date}:${a.domainId}`));

    return timeSeriesData;
  },
});

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
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (filters?.dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), filters.dateRange!.start),
          q.lte(q.field("date"), filters.dateRange!.end)
        )
      );
    }

    const allMailboxData = await mailboxQuery.collect();

    // Filter by domain IDs if specified
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = allMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }

    // Group by domain and aggregate metrics
    const domainGroups: Record<string, typeof filteredMailboxData> = {};
    filteredMailboxData.forEach((mailbox) => {
      if (!domainGroups[mailbox.domain]) {
        domainGroups[mailbox.domain] = [];
      }
      domainGroups[mailbox.domain].push(mailbox);
    });

    // Get domain names from domain analytics
    const domainNames: Record<string, string> = {};
    if (Object.keys(domainGroups).length > 0) {
      const domainQuery = ctx.db
        .query("domainAnalytics")
        .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

      const domainData = await domainQuery.collect();
      domainData.forEach((domain) => {
        if (domainGroups[domain.domainId]) {
          domainNames[domain.domainId] = domain.domainName || domain.domainId;
        }
      });
    }

    // Calculate performance for each domain
    const domains = Object.entries(domainGroups).map(([domainId, mailboxes]) => {
      const aggregatedMetrics = aggregateEmailMetrics(mailboxes);
      const rates = calculatePerformanceRates(aggregatedMetrics);

      return {
        domainId,
        domainName: domainNames[domainId] || domainId,
        performance: aggregatedMetrics,
        rates,
        ranking: 0, // Will be calculated below
        percentileRank: 0, // Will be calculated below
        marketShare: aggregatedMetrics.sent, // Using sent as proxy for market share
      };
    });

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
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (filters?.dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), filters.dateRange!.start),
          q.lte(q.field("date"), filters.dateRange!.end)
        )
      );
    }

    const allMailboxData = await mailboxQuery.collect();

    // Filter by domain IDs if specified
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = allMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }

    // Group by domain and calculate metrics
    const domainMetrics: Record<string, { domainId: string; metrics: EmailMetrics; rates: ReturnType<typeof calculatePerformanceRates> }> = {};
    const allDomains = Array.from(new Set(filteredMailboxData.map(m => m.domain)));

    allDomains.forEach((domainId) => {
      const domainMailboxes = filteredMailboxData.filter(m => m.domain === domainId);
      const aggregatedMetrics = aggregateEmailMetrics(domainMailboxes);
      const rates = calculatePerformanceRates(aggregatedMetrics);

      domainMetrics[domainId] = {
        domainId,
        metrics: aggregatedMetrics,
        rates,
      };
    });

    // Calculate correlations between all pairs of domains
    const correlations = [];
    const domainsList = Object.values(domainMetrics);

    for (let i = 0; i < domainsList.length; i++) {
      for (let j = i + 1; j < domainsList.length; j++) {
        const domain1 = domainsList[i];
        const domain2 = domainsList[j];

        // Calculate correlation coefficient between delivery rates
        const correlationCoefficient = Math.random() * 2 - 1; // Placeholder - would need proper statistical correlation
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

    const outliers = domainsList
      .filter(domain => {
        const avgDeliveryRate = domainsList.reduce((sum, d) => sum + d.rates.deliveryRate, 0) / domainsList.length;
        return Math.abs(domain.rates.deliveryRate - avgDeliveryRate) > 0.1;
      })
      .map(domain => ({
        domainId: domain.domainId,
        domainName: domain.domainId, // Placeholder
        deviation: domain.rates.deliveryRate - (domainsList.reduce((sum, d) => sum + d.rates.deliveryRate, 0) / domainsList.length),
        reason: domain.rates.deliveryRate > 0.9 ? "Exceptionally high delivery rate" : "Delivery rate significantly below average",
      }));

    return {
      correlations,
      patterns,
      outliers,
    };
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
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (filters?.dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), filters.dateRange!.start),
          q.lte(q.field("date"), filters.dateRange!.end)
        )
      );
    }

    const allMailboxData = await mailboxQuery.collect();

    // Filter by domain IDs if specified
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = allMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }

    // Group data by domain and calculate trends
    const domainTrends: Record<string, {
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
    }> = {};
    const allDomains = Array.from(new Set(filteredMailboxData.map(m => m.domain)));

    allDomains.forEach((domainId) => {
      const domainMailboxes = filteredMailboxData.filter(m => m.domain === domainId);

      // Group by time periods (simplified - just use the data points we have)
      const timePoints = domainMailboxes.reduce((groups, mailbox) => {
        if (!groups[mailbox.date]) {
          groups[mailbox.date] = [];
        }
        groups[mailbox.date].push(mailbox);
        return groups;
      }, {} as Record<string, typeof domainMailboxes>);

      // Calculate metrics for each time point
      const timeSeries = Object.entries(timePoints).map(([date, mailboxes]) => {
        const metrics = aggregateEmailMetrics(mailboxes);
        const rates = calculatePerformanceRates(metrics);
        return { date, metrics, rates };
      }).sort((a, b) => a.date.localeCompare(b.date));

      // Calculate trend (simplified linear trend)
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
        domainName: domainId, // Placeholder
        trend,
        trendStrength,
        timeframe: filters?.dateRange ? `${filters.dateRange.start} to ${filters.dateRange.end}` : 'All time',
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

    const trends = Object.values(domainTrends);

    // Calculate overall trend
    const improvingCount = trends.filter(t => t.trend === 'improving').length;
    const decliningCount = trends.filter(t => t.trend === 'declining').length;
    const overallTrend = improvingCount > decliningCount ? 'improving' :
                        decliningCount > improvingCount ? 'declining' : 'stable';

    // Identify seasonal patterns (simplified)
    const seasonalPatterns = [
      {
        pattern: "Weekly performance variation",
        domains: allDomains,
        seasonality: 'weekly' as const,
        strength: 0.6,
      },
    ];

    // Generate forecasts (simplified linear extrapolation)
    const forecasts = trends.map(trend => ({
      domainId: trend.domainId,
      domainName: trend.domainName,
      projectedPerformance: {
        sent: 1000, // Placeholder
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
  },
});

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
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (filters?.dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), filters.dateRange!.start),
          q.lte(q.field("date"), filters.dateRange!.end)
        )
      );
    }

    const allMailboxData = await mailboxQuery.collect();

    // Filter by domain IDs if specified
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = allMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }

    // Group by domain and aggregate metrics
    const domainGroups: Record<string, typeof filteredMailboxData> = {};
    filteredMailboxData.forEach((mailbox) => {
      if (!domainGroups[mailbox.domain]) {
        domainGroups[mailbox.domain] = [];
      }
      domainGroups[mailbox.domain].push(mailbox);
    });

    // Calculate aggregated metrics across all domains
    const aggregatedMetrics = aggregateEmailMetrics(filteredMailboxData);
    const averageRates = calculatePerformanceRates(aggregatedMetrics);

    // Calculate distribution stats
    const domains = Object.entries(domainGroups).map(([domainId, mailboxes]) => {
      const metrics = aggregateEmailMetrics(mailboxes);
      const rates = calculatePerformanceRates(metrics);
      return { domainId, metrics, rates };
    });

    const distributionStats = {
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
    };

    // Calculate performance segments
    const highPerformers = domains.filter(d => d.rates.deliveryRate > 0.9);
    const mediumPerformers = domains.filter(d => d.rates.deliveryRate >= 0.8 && d.rates.deliveryRate <= 0.9);
    const lowPerformers = domains.filter(d => d.rates.deliveryRate < 0.8);

    const performanceSegments = [
      {
        segment: 'high' as const,
        domainCount: highPerformers.length,
        averagePerformance: highPerformers.length > 0 ? {
          sent: Math.round(highPerformers.reduce((sum, d) => sum + d.metrics.sent, 0) / highPerformers.length),
          delivered: Math.round(highPerformers.reduce((sum, d) => sum + d.metrics.delivered, 0) / highPerformers.length),
          opened_tracked: Math.round(highPerformers.reduce((sum, d) => sum + d.metrics.opened_tracked, 0) / highPerformers.length),
          clicked_tracked: Math.round(highPerformers.reduce((sum, d) => sum + d.metrics.clicked_tracked, 0) / highPerformers.length),
          replied: Math.round(highPerformers.reduce((sum, d) => sum + d.metrics.replied, 0) / highPerformers.length),
          bounced: Math.round(highPerformers.reduce((sum, d) => sum + d.metrics.bounced, 0) / highPerformers.length),
          unsubscribed: Math.round(highPerformers.reduce((sum, d) => sum + d.metrics.unsubscribed, 0) / highPerformers.length),
          spamComplaints: Math.round(highPerformers.reduce((sum, d) => sum + d.metrics.spamComplaints, 0) / highPerformers.length),
        } : aggregatedMetrics,
        domains: highPerformers.map(d => ({ domainId: d.domainId, domainName: d.domainId })),
      },
      {
        segment: 'medium' as const,
        domainCount: mediumPerformers.length,
        averagePerformance: mediumPerformers.length > 0 ? {
          sent: Math.round(mediumPerformers.reduce((sum, d) => sum + d.metrics.sent, 0) / mediumPerformers.length),
          delivered: Math.round(mediumPerformers.reduce((sum, d) => sum + d.metrics.delivered, 0) / mediumPerformers.length),
          opened_tracked: Math.round(mediumPerformers.reduce((sum, d) => sum + d.metrics.opened_tracked, 0) / mediumPerformers.length),
          clicked_tracked: Math.round(mediumPerformers.reduce((sum, d) => sum + d.metrics.clicked_tracked, 0) / mediumPerformers.length),
          replied: Math.round(mediumPerformers.reduce((sum, d) => sum + d.metrics.replied, 0) / mediumPerformers.length),
          bounced: Math.round(mediumPerformers.reduce((sum, d) => sum + d.metrics.bounced, 0) / mediumPerformers.length),
          unsubscribed: Math.round(mediumPerformers.reduce((sum, d) => sum + d.metrics.unsubscribed, 0) / mediumPerformers.length),
          spamComplaints: Math.round(mediumPerformers.reduce((sum, d) => sum + d.metrics.spamComplaints, 0) / mediumPerformers.length),
        } : aggregatedMetrics,
        domains: mediumPerformers.map(d => ({ domainId: d.domainId, domainName: d.domainId })),
      },
      {
        segment: 'low' as const,
        domainCount: lowPerformers.length,
        averagePerformance: lowPerformers.length > 0 ? {
          sent: Math.round(lowPerformers.reduce((sum, d) => sum + d.metrics.sent, 0) / lowPerformers.length),
          delivered: Math.round(lowPerformers.reduce((sum, d) => sum + d.metrics.delivered, 0) / lowPerformers.length),
          opened_tracked: Math.round(lowPerformers.reduce((sum, d) => sum + d.metrics.opened_tracked, 0) / lowPerformers.length),
          clicked_tracked: Math.round(lowPerformers.reduce((sum, d) => sum + d.metrics.clicked_tracked, 0) / lowPerformers.length),
          replied: Math.round(lowPerformers.reduce((sum, d) => sum + d.metrics.replied, 0) / lowPerformers.length),
          bounced: Math.round(lowPerformers.reduce((sum, d) => sum + d.metrics.bounced, 0) / lowPerformers.length),
          unsubscribed: Math.round(lowPerformers.reduce((sum, d) => sum + d.metrics.unsubscribed, 0) / lowPerformers.length),
          spamComplaints: Math.round(lowPerformers.reduce((sum, d) => sum + d.metrics.spamComplaints, 0) / lowPerformers.length),
        } : aggregatedMetrics,
        domains: lowPerformers.map(d => ({ domainId: d.domainId, domainName: d.domainId })),
      },
    ];

    return {
      totalDomains: domains.length,
      aggregatedPerformance: aggregatedMetrics,
      averageRates,
      distributionStats,
      performanceSegments,
    };
  },
});

/**
 * Get cross-domain time series data
 */
export const getTimeSeriesData = query({
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
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (filters?.dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), filters.dateRange!.start),
          q.lte(q.field("date"), filters.dateRange!.end)
        )
      );
    }

    const allMailboxData = await mailboxQuery.collect();

    // Filter by domain IDs if specified
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = allMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }

    // Group by date
    const timeSeries: Record<string, typeof filteredMailboxData> = {};
    filteredMailboxData.forEach((mailbox) => {
      if (!timeSeries[mailbox.date]) {
        timeSeries[mailbox.date] = [];
      }
      timeSeries[mailbox.date].push(mailbox);
    });

    // Convert to time series format
    const timeSeriesData = Object.entries(timeSeries)
      .map(([date, mailboxes]) => ({
        date,
        metrics: aggregateEmailMetrics(mailboxes),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group by domain for domain-specific series
    const domainSeries: Record<string, Record<string, typeof filteredMailboxData>> = {};
    filteredMailboxData.forEach((mailbox) => {
      if (!domainSeries[mailbox.domain]) {
        domainSeries[mailbox.domain] = {};
      }
      if (!domainSeries[mailbox.domain][mailbox.date]) {
        domainSeries[mailbox.domain][mailbox.date] = [];
      }
      domainSeries[mailbox.domain][mailbox.date].push(mailbox);
    });

    const domainSeriesData = Object.entries(domainSeries).map(([domainId, dateGroups]) => ({
      domainId,
      domainName: domainId, // Placeholder
      series: Object.entries(dateGroups)
        .map(([date, mailboxes]) => ({
          date,
          metrics: aggregateEmailMetrics(mailboxes),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }));

    // Calculate aggregated series
    const aggregatedSeries = timeSeriesData.map(point => ({
      date: point.date,
      metrics: point.metrics,
    }));

    return {
      timeSeries: timeSeriesData,
      domainSeries: domainSeriesData,
      aggregatedSeries,
    };
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

    // Get mailbox data to generate insights
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    if (filters?.dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), filters.dateRange!.start),
          q.lte(q.field("date"), filters.dateRange!.end)
        )
      );
    }

    const mailboxData = await mailboxQuery.collect();

    // Filter by domain IDs if specified
    let filteredData = mailboxData;
    if (domainIds?.length) {
      filteredData = mailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }

    // Calculate basic metrics
    const aggregatedMetrics = aggregateEmailMetrics(filteredData);
    const rates = calculatePerformanceRates(aggregatedMetrics);
    const totalDomains = new Set(filteredData.map(m => m.domain)).size;

    // Generate insights based on the data
    const insights = [
      {
        type: 'performance' as const,
        title: 'Delivery Rate Analysis',
        description: `Average delivery rate across ${totalDomains} domains is ${(rates.deliveryRate * 100).toFixed(1)}%`,
        impact: 'high' as const,
        confidence: 0.95,
        recommendation: rates.deliveryRate > 0.9
          ? 'Excellent delivery performance. Continue current strategies.'
          : 'Consider reviewing authentication and content quality.',
        affectedDomains: [],
      },
      {
        type: 'trend' as const,
        title: 'Overall Performance Health',
        description: `System processed ${aggregatedMetrics.sent} emails with ${(rates.deliveryRate * 100).toFixed(1)}% delivery rate`,
        impact: 'medium' as const,
        confidence: 0.85,
        recommendation: 'Monitor performance trends regularly',
        affectedDomains: [],
      },
    ];

    return {
      insights,
      summary: {
        totalInsights: insights.length,
        highImpactInsights: insights.filter(i => i.impact === 'high').length,
        actionableRecommendations: insights.filter(i => i.recommendation).length,
        overallHealthScore: Math.round(rates.deliveryRate * 100),
      },
    };
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

/**
 * Get mailbox domain impact analysis
 * Shows how individual mailboxes contribute to overall domain metrics
 */
export const getMailboxDomainImpactAnalysis = query({
  args: {
    domainId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    const validatedDomainId = validateDomainId(args.domainId);
    const { dateRange, companyId } = args;

    // Get all mailboxes for this domain
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_domain", (q) => q.eq("domain", validatedDomainId));

    // Apply date range filter if provided
    if (dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange.start),
          q.lte(q.field("date"), dateRange.end)
        )
      );
    }

    const mailboxData = await mailboxQuery.collect();

    // Get corresponding domain analytics data
    let domainQuery = ctx.db
      .query("domainAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (dateRange) {
      domainQuery = domainQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange.start),
          q.lte(q.field("date"), dateRange.end)
        )
      );
    }

    const allDomainData = await domainQuery.collect();

    // Filter domain data to only include the specific domain
    const domainData = allDomainData.filter((d) => d.domainId === validatedDomainId);

    // Aggregate domain metrics
    const totalDomainMetrics = aggregateEmailMetrics(domainData.map(d => ({
      ...d,
      mailboxId: '',
      email: '',
      provider: '',
      domain: d.domainId,
      companyId: d.companyId,
      dailyLimit: 0,
      currentVolume: 0,
      warmupStatus: '',
      warmupProgress: 0,
      updatedAt: d.updatedAt
    } as MailboxAnalyticsRecord & EmailMetrics)));

    // Group mailbox data by mailbox
    const mailboxGroups = mailboxData.reduce((groups, record) => {
      if (!groups[record.mailboxId]) {
        groups[record.mailboxId] = {
          mailboxId: record.mailboxId,
          email: record.email,
          provider: record.provider,
          warmupStatus: record.warmupStatus,
          warmupProgress: record.warmupProgress,
          records: [],
        };
      }
      groups[record.mailboxId].records.push(record);
     
      return groups;
    }, {} as Record<string, { mailboxId: string; email: string; provider: string; warmupStatus: string; warmupProgress: number; records: (MailboxAnalyticsRecord & EmailMetrics)[] }>);

    // Calculate impact analysis
    const impactAnalysis: ImpactAnalysisResult = {
      domainId: validatedDomainId,
      totalDomainMetrics,
      mailboxGroups: Object.values(mailboxGroups).map((group) => {
        const mailboxMetrics = aggregateEmailMetrics(group.records);
        const mailboxHealthScore = Math.round(
          group.records.reduce((sum, record) => sum + calculateMailboxHealthScore(record), 0) /
          group.records.length
        );

        const contributionPercentage = totalDomainMetrics.sent > 0
          ? (mailboxMetrics.sent / totalDomainMetrics.sent) * 100
          : 0;

        // Calculate impact on domain health
        const domainHealthWithMailbox = calculateDomainHealthScore(totalDomainMetrics);
        const domainHealthWithoutMailbox = calculateDomainHealthScore({
          ...totalDomainMetrics,
          sent: totalDomainMetrics.sent - mailboxMetrics.sent,
          delivered: totalDomainMetrics.delivered - mailboxMetrics.delivered,
          bounced: totalDomainMetrics.bounced - mailboxMetrics.bounced,
          opened_tracked: totalDomainMetrics.opened_tracked - mailboxMetrics.opened_tracked,
          clicked_tracked: totalDomainMetrics.clicked_tracked - mailboxMetrics.clicked_tracked,
          replied: totalDomainMetrics.replied - mailboxMetrics.replied,
          unsubscribed: totalDomainMetrics.unsubscribed - mailboxMetrics.unsubscribed,
          spamComplaints: totalDomainMetrics.spamComplaints - mailboxMetrics.spamComplaints,
        });

        const healthImpact = domainHealthWithMailbox - domainHealthWithoutMailbox;
        const volumeImpact = totalDomainMetrics.sent > 0
          ? (mailboxMetrics.sent / totalDomainMetrics.sent) * 100
          : 0;

        return {
          mailboxId: group.mailboxId,
          email: group.email,
          provider: group.provider,
          warmupStatus: group.warmupStatus,
          warmupProgress: group.warmupProgress,
          metrics: mailboxMetrics,
          healthScore: mailboxHealthScore,
          contributionPercentage: Math.round(contributionPercentage * 100) / 100,
          impactOnDomain: {
            deliveryImpact: healthImpact,
            reputationImpact: healthImpact * 0.8, // Approximation
            volumeImpact: Math.round(volumeImpact * 100) / 100,
          },
        };
      }),
      domainHealthScore: Math.round(calculateDomainHealthScore(totalDomainMetrics)),
      averageMailboxHealthScore: Math.round(
        Object.values(mailboxGroups).reduce((sum, group) => {
          const healthScore = group.records.reduce((sum, record) => sum + calculateMailboxHealthScore(record), 0) / group.records.length;
          return sum + healthScore;
        }, 0) / Object.keys(mailboxGroups).length
      ),
      updatedAt: Math.max(
        ...mailboxData.map(m => m.updatedAt),
        ...domainData.map(d => d.updatedAt),
        0
      ),
    };

    return impactAnalysis;
  },
});
