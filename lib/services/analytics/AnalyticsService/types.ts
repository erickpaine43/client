// ============================================================================
// ANALYTICS SERVICE TYPES - Type definitions for AnalyticsService module
// ============================================================================

import { AnalyticsDomain } from "@/types/analytics/ui";
import { AnalyticsError } from "../BaseAnalyticsService";

/**
 * Overview metrics aggregated across all domains.
 * Represents the high-level analytics summary displayed on dashboards.
 */
export interface OverviewMetrics {
  /** Total number of emails sent across all domains */
  totalEmailsSent: number;
  /** Overall open rate percentage across all domains */
  overallOpenRate: number;
  /** Overall click rate percentage across all domains */
  overallClickRate: number;
  /** Overall reply rate percentage across all domains */
  overallReplyRate: number;
  /** Overall delivery rate percentage across all domains */
  overallDeliveryRate: number;
  /** Number of currently active campaigns */
  activeCampaigns: number;
  /** Number of currently active mailboxes */
  activeMailboxes: number;
  /** Total number of domains configured */
  totalDomains: number;
  /** Total number of leads in the system */
  totalLeads: number;
  /** Calculated health score for the overall analytics system */
  healthScore: number;
  /** Name of the top-performing campaign */
  topPerformingCampaign: string;
  /** Name of the top-performing mailbox */
  topPerformingMailbox: string;
  /** Timestamp when this data was last updated */
  lastUpdated: number;
}

/**
 * Domain service health status for monitoring and diagnostics.
 * Tracks the operational health of individual analytics domain services.
 */
export interface DomainServiceHealth {
  /** Whether the domain service is currently healthy */
  isHealthy: boolean;
  /** Timestamp of the last health check */
  lastChecked: number;
  /** Number of consecutive error occurrences */
  errorCount: number;
  /** Description of the last error encountered, if any */
  lastError?: string;
}

/**
 * Result of cross-domain operations that may involve multiple services.
 * Provides detailed information about partial failures and individual domain results.
 */
export interface CrossDomainOperationResult<T> {
  /** Overall success status of the cross-domain operation */
  success: boolean;
  /** Aggregated data from all domains, if operation succeeded */
  data?: T;
  /** Per-domain error information, null indicates success for that domain */
  errors: Record<AnalyticsDomain, string | null>;
  /** Whether the operation experienced partial failure (some domains failed) */
  partialFailure: boolean;
}

/**
 * Health check result providing comprehensive system status.
 * Used for monitoring dashboards and automated health monitoring systems.
 */
export interface DetailedHealthCheckResult {
  /** Overall system health status */
  status: "healthy" | "degraded" | "unhealthy";
  /** Health status for each individual domain service */
  services: Record<AnalyticsDomain, boolean>;
  /** Cache system availability status */
  cache: boolean;
  /** Timestamp when the health check was performed */
  timestamp: number;
  /** Detailed health information for each domain */
  details: Record<AnalyticsDomain, DomainServiceHealth>;
}

/**
 * Analytics service configuration information.
 * Provides metadata about the service setup and capabilities.
 */
export interface AnalyticsServiceConfiguration {
  /** Whether caching is enabled and available */
  cacheEnabled: boolean;
  /** List of supported analytics domains */
  domains: AnalyticsDomain[];
}

/**
 * Type for the log operation function used throughout the analytics service
 */
export type AnalyticsLogOperation = (
  operation: string,
  params: string[],
  duration: number,
  success: boolean,
  error?: AnalyticsError
) => void;

/**
 * Type for cache TTL (Time To Live) values
 * Can be a number of seconds or a function that returns a number of seconds
 */
export type CacheTTL = number | ((...args: unknown[]) => number);
