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

// DNS Provider Types
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

// Warmup Status Types
export type WarmupStatusType = "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED";

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

export interface Domain {
  id: number;
  domain: string;
  name: string;
  provider: string;
  status: DomainStatus;
  daysActive: number;
  reputation: number;
  emailAccounts: number;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  createdById: string;
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

// Form validation schemas
export const addDomainFormSchema = z.object({
  domain: z
    .string()
    .min(1)
    .max(255)
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
