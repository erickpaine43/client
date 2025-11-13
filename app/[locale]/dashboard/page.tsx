import MigratedDashboardContent from "./MigratedDashboardContent";

/**
 * Updated Dashboard Page using migrated components with:
 * - Real-time analytics KPIs using AnalyticsCalculator
 * - Standardized field names (opened_tracked, clicked_tracked, etc.)
 * - Convex subscriptions for live updates
 * - Skeleton loaders for better UX
 */
export default function DashboardPage() {
  return <MigratedDashboardContent />;
}
