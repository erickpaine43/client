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
    openRate: "34.2%",
    replyRate: "8.6%",
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
    openRate: "41.7%",
    replyRate: "10.3%",
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
    openRate: "28.9%",
    replyRate: "7.7%",
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
    openRate: "39.4%",
    replyRate: "13.3%",
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
    openRate: "42.1%",
    replyRate: "13.9%",
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
    opens: 289,
    clicks: 73,
    replies: 42,
    openRate: "34.1%",
    clickRate: "8.6%",
    replyRate: "5.0%",
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
    opens: 198,
    clicks: 31,
    replies: 18,
    openRate: "25.9%",
    clickRate: "4.1%",
    replyRate: "2.4%",
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

// Define the structure for campaign data based on UI usage
interface CampaignData {
  id: string;
  name: string;
  status: "Running" | "Paused" | "Draft" | "Completed";
  progressCurrent: number;
  progressTotal: number;
  opens: number;
  opensPercent: number;
  clicks: number;
  clicksPercent: number;
  replies: number;
  repliesPercent: number;
  lastActivity: string;
}

// Mock data for UI campaigns display
export const mockedCampaigns: CampaignData[] = [
  {
    id: "1",
    name: "Software CEOs Outreach",
    status: "Running",
    progressCurrent: 1285,
    progressTotal: 2500,
    opens: 840,
    opensPercent: 65.4,
    clicks: 210,
    clicksPercent: 16.3,
    replies: 84,
    repliesPercent: 6.5,
    lastActivity: "2 hours ago",
  },
  {
    id: "2",
    name: "Marketing Directors Follow-up",
    status: "Paused",
    progressCurrent: 1800,
    progressTotal: 1800,
    opens: 1170,
    opensPercent: 65.0,
    clicks: 432,
    clicksPercent: 24.0,
    replies: 216,
    repliesPercent: 12.0,
    lastActivity: "Yesterday",
  },
  {
    id: "3",
    name: "Startup Founders Introduction",
    status: "Draft",
    progressCurrent: 0,
    progressTotal: 1200,
    opens: 0,
    opensPercent: 0,
    clicks: 0,
    clicksPercent: 0,
    replies: 0,
    repliesPercent: 0,
    lastActivity: "3 days ago",
  },
  {
    id: "4",
    name: "SaaS Decision Makers",
    status: "Running",
    progressCurrent: 450,
    progressTotal: 1500,
    opens: 280,
    opensPercent: 62.2,
    clicks: 85,
    clicksPercent: 18.9,
    replies: 42,
    repliesPercent: 9.3,
    lastActivity: "5 minutes ago",
  },
  {
    id: "5",
    name: "Enterprise IT Directors",
    status: "Completed",
    progressCurrent: 2000,
    progressTotal: 2000,
    opens: 1400,
    opensPercent: 70.0,
    clicks: 600,
    clicksPercent: 30.0,
    replies: 320,
    repliesPercent: 16.0,
    lastActivity: "1 week ago",
  },
];

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
  openRate: 65.4,
  clickRate: 16.3,
  replyRate: 6.5,
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

export const mockStatsComparison = {
  openRate: { value: 12.5, trend: "up" },
  clickRate: { value: 8.2, trend: "up" },
  replyRate: { value: 15.0, trend: "up" },
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
