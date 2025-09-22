// ============================================================================
// MAILBOX ANALYTICS SERVICE MUTATIONS - Mutation handler functions
// ============================================================================

import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { WarmupStatus } from "@/types/analytics/domain-specific";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { createAnalyticsConvexHelper } from "@/lib/utils/convex-query-helper";
import { validateMailboxAnalyticsUpdate, validateWarmupAnalyticsUpdate } from "./validation";
import { MailboxAnalyticsUpdate, WarmupAnalyticsUpdate, BatchUpdateResult } from "./types";

/**
 * Updates mailbox analytics data.
 * Updates or inserts analytics data for a specific mailbox.
 *
 * @param data - The mailbox analytics update data
 * @returns Promise resolving to the ID of the updated/created record
 */
export async function updateAnalytics(data: MailboxAnalyticsUpdate): Promise<string> {
  // Validate the input data
  validateMailboxAnalyticsUpdate(data);

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexHelper = createAnalyticsConvexHelper(convex, "MailboxAnalyticsService");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await convexHelper.mutation<string>(api.mailboxAnalytics.upsertMailboxAnalytics, {
      mailboxId: data.mailboxId,
      email: data.email,
      domain: data.domain,
      provider: data.provider,
      companyId: data.companyId,
      date: data.date,
      sent: data.sent,
      delivered: data.delivered,
      opened_tracked: data.opened_tracked,
      clicked_tracked: data.clicked_tracked,
      replied: data.replied,
      bounced: data.bounced,
      unsubscribed: data.unsubscribed,
      spamComplaints: data.spamComplaints,
      warmupStatus: data.warmupStatus as string,
      warmupProgress: data.warmupProgress,
      dailyLimit: data.dailyLimit,
      currentVolume: data.currentVolume,
    }, {
      serviceName: "MailboxAnalyticsService",
      methodName: "updateAnalytics"
    });

    console.log(`Updated analytics for mailbox: ${data.mailboxId}`);
    return result;
  } catch (error) {
    const normalized = error instanceof AnalyticsError ? error :
      new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Failed to update mailbox analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "mailboxes",
        true
      );
    throw normalized;
  }
}

/**
 * Updates warmup analytics data.
 * Updates or inserts warmup-specific analytics data.
 *
 * @param data - The warmup analytics update data
 * @returns Promise resolving to the ID of the updated/created record
 */
export async function updateWarmupAnalytics(data: WarmupAnalyticsUpdate): Promise<string> {
  // Validate the input data
  validateWarmupAnalyticsUpdate(data);

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexHelper = createAnalyticsConvexHelper(convex, "MailboxAnalyticsService");
    const result = await convexHelper.mutation<string>(api.mailboxAnalytics.upsertWarmupAnalytics, {
      mailboxId: data.mailboxId,
      date: data.date,
      sent: data.sent,
      delivered: data.delivered,
      replies: data.replies,
      spamComplaints: data.spamComplaints,
      warmupStatus: data.warmupStatus as string,
      warmupProgress: data.warmupProgress,
    }, {
      serviceName: "MailboxAnalyticsService",
      methodName: "updateWarmupAnalytics"
    });

    console.log(`Updated warmup analytics for mailbox: ${data.mailboxId}`);
    return result;
  } catch (error) {
    const normalized = error instanceof AnalyticsError ? error :
      new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Failed to update warmup analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "mailboxes",
        true
      );
    throw normalized;
  }
}

/**
 * Performs batch updates of mailbox analytics data.
 * Updates multiple mailbox analytics records in a single operation.
 *
 * @param updates - Array of mailbox analytics updates
 * @returns Promise resolving to batch update results
 */
export async function batchUpdateAnalytics(updates: MailboxAnalyticsUpdate[]): Promise<BatchUpdateResult> {
  if (!updates || updates.length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "At least one update is required for batch operation",
      "mailboxes",
      false
    );
  }

  // Validate all updates before processing
  const validationErrors: string[] = [];
  updates.forEach((update, index) => {
    try {
      validateMailboxAnalyticsUpdate(update);
    } catch (error) {
      validationErrors.push(`Update ${index}: ${error instanceof Error ? error.message : 'Validation failed'}`);
    }
  });

  if (validationErrors.length > 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      `Batch validation failed:\n${validationErrors.join('\n')}`,
      "mailboxes",
      false
    );
  }

  const results: Array<{ id: string; success: boolean; error?: string }> = [];
  let processed = 0;

  try {
    // Process updates in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      // Process batch in parallel
      const batchPromises = batch.map(async (update) => {
        try {
          const resultId = await updateAnalytics(update);
          return { id: update.mailboxId, success: true, resultId };
        } catch (error) {
          return {
            id: update.mailboxId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      processed += batch.length;

      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${batch.length} updates`);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Batch update completed: ${successCount}/${updates.length} successful`);

    return {
      success: successCount === updates.length,
      processed,
      results,
    };
  } catch (error) {
    const normalized = error instanceof AnalyticsError ? error :
      new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Batch update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "mailboxes",
        true
      );
    throw normalized;
  }
}

/**
 * Performs batch updates of warmup analytics data.
 * Updates multiple warmup analytics records in a single operation.
 *
 * @param updates - Array of warmup analytics updates
 * @returns Promise resolving to batch update results
 */
export async function batchUpdateWarmupAnalytics(updates: WarmupAnalyticsUpdate[]): Promise<BatchUpdateResult> {
  if (!updates || updates.length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "At least one warmup update is required for batch operation",
      "mailboxes",
      false
    );
  }

  // Validate all updates before processing
  const validationErrors: string[] = [];
  updates.forEach((update, index) => {
    try {
      validateWarmupAnalyticsUpdate(update);
    } catch (error) {
      validationErrors.push(`Update ${index}: ${error instanceof Error ? error.message : 'Validation failed'}`);
    }
  });

  if (validationErrors.length > 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      `Batch warmup validation failed:\n${validationErrors.join('\n')}`,
      "mailboxes",
      false
    );
  }

  const results: Array<{ id: string; success: boolean; error?: string }> = [];
  let processed = 0;

  try {
    // Process updates in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      // Process batch in parallel
      const batchPromises = batch.map(async (update) => {
        try {
          const resultId = await updateWarmupAnalytics(update);
          return { id: update.mailboxId, success: true, resultId };
        } catch (error) {
          return {
            id: update.mailboxId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      processed += batch.length;

      console.log(`Processed warmup batch ${Math.floor(i / batchSize) + 1}: ${batch.length} updates`);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Batch warmup update completed: ${successCount}/${updates.length} successful`);

    return {
      success: successCount === updates.length,
      processed,
      results,
    };
  } catch (error) {
    const normalized = error instanceof AnalyticsError ? error :
      new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Batch warmup update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "mailboxes",
        true
      );
    throw normalized;
  }
}

/**
 * Deletes mailbox analytics data.
 * Removes analytics data for a specific mailbox.
 *
 * @param mailboxId - ID of the mailbox to delete analytics for
 * @returns Promise resolving when deletion is complete
 */
export async function deleteMailboxAnalytics(mailboxId: string): Promise<void> {
  if (!mailboxId || mailboxId.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid mailbox ID is required for deletion",
      "mailboxes",
      false
    );
  }

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const convexHelper = createAnalyticsConvexHelper(convex, "MailboxAnalyticsService");
    await convexHelper.mutation<void>(api.mailboxAnalytics.deleteMailboxAnalytics, {
      mailboxId,
    }, {
      serviceName: "MailboxAnalyticsService",
      methodName: "deleteMailboxAnalytics"
    });

    console.log(`Deleted analytics data for mailbox: ${mailboxId}`);
  } catch (error) {
    const normalized = error instanceof AnalyticsError ? error :
      new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Failed to delete mailbox analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "mailboxes",
        true
      );
    throw normalized;
  }
}

/**
 * Initializes analytics tracking for a new mailbox.
 * Sets up initial analytics structure and tracking for a mailbox.
 *
 * @param mailboxId - ID of the mailbox to initialize
 * @param initialData - Initial mailbox data for analytics setup
 * @returns Promise resolving when initialization is complete
 */
export async function initializeMailboxAnalytics(
  mailboxId: string,
  initialData: {
    email: string;
    domain: string;
    provider: string;
    companyId: string;
    dailyLimit: number;
    warmupStatus: string;
  }
): Promise<string> {
  if (!mailboxId || mailboxId.trim().length === 0) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Valid mailbox ID is required for initialization",
      "mailboxes",
      false
    );
  }

  // Validate initial data
  if (!initialData.email || !initialData.domain || !initialData.provider || !initialData.companyId) {
    throw new AnalyticsError(
      AnalyticsErrorType.VALIDATION_ERROR,
      "Complete mailbox information is required for initialization",
      "mailboxes",
      false
    );
  }

  try {
    // Create initial analytics record
    const initialUpdate: MailboxAnalyticsUpdate = {
      mailboxId,
      email: initialData.email,
      domain: initialData.domain,
      provider: initialData.provider,
      companyId: initialData.companyId,
      date: new Date().toISOString().split('T')[0],
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
      warmupStatus: initialData.warmupStatus as WarmupStatus,
      warmupProgress: 0,
      dailyLimit: initialData.dailyLimit,
      currentVolume: 0,
    };

    const result = await updateAnalytics(initialUpdate);
    console.log(`Initialized analytics tracking for mailbox: ${mailboxId}`);
    return result;
  } catch (error) {
    const normalized = error instanceof AnalyticsError ? error :
      new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Failed to initialize mailbox analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "mailboxes",
        true
      );
    throw normalized;
  }
}
