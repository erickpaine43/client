import { z } from "zod";

// Notification Settings Types
export interface NotificationSettingsProps {
  email: {
    campaignCompletions: boolean;
    newReplies: boolean;
    weeklyReports: boolean;
    systemAnnouncements: boolean;
  };
  inApp: {
    realTimeCampaignAlerts: boolean;
    emailAccountAlerts: boolean;
  };
}

export const notificationSchema = z.object({
  newReplies: z.boolean(),
  campaignUpdates: z.boolean(),
  weeklyReports: z.boolean(),
  domainAlerts: z.boolean(),
  warmupCompletion: z.boolean(),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;

// Billing Configuration Types
export interface BillingData {
  renewalDate: string;
  emailAccountsUsed: number;
  campaignsUsed: number;
  emailsPerMonthUsed: number;
  planDetails: {
    id: string;
    name: string;
    isMonthly: boolean;
    price: number;
    description: string;
    maxEmailAccounts: number; // 0 for "Unlimited" or a number
    maxCampaigns: number;
    maxEmailsPerMonth: number;
  };
  paymentMethod: {
    lastFour: string;
    expiry: string;
    brand: string; // e.g., "Visa"
  };
  billingHistory: Array<{
    date: string;
    description: string;
    amount: string;
    method: string; // e.g., "Visa •••• 4242"
  }>;
}

export interface BillingSettingsProps {
  billing: BillingData;
}

// Security Configuration Types
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

export interface PasswordStrength {
  level: "weak" | "medium" | "strong" | "very-strong";
  text: string;
  color: string;
  percentage: number;
}

// Two-Factor Authentication Types
export const twoFactorSchema = z.object({
  enabled: z.boolean(),
  method: z.enum(["sms", "app"]).optional(),
  secret: z.string().optional(),
  backupCodes: z.array(z.string()).optional(),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

// Tracking Preference Types
export const trackingSchema = z.object({
  openTracking: z.boolean(),
  clickTracking: z.boolean(),
  customDomain: z.string().optional(),
});

export type TrackingFormValues = z.infer<typeof trackingSchema>;

// User Preference Types
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  emailFrequency: "immediate" | "daily" | "weekly" | "never";
  dashboardLayout: "compact" | "comfortable";
  chartColors: "default" | "accessibility" | "custom";
}

// Security Recommendation Types
export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  actionUrl?: string;
}

// Team Management Types
export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Outreach Manager" | "Analyst" | "Member";
  status: "active" | "inactive" | "invited";
  lastActive: string;
  avatar?: string;
}

// Appearance/Settings Types
export interface AppearanceSettings {
  theme: UserPreferences["theme"];
  primaryColor?: string;
  sidebarCollapsed: boolean;
  itemsPerPage: number;
}

// Consolidated Settings Types
export interface GeneralSettings {
  profile: {
    name: string;
    email: string;
    company?: string;
  };
  preferences: UserPreferences;
  appearance: AppearanceSettings;
}

export interface SecuritySettings {
  passwordStrengthIndicator?: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  twoFactor: TwoFactorFormValues;
  accountBackupCodes: string[];
}

export interface BillingAndPlanSettings {
  currentPlan: BillingData["planDetails"];
  usage: {
    emailAccounts: number;
    campaigns: number;
    emailsPerMonth: number;
  };
  billingInfo: Pick<
    BillingData,
    "paymentMethod" | "billingHistory" | "renewalDate"
  >;
}

// Form Props Types
export interface NotificationToggleProps {
  show: boolean;
  onToggle: () => void;
}

export interface PasswordToggleProps {
  show: boolean;
  onToggle: () => void;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
}

// Security Events Types
export interface SecurityEvent {
  id: string;
  type: "login" | "password_change" | "two_factor_disabled" | "account_locked";
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

// Settings Page Types
export type SettingsTab =
  | "profile"
  | "security"
  | "billing"
  | "notifications"
  | "team"
  | "appearance"
  | "tracking";

// Settings Validation Types
export interface SettingsValidationError {
  field: string;
  message: string;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: SettingsValidationError[];
}
