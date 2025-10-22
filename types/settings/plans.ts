/**
 * Plans TypeScript Interface
 * Defines the structure for subscription plan definitions
 */

export interface Plan {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  maxUsers: number;
  maxDomains: number;
  maxCampaignsPerMonth: number;
  apiRateLimit: number;
  priceMonthly: number; // in cents
  priceYearly: number; // in cents
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Plan creation/update payload
 */
export interface PlanInput {
  name?: string;
  slug?: string;
  description?: string;
  maxUsers?: number;
  maxDomains?: number;
  maxCampaignsPerMonth?: number;
  apiRateLimit?: number;
  priceMonthly?: number;
  priceYearly?: number;
  features?: string[];
  isActive?: boolean;
}

/**
 * Plan response (without internal fields)
 */
export interface PlanResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  maxUsers: number;
  maxDomains: number;
  maxCampaignsPerMonth: number;
  apiRateLimit: number;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isActive: boolean;
  updatedAt: string;
}

/**
 * Plan features enum for type safety
 */
export enum PlanFeature {
  BASIC_CAMPAIGNS = 'basic-campaigns',
  ADVANCED_CAMPAIGNS = 'advanced-campaigns',
  DETAILED_ANALYTICS = 'detailed-analytics',
  EMAIL_SUPPORT = 'email-support',
  PRIORITY_SUPPORT = 'priority-support',
  BASIC_TEMPLATES = 'basic-templates',
  CUSTOM_TEMPLATES = 'custom-templates',
  API_ACCESS = 'api-access',
  ADVANCED_SEGMENTATION = 'advanced-segmentation',
  CUSTOM_DOMAIN = 'custom-domain',
  SSO_INTEGRATION = 'sso-integration',
  WHITE_LABEL = 'white-label',
  DEDICATED_SUPPORT = 'dedicated-support'
}
