"use client";
import nextDynamic from "next/dynamic";

// Dynamically import the entire page component to prevent SSR issues
const AnalyticsMailboxesPage = nextDynamic(
  () => import("./AnalyticsMailboxesPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading analytics...</div>
  }
);

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function Page() {
  return <AnalyticsMailboxesPage />;
}
