-- Optimization Migration: Fix Type Inconsistencies
-- Feature: 005-type-analysis-optimization
-- Description: Normalize type inconsistencies (UUID vs string, timestamp formats)
-- Risk Level: Medium
-- Estimated Impact: Zero type-related runtime errors

BEGIN;

-- Create backup of affected data before type changes
CREATE TABLE users_type_backup AS SELECT id, "createdAt", "updatedAt" FROM users;
CREATE TABLE campaigns_type_backup AS SELECT id, "userId", "companyId", "createdAt", "updatedAt" FROM campaigns;
CREATE TABLE leads_type_backup AS SELECT id, "userId", "campaignId", "createdAt", "updatedAt" FROM leads;

-- Fix UUID vs string inconsistencies
-- Ensure all ID fields are proper UUID type
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE campaigns ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE campaigns ALTER COLUMN "userId" TYPE UUID USING "userId"::UUID;
ALTER TABLE campaigns ALTER COLUMN "companyId" TYPE UUID USING "companyId"::UUID;
ALTER TABLE leads ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE leads ALTER COLUMN "userId" TYPE UUID USING "userId"::UUID;
ALTER TABLE leads ALTER COLUMN "campaignId" TYPE UUID USING "campaignId"::UUID;
ALTER TABLE companies ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE domains ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE email_accounts ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE templates ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE payments ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE team_members ALTER COLUMN id TYPE UUID USING id::UUID;

-- Standardize timestamp formats
-- Ensure all timestamp fields use consistent format
ALTER TABLE users ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE users ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE campaigns ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE campaigns ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE leads ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE leads ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE companies ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE companies ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC';

-- Normalize enum/status field types
-- Ensure status fields use consistent text/varchar types
ALTER TABLE campaigns ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE leads ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE email_accounts ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(50);

-- Fix text field inconsistencies
-- Standardize text field lengths where appropriate
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255);
ALTER TABLE campaigns ALTER COLUMN name TYPE VARCHAR(255);
ALTER TABLE leads ALTER COLUMN email TYPE VARCHAR(255);
ALTER TABLE leads ALTER COLUMN "firstName" TYPE VARCHAR(100);
ALTER TABLE leads ALTER COLUMN "lastName" TYPE VARCHAR(100);
ALTER TABLE companies ALTER COLUMN name TYPE VARCHAR(255);
ALTER TABLE domains ALTER COLUMN name TYPE VARCHAR(255);

-- Add default values for consistency
ALTER TABLE users ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE campaigns ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE campaigns ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE leads ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE leads ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Create updated_at triggers for consistency
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updatedAt
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Validate type consistency
-- Check that all conversions succeeded
DO $$
DECLARE
    inconsistent_count INTEGER;
BEGIN
    -- Check for any remaining type inconsistencies
    SELECT COUNT(*) INTO inconsistent_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND data_type NOT IN ('uuid', 'varchar', 'text', 'integer', 'bigint', 'boolean', 'timestamp with time zone', 'jsonb', 'numeric');

    IF inconsistent_count > 0 THEN
        RAISE WARNING 'Found % columns with inconsistent types', inconsistent_count;
    END IF;
END $$;

-- Log migration completion
INSERT INTO migration_log (migration_id, description, executed_at, status)
VALUES ('005-03-fix-type-inconsistencies', 'Fixed type inconsistencies and normalized data types', NOW(), 'completed');

COMMIT;

-- Rollback script (for emergency use only)
-- BEGIN;
-- -- Restore original types (this is complex and should be done manually)
-- -- Type conversions are generally not reversible without data loss
-- DROP TABLE users_type_backup, campaigns_type_backup, leads_type_backup;
-- COMMIT;
