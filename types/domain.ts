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

export interface DNSRecord {
  type: DNSRecordType | string; // Allow string for backward compatibility, but prefer enum
  name: string;
  value: string;
  status: DNSRecordStatus | "verified" | "pending" | "failed"; // Allow union for backward compatibility
  description: string;
  priority?: number; // For MX records
}

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

// Add const objects for runtime usage where needed
export const VerificationStatusConstants = {
  VERIFIED: "VERIFIED" as const,
  PENDING: "PENDING" as const,
  ERROR: "ERROR" as const,
  NOT_CONFIGURED: "NOT_CONFIGURED" as const,
  DISABLED: "DISABLED" as const,
} as const;

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

// Warmup Status Types
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

// Domain Interface
export interface Domain {
  id: number;
  domain: string;
  name: string;
  provider: string;
  status: DomainStatus | string;
  daysActive: number;
  reputation: number;
  emailAccounts: number;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  records?: {
    spf: DNSRecordStatus | string;
    dkim: DNSRecordStatus | string;
    dmarc: DNSRecordStatus | string;
    mx: DNSRecordStatus | string;
  };
  metrics?: {
    total24h: number;
    bounceRate: number;
    spamRate: number;
    openRate: number;
    replyRate: number;
  };
  createdAt: string;
  updatedAt: string;
  companyId: number;
  createdById: string;
}

// Email Account Interface
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

// Authentication Configuration Types
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

// Warmup Configuration Types
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

// Reputation Factors
export interface ReputationFactors {
  bounceRate: number;
  spamComplaints: number;
  engagement: number;
}

// Domain Settings
export interface DomainSettings {
  authentication: DomainAuthentication;
  warmup: WarmupConfig;
  reputationFactors: ReputationFactors;
  provider: DNSProvider;
}

// Domain Form Validation Schema (re-export from forms.ts when implementing task 5.1)
// For now, defining here as per task 2.2 requirements

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

// Domain configuration validation
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
