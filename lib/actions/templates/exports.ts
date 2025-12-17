/**
 * Templates exports - synchronous functions and re-exports
 * This file contains all template-related exports that are NOT server actions
 */

// Re-export functions from other modules
export { getTemplateFolders, getFolderById, createTemplateFolder, updateTemplateFolder, deleteTemplateFolder } from './folders';
export { getQuickReplies, getQuickReplyById, createQuickReply, updateQuickReply, deleteQuickReply, markQuickReplyAsUsed } from './quick-replies';
