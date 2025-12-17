// ============================================================================
// ANALYTICS MIGRATION UTILITIES - Helper functions for migrating to new types
// ============================================================================

import { 
  PerformanceMetrics, 
  TimeSeriesDataPoint, 
  AnalyticsFilters 
} from "@/types/analytics/core";
import { 
  CampaignAnalytics, 
} from "@/types/analytics/domain-specific";
import { 
  AnalyticsUIFilters, 
  DateRangePreset 
} from "@/types/analytics/ui";
import { AnalyticsCalculator } from "./analytics-calculator";

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Legacy interfaces for migration (temporary)
 */
interface LegacyCampaignPerformanceData {
  name: string;
  sent: number;
  opens: number | null;
  clicks: number | null;
  replies: number;
  bounced?: number;
  openRate: number;
  replyRate: number;
}

interface LegacyTimeSeriesDataPoint {
  date: string;
  label: string;
  sent: number;
  opens: number;
  clicks: number;
  replies: number;
  bounces: number;
}

interface LegacyAnalyticsFilters {
  dateRange?: DateRangePreset;
  customDateRange?: { start: string; end: string; };
  granularity?: "day" | "week" | "month";
  campaigns?: string[];
  mailboxes?: string[];
  visibleMetrics?: string[];
  additionalFilters?: Record<string, unknown>;
  entityIds?: string[];
}

/**
 * Utility class for migrating analytics data from old to new formats
 */
export class AnalyticsMigrationUtils {
  /**
   * Convert legacy campaign performance data to new CampaignAnalytics format
   */
  static convertCampaignData(
    legacy: LegacyCampaignPerformanceData,
    campaignId?: string
  ): CampaignAnalytics {
    const id = campaignId || this.generateId();
    const delivered = legacy.sent - (legacy.bounced || 0);
    const opened_tracked = legacy.opens || 0;
    const clicked_tracked = legacy.clicks || 0;
    
    // Estimate missing fields based on industry averages
    const unsubscribed = Math.max(0, Math.floor(opened_tracked * 0.02)); // 2% of opens
    const spamComplaints = Math.max(0, Math.floor(opened_tracked * 0.001)); // 0.1% of opens

    return {
      id,
      name: `${legacy.name} Campaign`,
      campaignId: id,
      campaignName: legacy.name,
      sent: legacy.sent,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied: legacy.replies,
      bounced: legacy.bounced || 0,
      unsubscribed,
      spamComplaints,
      updatedAt: Date.now(),
      // Additional campaign-specific fields
      status: "ACTIVE" as const,
      leadCount: 0, // Will need to be populated separately
      activeLeads: 0,
      completedLeads: 0
    };
  }

  /**
   * Convert legacy time series data to new format
   */
  static convertTimeSeriesData(
    legacy: LegacyTimeSeriesDataPoint[]
  ): TimeSeriesDataPoint[] {
    return legacy.map(point => {
      const delivered = point.sent - point.bounces;
      const opened_tracked = point.opens;
      const clicked_tracked = point.clicks;
      
      // Estimate missing fields
      const unsubscribed = Math.max(0, Math.floor(opened_tracked * 0.02));
      const spamComplaints = Math.max(0, Math.floor(opened_tracked * 0.001));

      return {
        date: point.date,
        label: point.label,
        metrics: {
          sent: point.sent,
          delivered,
          opened_tracked,
          clicked_tracked,
          replied: point.replies,
          bounced: point.bounces,
          unsubscribed,
          spamComplaints
        }
      };
    });
  }

  /**
   * Convert legacy filters to data layer filters
   */
  static convertToDataFilters(legacy: LegacyAnalyticsFilters): AnalyticsFilters {
    let dateRange: { start: string; end: string };

    if (legacy.customDateRange) {
      dateRange = legacy.customDateRange;
    } else {
      dateRange = this.convertPresetToDateRange(legacy.dateRange || "30d");
    }

    return {
      dateRange,
      entityIds: [
        ...(legacy.campaigns || []),
        ...(legacy.mailboxes || []),
        ...(legacy.entityIds || [])
      ],
      additionalFilters: legacy.additionalFilters || {}
    };
  }

  /**
   * Convert legacy filters to UI filters
   */
  static convertToUIFilters(legacy: LegacyAnalyticsFilters): AnalyticsUIFilters {
    return {
      dateRange: legacy.dateRange || "30d",
      customDateRange: legacy.customDateRange,
      granularity: legacy.granularity || "day",
      selectedCampaigns: legacy.campaigns || [],
      selectedMailboxes: legacy.mailboxes || [],
      selectedDomains: [], // New field, empty by default
      visibleMetrics: legacy.visibleMetrics || ["sent", "opened_tracked", "replied"]
    };
  }

  /**
   * Validate migrated campaign data
   */
  static validateCampaignData(data: CampaignAnalytics): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!data.campaignId) errors.push("campaignId is required");
    if (!data.campaignName) errors.push("campaignName is required");
    if (typeof data.sent !== 'number') errors.push("sent must be a number");
    if (typeof data.delivered !== 'number') errors.push("delivered must be a number");

    // Logical validation
    if (data.sent < 0) errors.push("sent must be non-negative");
    if (data.delivered < 0) errors.push("delivered must be non-negative");
    if (data.delivered > data.sent) errors.push("delivered cannot exceed sent");
    if (data.opened_tracked > data.delivered) {
      warnings.push("opened_tracked exceeds delivered - this may indicate tracking issues");
    }
    if (data.clicked_tracked > data.opened_tracked) {
      warnings.push("clicked_tracked exceeds opened_tracked - this is unusual");
    }

    // Use AnalyticsCalculator validation for performance metrics
    const metricsValidation = AnalyticsCalculator.validateMetrics(data);
    if (!metricsValidation.isValid) {
      errors.push(...metricsValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate migrated time series data
   */
  static validateTimeSeriesData(data: TimeSeriesDataPoint[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(data)) {
      errors.push("Time series data must be an array");
      return { isValid: false, errors };
    }

    data.forEach((point, index) => {
      if (!point.date) errors.push(`Point ${index}: date is required`);
      if (!point.label) errors.push(`Point ${index}: label is required`);
      if (!point.metrics) errors.push(`Point ${index}: metrics is required`);
      
      if (point.metrics) {
        const validation = AnalyticsCalculator.validateMetrics(point.metrics);
        if (!validation.isValid) {
          errors.push(`Point ${index}: ${validation.errors.join(", ")}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Batch convert and validate campaign data
   */
  static batchConvertCampaignData(
    legacyData: LegacyCampaignPerformanceData[]
  ): {
    converted: CampaignAnalytics[];
    failed: { data: LegacyCampaignPerformanceData; errors: string[] }[];
  } {
    const converted: CampaignAnalytics[] = [];
    const failed: { data: LegacyCampaignPerformanceData; errors: string[] }[] = [];

    legacyData.forEach(legacy => {
      try {
        const convertedData = this.convertCampaignData(legacy);
        const validation = this.validateCampaignData(convertedData);
        
        if (validation.isValid) {
          converted.push(convertedData);
        } else {
          failed.push({ data: legacy, errors: validation.errors });
        }
      } catch (error) {
        failed.push({ 
          data: legacy, 
          errors: [`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
        });
      }
    });

    return { converted, failed };
  }

  /**
   * Generate a unique ID for migrated data
   */
  private static generateId(): string {
    return `migrated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert date range preset to actual date range
   */
  private static convertPresetToDateRange(preset: DateRangePreset): { start: string; end: string } {
    const now = new Date();
    const days = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
      "custom": 30 // Default fallback
    }[preset] || 30;

    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  }

  /**
   * Create migration report
   */
  static createMigrationReport(
    originalCount: number,
    convertedCount: number,
    failedCount: number,
    warnings: string[] = []
  ): string {
    const successRate = ((convertedCount / originalCount) * 100).toFixed(1);
    
    return `
Analytics Migration Report
=========================
Original records: ${originalCount}
Successfully converted: ${convertedCount}
Failed conversions: ${failedCount}
Success rate: ${successRate}%

${warnings.length > 0 ? `Warnings:\n${warnings.map(w => `- ${w}`).join('\n')}` : 'No warnings'}

${failedCount > 0 ? 'Please review failed conversions and fix data issues before retrying.' : 'All records migrated successfully!'}
    `.trim();
  }
}

/**
 * Helper functions for common migration tasks
 */
export class MigrationHelpers {
  /**
   * Check if data uses old field names
   */
  static hasLegacyFieldNames(data: object): boolean {
    return (
      data.hasOwnProperty('opens') ||
      data.hasOwnProperty('clicks') ||
      data.hasOwnProperty('bounces') ||
      data.hasOwnProperty('openRate') ||
      data.hasOwnProperty('replyRate')
    );
  }

  /**
   * Get migration suggestions for a data object
   */
  static getMigrationSuggestions(data: Record<string, unknown>): string[] {
    const suggestions: string[] = [];

    if (data.opens !== undefined) {
      suggestions.push("Replace 'opens' with 'opened_tracked'");
    }
    if (data.clicks !== undefined) {
      suggestions.push("Replace 'clicks' with 'clicked_tracked'");
    }
    if (data.bounces !== undefined) {
      suggestions.push("Replace 'bounces' with 'bounced'");
    }
    if (data.openRate !== undefined) {
      suggestions.push("Remove 'openRate' and calculate using AnalyticsCalculator.calculateOpenRate()");
    }
    if (data.replyRate !== undefined) {
      suggestions.push("Remove 'replyRate' and calculate using AnalyticsCalculator.calculateReplyRate()");
    }
    if (!data.delivered && data.sent) {
      suggestions.push("Add 'delivered' field (typically sent - bounced)");
    }
    if (!data.unsubscribed) {
      suggestions.push("Add 'unsubscribed' field (estimate ~2% of opens)");
    }
    if (!data.spamComplaints) {
      suggestions.push("Add 'spamComplaints' field (estimate ~0.1% of opens)");
    }

    return suggestions;
  }

  /**
   * Estimate missing fields based on existing data
   */
  static estimateMissingFields(data: Partial<PerformanceMetrics>): PerformanceMetrics {
    const sent = data.sent || 0;
    const bounced = data.bounced || 0;
    const delivered = data.delivered || (sent - bounced);
    const opened_tracked = data.opened_tracked || 0;
    const clicked_tracked = data.clicked_tracked || 0;
    const replied = data.replied || 0;
    
    // Industry average estimates
    const unsubscribed = data.unsubscribed || Math.floor(opened_tracked * 0.02);
    const spamComplaints = data.spamComplaints || Math.floor(opened_tracked * 0.001);

    return {
      sent,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied,
      bounced,
      unsubscribed,
      spamComplaints
    };
  }
}

/**
 * Type guards for migration
 */
export class MigrationTypeGuards {
  /**
   * Check if object is legacy campaign data
   */
  static isLegacyCampaignData(data: unknown): data is LegacyCampaignPerformanceData {
    return (
      data !== null &&
      typeof data === 'object' &&
      'name' in data &&
      typeof (data as { name: unknown }).name === 'string' &&
      'sent' in data &&
      typeof (data as { sent: unknown }).sent === 'number' &&
      'opens' in data &&
      ((data as { opens: unknown }).opens === null || 
       typeof (data as { opens: unknown }).opens === 'number') &&
      'openRate' in data &&
      typeof (data as { openRate: unknown }).openRate === 'number'
    );
  }

  /**
   * Check if object is legacy time series data
   */
  static isLegacyTimeSeriesData(data: unknown): data is LegacyTimeSeriesDataPoint {
    return (
      data !== null &&
      typeof data === 'object' &&
      'date' in data &&
      typeof (data as { date: unknown }).date === 'string' &&
      'sent' in data &&
      typeof (data as { sent: unknown }).sent === 'number' &&
      'opens' in data &&
      typeof (data as { opens: unknown }).opens === 'number' &&
      'bounces' in data &&
      typeof (data as { bounces: unknown }).bounces === 'number'
    );
  }

  /**
   * Check if object is new format campaign data
   */
  static isNewCampaignData(data: unknown): data is CampaignAnalytics {
    return (
      data !== null &&
      typeof data === 'object' &&
      'campaignId' in data &&
      typeof (data as { campaignId: unknown }).campaignId === 'string' &&
      'campaignName' in data &&
      typeof (data as { campaignName: unknown }).campaignName === 'string' &&
      'opened_tracked' in data &&
      typeof (data as { opened_tracked: unknown }).opened_tracked === 'number' &&
      'delivered' in data &&
      typeof (data as { delivered: unknown }).delivered === 'number'
    );
  }
}
