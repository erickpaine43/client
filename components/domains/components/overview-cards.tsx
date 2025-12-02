"use client";
import { getDomainsData } from "@/lib/actions/domains";
import { CheckCircle, Clock, Globe, Mail } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useState, useEffect } from "react";
import type { MailboxWarmupData, Domain } from "@/types";
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";

function OverviewCards() {
  const [mailboxes, setMailboxes] = useState<MailboxWarmupData[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const { fetchMailboxes } = useAnalytics();

  // Skip analytics calls during SSR
  const isSSR = typeof window === 'undefined';

  useEffect(() => {
    if (isSSR) return; // Skip during SSR

    const getMailboxes = async () => {
      try {
        const data = await fetchMailboxes();
        setMailboxes(data);
      } catch (error) {
        console.error("Failed to fetch mailboxes:", error);
      }
    };
    getMailboxes();
  }, [fetchMailboxes, isSSR]);

  useEffect(() => {
    const getDomains = async () => {
      try {
        const { domains: domainsData } = await getDomainsData();
        setDomains(domainsData);
      } catch (error) {
        console.error("Failed to fetch domains:", error);
      }
    };
    getDomains();
  }, []);

  const readyMailboxes = mailboxes.filter((m) => m.status === "active").length; // Active means ready to send
  const warmingMailboxes = mailboxes.filter((m) => m.status === "warming").length;

  const cards = [
    {
      title: "Total Domains",
      value: domains.length,
      icon: Globe,
      color: "primary" as const,
    },
    {
      title: "Active Mailboxes",
      value: mailboxes.length,
      icon: Mail,
      color: "info" as const,
    },
    {
      title: "Ready to Send",
      value: readyMailboxes,
      icon: CheckCircle,
      color: "success" as const,
    },
    {
      title: "Warming Up",
      value: warmingMailboxes,
      icon: Clock,
      color: "warning" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <UnifiedStatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}
export default OverviewCards;
