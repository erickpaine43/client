import { z } from "zod";
import type { BaseEntity, BillingAddress, ActionResult } from "./base";

// ============================================================================
// TRACKING AND COMPLIANCE TYPES
// ============================================================================

// Tracking Settings
export interface TrackingSettings extends BaseEntity {
  userId: string;
  openTracking: boolean;
  clickTracking: boolean;
  customDomain?: string;
  unsubscribeLink: boolean;
  complianceFooter: string;
}

// Compliance Settings
export interface ComplianceSettings extends BaseEntity {
  userId: string;
  gdprCompliant: boolean;
  canSpamCompliant: boolean;
  unsubscribeRequired: boolean;
  companyAddress: BillingAddress;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export interface ComplianceData {
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
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Tracking Preference Types
export const trackingSchema = z.object({
  openTracking: z.boolean(),
  clickTracking: z.boolean(),
  customDomain: z.string().optional(),
});

export type TrackingFormValues = z.infer<typeof trackingSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type TrackingSettingsResponse = ActionResult<TrackingSettings>;
export type ComplianceSettingsResponse = ActionResult<ComplianceSettings>;
