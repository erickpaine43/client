import type { DatabaseReader } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { validateCompanyId, validateDateRange, normalizeMailboxIds } from "./validation";

/**
 * Common data fetching utilities for mailbox analytics queries.
 * Centralizes the complex index optimization logic to avoid duplication.
 */

/**
 * Fetch mailbox analytics data with optimized index usage.
 * Automatically chooses the best index strategy based on query parameters.
 */
export async function fetchMailboxAnalyticsData(
  db: DatabaseReader,
  args: {
    companyId: string;
    mailboxIds?: string[];
    dateRange?: { start: string; end: string };
  }
): Promise<Doc<"mailboxAnalytics">[]> {
  // Input validation
  validateCompanyId(args.companyId);
  
  if (args.dateRange) {
    validateDateRange(args.dateRange);
  }
  
  const normalizedMailboxIds = normalizeMailboxIds(args.mailboxIds);

  // Optimize index usage based on query parameters
  let results: Doc<"mailboxAnalytics">[];

  if (normalizedMailboxIds && normalizedMailboxIds.length <= 5) {
    // Use by_company_mailbox index when filtering by specific mailboxIds (small set)
    const mailboxQueries = normalizedMailboxIds.map(mailboxId =>
      db
        .query("mailboxAnalytics")
        .withIndex("by_company_mailbox", (q) => 
          q.eq("companyId", args.companyId).eq("mailboxId", mailboxId)
        )
        .collect()
    );
    
    const mailboxResults = await Promise.all(mailboxQueries);
    results = mailboxResults.flat();
    
    // Apply date filtering if specified
    if (args.dateRange) {
      results = results.filter((record) =>
        record.date >= args.dateRange!.start && record.date <= args.dateRange!.end
      );
    }
  } else {
    // Use by_company_date index when filtering by date range or large mailbox sets
    let query = db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    if (args.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    results = await query.collect();

    // Implement post-filtering when index usage isn't optimal
    if (normalizedMailboxIds && normalizedMailboxIds.length > 0) {
      // Create a Set for O(1) lookup performance with large mailbox lists
      const mailboxIdSet = new Set(normalizedMailboxIds);
      results = results.filter((record) => mailboxIdSet.has(record.mailboxId));
    }
  }

  // Add query optimization for large datasets - sort deterministically
  return results.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.mailboxId.localeCompare(b.mailboxId);
  });
}

/**
 * Fetch warmup analytics data with company and mailbox filtering.
 */
export async function fetchWarmupAnalyticsData(
  db: DatabaseReader,
  args: {
    companyId: string;
    mailboxIds?: string[];
    dateRange?: { start: string; end: string };
  }
): Promise<Doc<"warmupAnalytics">[]> {
  validateCompanyId(args.companyId);
  
  const normalizedMailboxIds = normalizeMailboxIds(args.mailboxIds);
  if (normalizedMailboxIds && normalizedMailboxIds.length === 0) {
    return [];
  }

  // Query warmup analytics data
  let query = db
    .query("warmupAnalytics")
    .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

  if (args.dateRange) {
    query = query.filter((q) =>
      q.and(
        q.gte(q.field("date"), args.dateRange!.start),
        q.lte(q.field("date"), args.dateRange!.end)
      )
    );
  }

  const warmupResults = await query.collect();
  
  // Filter by mailbox IDs if specified
  if (normalizedMailboxIds && normalizedMailboxIds.length > 0) {
    const mailboxIdSet = new Set(normalizedMailboxIds);
    return warmupResults.filter((record) => mailboxIdSet.has(record.mailboxId));
  }

  return warmupResults;
}

/**
 * Fetch recent mailbox analytics data (last 30 days) for health calculations.
 */
export async function fetchRecentMailboxData(
  db: DatabaseReader,
  companyId: string,
  mailboxIds?: string[]
): Promise<Doc<"mailboxAnalytics">[]> {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return fetchMailboxAnalyticsData(db, {
    companyId,
    mailboxIds,
    dateRange: { start: startDate, end: endDate }
  });
}
