import { CampaignStatusEnum, StatsCardData, RecentReply, WarmupSummaryData, SequenceStep, CampaignResponse, EmailEventType, CampaignFormValues } from "@/types/campaign";
import { Mail, Send, TrendingUp, Users } from "lucide-react";

export const campaignsData = [
  {
    id: 1,
    name: "Q1 SaaS Outreach",
    status: CampaignStatusEnum.active,
    mailboxes: 3,
    leadsSent: 847,
    replies: 73,
    // CLEANED UP: Removed stored rates - use CampaignAnalyticsService for analytics
    lastSent: "2 hours ago",
    createdDate: "2024-01-01",
    assignedMailboxes: [
      "john@mycompany.com",
      "sarah@mycompany.com",
      "mike@mycompany.com",
    ],
    leadsList: {
      id: 1,
      name: "Q1 SaaS Leads",
      description: "Leads collected from Q1 SaaS events and webinars",
      contacts: 1200,
    },
  },
  {
    id: 2,
    name: "Enterprise Prospects",
    status: CampaignStatusEnum.paused,
    mailboxes: 5,
    leadsSent: 1203,
    replies: 124,
    // CLEANED UP: Removed stored rates
    lastSent: "1 day ago",
    createdDate: "2024-01-05",
    assignedMailboxes: [
      "john@mycompany.com",
      "sarah@mycompany.com",
      "mike@mycompany.com",
      "lisa@mycompany.com",
      "david@mycompany.com",
    ],
    leadsList: {
      id: 2,
      name: "Enterprise Leads",
      description: "High-value enterprise leads from industry reports",
      contacts: 2000,
    },
  },
  {
    id: 3,
    name: "SMB Follow-up",
    status: CampaignStatusEnum.active,
    mailboxes: 2,
    leadsSent: 492,
    replies: 38,
    // CLEANED UP: Removed stored rates
    lastSent: "4 hours ago",
    createdDate: "2024-01-10",
    assignedMailboxes: ["lisa@mycompany.com", "david@mycompany.com"],
    leadsList: {
      id: 3,
      name: "SMB Leads",
      description: "Leads from small and medium businesses in Q1",
      contacts: 800,
    },
  },
  {
    id: 4,
    name: "Product Launch Outreach",
    status: CampaignStatusEnum.completed,
    mailboxes: 4,
    leadsSent: 2156,
    replies: 287,
    // CLEANED UP: Removed stored rates
    lastSent: "1 week ago",
    createdDate: "2023-12-15",
    assignedMailboxes: [
      "john@mycompany.com",
      "sarah@mycompany.com",
      "mike@mycompany.com",
      "lisa@mycompany.com",
    ],
    leadsList: {
      id: 2,
      name: "Enterprise Leads",
      description: "High-value enterprise leads from industry reports",
      contacts: 2000,
    },
  },
  {
    id: 5,
    name: "Partnership Outreach",
    status: CampaignStatusEnum.active,
    mailboxes: 2,
    leadsSent: 324,
    replies: 45,
    // CLEANED UP: Removed stored rates
    lastSent: "6 hours ago",
    createdDate: "2024-01-12",
    assignedMailboxes: ["sarah@mycompany.com", "david@mycompany.com"],
    leadsList: {
      id: 1,
      name: "Q1 SaaS Leads",
      description: "Leads collected from Q1 SaaS events and webinars",
      contacts: 1200,
    },
  },
];


export const sequenceSteps: SequenceStep[] = [
  {
    id: 1,
    type: "email",
    subject: "Quick question about {{company}}",
    sent: 847,
    delivered: 837,
    opened_tracked: 289, // MIGRATED: standardized field name
    clicked_tracked: 73, // MIGRATED: standardized field name
    replied: 42,
    bounced: 10,
    unsubscribed: 8,
    spamComplaints: 2, // MIGRATED: standardized field name
    // MIGRATED: Rates removed - calculate on-demand using AnalyticsCalculator
  },
  {
    id: 2,
    type: "wait",
    duration: "2 days",
    completed: 805,
  },
  {
    id: 3,
    type: "email",
    subject: "Following up on my previous email",
    sent: 763,
    delivered: 758,
    opened_tracked: 198, // MIGRATED: standardized field name
    clicked_tracked: 31, // MIGRATED: standardized field name
    replied: 18,
    bounced: 5,
    unsubscribed: 7,
    spamComplaints: 1, // MIGRATED: standardized field name
    // MIGRATED: Rates removed - calculate on-demand using AnalyticsCalculator
  },
];

export const campaignLeads = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@techcorp.com",
    company: "TechCorp",
    status: "replied",
    currentStep: 1,
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@startup.io",
    company: "Startup.io",
    status: "opened",
    currentStep: 2,
    lastActivity: "4 hours ago",
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    email: "lisa@enterprise.com",
    company: "Enterprise Inc",
    status: "sent",
    currentStep: 1,
    lastActivity: "6 hours ago",
  },
];

export const activityLog = [
  {
    id: 1,
    type: "sent",
    message: "Email sent to Sarah Johnson",
    timestamp: "2 hours ago",
    details: "Step 1: Quick question about {{company}}",
  },
  {
    id: 2,
    type: "reply",
    message: "Reply received from Mike Chen",
    timestamp: "4 hours ago",
    details: "Positive response - interested in demo",
  },
  {
    id: 3,
    type: "opened",
    message: "Email opened by Lisa Rodriguez",
    timestamp: "6 hours ago",
    details: "Step 1: Quick question about {{company}}",
  },
];

export const availableMailboxes = [
  "john@mycompany.com",
  "sarah@mycompany.com",
  "mike@mycompany.com",
  "lisa@mycompany.com",
  "david@mycompany.com",
];

export const statsCards: StatsCardData[] = [
  { title: "Active Campaigns", value: "12", icon: Send, color: "bg-blue-500" },
  {
    title: "Leads Contacted",
    value: "2,847",
    icon: Users,
    color: "bg-green-500",
  },
  { title: "Open Rate", value: "34.2%", icon: Mail, color: "bg-purple-500" },
  {
    title: "Reply Rate",
    value: "8.7%",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
];
export const recentReplies: RecentReply[] = [
  {
    name: "Sarah Johnson",
    email: "sarah@techcorp.com",
    company: "TechCorp",
    message:
      "Thanks for reaching out! I'd love to schedule a call to discuss this further.",
    time: "2 hours ago",
    type: "positive",
  },
  {
    name: "Mike Chen",
    email: "mike@startup.io",
    company: "Startup.io",
    message:
      "Not interested at this time, but please keep us in mind for the future.",
    time: "4 hours ago",
    type: "neutral",
  },
  {
    name: "Lisa Rodriguez",
    email: "lisa@enterprise.com",
    company: "Enterprise Inc",
    message:
      "This looks interesting. Can you send me more information about pricing?",
    time: "6 hours ago",
    type: "positive",
  },
];

export const warmupSummaryData: WarmupSummaryData = {
  activeMailboxes: 8,
  warmingUp: 3,
  readyToSend: 5,
  needsAttention: 2,
};

// CampaignData interface is defined below as export

// Standardized campaign data structure
interface StandardizedCampaignData {
  campaignId: string;
  campaignName: string;
  status: "Running" | "Paused" | "Draft" | "Completed";
  sent: number;
  totalLeads: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  spamComplaints: number;
  lastActivity: string;
}

// Mock data for UI campaigns display - standardized format
export const mockedCampaigns: StandardizedCampaignData[] = [
  {
    campaignId: "1",
    campaignName: "Software CEOs Outreach",
    status: "Running",
    sent: 1285,
    totalLeads: 2500,
    delivered: 1260, // sent - bounced
    opened_tracked: 840,
    clicked_tracked: 210,
    replied: 84,
    bounced: 25,
    unsubscribed: 12,
    spamComplaints: 3,
    lastActivity: "2 hours ago",
  },
  {
    campaignId: "2",
    campaignName: "Marketing Directors Follow-up",
    status: "Paused",
    sent: 1800,
    totalLeads: 1800,
    delivered: 1785, // sent - bounced
    opened_tracked: 1170,
    clicked_tracked: 432,
    replied: 216,
    bounced: 15,
    unsubscribed: 18,
    spamComplaints: 2,
    lastActivity: "Yesterday",
  },
  {
    campaignId: "3",
    campaignName: "Startup Founders Introduction",
    status: "Draft",
    sent: 0,
    totalLeads: 1200,
    delivered: 0,
    opened_tracked: 0,
    clicked_tracked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
    spamComplaints: 0,
    lastActivity: "3 days ago",
  },
  {
    campaignId: "4",
    campaignName: "SaaS Decision Makers",
    status: "Running",
    sent: 450,
    totalLeads: 1500,
    delivered: 442, // sent - bounced
    opened_tracked: 280,
    clicked_tracked: 85,
    replied: 42,
    bounced: 8,
    unsubscribed: 4,
    spamComplaints: 1,
    lastActivity: "5 minutes ago",
  },
  {
    campaignId: "5",
    campaignName: "Enterprise IT Directors",
    status: "Completed",
    sent: 2000,
    totalLeads: 2000,
    delivered: 1980, // sent - bounced
    opened_tracked: 1400,
    clicked_tracked: 600,
    replied: 320,
    bounced: 20,
    unsubscribed: 25,
    spamComplaints: 5,
    lastActivity: "1 week ago",
  },
];

// Legacy interface for backward compatibility
export interface CampaignData {
  id: string;
  name: string;
  status: "Running" | "Paused" | "Draft" | "Completed";
  progressCurrent: number;
  progressTotal: number;
  /** @deprecated Use opened_tracked instead */
  opens: number;
  /** @deprecated Calculate rate on-demand instead */
  opensPercent: number;
  /** @deprecated Use clicked_tracked instead */
  clicks: number;
  /** @deprecated Calculate rate on-demand instead */
  clicksPercent: number;
  replies: number;
  /** @deprecated Calculate rate on-demand instead */
  repliesPercent: number;
  lastActivity: string;
}

// Original CampaignResponse mock data
export const mockCampaigns: CampaignResponse[] = [
  {
    id: 1,
    name: "Software CEOs Outreach",
    status: "ACTIVE",
    clients: Array.from({ length: 2500 }, (_, i) => ({
      campaignId: 1,
      clientId: i + 1,
      statusInCampaign: "ACTIVE",
    })),
    emailEvents: [
      ...Array.from({ length: 1285 }, () => ({
        type: "SENT" as EmailEventType,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      })),
      ...Array.from({ length: 840 }, () => ({
        type: "OPENED" as EmailEventType,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      })),
      ...Array.from({ length: 210 }, () => ({
        type: "CLICKED" as EmailEventType,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      })),
      ...Array.from({ length: 84 }, () => ({
        type: "REPLIED" as EmailEventType,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      })),
    ],
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    name: "Marketing Directors Follow-up",
    status: "PAUSED",
    clients: Array.from({ length: 1800 }, (_, i) => ({
      campaignId: 2,
      clientId: i + 1,
      statusInCampaign: "ACTIVE",
    })),
    emailEvents: [
      ...Array.from({ length: 1800 }, () => ({
        type: "SENT" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 1170 }, () => ({
        type: "OPENED" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 432 }, () => ({
        type: "CLICKED" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 216 }, () => ({
        type: "REPLIED" as EmailEventType,
        timestamp: new Date(),
      })),
    ],
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    name: "Startup Founders Introduction",
    status: "DRAFT",
    clients: Array.from({ length: 1200 }, (_, i) => ({
      campaignId: 3,
      clientId: i + 1,
      statusInCampaign: "ACTIVE",
    })),
    emailEvents: [],
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    name: "SaaS Decision Makers",
    status: "ACTIVE",
    clients: Array.from({ length: 1500 }, (_, i) => ({
      campaignId: 4,
      clientId: i + 1,
      statusInCampaign: "ACTIVE",
    })),
    emailEvents: [
      ...Array.from({ length: 450 }, () => ({
        type: "SENT" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 280 }, () => ({
        type: "OPENED" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 85 }, () => ({
        type: "CLICKED" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 42 }, () => ({
        type: "REPLIED" as EmailEventType,
        timestamp: new Date(),
      })),
    ],
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 5,
    name: "Enterprise IT Directors",
    status: "COMPLETED",
    clients: Array.from({ length: 2000 }, (_, i) => ({
      campaignId: 5,
      clientId: i + 1,
      statusInCampaign: "ACTIVE",
    })),
    emailEvents: [
      ...Array.from({ length: 2000 }, () => ({
        type: "SENT" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 1400 }, () => ({
        type: "OPENED" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 600 }, () => ({
        type: "CLICKED" as EmailEventType,
        timestamp: new Date(),
      })),
      ...Array.from({ length: 320 }, () => ({
        type: "REPLIED" as EmailEventType,
        timestamp: new Date(),
      })),
    ],
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export const mockCampaignDetail = {
  ...mockCampaigns[0],
  sequence: [
    {
      id: 1,
      name: "Initial Outreach",
      subject: "Quick question about your software",
      sent: 2500,
      opens: 1625,
      clicks: 406,
      replies: 203,
    },
    {
      id: 2,
      name: "Follow-up 1",
      subject: "Re: Quick question about your software",
      sent: 2297,
      opens: 1608,
      clicks: 482,
      replies: 241,
    },
    {
      id: 3,
      name: "Break-up Email",
      subject: "Closing the loop",
      sent: 2056,
      opens: 1439,
      clicks: 288,
      replies: 144,
    },
  ],
  // CLEANED UP: Removed stored rates - use AnalyticsCalculator for rate calculations
};

const editMockCampaign: Omit<CampaignResponse, "event" | "clients"> =
  mockCampaigns[0];

export const mockCampaignEditDetail: CampaignFormValues = {
  ...editMockCampaign,
  fromEmail: "juan@gm.com",
  fromName: "juan",
  timezone: "(GMT-01:00) Azores",
  clients: ["julio@mail.com", "pedro@gmail.com"],
  sendDays: [0, 2, 4, 6],
  sendTimeStart: "07:30",
  sendTimeEnd: "15:25",
  steps: [
    {
      id: 1,
      campaignId: 1,
      emailSubject: "Initial Outreach",
      emailBody: "Quick question about your software",
      condition: "IF_NOT_OPENED",
      delayDays: 1,
      delayHours: 2,
      sequenceOrder: 0,
      templateId: 0,
    },
    {
      id: 2,
      campaignId: 1,
      emailSubject: "Follow-up 1",
      emailBody: "Re: Quick question about your software",
      condition: "IF_NOT_REPLIED",
      delayDays: 1,
      delayHours: 1,
      sequenceOrder: 1,
      templateId: 0,
    },
    {
      id: 3,
      campaignId: 1,
      emailSubject: "Break-up Email",
      emailBody: "Closing the loop",
      delayDays: 1,
      delayHours: 4,
      sequenceOrder: 2,
      condition: "IF_NOT_CLICKED",
      templateId: 0,
    },
  ],
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
};

// DEPRECATED: Use AnalyticsService.getComparativeAnalytics() instead
export const mockStatsComparison = {
  // CLEANED UP: These stored rates should be calculated using AnalyticsCalculator
  openRate: { value: 12.5, trend: "up" }, // DEPRECATED: Calculate using AnalyticsCalculator.calculateOpenRate()
  clickRate: { value: 8.2, trend: "up" }, // DEPRECATED: Calculate using AnalyticsCalculator.calculateClickRate()
  replyRate: { value: 15.0, trend: "up" }, // DEPRECATED: Calculate using AnalyticsCalculator.calculateReplyRate()
  bounceRate: { value: 35.0, trend: "down" },
};

export const mockDailyData = [
  { name: "Mon", opens: 650, clicks: 230, replies: 123 },
  { name: "Tue", opens: 730, clicks: 280, replies: 154 },
  { name: "Wed", opens: 810, clicks: 310, replies: 169 },
  { name: "Thu", opens: 590, clicks: 210, replies: 98 },
  { name: "Fri", opens: 730, clicks: 290, replies: 147 },
];

export const mockSequenceData = [
  { name: "Email 1", opens: 1625, clicks: 406, replies: 203 },
  { name: "Email 2", opens: 1608, clicks: 482, replies: 241 },
  { name: "Email 3", opens: 1439, clicks: 288, replies: 144 },
];

export const mockChartConfig = {
  colors: {
    opens: "#0284c7",
    clicks: "#0ea5e9",
    replies: "#7dd3fc",
  },
  dataKeys: {
    opens: "opens",
    clicks: "clicks",
    replies: "replies",
  },
};

export const mockSettings = {
  created: "Oct 15, 2023",
  sendingAccount: "john@acme.com",
  sendingWindow: "9:00 AM - 5:00 PM",
  workingDays: "Mon - Fri",
  emailsPerDay: "Up to 500 emails",
};

// TODO: Potentially fetch timezone list dynamically
export const timezones = [
  "(GMT-12:00) International Date Line West",
  "(GMT-11:00) Midway Island, Samoa",
  "(GMT-10:00) Hawaii",
  "(GMT-09:00) Alaska",
  "(GMT-08:00) Pacific Time (US & Canada)",
  "(GMT-07:00) Mountain Time (US & Canada)",
  "(GMT-06:00) Central Time (US & Canada)",
  "(GMT-05:00) Eastern Time (US & Canada)",
  "(GMT-04:00) Atlantic Time (Canada)",
  "(GMT-03:00) Buenos Aires, Georgetown",
  "(GMT-02:00) Mid-Atlantic",
  "(GMT-01:00) Azores",
  "(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London",
  "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
  "(GMT+02:00) Athens, Bucharest, Istanbul",
  "(GMT+03:00) Moscow, St. Petersburg, Volgograd",
  "(GMT+04:00) Abu Dhabi, Muscat",
  "(GMT+05:00) Islamabad, Karachi, Tashkent",
  "(GMT+06:00) Almaty, Novosibirsk",
  "(GMT+07:00) Bangkok, Hanoi, Jakarta",
  "(GMT+08:00) Beijing, Perth, Singapore, Hong Kong",
  "(GMT+09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk",
  "(GMT+10:00) Brisbane, Canberra, Melbourne, Sydney",
  "(GMT+11:00) Magadan, Solomon Is., New Caledonia",
  "(GMT+12:00) Auckland, Wellington",
  "(GMT+13:00) Nuku'alofa",
];
