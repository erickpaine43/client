import { z } from "zod";

export const CampaignSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum([
    "DRAFT",
    "SCHEDULED",
    "RUNNING",
    "PAUSED",
    "COMPLETED",
    "CANCELLED",
  ]),
  fromName: z.string(),
  fromEmail: z.string().email(),
  companyId: z.number(),
  createdById: z.string().optional(),
  metrics: z
    .object({
      sent: z.number(),
      opens: z.union([z.number(), z.null()]),
      clicks: z.union([z.number(), z.null()]),
      replies: z.number(),
      bounced: z.number().optional(),
      openRate: z.number(),
      replyRate: z.number(),
    })
    .optional(),
  sendDays: z.array(z.number().int().min(0).max(6)),
  sendTimeStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  sendTimeEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  emailsPerDay: z.number().int().positive().optional(),
  timezone: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ClientSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    notes: z.string().optional(),
    maskPII: z.boolean().optional(),
    status: z.string().optional(),
    companyId: z.number().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .optional();

export const EmailSchema = z.object({
  id: z.number(),
  subject: z.string(),
  starred: z.boolean(),
  read: z.boolean(),
  body: z.string(),
  date: z.string(),
  preview: z.string(),
  createdAt: z.coerce.date(),
  campaign: CampaignSchema,
  client: ClientSchema,
});

export const EmailsTypeSchema = z
  .object({
    emails: z.array(EmailSchema).optional(),
    unread: z.number().optional(),
  })
  .optional();

export type EmailsType = z.infer<typeof EmailsTypeSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type Client = z.infer<typeof ClientSchema>;
