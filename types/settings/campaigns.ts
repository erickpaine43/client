/**
 * Campaigns TypeScript Interface
 * Defines the structure for email campaign management
 */

export interface Campaign {
  id?: string;
  companyId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  scheduledAt?: string;
  completedAt?: string;

  // Campaign settings - flexible configuration
  settings?: Record<string, unknown>;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Campaign creation/update payload
 */
export interface CampaignInput {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  scheduledAt?: string;

  // Campaign settings
  settings?: Record<string, unknown>;
}

/**
 * Campaign response (without internal fields)
 */
export interface CampaignResponse {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  scheduledAt?: string;
  completedAt?: string;

  // Campaign settings
  settings: Record<string, unknown>;

  updatedAt: string;
}

/**
 * Campaign status enum
 */
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Campaign settings are now spread across explicit fields in the Campaign interface
// Custom headers remain as JSONB for flexibility with additional email headers

/**
 * Campaign performance metrics
 */
export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}
