/**
 * Billing Actions Module - OLTP Operations
 * 
 * This module implements the OLTP-first billing operations following the established
 * architectural patterns. All billing operations authenticate via NileDB first,
 * complete OLTP operations, and then trigger Convex analytics updates.
 * 
 * Security Features:
 * - Payment method encryption/tokenization
 * - Secure billing address storage
 * - Financial audit trail
 * - PCI compliance foundation
 * - Complete tenant isolation
 * 
 * Architecture Pattern:
 * 1. Authentication via NileDB
 * 2. OLTP operation completion
 * 3. Success response to client
 * 4. Background Convex analytics update
 */

// Re-export all billing actions for convenient importing
export * from './company-billing';
export * from './payment-methods';
export * from './invoices';
export * from './subscription-plans';
export * from './subscriptions';
export * from './billing-operations';
export * from './usage';

// Explicitly export user-facing subscription functions (not admin functions)
export { cancelSubscription, reactivateSubscription, updateSubscriptionPlan } from "./subscription-handlers";
export { updateBillingInfo, getBillingDataForSettings } from "./settings-integration";

// Compatibility function for subscriptions module
// TODO: This is a stub implementation - subscriptions.ts expects a different data structure
export async function getBillingInfo() {
  // Return mock data to avoid compilation errors
  // In production, this would adapt BillingSummary to the expected format
  return {
    success: true,
    data: {
      paymentMethod: null,
      usage: {
        storageLimit: 10,
        storageUsed: 2,
        contactsReached: 1000,
        emailsSent: 5000,
      },
      currentPlan: {
        id: 'plan-growth',
        name: 'Basic Plan',
        features: {
          emailsPerMonth: 5000,
          contacts: 10000,
        },
        price: 29.99,
      },
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  };
}

// Export types for external use
export type {
  CompanyBilling,
  PaymentMethod,
  Invoice,
  SubscriptionPlan,
  BillingSummary,
  CompanyBillingFormData,
  PaymentMethodFormData,
} from '@/types/billing';
