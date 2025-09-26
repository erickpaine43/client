import { z } from "zod";
import type { BaseEntity, ActionResult } from "./base";

// ============================================================================
// APPEARANCE AND CLIENT TYPES
// ============================================================================

// Client Preferences
export interface ClientPreferences {
  theme: "light" | "dark" | "system";
  sidebarView: "expanded" | "collapsed";
  language: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
}

// Client Storage Keys
export const CLIENT_STORAGE_KEYS = {
  THEME: "penguinmails_theme",
  SIDEBAR_VIEW: "penguinmails_sidebar_view",
  LANGUAGE: "penguinmails_language",
  DATE_FORMAT: "penguinmails_date_format",
} as const;

// Stored Client Preferences (partial for localStorage)
export interface StoredClientPreferences {
  theme?: ClientPreferences["theme"];
  sidebarView?: ClientPreferences["sidebarView"];
  language?: string;
  dateFormat?: ClientPreferences["dateFormat"];
}

// Appearance Settings (Full entity)
export interface AppearanceSettingsEntity extends BaseEntity {
  userId: string;
  theme: ClientPreferences["theme"];
  primaryColor?: string;
  sidebarCollapsed: boolean;
  itemsPerPage: number;
  compactMode: boolean;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Client Preferences Schema
export const clientPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  sidebarView: z.enum(["expanded", "collapsed"]),
  language: z.string().min(1, "Language is required"),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
});

export type ClientPreferencesFormValues = z.infer<typeof clientPreferencesSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type AppearanceSettingsResponse = ActionResult<AppearanceSettingsEntity>;
