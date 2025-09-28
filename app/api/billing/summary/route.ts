import { NextRequest, NextResponse } from "next/server";
import {
  getBillingSummary,
} from "@/lib/actions/billing/billing-operations";

/**
 * Billing Summary API Endpoints - Secure OLTP Operations
 * 
 * This API provides comprehensive billing summary information for dashboards
 * and billing management interfaces following OLTP-first patterns.
 * 
 * Security Features:
 * - NileDB authentication required for all operations
 * - Tenant isolation enforced at database level
 * - Comprehensive billing data aggregation
 * - Usage vs limits monitoring
 * - Financial data security boundaries
 */

// GET /api/billing/summary - Get comprehensive billing summary
export async function GET(_request: NextRequest) {
  try {
    // Authentication is handled within the action
    const result = await getBillingSummary();
    
    if (!result.success) {
      const statusCode = result.error!.code === "AUTH_REQUIRED" ? 401 :
                        result.error!.code === "BILLING_NOT_FOUND" ? 404 : 400;

      return NextResponse.json(
        { error: result.error, code: result.error!.code },
        { status: statusCode }
      );
    }

    // Sanitize billing summary data
    const sanitizedData = {
      companyBilling: {
        id: result.data!.companyBilling.id,
        companyId: result.data!.companyBilling.companyId,
        billingEmail: result.data!.companyBilling.billingEmail,
        billingAddress: result.data!.companyBilling.billingAddress,
        planId: result.data!.companyBilling.planId,
        billingCycle: result.data!.companyBilling.billingCycle,
        subscriptionStatus: result.data!.companyBilling.subscriptionStatus,
        nextBillingDate: result.data!.companyBilling.nextBillingDate,
        lastPaymentDate: result.data!.companyBilling.lastPaymentDate,
        lastPaymentAmount: result.data!.companyBilling.lastPaymentAmount,
        currency: result.data!.companyBilling.currency,
        createdAt: result.data!.companyBilling.createdAt,
        updatedAt: result.data!.companyBilling.updatedAt,
        // Exclude sensitive fields:
        // - paymentMethodId (internal reference)
        // - subscriptionId (external reference)
        // - createdById (internal audit field)
      },
      currentPlan: result.data!.currentPlan,
      nextInvoice: result.data!.nextInvoice,
      paymentMethods: result.data!.paymentMethods.map(pm => ({
        id: pm.id,
        type: pm.type,
        provider: pm.provider,
        lastFourDigits: pm.lastFourDigits,
        expiryMonth: pm.expiryMonth,
        expiryYear: pm.expiryYear,
        cardBrand: pm.cardBrand,
        bankName: pm.bankName,
        accountType: pm.accountType,
        isDefault: pm.isDefault,
        isActive: pm.isActive,
        createdAt: pm.createdAt,
        updatedAt: pm.updatedAt,
        // Exclude sensitive fields:
        // - providerPaymentMethodId (tokenized ID)
        // - createdById (internal audit field)
      })),
      recentInvoices: result.data!.recentInvoices,
      usageSummary: result.data!.usageSummary,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedData,
    });
  } catch (error) {
    console.error("GET /api/billing/summary error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}


