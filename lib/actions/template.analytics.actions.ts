// ============================================================================
// TEMPLATE ANALYTICS ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

"use server";

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/template-analytics.ts
//
// Migration notes:
// - All functions now use ConvexQueryHelper for consistent error handling
// - Standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved type safety and performance monitoring

import {
  getTemplateAnalytics,
  getTemplateUsageAnalytics,
  getTemplateComparison,
  getTemplateAnalyticsByCategory,
  getTemplateTimeSeries,
  updateTemplateAnalytics,
  trackTemplateUsage,
  bulkUpdateTemplateAnalytics,
  exportTemplateAnalytics,
  getTemplateAnalyticsHealth,
  type TemplatePerformanceAnalytics,
  type TemplateUsageAnalytics,
  type TemplateComparison
} from './analytics/template-analytics';

// Re-export all functions for backward compatibility
export {
  getTemplateAnalytics,
  getTemplateUsageAnalytics,
  getTemplateComparison,
  getTemplateAnalyticsByCategory,
  getTemplateTimeSeries,
  updateTemplateAnalytics,
  trackTemplateUsage,
  bulkUpdateTemplateAnalytics,
  exportTemplateAnalytics,
  getTemplateAnalyticsHealth,
  type TemplatePerformanceAnalytics,
  type TemplateUsageAnalytics,
  type TemplateComparison
};

// Legacy imports for backward compatibility
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { TemplateAnalytics } from "@/types/analytics/domain-specific";
import { PerformanceMetrics } from "@/types/analytics/core";

/**
 * MIGRATED: Template analytics actions using standardized data structures.
 * Removed stored rates - all rates calculated on-demand using AnalyticsCalculator.
 * 
 * NOTE: Most functions have been migrated to Convex functions in convex/templateAnalytics.ts
 * Only keeping getTemplatePerformanceAnalytics for backward compatibility with mock data.
 * Use Convex functions directly via hooks or TemplateAnalyticsService for real data.
 */

/**
 * Get template performance analytics with calculated rates.
 */
export async function getTemplatePerformanceAnalytics(
  templateIds?: string[]
): Promise<{
  templates: TemplateAnalytics[];
  aggregatedMetrics: PerformanceMetrics;
  formattedRates: {
    openRate: string;
    clickRate: string;
    replyRate: string;
    deliveryRate: string;
  };
}> {
  try {
    // Mock data for now - in real implementation, this would query Convex
    const mockTemplateAnalytics: TemplateAnalytics[] = [
      {
        id: "template-1",
        name: "Welcome Email",
        templateId: "template-1",
        templateName: "Welcome Email",
        category: "onboarding",
        usage: 245,
        
        // Performance metrics from template usage
        performance: {
          sent: 245,
          delivered: 240,
          opened_tracked: 108,
          clicked_tracked: 25,
          replied: 29,
          bounced: 5,
          unsubscribed: 2,
          spamComplaints: 0,
        },
        
        // Base analytics fields
        sent: 245,
        delivered: 240,
        opened_tracked: 108,
        clicked_tracked: 25,
        replied: 29,
        bounced: 5,
        unsubscribed: 2,
        spamComplaints: 0,
        
        updatedAt: Date.now(),
      },
      {
        id: "template-2",
        name: "Follow-up Email",
        templateId: "template-2",
        templateName: "Follow-up Email",
        category: "follow-up",
        usage: 189,
        
        performance: {
          sent: 189,
          delivered: 185,
          opened_tracked: 74,
          clicked_tracked: 18,
          replied: 12,
          bounced: 4,
          unsubscribed: 1,
          spamComplaints: 0,
        },
        
        sent: 189,
        delivered: 185,
        opened_tracked: 74,
        clicked_tracked: 18,
        replied: 12,
        bounced: 4,
        unsubscribed: 1,
        spamComplaints: 0,
        
        updatedAt: Date.now(),
      },
    ];

    // Filter by template IDs if provided
    const filteredTemplates = templateIds?.length 
      ? mockTemplateAnalytics.filter(t => templateIds.includes(t.templateId))
      : mockTemplateAnalytics;

    // Aggregate metrics across all templates
    const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(filteredTemplates);
    
    // Calculate rates using AnalyticsCalculator
    const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
    
    return {
      templates: filteredTemplates,
      aggregatedMetrics,
      formattedRates: {
        openRate: AnalyticsCalculator.formatRateAsPercentage(rates.openRate),
        clickRate: AnalyticsCalculator.formatRateAsPercentage(rates.clickRate),
        replyRate: AnalyticsCalculator.formatRateAsPercentage(rates.replyRate),
        deliveryRate: AnalyticsCalculator.formatRateAsPercentage(rates.deliveryRate),
      },
    };
  } catch (error) {
    console.error("Error fetching template analytics:", error);
    throw new Error("Failed to fetch template analytics");
  }
}

// NOTE: getTemplateUsageAnalytics removed - use Convex function api.templateAnalytics.getTemplateUsageAnalytics instead

// NOTE: getTemplateEffectivenessComparison removed - use Convex function api.templateAnalytics.getTemplateEffectivenessMetrics instead
