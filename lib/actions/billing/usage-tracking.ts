"use server";

import { nile } from "@/app/api/[...nile]/nile";
import { UsageSummary } from "@/types/billing";
import { ActionResult } from "@/lib/actions/core/types";
import { getCompanyBilling } from "./company-billing";
import { getSubscriptionPlan } from "./subscription-plans";

/**
 * Get current usage summary for billing calculations
 * This would typically aggregate data from various sources
 */
export async function getCurrentUsageSummary(
  companyId: number
): Promise<ActionResult<UsageSummary>> {
  try {
    // 1. Get current billing period
    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Company billing information not found", code: "BILLING_NOT_FOUND" },
      };
    }

    // 2. Calculate period dates
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    // 3. Get usage data from various sources
    // TODO: In a real implementation, this would query actual usage data
    // For now, we'll return mock data that would be replaced with real queries

    const usageSummary: UsageSummary = {
      companyId,
      periodStart,
      periodEnd,
      emailsSent: await getEmailsSentCount(companyId, periodStart, periodEnd),
      domainsUsed: await getDomainsUsedCount(companyId),
      mailboxesUsed: await getMailboxesUsedCount(companyId),
      storageUsed: await getStorageUsedAmount(companyId), // in GB
      usersCount: await getUsersCount(companyId),
    };

    return {
      success: true,
      data: usageSummary,
    };
  } catch (error) {
    console.error("getCurrentUsageSummary error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to retrieve usage summary" },
    };
  }
}

/**
 * Check if company is within plan limits
 * Returns usage vs limits comparison
 */
export async function checkPlanLimits(
  companyId: number
): Promise<ActionResult<{
  withinLimits: boolean;
  usage: UsageSummary;
  limits: {
    emails: number;
    domains: number;
    mailboxes: number;
    storage: number;
    users: number;
  };
  overages: {
    emails: number;
    domains: number;
    mailboxes: number;
    storage: number;
    users: number;
  };
}>> {
  try {
    // 1. Get current usage
    const usageResult = await getCurrentUsageSummary(companyId);
    if (!usageResult.success) {
      return {
        success: false,
        error: usageResult.error,
      };
    }

    // 2. Get billing information and plan
    const billingResult = await getCompanyBilling(companyId);
    if (!billingResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Company billing information not found", code: "BILLING_NOT_FOUND" },
      };
    }

    const planResult = await getSubscriptionPlan(billingResult.data.planId);
    if (!planResult.success) {
      return {
        success: false,
        error: { type: "not_found", message: "Subscription plan not found", code: "PLAN_NOT_FOUND" },
      };
    }

    // 3. Calculate limits and overages
    const usage = usageResult.data!;
    const plan = planResult.data;

    const limits = {
      emails: plan.emailsLimit,
      domains: plan.domainsLimit,
      mailboxes: plan.mailboxesLimit,
      storage: plan.storageLimit,
      users: plan.usersLimit,
    };

    const overages = {
      emails: Math.max(0, limits.emails === -1 ? 0 : usage.emailsSent - limits.emails),
      domains: Math.max(0, limits.domains === -1 ? 0 : usage.domainsUsed - limits.domains),
      mailboxes: Math.max(0, limits.mailboxes === -1 ? 0 : usage.mailboxesUsed - limits.mailboxes),
      storage: Math.max(0, limits.storage === -1 ? 0 : usage.storageUsed - limits.storage),
      users: Math.max(0, limits.users === -1 ? 0 : usage.usersCount - limits.users),
    };

    const withinLimits = Object.values(overages).every(overage => overage === 0);

    return {
      success: true,
      data: {
        withinLimits,
        usage,
        limits,
        overages,
      },
    };
  } catch (error) {
    console.error("checkPlanLimits error:", error);
    return {
      success: false,
      error: { type: "server", message: "Failed to check plan limits" },
    };
  }
}

// ============================================================================
// USAGE DATA HELPERS
// ============================================================================
// These functions would be replaced with actual data queries in production

async function getEmailsSentCount(
  _companyId: number,
  _periodStart: Date,
  _periodEnd: Date
): Promise<number> {
  // TODO: Query actual email sending data
  // This would typically query campaign analytics or email logs
  return 0;
}

async function getDomainsUsedCount(companyId: number): Promise<number> {
  try {
    const result = await nile.db.query(`
      SELECT COUNT(*) as count
      FROM domains 
      WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
    `, [companyId]);
    
    return result[0]?.count || 0;
  } catch (error) {
    console.warn("Failed to get domains count:", error);
    return 0;
  }
}

async function getMailboxesUsedCount(companyId: number): Promise<number> {
  try {
    const result = await nile.db.query(`
      SELECT COUNT(*) as count
      FROM email_accounts 
      WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
    `, [companyId]);
    
    return result[0]?.count || 0;
  } catch (error) {
    console.warn("Failed to get mailboxes count:", error);
    return 0;
  }
}

async function getStorageUsedAmount(_companyId: number): Promise<number> {
  // TODO: Query actual storage usage
  // This would typically query file storage or email storage data
  return 0;
}

async function getUsersCount(companyId: number): Promise<number> {
  try {
    const result = await nile.db.query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE company_id = $1 AND tenant_id = CURRENT_TENANT_ID()
    `, [companyId]);
    
    return result[0]?.count || 0;
  } catch (error) {
    console.warn("Failed to get users count:", error);
    return 0;
  }
}
