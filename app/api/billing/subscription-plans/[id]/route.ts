import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionPlan } from "@/lib/actions/billing/subscription-plans";

/**
 * GET /api/billing/subscription-plans/[id] - Get specific subscription plan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let planId = '';
  try {
    const { id } = await params;
    planId = id;

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
    console.error(`GET /api/billing/subscription-plans/${planId || 'unknown'} error:`, error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
