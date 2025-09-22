"use server";

import { conversations } from "@/lib/data/Inbox.mock";
import { mockMailboxes } from "@/lib/data/analytics.mock";
import { MailboxWarmupData, MailboxAnalyticsData } from "@/types";
import { mapServiceMailboxToLegacy } from "@/lib/utils/analytics-mappers";
import type {
  MailboxPerformanceData as ServiceMailboxPerformanceData,
  WarmupAnalyticsData as ServiceWarmupAnalyticsData,
} from "@/lib/services/analytics/MailboxAnalyticsService";
import { withSecurity, SecurityConfigs } from './core/auth-middleware';
import { ActionResult, ActionContext } from './core/types';
import { ErrorFactory } from './core/errors';

// Server action to fetch mailboxes
export async function getMailboxesAction(
  _userid?: string,
  _companyid?: string
): Promise<ActionResult<MailboxWarmupData[]>> {
  return withSecurity(
    'get_mailboxes',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Use context values instead of parameters for security
      const effectiveUserId = context.userId;
      const effectiveCompanyId = context.companyId;
      
      console.log(`Fetching mailboxes for user: ${effectiveUserId}, company: ${effectiveCompanyId}`);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

  // Extract unique mailboxes from inbox conversations inline to avoid server action rules
  const emailDomains = new Set();
  conversations.forEach((conv: { email: string }) => {
    const email = conv.email;
    const domain = email.split('@')[1];
    if (domain) {
      emailDomains.add(domain);
    }
  });

  // Create mailbox objects from unique domains
  const mailboxes: MailboxWarmupData[] = [];
  Array.from(emailDomains).forEach((domainRaw, index) => {
    const domain = domainRaw as string; // Type assertion
    const baseMailbox = mockMailboxes[index] || mockMailboxes[0]; // Fallback to first mock mailbox

    mailboxes.push({
      id: `mailbox_${index + 1}`,
      name: `${domain.split('.')[0]} Account`,
      email: `outreach@${domain}`,
      status: baseMailbox.status as "active" | "warming" | "paused" | "inactive",
      warmupProgress: baseMailbox.warmupProgress,
      dailyVolume: baseMailbox.dailyVolume,
      healthScore: baseMailbox.healthScore,
      domain: domain,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Mock createdAt within last 30 days
    });
  });

      return {
        success: true,
        data: mailboxes,
      };
    }
  );
}

// Server action to fetch analytics for a specific mailbox
export async function getMailboxAnalyticsAction(
  mailboxId: string,
  dateRange: string = "30d",
  _granularity: string = "day",
  _userid?: string,
  _companyid?: string
): Promise<ActionResult<MailboxAnalyticsData>> {
  return withSecurity(
    'get_mailbox_analytics',
    SecurityConfigs.ANALYTICS_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate mailbox ID
      if (!mailboxId || typeof mailboxId !== 'string') {
        return ErrorFactory.validation('Valid mailbox ID is required', 'mailboxId');
      }

      // Use context values instead of parameters for security
      const effectiveUserId = context.userId;
      const effectiveCompanyId = context.companyId;
      
      console.log(`Fetching analytics for mailbox: ${mailboxId}, range: ${dateRange}, user: ${effectiveUserId}, company: ${effectiveCompanyId}`);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1500 + 500));

      // Get mailboxes and find the specific one
      const mailboxesResult = await getMailboxesAction(effectiveUserId, effectiveCompanyId);
      if (!mailboxesResult.success || !mailboxesResult.data) {
        return ErrorFactory.internal('Failed to fetch mailboxes');
      }
      
      const mailbox = mailboxesResult.data.find((box: MailboxWarmupData) => box.id === mailboxId);

      if (!mailbox) {
        return ErrorFactory.notFound(`Mailbox not found: ${mailboxId}`);
      }

  // Generate mock service-shaped performance and warmup data and map to legacy UI shape
  const serviceLike = {
    mailboxId,
    warmupProgress: mailbox.warmupProgress,
    healthScore: mailbox.healthScore,
    // include minimal core metrics to satisfy mappers
    metrics: {
      sent: Math.floor(Math.random() * 1000),
      delivered: Math.floor(Math.random() * 900),
      opened_tracked: Math.floor(Math.random() * 500),
      clicked_tracked: Math.floor(Math.random() * 200),
      replied: Math.floor(Math.random() * 50),
      bounced: Math.floor(Math.random() * 10),
      unsubscribed: Math.floor(Math.random() * 5),
      spamComplaints: Math.floor(Math.random() * 8),
    },
  };

  const warmupLike = {
    mailboxId,
    totalWarmups: Math.floor(Math.random() * 500) + 200,
    spamComplaints: Math.floor(Math.random() * 10) + 1,
    replies: Math.floor(Math.random() * 30) + 5,
  progressPercentage: Math.floor(Math.random() * 100),
  dailyStats: [],
  };

      // Cast mock objects to the service types for the mapper call. This keeps the change local
      // and satisfies the mapper's typed signature while we migrate consumers.
      const analytics = mapServiceMailboxToLegacy(
        serviceLike as ServiceMailboxPerformanceData,
        warmupLike as ServiceWarmupAnalyticsData
      );
      
      return {
        success: true,
        data: analytics,
      };
    }
  );
}

// Server action to fetch analytics for multiple mailboxes
export async function getMultipleMailboxAnalyticsAction(
  mailboxIds: string[],
  dateRange: string = "30d",
  _granularity: string = "day",
  _userid?: string,
  _companyid?: string
): Promise<ActionResult<Record<string, MailboxAnalyticsData>>> {
  return withSecurity(
    'get_multiple_mailbox_analytics',
    SecurityConfigs.BULK_OPERATION,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate mailbox IDs array
      if (!Array.isArray(mailboxIds) || mailboxIds.length === 0) {
        return ErrorFactory.validation('Valid mailbox IDs array is required', 'mailboxIds');
      }

      // Use context values instead of parameters for security
      const effectiveUserId = context.userId;
      const effectiveCompanyId = context.companyId;
      
      console.log(`Fetching analytics for ${mailboxIds.length} mailboxes, user: ${effectiveUserId}, company: ${effectiveCompanyId}`);

      const results: Record<string, MailboxAnalyticsData> = {};

      // Get mailboxes to validate ids
      const mailboxesResult = await getMailboxesAction(effectiveUserId, effectiveCompanyId);
      if (!mailboxesResult.success || !mailboxesResult.data) {
        return ErrorFactory.internal('Failed to fetch mailboxes for validation');
      }
      
      const validMailboxIds = mailboxesResult.data.map((box: MailboxWarmupData) => box.id);

  // Fetch analytics for each valid mailbox with slight delays to simulate progressive loading
  for (let i = 0; i < mailboxIds.length; i++) {
    const mailboxId = mailboxIds[i];

    // Only process valid mailbox IDs
    if (!validMailboxIds.includes(mailboxId)) {
      console.warn(`Skipping invalid mailbox ID: ${mailboxId}`);
      continue;
    }

    const delay = Math.random() * 800 + 200; // 200-1000ms delay

    // Simulate the API call with delay
    await new Promise(resolve => setTimeout(resolve, delay));

      try {
        const analyticsResult = await getMailboxAnalyticsAction(mailboxId, dateRange, _granularity, effectiveUserId, effectiveCompanyId);
        if (analyticsResult.success && analyticsResult.data) {
          results[mailboxId] = analyticsResult.data;
        }
      } catch (error) {
        console.error(`Failed to fetch analytics for mailbox ${mailboxId}:`, error);
        // Continue with other mailboxes even if one fails
      }
    }

    return {
      success: true,
      data: results,
    };
  }
);
}
