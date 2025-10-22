/**
 * Domains TypeScript Interface
 * Defines the structure for domain management and verification
 */

export interface Domain {
  id?: string;
  companyId: string;
  domain: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  dnsRecords: DNSRecord[];
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
  verifiedAt?: string;
}

/**
 * Domain creation/update payload
 */
export interface DomainInput {
  domain?: string;
  verificationStatus?: 'pending' | 'verified' | 'failed';
  dnsRecords?: DNSRecord[];
  isPrimary?: boolean;
}

/**
 * Domain response (without internal fields)
 */
export interface DomainResponse {
  id: string;
  domain: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  dnsRecords: DNSRecord[];
  isPrimary: boolean;
  verifiedAt?: string;
  updatedAt: string;
}

/**
 * DNS Record structure for domain verification
 */
export interface DNSRecord {
  type: 'TXT' | 'MX' | 'CNAME' | 'A' | 'AAAA';
  name: string;
  value: string;
  ttl?: number;
}

/**
 * Domain verification status enum
 */
export enum DomainVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed'
}

/**
 * Domain validation result
 */
export interface DomainValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
