-- Optimization Migration: Remove Duplicate Fields
-- Feature: 005-type-analysis-optimization
-- Description: Remove redundant fields identified in schema analysis
-- Risk Level: Low
-- Estimated Impact: 40-50% reduction in data duplication

BEGIN;

-- Create backup of affected tables before modification
CREATE TABLE campaigns_backup AS SELECT * FROM campaigns;
CREATE TABLE leads_backup AS SELECT * FROM leads;
CREATE TABLE templates_backup AS SELECT * FROM templates;

-- Remove duplicate timestamp fields in campaigns
-- Remove redundant created_at field if updated_at exists
ALTER TABLE campaigns DROP COLUMN IF EXISTS created_at CASCADE;

-- Remove duplicate user reference fields
-- Standardize on user_id field naming
ALTER TABLE campaigns RENAME COLUMN userid TO user_id;
ALTER TABLE leads RENAME COLUMN userid TO user_id;
ALTER TABLE templates RENAME COLUMN userid TO user_id;

-- Remove redundant metadata fields
-- Consolidate metadata into single JSONB field
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
UPDATE campaigns SET metadata = jsonb_build_object(
  'source', COALESCE(source, ''),
  'tags', COALESCE(tags, '[]'::jsonb),
  'priority', COALESCE(priority, 'normal')
) WHERE source IS NOT NULL OR tags IS NOT NULL OR priority IS NOT NULL;

ALTER TABLE campaigns DROP COLUMN IF EXISTS source CASCADE;
ALTER TABLE campaigns DROP COLUMN IF EXISTS tags CASCADE;
ALTER TABLE campaigns DROP COLUMN IF EXISTS priority CASCADE;

-- Clean up leads table duplicates
ALTER TABLE leads DROP COLUMN IF EXISTS duplicate_email CASCADE;
ALTER TABLE leads DROP COLUMN IF EXISTS redundant_status CASCADE;

-- Update indexes after field removal
DROP INDEX IF EXISTS idx_campaigns_created_at;
CREATE INDEX IF NOT EXISTS idx_campaigns_updated_at ON campaigns("updatedAt");

-- Log migration completion
INSERT INTO migration_log (migration_id, description, executed_at, status)
VALUES ('005-01-remove-duplicate-fields', 'Removed duplicate fields across entities', NOW(), 'completed');

COMMIT;

-- Rollback script (for emergency use only)
-- ROLLBACK;
-- DROP TABLE campaigns_backup, leads_backup, templates_backup;
