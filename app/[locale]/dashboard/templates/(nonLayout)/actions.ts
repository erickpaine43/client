import { initialTemplates } from "@/lib/data/template.mock";
import { Template, TemplateCategoryType } from "@/types";

// Type for simplified template from consolidated data
interface ConsolidatedTemplate {
  id: number;
  name: string;
  category: string;
  subject: string;
  content: string;
  description?: string;
  companyId?: number;
  createdById?: string;
  folderId?: number;
  usage?: number;
  openRate?: string;
  replyRate?: string;
  lastUsed?: string;
  isStarred?: boolean;
  type: string; // "template" | "quick-reply"
}

// Transform consolidated data to full Template format for backward compatibility
function transformToFullTemplate(template: ConsolidatedTemplate): Template {
  const baseDate = new Date("2024-02-01");
  const daysOffset = template.id * 3;

  return {
    id: template.id,
    name: template.name,
    category: template.category as TemplateCategoryType,
    subject: template.subject,
    body: template.content?.replace(/\n/g, '\n') || template.content,
    bodyHtml: template.content?.replace(/\n/g, '<br>') || template.content,
    description: template.description || `Template for ${template.category}`,
    createdAt: new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
    companyId: template.companyId || 1,
    createdById: template.createdById || "user1",
    folderId: template.folderId,
    content: template.content,
    usage: template.usage,
    openRate: template.openRate,
    replyRate: template.replyRate,
    lastUsed: template.lastUsed,
    isStarred: template.isStarred,
    type: template.type as "template" | "quick-reply",
  };
}

const userTemplates: Template[] = initialTemplates
  .filter(template => template.id <= 6)
  .map(transformToFullTemplate);

const builtInTemplates: Template[] = initialTemplates
  .filter(template => template.id > 6)
  .map(transformToFullTemplate);

export async function getTemplates(userId: string): Promise<Template[]> {
  try {
    // When ready to use Prisma:
    // const templates = await prisma.template.findMany({
    //   where: { userId },
    //   orderBy: { createdAt: 'desc' }
    // });
    // return templates;

    // For now, return mock data
    console.log("Fetching templates for user:", userId);
    return userTemplates;
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

export async function getTemplate(id: number): Promise<Template | null> {
  try {
    // When ready to use Prisma:
    // const template = await prisma.template.findUnique({
    //   where: { id }
    // });
    // return template;

    // For now, return mock data
    const template = [...userTemplates, ...builtInTemplates].find(
      (t) => t.id === id,
    );
    return template || null;
  } catch (error) {
    console.error("Error fetching template:", error);
    return null;
  }
}

export async function createTemplate(
  data: Partial<Template>,
): Promise<Template | null> {
  try {
    // When ready to use Prisma:
    // const template = await prisma.template.create({
    //   data: {
    //     ...data,
    //     bodyHtml: convertToHtml(data.body), // You'll need to implement this
    //   }
    // });
    // return template;

    // For now, return mock data
    const userTemplateIds = initialTemplates
      .filter(template => template.id <= 6)
      .map(template => template.id);
    const maxId = Math.max(...userTemplateIds);

    const newTemplate: Template = {
      id: maxId + 1,
      name: data.name || "",
      category: data.category || "OUTREACH",
      subject: data.subject || "",
      body: data.body || "",
      bodyHtml: data.bodyHtml || "",
      description: data.description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      companyId: data.companyId || 1,
      createdById: data.createdById || "user1",
      folderId: data.folderId || null,
      content: data.content || "",
      usage: data.usage || 0,
      openRate: data.openRate || "0%",
      replyRate: data.replyRate || "0%",
      lastUsed: data.lastUsed || new Date().toISOString(),
      isStarred: data.isStarred || false,
      type: data.type || "template",
    };
    // Note: In a real app, this would be saved to database
    // For now, just return the new template
    return newTemplate;
  } catch (error) {
    console.error("Error creating template:", error);
    return null;
  }
}

export async function updateTemplate(
  id: number,
  data: Partial<Template>,
): Promise<Template | null> {
  try {
    // When ready to use Prisma:
    // const template = await prisma.template.update({
    //   where: { id },
    //   data: {
    //     ...data,
    //     bodyHtml: data.body ? convertToHtml(data.body) : undefined,
    //   }
    // });
    // return template;

    // For now, return mock updated data
    const userTemplateData = userTemplates.find((t) => t.id === id);
    if (!userTemplateData) return null;

    const updatedTemplate: Template = {
      ...userTemplateData,
      ...data,
      updatedAt: new Date(),
    };
    // Note: In a real app, this would be saved to database
    return updatedTemplate;
  } catch (error) {
    console.error("Error updating template:", error);
    return null;
  }
}
