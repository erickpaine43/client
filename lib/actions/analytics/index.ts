/**
 * Analytics Actions - Standardized Module
 * 
 * This module provides consistent analytics actions using ConvexQueryHelper
 * for all analytics operations. It replaces the scattered analytics actions
 * with a unified, type-safe, and well-tested approach.
 */

export * from './billing-analytics';
export * from './campaign-analytics';
export * from './domain-analytics';
export * from './lead-analytics';
export * from './mailbox-analytics';
export * from './template-analytics';
export * from './cross-domain-analytics';

// Re-export common types for convenience
export type {
  AnalyticsFilters,
  PerformanceMetrics,
  TimeSeriesDataPoint,
  AnalyticsComputeOptions,
  CalculatedRates,
} from '@/types/analytics/core';

export type {
  BillingAnalytics,
  CampaignAnalytics,
  DomainAnalytics,
  LeadAnalytics,
  MailboxAnalytics,
  TemplateAnalytics,
} from '@/types/analytics/domain-specific';
