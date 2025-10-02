-- Optimization Migration: Add Missing Relationships
-- Feature: 005-type-analysis-optimization
-- Description: Add foreign key constraints and relationships identified as missing
-- Risk Level: Medium
-- Estimated Impact: Improved data integrity and referential constraints

BEGIN;

-- Create backup of constraint-related tables
CREATE TABLE campaigns_relationships_backup AS SELECT id, "userId", "companyId" FROM campaigns;
CREATE TABLE leads_relationships_backup AS SELECT id, "userId", "campaignId" FROM leads;
CREATE TABLE email_accounts_relationships_backup AS SELECT id, "domainId", "userId" FROM email_accounts;

-- Add missing foreign key constraints
-- Campaigns table relationships
ALTER TABLE campaigns ADD CONSTRAINT fk_campaigns_user_id
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE campaigns ADD CONSTRAINT fk_campaigns_company_id
  FOREIGN KEY ("companyId") REFERENCES companies(id) ON DELETE CASCADE;

-- Leads table relationships
ALTER TABLE leads ADD CONSTRAINT fk_leads_user_id
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE leads ADD CONSTRAINT fk_leads_campaign_id
  FOREIGN KEY ("campaignId") REFERENCES campaigns(id) ON DELETE CASCADE;

-- Email accounts relationships
ALTER TABLE email_accounts ADD CONSTRAINT fk_email_accounts_domain_id
  FOREIGN KEY ("domainId") REFERENCES domains(id) ON DELETE CASCADE;

ALTER TABLE email_accounts ADD CONSTRAINT fk_email_accounts_user_id
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- Templates relationships
ALTER TABLE templates ADD CONSTRAINT fk_templates_user_id
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE templates ADD CONSTRAINT fk_templates_folder_id
  FOREIGN KEY ("folderId") REFERENCES template_folders(id) ON DELETE SET NULL;

-- Team members relationships
ALTER TABLE team_members ADD CONSTRAINT fk_team_members_user_id
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE team_members ADD CONSTRAINT fk_team_members_team_id
  FOREIGN KEY ("teamId") REFERENCES teams(id) ON DELETE CASCADE;

-- Payment relationships
ALTER TABLE payments ADD CONSTRAINT fk_payments_user_id
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE payments ADD CONSTRAINT fk_payments_company_id
  FOREIGN KEY ("companyId") REFERENCES companies(id) ON DELETE CASCADE;

-- Domain relationships
ALTER TABLE domains ADD CONSTRAINT fk_domains_company_id
  FOREIGN KEY ("companyId") REFERENCES companies(id) ON DELETE CASCADE;

-- Inbox messages relationships
ALTER TABLE inbox_messages ADD CONSTRAINT fk_inbox_messages_email_account_id
  FOREIGN KEY ("emailAccountId") REFERENCES email_accounts(id) ON DELETE CASCADE;

-- Email service relationships
ALTER TABLE email_service ADD CONSTRAINT fk_email_service_domain_id
  FOREIGN KEY ("domainId") REFERENCES domains(id) ON DELETE CASCADE;

-- Create indexes to support foreign key constraints
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns("userId");
CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON campaigns("companyId");
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads("userId");
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads("campaignId");
CREATE INDEX IF NOT EXISTS idx_email_accounts_domain_id ON email_accounts("domainId");
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id ON email_accounts("userId");
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates("userId");
CREATE INDEX IF NOT EXISTS idx_templates_folder_id ON templates("folderId");
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members("userId");
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members("teamId");
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments("userId");
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments("companyId");
CREATE INDEX IF NOT EXISTS idx_domains_company_id ON domains("companyId");
CREATE INDEX IF NOT EXISTS idx_inbox_messages_email_account_id ON inbox_messages("emailAccountId");
CREATE INDEX IF NOT EXISTS idx_email_service_domain_id ON email_service("domainId");

-- Validate constraints (this will fail if data violates constraints)
-- Uncomment after data cleanup if needed
-- ALTER TABLE campaigns VALIDATE CONSTRAINT fk_campaigns_user_id;
-- ALTER TABLE leads VALIDATE CONSTRAINT fk_leads_campaign_id;

-- Log migration completion
INSERT INTO migration_log (migration_id, description, executed_at, status)
VALUES ('005-02-add-missing-relationships', 'Added missing foreign key constraints and relationships', NOW(), 'completed');

COMMIT;

-- Rollback script (for emergency use only)
-- BEGIN;
-- ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS fk_campaigns_user_id;
-- ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS fk_campaigns_company_id;
-- ALTER TABLE leads DROP CONSTRAINT IF EXISTS fk_leads_user_id;
-- ALTER TABLE leads DROP CONSTRAINT IF EXISTS fk_leads_campaign_id;
-- -- ... drop all other constraints ...
-- DROP TABLE campaigns_relationships_backup, leads_relationships_backup, email_accounts_relationships_backup;
-- COMMIT;
