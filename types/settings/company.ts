/**
 * Company Settings TypeScript Interface
 * Defines the structure for company-level settings and limits
 */

export interface CompanySettings {
  id?: string;
  companyId: string;

  // Feature flags and entitlements
  customBranding: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;

  // Flexible settings for future extensions
  settings?: Record<string, unknown>;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Company Settings creation/update payload
 */
export interface CompanySettingsInput {
  customBranding?: boolean;
  advancedAnalytics?: boolean;
  prioritySupport?: boolean;
  settings?: Record<string, unknown>;
}

/**
 * Company Settings response (without internal fields)
 */
export interface CompanySettingsResponse {
  id: string;
  customBranding: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  settings?: Record<string, unknown>;
  updatedAt: string;
}
