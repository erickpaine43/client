import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";
import { AnalyticsFilters, AnalyticsComputeOptions, PerformanceMetrics } from "@/types/analytics/core";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { CrossDomainAnalyticsResult, CrossDomainTimeSeriesDataPoint, MailboxDomainImpactAnalysis } from "./types";
import { calculateMailboxDomainCorrelation, generateCorrelationInsights } from "./calculations";
import { validateCrossDomainFilters, validateDomainMailboxIds } from "./validation";

/**
 * Get comprehensive analytics that join mailbox and domain data.
 */
export async function performMailboxDomainJoinedAnalyticsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  domainIds?: string[],
  mailboxIds?: string[],
  filters?: AnalyticsFilters
): Promise<CrossDomainAnalyticsResult[]> {
  const effectiveFilters = filters || { dateRange: { start: "", end: "" }, companyId };
  validateCrossDomainFilters(effectiveFilters);
  validateDomainMailboxIds(domainIds, mailboxIds);

  const convexHelper = createAnalyticsConvexHelper(convex, "CrossDomainAnalyticsService");
  const result = await convexHelper.query<CrossDomainAnalyticsResult[]>(
    api.crossDomainAnalytics.index.getMailboxDomainJoinedAnalytics,
    {
      domainIds,
      mailboxIds,
      dateRange: effectiveFilters.dateRange,
      companyId: effectiveFilters.companyId || companyId,
    },
    {
      serviceName: "CrossDomainAnalyticsService",
      methodName: "performMailboxDomainJoinedAnalyticsQuery"
    }
  );

  return result;
}

/**
 * Get cross-domain time series data showing mailbox impact on domain metrics.
 */
export async function performCrossDomainTimeSeriesDataQuery(
  convex: ConvexHttpClient,
  companyId: string,
  domainIds?: string[],
  mailboxIds?: string[],
  filters?: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day"
): Promise<CrossDomainTimeSeriesDataPoint[]> {
  const effectiveFilters = filters || { dateRange: { start: "", end: "" }, companyId };
  validateCrossDomainFilters(effectiveFilters);
  validateDomainMailboxIds(domainIds, mailboxIds);

  const convexHelper = createAnalyticsConvexHelper(convex, "CrossDomainAnalyticsService");
  const result = await convexHelper.query<CrossDomainTimeSeriesDataPoint[]>(
    api.crossDomainAnalytics.index.getCrossDomainTimeSeriesAnalytics,
    {
      domainIds,
      mailboxIds,
      dateRange: effectiveFilters.dateRange,
      companyId: effectiveFilters.companyId || companyId,
      granularity,
    },
    {
      serviceName: "CrossDomainAnalyticsService",
      methodName: "performCrossDomainTimeSeriesDataQuery"
    }
  );

  return result;
}

/**
 * Get mailbox impact analysis showing how individual mailboxes affect domain performance.
 */
export async function performMailboxDomainImpactAnalysisQuery(
  convex: ConvexHttpClient,
  companyId: string,
  domainId: string,
  filters?: AnalyticsFilters
): Promise<MailboxDomainImpactAnalysis> {
  const effectiveFilters = filters || { dateRange: { start: "", end: "" }, companyId };
  validateCrossDomainFilters(effectiveFilters);

  const convexHelper = createAnalyticsConvexHelper(convex, "CrossDomainAnalyticsService");
  const result = await convexHelper.query<MailboxDomainImpactAnalysis>(
    api.crossDomainAnalytics.index.getMailboxDomainImpactAnalysis,
    {
      domainId,
      dateRange: effectiveFilters.dateRange,
      companyId: effectiveFilters.companyId || companyId,
    },
    {
      serviceName: "CrossDomainAnalyticsService",
      methodName: "performMailboxDomainImpactAnalysisQuery"
    }
  );

  return result;
}

/**
 * Get filtered cross-domain analytics with advanced filtering.
 */
export async function performFilteredCrossDomainAnalyticsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  filters: AnalyticsFilters,
  options: AnalyticsComputeOptions = {}
): Promise<{
  joinedAnalytics: CrossDomainAnalyticsResult[];
  timeSeriesData?: CrossDomainTimeSeriesDataPoint[];
  impactAnalysis?: Record<string, MailboxDomainImpactAnalysis>;
  aggregatedMetrics: PerformanceMetrics;
  calculatedRates: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  validateCrossDomainFilters(filters);

  // Get joined analytics data
  const joinedAnalytics = await performMailboxDomainJoinedAnalyticsQuery(
    convex,
    companyId,
    filters.domainIds,
    filters.mailboxIds,
    filters
  );

  // Get time series data if requested
  let timeSeriesData: CrossDomainTimeSeriesDataPoint[] | undefined;
  if (options.includeTimeSeriesData) {
    timeSeriesData = await performCrossDomainTimeSeriesDataQuery(
      convex,
      companyId,
      filters.domainIds,
      filters.mailboxIds,
      filters,
      options.granularity || "day"
    );
  }

  // Get impact analysis if requested
  let impactAnalysis: Record<string, MailboxDomainImpactAnalysis> | undefined;
  if (options.customMetrics?.includes("impact")) {
    impactAnalysis = {};
    const uniqueDomains = [...new Set(joinedAnalytics.map((j: CrossDomainAnalyticsResult) => j.domainId))];

    for (const domainId of uniqueDomains) {
      impactAnalysis[domainId] = await performMailboxDomainImpactAnalysisQuery(convex, companyId, domainId, filters);
    }
  }

  // Calculate aggregated metrics across all domains
  const allDomainMetrics = joinedAnalytics.map((j: CrossDomainAnalyticsResult) => j.domainMetrics);
  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(allDomainMetrics);
  const calculatedRates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  return {
    joinedAnalytics,
    timeSeriesData,
    impactAnalysis,
    aggregatedMetrics,
    calculatedRates,
  };
}

/**
 * Get cross-domain correlation insights.
 */
export async function performCrossDomainCorrelationInsightsQuery(
  convex: ConvexHttpClient,
  companyId: string,
  domainIds?: string[],
  filters?: AnalyticsFilters
): Promise<{
  correlations: Array<{
    domainId: string;
    domainName: string;
    mailboxCorrelations: Array<{
      mailboxId: string;
      email: string;
      correlationScore: number;
      correlationStrength: "STRONG" | "MODERATE" | "WEAK";
      correlationDirection: "POSITIVE" | "NEGATIVE";
      insights: string[];
    }>;
    overallCorrelation: number;
  }>;
  summary: {
    strongCorrelations: number;
    moderateCorrelations: number;
    weakCorrelations: number;
    averageCorrelation: number;
  };
}> {
  const effectiveFilters = filters || { dateRange: { start: "", end: "" }, companyId };
  validateCrossDomainFilters(effectiveFilters);

  const joinedAnalytics = await performMailboxDomainJoinedAnalyticsQuery(
    convex,
    companyId,
    domainIds,
    undefined,
    effectiveFilters
  );

  const correlations = joinedAnalytics.map((domain: CrossDomainAnalyticsResult) => {
    const mailboxCorrelations = domain.mailboxes.map((mailbox: CrossDomainAnalyticsResult['mailboxes'][0]) => {
      // Calculate correlation between mailbox and domain performance
      const mailboxRates = AnalyticsCalculator.calculateAllRates(mailbox.performance);
      const domainRates = AnalyticsCalculator.calculateAllRates(domain.domainMetrics);

      const { correlationScore, correlationStrength, correlationDirection } = calculateMailboxDomainCorrelation(
        mailboxRates,
        domainRates
      );

      // Generate insights
      const insights = generateCorrelationInsights(
        mailboxRates,
        domainRates,
        mailbox.warmupStatus,
        mailbox.warmupProgress
      );

      return {
        mailboxId: mailbox.mailboxId,
        email: mailbox.email,
        correlationScore,
        correlationStrength,
        correlationDirection,
        insights,
      };
    });

    const overallCorrelation = mailboxCorrelations.length > 0
      ? Math.round(mailboxCorrelations.reduce((sum: number, m: { correlationScore: number }) => sum + m.correlationScore, 0) / mailboxCorrelations.length)
      : 0;

    return {
      domainId: domain.domainId,
      domainName: domain.domainName,
      mailboxCorrelations,
      overallCorrelation,
    };
  });

  // Calculate summary statistics
  const allCorrelations = correlations.flatMap((c: { mailboxCorrelations: Array<{ correlationScore: number; correlationStrength: string }> }) => c.mailboxCorrelations);
  const summary = {
    strongCorrelations: allCorrelations.filter((c: { correlationStrength: string }) => c.correlationStrength === "STRONG").length,
    moderateCorrelations: allCorrelations.filter((c: { correlationStrength: string }) => c.correlationStrength === "MODERATE").length,
    weakCorrelations: allCorrelations.filter((c: { correlationStrength: string }) => c.correlationStrength === "WEAK").length,
    averageCorrelation: allCorrelations.length > 0
      ? Math.round(allCorrelations.reduce((sum: number, c: { correlationScore: number }) => sum + c.correlationScore, 0) / allCorrelations.length)
      : 0,
  };

  return {
    correlations,
    summary,
  };
}
