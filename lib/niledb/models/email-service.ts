/**
 * EmailService Entity Model
 *
 * Outbound emails, sequences, and analytics
 */

export interface EmailService {
  id: string;
  campaign_id: string;
  recipient_email: string;
  subject: string;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked';
  sent_at?: Date;
  delivered_at?: Date;
  opened_at?: Date;
  clicked_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmailRequest {
  campaign_id: string;
  recipient_email: string;
  subject: string;
  content: string;
}

export interface UpdateEmailStatusRequest {
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked';
}
