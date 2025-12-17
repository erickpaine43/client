"use client";
import nextDynamic from "next/dynamic";

// Dynamically import the entire page component to prevent SSR issues
const AnalyticsWarmupPage = nextDynamic(
  () => import("./AnalyticsWarmupPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading analytics...</div>
  }
);

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function Page() {
  return <AnalyticsWarmupPage />;
}
