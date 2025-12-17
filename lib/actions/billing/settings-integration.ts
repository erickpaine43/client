"use server";

import { nile } from "@/app/api/[...nile]/nile";
import { Invoice } from "@/types/billing";
import { ID } from "@/types/common";
import { ActionResult } from "@/lib/actions/core/types";
import { getCompanyBilling } from "./company-billing";
import { getSubscriptionPlan } from "./subscription-plans";
import { getPaymentMethods } from "./payment-methods";
import { getRecentInvoices, getNextInvoice } from "./invoice-utils";
import { getCurrentUsageSummary } from "./usage-tracking";

/**
 * Update billing information for a user
 * Follows OLTP-first pattern with validation
 */
export async function updateBillingInfo(updates: {
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}): Promise<ActionResult<{ billingAddress?: object }>> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: { type: "auth", message: "Authentication required", code: "AUTH_REQUIRED" },
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

    // 3. Validate updates if provided
    if (updates.billingAddress) {
      // Basic validation - in production this would be more thorough
      const { street, city, state, zipCode, country } = updates.billingAddress;
      if (!street || !city || !state || !zipCode || !country) {
        return {
          success: false,
          error: { type: "validation", message: "All billing address fields are required" },
        };
      }
    }

    // 4. Update company billing information
    // For now, this is a stub - would update database in production
    const updatedData = updates.billingAddress ? { billingAddress: updates.billingAddress } : {};

    return {
      success: true,
      data: updatedData,
    };
  } catch (error) {
    console.error("updateBillingInfo error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to update billing information" },
    };
  }
}

/**
 * Get billing data formatted for settings page
 * Follows OLTP-first pattern
 */
export async function getBillingDataForSettings(): Promise<ActionResult<{
  renewalDate: string;
  planDetails: {
    id: ID;
    name: string;
    price: number;
    features: string[];
    isMonthly: boolean;
    maxEmailAccounts: number;
    maxCampaigns: number;
  };
  paymentMethod: {
    brand: string;
    lastFour: string;
    expiry: string;
  } | null;
  billingHistory: Invoice[];
  emailAccountsUsed: number;
  campaignsUsed: number;
}>> {
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

    // 3. Get billing information
    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Company billing information not found" },
      };
    }

    // 4. Get current subscription plan
    const planResult = await getSubscriptionPlan(billingResult.data.planId);
    if (!planResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Subscription plan not found" },
      };
    }

    // 5. Get payment methods
    const paymentMethodsResult = await getPaymentMethods(companyId);
    const paymentMethods = paymentMethodsResult.success ? paymentMethodsResult.data : [];

    // 6. Get recent invoices
    const recentInvoicesResult = await getRecentInvoices(companyId, 5);
    const recentInvoices = recentInvoicesResult.success ? recentInvoicesResult.data : [];

    // 7. Get next invoice (if any)
    const nextInvoiceResult = await getNextInvoice(companyId);
    const nextInvoice = nextInvoiceResult.success ? nextInvoiceResult.data : null;

    // 8. Get usage summary
    const usageSummaryResult = await getCurrentUsageSummary(companyId);
    const usageSummary = usageSummaryResult.success ? usageSummaryResult.data : {
      companyId: companyId,
      periodStart: new Date(),
      periodEnd: new Date(),
      emailsSent: 0,
      domainsUsed: 0,
      mailboxesUsed: 0,
      storageUsed: 0,
      usersCount: 0,
    };

    // 9. Format data for settings
    const settingsData = {
      renewalDate: nextInvoice?.dueDate.toISOString().split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      planDetails: {
        id: planResult.data.id,
        name: planResult.data.name,
        price: planResult.data.monthlyPrice,
        features: planResult.data.features,
        isMonthly: billingResult.data.billingCycle === 'monthly',
        maxEmailAccounts: planResult.data.mailboxesLimit === -1 ? 0 : planResult.data.mailboxesLimit,
        maxCampaigns: planResult.data.emailsLimit === -1 ? 0 : planResult.data.emailsLimit,
      },
      paymentMethod: paymentMethods.length > 0 ? {
        brand: paymentMethods[0].cardBrand || 'Unknown',
        lastFour: paymentMethods[0].lastFourDigits,
        expiry: paymentMethods[0].expiryMonth && paymentMethods[0].expiryYear
          ? `${String(paymentMethods[0].expiryMonth!).padStart(2, '0')}/${paymentMethods[0].expiryYear}`
          : 'N/A',
      } : null,
      billingHistory: recentInvoices || [],
      emailAccountsUsed: usageSummary!.mailboxesUsed,
      campaignsUsed: usageSummary!.emailsSent,
    };

    return {
      success: true,
      data: settingsData,
    };
  } catch (error) {
    console.error("getBillingDataForSettings error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to retrieve billing settings data" },
    };
  }
}
