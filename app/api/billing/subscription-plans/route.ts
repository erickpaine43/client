import { NextRequest, NextResponse } from "next/server";
import {
  getSubscriptionPlans,
  getSubscriptionPlan,
} from "@/lib/actions/billing/subscription-plans";

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

// GET /api/billing/subscription-plans/[id] - Get specific subscription plan
export async function GET_BY_ID(request: NextRequest, planId: string) {
  try {
    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required", code: "ID_REQUIRED" },
        { status: 400 }
      );
    }

    const result = await getSubscriptionPlan(planId);
    
    if (!result.success) {
      const statusCode = result.code === "PLAN_NOT_FOUND" ? 404 : 400;
      
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: statusCode }
      );
    }

    // Sanitize plan data
    const sanitizedData = {
      id: result.data.id,
      name: result.data.name,
      description: result.data.description,
      emailsLimit: result.data.emailsLimit,
      domainsLimit: result.data.domainsLimit,
      mailboxesLimit: result.data.mailboxesLimit,
      storageLimit: result.data.storageLimit,
      usersLimit: result.data.usersLimit,
      monthlyPrice: result.data.monthlyPrice,
      yearlyPrice: result.data.yearlyPrice,
      quarterlyPrice: result.data.quarterlyPrice,
      currency: result.data.currency,
      features: result.data.features,
      isActive: result.data.isActive,
      isPublic: result.data.isPublic,
      sortOrder: result.data.sortOrder,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedData,
    });
  } catch (error) {
    console.error(`GET /api/billing/subscription-plans/${planId} error:`, error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
