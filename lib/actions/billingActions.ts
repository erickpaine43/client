"use server";

import { 
  requireUserId, 
  getCurrentUserId,
  checkRateLimit,
} from "../utils/auth";
import { 
  mockBillingInfo,
  mockBillingData,
  mockInvoices,
  mockPaymentMethods,
  mockUsageMetrics,
  subscriptionPlans,
  type BillingInfo,
  type PaymentMethod,
  type UsageMetrics,
  type Invoice,
  type SubscriptionPlan,
  calculateTotalWithTax,
  getUsagePercentage,
  formatCurrency,
  getDaysUntilRenewal,
} from "../data/billing.mock";
import type { BillingAddress } from "../data/settings.mock";
import type { 
  BillingData,
  BillingAndPlanSettings 
} from "../../types/settings";

// Helper type for deep partial
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// Action Result Types (consistent with other actions)
export type ActionResult<T> = 
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
      field?: string;
    };

// Error codes for billing operations
export const BILLING_ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: "AUTH_REQUIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  
  // Validation errors
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_PAYMENT_METHOD: "INVALID_PAYMENT_METHOD",
  INVALID_BILLING_ADDRESS: "INVALID_BILLING_ADDRESS",
  INVALID_PLAN: "INVALID_PLAN",
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  PLAN_DOWNGRADE_BLOCKED: "PLAN_DOWNGRADE_BLOCKED",
  PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
  USAGE_LIMIT_EXCEEDED: "USAGE_LIMIT_EXCEEDED",
  
  // Database errors
  DATABASE_ERROR: "DATABASE_ERROR",
  BILLING_NOT_FOUND: "BILLING_NOT_FOUND",
  UPDATE_FAILED: "UPDATE_FAILED",
  
  // Payment errors
  PAYMENT_FAILED: "PAYMENT_FAILED",
  CARD_DECLINED: "CARD_DECLINED",
  INVALID_CARD: "INVALID_CARD",
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // General errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

// Validation functions
function validatePaymentMethod(
  paymentMethod: DeepPartial<PaymentMethod>
): string | null {
  if (!paymentMethod.type) {
    return "Payment method type is required";
  }
  
  const validTypes = ["visa", "mastercard", "amex", "discover", "paypal", "bank"];
  if (!validTypes.includes(paymentMethod.type)) {
    return "Invalid payment method type";
  }
  
  if (paymentMethod.type !== "paypal" && paymentMethod.type !== "bank") {
    // Card validation
    if (!paymentMethod.last4 || !/^\d{4}$/.test(paymentMethod.last4)) {
      return "Invalid card last 4 digits";
    }
    
    if (paymentMethod.expiryMonth !== undefined) {
      if (paymentMethod.expiryMonth < 1 || paymentMethod.expiryMonth > 12) {
        return "Invalid expiry month";
      }
    }
    
    if (paymentMethod.expiryYear !== undefined) {
      const currentYear = new Date().getFullYear();
      if (paymentMethod.expiryYear < currentYear) {
        return "Card has expired";
      }
      if (paymentMethod.expiryYear > currentYear + 20) {
        return "Invalid expiry year";
      }
    }
  }
  
  if (!paymentMethod.holderName || paymentMethod.holderName.trim().length < 2) {
    return "Cardholder name is required";
  }
  
  return null;
}

function validateBillingAddress(
  address: DeepPartial<BillingAddress>
): string | null {
  if (address.street && address.street.trim().length < 5) {
    return "Street address must be at least 5 characters";
  }
  
  if (address.city && address.city.trim().length < 2) {
    return "City must be at least 2 characters";
  }
  
  if (address.state && address.state.trim().length > 50) {
    return "State/Province name is too long";
  }
  
  if (address.zipCode && !/^[A-Z0-9\s-]{3,10}$/i.test(address.zipCode)) {
    return "Invalid postal/zip code format";
  }
  
  if (address.country && address.country.trim().length < 2) {
    return "Country is required";
  }
  
  return null;
}

function validateSubscriptionChange(
  currentPlan: SubscriptionPlan,
  newPlanId: string,
  currentUsage: UsageMetrics
): string | null {
  const newPlan = subscriptionPlans.find(p => p.id === newPlanId);
  
  if (!newPlan) {
    return "Invalid subscription plan";
  }
  
  // Check for downgrade restrictions
  if (newPlan.features.emailAccounts > 0 && 
      newPlan.features.emailAccounts < currentUsage.emailAccountsActive) {
    return `Cannot downgrade: You have ${currentUsage.emailAccountsActive} email accounts but the new plan only allows ${newPlan.features.emailAccounts}`;
  }
  
  if (newPlan.features.campaigns > 0 && 
      newPlan.features.campaigns < currentUsage.campaignsActive) {
    return `Cannot downgrade: You have ${currentUsage.campaignsActive} active campaigns but the new plan only allows ${newPlan.features.campaigns}`;
  }
  
  if (newPlan.features.contacts > 0 && 
      newPlan.features.contacts < currentUsage.contactsReached) {
    return `Cannot downgrade: You have ${currentUsage.contactsReached} contacts but the new plan only allows ${newPlan.features.contacts}`;
  }
  
  return null;
}

// Usage calculation functions
export function calculateUsagePercentages(usage: UsageMetrics): {
  emailsSentPercentage: number;
  contactsReachedPercentage: number;
  campaignsActivePercentage: number;
  storageUsedPercentage: number;
  emailAccountsPercentage: number;
} {
  return {
    emailsSentPercentage: getUsagePercentage(usage.emailsSent, usage.emailsLimit),
    contactsReachedPercentage: getUsagePercentage(usage.contactsReached, usage.contactsLimit),
    campaignsActivePercentage: getUsagePercentage(usage.campaignsActive, usage.campaignsLimit),
    storageUsedPercentage: getUsagePercentage(usage.storageUsed, usage.storageLimit),
    emailAccountsPercentage: getUsagePercentage(usage.emailAccountsActive, usage.emailAccountsLimit),
  };
}

export function calculateOverage(usage: UsageMetrics): {
  hasOverage: boolean;
  overageItems: Array<{
    metric: string;
    used: number;
    limit: number;
    overage: number;
    cost: number;
  }>;
  totalOverageCost: number;
} {
  const overageItems: Array<{
    metric: string;
    used: number;
    limit: number;
    overage: number;
    cost: number;
  }> = [];
  
  // Email overage: $0.001 per email over limit
  if (usage.emailsLimit > 0 && usage.emailsSent > usage.emailsLimit) {
    const overage = usage.emailsSent - usage.emailsLimit;
    overageItems.push({
      metric: "Emails",
      used: usage.emailsSent,
      limit: usage.emailsLimit,
      overage,
      cost: overage * 0.001,
    });
  }
  
  // Contact overage: $0.01 per contact over limit
  if (usage.contactsLimit > 0 && usage.contactsReached > usage.contactsLimit) {
    const overage = usage.contactsReached - usage.contactsLimit;
    overageItems.push({
      metric: "Contacts",
      used: usage.contactsReached,
      limit: usage.contactsLimit,
      overage,
      cost: overage * 0.01,
    });
  }
  
  // Storage overage: $5 per GB over limit
  if (usage.storageLimit > 0 && usage.storageUsed > usage.storageLimit) {
    const overage = usage.storageUsed - usage.storageLimit;
    overageItems.push({
      metric: "Storage (GB)",
      used: usage.storageUsed,
      limit: usage.storageLimit,
      overage,
      cost: overage * 5,
    });
  }
  
  const totalOverageCost = overageItems.reduce((sum, item) => sum + item.cost, 0);
  
  return {
    hasOverage: overageItems.length > 0,
    overageItems,
    totalOverageCost,
  };
}

export function projectMonthlyUsage(
  usage: UsageMetrics,
  daysIntoMonth: number = new Date().getDate()
): UsageMetrics {
  const daysInCurrentMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  
  const projectionMultiplier = daysInCurrentMonth / Math.max(1, daysIntoMonth);
  
  return {
    ...usage,
    emailsSent: Math.round(usage.emailsSent * projectionMultiplier),
    contactsReached: Math.round(usage.contactsReached * projectionMultiplier),
    // Storage and active items don't need projection as they're current state
  };
}

// Main Server Actions

/**
 * Get billing information for the authenticated user
 */
export async function getBillingInfo(): Promise<ActionResult<BillingInfo>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view billing information",
        code: BILLING_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Check rate limit
    const canProceed = await checkRateLimit(`billing:get:${userId}`, 30, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: "Too many requests. Please try again later.",
        code: BILLING_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, fetch from database
    // const billingInfo = await db.billing.findUnique({ 
    //   where: { userId },
    //   include: { paymentMethod: true, subscription: true, usage: true }
    // });
    
    // For now, return mock data
    const billingInfo: BillingInfo = {
      ...mockBillingInfo,
      userId,
    };
    
    return {
      success: true,
      data: billingInfo,
    };
  } catch (error) {
    console.error("getBillingInfo error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: BILLING_ERROR_CODES.NETWORK_ERROR,
      };
    }
    
    return {
      success: false,
      error: "Failed to retrieve billing information",
      code: BILLING_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Update billing information
 */
export async function updateBillingInfo(
  updates: DeepPartial<BillingInfo>
): Promise<ActionResult<BillingInfo>> {
  try {
    const userId = await requireUserId();
    
    // Check rate limit for sensitive operation
    const canProceed = await checkRateLimit(`billing:update:${userId}`, 5, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: "Too many update attempts. Please try again later.",
        code: BILLING_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Validate payment method if provided
    if (updates.paymentMethod) {
      const paymentError = validatePaymentMethod(updates.paymentMethod);
      if (paymentError) {
        return {
          success: false,
          error: paymentError,
          code: BILLING_ERROR_CODES.INVALID_PAYMENT_METHOD,
        };
      }
    }
    
    // Validate billing address if provided
    if (updates.billingAddress) {
      const addressError = validateBillingAddress(updates.billingAddress);
      if (addressError) {
        return {
          success: false,
          error: addressError,
          code: BILLING_ERROR_CODES.INVALID_BILLING_ADDRESS,
        };
      }
    }
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In production, update in database
    // const updatedBilling = await db.billing.update({
    //   where: { userId },
    //   data: updates,
    // });
    
    // For now, merge with mock data
    const updatedBilling: BillingInfo = {
      ...mockBillingInfo,
      userId,
      currentPlan: updates.currentPlan ? {
        ...mockBillingInfo.currentPlan,
        ...(updates.currentPlan as any),
      } : mockBillingInfo.currentPlan,
      paymentMethod: updates.paymentMethod ? {
        ...mockBillingInfo.paymentMethod,
        ...updates.paymentMethod,
      } as PaymentMethod : mockBillingInfo.paymentMethod,
      billingAddress: updates.billingAddress ? {
        ...mockBillingInfo.billingAddress,
        ...updates.billingAddress,
      } as BillingAddress : mockBillingInfo.billingAddress,
      usage: updates.usage ? {
        ...mockBillingInfo.usage,
        ...(updates.usage as any),
      } : mockBillingInfo.usage,
      nextBillingDate: updates.nextBillingDate || mockBillingInfo.nextBillingDate,
      billingCycle: updates.billingCycle || mockBillingInfo.billingCycle,
      autoRenew: updates.autoRenew ?? mockBillingInfo.autoRenew,
      taxRate: updates.taxRate ?? mockBillingInfo.taxRate,
      currency: updates.currency || mockBillingInfo.currency,
    };
    
    return {
      success: true,
      data: updatedBilling,
    };
  } catch (error) {
    console.error("updateBillingInfo error:", error);
    return {
      success: false,
      error: "Failed to update billing information",
      code: BILLING_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get usage metrics for the authenticated user
 */
export async function getUsageMetrics(): Promise<ActionResult<UsageMetrics>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view usage metrics",
        code: BILLING_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, fetch from database
    // const usage = await db.usageMetrics.findUnique({ 
    //   where: { userId }
    // });
    
    return {
      success: true,
      data: mockUsageMetrics,
    };
  } catch (error) {
    console.error("getUsageMetrics error:", error);
    return {
      success: false,
      error: "Failed to retrieve usage metrics",
      code: BILLING_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Get usage metrics with calculations
 */
export async function getUsageWithCalculations(): Promise<ActionResult<{
  usage: UsageMetrics;
  percentages: ReturnType<typeof calculateUsagePercentages>;
  overage: ReturnType<typeof calculateOverage>;
  projection: UsageMetrics;
  daysUntilReset: number;
}>> {
  try {
    const usageResult = await getUsageMetrics();
    
    if (!usageResult.success) {
      return usageResult as ActionResult<any>;
    }
    
    const usage = usageResult.data;
    const percentages = calculateUsagePercentages(usage);
    const overage = calculateOverage(usage);
    const projection = projectMonthlyUsage(usage);
    const daysUntilReset = getDaysUntilRenewal(usage.resetDate);
    
    return {
      success: true,
      data: {
        usage,
        percentages,
        overage,
        projection,
        daysUntilReset,
      },
    };
  } catch (error) {
    console.error("getUsageWithCalculations error:", error);
    return {
      success: false,
      error: "Failed to calculate usage metrics",
      code: BILLING_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  newPlanId: string
): Promise<ActionResult<BillingInfo>> {
  try {
    const userId = await requireUserId();
    
    // Get current billing info and usage
    const billingResult = await getBillingInfo();
    if (!billingResult.success) {
      return billingResult;
    }
    
    const usageResult = await getUsageMetrics();
    if (!usageResult.success) {
      return {
        success: false,
        error: "Failed to verify current usage",
        code: BILLING_ERROR_CODES.INTERNAL_ERROR,
      };
    }
    
    // Validate plan change
    const validationError = validateSubscriptionChange(
      billingResult.data.currentPlan,
      newPlanId,
      usageResult.data
    );
    
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: BILLING_ERROR_CODES.PLAN_DOWNGRADE_BLOCKED,
      };
    }
    
    const newPlan = subscriptionPlans.find(p => p.id === newPlanId);
    if (!newPlan) {
      return {
        success: false,
        error: "Invalid subscription plan",
        code: BILLING_ERROR_CODES.INVALID_PLAN,
      };
    }
    
    // Check payment method for paid plans
    if (newPlan.price > 0 && !billingResult.data.paymentMethod) {
      return {
        success: false,
        error: "Payment method required for paid plans",
        code: BILLING_ERROR_CODES.PAYMENT_REQUIRED,
      };
    }
    
    // Simulate subscription update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In production, update subscription
    // const updatedBilling = await db.billing.update({
    //   where: { userId },
    //   data: { currentPlanId: newPlanId },
    // });
    
    const updatedBilling: BillingInfo = {
      ...billingResult.data,
      currentPlan: newPlan,
    };
    
    return {
      success: true,
      data: updatedBilling,
    };
  } catch (error) {
    console.error("updateSubscriptionPlan error:", error);
    return {
      success: false,
      error: "Failed to update subscription plan",
      code: BILLING_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get available subscription plans
 */
export async function getSubscriptionPlans(): Promise<
  ActionResult<SubscriptionPlan[]>
> {
  try {
    // This doesn't require authentication as it's public info
    return {
      success: true,
      data: subscriptionPlans,
    };
  } catch (error) {
    console.error("getSubscriptionPlans error:", error);
    return {
      success: false,
      error: "Failed to retrieve subscription plans",
      code: BILLING_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Add a new payment method
 */
export async function addPaymentMethod(
  paymentMethod: Omit<PaymentMethod, "id">
): Promise<ActionResult<PaymentMethod>> {
  try {
    const userId = await requireUserId();
    
    // Validate payment method
    const validationError = validatePaymentMethod(paymentMethod as PaymentMethod);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        code: BILLING_ERROR_CODES.INVALID_PAYMENT_METHOD,
      };
    }
    
    // Check rate limit
    const canProceed = await checkRateLimit(`payment:add:${userId}`, 3, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: "Too many attempts. Please try again later.",
        code: BILLING_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Simulate payment method verification with payment processor
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, add to payment processor and database
    // const stripePaymentMethod = await stripe.paymentMethods.create({...});
    // const savedMethod = await db.paymentMethods.create({
    //   data: { ...paymentMethod, userId, stripeId: stripePaymentMethod.id }
    // });
    
    const newMethod: PaymentMethod = {
      ...paymentMethod,
      id: `pm-${Date.now()}`,
    };
    
    return {
      success: true,
      data: newMethod,
    };
  } catch (error) {
    console.error("addPaymentMethod error:", error);
    return {
      success: false,
      error: "Failed to add payment method",
      code: BILLING_ERROR_CODES.PAYMENT_FAILED,
    };
  }
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(
  paymentMethodId: string
): Promise<ActionResult<{ removed: boolean }>> {
  try {
    const userId = await requireUserId();
    
    // Check if it's the default payment method
    const billingResult = await getBillingInfo();
    if (!billingResult.success) {
      return {
        success: false,
        error: "Failed to verify billing information",
        code: BILLING_ERROR_CODES.INTERNAL_ERROR,
      };
    }
    
    if (billingResult.data.paymentMethod.id === paymentMethodId) {
      return {
        success: false,
        error: "Cannot remove default payment method. Please add another payment method first.",
        code: BILLING_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Simulate removal
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In production, remove from payment processor and database
    // await stripe.paymentMethods.detach(paymentMethodId);
    // await db.paymentMethods.delete({ where: { id: paymentMethodId, userId } });
    
    return {
      success: true,
      data: { removed: true },
    };
  } catch (error) {
    console.error("removePaymentMethod error:", error);
    return {
      success: false,
      error: "Failed to remove payment method",
      code: BILLING_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get billing history (invoices)
 */
export async function getBillingHistory(
  limit: number = 12,
  offset: number = 0
): Promise<ActionResult<Invoice[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view billing history",
        code: BILLING_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Validate pagination
    if (limit < 1 || limit > 100) {
      return {
        success: false,
        error: "Limit must be between 1 and 100",
        code: BILLING_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // In production, fetch from database
    // const invoices = await db.invoices.findMany({
    //   where: { userId },
    //   take: limit,
    //   skip: offset,
    //   orderBy: { date: 'desc' }
    // });
    
    const invoices = mockInvoices.slice(offset, offset + limit);
    
    return {
      success: true,
      data: invoices,
    };
  } catch (error) {
    console.error("getBillingHistory error:", error);
    return {
      success: false,
      error: "Failed to retrieve billing history",
      code: BILLING_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Download invoice
 */
export async function downloadInvoice(
  invoiceId: string
): Promise<ActionResult<{ url: string }>> {
  try {
    const userId = await requireUserId();
    
    // Verify invoice belongs to user
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return {
        success: false,
        error: "Invoice not found",
        code: BILLING_ERROR_CODES.BILLING_NOT_FOUND,
      };
    }
    
    // In production, generate signed URL for PDF download
    // const url = await generateSignedUrl(`invoices/${userId}/${invoiceId}.pdf`);
    
    const url = invoice.downloadUrl || `/api/invoices/${invoiceId}/download`;
    
    return {
      success: true,
      data: { url },
    };
  } catch (error) {
    console.error("downloadInvoice error:", error);
    return {
      success: false,
      error: "Failed to generate invoice download link",
      code: BILLING_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  reason?: string
): Promise<ActionResult<{ cancelledAt: Date }>> {
  try {
    const userId = await requireUserId();
    
    // Simulate cancellation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In production, cancel with payment processor and update database
    // await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    // await db.billing.update({
    //   where: { userId },
    //   data: { 
    //     cancelledAt: new Date(),
    //     cancellationReason: reason 
    //   }
    // });
    
    return {
      success: true,
      data: { cancelledAt: new Date() },
    };
  } catch (error) {
    console.error("cancelSubscription error:", error);
    return {
      success: false,
      error: "Failed to cancel subscription",
      code: BILLING_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Reactivate cancelled subscription
 */
export async function reactivateSubscription(): Promise<
  ActionResult<{ reactivatedAt: Date }>
> {
  try {
    const userId = await requireUserId();
    
    // Get current billing info
    const billingResult = await getBillingInfo();
    if (!billingResult.success) {
      return {
        success: false,
        error: "Failed to verify billing information",
        code: BILLING_ERROR_CODES.INTERNAL_ERROR,
      };
    }
    
    // Check payment method
    if (!billingResult.data.paymentMethod) {
      return {
        success: false,
        error: "Payment method required to reactivate subscription",
        code: BILLING_ERROR_CODES.PAYMENT_REQUIRED,
      };
    }
    
    // Simulate reactivation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In production, reactivate with payment processor
    // await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
    // await db.billing.update({
    //   where: { userId },
    //   data: { cancelledAt: null }
    // });
    
    return {
      success: true,
      data: { reactivatedAt: new Date() },
    };
  } catch (error) {
    console.error("reactivateSubscription error:", error);
    return {
      success: false,
      error: "Failed to reactivate subscription",
      code: BILLING_ERROR_CODES.UPDATE_FAILED,
    };
  }
}

/**
 * Get billing data for settings component
 */
export async function getBillingDataForSettings(): Promise<
  ActionResult<BillingData>
> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view billing data",
        code: BILLING_ERROR_CODES.AUTH_REQUIRED,
      };
    }
    
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For now, return mock data
    return {
      success: true,
      data: mockBillingData,
    };
  } catch (error) {
    console.error("getBillingDataForSettings error:", error);
    return {
      success: false,
      error: "Failed to retrieve billing data",
      code: BILLING_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Apply promo code
 */
export async function applyPromoCode(
  promoCode: string
): Promise<ActionResult<{ discount: number; description: string }>> {
  try {
    const userId = await requireUserId();
    
    // Validate promo code format
    if (!promoCode || !/^[A-Z0-9]{4,20}$/i.test(promoCode)) {
      return {
        success: false,
        error: "Invalid promo code format",
        code: BILLING_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    // Check rate limit
    const canProceed = await checkRateLimit(`promo:apply:${userId}`, 5, 60000);
    if (!canProceed) {
      return {
        success: false,
        error: "Too many attempts. Please try again later.",
        code: BILLING_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }
    
    // Simulate promo code validation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In production, validate with backend
    // const promo = await db.promoCodes.findUnique({ where: { code: promoCode } });
    
    // Mock promo codes
    const promoCodes: Record<string, { discount: number; description: string }> = {
      "WELCOME20": { discount: 20, description: "20% off for 3 months" },
      "ANNUAL15": { discount: 15, description: "15% off annual plans" },
      "FRIEND10": { discount: 10, description: "10% referral discount" },
    };
    
    const promo = promoCodes[promoCode.toUpperCase()];
    
    if (!promo) {
      return {
        success: false,
        error: "Invalid or expired promo code",
        code: BILLING_ERROR_CODES.VALIDATION_FAILED,
      };
    }
    
    return {
      success: true,
      data: promo,
    };
  } catch (error) {
    console.error("applyPromoCode error:", error);
    return {
      success: false,
      error: "Failed to apply promo code",
      code: BILLING_ERROR_CODES.INTERNAL_ERROR,
    };
  }
}
