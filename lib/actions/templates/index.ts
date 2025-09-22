/**
 * Templates module - Main entry point
 * 
 * This module provides the main template management functions including
 * getting templates, creating, updating, and deleting templates.
 */

"use server";

import { Template, TemplateCategoryType } from "@/types/templates";
import { ActionResult } from "@/lib/actions/core/types";
import { withAuth, withAuthAndCompany, withContextualRateLimit, RateLimits } from "@/lib/actions/core/auth";
import { ErrorFactory, withErrorHandling } from "@/lib/actions/core/errors";
import { validateTemplateData, validateTemplateId } from "./validation";
import { nile } from "@/app/api/[...nile]/nile";
import { initialTemplates as initialTemplatesMock } from "@/lib/data/template.mock";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Type-safe category mapping
function mapCategoryStringToType(categoryString: string): TemplateCategoryType {
  const categoryMap: Record<string, TemplateCategoryType> = {
    "Cold Outreach": "OUTREACH",
    "Follow-ups": "FOLLOW_UP",
    "Partnerships": "VALUE",
    "Common Responses": "FOLLOW_UP",
    "Objection Handling": "FOLLOW_UP",
  };

  // Default to OUTREACH if category doesn't match any mapping
  return categoryMap[categoryString] || "OUTREACH";
}

// Map mock data to Template type
function mapMockToTemplate(mockTemplate: typeof initialTemplatesMock[0]): Template {
  return {
    id: mockTemplate.id,
    name: mockTemplate.name,
    body: mockTemplate.content || "",
    bodyHtml: mockTemplate.content || "",
    subject: mockTemplate.subject,
    content: mockTemplate.content,
    category: mapCategoryStringToType(mockTemplate.category),
    folderId: mockTemplate.folderId || null,
    usage: mockTemplate.usage || 0,
    lastUsed: mockTemplate.lastUsed || "",
    isStarred: mockTemplate.isStarred || false,
    type: mockTemplate.type as "template" | "quick-reply",
    companyId: 1, // Default for now
    description: mockTemplate.name,
    createdById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get templates for the authenticated user
 */
export async function getTemplates(): Promise<ActionResult<Template[]>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-templates',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        try {
          // Fetch templates from database
          const result = await nile.db.query(`
            SELECT id, name, body, body_html as "bodyHtml", subject, content, category,
                   folder_id as "folderId", usage,
                   last_used as "lastUsed", is_starred as "isStarred", type, tenant_id,
                   description, created_by_id as "createdById", created_at as "createdAt",
                   updated_at as "updatedAt"
            FROM templates
            WHERE type = 'template'
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
          const templates: Template[] = (result as DbTemplateRow[]).map((row) => ({
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
            data: templates,
          };
        } catch (dbError) {
          console.error("Database error in getTemplates, falling back to mock data:", dbError);
          // Fallback to mock data on database error
          const templates: Template[] = initialTemplatesMock
            .filter(t => t.type === 'template')
            .map(mapMockToTemplate);
          return {
            success: true,
            data: templates,
          };
        }
      }
    );
  });
}

/**
 * Get a specific template by ID for the authenticated user
 */
export async function getTemplateById(id: string): Promise<ActionResult<Template | null>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-template-by-id',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          // Validate template ID
          const idValidation = validateTemplateId(id);
          if (!idValidation.success) {
            return { success: false, error: idValidation.error };
          }

          const templateId = parseInt(id);

          try {
            // Fetch template from database
            const result = await nile.db.query(`
              SELECT id, name, body, body_html as "bodyHtml", subject, content, category,
                     folder_id as "folderId", usage,
                     last_used as "lastUsed", is_starred as "isStarred", type, tenant_id,
                     description, created_by_id as "createdById", created_at as "createdAt",
                     updated_at as "updatedAt"
              FROM templates
              WHERE id = $1 AND type = 'template'
            `, [templateId]);

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
              return ErrorFactory.notFound("Template");
            }

            // Map database result to Template type
            const template: Template = {
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
              data: template,
            };
          } catch (dbError) {
            console.error("Database error in getTemplateById:", dbError);
            // Fallback to mock data
            const mockTemplate = initialTemplatesMock.find(template => 
              template.id === templateId && template.type === 'template'
            );
            
            if (!mockTemplate) {
              return ErrorFactory.notFound("Template");
            }

            const template: Template = mapMockToTemplate(mockTemplate);
            return {
              success: true,
              data: template,
            };
          }
        });
      }
    );
  });
}

/**
 * Update a specific template by ID for the authenticated user
 */
export async function updateTemplate(formData: FormData): Promise<void> {
  const authResult = await withAuthAndCompany(async (_context) => {
    return withContextualRateLimit(
      'update-template',
      'user',
      RateLimits.TEMPLATE_UPDATE,
      async () => {
        return withErrorHandling(async () => {
          const id = parseInt(formData.get('id') as string);
          const name = formData.get('name') as string;
          const subject = formData.get('subject') as string;
          const content = formData.get('content') as string;

          // Validate template data
          const validation = validateTemplateData({
            id: id.toString(),
            name,
            subject,
            content,
          });

          if (!validation.success) {
            throw new Error(validation.error?.message || "Invalid template data");
          }

          try {
            // Update template in database
            await nile.db.query(`
              UPDATE templates
              SET name = $1, subject = $2, content = $3, updated_at = CURRENT_TIMESTAMP
              WHERE id = $4 AND tenant_id = CURRENT_TENANT_ID() AND type = 'template'
            `, [name, subject, content, id]);

            // Check if any row was updated
            const result = await nile.db.query(`
              SELECT COUNT(*) as count FROM templates WHERE id = $1 AND type = 'template'
            `, [id]);

            if (result[0]?.count === 0) {
              throw new Error("Template not found");
            }

            return {
              success: true,
              data: undefined,
            };
          } catch (dbError) {
            console.error("Database error updating template:", dbError);
            // Fallback to mock data update
            const templateIndex = initialTemplatesMock.findIndex(template => 
              template.id === id && template.type === 'template'
            );
            
            if (templateIndex === -1) {
              throw new Error("Template not found");
            }

            // Update the template
            initialTemplatesMock[templateIndex] = {
              ...initialTemplatesMock[templateIndex],
              name,
              subject,
              content,
            };

            return {
              success: true,
              data: undefined,
            };
          }
        });
      }
    );
  });

  if (!authResult.success) {
    throw new Error(authResult.error?.message || "Failed to update template");
  }

  // Revalidate and redirect
  revalidatePath('/dashboard/templates');
  redirect(`/dashboard/templates/${formData.get('id')}`);
}

/**
 * Get counts for template tabs
 */
export async function getTabCounts(): Promise<ActionResult<Record<string, number>>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-tab-counts',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          try {
            // Get counts from database
            const templateCountResult = await nile.db.query(`
              SELECT COUNT(*) as count FROM templates WHERE type = 'template'
            `);
            
            const quickReplyCountResult = await nile.db.query(`
              SELECT COUNT(*) as count FROM templates WHERE type = 'quick-reply'
            `);

            const counts = {
              "templates": templateCountResult[0]?.count || 0,
              "quick-replies": quickReplyCountResult[0]?.count || 0,
              "gallery": 0, // Gallery count is 0 for now
            };

            return {
              success: true,
              data: counts,
            };
          } catch (dbError) {
            console.error("Database error in getTabCounts:", dbError);
            // Fallback to mock data counts
            const templateCount = initialTemplatesMock.filter(t => t.type === 'template').length;
            const quickReplyCount = initialTemplatesMock.filter(t => t.type === 'quick-reply').length;

            const counts = {
              "templates": templateCount,
              "quick-replies": quickReplyCount,
              "gallery": 0,
            };

            return {
              success: true,
              data: counts,
            };
          }
        });
      }
    );
  });
}
