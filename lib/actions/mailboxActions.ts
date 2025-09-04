"use server";

import { conversations } from "@/lib/data/Inbox.mock";
import { mockMailboxes } from "@/lib/data/analytics.mock";
import { MailboxWarmupData, MailboxAnalyticsData } from "@/types";

// Server action to fetch mailboxes
export async function getMailboxesAction(
  userid?: string,
  companyid?: string
): Promise<MailboxWarmupData[]> {
  console.log(`Fetching mailboxes for user: ${userid}, company: ${companyid}`);

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

  return mailboxes;
}

// Server action to fetch analytics for a specific mailbox
export async function getMailboxAnalyticsAction(
  mailboxId: string,
  dateRange: string = "30d",
  _granularity: string = "day",
  userid?: string,
  companyid?: string
): Promise<MailboxAnalyticsData> {
  console.log(`Fetching analytics for mailbox: ${mailboxId}, range: ${dateRange}, user: ${userid}, company: ${companyid}`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1500 + 500));

  // Get mailboxes and find the specific one
  const mailboxes = await getMailboxesAction(userid, companyid);
  const mailbox = mailboxes.find((box: MailboxWarmupData) => box.id === mailboxId);

  if (!mailbox) {
    throw new Error(`Mailbox not found: ${mailboxId}`);
  }

  // Generate mock analytics based on mailbox data
  const analytics: MailboxAnalyticsData = {
    mailboxId,
    warmupProgress: mailbox.warmupProgress,
    totalWarmups: Math.floor(Math.random() * 500) + 200,
    spamFlags: Math.floor(Math.random() * 10) + 1,
    replies: Math.floor(Math.random() * 30) + 5,
    healthScore: mailbox.healthScore,
    lastUpdated: new Date()
  };

  return analytics;
}

// Server action to fetch analytics for multiple mailboxes
export async function getMultipleMailboxAnalyticsAction(
  mailboxIds: string[],
  dateRange: string = "30d",
  _granularity: string = "day",
  userid?: string,
  companyid?: string
): Promise<Record<string, MailboxAnalyticsData>> {
  console.log(`Fetching analytics for ${mailboxIds.length} mailboxes, user: ${userid}, company: ${companyid}`);

  const results: Record<string, MailboxAnalyticsData> = {};

  // Get mailboxes to validate ids
  const mailboxes = await getMailboxesAction(userid, companyid);
  const validMailboxIds = mailboxes.map((box: MailboxWarmupData) => box.id);

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
      const analytics = await getMailboxAnalyticsAction(mailboxId, dateRange, _granularity, userid, companyid);
      results[mailboxId] = analytics;
    } catch (error) {
      console.error(`Failed to fetch analytics for mailbox ${mailboxId}:`, error);
      // Continue with other mailboxes even if one fails
    }
  }

  return results;
}
