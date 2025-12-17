// ============================================================================
// ANALYTICS MAPPERS - Bridge between legacy and core analytics data structures
// ============================================================================

import { AnalyticsFilters, PerformanceMetrics, TimeSeriesDataPoint } from "@/types/analytics/core";
import { CalculatedRates } from "@/types/analytics/core";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import type { DataGranularity } from "@/types/analytics/core";

/**
 * Convert core AnalyticsFilters to legacy service filter format expected by MailboxAnalyticsService.
 *
 * Maps:
 * - dateRange: {start, end} (unchanged)
 * - entityIds → mailboxes (array of mailbox IDs)
 * - additionalFilters.companyId → companyId
 *
 * @param filters Core analytics filters
 * @param mailboxIds Optional override for mailboxes array
 * @param granularity Optional DataGranularity for specific contexts
 * @returns Legacy filter format for MailboxAnalyticsService
 */
export function convertFiltersToLegacy(
  filters: AnalyticsFilters,
  mailboxIds?: string[],
  granularity?: DataGranularity
): {
  dateRange: { start: string; end: string };
  mailboxes?: string[];
  companyId: string;
  granularity?: DataGranularity;
} {
  const companyId = safeExtractCompanyId(filters, 'default');

  return {
    dateRange: filters.dateRange || { start: '', end: '' },
    mailboxes: mailboxIds ?? filters.entityIds ?? [],
    companyId,
    granularity,
  };
}

/**
 * Convert legacy flattened performance metrics to core PerformanceMetrics.
 *
 * Maps flattened fields (sent, delivered, opened_tracked, etc.) to nested core structure.
 * Handles missing fields by defaulting to 0.
 *
 * @param legacyRow Legacy row with flattened metric fields
 * @returns Core PerformanceMetrics interface
 */
export function toCorePerformanceMetrics(legacyRow: unknown): PerformanceMetrics {
  if (!legacyRow || typeof legacyRow !== 'object') {
    return createEmptyPerformanceMetrics();
  }

  const row = legacyRow as Record<string, unknown>;

  // Map legacy flattened fields to core PerformanceMetrics
  return {
    sent: Number(row.sent ?? 0),
    delivered: Number(row.delivered ?? 0),
    opened_tracked: Number(row.opened_tracked ?? row.opens ?? 0),
    clicked_tracked: Number(row.clicked_tracked ?? row.clicks ?? 0),
    replied: Number(row.replied ?? 0),
    bounced: Number(row.bounced ?? row.bounces ?? 0),
    unsubscribed: Number(row.unsubscribed ?? 0),
    spamComplaints: Number(row.spamComplaints ?? row.spamFlags ?? 0),
  };
}

/**
 * Convert legacy time series point to core TimeSeriesDataPoint.
 *
 * Handles legacy flattened format (sent/opens/clicks/bounces) → core nested format ({metrics: PerformanceMetrics}).
 * Also handles cases where metrics object is already present.
 *
 * @param legacyPoint Legacy time series point with flattened or mixed fields
 * @returns Core TimeSeriesDataPoint interface
 */
export function mapLegacySeriesToCore(legacyPoint: unknown): TimeSeriesDataPoint {
  if (!legacyPoint || typeof legacyPoint !== 'object') {
    return {
      date: '',
      label: '',
      metrics: createEmptyPerformanceMetrics(),
    };
  }

  const point = legacyPoint as Record<string, unknown>;

  // Check if metrics object already exists (core format)
  if (point.metrics && typeof point.metrics === 'object') {
    return {
      date: String(point.date ?? ''),
      label: String(point.label ?? ''),
      metrics: toCorePerformanceMetrics(point.metrics),
    };
  }

  // Convert from legacy flattened format to core format
  return {
    date: String(point.date ?? ''),
    label: String(point.label ?? ''),
    metrics: toCorePerformanceMetrics(point),
  };
}

/**
 * Safely extract companyId from filters, handling various formats.
 *
 * Checks:
 * 1. filters.companyId (edge case)
 * 2. filters.additionalFilters?.companyId
 * 3. unknown object structure with safety checks
 *
 * @param filtersOrUnknown Core AnalyticsFilters or unknown object
 * @param fallback Default value if companyId cannot be extracted
 * @returns Extracted companyId or fallback
 */
export function safeExtractCompanyId(
  filtersOrUnknown: unknown,
  fallback: string = "default"
): string {
  if (!filtersOrUnknown) return fallback;

  // Try normal AnalyticsFilters structure first
  const filters = filtersOrUnknown as Partial<AnalyticsFilters>;
  if (filters.additionalFilters &&
      typeof filters.additionalFilters === 'object' &&
      filters.additionalFilters.companyId &&
      typeof filters.additionalFilters.companyId === 'string') {
    return filters.additionalFilters.companyId;
  }

  // Fallback for unknown/legacy structures and direct companyId property
  const unknown = filtersOrUnknown as Record<string, unknown>;
  if (unknown.companyId && typeof unknown.companyId === 'string') {
    return unknown.companyId;
  }

  if (unknown.additionalFilters &&
      typeof unknown.additionalFilters === 'object') {
    const af = unknown.additionalFilters as Record<string, unknown>;
    if (af.companyId && typeof af.companyId === 'string') {
      return af.companyId;
    }
  }

  return fallback;
}

/**
 * Convert legacy MailboxPerformanceData to standardized format.
 *
 * Uses safe extraction and defaults missing numeric fields to 0.
 * Combines with core PerformanceMetrics mapping.
 *
 * @param legacy MailboxPerformanceData in legacy format
 * @returns Standardized mailbox performance object
 */
export function normalizeMailboxPerformanceRow(legacy: unknown): {
  mailboxId: string;
  email: string;
  domain: string;
  provider: string;
  warmupStatus: string;
  warmupProgress: number;
  dailyLimit: number;
  currentVolume: number;
  healthScore: number;
  performanceMetrics: PerformanceMetrics;
} {
  if (!legacy || typeof legacy !== 'object') {
    throw new Error('Invalid mailbox performance data');
  }

  const row = legacy as Record<string, unknown>;

  return {
    mailboxId: String(row.mailboxId ?? ''),
    email: String(row.email ?? ''),
    domain: String(row.domain ?? ''),
    provider: String(row.provider ?? ''),
    warmupStatus: String(row.warmupStatus ?? 'UNKNOWN'),
    warmupProgress: Number(row.warmupProgress ?? 0),
    dailyLimit: Number(row.dailyLimit ?? 0),
    currentVolume: Number(row.currentVolume ?? 0),
    healthScore: Number(row.healthScore ?? 0),
    performanceMetrics: toCorePerformanceMetrics(row),
  };
}

/**
 * Create empty PerformanceMetrics with all fields set to 0.
 *
 * @returns Zero-initialized PerformanceMetrics
 */
function createEmptyPerformanceMetrics(): PerformanceMetrics {
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
 * Validate that filters have required date range before calling service.
 *
 * @param filters AnalyticsFilters to validate
 * @throws Error if dateRange is missing or invalid
 */
export function validateFiltersBeforeCall(filters: AnalyticsFilters): void {
  if (!filters.dateRange) {
    throw new Error('DateRange is required in analytics filters');
  }

  const start = new Date(filters.dateRange.start);
  const end = new Date(filters.dateRange.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date range format');
  }

  if (start > end) {
    throw new Error('Start date must be before or equal to end date');
  }
}

/**
 * Compatibility layer: Calculate rates for core PerformanceMetrics using existing AnalyticsCalculator.
 *
 * Since AnalyticsCalculator expects legacy PerformanceMetrics (with pre-calculated rates),
 * this function provides a bridge to use it with core PerformanceMetrics.
 *
 * @param metrics Core PerformanceMetrics
 * @returns CalculatedRates using AnalyticsCalculator
 */
export function calculateRatesForCoreMetrics(metrics: PerformanceMetrics): CalculatedRates {
  return AnalyticsCalculator.calculateAllRates(metrics as unknown as PerformanceMetrics);
}

/**
 * Compatibility layer: Calculate health score for core PerformanceMetrics.
 *
 * @param metrics Core PerformanceMetrics
 * @returns Health score using AnalyticsCalculator
 */
export function calculateHealthScoreForCoreMetrics(metrics: PerformanceMetrics): number {
  return AnalyticsCalculator.calculateHealthScore(metrics as unknown as PerformanceMetrics);
}

/**
 * Convert legacy flattend series format to core TimeSeriesDataPoint.
 *
 * @param legacyArray Array of legacy time series points
 * @returns Array of core TimeSeriesDataPoint
 */
export function mapLegacySeriesArrayToCore(legacyArray: unknown[]): TimeSeriesDataPoint[] {
  if (!Array.isArray(legacyArray)) return [];

  return legacyArray.map(mapLegacySeriesToCore);
}

/**
 * Safe getter that returns default value for undefined/null values.
 *
 * @param value Value to safely extract
 * @param defaultValue Default if value is null/undefined
 * @param typeGuard Optional type check function
 * @returns Safe value or default
 */
export function safeGet<T>(
  value: unknown,
  defaultValue: T,
  typeGuard?: (val: unknown) => val is T
): T {
  if (value == null) {
    return defaultValue;
  }

  if (typeGuard && !typeGuard(value)) {
    return defaultValue;
  }

  return value as T;
}

// ---------------------------------------------------------------------------
// Mailbox mappers: map new service return types to legacy UI shapes
// ---------------------------------------------------------------------------

import type {
  MailboxPerformanceData as ServiceMailboxPerformanceData,
  WarmupAnalyticsData as ServiceWarmupAnalyticsData,
} from "@/lib/services/analytics/MailboxAnalyticsService";

import type {
  MailboxAnalyticsData as LegacyMailboxAnalyticsData,
  WarmupChartData as LegacyWarmupChartData,
} from "@/types/analytics";

// Domain-specific type import
import type { MailboxAnalytics as DomainMailboxAnalytics } from "@/types/analytics/domain-specific";

/**
 * Map service MailboxPerformanceData to legacy MailboxAnalyticsData used by UI components.
 * This is intentionally explicit to avoid unsafe casting across incompatible shapes.
 */
export function mapServiceMailboxToLegacy(
  svc: ServiceMailboxPerformanceData,
  warmup?: ServiceWarmupAnalyticsData | null
): LegacyMailboxAnalyticsData {
  return {
    mailboxId: svc.mailboxId,
    warmupProgress: svc.warmupProgress ?? 0,
    totalWarmups: warmup?.totalWarmups ?? 0,
    spamFlags: warmup?.spamComplaints ?? warmup?.spamComplaints ?? 0,
    replies: warmup?.replies ?? 0,
    healthScore: svc.healthScore ?? 0,
    lastUpdated: new Date(),
    // preserve core metrics under a legacy-friendly shape where appropriate
    // legacy fields expected by UI are provided above; include raw metrics for reference
    // NOTE: MailboxAnalyticsData in legacy types includes only the fields above; keep minimal mapping
  } as unknown as LegacyMailboxAnalyticsData;
}

/**
 * Map service MailboxPerformanceData to domain-specific MailboxAnalytics.
 * Consumers in the UI should prefer this shape.
 */
export function mapServiceMailboxToDomain(
  svc: ServiceMailboxPerformanceData,
  _warmup?: ServiceWarmupAnalyticsData | null
): DomainMailboxAnalytics {
  return {
    mailboxId: svc.mailboxId,
    email: svc.email ?? "",
    domain: svc.domain ?? "",
    provider: svc.provider ?? "",
    warmupStatus: (svc.warmupStatus as string | undefined) ?? "NOT_STARTED",
    warmupProgress: svc.warmupProgress ?? 0,
    dailyLimit: svc.dailyLimit ?? 0,
    currentVolume: svc.currentVolume ?? 0,
    healthScore: svc.healthScore ?? 0,
  // Flatten core metrics for legacy UI consumers that expect top-level fields
  sent: svc.metrics?.sent ?? 0,
  delivered: svc.metrics?.delivered ?? 0,
  opened_tracked: svc.metrics?.opened_tracked ?? 0,
  clicked_tracked: svc.metrics?.clicked_tracked ?? 0,
  replied: svc.metrics?.replied ?? 0,
  bounced: svc.metrics?.bounced ?? 0,
  unsubscribed: svc.metrics?.unsubscribed ?? 0,
  spamComplaints: svc.metrics?.spamComplaints ?? 0,
  // Warmup-related totals from warmup data
  totalWarmups: _warmup?.totalWarmups ?? 0,
  spamFlags: _warmup?.spamComplaints ?? _warmup?.spamComplaints ?? 0,
    lastUpdated: new Date(),
  } as unknown as DomainMailboxAnalytics;
}

/**
 * Convert service warmup daily stats to legacy WarmupChartData points.
 */
export function mapServiceWarmupToChartData(
  warmup: ServiceWarmupAnalyticsData
): LegacyWarmupChartData[] {
  if (!warmup || !Array.isArray(warmup.dailyStats)) return [];

  return warmup.dailyStats.map((d) => ({
    date: d.date ?? "",
    totalWarmups: d.emailsWarmed ?? 0,
  spamFlags: d.spamComplaints ?? 0,
    replies: d.replies ?? 0,
  }));
}

/**
 * Map a legacy `MailboxAnalyticsData` (UI-friendly legacy shape) to the
 * domain-specific `MailboxAnalytics` shape. This is a safe, best-effort
 * conversion used by UI consumer components while the migration is ongoing.
 * Missing domain fields are filled with sensible defaults.
 */
export function mapLegacyMailboxToDomain(
  legacy: unknown
): import("@/types/analytics/domain-specific").MailboxAnalytics {
  const Legacy = legacy as Record<string, unknown> | null;

  return {
    mailboxId: String(Legacy?.mailboxId ?? ""),
    email: String(Legacy?.email ?? ""),
    domain: String(Legacy?.domain ?? ""),
    provider: String(Legacy?.provider ?? ""),
    warmupStatus: (String(Legacy?.warmupStatus ?? "NOT_STARTED") as import("@/types/analytics/domain-specific").WarmupStatus),
    warmupProgress: Number(Legacy?.warmupProgress ?? 0),
    dailyLimit: Number(Legacy?.dailyLimit ?? 0),
    currentVolume: Number(Legacy?.currentVolume ?? 0),
    healthScore: Number(Legacy?.healthScore ?? 0),
  } as import("@/types/analytics/domain-specific").MailboxAnalytics;
}

/**
 * Minimal adapter: convert an unknown/raw mailbox analytics payload into the
 * legacy `MailboxAnalyticsData` shape expected by many UI consumers.
 */
export function mapRawToLegacyMailboxData(raw: unknown): LegacyMailboxAnalyticsData {
  const r = (raw as Record<string, unknown>) || {};

  return {
    mailboxId: String(r.mailboxId ?? r.mailboxId ?? ""),
    warmupProgress: Number(r.warmupProgress ?? r.warmupProgress ?? 0),
    totalWarmups: Number(r.totalWarmups ?? r.totalWarmups ?? 0),
    spamFlags: Number(r.spamFlags ?? r.spamComplaints ?? 0),
    replies: Number(r.replies ?? 0),
    healthScore: Number(r.healthScore ?? 0),
    lastUpdated: r.lastUpdated ? new Date(String(r.lastUpdated)) : new Date(),
  } as LegacyMailboxAnalyticsData;
}
