// ============================================================================
// NAVIGATION AND UI TYPES
// ============================================================================

// Settings Page Types
export type SettingsTab =
  | "profile"
  | "security"
  | "billing"
  | "notifications"
  | "team"
  | "appearance"
  | "tracking"
  | "compliance";

// Settings Navigation
export interface SettingsNavItem {
  id: SettingsTab;
  label: string;
  icon?: string;
  href: string;
  description?: string;
}

// ============================================================================
// VALIDATION AND ERROR TYPES
// ============================================================================

// Legacy Settings Validation Types (for backward compatibility)
export interface SettingsValidationError {
  field: string;
  message: string;
  code?: string;
}

// API Error Types
export interface SettingsApiError {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, unknown>;
}
