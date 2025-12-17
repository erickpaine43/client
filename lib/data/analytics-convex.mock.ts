// ============================================================================
// CONVEX-COMPATIBLE ANALYTICS MOCK DATA
// ============================================================================

import { 
  CampaignAnalytics, 
  DomainAnalytics, 
  MailboxAnalytics, 
  SequenceStepAnalytics,
  WarmupAnalytics,
} from "@/types/analytics/domain-specific";
import { TimeSeriesDataPoint } from "@/types/analytics/core";

/**
 * Standardized campaign analytics data for Convex migration.
 * All field names follow the new standardized format.
 */
export const convexCampaignAnalytics: CampaignAnalytics[] = [
  {
    id: "q1-saas-outreach",
    name: "Q1 SaaS Outreach",
    campaignId: "q1-saas-outreach",
    campaignName: "Q1 SaaS Outreach",
    status: "ACTIVE",
    leadCount: 2500,
    activeLeads: 1653,
    completedLeads: 847,
    
    // Standardized performance metrics (no stored rates)
    sent: 847,
    delivered: 837, // sent - bounced
    opened_tracked: 289, // tracking pixel opens
    clicked_tracked: 73, // tracking link clicks
    replied: 42,
    bounced: 10,
    unsubscribed: 8,
    spamComplaints: 2,
    
    updatedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  },
  {
    id: "enterprise-prospects",
    name: "Enterprise Prospects",
    campaignId: "enterprise-prospects",
    campaignName: "Enterprise Prospects",
    status: "PAUSED",
    leadCount: 2000,
    activeLeads: 797,
    completedLeads: 1203,
    
    sent: 1203,
    delivered: 1198, // sent - bounced
    opened_tracked: 502,
    clicked_tracked: 124,
    replied: 89,
    bounced: 5,
    unsubscribed: 12,
    spamComplaints: 1,
    
    updatedAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
  },
  {
    id: "smb-follow-up",
    name: "SMB Follow-up",
    campaignId: "smb-follow-up",
    campaignName: "SMB Follow-up",
    status: "ACTIVE",
    leadCount: 800,
    activeLeads: 308,
    completedLeads: 492,
    
    sent: 492,
    delivered: 484, // sent - bounced
    opened_tracked: 142,
    clicked_tracked: 31,
    replied: 18,
    bounced: 8,
    unsubscribed: 5,
    spamComplaints: 1,
    
    updatedAt: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
  },
  {
    id: "product-launch",
    name: "Product Launch",
    campaignId: "product-launch",
    campaignName: "Product Launch",
    status: "COMPLETED",
    leadCount: 2000,
    activeLeads: 0,
    completedLeads: 2000,
    
    sent: 2156,
    delivered: 2144, // sent - bounced
    opened_tracked: 849,
    clicked_tracked: 287,
    replied: 156,
    bounced: 12,
    unsubscribed: 21,
    spamComplaints: 3,
    
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
  },
];

/**
 * Standardized sequence step analytics data.
 */
export const convexSequenceStepAnalytics: SequenceStepAnalytics[] = [
  {
    stepId: "q1-saas-step-1",
    stepType: "email",
    subject: "Quick question about {{company}}",
    sequenceOrder: 0,
    
    sent: 847,
    delivered: 837,
    opened_tracked: 289,
    clicked_tracked: 73,
    replied: 42,
    bounced: 10,
    unsubscribed: 8,
    spamComplaints: 2,
  },
  {
    stepId: "q1-saas-step-2",
    stepType: "wait",
    waitDuration: 48, // 2 days in hours
    sequenceOrder: 1,
    
    sent: 0,
    delivered: 0,
    opened_tracked: 0,
    clicked_tracked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
    spamComplaints: 0,
  },
  {
    stepId: "q1-saas-step-3",
    stepType: "email",
    subject: "Following up on my previous email",
    sequenceOrder: 2,
    
    sent: 763,
    delivered: 758,
    opened_tracked: 198,
    clicked_tracked: 31,
    replied: 18,
    bounced: 5,
    unsubscribed: 7,
    spamComplaints: 1,
  },
];

/**
 * Standardized domain analytics data.
 */
export const convexDomainAnalytics: DomainAnalytics[] = [
  {
    id: "mycompany-com",
    name: "mycompany.com",
    domainId: "mycompany-com",
    domainName: "mycompany.com",
    
    authentication: {
      spf: true,
      dkim: true,
      dmarc: true,
    },
    
    // Aggregated metrics from all mailboxes in domain
    aggregatedMetrics: {
      sent: 2542,
      delivered: 2485,
      opened_tracked: 1023,
      clicked_tracked: 267,
      replied: 398,
      bounced: 57,
      unsubscribed: 25,
      spamComplaints: 5,
    },
    
    // Base analytics fields (same as aggregated for domains)
    sent: 2542,
    delivered: 2485,
    opened_tracked: 1023,
    clicked_tracked: 267,
    replied: 398,
    bounced: 57,
    unsubscribed: 25,
    spamComplaints: 5,
    
    updatedAt: Date.now(),
  },
  {
    id: "example-com",
    name: "example.com",
    domainId: "example-com",
    domainName: "example.com",
    
    authentication: {
      spf: true,
      dkim: true,
      dmarc: true,
    },
    
    aggregatedMetrics: {
      sent: 400,
      delivered: 395,
      opened_tracked: 178,
      clicked_tracked: 46,
      replied: 29,
      bounced: 5,
      unsubscribed: 4,
      spamComplaints: 0,
    },
    
    sent: 400,
    delivered: 395,
    opened_tracked: 178,
    clicked_tracked: 46,
    replied: 29,
    bounced: 5,
    unsubscribed: 4,
    spamComplaints: 0,
    
    updatedAt: Date.now(),
  },
];

/**
 * Standardized mailbox analytics data.
 */
export const convexMailboxAnalytics: MailboxAnalytics[] = [
  {
    id: "john-mycompany-com",
    name: "john@mycompany.com",
    mailboxId: "john-mycompany-com",
    email: "john@mycompany.com",
    domain: "mycompany.com",
    provider: "Gmail",
    
    warmupStatus: "WARMED",
    warmupProgress: 100,
    dailyLimit: 50,
    currentVolume: 89,
    healthScore: 92, // calculated from performance metrics
    
    sent: 847,
    delivered: 820,
    opened_tracked: 340,
    clicked_tracked: 85,
    replied: 189,
    bounced: 27,
    unsubscribed: 8,
    spamComplaints: 2,
    
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: "sarah-mycompany-com",
    name: "sarah@mycompany.com",
    mailboxId: "sarah-mycompany-com",
    email: "sarah@mycompany.com",
    domain: "mycompany.com",
    provider: "Outlook",
    
    warmupStatus: "WARMING",
    warmupProgress: 60,
    dailyLimit: 30,
    currentVolume: 45,
    healthScore: 78,
    
    sent: 432,
    delivered: 420,
    opened_tracked: 156,
    clicked_tracked: 42,
    replied: 87,
    bounced: 12,
    unsubscribed: 4,
    spamComplaints: 1,
    
    updatedAt: Date.now() - 4 * 60 * 60 * 1000,
  },
  {
    id: "mike-mycompany-com",
    name: "mike@mycompany.com",
    mailboxId: "mike-mycompany-com",
    email: "mike@mycompany.com",
    domain: "mycompany.com",
    provider: "Gmail",
    
    warmupStatus: "PAUSED",
    warmupProgress: 25,
    dailyLimit: 25,
    currentVolume: 12,
    healthScore: 65,
    
    sent: 298,
    delivered: 285,
    opened_tracked: 99,
    clicked_tracked: 25,
    replied: 31,
    bounced: 13,
    unsubscribed: 3,
    spamComplaints: 2,
    
    updatedAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: "sales-example-com",
    name: "sales@example.com",
    mailboxId: "sales-example-com",
    email: "sales@example.com",
    domain: "example.com",
    provider: "Gmail",
    
    warmupStatus: "WARMED",
    warmupProgress: 100,
    dailyLimit: 300,
    currentVolume: 250,
    healthScore: 92,
    
    sent: 250,
    delivered: 245,
    opened_tracked: 110,
    clicked_tracked: 28,
    replied: 15,
    bounced: 5,
    unsubscribed: 2,
    spamComplaints: 0,
    
    updatedAt: Date.now() - 30 * 60 * 1000,
  },
  {
    id: "support-example-com",
    name: "support@example.com",
    mailboxId: "support-example-com",
    email: "support@example.com",
    domain: "example.com",
    provider: "Outlook",
    
    warmupStatus: "WARMING",
    warmupProgress: 75,
    dailyLimit: 200,
    currentVolume: 150,
    healthScore: 88,
    
    sent: 150,
    delivered: 150,
    opened_tracked: 68,
    clicked_tracked: 18,
    replied: 14,
    bounced: 0,
    unsubscribed: 2,
    spamComplaints: 0,
    
    updatedAt: Date.now() - 15 * 60 * 1000,
  },
];

/**
 * Standardized warmup analytics data.
 */
export const convexWarmupAnalytics: WarmupAnalytics[] = [
  {
    mailboxId: "john-mycompany-com",
    totalWarmups: 1400,
    spamComplaints: 12,
    replies: 168,
    progressPercentage: 100,
    dailyStats: [
      {
        date: "2024-12-01",
        emailsWarmed: 50,
        delivered: 50,
        spamComplaints: 0,
        replies: 6,
        bounced: 0,
        healthScore: 92,
      },
      {
        date: "2024-12-02",
        emailsWarmed: 50,
        delivered: 49,
        spamComplaints: 1,
        replies: 5,
        bounced: 1,
        healthScore: 90,
      },
    ],
  },
  {
    mailboxId: "sarah-mycompany-com",
    totalWarmups: 540,
    spamComplaints: 8,
    replies: 65,
    progressPercentage: 60,
    dailyStats: [
      {
        date: "2024-12-01",
        emailsWarmed: 30,
        delivered: 29,
        spamComplaints: 1,
        replies: 3,
        bounced: 1,
        healthScore: 78,
      },
      {
        date: "2024-12-02",
        emailsWarmed: 30,
        delivered: 30,
        spamComplaints: 0,
        replies: 4,
        bounced: 0,
        healthScore: 80,
      },
    ],
  },
];

/**
 * Standardized time series data for charts.
 */
export const convexTimeSeriesData: TimeSeriesDataPoint[] = [
  {
    date: "2024-11-25",
    label: "Nov 25",
    metrics: {
      sent: 245,
      delivered: 240,
      opened_tracked: 108,
      clicked_tracked: 25,
      replied: 29,
      bounced: 5,
      unsubscribed: 2,
      spamComplaints: 0,
    },
  },
  {
    date: "2024-11-26",
    label: "Nov 26",
    metrics: {
      sent: 267,
      delivered: 265,
      opened_tracked: 119,
      clicked_tracked: 32,
      replied: 31,
      bounced: 2,
      unsubscribed: 3,
      spamComplaints: 1,
    },
  },
  {
    date: "2024-11-27",
    label: "Nov 27",
    metrics: {
      sent: 289,
      delivered: 284,
      opened_tracked: 142,
      clicked_tracked: 38,
      replied: 35,
      bounced: 5,
      unsubscribed: 2,
      spamComplaints: 0,
    },
  },
  {
    date: "2024-11-28",
    label: "Nov 28",
    metrics: {
      sent: 312,
      delivered: 311,
      opened_tracked: 156,
      clicked_tracked: 47,
      replied: 42,
      bounced: 1,
      unsubscribed: 4,
      spamComplaints: 1,
    },
  },
  {
    date: "2024-11-29",
    label: "Nov 29",
    metrics: {
      sent: 298,
      delivered: 294,
      opened_tracked: 147,
      clicked_tracked: 41,
      replied: 38,
      bounced: 4,
      unsubscribed: 3,
      spamComplaints: 0,
    },
  },
  {
    date: "2024-11-30",
    label: "Nov 30",
    metrics: {
      sent: 334,
      delivered: 332,
      opened_tracked: 166,
      clicked_tracked: 55,
      replied: 48,
      bounced: 2,
      unsubscribed: 5,
      spamComplaints: 1,
    },
  },
  {
    date: "2024-12-01",
    label: "Dec 1",
    metrics: {
      sent: 356,
      delivered: 353,
      opened_tracked: 177,
      clicked_tracked: 62,
      replied: 51,
      bounced: 3,
      unsubscribed: 4,
      spamComplaints: 0,
    },
  },
];

/**
 * Generate time series data for different date ranges and granularities.
 * All data uses standardized field names and is Convex-compatible.
 */
export function generateConvexTimeSeriesData(
  days: number,
  granularity: "day" | "week" | "month"
): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const now = new Date();

  let periods = days;
  let periodLength = 1; // days per period

  // Calculate number of periods and period length based on granularity
  if (granularity === "week") {
    periods = Math.ceil(days / 7);
    periodLength = 7;
  } else if (granularity === "month") {
    periods = Math.ceil(days / 30);
    periodLength = 30;
  }

  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date(now);

    if (granularity === "day") {
      date.setDate(date.getDate() - i);
    } else if (granularity === "week") {
      date.setDate(date.getDate() - i * 7);
      // Set to start of week (Monday)
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      date.setDate(date.getDate() + diff);
    } else if (granularity === "month") {
      date.setMonth(date.getMonth() - i);
      date.setDate(1); // Set to first day of month
    }

    // Adjust base value for longer periods (weeks/months have more activity)
    const baseValue = (100 + Math.random() * 50) * periodLength;
    const sent = Math.floor(baseValue * (0.8 + Math.random() * 0.4));
    const delivered = Math.floor(sent * (0.95 + Math.random() * 0.04)); // 95-99% delivery rate

    data.push({
      date: date.toISOString().split("T")[0],
      label:
        granularity === "day"
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : granularity === "week"
            ? `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : date.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
      metrics: {
        sent,
        delivered,
        opened_tracked: Math.floor(delivered * (0.3 + Math.random() * 0.2)), // 30-50% open rate
        clicked_tracked: Math.floor(delivered * (0.08 + Math.random() * 0.05)), // 8-13% click rate
        replied: Math.floor(delivered * (0.05 + Math.random() * 0.03)), // 5-8% reply rate
        bounced: sent - delivered, // Bounced = sent - delivered
        unsubscribed: Math.floor(delivered * (0.01 + Math.random() * 0.01)), // 1-2% unsubscribe rate
        spamComplaints: Math.floor(delivered * (0.001 + Math.random() * 0.004)), // 0.1-0.5% spam rate
      },
    });
  }

  return data;
}

/**
 * Chart metrics configuration using standardized field names.
 */
export const convexChartMetrics = [
  {
    key: "sent",
    label: "Emails Sent",
    color: "#3B82F6",
    visible: true,
  },
  {
    key: "delivered",
    label: "Delivered",
    color: "#06B6D4",
    visible: true,
  },
  {
    key: "opened_tracked",
    label: "Opens (Tracked)",
    color: "#8B5CF6",
    visible: true,
  },
  {
    key: "clicked_tracked",
    label: "Clicks (Tracked)",
    color: "#F59E0B",
    visible: true,
  },
  {
    key: "replied",
    label: "Replies",
    color: "#10B981",
    visible: true,
  },
  {
    key: "bounced",
    label: "Bounced",
    color: "#EF4444",
    visible: false,
  },
  {
    key: "unsubscribed",
    label: "Unsubscribed",
    color: "#F97316",
    visible: false,
  },
  {
    key: "spamComplaints",
    label: "Spam Complaints",
    color: "#DC2626",
    visible: false,
  },
] as const;
