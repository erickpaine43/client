// Core Notification Types
export type Notification = {
  // Id can be either string or number for backward compatibility
  id: string | number;
  type: NotificationType;
  title: string;
  message: string;
  // Time can be either Date or string for backward compatibility
  time: Date | string;
  isRead: boolean;

  // New optional fields for enhanced functionality
  variant?: NotificationVariant;
  description?: string;
  dismissed?: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, unknown>;
  userId?: string;
  createdAt?: Date;
  expiresAt?: Date;
};

export enum NotificationType {
  // Core business notifications
  REPLY = "reply",
  CAMPAIGN = "campaign",
  WARNING = "warning",
  SUCCESS = "success",
  INFO = "info",

  // Alert types
  EMAIL_BOUNCE = "email_bounce",
  DOMAIN_ISSUE = "domain_issue",
  SECURITY_ALERT = "security_alert",
  SYSTEM_MAINTENANCE = "system_maintenance",

  // Campaign related
  CAMPAIGN_STARTED = "campaign_started",
  CAMPAIGN_COMPLETED = "campaign_completed",
  CAMPAIGN_FAILED = "campaign_failed",

  // User interaction
  LEAD_RESPONDED = "lead_responded",
  TASK_COMPLETED = "task_completed",
  QUOTA_EXCEEDED = "quota_exceeded",
}

export enum NotificationVariant {
  DEFAULT = "default",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  INFO = "info",
}

// Alert Notification Types
export interface AlertNotification extends Omit<Notification, "id"> {
  id: string | number;
  alertType: AlertType;
  severity: AlertSeverity;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export enum AlertType {
  SECURITY = "security",
  PERFORMANCE = "performance",
  SYSTEM = "system",
  BUSINESS = "business",
  MAINTENANCE = "maintenance",
}

export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Toast Notification Types
export interface ToastNotification extends Omit<Notification, "id"> {
  id: string | number;
  toastType: ToastType;
  duration: number; // in milliseconds
  position: ToastPosition;
  autoHide: boolean;
}

export enum ToastType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
  LOADING = "loading",
}

export enum ToastPosition {
  TOP_LEFT = "top-left",
  TOP_RIGHT = "top-right",
  TOP_CENTER = "top-center",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
  BOTTOM_CENTER = "bottom-center",
}

// Notification Actions
export interface NotificationAction {
  label: string;
  action: string;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
}

// Notification Settings Types
export interface NotificationSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  frequency: NotificationFrequency;
  quietHours: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
  preferences: NotificationPreferences;
}

export interface NotificationChannel {
  type: "email" | "in_app" | "push" | "sms";
  enabled: boolean;
  recipient?: string;
}

export enum NotificationFrequency {
  IMMEDIATE = "immediate",
  DAILY = "daily",
  WEEKLY = "weekly",
  NEVER = "never",
}

export interface NotificationPreferences {
  excludeTypes: NotificationType[];
  excludeSources: string[]; // e.g., specific campaign IDs
  showDescription: boolean;
  showActions: boolean;
  maxRetentionDays: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  groupSimilar: boolean;
}

// Notification States and Status
export type NotificationStatus = "unread" | "read" | "dismissed" | "archived";

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  lastReadAt?: Date;
}

// Notification Context Types
export interface NotificationContext {
  userId: string;
  filters: {
    type?: NotificationType;
    variant?: NotificationVariant;
    status?: NotificationStatus;
    dateRange?: {
      start: Date;
      end: Date;
    };
    source?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  sorting: {
    field: "createdAt" | "type" | "variant" | "isRead";
    direction: "asc" | "desc";
  };
}

// In-App Notification Queue
export interface NotificationQueue {
  pending: Notification[];
  active: Notification | null;
  maxQueueSize: number;
}

// Notification Template Types
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  variant: NotificationVariant;
  titleTemplate: string;
  messageTemplate: string;
  descriptionTemplate?: string;
  defaultActions?: NotificationAction[];
  category: NotificationCategory;
}

export enum NotificationCategory {
  SYSTEM = "system",
  CAMPAIGN = "campaign",
  CONVERSATION = "conversation",
  ANALYTICS = "analytics",
  ACCOUNT = "account",
  SECURITY = "security",
}

// Legacy compatibility types (for migration)
export interface LegacyNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

// Utility Types
export type NotificationFilter = Partial<NotificationContext["filters"]>;
export type NotificationSort = NotificationContext["sorting"];
export type AlertNotificationWithSeverity = AlertNotification & {
  severity: AlertSeverity;
};
export type ToastNotificationWithPosition = ToastNotification & {
  position: ToastPosition;
};
