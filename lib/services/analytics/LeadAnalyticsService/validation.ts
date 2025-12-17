/**
 * Validation for LeadAnalyticsService
 * 
 * This module contains input validation and normalization logic for lead analytics operations.
 * Validates filters, metrics, and payloads before processing queries or mutations.
 * Uses Zod or manual validation; throws AnalyticsError on failure.
 * 
 * Dependencies:
 * - Types from ./types.ts
 * - Core validation utils if available
 * 
 * Usage:
 * - Call validateLeadFilters(filters) before query execution
 * - Call validateLeadMetrics(metrics) before calculations
 * - Integrates with BaseAnalyticsService validation
 */

import type { AnalyticsFilters, PerformanceMetrics } from "./types";
import type { LeadAnalyticsUpdatePayload } from "./types";

/**
 * Validate lead-specific analytics filters.
 * Ensures dateRange, entityIds (leadIds), granularity are valid.
 * 
 * @param filters - Analytics filters to validate
 * @throws {AnalyticsError} if invalid
 */
export function validateLeadFilters(filters: AnalyticsFilters): void {
  // TODO: Implement lead-specific filter validation
  // For now, placeholder - extend base validation
  if (!filters.dateRange || !filters.dateRange.start || !filters.dateRange.end) {
    throw new Error("Invalid date range in lead filters");
  }
  if (filters.entityIds && !Array.isArray(filters.entityIds)) {
    throw new Error("Lead IDs must be an array");
  }
}

/**
 * Validate lead performance metrics.
 * Ensures non-negative numbers, delivered >= bounced, etc.
 * 
 * @param metrics - Performance metrics to validate
 * @throws {AnalyticsError} if invalid
 */
export function validateLeadMetrics(metrics: PerformanceMetrics): void {
  // TODO: Implement lead-specific metrics validation
  // Placeholder: basic checks
  const requiredFields = ["sent", "delivered", "opened_tracked", "clicked_tracked", "replied", "bounced", "unsubscribed", "spamComplaints"];
  for (const field of requiredFields) {
    if (metrics[field as keyof PerformanceMetrics] < 0) {
      throw new Error(`Invalid ${field}: negative value`);
    }
  }
  if (metrics.bounced > metrics.delivered) {
    throw new Error("Bounced cannot exceed delivered");
  }
}

/**
 * Validate lead analytics update payload.
 * Comprehensive check for mutation inputs.
 * 
 * @param payload - Update payload to validate
 * @throws {AnalyticsError} if invalid
 */
export function validateLeadUpdatePayload(payload: LeadAnalyticsUpdatePayload): void {
  // TODO: Implement payload validation
  // Placeholder: basic string/number checks
  if (!payload.leadId || typeof payload.leadId !== "string") {
    throw new Error("Invalid leadId");
  }
  if (!payload.email || !payload.email.includes("@")) {
    throw new Error("Invalid email");
  }
  validateLeadMetrics({
    sent: payload.sent,
    delivered: payload.delivered,
    opened_tracked: payload.opened_tracked,
    clicked_tracked: payload.clicked_tracked,
    replied: payload.replied,
    bounced: payload.bounced,
    unsubscribed: payload.unsubscribed,
    spamComplaints: payload.spamComplaints,
  });
}
