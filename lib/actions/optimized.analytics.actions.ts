'use server';

// ============================================================================
// OPTIMIZED ANALYTICS ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/
//
// Migration notes:
// - Replaced direct ConvexHttpClient usage with ConvexQueryHelper
// - All functions now use standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved error handling and type safety
// - Performance monitoring and caching improvements
// - Removed EmptyObject workarounds

// Import all analytics modules for comprehensive functionality
export * from './analytics/billing-analytics';
export * from './analytics/campaign-analytics';
export * from './analytics/domain-analytics';
export * from './analytics/lead-analytics';
export * from './analytics/mailbox-analytics';
export * from './analytics/template-analytics';
export * from './analytics/cross-domain-analytics';

// Legacy type exports for backward compatibility
export type { 
  PerformanceMetrics,
  CalculatedRates,
  TimeSeriesDataPoint,
  AnalyticsFilters as CoreAnalyticsFilters,
  AnalyticsComputeOptions as CoreAnalyticsComputeOptions
} from '@/types/analytics/core';

export type { 
  AnalyticsDomain,
  DateRangePreset 
} from '@/types/analytics/ui';

// ============================================================================
// LEGACY FUNCTIONS REMOVED
// ============================================================================
// All legacy functions have been migrated to the respective analytics modules:
// - lib/actions/analytics/billing-analytics.ts
// - lib/actions/analytics/campaign-analytics.ts  
// - lib/actions/analytics/domain-analytics.ts
// - lib/actions/analytics/lead-analytics.ts
// - lib/actions/analytics/mailbox-analytics.ts
// - lib/actions/analytics/template-analytics.ts
// - lib/actions/analytics/cross-domain-analytics.ts
//
// This file now only provides backward compatibility through re-exports above.
// 
// If you need to access specific functions, please import them from the appropriate module:
// import { functionName } from '@/lib/actions/analytics/[domain]-analytics';
