import { CampaignAnalyticsQueryArgs } from "./types";

/**
 * Validates campaign IDs array
 * @param campaignIds Array of campaign IDs to validate
 * @returns Validated campaign IDs
 */
export function validateCampaignIds(campaignIds?: string[]): string[] | undefined {
  if (!campaignIds || campaignIds.length === 0) {
    return undefined;
  }

  // Filter out empty strings and duplicates
  const validIds = campaignIds.filter(id => id && id.trim().length > 0);
  return [...new Set(validIds)]; // Remove duplicates
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
 * Validates query arguments comprehensively
 * @param args Query arguments to validate
 * @returns Validated and sanitized arguments
 */
export function validateQueryArgs(args: CampaignAnalyticsQueryArgs): CampaignAnalyticsQueryArgs {
  const validatedArgs: CampaignAnalyticsQueryArgs = {
    ...args,
    campaignIds: validateCampaignIds(args.campaignIds),
    dateRange: validateDateRange(args.dateRange),
    companyId: validateCompanyId(args.companyId),
  };

  return validatedArgs;
}
