import type { UsageMetrics } from "../data/billing.mock";
import type { PaymentMethod } from "../../types/billing";
import { getUsagePercentage } from "../data/billing.mock";

// Usage calculation functions (client-side utilities)
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

// Payment method sanitization for API responses
// Removes sensitive fields like providerPaymentMethodId and createdById
export function sanitizePaymentMethodData(paymentMethod: PaymentMethod) {
 return {
   id: paymentMethod.id,
   type: paymentMethod.type,
   provider: paymentMethod.provider,
   lastFourDigits: paymentMethod.lastFourDigits,
   expiryMonth: paymentMethod.expiryMonth,
   expiryYear: paymentMethod.expiryYear,
   cardBrand: paymentMethod.cardBrand,
   bankName: paymentMethod.bankName,
   accountType: paymentMethod.accountType,
   isDefault: paymentMethod.isDefault,
   isActive: paymentMethod.isActive,
   createdAt: paymentMethod.createdAt,
   updatedAt: paymentMethod.updatedAt,
 };
}
