"use client";

import React from "react";
import AppSideBar from "@/components/layout/components/Sidebar";
import DashboardHeader from "@/components/layout/components/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  backHref?: string;
}

/**
 * Unified Dashboard Layout component that consolidates layout patterns
 * Uses existing UI components (Card, Breadcrumb, Button) and AppSideBar with SidebarProvider
 * Provides consistent layout structure across dashboard pages
 */
export function DashboardLayout({
  children,
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
  showBackButton = false,
  backHref = "/",
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset className="max-w-10/12 md:peer-data-[variant=inset]:shadow-none gap-5 overflow-hidden">
        <div className="rounded-lg shadow-sm">
          <DashboardHeader />
        </div>
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 rounded-lg shadow-sm">
          <div className={cn("space-y-6", className)}>
            {/* Header Section */}
            <PageHeader
              title={title}
              description={description}
              breadcrumbs={breadcrumbs}
              actions={actions}
              showBackButton={showBackButton}
              backHref={backHref}
            />

            {/* Main Content */}
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardLayout;
