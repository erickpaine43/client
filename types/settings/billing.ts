import { z } from "zod";
import type { BaseEntity, BillingAddress, ActionResult } from "./base";

// ============================================================================
// BILLING AND SUBSCRIPTION TYPES
// ============================================================================

// Re-export BillingAddress from base for convenience
export type { BillingAddress } from "./base";

// Subscription Plan (Flexible for compatibility)
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  contacts?: number;
  storage?: number;
  features?: string[];
  isMonthly?: boolean;
  // Legacy fields for backward compatibility
  description?: string;
  maxEmailAccounts?: number;
  maxCampaigns?: number;
  maxEmailsPerMonth?: number;
}

// Payment Method (Flexible for compatibility)
export interface PaymentMethod {
  type?: "visa" | "mastercard" | "amex" | "discover";
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  // Legacy fields for backward compatibility
  lastFour?: string;
  expiry?: string;
}

// Usage Metrics
export interface UsageMetrics {
  emailsSent: number;
  contactsReached: number;
  storageUsed: number;
  resetDate: string;
  emailAccountsUsed?: number;
  campaignsUsed?: number;
  emailsPerMonthUsed?: number;
}

// Billing History Item (Flexible for compatibility)
export interface BillingHistoryItem {
  id?: string;
  date: string;
  description: string;
  amount: string;
  method: string;
  status?: "paid" | "pending" | "failed";
}

// Billing Information
export interface BillingInfo extends BaseEntity {
  userId: string;
  currentPlan: SubscriptionPlan;
  paymentMethod: PaymentMethod;
  billingAddress: BillingAddress;
  usage: UsageMetrics;
  renewalDate: string;
  billingHistory: BillingHistoryItem[];
}

// Legacy BillingData type (for backward compatibility)
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
}

// Billing and Plan Settings
export interface BillingAndPlanSettings {
  currentPlan: SubscriptionPlan;
  usage: {
    emailAccounts: number;
    campaigns: number;
    emailsPerMonth: number;
  };
  billingInfo: {
    paymentMethod: PaymentMethod;
    billingHistory: BillingHistoryItem[];
    renewalDate: string;
    billingAddress?: BillingAddress;
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Billing Schema
export const billingAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

export const paymentMethodSchema = z.object({
  type: z.enum(["visa", "mastercard", "amex", "discover"]),
  last4: z.string().length(4, "Last 4 digits required"),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
});

export const billingInfoSchema = z.object({
  billingAddress: billingAddressSchema,
  paymentMethod: paymentMethodSchema,
});

export type BillingInfoFormValues = z.infer<typeof billingInfoSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type BillingInfoResponse = ActionResult<BillingInfo>;

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface BillingSettingsProps {
  billing: BillingInfo;
  onUpdate: (billing: Partial<BillingInfo>) => Promise<void>;
  loading?: boolean;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Partial update types for server actions
export type BillingInfoUpdate = Partial<Omit<BillingInfo, "id" | "userId" | "createdAt" | "updatedAt">>;

// Create types for new entities
export type CreateBillingInfo = Omit<BillingInfo, "id" | "createdAt" | "updatedAt">;
