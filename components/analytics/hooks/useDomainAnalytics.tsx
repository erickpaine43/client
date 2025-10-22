"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DomainAnalytics } from "@/types/analytics/domain-specific";
import { convexDomainAnalytics } from "@/lib/data/analytics-convex.mock";

/**
 * Real-time domain analytics hook using Convex subscriptions.
 * Provides live updates when domain data changes in the database.
 * Falls back to mock data when Convex is not available.
 */
export function useDomainAnalytics(domainIds?: string[], companyId?: string) {
  // Try to use Convex query for real-time data
  const convexData = useQuery(
    api.domainAnalytics?.getDomainAggregatedAnalytics,
    domainIds && companyId ? { domainIds, companyId } : "skip"
  );

  // Transform and memoize the data
  const domains = useMemo(() => {
    // If Convex data is available, use it
    if (convexData && Array.isArray(convexData)) {
      return convexData as DomainAnalytics[];
    }

    // Fall back to mock data for development/demo
    if (domainIds && domainIds.length > 0) {
      return convexDomainAnalytics.filter((domain) =>
        domainIds.includes(domain.domainId)
      );
    }

    // Return all mock data if no specific domains requested
    return convexDomainAnalytics;
  }, [convexData, domainIds]);

  // Determine loading state
  const isLoading = useMemo(() => {
    // If we have domain IDs and company ID but no Convex data yet, we're loading
    if (domainIds && companyId && !convexData) {
      return true;
    }
    return false;
  }, [convexData, domainIds, companyId]);

  // Error handling
  const error = useMemo(() => {
    // For now, we don't have specific error handling from Convex
    // In a real implementation, this would come from the Convex query
    return null;
  }, []);

  return {
    domains,
    isLoading,
    error,
    // Additional helper methods
    refetch: () => {
      console.log("Refetching domain analytics...");
    },
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
      (d) =>
        d.authentication.spf && d.authentication.dkim && d.authentication.dmarc
    ).length;
    const healthyDomains = domains.filter((d) => {
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

    return domains.map((domain) => ({
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
    return domains.map((domain) => ({
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

    const totalSent = domains.reduce((sum, d) => sum + d.sent, 0);
    const totalDelivered = domains.reduce((sum, d) => sum + d.delivered, 0);
    const totalBounced = domains.reduce((sum, d) => sum + d.bounced, 0);
    const totalSpamComplaints = domains.reduce(
      (sum, d) => sum + d.spamComplaints,
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

    const spfCount = domains.filter((d) => d.authentication.spf).length;
    const dkimCount = domains.filter((d) => d.authentication.dkim).length;
    const dmarcCount = domains.filter((d) => d.authentication.dmarc).length;
    const fullyAuthenticatedCount = domains.filter(
      (d) =>
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

    return domains.map((domain) => ({
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
