import { NextRequest, NextResponse } from "next/server";
import {
  getCompanyBilling,
  createCompanyBilling,
  updateCompanyBilling,
} from "@/lib/actions/billing";
import { CompanyBillingFormSchema } from "@/types/billing";

interface UpdateBillingRequest {
  billingId: string | number;
  [key: string]: unknown;
}

/**
 * Billing API Endpoints - Secure OLTP Operations
 * 
 * This API provides secure endpoints for billing CRUD operations following
 * the OLTP-first pattern with proper authentication and security boundaries.
 * 
 * Security Features:
 * - NileDB authentication required for all operations
 * - Tenant isolation enforced at database level
 * - Input validation using Zod schemas
 * - Audit trail for all operations
 * - No sensitive payment data exposed in responses
 */

// GET /api/billing - Get company billing information
export async function GET(_request: NextRequest) {
  try {
    // Authentication is handled within the action
    const result = await getCompanyBilling();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.code === "AUTH_REQUIRED" ? 401 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("GET /api/billing error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/billing - Create company billing account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = CompanyBillingFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          code: "VALIDATION_ERROR",
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    // Create billing account
    const result = await createCompanyBilling(validationResult.data);
    
    if (!result.success) {
      const statusCode = result.code === "AUTH_REQUIRED" ? 401 :
                        result.code === "BILLING_EXISTS" ? 409 : 400;
      
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
    console.error("POST /api/billing error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// PUT /api/billing - Update company billing information
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateBillingRequest = await request.json();
    const { billingId, ...updateData } = body;
    
    if (!billingId) {
      return NextResponse.json(
        { error: "Billing ID is required", code: "BILLING_ID_REQUIRED" },
        { status: 400 }
      );
    }

    // Validate update data (partial validation)
    const validationResult = CompanyBillingFormSchema.partial().safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          code: "VALIDATION_ERROR",
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    // Update billing account
    const result = await updateCompanyBilling(billingId, validationResult.data);
    
    if (!result.success) {
      const statusCode = result.code === "AUTH_REQUIRED" ? 401 :
                        result.code === "BILLING_NOT_FOUND" ? 404 : 400;
      
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("PUT /api/billing error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
