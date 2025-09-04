'use server';

import { domains, mailboxes } from "@/lib/data/domains.mock";
import { Domain } from "@/types";
import { Mailbox } from "@/types/mailbox";

export interface DomainWithMailboxesData {
  domain: Domain;
  mailboxes: Mailbox[];
  aggregated: {
    totalMailboxes: number;
    activeMailboxes: number;
    totalSent: number;
    avgDailyLimit: number;
    totalWarmups: number;
    avgWarmupProgress: number;
    statusSummary: {
      NOT_STARTED: number;
      WARMING: number;
      WARMED: number;
      PAUSED: number;
    };
  };
}

export async function getDomainsData() {
  const dnsRecords = [
    {
      name: "SPF Record",
      value: "v=spf1 include:_spf.google.com ~all",
    },
    {
      name: "DKIM Record",
      value: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3...",
    },
    {
      name: "DMARC Record",
      value: "v=DMARC1; p=quarantine; rua=mailto:...",
    },
    {
      name: "MX Record",
      value: "10 mx1.emailprovider.com",
    },
  ];

  return { domains, dnsRecords };
}

export async function getDomainsWithMailboxesData(
  userid?: string,
  companyid?: string
): Promise<DomainWithMailboxesData[]> {
  console.log(`Fetching domains with mailboxes for user: ${userid}, company: ${companyid}`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Group mailboxes by domain
  const domainGroups = mailboxes.reduce((groups, mailbox) => {
    if (!groups[mailbox.domain]) {
      groups[mailbox.domain] = [];
    }
    groups[mailbox.domain].push(mailbox);
    return groups;
  }, {} as Record<string, Mailbox[]>);

  // Create aggregated data for each domain
  const result: DomainWithMailboxesData[] = domains.map(domain => {
    const domainMailboxes = domainGroups[domain.domain] || [];

    // Calculate aggregates
    const totalMailboxes = domainMailboxes.length;
    const activeMailboxes = domainMailboxes.filter(mb => mb.status === 'ACTIVE').length;
    const totalSent = domainMailboxes.reduce((sum, mb) => sum + mb.totalSent, 0);
    const totalWarmups = domainMailboxes.reduce((sum, mb) => sum + (mb.sent24h || 0), 0);
    const avgDailyLimit = totalMailboxes > 0 ? Math.round(domainMailboxes.reduce((sum, mb) => sum + mb.dailyLimit, 0) / totalMailboxes) : 0;
    const avgWarmupProgress = totalMailboxes > 0 ? Math.round(domainMailboxes.reduce((sum, mb) => sum + mb.warmupProgress, 0) / totalMailboxes) : 0;

    // Status summary
    const statusSummary = domainMailboxes.reduce((summary, mb) => {
      summary[mb.warmupStatus] = (summary[mb.warmupStatus] || 0) + 1;
      return summary;
    }, { NOT_STARTED: 0, WARMING: 0, WARMED: 0, PAUSED: 0 } as DomainWithMailboxesData['aggregated']['statusSummary']);

    return {
      domain,
      mailboxes: domainMailboxes,
      aggregated: {
        totalMailboxes,
        activeMailboxes,
        totalSent,
        avgDailyLimit,
        totalWarmups,
        avgWarmupProgress,
        statusSummary,
      },
    };
  });

  return result;
}
