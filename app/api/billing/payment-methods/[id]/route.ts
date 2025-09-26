import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentMethod,
  setDefaultPaymentMethod,
  removePaymentMethod,
} from "@/lib/actions/billing";

/**
 * Individual Payment Method API Endpoints - Secure OLTP Operations
 * 
 * This API provides secure endpoints for individual payment method operations
 * with proper authentication and PCI compliance.
 */

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface UpdatePaymentMethodRequest {
  action: "set_default";
}

// GET /api/billing/payment-methods/[id] - Get specific payment method
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Payment method ID is required", code: "ID_REQUIRED" },
        { status: 400 }
      );
    }

    // Authentication is handled within the action
    const result = await getPaymentMethod(id);
    
    if (!result.success) {
      const statusCode = result.code === "AUTH_REQUIRED" ? 401 :
                        result.code === "PAYMENT_METHOD_NOT_FOUND" ? 404 : 400;
      
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    // Sanitize response data to exclude sensitive fields
    const sanitizedData = {
      id: result.data.id,
      type: result.data.type,
      provider: result.data.provider,
      lastFourDigits: result.data.lastFourDigits,
      expiryMonth: result.data.expiryMonth,
      expiryYear: result.data.expiryYear,
      cardBrand: result.data.cardBrand,
      bankName: result.data.bankName,
      accountType: result.data.accountType,
      isDefault: result.data.isDefault,
      isActive: result.data.isActive,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedData,
    });
  } catch (error) {
    console.error(`GET /api/billing/payment-methods/[id] error:`, error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// PUT /api/billing/payment-methods/[id] - Update payment method (set as default)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: UpdatePaymentMethodRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Payment method ID is required", code: "ID_REQUIRED" },
        { status: 400 }
      );
    }

    // Currently only supporting setting as default
    // In the future, this could support updating other non-sensitive fields
    if (body.action === "set_default") {
      const result = await setDefaultPaymentMethod(id);
      
      if (!result.success) {
        const statusCode = result.code === "AUTH_REQUIRED" ? 401 :
                          result.code === "PAYMENT_METHOD_NOT_FOUND" ? 404 : 400;
        
        return NextResponse.json(
          { error: result.error, code: result.code },
          { status: statusCode }
        );
      }

      // Sanitize response data
      const sanitizedData = {
        id: result.data.id,
        type: result.data.type,
        provider: result.data.provider,
        lastFourDigits: result.data.lastFourDigits,
        expiryMonth: result.data.expiryMonth,
        expiryYear: result.data.expiryYear,
        cardBrand: result.data.cardBrand,
        bankName: result.data.bankName,
        accountType: result.data.accountType,
        isDefault: result.data.isDefault,
        isActive: result.data.isActive,
        createdAt: result.data.createdAt,
        updatedAt: result.data.updatedAt,
      };

      return NextResponse.json({
        success: true,
        data: sanitizedData,
      });
    }

    return NextResponse.json(
      { error: "Invalid action", code: "INVALID_ACTION" },
      { status: 400 }
    );
  } catch (error) {
    console.error(`PUT /api/billing/payment-methods/[id] error:`, error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/billing/payment-methods/[id] - Remove payment method
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Payment method ID is required", code: "ID_REQUIRED" },
        { status: 400 }
      );
    }

    // Authentication is handled within the action
    const result = await removePaymentMethod(id);
    
    if (!result.success) {
      const statusCode = result.code === "AUTH_REQUIRED" ? 401 :
                        result.code === "PAYMENT_METHOD_NOT_FOUND" ? 404 :
                        result.code === "LAST_PAYMENT_METHOD" ? 409 : 400;
      
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment method removed successfully",
    });
  } catch (error) {
    console.error(`DELETE /api/billing/payment-methods/[id] error:`, error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
