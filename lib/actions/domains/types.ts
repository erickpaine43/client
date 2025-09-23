// Domains module - Type definitions
import { Domain, EmailAccount } from "@/types/domain";
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

export interface DomainWithAccounts {
  domain: { id: string; name: string };
  emailAccounts: EmailAccount[];
}

export interface DNSRecord {
  name: string;
  value: string;
}

export interface DomainsData {
  domains: Domain[];
  dnsRecords: DNSRecord[];
}
