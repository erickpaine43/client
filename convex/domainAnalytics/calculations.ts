import type { PerformanceMetrics } from "@/types/analytics/core";
import type { DomainAnalyticsRecord, DomainAnalyticsResult, AggregatedDomainAnalytics, Authentication } from "./types";

type InputDomainAnalyticsRecord = {
  _id: string;
  _creationTime: number;
  domainId: string;
  domainName: string;
  companyId: string;
  date: string;
  updatedAt: number;
  authentication: Authentication;
  sent?: number;
  delivered?: number;
  opened_tracked?: number;
  clicked_tracked?: number;
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  spamComplaints?: number;
  aggregatedMetrics?: PerformanceMetrics;
  name?: string;
};

/**
 * Create zero metrics for initialization
 */
export function createZeroMetrics(): PerformanceMetrics {
  return {
    sent: 0,
    delivered: 0,
    opened_tracked: 0,
    clicked_tracked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
    spamComplaints: 0,
  };
}

/**
 * Validate and prepare domain analytics records with proper aggregatedMetrics
 */
export function validateAndPrepareRecords(records: InputDomainAnalyticsRecord[]): DomainAnalyticsRecord[] {
  return records.map(record => ({
    ...record,
    aggregatedMetrics: 'aggregatedMetrics' in record ? record.aggregatedMetrics : {
      sent: record.sent || 0,
      delivered: record.delivered || 0,
      opened_tracked: record.opened_tracked || 0,
      clicked_tracked: record.clicked_tracked || 0,
      replied: record.replied || 0,
      bounced: record.bounced || 0,
      unsubscribed: record.unsubscribed || 0,
      spamComplaints: record.spamComplaints || 0,
    }
  })) as DomainAnalyticsRecord[];
}

/**
 * Aggregate domain analytics records into domain groups
 */
export function aggregateDomainAnalytics(records: DomainAnalyticsRecord[]): DomainAnalyticsResult[] {
  const domainGroups = new Map<string, DomainAnalyticsResult>();

  for (const record of records) {
    const domainId = record.domainId;

    if (!domainGroups.has(domainId)) {
      domainGroups.set(domainId, {
        domainId: record.domainId,
        domainName: record.domainName,
        companyId: record.companyId,
        date: record.date,
        authentication: {
          spf: record.authentication.spf,
          dkim: record.authentication.dkim,
          dmarc: record.authentication.dmarc,
        },
        updatedAt: record.updatedAt,
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
        aggregatedMetrics: {
          sent: 0,
          delivered: 0,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        },
        records: [],
      });
    }

    const domainGroup = domainGroups.get(domainId)!;
    domainGroup.records.push(record);

    // Update aggregated metrics
    domainGroup.sent += record.sent;
    domainGroup.delivered += record.delivered;
    domainGroup.opened_tracked += record.opened_tracked;
    domainGroup.clicked_tracked += record.clicked_tracked;
    domainGroup.replied += record.replied;
    domainGroup.bounced += record.bounced;
    domainGroup.unsubscribed += record.unsubscribed;
    domainGroup.spamComplaints += record.spamComplaints;

    domainGroup.aggregatedMetrics.sent += record.sent;
    domainGroup.aggregatedMetrics.delivered += record.delivered;
    domainGroup.aggregatedMetrics.opened_tracked += record.opened_tracked;
    domainGroup.aggregatedMetrics.clicked_tracked += record.clicked_tracked;
    domainGroup.aggregatedMetrics.replied += record.replied;
    domainGroup.aggregatedMetrics.bounced += record.bounced;
    domainGroup.aggregatedMetrics.unsubscribed += record.unsubscribed;
    domainGroup.aggregatedMetrics.spamComplaints += record.spamComplaints;
  }

  return Array.from(domainGroups.values());
}

/**
 * Aggregate domain analytics into simplified aggregated format
 */
export function aggregateAggregatedDomainAnalytics(records: DomainAnalyticsRecord[]): AggregatedDomainAnalytics[] {
  const map = new Map<string, AggregatedDomainAnalytics>();

  for (const r of records) {
    const existing = map.get(r.domainId);
    if (!existing) {
      map.set(r.domainId, {
        domainId: r.domainId,
        domainName: r.domainName,
        companyId: r.companyId,
        updatedAt: r.updatedAt,
        auth: r.authentication,
        metrics: {
          sent: r.sent,
          delivered: r.delivered,
          opened_tracked: r.opened_tracked,
          clicked_tracked: r.clicked_tracked,
          replied: r.replied,
          bounced: r.bounced,
          unsubscribed: r.unsubscribed,
          spamComplaints: r.spamComplaints,
        },
      });
    } else {
      existing.metrics.sent += r.sent;
      existing.metrics.delivered += r.delivered;
      existing.metrics.opened_tracked += r.opened_tracked;
      existing.metrics.clicked_tracked += r.clicked_tracked;
      existing.metrics.replied += r.replied;
      existing.metrics.bounced += r.bounced;
      existing.metrics.unsubscribed += r.unsubscribed;
      existing.metrics.spamComplaints += r.spamComplaints;
      if (r.updatedAt > existing.updatedAt) {
        existing.updatedAt = r.updatedAt;
        existing.auth = r.authentication;
        existing.domainName = r.domainName;
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Convert aggregated domain analytics to domain analytics compatible format
 */
export function convertAggregatedToDomainAnalytics(aggregated: AggregatedDomainAnalytics[]) {
  return aggregated.map((d) => ({
    id: d.domainId,
    name: d.domainName,
    updatedAt: d.updatedAt,
    sent: d.metrics.sent,
    delivered: d.metrics.delivered,
    opened_tracked: d.metrics.opened_tracked,
    clicked_tracked: d.metrics.clicked_tracked,
    replied: d.metrics.replied,
    bounced: d.metrics.bounced,
    unsubscribed: d.metrics.unsubscribed,
    spamComplaints: d.metrics.spamComplaints,
    domainId: d.domainId,
    domainName: d.domainName,
    authentication: {
      spf: d.auth.spf,
      dkim: d.auth.dkim,
      dmarc: d.auth.dmarc,
    },
    aggregatedMetrics: { ...d.metrics },
  }));
}
