import { AnalyticsFilters } from "@/types/analytics/core";

/**
 * Validate cross-domain analytics filters
 */
export function validateCrossDomainFilters(filters: AnalyticsFilters): void {
  if (!filters) {
    throw new Error("Filters are required for cross-domain analytics");
  }

  if (!filters.dateRange || !filters.dateRange.start || !filters.dateRange.end) {
    throw new Error("Date range is required for cross-domain analytics");
  }

  if (!filters.companyId) {
    throw new Error("Company ID is required for cross-domain analytics");
  }
}

/**
 * Validate domain and mailbox IDs for cross-domain operations
 */
export function validateDomainMailboxIds(domainIds?: string[], mailboxIds?: string[]): void {
  if (!domainIds && !mailboxIds) {
    throw new Error("At least domain IDs or mailbox IDs must be provided");
  }

  if (domainIds && domainIds.length === 0) {
    throw new Error("Domain IDs array cannot be empty if provided");
  }

  if (mailboxIds && mailboxIds.length === 0) {
    throw new Error("Mailbox IDs array cannot be empty if provided");
  }
}
