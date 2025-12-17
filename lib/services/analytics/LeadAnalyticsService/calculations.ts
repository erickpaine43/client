/**
 * Calculations for LeadAnalyticsService
 * 
 * This module contains core business logic and computations for lead analytics,
 * including aggregations, rate calculations, engagement trends, funnel analysis,
 * segmentation, and improvement suggestions. All functions are pure (no side effects)
 * and type-safe. Use validation.ts before calling these to ensure input integrity.
 * 
 * Dependencies:
 * - AnalyticsCalculator for base rate calculations
 * - Types from ./types.ts for input/output shapes
 * 
 * Usage:
 * - Call specific calculators in queries.ts or index.ts
 * - Functions return computed results ready for response/caching
 * - No direct Convex or cache interactions here
 */

import type {
  PerformanceMetrics,
  TimeSeriesDataPoint,
  LeadListMetrics,
  LeadEngagementAnalytics,
  LeadSourceAnalytics,
  SegmentationAnalytics,
  ConversionFunnelData,
  LeadStatus
} from "./types";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

/**
 * Aggregate performance metrics across leads.
 * Sums counts (sent, delivered, etc.) from array of lead data.
 * 
 * @param leadData - Array of lead aggregated data with metrics
 * @returns Aggregated PerformanceMetrics
 */
export function aggregateLeadMetrics(
  leadData: Array<{ aggregatedMetrics: PerformanceMetrics }>
): PerformanceMetrics {
  return leadData.reduce(
    (acc, lead) => ({
      sent: acc.sent + lead.aggregatedMetrics.sent,
      delivered: acc.delivered + lead.aggregatedMetrics.delivered,
      opened_tracked: acc.opened_tracked + lead.aggregatedMetrics.opened_tracked,
      clicked_tracked: acc.clicked_tracked + lead.aggregatedMetrics.clicked_tracked,
      replied: acc.replied + lead.aggregatedMetrics.replied,
      bounced: acc.bounced + lead.aggregatedMetrics.bounced,
      unsubscribed: acc.unsubscribed + lead.aggregatedMetrics.unsubscribed,
      spamComplaints: acc.spamComplaints + lead.aggregatedMetrics.spamComplaints,
    }),
    {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    }
  );
}

/**
 * Calculate engagement trends from time series data.
 * Computes relative change in rates from first to last period.
 * 
 * @param timeSeriesData - Time series with metrics and leadCount
 * @returns Engagement trends object
 */
export function calculateEngagementTrends(
  timeSeriesData: Array<TimeSeriesDataPoint & { leadCount: number }>
): LeadEngagementAnalytics["engagementTrends"] {
  if (timeSeriesData.length < 2) {
    return { openTrend: 0, clickTrend: 0, replyTrend: 0 };
  }

  const first = timeSeriesData[0];
  const last = timeSeriesData[timeSeriesData.length - 1];

  const firstOpenRate = AnalyticsCalculator.calculateOpenRate(
    first.metrics.opened_tracked,
    first.metrics.delivered
  );
  const lastOpenRate = AnalyticsCalculator.calculateOpenRate(
    last.metrics.opened_tracked,
    last.metrics.delivered
  );

  const firstClickRate = AnalyticsCalculator.calculateClickRate(
    first.metrics.clicked_tracked,
    first.metrics.delivered
  );
  const lastClickRate = AnalyticsCalculator.calculateClickRate(
    last.metrics.clicked_tracked,
    last.metrics.delivered
  );

  const firstReplyRate = AnalyticsCalculator.calculateReplyRate(
    first.metrics.replied,
    first.metrics.delivered
  );
  const lastReplyRate = AnalyticsCalculator.calculateReplyRate(
    last.metrics.replied,
    last.metrics.delivered
  );

  return {
    openTrend: firstOpenRate > 0 ? (lastOpenRate - firstOpenRate) / firstOpenRate : 0,
    clickTrend: firstClickRate > 0 ? (lastClickRate - firstClickRate) / firstClickRate : 0,
    replyTrend: firstReplyRate > 0 ? (lastReplyRate - firstReplyRate) / firstReplyRate : 0,
  };
}

/**
 * Calculate top engaging leads with scores.
 * Sorts by engagement score descending, limits to top 10.
 * 
 * @param aggregatedData - Array of lead aggregated data
 * @returns Top engaging leads array
 */
export function calculateTopEngagingLeads(
  aggregatedData: Array<{
    leadId: string;
    email: string;
    company?: string;
    aggregatedMetrics: PerformanceMetrics;
  }>
): LeadEngagementAnalytics["topEngagingLeads"] {
  return aggregatedData
    .map((lead) => {
      const engagementScore = AnalyticsCalculator.calculateEngagementRate(
        lead.aggregatedMetrics.opened_tracked,
        lead.aggregatedMetrics.clicked_tracked,
        lead.aggregatedMetrics.replied,
        lead.aggregatedMetrics.delivered
      );
      
      return {
        leadId: lead.leadId,
        email: lead.email,
        company: lead.company,
        engagementScore,
        totalInteractions: lead.aggregatedMetrics.opened_tracked + 
                          lead.aggregatedMetrics.clicked_tracked + 
                          lead.aggregatedMetrics.replied,
      };
    })
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 10);
}

/**
 * Compute conversion funnel steps from lead data.
 * Creates steps: Delivered, Opened, Clicked, Replied based on counts.
 * 
 * @param leadData - Array of lead aggregated data
 * @returns Funnel steps and overall conversion
 */
export function computeConversionFunnel(
  leadData: Array<{ aggregatedMetrics: PerformanceMetrics }>
): Pick<ConversionFunnelData, "funnelSteps" | "overallConversion"> {
  const totalLeads = leadData.length;
  const deliveredLeads = leadData.filter(l => l.aggregatedMetrics.delivered > 0).length;
  const openedLeads = leadData.filter(l => l.aggregatedMetrics.opened_tracked > 0).length;
  const clickedLeads = leadData.filter(l => l.aggregatedMetrics.clicked_tracked > 0).length;
  const repliedLeads = leadData.filter(l => l.aggregatedMetrics.replied > 0).length;

  const funnelSteps = [
    {
      step: "Delivered",
      leadCount: deliveredLeads,
      conversionRate: totalLeads > 0 ? deliveredLeads / totalLeads : 0,
      dropoffRate: totalLeads > 0 ? (totalLeads - deliveredLeads) / totalLeads : 0,
    },
    {
      step: "Opened",
      leadCount: openedLeads,
      conversionRate: deliveredLeads > 0 ? openedLeads / deliveredLeads : 0,
      dropoffRate: deliveredLeads > 0 ? (deliveredLeads - openedLeads) / deliveredLeads : 0,
    },
    {
      step: "Clicked",
      leadCount: clickedLeads,
      conversionRate: openedLeads > 0 ? clickedLeads / openedLeads : 0,
      dropoffRate: openedLeads > 0 ? (openedLeads - clickedLeads) / openedLeads : 0,
    },
    {
      step: "Replied",
      leadCount: repliedLeads,
      conversionRate: clickedLeads > 0 ? repliedLeads / clickedLeads : 0,
      dropoffRate: clickedLeads > 0 ? (clickedLeads - repliedLeads) / clickedLeads : 0,
    },
  ];

  const overallConversion = totalLeads > 0 ? repliedLeads / totalLeads : 0;

  return { funnelSteps, overallConversion };
}

/**
 * Identify funnel bottlenecks.
 * Filters steps with >30% dropoff, sorts descending, adds suggestions.
 * 
 * @param funnelSteps - Computed funnel steps
 * @returns Bottlenecks array
 */
export function identifyFunnelBottlenecks(
  funnelSteps: ConversionFunnelData["funnelSteps"]
): ConversionFunnelData["bottlenecks"] {
  return funnelSteps
    .filter(step => step.dropoffRate > 0.3)
    .sort((a, b) => b.dropoffRate - a.dropoffRate)
    .slice(0, 3)
    .map(step => ({
      step: step.step,
      dropoffRate: step.dropoffRate,
      improvement: getImprovementSuggestion(step.step),
    }));
}

/**
 * Compute lead source breakdown by domain.
 * Groups leads by email domain, computes metrics and rates.
 * 
 * @param leadData - Array of lead aggregated data with email
 * @returns Source breakdown and top sources
 */
export function computeLeadSourceAnalytics(
  leadData: Array<{
    email: string;
    aggregatedMetrics: PerformanceMetrics;
  }>
): LeadSourceAnalytics {
  const sourceGroups = new Map<string, Array<{
    email: string;
    aggregatedMetrics: PerformanceMetrics;
  }>>();
  
  leadData.forEach((lead) => {
    const domain = lead.email.split("@")[1] || "unknown";
    if (!sourceGroups.has(domain)) {
      sourceGroups.set(domain, []);
    }
    sourceGroups.get(domain)!.push(lead);
  });

  const sourceBreakdown = Array.from(sourceGroups.entries()).map(([source, leads]) => {
    const totalMetrics = aggregateLeadMetrics(leads.map(l => ({ aggregatedMetrics: l.aggregatedMetrics })));

    const engagementRate = AnalyticsCalculator.calculateEngagementRate(
      totalMetrics.opened_tracked,
      totalMetrics.clicked_tracked,
      totalMetrics.replied,
      totalMetrics.delivered
    );

    const conversionRate = AnalyticsCalculator.calculateReplyRate(
      totalMetrics.replied,
      totalMetrics.delivered
    );

    return {
      source,
      leadCount: leads.length,
      engagementRate,
      conversionRate,
    };
  });

  const topPerformingSources = sourceBreakdown
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5)
    .map(sourceItem => {
      const sourceLeads = sourceGroups.get(sourceItem.source)!;
      const metrics = aggregateLeadMetrics(sourceLeads.map(l => ({ aggregatedMetrics: l.aggregatedMetrics })));

      return {
        source: sourceItem.source,
        metrics,
        conversionRate: sourceItem.conversionRate,
      };
    });

  return {
    sourceBreakdown,
    topPerformingSources,
  };
}

/**
 * Compute lead segmentation by company and status.
 * Groups and aggregates metrics, calculates rates.
 * 
 * @param leadData - Array of lead data with company, status, metrics
 * @returns Segmentation analytics
 */
export function computeSegmentationAnalytics(
  leadData: Array<{
    company?: string;
    status: LeadStatus;
    aggregatedMetrics: PerformanceMetrics;
  }>
): SegmentationAnalytics {
  // Company segments
  const companyGroups = new Map<string, Array<{
    company?: string;
    status: LeadStatus;
    aggregatedMetrics: PerformanceMetrics;
  }>>();
  leadData.forEach((lead) => {
    const company = lead.company || "Unknown";
    if (!companyGroups.has(company)) {
      companyGroups.set(company, []);
    }
    companyGroups.get(company)!.push(lead);
  });

  const companySegments = Array.from(companyGroups.entries()).map(([company, leads]) => {
    const metrics = aggregateLeadMetrics(leads.map(l => ({ aggregatedMetrics: l.aggregatedMetrics })));

    const averageEngagement = AnalyticsCalculator.calculateEngagementRate(
      metrics.opened_tracked,
      metrics.clicked_tracked,
      metrics.replied,
      metrics.delivered
    );

    return {
      company,
      leadCount: leads.length,
      metrics,
      averageEngagement,
    };
  });

  // Status segments
  const statusGroups = new Map<LeadStatus, Array<{
    company?: string;
    status: LeadStatus;
    aggregatedMetrics: PerformanceMetrics;
  }>>();
  leadData.forEach((lead) => {
    if (!statusGroups.has(lead.status)) {
      statusGroups.set(lead.status, []);
    }
    statusGroups.get(lead.status)!.push(lead);
  });

  const statusSegments = Array.from(statusGroups.entries()).map(([status, leads]) => {
    const metrics = aggregateLeadMetrics(leads.map(l => ({ aggregatedMetrics: l.aggregatedMetrics })));

    const conversionRate = AnalyticsCalculator.calculateReplyRate(
      metrics.replied,
      metrics.delivered
    );

    return {
      status,
      leadCount: leads.length,
      metrics,
      conversionRate,
    };
  });

  return {
    companySegments,
    statusSegments,
  };
}

/**
 * Get improvement suggestion for funnel step.
 * Maps step to predefined suggestion string.
 * 
 * @param step - Funnel step name
 * @returns Suggestion string
 */
export function getImprovementSuggestion(step: string): string {
  const suggestions = {
    "Delivered": "Improve list hygiene and sender reputation to increase delivery rates",
    "Opened": "Optimize subject lines and sender name to improve open rates",
    "Clicked": "Improve email content and call-to-action placement to increase clicks",
    "Replied": "Create more engaging content that encourages responses",
  };

  return suggestions[step as keyof typeof suggestions] || "Review and optimize this step";
}

/**
 * Lead data interface for metrics computation.
 */
interface LeadDataForMetrics {
  status: LeadStatus;
  aggregatedMetrics: PerformanceMetrics;
}

/**
 * Compute lead list metrics summary.
 * Aggregates totals, status breakdown, engagement summary.
 *
 * @param leadData - Raw lead data for metrics
 * @param statusBreakdown - Pre-computed status counts (placeholder)
 * @returns LeadListMetrics
 */
export function computeLeadListMetrics(
  leadData: Array<LeadDataForMetrics>,
  statusBreakdown: Array<{ status: LeadStatus; count: number }>,
  totalMetrics: PerformanceMetrics
): LeadListMetrics {
  const engagementSummary = {
    activeLeads: leadData.filter(l => l.status === "ACTIVE").length,
    repliedLeads: leadData.filter(l => l.aggregatedMetrics.replied > 0).length,
    bouncedLeads: leadData.filter(l => l.aggregatedMetrics.bounced > 0).length,
    unsubscribedLeads: leadData.filter(l => l.aggregatedMetrics.unsubscribed > 0).length,
    completedLeads: leadData.filter(l => l.status === "COMPLETED").length,
  };

  // Compute percentages for status breakdown
  const totalLeads = leadData.length;
  const breakdownWithPercent = statusBreakdown.map(item => ({
    ...item,
    percentage: totalLeads > 0 ? (item.count / totalLeads) * 100 : 0,
  }));

  return {
    totalLeads,
    totalMetrics,
    statusBreakdown: breakdownWithPercent,
    engagementSummary,
  };
}
