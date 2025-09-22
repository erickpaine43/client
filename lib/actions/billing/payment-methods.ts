"use server";

/**
 * Payment method management actions
 * 
 * This module handles adding, removing, and managing payment methods
 * for billing operations.
 */

import { ActionResult } from '../core/types';
import { ErrorFactory } from '../core/errors';
import {
  requireAuthUser,
  getCurrentUserId,
} from '../core/auth';
import { RateLimiter } from '../../utils/rate-limit';

const rateLimiter = new RateLimiter();
import { type PaymentMethod } from '../../data/billing.mock';
import { validatePaymentMethod, validatePaymentMethodId } from './validation';
import { getBillingInfo } from './index';

/**
 * Add a new payment method
 */
export async function addPaymentMethod(
  paymentMethod: Omit<PaymentMethod, "id">
): Promise<ActionResult<PaymentMethod>> {
  try {
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) return ErrorFactory.authRequired();

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    // Validate payment method
    const validationError = validatePaymentMethod(paymentMethod as PaymentMethod);
    if (validationError) {
      return ErrorFactory.validation(validationError);
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
  } catch {
    return ErrorFactory.internal('Failed to add payment method');
  }
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(
  paymentMethodId: string
): Promise<ActionResult<{ removed: boolean }>> {
  try {
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) return ErrorFactory.authRequired();

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    // Validate payment method ID
    const validationError = validatePaymentMethodId(paymentMethodId);
    if (validationError) {
      return ErrorFactory.validation(validationError, 'paymentMethodId');
    }

    // Check if it's the default payment method
    const billingResult = await getBillingInfo();
    if (!billingResult.success || !billingResult.data) {
      return ErrorFactory.internal('Failed to verify billing information');
    }

    if (billingResult.data.paymentMethod.id === paymentMethodId) {
      return ErrorFactory.validation(
        'Cannot remove default payment method. Please add another payment method first.'
      );
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
  } catch {
    return ErrorFactory.internal('Failed to remove payment method');
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  paymentMethodId: string
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) return ErrorFactory.authRequired();

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    // Validate payment method ID
    const validationError = validatePaymentMethodId(paymentMethodId);
    if (validationError) {
      return ErrorFactory.validation(validationError, 'paymentMethodId');
    }

    // Simulate setting default payment method
    await new Promise(resolve => setTimeout(resolve, 200));

    // In production, update in database and payment processor
    // await db.billing.update({
    //   where: { userId },
    //   data: { defaultPaymentMethodId: paymentMethodId }
    // });
    // await stripe.customers.update(customerId, {
    //   invoice_settings: { default_payment_method: paymentMethodId }
    // });

    return {
      success: true,
      data: { updated: true },
    };
  } catch {
    return ErrorFactory.internal('Failed to set default payment method');
  }
}

/**
 * Get all payment methods for user
 */
export async function getPaymentMethods(): Promise<ActionResult<PaymentMethod[]>> {
  try {
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) return ErrorFactory.authRequired();

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

    // In production, fetch from database
    // const paymentMethods = await db.paymentMethods.findMany({
    //   where: { userId },
    //   orderBy: { isDefault: 'desc' }
    // });

    // For now, return mock data from billing info
    const billingResult = await getBillingInfo();
    if (!billingResult.success || !billingResult.data) {
      return ErrorFactory.internal('Failed to retrieve payment methods');
    }

    // Return array with the current payment method
    // In production, this would return all user's payment methods
    return {
      success: true,
      data: [billingResult.data.paymentMethod],
    };
  } catch {
    return ErrorFactory.internal('Failed to get payment methods');
  }
}

/**
 * Update payment method details
 */
export async function updatePaymentMethod(
  paymentMethodId: string,
  updates: Partial<Omit<PaymentMethod, 'id'>>
): Promise<ActionResult<PaymentMethod>> {
  try {
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) return ErrorFactory.authRequired();

    // Rate limiting check
    const canProceed = await rateLimiter.checkLimit(
      `billing_${userId}`,
      10,
      60000
    );

    if (!canProceed) {
      return ErrorFactory.rateLimit('Too many billing requests. Please try again later.');
    }

    // Validate payment method ID
    const idValidationError = validatePaymentMethodId(paymentMethodId);
    if (idValidationError) {
      return ErrorFactory.validation(idValidationError, 'paymentMethodId');
    }

    // Validate updates if provided
    if (Object.keys(updates).length > 0) {
      const validationError = validatePaymentMethod(updates as PaymentMethod);
      if (validationError) {
        return ErrorFactory.validation(validationError);
      }
    }

    // Get current payment methods
    const paymentMethodsResult = await getPaymentMethods();
    if (!paymentMethodsResult.success || !paymentMethodsResult.data) {
      return ErrorFactory.internal('Failed to retrieve current payment methods');
    }

    const existingMethod = paymentMethodsResult.data.find(pm => pm.id === paymentMethodId);
    if (!existingMethod) {
      return ErrorFactory.notFound('Payment method');
    }

    // Simulate update
    await new Promise(resolve => setTimeout(resolve, 200));

    // In production, update in database and payment processor
    // const updatedMethod = await db.paymentMethods.update({
    //   where: { id: paymentMethodId, userId },
    //   data: updates
    // });

    const updatedMethod: PaymentMethod = {
      ...existingMethod,
      ...updates,
    };

    return {
      success: true,
      data: updatedMethod,
    };
  } catch {
    return ErrorFactory.internal('Failed to update payment method');
  }
}

/**
 * Verify payment method with small charge
 */
export async function verifyPaymentMethod(
  paymentMethodId: string
): Promise<ActionResult<{ verified: boolean; verificationAmount?: number }>> {
  try {
    await requireAuthUser();
    const userId = await getCurrentUserId();
    if (!userId) return ErrorFactory.authRequired();

    // Validate payment method ID
    const validationError = validatePaymentMethodId(paymentMethodId);
    if (validationError) {
      return ErrorFactory.validation(validationError, 'paymentMethodId');
    }

    // Simulate verification charge (typically $1.00 that gets refunded)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, create verification charge with payment processor
    // const verificationCharge = await stripe.charges.create({
    //   amount: 100, // $1.00 in cents
    //   currency: 'usd',
    //   payment_method: paymentMethodId,
    //   description: 'Payment method verification',
    //   capture: false // Don't actually charge, just authorize
    // });

    return {
      success: true,
      data: {
        verified: true,
        verificationAmount: 1.00
      },
    };
  } catch {
    return ErrorFactory.internal('Failed to verify payment method');
  }
}
