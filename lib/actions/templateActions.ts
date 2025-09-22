/**
 * @deprecated This file is deprecated. Use the new templates module instead.
 *
 * Import from:
 * - lib/actions/templates/index.ts for main template operations
 * - lib/actions/templates/folders.ts for folder operations
 * - lib/actions/templates/quick-replies.ts for quick reply operations
 * - lib/actions/templates/analytics.ts for analytics operations
 * - lib/actions/templates/module.ts for all exports
 *
 * This file is maintained for backward compatibility only.
 */

// Re-export all functions from the new templates module for backward compatibility
export {
  getTemplates,
  getTemplateById,
  updateTemplate,
  getTabCounts,
} from './templates/index';

export {
  getTemplateFolders,
} from './templates/folders';

export {
  getQuickReplies,
  getQuickReplyById,
} from './templates/quick-replies';

// Legacy imports kept for potential direct usage (minimal set)
// import type { TemplateCategoryType } from "@/types";

// Legacy utility functions removed - all functionality moved to templates module

// Legacy function implementations removed - use new templates module instead
// These functions are now re-exported from the templates module above

// Legacy getTemplateFolders implementation removed - use templates/folders.ts

// Legacy getQuickReplies implementation removed - use templates/quick-replies.ts

// All legacy function implementations removed - use new templates module instead
// Functions are re-exported above for backward compatibility
