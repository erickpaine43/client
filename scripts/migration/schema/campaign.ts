/**
 * Campaigns Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the campaigns table.
 * Campaigns define email campaign configurations and execution tracking.
 */

export const CREATE_CAMPAIGNS_TABLE = `
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Campaign status and scheduling
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'failed', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Campaign settings (JSONB for flexibility - campaign-level defaults)
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
    CHECK (completed_at IS NULL OR status = 'completed'),
    CHECK (scheduled_at IS NULL OR status IN ('scheduled', 'running', 'completed'))
    -- No additional constraints needed for JSONB settings
);
`;

export const CREATE_CAMPAIGNS_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
`;

export const CREATE_CAMPAIGNS_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaigns_updated_at();

-- Create trigger to set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_campaigns_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_campaigns_completed_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION set_campaigns_completed_at();
`;

export const DROP_CAMPAIGNS_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_set_campaigns_completed_at ON campaigns;
DROP TRIGGER IF EXISTS trigger_update_campaigns_updated_at ON campaigns;
`;

export const DROP_CAMPAIGNS_INDEXES = `
DROP INDEX IF EXISTS idx_campaigns_company_id;
DROP INDEX IF EXISTS idx_campaigns_status;
DROP INDEX IF EXISTS idx_campaigns_scheduled_at;
DROP INDEX IF EXISTS idx_campaigns_created_at;
`;

export const DROP_CAMPAIGNS_TABLE = `
DROP TABLE IF EXISTS campaigns;
`;

export async function createCampaignSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating campaign schema...');

    // Execute table creation
    await nile.db.query(CREATE_CAMPAIGNS_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_CAMPAIGNS_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_CAMPAIGNS_TRIGGERS);

    console.log('✓ Campaign schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create campaign schema:', error);
    throw error;
  }
}

export async function dropCampaignSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping campaign schema...');

    // Drop triggers first
    await nile.db.query(DROP_CAMPAIGNS_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_CAMPAIGNS_INDEXES);

    // Drop table
    await nile.db.query(DROP_CAMPAIGNS_TABLE);

    console.log('✓ Campaign schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop campaign schema:', error);
    throw error;
  }
}
