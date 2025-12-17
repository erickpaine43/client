'use server';

/**
 * Inbox Actions - Convex Integration
 * 
 * This module provides inbox management actions using ConvexQueryHelper
 * for type safety and standardized error handling.
 */

import {
  createActionResult,
  withConvexErrorHandling
} from '../core/errors';
import { 
  withAuth, 
  withAuthAndCompany,
  withContextualRateLimit,
  RateLimits 
} from '../core/auth';
import type { ActionResult, ActionContext } from '../core/types';
import type { Conversation } from '@/types/conversation';
import { ConversationStatusConstants } from '@/types/conversation';

/**
 * Message interface for inbox conversations
 */
export interface Message {
  id: number;
  type: "outgoing" | "incoming";
  sender: string;
  time: string;
  content: string;
}

/**
 * Conversation filters interface
 */
export interface ConversationFilters {
  filter?: string; // 'all', 'unread', 'read', 'starred', 'archived'
  campaigns?: string[];
  tags?: string[];
  time?: string; // 'all', 'today', 'week', 'month'
}

/**
 * Get filtered conversations with improved filtering
 */
export async function getFilteredConversations(
  params: ConversationFilters = {}
): Promise<ActionResult<Conversation[]>> {
  return withContextualRateLimit(
    'get_filtered_conversations',
    'company',
    RateLimits.GENERAL_READ,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex conversations schema is implemented
        const { conversations } = await import('../../data/Inbox.mock');
        let filtered = [...conversations];

        // Status filter
        const status = params.filter;
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
        const campaigns = params.campaigns;
        if (campaigns && Array.isArray(campaigns) && campaigns.length > 0) {
          filtered = filtered.filter((c) => campaigns.includes(c.campaign));
        }

        // Tag filter
        const tags = params.tags;
        if (tags && Array.isArray(tags) && tags.length > 0) {
          filtered = filtered.filter((c) =>
            tags.some(tag =>
              tag.toLowerCase() === c.tag.toLowerCase().replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()).toLowerCase()
            )
          );
        }

        // Time filter - basic implementation
        const time = params.time;
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

        return createActionResult(filtered);
      });
    })
  );
}

/**
 * Get all conversations
 */
export async function getAllConversations(): Promise<ActionResult<Conversation[]>> {
  return withContextualRateLimit(
    'get_all_conversations',
    'company',
    RateLimits.GENERAL_READ,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex conversations schema is implemented
        const { conversations } = await import('../../data/Inbox.mock');
        return createActionResult([...conversations]);
      });
    })
  );
}

/**
 * Get conversation by ID
 */
export async function getConversationById(
  id: string | number
): Promise<ActionResult<Conversation | null>> {
  return withContextualRateLimit(
    'get_conversation_by_id',
    'user',
    RateLimits.GENERAL_READ,
    () => withAuth(async (_context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex conversations schema is implemented
        const { conversations } = await import('../../data/Inbox.mock');
        const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
        return createActionResult(conversation || null);
      });
    })
  );
}

/**
 * Get conversation count (for headers)
 */
export async function getConversationCount(
  params: ConversationFilters = {}
): Promise<ActionResult<number>> {
  return withContextualRateLimit(
    'get_conversation_count',
    'company',
    RateLimits.GENERAL_READ,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const filteredResult = await getFilteredConversations(params);
        if (!filteredResult.success || !filteredResult.data) {
          return createActionResult(0);
        }
        return createActionResult(filteredResult.data.length);
      });
    })
  );
}

/**
 * Update conversation status
 */
export async function updateConversationStatus(
  id: string | number,
  status: string
): Promise<ActionResult<Conversation | null>> {
  return withContextualRateLimit(
    'update_conversation_status',
    'user',
    RateLimits.GENERAL_WRITE,
    () => withAuth(async (_context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex conversations schema is implemented
        const { conversations } = await import('../../data/Inbox.mock');
        const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
        if (!conversation) {
          return createActionResult(null);
        }

        // Update the status in the mock data (in a real app, this would be a Convex mutation)
        conversation.status = status as typeof conversation.status;
        return createActionResult(conversation);
      });
    })
  );
}

/**
 * Update conversation starred status
 */
export async function updateConversationStarred(
  id: string | number,
  isStarred: boolean
): Promise<ActionResult<Conversation | null>> {
  return withContextualRateLimit(
    'update_conversation_starred',
    'user',
    RateLimits.GENERAL_WRITE,
    () => withAuth(async (_context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex conversations schema is implemented
        const { conversations } = await import('../../data/Inbox.mock');
        const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
        if (!conversation) {
          return createActionResult(null);
        }

        conversation.isStarred = isStarred;
        return createActionResult(conversation);
      });
    })
  );
}

/**
 * Update conversation pinned status
 */
export async function updateConversationPinned(
  id: string | number,
  isPinned: boolean
): Promise<ActionResult<Conversation | null>> {
  return withContextualRateLimit(
    'update_conversation_pinned',
    'user',
    RateLimits.GENERAL_WRITE,
    () => withAuth(async (_context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex conversations schema is implemented
        const { conversations } = await import('../../data/Inbox.mock');
        const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
        if (!conversation) {
          return createActionResult(null);
        }

        conversation.isPinned = isPinned;
        return createActionResult(conversation);
      });
    })
  );
}

/**
 * Update conversation tag
 */
export async function updateConversationTag(
  id: string | number,
  tag: string
): Promise<ActionResult<Conversation | null>> {
  return withContextualRateLimit(
    'update_conversation_tag',
    'user',
    RateLimits.GENERAL_WRITE,
    () => withAuth(async (_context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex conversations schema is implemented
        const { conversations } = await import('../../data/Inbox.mock');
        const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
        if (!conversation) {
          return createActionResult(null);
        }

        conversation.tag = tag as typeof conversation.tag;
        return createActionResult(conversation);
      });
    })
  );
}

/**
 * Delete conversation (soft delete - archive)
 */
export async function deleteConversation(
  id: string | number
): Promise<ActionResult<boolean>> {
  return withContextualRateLimit(
    'delete_conversation',
    'user',
    RateLimits.GENERAL_WRITE,
    () => withAuth(async (_context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex conversations schema is implemented
        const { conversations } = await import('../../data/Inbox.mock');
        const conversation = conversations.find((c) => c.id === id || c.id.toString() === id.toString());
        if (!conversation) {
          return createActionResult(false);
        }

        conversation.status = ConversationStatusConstants.ARCHIVED;
        return createActionResult(true);
      });
    })
  );
}

/**
 * Unified helper function to get conversations for UI components
 */
export async function getConversationsForUI(
  type: 'list' | 'small-list' | 'header' = 'list',
  params: ConversationFilters = {}
): Promise<ActionResult<{ conversations: Conversation[]; count?: number }>> {
  return withContextualRateLimit(
    'get_conversations_for_ui',
    'company',
    RateLimits.GENERAL_READ,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        const conversationsResult = await getFilteredConversations(params);
        if (!conversationsResult.success || !conversationsResult.data) {
          return createActionResult({ conversations: [] });
        }

        const conversations = conversationsResult.data;

        if (type === 'header') {
          return createActionResult({ conversations, count: conversations.length });
        }

        return createActionResult({ conversations });
      });
    })
  );
}

/**
 * Get messages for a conversation/conversation-messages component
 */
export async function getMessages(): Promise<ActionResult<Message[]>> {
  return withAuth(async (_context: ActionContext) => {
    return withConvexErrorHandling(async () => {
      // For now, fall back to mock data until Convex messages schema is implemented
      const { messageThread } = await import('../../data/messages.mock');
      return createActionResult([...messageThread] as Message[]);
    });
  });
}

/**
 * Get messages for a specific conversation by ID
 */
export async function getMessagesByConversationId(
  conversationId: string | number
): Promise<ActionResult<Message[]>> {
  return withAuth(async (_context: ActionContext) => {
    return withConvexErrorHandling(async () => {
      // For now, return the same message thread for all conversations
      console.log(`Fetching messages for conversation ID: ${conversationId}`);
      // In the future, this would filter messages by conversationId using Convex
      const { messageThread } = await import('../../data/messages.mock');
      return createActionResult([...messageThread] as Message[]);
    });
  });
}

/**
 * Add a new message to a conversation
 */
export async function addMessage(
  conversationId: string | number,
  message: {
    type: "outgoing" | "incoming";
    sender: string;
    content: string;
  }
): Promise<ActionResult<Message>> {
  return withContextualRateLimit(
    'add_message',
    'user',
    RateLimits.GENERAL_WRITE,
    () => withAuth(async (_context: ActionContext) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex messages schema is implemented
        const { messageThread } = await import('../../data/messages.mock');

        const newMessage: Message = {
          id: messageThread.length + 1,
          type: message.type,
          sender: message.sender,
          time: new Date().toISOString(),
          content: message.content,
        };

        // In a real implementation, this would save to Convex database
        // For now, it just returns the new message object
        return createActionResult(newMessage);
      });
    })
  );
}

/**
 * Get message count for a conversation
 */
export async function getMessageCount(
  conversationId?: string | number
): Promise<ActionResult<number>> {
  return withAuth(async (_context: ActionContext) => {
    return withConvexErrorHandling(async () => {
      console.log(`Fetching message count for conversation ID: ${conversationId}`);
      // For now, fall back to mock data until Convex messages schema is implemented
      const { messageThread } = await import('../../data/messages.mock');
      return createActionResult(messageThread.length);
    });
  });
}
