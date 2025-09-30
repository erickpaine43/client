import { z } from "zod";
import type { BaseEntity, CompanyInfo, ActionResult } from "./base";

// ============================================================================
// USER PROFILE AND SETTINGS TYPES
// ============================================================================

export interface UserProfileData {
  name: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
  isPenguinMailsStaff?: boolean;
}

// User Settings (Server-side persistent data)
export interface UserSettings extends BaseEntity {
  userId: string;
  timezone: string;
  companyInfo: CompanyInfo;
}

// User Preference Types (Extended)
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  emailFrequency: "immediate" | "daily" | "weekly" | "never";
  dashboardLayout: "compact" | "comfortable";
  chartColors: "default" | "accessibility" | "custom";
}

// Appearance Settings (Legacy - for mock compatibility)
export interface AppearanceSettings {
  theme: UserPreferences["theme"];
  primaryColor?: string;
  sidebarCollapsed: boolean;
  itemsPerPage: number;
  compactMode?: boolean;
}

// General Settings (Profile + Preferences)
export interface GeneralSettings {
  profile: {
    name: string;
    email: string;
    company?: string;
  };
  preferences: UserPreferences;
  appearance: AppearanceSettings;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// User Settings Schema
export const userSettingsSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  companyInfo: z.object({
    name: z.string().min(1, "Company name is required"),
    industry: z.string().min(1, "Industry is required"),
    size: z.string().min(1, "Company size is required"),
    address: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipCode: z.string().min(1, "ZIP code is required"),
      country: z.string().min(1, "Country is required"),
    }),
    vatId: z.string().optional(),
  }),
});

export type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type UserSettingsResponse = ActionResult<UserSettings>;

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface UserSettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<UserSettings>) => Promise<void>;
  loading?: boolean;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Partial update types for server actions
export type UserSettingsUpdate = Partial<Omit<UserSettings, "id" | "userId" | "createdAt" | "updatedAt">>;

// Create types for new entities
export type CreateUserSettings = Omit<UserSettings, "id" | "createdAt" | "updatedAt">;
