import { NextRequest, NextResponse } from "next/server";
import {
  updateSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription,
} from "@/lib/actions/billing";

/**
 * Subscription Management API Endpoints - Secure OLTP Operations
 * 
 * This API provides secure endpoints for subscription management operations
 * following the OLTP-first pattern with proper authentication and security boundaries.
 * 
 * Security Features:
 * - NileDB authentication required for all operations
 * - Tenant isolation enforced at database level
 * - Input validation and sanitization
 * - Audit trail for all subscription operations
 * - Financial security boundaries maintained
 */

interface UpdateSubscriptionRequest {
  planId: string;
}

interface CancelSubscriptionRequest {
  reason?: string;
}

// PUT /api/billing/subscription - Update subscription plan
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateSubscriptionRequest = await request.json();
    const { planId } = body;
    
    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required", code: "PLAN_ID_REQUIRED" },
        { status: 400 }
      );
    }

    // Update subscription plan
    const result = await updateSubscriptionPlan(planId);
    
    if (!result.success) {
      const statusCode = result.error!.type === "auth" ? 401 :
                        result.error!.type === "not_found" ? 404 :
                        result.error!.type === "validation" ? 400 : 500;
      
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
    console.error("PUT /api/billing/subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/billing/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const body: CancelSubscriptionRequest = await request.json().catch(() => ({})) as CancelSubscriptionRequest;
    const { reason } = body;

    // Cancel subscription
    const result = await cancelSubscription(reason);
    
    if (!result.success) {
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
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("DELETE /api/billing/subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/billing/subscription/reactivate - Reactivate subscription
export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    
    // Check if this is the reactivate endpoint
    if (pathname.endsWith('/reactivate')) {
      const result = await reactivateSubscription();
      
      if (!result.success) {
        const statusCode = result.error!.type === "auth" ? 401 :
                          result.error!.type === "not_found" ? 404 :
                          result.error!.type === "validation" ? 400 : 500;
        
        return NextResponse.json(
          { error: result.error!.message, code: result.error!.code },
          { status: statusCode }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        message: "Subscription reactivated successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid endpoint", code: "INVALID_ENDPOINT" },
      { status: 404 }
    );
  } catch (error) {
    console.error("POST /api/billing/subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
