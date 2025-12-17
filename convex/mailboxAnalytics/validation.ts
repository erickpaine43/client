import { ConvexError } from "convex/values";
import type { PerformanceMetrics } from "../../types/analytics/core";

/**
 * Validates company ID parameter.
 * @param companyId - The company ID to validate
 * @throws {ConvexError} ANALYTICS_INVALID_COMPANY_ID if invalid
 */
export function validateCompanyId(companyId: string): void {
  if (
    !companyId ||
    typeof companyId !== "string" ||
    companyId.trim().length === 0
  ) {
    throw new ConvexError({
      code: "ANALYTICS_INVALID_COMPANY_ID",
      message: "Company ID is required and must be a non-empty string",
    });
  }
}

/**
 * Validates date range parameters.
 * @param dateRange - The date range object to validate
 * @throws {ConvexError} ANALYTICS_INVALID_DATE_FORMAT if date format is invalid
 * @throws {ConvexError} ANALYTICS_INVALID_DATE_RANGE if start date is after end date
 */
export function validateDateRange(dateRange: { start: string; end: string }): void {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso.test(dateRange.start) || !iso.test(dateRange.end)) {
    throw new ConvexError({
      code: "ANALYTICS_INVALID_DATE_FORMAT",
      message: "Invalid date format; expected YYYY-MM-DD",
    });
  }

  const startTime = new Date(`${dateRange.start}T00:00:00.000Z`).getTime();
  const endTime = new Date(`${dateRange.end}T00:00:00.000Z`).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime) || startTime > endTime) {
    throw new ConvexError({
      code: "ANALYTICS_INVALID_DATE_RANGE",
      message: "Start date must be before or equal to end date",
    });
  }
}

/**
 * Normalizes mailbox IDs by deduplicating and sorting.
 * @param mailboxIds - Array of mailbox IDs to normalize
 * @returns Normalized array or undefined if input is empty
 * @throws {ConvexError} ANALYTICS_INVALID_INPUT if any ID is invalid
 */
export function normalizeMailboxIds(mailboxIds?: string[]): string[] | undefined {
  if (!mailboxIds || mailboxIds.length === 0) return undefined;

  // Validate each ID
  for (let i = 0; i < mailboxIds.length; i++) {
    const id = mailboxIds[i];
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: `mailboxIds[${i}] must be a non-empty string`,
      });
    }
  }

  // Deduplicate and sort for deterministic behavior
  return Array.from(new Set(mailboxIds.map((s) => s.trim()))).sort();
}

/**
 * Validates performance metrics for finite, non-negative values.
 * @param metrics - Partial performance metrics to validate
 * @throws {ConvexError} ANALYTICS_INVALID_METRICS if any metric is invalid
 */
export function validateMetrics(metrics: Partial<PerformanceMetrics>): void {
  const fields = [
    "sent",
    "delivered",
    "opened_tracked",
    "clicked_tracked",
    "replied",
    "bounced",
    "unsubscribed",
    "spamComplaints",
  ] as const;

  for (const field of fields) {
    const value = metrics[field];
    if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_METRICS",
        message: `${field} must be a finite, non-negative number`,
      });
    }
  }
}

/**
 * Validates business rule invariants for performance metrics.
 * @param metrics - Complete performance metrics to validate
 * @throws {ConvexError} ANALYTICS_INVARIANT_VIOLATION if any invariant is violated
 */
export function validateMetricInvariants(metrics: PerformanceMetrics): void {
  if (metrics.delivered > metrics.sent) {
    throw new ConvexError({
      code: "ANALYTICS_INVARIANT_VIOLATION",
      message: "delivered cannot be greater than sent",
    });
  }

  if (metrics.bounced > metrics.sent) {
    throw new ConvexError({
      code: "ANALYTICS_INVARIANT_VIOLATION",
      message: "bounced cannot be greater than sent",
    });
  }

  const deliveredBound = Math.max(0, Math.min(metrics.delivered, metrics.sent));
  const checkBound = (value: number, field: string) => {
    if (value > deliveredBound) {
      throw new ConvexError({
        code: "ANALYTICS_INVARIANT_VIOLATION",
        message: `${field} cannot be greater than delivered`,
      });
    }
  };

  checkBound(metrics.opened_tracked, "opened_tracked");
  checkBound(metrics.clicked_tracked, "clicked_tracked");
  checkBound(metrics.replied, "replied");
  checkBound(metrics.unsubscribed, "unsubscribed");
  checkBound(metrics.spamComplaints, "spamComplaints");
}
