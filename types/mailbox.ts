export interface Mailbox {
  id: number;
  email: string;
  domain: string;
  status: MailboxStatus;
  campaign: string | null;
  provider: string;
  warmupStatus: WarmupStatus;
  reputation: number;
  dailyLimit: number;
  sent: number;
  sent24h: number;
  lastActivity: string;
  lastSync: string;
  warmupProgress: number;
  warmupDays: number;
  totalSent: number;
  replies: number;
  engagement: string;
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  enableWarmup: boolean;
  enableWarmupLimits: boolean;
  createdAt: string; // ISO date string
  updatedAt: string;
  companyId: number;
  createdById: string;
  accountType: AccountCreationType;
}

export interface MailboxConfig {
  dailyLimit: number;
  enableWarmup: boolean;
  enableWarmupLimits: boolean;
  warmupSpeed: "slow" | "moderate" | "fast";
  autoAdjustWarmup: boolean;
}

export interface MailboxCreationRequest {
  name: string;
  domain: string;
  password: string;
  confirmPassword?: string; // For validation only
}

export type MailboxStatus =
  | "PENDING"
  | "ACTIVE"
  | "ISSUE"
  | "SUSPENDED"
  | "DELETED";

export const MailboxStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  ISSUE: "ISSUE",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED",
} as const;

export type WarmupStatus = "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED";

export const WarmupStatus = {
  NOT_STARTED: "NOT_STARTED",
  WARMING: "WARMING",
  WARMED: "WARMED",
  PAUSED: "PAUSED",
} as const;

export const AccountCreationType = {
  LINUX_USER: "LINUX_USER",
  VIRTUAL_USER_DB: "VIRTUAL_USER_DB",
} as const;

export type AccountCreationType =
  (typeof AccountCreationType)[keyof typeof AccountCreationType];

export type EmailProvider =
  | "LOCAL_SMTP"
  | "GMAIL_SMTP"
  | "OUTLOOK_SMTP"
  | "CUSTOM_SMTP"
  | "SENDGRID"
  | "MAILGUN"
  | "AMAZON_SES"
  | "OTHER";
