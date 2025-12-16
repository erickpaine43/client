/**
 * MIGRATION NOTE: AnalyticsDashboardMigrated.tsx
 * 
 * This file has been partially migrated from Convex to NileDB.
 * 
 * COMPLETED:
 * - Removed non-existent hooks: useMailboxes, useCampaignAnalytics
 * - Removed AnalyticsContext dependency
 * - Now uses useDomainAnalytics (migrated hook)
 * - Created AnalyticsCalculator utility
 * 
 * REMAINING ISSUES:
 * The following child components expect CampaignAnalytics but receive DomainAnalytics:
 * - MigratedOverviewBarChart
 * - MigratedOverviewLineChart  
 * - MigratedPerformanceFilter
 * - MigratedAnalyticsOverview
 * 
 * SOLUTIONS:
 * 1. Update these components to accept DomainAnalytics instead of CampaignAnalytics
 * 2. OR create adapter functions to transform DomainAnalytics -> CampaignAnalytics format
 * 3. OR use a different dashboard component that works with DomainAnalytics
 * 
 * RECOMMENDATION:
 * Use DomainAnalyticsDashboard.tsx instead, which is fully compatible with
 * the migrated useDomainAnalytics hook and doesn't have these dependencies.
 */
