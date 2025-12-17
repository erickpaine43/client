import {
  AlertTriangle,
  BarChart3,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  MousePointer,
  Reply,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

export const tabs = [
  { id: "/", label: "Overview", icon: BarChart3 },
  { id: "campaigns", label: "By Campaign", icon: Target },
  { id: "mailboxes", label: "By Mailbox", icon: Mail },
];

export const getDaysFromRange = (range: string) => {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
      return 365;
    case "custom":
      return 30; // Default for custom
    default:
      return 30;
  }
};
export const generateTimeSeriesData = (
  days: number,
  granularity: "day" | "week" | "month",
) => {
  const data = [];
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
      sent,
      delivered,
      opened_tracked: Math.floor(delivered * (0.3 + Math.random() * 0.2)), // 30-50% open rate
      clicked_tracked: Math.floor(delivered * (0.08 + Math.random() * 0.05)), // 8-13% click rate
      replied: Math.floor(delivered * (0.05 + Math.random() * 0.03)), // 5-8% reply rate
      bounced: sent - delivered, // Bounced = sent - delivered
      unsubscribed: Math.floor(delivered * (0.01 + Math.random() * 0.01)), // 1-2% unsubscribe rate
      spamComplaints: Math.floor(delivered * (0.001 + Math.random() * 0.004)), // 0.1-0.5% spam rate
    });
  }

  return data;
};

export const generateWarmupChartData = (
  days: number,
  granularity: "day" | "week" | "month",
) => {
  const data = [];
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

    // Adjust base value for longer periods
    const baseWarmups = (20 + Math.random() * 30) * periodLength;

    data.push({
      date:
        granularity === "day"
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : granularity === "week"
            ? `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      totalWarmups: Math.floor(baseWarmups * (0.9 + Math.random() * 0.2)),
      spamComplaints: Math.floor(baseWarmups * (0.02 + Math.random() * 0.03)), // MIGRATED: standardized field name
      replies: Math.floor(baseWarmups * (0.04 + Math.random() * 0.04)),
    });
  }

  return data;
};

export const metrics = [
  {
    key: "sent",
    label: "Emails Sent",
    color: "#3B82F6",
    icon: Mail,
    visible: true,
  },
  {
    key: "delivered",
    label: "Delivered",
    color: "#06B6D4",
    icon: Mail,
    visible: true,
  },
  {
    key: "opened_tracked",
    label: "Opens (Tracked)",
    color: "#8B5CF6",
    icon: Eye,
    visible: true,
  },
  {
    key: "clicked_tracked",
    label: "Clicks (Tracked)",
    color: "#F59E0B",
    icon: MousePointer,
    visible: true,
  },
  {
    key: "replied",
    label: "Replies",
    color: "#10B981",
    icon: Reply,
    visible: true,
  },
  {
    key: "bounced",
    label: "Bounced",
    color: "#EF4444",
    icon: AlertTriangle,
    visible: false,
  },
];

// MIGRATED: Warmup metrics using standardized field names
// CLEANED UP: Warmup metrics using standardized field names
export const warmupMetrics = [
  {
    key: "totalWarmups",
    label: "Total Warmups",
    color: "#3B82F6",
    icon: Mail,
    visible: true,
    tooltip: "Emails we sent from your mailbox as part of the warmup process to improve deliverability.",
  },
  {
    key: "spamComplaints", // CLEANED UP: standardized field name (was spamFlags)
    label: "Spam Complaints",
    color: "#DC2626",
    icon: AlertTriangle,
    visible: true,
    tooltip: "Emails that landed in the spam folder during warmups. We then moved them to the inbox to help improve the reputation.",
  },
  {
    key: "replies",
    label: "Replies",
    color: "#059669",
    icon: MessageSquare,
    visible: true,
    tooltip: "Replies we sent to emails received from your mailbox during the warmup process to simulate real conversations.",
  },
];

// CLEANED UP: Warmup chart data using standardized field names
export const warmupChartData = [
  { date: "Aug 5", totalWarmups: 245, spamComplaints: 3, replies: 12 }, // CLEANED UP: spamComplaints standardized (was spamFlags)
  { date: "Aug 6", totalWarmups: 267, spamComplaints: 2, replies: 18 }, // CLEANED UP: spamComplaints standardized (was spamFlags)
  { date: "Aug 7", totalWarmups: 289, spamComplaints: 5, replies: 15 }, // CLEANED UP: spamComplaints standardized (was spamFlags)
  { date: "Aug 8", totalWarmups: 312, spamComplaints: 1, replies: 22 }, // CLEANED UP: spamComplaints standardized (was spamFlags)
  { date: "Aug 9", totalWarmups: 298, spamComplaints: 4, replies: 19 }, // CLEANED UP: spamComplaints standardized (was spamFlags)
  { date: "Aug 10", totalWarmups: 334, spamComplaints: 2, replies: 25 }, // CLEANED UP: spamComplaints standardized (was spamFlags)
  { date: "Aug 11", totalWarmups: 356, spamComplaints: 3, replies: 28 }, // CLEANED UP: spamComplaints standardized (was spamFlags)
];

// CLEANED UP: Campaign comparison data using standardized format
export const campaignData = [
  {
    campaignId: "q1-saas-outreach",
    campaignName: "Q1 SaaS Outreach",
    sent: 847,
    delivered: 837, // sent - bounced
    opened_tracked: 289, // CLEANED UP: standardized field name (was opens)
    clicked_tracked: 73, // CLEANED UP: standardized field name (was clicks)
    replied: 42,
    bounced: 10,
    unsubscribed: 8,
    spamComplaints: 2, // CLEANED UP: standardized field name (was spamFlags)
  },
  {
    campaignId: "enterprise-prospects",
    campaignName: "Enterprise Prospects",
    sent: 1203,
    delivered: 1198, // sent - bounced
    opened_tracked: 502, // CLEANED UP: standardized field name (was opens)
    clicked_tracked: 124, // CLEANED UP: standardized field name (was clicks)
    replied: 89,
    bounced: 5,
    unsubscribed: 12,
    spamComplaints: 1, // CLEANED UP: standardized field name (was spamFlags)
  },
  {
    campaignId: "smb-follow-up",
    campaignName: "SMB Follow-up",
    sent: 492,
    delivered: 484, // sent - bounced
    opened_tracked: 142, // CLEANED UP: standardized field name (was opens)
    clicked_tracked: 31, // CLEANED UP: standardized field name (was clicks)
    replied: 18,
    bounced: 8,
    unsubscribed: 5,
    spamComplaints: 1, // CLEANED UP: standardized field name (was spamFlags)
  },
  {
    campaignId: "product-launch",
    campaignName: "Product Launch",
    sent: 2156,
    delivered: 2144, // sent - bounced
    opened_tracked: 849, // CLEANED UP: standardized field name (was opens)
    clicked_tracked: 287, // CLEANED UP: standardized field name (was clicks)
    replied: 156,
    bounced: 12,
    unsubscribed: 21,
    spamComplaints: 3, // CLEANED UP: standardized field name (was spamFlags)
  },
];
export const campaigns = [
  { id: "all", name: "All Campaigns" },
  { id: "q1-saas", name: "Q1 SaaS Outreach" },
  { id: "enterprise", name: "Enterprise Prospects" },
  { id: "smb", name: "SMB Follow-up" },
  { id: "product-launch", name: "Product Launch" },
];

export const mailboxes = [
  { id: "all", name: "All Mailboxes" },
  { id: "john", name: "john@mycompany.com" },
  { id: "sarah", name: "sarah@mycompany.com" },
  { id: "mike", name: "mike@mycompany.com" },
  { id: "lisa", name: "lisa@mycompany.com" },
];

export const mockMailboxes = [
  {
    id: "1",
    name: "Primary Sales",
    email: "sales@company.com",
    status: "active",
    warmupProgress: 95,
    dailyVolume: 45,
    healthScore: 92,
  },
  {
    id: "2",
    name: "Outreach Account",
    email: "outreach@company.com",
    status: "warming",
    warmupProgress: 67,
    dailyVolume: 30,
    healthScore: 78,
  },
  {
    id: "3",
    name: "Follow-up Bot",
    email: "followup@company.com",
    status: "active",
    warmupProgress: 88,
    dailyVolume: 35,
    healthScore: 85,
  },
  {
    id: "4",
    name: "Lead Generation",
    email: "leads@company.com",
    status: "paused",
    warmupProgress: 42,
    dailyVolume: 0,
    healthScore: 65,
  },
];

export const smartInsightsList = [
  {
    id: "unread",
    label: "Unread",
    count: 24,
    icon: Mail,
    borderColor: "border-blue-200",
    iconBackground: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "interested",
    label: "Interested",
    count: 12,
    icon: TrendingUp,
    borderColor: "border-green-200",
    iconBackground: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "avgResponse",
    label: "Avg Response",
    count: "2.3h",
    icon: Clock,
    borderColor: "border-purple-200",
    iconColor: "text-purple-600",
    iconBackground: "bg-purple-100",
  },
  {
    id: "notInterested",
    label: "Not Interested",
    count: 8,
    icon: X,
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    iconBackground: "bg-red-100",
  },
];
