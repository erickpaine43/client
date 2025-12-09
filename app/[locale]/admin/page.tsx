import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminDashboardSkeleton } from "@/components/admin/AdminDashboardSkeleton";

export default function AdminPage() {
  console.log("AdminPage: Page component loaded");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Cross-tenant user management and analytics
          </p>
        </div>

        <Suspense fallback={<AdminDashboardSkeleton />}>
          <AdminDashboard />
        </Suspense>
      </div>
    </div>
  );
}
