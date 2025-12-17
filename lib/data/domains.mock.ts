
export const domains = [
  {
    id: 1,
    domain: "mycompany.com",
    name: "mycompany.com",
    provider: "Google Workspace",
    status: "VERIFIED",
    daysActive: 90,
    reputation: 85, // MIGRATED: calculated from mailbox data using AnalyticsCalculator
    emailAccounts: 5,
    spf: true,
    dkim: true,
    dmarc: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 1,
    createdById: "user_1",
    mailboxes: 5,
    records: {
      spf: "verified",
      dkim: "verified",
      dmarc: "verified",
      mx: "verified",
    },
    addedDate: "2 weeks ago",
  },
  {
    id: 2,
    domain: "outreach.mycompany.com",
    name: "outreach.mycompany.com",
    provider: "Google Workspace",
    status: "PENDING",
    daysActive: 1,
    reputation: 45, // MIGRATED: calculated from mailbox data using AnalyticsCalculator
    emailAccounts: 0,
    spf: true,
    dkim: false,
    dmarc: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 1,
    createdById: "user_1",
    mailboxes: 0,
    records: {
      spf: "verified",
      dkim: "pending",
      dmarc: "pending",
      mx: "verified",
    },
    addedDate: "1 day ago",
  },
  {
    id: 3,
    domain: "example.com",
    name: "example.com",
    provider: "Google Workspace",
    status: "VERIFIED",
    daysActive: 120,
    reputation: 92, // MIGRATED: calculated from mailbox data using AnalyticsCalculator
    emailAccounts: 3,
    spf: true,
    dkim: true,
    dmarc: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 1,
    createdById: "user_1",
    // MIGRATED: Standardized metrics - raw counts only, no stored rates
    metrics: {
      sent: 245,
      delivered: 240, // calculated: sent - bounced
      opened_tracked: 108, // MIGRATED: standardized field name
      clicked_tracked: 25, // MIGRATED: standardized field name
      replied: 29,
      bounced: 5,
      unsubscribed: 2,
      spamComplaints: 0, // MIGRATED: standardized field name
    },
    warmupEnabled: true,
    dailyIncrease: 10,
    maxDailyEmails: 1000,
    initialDailyVolume: 10,
    warmupSpeed: "moderate",
    replyRate: "80", // Keep as string for warmup configuration
    threadDepth: "3",
    autoAdjustWarmup: true,
    // reputationFactors removed - use standardized calculation
    authentication: {
      spf: {
        enabled: true,
        record: "v=spf1 ip4:192.168.1.1 ip4:203.0.113.5 ~all",
        policy: "soft",
      },
      dkim: {
        enabled: true,
        selector: "default",
        key: "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ...",
      },
      dmarc: {
        enabled: true,
        policy: "quarantine",
        percentage: 100,
        reportEmail: "dmarc-reports@example.com",
        record: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@example.com;",
      },
    },
    weeklyTrend: {
      // reputation removed - calculate from performance data
      emailsSent: [200, 210, 225, 230, 240, 245, 245],
    },
    records: {
      spf: "verified",
      dkim: "verified",
      dmarc: "verified",
      mx: "verified",
    },
    addedDate: "120 days ago",
    mailboxes: 2, // Two top accounts
  },
];

export const accountMetrics = {
  bounceRate: 0.02,
  spamComplaints: 0.001,
  // CLEANED UP: Removed stored rates - use DomainAnalyticsService and AnalyticsCalculator
  maxBounceRateThreshold: 0.05,
  maxSpamComplaintRateThreshold: 0.005,
  // CLEANED UP: Removed stored rate thresholds - use AnalyticsCalculator benchmarks
};

import { Mailbox } from "@/types/mailbox";
import { WarmupResponse } from "@/types/accounts";
import { CheckCircle, Globe, Server } from "lucide-react";
import { DNSRecord } from "@/types/domains";
export const mailboxes: Mailbox[] = [
  {
    id: 1,
    email: "john@mycompany.com",
    domain: "mycompany.com",
    status: "ACTIVE",
    campaign: "Q1 SaaS Outreach",
    provider: "Gmail",
    warmupStatus: "WARMED",
    reputation: 88, // MIGRATED: calculated from performance data using AnalyticsCalculator
    dailyLimit: 50,
    sent: 847,
    delivered: 820, // calculated: sent - bounced
    opened_tracked: 340, // MIGRATED: standardized field name
    clicked_tracked: 85, // MIGRATED: standardized field name
    replied: 189,
    bounced: 27, // sent - delivered
    unsubscribed: 8,
    spamComplaints: 2, // MIGRATED: standardized field name
    sent24h: 89,
    lastActivity: "2 hours ago",
    lastSync: "2023-10-15T10:30:00Z",
    warmupProgress: 100,
    warmupDays: 28,
    totalSent: 456,
    replies: 189, // Legacy field - same as replied
    engagement: "high", // Legacy field - calculate on-demand
    spf: true,
    dkim: true,
    dmarc: true,
    enableWarmup: false,
    enableWarmupLimits: true,
    createdAt: "2023-10-01T12:00:00Z",
    updatedAt: "2023-10-15T10:30:00Z",
    companyId: 1,
    createdById: "user1",
    accountType: "LINUX_USER",
  },
  {
    id: 2,
    email: "sarah@mycompany.com",
    domain: "mycompany.com",
    status: "ACTIVE",
    campaign: "Enterprise Prospects",
    provider: "Outlook",
    warmupStatus: "WARMING",
    reputation: 72, // MIGRATED: calculated from performance data using AnalyticsCalculator
    dailyLimit: 30,
    sent: 432,
    delivered: 420, // calculated: sent - bounced
    opened_tracked: 156, // MIGRATED: standardized field name
    clicked_tracked: 42, // MIGRATED: standardized field name
    replied: 87,
    bounced: 12, // sent - delivered
    unsubscribed: 4,
    spamComplaints: 1, // MIGRATED: standardized field name
    sent24h: 45,
    lastActivity: "4 hours ago",
    lastSync: "2023-10-15T09:15:00Z",
    warmupProgress: 60,
    warmupDays: 12,
    totalSent: 234,
    replies: 87, // Legacy field - same as replied
    engagement: "medium", // Legacy field - calculate on-demand
    spf: true,
    dkim: true,
    dmarc: true,
    enableWarmup: true,
    enableWarmupLimits: true,
    createdAt: "2023-10-01T12:00:00Z",
    updatedAt: "2023-10-15T09:15:00Z",
    companyId: 1,
    createdById: "user2",
    accountType: "VIRTUAL_USER_DB",
  },
  {
    id: 3,
    email: "mike@mycompany.com",
    domain: "mycompany.com",
    status: "SUSPENDED",
    campaign: null,
    provider: "Gmail",
    warmupStatus: "PAUSED",
    reputation: 45, // MIGRATED: calculated from performance data using AnalyticsCalculator
    dailyLimit: 25,
    sent: 298,
    delivered: 285, // calculated: sent - bounced
    opened_tracked: 99, // MIGRATED: standardized field name
    clicked_tracked: 25, // MIGRATED: standardized field name
    replied: 31,
    bounced: 13, // sent - delivered
    unsubscribed: 3,
    spamComplaints: 2, // MIGRATED: standardized field name
    sent24h: 12,
    lastActivity: "1 day ago",
    lastSync: "2023-10-14T16:45:00Z",
    warmupProgress: 25,
    warmupDays: 5,
    totalSent: 89,
    replies: 12, // Legacy field - same as replied
    engagement: "low", // Legacy field - calculate on-demand
    spf: false,
    dkim: true,
    dmarc: false,
    enableWarmup: true,
    enableWarmupLimits: false,
    createdAt: "2023-10-01T12:00:00Z",
    updatedAt: "2023-10-14T16:45:00Z",
    companyId: 1,
    createdById: "user3",
    accountType: "LINUX_USER",
  },
  {
    id: 4,
    email: "lisa@mycompany.com",
    domain: "mycompany.com",
    status: "ACTIVE",
    campaign: "Product Launch",
    provider: "Custom SMTP",
    warmupStatus: "WARMING",
    reputation: 78, // MIGRATED: calculated from performance data using AnalyticsCalculator
    dailyLimit: 35,
    sent: 523,
    delivered: 515, // calculated: sent - bounced
    opened_tracked: 191, // MIGRATED: standardized field name
    clicked_tracked: 48, // MIGRATED: standardized field name
    replied: 62,
    bounced: 8, // estimated
    unsubscribed: 5, // estimated
    spamComplaints: 1, // MIGRATED: standardized field name
    sent24h: 67,
    lastActivity: "6 hours ago",
    lastSync: "2023-10-15T08:30:00Z",
    warmupProgress: 40,
    warmupDays: 8,
    totalSent: 167,
    replies: 34, // Legacy field - same as replied
    engagement: "medium", // Legacy field - calculate on-demand
    spf: true,
    dkim: true,
    dmarc: true,
    enableWarmup: true,
    enableWarmupLimits: true,
    createdAt: "2023-10-01T12:00:00Z",
    updatedAt: "2023-10-15T08:30:00Z",
    companyId: 1,
    createdById: "user4",
    accountType: "VIRTUAL_USER_DB",
  },
  {
    id: 5,
    email: "david@mycompany.com",
    domain: "mycompany.com",
    status: "ACTIVE",
    campaign: "Partnership Outreach",
    provider: "SendGrid",
    warmupStatus: "WARMED",
    reputation: 91, // MIGRATED: calculated from performance data using AnalyticsCalculator
    dailyLimit: 40,
    sent: 689,
    delivered: 682, // calculated: sent - bounced
    opened_tracked: 295, // MIGRATED: standardized field name
    clicked_tracked: 89, // MIGRATED: standardized field name
    replied: 267,
    bounced: 7, // estimated
    unsubscribed: 6, // estimated
    spamComplaints: 1, // MIGRATED: standardized field name
    sent24h: 95,
    lastActivity: "1 hour ago",
    lastSync: "2023-10-15T11:00:00Z",
    warmupProgress: 100,
    warmupDays: 35,
    totalSent: 623,
    replies: 78, // Legacy field - same as replied
    engagement: "high", // Legacy field - calculate on-demand
    spf: true,
    dkim: true,
    dmarc: true,
    enableWarmup: false,
    enableWarmupLimits: true,
    createdAt: "2023-10-01T12:00:00Z",
    updatedAt: "2023-10-15T11:00:00Z",
    companyId: 1,
    createdById: "user5",
    accountType: "LINUX_USER",
  },
  {
    id: 6,
    email: "sales@example.com",
    domain: "example.com",
    status: "ACTIVE",
    campaign: null,
    provider: "Gmail",
    warmupStatus: "WARMED",
    reputation: 95, // MIGRATED: calculated from performance data using AnalyticsCalculator
    dailyLimit: 300,
    sent: 250,
    delivered: 245, // calculated: sent - bounced
    opened_tracked: 110, // MIGRATED: standardized field name
    clicked_tracked: 28, // MIGRATED: standardized field name
    replied: 0,
    bounced: 5, // estimated
    unsubscribed: 2, // estimated
    spamComplaints: 0, // MIGRATED: standardized field name
    sent24h: 250,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    warmupProgress: 100,
    warmupDays: 30,
    totalSent: 250,
    replies: 45, // Legacy field - same as replied
    engagement: "medium", // Legacy field - calculate on-demand
    spf: true,
    dkim: true,
    dmarc: true,
    enableWarmup: false,
    enableWarmupLimits: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 1,
    createdById: "user_1",
    accountType: "LINUX_USER",
  },
  {
    id: 7,
    email: "support@example.com",
    domain: "example.com",
    status: "ACTIVE",
    campaign: null,
    provider: "Outlook",
    warmupStatus: "WARMING",
    reputation: 68, // MIGRATED: calculated from performance data using AnalyticsCalculator
    dailyLimit: 200,
    sent: 150,
    delivered: 150, // calculated: sent - bounced
    opened_tracked: 68, // MIGRATED: standardized field name
    clicked_tracked: 18, // MIGRATED: standardized field name
    replied: 0,
    bounced: 0, // no bounces
    unsubscribed: 2, // estimated
    spamComplaints: 0, // MIGRATED: standardized field name
    sent24h: 150,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    warmupProgress: 75,
    warmupDays: 15,
    totalSent: 150,
    replies: 23, // Legacy field - same as replied
    engagement: "low", // Legacy field - calculate on-demand
    spf: true,
    dkim: true,
    dmarc: true,
    enableWarmup: false,
    enableWarmupLimits: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    companyId: 1,
    createdById: "user_1",
    accountType: "VIRTUAL_USER_DB",
  },
];

/**
 * Mocked warmup data for the warmup API endpoint
 */
export const warmupData: WarmupResponse = {
  accounts: [
    {
      id: 1,
      email: "john@example.com",
      status: "Active",
      sentToday: 39,
      inboxRate: 97.5,
      spamRate: 2.5,
      reputation: 90,
      dailyLimit: 45,
      daysActive: 8,
    },
    {
      id: 2,
      email: "sales@example.com",
      status: "Active",
      sentToday: 68,
      inboxRate: 95.5,
      spamRate: 4.5,
      reputation: 85,
      dailyLimit: 70,
      daysActive: 14,
    },
    {
      id: 3,
      email: "marketing@example.com",
      status: "Paused",
      sentToday: 1,
      inboxRate: 92.0,
      spamRate: 8.0,
      reputation: 78,
      dailyLimit: 30,
      daysActive: 6,
    },
  ],
  stats: [
    {
      name: "Apr 20",
      volume: 10,
      inbox: 10,
      spam: 0,
      reputation: 72,
    },
    {
      name: "Apr 21",
      volume: 15,
      inbox: 14,
      spam: 1,
      reputation: 75,
    },
    {
      name: "Apr 22",
      volume: 20,
      inbox: 19,
      spam: 1,
      reputation: 77,
    },
    {
      name: "Apr 23",
      volume: 25,
      inbox: 24,
      spam: 1,
      reputation: 80,
    },
    {
      name: "Apr 24",
      volume: 30,
      inbox: 29,
      spam: 1,
      reputation: 83,
    },
    {
      name: "Apr 25",
      volume: 35,
      inbox: 34,
      spam: 1,
      reputation: 86,
    },
    {
      name: "Apr 26",
      volume: 40,
      inbox: 39,
      spam: 1,
      reputation: 88,
    },
    {
      name: "Apr 27",
      volume: 45,
      inbox: 44,
      spam: 1,
      reputation: 90,
    },
  ],
};

export const steps = [
  {
    number: 1,
    title: "Enter Domain",
    subtitle: "Provide your domain name",
    icon: Globe,
    color: "bg-blue-500",
  },
  {
    number: 2,
    title: "Set Up DNS Records",
    subtitle: "Configure DNS settings",
    icon: Server,
    color: "bg-purple-500",
  },
  {
    number: 3,
    title: "Confirmation",
    subtitle: "Domain verified successfully",
    icon: CheckCircle,
    color: "bg-green-500 text-white",
  },
];

export const dnsRecords: DNSRecord[] = [
  {
    type: "SPF",
    name: "@",
    value: "v=spf1 include:penguinmails.com ~all",
    status: "pending",
    description: "Sender Policy Framework - Prevents email spoofing",
  },
  {
    type: "DKIM",
    name: "penguin._domainkey",
    value:
      "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7vbqajDw4o6gJy8ousKZQrBqj...",
    status: "pending",
    description: "DomainKeys Identified Mail - Email authentication",
  },
  {
    type: "DMARC",
    name: "_dmarc",
    value: "v=DMARC1; p=none; rua=mailto:dmarc@penguinmails.com",
    status: "pending",
    description: "Domain-based Message Authentication - Email policy",
  },
  {
    type: "MX",
    name: "@",
    value: "mx.penguinmails.com",
    status: "pending",
    description: "Mail Exchange - Routes incoming emails",
  },
];
