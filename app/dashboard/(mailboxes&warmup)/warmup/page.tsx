"use client";

import { useState } from "react";
// import { useAnalytics } from "@/context/AnalyticsContext";
import { DomainWithMailboxesData } from "@/lib/actions/domains";
import WarmupTab from "@/components/domains/components/warmup-tab";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

function Page() {
  // Temporarily disable analytics context to fix SSR issue
  // const { fetchDomainsWithMailboxes } = useAnalytics();
  const [domainsData] = useState<DomainWithMailboxesData[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchDomains = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const data = await fetchDomainsWithMailboxes();
  //       setDomainsData(data);
  //     } catch (err) {
  //       console.error('Failed to fetch domains:', err);
  //       setError('Failed to load domain data');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDomains();
  // }, [fetchDomainsWithMailboxes]);

  return <WarmupTab domainsData={domainsData} loading={loading} error={error} />;
}

export default Page;
