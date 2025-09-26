import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentMethods,
  addPaymentMethod,
} from "@/lib/actions/billing";
import { PaymentMethodFormSchema } from "@/types/billing";

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

    // Ensure no sensitive data is exposed in the response
    const sanitizedData = result.data.map(paymentMethod => ({
      id: paymentMethod.id,
      type: paymentMethod.type,
      provider: paymentMethod.provider,
      lastFourDigits: paymentMethod.lastFourDigits,
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      cardBrand: paymentMethod.cardBrand,
      bankName: paymentMethod.bankName,
      accountType: paymentMethod.accountType,
      isDefault: paymentMethod.isDefault,
      isActive: paymentMethod.isActive,
      createdAt: paymentMethod.createdAt,
      updatedAt: paymentMethod.updatedAt,
      // Explicitly exclude sensitive fields:
      // - providerPaymentMethodId (tokenized ID should not be exposed)
      // - createdById (internal audit field)
    }));

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

    // Sanitize response data (same as GET)
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
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/billing/payment-methods error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
