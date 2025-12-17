/**
 * Campaign Entity Model
 *
 * Email marketing campaigns with sequences and performance data
 */

export interface Campaign {
  id: string;
  name: string;
  company_id: string;
  tenant_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: Date;
  updated_at: Date;
  scheduled_at?: Date;
  completed_at?: Date;
}

export interface CreateCampaignRequest {
  name: string;
  company_id: string;
  scheduled_at?: Date;
}

export interface UpdateCampaignRequest {
  name?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  scheduled_at?: Date;
}
