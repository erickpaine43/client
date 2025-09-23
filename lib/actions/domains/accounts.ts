'use server';

import { domains, mailboxes } from "@/lib/data/domains.mock";
import { EmailAccount, EmailAccountStatus, VerificationStatus, DomainAccountCreationType, RelayType } from "@/types/domain";
import { EmailProvider } from "@/components/domains/components/constants";
import { DomainWithAccounts } from './types';

export type { DomainWithAccounts };

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

export async function getDomainWithAccounts(domainId: number): Promise<DomainWithAccounts | null> {
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
