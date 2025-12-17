// ============================================================================
// MAILBOX ANALYTICS SERVICE VALIDATION - Input validation utilities
// ============================================================================

import { AnalyticsFilters } from "@/types/analytics/core";
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { MailboxAnalyticsUpdate, WarmupAnalyticsUpdate } from "./types";

/**
 * Validates analytics filters for mailbox operations.
 * Ensures filters contain required fields and valid values.
 *
 * @param filters - The filters to validate
 * @throws AnalyticsError if validation fails
 */
export function validateMailboxFilters(filters: AnalyticsFilters): void {
  if (!filters) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Filters are required for mailbox analytics operations",
      "mailboxes",
      false
    );
  }

  // Validate date range if present
  if (filters.dateRange) {
    if (!filters.dateRange.start || !filters.dateRange.end) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Date range must include both start and end dates",
        "mailboxes",
        false
      );
    }

    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Invalid date format in date range",
        "mailboxes",
        false
      );
    }

    if (startDate > endDate) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Start date cannot be after end date",
        "mailboxes",
        false
      );
    }
  }
}

/**
 * Validates mailbox IDs array for bulk operations.
 * Ensures mailbox IDs are present and properly formatted.
 *
 * @param mailboxIds - Array of mailbox IDs to validate
 * @param maxMailboxes - Maximum number of mailboxes allowed (default: 100)
 * @throws AnalyticsError if validation fails
 */
export function validateMailboxIds(mailboxIds: string[], maxMailboxes: number = 100): void {
  if (!Array.isArray(mailboxIds)) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Mailbox IDs must be an array",
      "mailboxes",
      false
    );
  }

  if (mailboxIds.length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "At least one mailbox ID is required",
      "mailboxes",
      false
    );
  }

  if (mailboxIds.length > maxMailboxes) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      `Too many mailboxes requested. Maximum allowed: ${maxMailboxes}`,
      "mailboxes",
      false
    );
  }

  // Validate each mailbox ID format
  for (const id of mailboxIds) {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "All mailbox IDs must be non-empty strings",
        "mailboxes",
        false
      );
    }
  }
}

/**
 * Validates mailbox analytics update data.
 * Ensures all required fields are present and have valid values.
 *
 * @param data - The mailbox analytics update data to validate
 * @throws AnalyticsError if validation fails
 */
export function validateMailboxAnalyticsUpdate(data: MailboxAnalyticsUpdate): void {
  if (!data.mailboxId || typeof data.mailboxId !== 'string' || data.mailboxId.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid mailbox ID is required",
      "mailboxes",
      false
    );
  }

  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid email address is required",
      "mailboxes",
      false
    );
  }

  if (!data.domain || typeof data.domain !== 'string' || data.domain.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid domain is required",
      "mailboxes",
      false
    );
  }

  if (!data.companyId || typeof data.companyId !== 'string' || data.companyId.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid company ID is required",
      "mailboxes",
      false
    );
  }

  if (!data.date || typeof data.date !== 'string') {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid date is required",
      "mailboxes",
      false
    );
  }

  // Validate date format
  const date = new Date(data.date);
  if (isNaN(date.getTime())) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Invalid date format",
      "mailboxes",
      false
    );
  }

  // Validate numeric fields
  validateMailboxMetrics({
    sent: data.sent,
    delivered: data.delivered,
    opened_tracked: data.opened_tracked,
    clicked_tracked: data.clicked_tracked,
    replied: data.replied,
    bounced: data.bounced,
    unsubscribed: data.unsubscribed,
    spamComplaints: data.spamComplaints,
  });

  // Validate warmup-related fields
  if (typeof data.warmupProgress !== 'number' || data.warmupProgress < 0 || data.warmupProgress > 100) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Warmup progress must be a number between 0 and 100",
      "mailboxes",
      false
    );
  }

  if (typeof data.dailyLimit !== 'number' || data.dailyLimit < 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Daily limit must be a non-negative number",
      "mailboxes",
      false
    );
  }

  if (typeof data.currentVolume !== 'number' || data.currentVolume < 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Current volume must be a non-negative number",
      "mailboxes",
      false
    );
  }
}

/**
 * Validates warmup analytics update data.
 * Ensures all required fields are present and have valid values.
 *
 * @param data - The warmup analytics update data to validate
 * @throws AnalyticsError if validation fails
 */
export function validateWarmupAnalyticsUpdate(data: WarmupAnalyticsUpdate): void {
  if (!data.mailboxId || typeof data.mailboxId !== 'string' || data.mailboxId.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid mailbox ID is required",
      "mailboxes",
      false
    );
  }

  if (!data.date || typeof data.date !== 'string') {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid date is required",
      "mailboxes",
      false
    );
  }

  // Validate date format
  const date = new Date(data.date);
  if (isNaN(date.getTime())) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Invalid date format",
      "mailboxes",
      false
    );
  }

  // Validate numeric fields
  const metricsToValidate = {
    sent: data.sent,
    delivered: data.delivered,
    replies: data.replies,
    spamComplaints: data.spamComplaints,
  };

  for (const [field, value] of Object.entries(metricsToValidate)) {
    if (typeof value !== 'number' || value < 0) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        `${field} must be a non-negative number`,
        "mailboxes",
        false
      );
    }
  }

  // Validate warmup progress
  if (typeof data.warmupProgress !== 'number' || data.warmupProgress < 0 || data.warmupProgress > 100) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Warmup progress must be a number between 0 and 100",
      "mailboxes",
      false
    );
  }
}

/**
 * Validates mailbox performance metrics.
 * Ensures all metrics are valid numbers and follow business rules.
 *
 * @param metrics - The metrics to validate
 * @throws AnalyticsError if validation fails
 */
export function validateMailboxMetrics(metrics: {
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}): void {
  const fields = ['sent', 'delivered', 'opened_tracked', 'clicked_tracked', 'replied', 'bounced', 'unsubscribed', 'spamComplaints'];

  for (const field of fields) {
    const value = metrics[field as keyof typeof metrics];
    if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        `${field} must be a non-negative integer`,
        "mailboxes",
        false
      );
    }
  }

  // Business rule validations
  if (metrics.delivered > metrics.sent) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Delivered count cannot exceed sent count",
      "mailboxes",
      false
    );
  }

  if (metrics.opened_tracked > metrics.delivered) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Opened count cannot exceed delivered count",
      "mailboxes",
      false
    );
  }

  if (metrics.clicked_tracked > metrics.opened_tracked) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Clicked count cannot exceed opened count",
      "mailboxes",
      false
    );
  }
}

/**
 * Validates warmup status values.
 * Ensures warmup status is a valid enum value.
 *
 * @param status - The warmup status to validate
 * @throws AnalyticsError if validation fails
 */
export function validateWarmupStatus(status: string): void {
  const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'FAILED'];

  if (!validStatuses.includes(status)) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      `Invalid warmup status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
      "mailboxes",
      false
    );
  }
}

/**
 * Validates sending capacity calculations.
 * Ensures capacity calculations are logical and within bounds.
 *
 * @param dailyLimit - Daily sending limit
 * @param currentVolume - Current sending volume
 * @throws AnalyticsError if validation fails
 */
export function validateSendingCapacity(dailyLimit: number, currentVolume: number): void {
  if (typeof dailyLimit !== 'number' || dailyLimit < 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Daily limit must be a non-negative number",
      "mailboxes",
      false
    );
  }

  if (typeof currentVolume !== 'number' || currentVolume < 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Current volume must be a non-negative number",
      "mailboxes",
      false
    );
  }

  if (currentVolume > dailyLimit) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Current volume cannot exceed daily limit",
      "mailboxes",
      false
    );
  }
}
