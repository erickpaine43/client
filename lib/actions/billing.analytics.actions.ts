"use server";

// ============================================================================
// BILLING ANALYTICS SERVER ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/billing-analytics.ts
//
// Migration notes:
// - All functions now use ConvexQueryHelper for consistent error handling
// - Standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved type safety and performance monitoring

import {
  getBillingAnalytics,
  getPlanUtilization,
  getBillingTimeSeries,
  exportBillingAnalytics,
  getBillingAnalyticsHealth,
  type PlanUtilization
} from './analytics/billing-analytics';

// Re-export all functions for backward compatibility
export {
  getBillingAnalytics,
  getPlanUtilization,
  getBillingTimeSeries,
  exportBillingAnalytics,
  getBillingAnalyticsHealth,
  type PlanUtilization
};

// Legacy imports for backward compatibility
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import {
  AnalyticsFilters,
  FilteredDataset,
  DataGranularity
} from "@/types/analytics/core";
import { BillingAnalytics } from "@/types/analytics/domain-specific";
import { ConvexMigrationUtils, LegacyBillingData } from "@/lib/utils/convex-migration";
import { AnalyticsError, AnalyticsErrorType } from "@/lib/services/analytics/BaseAnalyticsService";

/**
 * Usage metrics interface for billing analytics.
 */
export interface UsageMetrics {
  emailsSent: number;
  emailsRemaining: number;
  domainsUsed: number;
  domainsLimit: number;
  mailboxesUsed: number;
  mailboxesLimit: number;
  usagePercentages: {
    emails: number;
    domains: number;
    mailboxes: number;
  };
}

/**
 * Cost analytics interface for billing tracking.
 */
export interface CostAnalytics {
  totalCost: number;
  averageDailyCost: number;
  projectedMonthlyCost: number;
  costTrend: "increasing" | "decreasing" | "stable";
  currency: string;
  periodStart: string;
  periodEnd: string;
  trendPercentage: number;
}

/**
 * Plan utilization interface for billing analytics.
 */
export interface PlanUtilizationData {
  planType: string;
  utilizationPercentages: {
    emails: number;
    domains: number;
    mailboxes: number;
    overall: number;
  };
  recommendations: string[];
  isOverLimit: boolean;
  daysUntilReset?: number;
}

/**
 * Usage limit alert interface.
 */
export interface UsageLimitAlert {
  type: "warning" | "critical";
  resource: "emails" | "domains" | "mailboxes";
  message: string;
  usage: number;
  limit: number;
  percentage: number;
}

/**
 * Billing analytics time series data point.
 */
export interface BillingTimeSeriesDataPoint {
  date: string;
  label: string;
  usage: {
    emailsSent: number;
    emailsRemaining: number;
    domainsUsed: number;
    mailboxesUsed: number;
  };
  costs: {
    currentPeriod: number;
    projectedCost: number;
    currency: string;
  };
  planType: string;
}

/**
 * Get current usage metrics for a company.
 */
export async function getCurrentUsageMetrics(companyId: string): Promise<UsageMetrics> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const currentUsage = await convex.query(api.billingAnalytics.getCurrentUsageMetrics, {
      companyId,
    });

    // Normalize data format - convex may return different structures
    const usageData = ('usage' in currentUsage) ? currentUsage.usage : currentUsage;

    // Calculate usage percentages
    const emailsPercentage = usageData.emailsRemaining === -1
      ? 0 // Unlimited
      : Math.round((usageData.emailsSent / (usageData.emailsSent + usageData.emailsRemaining)) * 100);

    const domainsPercentage = usageData.domainsLimit === 0
      ? 0 // Unlimited
      : Math.round((usageData.domainsUsed / usageData.domainsLimit) * 100);

    const mailboxesPercentage = usageData.mailboxesLimit === 0
      ? 0 // Unlimited
      : Math.round((usageData.mailboxesUsed / usageData.mailboxesLimit) * 100);

    return {
      emailsSent: usageData.emailsSent,
      emailsRemaining: usageData.emailsRemaining,
      domainsUsed: usageData.domainsUsed,
      domainsLimit: usageData.domainsLimit,
      mailboxesUsed: usageData.mailboxesUsed,
      mailboxesLimit: usageData.mailboxesLimit,
      usagePercentages: {
        emails: emailsPercentage,
        domains: domainsPercentage,
        mailboxes: mailboxesPercentage,
      },
    };
  } catch (error) {
    console.error("Error getting current usage metrics:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get usage metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Get cost analytics and projections for a company.
 */
export async function getCostAnalytics(
  companyId: string,
  filters: AnalyticsFilters
): Promise<CostAnalytics> {
  try {
    const costData = await convex.query(api.billingAnalytics.getCostAnalytics, {
      companyId,
      dateRange: filters.dateRange || { start: '', end: '' },
    });

    return costData;
  } catch (error) {
    console.error("Error getting cost analytics:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get cost analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Get plan utilization data for a company.
 */
export async function getPlanUtilizationData(companyId: string): Promise<PlanUtilizationData> {
  try {
    const currentUsage = await convex.query(api.billingAnalytics.getCurrentUsageMetrics, {
      companyId,
    });

    // Calculate utilization percentages
    const emailsUtilization = currentUsage.usage.emailsRemaining === -1 
      ? 0 // Unlimited
      : Math.round((currentUsage.usage.emailsSent / (currentUsage.usage.emailsSent + currentUsage.usage.emailsRemaining)) * 100);
    
    const domainsUtilization = currentUsage.usage.domainsLimit === 0 
      ? 0 // Unlimited
      : Math.round((currentUsage.usage.domainsUsed / currentUsage.usage.domainsLimit) * 100);
    
    const mailboxesUtilization = currentUsage.usage.mailboxesLimit === 0 
      ? 0 // Unlimited
      : Math.round((currentUsage.usage.mailboxesUsed / currentUsage.usage.mailboxesLimit) * 100);

    // Calculate overall utilization (average of non-unlimited resources)
    const utilizationValues = [];
    if (currentUsage.usage.emailsRemaining !== -1) utilizationValues.push(emailsUtilization);
    if (currentUsage.usage.domainsLimit > 0) utilizationValues.push(domainsUtilization);
    if (currentUsage.usage.mailboxesLimit > 0) utilizationValues.push(mailboxesUtilization);
    
    const overallUtilization = utilizationValues.length > 0 
      ? Math.round(utilizationValues.reduce((sum, val) => sum + val, 0) / utilizationValues.length)
      : 0;

    // Generate recommendations
    const recommendations: string[] = [];
    if (emailsUtilization > 80) {
      recommendations.push("Consider upgrading your plan for more email quota");
    }
    if (domainsUtilization > 80) {
      recommendations.push("You're approaching your domain limit");
    }
    if (mailboxesUtilization > 80) {
      recommendations.push("Consider adding more mailbox capacity");
    }
    if (overallUtilization < 30) {
      recommendations.push("You might benefit from a lower-tier plan");
    }

    // Check if over any limits
    const isOverLimit = emailsUtilization >= 100 || domainsUtilization >= 100 || mailboxesUtilization >= 100;

    return {
      planType: currentUsage.planType,
      utilizationPercentages: {
        emails: emailsUtilization,
        domains: domainsUtilization,
        mailboxes: mailboxesUtilization,
        overall: overallUtilization,
      },
      recommendations,
      isOverLimit,
    };
  } catch (error) {
    console.error("Error getting plan utilization data:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get plan utilization: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Get usage limit alerts for a company.
 */
export async function getUsageLimitAlerts(
  companyId: string,
  thresholds?: {
    emailsWarning?: number;
    emailsCritical?: number;
    domainsWarning?: number;
    mailboxesWarning?: number;
  }
): Promise<{
  alerts: UsageLimitAlert[];
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
}> {
  try {
    const alertData = await convex.query(api.billingAnalytics.getUsageLimitAlerts, {
      companyId,
      thresholds,
    });

    return {
      alerts: alertData.alerts,
      totalAlerts: alertData.totalAlerts,
      criticalAlerts: alertData.criticalAlerts,
      warningAlerts: alertData.warningAlerts,
    };
  } catch (error) {
    console.error("Error getting usage limit alerts:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get usage alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Get billing analytics time series data.
 */
export async function getBillingTimeSeriesData(
  companyId: string,
  filters: AnalyticsFilters,
  granularity: DataGranularity = "day"
): Promise<BillingTimeSeriesDataPoint[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const timeSeriesData = await convex.query(api.billingAnalytics.getBillingTimeSeriesAnalytics, {
      companyId,
      dateRange: filters.dateRange || { start: '', end: '' },
      granularity,
    });

    // Transform TimeSeriesDataPoint[] to BillingTimeSeriesDataPoint[]
    return timeSeriesData.map((point) => ({
      date: point.date,
      label: point.label,
      usage: point.usage,
      costs: {
        currentPeriod: point.costs.currentPeriodCost,
        projectedCost: point.costs.projectedCost,
        currency: point.costs.currency,
      },
      planType: point.planType,
    }));
  } catch (error) {
    console.error("Error getting billing time series data:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to get billing time series: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Compute analytics for filtered billing data.
 */
export async function computeAnalyticsForFilteredData(
  filters: AnalyticsFilters,
): Promise<FilteredDataset<BillingAnalytics>> {
  try {
    const startTime = Date.now();

    // Validate entityIds exists and has company ID
    if (!filters.entityIds || filters.entityIds.length === 0) {
      throw new AnalyticsError(
        AnalyticsErrorType.INVALID_FILTERS,
        "AnalyticsFilters must include at least one entity ID for company identification",
        "billing",
        false
      );
    }
    const companyId = filters.entityIds[0];

    // Get billing analytics data for the specified filters
    const billingData = await convex.query(api.billingAnalytics.getBillingAnalytics, {
      companyId,
      dateRange: filters.dateRange || { start: '', end: '' },
    });

    // Transform Convex data to BillingAnalytics interface
    const transformedData: BillingAnalytics[] = billingData.analytics.map((record: {
      _id: string;
      updatedAt: number;
      companyId: string;
      planType: string;
      emailsSent: number;
      emailsRemaining: number;
      domainsUsed: number;
      domainsLimit: number;
      mailboxesUsed: number;
      mailboxesLimit: number;
      currentPeriodCost: number;
      projectedCost: number;
      currency: string;
    }) => ({
      id: record._id,
      name: `Billing - ${record.planType}`,
      updatedAt: record.updatedAt,
      companyId: record.companyId,
      planType: record.planType,
      usage: {
        emailsSent: record.emailsSent,
        emailsRemaining: record.emailsRemaining,
        domainsUsed: record.domainsUsed,
        domainsLimit: record.domainsLimit,
        mailboxesUsed: record.mailboxesUsed,
        mailboxesLimit: record.mailboxesLimit,
      },
      costs: {
        currentPeriod: record.currentPeriodCost,
        projectedCost: record.projectedCost,
        currency: record.currency,
      },
      // PerformanceMetrics fields mapped from billing data
      sent: record.emailsSent,
      delivered: record.emailsSent, // Assuming all sent emails are delivered for billing context
      opened_tracked: 0, // Not applicable for billing analytics
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    }));

    const queryExecutionTime = Date.now() - startTime;

    return {
      data: transformedData,
      totalCount: transformedData.length,
      filters,
      queryExecutionTime,
    };
  } catch (error) {
    console.error("Error computing analytics for filtered billing data:", error);
    if (error instanceof AnalyticsError) {
      throw error;
    }
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to compute filtered analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Update billing analytics data.
 */
export async function updateBillingAnalytics(data: {
  companyId: string;
  date: string;
  planType: string;
  usage: {
    emailsSent: number;
    emailsRemaining: number;
    domainsUsed: number;
    domainsLimit: number;
    mailboxesUsed: number;
    mailboxesLimit: number;
  };
  costs: {
    currentPeriod: number;
    projectedCost: number;
    currency: string;
  };
}): Promise<string> {
  try {
    // Validate the data
    if (!data.companyId || !data.date || !data.planType) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Missing required fields: companyId, date, or planType",
        "billing",
        false
      );
    }

    if (data.usage.emailsSent < 0 || data.usage.domainsUsed < 0 || data.usage.mailboxesUsed < 0) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Usage values cannot be negative",
        "billing",
        false
      );
    }

    if (data.costs.currentPeriod < 0 || data.costs.projectedCost < 0) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        "Cost values cannot be negative",
        "billing",
        false
      );
    }

    const billingId = await convex.mutation(api.billingAnalytics.upsertBillingAnalytics, data);
    
    console.log(`Billing analytics updated for company ${data.companyId} on ${data.date}`);
    return billingId;
  } catch (error) {
    console.error("Error updating billing analytics:", error);
    if (error instanceof AnalyticsError) {
      throw error;
    }
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to update billing analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Initialize billing analytics for a new company.
 */
export async function initializeBillingAnalytics(
  companyId: string,
  planType: string,
  planLimits: {
    emailsLimit: number;
    domainsLimit: number;
    mailboxesLimit: number;
  },
  currency: string = "USD"
): Promise<string> {
  try {
    const result = await convex.mutation(api.billingAnalytics.initializeBillingAnalytics, {
      companyId,
      planType,
      planLimits,
      currency,
    });

    console.log(`Billing analytics initialized for company ${companyId} with plan ${planType}`);
    return result.billingId;
  } catch (error) {
    console.error("Error initializing billing analytics:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to initialize billing analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Migrate legacy billing data to new analytics structure.
 */
export async function migrateLegacyBillingData(
  legacyData: LegacyBillingData[],
  companyId: string
): Promise<{ successful: number; failed: number; errors: string[] }> {
  try {
    const migrationResults = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Transform legacy data to new format
    const transformedData = legacyData.map(record => {
      try {
        return ConvexMigrationUtils.transformBillingData(record, companyId);
      } catch (error) {
        migrationResults.failed++;
        const errorMessage = error instanceof AnalyticsError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unknown error';
        migrationResults.errors.push(`Failed to transform record: ${errorMessage}`);
        return null;
      }
    }).filter((item): item is NonNullable<ReturnType<typeof ConvexMigrationUtils.transformBillingData>> => item !== null);

    // Batch update the transformed data
    if (transformedData.length > 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const batchResult = await convex.mutation(api.billingAnalytics.bulkUpdateBillingAnalytics, {
        updates: transformedData,
      });

      migrationResults.successful += batchResult.successful;
      migrationResults.failed += batchResult.failed;
      
      // Add any batch errors
      batchResult.results.forEach((result) => {
        if (!result.success && result.error) {
          migrationResults.errors.push(result.error);
        }
      });
    }

    console.log(`Billing data migration completed: ${migrationResults.successful} successful, ${migrationResults.failed} failed`);
    return migrationResults;
  } catch (error) {
    console.error("Error migrating legacy billing data:", error);
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to migrate billing data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      "billing",
      true
    );
  }
}

/**
 * Health check for billing analytics service.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    // Test basic functionality by getting usage metrics for a test company
    await convex.query(api.billingAnalytics.getCurrentUsageMetrics, {
      companyId: "health-check-test",
    });
    
    return true;
  } catch (error) {
    console.error("Billing analytics health check failed:", error);
    return false;
  }
}
