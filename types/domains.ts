import { z } from "zod";

// DNS Record Types
export type DNSRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "TXT"
  | "SPF"
  | "DKIM"
  | "DMARC"
  | "NS"
  | "SRV";

export type DNSRecordStatus = "verified" | "pending" | "failed";

// Domain Statuses
export type DomainStatus =
  | "PENDING"
  | "VERIFIED"
  | "SETUP_REQUIRED"
  | "FAILED"
  | "DELETED";

// Email Account Statuses
export type EmailAccountStatus =
  | "PENDING"
  | "ACTIVE"
  | "ISSUE"
  | "SUSPENDED"
  | "DELETED";

// Verification Status
export enum VerificationStatus {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  ERROR = "ERROR",
  NOT_CONFIGURED = "NOT_CONFIGURED",
  DISABLED = "DISABLED",
}

// Relay Types
export enum RelayType {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
  DEFAULT_SERVER_CONFIG = "DEFAULT_SERVER_CONFIG",
}

// Account Creation Types
export enum DomainAccountCreationType {
  LINUX_USER = "LINUX_USER",
  VIRTUAL_USER_DB = "VIRTUAL_USER_DB",
}

export type WarmupStatusType = "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED";

// DNS Provider Enums
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

// Constant objects for runtime usage
export const VerificationStatusConstants = {
  VERIFIED: "VERIFIED" as const,
  PENDING: "PENDING" as const,
  ERROR: "ERROR" as const,
  NOT_CONFIGURED: "NOT_CONFIGURED" as const,
  DISABLED: "DISABLED" as const,
} as const;

export const DomainAccountCreationTypeConstants = {
  LINUX_USER: "LINUX_USER" as const,
  VIRTUAL_USER_DB: "VIRTUAL_USER_DB" as const,
} as const;

export const RelayTypeConstants = {
  INTERNAL: "INTERNAL" as const,
  EXTERNAL: "EXTERNAL" as const,
  DEFAULT_SERVER_CONFIG: "DEFAULT_SERVER_CONFIG" as const,
} as const;

// Interfaces
export interface DNSRecord {
  type: DNSRecordType | string;
  name: string;
  value: string;
  status: DNSRecordStatus | "verified" | "pending" | "failed";
  description: string;
  priority?: number;
}

// Core Domain interface (flexible for DB operations)
export interface Domain {
  id: number;
  domain: string;
  name?: string; // Optional for backward compatibility
  provider?: string;
  status: DomainStatus | string; // Allow string for mocks
  daysActive?: number;
  reputation?: number;
  emailAccounts?: number; // Use for DB/channeling, ~mailboxes
  mailboxes?: number; // Keep for mock compatibility
  spf?: boolean | string;
  dkim?: boolean | string;
  dmarc?: boolean | string;
  records?: {
    spf: string;
    dkim: string;
    dmarc: string;
    mx: string;
  };
  metrics?: {
    total24h: number;
    bounceRate: number;
    spamRate: number;
    openRate: number;
    replyRate: number;
  };
  createdAt?: string;
  updatedAt?: string;
  addedDate?: string; // Mock compatibility
  companyId?: number;
  createdById?: string;
}

// Domain for full DB operations (required fields)
export interface DomainDB extends Required<Pick<Domain, 'id' | 'domain' | 'status' | 'createdAt' | 'updatedAt' | 'companyId' | 'createdById'>> {
  id: number;
  domain: string;
  name?: string;
  provider?: string;
  status: DomainStatus;
  daysActive?: number;
  reputation?: number;
  emailAccounts?: number;
  spf?: boolean;
  dkim?: boolean;
  dmarc?: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  createdById: string;
}

// Domain for mock/development data
export interface DomainMock {
  id: number;
  domain: string;
  status: string; // e.g., "verified", "pending"
  mailboxes: number;
  records: {
    spf: string;    // e.g., "verified", "pending", "failed"
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

// Domain for partial updates (PATCH operations)
export type DomainUpdate = Partial<Omit<Domain, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'createdById'>> & {
  status?: DomainStatus | string; // Allow flexible status updates
};

// Domain for analytics/display (subset for dashboards)
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

export interface EmailAccount {
  id: number;
  email: string;
  provider: string;
  status: EmailAccountStatus;
  reputation: number;
  warmupStatus: WarmupStatusType;
  dayLimit: number;
  sent24h: number;
  lastSync: string;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  createdById: string;
}

// Union type for components that work with both
export type DomainOrMock = Domain | DomainMock;
export type DomainOrDB = Domain | DomainDB | DomainMock;

// Type guards for runtime type checking
export const isDomainMock = (domain: DomainOrMock): domain is DomainMock => {
  return 'records' in domain && typeof domain.records === 'object';
};

export const isDomainDB = (domain: DomainOrDB): domain is DomainDB => {
  return 'companyId' in domain && 'createdById' in domain && typeof domain.createdAt === 'string';
};

// Form validation schemas
export const addDomainFormSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(255, "Domain is too long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/,
      "Please enter a valid domain name",
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
    }),
  ),
});

export type AddDomainFormType = z.infer<typeof addDomainFormSchema>;

// Domain settings validation (from domain.ts)
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

// Additional configuration types from domain.ts
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
  percentage: number;
  reportEmail: string;
  record: string;
}

export interface DomainAuthentication {
  spf: SPFConfig;
  dkim: DKIMConfig;
  dmarc: DMARCConfig;
}

export interface WarmupConfig {
  enabled: boolean;
  initialDailyVolume: number;
  dailyIncrease: number;
  maxDailyEmails: number;
  warmupSpeed: "slow" | "moderate" | "fast";
  replyRate: string;
  threadDepth: string;
  autoAdjustWarmup: boolean;
}

export interface ReputationFactors {
  bounceRate: number;
  spamComplaints: number;
  engagement: number;
}

export interface DomainSettings {
  domain: string;
  authentication: DomainAuthentication;
  warmup: WarmupConfig;
  reputationFactors: ReputationFactors;
  provider: DNSProvider;
  // Additional properties for settings page usage
  warmupEnabled?: boolean;
  dailyIncrease?: number;
  maxDailyEmails?: number;
  initialDailyVolume?: number;
  warmupSpeed?: "slow" | "moderate" | "fast";
  replyRate?: string;
  threadDepth?: string;
  autoAdjustWarmup?: boolean;
}
