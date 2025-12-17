/**
 * Validation utilities for TemplateAnalyticsService
 * 
 * This module contains all validation logic for inputs to template analytics
 * operations, including metrics validation, filter normalization, payload
 * validation for mutations, and dataset validation for computations.
 * 
 * All validators throw AnalyticsError with appropriate error types on failure.
 * Uses AnalyticsCalculator for core metrics validation and FilteredDatasetUtils
 * for dataset integrity checks.
 * 
 * Usage:
 * - Call validators before executing queries/mutations
 * - Normalize filters to ensure consistent cache keys and query params
 * - Validation ensures data integrity and prevents invalid Convex calls
 */

import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { AnalyticsCalculator, FilteredDatasetUtils } from "@/lib/utils/analytics-calculator";
import type {
  AnalyticsFilters,
  PerformanceMetrics,
  FilteredDataset,
  TemplateAnalyticsUpdatePayload,
  TemplateAnalyticsBatchUpdatePayload
} from "./types";

/**
 * Validate core template metrics (sent, delivered, opens, clicks, replies, etc.).
 * Wraps AnalyticsCalculator.validateMetrics and throws AnalyticsError if invalid.
 * Ensures non-negative numbers and logical constraints (e.g., opens <= delivered).
 * 
 * @param metrics - The metrics object to validate
 * @throws {AnalyticsError} with INVALID_FILTERS if validation fails
 * @returns {boolean} true if valid
 */
export function validateTemplateMetrics(
  metrics: Pick<PerformanceMetrics, "sent" | "delivered" | "opened_tracked" | "clicked_tracked" | "replied" | "bounced" | "unsubscribed" | "spamComplaints">
): boolean {
  const validation = AnalyticsCalculator.validateMetrics(metrics);
  if (!validation.isValid) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      `Invalid template metrics: ${validation.errors.join(", ")}`,
      "templates"
    );
  }
  return true;
}

/**
 * Validate and normalize template filters.
 * Ensures dateRange is present for time-series and filtered ops (optional elsewhere).
 * Normalizes entityIds to templateIds array (string[] or undefined).
 * Throws if required fields missing.
 * 
 * @param filters - The analytics filters to validate/normalize
 * @param requiresDateRange - Whether dateRange is mandatory (default: false)
 * @throws {AnalyticsError} with INVALID_FILTERS if invalid
 * @returns {AnalyticsFilters} Normalized filters with validated fields
 */
export function validateAndNormalizeTemplateFilters(
  filters: AnalyticsFilters,
  requiresDateRange = false
): AnalyticsFilters {
  const normalized = { ...filters };

  // Validate entityIds as templateIds (string[])
  if (normalized.entityIds && !Array.isArray(normalized.entityIds)) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "entityIds must be an array of template IDs",
      "templates"
    );
  }
  if (normalized.entityIds) {
    normalized.entityIds = normalized.entityIds.filter((id): id is string => typeof id === "string" && id.length > 0);
    if (normalized.entityIds.length === 0) {
      delete normalized.entityIds; // Normalize empty to undefined
    }
  }

  // Validate dateRange if required
  if (requiresDateRange && (!normalized.dateRange || !normalized.dateRange.start || !normalized.dateRange.end)) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Date range (start and end) is required for this operation",
      "templates"
    );
  }

  // Additional filter-specific validations (e.g., granularity enum)
  if (normalized.granularity && !["day", "week", "month"].includes(normalized.granularity)) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      `Invalid granularity: ${normalized.granularity}. Must be 'day', 'week', or 'month'.`,
      "templates"
    );
  }

  return normalized;
}

/**
 * Validate single template analytics update payload.
 * Checks structure, required fields, and calls validateTemplateMetrics.
 * Ensures companyId and date are valid strings.
 * 
 * @param payload - The update payload to validate
 * @throws {AnalyticsError} with INVALID_FILTERS if invalid
 * @returns {boolean} true if valid
 */
export function validateTemplateUpdatePayload(payload: TemplateAnalyticsUpdatePayload): boolean {
  if (!payload.templateId || typeof payload.templateId !== "string" || payload.templateId.length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Valid templateId is required",
      "templates"
    );
  }

  if (!payload.companyId || typeof payload.companyId !== "string") {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Valid companyId is required",
      "templates"
    );
  }

  if (!payload.date || typeof payload.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Valid date (YYYY-MM-DD) is required",
      "templates"
    );
  }

  // Validate name and optional category
  if (!payload.templateName || typeof payload.templateName !== "string") {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Valid templateName is required",
      "templates"
    );
  }

  if (payload.category && typeof payload.category !== "string") {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Category must be a string if provided",
      "templates"
    );
  }

  // Validate metrics
  validateTemplateMetrics(payload);

  // Validate usage >= 0
  if (payload.usage < 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Usage must be non-negative",
      "templates"
    );
  }

  return true;
}

/**
 * Validate batch template analytics update payloads.
 * Validates each item in the array using validateTemplateUpdatePayload.
 * Ensures non-empty array.
 * 
 * @param payloads - The array of update payloads
 * @throws {AnalyticsError} with INVALID_FILTERS if any invalid
 * @returns {boolean} true if all valid
 */
export function validateTemplateBatchUpdatePayload(payloads: TemplateAnalyticsBatchUpdatePayload): boolean {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      "Batch updates must be a non-empty array",
      "templates"
    );
  }

  for (let i = 0; i < payloads.length; i++) {
    validateTemplateUpdatePayload(payloads[i]);
  }

  return true;
}

/**
 * Validate filtered dataset for template analytics computations.
 * Wraps FilteredDatasetUtils.validateFilteredDataset, ensuring data items have template-specific metrics.
 * Throws if dataset invalid or missing required performance fields.
 * 
 * @param dataset - The filtered dataset to validate
 * @throws {AnalyticsError} with INVALID_FILTERS if invalid
 * @returns {boolean} true if valid
 * @template T - The data item type (must include { metrics: PerformanceMetrics })
 */
export function validateTemplateFilteredDataset<T extends { metrics: PerformanceMetrics }>(
  dataset: FilteredDataset<T>
): boolean {
  const validation = FilteredDatasetUtils.validateFilteredDataset(dataset);
  if (!validation.isValid) {
    throw new AnalyticsError(
      AnalyticsErrorType.INVALID_FILTERS,
      `Invalid filtered template dataset: ${validation.errors.join(", ")}`,
      "templates"
    );
  }

  // Additional template-specific checks
  for (const item of dataset.data) {
    if (!item.metrics || typeof item.metrics !== "object") {
      throw new AnalyticsError(
        AnalyticsErrorType.INVALID_FILTERS,
        "Each dataset item must have valid metrics object",
        "templates"
      );
    }
    validateTemplateMetrics(item.metrics);
  }

  return true;
}
