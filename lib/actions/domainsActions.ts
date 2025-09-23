'use server';

// DEPRECATED: This file is deprecated and will be removed in a future version.
// Please use the modular domains module instead: lib/actions/domains/
// Migration guide: lib/actions/MIGRATION_GUIDE.md

// Re-export all functions from the new modular structure
export {
  getDomainsData,
  getDomainsWithMailboxesData,
  getDomainById,
  type DomainWithMailboxesData,
  type DomainsData,
  type DNSRecord
} from './domains';

export {
  getTopAccountsForDomain,
  getDomainWithAccounts,
  getAccountDetails,
  type DomainWithAccounts
} from './domains/accounts';

export {
  getDomainSettings
} from './domains/settings';

export {
  getDNSRecords
} from './domains/dns';
