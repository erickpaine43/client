"use server";

import { nile } from "@/app/api/[...nile]/nile";
import {
  PaymentMethod,
  PaymentMethodFormData,
  PaymentMethodResponse,
  PaymentMethodListResponse,
  PaymentMethodType,
  PaymentProvider,
  CardBrand,
  PaymentMethodFormSchema,
} from "@/types/billing";

// ============================================================================
// PAYMENT METHOD OLTP OPERATIONS
// ============================================================================

/**
 * Get payment methods for a company
 * Follows OLTP-first pattern: NileDB auth → OLTP data retrieval → fast response
 */
export async function getPaymentMethods(
  companyId?: number
): Promise<PaymentMethodListResponse> {
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
        type,
        provider,
        provider_payment_method_id,
        last_four_digits,
        expiry_month,
        expiry_year,
        card_brand,
        bank_name,
        account_type,
        is_default,
        is_active,
        created_at,
        updated_at,
        created_by_id
      FROM payment_methods 
      WHERE company_id = $1 
        AND tenant_id = CURRENT_TENANT_ID()
        AND is_active = true
      ORDER BY is_default DESC, created_at DESC
    `, [effectiveCompanyId]);

    // 4. Transform database results to PaymentMethod interfaces
    const paymentMethods: PaymentMethod[] = result.map((row: Record<string, unknown>) => ({
      id: row.id,
      companyId: row.company_id,
      type: row.type as PaymentMethodType,
      provider: row.provider as PaymentProvider,
      providerPaymentMethodId: row.provider_payment_method_id,
      lastFourDigits: row.last_four_digits,
      expiryMonth: row.expiry_month,
      expiryYear: row.expiry_year,
      cardBrand: row.card_brand as CardBrand,
      bankName: row.bank_name,
      accountType: row.account_type,
      isDefault: row.is_default,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdById: row.created_by_id,
    }));

    return {
      success: true,
      data: paymentMethods,
    };
  } catch (error) {
    console.error("getPaymentMethods error:", error);
    return {
      success: false,
      error: "Failed to retrieve payment methods",
      code: "PAYMENT_METHODS_FETCH_ERROR",
    };
  }
}

/**
 * Get a specific payment method
 * Follows OLTP-first pattern with security validation
 */
export async function getPaymentMethod(
  paymentMethodId: string | number
): Promise<PaymentMethodResponse> {
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

    // 2. OLTP data retrieval with tenant isolation
    const result = await nile.db.query(`
      SELECT 
        id,
        company_id,
        type,
        provider,
        provider_payment_method_id,
        last_four_digits,
        expiry_month,
        expiry_year,
        card_brand,
        bank_name,
        account_type,
        is_default,
        is_active,
        created_at,
        updated_at,
        created_by_id
      FROM payment_methods 
      WHERE id = $1 
        AND company_id = $2
        AND tenant_id = CURRENT_TENANT_ID()
    `, [paymentMethodId, companyId]);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Payment method not found",
        code: "PAYMENT_METHOD_NOT_FOUND",
      };
    }

    const row = result[0];
    const paymentMethod: PaymentMethod = {
      id: row.id,
      companyId: row.company_id,
      type: row.type as PaymentMethodType,
      provider: row.provider as PaymentProvider,
      providerPaymentMethodId: row.provider_payment_method_id,
      lastFourDigits: row.last_four_digits,
      expiryMonth: row.expiry_month,
      expiryYear: row.expiry_year,
      cardBrand: row.card_brand as CardBrand,
      bankName: row.bank_name,
      accountType: row.account_type,
      isDefault: row.is_default,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdById: row.created_by_id,
    };

    return {
      success: true,
      data: paymentMethod,
    };
  } catch (error) {
    console.error("getPaymentMethod error:", error);
    return {
      success: false,
      error: "Failed to retrieve payment method",
      code: "PAYMENT_METHOD_FETCH_ERROR",
    };
  }
}

/**
 * Add a new payment method
 * Follows OLTP-first pattern: NileDB auth → OLTP creation → success response
 * 
 * Note: In production, this would integrate with payment processors (Stripe, etc.)
 * for secure tokenization before storing in the database.
 */
export async function addPaymentMethod(
  formData: PaymentMethodFormData,
  providerPaymentMethodId: string // This would come from Stripe/payment processor
): Promise<PaymentMethodResponse> {
  try {
    // 1. Validate input data
    const validationResult = PaymentMethodFormSchema.safeParse(formData);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid payment method information",
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

    // 3. If this is set as default, unset other default payment methods
    if (validationResult.data.isDefault) {
      await nile.db.query(`
        UPDATE payment_methods 
        SET is_default = false, updated_at = CURRENT_TIMESTAMP
        WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
      `, [companyId]);
    }

    // 4. Determine card brand and extract safe information
    let cardBrand: CardBrand = CardBrand.UNKNOWN;
    let lastFourDigits = '';
    let expiryMonth: number | null = null;
    let expiryYear: number | null = null;

    if (validationResult.data.type === PaymentMethodType.CREDIT_CARD) {
      // In production, this information would come from the payment processor
      // after tokenization, not from the raw form data
      lastFourDigits = validationResult.data.cardNumber?.slice(-4) || '';
      expiryMonth = validationResult.data.expiryMonth || null;
      expiryYear = validationResult.data.expiryYear || null;
      
      // Determine card brand from card number (simplified logic)
      if (validationResult.data.cardNumber) {
        const firstDigit = validationResult.data.cardNumber.charAt(0);
        if (firstDigit === '4') cardBrand = CardBrand.VISA;
        else if (firstDigit === '5') cardBrand = CardBrand.MASTERCARD;
        else if (firstDigit === '3') cardBrand = CardBrand.AMERICAN_EXPRESS;
        // Add more brand detection logic as needed
      }
    }

    // 5. OLTP operation: Create payment method in NileDB
    const result = await nile.db.query(`
      INSERT INTO payment_methods (
        company_id,
        type,
        provider,
        provider_payment_method_id,
        last_four_digits,
        expiry_month,
        expiry_year,
        card_brand,
        bank_name,
        account_type,
        is_default,
        is_active,
        created_by_id,
        tenant_id,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TENANT_ID(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id
    `, [
      companyId,
      validationResult.data.type,
      PaymentProvider.STRIPE, // Default to Stripe for now
      providerPaymentMethodId,
      lastFourDigits,
      expiryMonth,
      expiryYear,
      cardBrand,
      null, // bank_name - would be populated for bank accounts
      validationResult.data.accountType || null,
      validationResult.data.isDefault,
      true, // is_active
      user.id,
    ]);

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Failed to add payment method",
        code: "PAYMENT_METHOD_CREATE_ERROR",
      };
    }

    // 6. Get the created payment method
    const createdPaymentMethod = await getPaymentMethod(result[0].id);
    if (!createdPaymentMethod.success) {
      return {
        success: false,
        error: "Failed to retrieve created payment method",
        code: "PAYMENT_METHOD_RETRIEVE_ERROR",
      };
    }

    // 7. Background: Update billing analytics (non-blocking)
    try {
      await updatePaymentMethodAnalytics(companyId, createdPaymentMethod.data);
    } catch (analyticsError) {
      console.warn("Failed to update payment method analytics:", analyticsError);
    }

    return {
      success: true,
      data: createdPaymentMethod.data,
    };
  } catch (error) {
    console.error("addPaymentMethod error:", error);
    return {
      success: false,
      error: "Failed to add payment method",
      code: "PAYMENT_METHOD_CREATE_ERROR",
    };
  }
}

/**
 * Set default payment method
 * Follows OLTP-first pattern with atomic updates
 */
export async function setDefaultPaymentMethod(
  paymentMethodId: string | number
): Promise<PaymentMethodResponse> {
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

    // 2. Verify payment method exists and belongs to company
    const existingPaymentMethod = await getPaymentMethod(paymentMethodId);
    if (!existingPaymentMethod.success) {
      return {
        success: false,
        error: "Payment method not found",
        code: "PAYMENT_METHOD_NOT_FOUND",
      };
    }

    // 3. OLTP operation: Atomic update to set new default
    await nile.db.query('BEGIN');

    try {
      // Unset all default payment methods for the company
      await nile.db.query(`
        UPDATE payment_methods 
        SET is_default = false, updated_at = CURRENT_TIMESTAMP
        WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
      `, [companyId]);

      // Set the specified payment method as default
      await nile.db.query(`
        UPDATE payment_methods 
        SET is_default = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND company_id = $2 AND tenant_id = CURRENT_TENANT_ID()
      `, [paymentMethodId, companyId]);

      await nile.db.query('COMMIT');
    } catch (transactionError) {
      await nile.db.query('ROLLBACK');
      throw transactionError;
    }

    // 4. Get updated payment method
    const updatedPaymentMethod = await getPaymentMethod(paymentMethodId);
    if (!updatedPaymentMethod.success) {
      return {
        success: false,
        error: "Failed to retrieve updated payment method",
        code: "PAYMENT_METHOD_RETRIEVE_ERROR",
      };
    }

    // 5. Background: Update billing analytics
    try {
      await updatePaymentMethodAnalytics(companyId, updatedPaymentMethod.data);
    } catch (analyticsError) {
      console.warn("Failed to update payment method analytics:", analyticsError);
    }

    return {
      success: true,
      data: updatedPaymentMethod.data,
    };
  } catch (error) {
    console.error("setDefaultPaymentMethod error:", error);
    return {
      success: false,
      error: "Failed to set default payment method",
      code: "PAYMENT_METHOD_UPDATE_ERROR",
    };
  }
}

/**
 * Remove (deactivate) a payment method
 * Follows OLTP-first pattern with soft deletion
 */
export async function removePaymentMethod(
  paymentMethodId: string | number
): Promise<PaymentMethodResponse> {
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

    // 2. Verify payment method exists and belongs to company
    const existingPaymentMethod = await getPaymentMethod(paymentMethodId);
    if (!existingPaymentMethod.success) {
      return {
        success: false,
        error: "Payment method not found",
        code: "PAYMENT_METHOD_NOT_FOUND",
      };
    }

    // 3. Check if this is the only payment method
    const allPaymentMethods = await getPaymentMethods(companyId);
    if (allPaymentMethods.success && allPaymentMethods.data.length === 1) {
      return {
        success: false,
        error: "Cannot remove the only payment method",
        code: "LAST_PAYMENT_METHOD",
      };
    }

    // 4. OLTP operation: Soft delete (deactivate) payment method
    await nile.db.query(`
      UPDATE payment_methods 
      SET is_active = false, is_default = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND company_id = $2 AND tenant_id = CURRENT_TENANT_ID()
    `, [paymentMethodId, companyId]);

    // 5. If this was the default, set another payment method as default
    if (existingPaymentMethod.data.isDefault && allPaymentMethods.success) {
      const remainingMethods = allPaymentMethods.data.filter(
        pm => pm.id !== paymentMethodId && pm.isActive
      );
      
      if (remainingMethods.length > 0) {
        await setDefaultPaymentMethod(remainingMethods[0].id);
      }
    }

    // 6. Background: Update billing analytics
    try {
      await updatePaymentMethodAnalytics(companyId, existingPaymentMethod.data);
    } catch (analyticsError) {
      console.warn("Failed to update payment method analytics:", analyticsError);
    }

    return {
      success: true,
      data: { ...existingPaymentMethod.data, isActive: false },
    };
  } catch (error) {
    console.error("removePaymentMethod error:", error);
    return {
      success: false,
      error: "Failed to remove payment method",
      code: "PAYMENT_METHOD_REMOVE_ERROR",
    };
  }
}

// ============================================================================
// BACKGROUND ANALYTICS OPERATIONS (NON-BLOCKING)
// ============================================================================

/**
 * Update payment method information
 * Follows OLTP-first pattern
 */
export async function updatePaymentMethod(
  paymentMethodId: string | number,
  updates: Partial<PaymentMethodFormData>
): Promise<PaymentMethodResponse> {
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

    // 2. Verify payment method exists and belongs to company
    const existingPaymentMethod = await getPaymentMethod(paymentMethodId);
    if (!existingPaymentMethod.success) {
      return {
        success: false,
        error: "Payment method not found",
        code: "PAYMENT_METHOD_NOT_FOUND",
      };
    }

    // 3. Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    let paramIndex = 1;

    // Handle different update types
    if (updates.isDefault !== undefined) {
      // If setting as default, unset other defaults first
      if (updates.isDefault) {
        await nile.db.query(`
          UPDATE payment_methods
          SET is_default = false, updated_at = CURRENT_TIMESTAMP
          WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
        `, [companyId]);
      }
      updateFields.push(`is_default = $${paramIndex++}`);
      updateValues.push(updates.isDefault);
    }

    if (updates.expiryMonth !== undefined) {
      updateFields.push(`expiry_month = $${paramIndex++}`);
      updateValues.push(updates.expiryMonth);
    }

    if (updates.expiryYear !== undefined) {
      updateFields.push(`expiry_year = $${paramIndex++}`);
      updateValues.push(updates.expiryYear);
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
    updateValues.push(paymentMethodId, companyId);

    // 4. OLTP operation: Update payment method
    const updateQuery = `
      UPDATE payment_methods
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++} AND company_id = $${paramIndex++} AND tenant_id = CURRENT_TENANT_ID()
    `;

    await nile.db.query(updateQuery, updateValues);

    // 5. Get updated payment method
    const updatedPaymentMethod = await getPaymentMethod(paymentMethodId);
    if (!updatedPaymentMethod.success) {
      return {
        success: false,
        error: "Failed to retrieve updated payment method",
        code: "PAYMENT_METHOD_RETRIEVE_ERROR",
      };
    }

    return {
      success: true,
      data: updatedPaymentMethod.data,
    };
  } catch (error) {
    console.error("updatePaymentMethod error:", error);
    return {
      success: false,
      error: "Failed to update payment method",
      code: "PAYMENT_METHOD_UPDATE_ERROR",
    };
  }
}

/**
 * Verify payment method (e.g., for reactivation or validation)
 * Follows OLTP-first pattern
 */
export async function verifyPaymentMethod(
  paymentMethodId: string | number
): Promise<PaymentMethodResponse> {
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

    // 2. Get payment method
    const paymentMethodResult = await getPaymentMethod(paymentMethodId);
    if (!paymentMethodResult.success) {
      return paymentMethodResult;
    }

    // 3. In production, this would verify with payment processor
    // For now, just return the payment method as "verified"

    return {
      success: true,
      data: paymentMethodResult.data,
    };
  } catch (error) {
    console.error("verifyPaymentMethod error:", error);
    return {
      success: false,
      error: "Failed to verify payment method",
      code: "PAYMENT_METHOD_VERIFY_ERROR",
    };
  }
}

/**
 * Update payment method analytics in Convex (background operation)
 * This is called after successful OLTP payment method operations
 */
async function updatePaymentMethodAnalytics(
  companyId: number,
  _paymentMethodData: PaymentMethod
): Promise<void> {
  // TODO: Implement Convex analytics update
  // This will update payment method analytics based on OLTP changes
  console.log(`Updating payment method analytics for company ${companyId}`);

  // Example of what this would do:
  // 1. Update payment method count in analytics
  // 2. Update default payment method information
  // 3. Track payment method changes for audit
  // 4. Update billing dashboard metrics
}
