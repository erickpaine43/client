// ============================================================================
// DOMAIN ANALYTICS SERVICE - Minimal rebuilt for migration baseline
// ============================================================================

import { BaseAnalyticsService } from "./BaseAnalyticsService";
import {
  PerformanceMetrics,
  AnalyticsFilters,
  TimeSeriesDataPoint,
  AnalyticsComputeOptions,
  DataGranularity,
} from "@/types/analytics/core";
import { DomainAnalytics } from "@/types/analytics/domain-specific";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { createAnalyticsConvexHelper, ConvexQueryHelper } from "@/lib/utils/convex-query-helper";

// Local interfaces preserved from original file
export interface DomainHealthMetrics {
  domainId: string;
  domainName: string;
  healthScore: number;
  reputation: number;
  authentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
  deliverabilityMetrics: {
    inboxRate: number;
    spamRate: number;
    bounceRate: number;
    blockRate: number;
  };
  performance: PerformanceMetrics;
}

export interface AuthenticationStatusData {
  domainId: string;
  domainName: string;
  authentication: {
    spf: { status: string; verified: boolean };
    dkim: { status: string; verified: boolean };
    dmarc: { status: string; verified: boolean };
  };
  overallStatus: "FULLY_AUTHENTICATED" | "PARTIALLY_AUTHENTICATED" | "NOT_AUTHENTICATED";
}

export interface AggregatedDomainStats {
  totalDomains: number;
  authenticatedDomains: number;
  healthyDomains: number;
  averageHealthScore: number;
  averageReputation: number;
  authenticationSummary: {
    spfVerified: number;
    dkimVerified: number;
    dmarcVerified: number;
    fullyAuthenticated: number;
  };
  aggregatedMetrics: PerformanceMetrics;
}

// Zero metrics helper
const ZERO_METRICS: PerformanceMetrics = {
  sent: 0,
  delivered: 0,
  opened_tracked: 0,
  clicked_tracked: 0,
  replied: 0,
  bounced: 0,
  unsubscribed: 0,
  spamComplaints: 0,
};

export class DomainAnalyticsService extends BaseAnalyticsService {
  private readonly convex: ConvexHttpClient;
  private readonly convexHelper: ConvexQueryHelper;

  constructor() {
    super("domains");
    this.convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    this.convexHelper = createAnalyticsConvexHelper(this.convex, "DomainAnalyticsService");
  }

  // Get domain health metrics (minimal: return empty list)
  async getDomainHealth(
    _domainIds?: string[],
    filters?: AnalyticsFilters
  ): Promise<DomainHealthMetrics[]> {
    const filterParams: AnalyticsFilters = filters ?? this.createDefaultFilters();
    this.validateFilters(filterParams);

    if (!filterParams.dateRange) {
      return [];
    }

    return this.executeWithCache<DomainHealthMetrics[]>(
      "health",
      [],
      filterParams,
      async () => {
        const companyId = filterParams.companyId || process.env.COMPANY_ID || "default-company";
        const args = {
          domainIds: _domainIds,
          dateRange: filterParams.dateRange,
          companyId,
        };
        const result = await this.convexHelper.query<Array<{
          domainId: string;
          domainName: string;
          aggregatedMetrics: PerformanceMetrics;
          authentication?: { spf: boolean; dkim: boolean; dmarc: boolean };
        }>>(api.domainAnalytics.getDomainAnalytics, args, {
          serviceName: "DomainAnalyticsService",
          methodName: "getDomainHealth"
        });

        return result.map((d): DomainHealthMetrics => {
          const metrics = d.aggregatedMetrics;
          const healthScore = AnalyticsCalculator.calculateHealthScore(metrics);
          const rates = AnalyticsCalculator.calculateAllRates(metrics);
          return {
            domainId: d.domainId,
            domainName: d.domainName,
            healthScore,
            reputation: Math.round((1 - (rates.spamRate + rates.bounceRate) / 2) * 100),
            authentication: d.authentication ?? { spf: false, dkim: false, dmarc: false },
            deliverabilityMetrics: {
              inboxRate: rates.deliveryRate,
              spamRate: rates.spamRate,
              bounceRate: rates.bounceRate,
              blockRate: 0,
            },
            performance: metrics,
          };
        });
      },
      300
    );
  }

  // Get domain performance metrics (aligned to DomainAnalytics)
  async getDomainPerformance(
    _domainIds?: string[],
    filters?: AnalyticsFilters
  ): Promise<DomainAnalytics[]> {
    const filterParams: AnalyticsFilters = filters ?? this.createDefaultFilters();
    this.validateFilters(filterParams);

    // Guard: require dateRange for analytics queries
    if (!filterParams.dateRange) {
      return [];
    }

    return this.executeWithCache<DomainAnalytics[]>(
      "performance",
      [],
      filterParams,
      async () => {
        const companyId = filterParams.companyId || process.env.COMPANY_ID || "default-company";
        const args = {
          domainIds: _domainIds,
          dateRange: filterParams.dateRange,
          companyId,
        };
        const result = await this.convexHelper.query<Array<{
          domainId: string;
          domainName: string;
          aggregatedMetrics: PerformanceMetrics;
          authentication?: { spf: boolean; dkim: boolean; dmarc: boolean };
          updatedAt?: number;
        }>>(api.domainAnalytics.getDomainAnalytics, args, {
          serviceName: "DomainAnalyticsService",
          methodName: "getDomainPerformance"
        });

        // Map to DomainAnalytics shape
        const mapped: DomainAnalytics[] = result.map((d) => ({
          id: d.domainId,
          name: d.domainName,
          updatedAt: d.updatedAt ?? Date.now(),
          domainId: d.domainId,
          domainName: d.domainName,
          authentication: d.authentication ?? { spf: false, dkim: false, dmarc: false },
          aggregatedMetrics: d.aggregatedMetrics,
          ...d.aggregatedMetrics,
        } as unknown as DomainAnalytics));

        return mapped;
      },
      300
    );
  }

  // Get authentication status for domains
  async getAuthenticationStatus(
    _domainIds?: string[]
  ): Promise<AuthenticationStatusData[]> {
    return this.executeWithCache<AuthenticationStatusData[]>(
      "authentication",
      [],
      ({} as AnalyticsFilters),
      async () => {
        const companyId = process.env.COMPANY_ID || "default-company";
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 30);
        const dateRange = {
          start: start.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
        };

        const args = {
          domainIds: _domainIds,
          dateRange,
          companyId,
        };
        const result = await this.convexHelper.query<Array<{
          domainId: string;
          domainName: string;
          authentication?: { spf: boolean; dkim: boolean; dmarc: boolean };
        }>>(api.domainAnalytics.getDomainAnalytics, args, {
          serviceName: "DomainAnalyticsService",
          methodName: "getAuthenticationStatus"
        });

        return result.map((d) => {
          const auth = d.authentication ?? { spf: false, dkim: false, dmarc: false };
          return {
            domainId: d.domainId,
            domainName: d.domainName,
            authentication: {
              spf: { status: auth.spf ? "VERIFIED" : "MISSING", verified: auth.spf },
              dkim: { status: auth.dkim ? "VERIFIED" : "MISSING", verified: auth.dkim },
              dmarc: { status: auth.dmarc ? "VERIFIED" : "MISSING", verified: auth.dmarc },
            },
            overallStatus:
              auth.spf && auth.dkim && auth.dmarc
                ? "FULLY_AUTHENTICATED"
                : auth.spf || auth.dkim || auth.dmarc
                ? "PARTIALLY_AUTHENTICATED"
                : "NOT_AUTHENTICATED",
          };
        });
      },
      300
    );
  }

  // Get time series for domains (minimal: return empty)
  async getTimeSeriesData(
    _domainIds?: string[],
    filters?: AnalyticsFilters,
    granularity: DataGranularity = "day"
  ): Promise<TimeSeriesDataPoint[]> {
    const filterParams: AnalyticsFilters = filters ?? this.createDefaultFilters();
    this.validateFilters(filterParams);

    if (!filterParams.dateRange) {
      return [];
    }

    return this.executeWithCache<TimeSeriesDataPoint[]>(
      "timeseries",
      [],
      { ...filterParams, granularity },
      async () => {
        const companyId = filterParams.companyId || process.env.COMPANY_ID || "default-company";
        // Expect optional per-day records from Convex; if not present, fallback to single point
        const args = {
          domainIds: _domainIds,
          dateRange: filterParams.dateRange,
          companyId,
        };
        const result = await this.convexHelper.query<Array<{
          records?: Array<{
            date: string;
            sent: number;
            delivered: number;
            opened_tracked: number;
            clicked_tracked: number;
            replied: number;
            bounced: number;
            unsubscribed: number;
            spamComplaints: number;
          }>;
          aggregatedMetrics?: PerformanceMetrics;
        }>>(api.domainAnalytics.getDomainAnalytics, args, {
          serviceName: "DomainAnalyticsService",
          methodName: "getTimeSeriesData"
        });

        const byDate = new Map<string, PerformanceMetrics>();
        result.forEach((d) => {
          if (d.records && d.records.length) {
            d.records.forEach((r) => {
              const existing = byDate.get(r.date) || {
                sent: 0,
                delivered: 0,
                opened_tracked: 0,
                clicked_tracked: 0,
                replied: 0,
                bounced: 0,
                unsubscribed: 0,
                spamComplaints: 0,
              } as PerformanceMetrics;
              byDate.set(r.date, {
                sent: existing.sent + r.sent,
                delivered: existing.delivered + r.delivered,
                opened_tracked: existing.opened_tracked + r.opened_tracked,
                clicked_tracked: existing.clicked_tracked + r.clicked_tracked,
                replied: existing.replied + r.replied,
                bounced: existing.bounced + r.bounced,
                unsubscribed: existing.unsubscribed + r.unsubscribed,
                spamComplaints: existing.spamComplaints + r.spamComplaints,
              });
            });
          } else if (d.aggregatedMetrics) {
            // Fallback: place one point at range end with aggregated metrics
            const end = filterParams.dateRange!.end;
            const existing = byDate.get(end) || {
              sent: 0,
              delivered: 0,
              opened_tracked: 0,
              clicked_tracked: 0,
              replied: 0,
              bounced: 0,
              unsubscribed: 0,
              spamComplaints: 0,
            } as PerformanceMetrics;
            const m = d.aggregatedMetrics;
            byDate.set(end, {
              sent: existing.sent + m.sent,
              delivered: existing.delivered + m.delivered,
              opened_tracked: existing.opened_tracked + m.opened_tracked,
              clicked_tracked: existing.clicked_tracked + m.clicked_tracked,
              replied: existing.replied + m.replied,
              bounced: existing.bounced + m.bounced,
              unsubscribed: existing.unsubscribed + m.unsubscribed,
              spamComplaints: existing.spamComplaints + m.spamComplaints,
            });
          }
        });

        return Array.from(byDate.entries())
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(([date, metrics]): TimeSeriesDataPoint => ({
            date,
            label: date,
            metrics,
          }));
      },
      600
    );
  }

  // Overview/aggregated stats (minimal zeros)
  async getAggregatedDomainStats(
    filters?: AnalyticsFilters
  ): Promise<AggregatedDomainStats> {
    const filterParams: AnalyticsFilters = filters ?? this.createDefaultFilters();
    this.validateFilters(filterParams);

    if (!filterParams.dateRange) {
      return {
        totalDomains: 0,
        authenticatedDomains: 0,
        healthyDomains: 0,
        averageHealthScore: 0,
        averageReputation: 0,
        authenticationSummary: {
          spfVerified: 0,
          dkimVerified: 0,
          dmarcVerified: 0,
          fullyAuthenticated: 0,
        },
        aggregatedMetrics: { ...ZERO_METRICS },
      };
    }

    return this.executeWithCache<AggregatedDomainStats>(
      "overview",
      [],
      filterParams,
      async () => {
        const companyId = filterParams.companyId || process.env.COMPANY_ID || "default-company";
        const args: {
          dateRange: { start: string; end: string };
          companyId: string;
        } = {
          dateRange: filterParams.dateRange!,
          companyId,
        };
        const domains = await this.convexHelper.query<Array<{
          domainId: string;
          domainName?: string;
          authentication?: { spf: boolean; dkim: boolean; dmarc: boolean };
          aggregatedMetrics: PerformanceMetrics;
        }>>(api.domainAnalytics.getDomainAnalytics, args, {
          serviceName: "DomainAnalyticsService",
          methodName: "getAggregatedDomainStats"
        });

        const totalDomains = domains.length;
        const authentication = domains.map((d) => d.authentication ?? { spf: false, dkim: false, dmarc: false });
        const authenticatedDomains = authentication.filter((a) => a.spf && a.dkim && a.dmarc).length;

        // Compute health metrics via existing method to ensure parity
        const health = await this.getDomainHealth(domains.map((d) => d.domainId), filterParams);
        const healthyDomains = health.filter((h) => h.healthScore >= 80).length;
        const averageHealthScore = health.length
          ? Math.round(health.reduce((sum, h) => sum + h.healthScore, 0) / health.length)
          : 0;
        const averageReputation = health.length
          ? Math.round(health.reduce((sum, h) => sum + h.reputation, 0) / health.length)
          : 0;

        const authenticationSummary = {
          spfVerified: authentication.filter((a) => a.spf).length,
          dkimVerified: authentication.filter((a) => a.dkim).length,
          dmarcVerified: authentication.filter((a) => a.dmarc).length,
          fullyAuthenticated: authenticatedDomains,
        };

        const aggregatedMetrics = domains.length
          ? domains.map((d) => d.aggregatedMetrics).reduce<PerformanceMetrics>((acc, m) => ({
              sent: acc.sent + m.sent,
              delivered: acc.delivered + m.delivered,
              opened_tracked: acc.opened_tracked + m.opened_tracked,
              clicked_tracked: acc.clicked_tracked + m.clicked_tracked,
              replied: acc.replied + m.replied,
              bounced: acc.bounced + m.bounced,
              unsubscribed: acc.unsubscribed + m.unsubscribed,
              spamComplaints: acc.spamComplaints + m.spamComplaints,
            }), { ...ZERO_METRICS })
          : { ...ZERO_METRICS };

        return {
          totalDomains,
          authenticatedDomains,
          healthyDomains,
          averageHealthScore,
          averageReputation,
          authenticationSummary,
          aggregatedMetrics,
        };
      },
      300
    );
  }

  // Compute analytics on filtered data (minimal zeros)
  async computeAnalyticsForFilteredData(
    filters: AnalyticsFilters,
    _options: AnalyticsComputeOptions = {}
  ): Promise<{
    aggregatedMetrics: PerformanceMetrics;
    rates: ReturnType<typeof DomainAnalyticsService["calcAllRates"]>;
    timeSeriesData?: TimeSeriesDataPoint[];
    healthMetrics?: DomainHealthMetrics[];
    authenticationStatus?: AuthenticationStatusData[];
  }> {
    const filterParams: AnalyticsFilters = filters ?? this.createDefaultFilters();
    this.validateFilters(filterParams);

    if (!filterParams.dateRange) {
      return {
        aggregatedMetrics: { ...ZERO_METRICS },
        rates: DomainAnalyticsService.calcAllRates({ ...ZERO_METRICS }),
      };
    }

    return this.executeWithCache(
      "filtered",
      [],
      filterParams,
      async () => {
        const companyId = filterParams.companyId || process.env.COMPANY_ID || "default-company";
        const args = {
          domainIds: filterParams.entityIds as string[] | undefined,
          dateRange: filterParams.dateRange,
          companyId,
        };
        const result = await this.convexHelper.query<Array<{
          domainId: string;
          domainName: string;
          aggregatedMetrics: PerformanceMetrics;
          authentication?: { spf: boolean; dkim: boolean; dmarc: boolean };
        }>>(api.domainAnalytics.getDomainAnalytics, args, {
          serviceName: "DomainAnalyticsService",
          methodName: "computeAnalyticsForFilteredData"
        });

        const aggregatedMetrics = result.length
          ? result.map((r) => r.aggregatedMetrics).reduce<PerformanceMetrics>((acc, m) => ({
              sent: acc.sent + m.sent,
              delivered: acc.delivered + m.delivered,
              opened_tracked: acc.opened_tracked + m.opened_tracked,
              clicked_tracked: acc.clicked_tracked + m.clicked_tracked,
              replied: acc.replied + m.replied,
              bounced: acc.bounced + m.bounced,
              unsubscribed: acc.unsubscribed + m.unsubscribed,
              spamComplaints: acc.spamComplaints + m.spamComplaints,
            }), { ...ZERO_METRICS })
          : { ...ZERO_METRICS };

        const rates = DomainAnalyticsService.calcAllRates(aggregatedMetrics);

        const response: {
          aggregatedMetrics: PerformanceMetrics;
          rates: ReturnType<typeof DomainAnalyticsService["calcAllRates"]>;
          timeSeriesData?: TimeSeriesDataPoint[];
          healthMetrics?: DomainHealthMetrics[];
          authenticationStatus?: AuthenticationStatusData[];
        } = { aggregatedMetrics, rates };

        // Optional additions based on options
        if (_options.includeTimeSeriesData) {
          response.timeSeriesData = await this.getTimeSeriesData(
            filterParams.entityIds as string[] | undefined,
            filterParams,
            filterParams.granularity || "day"
          );
        }

        if (_options.customMetrics?.includes("health")) {
          response.healthMetrics = await this.getDomainHealth((filterParams).entityIds, filterParams);
        }

        if (_options.customMetrics?.includes("authentication")) {
          response.authenticationStatus = await this.getAuthenticationStatus((filterParams).entityIds);
        }

        return response;
      },
      300
    );
  }

  // Update a single analytics record
  async updateAnalytics(_data: {
    domainId: string;
    domainName: string;
    date: string;
    companyId: string;
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    authentication: {
      spf: boolean;
      dkim: boolean;
      dmarc: boolean;
    };
  }): Promise<string> {
    // Validate metrics
    this.validateMetrics({
      sent: _data.sent,
      delivered: _data.delivered,
      opened_tracked: _data.opened_tracked,
      clicked_tracked: _data.clicked_tracked,
      replied: _data.replied,
      bounced: _data.bounced,
      unsubscribed: _data.unsubscribed,
      spamComplaints: _data.spamComplaints,
    });

    const id = await this.convexHelper.mutation<string>(api.domainAnalytics.upsertDomainAnalytics, _data, {
      serviceName: "DomainAnalyticsService",
      methodName: "updateAnalytics"
    });
    await this.invalidateCache([_data.domainId]);
    return id;
  }

  // Bulk update
  async bulkUpdateAnalytics(_updates: Array<{
    domainId: string;
    domainName: string;
    date: string;
    companyId: string;
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
    authentication: {
      spf: boolean;
      dkim: boolean;
      dmarc: boolean;
    };
  }>): Promise<{
    totalUpdates: number;
    successful: number;
    failed: number;
    results: Array<{ success: boolean; id?: string; error?: string; domainId: string }>;
  }> {
    // Validate all metrics first
    _updates.forEach(u => this.validateMetrics({
      sent: u.sent,
      delivered: u.delivered,
      opened_tracked: u.opened_tracked,
      clicked_tracked: u.clicked_tracked,
      replied: u.replied,
      bounced: u.bounced,
      unsubscribed: u.unsubscribed,
      spamComplaints: u.spamComplaints,
    }));

    const results: Array<{ success: boolean; id?: string; error?: string; domainId: string }> = [];
    for (const update of _updates) {
      try {
        const id = await this.convexHelper.mutation<string>(
          api.domainAnalytics.upsertDomainAnalytics,
          update,
          {
            serviceName: "DomainAnalyticsService",
            methodName: "bulkUpdateAnalytics"
          }
        );
        results.push({ success: true, id: id, domainId: update.domainId });
      } catch (e) {
        results.push({ success: false, error: String(e), domainId: update.domainId });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const domainIds = _updates.map(u => u.domainId);
    await this.invalidateCache(domainIds);

    return {
      totalUpdates: results.length,
      successful,
      failed,
      results,
    };
  }

  // Initialize analytics for a domain
  async initializeDomain(
    _domainId: string,
    _domainName: string,
    _companyId: string,
    _authentication: { spf: boolean; dkim: boolean; dmarc: boolean }
  ): Promise<string> {
    const res = await this.convexHelper.mutation<{ analyticsId: string }>(
      api.domainAnalytics.initializeDomainAnalytics,
      {
        domainId: _domainId,
        domainName: _domainName,
        companyId: _companyId,
        authentication: _authentication,
      },
      {
        serviceName: "DomainAnalyticsService",
        methodName: "initializeDomain"
      }
    );
    await this.invalidateCache([_domainId]);
    return res.analyticsId;
  }

  // Health check via a minimal Convex query
  async healthCheck(): Promise<boolean> {
    try {
      const companyId = process.env.COMPANY_ID || "default-company";
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 7);
      const dateRange = {
        start: start.toISOString().split("T")[0],
        end: today.toISOString().split("T")[0],
      };
      await this.convexHelper.query(
        api.domainAnalytics.getDomainAnalytics,
        { companyId, dateRange },
        {
          serviceName: "DomainAnalyticsService",
          methodName: "healthCheck"
        }
      );
      return true;
    } catch (e) {
      console.error("Health check failed:", e);
      return false;
    }
  }

  // Simple local rate calculator for minimal baseline
  private static calcAllRates(metrics: PerformanceMetrics) {
    const delivered = metrics.delivered || 0;
    const sent = metrics.sent || 0;
    const safeDiv = (a: number, b: number) => (b === 0 ? 0 : a / b);
    return {
      deliveryRate: safeDiv(delivered, sent),
      openRate: safeDiv(metrics.opened_tracked, delivered),
      clickRate: safeDiv(metrics.clicked_tracked, delivered),
      replyRate: safeDiv(metrics.replied, delivered),
      bounceRate: safeDiv(metrics.bounced, sent),
      unsubscribeRate: safeDiv(metrics.unsubscribed, delivered),
      spamRate: safeDiv(metrics.spamComplaints, delivered),
    };
  }
}

// Export singleton instance (preserved API)
export const domainAnalyticsService = new DomainAnalyticsService();
