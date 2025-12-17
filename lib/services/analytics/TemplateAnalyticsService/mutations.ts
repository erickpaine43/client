/**
 * Mutation handlers for TemplateAnalyticsService
 * 
 * This module contains all write operations (mutations) for template analytics,
 * including single and batch updates. Each handler:
 * - Validates inputs using validation.ts
 * - Performs Convex mutation
 * - Logs success (logger passed in)
 * - Returns success indicator or error
 * 
 * No caching here - invalidation handled in index.ts via base service.
 * Functions are designed to be called from the service class methods.
 * 
 * Dependencies:
 * - ConvexHttpClient for mutations
 * - api.templateAnalytics.* for mutation definitions
 * - Types and validation from sibling modules
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";
import type {
  TemplateAnalyticsUpdatePayload,
  TemplateAnalyticsBatchUpdatePayload
} from "./types";
import {
  validateTemplateUpdatePayload,
  validateTemplateBatchUpdatePayload
} from "./validation";

/**
 * Perform single template analytics update mutation.
 * Validates payload, mutates via Convex, logs success.
 * 
 * @param convex - Convex client instance
 * @param payload - Validated update payload
 * @param logger - Logger for success logging
 * @returns void (throws on failure)
 * @throws {AnalyticsError} on validation or mutation failure
 */
export async function performUpdateAnalyticsMutation(
  convex: ConvexHttpClient,
  payload: TemplateAnalyticsUpdatePayload,
  logger: { info: (msg: string, data?: Record<string, unknown>) => void }
): Promise<void> {
  validateTemplateUpdatePayload(payload);
  const convexHelper = createAnalyticsConvexHelper(convex, "TemplateAnalyticsService");

  try {
    await convexHelper.mutation<void>(
      api.templateAnalytics.updateTemplateAnalytics,
      payload as unknown as Record<string, unknown>,
      {
        serviceName: "TemplateAnalyticsService",
        methodName: "performUpdateAnalyticsMutation",
      }
    );

    logger.info("Template analytics updated", {
      templateId: payload.templateId,
      date: payload.date,
      usage: payload.usage,
    });
  } catch (error) {
    if (error instanceof AnalyticsError) throw error;
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to update template analytics: ${error}`,
      "templates"
    );
  }
}

/**
 * Perform batch template analytics update mutation.
 * Validates payloads, mutates via Convex, logs batch success.
 * 
 * @param convex - Convex client instance
 * @param payloads - Validated batch update payloads
 * @param logger - Logger for success logging
 * @returns void (throws on failure)
 * @throws {AnalyticsError} on validation or mutation failure
 */
export async function performBatchUpdateAnalyticsMutation(
  convex: ConvexHttpClient,
  payloads: TemplateAnalyticsBatchUpdatePayload,
  logger: { info: (msg: string, data?: Record<string, unknown>) => void }
): Promise<void> {
  validateTemplateBatchUpdatePayload(payloads);
  const convexHelper = createAnalyticsConvexHelper(convex, "TemplateAnalyticsService");

  try {
    const companyId = payloads[0].companyId;
    const updates = payloads.map(({ templateId, sent, delivered, opened_tracked, clicked_tracked, replied, bounced, unsubscribed, spamComplaints, usage }) => ({
      templateId,
      sent,
      delivered,
      opened_tracked,
      clicked_tracked,
      replied,
      bounced,
      unsubscribed,
      spamComplaints,
      usage,
    }));
    
    const result = await convexHelper.mutation<{ success: boolean; processed: number; results: Array<{ id: string; action: string }> }>(
      api.templateAnalytics.batchUpdateTemplateAnalytics,
      { companyId, updates },
      {
        serviceName: "TemplateAnalyticsService",
        methodName: "performBatchUpdateAnalyticsMutation",
      }
    );
  
    logger.info("Template analytics batch updated", {
      count: payloads.length,
      results: result.results.length,
    });
  } catch (error) {
    if (error instanceof AnalyticsError) throw error;
    throw new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      `Failed to batch update template analytics: ${error}`,
      "templates"
    );
  }
}
