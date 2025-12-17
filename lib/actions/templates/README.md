# Template Management Actions

## Overview

This module contains server actions for managing email templates, including template creation, editing, organization, and analytics. All actions follow established patterns for type safety, error handling, and validation.

## Actions

### Template Management

#### `createTemplate`

Creates a new email template with content and metadata.

```typescript
interface CreateTemplateArgs {
  name: string;
  subject: string;
  content: string;
  type: TemplateType;
  folderId?: string;
  tags?: string[];
  variables?: TemplateVariable[];
}

export async function createTemplate(
  args: CreateTemplateArgs
): Promise<ActionResult<Template>> {
  // Implementation
}
```

#### `updateTemplate`

Updates an existing template's content or metadata.

```typescript
interface UpdateTemplateArgs {
  templateId: string;
  updates: ial<CreateTemplateArgs>;
}

export async function updateTemplate(
  args: UpdateTemplateArgs
): Promise<ActionResult<Template>> {
  // Implementation
}
```

#### `deleteTemplate`

Deletes a template and handles cleanup.

```typescript
interface DeleteTemplateArgs {
  templateId: string;
  force?: boolean; // Force delete even if used in campaigns
}

export async function deleteTemplate(
  args: DeleteTemplateArgs
): Promise<ActionResult<void>> {
  // Implementation
}
```

#### `duplicateTemplate`

Creates a copy of an existing template.

```typescript
interface DuplicateTemplateArgs {
  templateId: string;
  name: string;
  folderId?: string;
}

export async function duplicateTemplate(
  args: DuplicateTemplateArgs
): Promise<ActionResult<Template>> {
  // Implementation
}
```

### Template Organization

#### `createTemplateFolder`

Creates a new folder for organizing templates.

```typescript
interface CreateTemplateFolderArgs {
  name: string;
  parentId?: string;
  description?: string;
}

export async function createTemplateFolder(
  args: CreateTemplateFolderArgs
): Promise<ActionResult<TemplateFolder>> {
  // Implementation
}
```

#### `updateTemplateFolder`

Updates folder metadata.

```typescript
interface UpdateTemplateFolderArgs {
  folderId: string;
  updates: Partial<CreateTemplateFolderArgs>;
}

export async function updateTemplateFolder(
  args: UpdateTemplateFolderArgs
): Promise<ActionResult<TemplateFolder>> {
  // Implementation
}
```

#### `moveTemplate`

Moves a template to a different folder.

```typescript
interface MoveTemplateArgs {
  templateId: string;
  targetFolderId?: string; // null for root
}

export async function moveTemplate(
  args: MoveTemplateArgs
): Promise<ActionResult<Template>> {
  // Implementation
}
```

#### `organizeTemplates`

Bulk organization of templates.

```typescript
interface OrganizeTemplatesArgs {
  operations: TemplateOperation[];
}

interface TemplateOperation {
  type: "move" | "tag" | "untag";
  templateIds: string[];
  targetFolderId?: string;
  tags?: string[];
}

export async function organizeTemplates(
  args: OrganizeTemplatesArgs
): Promise<ActionResult<OperationResult[]>> {
  // Implementation
}
```

### Template Content

#### `validateTemplate`

Validates template content and variables.

```typescript
interface ValidateTemplateArgs {
  content: string;
  variables?: TemplateVariable[];
  testData?: Record<string, any>;
}

export async function validateTemplate(
  args: ValidateTemplateArgs
): Promise<ActionResult<ValidationResult>> {
  // Implementation
}
```

#### `previewTemplate`

Generates a preview of the template with sample data.

```typescript
interface PreviewTemplateArgs {
  templateId: string;
  testData?: Record<string, any>;
  format?: "html" | "text" | "both";
}

export async function previewTemplate(
  args: PreviewTemplateArgs
): Promise<ActionResult<TemplatePreview>> {
  // Implementation
}
```

#### `renderTemplate`

Renders a template with actual data for sending.

```typescript
interface RenderTemplateArgs {
  templateId: string;
  data: Record<string, any>;
  personalization?: PersonalizationData;
}

export async function renderTemplate(
  args: RenderTemplateArgs
): Promise<ActionResult<RenderedTemplate>> {
  // Implementation
}
```

### Template Analytics

#### `getTemplateAnalytics`

Retrieves analytics data for a template.

```typescript
interface GetTemplateAnalyticsArgs {
  templateId: string;
  timeRange: TimeRange;
  metrics?: TemplateMetric[];
}

export async function getTemplateAnalytics(
  args: GetTemplateAnalyticsArgs
): Promise<ActionResult<TemplateAnalytics>> {
  // Implementation
}
```

#### `getTemplatePerformance`

Gets performance comparison data for templates.

```typescript
interface GetTemplatePerformanceArgs {
  templateIds: string[];
  timeRange: TimeRange;
  compareBy: "open_rate" | "click_rate" | "conversion_rate";
}

export async function getTemplatePerformance(
  args: GetTemplatePerformanceArgs
): Promise<ActionResult<TemplatePerformanceComparison>> {
  // Implementation
}
```

### Template Sharing

#### `shareTemplate`

Shares a template with team members or makes it public.

```typescript
interface ShareTemplateArgs {
  templateId: string;
  shareType: "team" | "public" | "specific";
  userIds?: string[];
  permissions: TemplatePermission[];
}

export async function shareTemplate(
  args: ShareTemplateArgs
): Promise<ActionResult<TemplateShare>> {
  // Implementation
}
```

#### `unshareTemplate`

Removes sharing permissions for a template.

```typescript
interface UnshareTemplateArgs {
  templateId: string;
  shareId?: string; // Specific share to remove
}

export async function unshareTemplate(
  args: UnshareTemplateArgs
): Promise<ActionResult<void>> {
  // Implementation
}
```

## Types

### Core Types

```typescript
interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: TemplateType;
  folderId?: string;
  tags: string[];
  variables: TemplateVariable[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isPublic: boolean;
  isArchived: boolean;
}

interface TemplateFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  templateCount: number;
  subfolderCount: number;
}

interface TemplateVariable {
  name: string;
  type: "text" | "number" | "date" | "boolean" | "url" | "email";
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: VariableValidation;
}

interface VariableValidation {
  pattern?: string; // Regex pattern
  minLength?: number;
  maxLength?: number;
  min?: number; // For numbers
  max?: number; // For numbers
}

interface TemplateAnalytics {
  templateId: string;
  timeRange: TimeRange;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  };
  trends: AnalyticsTrend[];
  topPerformingCampaigns: CampaignSummary[];
}

interface TemplateShare {
  id: string;
  templateId: string;
  shareType: "team" | "public" | "specific";
  sharedBy: string;
  sharedWith?: string[];
  permissions: TemplatePermission[];
  createdAt: Date;
  expiresAt?: Date;
}
```

### Enums

```typescript
enum TemplateType {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  SEQUENCE = "sequence",
  QUICK_REPLY = "quick_reply",
}

enum TemplatePermission {
  VIEW = "view",
  EDIT = "edit",
  DUPLICATE = "duplicate",
  DELETE = "delete",
  SHARE = "share",
}

enum TemplateMetric {
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  BOUNCED = "bounced",
  UNSUBSCRIBED = "unsubscribed",
}
```

## Usage Examples

### Creating and Managing Templates

```typescript
import {
  createTemplate,
  updateTemplate,
  duplicateTemplate,
} from "@/lib/actions/templates";

const handleCreateTemplate = async (templateData: CreateTemplateArgs) => {
  const result = await createTemplate(templateData);

  if (result.success) {
    console.log("Template created:", result.data);
  } else {
    console.error("Failed to create template:", result.error);
  }
};

const handleUpdateTemplate = async (
  templateId: string,
  updates: Partial<CreateTemplateArgs>
) => {
  const result = await updateTemplate({
    templateId,
    updates,
  });

  if (result.success) {
    console.log("Template updated:", result.data);
  } else {
    console.error("Failed to update template:", result.error);
  }
};

const handleDuplicateTemplate = async (templateId: string, name: string) => {
  const result = await duplicateTemplate({
    templateId,
    name,
  });

  if (result.success) {
    console.log("Template duplicated:", result.data);
  } else {
    console.error("Failed to duplicate template:", result.error);
  }
};
```

### Template Organization

```typescript
import {
  createTemplateFolder,
  moveTemplate,
  organizeTemplates,
} from "@/lib/actions/templates";

const handleCreateFolder = async (name: string, parentId?: string) => {
  const result = await createTemplateFolder({
    name,
    parentId,
    description: `Folder for ${name} templates`,
  });

  if (result.success) {
    console.log("Folder created:", result.data);
  } else {
    console.error("Failed to create folder:", result.error);
  }
};

const handleBulkOrganize = async (
  templateIds: string[],
  targetFolderId: string
) => {
  const result = await organizeTemplates({
    operations: [
      {
        type: "move",
        templateIds,
        targetFolderId,
      },
    ],
  });

  if (result.success) {
    console.log("Templates organized:", result.data);
  } else {
    console.error("Failed to organize templates:", result.error);
  }
};
```

### Template Content and Validation

```typescript
import {
  validateTemplate,
  previewTemplate,
  renderTemplate,
} from "@/lib/actions/templates";

const handleValidateTemplate = async (
  content: string,
  variables: TemplateVariable[]
) => {
  const result = await validateTemplate({
    content,
    variables,
    testData: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    },
  });

  if (result.success) {
    if (result.data.isValid) {
      console.log("Template is valid");
    } else {
      console.log("Template validation errors:", result.data.errors);
    }
  } else {
    console.error("Failed to validate template:", result.error);
  }
};

const handlePreviewTemplate = async (templateId: string) => {
  const result = await previewTemplate({
    templateId,
    testData: {
      firstName: "John",
      lastName: "Doe",
      company: "Acme Corp",
    },
    format: "html",
  });

  if (result.success) {
    console.log("Template preview:", result.data.html);
  } else {
    console.error("Failed to preview template:", result.error);
  }
};
```

### Template Analytics

```typescript
import {
  getTemplateAnalytics,
  getTemplatePerformance,
} from "@/lib/actions/templates";

const handleGetAnalytics = async (templateId: string) => {
  const result = await getTemplateAnalytics({
    templateId,
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
    metrics: [
      TemplateMetric.OPENED,
      TemplateMetric.CLICKED,
      TemplateMetric.BOUNCED,
    ],
  });

  if (result.success) {
    console.log("Template analytics:", result.data);
  } else {
    console.error("Failed to get analytics:", result.error);
  }
};

const handleComparePerformance = async (templateIds: string[]) => {
  const result = await getTemplatePerformance({
    templateIds,
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    compareBy: "open_rate",
  });

  if (result.success) {
    console.log("Performance comparison:", result.data);
  } else {
    console.error("Failed to compare performance:", result.error);
  }
};
```

## Validation

### Input Validation

```typescript
import { z } from "zod";

const templateVariableSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  type: z.enum(["text", "number", "date", "boolean", "url", "email"]),
  required: z.boolean(),
  defaultValue: z.any().optional(),
  description: z.string().max(200).optional(),
  validation: z
    .object({
      pattern: z.string().optional(),
      minLength: z.number().min(0).optional(),
      maxLength: z.number().min(1).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.nativeEnum(TemplateType),
  folderId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  variables: z.array(templateVariableSchema).max(50).optional(),
});

const shareTemplateSchema = z
  .object({
    templateId: z.string(),
    shareType: z.enum(["team", "public", "specific"]),
    userIds: z.array(z.string()).optional(),
    permissions: z.array(z.nativeEnum(TemplatePermission)).min(1),
  })
  .refine(
    (data) =>
      data.shareType !== "specific" ||
      (data.userIds && data.userIds.length > 0),
    {
      message: "User IDs are required for specific sharing",
      path: ["userIds"],
    }
  );
```

### Content Validation

```typescript
function validateTemplateContent(
  content: string,
  variables: TemplateVariable[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required variables
  const variableNames = variables.filter((v) => v.required).map((v) => v.name);
  const usedVariables = extractVariablesFromContent(content);

  for (const requiredVar of variableNames) {
    if (!usedVariables.includes(requiredVar)) {
      errors.push(`Required variable '${requiredVar}' is not used in template`);
    }
  }

  // Check for undefined variables
  for (const usedVar of usedVariables) {
    if (!variables.some((v) => v.name === usedVar)) {
      warnings.push(`Variable '${usedVar}' is used but not defined`);
    }
  }

  // Check for HTML validity (basic)
  if (content.includes("<") && content.includes(">")) {
    const htmlErrors = validateHTML(content);
    errors.push(...htmlErrors);
  }

  // Check for common issues
  if (content.includes("{{") && content.includes("}}")) {
    // Check for proper variable syntax
    const invalidVariables =
      content.match(/\{\{[^}]*\}\}/g)?.filter((match) => {
        const varName = match.slice(2, -2).trim();
        return !varName.match(/^[a-zA-Z][a-zA-Z0-9_]*$/);
      }) || [];

    if (invalidVariables.length > 0) {
      errors.push(`Invalid variable syntax: ${invalidVariables.join(", ")}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function extractVariablesFromContent(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  return matches.map((match) => match.slice(2, -2).trim());
}
```

## Error Handling

### Common Error Types

```typescript
enum TemplateActionError {
  TEMPLATE_NOT_FOUND = "template_not_found",
  FOLDER_NOT_FOUND = "folder_not_found",
  TEMPLATE_IN_USE = "template_in_use",
  INVALID_CONTENT = "invalid_content",
  INVALID_VARIABLES = "invalid_variables",
  DUPLICATE_NAME = "duplicate_name",
  INSUFFICIENT_PERMISSIONS = "insufficient_permissions",
  TEMPLATE_LIMIT_REACHED = "template_limit_reached",
  FOLDER_LIMIT_REACHED = "folder_limit_reached",
}
```

### Error Handling Examples

```typescript
export async function createTemplate(
  args: CreateTemplateArgs
): Promise<ActionResult<Template>> {
  try {
    // Validate input
    const validation = createTemplateSchema.safeParse(args);
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "validation_error",
          message: "Invalid template data",
          details: validation.error.errors,
        },
      };
    }

    const { name, subject, content, type, folderId, tags, variables } =
      validation.data;

    // Check for duplicate name
    const existingTemplate = await getTemplateByName(name);
    if (existingTemplate) {
      return {
        success: false,
        error: {
          code: TemplateActionError.DUPLICATE_NAME,
          message: "A template with this name already exists",
        },
      };
    }

    // Validate content
    if (variables) {
      const contentValidation = validateTemplateContent(content, variables);
      if (!contentValidation.isValid) {
        return {
          success: false,
          error: {
            code: TemplateActionError.INVALID_CONTENT,
            message: "Template content validation failed",
            details: contentValidation.errors,
          },
        };
      }
    }

    // Check template limit
    const templateCount = await getUserTemplateCount();
    const userPlan = await getUserPlan();

    if (templateCount >= userPlan.maxTemplates) {
      return {
        success: false,
        error: {
          code: TemplateActionError.TEMPLATE_LIMIT_REACHED,
          message: "Template limit reached for your plan",
        },
      };
    }

    // Create template
    const template = await createTemplateInDB({
      name,
      subject,
      content,
      type,
      folderId,
      tags: tags || [],
      variables: variables || [],
    });

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "unknown_error",
        message: error.message,
      },
    };
  }
}
```

## Testing

### Unit Tests

```typescript
import {
  createTemplate,
  validateTemplate,
  renderTemplate,
} from "../template-actions";
import { TemplateType, TemplateVariable } from "../types";

describe("Template Actions", () => {
  describe("createTemplate", () => {
    it("should create a template with valid data", async () => {
      const args = {
        name: "Welcome Email",
        subject: "Welcome to {{company}}!",
        content: "Hello {{firstName}}, welcome to {{company}}!",
        type: TemplateType.EMAIL,
        variables: [
          { name: "firstName", type: "text", required: true },
          { name: "company", type: "text", required: true },
        ] as TemplateVariable[],
      };

      const result = await createTemplate(args);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("Welcome Email");
      expect(result.data?.variables).toHaveLength(2);
    });

    it("should fail with duplicate name", async () => {
      // Mock existing template
      mockExistingTemplate("Welcome Email");

      const args = {
        name: "Welcome Email",
        subject: "Test",
        content: "Test content",
        type: TemplateType.EMAIL,
      };

      const result = await createTemplate(args);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("duplicate_name");
    });
  });

  describe("validateTemplate", () => {
    it("should validate template with correct variables", async () => {
      const args = {
        content: "Hello {{firstName}}, your order {{orderId}} is ready!",
        variables: [
          { name: "firstName", type: "text", required: true },
          { name: "orderId", type: "text", required: true },
        ] as TemplateVariable[],
      };

      const result = await validateTemplate(args);

      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(true);
    });

    it("should detect missing required variables", async () => {
      const args = {
        content: "Hello {{firstName}}!",
        variables: [
          { name: "firstName", type: "text", required: true },
          { name: "lastName", type: "text", required: true },
        ] as TemplateVariable[],
      };

      const result = await validateTemplate(args);

      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(false);
      expect(result.data?.errors).toContain(
        "Required variable 'lastName' is not used in template"
      );
    });
  });
});
```

### Integration Tests

```typescript
describe("Template Integration", () => {
  it("should create, validate, and render template", async () => {
    // Create template
    const createResult = await createTemplate({
      name: "Test Template",
      subject: "Hello {{name}}",
      content: "Welcome {{name}}, your account is ready!",
      type: TemplateType.EMAIL,
      variables: [{ name: "name", type: "text", required: true }],
    });

    expect(createResult.success).toBe(true);
    const templateId = createResult.data!.id;

    // Validate template
    const validateResult = await validateTemplate({
      content: createResult.data!.content,
      variables: createResult.data!.variables,
    });

    expect(validateResult.success).toBe(true);
    expect(validateResult.data?.isValid).toBe(true);

    // Render template
    const renderResult = await renderTemplate({
      templateId,
      data: { name: "John Doe" },
    });

    expect(renderResult.success).toBe(true);
    expect(renderResult.data?.content).toContain("Welcome John Doe");
  });
});
```

## Best Practices

1. **Content Validation**: Always validate template content and variables before saving
2. **Version Control**: Consider implementing template versioning for important templates
3. **Performance**: Cache rendered templates for frequently used combinations
4. **Security**: Sanitize user input in template variables to prevent XSS
5. **Organization**: Use folders and tags to keep templates organized
6. **Analytics**: Track template performance to identify high-performing content
7. **Backup**: Regularly backup template content and metadata

## Related Documentation

- [Template Types](../../../types/templates.ts)
- [Email Service Integration](../../services/email/README.md)
- [Campaign Actions](../campaigns/README.md)
- [Analytics Actions](../analytics/README.md)
- [Action Patterns](../README.md)
