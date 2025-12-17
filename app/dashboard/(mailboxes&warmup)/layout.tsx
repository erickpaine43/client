import { ClientAnalyticsProvider } from "@/components/analytics/AnalyticsProviderClient";
import OverviewCards from "@/components/domains/components/overview-cards";
import TabTrigger from "@/components/domains/components/TabTrigger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { tabs } from "@/lib/data/mailboxes";
import { Suspense } from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAnalyticsProvider>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Mailboxes & Warmups
          </h1>
          <p className="text-gray-600 ">
            Manage your sending mailboxes and warmup processes
          </p>
        </div>
        <Suspense>
          <OverviewCards />
        </Suspense>
        <Card>
          <Tabs defaultValue={tabs.at(0)?.id}>
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
    </ClientAnalyticsProvider>
  );
}
export default Layout;
