import { EmailWithDetails } from "@/types/conversation";

export const mockEmails: EmailWithDetails[] = [
  {
    id: 1,
    subject: "Re: Partnership Opportunity",
    preview: "Thanks for reaching out! I'd love to schedule a call to discuss this further.",
    message: "Dear Team,\n\nThanks for reaching out! I'd love to schedule a call to discuss this further. Are you available next week?\n\nBest regards,\nSarah",
    body: "Dear Team,\n\nThanks for reaching out! I'd love to schedule a call to discuss this further. Are you available next week?\n\nBest regards,\nSarah",
    createdAt: new Date("2024-01-15T14:30:00Z"),
    date: "2024-01-15T14:30:00Z",
    client: {
      id: 1,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@techcorp.com",
    },
    campaign: {
      id: 1,
      name: "Q1 SaaS Outreach",
    },
    starred: false,
    read: true,
  },
  {
    id: 2,
    subject: "Test Email",
    preview: "This is a test preview",
    message: "This is a test message",
    body: "This is a test body",
    createdAt: new Date(),
    date: new Date().toISOString(),
    campaign: { id: 1, name: "Test Campaign" },
    starred: false,
    read: false,
  },
  {
    id: 3,
    subject: "Follow-up on Previous Discussion",
    preview: "I wanted to follow up on our conversation from last week about implementing automated solutions.",
    message: "Hi there,\n\nI wanted to follow up on our conversation from last week about implementing automated solutions in your workflow. We have several options that could streamline your processes.\n\nWould you be available for a brief call?\n\nBest,\nJohn",
    body: "Hi there,\n\nI wanted to follow up on our conversation from last week about implementing automated solutions in your workflow. We have several options that could streamline your processes.\n\nWould you be available for a brief call?\n\nBest,\nJohn",
    createdAt: new Date("2024-01-20T10:00:00Z"),
    date: "2024-01-20T10:00:00Z",
    client: {
      id: 2,
      firstName: "Mike",
      lastName: "Chen",
      email: "mike@startup.io",
    },
    campaign: {
      id: 2,
      name: "Enterprise Prospects",
    },
    starred: true,
    read: true,
  },
  {
    id: 4,
    subject: "Quick Question About Your Team",
    preview: "I noticed your team's growing fast. Do you have challenges with internal communication?",
    message: "Hello,\n\nI noticed your team's growing fast. Do you have challenges with internal communication that might benefit from automation?\n\nLooking forward to your thoughts.\n\nRegards,\nLisa",
    body: "Hello,\n\nI noticed your team's growing fast. Do you have challenges with internal communication that might benefit from automation?\n\nLooking forward to your thoughts.\n\nRegards,\nLisa",
    createdAt: new Date("2024-01-22T16:15:00Z"),
    date: "2024-01-22T16:15:00Z",
    client: {
      id: 3,
      firstName: "Lisa",
      lastName: "Rodriguez",
      email: "lisa@enterprise.com",
    },
    campaign: {
      id: 3,
      name: "SMB Follow-up",
    },
    starred: false,
    read: false,
  },
  {
    id: 5,
    subject: "Product Demo Availability",
    preview: "Hi, I'm reaching out to see if you're interested in a product demo for our enterprise solutions.",
    message: "Hi,\n\nI'm reaching out to see if you're interested in a product demo for our enterprise solutions. We have several case studies from companies similar to yours.\n\nWould Tuesday or Thursday work better?\n\nThanks,\nDavid",
    body: "Hi,\n\nI'm reaching out to see if you're interested in a product demo for our enterprise solutions. We have several case studies from companies similar to yours.\n\nWould Tuesday or Thursday work better?\n\nThanks,\nDavid",
    createdAt: new Date("2024-01-25T08:30:00Z"),
    date: "2024-01-25T08:30:00Z",
    client: {
      id: 4,
      firstName: "David",
      lastName: "Kim",
      email: "david@consulting.com",
    },
    campaign: {
      id: 4,
      name: "Partnership Outreach",
    },
    starred: false,
    read: true,
  },
  {
    id: 6,
    subject: "Welcome to Our Newsletter",
    preview: "Welcome! We're excited to share the latest updates and insights with you.",
    message: "Welcome!\n\nThank you for subscribing to our newsletter. We're excited to share the latest updates, industry insights, and product updates with you.\n\nStay tuned for weekly content.\n\nBest team,\nPenguin Mails",
    body: "Welcome!\n\nThank you for subscribing to our newsletter. We're excited to share the latest updates, industry insights, and product updates with you.\n\nStay tuned for weekly content.\n\nBest team,\nPenguin Mails",
    createdAt: new Date("2024-02-01T12:00:00Z"),
    date: "2024-02-01T12:00:00Z",
    campaign: {
      id: 5,
      name: "Newsletter Campaign",
    },
    starred: false,
    read: false,
  },
];

/**
 * Fetch an email by ID with HTML content
 */
export async function fetchEmailById(id: string | number): Promise<EmailWithDetails | null> {
  const email = mockEmails.find((email) => email.id === parseInt(id as string));

  if (!email) {
    return null;
  }

  // Return with htmlContent for consistency with previous implementation
  return {
    ...email,
    htmlContent: email.message,
  };
}

/**
 * Get all emails
 */
export async function getAllEmails(): Promise<EmailWithDetails[]> {
  return mockEmails;
}

/**
 * Get emails by campaign ID
 */
export async function getEmailsByCampaign(campaignId: number): Promise<EmailWithDetails[]> {
  return mockEmails.filter(email => email.campaign?.id === campaignId);
}

/**
 * Get unread emails
 */
export async function getUnreadEmails(): Promise<EmailWithDetails[]> {
  return mockEmails.filter(email => !email.read);
}
