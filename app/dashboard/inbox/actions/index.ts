"use server";

import { inboxMockEmails, inboxMockFroms, inboxMockCampaigns } from "@/lib/data/emails.mock";
import { conversations } from "@/lib/data/Inbox.mock";

interface Query {
  email?: string[];
  from?: string[];
  campaign?: string[];
  hidden?: boolean;
}

type Type = "all" | "unread" | "starred";

interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const getAllMessagesAction = async (
  query: Query = {},
  type: Type = "all",
  pagination: PaginationOptions = {},
  search = "",
  idToken = "",
) => {
  const { email = [], from = [], campaign = [], hidden = false } = query;
  const { page = 1, limit = 10 } = pagination;

  console.log({
    query,
    type,
    pagination,
    search,
    idToken,
    email,
    from,
    campaign,
    hidden,
  });

  try {
    const emails = inboxMockEmails;
    const unread = 1;
    const total = emails.length;
    return {
      emails,
      unread,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error in getAllMessagesAction:", error);
    throw new Error("Failed to get all messages.");
  }
};

export const getUniqueFiltersAction = async (_idToken = "") => {
  try {
    const emails = inboxMockEmails;
    const froms = inboxMockFroms;
    const campaigns = inboxMockCampaigns;

    const email = emails
      .map((e) => e.client?.email)
      .filter(Boolean) as string[];

    const fromSet = new Set(
      froms
        .map((f) => {
          const first = f.client?.firstName;
          const last = f.client?.lastName;
          return first && last ? `${first} ${last}` : null;
        })
        .filter(Boolean) as string[],
    );

    const from = Array.from(fromSet);

    const campaign = campaigns
      .map((c) => c.campaign?.name)
      .filter(Boolean) as string[];

    return {
      email,
      from,
      campaign,
    };
  } catch (error) {
    console.error("Error in getUniqueFiltersAction:", error);
    throw new Error("Failed to get filters.");
  }
};

export async function fetchEmailByIdAction(id: string, _idToken = "") {
  try {
    const email = inboxMockEmails[0];

    if (!email) {
      return null;
    }
    return {
      ...email,
      htmlContent: email.body,
    };
  } catch (error) {
    console.error("Error in fetchEmailByIdAction:", error);
    throw new Error("Failed to fetch by id the email.");
  }
}

export async function fetchConversationByIdAction(id: string, _idToken = "") {
  try {
    const conversation = conversations.find((conv) => conv.id.toString() === id);
    if (!conversation) {
      return null;
    }
    return conversation;
  } catch (error) {
    console.error("Error in fetchConversationByIdAction:", error);
    throw new Error("Failed to fetch conversation.");
  }
}

export async function markEmailAsReadAction(
  id: number | string | undefined,
  _idToken = "",
) {
  try {
    const email = inboxMockEmails[0];

    return email;
  } catch (error) {
    console.error("Error in markEmailAsReadAction:", error);
    throw new Error("Failed to mark as read the email.");
  }
}

export async function markEmailAsStarredAction(
  id: number | string,
  starred: boolean,
  idToken = "",
) {
  try {
    console.log({ id, starred, idToken });
    const email = inboxMockEmails[0];

    return email;
  } catch (error) {
    console.error("Error in markEmailAsStarredAction:", error);
    throw new Error("Failed to starred the email.");
  }
}

/**
 * Soft delete an email message.
 * @param emailId - ID of the email to delete.
 * @param userId - ID of the user performing the deletion.
 */
export async function softDeleteEmailAction(
  emailId: number | string | undefined,
  _idToken = "",
) {
  try {
    const email = {
      id: 1,
      subject: "Hello World",
      body: "This is a test email.",
      toUser: {
        email: "john@example.com",
      },
      client: {
        firstName: "John",
        lastName: "Doe",
      },
      campaign: {
        name: "Test Campaign",
      },
    };

    return email;
  } catch (error) {
    console.error("Error performing soft delete:", error);
    throw new Error("Failed to soft delete the email.");
  }
}

/**
 * Hide an email message.
 * @param emailId - ID of the email to hide.
 * @param userId - ID of the user performing the hide action.
 */
export async function hideEmailAction(
  emailId: number | string | undefined,
  _idToken = "",
) {
  try {
    const email = {
      id: 1,
      subject: "Hello World",
      body: "This is a test email.",
      toUser: {
        email: "john@example.com",
      },
      client: {
        firstName: "John",
        lastName: "Doe",
      },
      campaign: {
        name: "Test Campaign",
      },
    };

    return email;
  } catch (error) {
    console.error("Error performing hide action:", error);
    throw new Error("Failed to hide the email.");
  }
}
