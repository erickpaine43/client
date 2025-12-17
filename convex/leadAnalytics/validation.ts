import { LeadAnalyticsQueryArgs, LeadAnalyticsMutationArgs, LeadAnalyticsValidationResult } from "./types";

/**
 * Validate Lead Analytics Query Arguments
 * Ensures all required fields are present and properly formatted
 */
export function validateLeadAnalyticsQueryArgs(args: LeadAnalyticsQueryArgs): LeadAnalyticsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required companyId
  if (!args.companyId || typeof args.companyId !== "string") {
    errors.push("companyId is required and must be a string");
  }

  // Validate optional leadIds array
  if (args.leadIds !== undefined) {
    if (!Array.isArray(args.leadIds)) {
      errors.push("leadIds must be an array of strings");
    } else if (args.leadIds.some((id: unknown) => typeof id !== "string")) {
      errors.push("all leadIds must be strings");
    } else if (args.leadIds.length === 0) {
      warnings.push("leadIds array is empty, will return no results");
    }
  }

  // Validate dateRange object
  if (args.dateRange !== undefined) {
    if (!args.dateRange || typeof args.dateRange !== "object") {
      errors.push("dateRange must be an object with start and end properties");
    } else {
      const { start, end } = args.dateRange;

      if (!start || !end) {
        errors.push("dateRange must have both start and end properties");
      } else if (typeof start !== "string" || typeof end !== "string") {
        errors.push("dateRange start and end must be strings");
      } else {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          errors.push("dateRange start and end must be valid date strings");
        } else if (startDate > endDate) {
          errors.push("dateRange start date cannot be after end date");
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate Lead Analytics Mutation Arguments
 * Ensures mutation data is properly formatted and contains required fields
 */
export function validateLeadAnalyticsMutationArgs(args: LeadAnalyticsMutationArgs): LeadAnalyticsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required string fields
  if (!args.leadId || typeof args.leadId !== "string") {
    errors.push("leadId is required and must be a string");
  }
  if (!args.email || typeof args.email !== "string") {
    errors.push("email is required and must be a string");
  }
  if (!args.companyId || typeof args.companyId !== "string") {
    errors.push("companyId is required and must be a string");
  }
  if (!args.date || typeof args.date !== "string") {
    errors.push("date is required and must be a string");
  }

  // Optional company field
  if (args.company !== undefined && typeof args.company !== "string") {
    errors.push("company must be a string if provided");
  }

  // Required number fields
  if (typeof args.sent !== "number" || isNaN(args.sent) || args.sent < 0) {
    errors.push("sent must be a non-negative number");
  }
  if (typeof args.delivered !== "number" || isNaN(args.delivered) || args.delivered < 0) {
    errors.push("delivered must be a non-negative number");
  }
  if (typeof args.opened_tracked !== "number" || isNaN(args.opened_tracked) || args.opened_tracked < 0) {
    errors.push("opened_tracked must be a non-negative number");
  }
  if (typeof args.clicked_tracked !== "number" || isNaN(args.clicked_tracked) || args.clicked_tracked < 0) {
    errors.push("clicked_tracked must be a non-negative number");
  }
  if (typeof args.replied !== "number" || isNaN(args.replied) || args.replied < 0) {
    errors.push("replied must be a non-negative number");
  }
  if (typeof args.bounced !== "number" || isNaN(args.bounced) || args.bounced < 0) {
    errors.push("bounced must be a non-negative number");
  }
  if (typeof args.unsubscribed !== "number" || isNaN(args.unsubscribed) || args.unsubscribed < 0) {
    errors.push("unsubscribed must be a non-negative number");
  }
  if (typeof args.spamComplaints !== "number" || isNaN(args.spamComplaints) || args.spamComplaints < 0) {
    errors.push("spamComplaints must be a non-negative number");
  }

  // Validate status field
  const validStatuses = ["ACTIVE", "REPLIED", "BOUNCED", "UNSUBSCRIBED", "COMPLETED"];
  if (!args.status || !validStatuses.includes(args.status)) {
    errors.push(`status must be one of: ${validStatuses.join(", ")}`);
  }

  // Validate date format
  if (args.date) {
    const date = new Date(args.date);
    if (isNaN(date.getTime())) {
      errors.push("date must be a valid date string");
    }
  }

  // Validate email format (basic check)
  if (args.email && !args.email.includes("@")) {
    errors.push("email must be a valid email address");
  }

  // Check for unusual metric values
  if (args.sent > 0) {
    const totalInteractions = (args.opened_tracked || 0) + (args.clicked_tracked || 0) + (args.replied || 0);
    if (totalInteractions > args.sent) {
      warnings.push("interaction metrics exceed sent count, which may indicate data inconsistency");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate Date Range
 * Ensures date range is properly formatted and logical
 */
export function validateDateRange(dateRange?: { start: string; end: string }): void {
  if (!dateRange) return;

  const { start, end } = dateRange;

  if (!start || !end) {
    throw new Error("Date range must have both start and end dates");
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format in date range");
  }

  if (startDate > endDate) {
    throw new Error("Start date cannot be after end date");
  }
}

/**
 * Validate Lead IDs Array
 * Ensures lead IDs are properly formatted
 */
export function validateLeadIds(leadIds?: string[]): void {
  if (!leadIds) return;

  if (!Array.isArray(leadIds)) {
    throw new Error("leadIds must be an array");
  }

  if (leadIds.length === 0) {
    throw new Error("leadIds array cannot be empty");
  }

  for (const id of leadIds) {
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new Error("all leadIds must be non-empty strings");
    }
  }
}

/**
 * Sanitize Lead Analytics Query Arguments
 * Normalizes and sanitizes input arguments
 */
export function sanitizeLeadAnalyticsQueryArgs(args: LeadAnalyticsQueryArgs): LeadAnalyticsQueryArgs {
  const sanitized = { ...args };

  // Trim string values
  if (sanitized.companyId) {
    sanitized.companyId = sanitized.companyId.trim();
  }

  // Trim lead IDs
  if (sanitized.leadIds) {
    sanitized.leadIds = sanitized.leadIds.map(id => id.trim()).filter(id => id.length > 0);
  }

  return sanitized;
}

/**
 * Sanitize Lead Analytics Mutation Arguments
 * Normalizes and sanitizes mutation arguments
 */
export function sanitizeLeadAnalyticsMutationArgs(args: LeadAnalyticsMutationArgs): LeadAnalyticsMutationArgs {
  const sanitized = { ...args };

  // Trim string values
  sanitized.leadId = sanitized.leadId.trim();
  sanitized.email = sanitized.email.trim().toLowerCase();
  sanitized.companyId = sanitized.companyId.trim();

  if (sanitized.company) {
    sanitized.company = sanitized.company.trim();
  }

  return sanitized;
}

/**
 * Validate Company ID
 * Ensures company ID is properly formatted
 */
export function validateCompanyId(companyId: string): void {
  if (!companyId || typeof companyId !== "string") {
    throw new Error("companyId is required and must be a string");
  }

  if (companyId.trim().length === 0) {
    throw new Error("companyId cannot be empty");
  }
}

/**
 * Validate Granularity Parameter
 * Ensures time granularity is valid
 */
export function validateGranularity(granularity?: string): "day" | "week" | "month" {
  const validGranularities = ["day", "week", "month"];
  const defaultGranularity = "day" as const;

  if (!granularity) {
    return defaultGranularity;
  }

  if (!validGranularities.includes(granularity)) {
    throw new Error(`granularity must be one of: ${validGranularities.join(", ")}`);
  }

  return granularity as "day" | "week" | "month";
}
