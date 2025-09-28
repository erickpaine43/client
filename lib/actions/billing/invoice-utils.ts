"use server";

import { nile } from "@/app/api/[...nile]/nile";
import { Invoice } from "@/types/billing";
import { ActionResult } from "@/lib/actions/core/types";

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
