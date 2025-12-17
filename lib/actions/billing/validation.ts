/**
 * Validation utilities for billing operations
 * 
 * This module provides validation functions for billing-related data
 * including payment methods, billing addresses, and subscription changes.
 */

import { subscriptionPlans, type PaymentMethod, type SubscriptionPlan, type UsageMetrics } from '../../data/billing.mock';
import type { BillingAddress } from '../../data/settings.mock';

// Helper type for deep partial
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Validate payment method data
 */
export function validatePaymentMethod(
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

/**
 * Validate billing address data
 */
export function validateBillingAddress(
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

/**
 * Validate subscription plan change
 */
export function validateSubscriptionChange(
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

/**
 * Validate promo code format
 */
export function validatePromoCode(promoCode: string): string | null {
  if (!promoCode || !/^[A-Z0-9]{4,20}$/i.test(promoCode)) {
    return "Invalid promo code format";
  }
  
  return null;
}

/**
 * Validate storage amount for add storage operation
 */
export function validateStorageAmount(storageAmount: number): string | null {
  if (!storageAmount || storageAmount <= 0 || storageAmount > 100) {
    return "Storage amount must be between 1 and 100 GB";
  }
  
  return null;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit: number, offset: number): string | null {
  if (limit < 1 || limit > 100) {
    return "Limit must be between 1 and 100";
  }
  
  if (offset < 0) {
    return "Offset must be non-negative";
  }
  
  return null;
}

/**
 * Validate invoice ID format
 */
export function validateInvoiceId(invoiceId: string): string | null {
  if (!invoiceId || invoiceId.trim().length === 0) {
    return "Invoice ID is required";
  }
  
  // Basic format validation - adjust based on your invoice ID format
  if (!/^inv-[a-zA-Z0-9-]+$/i.test(invoiceId)) {
    return "Invalid invoice ID format";
  }
  
  return null;
}

/**
 * Validate payment method ID format
 */
export function validatePaymentMethodId(paymentMethodId: string): string | null {
  if (!paymentMethodId || paymentMethodId.trim().length === 0) {
    return "Payment method ID is required";
  }
  
  // Basic format validation - adjust based on your payment method ID format
  if (!/^pm-[a-zA-Z0-9-]+$/i.test(paymentMethodId)) {
    return "Invalid payment method ID format";
  }
  
  return null;
}

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): string | null {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  
  if (!currency || !validCurrencies.includes(currency.toUpperCase())) {
    return `Invalid currency. Supported currencies: ${validCurrencies.join(', ')}`;
  }
  
  return null;
}

/**
 * Validate billing cycle
 */
export function validateBillingCycle(cycle: string): string | null {
  const validCycles = ['monthly', 'yearly'];
  
  if (!cycle || !validCycles.includes(cycle)) {
    return `Invalid billing cycle. Must be one of: ${validCycles.join(', ')}`;
  }
  
  return null;
}

/**
 * Validate tax rate
 */
export function validateTaxRate(taxRate: number): string | null {
  if (taxRate < 0 || taxRate > 100) {
    return "Tax rate must be between 0 and 100 percent";
  }
  
  return null;
}

/**
 * Comprehensive billing info validation
 */
export function validateBillingInfo(billingInfo: DeepPartial<{
  paymentMethod?: DeepPartial<PaymentMethod>;
  billingAddress?: DeepPartial<BillingAddress>;
  currency?: string;
  billingCycle?: string;
  taxRate?: number;
}>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (billingInfo.paymentMethod) {
    const paymentError = validatePaymentMethod(billingInfo.paymentMethod);
    if (paymentError) {
      errors.push(paymentError);
    }
  }
  
  if (billingInfo.billingAddress) {
    const addressError = validateBillingAddress(billingInfo.billingAddress);
    if (addressError) {
      errors.push(addressError);
    }
  }
  
  if (billingInfo.currency) {
    const currencyError = validateCurrency(billingInfo.currency);
    if (currencyError) {
      errors.push(currencyError);
    }
  }
  
  if (billingInfo.billingCycle) {
    const cycleError = validateBillingCycle(billingInfo.billingCycle);
    if (cycleError) {
      errors.push(cycleError);
    }
  }
  
  if (billingInfo.taxRate !== undefined) {
    const taxError = validateTaxRate(billingInfo.taxRate);
    if (taxError) {
      errors.push(taxError);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
