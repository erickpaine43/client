/**
 * Tenant Settings TypeScript Interface
 * Defines the structure for tenant-level settings and defaults
 */

export interface TenantSettings {
  id?: string;
  tenantId: string;
  defaultTheme: 'light' | 'dark' | 'auto';
  defaultLanguage: string;
  defaultTimezone: string;
  allowCustomBranding: boolean;
  maxCompaniesPerTenant: number;
  globalEmailLimits: number;
  auditLoggingEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tenant Settings creation/update payload
 */
export interface TenantSettingsInput {
  defaultTheme?: 'light' | 'dark' | 'auto';
  defaultLanguage?: string;
  defaultTimezone?: string;
  allowCustomBranding?: boolean;
  maxCompaniesPerTenant?: number;
  globalEmailLimits?: number;
  auditLoggingEnabled?: boolean;
}

/**
 * Tenant Settings response (without internal fields)
 */
export interface TenantSettingsResponse {
  id: string;
  defaultTheme: 'light' | 'dark' | 'auto';
  defaultLanguage: string;
  defaultTimezone: string;
  allowCustomBranding: boolean;
  maxCompaniesPerTenant: number;
  globalEmailLimits: number;
  auditLoggingEnabled: boolean;
  updatedAt: string;
}
