"use client";
import dynamic from "next/dynamic";

// Dynamically import all analytics components to prevent SSR issues
const AnalyticsHeaderActions = dynamic(
  () => import("@/components/analytics/actions/AnalyticsHeaderActions"),
  { ssr: false, loading: () => null }
);

const AnalyticsProviderClient = dynamic(
  () => import("@/components/analytics/AnalyticsProviderClient"),
  { ssr: false, loading: () => <div>Loading...</div> }
);

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProviderClient>
      <div className="space-y-8 ">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Hub</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive performance insights and campaign analytics
            </p>
          </div>
          <div>
            <AnalyticsHeaderActions />
          </div>
        </div>
        <div>{children}</div>
      </div>
    </AnalyticsProviderClient>
  );
}
export default Layout;
