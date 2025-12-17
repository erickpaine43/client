import { CrossDomainAnalyticsQueryArgs } from "./types";

/**
 * Validates domain IDs array
 * @param domainIds Array of domain IDs to validate
 * @returns Validated domain IDs
 */
export function validateDomainIds(domainIds?: string[]): string[] | undefined {
  if (!domainIds || domainIds.length === 0) {
    return undefined;
  }

  // Filter out empty strings and duplicates
  const validIds = domainIds.filter(id => id && id.trim().length > 0);
  return Array.from(new Set(validIds)); // Remove duplicates
}

/**
 * Validates mailbox IDs array
 * @param mailboxIds Array of mailbox IDs to validate
 * @returns Validated mailbox IDs
 */
export function validateMailboxIds(mailboxIds?: string[]): string[] | undefined {
  if (!mailboxIds || mailboxIds.length === 0) {
    return undefined;
  }

  // Filter out empty strings and duplicates
  const validIds = mailboxIds.filter(id => id && id.trim().length > 0);
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
 * Validates granularity parameter
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
 * Validates query arguments comprehensively
 * @param args Query arguments to validate
 * @returns Validated and sanitized arguments
 */
export function validateQueryArgs(args: CrossDomainAnalyticsQueryArgs): CrossDomainAnalyticsQueryArgs {
  const validatedArgs: CrossDomainAnalyticsQueryArgs = {
    ...args,
    domainIds: validateDomainIds(args.domainIds),
    mailboxIds: validateMailboxIds(args.mailboxIds),
    dateRange: validateDateRange(args.dateRange),
    companyId: validateCompanyId(args.companyId),
    granularity: validateGranularity(args.granularity),
  };

  return validatedArgs;
}

/**
 * Validates domain ID (for impact analysis)
 * @param domainId Domain ID to validate
 * @returns Validated domain ID
 */
export function validateDomainId(domainId: string): string {
  if (!domainId || typeof domainId !== 'string' || domainId.trim().length === 0) {
    throw new Error("Invalid domain ID provided");
  }
  return domainId.trim();
}
