import Header from "@/components/layout/components/DashboardHeader";
import AppSideBar from "@/components/layout/components/Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ClientAnalyticsProvider } from "@/components/analytics/AnalyticsProviderClient";
import React from "react";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ClientAnalyticsProvider>
        <SidebarProvider>
          <AppSideBar />
          <SidebarInset className="max-w-10/12  md:peer-data-[variant=inset]:shadow-none gap-5  overflow-hidden">
            <div className=" rounded-lg shadow-sm">
              <Header />
            </div>
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6  rounded-lg shadow-sm">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </ClientAnalyticsProvider>
    </ProtectedRoute>
  );
}
