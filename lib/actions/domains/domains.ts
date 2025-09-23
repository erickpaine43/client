'use server';

import { domains, mailboxes } from "@/lib/data/domains.mock";
import { Domain } from "@/types/domain";
import { Mailbox } from "@/types/mailbox";
import { DomainWithMailboxesData, DomainsData } from './types';

export async function getDomainsData(): Promise<DomainsData> {
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

  // Transform domains to match Domain interface
  const transformedDomains: Domain[] = domains.map(domain => ({
    ...domain,
    metrics: domain.metrics ? {
      total24h: domain.metrics.sent || 0,
      bounceRate: domain.metrics.bounced && domain.metrics.sent ? (domain.metrics.bounced / domain.metrics.sent) * 100 : 0,
      spamRate: domain.metrics.spamComplaints && domain.metrics.sent ? (domain.metrics.spamComplaints / domain.metrics.sent) * 100 : 0,
      openRate: domain.metrics.opened_tracked && domain.metrics.sent ? (domain.metrics.opened_tracked / domain.metrics.sent) * 100 : 0,
      replyRate: domain.metrics.replied && domain.metrics.sent ? (domain.metrics.replied / domain.metrics.sent) * 100 : 0,
    } : {
      total24h: 0,
      bounceRate: 0,
      spamRate: 0,
      openRate: 0,
      replyRate: 0,
    }
  }));

  return { domains: transformedDomains, dnsRecords };
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

    // Ensure domain conforms to Domain interface
    const domainWithCorrectMetrics: Domain = {
      ...domain,
      metrics: domain.metrics ? {
        total24h: domain.metrics.sent || 0,
        bounceRate: domain.metrics.bounced && domain.metrics.sent ? (domain.metrics.bounced / domain.metrics.sent) * 100 : 0,
        spamRate: domain.metrics.spamComplaints && domain.metrics.sent ? (domain.metrics.spamComplaints / domain.metrics.sent) * 100 : 0,
        openRate: domain.metrics.opened_tracked && domain.metrics.sent ? (domain.metrics.opened_tracked / domain.metrics.sent) * 100 : 0,
        replyRate: domain.metrics.replied && domain.metrics.sent ? (domain.metrics.replied / domain.metrics.sent) * 100 : 0,
      } : {
        total24h: 0,
        bounceRate: 0,
        spamRate: 0,
        openRate: 0,
        replyRate: 0,
      }
    };

    return {
      domain: domainWithCorrectMetrics,
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

export async function getDomainById(domainId: number): Promise<Domain | null> {
  const domain = domains.find(d => d.id === domainId);
  if (!domain) return null;
  return domain as Domain;
}
