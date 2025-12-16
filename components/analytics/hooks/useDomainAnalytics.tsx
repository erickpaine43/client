"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DomainAnalytics } from "@/types/analytics/domain-specific";

/**
 * Real-time domain analytics hook using NileDB API.
 * Provides live updates via polling (30-second refresh interval).
 * Fetches data from /api/analytics/domains which queries the OLAP database.
 */
export function useDomainAnalytics(domainIds?: string[], companyId?: string) {
  const [domains, setDomains] = useState<DomainAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (domainIds && domainIds.length > 0) {
        params.append('domainIds', domainIds.join(','));
      }
      if (companyId) {
        params.append('companyId', companyId);
      }

      const response = await fetch(`/api/analytics/domains?${params}`);
      const result = await response.json();

      if (result.success) {
        setDomains(result.data || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch domain analytics');
      }
    } catch (err) {
      console.error('Error fetching domain analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [domainIds, companyId]);

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    domains,
    isLoading,
    error,
    // Additional helper methods
    refetch: fetchData,
    isEmpty: domains.length === 0,
    totalDomains: domains.length,
  };
}

/**
 * Hook for domain health monitoring with real-time updates.
 */
export function useDomainHealthMonitoring(domainIds?: string[]) {
  const { domains, isLoading, error } = useDomainAnalytics(domainIds);

  const healthMetrics = useMemo(() => {
    if (!domains || domains.length === 0) return null;

    const totalDomains = domains.length;
    const authenticatedDomains = domains.filter(
      (d: DomainAnalytics) =>
        d.authentication.spf && d.authentication.dkim && d.authentication.dmarc
    ).length;
    const healthyDomains = domains.filter((d: DomainAnalytics) => {
      // Calculate health score based on performance
      const deliveryRate = d.delivered / (d.sent || 1);
      const bounceRate = d.bounced / (d.sent || 1);
      const spamRate = d.spamComplaints / (d.delivered || 1);

      return deliveryRate >= 0.95 && bounceRate <= 0.02 && spamRate <= 0.001;
    }).length;

    return {
      totalDomains,
      authenticatedDomains,
      healthyDomains,
      authenticationRate:
        totalDomains > 0 ? authenticatedDomains / totalDomains : 0,
      healthRate: totalDomains > 0 ? healthyDomains / totalDomains : 0,
    };
  }, [domains]);

  const authenticationStatus = useMemo(() => {
    if (!domains || domains.length === 0) return null;

    return domains.map((domain: DomainAnalytics) => ({
      domainId: domain.domainId,
      domainName: domain.domainName,
      spf: domain.authentication.spf,
      dkim: domain.authentication.dkim,
      dmarc: domain.authentication.dmarc,
      allAuthenticated:
        domain.authentication.spf &&
        domain.authentication.dkim &&
        domain.authentication.dmarc,
    }));
  }, [domains]);

  const summary = useMemo(() => {
    if (!healthMetrics) return null;

    return {
      totalDomains: healthMetrics.totalDomains,
      healthyDomains: healthMetrics.healthyDomains,
      authenticatedDomains: healthMetrics.authenticatedDomains,
      needsAttention: healthMetrics.totalDomains - healthMetrics.healthyDomains,
    };
  }, [healthMetrics]);

  return {
    domains,
    healthMetrics,
    authenticationStatus,
    summary,
    isLoading,
    error,
    isEmpty: domains.length === 0,
  };
}

/**
 * Hook for domain performance charts with time series data.
 */
export function useDomainPerformanceCharts(
  domainIds?: string[],
) {
  const { domains, isLoading, error } = useDomainAnalytics(domainIds);

  const timeSeriesData = useMemo(() => {
    if (!domains || domains.length === 0) return [];

    // Transform domain data to time series format
    return domains.map((domain: DomainAnalytics) => ({
      date: domain.updatedAt
        ? new Date(domain.updatedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      label: domain.domainName,
      metrics: {
        sent: domain.sent,
        delivered: domain.delivered,
        opened_tracked: domain.opened_tracked,
        clicked_tracked: domain.clicked_tracked,
        replied: domain.replied,
        bounced: domain.bounced,
        unsubscribed: domain.unsubscribed,
        spamComplaints: domain.spamComplaints,
      },
    }));
  }, [domains]);

  const summary = useMemo(() => {
    if (!domains || domains.length === 0) return null;

    const totalSent = domains.reduce((sum: number, d: DomainAnalytics) => sum + d.sent, 0);
    const totalDelivered = domains.reduce((sum: number, d: DomainAnalytics) => sum + d.delivered, 0);
    const totalBounced = domains.reduce((sum: number, d: DomainAnalytics) => sum + d.bounced, 0);
    const totalSpamComplaints = domains.reduce(
      (sum: number, d: DomainAnalytics) => sum + d.spamComplaints,
      0
    );

    return {
      totalSent,
      totalDelivered,
      deliveryRate: totalSent > 0 ? totalDelivered / totalSent : 0,
      bounceRate: totalSent > 0 ? totalBounced / totalSent : 0,
      spamRate: totalDelivered > 0 ? totalSpamComplaints / totalDelivered : 0,
    };
  }, [domains]);

  return {
    timeSeriesData,
    summary,
    isTimeSeriesLoading: isLoading,
    error,
    isEmpty: timeSeriesData.length === 0,
  };
}

/**
 * Hook for domain authentication dashboard.
 */
export function useDomainAuthenticationDashboard(domainIds?: string[]) {
  const { domains, isLoading, error } = useDomainAnalytics(domainIds);

  const authenticationSummary = useMemo(() => {
    if (!domains || domains.length === 0) return null;

    const spfCount = domains.filter((d: DomainAnalytics) => d.authentication.spf).length;
    const dkimCount = domains.filter((d: DomainAnalytics) => d.authentication.dkim).length;
    const dmarcCount = domains.filter((d: DomainAnalytics) => d.authentication.dmarc).length;
    const fullyAuthenticatedCount = domains.filter(
      (d: DomainAnalytics) =>
        d.authentication.spf && d.authentication.dkim && d.authentication.dmarc
    ).length;

    return {
      totalDomains: domains.length,
      spfConfigured: spfCount,
      dkimConfigured: dkimCount,
      dmarcConfigured: dmarcCount,
      fullyAuthenticated: fullyAuthenticatedCount,
      spfRate: domains.length > 0 ? spfCount / domains.length : 0,
      dkimRate: domains.length > 0 ? dkimCount / domains.length : 0,
      dmarcRate: domains.length > 0 ? dmarcCount / domains.length : 0,
      authenticationRate:
        domains.length > 0 ? fullyAuthenticatedCount / domains.length : 0,
    };
  }, [domains]);

  const domainDetails = useMemo(() => {
    if (!domains || domains.length === 0) return [];

    return domains.map((domain: DomainAnalytics) => ({
      ...domain,
      authenticationScore: [
        domain.authentication.spf,
        domain.authentication.dkim,
        domain.authentication.dmarc,
      ].filter(Boolean).length,
      isFullyAuthenticated:
        domain.authentication.spf &&
        domain.authentication.dkim &&
        domain.authentication.dmarc,
    }));
  }, [domains]);

  return {
    authenticationSummary,
    domainDetails,
    isLoading,
    error,
    isEmpty: domains.length === 0,
  };
}
