"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnalyticsFilters } from "@/types/analytics/core";
import {
  CrossDomainAnalyticsResult,
  CrossDomainTimeSeriesDataPoint,
  MailboxDomainImpactAnalysis,
} from "@/lib/services/analytics/CrossDomainAnalyticsService";
import {
  getCrossDomainPerformanceComparison,
  getCrossDomainTimeSeries,
  getCrossDomainCorrelationAnalysis,
  generateCrossDomainInsights,
} from "@/lib/actions/analytics/cross-domain-analytics";

/**
 * Hook for real-time mailbox-domain joined analytics.
 * Provides comprehensive view of how mailboxes contribute to domain performance.
 * Uses NileDB API with polling for live updates (15-second refresh).
 */
export function useCrossDomainAnalytics(
  domainIds?: string[],
  mailboxIds?: string[],
  filters?: AnalyticsFilters,
  options: {
    enabled?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const { enabled = true, refreshInterval = 15000 } = options; // 15 seconds

  // State for raw API data and enriched data
  const [rawData, setRawData] = useState<unknown>(null);
  const [enrichedData, setEnrichedData] = useState<CrossDomainAnalyticsResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // Fetch raw data from API
  const fetchRawData = useCallback(async () => {
    if (!enabled || !domainIds || domainIds.length === 0) return;

    try {
      const params = new URLSearchParams();
      if (domainIds) params.append('domainIds', domainIds.join(','));
      if (mailboxIds) params.append('mailboxIds', mailboxIds.join(','));
      if (filters?.companyId) params.append('companyId', filters.companyId);
      if (filters?.dateRange?.start) params.append('dateRangeStart', filters.dateRange.start);
      if (filters?.dateRange?.end) params.append('dateRangeEnd', filters.dateRange.end);

      const response = await fetch(`/api/analytics/cross-domain?${params}`);
      const result = await response.json();

      if (result.success) {
        setRawData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch cross-domain analytics');
      }
    } catch (err) {
      console.error('Error fetching cross-domain analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [domainIds, mailboxIds, filters, enabled]);

  // Enrich data with server action calculations
  const enrichData = useCallback(async () => {
    if (!rawData || !enabled || !domainIds || domainIds.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await getCrossDomainPerformanceComparison(domainIds, filters);

      if (result.success && result.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEnrichedData(result.data as any);
        setLastUpdated(Date.now());
      } else {
        setError(result.error?.message || "Failed to enrich cross-domain analytics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [rawData, domainIds, filters, enabled]);

  // Fetch raw data and enrich
  useEffect(() => {
    fetchRawData();
    const interval = setInterval(fetchRawData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchRawData, refreshInterval]);

  // Enrich when raw data changes
  useEffect(() => {
    enrichData();
  }, [enrichData]);

  // Memoized summary statistics
  const summary = useMemo(() => {
    if (!enrichedData.length) {
      return {
        totalDomains: 0,
        totalMailboxes: 0,
        averageDomainHealth: 0,
        averageMailboxHealth: 0,
        totalCapacity: 0,
        totalVolume: 0,
        overallUtilization: 0,
      };
    }

    const totalMailboxes = enrichedData.reduce((sum: number, d: CrossDomainAnalyticsResult) => sum + d.mailboxCount, 0);
    const totalCapacity = enrichedData.reduce((sum: number, d: CrossDomainAnalyticsResult) => sum + d.capacitySummary.totalDailyLimit, 0);
    const totalVolume = enrichedData.reduce((sum: number, d: CrossDomainAnalyticsResult) => sum + d.capacitySummary.totalCurrentVolume, 0);

    return {
      totalDomains: enrichedData.length,
      totalMailboxes,
      averageDomainHealth:
        enrichedData.length > 0
          ? Math.round(enrichedData.reduce((sum: number, d: CrossDomainAnalyticsResult) => sum + d.domainHealthScore, 0) / enrichedData.length)
          : 0,
      averageMailboxHealth:
        enrichedData.length > 0
          ? Math.round(enrichedData.reduce((sum: number, d: CrossDomainAnalyticsResult) => sum + d.warmupSummary.averageHealthScore, 0) / enrichedData.length)
          : 0,
      totalCapacity,
      totalVolume,
      overallUtilization: totalCapacity > 0 ? totalVolume / totalCapacity : 0,
    };
  }, [enrichedData]);

  return {
    data: enrichedData,
    rawData,
    summary,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchRawData,
  };
}

/**
 * Hook for real-time cross-domain time series analytics.
 * Shows how mailbox changes affect domain metrics over time.
 */
export function useCrossDomainTimeSeries(
  domainIds?: string[],
  mailboxIds?: string[],
  filters?: AnalyticsFilters,
  granularity: "day" | "week" | "month" = "day",
  options: {
    enabled?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const { enabled = true, refreshInterval = 60000 } = options;

  const [enrichedData, setEnrichedData] = useState<CrossDomainTimeSeriesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and enrich time series data
  const fetchData = useCallback(async () => {
    if (!enabled || !domainIds || domainIds.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await getCrossDomainTimeSeries(domainIds, filters);

      if (result.success && result.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEnrichedData(result.data as any);
      } else {
        setError(result.error?.message || "Failed to enrich time series data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [domainIds, filters, enabled]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Memoized chart data
  const chartData = useMemo(() => {
    return enrichedData.map((point: CrossDomainTimeSeriesDataPoint) => ({
      date: point.date,
      label: point.label,
      domainId: point.domainId,
      sent: point.domainMetrics.sent,
      delivered: point.domainMetrics.delivered,
      opened: point.domainMetrics.opened_tracked,
      clicked: point.domainMetrics.clicked_tracked,
      replied: point.domainMetrics.replied,
      healthScore: point.domainHealthScore,
      activeMailboxes: point.mailboxInsights.activeMailboxes,
      capacityUtilization: point.correlationMetrics.capacityUtilization,
    }));
  }, [enrichedData]);

  return {
    data: enrichedData,
    chartData,
    rawData: null,
    isLoading,
    error,
    refresh: fetchData,
  };
}

/**
 * Hook for mailbox domain impact analysis.
 * Shows how individual mailboxes affect domain performance.
 */
export function useMailboxDomainImpact(
  domainId: string,
  filters?: AnalyticsFilters,
  options: {
    enabled?: boolean;
    refreshInterval?: number;
    limit?: number;
  } = {}
) {
  const { enabled = true, refreshInterval = 120000 } = options;

  const [enrichedData, setEnrichedData] = useState<MailboxDomainImpactAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch impact analysis data
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await generateCrossDomainInsights([domainId], filters);

      if (result.success && result.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEnrichedData(result.data as any);
      } else {
        setError(result.error?.message || "Failed to enrich impact analysis");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [domainId, filters, enabled]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Memoized insights
  const insights = useMemo(() => {
    if (!enrichedData) return [];

    const insights: string[] = [];
    const { summary, mailboxImpactAnalysis } = enrichedData;

    if (summary.positiveImpactMailboxes > summary.negativeImpactMailboxes) {
      insights.push(
        `${summary.positiveImpactMailboxes} mailboxes are contributing positively to domain performance`
      );
    }

    if (summary.averageImpactScore >= 70) {
      insights.push("Overall mailbox performance is strong for this domain");
    } else if (summary.averageImpactScore <= 30) {
      insights.push(
        "Domain performance could be improved by optimizing mailbox strategies"
      );
    }

    const topPerformer = mailboxImpactAnalysis[0];
    if (topPerformer && topPerformer.impactScore >= 80) {
      insights.push(`${topPerformer.email} is the top performing mailbox`);
    }

    const poorPerformers = mailboxImpactAnalysis.filter(
      (m: { impactClassification: string }) => m.impactClassification === "NEGATIVE"
    );
    if (poorPerformers.length > 0) {
      insights.push(`${poorPerformers.length} mailboxes may need attention`);
    }

    return insights;
  }, [enrichedData]);

  return {
    data: enrichedData,
    insights,
    rawData: null,
    isLoading,
    error,
    refresh: fetchData,
  };
}

/**
 * Hook for cross-domain correlation insights.
 * Shows how mailbox performance correlates with domain performance.
 */
export function useCrossDomainCorrelation(
  domainIds?: string[],
  filters?: AnalyticsFilters,
  options: {
    enabled?: boolean;
    refreshInterval?: number;
    limit?: number;
  } = {}
) {
  const { enabled = true, refreshInterval = 180000 } = options;

  const [data, setData] = useState<{
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
        formattedCorrelationScore?: string;
      }>;
      overallCorrelation: number;
      formattedOverallCorrelation?: string;
    }>;
    summary: {
      strongCorrelations: number;
      moderateCorrelations: number;
      weakCorrelations: number;
      averageCorrelation: number | string;
      strongCorrelationPercentage?: string;
    };
    formattedSummary?: {
      strongCorrelations: number;
      moderateCorrelations: number;
      weakCorrelations: number;
      averageCorrelation: string;
      strongCorrelationPercentage: string;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch correlation insights
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await getCrossDomainCorrelationAnalysis(domainIds || [], filters);

      if (result.success && result.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData(result.data as any);
      } else {
        setError(result.error?.message || "Failed to get correlation insights");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [domainIds, filters, enabled]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Memoized recommendations
  const recommendations = useMemo(() => {
    if (!data) return [];

    const recommendations: string[] = [];

    if (data.summary.strongCorrelations < data.summary.weakCorrelations) {
      recommendations.push(
        "Consider reviewing mailbox strategies to improve alignment with domain performance"
      );
    }

    const avgCorrelationValue =
      typeof data.summary.averageCorrelation === "string"
        ? parseInt(data.summary.averageCorrelation.replace("%", "")) || 0
        : (data.summary.averageCorrelation as number);

    if (avgCorrelationValue < 50) {
      recommendations.push(
        "Focus on improving mailbox-domain performance correlation through better warmup and sending practices"
      );
    }

    const domainsWithLowCorrelation = data.correlations.filter((d: { overallCorrelation: number }) => d.overallCorrelation < 40);
    if (domainsWithLowCorrelation.length > 0) {
      recommendations.push(
        `Review mailbox performance for domains: ${domainsWithLowCorrelation.map((d: { domainName: string }) => d.domainName).join(", ")}`
      );
    }

    return recommendations;
  }, [data]);

  return {
    data,
    recommendations,
    isLoading,
    error,
    refresh: fetchData,
  };
}

/**
 * Combined hook for comprehensive cross-domain analytics.
 * Provides all cross-domain analytics data with optimized loading.
 */
export function useComprehensiveCrossDomainAnalytics(
  domainIds?: string[],
  mailboxIds?: string[],
  filters?: AnalyticsFilters,
  options: {
    enabled?: boolean;
    includeTimeSeries?: boolean;
    includeImpactAnalysis?: boolean;
    includeCorrelation?: boolean;
    granularity?: "day" | "week" | "month";
  } = {}
) {
  const {
    enabled = true,
    includeTimeSeries = true,
    includeImpactAnalysis = false,
    includeCorrelation = false,
    granularity = "day",
  } = options;

  // Main joined analytics
  const joinedAnalytics = useCrossDomainAnalytics(domainIds, mailboxIds, filters, { enabled });

  // Time series data
  const timeSeriesData = useCrossDomainTimeSeries(
    domainIds,
    mailboxIds,
    filters,
    granularity,
    { enabled: enabled && includeTimeSeries }
  );

  // Impact analysis for first domain (if requested)
  const firstDomainId = domainIds?.[0] || joinedAnalytics.data[0]?.domainId;
  const impactAnalysis = useMailboxDomainImpact(firstDomainId || "", filters, {
    enabled: enabled && includeImpactAnalysis && !!firstDomainId,
  });

  // Correlation insights
  const correlationInsights = useCrossDomainCorrelation(domainIds, filters, {
    enabled: enabled && includeCorrelation,
  });

  // Combined loading state
  const isLoading =
    joinedAnalytics.isLoading ||
    (includeTimeSeries && timeSeriesData.isLoading) ||
    (includeImpactAnalysis && impactAnalysis.isLoading) ||
    (includeCorrelation && correlationInsights.isLoading);

  // Combined error state
  const error =
    joinedAnalytics.error ||
    (includeTimeSeries && timeSeriesData.error) ||
    (includeImpactAnalysis && impactAnalysis.error) ||
    (includeCorrelation && correlationInsights.error);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all(
      [
        joinedAnalytics.refresh(),
        includeTimeSeries && timeSeriesData.refresh(),
        includeImpactAnalysis && impactAnalysis.refresh(),
        includeCorrelation && correlationInsights.refresh(),
      ].filter(Boolean)
    );
  }, [
    joinedAnalytics,
    timeSeriesData,
    impactAnalysis,
    correlationInsights,
    includeTimeSeries,
    includeImpactAnalysis,
    includeCorrelation,
  ]);

  return {
    joinedAnalytics: joinedAnalytics.data,
    timeSeriesData: includeTimeSeries ? timeSeriesData.data : undefined,
    impactAnalysis: includeImpactAnalysis ? impactAnalysis.data : undefined,
    correlationInsights: includeCorrelation ? correlationInsights.data : undefined,
    summary: joinedAnalytics.summary,
    chartData: includeTimeSeries ? timeSeriesData.chartData : undefined,
    insights: includeImpactAnalysis ? impactAnalysis.insights : undefined,
    recommendations: includeCorrelation ? correlationInsights.recommendations : undefined,
    isLoading,
    error,
    lastUpdated: joinedAnalytics.lastUpdated,
    refreshAll,
  };
}
