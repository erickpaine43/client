"use server";

import { nile } from "@/app/api/[...nile]/nile";
import {
  CompanyBilling,
  CompanyBillingFormData,
  CompanyBillingResponse,
  SubscriptionStatus,
  BillingCycle,
  CompanyBillingFormSchema,
} from "@/types/billing";

// ============================================================================
// COMPANY BILLING OLTP OPERATIONS
// ============================================================================

/**
 * Get company billing information
 * Follows OLTP-first pattern: NileDB auth → OLTP data retrieval → fast response
 */
export async function getCompanyBilling(
  companyId?: number
): Promise<CompanyBillingResponse> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    // 2. Get company ID from user context if not provided
    const effectiveCompanyId = companyId || (user as unknown as { companyId: number }).companyId;
    if (!effectiveCompanyId) {
      return {
        success: false,
        error: "Company ID is required",
        code: "COMPANY_ID_REQUIRED",
      };
    }

    // 3. OLTP data retrieval from NileDB
    const result = await nile.db.query(`
      SELECT 
        id,
        company_id,
        payment_method_id,
        billing_email,
        billing_address,
        subscription_id,
        plan_id,
        billing_cycle,
        subscription_status,
        next_billing_date,
        last_payment_date,
        last_payment_amount,
        currency,
        created_at,
        updated_at,
        created_by_id
      FROM company_billing 
      WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
    `, [effectiveCompanyId]);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Company billing information not found",
        code: "BILLING_NOT_FOUND",
      };
    }

    const billingData = result[0];

    // 4. Transform database result to CompanyBilling interface
    const companyBilling: CompanyBilling = {
      id: billingData.id,
      companyId: billingData.company_id,
      paymentMethodId: billingData.payment_method_id,
      billingEmail: billingData.billing_email,
      billingAddress: JSON.parse(billingData.billing_address || '{}'),
      subscriptionId: billingData.subscription_id,
      planId: billingData.plan_id,
      billingCycle: billingData.billing_cycle as BillingCycle,
      subscriptionStatus: billingData.subscription_status as SubscriptionStatus,
      nextBillingDate: billingData.next_billing_date ? new Date(billingData.next_billing_date) : null,
      lastPaymentDate: billingData.last_payment_date ? new Date(billingData.last_payment_date) : null,
      lastPaymentAmount: billingData.last_payment_amount,
      currency: billingData.currency,
      createdAt: billingData.created_at,
      updatedAt: billingData.updated_at,
      createdById: billingData.created_by_id,
    };

    return {
      success: true,
      data: companyBilling,
    };
  } catch (error) {
    console.error("getCompanyBilling error:", error);
    return {
      success: false,
      error: "Failed to retrieve compabilling information",
      code: "BILLING_FETCH_ERROR",
    };
  }
}

/**
 * Create company billing account
 * Follows OLTP-first pattern: NileDB auth → OLTP creation → success response → background analytics
 */
export async function createCompanyBilling(
  formData: CompanyBillingFormData
): Promise<CompanyBillingResponse> {
  try {
    // 1. Validate input data
    const validationResult = CompanyBillingFormSchema.safeParse(formData);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid billing information",
        code: "VALIDATION_ERROR",
      };
    }

    // 2. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    const companyId = (user as unknown as { companyId: number }).companyId;
    if (!companyId) {
      return {
        success: false,
        error: "Company ID is required",
        code: "COMPANY_ID_REQUIRED",
      };
    }

    // 3. Check if billing account already exists
    const existingBilling = await getCompanyBilling(companyId);
    if (existingBilling.success) {
      return {
        success: false,
        error: "Company billing account already exists",
        code: "BILLING_EXISTS",
      };
    }

    // 4. OLTP operation: Create billing account in NileDB
    const result = await nile.db.query(`
      INSERT INTO company_billing (
        company_id,
        billing_email,
        billing_address,
        plan_id,
        billing_cycle,
        subscription_status,
        currency,
        created_by_id,
        tenant_id,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TENANT_ID(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id
    `, [
      companyId,
      validationResult.data.billingEmail,
      JSON.stringify(validationResult.data.billingAddress),
      validationResult.data.planId,
      validationResult.data.billingCycle,
      SubscriptionStatus.INCOMPLETE, // Initial status
      'USD', // Default currency
      user.id,
    ]);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Failed to create billing account",
        code: "BILLING_CREATE_ERROR",
      };
    }

    // 5. Get the created billing account
    const createdBilling = await getCompanyBilling(companyId);
    if (!createdBilling.success) {
      return {
        success: false,
        error: "Failed to retrieve created billing account",
        code: "BILLING_RETRIEVE_ERROR",
      };
    }

    // 6. Background: Initialize billing analytics (non-blocking)
    // This will be implemented when Convex analytics are set up
    try {
      await initializeBillingAnalytics(companyId, createdBilling.data.id);
    } catch (analyticsError) {
      // Log analytics error but don't fail the main operation
      console.warn("Failed to initialize billing analytics:", analyticsError);
    }

    return {
      success: true,
      data: createdBilling.data,
    };
  } catch (error) {
    console.error("createCompanyBilling error:", error);
    return {
      success: false,
      error: "Failed to create company billing account",
      code: "BILLING_CREATE_ERROR",
    };
  }
}

/**
 * Update company billing information
 * Follows OLTP-first pattern: NileDB auth → OLTP update → success response → background analytics
 */
export async function updateCompanyBilling(
  billingId: string | number,
  formData: Partial<CompanyBillingFormData>
): Promise<CompanyBillingResponse> {
  try {
    // 1. Authentication via NileDB
    const user = await nile.users.getSelf();
    if (user instanceof Response) {
      return {
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      };
    }

    const companyId = (user as unknown as { companyId: number }).companyId;
    if (!companyId) {
      return {
        success: false,
        error: "Company ID is required",
        code: "COMPANY_ID_REQUIRED",
      };
    }

    // 2. Validate that billing account exists and belongs to company
    const existingBilling = await getCompanyBilling(companyId);
    if (!existingBilling.success) {
      return {
        success: false,
        error: "Billing account not found",
        code: "BILLING_NOT_FOUND",
      };
    }

    // 3. Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    let paramIndex = 1;

    if (formData.billingEmail) {
      updateFields.push(`billing_email = $${paramIndex++}`);
      updateValues.push(formData.billingEmail);
    }

    if (formData.billingAddress) {
      updateFields.push(`billing_address = $${paramIndex++}`);
      updateValues.push(JSON.stringify(formData.billingAddress));
    }

    if (formData.planId) {
      updateFields.push(`plan_id = $${paramIndex++}`);
      updateValues.push(formData.planId);
    }

    if (formData.billingCycle) {
      updateFields.push(`billing_cycle = $${paramIndex++}`);
      updateValues.push(formData.billingCycle);
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

    // Add WHERE clause parameters
    updateValues.push(billingId);
    updateValues.push(companyId);

    // 4. OLTP operation: Update billing account in NileDB
    const updateQuery = `
      UPDATE company_billing 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++} 
        AND company_id = $${paramIndex++}
        AND tenant_id = CURRENT_TENANT_ID()
    `;

    await nile.db.query(updateQuery, updateValues);

    // 5. Get updated billing account
    const updatedBilling = await getCompanyBilling(companyId);
    if (!updatedBilling.success) {
      return {
        success: false,
        error: "Failed to retrieve updated billing account",
        code: "BILLING_RETRIEVE_ERROR",
      };
    }

    // 6. Background: Update billing analytics (non-blocking)
    try {
      await updateBillingAnalytics(companyId, updatedBilling.data);
    } catch (analyticsError) {
      console.warn("Failed to update billing analytics:", analyticsError);
    }

    return {
      success: true,
      data: updatedBilling.data,
    };
  } catch (error) {
    console.error("updateCompanyBilling error:", error);
    return {
      success: false,
      error: "Failed to update company billing information",
      code: "BILLING_UPDATE_ERROR",
    };
  }
}

/**
 * Update subscription status
 * Used for webhook processing and subscription management
 */
export async function updateSubscriptionStatus(
  companyId: number,
  subscriptionId: string,
  status: SubscriptionStatus,
  nextBillingDate?: Date
): Promise<CompanyBillingResponse> {
  try {
    // 1. OLTP operation: Update subscription status in NileDB
    const updateValues = [status, companyId, subscriptionId];
    let updateQuery = `
      UPDATE company_billing 
      SET subscription_status = $1, updated_at = CURRENT_TIMESTAMP
    `;

    if (nextBillingDate) {
      updateQuery += `, next_billing_date = $4`;
      updateValues.push(nextBillingDate.toISOString());
    }

    updateQuery += `
      WHERE company_id = $2 
        AND subscription_id = $3
        AND tenant_id = CURRENT_TENANT_ID()
    `;

    await nile.db.query(updateQuery, updateValues);

    // 2. Get updated billing account
    const updatedBilling = await getCompanyBilling(companyId);
    if (!updatedBilling.success) {
      return {
        success: false,
        error: "Failed to retrieve updated billing account",
        code: "BILLING_RETRIEVE_ERROR",
      };
    }

    // 3. Background: Update billing analytics
    try {
      await updateBillingAnalytics(companyId, updatedBilling.data);
    } catch (analyticsError) {
      console.warn("Failed to update billing analytics:", analyticsError);
    }

    return {
      success: true,
      data: updatedBilling.data,
    };
  } catch (error) {
    console.error("updateSubscriptionStatus error:", error);
    return {
      success: false,
      error: "Failed to update subscription status",
      code: "SUBSCRIPTION_UPDATE_ERROR",
    };
  }
}

// ============================================================================
// BACKGROUND ANALYTICS OPERATIONS (NON-BLOCKING)
// ============================================================================

/**
 * Initialize billing analytics in Convex (background operation)
 * This is called after successful OLTP billing account creation
 */
async function initializeBillingAnalytics(
  companyId: number,
  billingId: string | number
): Promise<void> {
  // TODO: Implement Convex analytics initialization
  // This will create initial billing analytics records in Convex
  console.log(`Initializing billing analytics for company ${companyId}, billing ${billingId}`);
  
  // Example of what this would do:
  // 1. Create initial billing analytics record in Convex
  // 2. Set up usage tracking
  // 3. Initialize cost projections
  // 4. Create billing dashboard data
}

/**
 * Update billing analytics in Convex (background operation)
 * This is called after successful OLTP billing updates
 */
async function updateBillingAnalytics(
  companyId: number,
  _billingData: CompanyBilling
): Promise<void> {
  // TODO: Implement Convex analytics update
  // This will update billing analytics based on OLTP changes
  console.log(`Updating billing analytics for company ${companyId}`);
  
  // Example of what this would do:
  // 1. Update plan information in analytics
  // 2. Recalculate usage projections
  // 3. Update billing cycle information
  // 4. Refresh dashboard metrics
}
