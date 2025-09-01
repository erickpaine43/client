interface Mailbox {
  id: number;
  email: string;
  domain: string;
  status: MailboxStatus;
  campaign: string | null;
  warmupStatus: WarmupStatus;
  dailyLimit: number;
  sent: number;
  lastActivity: string;
  warmupProgress: number;
  warmupDays: number;
  totalSent: number;
  replies: number;
  engagement: string;
  createdAt: string; // ISO date string
}

type MailboxStatus = "PENDING" | "ACTIVE" | "ISSUE" | "SUSPENDED" | "DELETED";

const MailboxStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  ISSUE: "ISSUE",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED"
} as const;

type WarmupStatus = "NOT_STARTED" | "WARMING" | "WARMED" | "PAUSED";

const WarmupStatus = {
  NOT_STARTED: "NOT_STARTED",
  WARMING: "WARMING",
  WARMED: "WARMED",
  PAUSED: "PAUSED"
} as const;
