"use server";

import { nile } from "@/app/api/[...nile]/nile";
import {
  SubscriptionPlan,
  SubscriptionPlanResponse,
  SubscriptionPlanListResponse,
  PlanComparison,
  SubscriptionPlanSchema,
} from "@/types/billing";

// ============================================================================
// SUBSCRIPTION PLAN OLTP OPERATIONS
// ============================================================================

/**
 * Get all active subscription plans
 * Follows OLTP-first pattern: NileDB auth → OLTP data retrieval → fast response
 */
export async function getSubscriptionPlans(
  includeInactive = false
): Promise<SubscriptionPlanListResponse> {
  try {
    // 1. Authentication via NileDB (optional for public plans)
    const user = await nile.users.getSelf();
    const isAuthenticated = !(user instanceof Response);

    // 2. Build query based on authentication and parameters
    let whereClause = "WHERE is_public = true";
    const queryParams: unknown[] = [];

    if (isAuthenticated) {
      // Authenticated users can see all plans
      whereClause = "WHERE 1=1";
    }

    if (!includeInactive) {
      whereClause += " AND is_active = true";
    }

    // 3. OLTP data retrieval from NileDB
    const result = await nile.db.query(`
      SELECT 
        id,
        name,
        description,
        emails_limit,
        domains_limit,
        mailboxes_limit,
        storage_limit,
        users_limit,
        monthly_price,
        yearly_price,
        quarterly_price,
        currency,
        features,
        is_active,
        is_public,
        sort_order,
        created_at,
        updated_at
      FROM subscription_plans 
      ${whereClause}
      ORDER BY sort_order ASC, monthly_price ASC
    `, queryParams);

    // 4. Transform database results to SubscriptionPlan interfaces
    const subscriptionPlans: SubscriptionPlan[] = result.map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      emailsLimit: row.emails_limit,
      domainsLimit: row.domains_limit,
      mailboxesLimit: row.mailboxes_limit,
      storageLimit: row.storage_limit,
      usersLimit: row.users_limit,
      monthlyPrice: row.monthly_price,
      yearlyPrice: row.yearly_price,
      quarterlyPrice: row.quarterly_price,
      currency: row.currency,
      features: JSON.parse((row.features as string) || '[]'),
      isActive: row.is_active,
      isPublic: row.is_public,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return {
      success: true,
      data: subscriptionPlans,
    };
  } catch (error) {
    console.error("getSubscriptionPlans error:", error);
    return {
      success: false,
      error: "Failed to retrieve subscription plans",
      code: "PLANS_FETCH_ERROR",
    };
  }
}

/**
 * Get a specific subscription plan
 * Follows OLTP-first pattern with public access for plan details
 */
export async function getSubscriptionPlan(
  planId: string | number
): Promise<SubscriptionPlanResponse> {
  try {
    // 1. OLTP data retrieval from NileDB
    const result = await nile.db.query(`
      SELECT 
        id,
        name,
        description,
        emails_limit,
        domains_limit,
        mailboxes_limit,
        storage_limit,
        users_limit,
        monthly_price,
        yearly_price,
        quarterly_price,
        currency,
        features,
        is_active,
        is_public,
        sort_order,
        created_at,
        updated_at
      FROM subscription_plans 
      WHERE id = $1 AND is_active = true
    `, [planId]);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Subscription plan not found",
        code: "PLAN_NOT_FOUND",
      };
    }

    const row = result[0];
    const subscriptionPlan: SubscriptionPlan = {
      id: row.id,
      name: row.name,
      description: row.description,
      emailsLimit: row.emails_limit,
      domainsLimit: row.domains_limit,
      mailboxesLimit: row.mailboxes_limit,
      storageLimit: row.storage_limit,
      usersLimit: row.users_limit,
      monthlyPrice: row.monthly_price,
      yearlyPrice: row.yearly_price,
      quarterlyPrice: row.quarterly_price,
      currency: row.currency,
      features: JSON.parse(row.features || '[]'),
      isActive: row.is_active,
      isPublic: row.is_public,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return {
      success: true,
      data: subscriptionPlan,
    };
  } catch (error) {
    console.error("getSubscriptionPlan error:", error);
    return {
      success: false,
      error: "Failed to retrieve subscription plan",
      code: "PLAN_FETCH_ERROR",
    };
  }
}

/**
 * Get plan comparison data for pricing page
 * Optimized for public display with feature comparison
 */
export async function getPlanComparison(): Promise<{
  success: boolean;
  data?: PlanComparison[];
  error?: string;
  code?: string;
}> {
  try {
    // 1. Get all public, active plans
    const plansResult = await getSubscriptionPlans();
    if (!plansResult.success) {
      return {
        success: false,
        error: plansResult.error,
        code: plansResult.code,
      };
    }

    // 2. Transform to comparison format
    const planComparisons: PlanComparison[] = plansResult.data
      .filter(plan => plan.isPublic)
      .map((plan, index) => ({
        planId: plan.id.toString(),
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        features: plan.features,
        limits: {
          emails: plan.emailsLimit,
          domains: plan.domainsLimit,
          mailboxes: plan.mailboxesLimit,
          storage: plan.storageLimit,
          users: plan.usersLimit,
        },
        // Mark middle plan as recommended (simple logic)
        isRecommended: index === Math.floor(plansResult.data.length / 2),
      }));

    return {
      success: true,
      data: planComparisons,
    };
  } catch (error) {
    console.error("getPlanComparison error:", error);
    return {
      success: false,
      error: "Failed to retrieve plan comparison",
      code: "PLAN_COMPARISON_ERROR",
    };
  }
}

/**
 * Create a new subscription plan (Admin only)
 * Follows OLTP-first pattern with admin authentication
 */
export async function createSubscriptionPlan(
  planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SubscriptionPlanResponse> {
  try {
    // 1. Validate input data
    const validationResult = SubscriptionPlanSchema.safeParse(planData);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid subscription plan data",
        code: "VALIDATION_ERROR",
      };
    }

    // 2. Authentication via NileDB (Admin required)
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    // TODO: Add admin role check
    // if (!isAdmin(user)) {
    //   return {
    //     success: false,
    //     error: "Admin access required",
    //     code: "ADMIN_REQUIRED",
    //   };
    // }

    // 3. OLTP operation: Create subscription plan in NileDB
    const result = await nile.db.query(`
      INSERT INTO subscription_plans (
        name,
        description,
        emails_limit,
        domains_limit,
        mailboxes_limit,
        storage_limit,
        users_limit,
        monthly_price,
        yearly_price,
        quarterly_price,
        currency,
        features,
        is_active,
        is_public,
        sort_order,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id
    `, [
      validationResult.data.name,
      validationResult.data.description,
      validationResult.data.emailsLimit,
      validationResult.data.domainsLimit,
      validationResult.data.mailboxesLimit,
      validationResult.data.storageLimit,
      validationResult.data.usersLimit,
      validationResult.data.monthlyPrice,
      validationResult.data.yearlyPrice,
      validationResult.data.quarterlyPrice,
      validationResult.data.currency,
      JSON.stringify(validationResult.data.features),
      validationResult.data.isActive,
      validationResult.data.isPublic,
      validationResult.data.sortOrder,
    ]);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Failed to create subscription plan",
        code: "PLAN_CREATE_ERROR",
      };
    }

    // 4. Get the created plan
    const createdPlan = await getSubscriptionPlan(result[0].id);
    if (!createdPlan.success) {
      return {
        success: false,
        error: "Failed to retrieve created subscription plan",
        code: "PLAN_RETRIEVE_ERROR",
      };
    }

    return {
      success: true,
      data: createdPlan.data,
    };
  } catch (error) {
    console.error("createSubscriptionPlan error:", error);
    return {
      success: false,
      error: "Failed to create subscription plan",
      code: "PLAN_CREATE_ERROR",
    };
  }
}

/**
 * Update a subscription plan (Admin only)
 * Follows OLTP-first pattern with admin authentication
 */
export async function updateSubscriptionPlan(
  planId: string | number,
  planData: Partial<Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<SubscriptionPlanResponse> {
  try {
    // 1. Authentication via NileDB (Admin required)
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    // TODO: Add admin role check
    // if (!isAdmin(user)) {
    //   return {
    //     success: false,
    //     error: "Admin access required",
    //     code: "ADMIN_REQUIRED",
    //   };
    // }

    // 2. Verify plan exists
    const existingPlan = await getSubscriptionPlan(planId);
    if (!existingPlan.success) {
      return {
        success: false,
        error: "Subscription plan not found",
        code: "PLAN_NOT_FOUND",
      };
    }

    // 3. Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    let paramIndex = 1;

    if (planData.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(planData.name);
    }

    if (planData.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(planData.description);
    }

    if (planData.emailsLimit !== undefined) {
      updateFields.push(`emails_limit = $${paramIndex++}`);
      updateValues.push(planData.emailsLimit);
    }

    if (planData.domainsLimit !== undefined) {
      updateFields.push(`domains_limit = $${paramIndex++}`);
      updateValues.push(planData.domainsLimit);
    }

    if (planData.mailboxesLimit !== undefined) {
      updateFields.push(`mailboxes_limit = $${paramIndex++}`);
      updateValues.push(planData.mailboxesLimit);
    }

    if (planData.storageLimit !== undefined) {
      updateFields.push(`storage_limit = $${paramIndex++}`);
      updateValues.push(planData.storageLimit);
    }

    if (planData.usersLimit !== undefined) {
      updateFields.push(`users_limit = $${paramIndex++}`);
      updateValues.push(planData.usersLimit);
    }

    if (planData.monthlyPrice !== undefined) {
      updateFields.push(`monthly_price = $${paramIndex++}`);
      updateValues.push(planData.monthlyPrice);
    }

    if (planData.yearlyPrice !== undefined) {
      updateFields.push(`yearly_price = $${paramIndex++}`);
      updateValues.push(planData.yearlyPrice);
    }

    if (planData.quarterlyPrice !== undefined) {
      updateFields.push(`quarterly_price = $${paramIndex++}`);
      updateValues.push(planData.quarterlyPrice);
    }

    if (planData.features !== undefined) {
      updateFields.push(`features = $${paramIndex++}`);
      updateValues.push(JSON.stringify(planData.features));
    }

    if (planData.isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateValues.push(planData.isActive);
    }

    if (planData.isPublic !== undefined) {
      updateFields.push(`is_public = $${paramIndex++}`);
      updateValues.push(planData.isPublic);
    }

    if (planData.sortOrder !== undefined) {
      updateFields.push(`sort_order = $${paramIndex++}`);
      updateValues.push(planData.sortOrder);
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        error: "No fields to update",
        code: "NO_UPDATES",
      };
    }

    // Add updated_at field
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause parameter
    updateValues.push(planId);

    // 4. OLTP operation: Update subscription plan in NileDB
    const updateQuery = `
      UPDATE subscription_plans 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++}
    `;

    await nile.db.query(updateQuery, updateValues);

    // 5. Get updated plan
    const updatedPlan = await getSubscriptionPlan(planId);
    if (!updatedPlan.success) {
      return {
        success: false,
        error: "Failed to retrieve updated subscription plan",
        code: "PLAN_RETRIEVE_ERROR",
      };
    }

    return {
      success: true,
      data: updatedPlan.data,
    };
  } catch (error) {
    console.error("updateSubscriptionPlan error:", error);
    return {
      success: false,
      error: "Failed to update subscription plan",
      code: "PLAN_UPDATE_ERROR",
    };
  }
}
