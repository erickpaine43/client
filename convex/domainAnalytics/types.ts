import type { PerformanceMetrics } from "@/types/analytics/core";

// Interfaces for query arguments and results
export interface GetDomainAnalyticsArgs {
  domainIds?: string[];
  dateRange: {
    start: string;
    end: string;
  };
  companyId: string;
}

export interface DomainAnalyticsResult {
  domainId: string;
  domainName: string;
  companyId: string;
  date: string;
  authentication: Authentication;
  updatedAt: number;
  aggregatedMetrics: PerformanceMetrics;
  records: DomainAnalyticsRecord[];
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}

// Core Interfaces
export interface Authentication {
  dkim: boolean;
  spf: boolean;
  dmarc: boolean;
}

export interface DomainAnalyticsRecord {
  _id: string;
  _creationTime: number;
  domainId: string;
  domainName: string;
  companyId: string;
  date: string;
  updatedAt: number;
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  authentication: Authentication;
  aggregatedMetrics: PerformanceMetrics;
  name?: string;
}

// Aggregation type used in handlers
export interface AggregatedDomainAnalytics {
  domainId: string;
  domainName: string;
  companyId: string;
  updatedAt: number;
  auth: Authentication;
  metrics: PerformanceMetrics;
}
