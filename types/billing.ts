import { z } from "zod";
import { BaseEntity, ActionResult } from "./common";

// ============================================================================
// BILLING ENTITY TYPES - OLTP LAYER (NileDB)
// ============================================================================

// Payment Method Types
export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  BANK_ACCOUNT = "bank_account",
  PAYPAL = "paypal",
}

export enum PaymentProvider {
  STRIPE = "stripe",
  PAYPAL = "paypal",
  BANK = "bank",
}

export enum CardBrand {
  VISA = "visa",
  MASTERCARD = "mastercard",
  AMERICAN_EXPRESS = "amex",
  DISCOVER = "discover",
  DINERS_CLUB = "diners",
  JCB = "jcb",
  UNIONPAY = "unionpay",
  UNKNOWN = "unknown",
}

// Subscription Status Types
export enum SubscriptionStatus {
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  TRIALING = "trialing",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  UNPAID = "unpaid",
}

// Billing Cycle Types
export enum BillingCycle {
  MONTHLY = "monthly",
  YEARLY = "yearly",
  QUARTERLY = "quarterly",
}

// Invoice Status Types
export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
  VOID = "void",
  REFUNDED = "refunded",
}

// Usage Types for Line Items
export enum UsageType {
  EMAILS = "emails",
  DOMAINS = "domains",
  MAILBOXES = "mailboxes",
  STORAGE = "storage",
  USERS = "users",
}

// ============================================================================
// CORE BILLING ENTITIES (OLTP - NileDB)
// ============================================================================

// Company Billing Information
export interface CompanyBilling extends BaseEntity {
  companyId: number; // Tenant isolation - references company in NileDB
  
  // Payment Information (SENSITIVE - stays in OLTP)
  paymentMethodId: string | null; // Reference to active payment method
  billingEmail: string; // Billing contact email
  billingAddress: BillingAddress;
  
  // Subscription Details (SENSITIVE - stays in OLTP)
  subscriptionId: string | null; // External subscription reference (Stripe, etc.)
  planId: string; // Reference to subscription plan
  billingCycle: BillingCycle;
  subscriptionStatus: SubscriptionStatus;
  
  // Financial Data (SENSITIVE - stays in OLTP)
  nextBillingDate: Date | null;
  lastPaymentDate: Date | null;
  lastPaymentAmount: number | null;
  currency: string; // ISO currency code (USD, EUR, etc.)
  
  // Metadata
  createdById: string; // User who created the billing account
}

// Billing Address (embedded in CompanyBilling)
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string; // ISO country code
}

// Payment Method Entity
export interface PaymentMethod extends BaseEntity {
  companyId: number; // Tenant isolation
  
  // Payment Details (HIGHLY SENSITIVE - encrypted/tokenized in OLTP)
  type: PaymentMethodType;
  provider: PaymentProvider;
  providerPaymentMethodId: string; // External payment method ID (Stripe, etc.)
  
  // Card Information (ENCRYPTED/TOKENIZED - only safe data stored)
  lastFourDigits: string; // Only last 4 digits for display
  expiryMonth: number | null;
  expiryYear: number | null;
  cardBrand: CardBrand | null;
  
  // Bank Account Information (for ACH payments)
  bankName: string | null;
  accountType: string | null; // checking, savings
  
  // Status and Metadata
  isDefault: boolean;
  isActive: boolean;
  createdById: string; // User who added the payment method
}

// Invoice Entity
export interface Invoice extends BaseEntity {
  companyId: number; // Tenant isolation
  
  // Invoice Details (SENSITIVE - stays in OLTP)
  invoiceNumber: string; // Unique invoice identifier
  amount: number; // Total amount in cents
  currency: string;
  status: InvoiceStatus;
  
  // Billing Period
  periodStart: Date;
  periodEnd: Date;
  
  // Payment Tracking (SENSITIVE)
  paymentMethodId: string | null;
  paidAt: Date | null;
  paidAmount: number | null; // Amount actually paid (for partial payments)
  
  // Line Items (SENSITIVE - detailed usage information)
  lineItems: InvoiceLineItem[];
  
  // Metadata
  dueDate: Date;
  notes: string | null;
  createdById: string;
}

// Invoice Line Item (embedded in Invoice)
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number; // Price per unit in cents
  totalPrice: number; // Total for this line item in cents
  usageType: UsageType;
  periodStart: Date;
  periodEnd: Date;
}

// Subscription Plan Entity
export interface SubscriptionPlan extends BaseEntity {
  name: string; // Plan display name
  description: string | null;
  
  // Plan Limits (OPERATIONAL - stays in OLTP)
  emailsLimit: number; // -1 for unlimited
  domainsLimit: number; // -1 for unlimited
  mailboxesLimit: number; // -1 for unlimited
  storageLimit: number; // Storage limit in GB, -1 for unlimited
  usersLimit: number; // Team members limit, -1 for unlimited
  
  // Pricing (SENSITIVE - stays in OLTP)
  monthlyPrice: number; // Price in cents
  yearlyPrice: number; // Price in cents
  quarterlyPrice: number | null; // Price in cents
  currency: string;
  
  // Plan Features
  features: string[]; // Array of feature identifiers
  isActive: boolean; // Whether plan is available for new subscriptions
  isPublic: boolean; // Whether plan is publicly available
  
  // Metadata
  sortOrder: number; // For display ordering
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Billing Address Schema
export const BillingAddressSchema = z.object({
  street: z.string().min(1, "Street address is required").max(255),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  zipCode: z.string().min(1, "ZIP code is required").max(20),
  country: z.string().length(2, "Country must be a 2-letter ISO code"),
});

// Company Billing Schema
export const CompanyBillingSchema = z.object({
  companyId: z.number().positive(),
  paymentMethodId: z.string().nullable(),
  billingEmail: z.string().email("Invalid billing email"),
  billingAddress: BillingAddressSchema,
  subscriptionId: z.string().nullable(),
  planId: z.string().min(1, "Plan ID is required"),
  billingCycle: z.nativeEnum(BillingCycle),
  subscriptionStatus: z.nativeEnum(SubscriptionStatus),
  nextBillingDate: z.date().nullable(),
  lastPaymentDate: z.date().nullable(),
  lastPaymentAmount: z.number().nullable(),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code"),
  createdById: z.string().min(1, "Created by ID is required"),
});

// Payment Method Schema
export const PaymentMethodSchema = z.object({
  companyId: z.number().positive(),
  type: z.nativeEnum(PaymentMethodType),
  provider: z.nativeEnum(PaymentProvider),
  providerPaymentMethodId: z.string().min(1, "Provider payment method ID is required"),
  lastFourDigits: z.string().length(4, "Last four digits must be exactly 4 characters"),
  expiryMonth: z.number().min(1).max(12).nullable(),
  expiryYear: z.number().min(new Date().getFullYear()).nullable(),
  cardBrand: z.nativeEnum(CardBrand).nullable(),
  bankName: z.string().nullable(),
  accountType: z.string().nullable(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  createdById: z.string().min(1, "Created by ID is required"),
});

// Invoice Line Item Schema
export const InvoiceLineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(255),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  usageType: z.nativeEnum(UsageType),
  periodStart: z.date(),
  periodEnd: z.date(),
});

// Invoice Schema
export const InvoiceSchema = z.object({
  companyId: z.number().positive(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.number().nonnegative(),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code"),
  status: z.nativeEnum(InvoiceStatus),
  periodStart: z.date(),
  periodEnd: z.date(),
  paymentMethodId: z.string().nullable(),
  paidAt: z.date().nullable(),
  paidAmount: z.number().nullable(),
  lineItems: z.array(InvoiceLineItemSchema),
  dueDate: z.date(),
  notes: z.string().nullable(),
  createdById: z.string().min(1, "Created by ID is required"),
});

// Subscription Plan Schema
export const SubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100),
  description: z.string().nullable(),
  emailsLimit: z.number().int(),
  domainsLimit: z.number().int(),
  mailboxesLimit: z.number().int(),
  storageLimit: z.number().int(),
  usersLimit: z.number().int(),
  monthlyPrice: z.number().nonnegative(),
  yearlyPrice: z.number().nonnegative(),
  quarterlyPrice: z.number().nonnegative().nullable(),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code"),
  features: z.array(z.string()),
  isActive: z.boolean(),
  isPublic: z.boolean(),
  sortOrder: z.number().int(),
});

// ============================================================================
// FORM TYPES AND VALIDATION
// ============================================================================

// Company Billing Form
export const CompanyBillingFormSchema = z.object({
  billingEmail: z.string().email("Invalid email address"),
  billingAddress: BillingAddressSchema,
  planId: z.string().min(1, "Please select a plan"),
  billingCycle: z.nativeEnum(BillingCycle),
});

export type CompanyBillingFormData = z.infer<typeof CompanyBillingFormSchema>;

// Payment Method Form
export const PaymentMethodFormSchema = z.object({
  type: z.nativeEnum(PaymentMethodType),
  // Card fields
  cardNumber: z.string().optional(),
  expiryMonth: z.number().min(1).max(12).optional(),
  expiryYear: z.number().min(new Date().getFullYear()).optional(),
  cvv: z.string().optional(),
  // Bank account fields
  routingNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  accountType: z.string().optional(),
  // Common fields
  isDefault: z.boolean().default(false),
});

export type PaymentMethodFormData = z.infer<typeof PaymentMethodFormSchema>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export type CompanyBillingResponse = ActionResult<CompanyBilling>;
export type PaymentMethodResponse = ActionResult<PaymentMethod>;
export type InvoiceResponse = ActionResult<Invoice>;
export type SubscriptionPlanResponse = ActionResult<SubscriptionPlan>;

export type CompanyBillingListResponse = ActionResult<CompanyBilling[]>;
export type PaymentMethodListResponse = ActionResult<PaymentMethod[]>;
export type InvoiceListResponse = ActionResult<Invoice[]>;
export type SubscriptionPlanListResponse = ActionResult<SubscriptionPlan[]>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Plan Comparison Data
export interface PlanComparison {
  planId: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    emails: number;
    domains: number;
    mailboxes: number;
    storage: number;
    users: number;
  };
  isRecommended?: boolean;
}

// Usage Summary (for billing calculations)
export interface UsageSummary {
  companyId: number;
  periodStart: Date;
  periodEnd: Date;
  emailsSent: number;
  domainsUsed: number;
  mailboxesUsed: number;
  storageUsed: number; // in GB
  usersCount: number;
}

// Billing Summary (for dashboard display)
export interface BillingSummary {
  companyBilling: CompanyBilling;
  currentPlan: SubscriptionPlan;
  nextInvoice: Invoice | null;
  paymentMethods: PaymentMethod[];
  recentInvoices: Invoice[];
  usageSummary: UsageSummary;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Note: Types are already exported above with their definitions
