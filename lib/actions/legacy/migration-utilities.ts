/**
 * Migration Utilities for Legacy Actions
 * 
 * This module provides utilities to help migrate from legacy action patterns
 * to the new modular structure with standardized types and error handling.
 */

import type { ActionResult } from '../core/types';
import { createActionResult, createActionError } from '../core/errors';

/**
 * Legacy action result format (inconsistent across files)
 */
export interface LegacyActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | { message: string; code?: string };
  message?: string;
  code?: string;
}

/**
 * Transform legacy action result to new standardized format
 */
export function transformLegacyResult<T>(
  legacyResult: LegacyActionResult<T>
): ActionResult<T> {
  if (legacyResult.success && legacyResult.data !== undefined) {
    return createActionResult(legacyResult.data);
  }

  // Handle various legacy error formats
  let errorMessage = 'Unknown error';
  let errorCode: string | undefined;

  if (typeof legacyResult.error === 'string') {
    errorMessage = legacyResult.error;
  } else if (legacyResult.error && typeof legacyResult.error === 'object') {
    errorMessage = legacyResult.error.message;
    errorCode = legacyResult.error.code;
  } else if (legacyResult.message) {
    errorMessage = legacyResult.message;
    errorCode = legacyResult.code;
  }

  return createActionError('server', errorMessage, errorCode);
}

/**
 * Legacy analytics data format transformation
 */
export interface LegacyAnalyticsData {
  // Various legacy formats found in analytics files
  [key: string]: unknown;
  sent?: number;
  delivered?: number;
  opened?: number; // Legacy field name
  clicked?: number; // Legacy field name
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  spam_complaints?: number; // Legacy field name
}

/**
 * Transform legacy analytics data to standardized format
 */
export function transformLegacyAnalyticsData(
  legacyData: LegacyAnalyticsData
): {
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
} {
  return {
    sent: legacyData.sent || 0,
    delivered: legacyData.delivered || 0,
    opened_tracked: legacyData.opened || 0, // Transform legacy field name
    clicked_tracked: legacyData.clicked || 0, // Transform legacy field name
    replied: legacyData.replied || 0,
    bounced: legacyData.bounced || 0,
    unsubscribed: legacyData.unsubscribed || 0,
    spamComplaints: legacyData.spam_complaints || 0, // Transform legacy field name
  };
}

/**
 * Legacy pagination format transformation
 */
export interface LegacyPaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

/**
 * Transform legacy pagination to standardized format
 */
export function transformLegacyPagination(
  legacyPagination: LegacyPaginationParams
): { limit: number; offset: number } {
  // Handle page-based pagination
  if (legacyPagination.page !== undefined && legacyPagination.pageSize !== undefined) {
    return {
      limit: legacyPagination.pageSize,
      offset: (legacyPagination.page - 1) * legacyPagination.pageSize,
    };
  }

  // Handle limit/offset pagination
  return {
    limit: legacyPagination.limit || 50,
    offset: legacyPagination.offset || 0,
  };
}

/**
 * Legacy filter format transformation
 */
export interface LegacyFilterParams {
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  date_range?: { start: string; end: string };
  [key: string]: unknown;
}

/**
 * Transform legacy filters to standardized format
 */
export function transformLegacyFilters(
  legacyFilters: LegacyFilterParams
): {
  dateRange?: { start: string; end: string };
  [key: string]: unknown;
} {
  const transformed: { dateRange?: { start: string; end: string }; [key: string]: unknown } = {};

  // Handle various legacy date range formats
  if (legacyFilters.startDate && legacyFilters.endDate) {
    transformed.dateRange = {
      start: legacyFilters.startDate,
      end: legacyFilters.endDate,
    };
  } else if (legacyFilters.dateFrom && legacyFilters.dateTo) {
    transformed.dateRange = {
      start: legacyFilters.dateFrom,
      end: legacyFilters.dateTo,
    };
  } else if (legacyFilters.date_range) {
    transformed.dateRange = legacyFilters.date_range;
  }

  // Copy other filters (excluding date-related ones)
  Object.keys(legacyFilters).forEach(key => {
    if (!['startDate', 'endDate', 'dateFrom', 'dateTo', 'date_range'].includes(key)) {
      transformed[key] = legacyFilters[key];
    }
  });

  return transformed;
}

/**
 * Legacy error format transformation
 */
export interface LegacyError {
  message: string;
  code?: string | number;
  status?: number;
  details?: unknown;
}

/**
 * Transform legacy error to standardized ActionError format
 */
export function transformLegacyError(legacyError: LegacyError): ActionResult<never> {
  const errorType = legacyError.status === 401 || legacyError.code === 'UNAUTHORIZED' 
    ? 'auth' 
    : legacyError.status === 400 || legacyError.code === 'VALIDATION_ERROR'
    ? 'validation'
    : legacyError.status === 429 || legacyError.code === 'RATE_LIMIT'
    ? 'rate_limit'
    : 'server';

  return createActionError(
    errorType,
    legacyError.message,
    typeof legacyError.code === 'string' ? legacyError.code : undefined,
    undefined,
    legacyError.details ? { details: legacyError.details } : undefined
  );
}

/**
 * Wrapper function to help migrate legacy actions to new format
 */
export async function migrateLegacyAction<T, P extends unknown[]>(
  legacyAction: (...args: P) => Promise<LegacyActionResult<T>>,
  ...args: P
): Promise<ActionResult<T>> {
  try {
    const legacyResult = await legacyAction(...args);
    return transformLegacyResult(legacyResult);
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      return transformLegacyError(error as LegacyError);
    }
    return createActionError('server', 'Unknown error occurred during legacy action migration');
  }
}

/**
 * Deprecation warning utility
 */
export function logDeprecationWarning(
  oldPath: string,
  newPath: string,
  additionalInfo?: string
): void {
  if (typeof console !== 'undefined') {
    console.warn(
      `🚨 DEPRECATED: ${oldPath} is deprecated. ` +
      `Please migrate to ${newPath} for better organization and maintainability.` +
      (additionalInfo ? ` ${additionalInfo}` : '') +
      ' See lib/actions/legacy/README.md for migration guide.'
    );
  }
}

/**
 * Migration status tracking
 */
export const MIGRATION_STATUS = {
  COMPLETED: [
    'billingActions.ts',
    'teamActions.ts',
    'settingsActions.ts',
    'notificationActions.ts',
    'templateActions.ts',
    'billing.analytics.actions.ts',
    'campaign.analytics.actions.ts',
    'cross-domain.analytics.actions.ts',
    'domain.analytics.actions.ts',
    'lead.analytics.actions.ts',
    'mailbox.analytics.actions.ts',
    'template.analytics.actions.ts',
    'optimized.analytics.actions.ts',
  ],
  PENDING: [
    'campaignActions.ts',
    'domainsActions.ts',
    'inboxActions.ts',
    'leadsActions.ts',
    'mailboxActions.ts',
    'clientActions.ts',
    'dashboardActions.ts',
    'profileActions.ts',
    'warmupActions.ts',
  ],
} as const;

/**
 * Type representing all possible migration filenames
 */
export type MigrationFilename = typeof MIGRATION_STATUS.COMPLETED[number] | typeof MIGRATION_STATUS.PENDING[number];

/**
 * Check if a file has been migrated
 */
export function isMigrated(filename: MigrationFilename): boolean {
  return (MIGRATION_STATUS.COMPLETED as readonly MigrationFilename[]).includes(filename);
}

/**
 * Get migration status for a file
 */
export function getMigrationStatus(filename: MigrationFilename): 'completed' | 'pending' | 'unknown' {
  if ((MIGRATION_STATUS.COMPLETED as readonly MigrationFilename[]).includes(filename)) {
    return 'completed';
  }
  if ((MIGRATION_STATUS.PENDING as readonly MigrationFilename[]).includes(filename)) {
    return 'pending';
  }
  return 'unknown';
}
