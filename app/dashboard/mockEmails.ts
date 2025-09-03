export interface EmailInterface {
  id: number;
  subject: string;
  preview: string;
  message: string;
  body: string;
  createdAt: Date;
  date: string;
  client?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  campaign: {
    id: number;
    name: string;
  };
}

export const mockEmails: EmailInterface[] = [
  {
    id: 1,
    subject: "Re: Partnership Opportunity",
    preview:
      "Thanks for reaching out! I'd love to schedule a call to discuss this further.",
    message:
      "Dear Team,\n\nThanks for reaching out! I'd love to schedule a call to discuss this further. Are you available next week?\n\nBest regards,\nSarah",
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
  },
];
