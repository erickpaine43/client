"use server";

import { initialTemplates as initialTemplatesMock, initialQuickReplies, initialFolders } from "@/lib/data/template.mock";
import { getCurrentUserId } from "@/lib/utils/auth";
import { nile } from "@/app/api/[...nile]/nile";
import type { Template, TemplateFolder, TemplateCategoryType } from "@/types";
import type { ActionResult } from "./settings.types";
import { ERROR_CODES } from "./settings.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Use the actual type inference from mock data
type MockTemplateType = typeof initialTemplatesMock[0];

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
function mapMockToTemplate(mockTemplate: MockTemplateType): Template {
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
    openRate: mockTemplate.openRate || "",
    replyRate: mockTemplate.replyRate || "",
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
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view templates",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch with mock data
    // In production, this would fetch from database based on user company
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    // Map mock data to Template type
    const templates: Template[] = initialTemplatesMock.map(mapMockToTemplate);

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error("getTemplates error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }

    return {
      success: false,
      error: "Failed to retrieve templates",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
  * Get template folders for the authenticated user
  */
export async function getTemplateFolders(): Promise<ActionResult<TemplateFolder[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view template folders",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    // Return mock folder structure
    // In a full implementation, this would fetch from database
    return {
      success: true,
      data: initialFolders as TemplateFolder[],
    };
  } catch (error) {
    console.error("getTemplateFolders error:", error);
    return {
      success: false,
      error: "Failed to retrieve template folders",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Get quick replies for the authenticated user
 */
export async function getQuickReplies(): Promise<ActionResult<Template[]>> {
  try {
    // Check authentication
    let userId: string | null = null;
    try {
      userId = await getCurrentUserId();
    } catch (authError) {
      console.warn("Authentication error in getQuickReplies:", authError);
      // Fallback to mock data for graceful handling
      const mockQuickReplies: Template[] = initialQuickReplies.map(mapMockToTemplate);
      return {
        success: true,
        data: mockQuickReplies,
      };
    }

    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view quick replies",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Fetch quick replies from database filtered by type
    // Nile automatically scopes queries to the current tenant
    try {
      const result = await nile.db.query(`
        SELECT id, name, body, body_html as "bodyHtml", subject, content, category,
               folder_id as "folderId", usage, open_rate as "openRate", reply_rate as "replyRate",
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
        openRate: string | null;
        replyRate: string | null;
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
        openRate: row.openRate || "",
        replyRate: row.replyRate || "",
        lastUsed: row.lastUsed || "",
        isStarred: row.isStarred || false,
        type: row.type as "template" | "quick-reply",
        companyId: row.tenant_id, // Set company ID from tenant
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
  } catch (error) {
    console.error("getQuickReplies error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }

    return {
      success: false,
      error: "Failed to retrieve quick replies",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
 * Get a specific quick reply by ID for the authenticated user
 */
export async function getQuickReplyById(id: string): Promise<ActionResult<Template | null>> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view quick replies",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch with mock data
    // In production, this would fetch from database based on user company
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    // Find the quick reply by ID
    const mockQuickReply = initialQuickReplies.find(reply => reply.id === parseInt(id));
    if (!mockQuickReply) {
      return {
        success: false,
        error: "Quick reply not found",
        code: ERROR_CODES.INTERNAL_ERROR,
      };
    }

    // Map to Template type
    const quickReply: Template = mapMockToTemplate(mockQuickReply);

    return {
      success: true,
      data: quickReply,
    };
  } catch (error) {
    console.error("getQuickReplyById error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }

    return {
      success: false,
      error: "Failed to retrieve quick reply",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
  * Get a specific template by ID for the authenticated user
  */
export async function getTemplateById(id: string): Promise<ActionResult<Template | null>> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view templates",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch with mock data
    // In production, this would fetch from database based on user company
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    // Find the template by ID
    const mockTemplate = initialTemplatesMock.find(template => template.id === parseInt(id));
    if (!mockTemplate) {
      return {
        success: false,
        error: "Template not found",
        code: ERROR_CODES.INTERNAL_ERROR,
      };
    }

    // Map to Template type
    const template: Template = mapMockToTemplate(mockTemplate);

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("getTemplateById error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
        code: ERROR_CODES.NETWORK_ERROR,
      };
    }

    return {
      success: false,
      error: "Failed to retrieve template",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}

/**
  * Update a specific template by ID for the authenticated user
  */
export async function updateTemplate(formData: FormData): Promise<void> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("You must be logged in to update templates");
    }

    const id = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string;
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;

    if (!id || !name || !subject || !content) {
      throw new Error("Missing required fields");
    }

    // Find and update the mock template
    const templateIndex = initialTemplatesMock.findIndex(template => template.id === id);
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

    // Revalidate and redirect
    revalidatePath('/dashboard/templates');
    redirect(`/dashboard/templates/${id}`);
  } catch (error) {
    console.error("updateTemplate error:", error);
    throw new Error("Failed to update template");
  }
}

/**
   * Get counts for template tabs
   */
export async function getTabCounts(): Promise<ActionResult<Record<string, number>>> {
  try {
    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view tab counts",
        code: ERROR_CODES.AUTH_REQUIRED,
      };
    }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    // Calculate counts from mock data (in production, this would come from database)
    const quickRepliesCount = initialQuickReplies.length;
    const templatesCount = initialTemplatesMock.length;

    const counts = {
      "quick-replies": quickRepliesCount,
      "templates": templatesCount,
      "gallery": 0, // Gallery count is 0 for now
    };

    return {
      success: true,
      data: counts,
    };
  } catch (error) {
    console.error("getTabCounts error:", error);
    return {
      success: false,
      error: "Failed to retrieve tab counts",
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }
}
