"use server";

import { nile } from "@/app/api/[...nile]/nile";
import {
  Invoice,
  InvoiceLineItem,
  InvoiceResponse,
  InvoiceListResponse,
  InvoiceStatus,
  UsageType,
  InvoiceSchema,
} from "@/types/billing";

// ============================================================================
// INVOICE OLTP OPERATIONS
// ============================================================================

/**
 * Get invoices for a company
 * Follows OLTP-first pattern: NileDB auth → OLTP data retrieval → fast response
 */
export async function getInvoices(
  companyId?: number,
  limit = 50,
  offset = 0
): Promise<InvoiceListResponse> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    // 2. Get company ID from user context if not provided
    const effectiveCompanyId = companyId || (user as unknown as { companyId: number }).companyId;
    if (!effectiveCompanyId) {
      return {
        success: false,
        error: "Company ID is required",
        code: "COMPANY_ID_REQUIRED",
      };
    }

    // 3. OLTP data retrieval from NileDB
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
      LIMIT $2 OFFSET $3
    `, [effectiveCompanyId, limit, offset]);

    // 4. Transform database results to Invoice interfaces
    const invoices: Invoice[] = result.map((row: Record<string, unknown>) => ({
      id: row.id,
      companyId: row.company_id,
      invoiceNumber: row.invoice_number,
      amount: row.amount,
      currency: row.currency,
      status: row.status as InvoiceStatus,
      periodStart: new Date(row.period_start as string),
      periodEnd: new Date(row.period_end as string),
      paymentMethodId: row.payment_method_id,
      paidAt: row.paid_at ? new Date(row.paid_at as string) : null,
      paidAmount: row.paid_amount,
      lineItems: JSON.parse((row.line_items as string) || '[]'),
      dueDate: new Date(row.due_date as string),
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
    console.error("getInvoices error:", error);
    return {
      success: false,
      error: "Failed to retrieve invoices",
      code: "INVOICES_FETCH_ERROR",
    };
  }
}

/**
 * Get a specific invoice
 * Follows OLTP-first pattern with security validation
 */
export async function getInvoice(
  invoiceId: string | number
): Promise<InvoiceResponse> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    const companyId = (user as unknown as { companyId: number }).companyId;
    if (!companyId) {
      return {
        success: false,
        error: "Company ID is required",
        code: "COMPANY_ID_REQUIRED",
      };
    }

    // 2. OLTP data retrieval with tenant isolation
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
      WHERE id = $1 
        AND company_id = $2
        AND tenant_id = CURRENT_TENANT_ID()
    `, [invoiceId, companyId]);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Invoice not found",
        code: "INVOICE_NOT_FOUND",
      };
    }

    const row = result[0];
    const invoice: Invoice = {
      id: row.id,
      companyId: row.company_id,
      invoiceNumber: row.invoice_number,
      amount: row.amount,
      currency: row.currency,
      status: row.status as InvoiceStatus,
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
    console.error("getInvoice error:", error);
    return {
      success: false,
      error: "Failed to retrieve invoice",
      code: "INVOICE_FETCH_ERROR",
    };
  }
}

/**
 * Create a new invoice
 * Follows OLTP-first pattern: NileDB auth → OLTP creation → success response
 */
export async function createInvoice(
  invoiceData: {
    companyId: number;
    periodStart: Date;
    periodEnd: Date;
    lineItems: InvoiceLineItem[];
    dueDate: Date;
    notes?: string;
  }
): Promise<InvoiceResponse> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    // 2. Calculate total amount from line items
    const totalAmount = invoiceData.lineItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // 3. Generate unique invoice number
    const invoiceNumber = await generateInvoiceNumber(invoiceData.companyId);

    // 4. Validate invoice data
    const invoiceToValidate = {
      companyId: invoiceData.companyId,
      invoiceNumber,
      amount: totalAmount,
      currency: 'USD',
      status: InvoiceStatus.DRAFT,
      periodStart: invoiceData.periodStart,
      periodEnd: invoiceData.periodEnd,
      paymentMethodId: null,
      paidAt: null,
      paidAmount: null,
      lineItems: invoiceData.lineItems,
      dueDate: invoiceData.dueDate,
      notes: invoiceData.notes || null,
      createdById: user.id,
    };

    const validationResult = InvoiceSchema.safeParse(invoiceToValidate);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid invoice data",
        code: "VALIDATION_ERROR",
      };
    }

    // 5. OLTP operation: Create invoice in NileDB
    const result = await nile.db.query(`
      INSERT INTO invoices (
        company_id,
        invoice_number,
        amount,
        currency,
        status,
        period_start,
        period_end,
        line_items,
        due_date,
        notes,
        created_by_id,
        tenant_id,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TENANT_ID(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id
    `, [
      invoiceData.companyId,
      invoiceNumber,
      totalAmount,
      'USD',
      InvoiceStatus.DRAFT,
      invoiceData.periodStart,
      invoiceData.periodEnd,
      JSON.stringify(invoiceData.lineItems),
      invoiceData.dueDate,
      invoiceData.notes || null,
      user.id,
    ]);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Failed to create invoice",
        code: "INVOICE_CREATE_ERROR",
      };
    }

    // 6. Get the created invoice
    const createdInvoice = await getInvoice(result[0].id);
    if (!createdInvoice.success) {
      return {
        success: false,
        error: "Failed to retrieve created invoice",
        code: "INVOICE_RETRIEVE_ERROR",
      };
    }

    // 7. Background: Update billing analytics (non-blocking)
    try {
      await updateInvoiceAnalytics(invoiceData.companyId, createdInvoice.data);
    } catch (analyticsError) {
      console.warn("Failed to update invoice analytics:", analyticsError);
    }

    return {
      success: true,
      data: createdInvoice.data,
    };
  } catch (error) {
    console.error("createInvoice error:", error);
    return {
      success: false,
      error: "Failed to create invoice",
      code: "INVOICE_CREATE_ERROR",
    };
  }
}

/**
 * Update invoice status
 * Used for payment processing and invoice management
 */
export async function updateInvoiceStatus(
  invoiceId: string | number,
  status: InvoiceStatus,
  paymentData?: {
    paymentMethodId: string;
    paidAmount: number;
    paidAt: Date;
  }
): Promise<InvoiceResponse> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    const companyId = (user as unknown as { companyId: number }).companyId;
    if (!companyId) {
      return {
        success: false,
        error: "Company ID is required",
        code: "COMPANY_ID_REQUIRED",
      };
    }

    // 2. Verify invoice exists and belongs to company
    const existingInvoice = await getInvoice(invoiceId);
    if (!existingInvoice.success) {
      return {
        success: false,
        error: "Invoice not found",
        code: "INVOICE_NOT_FOUND",
      };
    }

    // 3. Build update query based on status and payment data
    let updateQuery = `
      UPDATE invoices
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const updateValues: unknown[] = [status];
    let paramIndex = 2;

    if (paymentData && status === InvoiceStatus.PAID) {
      updateQuery += `, payment_method_id = $${paramIndex++}, paid_amount = $${paramIndex++}, paid_at = $${paramIndex++}`;
      updateValues.push(paymentData.paymentMethodId, paymentData.paidAmount, paymentData.paidAt.toISOString());
    }

    updateQuery += `
      WHERE id = $${paramIndex++} 
        AND company_id = $${paramIndex++}
        AND tenant_id = CURRENT_TENANT_ID()
    `;
    updateValues.push(invoiceId.toString(), companyId.toString());

    // 4. OLTP operation: Update invoice status in NileDB
    await nile.db.query(updateQuery, updateValues);

    // 5. Get updated invoice
    const updatedInvoice = await getInvoice(invoiceId);
    if (!updatedInvoice.success) {
      return {
        success: false,
        error: "Failed to retrieve updated invoice",
        code: "INVOICE_RETRIEVE_ERROR",
      };
    }

    // 6. Background: Update billing analytics
    try {
      await updateInvoiceAnalytics(companyId, updatedInvoice.data);
    } catch (analyticsError) {
      console.warn("Failed to update invoice analytics:", analyticsError);
    }

    return {
      success: true,
      data: updatedInvoice.data,
    };
  } catch (error) {
    console.error("updateInvoiceStatus error:", error);
    return {
      success: false,
      error: "Failed to update invoice status",
      code: "INVOICE_UPDATE_ERROR",
    };
  }
}

/**
 * Generate usage-based invoice for a company
 * Creates invoice based on current usage and plan limits
 */
export async function generateUsageInvoice(
  companyId: number,
  periodStart: Date,
  periodEnd: Date
): Promise<InvoiceResponse> {
  try {
    // 1. Get company billing and plan information
    const { getCompanyBilling } = await import("./company-billing");
    const { getSubscriptionPlan } = await import("./subscription-plans");
    const { getCurrentUsageSummary } = await import("./usage-tracking");

    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: "Company billing information not found",
        code: "BILLING_NOT_FOUND",
      };
    }

    const planResult = await getSubscriptionPlan(billingResult.data.planId);
    if (!planResult.success) {
      return {
        success: false,
        error: "Subscription plan not found",
        code: "PLAN_NOT_FOUND",
      };
    }

    const usageResult = await getCurrentUsageSummary(companyId);
    if (!usageResult.success) {
      return {
        success: false,
        error: "Failed to get usage summary",
        code: "USAGE_SUMMARY_ERROR",
      };
    }

    // 2. Calculate line items based on usage and plan
    const lineItems: InvoiceLineItem[] = [];
    const plan = planResult.data;
    const usage = usageResult.data;

    // Base subscription fee
    const basePrice = billingResult.data.billingCycle === 'yearly' 
      ? plan.yearlyPrice 
      : plan.monthlyPrice;

    lineItems.push({
      description: `${plan.name} Plan - ${billingResult.data.billingCycle}`,
      quantity: 1,
      unitPrice: basePrice,
      totalPrice: basePrice,
      usageType: UsageType.EMAILS, // Base plan
      periodStart,
      periodEnd,
    });

    // Add overage charges if applicable
    if (plan.emailsLimit !== -1 && usage!.emailsSent > plan.emailsLimit) {
      const overage = usage!.emailsSent - plan.emailsLimit;
      const overagePrice = overage * 10; // $0.10 per email overage
      lineItems.push({
        description: `Email overage (${overage} emails)`,
        quantity: overage,
        unitPrice: 10,
        totalPrice: overagePrice,
        usageType: UsageType.EMAILS,
        periodStart,
        periodEnd,
      });
    }

    // Add storage overage if applicable
    if (plan.storageLimit !== -1 && usage!.storageUsed > plan.storageLimit) {
      const overage = usage!.storageUsed - plan.storageLimit;
      const overagePrice = overage * 500; // $5.00 per GB overage
      lineItems.push({
        description: `Storage overage (${overage} GB)`,
        quantity: overage,
        unitPrice: 500,
        totalPrice: overagePrice,
        usageType: UsageType.STORAGE,
        periodStart,
        periodEnd,
      });
    }

    // 3. Calculate due date (typically 30 days from period end)
    const dueDate = new Date(periodEnd);
    dueDate.setDate(dueDate.getDate() + 30);

    // 4. Create the invoice
    return await createInvoice({
      companyId,
      periodStart,
      periodEnd,
      lineItems,
      dueDate,
      notes: `Usage-based invoice for ${periodStart.toISOString().slice(0, 7)}`,
    });
  } catch (error) {
    console.error("generateUsageInvoice error:", error);
    return {
      success: false,
      error: "Failed to generate usage invoice",
      code: "INVOICE_GENERATION_ERROR",
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique invoice number
 */
async function generateInvoiceNumber(companyId: number): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Get count of invoices for this company this month
  const result = await nile.db.query(`
    SELECT COUNT(*) as count
    FROM invoices 
    WHERE company_id = $1 
      AND tenant_id = CURRENT_TENANT_ID()
      AND EXTRACT(YEAR FROM created_at) = $2
      AND EXTRACT(MONTH FROM created_at) = $3
  `, [companyId, year, now.getMonth() + 1]);

  const count = (result[0]?.count || 0) + 1;
  const sequence = String(count).padStart(4, '0');
  
  return `INV-${year}${month}-${companyId}-${sequence}`;
}

/**
 * Update invoice analytics in Convex (background operation)
 */
async function updateInvoiceAnalytics(
  companyId: number,
  invoiceData: Invoice
): Promise<void> {
  // TODO: Implement Convex analytics update
  // This will update invoice analytics based on OLTP changes
  console.log(`Updating invoice analytics for company ${companyId}, invoice ${invoiceData.id}`);
  
  // Example of what this would do:
  // 1. Update invoice count in analytics
  // 2. Update revenue metrics
  // 3. Track payment status changes
  // 4. Update billing dashboard metrics
}

/**
 * Get billing history for a company (alias for getInvoices)
 * Returns invoices formatted for billing history display
 */
export async function getBillingHistory(
  companyId?: number,
  limit = 20
): Promise<InvoiceListResponse> {
  // Use getInvoices but with a smaller default limit for history view
  return getInvoices(companyId, limit, 0);
}
