"use server";

import { nile } from "@/app/api/[...nile]/nile";
import { BillingSummary } from "@/types/billing";
import { ActionResult } from "@/lib/actions/core/types";
import { getCompanyBilling } from "./company-billing";
import { getSubscriptionPlan } from "./subscription-plans";
import { getPaymentMethods } from "./payment-methods";
import { getRecentInvoices, getNextInvoice } from "./invoice-utils";
import { getCurrentUsageSummary } from "./usage-tracking";

// Re-exports removed to comply with "use server" directive
// Import directly from specific modules instead

// ============================================================================
// COMPREHENSIVE BILLING OPERATIONS
// ============================================================================

/**
 * Get complete billing summary for dashboard
 * Follows OLTP-first pattern: NileDB auth → OLTP data retrieval → fast response
 */
export async function getBillingSummary(
  companyId?: number
): Promise<ActionResult<BillingSummary>> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: { type: "auth", message: "Authentication required" },
      };
    }

    // 2. Get company ID from user context if not provided
    const effectiveCompanyId = companyId || (user as unknown as { companyId: number }).companyId;
    if (!effectiveCompanyId) {
      return {
        success: false,
        error: { type: "validation", message: "Company ID is required", code: "COMPANY_ID_REQUIRED" },
      };
    }

    // 3. Get company billing information
    const billingResult = await getCompanyBilling(effectiveCompanyId);
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
    const paymentMethodsResult = await getPaymentMethods(effectiveCompanyId);
    const paymentMethods = paymentMethodsResult.success ? paymentMethodsResult.data : [];

    // 6. Get recent invoices
    const recentInvoicesResult = await getRecentInvoices(effectiveCompanyId, 5);
    const recentInvoices = recentInvoicesResult.success ? recentInvoicesResult.data : [];

    // 7. Get next invoice (if any)
    const nextInvoiceResult = await getNextInvoice(effectiveCompanyId);
    const nextInvoice = nextInvoiceResult.success ? nextInvoiceResult.data : null;

    // 8. Get usage summary
    const usageSummaryResult = await getCurrentUsageSummary(effectiveCompanyId);
    const usageSummary = usageSummaryResult.success ? usageSummaryResult.data : {
      companyId: effectiveCompanyId,
      periodStart: new Date(),
      periodEnd: new Date(),
      emailsSent: 0,
      domainsUsed: 0,
      mailboxesUsed: 0,
      storageUsed: 0,
      usersCount: 0,
    };

    // 9. Compile billing summary
    const billingSummary: BillingSummary = {
      companyBilling: billingResult.data,
      currentPlan: planResult.data,
      nextInvoice: nextInvoice || null,
      paymentMethods,
      recentInvoices: recentInvoices || [],
      usageSummary: usageSummary!,
    };

    return {
      success: true,
      data: billingSummary,
    };
  } catch (error) {
    console.error("getBillingSummary error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to retrieve billing summary", code: "BILLING_SUMMARY_ERROR" },
    };
  }
}




