"use server";

import { nile } from "@/app/api/[...nile]/nile";
import {
  BillingSummary,
  UsageSummary,
  Invoice,
} from "@/types/billing";
import { ID } from "@/types/common";
import { ActionResult } from "@/lib/actions/core/types";
import { getCompanyBilling } from "./company-billing";
import { getSubscriptionPlan } from "./subscription-plans";
import { getPaymentMethods } from "./payment-methods";

interface InvoiceRow {
  id: string;
  company_id: number;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  period_start: string;
  period_end: string;
  payment_method_id?: string;
  paid_at?: string;
  paid_amount?: number;
  line_items?: string;
  due_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by_id?: string;
}

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

/**
 * Get recent invoices for a company
 * Follows OLTP-first pattern with pagination
 */
export async function getRecentInvoices(
  companyId: number,
  limit = 10
): Promise<ActionResult<Invoice[]>> {
  try {
    // 1. OLTP data retrieval from NileDB
    const result = await nile.db.query(`
      SELECT 
        id,
        company_id,
        invoice_number,
        amount,
        currency,
        status,
        period_start,
        period_end,
        payment_method_id,
        paid_at,
        paid_amount,
        line_items,
        due_date,
        notes,
        created_at,
        updated_at,
        created_by_id
      FROM invoices 
      WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
      ORDER BY created_at DESC
      LIMIT $2
    `, [companyId, limit]);

    // 2. Transform database results to Invoice interfaces
    const invoices: Invoice[] = result.map((row: InvoiceRow) => ({
      id: row.id,
      companyId: row.company_id,
      invoiceNumber: row.invoice_number,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      paymentMethodId: row.payment_method_id,
      paidAt: row.paid_at ? new Date(row.paid_at) : null,
      paidAmount: row.paid_amount,
      lineItems: JSON.parse(row.line_items || '[]'),
      dueDate: new Date(row.due_date),
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdById: row.created_by_id,
    }));

    return {
      success: true,
      data: invoices,
    };
  } catch (error) {
    console.error("getRecentInvoices error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to retrieve recent invoices", code: "INVOICES_FETCH_ERROR" },
    };
  }
}

/**
 * Get next upcoming invoice for a company
 * Follows OLTP-first pattern
 */
export async function getNextInvoice(
  companyId: number
): Promise<ActionResult<Invoice | null>> {
  try {
    // 1. OLTP data retrieval from NileDB
    const result = await nile.db.query(`
      SELECT 
        id,
        company_id,
        invoice_number,
        amount,
        currency,
        status,
        period_start,
        period_end,
        payment_method_id,
        paid_at,
        paid_amount,
        line_items,
        due_date,
        notes,
        created_at,
        updated_at,
        created_by_id
      FROM invoices 
      WHERE company_id = $1 
        AND tenant_id = CURRENT_TENANT_ID()
        AND status IN ('draft', 'sent')
        AND due_date > CURRENT_TIMESTAMP
      ORDER BY due_date ASC
      LIMIT 1
    `, [companyId]);

    if (!result || result.length === 0) {
      return {
        success: true,
        data: null,
      };
    }

    const row = result[0];
    const invoice: Invoice = {
      id: row.id,
      companyId: row.company_id,
      invoiceNumber: row.invoice_number,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      paymentMethodId: row.payment_method_id,
      paidAt: row.paid_at ? new Date(row.paid_at) : null,
      paidAmount: row.paid_amount,
      lineItems: JSON.parse(row.line_items || '[]'),
      dueDate: new Date(row.due_date),
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdById: row.created_by_id,
    };

    return {
      success: true,
      data: invoice,
    };
  } catch (error) {
    console.error("getNextInvoice error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to retrieve next invoice", code: "NEXT_INVOICE_FETCH_ERROR" },
    };
  }
}

/**
 * Get current usage summary for billing calculations
 * This would typically aggregate data from various sources
 */
export async function getCurrentUsageSummary(
  companyId: number
): Promise<ActionResult<UsageSummary>> {
  try {
    // 1. Get current billing period
    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Company billing information not found", code: "BILLING_NOT_FOUND" },
      };
    }

    // 2. Calculate period dates
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    // 3. Get usage data from various sources
    // TODO: In a real implementation, this would query actual usage data
    // For now, we'll return mock data that would be replaced with real queries

    const usageSummary: UsageSummary = {
      companyId,
      periodStart,
      periodEnd,
      emailsSent: await getEmailsSentCount(companyId, periodStart, periodEnd),
      domainsUsed: await getDomainsUsedCount(companyId),
      mailboxesUsed: await getMailboxesUsedCount(companyId),
      storageUsed: await getStorageUsedAmount(companyId), // in GB
      usersCount: await getUsersCount(companyId),
    };

    return {
      success: true,
      data: usageSummary,
    };
  } catch (error) {
    console.error("getCurrentUsageSummary error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to retrieve usage summary" },
    };
  }
}

/**
 * Check if company is within plan limits
 * Returns usage vs limits comparison
 */
export async function checkPlanLimits(
  companyId: number
): Promise<ActionResult<{
  withinLimits: boolean;
  usage: UsageSummary;
  limits: {
    emails: number;
    domains: number;
    mailboxes: number;
    storage: number;
    users: number;
  };
  overages: {
    emails: number;
    domains: number;
    mailboxes: number;
    storage: number;
    users: number;
  };
}>> {
  try {
    // 1. Get current usage
    const usageResult = await getCurrentUsageSummary(companyId);
    if (!usageResult.success) {
      return {
        success: false,
        error: usageResult.error,
      };
    }

    // 2. Get billing information and plan
    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Company billing information not found", code: "BILLING_NOT_FOUND" },
      };
    }

    const planResult = await getSubscriptionPlan(billingResult.data.planId);
    if (!planResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Subscription plan not found", code: "PLAN_NOT_FOUND" },
      };
    }

    // 3. Calculate limits and overages
    const usage = usageResult.data!;
    const plan = planResult.data;

    const limits = {
      emails: plan.emailsLimit,
      domains: plan.domainsLimit,
      mailboxes: plan.mailboxesLimit,
      storage: plan.storageLimit,
      users: plan.usersLimit,
    };

    const overages = {
      emails: Math.max(0, limits.emails === -1 ? 0 : usage.emailsSent - limits.emails),
      domains: Math.max(0, limits.domains === -1 ? 0 : usage.domainsUsed - limits.domains),
      mailboxes: Math.max(0, limits.mailboxes === -1 ? 0 : usage.mailboxesUsed - limits.mailboxes),
      storage: Math.max(0, limits.storage === -1 ? 0 : usage.storageUsed - limits.storage),
      users: Math.max(0, limits.users === -1 ? 0 : usage.usersCount - limits.users),
    };

    const withinLimits = Object.values(overages).every(overage => overage === 0);

    return {
      success: true,
      data: {
        withinLimits,
        usage,
        limits,
        overages,
      },
    };
  } catch (error) {
    console.error("checkPlanLimits error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to check plan limits" },
    };
  }
}

// ============================================================================
// USAGE DATA HELPERS
// ============================================================================
// These functions would be replaced with actual data queries in production

async function getEmailsSentCount(
  _companyId: number,
  _periodStart: Date,
  _periodEnd: Date
): Promise<number> {
  // TODO: Query actual email sending data
  // This would typically query campaign analytics or email logs
  return 0;
}

async function getDomainsUsedCount(companyId: number): Promise<number> {
  try {
    const result = await nile.db.query(`
      SELECT COUNT(*) as count
      FROM domains 
      WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
    `, [companyId]);
    
    return result[0]?.count || 0;
  } catch (error) {
    console.warn("Failed to get domains count:", error);
    return 0;
  }
}

async function getMailboxesUsedCount(companyId: number): Promise<number> {
  try {
    const result = await nile.db.query(`
      SELECT COUNT(*) as count
      FROM email_accounts 
      WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
    `, [companyId]);
    
    return result[0]?.count || 0;
  } catch (error) {
    console.warn("Failed to get mailboxes count:", error);
    return 0;
  }
}

async function getStorageUsedAmount(_companyId: number): Promise<number> {
  // TODO: Query actual storage usage
  // This would typically query file storage or email storage data
  return 0;
}

async function getUsersCount(companyId: number): Promise<number> {
  try {
    const result = await nile.db.query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
    `, [companyId]);
    
    return result[0]?.count || 0;
  } catch (error) {
    console.warn("Failed to get users count:", error);
    return 0;
  }
}

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

    // 3. Get billing summary
    const billingResult = await getBillingSummary(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: billingResult.error,
      };
    }

    const billing = billingResult.data!;

    // 4. Format data for settings
    const settingsData = {
      renewalDate: billing.nextInvoice?.dueDate.toISOString().split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      planDetails: {
        id: billing.currentPlan.id,
        name: billing.currentPlan.name,
        price: billing.currentPlan.monthlyPrice,
        features: billing.currentPlan.features,
        isMonthly: billing.companyBilling.billingCycle === 'monthly',
        maxEmailAccounts: billing.currentPlan.mailboxesLimit === -1 ? 0 : billing.currentPlan.mailboxesLimit,
        maxCampaigns: billing.currentPlan.emailsLimit === -1 ? 0 : billing.currentPlan.emailsLimit,
      },
      paymentMethod: billing.paymentMethods.length > 0 ? {
        brand: billing.paymentMethods[0].cardBrand || 'Unknown',
        lastFour: billing.paymentMethods[0].lastFourDigits,
        expiry: billing.paymentMethods[0].expiryMonth && billing.paymentMethods[0].expiryYear
          ? `${String(billing.paymentMethods[0].expiryMonth!).padStart(2, '0')}/${billing.paymentMethods[0].expiryYear}`
          : 'N/A',
      } : null,
      billingHistory: billing.recentInvoices,
      emailAccountsUsed: billing.usageSummary.mailboxesUsed,
      campaignsUsed: billing.usageSummary.emailsSent,
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
