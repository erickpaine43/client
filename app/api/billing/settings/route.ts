import { NextRequest, NextResponse } from "next/server";
import {
  getBillingDataForSettings,
  updateBillingInfo,
} from "@/lib/actions/billing";

/**
 * Billing Settings API Endpoints - Secure OLTP Operations
 * 
 * This API provides secure endpoints for billing settings management
 * following the OLTP-first pattern with proper authentication and validation.
 * 
 * Security Features:
 * - NileDB authentication required for all operations
 * - Tenant isolation enforced at database level
 * - Input validation for billing address updates
 * - Audit trail for all billing changes
 * - Financial security boundaries maintained
 */

interface UpdateBillingInfoRequest {
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// GET /api/billing/settings - Get billing data for settings page
export async function GET(_request: NextRequest) {
  try {
    // Authentication is handled within the action
    const result = await getBillingDataForSettings();
    
    if (!result.success) {
      // WARNING: Non-null assertion operator (!) used on result.error
      // This can cause runtime errors if result.error is null/undefined
      // Consider using optional chaining: result.error?.type
      const statusCode = result.error!.type === "auth" ? 401 :
                        result.error!.type === "not_found" ? 404 : 500;
      
      return NextResponse.json(
        { error: result.error!.message, code: result.error!.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("GET /api/billing/settings error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// PUT /api/billing/settings - Update billing information
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateBillingInfoRequest = await request.json();
    
    // Validate request body
    if (body.billingAddress) {
      const { street, city, state, zipCode, country } = body.billingAddress;
      if (!street || !city || !state || !zipCode || !country) {
        return NextResponse.json(
          { 
            error: "All billing address fields are required", 
            code: "VALIDATION_ERROR" 
          },
          { status: 400 }
        );
      }

      // Basic validation for required fields
      if (street.length < 5 || city.length < 2 || state.length < 2 || 
          zipCode.length < 3 || country.length < 2) {
        return NextResponse.json(
          { 
            error: "Invalid billing address format", 
            code: "INVALID_ADDRESS_FORMAT" 
          },
          { status: 400 }
        );
      }
    }

    // Update billing information
    const result = await updateBillingInfo(body);
    
    if (!result.success) {
      const statusCode = result.error!.type === "auth" ? 401 :
                        result.error!.type === "validation" ? 400 : 500;
      
      return NextResponse.json(
        { error: result.error!.message, code: result.error!.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Billing information updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/billing/settings error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
