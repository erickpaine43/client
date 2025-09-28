import type { UserSettings, UserPreferences, GeneralSettings, AppearanceSettings } from "./user";
import type { NotificationPreferences } from "./notifications";
import type { BillingInfo, BillingData, BillingAndPlanSettings } from "./billing";
import type { SecuritySettingsEntity, SecuritySettings } from "./security";
import type { TrackingSettings } from "./tracking";
import type { ComplianceSettings } from "./tracking";
import type { AppearanceSettingsEntity } from "./appearance";
import type { ClientPreferences } from "./appearance";

// Re-export types for backward compatibility
export type { UserPreferences, GeneralSettings, AppearanceSettings };
export type { BillingData, BillingAndPlanSettings };
export type { SecuritySettings };

// ============================================================================
// CONSOLIDATED SETTINGS TYPES
// ============================================================================

// Legacy Settings Data (for backward compatibility)
export interface SettingsData {
  userProfile: {
    name: string;
    email: string;
    username: string;
    role: string;
    avatarUrl?: string;
  };
  notifications: {
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
  };
  compliance: {
    autoAddUnsubscribeLink: boolean;
    unsubscribeText: string;
    unsubscribeLandingPage: string;
    companyName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billing: {
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
      maxEmailAccounts: number;
      maxCampaigns: number;
      maxEmailsPerMonth: number;
    };
    paymentMethod: {
      lastFour: string;
      expiry: string;
      brand: string;
    };
    billingHistory: Array<{
      date: string;
      description: string;
      amount: string;
      method: string;
    }>;
  };
}

// All Settings Combined
export interface AllSettings {
  user: UserSettings;
  notifications: NotificationPreferences;
  billing: BillingInfo;
  security: SecuritySettingsEntity;
  tracking: TrackingSettings;
  compliance: ComplianceSettings;
  appearance: AppearanceSettingsEntity;
  client: ClientPreferences;
}
