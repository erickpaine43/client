import { DashboardLayout } from "@/components/layout/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome. Your account was created successfully.
        </p>
      </div>
    </DashboardLayout>
  );
}
