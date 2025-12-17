"use server";

/**
 * Subscription management actions
 * 
 * This module handles subscription-related operations including
 * promo codes, storage add-ons, and subscription modifications.
 */

import { ActionResult } from '../core/types';
import { ErrorFactory, withErrorHandling } from '../core/errors';
import { withAuth, withContextualRateLimit, RateLimits } from '../core/auth';
import { mockUsageMetrics } from '../../data/billing.mock';
import { validatePromoCode, validateStorageAmount } from './validation';
import { getBillingInfo } from './index';

/**
 * Apply promo code
 */
export async function applyPromoCode(
  promoCode: string
): Promise<ActionResult<{ discount: number; description: string }>> {
  return await withContextualRateLimit(
    'billing:promo:apply',
    'user',
    RateLimits.BILLING_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Validate promo code format
          const validationError = validatePromoCode(promoCode);
          if (validationError) {
            return ErrorFactory.validation(validationError, 'promoCode');
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
            return ErrorFactory.validation('Invalid or expired promo code');
          }

          return {
            success: true,
            data: promo,
          };
        });
      });
    }
  );
}

/**
 * Add storage to user's account
 */
export async function addStorage(
  storageAmount: number
): Promise<ActionResult<{ newStorageLimit: number; monthlyCost: number }>> {
  return await withContextualRateLimit(
    'billing:storage:add',
    'user',
    RateLimits.BILLING_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Validate storage amount
          const validationError = validateStorageAmount(storageAmount);
          if (validationError) {
            return ErrorFactory.validation(validationError, 'storageAmount');
          }

          // Get current billing info
          const billingResult = await getBillingInfo();
          if (!billingResult.success || !billingResult.data) {
            return ErrorFactory.internal('Failed to verify current billing information');
          }

          // Check payment method
          if (!billingResult.data.paymentMethod) {
            return ErrorFactory.validation('Payment method required to add storage');
          }

          // Calculate cost ($3 per GB per month)
          const monthlyCost = storageAmount * 3;
          const newStorageLimit = billingResult.data.usage.storageLimit + storageAmount;

          // Simulate payment processing
          await new Promise(resolve => setTimeout(resolve, 500));

          // In production, process payment and update database
          // const paymentResult = await stripe.charges.create({
          //   amount: monthlyCost * 100, // Convert to cents
          //   currency: 'usd',
          //   customer: billingResult.data.paymentMethod.id,
          //   description: `Additional storage: ${storageAmount} GB`,
          // });

          // await db.billing.update({
          //   where: { userId: context.userId },
          //   data: {
          //     usage: {
          //       update: {
          //         storageLimit: newStorageLimit
          //       }
          //     }
          //   }
          // });

          // For now, simulate successful storage addition
          // Update the mock data (in production this would be in database)
          mockUsageMetrics.storageLimit = newStorageLimit;

          return {
            success: true,
            data: {
              newStorageLimit,
              monthlyCost,
            },
          };
        });
      });
    }
  );
}

/**
 * Get available storage options
 */
export async function getStorageOptions(): Promise<ActionResult<{gb: number; price: number}[]>> {
  try {
    // This doesn't require authentication as it's public pricing info
    return {
      success: true,
      data: [
        { gb: 1, price: 3 },
        { gb: 2, price: 6 },
        { gb: 5, price: 15 },
        { gb: 10, price: 30 },
      ],
    };
  } catch {
    return ErrorFactory.internal('Failed to get storage options');
  }
}

/**
 * Remove storage from user's account
 */
export async function removeStorage(
  storageAmount: number
): Promise<ActionResult<{ newStorageLimit: number; refundAmount: number }>> {
  return await withContextualRateLimit(
    'billing:storage:remove',
    'user',
    RateLimits.BILLING_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Validate storage amount
          const validationError = validateStorageAmount(storageAmount);
          if (validationError) {
            return ErrorFactory.validation(validationError, 'storageAmount');
          }

          // Get current billing info
          const billingResult = await getBillingInfo();
          if (!billingResult.success || !billingResult.data) {
            return ErrorFactory.internal('Failed to verify current billing information');
          }

          const currentStorageLimit = billingResult.data.usage.storageLimit;
          const currentStorageUsed = billingResult.data.usage.storageUsed;

          // Check if removal is possible
          if (storageAmount >= currentStorageLimit) {
            return ErrorFactory.validation('Cannot remove all storage');
          }

          const newStorageLimit = currentStorageLimit - storageAmount;

          // Check if current usage would exceed new limit
          if (currentStorageUsed > newStorageLimit) {
            return ErrorFactory.validation(
              `Cannot remove storage: Currently using ${currentStorageUsed}GB but new limit would be ${newStorageLimit}GB`
            );
          }

          // Calculate prorated refund
          const refundAmount = storageAmount * 3; // $3 per GB (simplified - should be prorated)

          // Simulate refund processing
          await new Promise(resolve => setTimeout(resolve, 300));

          // In production, process refund and update database
          // const refundResult = await stripe.refunds.create({
          //   charge: originalChargeId,
          //   amount: refundAmount * 100, // Convert to cents
          // });

          return {
            success: true,
            data: {
              newStorageLimit,
              refundAmount,
            },
          };
        });
      });
    }
  );
}

/**
 * Get subscription usage predictions
 */
export async function getUsagePredictions(): Promise<ActionResult<{
  predictedOverage: number;
  recommendedPlan?: string;
  costSavings?: number;
}>> {
  return await withContextualRateLimit(
    'billing:usage:predictions',
    'user',
    RateLimits.ANALYTICS_QUERY,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Get current billing info
          const billingResult = await getBillingInfo();
          if (!billingResult.success || !billingResult.data) {
            return ErrorFactory.internal('Failed to retrieve billing information');
          }

          const usage = billingResult.data.usage;
          const currentPlan = billingResult.data.currentPlan;

          // Simple prediction logic (in production, this would use ML models)
          const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          const currentDay = new Date().getDate();
          const projectionMultiplier = daysInMonth / currentDay;

          const projectedEmails = Math.round(usage.emailsSent * projectionMultiplier);
          const projectedContacts = Math.round(usage.contactsReached * projectionMultiplier);

          let predictedOverage = 0;
          let recommendedPlan: string | undefined;
          let costSavings: number | undefined;

          // Calculate potential overage costs
          if (currentPlan.features.emailsPerMonth > 0 && projectedEmails > currentPlan.features.emailsPerMonth) {
            predictedOverage += (projectedEmails - currentPlan.features.emailsPerMonth) * 0.001; // $0.001 per email
          }

          if (currentPlan.features.contacts > 0 && projectedContacts > currentPlan.features.contacts) {
            predictedOverage += (projectedContacts - currentPlan.features.contacts) * 0.01; // $0.01 per contact
          }

          // Recommend plan upgrade if overage is significant
          if (predictedOverage > currentPlan.price * 0.2) { // If overage > 20% of plan cost
            // Find next tier plan (simplified logic)
            const planIndex = ['plan-starter', 'plan-growth', 'plan-professional', 'plan-enterprise'].indexOf(currentPlan.id);
            if (planIndex >= 0 && planIndex < 3) {
              recommendedPlan = ['plan-starter', 'plan-growth', 'plan-professional', 'plan-enterprise'][planIndex + 1];
              costSavings = predictedOverage; // Simplified - actual savings would be more complex
            }
          }

          return {
            success: true,
            data: {
              predictedOverage,
              recommendedPlan,
              costSavings,
            },
          };
        });
      });
    }
  );
}

/**
 * Schedule subscription change for next billing cycle
 */
export async function scheduleSubscriptionChange(
  newPlanId: string,
  effectiveDate?: string
): Promise<ActionResult<{ scheduledAt: Date; effectiveDate: Date }>> {
  return await withContextualRateLimit(
    'billing:subscription:schedule',
    'user',
    RateLimits.SUBSCRIPTION_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Get current billing info
          const billingResult = await getBillingInfo();
          if (!billingResult.success || !billingResult.data) {
            return ErrorFactory.internal('Failed to retrieve billing information');
          }

          // Default effective date to next billing cycle
          const defaultEffectiveDate = new Date(billingResult.data.nextBillingDate);
          const parsedEffectiveDate = effectiveDate ? new Date(effectiveDate) : defaultEffectiveDate;

          // Validate effective date is in the future
          if (parsedEffectiveDate <= new Date()) {
            return ErrorFactory.validation('Effective date must be in the future');
          }

          // Simulate scheduling
          await new Promise(resolve => setTimeout(resolve, 200));

          // In production, schedule the change in database
          // await db.scheduledSubscriptionChanges.create({
          //   data: {
          //     userId: context.userId,
          //     newPlanId,
          //     effectiveDate: parsedEffectiveDate,
          //     scheduledAt: new Date(),
          //   }
          // });

          return {
            success: true,
            data: {
              scheduledAt: new Date(),
              effectiveDate: parsedEffectiveDate,
            },
          };
        });
      });
    }
  );
}

/**
 * Cancel scheduled subscription change
 */
export async function cancelScheduledSubscriptionChange(): Promise<ActionResult<{ cancelled: boolean }>> {
  return await withContextualRateLimit(
    'billing:subscription:cancel-schedule',
    'user',
    RateLimits.SUBSCRIPTION_UPDATE,
    async () => {
      return await withAuth(async (_context) => {
        return await withErrorHandling(async () => {
          // Simulate cancellation
          await new Promise(resolve => setTimeout(resolve, 100));

          // In production, cancel scheduled changes
          // await db.scheduledSubscriptionChanges.deleteMany({
          //   where: { userId: context.userId }
          // });

          return {
            success: true,
            data: { cancelled: true },
          };
        });
      });
    }
  );
}
