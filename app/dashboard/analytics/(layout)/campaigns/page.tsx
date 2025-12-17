"use client";
import nextDynamic from "next/dynamic";

// Dynamically import the entire page component to prevent SSR issues
const AnalyticsCampaignsPage = nextDynamic(
  () => import("./AnalyticsCampaignsPageContent"),
  {
    ssr: false,
    loading: () => <div>Loading analytics...</div>
  }
);

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function Page() {
  return <AnalyticsCampaignsPage />;
}
