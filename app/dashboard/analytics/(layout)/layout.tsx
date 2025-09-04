import AnalyticsHeaderActions from "@/components/analytics/actions/AnalyticsHeaderActions";
import AnalyticsProviderClient from "@/components/analytics/AnalyticsProviderClient";

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
