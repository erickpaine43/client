import { ConvexError } from "convex/values";
import type { PerformanceMetrics } from "@/types/analytics/core";

// Validate company ID is present and a string
export function validateCompanyId(companyId: string): void {
  if (!companyId || typeof companyId !== 'string') {
    throw new ConvexError({
      code: "MISSING_COMPANY_ID",
      message: "Company ID is required"
    });
  }
}

// Validate date range format and ordering
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

// Validate and normalize domain IDs
export function validateAndNormalizeDomainIds(domainIds?: string[]): string[] | undefined {
  if (!domainIds || domainIds.length === 0) return undefined;

  for (let i = 0; i < domainIds.length; i++) {
    const id = domainIds[i];
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_INPUT",
        message: `domainIds[${i}] must be a non-empty string`,
      });
    }
  }
  const deduped = Array.from(new Set(domainIds.map((s) => s.trim())));
  return deduped.sort();
}

// Validate date format for upsert
export function validateDate(date: string): void {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso.test(date)) {
    throw new ConvexError({
      code: "ANALYTICS_INVALID_DATE_FORMAT",
      message: `Invalid date; expected YYYY-MM-DD, got ${date}`,
    });
  }
}

// Validate metrics are finite, non-negative numbers
export function validateMetrics(metrics: Partial<PerformanceMetrics>): void {
  const metricsList = [
    metrics.sent,
    metrics.delivered,
    metrics.opened_tracked,
    metrics.clicked_tracked,
    metrics.replied,
    metrics.bounced,
    metrics.unsubscribed,
    metrics.spamComplaints,
  ];
  if (metricsList.some((v) => v !== undefined && (typeof v !== "number" || !Number.isFinite(v) || v < 0))) {
    throw new ConvexError({
      code: "ANALYTICS_INVALID_METRICS",
      message: "All metrics must be finite, non-negative numbers",
    });
  }
}

// Validate invariants for upsert
export function validateInvariants(args: {
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}): void {
  if (args.delivered > args.sent) {
    throw new ConvexError({
      code: "ANALYTICS_INVARIANT_VIOLATION",
      message: "delivered cannot be greater than sent",
    });
  }
  if (args.bounced > args.sent) {
    throw new ConvexError({
      code: "ANALYTICS_INVARIANT_VIOLATION",
      message: "bounced cannot be greater than sent",
    });
  }
  const deliveredBound = Math.max(0, Math.min(args.delivered, args.sent));
  const checkDeliveredBounded = (
    value: number,
    field: string,
  ) => {
    if (value > deliveredBound) {
      throw new ConvexError({
        code: "ANALYTICS_INVARIANT_VIOLATION",
        message: `${field} cannot be greater than delivered`,
      });
    }
  };
  checkDeliveredBounded(args.opened_tracked, "opened_tracked");
  checkDeliveredBounded(args.clicked_tracked, "clicked_tracked");
  checkDeliveredBounded(args.replied, "replied");
  checkDeliveredBounded(args.unsubscribed, "unsubscribed");
  checkDeliveredBounded(args.spamComplaints, "spamComplaints");
}
