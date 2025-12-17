import type { BillingData, BillingAndPlanSettings } from "../../types/settings";
import type { BillingAddress } from "./settings.mock";

// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  features: {
    emailAccounts: number; // 0 for unlimited
    campaigns: number; // 0 for unlimited
    emailsPerMonth: number; // 0 for unlimited
    contacts: number; // 0 for unlimited
    storage: number; // in GB
    teamMembers: number; // 0 for unlimited
    customDomains: number; // 0 for unlimited
    apiAccess: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    whiteLabel: boolean;
  };
  popular?: boolean;
  description: string;
}

// Payment Method Types
export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "discover" | "paypal" | "bank";
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  brand?: string;
}

// Usage Metrics Types
export interface UsageMetrics {
  emailsSent: number;
  emailsLimit: number;
  contactsReached: number;
  contactsLimit: number;
  campaignsActive: number;
  campaignsLimit: number;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
  emailAccountsActive: number;
  emailAccountsLimit: number;
  resetDate: string;
  periodStart: string;
  periodEnd: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "draft";
  description: string;
  items: InvoiceItem[];
  downloadUrl?: string;
  paymentMethod: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Billing Info Types
export interface BillingInfo {
  id: string;
  userId: string;
  currentPlan: SubscriptionPlan;
  paymentMethod: PaymentMethod;
  billingAddress: BillingAddress;
  usage: UsageMetrics;
  nextBillingDate: string;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
  taxRate?: number;
  currency: string;
}

// Subscription Plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan-starter",
    name: "Starter",
    price: 0,
    billingCycle: "monthly",
    features: {
      emailAccounts: 1,
      campaigns: 3,
      emailsPerMonth: 1000,
      contacts: 500,
      storage: 1,
      teamMembers: 1,
      customDomains: 0,
      apiAccess: false,
      prioritySupport: false,
      advancedAnalytics: false,
      whiteLabel: false,
    },
    description: "Perfect for individuals getting started with email outreach",
  },
  {
    id: "plan-growth",
    name: "Growth",
    price: 55,
    billingCycle: "monthly",
    features: {
      emailAccounts: 5,
      campaigns: 20,
      emailsPerMonth: 10000,
      contacts: 5000,
      storage: 5,
      teamMembers: 3,
      customDomains: 2,
      apiAccess: true,
      prioritySupport: false,
      advancedAnalytics: true,
      whiteLabel: false,
    },
    popular: true,
    description: "Ideal for growing teams and businesses",
  },
  {
    id: "plan-professional",
    name: "Professional",
    price: 120,
    billingCycle: "monthly",
    features: {
      emailAccounts: 15,
      campaigns: 0, // unlimited
      emailsPerMonth: 50000,
      contacts: 25000,
      storage: 20,
      teamMembers: 10,
      customDomains: 5,
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
      whiteLabel: false,
    },
    description: "For professional teams with advanced needs",
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    price: 299,
    billingCycle: "monthly",
    features: {
      emailAccounts: 0, // unlimited
      campaigns: 0, // unlimited
      emailsPerMonth: 0, // unlimited
      contacts: 0, // unlimited
      storage: 100,
      teamMembers: 0, // unlimited
      customDomains: 0, // unlimited
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
      whiteLabel: true,
    },
    description: "Custom solutions for large organizations",
  },
];

// Mock payment methods
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm-1",
    type: "visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2025,
    holderName: "John Doe",
    isDefault: true,
    brand: "Visa",
  },
  {
    id: "pm-2",
    type: "mastercard",
    last4: "8888",
    expiryMonth: 6,
    expiryYear: 2026,
    holderName: "John Doe",
    isDefault: false,
    brand: "Mastercard",
  },
];

// Mock usage metrics
export const mockUsageMetrics: UsageMetrics = {
  emailsSent: 7542,
  emailsLimit: 10000,
  contactsReached: 3821,
  contactsLimit: 5000,
  campaignsActive: 12,
  campaignsLimit: 20,
  storageUsed: 3.2,
  storageLimit: 5,
  emailAccountsActive: 3,
  emailAccountsLimit: 5,
  resetDate: "2025-01-25",
  periodStart: "2024-12-25",
  periodEnd: "2025-01-25",
};

// Mock invoices
export const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    date: "2024-12-01",
    dueDate: "2024-12-15",
    amount: 55.00,
    currency: "USD",
    status: "paid",
    description: "Growth Plan - Monthly Subscription",
    items: [
      {
        description: "Growth Plan Subscription (Dec 2024)",
        quantity: 1,
        unitPrice: 55.00,
        total: 55.00,
      },
    ],
    downloadUrl: "/invoices/inv-2024-001.pdf",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2024-002",
    date: "2024-11-01",
    dueDate: "2024-11-15",
    amount: 55.00,
    currency: "USD",
    status: "paid",
    description: "Growth Plan - Monthly Subscription",
    items: [
      {
        description: "Growth Plan Subscription (Nov 2024)",
        quantity: 1,
        unitPrice: 55.00,
        total: 55.00,
      },
    ],
    downloadUrl: "/invoices/inv-2024-002.pdf",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2024-003",
    date: "2024-10-01",
    dueDate: "2024-10-15",
    amount: 55.00,
    currency: "USD",
    status: "paid",
    description: "Growth Plan - Monthly Subscription",
    items: [
      {
        description: "Growth Plan Subscription (Oct 2024)",
        quantity: 1,
        unitPrice: 55.00,
        total: 55.00,
      },
    ],
    downloadUrl: "/invoices/inv-2024-003.pdf",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2024-004",
    date: "2024-09-01",
    dueDate: "2024-09-15",
    amount: 55.00,
    currency: "USD",
    status: "paid",
    description: "Growth Plan - Monthly Subscription",
    items: [
      {
        description: "Growth Plan Subscription (Sep 2024)",
        quantity: 1,
        unitPrice: 55.00,
        total: 55.00,
      },
    ],
    downloadUrl: "/invoices/inv-2024-004.pdf",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2025-001",
    date: "2025-01-01",
    dueDate: "2025-01-15",
    amount: 55.00,
    currency: "USD",
    status: "pending",
    description: "Growth Plan - Monthly Subscription",
    items: [
      {
        description: "Growth Plan Subscription (Jan 2025)",
        quantity: 1,
        unitPrice: 55.00,
        total: 55.00,
      },
    ],
    paymentMethod: "Visa •••• 4242",
  },
];

// Mock billing info
export const mockBillingInfo: BillingInfo = {
  id: "billing-1",
  userId: "user-1",
  currentPlan: subscriptionPlans[1], // Growth plan
  paymentMethod: mockPaymentMethods[0],
  billingAddress: {
    street: "123 Business Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "United States",
  },
  usage: mockUsageMetrics,
  nextBillingDate: "2025-01-25",
  billingCycle: "monthly",
  autoRenew: true,
  taxRate: 8.75, // California tax rate
  currency: "USD",
};

// Mock billing data for settings component
export const mockBillingData: BillingData = {
  renewalDate: "2025-01-25",
  emailAccountsUsed: 3,
  campaignsUsed: 12,
  emailsPerMonthUsed: 7542,
  planDetails: {
    id: "plan-growth",
    name: "Growth",
    isMonthly: true,
    price: 55,
    description: "Ideal for growing teams and businesses",
    maxEmailAccounts: 5,
    maxCampaigns: 20,
    maxEmailsPerMonth: 10000,
  },
  paymentMethod: {
    lastFour: "4242",
    expiry: "12/25",
    brand: "Visa",
  },
  billingHistory: mockInvoices.map(inv => ({
    date: inv.date,
    description: inv.description,
    amount: `$${inv.amount.toFixed(2)}`,
    method: inv.paymentMethod,
  })),
};

// Mock billing and plan settings
export const mockBillingAndPlanSettings: BillingAndPlanSettings = {
  currentPlan: mockBillingData.planDetails,
  usage: {
    emailAccounts: mockBillingData.emailAccountsUsed,
    campaigns: mockBillingData.campaignsUsed,
    emailsPerMonth: mockBillingData.emailsPerMonthUsed,
  },
  billingInfo: {
    paymentMethod: mockBillingData.paymentMethod,
    billingHistory: mockBillingData.billingHistory,
    renewalDate: mockBillingData.renewalDate,
  },
};

// Helper functions for billing calculations
export function calculateTotalWithTax(amount: number, taxRate: number): number {
  return amount + (amount * taxRate / 100);
}

export function getUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0; // Unlimited
  return Math.min(100, Math.round((used / limit) * 100));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function getDaysUntilRenewal(renewalDate: string): number {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffTime = renewal.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Payment method icons mapping
export const paymentMethodIcons: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  amex: "💳",
  discover: "💳",
  paypal: "🅿️",
  bank: "🏦",
};

// Billing cycle options
export const billingCycles = [
  { value: "monthly", label: "Monthly", discount: 0 },
  { value: "yearly", label: "Yearly (Save 20%)", discount: 20 },
];
