/**
 * Template analytics module
 * 
 * This module handles template analytics operations including usage tracking,
 * performance metrics, and analytics data retrieval for templates.
 */

"use server";

import { ActionResult } from "@/lib/actions/core/types";
import { withAuth, withContextualRateLimit, RateLimits } from "@/lib/actions/core/auth";
import { ErrorFactory, withErrorHandling } from "@/lib/actions/core/errors";
import { validateTemplateId } from "./validation";
import { nile } from "@/app/api/[...nile]/nile";

/**
 * Template usage statistics interface
 */
export interface TemplateUsageStats {
  templateId: number;
  templateName: string;
  templateType: "template" | "quick-reply";
  totalUsage: number;
  lastUsed: string | null;
  averageUsagePerWeek: number;
  usageRank: number;
  category: string;
}

/**
 * Template performance metrics interface
 */
export interface TemplatePerformanceMetrics {
  templateId: number;
  templateName: string;
  openRate: number;
  replyRate: number;
  clickRate: number;
  bounceRate: number;
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  totalClicked: number;
  totalBounced: number;
}

/**
 * Template analytics summary interface
 */
export interface TemplateAnalyticsSummary {
  totalTemplates: number;
  totalQuickReplies: number;
  totalUsage: number;
  averageUsagePerTemplate: number;
  mostUsedTemplate: TemplateUsageStats | null;
  leastUsedTemplate: TemplateUsageStats | null;
  topPerformingTemplate: TemplatePerformanceMetrics | null;
  usageByCategory: Record<string, number>;
  usageByWeek: Array<{ week: string; usage: number }>;
}

/**
 * Get template usage statistics
 */
export async function getTemplateUsageStats(
  filters?: {
    templateId?: string;
    type?: "template" | "quick-reply";
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ActionResult<TemplateUsageStats[]>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-template-usage-stats',
      'user',
      RateLimits.ANALYTICS_QUERY,
      async () => {
        return withErrorHandling(async () => {
          try {
            // Build dynamic query based on filters
            let whereClause = "WHERE t.tenant_id = CURRENT_TENANT_ID()";
            const queryParams: (string | number | undefined)[] = [];
            let paramIndex = 1;

            if (filters?.templateId) {
              const idValidation = validateTemplateId(filters.templateId);
              if (!idValidation.success) {
                return { success: false, error: idValidation.error };
              }
              whereClause += ` AND t.id = $${paramIndex++}`;
              queryParams.push(idValidation.data);
            }

            if (filters?.type) {
              whereClause += ` AND t.type = $${paramIndex++}`;
              queryParams.push(filters.type);
            }

            if (filters?.category) {
              whereClause += ` AND t.category = $${paramIndex++}`;
              queryParams.push(filters.category);
            }

            const limit = Math.min(filters?.limit || 50, 100);
            const offset = filters?.offset || 0;

            const query = `
              SELECT 
                t.id as "templateId",
                t.name as "templateName",
                t.type as "templateType",
                COALESCE(t.usage, 0) as "totalUsage",
                t.last_used as "lastUsed",
                t.category,
                RANK() OVER (ORDER BY COALESCE(t.usage, 0) DESC) as "usageRank",
                CASE 
                  WHEN t.created_at > CURRENT_DATE - INTERVAL '7 days' THEN 0
                  ELSE COALESCE(t.usage, 0) / GREATEST(EXTRACT(days FROM (CURRENT_DATE - t.created_at::date)) / 7.0, 1)
                END as "averageUsagePerWeek"
              FROM templates t
              ${whereClause}
              ORDER BY COALESCE(t.usage, 0) DESC
              LIMIT $${paramIndex++} OFFSET $${paramIndex++}
            `;

            queryParams.push(limit, offset);

            const result = await nile.db.query(query, queryParams);

            const stats: TemplateUsageStats[] = (result as {
              templateId: number;
              templateName: string;
              templateType: string;
              totalUsage: number;
              lastUsed: string | null;
              category: string;
              usageRank: number;
              averageUsagePerWeek: string;
            }[]).map((row) => ({
              templateId: row.templateId,
              templateName: row.templateName,
              templateType: row.templateType as "template" | "quick-reply",
              totalUsage: row.totalUsage,
              lastUsed: row.lastUsed,
              averageUsagePerWeek: parseFloat(row.averageUsagePerWeek) || 0,
              usageRank: row.usageRank,
              category: row.category,
            }));

            return {
              success: true,
              data: stats,
            };
          } catch (dbError) {
            console.error("Database error in getTemplateUsageStats:", dbError);
            return ErrorFactory.database("Failed to retrieve template usage statistics");
          }
        });
      }
    );
  });
}

/**
 * Get template performance metrics (placeholder - would integrate with email analytics)
 */
export async function getTemplatePerformanceMetrics(
  templateId?: string
): Promise<ActionResult<TemplatePerformanceMetrics[]>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-template-performance-metrics',
      'user',
      RateLimits.ANALYTICS_QUERY,
      async () => {
        return withErrorHandling(async () => {
          // Validate template ID if provided
          if (templateId) {
            const idValidation = validateTemplateId(templateId);
            if (!idValidation.success) {
              return { success: false, error: idValidation.error };
            }
          }

          try {
            // This is a placeholder implementation
            // In a real system, this would query email campaign analytics
            // to get open rates, reply rates, etc. for templates
            
            let whereClause = "WHERE t.tenant_id = CURRENT_TENANT_ID()";
            const queryParams: number[] = [];

            if (templateId) {
              whereClause += " AND t.id = $1";
              queryParams.push(parseInt(templateId));
            }

            const query = `
              SELECT 
                t.id as "templateId",
                t.name as "templateName",
                0 as "openRate",
                0 as "replyRate", 
                0 as "clickRate",
                0 as "bounceRate",
                0 as "totalSent",
                0 as "totalOpened",
                0 as "totalReplied",
                0 as "totalClicked",
                0 as "totalBounced"
              FROM templates t
              ${whereClause}
              ORDER BY t.name
            `;

            const result = await nile.db.query(query, queryParams);

            const metrics: TemplatePerformanceMetrics[] = (result as {
              templateId: number;
              templateName: string;
              openRate: number;
              replyRate: number;
              clickRate: number;
              bounceRate: number;
              totalSent: number;
              totalOpened: number;
              totalReplied: number;
              totalClicked: number;
              totalBounced: number;
            }[]).map((row) => ({
              templateId: row.templateId,
              templateName: row.templateName,
              openRate: row.openRate,
              replyRate: row.replyRate,
              clickRate: row.clickRate,
              bounceRate: row.bounceRate,
              totalSent: row.totalSent,
              totalOpened: row.totalOpened,
              totalReplied: row.totalReplied,
              totalClicked: row.totalClicked,
              totalBounced: row.totalBounced,
            }));

            return {
              success: true,
              data: metrics,
            };
          } catch (dbError) {
            console.error("Database error in getTemplatePerformanceMetrics:", dbError);
            return ErrorFactory.database("Failed to retrieve template performance metrics");
          }
        });
      }
    );
  });
}

/**
 * Get template analytics summary
 */
export async function getTemplateAnalyticsSummary(): Promise<ActionResult<TemplateAnalyticsSummary>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-template-analytics-summary',
      'user',
      RateLimits.ANALYTICS_QUERY,
      async () => {
        return withErrorHandling(async () => {
          try {
            // Get basic counts
            const countsQuery = `
              SELECT 
                COUNT(CASE WHEN type = 'template' THEN 1 END) as "totalTemplates",
                COUNT(CASE WHEN type = 'quick-reply' THEN 1 END) as "totalQuickReplies",
                SUM(COALESCE(usage, 0)) as "totalUsage",
                AVG(COALESCE(usage, 0)) as "averageUsagePerTemplate"
              FROM templates
              WHERE tenant_id = CURRENT_TENANT_ID()
            `;

            const countsResult = await nile.db.query(countsQuery);
            const counts = countsResult[0] || {};

            // Get most and least used templates
            const extremesQuery = `
              (SELECT 
                id as "templateId",
                name as "templateName",
                type as "templateType",
                COALESCE(usage, 0) as "totalUsage",
                last_used as "lastUsed",
                category,
                1 as "usageRank",
                0 as "averageUsagePerWeek"
              FROM templates
              WHERE tenant_id = CURRENT_TENANT_ID()
              ORDER BY COALESCE(usage, 0) DESC
              LIMIT 1)
              UNION ALL
              (SELECT 
                id as "templateId",
                name as "templateName",
                type as "templateType",
                COALESCE(usage, 0) as "totalUsage",
                last_used as "lastUsed",
                category,
                999 as "usageRank",
                0 as "averageUsagePerWeek"
              FROM templates
              WHERE tenant_id = CURRENT_TENANT_ID()
              ORDER BY COALESCE(usage, 0) ASC
              LIMIT 1)
            `;

            const extremesResult = await nile.db.query(extremesQuery);
            const mostUsed = extremesResult.find((r: { templateId: number; templateName: string; templateType: string; totalUsage: number; lastUsed: string | null; category: string; usageRank: number; averageUsagePerWeek: number }) => r.usageRank === 1) || null;
            const leastUsed = extremesResult.find((r: { templateId: number; templateName: string; templateType: string; totalUsage: number; lastUsed: string | null; category: string; usageRank: number; averageUsagePerWeek: number }) => r.usageRank === 999) || null;

            // Get usage by category
            const categoryQuery = `
              SELECT 
                category,
                SUM(COALESCE(usage, 0)) as "usage"
              FROM templates
              WHERE tenant_id = CURRENT_TENANT_ID()
              GROUP BY category
              ORDER BY SUM(COALESCE(usage, 0)) DESC
            `;

            const categoryResult = await nile.db.query(categoryQuery);
            const usageByCategory: Record<string, number> = {};
            categoryResult.forEach((row: { category: string; usage: number }) => {
              usageByCategory[row.category] = row.usage;
            });

            // Get usage by week (last 8 weeks)
            const weeklyQuery = `
              SELECT 
                DATE_TRUNC('week', created_at) as "week",
                COUNT(*) as "usage"
              FROM templates
              WHERE tenant_id = CURRENT_TENANT_ID()
                AND created_at >= CURRENT_DATE - INTERVAL '8 weeks'
              GROUP BY DATE_TRUNC('week', created_at)
              ORDER BY DATE_TRUNC('week', created_at)
            `;

            const weeklyResult = await nile.db.query(weeklyQuery);
            const usageByWeek = weeklyResult.map((row: { week: string; usage: number }) => ({
              week: row.week,
              usage: row.usage,
            }));

            const summary: TemplateAnalyticsSummary = {
              totalTemplates: counts.totalTemplates || 0,
              totalQuickReplies: counts.totalQuickReplies || 0,
              totalUsage: counts.totalUsage || 0,
              averageUsagePerTemplate: parseFloat(counts.averageUsagePerTemplate) || 0,
              mostUsedTemplate: mostUsed ? {
                templateId: mostUsed.templateId,
                templateName: mostUsed.templateName,
                templateType: mostUsed.templateType,
                totalUsage: mostUsed.totalUsage,
                lastUsed: mostUsed.lastUsed,
                averageUsagePerWeek: mostUsed.averageUsagePerWeek,
                usageRank: mostUsed.usageRank,
                category: mostUsed.category,
              } : null,
              leastUsedTemplate: leastUsed ? {
                templateId: leastUsed.templateId,
                templateName: leastUsed.templateName,
                templateType: leastUsed.templateType,
                totalUsage: leastUsed.totalUsage,
                lastUsed: leastUsed.lastUsed,
                averageUsagePerWeek: leastUsed.averageUsagePerWeek,
                usageRank: leastUsed.usageRank,
                category: leastUsed.category,
              } : null,
              topPerformingTemplate: null, // Would be populated from email analytics
              usageByCategory,
              usageByWeek,
            };

            return {
              success: true,
              data: summary,
            };
          } catch (dbError) {
            console.error("Database error in getTemplateAnalyticsSummary:", dbError);
            return ErrorFactory.database("Failed to retrieve template analytics summary");
          }
        });
      }
    );
  });
}

/**
 * Track template usage (called when a template is used in a campaign or email)
 */
export async function trackTemplateUsage(
  templateId: string,
  context?: {
    campaignId?: number;
    emailId?: number;
    userId?: string;
  }
): Promise<ActionResult<void>> {
  return withAuth(async (authContext) => {
    return withContextualRateLimit(
      'track-template-usage',
      'user',
      RateLimits.GENERAL_WRITE,
      async () => {
        return withErrorHandling(async () => {
          // Validate template ID
          const idValidation = validateTemplateId(templateId);
          if (!idValidation.success) {
            return { success: false, error: idValidation.error };
          }

          const numericTemplateId = idValidation.data;

          try {
            // Update template usage counter and last used timestamp
            await nile.db.query(`
              UPDATE templates
              SET usage = COALESCE(usage, 0) + 1,
                  last_used = CURRENT_TIMESTAMP,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $1 AND tenant_id = CURRENT_TENANT_ID()
            `, [numericTemplateId]);

            // Optionally, insert detailed usage tracking record
            // This would be useful for more detailed analytics
            if (context) {
              try {
                await nile.db.query(`
                  INSERT INTO template_usage_log (
                    template_id, user_id, campaign_id, email_id, used_at, tenant_id
                  ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TENANT_ID())
                `, [
                  numericTemplateId,
                  context.userId || authContext.userId,
                  context.campaignId || null,
                  context.emailId || null
                ]);
              } catch (logError) {
                // Log error but don't fail the main operation
                console.warn("Failed to log template usage details:", logError);
              }
            }

            return {
              success: true,
            };
          } catch (dbError) {
            console.error("Database error tracking template usage:", dbError);
            return ErrorFactory.database("Failed to track template usage");
          }
        });
      }
    );
  });
}

/**
 * Get template usage trends over time
 */
export async function getTemplateUsageTrends(
  templateId?: string,
  days: number = 30
): Promise<ActionResult<Array<{ date: string; usage: number }>>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-template-usage-trends',
      'user',
      RateLimits.ANALYTICS_QUERY,
      async () => {
        return withErrorHandling(async () => {
          // Validate template ID if provided
          if (templateId) {
            const idValidation = validateTemplateId(templateId);
            if (!idValidation.success) {
              return { success: false, error: idValidation.error };
            }
          }

          // Validate days parameter
          if (days < 1 || days > 365) {
            return ErrorFactory.validation("Days must be between 1 and 365");
          }

          try {
            let whereClause = "WHERE tul.tenant_id = CURRENT_TENANT_ID()";
            const queryParams: (number | string)[] = [days];
            let paramIndex = 2;

            if (templateId) {
              whereClause += ` AND tul.template_id = $${paramIndex++}`;
              queryParams.push(parseInt(templateId));
            }

            const query = `
              SELECT 
                DATE(tul.used_at) as "date",
                COUNT(*) as "usage"
              FROM template_usage_log tul
              ${whereClause}
                AND tul.used_at >= CURRENT_DATE - INTERVAL '$1 days'
              GROUP BY DATE(tul.used_at)
              ORDER BY DATE(tul.used_at)
            `;

            const result = await nile.db.query(query, queryParams);

            const trends = (result as { date: string; usage: number }[]).map((row) => ({
              date: row.date,
              usage: row.usage,
            }));

            return {
              success: true,
              data: trends,
            };
          } catch (dbError) {
            console.error("Database error in getTemplateUsageTrends:", dbError);
            // Return empty trends if usage log table doesn't exist
            return {
              success: true,
              data: [],
            };
          }
        });
      }
    );
  });
}
