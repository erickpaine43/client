// ============================================================================
// BILLING ANALYTICS TYPES
// ============================================================================

/**
 * Database record structure for billing analytics
 */
export interface BillingAnalyticsRecord {
  _id: string;
  companyId: string;
  date: string;
  planType: string;
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  domainsLimit: number;
  mailboxesUsed: number;
  mailboxesLimit: number;
  currentPeriodCost: number;
  projectedCost: number;
  currency: string;
  updatedAt: number;
}

/**
 * Usage metrics structure
 */
export interface UsageMetrics {
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  domainsLimit: number;
  mailboxesUsed: number;
  mailboxesLimit: number;
}

/**
 * Cost metrics structure
 */
export interface CostMetrics {
  currentPeriodCost: number;
  projectedCost: number;
  currency: string;
}

/**
 * Combined billing data for mutations
 */
export interface BillingData {
  companyId: string;
  date: string;
  planType: string;
  usage: UsageMetrics;
  costs: CostMetrics;
}

/**
 * Date range structure
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Granularity options for time series
 */
export type Granularity = "day" | "week" | "month";

/**
 * Alert thresholds
 */
export interface AlertThresholds {
  emailsWarning?: number;
  emailsCritical?: number;
  domainsWarning?: number;
  mailboxesWarning?: number;
}

/**
 * Usage alert structure
 */
export interface UsageAlert {
  type: "warning" | "critical";
  resource: "emails" | "domains" | "mailboxes";
  message: string;
  usage: number;
  limit: number;
  percentage: number;
}

/**
 * Cost trend types
 */
export type CostTrend = "increasing" | "decreasing" | "stable";

/**
 * Plan limits for initialization
 */
export interface PlanLimits {
  emailsLimit: number;
  domainsLimit: number;
  mailboxesLimit: number;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: string;
  label: string;
  usage: UsageMetrics;
  costs: CostMetrics;
  planType: string;
}

/**
 * Current usage metrics result (transformed from DB record)
 */
export interface CurrentUsageMetrics {
  companyId: string;
  planType: string;
  usage: UsageMetrics;
  costs: CostMetrics;
  date: string;
  updatedAt: number;
}

/**
 * Cost analytics result
 */
export interface CostAnalyticsResult {
  totalCost: number;
  averageDailyCost: number;
  projectedMonthlyCost: number;
  costTrend: CostTrend;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dataPoints: number;
  trendPercentage: number;
}

/**
 * Usage alerts result
 */
export interface UsageAlertsResult {
  alerts: UsageAlert[];
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  currentUsage: BillingAnalyticsRecord | null;
  thresholds: Required<AlertThresholds>;
  generatedAt: number;
}

/**
 * Billing analytics result
 */
export interface BillingAnalyticsResult {
  analytics: BillingAnalyticsRecord[];
  currentUsage: BillingAnalyticsRecord | null;
  dateRange: DateRange;
  totalRecords: number;
}

/**
 * Bulk update result
 */
export interface BulkUpdateResult {
  success: boolean;
  id?: string;
  error?: string;
  companyId: string;
}

/**
 * Bulk update response
 */
export interface BulkUpdateResponse {
  totalUpdates: number;
  successful: number;
  failed: number;
  results: BulkUpdateResult[];
}

/**
 * Initialize billing response
 */
export interface InitializeBillingResponse {
  billingId: string;
  companyId: string;
  planType: string;
  initializedAt: number;
}
