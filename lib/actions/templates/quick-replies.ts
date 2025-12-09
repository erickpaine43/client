/**
 * Quick replies management module
 * 
 * This module handles quick reply operations including getting quick replies,
 * creating, updating, and managing quick reply templates.
 */

"use server";

import { Template, TemplateCategoryType } from "@/types/templates";
import { ActionResult } from "@/lib/actions/core/types";
import { withAuth, withContextualRateLimit, RateLimits } from "@/lib/actions/core/auth";
import { ErrorFactory, withErrorHandling } from "@/lib/actions/core/errors";
import { validateTemplateData, validateTemplateId } from "./validation";
import { nile } from "@/app/api/[...nile]/nile";
import { initialQuickReplies } from "@/lib/data/template.mock";

// Map mock data to Template type
function mapMockToTemplate(mockTemplate: typeof initialQuickReplies[0]): Template {
  return {
    id: mockTemplate.id,
    name: mockTemplate.name,
    body: mockTemplate.content || "",
    bodyHtml: mockTemplate.content || "",
    subject: mockTemplate.subject,
    content: mockTemplate.content,
    category: mockTemplate.category as TemplateCategoryType,
    folderId: mockTemplate.folderId || null,
    usage: mockTemplate.usage || 0,
    lastUsed: mockTemplate.lastUsed || "",
    isStarred: mockTemplate.isStarred || false,
    type: mockTemplate.type as "template" | "quick-reply",
    companyId: 1,
    description: mockTemplate.name,
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get quick replies for the authenticated user
 */
export async function getQuickReplies(): Promise<ActionResult<Template[]>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-quick-replies',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          try {
            // Fetch quick replies from database filtered by type
            const result = await nile.db.query(`
              SELECT id, name, body, body_html as "bodyHtml", subject, content, category,
                     folder_id as "folderId", usage,
                     last_used as "lastUsed", is_starred as "isStarred", type, tenant_id,
                     description, created_by_id as "createdById", created_at as "createdAt",
                     updated_at as "updatedAt"
              FROM templates
              WHERE type = 'quick-reply'
              ORDER BY created_at DESC
            `);

            // Define type for database result row
            interface DbTemplateRow {
              id: number;
              name: string;
              body: string | null;
              bodyHtml: string | null;
              subject: string | null;
              content: string | null;
              category: string;
              folderId: number | null;
              usage: number | null;
              lastUsed: string | null;
              isStarred: boolean | null;
              type: string;
              tenant_id: number;
              description: string | null;
              createdById: string | null;
              createdAt: Date;
              updatedAt: Date;
            }

            // Map database results to Template type
            const quickReplies: Template[] = (result as DbTemplateRow[]).map((row) => ({
              id: row.id,
              name: row.name,
              body: row.body || "",
              bodyHtml: row.bodyHtml || "",
              subject: row.subject || "",
              content: row.content || "",
              category: row.category as TemplateCategoryType,
              folderId: row.folderId,
              usage: row.usage || 0,
              lastUsed: row.lastUsed || "",
              isStarred: row.isStarred || false,
              type: row.type as "template" | "quick-reply",
              companyId: row.tenant_id,
              description: row.description || "",
              createdById: row.createdById,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            }));

            return {
              success: true,
              data: quickReplies,
            };
          } catch (dbError) {
            console.error("Database error in getQuickReplies, falling back to mock data:", dbError);
            // Fallback to mock data on database error
            const mockQuickReplies: Template[] = initialQuickReplies.map(mapMockToTemplate);
            return {
              success: true,
              data: mockQuickReplies,
            };
          }
        });
      }
    );
  });
}

/**
 * Get a specific quick reply by ID for the authenticated user
 */
export async function getQuickReplyById(id: string): Promise<ActionResult<Template | null>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-quick-reply-by-id',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          // Validate template ID
          const idValidation = validateTemplateId(id);
          if (!idValidation.success) {
            return ErrorFactory.validation(idValidation.error?.message || "Invalid template ID");
          }

          const templateId = idValidation.data;

          try {
            // Fetch quick reply from database by ID and type
            const result = await nile.db.query(`
              SELECT id, name, body, body_html as "bodyHtml", subject, content, category,
                     folder_id as "folderId", usage,
                     last_used as "lastUsed", is_starred as "isStarred", type, tenant_id,
                     description, created_by_id as "createdById", created_at as "createdAt",
                     updated_at as "updatedAt"
              FROM templates
              WHERE id = $1 AND type = 'quick-reply'
            `, [templateId]);

            // Define type for database result row
            interface DbTemplateRow {
              id: number;
              name: string;
              body: string | null;
              bodyHtml: string | null;
              subject: string | null;
              content: string | null;
              category: string;
              folderId: number | null;
              usage: number | null;
              lastUsed: string | null;
              isStarred: boolean | null;
              type: string;
              tenant_id: number;
              description: string | null;
              createdById: string | null;
              createdAt: Date;
              updatedAt: Date;
            }

            const row = (result as DbTemplateRow[])[0];
            if (!row) {
              return ErrorFactory.notFound("Quick reply");
            }

            // Map database result to Template type
            const quickReply: Template = {
              id: row.id,
              name: row.name,
              body: row.body || "",
              bodyHtml: row.bodyHtml || "",
              subject: row.subject || "",
              content: row.content || "",
              category: row.category as TemplateCategoryType,
              folderId: row.folderId,
              usage: row.usage || 0,
              lastUsed: row.lastUsed || "",
              isStarred: row.isStarred || false,
              type: row.type as "template" | "quick-reply",
              companyId: row.tenant_id,
              description: row.description || "",
              createdById: row.createdById,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            };

            return {
              success: true,
              data: quickReply,
            };
          } catch (dbError) {
            console.error("Database error in getQuickReplyById:", dbError);
            // Fallback to mock data
            const mockQuickReply = initialQuickReplies.find(template => template.id === templateId);
            
            if (!mockQuickReply) {
              return ErrorFactory.notFound("Quick reply");
            }

            const quickReply: Template = mapMockToTemplate(mockQuickReply);
            return {
              success: true,
              data: quickReply,
            };
          }
        });
      }
    );
  });
}

/**
 * Create a new quick reply
 */
export async function createQuickReply(data: {
  name: string;
  content: string;
  subject?: string;
  category?: TemplateCategoryType;
  folderId?: number;
}): Promise<ActionResult<Template>> {
  return withAuth(async (context) => {
    return withContextualRateLimit(
      'create-quick-reply',
      'user',
      RateLimits.TEMPLATE_CREATE,
      async () => {
        return withErrorHandling(async () => {
          // Validate template data
          const validation = validateTemplateData({
            name: data.name,
            content: data.content,
            subject: data.subject || "",
          });

          if (!validation.success) {
            return ErrorFactory.validation(validation.error?.message || "Validation failed");
          }

          const { name, content, subject } = validation.data!;

          try {
            // Create quick reply in database
            const result = await nile.db.query(`
              INSERT INTO templates (
                name, body, body_html, subject, content, category, folder_id, 
                usage, is_starred, type, tenant_id, description, created_by_id,
                created_at, updated_at
              )
              VALUES ($1, $2, $2, $3, $2, $4, $5, 0, false, 'quick-reply', 
                      CURRENT_TENANT_ID(), $1, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING id, name, body, body_html as "bodyHtml", subject, content, category,
                        folder_id as "folderId", usage,
                        last_used as "lastUsed", is_starred as "isStarred", type, tenant_id,
                        description, created_by_id as "createdById", created_at as "createdAt",
                        updated_at as "updatedAt"
            `, [
              name,
              content,
              subject,
              data.category || "FOLLOW_UP",
              data.folderId || null,
              context.userId
            ]);

            interface DbTemplateRow {
              id: number;
              name: string;
              body: string | null;
              bodyHtml: string | null;
              subject: string | null;
              content: string | null;
              category: string;
              folderId: number | null;
              usage: number | null;
              lastUsed: string | null;
              isStarred: boolean | null;
              type: string;
              tenant_id: number;
              description: string | null;
              createdById: string | null;
              createdAt: Date;
              updatedAt: Date;
            }

            const row = (result as DbTemplateRow[])[0];
            if (!row) {
              return ErrorFactory.internal("Failed to create quick reply");
            }

            const quickReply: Template = {
              id: row.id,
              name: row.name,
              body: row.body || "",
              bodyHtml: row.bodyHtml || "",
              subject: row.subject || "",
              content: row.content || "",
              category: row.category as TemplateCategoryType,
              folderId: row.folderId,
              usage: row.usage || 0,
              lastUsed: row.lastUsed || "",
              isStarred: row.isStarred || false,
              type: row.type as "template" | "quick-reply",
              companyId: row.tenant_id,
              description: row.description || "",
              createdById: row.createdById,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            };

            return {
              success: true,
              data: quickReply,
            };
          } catch (dbError) {
            console.error("Database error creating quick reply:", dbError);
            return ErrorFactory.database("Failed to create quick reply");
          }
        });
      }
    );
  });
}

/**
 * Update a quick reply
 */
export async function updateQuickReply(
  id: string,
  data: Partial<{
    name: string;
    content: string;
    subject: string;
    category: TemplateCategoryType;
    folderId: number;
    isStarred: boolean;
  }>
): Promise<ActionResult<Template>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'update-quick-reply',
      'user',
      RateLimits.TEMPLATE_UPDATE,
      async () => {
        return withErrorHandling(async () => {
          // Validate template ID
          const idValidation = validateTemplateId(id);
          if (!idValidation.success) {
            throw new Error(idValidation.error?.message || "Invalid template ID");
          }

          const templateId = idValidation.data!;

          try {
            // Build dynamic update query
            const updateFields: string[] = [];
            const values: (string | number | boolean | null)[] = [];
            let paramIndex = 1;

            if (data.name !== undefined) {
              updateFields.push(`name = $${paramIndex++}`);
              values.push(data.name);
              updateFields.push(`description = $${paramIndex++}`);
              values.push(data.name); // Use name as description
            }
            if (data.content !== undefined) {
              updateFields.push(`body = $${paramIndex++}`);
              values.push(data.content);
              updateFields.push(`body_html = $${paramIndex++}`);
              values.push(data.content);
              updateFields.push(`content = $${paramIndex++}`);
              values.push(data.content);
            }
            if (data.subject !== undefined) {
              updateFields.push(`subject = $${paramIndex++}`);
              values.push(data.subject);
            }
            if (data.category !== undefined) {
              updateFields.push(`category = $${paramIndex++}`);
              values.push(data.category);
            }
            if (data.folderId !== undefined) {
              updateFields.push(`folder_id = $${paramIndex++}`);
              values.push(data.folderId);
            }
            if (data.isStarred !== undefined) {
              updateFields.push(`is_starred = $${paramIndex++}`);
              values.push(data.isStarred);
            }

            if (updateFields.length === 0) {
              return ErrorFactory.validation("No fields to update");
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(templateId);

            const result = await nile.db.query(`
              UPDATE templates
              SET ${updateFields.join(', ')}
              WHERE id = $${paramIndex} AND type = 'quick-reply' AND tenant_id = CURRENT_TENANT_ID()
              RETURNING id, name, body, body_html as "bodyHtml", subject, content, category,
                        folder_id as "folderId", usage,
                        last_used as "lastUsed", is_starred as "isStarred", type, tenant_id,
                        description, created_by_id as "createdById", created_at as "createdAt",
                        updated_at as "updatedAt"
            `, values);

            interface DbTemplateRow {
              id: number;
              name: string;
              body: string | null;
              bodyHtml: string | null;
              subject: string | null;
              content: string | null;
              category: string;
              folderId: number | null;
              usage: number | null;
              lastUsed: string | null;
              isStarred: boolean | null;
              type: string;
              tenant_id: number;
              description: string | null;
              createdById: string | null;
              createdAt: Date;
              updatedAt: Date;
            }

            const row = (result as DbTemplateRow[])[0];
            if (!row) {
              return ErrorFactory.notFound("Quick reply");
            }

            const quickReply: Template = {
              id: row.id,
              name: row.name,
              body: row.body || "",
              bodyHtml: row.bodyHtml || "",
              subject: row.subject || "",
              content: row.content || "",
              category: row.category as TemplateCategoryType,
              folderId: row.folderId,
              usage: row.usage || 0,
              lastUsed: row.lastUsed || "",
              isStarred: row.isStarred || false,
              type: row.type as "template" | "quick-reply",
              companyId: row.tenant_id,
              description: row.description || "",
              createdById: row.createdById,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
            };

            return {
              success: true,
              data: quickReply,
            };
          } catch (dbError) {
            console.error("Database error updating quick reply:", dbError);
            return ErrorFactory.database("Failed to update quick reply");
          }
        });
      }
    );
  });
}

/**
 * Delete a quick reply
 */
export async function deleteQuickReply(id: string): Promise<ActionResult<void>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'delete-quick-reply',
      'user',
      RateLimits.TEMPLATE_DELETE,
      async () => {
        return withErrorHandling(async () => {
          // Validate template ID
          const idValidation = validateTemplateId(id);
          if (!idValidation.success) {
            return ErrorFactory.validation(idValidation.error?.message || "Invalid template ID");
          }

          const templateId = idValidation.data!;

          try {
            // Delete the quick reply
            const result = await nile.db.query(`
              DELETE FROM templates
              WHERE id = $1 AND type = 'quick-reply' AND tenant_id = CURRENT_TENANT_ID()
            `, [templateId]);

            if (result.length === 0) {
              return ErrorFactory.notFound("Quick reply");
            }

            return {
              success: true,
            };
          } catch (dbError) {
            console.error("Database error deleting quick reply:", dbError);
            return ErrorFactory.database("Failed to delete quick reply");
          }
        });
      }
    );
  });
}

/**
 * Mark quick reply as used (increment usage counter)
 */
export async function markQuickReplyAsUsed(id: string): Promise<ActionResult<void>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'mark-quick-reply-used',
      'user',
      RateLimits.GENERAL_WRITE,
      async () => {
        return withErrorHandling(async () => {
          // Validate template ID
          const idValidation = validateTemplateId(id);
          if (!idValidation.success) {
            return ErrorFactory.validation(idValidation.error?.message || "Invalid template ID");
          }

          const templateId = idValidation.data!;

          try {
            // Update usage counter and last used timestamp
            const result = await nile.db.query(`
              UPDATE templates
              SET usage = COALESCE(usage, 0) + 1,
                  last_used = CURRENT_TIMESTAMP,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $1 AND type = 'quick-reply' AND tenant_id = CURRENT_TENANT_ID()
            `, [templateId]);

            if (result.length === 0) {
              return ErrorFactory.notFound("Quick reply");
            }

            return {
              success: true,
            };
          } catch (dbError) {
            console.error("Database error marking quick reply as used:", dbError);
            return ErrorFactory.database("Failed to update quick reply usage");
          }
        });
      }
    );
  });
}
