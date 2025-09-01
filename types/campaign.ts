export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";

export const CampaignStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED"
} as const;
export type EmailEventType = "SENT" | "DELIVERED" | "OPENED" | "CLICKED" | "BOUNCED" | "SPAM_COMPLAINT" | "UNSUBSCRIBED" | "REPLIED"

export type CampaignMetrics = {
  recipients: { sent: number; total: number }
  opens: { total: number; rate: number }
  clicks: { total: number; rate: number }
  replies: { total: number; rate: number }
  bounces?: { total: number; rate: number }
}

export type Campaign = {
  id: string
  name: string
  status: CampaignStatus
  fromName: string
  fromEmail: string
  metrics: CampaignMetrics
  lastUpdated: string
}

export type CampaignResponse = {
  id: number
  name: string
  status: CampaignStatus
  clients: {
    campaignId: number
    clientId: number
    statusInCampaign: string
  }[]
  emailEvents: {
    type: EmailEventType
    timestamp: Date
  }[]
  updatedAt: Date
}
export enum statusCampaign {
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

export type CampaignEventContition = "ALWAYS" | "IF_NOT_OPENED" | "IF_NOT_CLICKED" | "IF_NOT_REPLIED" | "IF_OPTION_A" | "IF_OPTION_B" | "IF_OPTION_C" | "IF_OPTION_D" | "IF_OPTION_E" | "IF_UNSUBSCRIBED";

export const CampaignEventContition = {
  ALWAYS: "ALWAYS",
  IF_NOT_OPENED: "IF_NOT_OPENED",
  IF_NOT_CLICKED: "IF_NOT_CLICKED",
  IF_NOT_REPLIED: "IF_NOT_REPLIED",
  IF_OPTION_A: "IF_OPTION_A",
  IF_OPTION_B: "IF_OPTION_B",
  IF_OPTION_C: "IF_OPTION_C",
  IF_OPTION_D: "IF_OPTION_D",
  IF_OPTION_E: "IF_OPTION_E",
  IF_UNSUBSCRIBED: "IF_UNSUBSCRIBED"
} as const;

