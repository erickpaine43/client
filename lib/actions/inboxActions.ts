'use server';

import { conversations } from '../data/Inbox.mock';
import { Conversation, ConversationStatusConstants } from '../../types/conversation';

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
    } else if (status === "sent") {
      // Assume 'sent' logic, perhaps based on some logic not in mock
      // For now, filter based on lastMessage or something
    } else if (status === "archived") {
      // Add archived logic if needed
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
