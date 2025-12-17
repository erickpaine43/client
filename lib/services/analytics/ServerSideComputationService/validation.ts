// ============================================================================
// SERVER-SIDE COMPUTATION SERVICE VALIDATION
// ============================================================================

import { AnalyticsFilters } from "@/types/analytics/core";
import { AnalyticsDomain } from "@/types/analytics/ui";

/**
 * Create default filters for analytics queries.
 */
export function createDefaultFilters(): AnalyticsFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  return {
    dateRange: {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    },
  };
}

/**
 * Create extended filters for longer time ranges.
 */
export function createExtendedFilters(days: number): AnalyticsFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    dateRange: {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    },
  };
}

/**
 * Get common filter combinations for cache warming.
 */
export function getCommonFilterCombinations(): AnalyticsFilters[] {
  const now = new Date();
  const combinations: AnalyticsFilters[] = [];

  // Common time ranges
  const timeRanges = [
    { days: 7, name: "last7days" },
    { days: 30, name: "last30days" },
    { days: 90, name: "last90days" },
  ];

  timeRanges.forEach(range => {
    const end = new Date(now);
    const start = new Date(now);
    start.setDate(start.getDate() - range.days);

    combinations.push({
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
    });
  });

  return combinations;
}

/**
 * Validate computation input parameters.
 */
export function validateComputationInput(
  operation: string,
  domain: AnalyticsDomain,
  entityIds: string[],
  filters: AnalyticsFilters
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate operation
  if (!operation || operation.trim().length === 0) {
    errors.push("Operation name is required");
  }

  // Validate domain
  const validDomains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "leads", "templates", "billing"];
  if (!validDomains.includes(domain)) {
    errors.push(`Invalid domain: ${domain}. Must be one of: ${validDomains.join(", ")}`);
  }

  // Validate filters
  if (!filters) {
    errors.push("Filters are required");
  } else {
    if (!filters.dateRange) {
      errors.push("Date range is required in filters");
    } else {
      if (!filters.dateRange.start) {
        errors.push("Start date is required in date range");
      }
      if (!filters.dateRange.end) {
        errors.push("End date is required in date range");
      }
      if (filters.dateRange.start && filters.dateRange.end) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (startDate > endDate) {
          errors.push("Start date cannot be after end date");
        }
      }
    }
  }

  // Validate entity IDs (if provided)
  if (entityIds && entityIds.length > 0) {
    const invalidIds = entityIds.filter(id => !id || id.trim().length === 0);
    if (invalidIds.length > 0) {
      errors.push(`Invalid entity IDs found: ${invalidIds.join(", ")}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate parallel computation tasks.
 */
export function validateParallelComputationTasks<T>(
  tasks: Array<{
    operation: string;
    domain: AnalyticsDomain;
    entityIds?: string[];
    filters: AnalyticsFilters;
    executor: () => Promise<T>;
    priority?: number;
  }>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!tasks || tasks.length === 0) {
    errors.push("At least one computation task is required");
    return { isValid: false, errors };
  }

  // Validate each task
  tasks.forEach((task, index) => {
    const taskValidation = validateComputationInput(
      task.operation,
      task.domain,
      task.entityIds || [],
      task.filters
    );

    if (!taskValidation.isValid) {
      errors.push(`Task ${index + 1}: ${taskValidation.errors.join(", ")}`);
    }

    if (!task.executor || typeof task.executor !== "function") {
      errors.push(`Task ${index + 1}: Executor function is required`);
    }

    if (task.priority !== undefined && (task.priority < 0 || task.priority > 100)) {
      errors.push(`Task ${index + 1}: Priority must be between 0 and 100`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
