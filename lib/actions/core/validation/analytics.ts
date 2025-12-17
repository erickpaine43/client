/**
 * Analytics-specific validation functions
 * 
 * This module provides validation functions for analytics data,
 * filters, performance metrics, and related analytics operations.
 */

import { ValidationResult, ValidationError, createValidationResult, createValidationError } from './core';
import { validateString, validateNumber, validateDate, validateArray } from './core';
import type { AnalyticsFilters, DataGranularity } from '../../../../types/analytics/core';

// ============================================================================
// ANALYTICS VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate analytics filters
 */
export function validateAnalyticsFilters(
  filters: unknown
): ValidationResult<AnalyticsFilters> {
  if (!filters || typeof filters !== 'object') {
    return createValidationError('filters', 'Filters must be an object');
  }

  const errors: ValidationError[] = [];
  const typedFilters = filters as Record<string, unknown>;

  // Validate date range
  if (typedFilters.dateRange) {
    if (typeof typedFilters.dateRange !== 'object' || !typedFilters.dateRange) {
      errors.push({
        field: 'dateRange',
        message: 'Date range must be an object',
        code: 'INVALID_TYPE',
        value: typedFilters.dateRange,
      });
    } else {
      const dateRange = typedFilters.dateRange as Record<string, unknown>;
      
      const startResult = validateDate(dateRange.start, 'dateRange.start', { format: 'iso' });
      if (!startResult.isValid && startResult.errors) errors.push(...startResult.errors);

      const endResult = validateDate(dateRange.end, 'dateRange.end', { format: 'iso' });
      if (!endResult.isValid && endResult.errors) errors.push(...endResult.errors);

      // Validate start is before end
      if (startResult.isValid && endResult.isValid) {
        const start = new Date(dateRange.start as string);
        const end = new Date(dateRange.end as string);
        if (start >= end) {
          errors.push({
            field: 'dateRange',
            message: 'Start date must be before end date',
            code: 'INVALID_RANGE',
            value: dateRange,
          });
        }
      }
    }
  }

  // Validate entity IDs
  if (typedFilters.entityIds) {
    const entityResult = validateArray(typedFilters.entityIds, 'entityIds', {
      itemValidator: (item, index) => validateString(item, `entityIds[${index}]`, { minLength: 1 }),
    });
    if (!entityResult.isValid && entityResult.errors) {
      errors.push(...entityResult.errors);
    }
  }

  // Validate granularity
  if (typedFilters.granularity) {
    const granularityResult = validateString(
      typedFilters.granularity,
      'granularity',
      { enum: ['day', 'week', 'month'] as const }
    );
    if (!granularityResult.isValid && granularityResult.errors) {
      errors.push(...granularityResult.errors);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return createValidationResult(typedFilters as AnalyticsFilters);
}

/**
 * Validate performance metrics
 */
export function validatePerformanceMetrics(
  metrics: unknown
): ValidationResult<{
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
}> {
  if (!metrics || typeof metrics !== 'object') {
    return createValidationError('metrics', 'Metrics must be an object');
  }

  const errors: ValidationError[] = [];
  const typedMetrics = metrics as Record<string, unknown>;

  const requiredFields = [
    'sent', 'delivered', 'opened_tracked', 'clicked_tracked',
    'replied', 'bounced', 'unsubscribed', 'spamComplaints'
  ];

  for (const field of requiredFields) {
    const result = validateNumber(typedMetrics[field], field, {
      min: 0,
      integer: true,
    });
    if (!result.isValid && result.errors) {
      errors.push(...result.errors);
    }
  }

  // Validate logical constraints
  if (typeof typedMetrics.sent === 'number' && typeof typedMetrics.delivered === 'number') {
    if (typedMetrics.delivered > typedMetrics.sent) {
      errors.push({
        field: 'delivered',
        message: 'Delivered count cannot exceed sent count',
        code: 'INVALID_CONSTRAINT',
        value: typedMetrics.delivered,
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return createValidationResult(typedMetrics as {
    sent: number;
    delivered: number;
    opened_tracked: number;
    clicked_tracked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
    spamComplaints: number;
  });
}

// ============================================================================
// ANALYTICS TYPE GUARDS
// ============================================================================

/**
 * Type guard for AnalyticsFilters
 */
export function isAnalyticsFilters(value: unknown): value is AnalyticsFilters {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  
  // Check optional dateRange
  if (obj.dateRange !== undefined) {
    if (typeof obj.dateRange !== 'object' || !obj.dateRange) return false;
    const dateRange = obj.dateRange as Record<string, unknown>;
    if (typeof dateRange.start !== 'string' || typeof dateRange.end !== 'string') return false;
  }
  
  // Check optional arrays
  if (obj.entityIds !== undefined && !Array.isArray(obj.entityIds)) return false;
  if (obj.domainIds !== undefined && !Array.isArray(obj.domainIds)) return false;
  if (obj.mailboxIds !== undefined && !Array.isArray(obj.mailboxIds)) return false;
  
  // Check optional granularity
  if (obj.granularity !== undefined) {
    const validGranularities: DataGranularity[] = ['day', 'week', 'month'];
    if (!validGranularities.includes(obj.granularity as DataGranularity)) return false;
  }
  
  return true;
}

/**
 * Type guard for performance metrics
 */
export function isPerformanceMetrics(value: unknown): value is {
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
} {
  if (!value || typeof value !== 'object') return false;
  
  const obj = value as Record<string, unknown>;
  const requiredFields = [
    'sent', 'delivered', 'opened_tracked', 'clicked_tracked',
    'replied', 'bounced', 'unsubscribed', 'spamComplaints'
  ];
  
  return requiredFields.every(field => 
    typeof obj[field] === 'number' && obj[field] >= 0
  );
}
