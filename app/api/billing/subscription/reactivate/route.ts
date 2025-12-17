import { NextRequest, NextResponse } from "next/server";
import {
  reactivateSubscription,
} from "@/lib/actions/billing";

/**
 * Subscription Reactivation API Endpoint - Secure OLTP Operations
 * 
 * This API provides a dedicated endpoint for subscription reactivation
 * following the OLTP-first pattern with proper authentication.
 */

// POST /api/billing/subscription/reactivate - Reactivate cancelled subscription
export async function POST(_request: NextRequest) {
  try {
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
  } catch (error) {
    console.error("POST /api/billing/subscription/reactivate error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
