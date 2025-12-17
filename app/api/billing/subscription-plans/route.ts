import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionPlans } from "@/lib/actions/billing/subscription-plans";

/**
 * Subscription Plans API Endpoints - Secure OLTP Operations
 * 
 * This API provides secure endpoints for subscription plan operations.
 * Plans are generally public information but still follow OLTP patterns.
 * 
 * Security Features:
 * - NileDB authentication for plan selection/updates
 * - Input validation and sanitization
 * - Proper error handling and logging
 */

// GET /api/billing/subscription-plans - Get available subscription plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("include_inactive") === "true";
    const publicOnly = searchParams.get("public_only") !== "false"; // Default to true
    void publicOnly;
    
    // Get subscription plans
    const result = await getSubscriptionPlans(includeInactive);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      );
    }

    // Plans are generally safe to expose, but we can still sanitize if needed
    const sanitizedData = result.data.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      emailsLimit: plan.emailsLimit,
      domainsLimit: plan.domainsLimit,
      mailboxesLimit: plan.mailboxesLimit,
      storageLimit: plan.storageLimit,
      usersLimit: plan.usersLimit,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      quarterlyPrice: plan.quarterlyPrice,
      currency: plan.currency,
      features: plan.features,
      isActive: plan.isActive,
      isPublic: plan.isPublic,
      sortOrder: plan.sortOrder,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedData,
    });
  } catch (error) {
    console.error("GET /api/billing/subscription-plans error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

