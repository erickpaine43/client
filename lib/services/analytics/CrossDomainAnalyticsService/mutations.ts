import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { PerformanceMetrics } from "@/types/analytics/core";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";

/**
 * Update cross-domain analytics when mailbox data changes.
 */
export async function performUpdateCrossDomainAnalyticsMutation(
  convex: ConvexHttpClient,
  data: {
    mailboxId: string;
    domain: string;
    companyId: string;
    date: string;
    mailboxMetrics: PerformanceMetrics;
  },
  logger: {
    info: (message: string, data?: Record<string, unknown>) => void;
    error: (message: string, data?: Record<string, unknown>) => void;
  }
): Promise<{
  mailboxUpdated: string;
  domainUpdated: string;
  domainAnalyticsId: string;
  aggregatedMetrics: PerformanceMetrics;
}> {
  try {
    const convexHelper = createAnalyticsConvexHelper(convex, "CrossDomainAnalyticsService");

    logger.info("Cross-domain analytics update requested", { data });

    // Use the Convex helper to execute the mutation
    const result = await convexHelper.mutation<{
      mailboxUpdated: string;
      domainUpdated: string;
      domainAnalyticsId: string;
      aggregatedMetrics: PerformanceMetrics;
    }>(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      api.crossDomainAnalytics.mutations.updateCrossDomainAnalytics,
      {
        mailboxId: data.mailboxId,
        domain: data.domain,
        companyId: data.companyId,
        date: data.date,
        mailboxMetrics: data.mailboxMetrics,
      },
      {
        serviceName: "CrossDomainAnalyticsService",
        methodName: "performUpdateCrossDomainAnalyticsMutation",
      }
    );

    logger.info("Cross-domain analytics update successful", { result });

    return result;
  } catch (error) {
    logger.error("Update cross-domain analytics failed", { error, data });
    throw error;
  }
}
