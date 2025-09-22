/**
 * Template folders management module
 * 
 * This module handles template folder operations including getting folders,
 * creating, updating, and managing folder hierarchies.
 */

"use server";

import { TemplateFolder, Template, TemplateCategoryType } from "@/types/templates";
import { ActionResult } from "@/lib/actions/core/types";
import { withAuth, withContextualRateLimit, RateLimits } from "@/lib/actions/core/auth";
import { ErrorFactory, withErrorHandling } from "@/lib/actions/core/errors";
import { validateFolderData, validateFolderId } from "./validation";
import { nile } from "@/app/api/[...nile]/nile";
import { initialFolders as initialFoldersMock, initialTemplates as initialTemplatesMock } from "@/lib/data/template.mock";

// Map mock data to Template type
function mapMockToTemplate(mockTemplate: typeof initialTemplatesMock[0]): Template {
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
 * Get template folders for the authenticated user
 */
export async function getTemplateFolders(): Promise<ActionResult<TemplateFolder[]>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-template-folders',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          try {
            // Fetch template folders from database
            const result = await nile.db.query(`
              SELECT id, name, type, template_count as "templateCount", is_expanded as "isExpanded",
                     parent_id as "parentId", order_index as "order"
              FROM template_folders
              ORDER BY order_index ASC
            `);

            // Define type for database result row
            interface DbTemplateFolderRow {
              id: number;
              name: string;
              type: string;
              templateCount: number;
              isExpanded: boolean;
              parentId: number | null;
              order: number | null;
            }

            // Map database results to TemplateFolder type
            const folders: TemplateFolder[] = (result as DbTemplateFolderRow[]).map((row) => ({
              id: row.id,
              name: row.name,
              type: row.type as "template" | "quick-reply",
              templateCount: row.templateCount,
              isExpanded: row.isExpanded,
              children: [], // Will be populated by building hierarchy
              parentId: row.parentId ?? undefined,
              order: row.order ?? undefined,
            }));

            // Build hierarchical structure
            const folderMap = new Map<number, TemplateFolder>();
            const rootFolders: TemplateFolder[] = [];

            folders.forEach((folder) => {
              folderMap.set(folder.id, folder);
              if (folder.parentId === null || folder.parentId === undefined) {
                rootFolders.push(folder);
              }
            });

            // Add templates as children and build hierarchy
            for (const folder of folders) {
              const children: (Template | TemplateFolder)[] = [];

              // Find templates that belong to this folder
              try {
                const folderTemplatesResult = await nile.db.query(`
                  SELECT id, name, body, body_html as "bodyHtml", subject, content, category,
                         folder_id as "folderId", usage,
                         last_used as "lastUsed", is_starred as "isStarred", type, tenant_id,
                         description, created_by_id as "createdById", created_at as "createdAt",
                         updated_at as "updatedAt"
                  FROM templates
                  WHERE folder_id = $1
                  ORDER BY created_at DESC
                `, [folder.id]);

                const folderTemplates = (folderTemplatesResult as {
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
                }[]).map((row) => ({
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

                children.push(...folderTemplates);
              } catch (templateError) {
                console.warn("Error fetching templates for folder:", folder.id, templateError);
                // Fallback to mock data for this folder
                const folderTemplates = initialTemplatesMock.filter(
                  (template) => template.folderId === folder.id
                );
                const mappedTemplates = folderTemplates.map(mapMockToTemplate);
                children.push(...mappedTemplates);
              }

              // Find subfolders
              const subFolders = folders.filter((f) => f.parentId === folder.id);
              children.push(...subFolders.map((f) => folderMap.get(f.id)!));

              folder.children = children;
            }

            return {
              success: true,
              data: rootFolders,
            };
          } catch (dbError) {
            console.error("Database error in getTemplateFolders, falling back to mock data:", dbError);
            // Fallback to mock data on database error
            const mockFolders: TemplateFolder[] = initialFoldersMock.map((folder) => ({
              ...folder,
              type: folder.type as "template" | "quick-reply",
              parentId: undefined,
              order: undefined,
              children: folder.children.map(mapMockToTemplate),
            }));
            return {
              success: true,
              data: mockFolders,
            };
          }
        });
      }
    );
  });
}

/**
 * Get a specific folder by ID
 */
export async function getFolderById(id: string): Promise<ActionResult<TemplateFolder | null>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'get-folder-by-id',
      'user',
      RateLimits.GENERAL_READ,
      async () => {
        return withErrorHandling(async () => {
          // Validate folder ID
          const idValidation = validateFolderId(id);
          if (!idValidation.success) {
            return { success: false, error: idValidation.error };
          }

          const folderId = parseInt(id);

          try {
            // Fetch folder from database
            const result = await nile.db.query(`
              SELECT id, name, type, template_count as "templateCount", is_expanded as "isExpanded",
                     parent_id as "parentId", order_index as "order"
              FROM template_folders
              WHERE id = $1
            `, [folderId]);

            interface DbTemplateFolderRow {
              id: number;
              name: string;
              type: string;
              templateCount: number;
              isExpanded: boolean;
              parentId: number | null;
              order: number | null;
            }

            const row = (result as DbTemplateFolderRow[])[0];
            if (!row) {
              return ErrorFactory.notFound("Folder");
            }

            // Map database result to TemplateFolder type
            const folder: TemplateFolder = {
              id: row.id,
              name: row.name,
              type: row.type as "template" | "quick-reply",
              templateCount: row.templateCount,
              isExpanded: row.isExpanded,
              children: [], // Would need additional query to populate
              parentId: row.parentId ?? undefined,
              order: row.order ?? undefined,
            };

            return {
              success: true,
              data: folder,
            };
          } catch (dbError) {
            console.error("Database error in getFolderById:", dbError);
            // Fallback to mock data
            const mockFolder = initialFoldersMock.find(folder => folder.id === folderId);
            
            if (!mockFolder) {
              return ErrorFactory.notFound("Folder");
            }

            const folder: TemplateFolder = {
              ...mockFolder,
              type: mockFolder.type as "template" | "quick-reply",
              parentId: undefined,
              order: undefined,
              children: mockFolder.children.map(mapMockToTemplate),
            };

            return {
              success: true,
              data: folder,
            };
          }
        });
      }
    );
  });
}

/**
 * Create a new template folder
 */
export async function createTemplateFolder(data: {
  name: string;
  type: "template" | "quick-reply";
  parentId?: number;
}): Promise<ActionResult<TemplateFolder>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'create-template-folder',
      'user',
      RateLimits.TEMPLATE_CREATE,
      async () => {
        return withErrorHandling(async () => {
          // Validate folder data
          const validation = validateFolderData(data);
          if (!validation.success) {
            return { success: false, error: validation.error };
          }

          try {
            // Create folder in database
            const result = await nile.db.query(`
              INSERT INTO template_folders (name, type, template_count, is_expanded, parent_id, order_index, tenant_id)
              VALUES ($1, $2, 0, true, $3, 
                (SELECT COALESCE(MAX(order_index), 0) + 1 FROM template_folders WHERE parent_id = $3),
                CURRENT_TENANT_ID())
              RETURNING id, name, type, template_count as "templateCount", is_expanded as "isExpanded",
                        parent_id as "parentId", order_index as "order"
            `, [data.name, data.type, data.parentId || null]);

            interface DbTemplateFolderRow {
              id: number;
              name: string;
              type: string;
              templateCount: number;
              isExpanded: boolean;
              parentId: number | null;
              order: number | null;
            }

            const row = (result as DbTemplateFolderRow[])[0];
            if (!row) {
              return ErrorFactory.internal("Failed to create folder");
            }

            const folder: TemplateFolder = {
              id: row.id,
              name: row.name,
              type: row.type as "template" | "quick-reply",
              templateCount: row.templateCount,
              isExpanded: row.isExpanded,
              children: [],
              parentId: row.parentId ?? undefined,
              order: row.order ?? undefined,
            };

            return {
              success: true,
              data: folder,
            };
          } catch (dbError) {
            console.error("Database error creating folder:", dbError);
            return ErrorFactory.database("Failed to create folder");
          }
        });
      }
    );
  });
}

/**
 * Update a template folder
 */
export async function updateTemplateFolder(
  id: string,
  data: Partial<{
    name: string;
    isExpanded: boolean;
    parentId: number;
    order: number;
  }>
): Promise<ActionResult<TemplateFolder>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'update-template-folder',
      'user',
      RateLimits.TEMPLATE_UPDATE,
      async () => {
        return withErrorHandling(async () => {
          // Validate folder ID
          const idValidation = validateFolderId(id);
          if (!idValidation.success) {
            return { success: false, error: idValidation.error };
          }

          const folderId = parseInt(id);

          try {
            // Build dynamic update query
            const updateFields: string[] = [];
            const values: (string | number | boolean)[] = [];
            let paramIndex = 1;

            if (data.name !== undefined) {
              updateFields.push(`name = $${paramIndex++}`);
              values.push(data.name);
            }
            if (data.isExpanded !== undefined) {
              updateFields.push(`is_expanded = $${paramIndex++}`);
              values.push(data.isExpanded);
            }
            if (data.parentId !== undefined) {
              updateFields.push(`parent_id = $${paramIndex++}`);
              values.push(data.parentId);
            }
            if (data.order !== undefined) {
              updateFields.push(`order_index = $${paramIndex++}`);
              values.push(data.order);
            }

            if (updateFields.length === 0) {
              return ErrorFactory.validation("No fields to update");
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(folderId);

            const result = await nile.db.query(`
              UPDATE template_folders
              SET ${updateFields.join(', ')}
              WHERE id = $${paramIndex} AND tenant_id = CURRENT_TENANT_ID()
              RETURNING id, name, type, template_count as "templateCount", is_expanded as "isExpanded",
                        parent_id as "parentId", order_index as "order"
            `, values);

            interface DbTemplateFolderRow {
              id: number;
              name: string;
              type: string;
              templateCount: number;
              isExpanded: boolean;
              parentId: number | null;
              order: number | null;
            }

            const row = (result as DbTemplateFolderRow[])[0];
            if (!row) {
              return ErrorFactory.notFound("Folder");
            }

            const folder: TemplateFolder = {
              id: row.id,
              name: row.name,
              type: row.type as "template" | "quick-reply",
              templateCount: row.templateCount,
              isExpanded: row.isExpanded,
              children: [], // Would need additional query to populate
              parentId: row.parentId ?? undefined,
              order: row.order ?? undefined,
            };

            return {
              success: true,
              data: folder,
            };
          } catch (dbError) {
            console.error("Database error updating folder:", dbError);
            return ErrorFactory.database("Failed to update folder");
          }
        });
      }
    );
  });
}

/**
 * Delete a template folder
 */
export async function deleteTemplateFolder(id: string): Promise<ActionResult<void>> {
  return withAuth(async (_context) => {
    return withContextualRateLimit(
      'delete-template-folder',
      'user',
      RateLimits.TEMPLATE_DELETE,
      async () => {
        return withErrorHandling(async () => {
          // Validate folder ID
          const idValidation = validateFolderId(id);
          if (!idValidation.success) {
            return { success: false, error: idValidation.error };
          }

          const folderId = parseInt(id);

          try {
            // Check if folder has templates or subfolders
            const templatesResult = await nile.db.query(`
              SELECT COUNT(*) as count FROM templates WHERE folder_id = $1
            `, [folderId]);

            const subfoldersResult = await nile.db.query(`
              SELECT COUNT(*) as count FROM template_folders WHERE parent_id = $1
            `, [folderId]);

            const templateCount = templatesResult[0]?.count || 0;
            const subfolderCount = subfoldersResult[0]?.count || 0;

            if (templateCount > 0 || subfolderCount > 0) {
              return ErrorFactory.conflict(
                "Cannot delete folder that contains templates or subfolders"
              );
            }

            // Delete the folder
            const result = await nile.db.query(`
              DELETE FROM template_folders
              WHERE id = $1 AND tenant_id = CURRENT_TENANT_ID()
            `, [folderId]);

            if (result.length === 0) {
              return ErrorFactory.notFound("Folder");
            }

            return {
              success: true,
            };
          } catch (dbError) {
            console.error("Database error deleting folder:", dbError);
            return ErrorFactory.database("Failed to delete folder");
          }
        });
      }
    );
  });
}
