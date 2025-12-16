---
title: "Domain Types Documentation"
description: "Documentation for Domain Types Documentation - README"
last_modified_date: "2025-11-19"
level: 2
persona: "Documentation Users"
---

# Domain Types Documentation

## Overview

This directory contains TypeScript type definitions related to domain management, DNS configuration, email authentication, and domain analytics. These types support the domain management features including domain verification, DNS setup, email account management, and domain performance tracking.

## Core Domain Types

### Domain Status and States

```typescript
export type DomainStatus =
  | "PENDING" // Domain added but not yet verified
  | "VERIFIED" // Domain fully configured and verified
  | "SETUP_REQUIRED" // Domain requires additional setup
  | "FAILED" // Domain verification failed
  | "DELETED"; // Domain marked for deletion
```

### Email Account Status

```typescript
export type EmailAccountStatus =
  | "PENDING" // Account being created
  | "ACTIVE" // Account active and operational
  | "ISSUE" // Account has configuration issues
  | "SUSPENDED" // Account temporarily suspended
  | "DELETED"; // Account marked for deletion
```

## Domain Interface Variants

### Core Domain Interface

The primary domain interface used throughout the application:

```typescript
export interface Domain {
  id: number;
  domain: string;
  name?: string; // Optional display name
  provider?: string; // DNS provider (Cloudflare, GoDaddy, etc.)
  status: DomainStatus | string;
  daysActive?: number; // Days since domain was added
  reputation?: number; // Domain reputation score (0-100)
  emailAccounts?: number; // Number of email accounts
  mailboxes?: number; // Alias for emailAccounts (for compatibility)
  spf?: boolean | string; // SPF verification status
  dkim?: boolean | string; // DKIM verification status
  dmarc?: boolean | string; // DMARC verification status
  records?: {
    // DNS record verification status
    spf: string;
    dkim: string;
    dmarc: string;
    mx: string;
  };
  metrics?: {
    // Performance metrics
    total24h: number; // Emails sent in last 24 hours
    bounceRate: number; // Bounce rate percentage
    spamRate: number; // Spam complaint rate
    openRate: number; // Email open rate
    replyRate: number; // Reply rate
  };
  createdAt?: string;
  updatedAt?: string;
  addedDate?: string; // For mock data compatibility
  companyId?: number; // Multi-tenant support
  createdById?: string; // Audit trail
}
```

### DomainDB Interface

For full database operations with required fields:

```typescript
export interface DomainDB
  extends Required<
    Pick<
      Domain,
      | "id"
      | "domain"
      | "status"
      | "createdAt"
      | "updatedAt"
      | "companyId"
      | "createdById"
    >
  > {
  // All required fields from Domain plus additional constraints
}
```

### DomainMock Interface

For development and testing with mock data:

```typescript
export interface DomainMock {
  id: number;
  domain: string;
  status: string;
  mailboxes: number;
  records: {
    spf: string; // "verified" | "pending" | "failed"
    dkim: string;
    dmarc: string;
    mx: string;
  };
  addedDate: string;
  // Optional fields for extended compatibility
  name?: string;
  provider?: string;
  daysActive?: number;
  reputation?: number;
}
```

### DomainAnalytics Interface

For dashboard and analytics displays:

```typescript
export interface DomainAnalytics {
  id: number;
  domain: string;
  status: DomainStatus | string;
  daysActive: number;
  reputation: number;
  emailAccounts: number;
  spf: boolean | string;
  dkim: boolean | string;
  dmarc: boolean | string;
  provider: string;
  // Analytics-specific fields
  totalEmailsSent?: number;
  dailyVolume?: number;
  bounceRate?: number;
  complaintRate?: number;
}
```

## DNS and Email Authentication

### DNS Record Types

```typescript
export type DNSRecordType =
  | "A" // IPv4 address record
  | "AAAA" // IPv6 address record
  | "CNAME" // Canonical name record
  | "MX" // Mail exchange record
  | "TXT" // Text record
  | "SPF" // Sender Policy Framework
  | "DKIM" // DomainKeys Identified Mail
  | "DMARC" // Domain-based Message Authentication
  | "NS" // Name server record
  | "SRV"; // Service record
```

### DNS Record Interface

```typescript
export interface DNSRecord {
  type: DNSRecordType | string;
  name: string; // Record name (subdomain)
  value: string; // Record value
  status: DNSRecordStatus | "verified" | "pending" | "failed";
  description: string; // Human-readable description
  priority?: number; // For MX and SRV records
}
```

### Authentication Configuration

```typescript
export interface DomainAuthentication {
  spf: SPFConfig;
  dkim: DKIMConfig;
  dmarc: DMARCConfig;
}

export interface SPFConfig {
  enabled: boolean;
  record: string;
  policy: "strict" | "soft" | "neutral";
}

export interface DKIMConfig {
  enabled: boolean;
  selector: string;
  key: string;
}

export interface DMARCConfig {
  enabled: boolean;
  policy: "none" | "quarantine" | "reject";
  percentage: number; // Percentage of emails to apply policy to
  reportEmail: string; // Email for DMARC reports
  record: string; // Full DMARC record
}
```

## Email Account Management

### EmailAccount Interface

```typescript
export interface EmailAccount {
  id: number;
  email: string; // Full email address
  provider: string; // Email service provider
  status: EmailAccountStatus;
  reputation: number; // Account reputation score
  warmupStatus: WarmupStatusType; // Email warmup status
  dayLimit: number; // Daily sending limit
  sent24h: number; // Emails sent in last 24 hours
  lastSync: string; // Last synchronization timestamp
  spf: boolean; // SPF verification
  dkim: boolean; // DKIM verification
  dmarc: boolean; // DMARC verification
  createdAt: string;
  updatedAt: string;
  companyId: number;
  createdById: string;
}
```

### Warmup Types

```typescript
export type WarmupStatusType =
  | "NOT_STARTED" // Warmup not yet begun
  | "WARMING" // Currently warming up
  | "WARMED" // Warmup completed
  | "PAUSED"; // Warmup temporarily paused

export interface WarmupConfig {
  enabled: boolean;
  initialDailyVolume: number; // Starting daily email volume
  dailyIncrease: number; // Daily volume increase
  maxDailyEmails: number; // Maximum daily email limit
  warmupSpeed: "slow" | "moderate" | "fast";
  replyRate: string; // Expected reply rate
  threadDepth: string; // Conversation thread depth
  autoAdjustWarmup: boolean; // Automatic warmup adjustment
}
```

## Form Validation

### Domain Addition Form

```typescript
export const addDomainFormSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(255, "Domain is too long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/,
      "Please enter a valid domain name"
    ),
  dnsRecords: z.array(
    z.object({
      type: z.enum([
        "SPF",
        "DKIM",
        "DMARC",
        "MX",
        "CNAME",
        "TXT",
        "A",
        "AAAA",
        "NS",
        "SRV",
      ]),
      name: z.string(),
      value: z.string(),
      status: z.enum(["verified", "pending", "failed"]),
      description: z.string(),
      priority: z.number().optional(),
    })
  ),
});

export type AddDomainFormType = z.infer<typeof addDomainFormSchema>;
```

### Domain Settings Form

```typescript
export const domainSettingsSchema = z.object({
  provider: z.nativeEnum(DNSProvider),
  warmupEnabled: z.boolean(),
  initialDailyVolume: z.number().min(1),
  dailyIncrease: z.number().min(1),
  maxDailyEmails: z.number().min(1),
  warmupSpeed: z.enum(["slow", "moderate", "fast"]),
  replyRate: z.string(),
  threadDepth: z.string(),
  autoAdjustWarmup: z.boolean(),
});

export type DomainSettingsFormType = z.infer<typeof domainSettingsSchema>;
```

## Enums and Constants

### DNS Providers

```typescript
export enum DNSProvider {
  CLOUDFLARE = "Cloudflare",
  GODADDY = "GoDaddy",
  NAMECHEAP = "Namecheap",
  AMAZON_ROUTE53 = "Amazon Route 53",
  DIGITAL_OCEAN = "DigitalOcean",
  BLUEHOST = "Bluehost",
  HOSTINGER = "Hostinger",
  HOSTGATOR = "HostGator",
  OTHER = "Other",
}
```

### Verification Status

```typescript
export enum VerificationStatus {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  ERROR = "ERROR",
  NOT_CONFIGURED = "NOT_CONFIGURED",
  DISABLED = "DISABLED",
}
```

### Account Creation Types

```typescript
export enum DomainAccountCreationType {
  LINUX_USER = "LINUX_USER",
  VIRTUAL_USER_DB = "VIRTUAL_USER_DB",
}
```

## Type Guards and Utilities

### Runtime Type Checking

```typescript
// Check if domain is mock data
export const isDomainMock = (domain: DomainOrMock): domain is DomainMock => {
  return "records" in domain && typeof domain.records === "object";
};

// Check if domain has full DB fields
export const isDomainDB = (domain: DomainOrDB): domain is DomainDB => {
  return (
    "companyId" in domain &&
    "createdById" in domain &&
    typeof domain.createdAt === "string"
  );
};
```

### Union Types

```typescript
// Union types for flexible component props
export type DomainOrMock = Domain | DomainMock;
export type DomainOrDB = Domain | DomainDB | DomainMock;
```

## Usage Examples

### Creating a Domain

```typescript
import { Domain, DomainStatus } from "@/types/domains";

const newDomain: Domain = {
  id: 1,
  domain: "example.com",
  status: DomainStatus.PENDING,
  emailAccounts: 0,
  spf: false,
  dkim: false,
  dmarc: false,
  createdAt: new Date().toISOString(),
  companyId: 123,
  createdById: "user-456",
};
```

### Working with DNS Records

```typescript
import { DNSRecord, DNSRecordType } from "@/types/domains";

const spfRecord: DNSRecord = {
  type: DNSRecordType.TXT,
  name: "@",
  value: "v=spf1 include:_spf.example.com ~all",
  status: "pending",
  description: "SPF record for email authentication",
};
```

### Type-Safe Domain Updates

```typescript
import { DomainUpdate } from "@/types/domains";

const update: DomainUpdate = {
  status: DomainStatus.VERIFIED,
  reputation: 85,
  metrics: {
    total24h: 1500,
    bounceRate: 2.5,
    openRate: 25.0,
  },
};
```

## Related Documentation

- [Domain Management Service](../../lib/services/domain/README.md)
- [DNS Configuration Guide](../../docs/infrastructure/dns-setup.md)
- [Email Authentication Guide](../../docs/infrastructure/email-auth.md)
- [Domain Analytics](../../docs/analytics/domain-analytics.md)
