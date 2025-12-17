// ============================================================================
// ANALYTICS SERVICE VALIDATION - Input validation and normalization utilities
// ============================================================================

import { AnalyticsFilters } from "@/types/analytics/core";
import { AnalyticsDomain } from "@/types/analytics/ui";
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";

/**
 * Validates analytics filters and normalizes input values.
 * Ensures all required fields are present and have valid values.
 *
 * @param filters - The filters to validate
 * @returns Normalized and validated filters
 * @throws AnalyticsError if validation fails
 */
export function validateAnalyticsFilters(filters: AnalyticsFilters): AnalyticsFilters {
  if (!filters) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Filters are required",
      "overview",
      false
    );
  }

  // Validate date range if present
  if (filters.dateRange) {
    if (!filters.dateRange.start || !filters.dateRange.end) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Date range must include both start and end dates",
        "overview",
        false
      );
    }

    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Invalid date format in date range",
        "overview",
        false
      );
    }

    if (startDate > endDate) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Start date cannot be after end date",
        "overview",
        false
      );
    }
  }

  // Validate entity IDs if present
  if (filters.entityIds && !Array.isArray(filters.entityIds)) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Entity IDs must be an array",
      "overview",
      false
    );
  }

  return filters;
}

/**
 * Creates default analytics filters with sensible defaults.
 * Used when no filters are provided to ensure consistent behavior.
 *
 * @returns Default analytics filters
 */
export function createDefaultAnalyticsFilters(): AnalyticsFilters {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    dateRange: {
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    },
    entityIds: [],
    granularity: "day",
  };
}

/**
 * Validates that a domain identifier is valid.
 * Ensures the domain exists in the supported domains list.
 *
 * @param domain - The domain to validate
 * @throws AnalyticsError if domain is invalid
 */
export function validateAnalyticsDomain(domain: AnalyticsDomain): void {
  const validDomains: AnalyticsDomain[] = [
    "campaigns",
    "domains",
    "mailboxes",
    "crossDomain",
    "leads",
    "templates",
    "billing"
  ];

  if (!validDomains.includes(domain)) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      `Invalid domain: ${domain}. Must be one of: ${validDomains.join(", ")}`,
      "overview",
      false
    );
  }
}

/**
 * Validates entity IDs array for bulk operations.
 * Ensures IDs are present and properly formatted.
 *
 * @param entityIds - Array of entity IDs to validate
 * @param maxEntities - Maximum number of entities allowed (default: 1000)
 * @throws AnalyticsError if validation fails
 */
export function validateEntityIds(entityIds: string[], maxEntities: number = 1000): void {
  if (!Array.isArray(entityIds)) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Entity IDs must be an array",
      "overview",
      false
    );
  }

  if (entityIds.length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "At least one entity ID is required",
      "overview",
      false
    );
  }

  if (entityIds.length > maxEntities) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      `Too many entities requested. Maximum allowed: ${maxEntities}`,
      "overview",
      false
    );
  }

  // Validate each ID format (basic UUID check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (const id of entityIds) {
    if (typeof id !== 'string' || id.trim().length === 0 || uuidRegex.test(id.trim())) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "All entity IDs must be non-empty strings",
        "overview",
        false
      );
    }
  }
}

/**
 * Validates cache operation parameters.
 * Ensures cache-related operations have valid parameters.
 *
 * @param operation - The cache operation being performed
 * @param domain - Optional domain for domain-specific operations
 * @param entityIds - Optional entity IDs for entity-specific operations
 * @throws AnalyticsError if validation fails
 */
export function validateCacheOperation(
  operation: string,
  domain?: AnalyticsDomain,
  entityIds?: string[]
): void {
  if (domain) {
    validateAnalyticsDomain(domain);
  }

  if (entityIds) {
    validateEntityIds(entityIds);
  }

  const validOperations = [
    "invalidate",
    "get",
    "set",
    "stats",
    "clear"
  ];

  if (!validOperations.includes(operation)) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      `Invalid cache operation: ${operation}. Must be one of: ${validOperations.join(", ")}`,
      domain || "overview",
      false
    );
  }
}
