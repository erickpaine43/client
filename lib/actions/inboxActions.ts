'use server';

import { conversations } from '../data/Inbox.mock';
import { Conversation, ConversationStatusConstants } from '../../types/conversation';

// Get filtered conversations with improved filtering
export async function getFilteredConversations(
  params: Record<string, string | string[] | undefined>
): Promise<Conversation[]> {
  let filtered = [...conversations];

  // Status filter
  const status = params.filter as string;
  if (status && status !== "all") {
    if (status === "unread") {
      filtered = filtered.filter((c) => c.status === ConversationStatusConstants.UNREAD);
    } else if (status === "read") {
      filtered = filtered.filter((c) => c.status === ConversationStatusConstants.READ);
    } else if (status === "starred") {
      filtered = filtered.filter((c) => c.isStarred);
    } else if (status === "archived") {
      filtered = filtered.filter((c) => c.status === ConversationStatusConstants.ARCHIVED);
    }
  }

  // Campaign filter
  const campaigns = params.campaigns as string[] | undefined;
  if (campaigns && Array.isArray(campaigns) && campaigns.length > 0) {
    filtered = filtered.filter((c) => campaigns.includes(c.campaign));
  }

  // Tag filter
  const tags = params.tags as string[] | undefined;
  if (tags && Array.isArray(tags) && tags.length > 0) {
    filtered = filtered.filter((c) =>
      tags.some(tag =>
        tag.toLowerCase() === c.tag.toLowerCase().replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()).toLowerCase()
      )
    );
  }

  // Time filter - basic implementation
  const time = params.time as string;
  if (time && time !== "all") {
    const now = new Date();
    filtered = filtered.filter((c) => {
      const convTime = new Date(c.time);
      if (time === "today") {
        return convTime.toDateString() === now.toDateString();
      } else if (time === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return convTime >= weekAgo;
      } else if (time === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return convTime >= monthAgo;
      }
      return true;
    });
  }

  return filtered;
}

// Get all conversations
export async function getAllConversations(): Promise<Conversation[]> {
  return [...conversations];
}

// Get conversation by ID
export async function getConversationById(id: string | number): Promise<Conversation | null> {
  const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
  return conversation || null;
}

// Get conversation count (for headers)
export async function getConversationCount(params: Record<string, string | string[] | undefined> = {}): Promise<number> {
  const filtered = await getFilteredConversations(params);
  return filtered.length;
}

// Update conversation status
export async function updateConversationStatus(
  id: string | number,
  status: string
): Promise<Conversation | null> {
  const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
  if (!conversation) return null;

  // Update the status in the mock data (in a real app, this would be a database update)
  conversation.status = status as typeof conversation.status;
  return conversation;
}

// Update conversation starred status
export async function updateConversationStarred(
  id: string | number,
  isStarred: boolean
): Promise<Conversation | null> {
  const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
  if (!conversation) return null;

  conversation.isStarred = isStarred;
  return conversation;
}

// Update conversation pinned status
export async function updateConversationPinned(
  id: string | number,
  isPinned: boolean
): Promise<Conversation | null> {
  const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
  if (!conversation) return null;

  conversation.isPinned = isPinned;
  return conversation;
}

// Update conversation tag
export async function updateConversationTag(
  id: string | number,
  tag: string
): Promise<Conversation | null> {
  const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
  if (!conversation) return null;

  conversation.tag = tag as typeof conversation.tag;
  return conversation;
}

// Delete conversation (soft delete - archive)
export async function deleteConversation(id: string | number): Promise<boolean> {
  const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
  if (!conversation) return false;

  conversation.status = ConversationStatusConstants.ARCHIVED;
  return true;
}

// Unified helper function to get conversations for UI components
export async function getConversationsForUI(
  type: 'list' | 'small-list' | 'header' = 'list',
  params: Record<string, string | string[] | undefined> = {}
): Promise<{ conversations: Conversation[]; count?: number }> {
  const conversations = await getFilteredConversations(params);

  if (type === 'header') {
    return { conversations, count: conversations.length };
  }

  return { conversations };
}
