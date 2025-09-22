'use server';

import { domains, mailboxes } from "@/lib/data/domains.mock";
import { Domain, EmailAccount, EmailAccountStatus } from "@/types/domain";
import { Mailbox } from "@/types/mailbox";
import { DomainSettings, DNSProvider } from "@/types/domains";
import { EmailProvider } from "@/components/domains/components/constants";
import { VerificationStatus, DomainAccountCreationType, RelayType } from "@/types/domain";

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
  return domain as Domain; // Cast to Domain
}

export async function getTopAccountsForDomain(domainId: number, limit = 10): Promise<EmailAccount[]> {
  const domainObj = domains.find(d => d.id === domainId);
  if (!domainObj) return [];
  const domainMailboxes = mailboxes.filter(mb => mb.domain === domainObj.domain);

  const accounts: EmailAccount[] = domainMailboxes.slice(0, limit).map(mb => ({
    id: mb.id,
    email: mb.email,
    provider: mb.provider,
    status: mb.status as EmailAccountStatus,
    reputation: mb.reputation,
    warmupStatus: mb.warmupStatus,
    dayLimit: mb.dailyLimit,
    sent24h: mb.sent24h,
    lastSync: mb.lastSync,
    spf: mb.spf,
    dkim: mb.dkim,
    dmarc: mb.dmarc,
    createdAt: mb.createdAt,
    updatedAt: mb.updatedAt,
    companyId: mb.companyId,
    createdById: mb.createdById,
  }));
  return accounts;
}

export async function getDomainSettings(domainId: number): Promise<DomainSettings | null> {
  const domain = domains.find(d => d.id === domainId);
  if (!domain || !domain.authentication) {
    return null;
  }

 return {
   domain: domain.name || domain.domain,
   // Top-level properties for the settings page
   warmupEnabled: domain.warmupEnabled || false,
   dailyIncrease: domain.dailyIncrease || 10,
   maxDailyEmails: domain.maxDailyEmails || 1000,
   initialDailyVolume: domain.initialDailyVolume || 10,
   warmupSpeed: (domain.warmupSpeed || "moderate") as "slow" | "moderate" | "fast",
   replyRate: domain.replyRate || "80",
   threadDepth: domain.threadDepth || "3",
   autoAdjustWarmup: domain.autoAdjustWarmup || false,
   authentication: {
     ...domain.authentication,
     spf: {
       ...domain.authentication.spf,
       policy: domain.authentication.spf.policy as "strict" | "soft" | "neutral",
     },
     dmarc: {
       ...domain.authentication.dmarc,
       policy: domain.authentication.dmarc.policy as "none" | "quarantine" | "reject",
     },
   },
   warmup: {
     enabled: domain.warmupEnabled || false,
     initialDailyVolume: domain.initialDailyVolume || 10,
     dailyIncrease: domain.dailyIncrease || 10,
     maxDailyEmails: domain.maxDailyEmails || 1000,
     warmupSpeed: (domain.warmupSpeed || "moderate") as "slow" | "moderate" | "fast",
     replyRate: domain.replyRate || "80",
     threadDepth: domain.threadDepth || "3",
     autoAdjustWarmup: domain.autoAdjustWarmup || false,
   },
   reputationFactors: {
     bounceRate: domain.metrics ? (domain.metrics.bounced / domain.metrics.sent) * 100 : 0,
     spamComplaints: domain.metrics?.spamComplaints || 0,
     engagement: domain.metrics ? (domain.metrics.opened_tracked / domain.metrics.sent) * 100 : 0,
   },
   provider: DNSProvider.OTHER, // Default since "Google Workspace" doesn't match enum
 };
}

export async function getDomainWithAccounts(domainId: number): Promise<{
  domain: { id: string; name: string };
  emailAccounts: EmailAccount[];
} | null> {
  const domain = domains.find(d => d.id === domainId);
  if (!domain) return null;

  const domainMailboxes = mailboxes.filter(mb => mb.domain === domain.domain);
  const accounts: EmailAccount[] = domainMailboxes.map(mb => ({
    id: mb.id,
    email: mb.email,
    provider: mb.provider,
    status: mb.status as EmailAccountStatus,
    reputation: mb.reputation,
    warmupStatus: mb.warmupStatus,
    dayLimit: mb.dailyLimit,
    sent24h: mb.sent24h,
    lastSync: mb.lastSync,
    spf: mb.spf,
    dkim: mb.dkim,
    dmarc: mb.dmarc,
    createdAt: mb.createdAt,
    updatedAt: mb.updatedAt,
    companyId: mb.companyId,
    createdById: mb.createdById,
  }));

  return {
    domain: {
      id: domainId.toString(),
      name: domain.name || domain.domain,
    },
    emailAccounts: accounts,
  };
}

export async function getAccountDetails(accountId: number) {
  console.log(`Fetching account details for ID: ${accountId}`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const mailbox = mailboxes.find(mb => mb.id === accountId);
  if (!mailbox) {
    return null;
  }

  const domain = domains.find(d => d.domain === mailbox.domain);
  if (!domain) {
    return null;
  }

  // Map provider string to EmailProvider enum
  const providerMap: Record<string, EmailProvider> = {
    'Gmail': EmailProvider.GMAIL,
    'Outlook': EmailProvider.OUTLOOK,
    'Office 365': EmailProvider.OFFICE365,
    'SMTP': EmailProvider.SMTP,
    'SendGrid': EmailProvider.SENDGRID,
    'Mailgun': EmailProvider.MAILGUN,
    'Amazon SES': EmailProvider.AMAZON_SES,
    'Custom SMTP': EmailProvider.SMTP,
    'Yahoo': EmailProvider.YAHOO,
    'Zoho': EmailProvider.ZOHO,
  };

  return {
    email: mailbox.email,
    provider: providerMap[mailbox.provider] || EmailProvider.SMTP,
    status: mailbox.status as EmailAccountStatus,
    reputation: mailbox.reputation,
    warmupStatus: mailbox.warmupStatus,
    dayLimit: mailbox.dailyLimit,
    sent24h: mailbox.sent24h,
    password: "currentpassword",
    accountType: mailbox.accountType as DomainAccountCreationType,
    accountSmtpAuthStatus: mailbox.status === "ACTIVE" ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
    relayType: RelayType.DEFAULT_SERVER_CONFIG,
    virtualMailboxMapping: `${mailbox.email.split('@')[0]}/`,
    mailboxPath: `/var/mail/${domain.domain}/${mailbox.email.split('@')[0]}`,
    mailboxQuotaMB: 1024,
    warmupDailyIncrement: 10,
    warmupTargetDailyVolume: mailbox.dailyLimit,
    accountSetupStatus: "Configuration Complete",
    accountDeliverabilityStatus: "Checks Passed",
    domainAuthStatus: {
      spfVerified: domain.spf,
      dkimVerified: domain.dkim,
      dmarcVerified: domain.dmarc,
    },
  };
}
