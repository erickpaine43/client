"use server";

/**
 * @deprecated This file has been split into separate modules for better maintainability.
 * Please use the new billing module structure:
 * - lib/actions/billing/index.ts - Main billing operations
 * - lib/actions/billing/payment-methods.ts - Payment method management
 * - lib/actions/billing/subscriptions.ts - Subscription management
 * - lib/actions/billing/invoices.ts - Invoice operations
 * - lib/actions/billing/usage.ts - Usage metrics
 * 
 * This file is maintained for backward compatibility and will be removed in a future version.
 */

// Re-export all functions from the new billing module structure
export {
  getBillingInfo,
  updateBillingInfo,
  getSubscriptionPlans,
  updateSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription,
  getBillingDataForSettings,
} from './billing/index';

export {
  getUsageMetrics,
  getUsageWithCalculations,
} from './billing/usage';

export {
  addPaymentMethod,
  removePaymentMethod,
} from './billing/payment-methods';

export {
  getBillingHistory,
  downloadInvoice,
} from './billing/invoices';

export {
  applyPromoCode,
  addStorage,
  getStorageOptions,
} from './billing/subscriptions';

// Re-export types for backward compatibility
export type { ActionResult } from './core/types';
