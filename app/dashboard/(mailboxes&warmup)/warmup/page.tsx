"use client";

import { useState, useEffect } from "react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { DomainWithMailboxesData } from "@/lib/actions/domains";
import WarmupTab from "@/components/domains/components/warmup-tab";

function Page() {
  const { fetchDomainsWithMailboxes } = useAnalytics();
  const [domainsData, setDomainsData] = useState<DomainWithMailboxesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDomainsWithMailboxes();
        setDomainsData(data);
      } catch (err) {
        console.error('Failed to fetch domains:', err);
        setError('Failed to load domain data');
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, [fetchDomainsWithMailboxes]);

  return <WarmupTab domainsData={domainsData} loading={loading} error={error} />;
}

export default Page;
