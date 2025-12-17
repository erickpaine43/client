/**
 * Mutations for LeadAnalyticsService
 *
 * This module contains all mutation handlers for lead analytics operations.
 * Each function performs a specific Convex mutation, applies validation,
 * and returns typed results. No caching or side effects here - pure mutation logic.
 *
 * Dependencies:
 * - Convex api for database mutations
 * - Validation from sibling modules
 * - Types from ./types.ts
 *
 * Usage:
 * - Called from index.ts
 * - Functions take convex client, data, and logger
 * - Return Promises of result types
 */

import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";
import type { LeadAnalyticsUpdatePayload } from "./types";
import { validateLeadUpdatePayload } from "./validation";

/**
 * Perform update analytics mutation.
 * Validates payload, performs Convex mutation, returns result.
 *
 * @param convex - Convex client
 * @param data - Update payload
 * @param logger - Logger instance
 * @returns Promise<string>
 */
export async function performUpdateAnalyticsMutation(
  convex: ConvexHttpClient,
  data: LeadAnalyticsUpdatePayload,
  logger: { info: (message: string, data?: Record<string, unknown>) => void; warn: (message: string, data?: Record<string, unknown>) => void; error: (message: string, data?: Record<string, unknown>) => void }
): Promise<string> {
  validateLeadUpdatePayload(data);

  const convexHelper = createAnalyticsConvexHelper(convex, "LeadAnalyticsService");
  const result = await convexHelper.mutation(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    api.leadAnalytics.upsertLeadAnalytics,
    {
      ...data,
      companyId: await getCompanyId(),
    },
    {
      serviceName: "LeadAnalyticsService",
      methodName: "performUpdateAnalyticsMutation",
    }
  );

  logger.info("Lead analytics updated", { leadId: data.leadId });

  // Type assertion for Convex platform limitation
  return result as string;
}

/**
 * Get company ID from context.
 * TODO: Implement proper retrieval from user session.
 */
async function getCompanyId(): Promise<string> {
  return process.env.COMPANY_ID || "company-123";
}
