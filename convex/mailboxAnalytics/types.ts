import type { PerformanceMetrics } from "../../types/analytics/core";
import type { WarmupStatus } from "../../types/analytics/domain-specific";

/**
 * Result interface for mailbox analytics queries.
 */
export interface MailboxAnalyticsResult {
  mailboxId: string;
  email: string;
  domain: string;
  provider: string;
  warmupStatus: WarmupStatus;
  warmupProgress: number;
  metrics: PerformanceMetrics;
  dailyLimit: number;
  currentVolume: number;
  healthScore: number;
  updatedAt: number;
}
