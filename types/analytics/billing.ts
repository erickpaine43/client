// ============================================================================
// BILLING ANALYTICS TYPES - Centralized billing analytics type definitions
// ============================================================================

import { BaseAnalytics } from "./core";

/**
 * Core billing analytics data structure (extends BaseAnalytics).
 * Contains raw billing data without UI formatting.
 */
export interface BillingAnalytics extends BaseAnalytics {
  /** Company ID */
  companyId: string;
  /** Plan type */
  planType: string;
  /** Usage metrics */
  usage: UsageData;
  /** Cost metrics */
  costs: CostData;
}

/**
 * Usage data structure for billing analytics.
 * Represents current usage against limits.
 */
export interface UsageData {
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  domainsLimit: number;
  mailboxesUsed: number;
  mailboxesLimit: number;
}

/**
 * Cost data structure for billing analytics.
 * Represents financial metrics for the current period.
 */
export interface CostData {
  currentPeriod: number;
  projectedCost: number;
  currency: string;
}

/**
 * Usage metrics interface for billing analytics operations.
 * Includes calculated percentages for UI display.
 */
export interface UsageMetrics {
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  domainsLimit: number;
  mailboxesUsed: number;
  mailboxesLimit: number;
  usagePercentages: UsagePercentages;
}

/**
 * Usage percentages for different resource types.
 */
export interface UsagePercentages {
  emails: number;
  domains: number;
  mailboxes: number;
}

/**
 * Cost analytics interface for billing tracking and projections.
 */
export interface CostAnalytics {
  totalCost: number;
  averageDailyCost: number;
  projectedMonthlyCost: number;
  costTrend: CostTrend;
  currency: string;
  periodStart: string;
  periodEnd: string;
  trendPercentage: number;
}

/**
 * Cost trend indicators.
 */
export type CostTrend = "increasing" | "decreasing" | "stable";

/**
 * Plan utilization data for billing analytics.
 * Provides insights into plan usage and recommendations.
 */
export interface PlanUtilizationData {
  planType: string;
  utilizationPercentages: UtilizationPercentages;
  recommendations: string[];
  isOverLimit: boolean;
  daysUntilReset?: number;
}

/**
 * Utilization percentages for different resources and overall.
 */
export interface UtilizationPercentages {
  emails: number;
  domains: number;
  mailboxes: number;
  overall: number;
}

/**
 * Usage limit alert for monitoring resource consumption.
 */
export interface UsageLimitAlert {
  type: AlertType;
  resource: ResourceType;
  message: string;
  usage: number;
  limit: number;
  percentage: number;
}

/**
 * Alert severity types.
 */
export type AlertType = "warning" | "critical";

/**
 * Resource types that can trigger alerts.
 */
export type ResourceType = "emails" | "domains" | "mailboxes";

/**
 * Usage limit alerts response structure.
 */
export interface UsageLimitAlertsResponse {
  alerts: UsageLimitAlert[];
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
}

/**
 * Billing analytics time series data point.
 * Represents billing metrics over time for trend analysis.
 */
export interface BillingTimeSeriesDataPoint {
  date: string;
  label: string;
  usage: TimeSeriesUsageData;
  costs: TimeSeriesCostData;
  planType: string;
}

/**
 * Usage data for time series analysis.
 */
export interface TimeSeriesUsageData {
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  mailboxesUsed: number;
}

/**
 * Cost data for time series analysis.
 */
export interface TimeSeriesCostData {
  currentPeriod: number;
  projectedCost: number;
  currency: string;
}

/**
 * Billing analytics update data structure.
 * Used for updating billing analytics records.
 */
export interface BillingAnalyticsUpdateData {
  companyId: string;
  date: string;
  planType: string;
  usage: UsageData;
  costs: CostData;
}

/**
 * Plan limits configuration for billing initialization.
 */
export interface PlanLimits {
  emailsLimit: number;
  domainsLimit: number;
  mailboxesLimit: number;
}

/**
 * Billing analytics initialization data.
 */
export interface BillingAnalyticsInitData {
  companyId: string;
  planType: string;
  planLimits: PlanLimits;
  currency?: string;
}

/**
 * Usage limit alert thresholds configuration.
 */
export interface AlertThresholds {
  emailsWarning?: number;
  emailsCritical?: number;
  domainsWarning?: number;
  mailboxesWarning?: number;
}

/**
 * Migration result for legacy billing data.
 */
export interface BillingMigrationResult {
  successful: number;
  failed: number;
  errors: string[];
}

/**
 * Batch operation result for billing analytics.
 */
export interface BillingBatchResult {
  successful: number;
  failed: number;
  results: BillingOperationResult[];
}

/**
 * Individual operation result in batch operations.
 */
export interface BillingOperationResult {
  success: boolean;
  error?: string;
}
