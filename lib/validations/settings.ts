import { z } from 'zod';

// User Preferences Validation Schema
export const userPreferencesSchema = z.object({
  id: z.string(),
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language format'),
  timezone: z.string().regex(/^[A-Za-z/_+-]+$/, 'Invalid timezone format'),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weeklyReports: z.boolean(),
  marketingEmails: z.boolean(),
  sidebarCollapsed: z.boolean().optional(),
  tableDensity: z.string().optional(),
  sidebarView: z.string().optional(),
  updatedAt: z.string(),
});

// Company Settings Validation Schema
export const companySettingsSchema = z.object({
  customBranding: z.boolean(),
  advancedAnalytics: z.boolean(),
  prioritySupport: z.boolean(),
  settings: z.record(z.string(), z.any()).optional().default({}),
});

// Tenant Settings Validation Schema
export const tenantSettingsSchema = z.object({
  defaultTheme: z.enum(['light', 'dark', 'auto']),
  defaultLanguage: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language format'),
  defaultTimezone: z.string().regex(/^[A-Za-z/_+-]+$/, 'Invalid timezone format'),
  allowCustomBranding: z.boolean(),
  maxCompaniesPerTenant: z.number().int().positive(),
  globalEmailLimits: z.number().int().min(0),
  auditLoggingEnabled: z.boolean(),
});

// Plans Validation Schema
export const planSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  maxUsers: z.number().int().positive(),
  maxDomains: z.number().int().min(0),
  maxCampaignsPerMonth: z.number().int().min(0),
  apiRateLimit: z.number().int().positive(),
  priceMonthly: z.number().int().min(0), // in cents
  priceYearly: z.number().int().min(0), // in cents
  features: z.array(z.string()),
  isActive: z.boolean(),
}).refine((data) => data.priceYearly <= data.priceMonthly * 12, {
  message: 'Yearly price should not exceed monthly price * 12 (annual discount allowed)',
  path: ['priceYearly'],
});

// Domains Validation Schema
export const domainSchema = z.object({
  domain: z.string()
    .min(4)
    .max(253)
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, 'Invalid domain format'),
  verificationStatus: z.enum(['pending', 'verified', 'failed']),
  dnsRecords: z.array(z.object({
    type: z.enum(['TXT', 'MX', 'CNAME', 'A', 'AAAA']),
    name: z.string(),
    value: z.string(),
    ttl: z.number().int().positive().optional(),
  })),
  isPrimary: z.boolean(),
});

// Campaigns Validation Schema
export const campaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'running', 'completed', 'failed', 'cancelled']),
  scheduledAt: z.string().datetime().optional(),

  // Campaign settings - flexible configuration
  settings: z.record(z.string(), z.any()).optional().default({}),
});

// Type exports for use in API endpoints
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type DomainInput = z.infer<typeof domainSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
