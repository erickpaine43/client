'use server';

/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new modular structure at lib/actions/inbox/ instead.
 * See lib/actions/MIGRATION_GUIDE.md for migration instructions.
 */

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/inboxActions.ts is deprecated. ' +
    'Please migrate to lib/actions/inbox/ for better organization and maintainability. ' +
    'See lib/actions/MIGRATION_GUIDE.md for migration guide.'
  );
}

// Re-export all functions from the new modular structure for backward compatibility
export {
  getFilteredConversations,
  getAllConversations,
  getConversationById,
  getConversationCount,
  updateConversationStatus,
  updateConversationStarred,
  updateConversationPinned,
  updateConversationTag,
  deleteConversation,
  getConversationsForUI,
  getMessages,
  getMessagesByConversationId,
  addMessage,
  getMessageCount,
} from './inbox';

// Re-export types
export type {
  Message,
  ConversationFilters,
} from './inbox';

// Legacy function wrapper for backward compatibility
import { getFilteredConversations as getFilteredConversationsNew } from './inbox';
import type { Conversation } from '../../types/conversation';

export async function getFilteredConversationsLegacy(
  params: Record<string, string | string[] | undefined>
): Promise<Conversation[]> {
  const filters = {
    filter: params.filter as string,
    campaigns: params.campaigns as string[],
    tags: params.tags as string[],
    time: params.time as string,
  };
  
  const result = await getFilteredConversationsNew(filters);
  if (result.success && result.data) {
    return result.data;
  }
  
  return [];
}

// Legacy wrapper functions for backward compatibility
import {
  getAllConversations as getAllConversationsNew,
  getConversationById as getConversationByIdNew,
  getConversationCount as getConversationCountNew,
  updateConversationStatus as updateConversationStatusNew,
  updateConversationStarred as updateConversationStarredNew,
  updateConversationPinned as updateConversationPinnedNew,
  updateConversationTag as updateConversationTagNew,
  deleteConversation as deleteConversationNew,
  getConversationsForUI as getConversationsForUINew,
  getMessages as getMessagesNew,
  getMessagesByConversationId as getMessagesByConversationIdNew,
  addMessage as addMessageNew,
  getMessageCount as getMessageCountNew,
} from './inbox';

export async function getAllConversationsLegacy(): Promise<Conversation[]> {
  const result = await getAllConversationsNew();
  return result.success && result.data ? result.data : [];
}

export async function getConversationByIdLegacy(id: string | number): Promise<Conversation | null> {
  const result = await getConversationByIdNew(id);
  return result.success && result.data ? result.data : null;
}

export async function getConversationCountLegacy(params: Record<string, string | string[] | undefined> = {}): Promise<number> {
  const filters = {
    filter: params.filter as string,
    campaigns: params.campaigns as string[],
    tags: params.tags as string[],
    time: params.time as string,
  };
  const result = await getConversationCountNew(filters);
  return result.success && result.data ? result.data : 0;
}

export async function updateConversationStatusLegacy(
  id: string | number,
  status: string
): Promise<Conversation | null> {
  const result = await updateConversationStatusNew(id, status);
  return result.success && result.data ? result.data : null;
}

export async function updateConversationStarredLegacy(
  id: string | number,
  isStarred: boolean
): Promise<Conversation | null> {
  const result = await updateConversationStarredNew(id, isStarred);
  return result.success && result.data ? result.data : null;
}

export async function updateConversationPinnedLegacy(
  id: string | number,
  isPinned: boolean
): Promise<Conversation | null> {
  const result = await updateConversationPinnedNew(id, isPinned);
  return result.success && result.data ? result.data : null;
}

export async function updateConversationTagLegacy(
  id: string | number,
  tag: string
): Promise<Conversation | null> {
  const result = await updateConversationTagNew(id, tag);
  return result.success && result.data ? result.data : null;
}

export async function deleteConversationLegacy(id: string | number): Promise<boolean> {
  const result = await deleteConversationNew(id);
  return result.success && result.data ? result.data : false;
}

export async function getConversationsForUILegacy(
  type: 'list' | 'small-list' | 'header' = 'list',
  params: Record<string, string | string[] | undefined> = {}
): Promise<{ conversations: Conversation[]; count?: number }> {
  const filters = {
    filter: params.filter as string,
    campaigns: params.campaigns as string[],
    tags: params.tags as string[],
    time: params.time as string,
  };
  const result = await getConversationsForUINew(type, filters);
  return result.success && result.data ? result.data : { conversations: [] };
}

export async function getMessagesLegacy() {
  const result = await getMessagesNew();
  return result.success && result.data ? result.data : [];
}

export async function getMessagesByConversationIdLegacy(conversationId: string | number) {
  const result = await getMessagesByConversationIdNew(conversationId);
  return result.success && result.data ? result.data : [];
}

export async function addMessageLegacy(
  conversationId: string | number,
  message: {
    type: "outgoing" | "incoming";
    sender: string;
    content: string;
  }
) {
  const result = await addMessageNew(conversationId, message);
  if (result.success && result.data) {
    return result.data;
  }
  
  // Fallback for legacy compatibility
  return {
    id: Date.now(),
    type: message.type,
    sender: message.sender,
    time: new Date().toISOString(),
    content: message.content,
  };
}

export async function getMessageCountLegacy(conversationId?: string | number): Promise<number> {
  const result = await getMessageCountNew(conversationId);
  return result.success && result.data ? result.data : 0;
}
