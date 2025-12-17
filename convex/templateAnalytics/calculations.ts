import { PerformanceMetrics, TemplateAnalyticsRecord, TemplatePerformanceResult, TemplateUsageResult } from "./types";

/**
 * Aggregate template metrics from multiple records
 * @param records Array of template analytics records
 * @returns Aggregated performance metrics
 */
export function aggregateTemplateMetrics(records: TemplateAnalyticsRecord[]): PerformanceMetrics {
  return records.reduce(
    (acc, record) => ({
      sent: acc.sent + record.sent,
      delivered: acc.delivered + record.delivered,
      opened_tracked: acc.opened_tracked + record.opened_tracked,
      clicked_tracked: acc.clicked_tracked + record.clicked_tracked,
      replied: acc.replied + record.replied,
      bounced: acc.bounced + record.bounced,
      unsubscribed: acc.unsubscribed + record.unsubscribed,
      spamComplaints: acc.spamComplaints + record.spamComplaints,
    }),
    {
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    }
  );
}

/**
 * Calculate template effectiveness score
 * @param metrics Performance metrics
 * @returns Effectiveness score (0-100)
 */
export function calculateEffectivenessScore(metrics: PerformanceMetrics): number {
  const openRate = metrics.delivered > 0 ? metrics.opened_tracked / metrics.delivered : 0;
  const replyRate = metrics.delivered > 0 ? metrics.replied / metrics.delivered : 0;
  const clickRate = metrics.delivered > 0 ? metrics.clicked_tracked / metrics.delivered : 0;
  const bounceRate = metrics.sent > 0 ? metrics.bounced / metrics.sent : 0;

  // Effectiveness score (0-100)
  const effectivenessScore = Math.round(
    (openRate * 30 + replyRate * 40 + clickRate * 20 + (1 - bounceRate) * 10) * 100
  );

  return Math.max(0, Math.min(100, effectivenessScore));
}

/**
 * Group template records by template ID
 * @param records Template analytics records
 * @returns Map of template ID to array of records
 */
export function groupTemplatesById(records: TemplateAnalyticsRecord[]): Map<string, TemplateAnalyticsRecord[]> {
  const templateGroups = new Map<string, TemplateAnalyticsRecord[]>();

  records.forEach((record) => {
    const templateId = record.templateId;
    if (!templateGroups.has(templateId)) {
      templateGroups.set(templateId, []);
    }
    templateGroups.get(templateId)!.push(record);
  });

  return templateGroups;
}

/**
 * Group template records by date
 * @param records Template analytics records
 * @returns Map of date to array of records
 */
export function groupByDate(records: TemplateAnalyticsRecord[]): Map<string, TemplateAnalyticsRecord[]> {
  const dateGroups = new Map<string, TemplateAnalyticsRecord[]>();

  records.forEach((record) => {
    const date = record.date;
    if (!dateGroups.has(date)) {
      dateGroups.set(date, []);
    }
    dateGroups.get(date)!.push(record);
  });

  return dateGroups;
}

/**
 * Get template info from the most recent record
 * @param records Template analytics records for a single template
 * @returns Template info object
 */
export function getTemplateInfo(records: TemplateAnalyticsRecord[]): {
  templateId: string;
  templateName: string;
  category: string;
  updatedAt: number;
} {
  const latestRecord = records.sort((a, b) => b.updatedAt - a.updatedAt)[0];

  return {
    templateId: latestRecord.templateId,
    templateName: latestRecord.templateName,
    category: latestRecord.category || "OUTREACH",
    updatedAt: latestRecord.updatedAt,
  };
}

/**
 * Calculate template performance results
 * @param templateGroups Map of template ID to records
 * @returns Array of template performance results
 */
export function calculateTemplatePerformanceResults(
  templateGroups: Map<string, TemplateAnalyticsRecord[]>
): TemplatePerformanceResult[] {
  return Array.from(templateGroups.entries()).map(([templateId, records]) => {
    const aggregated = aggregateTemplateMetrics(records);
    const templateInfo = getTemplateInfo(records);

    return {
      templateId,
      templateName: templateInfo.templateName,
      category: templateInfo.category,
      usage: records.reduce((sum, record) => sum + record.usage, 0),
      performance: aggregated,
      id: templateId,
      name: templateInfo.templateName,
      updatedAt: templateInfo.updatedAt,
    };
  });
}

/**
 * Create time series data points
 * @param dateGroups Map of date to records
 * @returns Array of time series data points
 */
export function createTimeSeriesDataPoints(
  dateGroups: Map<string, TemplateAnalyticsRecord[]>
): Array<{
  date: string;
  label: string;
  metrics: PerformanceMetrics;
}> {
  return Array.from(dateGroups.entries())
    .map(([date, records]) => {
      const aggregated = aggregateTemplateMetrics(records);

      return {
        date,
        label: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        }),
        metrics: aggregated,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate template usage results
 * @param templateGroups Map of template ID to records
 * @returns Array of template usage results
 */
export function calculateTemplateUsageResults(
  templateGroups: Map<string, TemplateAnalyticsRecord[]>
): TemplateUsageResult[] {
  return Array.from(templateGroups.entries()).map(([templateId, records]) => {
    const aggregated = aggregateTemplateMetrics(records);
    const templateInfo = getTemplateInfo(records);

    return {
      templateId,
      templateName: templateInfo.templateName,
      category: templateInfo.category,
      totalUsage: records.reduce((sum, record) => sum + record.usage, 0),
      totalSent: aggregated.sent,
      totalReplies: aggregated.replied,
      performance: aggregated,
    };
  });
}

/**
 * Sort templates by usage
 * @param templates Array of template usage results
 * @param limit Maximum number of results
 * @returns Sorted and limited array
 */
export function sortTemplatesByUsage(
  templates: TemplateUsageResult[],
  limit: number = 10
): TemplateUsageResult[] {
  return templates
    .sort((a, b) => b.totalUsage - a.totalUsage)
    .slice(0, limit);
}

/**
 * Calculate template usage analytics summary
 * @param templates Array of template usage results
 * @returns Usage analytics summary
 */
export function calculateUsageAnalyticsSummary(templates: TemplateUsageResult[]): {
  topTemplates: TemplateUsageResult[];
  totalTemplates: number;
  totalUsage: number;
} {
  const sortedTemplates = sortTemplatesByUsage(templates);

  return {
    topTemplates: sortedTemplates,
    totalTemplates: templates.length,
    totalUsage: templates.reduce((sum, template) => sum + template.totalUsage, 0),
  };
}

/**
 * Filter records by template IDs
 * @param records Template analytics records
 * @param templateIds Array of template IDs to filter by
 * @returns Filtered records
 */
export function filterRecordsByTemplateIds(
  records: TemplateAnalyticsRecord[],
  templateIds: string[]
): TemplateAnalyticsRecord[] {
  return records.filter((record) =>
    templateIds.includes(record.templateId)
  );
}

/**
 * Calculate category breakdown
 * @param templates Array of template usage results
 * @returns Category breakdown array
 */
export function calculateCategoryBreakdown(templates: TemplateUsageResult[]): Array<{
  category: string;
  templateCount: number;
  totalUsage: number;
  averagePerformance: PerformanceMetrics;
  topTemplate: {
    templateId: string;
    templateName: string;
    usage: number;
  };
}> {
  const categoryMap = new Map<string, TemplateUsageResult[]>();

  // Group templates by category
  templates.forEach((template) => {
    const category = template.category;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(template);
  });

  return Array.from(categoryMap.entries()).map(([category, categoryTemplates]) => {
    const templateCount = categoryTemplates.length;
    const totalUsage = categoryTemplates.reduce((sum, t) => sum + t.totalUsage, 0);

    // Calculate average performance
    const averagePerformance = categoryTemplates.reduce(
      (acc, template) => ({
        sent: acc.sent + template.performance.sent,
        delivered: acc.delivered + template.performance.delivered,
        opened_tracked: acc.opened_tracked + template.performance.opened_tracked,
        clicked_tracked: acc.clicked_tracked + template.performance.clicked_tracked,
        replied: acc.replied + template.performance.replied,
        bounced: acc.bounced + template.performance.bounced,
        unsubscribed: acc.unsubscribed + template.performance.unsubscribed,
        spamComplaints: acc.spamComplaints + template.performance.spamComplaints,
      }),
      {
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
      }
    );

    // Divide by template count for average
    if (templateCount > 0) {
      Object.keys(averagePerformance).forEach((key) => {
        averagePerformance[key as keyof PerformanceMetrics] = Math.round(averagePerformance[key as keyof PerformanceMetrics] / templateCount);
      });
    }

    // Find top template
    const topTemplate = categoryTemplates.sort((a, b) => b.totalUsage - a.totalUsage)[0];

    return {
      category,
      templateCount,
      totalUsage,
      averagePerformance,
      topTemplate: {
        templateId: topTemplate.templateId,
        templateName: topTemplate.templateName,
        usage: topTemplate.totalUsage,
      },
    };
  });
}
