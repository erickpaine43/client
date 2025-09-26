import { query, QueryCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { v } from "convex/values";

// Import types
import {
  DomainAnalyticsResult,
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
  aggregateEmailMetrics,
  calculateWarmupSummary,
  calculateCapacitySummary
} from "./calculations";

// Import aggregation utilities
import { aggregateMailboxMetrics, aggregateDomainMetrics } from "../utils/analytics-aggregators";

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
    const mailboxData = await getFilteredMailboxData(ctx, { companyId, dateRange, domainIds, mailboxIds });
    
    // Get corresponding domain analytics data
    const domainData = await getFilteredDomainData(ctx, { companyId, dateRange, domainIds: Array.from(new Set(mailboxData.map(m => m.domain))) });

    // Process and join the data
    return processJoinedAnalytics(mailboxData, domainData);
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
    const mailboxData = await getMailboxDataForDomain(ctx, validatedDomainId, dateRange);
    
    // Get corresponding domain analytics data
    const domainData = await getDomainDataForDomain(ctx, validatedDomainId, companyId, dateRange);

    // Calculate impact analysis
    return calculateMailboxImpactAnalysis(validatedDomainId, mailboxData, domainData);
  },
});

// Helper functions
async function getFilteredMailboxData(ctx: QueryCtx, filters: {
  companyId: string;
  dateRange?: { start: string; end: string };
  domainIds?: string[];
  mailboxIds?: string[];
}) {
  let mailboxQuery = ctx.db
    .query("mailboxAnalytics")
    .withIndex("by_company_date", (q) => q.eq("companyId", filters.companyId));

  if (filters.dateRange) {
    mailboxQuery = mailboxQuery.filter((q) =>
      q.and(
        q.gte(q.field("date"), filters.dateRange!.start),
        q.lte(q.field("date"), filters.dateRange!.end)
      )
    );
  }

  const allMailboxData = await mailboxQuery.collect();

  let filteredData = allMailboxData;
  if (filters.domainIds?.length) {
    filteredData = filteredData.filter((m) => filters.domainIds!.includes(m.domain));
  }
  if (filters.mailboxIds?.length) {
    filteredData = filteredData.filter((m) => filters.mailboxIds!.includes(m.mailboxId));
  }

  return filteredData;
}

async function getFilteredDomainData(ctx: QueryCtx, filters: {
  companyId: string;
  dateRange?: { start: string; end: string };
  domainIds: string[];
}) {
  let domainQuery = ctx.db
    .query("domainAnalytics")
    .withIndex("by_company_date", (q) => q.eq("companyId", filters.companyId));

  if (filters.dateRange) {
    domainQuery = domainQuery.filter((q) =>
      q.and(
        q.gte(q.field("date"), filters.dateRange!.start),
        q.lte(q.field("date"), filters.dateRange!.end)
      )
    );
  }

  const allDomainData = await domainQuery.collect();
  return allDomainData.filter((d) => filters.domainIds.includes(d.domainId));
}

function processJoinedAnalytics(mailboxData: Doc<"mailboxAnalytics">[], domainData: Doc<"domainAnalytics">[]): DomainAnalyticsResult[] {
  // Group data by domain
  const mailboxesByDomain = aggregateMailboxMetrics(mailboxData);
  const domainDataByDomain = aggregateDomainMetrics(domainData);

  const relevantDomains = Array.from(new Set(mailboxData.map(m => m.domain)));

  return relevantDomains.map((domainId: string) => {
    const mailboxes = mailboxesByDomain[domainId] || [];
    const domainRecords = domainDataByDomain[domainId] || [];

    // Aggregate metrics
    const mailboxAggregated = aggregateEmailMetrics(mailboxes);
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

    // Get latest domain record for authentication info
    const latestDomainRecord = domainRecords.length > 0
      ? domainRecords.reduce((latest, current) => current.date > latest.date ? current : latest)
      : null;

    // Calculate health data
    const mailboxHealthData: MailboxHealthData[] = mailboxes.map((mailbox) => ({
      mailboxId: mailbox.mailboxId,
      email: mailbox.email,
      provider: mailbox.provider,
      warmupStatus: mailbox.warmupStatus,
      warmupProgress: mailbox.warmupProgress,
      healthScore: Math.round(calculateMailboxHealthScore(mailbox)),
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
    }));

    return {
      domainId,
      domainName: latestDomainRecord?.domainName || domainId,
      authentication: latestDomainRecord?.authentication || { spf: false, dkim: false, dmarc: false },
      domainMetrics: domainAggregated,
      domainHealthScore: Math.round(calculateDomainHealthScore(domainAggregated)),
      domainReputation: Math.round(calculateDomainHealthScore(domainAggregated)), // Simplified
      mailboxAggregatedMetrics: mailboxAggregated,
      mailboxes: mailboxHealthData,
      mailboxCount: mailboxes.length,
      warmupSummary: calculateWarmupSummary(mailboxes),
      capacitySummary: calculateCapacitySummary(mailboxes),
      updatedAt: Math.max(
        ...mailboxes.map(m => m.updatedAt),
        ...domainRecords.map(d => d.updatedAt),
        0
      ),
    };
  });
}

async function getMailboxDataForDomain(ctx: QueryCtx, domainId: string, dateRange?: { start: string; end: string }) {
  let mailboxQuery = ctx.db
    .query("mailboxAnalytics")
    .withIndex("by_domain", (q) => q.eq("domain", domainId));

  if (dateRange) {
    mailboxQuery = mailboxQuery.filter((q) =>
      q.and(
        q.gte(q.field("date"), dateRange.start),
        q.lte(q.field("date"), dateRange.end)
      )
    );
  }

  return await mailboxQuery.collect();
}

async function getDomainDataForDomain(ctx: QueryCtx, domainId: string, companyId: string, dateRange?: { start: string; end: string }) {
  let domainQuery = ctx.db
    .query("domainAnalytics")
    .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

  if (dateRange) {
    domainQuery = domainQuery.filter((q) =>
      q.and(
        q.gte(q.field("date"), dateRange.start),
        q.lte(q.field("date"), dateRange.end)
      )
    );
  }

  const allDomainData = await domainQuery.collect();
  return allDomainData.filter((d) => d.domainId === domainId);
}

function calculateMailboxImpactAnalysis(domainId: string, mailboxData: Doc<"mailboxAnalytics">[], domainData: Doc<"domainAnalytics">[]): ImpactAnalysisResult {
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
  }, {} as Record<string, { 
    mailboxId: string; 
    email: string; 
    provider: string; 
    warmupStatus: string; 
    warmupProgress: number; 
    records: (MailboxAnalyticsRecord & EmailMetrics)[] 
  }>);

  // Calculate impact for each mailbox
  const mailboxGroupsWithImpact = Object.values(mailboxGroups).map((group: { 
    mailboxId: string; 
    email: string; 
    provider: string; 
    warmupStatus: string; 
    warmupProgress: number; 
    records: (MailboxAnalyticsRecord & EmailMetrics)[] 
  }) => {
    const mailboxMetrics = aggregateEmailMetrics(group.records);
    const mailboxHealthScore = Math.round(
      group.records.reduce((sum, record) => sum + calculateMailboxHealthScore(record), 0) / group.records.length
    );

    const contributionPercentage = totalDomainMetrics.sent > 0
      ? (mailboxMetrics.sent / totalDomainMetrics.sent) * 100
      : 0;

    const healthImpact = calculateDomainHealthScore(totalDomainMetrics) - 
      calculateDomainHealthScore({
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
        reputationImpact: healthImpact * 0.8,
        volumeImpact: Math.round(contributionPercentage * 100) / 100,
      },
    };
  });

  return {
    domainId,
    totalDomainMetrics,
    mailboxGroups: mailboxGroupsWithImpact,
    domainHealthScore: Math.round(calculateDomainHealthScore(totalDomainMetrics)),
    averageMailboxHealthScore: (() => {
      const groups = Object.values(mailboxGroups) as Array<{ 
        mailboxId: string; 
        email: string; 
        provider: string; 
        warmupStatus: string; 
        warmupProgress: number; 
        records: (MailboxAnalyticsRecord & EmailMetrics)[] 
      }>;
      if (groups.length === 0) return 0;
      let totalHealthScore = 0;
      for (const group of groups) {
        const healthScore = group.records.reduce((sum, record) => sum + calculateMailboxHealthScore(record), 0) / group.records.length;
        totalHealthScore += healthScore;
      }
      return Math.round(totalHealthScore / groups.length);
    })(),
    updatedAt: Math.max(
      ...mailboxData.map(m => m.updatedAt),
      ...domainData.map(d => d.updatedAt),
      0
    ),
  };
}
