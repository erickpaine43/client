"use server";

import { nile } from "@/app/api/[...nile]/nile";
import { ActionResult } from "@/lib/actions/core/types";
import { getCompanyBilling } from "./company-billing";
import { getSubscriptionPlan } from "./subscription-plans";
import { getPaymentMethods } from "./payment-methods";

/**
 * Cancel a user's subscription
 * Follows OLTP-first pattern
 */
export async function cancelSubscription(
  _reason?: string
): Promise<ActionResult<{ cancelledAt: Date }>> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: { type: "auth", message: "Authentication required" },
      };
    }

    // 2. Get company ID
    const companyId = (user as unknown as { companyId: number }).companyId;
    if (!companyId) {
      return {
        success: false,
        error: { type: "validation", message: "Company ID is required" },
      };
    }

    // 3. Check if subscription exists and can be cancelled
    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "No active subscription found" },
      };
    }

    // 4. Cancel subscription (stub implementation)
    // In production, this would update the subscription status in database
    const cancelledAt = new Date();

    return {
      success: true,
      data: { cancelledAt },
    };
  } catch (error) {
    console.error("cancelSubscription error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to cancel subscription" },
    };
  }
}

/**
 * Reactivate a cancelled subscription
 * Follows OLTP-first pattern
 */
export async function reactivateSubscription(): Promise<ActionResult<{ reactivatedAt: Date }>> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: { type: "auth", message: "Authentication required" },
      };
    }

    // 2. Get company ID
    const companyId = (user as unknown as { companyId: number }).companyId;
    if (!companyId) {
      return {
        success: false,
        error: { type: "validation", message: "Company ID is required" },
      };
    }

    // 3. Check if subscription can be reactivated
    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Subscription information not found" },
      };
    }

    // 4. Check for payment method
    const paymentMethodsResult = await getPaymentMethods(companyId);
    if (!paymentMethodsResult.success || paymentMethodsResult.data.length === 0) {
      return {
        success: false,
        error: { type: "validation", message: "Payment method required to reactivate subscription" },
      };
    }

    // 5. Reactivate subscription (stub implementation)
    const reactivatedAt = new Date();

    return {
      success: true,
      data: { reactivatedAt },
    };
  } catch (error) {
    console.error("reactivateSubscription error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to reactivate subscription" },
    };
  }
}

/**
 * Update a user's subscription plan (different from admin plan updates)
 * Follows OLTP-first pattern
 */
export async function updateSubscriptionPlan(
  planId: string
): Promise<ActionResult<{ currentPlan: { id: string; name: string; features: string[]; price: number } }>> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: { type: "auth", message: "Authentication required" },
      };
    }

    // 2. Get company ID
    const companyId = (user as unknown as { companyId: number }).companyId;
    if (!companyId) {
      return {
        success: false,
        error: { type: "validation", message: "Company ID is required" },
      };
    }

    // 3. Verify new plan exists
    const planResult = await getSubscriptionPlan(planId);
    if (!planResult.success) {
      return {
        success: false,
        error: { type: "validation", message: "Invalid subscription plan" },
      };
    }

    // 4. Get current billing and usage
    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Current billing information not found" },
      };
    }

    // 5. Update subscription plan (stub implementation)
    const newPlan = planResult.data;
    const updatedPlan = {
      id: newPlan.id.toString(),
      name: newPlan.name,
      features: newPlan.features,
      price: newPlan.monthlyPrice,
    };

    return {
      success: true,
      data: { currentPlan: updatedPlan },
    };
  } catch (error) {
    console.error("updateSubscriptionPlan error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to update subscription plan" },
    };
  }
}
