import type { NotificationFormValues, NotificationSettingsProps } from "../../types/settings";
import type { Notification } from "../../types/notification";
import { NotificationType as NotificationTypeEnum } from "../../types/notification";

// Notification Preference Types
export interface NotificationPreferences {
  id: string;
  userId: string;
  email: EmailNotificationPreferences;
  inApp: InAppNotificationPreferences;
  push: PushNotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailNotificationPreferences {
  newReplies: boolean;
  campaignUpdates: boolean;
  campaignCompletions: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  domainAlerts: boolean;
  warmupCompletion: boolean;
  systemAnnouncements: boolean;
  securityAlerts: boolean;
  billingReminders: boolean;
  teamInvitations: boolean;
  exportComplete: boolean;
}

export interface InAppNotificationPreferences {
  realTimeCampaignAlerts: boolean;
  emailAccountAlerts: boolean;
  newMessageAlerts: boolean;
  taskReminders: boolean;
  systemUpdates: boolean;
  performanceAlerts: boolean;
  collaborationMentions: boolean;
}

export interface PushNotificationPreferences {
  enabled: boolean;
  criticalAlertsOnly: boolean;
  desktopNotifications: boolean;
  mobileNotifications: boolean;
  sound: boolean;
  vibration: boolean;
}

// Notification Type Definitions
export interface NotificationType {
  id: string;
  name: string;
  category: "campaigns" | "domains" | "billing" | "security" | "team" | "system" | "reports";
  description: string;
  defaultEnabled: boolean;
  channels: NotificationChannel[];
  priority: "low" | "medium" | "high" | "critical";
  icon?: string;
}

export type NotificationChannel = "email" | "inApp" | "push" | "sms";

// Notification History Types
export interface NotificationHistory {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: "sent" | "delivered" | "read" | "failed";
  sentAt: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
}

// Notification Template Types
export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string; // For email notifications
  body: string;
  variables: string[]; // e.g., ["userName", "campaignName", "date"]
  channels: NotificationChannel[];
  active: boolean;
}

// Notification Schedule Types
export interface NotificationSchedule {
  id: string;
  userId: string;
  type: "weeklyReports" | "monthlyReports" | "customReminder";
  schedule: {
    frequency: "daily" | "weekly" | "monthly";
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:MM format
    timezone: string;
  };
  enabled: boolean;
}

// Notification Types List
export const notificationTypes: NotificationType[] = [
  // Campaign notifications
  {
    id: "notif-type-1",
    name: "New Replies",
    category: "campaigns",
    description: "Get notified when someone replies to your campaigns",
    defaultEnabled: true,
    channels: ["email", "inApp", "push"],
    priority: "high",
    icon: "📩",
  },
  {
    id: "notif-type-2",
    name: "Campaign Updates",
    category: "campaigns",
    description: "Updates about campaign status changes",
    defaultEnabled: true,
    channels: ["email", "inApp"],
    priority: "medium",
    icon: "📊",
  },
  {
    id: "notif-type-3",
    name: "Campaign Completions",
    category: "campaigns",
    description: "Notifications when campaigns finish running",
    defaultEnabled: true,
    channels: ["email", "inApp"],
    priority: "medium",
    icon: "✅",
  },
  
  // Domain notifications
  {
    id: "notif-type-4",
    name: "Domain Alerts",
    category: "domains",
    description: "Important alerts about your domain configuration",
    defaultEnabled: true,
    channels: ["email", "inApp", "push"],
    priority: "critical",
    icon: "🌐",
  },
  {
    id: "notif-type-5",
    name: "Warmup Completion",
    category: "domains",
    description: "Notification when domain warmup is complete",
    defaultEnabled: false,
    channels: ["email", "inApp"],
    priority: "low",
    icon: "🔥",
  },
  {
    id: "notif-type-6",
    name: "Email Account Alerts",
    category: "domains",
    description: "Alerts about email account issues or changes",
    defaultEnabled: true,
    channels: ["email", "inApp", "push"],
    priority: "high",
    icon: "⚠️",
  },
  
  // Report notifications
  {
    id: "notif-type-7",
    name: "Weekly Reports",
    category: "reports",
    description: "Weekly summary of your campaign performance",
    defaultEnabled: true,
    channels: ["email"],
    priority: "low",
    icon: "📈",
  },
  {
    id: "notif-type-8",
    name: "Monthly Reports",
    category: "reports",
    description: "Monthly overview of all activities",
    defaultEnabled: false,
    channels: ["email"],
    priority: "low",
    icon: "📊",
  },
  
  // Billing notifications
  {
    id: "notif-type-9",
    name: "Billing Reminders",
    category: "billing",
    description: "Reminders about upcoming payments and invoices",
    defaultEnabled: true,
    channels: ["email", "inApp"],
    priority: "high",
    icon: "💳",
  },
  {
    id: "notif-type-10",
    name: "Usage Alerts",
    category: "billing",
    description: "Alerts when approaching usage limits",
    defaultEnabled: true,
    channels: ["email", "inApp", "push"],
    priority: "high",
    icon: "📊",
  },
  
  // Security notifications
  {
    id: "notif-type-11",
    name: "Security Alerts",
    category: "security",
    description: "Important security-related notifications",
    defaultEnabled: true,
    channels: ["email", "inApp", "push"],
    priority: "critical",
    icon: "🔒",
  },
  {
    id: "notif-type-12",
    name: "Login Alerts",
    category: "security",
    description: "Notifications about new login attempts",
    defaultEnabled: false,
    channels: ["email", "push"],
    priority: "high",
    icon: "🔑",
  },
  
  // Team notifications
  {
    id: "notif-type-13",
    name: "Team Invitations",
    category: "team",
    description: "Notifications about team invitations and changes",
    defaultEnabled: true,
    channels: ["email", "inApp"],
    priority: "medium",
    icon: "👥",
  },
  {
    id: "notif-type-14",
    name: "Collaboration Mentions",
    category: "team",
    description: "Get notified when team members mention you",
    defaultEnabled: true,
    channels: ["inApp", "push"],
    priority: "medium",
    icon: "@",
  },
  
  // System notifications
  {
    id: "notif-type-15",
    name: "System Announcements",
    category: "system",
    description: "Important system updates and announcements",
    defaultEnabled: true,
    channels: ["email", "inApp"],
    priority: "medium",
    icon: "📢",
  },
  {
    id: "notif-type-16",
    name: "Export Complete",
    category: "system",
    description: "Notification when data export is ready",
    defaultEnabled: true,
    channels: ["email", "inApp"],
    priority: "low",
    icon: "📦",
  },
];

// Mock notification preferences
export const mockNotificationPreferences: NotificationPreferences = {
  id: "notif-pref-1",
  userId: "user-1",
  email: {
    newReplies: true,
    campaignUpdates: true,
    campaignCompletions: true,
    weeklyReports: true,
    monthlyReports: false,
    domainAlerts: true,
    warmupCompletion: false,
    systemAnnouncements: true,
    securityAlerts: true,
    billingReminders: true,
    teamInvitations: true,
    exportComplete: true,
  },
  inApp: {
    realTimeCampaignAlerts: true,
    emailAccountAlerts: true,
    newMessageAlerts: true,
    taskReminders: true,
    systemUpdates: true,
    performanceAlerts: false,
    collaborationMentions: true,
  },
  push: {
    enabled: true,
    criticalAlertsOnly: false,
    desktopNotifications: true,
    mobileNotifications: true,
    sound: true,
    vibration: true,
  },
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-12-20T15:30:00Z"),
};

// Mock notification settings for component props
export const mockNotificationSettingsProps: NotificationSettingsProps = {
  email: {
    campaignCompletions: mockNotificationPreferences.email.campaignCompletions,
    newReplies: mockNotificationPreferences.email.newReplies,
    weeklyReports: mockNotificationPreferences.email.weeklyReports,
    systemAnnouncements: mockNotificationPreferences.email.systemAnnouncements,
  },
  inApp: {
    realTimeCampaignAlerts: mockNotificationPreferences.inApp.realTimeCampaignAlerts,
    emailAccountAlerts: mockNotificationPreferences.inApp.emailAccountAlerts,
  },
};

// Mock notification form values
export const mockNotificationFormValues: NotificationFormValues = {
  newReplies: mockNotificationPreferences.email.newReplies,
  campaignUpdates: mockNotificationPreferences.email.campaignUpdates,
  weeklyReports: mockNotificationPreferences.email.weeklyReports,
  domainAlerts: mockNotificationPreferences.email.domainAlerts,
  warmupCompletion: mockNotificationPreferences.email.warmupCompletion,
};

// Mock notification history
export const mockNotificationHistory: NotificationHistory[] = [
  {
    id: "notif-hist-1",
    userId: "user-1",
    type: "newReplies",
    title: "New Reply Received",
    message: "You have a new reply from john.smith@example.com in campaign 'Q4 Outreach'",
    channel: "inApp",
    status: "read",
    sentAt: "2024-12-20T14:30:00Z",
    readAt: "2024-12-20T14:35:00Z",
    metadata: {
      campaignId: "campaign-123",
      contactEmail: "john.smith@example.com",
    },
  },
  {
    id: "notif-hist-2",
    userId: "user-1",
    type: "campaignCompletions",
    title: "Campaign Completed",
    message: "Your campaign 'Black Friday Sale' has finished sending to all 5,000 contacts",
    channel: "email",
    status: "delivered",
    sentAt: "2024-12-19T18:00:00Z",
    metadata: {
      campaignId: "campaign-456",
      totalContacts: 5000,
      successRate: 98.5,
    },
  },
  {
    id: "notif-hist-3",
    userId: "user-1",
    type: "domainAlerts",
    title: "Domain Configuration Issue",
    message: "SPF record validation failed for mail.acmecorp.com",
    channel: "push",
    status: "delivered",
    sentAt: "2024-12-18T10:15:00Z",
    metadata: {
      domainId: "domain-789",
      issueType: "SPF_VALIDATION_FAILED",
    },
  },
  {
    id: "notif-hist-4",
    userId: "user-1",
    type: "billingReminders",
    title: "Payment Due Soon",
    message: "Your subscription renewal payment of $55.00 is due in 3 days",
    channel: "email",
    status: "sent",
    sentAt: "2024-12-22T09:00:00Z",
    metadata: {
      amount: 55.00,
      dueDate: "2024-12-25",
    },
  },
  {
    id: "notif-hist-5",
    userId: "user-1",
    type: "weeklyReports",
    title: "Your Weekly Performance Report",
    message: "Your weekly report for Dec 11-17 is ready. Open rate: 24.5%, Reply rate: 3.2%",
    channel: "email",
    status: "read",
    sentAt: "2024-12-17T08:00:00Z",
    readAt: "2024-12-17T10:30:00Z",
    metadata: {
      reportPeriod: "2024-12-11 to 2024-12-17",
      // CLEANED UP: Removed stored rates - calculate using AnalyticsCalculator
    },
  },
];

// Mock notification templates
export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: "template-1",
    name: "New Reply Email",
    type: "newReplies",
    subject: "New reply from {{contactName}} in {{campaignName}}",
    body: "Hi {{userName}},\n\nYou have received a new reply from {{contactEmail}} in your campaign '{{campaignName}}'.\n\nMessage preview:\n{{messagePreview}}\n\nView full conversation: {{conversationLink}}\n\nBest regards,\nPenguinMails Team",
    variables: ["userName", "contactName", "contactEmail", "campaignName", "messagePreview", "conversationLink"],
    channels: ["email"],
    active: true,
  },
  {
    id: "template-2",
    name: "Campaign Completion",
    type: "campaignCompletions",
    subject: "Campaign '{{campaignName}}' completed successfully",
    body: "Your campaign has finished sending!\n\nCampaign: {{campaignName}}\nTotal contacts: {{totalContacts}}\nSuccessfully sent: {{successCount}}\nOpen rate: {{openRate}}%\nReply rate: {{replyRate}}%\n\nView detailed analytics: {{analyticsLink}}",
    // CLEANED UP: Variables still include rates for notification templates (calculated at send time)
    variables: ["campaignName", "totalContacts", "successCount", "openRate", "replyRate", "analyticsLink"],
    channels: ["email", "inApp"],
    active: true,
  },
  {
    id: "template-3",
    name: "Weekly Report",
    type: "weeklyReports",
    subject: "Your Weekly PenguinMails Report ({{reportPeriod}})",
    body: "Weekly Performance Summary\n\nPeriod: {{reportPeriod}}\n\nCampaigns sent: {{campaignsSent}}\nTotal emails: {{totalEmails}}\nAverage open rate: {{avgOpenRate}}%\nAverage reply rate: {{avgReplyRate}}%\nNew contacts: {{newContacts}}\n\nTop performing campaign: {{topCampaign}}\n\nView full report: {{reportLink}}",
    // CLEANED UP: Variables still include rates for notification templates (calculated at send time)
    variables: ["reportPeriod", "campaignsSent", "totalEmails", "avgOpenRate", "avgReplyRate", "newContacts", "topCampaign", "reportLink"],
    channels: ["email"],
    active: true,
  },
];

// Mock notification schedules
export const mockNotificationSchedules: NotificationSchedule[] = [
  {
    id: "schedule-1",
    userId: "user-1",
    type: "weeklyReports",
    schedule: {
      frequency: "weekly",
      dayOfWeek: 1, // Monday
      time: "09:00",
      timezone: "America/New_York",
    },
    enabled: true,
  },
  {
    id: "schedule-2",
    userId: "user-1",
    type: "monthlyReports",
    schedule: {
      frequency: "monthly",
      dayOfMonth: 1, // First day of month
      time: "10:00",
      timezone: "America/New_York",
    },
    enabled: false,
    },
  ];
  
  // Mock core Notification data for UI components
  export const mockNotifications: Notification[] = [
    {
      id: 1,
      type: NotificationTypeEnum.REPLY,
      title: "Sarah Johnson replied to your email",
      message: "Thanks for reaching out! I'd love to schedule a call...",
      time: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago as Date
      isRead: false,
    },
    {
      id: 2,
      type: NotificationTypeEnum.CAMPAIGN,
      title: "Your campaign 'SaaS Outreach' has completed",
      message: "847 emails sent with 34.2% open rate",
      time: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isRead: false,
    },
    {
      id: 3,
      type: NotificationTypeEnum.WARNING,
      title: "Email account john@example.com needs attention",
      message: "Warmup process paused due to deliverability issues",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
    },
    {
      id: 4,
      type: NotificationTypeEnum.SUCCESS,
      title: "Domain verification completed",
      message: "mycompany.com is now ready for sending",
      time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      isRead: true,
    },
    {
      id: 5,
      type: NotificationTypeEnum.INFO,
      title: "Weekly performance report is ready",
      message: "View your campaign analytics for this week",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
    },
    {
      id: 6,
      type: NotificationTypeEnum.CAMPAIGN_COMPLETED,
      title: "Campaign 'Black Friday Sale' finished",
      message: "Successfully sent to 5,000 contacts with 98.5% delivery",
      time: "2 hours ago",
      isRead: false,
    },
    {
      id: 7,
      type: NotificationTypeEnum.SECURITY_ALERT,
      title: "Security Alert: New login detected",
      message: "A new login to your account from Chrome on Linux",
      time: "3 hours ago",
      isRead: false,
    },
    {
      id: 8,
      type: NotificationTypeEnum.DOMAIN_ISSUE,
      title: "Domain configuration issue",
      message: "SPF validation failed for mail.example.com",
      time: "5 hours ago",
      isRead: true,
    },
    {
      id: 9,
      type: NotificationTypeEnum.LEAD_RESPONDED,
      title: "New prospect responded",
      message: "john.doe@company.com replied to your outreach",
      time: "6 hours ago",
      isRead: false,
    },
    {
      id: 10,
      type: NotificationTypeEnum.TASK_COMPLETED,
      title: "Task completed successfully",
      message: "Lead generation task for 'Tech Startups' completed",
      time: "8 hours ago",
      isRead: true,
    },
    {
      id: 11,
      type: NotificationTypeEnum.QUOTA_EXCEEDED,
      title: "Monthly email quota exceeded",
      message: "You have reached 85% of your monthly email limit",
      time: "1 day ago",
      isRead: true,
    },
    {
      id: 12,
      type: NotificationTypeEnum.SYSTEM_MAINTENANCE,
      title: "Scheduled maintenance completed",
      message: "Platform upgrade finished successfully",
      time: "2 days ago",
      isRead: true,
    },
  ];
  
  // Helper functions
export function getNotificationTypeById(id: string): NotificationType | undefined {
  return notificationTypes.find(type => type.id === id);
}

export function getNotificationsByCategory(category: NotificationType["category"]): NotificationType[] {
  return notificationTypes.filter(type => type.category === category);
}

export function getEnabledChannels(preferences: NotificationPreferences): NotificationChannel[] {
  const channels: NotificationChannel[] = [];
  if (Object.values(preferences.email).some(v => v)) channels.push("email");
  if (Object.values(preferences.inApp).some(v => v)) channels.push("inApp");
  if (preferences.push.enabled) channels.push("push");
  return channels;
}

export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Default notification preferences for new users
export const defaultNotificationPreferences: NotificationPreferences = {
  id: "",
  userId: "",
  email: {
    newReplies: true,
    campaignUpdates: true,
    campaignCompletions: true,
    weeklyReports: true,
    monthlyReports: false,
    domainAlerts: true,
    warmupCompletion: false,
    systemAnnouncements: true,
    securityAlerts: true,
    billingReminders: true,
    teamInvitations: true,
    exportComplete: true,
  },
  inApp: {
    realTimeCampaignAlerts: true,
    emailAccountAlerts: true,
    newMessageAlerts: true,
    taskReminders: true,
    systemUpdates: true,
    performanceAlerts: true,
    collaborationMentions: true,
  },
  push: {
    enabled: false,
    criticalAlertsOnly: false,
    desktopNotifications: false,
    mobileNotifications: false,
    sound: true,
    vibration: true,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Notification statistics
export const notificationStatistics = {
  totalSent: mockNotificationHistory.length,
  delivered: mockNotificationHistory.filter(n => n.status === "delivered").length,
  read: mockNotificationHistory.filter(n => n.status === "read").length,
  failed: mockNotificationHistory.filter(n => n.status === "failed").length,
  byChannel: {
    email: mockNotificationHistory.filter(n => n.channel === "email").length,
    inApp: mockNotificationHistory.filter(n => n.channel === "inApp").length,
    push: mockNotificationHistory.filter(n => n.channel === "push").length,
    sms: mockNotificationHistory.filter(n => n.channel === "sms").length,
  },
};
