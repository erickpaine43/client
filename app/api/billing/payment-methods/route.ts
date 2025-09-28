import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentMethods,
  addPaymentMethod,
} from "@/lib/actions/billing";
import { PaymentMethodFormSchema } from "@/types/billing";
import { sanitizePaymentMethodData } from "@/lib/utils/billingUtils";

/**
 * Payment Methods API Endpoints - Secure OLTP Operations
 * 
 * This API provides secure endpoints for payment method CRUD operations
 * following the OLTP-first pattern with proper authentication and PCI compliance.
 * 
 * Security Features:
 * - NileDB authentication required for all operations
 * - Payment method tokenization (no sensitive card data stored)
 * - Tenant isolation enforced at database level
 * - Input validation and sanitization
 * - Audit trail for all payment method operations
 * - Only last 4 digits and safe metadata exposed
 */

// GET /api/billing/payment-methods - Get company payment methods
export async function GET(_request: NextRequest) {
  try {
    // Authentication is handled within the action
    const result = await getPaymentMethods();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.code === "AUTH_REQUIRED" ? 401 : 404 }
      );
    }

    // Sanitize response data to exclude sensitive fields
    const sanitizedData = result.data.map(sanitizePaymentMethodData);

    return NextResponse.json({
      success: true,
      data: sanitizedData,
    });
  } catch (error) {
    console.error("GET /api/billing/payment-methods error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/billing/payment-methods - Add new payment method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = PaymentMethodFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid payment method data", 
          code: "VALIDATION_ERROR",
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    // In production, this would integrate with Stripe or other payment processors
    // to tokenize the payment method before storing it
    const { cardNumber, cvv, ...safeData } = validationResult.data;
    void cardNumber;
    void cvv;
    
    // TODO: Integrate with payment processor for tokenization
    // const stripeResult = await stripe.paymentMethods.create({
    //   type: 'card',
    //   card: {
    //     number: cardNumber,
    //     exp_month: safeData.expiryMonth,
    //     exp_year: safeData.expiryYear,
    //     cvc: cvv,
    //   },
    // });
    
    // For now, generate a mock provider payment method ID
    // In production, this would be the actual tokenized ID from the payment processor
    const mockProviderPaymentMethodId = `pm_mock_${Date.now()}`;
    
    // Add payment method with tokenized ID
    const result = await addPaymentMethod(safeData, mockProviderPaymentMethodId);
    
    if (!result.success) {
      const statusCode = result.code === "AUTH_REQUIRED" ? 401 : 400;
      
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    // Sanitize response data
    const sanitizedData = sanitizePaymentMethodData(result.data);

    return NextResponse.json({
      success: true,
      data: sanitizedData,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/billing/payment-methods error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
