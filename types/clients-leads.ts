import { z } from "zod";

// Client Types

export const ClientSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
  maskPII: z.boolean().optional(),
  status: z.string().optional(),
  companyId: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Client = z.infer<typeof ClientSchema>;

export enum ClientStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  ARCHIVED = "archived",
}

// Lead Types

export enum LeadStatus {
  NOT_USED = "not-used",
  SENT = "sent",
  REPLIED = "replied",
  BOUNCED = "bounced",
}

export enum LeadListStatus {
  NOT_USED = "not-used",
  USED = "used",
  BEING_USED = "being-used",
}

export const LeadSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  company: z.string().optional(),
  title: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  tags: z.array(z.string()).optional(),
  lastContact: z.string().nullable().optional(),
  campaign: z.string().nullable().optional(),
  source: z.string().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

export const LeadListSchema = z.object({
  id: z.string(),
  name: z.string(),
  contacts: z.number(),
  description: z.string().optional(),
});

export type LeadList = z.infer<typeof LeadListSchema>;

export const LeadListDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  contacts: z.number(),
  status: z.nativeEnum(LeadListStatus),
  campaign: z.string().nullable(),
  uploadDate: z.string(),
  bounced: z.number(),
  tags: z.array(z.string()),
  performance: z.object({
    openRate: z.number(),
    replyRate: z.number(),
  }),
});

export type LeadListData = z.infer<typeof LeadListDataSchema>;

// Client Form Validation Types

export const ClientFormDataSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof ClientFormDataSchema>;

// Lead Form Validation Types (for CSV upload or manual entry)

export const LeadFormDataSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
});

export type LeadFormData = z.infer<typeof LeadFormDataSchema>;

// CSV Column Types for Lead Import

export interface CSVColumn {
  key: string;
  label: string;
  required: boolean;
}

// CSV Upload Types
export type CSVRecord = Record<string, string>;

export const CSV_COLUMNS: CSVColumn[] = [
  { key: "email", label: "Email Address", required: true },
  { key: "first_name", label: "First Name", required: true },
  { key: "last_name", label: "Last Name", required: true },
  { key: "company", label: "Company Name", required: false },
  { key: "title", label: "Job Title", required: false },
  { key: "website", label: "Website", required: false },
  { key: "phone", label: "Phone Number", required: false },
];

// Database result type for lead lists
export interface DbLeadList {
  id: string;
  name: string;
  contacts: number;
  description: string;
}

// Database result type for lead lists row from query
export interface DbLeadListRow {
  id: string;
  name: string;
  contacts: number;
  description: string;
}

// Lead Stats Type
export interface LeadStat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export type LeadStats = LeadStat[];
