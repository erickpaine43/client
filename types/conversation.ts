// Email Types
import { ComponentType, SVGProps } from "react";
import type { Client } from "./clients-leads";

// Email campaign association type (different from Campaign management type)
export interface EmailCampaign {
  id: number;
  name: string;
}

export interface Email {
  id: number;
  subject: string;
  starred: boolean;
  read: boolean;
  body: string; // Primary message content
  message?: string; // Alias for body for backward compatibility
  date: string; // ISO date string
  preview: string;
  createdAt: Date;
  campaign?: EmailCampaign;
  client?: Client;
  htmlContent?: string; // HTML representation of content
}

// Extended email interface for additional details
export interface EmailWithDetails extends Email {
  campaign?: EmailCampaign;
  client?: Client;
}

// Message Types for individual messages in conversations
export interface Message {
  id: number;
  type: MessageType;
  sender: string;
  time: string; // ISO date string
  content: string;
  threadId?: number; // For threading
  parentId?: number; // For replies
  htmlContent?: string; // If available
}

// Enums
export type MessageType = "outgoing" | "incoming";

export type ConversationStatus =
  | "unread"
  | "read"
  | "archived"
  | "muted"
  | "important";

export type TagType =
  | "interested"
  | "not-interested"
  | "maybe-later"
  | "hot-lead"
  | "follow-up"
  | "replied";

// Inbox Filter Types
export interface InboxFilter {
  id: string;
  label: string;
  count?: number;
  icon?: ComponentType<SVGProps<SVGSVGElement>> | string;
}

export type InboxFilterType =
  | "all"
  | "unread"
  | "starred"
  | "archived"
  | "muted"
  | "important";

// Conversation Interface (Enhanced)
export interface Conversation {
  id: number;
  name: string;
  email: string;
  company: string;
  title: string;
  subject: string;
  preview: string;
  time: string; // ISO date string
  status: ConversationStatus;
  campaign: string;
  tag: TagType;
  isPinned: boolean;
  isStarred: boolean;
  avatar: string; // Initials or avatar image
  lastMessage: MessageType;
  notes: string; // Additional notes about the conversation
  followUpDate: string; // ISO date string for follow-up
  messages?: Message[]; // Individual messages in the conversation
  unreadCount?: number;
}

// Reply Types
export interface Reply {
  id: number;
  parentId: number; // Id of the message being replied to
  subject: string;
  content: string;
  sender: string;
  time: string;
  inReplyTo?: string; // Email's Message-ID header value
}

// Message Threading Type
export interface MessageThread {
  id: number; // Thread ID
  subject: string;
  messages: Message[];
  participants: string[]; // List of participant email addresses
  lastActivity: string; // ISO date string
  unreadCount: number;
  isStarred: boolean;
  tags?: TagType[];
}

// Inbox Types
export interface InboxItem {
  conversation: Conversation;
  filter?: InboxFilterType;
  hidden?: boolean; // For show/hide functionality
}

export interface InboxState {
  conversations: Conversation[];
  currentFilter: InboxFilterType;
  searchQuery: string;
  pageSize: number;
  currentPage: number;
  totalCount: number;
}

// Add constants for runtime usage
export const MessageTypeConstants = {
  OUTGOING: "outgoing" as const,
  INCOMING: "incoming" as const,
} as const;

export const ConversationStatusConstants = {
  UNREAD: "unread" as const,
  READ: "read" as const,
  ARCHIVED: "archived" as const,
  MUTED: "muted" as const,
  IMPORTANT: "important" as const,
} as const;

export const TagTypeConstants = {
  INTERESTED: "interested" as const,
  NOT_INTERESTED: "not-interested" as const,
  MAYBE_LATER: "maybe-later" as const,
  HOT_LEAD: "hot-lead" as const,
  FOLLOW_UP: "follow-up" as const,
  REPLIED: "replied" as const,
} as const;

export const InboxFilterTypeConstants = {
  ALL: "all" as const,
  UNREAD: "unread" as const,
  STARRED: "starred" as const,
  ARCHIVED: "archived" as const,
  MUTED: "muted" as const,
  IMPORTANT: "important" as const,
} as const;
