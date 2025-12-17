import {
  TemplateAnalyticsQueryArgs,
  TemplateTimeSeriesQueryArgs,
  TemplateUsageQueryArgs,
  TemplateEffectivenessQueryArgs,
  UpdateTemplateAnalyticsArgs,
  BatchUpdateTemplateAnalyticsArgs
} from "./types";

/**
 * Validates template IDs array
 * @param templateIds Array of template IDs to validate
 * @returns Validated template IDs
 */
export function validateTemplateIds(templateIds?: string[]): string[] | undefined {
  if (!templateIds || templateIds.length === 0) {
    return undefined;
  }

  // Filter out empty strings and duplicates
  const validIds = templateIds.filter(id => id && id.trim().length > 0);
  return Array.from(new Set(validIds)); // Remove duplicates
}

/**
 * Validates date range object
 * @param dateRange Date range to validate
 * @returns Validated date range or undefined if invalid
 */
export function validateDateRange(dateRange?: { start: string; end: string }): { start: string; end: string } | undefined {
  if (!dateRange) {
    return undefined;
  }

  const { start, end } = dateRange;

  if (!start || !end) {
    return undefined;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return undefined;
  }

  // Ensure start is before or equal to end
  if (startDate > endDate) {
    return undefined;
  }

  return { start, end };
}

/**
 * Validates company ID
 * @param companyId Company ID to validate
 * @returns Validated company ID
 */
export function validateCompanyId(companyId: string): string {
  if (!companyId || typeof companyId !== 'string' || companyId.trim().length === 0) {
    throw new Error("Invalid company ID provided");
  }
  return companyId.trim();
}

/**
 * Validates granularity parameter for time series
 * @param granularity Granularity to validate
 * @returns Validated granularity or default
 */
export function validateGranularity(granularity?: string): "day" | "week" | "month" {
  if (!granularity) {
    return "day";
  }

  const validGranularities = ["day", "week", "month"] as const;
  return validGranularities.includes(granularity as "day" | "week" | "month") ? (granularity as "day" | "week" | "month") : "day";
}

/**
 * Validates template analytics query arguments
 * @param args Query arguments to validate
 * @returns Validated and sanitized arguments
 */
export function validateTemplateAnalyticsQueryArgs(args: TemplateAnalyticsQueryArgs): TemplateAnalyticsQueryArgs {
  const validatedArgs: TemplateAnalyticsQueryArgs = {
    ...args,
    templateIds: validateTemplateIds(args.templateIds),
    dateRange: validateDateRange(args.dateRange),
    companyId: validateCompanyId(args.companyId),
  };

  return validatedArgs;
}

/**
 * Validates template time series query arguments
 * @param args Query arguments to validate
 * @returns Validated and sanitized arguments
 */
export function validateTemplateTimeSeriesQueryArgs(args: TemplateTimeSeriesQueryArgs): TemplateTimeSeriesQueryArgs {
  const validatedArgs: TemplateTimeSeriesQueryArgs = {
    ...validateTemplateAnalyticsQueryArgs(args),
    granularity: validateGranularity(args.granularity),
  };

  return validatedArgs;
}

/**
 * Validates template usage query arguments
 * @param args Query arguments to validate
 * @returns Validated and sanitized arguments
 */
export function validateTemplateUsageQueryArgs(args: TemplateUsageQueryArgs): TemplateUsageQueryArgs {
  const validatedArgs: TemplateUsageQueryArgs = {
    ...args,
    dateRange: validateDateRange(args.dateRange),
    companyId: validateCompanyId(args.companyId),
    limit: args.limit ? Math.max(1, Math.min(100, args.limit)) : 10, // Clamp between 1 and 100
  };

  return validatedArgs;
}

/**
 * Validates template effectiveness query arguments
 * @param args Query arguments to validate
 * @returns Validated and sanitized arguments
 */
export function validateTemplateEffectivenessQueryArgs(args: TemplateEffectivenessQueryArgs): TemplateEffectivenessQueryArgs {
  if (!args.templateIds || args.templateIds.length === 0) {
    throw new Error("At least one template ID must be provided");
  }

  const validatedArgs: TemplateEffectivenessQueryArgs = {
    ...args,
    templateIds: validateTemplateIds(args.templateIds) || [],
    dateRange: validateDateRange(args.dateRange),
    companyId: validateCompanyId(args.companyId),
  };

  if (validatedArgs.templateIds.length === 0) {
    throw new Error("No valid template IDs provided");
  }

  return validatedArgs;
}

/**
 * Validates update template analytics arguments
 * @param args Update arguments to validate
 * @returns Validated arguments
 */
export function validateUpdateTemplateAnalyticsArgs(args: UpdateTemplateAnalyticsArgs): UpdateTemplateAnalyticsArgs {
  if (!args.templateId || typeof args.templateId !== 'string' || args.templateId.trim().length === 0) {
    throw new Error("Invalid template ID provided");
  }

  const companyId = validateCompanyId(args.companyId);

  if (!args.date || typeof args.date !== 'string' || args.date.trim().length === 0) {
    throw new Error("Invalid date provided");
  }

  // Validate date format
  const date = new Date(args.date);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format provided");
  }

  // Validate numeric fields
  const validatedArgs: UpdateTemplateAnalyticsArgs = {
    templateId: args.templateId.trim(),
    companyId,
    date: args.date.trim(),
  };

  if (args.sent !== undefined) {
    if (typeof args.sent !== 'number' || args.sent < 0) {
      throw new Error('Invalid sent value: must be a non-negative number');
    }
    validatedArgs.sent = args.sent;
  }
  if (args.delivered !== undefined) {
    if (typeof args.delivered !== 'number' || args.delivered < 0) {
      throw new Error('Invalid delivered value: must be a non-negative number');
    }
    validatedArgs.delivered = args.delivered;
  }
  if (args.opened_tracked !== undefined) {
    if (typeof args.opened_tracked !== 'number' || args.opened_tracked < 0) {
      throw new Error('Invalid opened_tracked value: must be a non-negative number');
    }
    validatedArgs.opened_tracked = args.opened_tracked;
  }
  if (args.clicked_tracked !== undefined) {
    if (typeof args.clicked_tracked !== 'number' || args.clicked_tracked < 0) {
      throw new Error('Invalid clicked_tracked value: must be a non-negative number');
    }
    validatedArgs.clicked_tracked = args.clicked_tracked;
  }
  if (args.replied !== undefined) {
    if (typeof args.replied !== 'number' || args.replied < 0) {
      throw new Error('Invalid replied value: must be a non-negative number');
    }
    validatedArgs.replied = args.replied;
  }
  if (args.bounced !== undefined) {
    if (typeof args.bounced !== 'number' || args.bounced < 0) {
      throw new Error('Invalid bounced value: must be a non-negative number');
    }
    validatedArgs.bounced = args.bounced;
  }
  if (args.unsubscribed !== undefined) {
    if (typeof args.unsubscribed !== 'number' || args.unsubscribed < 0) {
      throw new Error('Invalid unsubscribed value: must be a non-negative number');
    }
    validatedArgs.unsubscribed = args.unsubscribed;
  }
  if (args.spamComplaints !== undefined) {
    if (typeof args.spamComplaints !== 'number' || args.spamComplaints < 0) {
      throw new Error('Invalid spamComplaints value: must be a non-negative number');
    }
    validatedArgs.spamComplaints = args.spamComplaints;
  }
  if (args.usage !== undefined) {
    if (typeof args.usage !== 'number' || args.usage < 0) {
      throw new Error('Invalid usage value: must be a non-negative number');
    }
    validatedArgs.usage = args.usage;
  }

  return validatedArgs;
}

/**
 * Validates batch update template analytics arguments
 * @param args Batch update arguments to validate
 * @returns Validated arguments
 */
export function validateBatchUpdateTemplateAnalyticsArgs(args: BatchUpdateTemplateAnalyticsArgs): BatchUpdateTemplateAnalyticsArgs {
  if (!args.updates || !Array.isArray(args.updates) || args.updates.length === 0) {
    throw new Error("Updates array must be provided and non-empty");
  }

  if (args.updates.length > 1000) {
    throw new Error("Batch update limited to 1000 updates per request");
  }

  const companyId = validateCompanyId(args.companyId);

  const validatedUpdates = args.updates.map(update => validateUpdateTemplateAnalyticsArgs(update));

  return {
    updates: validatedUpdates,
    companyId,
  };
}
