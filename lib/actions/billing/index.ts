"use server";

/**
 * Main billing actions module
 * 
 * This module provides the primary billing operations including
 * getting billing information, updating billing details, and
 * managing subscription plans.
 */

import { ActionResult } from '../core/types';
import { ErrorFactory } from '../core/errors';
import { getCurrentUserId } from '../core/auth';
import { requireAuth as requireAuthUser } from '../../utils/auth';
import { RateLimiter } from '../../utils/rate-limit';
import { withTiming } from '../../utils/performance';
import {
  mockBillingInfo,
  mockBillingData,
  subscriptionPlans,
  type BillingInfo,
  type SubscriptionPlan,
} from '../../data/billing.mock';
import type { BillingAddress } from '../../data/settings.mock';
import type { BillingData } from '../../../types/settings';
import { validateBillingAddress, validateSubscriptionChange } from './validation';

const rateLimiter = new RateLimiter();

// Helper type for deep partial
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Get billing information for the authenticated user
 */
export async function getBillingInfo(): Promise<ActionResult<BillingInfo>> {
  try {
    // Manual auth check
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) {
      return ErrorFactory.authRequired();
    }

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10, // max attempts
      60000 // 1 minute window
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    return withTiming('getBillingInfo', async () => {
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
    });
  } catch {
    return ErrorFactory.internal('Failed to fetch billing information');
  }
}

/**
 * Update billing information
 */
export async function updateBillingInfo(
  updates: DeepPartial<BillingInfo>
): Promise<ActionResult<BillingInfo>> {
  try {
    // Manual auth check
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) {
      return ErrorFactory.authRequired();
    }

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    // Validate billing address if provided
    if (updates.billingAddress) {
      const addressError = validateBillingAddress(updates.billingAddress);
      if (addressError) {
        return ErrorFactory.validation(addressError, 'billingAddress');
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(updates.currentPlan as any),
      } : mockBillingInfo.currentPlan,
      billingAddress: updates.billingAddress ? {
        ...mockBillingInfo.billingAddress,
        ...updates.billingAddress,
      } as BillingAddress : mockBillingInfo.billingAddress,
      usage: updates.usage ? {
        ...mockBillingInfo.usage,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  } catch {
    return ErrorFactory.internal('Failed to update billing information');
  }
}

/**
 * Get available subscription plans
 */
export async function getSubscriptionPlans(): Promise<ActionResult<SubscriptionPlan[]>> {
  try {
    // This doesn't require authentication as it's public info
    return {
      success: true,
      data: subscriptionPlans,
    };
  } catch {
    return ErrorFactory.internal('Failed to fetch subscription plans');
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  newPlanId: string
): Promise<ActionResult<BillingInfo>> {
  try {
    // Manual auth check
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) {
      return ErrorFactory.authRequired();
    }

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    // Get current billing info and usage
    const billingResult = await getBillingInfo();
    if (!billingResult.success || !billingResult.data) {
      return billingResult as ActionResult<BillingInfo>;
    }

    const usageResult = await getUsageMetrics();
    if (!usageResult.success || !usageResult.data) {
      return ErrorFactory.internal('Failed to verify current usage');
    }

    // Validate plan change
    const validationError = validateSubscriptionChange(
      billingResult.data.currentPlan,
      newPlanId,
      usageResult.data
    );

    if (validationError) {
      return ErrorFactory.validation(validationError);
    }

    const newPlan = subscriptionPlans.find(p => p.id === newPlanId);
    if (!newPlan) {
      return ErrorFactory.validation('Invalid subscription plan');
    }

    // Check payment method for paid plans
    if (newPlan.price > 0 && !billingResult.data.paymentMethod) {
      return ErrorFactory.validation('Payment method required for paid plans');
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
  } catch {
    return ErrorFactory.internal('Failed to update subscription plan');
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  _reason?: string
): Promise<ActionResult<{ cancelledAt: Date }>> {
  try {
    // Manual auth check
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) {
      return ErrorFactory.authRequired();
    }

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

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
  } catch {
    return ErrorFactory.internal('Failed to cancel subscription');
  }
}

/**
 * Reactivate cancelled subscription
 */
export async function reactivateSubscription(): Promise<ActionResult<{ reactivatedAt: Date }>> {
  try {
    // Manual auth check
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) {
      return ErrorFactory.authRequired();
    }

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    // Get current billing info
    const billingResult = await getBillingInfo();
    if (!billingResult.success || !billingResult.data) {
      return ErrorFactory.internal('Failed to verify billing information');
    }

    // Check payment method
    if (!billingResult.data.paymentMethod) {
      return ErrorFactory.validation('Payment method required to reactivate subscription');
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
  } catch {
    return ErrorFactory.internal('Failed to reactivate subscription');
  }
}

/**
 * Get billing data for settings component
 */
export async function getBillingDataForSettings(): Promise<ActionResult<BillingData>> {
  try {
    // Manual auth check
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) {
      return ErrorFactory.authRequired();
    }

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    // For now, return mock data
    return {
      success: true,
      data: mockBillingData,
    };
  } catch {
    return ErrorFactory.internal('Failed to fetch billing data for settings');
  }
}

// Import usage functions for internal use
import { getUsageMetrics, getUsageWithCalculations } from './usage';

// Re-export usage functions from usage module
export { getUsageMetrics, getUsageWithCalculations };

// Re-export payment method functions from payment-methods module
export { 
  addPaymentMethod, 
  removePaymentMethod 
} from './payment-methods';

// Re-export invoice functions from invoices module
export { 
  getBillingHistory, 
  downloadInvoice 
} from './invoices';

// Re-export subscription functions from subscriptions module
export { 
  applyPromoCode, 
  addStorage, 
  getStorageOptions 
} from './subscriptions';
