import OverviewCards from "@/components/domains/components/overview-cards";
import TabTrigger from "@/components/domains/components/TabTrigger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { tabs } from "@/lib/data/domains";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { Suspense } from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      <div className="space-y-8 ">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Domains & IPS</h1>
          <p className="text-gray-600 ">
            Manage your sending domains & IPs processes
          </p>
        </div>
        <Suspense>
          <OverviewCards />
        </Suspense>
        <Card>
          <Tabs defaultValue={tabs.at(0)?.id} className="w-full">
            <CardHeader>
              <TabsList className="tabs-list">
                {tabs.map((tab) => (
                  <TabTrigger
                    key={tab.id}
                    href={`/dashboard/${tab.id}`}
                    id={tab.id}
                  >
                    <tab.icon className="h-4 w-4 mr-2 inline-block" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 text-sm ">({tab.count})</span>
                    )}
                  </TabTrigger>
                ))}
              </TabsList>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Tabs>
        </Card>
      </div>
    </AnalyticsProvider>
  );
}
export default Layout;
