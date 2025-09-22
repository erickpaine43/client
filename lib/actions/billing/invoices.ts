"use server";

/**
 * Invoice and billing history management actions
 * 
 * This module handles invoice retrieval, downloads, and billing history
 * operations.
 */

import { ActionResult } from '../core/types';
import { ErrorFactory } from '../core/errors';
import {
  requireAuth as requireAuthUser,
  getCurrentUserId,
} from '../core/auth';
import { RateLimiter } from '../../utils/rate-limit';

const rateLimiter = new RateLimiter();
import { mockInvoices, type Invoice } from '../../data/billing.mock';
import { validatePagination, validateInvoiceId } from './validation';

/**
 * Get billing history (invoices)
 */
export async function getBillingHistory(
  limit: number = 12,
  offset: number = 0
): Promise<ActionResult<Invoice[]>> {
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

    // Validate pagination
    const validationError = validatePagination(limit, offset);
    if (validationError) {
      return ErrorFactory.validation(validationError);
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 150));

    // In production, fetch from database
    // const invoices = await db.invoices.findMany({
    //   where: { userId },
    //   take: limit,
    //   skip: offset,
    //   orderBy: { date: 'desc' }
    // });

    const invoices = mockInvoices.slice(offset, offset + limit) as Invoice[];

    return {
      success: true,
      data: invoices,
    };
  } catch {
    return ErrorFactory.internal('Failed to fetch billing history');
  }
}

/**
 * Download invoice
 */
export async function downloadInvoice(
  invoiceId: string
): Promise<ActionResult<{ url: string }>> {
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

    // Validate invoice ID
    const validationError = validateInvoiceId(invoiceId);
    if (validationError) {
      return ErrorFactory.validation(validationError, 'invoiceId');
    }

    // Verify invoice belongs to user
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return ErrorFactory.notFound('Invoice');
    }

    // In production, generate signed URL for PDF download
    // const url = await generateSignedUrl(`invoices/${userId}/${invoiceId}.pdf`);

    const url = invoice.downloadUrl || `/api/invoices/${invoiceId}/download`;

    return {
      success: true,
      data: { url },
    };
  } catch {
    return ErrorFactory.internal('Failed to download invoice');
  }
}

/**
 * Get invoice details by ID
 */
export async function getInvoiceDetails(
  invoiceId: string
): Promise<ActionResult<Invoice>> {
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

    // Validate invoice ID
    const validationError = validateInvoiceId(invoiceId);
    if (validationError) {
      return ErrorFactory.validation(validationError, 'invoiceId');
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    // In production, fetch from database
    // const invoice = await db.invoices.findUnique({
    //   where: { id: invoiceId, userId },
    //   include: { items: true }
    // });

    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return ErrorFactory.notFound('Invoice');
    }

    return {
      success: true,
      data: invoice,
    };
  } catch {
    return ErrorFactory.internal('Failed to fetch invoice details');
  }
}

/**
 * Get invoice summary statistics
 */
export async function getInvoiceSummary(): Promise<ActionResult<{
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageAmount: number;
}>> {
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

    // Simulate database aggregation
    await new Promise(resolve => setTimeout(resolve, 200));

    // In production, use database aggregation
    // const summary = await db.invoices.aggregate({
    //   where: { userId },
    //   _count: { id: true },
    //   _sum: { amount: true },
    //   _avg: { amount: true }
    // });

    // Calculate summary from mock data
    const totalInvoices = mockInvoices.length;
    const totalAmount = mockInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const paidAmount = mockInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const pendingAmount = mockInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const overdueAmount = mockInvoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const averageAmount = totalAmount / Math.max(1, totalInvoices);

    return {
      success: true,
      data: {
        totalInvoices,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        averageAmount,
      },
    };
  } catch {
    return ErrorFactory.internal('Failed to get invoice summary');
  }
}

/**
 * Mark invoice as paid (for manual payment tracking)
 */
export async function markInvoiceAsPaid(
  invoiceId: string,
  _paymentMethod?: string,
  _paymentDate?: string
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

    // Validate invoice ID
    const validationError = validateInvoiceId(invoiceId);
    if (validationError) {
      return ErrorFactory.validation(validationError, 'invoiceId');
    }

    // Verify invoice exists and belongs to user
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return ErrorFactory.notFound('Invoice');
    }

    if (invoice.status === 'paid') {
      return ErrorFactory.validation('Invoice is already marked as paid');
    }

    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 200));

    // In production, update in database
    // await db.invoices.update({
    //   where: { id: invoiceId, userId },
    //   data: {
    //     status: 'paid',
    //     paymentMethod: paymentMethod || invoice.paymentMethod,
    //     paidAt: paymentDate ? new Date(paymentDate) : new Date(),
    //   }
    // });

    return {
      success: true,
      data: { updated: true },
    };
  } catch {
    return ErrorFactory.internal('Failed to mark invoice as paid');
  }
}

/**
 * Request invoice regeneration (for correcting errors)
 */
export async function regenerateInvoice(
  invoiceId: string,
  _reason?: string
): Promise<ActionResult<{ regenerated: boolean; newInvoiceId: string }>> {
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

    // Validate invoice ID
    const validationError = validateInvoiceId(invoiceId);
    if (validationError) {
      return ErrorFactory.validation(validationError, 'invoiceId');
    }

    // Verify invoice exists and belongs to user
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return ErrorFactory.notFound('Invoice');
    }

    if (invoice.status === 'paid') {
      return ErrorFactory.validation('Cannot regenerate paid invoices');
    }

    // Simulate regeneration process
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, create new invoice and void old one
    // const newInvoice = await db.invoices.create({
    //   data: {
    //     ...invoice,
    //     id: undefined,
    //     invoiceNumber: generateNewInvoiceNumber(),
    //     regeneratedFrom: invoiceId,
    //     regenerationReason: reason,
    //   }
    // });
    // await db.invoices.update({
    //   where: { id: invoiceId },
    //   data: { status: 'voided', voidedAt: new Date() }
    // });

    const newInvoiceId = `inv-${Date.now()}`;

    return {
      success: true,
      data: {
        regenerated: true,
        newInvoiceId,
      },
    };
  } catch {
    return ErrorFactory.internal('Failed to regenerate invoice');
  }
}

/**
 * Get invoices by date range
 */
export async function getInvoicesByDateRange(
  startDate: string,
  endDate: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResult<Invoice[]>> {
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

    // Validate pagination
    const validationError = validatePagination(limit, offset);
    if (validationError) {
      return ErrorFactory.validation(validationError);
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return ErrorFactory.validation('Invalid date format');
    }

    if (start >= end) {
      return ErrorFactory.validation('Start date must be before end date');
    }

    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 150));

    // In production, query database with date range
    // const invoices = await db.invoices.findMany({
    //   where: {
    //     userId,
    //     date: {
    //       gte: start,
    //       lte: end,
    //     }
    //   },
    //   take: limit,
    //   skip: offset,
    //   orderBy: { date: 'desc' }
    // });

    // Filter mock data by date range
    const filteredInvoices = mockInvoices
      .filter(inv => {
        const invDate = new Date(inv.date);
        return invDate >= start && invDate <= end;
      })
      .slice(offset, offset + limit) as Invoice[];

    return {
      success: true,
      data: filteredInvoices,
    };
  } catch {
    return ErrorFactory.internal('Failed to get invoices by date range');
  }
}
