'use server';

import { domains } from "@/lib/data/domains.mock";
import { DomainSettings, DNSProvider } from "@/types/domains";

export async function getDomainSettings(domainId: number): Promise<DomainSettings | null> {
  const domain = domains.find(d => d.id === domainId);
  if (!domain || !domain.authentication) {
    return null;
  }

  return {
    domain: domain.name || domain.domain,
    // Top-level properties for the settings page
    warmupEnabled: domain.warmupEnabled || false,
    dailyIncrease: domain.dailyIncrease || 10,
    maxDailyEmails: domain.maxDailyEmails || 1000,
    initialDailyVolume: domain.initialDailyVolume || 10,
    warmupSpeed: (domain.warmupSpeed || "moderate") as "slow" | "moderate" | "fast",
    replyRate: domain.replyRate || "80",
    threadDepth: domain.threadDepth || "3",
    autoAdjustWarmup: domain.autoAdjustWarmup || false,
    authentication: {
      ...domain.authentication,
      spf: {
        ...domain.authentication.spf,
        policy: domain.authentication.spf.policy as "strict" | "soft" | "neutral",
      },
      dmarc: {
        ...domain.authentication.dmarc,
        policy: domain.authentication.dmarc.policy as "none" | "quarantine" | "reject",
      },
    },
    warmup: {
      enabled: domain.warmupEnabled || false,
      initialDailyVolume: domain.initialDailyVolume || 10,
      dailyIncrease: domain.dailyIncrease || 10,
      maxDailyEmails: domain.maxDailyEmails || 1000,
      warmupSpeed: (domain.warmupSpeed || "moderate") as "slow" | "moderate" | "fast",
      replyRate: domain.replyRate || "80",
      threadDepth: domain.threadDepth || "3",
      autoAdjustWarmup: domain.autoAdjustWarmup || false,
    },
    reputationFactors: {
      bounceRate: domain.metrics ? (domain.metrics.bounced / domain.metrics.sent) * 100 : 0,
      spamComplaints: domain.metrics?.spamComplaints || 0,
      engagement: domain.metrics ? (domain.metrics.opened_tracked / domain.metrics.sent) * 100 : 0,
    },
    provider: DNSProvider.OTHER, // Default since "Google Workspace" doesn't match enum
  };
}
