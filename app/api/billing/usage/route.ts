import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUsageSummary,
} from "@/lib/actions/billing/billing-operations";

/**
 * Usage Tracking API Endpoints - Secure OLTP Operations
 * 
 * This API provides secure endpoints for usage tracking and monitoring
 * following the OLTP-first pattern with proper authentication.
 * 
 * Security Features:
 * - NileDB authentication required for all operations
 * - Tenant isolation enforced at database level
 * - Usage data aggregation from multiple sources
 * - Real-time usage monitoring capabilities
 */

// GET /api/billing/usage - Get current usage summary
export async function GET(_request: NextRequest) {
  try {
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

    // Get current usage summary
    const result = await getCurrentUsageSummary(companyId);
    
    if (!result.success) {
      const statusCode = result.error!.code === "AUTH_REQUIRED" ? 401 :
                        result.error!.code === "BILLING_NOT_FOUND" ? 404 : 500;

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
    console.error("GET /api/billing/usage error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
