import { NextRequest, NextResponse } from "next/server";
import {
  getInvoices,
  generateUsageInvoice,
} from "@/lib/actions/billing/invoices";

/**
 * Invoices API Endpoints - Secure OLTP Operations
 * 
 * This API provides secure endpoints for invoice operations following
 * the OLTP-first pattern with proper authentication and financial security.
 * 
 * Security Features:
 * - NileDB authentication required for all operations
 * - Tenant isolation enforced at database level
 * - Financial audit trail for all invoice operations
 * - Secure handling of financial data
 * - Input validation and sanitization
 */

// GET /api/billing/invoices - Get company invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Authentication is handled within the action
    const result = await getInvoices(
      undefined, // companyId - will be derived from user context
      Math.min(limit, 100), // Cap at 100 for performance
      Math.max(offset, 0)
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.code === "AUTH_REQUIRED" ? 401 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        limit,
        offset,
        total: result.data.length, // BUG: This sets total to current page count, not total available invoices
        // For correct pagination, total should be the total count of ALL available invoices for the user,
        // not just the count of invoices on the current page (which will always be <= limit).
        // This requires a separate query to get the total count from the getInvoices action.
      },
    });
  } catch (error) {
    console.error("GET /api/billing/invoices error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/billing/invoices - Generate new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { periodStart, periodEnd, invoiceType = "usage" } = body as {
      periodStart: string;
      periodEnd: string;
      invoiceType?: string;
    };
    
    // Validate required fields
    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { 
          error: "Period start and end dates are required", 
          code: "VALIDATION_ERROR" 
        },
        { status: 400 }
      );
    }

    // Validate date format
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { 
          error: "Invalid date format", 
          code: "INVALID_DATE_FORMAT" 
        },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { 
          error: "Period start must be before period end", 
          code: "INVALID_DATE_RANGE" 
        },
        { status: 400 }
      );
    }

    // Get user context for company ID
    const { nile } = await import("@/app/api/[...nile]/nile");
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const companyId = (user as unknown as { companyId: number }).companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required", code: "COMPANY_ID_REQUIRED" },
        { status: 400 }
      );
    }

    // Generate invoice based on type
    let result;
    if (invoiceType === "usage") {
      result = await generateUsageInvoice(companyId, startDate, endDate);
    } else {
      return NextResponse.json(
        { 
          error: "Unsupported invoice type", 
          code: "UNSUPPORTED_INVOICE_TYPE" 
        },
        { status: 400 }
      );
    }
    
    if (!result.success) {
      const statusCode = result.code === "AUTH_REQUIRED" ? 401 : 400;
      
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/billing/invoices error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
