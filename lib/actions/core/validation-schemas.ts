/**
 * Validation schemas for analytics action modules
 * 
 * This module provides pre-defined validation schemas for common data structures
 * used across analytics actions, ensuring consistent validation patterns.
 */

import { ValidationSchema } from './validation';
import type { AnalyticsFilters } from '../../../types/analytics/core';
import type {
  CampaignAnalytics,
  DomainAnalytics,
  MailboxAnalytics,
  LeadAnalytics,
  TemplateAnalytics,
  BillingAnalytics,
  CampaignStatus,
  WarmupStatus,
  LeadStatus,
} from '../../../types/analytics/domain-specific';

// ============================================================================
// CORE ANALYTICS SCHEMAS
// ============================================================================

/**
 * Schema for analytics filters
 */
export const analyticsFiltersSchema: ValidationSchema<AnalyticsFilters> = {
  dateRange: {
    required: false,
    type: 'object',
    custom: (value) => {
      if (!value) return null;
      
      const dateRange = value as Record<string, unknown>;
      if (!dateRange.start || !dateRange.end) {
        return 'Date range must have start and end dates';
      }
      
      const start = new Date(dateRange.start as string);
      const end = new Date(dateRange.end as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return 'Invalid date format in date range';
      }
      
      if (start >= end) {
        return 'Start date must be before end date';
      }
      
      // Check if date range is not too large (max 1 year)
      const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
      if (end.getTime() - start.getTime() > maxRange) {
        return 'Date range cannot exceed 1 year';
      }
      
      return null;
    },
  },
  entityIds: {
    required: false,
    type: 'array',
    max: 100, // Limit to prevent performance issues
    custom: (value) => {
      if (!Array.isArray(value)) return null;
      
      for (const id of value) {
        if (typeof id !== 'string' || id.trim().length === 0) {
          return 'All entity IDs must be non-empty strings';
        }
      }
      
      return null;
    },
  },
  domainIds: {
    required: false,
    type: 'array',
    max: 50,
    custom: (value) => {
      if (!Array.isArray(value)) return null;
      
      for (const id of value) {
        if (typeof id !== 'string' || id.trim().length === 0) {
          return 'All domain IDs must be non-empty strings';
        }
      }
      
      return null;
    },
  },
  mailboxIds: {
    required: false,
    type: 'array',
    max: 100,
    custom: (value) => {
      if (!Array.isArray(value)) return null;
      
      for (const id of value) {
        if (typeof id !== 'string' || id.trim().length === 0) {
          return 'All mailbox IDs must be non-empty strings';
        }
      }
      
      return null;
    },
  },
  granularity: {
    required: false,
    type: 'string',
    enum: ['day', 'week', 'month'] as const,
  },
  companyId: {
    required: false,
    type: 'string',
    min: 1,
  },
};

/**
 * Schema for performance metrics
 */
export const performanceMetricsSchema: ValidationSchema = {
  sent: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value) => {
      if (!Number.isInteger(value as number)) {
        return 'Sent count must be an integer';
      }
      return null;
    },
  },
  delivered: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value, data) => {
      if (!Number.isInteger(value as number)) {
        return 'Delivered count must be an integer';
      }
      
      const sent = (data as Record<string, unknown>).sent as number;
      if (typeof sent === 'number' && (value as number) > sent) {
        return 'Delivered count cannot exceed sent count';
      }
      
      return null;
    },
  },
  opened_tracked: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value, data) => {
      if (!Number.isInteger(value as number)) {
        return 'Opened count must be an integer';
      }
      
      const delivered = (data as Record<string, unknown>).delivered as number;
      if (typeof delivered === 'number' && (value as number) > delivered) {
        return 'Opened count cann exceed delivered count';
      }
      
      return null;
    },
  },
  clicked_tracked: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value, data) => {
      if (!Number.isInteger(value as number)) {
        return 'Clicked count must be an integer';
      }
      
      const opened = (data as Record<string, unknown>).opened_tracked as number;
      if (typeof opened === 'number' && (value as number) > opened) {
        return 'Clicked count cannot exceed opened count';
      }
      
      return null;
    },
  },
  replied: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value) => {
      if (!Number.isInteger(value as number)) {
        return 'Replied count must be an integer';
      }
      return null;
    },
  },
  bounced: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value, data) => {
      if (!Number.isInteger(value as number)) {
        return 'Bounced count must be an integer';
      }
      
      const sent = (data as Record<string, unknown>).sent as number;
      if (typeof sent === 'number' && (value as number) > sent) {
        return 'Bounced count cannot exceed sent count';
      }
      
      return null;
    },
  },
  unsubscribed: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value) => {
      if (!Number.isInteger(value as number)) {
        return 'Unsubscribed count must be an integer';
      }
      return null;
    },
  },
  spamComplaints: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value) => {
      if (!Number.isInteger(value as number)) {
        return 'Spam complaints count must be an integer';
      }
      return null;
    },
  },
};

/**
 * Schema for pagination parameters
 */
export const paginationSchema: ValidationSchema = {
  limit: {
    required: true,
    type: 'number',
    min: 1,
    max: 100,
    custom: (value) => {
      if (!Number.isInteger(value as number)) {
        return 'Limit must be an integer';
      }
      return null;
    },
  },
  offset: {
    required: true,
    type: 'number',
    min: 0,
    custom: (value) => {
      if (!Number.isInteger(value as number)) {
        return 'Offset must be an integer';
      }
      return null;
    },
  },
};

// ============================================================================
// DOMAIN-SPECIFIC SCHEMAS
// ============================================================================

/**
 * Schema for campaign analytics data
 */
export const campaignAnalyticsSchema: ValidationSchema<Partial<CampaignAnalytics>> = {
  campaignId: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
  },
  campaignName: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
  },
  status: {
    required: true,
    type: 'string',
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'] as CampaignStatus[],
  },
  leadCount: {
    required: false,
    type: 'number',
    min: 0,
    custom: (value) => {
      if (value !== undefined && !Number.isInteger(value as number)) {
        return 'Lead count must be an integer';
      }
      return null;
    },
  },
  activeLeads: {
    required: false,
    type: 'number',
    min: 0,
    custom: (value, data) => {
      if (value === undefined) return null;
      
      if (!Number.isInteger(value as number)) {
        return 'Active leads must be an integer';
      }
      
      const leadCount = (data as Record<string, unknown>).leadCount as number;
      if (typeof leadCount === 'number' && (value as number) > leadCount) {
        return 'Active leads cannot exceed total lead count';
      }
      
      return null;
    },
  },
  completedLeads: {
    required: false,
    type: 'number',
    min: 0,
    custom: (value, data) => {
      if (value === undefined) return null;
      
      if (!Number.isInteger(value as number)) {
        return 'Completed leads must be an integer';
      }
      
      const leadCount = (data as Record<string, unknown>).leadCount as number;
      if (typeof leadCount === 'number' && (value as number) > leadCount) {
        return 'Completed leads cannot exceed total lead count';
      }
      
      return null;
    },
  },
};

/**
 * Schema for domain analytics data
 */
export const domainAnalyticsSchema: ValidationSchema<Partial<DomainAnalytics>> = {
  domainId: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
  },
  domainName: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
    pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  },
  authentication: {
    required: false,
    type: 'object',
    custom: (value) => {
      if (!value) return null;
      
      const auth = value as Record<string, unknown>;
      const requiredFields = ['spf', 'dkim', 'dmarc'];
      
      for (const field of requiredFields) {
        if (typeof auth[field] !== 'boolean') {
          return `Authentication.${field} must be a boolean`;
        }
      }
      
      return null;
    },
  },
};

/**
 * Schema for mailbox analytics data
 */
export const mailboxAnalyticsSchema: ValidationSchema<Partial<MailboxAnalytics>> = {
  mailboxId: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
  },
  email: {
    required: true,
    type: 'email',
  },
  domain: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
    pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  },
  provider: {
    required: false,
    type: 'string',
    min: 1,
    max: 100,
  },
  warmupStatus: {
    required: false,
    type: 'string',
    enum: ['NOT_STARTED', 'WARMING', 'WARMED', 'PAUSED'] as WarmupStatus[],
  },
  warmupProgress: {
    required: false,
    type: 'number',
    min: 0,
    max: 100,
  },
  dailyLimit: {
    required: false,
    type: 'number',
    min: 0,
    max: 10000,
    custom: (value) => {
      if (value !== undefined && !Number.isInteger(value as number)) {
        return 'Daily limit must be an integer';
      }
      return null;
    },
  },
  currentVolume: {
    required: false,
    type: 'number',
    min: 0,
    custom: (value, data) => {
      if (value === undefined) return null;
      
      if (!Number.isInteger(value as number)) {
        return 'Current volume must be an integer';
      }
      
      const dailyLimit = (data as Record<string, unknown>).dailyLimit as number;
      if (typeof dailyLimit === 'number' && (value as number) > dailyLimit) {
        return 'Current volume cannot exceed daily limit';
      }
      
      return null;
    },
  },
  healthScore: {
    required: false,
    type: 'number',
    min: 0,
    max: 100,
  },
};

/**
 * Schema for lead analytics data
 */
export const leadAnalyticsSchema: ValidationSchema<Partial<LeadAnalytics>> = {
  leadId: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
  },
  email: {
    required: true,
    type: 'email',
  },
  company: {
    required: false,
    type: 'string',
    min: 1,
    max: 255,
  },
  status: {
    required: true,
    type: 'string',
    enum: ['ACTIVE', 'REPLIED', 'BOUNCED', 'UNSUBSCRIBED', 'COMPLETED'] as LeadStatus[],
  },
};

/**
 * Schema for template analytics data
 */
export const templateAnalyticsSchema: ValidationSchema<Partial<TemplateAnalytics>> = {
  templateId: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
  },
  templateName: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
  },
  category: {
    required: false,
    type: 'string',
    min: 1,
    max: 100,
  },
  usage: {
    required: false,
    type: 'number',
    min: 0,
    custom: (value) => {
      if (value !== undefined && !Number.isInteger(value as number)) {
        return 'Usage count must be an integer';
      }
      return null;
    },
  },
};

/**
 * Schema for billing analytics data
 */
export const billingAnalyticsSchema: ValidationSchema<Partial<BillingAnalytics>> = {
  companyId: {
    required: true,
    type: 'string',
    min: 1,
    max: 255,
  },
  planType: {
    required: true,
    type: 'string',
    min: 1,
    max: 100,
  },
  usage: {
    required: false,
    type: 'object',
    custom: (value) => {
      if (!value) return null;
      
      const usage = value as Record<string, unknown>;
      const requiredFields = [
        'emailsSent', 'emailsRemaining', 'domainsUsed', 'domainsLimit',
        'mailboxesUsed', 'mailboxesLimit'
      ];
      
      for (const field of requiredFields) {
        if (typeof usage[field] !== 'number' || usage[field] < 0) {
          return `Usage.${field} must be a non-negative number`;
        }
        
        if (!Number.isInteger(usage[field] as number)) {
          return `Usage.${field} must be an integer`;
        }
      }
      
      // Validate usage doesn't exceed limits
      if (typeof usage.domainsUsed === 'number' && typeof usage.domainsLimit === 'number' && usage.domainsUsed > usage.domainsLimit) {
        return 'Domains used cannot exceed domains limit';
      }
      
      if (typeof usage.mailboxesUsed === 'number' && typeof usage.mailboxesLimit === 'number' && usage.mailboxesUsed > usage.mailboxesLimit) {
        return 'Mailboxes used cannot exceed mailboxes limit';
      }
      
      return null;
    },
  },
  costs: {
    required: false,
    type: 'object',
    custom: (value) => {
      if (!value) return null;
      
      const costs = value as Record<string, unknown>;
      const requiredFields = ['currentPeriod', 'projectedCost', 'currency'];
      
      for (const field of requiredFields) {
        if (field === 'currency') {
          if (typeof costs[field] !== 'string' || (costs[field] as string).length !== 3) {
            return 'Currency must be a 3-letter currency code';
          }
        } else {
          if (typeof costs[field] !== 'number' || costs[field] < 0) {
            return `Costs.${field} must be a non-negative number`;
          }
        }
      }
      
      return null;
    },
  },
};

// ============================================================================
// BULK OPERATION SCHEMAS
// ============================================================================

/**
 * Schema for bulk update operations
 */
export const bulkUpdateSchema: ValidationSchema = {
  updates: {
    required: true,
    type: 'array',
    min: 1,
    max: 100, // Limit bulk operations to prevent performance issues
    custom: (value) => {
      if (!Array.isArray(value)) return null;
      
      for (let i = 0; i < value.length; i++) {
        const update = value[i];
        if (!update || typeof update !== 'object') {
          return `Update at index ${i} must be an object`;
        }
        
        const typedUpdate = update as Record<string, unknown>;
        if (!typedUpdate.id || typeof typedUpdate.id !== 'string') {
          return `Update at index ${i} must have a valid ID`;
        }
        
        if (!typedUpdate.data || typeof typedUpdate.data !== 'object') {
          return `Update at index ${i} must have valid data`;
        }
      }
      
      return null;
    },
  },
};

/**
 * Schema for export operations
 */
export const exportSchema: ValidationSchema = {
  format: {
    required: false,
    type: 'string',
    enum: ['csv', 'json', 'xlsx'] as const,
    transform: (value) => value || 'csv', // Default to CSV
  },
  includeHeaders: {
    required: false,
    type: 'boolean',
    transform: (value) => value !== false, // Default to true
  },
  fields: {
    required: false,
    type: 'array',
    max: 50,
    custom: (value) => {
      if (!Array.isArray(value)) return null;
      
      for (const field of value) {
        if (typeof field !== 'string' || field.trim().length === 0) {
          return 'All field names must be non-empty strings';
        }
      }
      
      return null;
    },
  },
};

// ============================================================================
// TIME SERIES SCHEMAS
// ============================================================================

/**
 * Schema for time series data points
 */
export const timeSeriesDataPointSchema: ValidationSchema = {
  date: {
    required: true,
    type: 'string',
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    custom: (value) => {
      const date = new Date(value as string);
      if (isNaN(date.getTime())) {
        return 'Date must be a valid ISO date string (YYYY-MM-DD)';
      }
      return null;
    },
  },
  label: {
    required: true,
    type: 'string',
    min: 1,
    max: 100,
  },
  metrics: {
    required: true,
    type: 'object',
    // Would validate against performanceMetricsSchema
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get validation schema by analytics type
 */
export function getAnalyticsSchema(
  type: 'campaign' | 'domain' | 'mailbox' | 'lead' | 'template' | 'billing'
): ValidationSchema<unknown> {
  switch (type) {
    case 'campaign':
      return campaignAnalyticsSchema as ValidationSchema<unknown>;
    case 'domain':
      return domainAnalyticsSchema as ValidationSchema<unknown>;
    case 'mailbox':
      return mailboxAnalyticsSchema as ValidationSchema<unknown>;
    case 'lead':
      return leadAnalyticsSchema as ValidationSchema<unknown>;
    case 'template':
      return templateAnalyticsSchema as ValidationSchema<unknown>;
    case 'billing':
      return billingAnalyticsSchema as ValidationSchema<unknown>;
    default:
      throw new Error(`Unknown analytics type: ${type}`);
  }
}

/**
 * Validate analytics data with appropriate schema
 */
export function validateAnalyticsData<T>(
  data: unknown,
  _type: 'campaign' | 'domain' | 'mailbox' | 'lead' | 'template' | 'billing'
): { isValid: boolean; data?: T; errors?: string[] } {
  // This would use the validateSchema function from validation.ts
  // For now, return a basic structure
  return {
    isValid: true,
    data: data as T,
    errors: [],
  };
}

/**
 * Common validation patterns for IDs
 */
export const idValidationPatterns = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  nanoid: /^[A-Za-z0-9_-]{21}$/,
  custom: /^[a-zA-Z0-9_-]+$/,
} as const;

/**
 * Common validation patterns for other fields
 */
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  domain: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
} as const;
