export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "ARCHIVED";

export type EmailStepType = {
  emailSubject?: string;
  emailBody?: string;
  delayDays?: number;
  delayHours?: number;
  condition?: "always" | "if_not_opened" | "if_not_clicked" | "if_not_replied";
  type: "email" | "delay";
};

export type RecipientsSettingsProps = {
  recipients: string;
  handleChangeRecipients: (evt: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export const CampaignStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;
export type EmailEventType =
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "CLICKED"
  | "BOUNCED"
  | "SPAM_COMPLAINT"
  | "UNSUBSCRIBED"
  | "REPLIED";

export type CampaignMetrics = {
  recipients: { sent: number; total: number };
  opens: { total: number; rate: number };
  clicks: { total: number; rate: number };
  replies: { total: number; rate: number };
  bounces?: { total: number; rate: number };
};

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  fromName: string;
  fromEmail: string;
  metrics: CampaignMetrics;
  lastUpdated: string;
};

export type CampaignResponse = {
  id: number;
  name: string;
  status: CampaignStatus;
  clients: {
    campaignId: number;
    clientId: number;
    statusInCampaign: string;
  }[];
  emailEvents: {
    type: EmailEventType;
    timestamp: Date;
  }[];
  updatedAt: Date;
};
export enum CampaignStatusEnum {
  active = "active",
  paused = "paused",
  completed = "completed",
}

export interface ChartData {
  date: string;
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  clicked: number;
  formattedDate: string;
}

export interface MetricToggle {
  key: keyof ChartData;
  label: string;
  color: string;
  visible: boolean;
}

export type CampaignEventCondition =
  | "ALWAYS"
  | "IF_NOT_OPENED"
  | "IF_NOT_CLICKED"
  | "IF_NOT_REPLIED"
  | "IF_OPTION_A"
  | "IF_OPTION_B"
  | "IF_OPTION_C"
  | "IF_OPTION_D"
  | "IF_OPTION_E"
  | "IF_UNSUBSCRIBED";

export const CampaignEventCondition = {
  ALWAYS: "ALWAYS",
  IF_NOT_OPENED: "IF_NOT_OPENED",
  IF_NOT_CLICKED: "IF_NOT_CLICKED",
  IF_NOT_REPLIED: "IF_NOT_REPLIED",
  IF_OPTION_A: "IF_OPTION_A",
  IF_OPTION_B: "IF_OPTION_B",
  IF_OPTION_C: "IF_OPTION_C",
  IF_OPTION_D: "IF_OPTION_D",
  IF_OPTION_E: "IF_OPTION_E",
  IF_UNSUBSCRIBED: "IF_UNSUBSCRIBED",
} as const;

// Zod schemas and inferred types
import { z } from "zod";
import { RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import type { Template } from "./templates"; // Assuming templates are in types

export const campaignStepSchema = z.object({
  id: z.number().optional(),
  sequenceOrder: z.number(),
  delayDays: z.number(),
  delayHours: z.number(),
  templateId: z.number(),
  campaignId: z.number(),
  emailSubject: z.string().min(1).optional(),
  emailBody: z.string().optional(),
  condition: z.nativeEnum(CampaignEventCondition),
});

export const campaignFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
  companyId: z.number().optional(),
  createdById: z.string().optional(),
  steps: z.array(campaignStepSchema).min(1),
  sendDays: z.array(z.number()).optional(),
  sendTimeStart: z.string().optional(),
  sendTimeEnd: z.string().optional(),
  emailsPerDay: z.number().optional(),
  timezone: z.string().optional().default("UTC"),
  clients: z.array(z.string().email()),
  metrics: z
    .object({
      recipients: z
        .object({
          sent: z.number(),
          total: z.number(),
        })
        .optional(),
      opens: z
        .object({
          total: z.number(),
          rate: z.number(),
        })
        .optional(),
      clicks: z
        .object({
          total: z.number(),
          rate: z.number(),
        })
        .optional(),
      replies: z
        .object({
          total: z.number(),
          rate: z.number(),
        })
        .optional(),
      bounces: z
        .object({
          total: z.number(),
          rate: z.number(),
        })
        .optional(),
    })
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export interface CampaignFormProps {
  initialData?: CampaignFormValues;
  onSubmit: (data: CampaignFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  submitLoadingLabel?: string;
  readOnly?: boolean;
}

export type CampaignSteps = z.infer<typeof campaignStepSchema>[];

export type PartialCampaignStep = Partial<z.infer<typeof campaignStepSchema>>;

// Sequence types with fixed typo
interface SequenceStepActionsProps {
  onMoveStepUp: (index: number) => void;
  onMoveStepDown: (index: number) => void;
  onRemoveStep: (index: number) => void;
  onUpdateStep: (
    index: number,
    updates: Partial<SequenceStepProps["step"]>,
  ) => void;
  onInsertTag: (index: number, tag: string) => void;
  onSetCurrentEditingStep: (index: number | null) => void;
  onSelectTemplate: (index: number, templateId: number) => void;
}

interface SequenceStepProps {
  step: {
    id?: number;
    sequenceOrder: number;
    delayDays: number;
    delayHours: number;
    emailSubject?: string;
    emailBody?: string;
    templateId?: number;
    campaignId: number;
    condition: CampaignEventCondition;
    createdAt?: Date;
    updatedAt?: Date;
  };
  templates?: Template[];
  index: number;
  totalSteps: number;
  currentEditingStep: number | null;
  emailBodyRef: RefObject<HTMLTextAreaElement>;
  actions: SequenceStepActionsProps;
}

// Action enum
export enum CampaignActionsEnum {
  VIEW = "view",
  EDIT = "edit",
  DELETE = "delete",
  PAUSE = "pause",
  RESUME = "resume",
  COPY = "copy",
}

// Display types from lib/data/campaigns.ts
interface LeadsList {
  id?: number | string;
  name: string;
  description: string;
  contacts: number;
}

export interface CampaignDisplay {
  id: number;
  name: string;
  status: CampaignStatusEnum;
  mailboxes: number;
  leadsSent: number;
  replies: number;
  openRate: string;
  replyRate: string;
  lastSent: string;
  createdDate: string;
  assignedMailboxes: string[];
  leadsList?: LeadsList;
}

export interface WarmupSummaryData {
  activeMailboxes: number;
  warmingUp: number;
  readyToSend: number;
  needsAttention: number;
}

export interface StatsCardData {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export type RecentReply = {
  name: string;
  email: string;
  company: string;
  message: string;
  time: string;
  type: "positive" | "neutral";
};
