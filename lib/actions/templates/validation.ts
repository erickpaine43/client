/**
 * Template validation utilities
 * 
 * This module provides validation functions specific to template operations
 * including template data validation, folder validation, and ID validation.
 */

import { ActionResult } from "../core/types";
import { ErrorFactory } from "../core/errors";
import { validateRequired, validateLength, validateNumber, validateEnum } from "../core/validation";
import { TemplateCategoryType, TemplateCategory } from "../../../types/templates";

/**
 * Validate template ID
 */
export function validateTemplateId(id: string): ActionResult<number> {
  const requiredCheck = validateRequired(id, 'id');
  if (!requiredCheck.isValid) {
    return ErrorFactory.validation("Template ID is required", "id");
  }

  const numericId = parseInt(id);
  if (isNaN(numericId) || numericId <= 0) {
    return ErrorFactory.validation("Template ID must be a positive number", "id");
  }

  return {
    success: true,
    data: numericId,
  };
}

/**
 * Validate folder ID
 */
export function validateFolderId(id: string): ActionResult<number> {
  const requiredCheck = validateRequired(id, 'id');
  if (!requiredCheck.isValid) {
    return ErrorFactory.validation("Folder ID is required", "id");
  }

  const numericId = parseInt(id);
  if (isNaN(numericId) || numericId <= 0) {
    return ErrorFactory.validation("Folder ID must be a positive number", "id");
  }

  return {
    success: true,
    data: numericId,
  };
}

/**
 * Validate template data for creation/update
 */
export function validateTemplateData(data: {
  id?: string;
  name?: string;
  subject?: string;
  content?: string;
  category?: string;
  folderId?: string | number;
}): ActionResult<{
  id?: number;
  name: string;
  subject: string;
  content: string;
  category?: TemplateCategoryType;
  folderId?: number;
}> {
  const errors: string[] = [];

  // Validate ID if provided
  let validatedId: number | undefined;
  if (data.id !== undefined) {
    const idValidation = validateTemplateId(data.id);
    if (!idValidation.success) {
      errors.push(idValidation.error?.message || "Invalid template ID");
    } else {
      validatedId = idValidation.data;
    }
  }

  // Validate name
  const nameValidation = validateLength(data.name || "", "name", 1, 200);
  if (!nameValidation.isValid) {
    errors.push("Template name must be between 1 and 200 characters");
  }

  // Validate subject (allow empty subject)
  let validatedSubject = "";
  if (data.subject !== undefined) {
    if (data.subject.length > 300) {
      errors.push("Template subject must be no more than 300 characters");
    } else {
      validatedSubject = data.subject;
    }
  }

  // Validate content
  const contentValidation = validateLength(data.content || "", "content", 1, 10000);
  if (!contentValidation.isValid) {
    errors.push("Template content must be between 1 and 10,000 characters");
  }

  // Validate category if provided
  let validatedCategory: TemplateCategoryType | undefined;
  if (data.category !== undefined) {
    const categoryValues = Object.values(TemplateCategory) as TemplateCategoryType[];
    const categoryValidation = validateEnum(data.category, "category", categoryValues);
    if (!categoryValidation.isValid) {
      errors.push(`Template category must be one of: ${categoryValues.join(", ")}`);
    } else {
      validatedCategory = categoryValidation.data;
    }
  }

  // Validate folder ID if provided
  let validatedFolderId: number | undefined;
  if (data.folderId !== undefined) {
    const folderIdStr = typeof data.folderId === 'string' ? data.folderId : data.folderId.toString();
    const folderIdValidation = validateNumber(folderIdStr, "folderId", { min: 1 });
    if (!folderIdValidation.isValid) {
      errors.push("Folder ID must be a positive number");
    } else {
      validatedFolderId = folderIdValidation.data;
    }
  }

  if (errors.length > 0) {
    return ErrorFactory.validation(errors.join("; "));
  }

  return {
    success: true,
    data: {
      id: validatedId,
      name: nameValidation.data!,
      subject: validatedSubject,
      content: contentValidation.data!,
      category: validatedCategory,
      folderId: validatedFolderId,
    },
  };
}

/**
 * Validate folder data for creation/update
 */
export function validateFolderData(data: {
  name?: string;
  type?: string;
  parentId?: number;
}): ActionResult<{
  name: string;
  type: "template" | "quick-reply";
  parentId?: number;
}> {
  const errors: string[] = [];

  // Validate name
  const nameValidation = validateLength(data.name || "", "name", 1, 100);
  if (!nameValidation.isValid) {
    errors.push("Folder name must be between 1 and 100 characters");
  }

  // Validate type
  const typeValidation = validateEnum(data.type || "", "type", ["template", "quick-reply"] as const);
  if (!typeValidation.isValid) {
    errors.push("Folder type must be either 'template' or 'quick-reply'");
  }

  // Validate parent ID if provided
  let validatedParentId: number | undefined;
  if (data.parentId !== undefined) {
    const parentIdValidation = validateNumber(data.parentId, "parentId", { min: 1 });
    if (!parentIdValidation.isValid) {
      errors.push("Parent folder ID must be a positive number");
    } else {
      validatedParentId = parentIdValidation.data;
    }
  }

  if (errors.length > 0) {
    return ErrorFactory.validation(errors.join("; "));
  }

  return {
    success: true,
    data: {
      name: nameValidation.data!,
      type: typeValidation.data!,
      parentId: validatedParentId,
    },
  };
}

/**
 * Validate template form data from FormData
 */
export function validateTemplateFormData(formData: FormData): ActionResult<{
  id?: number;
  name: string;
  subject: string;
  content: string;
  category?: TemplateCategoryType;
  folderId?: number;
}> {
  const data = {
    id: formData.get('id') as string | null,
    name: formData.get('name') as string | null,
    subject: formData.get('subject') as string | null,
    content: formData.get('content') as string | null,
    category: formData.get('category') as string | null,
    folderId: formData.get('folderId') as string | null,
  };

  return validateTemplateData({
    id: data.id || undefined,
    name: data.name || undefined,
    subject: data.subject || undefined,
    content: data.content || undefined,
    category: data.category || undefined,
    folderId: data.folderId || undefined,
  });
}

/**
 * Validate folder form data from FormData
 */
export function validateFolderFormData(formData: FormData): ActionResult<{
  name: string;
  type: "template" | "quick-reply";
  parentId?: number;
}> {
  const data = {
    name: formData.get('name') as string | null,
    type: formData.get('type') as string | null,
    parentId: formData.get('parentId') as string | null,
  };

  return validateFolderData({
    name: data.name || undefined,
    type: data.type || undefined,
    parentId: data.parentId ? parseInt(data.parentId) : undefined,
  });
}

/**
 * Validate template search/filter parameters
 */
export function validateTemplateFilters(params: {
  search?: string;
  category?: string;
  folderId?: string;
  type?: string;
  starred?: string;
  limit?: string;
  offset?: string;
}): ActionResult<{
  search?: string;
  category?: TemplateCategoryType;
  folderId?: number;
  type?: "template" | "quick-reply";
  starred?: boolean;
  limit: number;
  offset: number;
}> {
  const errors: string[] = [];

  // Validate search term
  let validatedSearch: string | undefined;
  if (params.search !== undefined && params.search.trim() !== '') {
    const searchValidation = validateLength(params.search.trim(), "search", 1, 100);
    if (!searchValidation.isValid) {
      errors.push("Search term must be between 1 and 100 characters");
    } else {
      validatedSearch = searchValidation.data;
    }
  }

  // Validate category
  let validatedCategory: TemplateCategoryType | undefined;
  if (params.category !== undefined && params.category.trim() !== '') {
    const categoryValues = Object.values(TemplateCategory) as TemplateCategoryType[];
    const categoryValidation = validateEnum(params.category, "category", categoryValues);
    if (!categoryValidation.isValid) {
      errors.push(`Category must be one of: ${categoryValues.join(", ")}`);
    } else {
      validatedCategory = categoryValidation.data;
    }
  }

  // Validate folder ID
  let validatedFolderId: number | undefined;
  if (params.folderId !== undefined && params.folderId.trim() !== '') {
    const folderIdValidation = validateNumber(params.folderId, "folderId", { min: 1 });
    if (!folderIdValidation.isValid) {
      errors.push("Folder ID must be a positive number");
    } else {
      validatedFolderId = folderIdValidation.data;
    }
  }

  // Validate type
  let validatedType: "template" | "quick-reply" | undefined;
  if (params.type !== undefined && params.type.trim() !== '') {
    const typeValidation = validateEnum(params.type, "type", ["template", "quick-reply"] as const);
    if (!typeValidation.isValid) {
      errors.push("Type must be either 'template' or 'quick-reply'");
    } else {
      validatedType = typeValidation.data;
    }
  }

  // Validate starred filter
  let validatedStarred: boolean | undefined;
  if (params.starred !== undefined && params.starred.trim() !== '') {
    if (params.starred === 'true') {
      validatedStarred = true;
    } else if (params.starred === 'false') {
      validatedStarred = false;
    } else {
      errors.push("Starred filter must be 'true' or 'false'");
    }
  }

  // Validate pagination
  const limitValidation = validateNumber(params.limit || "20", "limit", { min: 1, max: 100 });
  if (!limitValidation.isValid) {
    errors.push("Limit must be between 1 and 100");
  }

  const offsetValidation = validateNumber(params.offset || "0", "offset", { min: 0 });
  if (!offsetValidation.isValid) {
    errors.push("Offset must be a non-negative number");
  }

  if (errors.length > 0) {
    return ErrorFactory.validation(errors.join("; "));
  }

  return {
    success: true,
    data: {
      search: validatedSearch,
      category: validatedCategory,
      folderId: validatedFolderId,
      type: validatedType,
      starred: validatedStarred,
      limit: limitValidation.data!,
      offset: offsetValidation.data!,
    },
  };
}

/**
 * Sanitize template content to prevent XSS and ensure safe HTML
 */
export function sanitizeTemplateContent(content: string): string {
  // Basic HTML sanitization - in production, use a proper HTML sanitizer like DOMPurify
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href=""') // Remove javascript: URLs in href
    .replace(/javascript:/gi, '') // Remove remaining javascript: URLs
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers with quotes
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '') // Remove event handlers without quotes
    .trim();
}

/**
 * Validate and sanitize template content
 */
export function validateAndSanitizeContent(content: string): ActionResult<string> {
  const contentValidation = validateLength(content, "content", 1, 10000);
  if (!contentValidation.isValid) {
    return ErrorFactory.validation("Template content must be between 1 and 10,000 characters", "content");
  }

  const sanitizedContent = sanitizeTemplateContent(contentValidation.data!);
  
  if (sanitizedContent.length === 0) {
    return ErrorFactory.validation("Template content cannot be empty after sanitization", "content");
  }

  return {
    success: true,
    data: sanitizedContent,
  };
}
