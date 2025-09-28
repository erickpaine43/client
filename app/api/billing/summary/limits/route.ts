import { NextRequest, NextResponse } from "next/server";
import {
  checkPlanLimits,
} from "@/lib/actions/billing/usage-tracking";

/**
 * Plan Limits API Endpoint - Secure OLTP Operations
 * 
 * This API provides plan limits checking and usage monitoring
 * for billing management and usage alerts.
 */

// GET /api/billing/summary/limits - Check plan limits and usage
export async function GET(_request: NextRequest) {
  try {
    const { nile } = await import("@/app/api/[...nile]/nile");

    // Get user context for company ID
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

    // Check plan limits
    const result = await checkPlanLimits(companyId);
    
    if (!result.success) {
      const statusCode = result.error!.code === "AUTH_REQUIRED" ? 401 :
                        result.error!.code === "BILLING_NOT_FOUND" ? 404 : 400;

      return NextResponse.json(
        { error: result.error, code: result.error!.code },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("GET /api/billing/summary/limits error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
