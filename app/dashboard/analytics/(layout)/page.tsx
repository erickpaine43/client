"use client";

// Import the migrated analytics dashboard
import MigratedAnalyticsDashboard from "@/components/analytics/dashboard/AnalyticsDashboardMigrated";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

/**
 * Updated Analytics Page using migrated components with:
 * - Standardized field names (opened_tracked, clicked_tracked, etc.)
 * - Real-time updates via Convex subscriptions
 * - AnalyticsCalculator for all rate calculations
 * - Skeleton loaders for better UX
 * - KPIDisplayConfig interface for dashboard cards
 */
function AnalyticsPage() {
  return <MigratedAnalyticsDashboard />;
}

export default AnalyticsPage;
