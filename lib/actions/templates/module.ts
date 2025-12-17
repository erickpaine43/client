/**
 * Templates module - Main module export
 * 
 * This file provides a centralized export for all template-related actions
 * and maintains backward compatibility with the original templateActions.ts
 */

// Main template operations
export {
  getTemplates,
  getTemplateById,
  updateTemplate,
  getTabCounts,
} from './index';

// Folder operations
export {
  getTemplateFolders,
  getFolderById,
  createTemplateFolder,
  updateTemplateFolder,
  deleteTemplateFolder,
} from './folders';

// Quick reply operations
export {
  getQuickReplies,
  getQuickReplyById,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
  markQuickReplyAsUsed,
} from './quick-replies';

// Analytics operations
export {
  getTemplateUsageStats,
  getTemplatePerformanceMetrics,
  getTemplateAnalyticsSummary,
  trackTemplateUsage,
  getTemplateUsageTrends,
} from './analytics';

// Validation utilities
export {
  validateTemplateId,
  validateFolderId,
  validateTemplateData,
  validateFolderData,
  validateTemplateFormData,
  validateFolderFormData,
  validateTemplateFilters,
  sanitizeTemplateContent,
  validateAndSanitizeContent,
} from './validation';

// Type exports for convenience
export type {
  TemplateUsageStats,
  TemplatePerformanceMetrics,
  TemplateAnalyticsSummary,
} from './analytics';
