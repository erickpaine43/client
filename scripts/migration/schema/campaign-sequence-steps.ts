/**
 * Campaign Sequence Steps Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the campaign_sequence_steps table.
 * Campaign sequence steps define the workflow of a campaign (email steps, wait steps, conditions).
 */

export const CREATE_CAMPAIGN_SEQUENCE_STEPS_TABLE = `
CREATE TABLE IF NOT EXISTS campaign_sequence_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

    -- Step definition
    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL CHECK (step_type IN ('email', 'wait', 'condition')),

    -- Email step configuration
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    subject_override VARCHAR(500),
    from_name_override VARCHAR(100),

    -- Wait step configuration
    wait_duration_hours INTEGER CHECK (wait_duration_hours > 0),
    wait_until_date TIMESTAMP WITH TIME ZONE,

    -- Condition step configuration
    condition_type VARCHAR(50) CHECK (condition_type IN ('opened', 'clicked', 'replied', 'not_opened', 'not_clicked')),
    condition_value VARCHAR(100),

    -- Step settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[], -- Tags for step organization

    -- Execution tracking
    executed_count INTEGER NOT NULL DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(campaign_id, step_order),
    CHECK (
        (step_type = 'email' AND email_account_id IS NOT NULL AND template_id IS NOT NULL) OR
        (step_type = 'wait' AND (wait_duration_hours IS NOT NULL OR wait_until_date IS NOT NULL)) OR
        (step_type = 'condition' AND condition_type IS NOT NULL)
    ),
    CHECK (step_order >= 1)
);
`;

export const CREATE_CAMPAIGN_SEQUENCE_STEPS_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_steps_campaign_id ON campaign_sequence_steps(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_steps_step_order ON campaign_sequence_steps(campaign_id, step_order);
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_steps_step_type ON campaign_sequence_steps(step_type);
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_steps_email_account_id ON campaign_sequence_steps(email_account_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_steps_template_id ON campaign_sequence_steps(template_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_steps_is_active ON campaign_sequence_steps(is_active);
CREATE INDEX IF NOT EXISTS idx_campaign_sequence_steps_created_at ON campaign_sequence_steps(created_at);
`;

export const CREATE_CAMPAIGN_SEQUENCE_STEPS_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_campaign_sequence_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_sequence_steps_updated_at
    BEFORE UPDATE ON campaign_sequence_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_sequence_steps_updated_at();

-- Create trigger to maintain step order integrity
CREATE OR REPLACE FUNCTION maintain_campaign_step_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Reorder steps when a step is deleted
    IF TG_OP = 'DELETE' THEN
        UPDATE campaign_sequence_steps
        SET step_order = step_order - 1
        WHERE campaign_id = OLD.campaign_id
          AND step_order > OLD.step_order;
        RETURN OLD;
    END IF;

    -- Prevent duplicate step orders
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF EXISTS (
            SELECT 1 FROM campaign_sequence_steps
            WHERE campaign_id = NEW.campaign_id
              AND step_order = NEW.step_order
              AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        ) THEN
            RAISE EXCEPTION 'Step order % already exists for campaign %', NEW.step_order, NEW.campaign_id;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maintain_campaign_step_order
    BEFORE INSERT OR UPDATE OR DELETE ON campaign_sequence_steps
    FOR EACH ROW
    EXECUTE FUNCTION maintain_campaign_step_order();
`;

export const DROP_CAMPAIGN_SEQUENCE_STEPS_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_maintain_campaign_step_order ON campaign_sequence_steps;
DROP TRIGGER IF EXISTS trigger_update_campaign_sequence_steps_updated_at ON campaign_sequence_steps;
`;

export const DROP_CAMPAIGN_SEQUENCE_STEPS_INDEXES = `
DROP INDEX IF EXISTS idx_campaign_sequence_steps_campaign_id;
DROP INDEX IF EXISTS idx_campaign_sequence_steps_step_order;
DROP INDEX IF EXISTS idx_campaign_sequence_steps_step_type;
DROP INDEX IF EXISTS idx_campaign_sequence_steps_email_account_id;
DROP INDEX IF EXISTS idx_campaign_sequence_steps_template_id;
DROP INDEX IF EXISTS idx_campaign_sequence_steps_is_active;
DROP INDEX IF EXISTS idx_campaign_sequence_steps_created_at;
`;

export const DROP_CAMPAIGN_SEQUENCE_STEPS_TABLE = `
DROP TABLE IF EXISTS campaign_sequence_steps;
`;

export async function createCampaignSequenceStepsSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating campaign sequence steps schema...');

    // Use directly exported constants from this same file
    const tableSQL = CREATE_CAMPAIGN_SEQUENCE_STEPS_TABLE;
    const indexesSQL = CREATE_CAMPAIGN_SEQUENCE_STEPS_INDEXES;
    const triggersSQL = CREATE_CAMPAIGN_SEQUENCE_STEPS_TRIGGERS;

    // Execute table creation
    await nile.db.query(tableSQL);

    // Execute indexes creation
    await nile.db.query(indexesSQL);

    // Execute triggers creation
    await nile.db.query(triggersSQL);

    // Execute table creation
    await nile.db.query(CREATE_CAMPAIGN_SEQUENCE_STEPS_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_CAMPAIGN_SEQUENCE_STEPS_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_CAMPAIGN_SEQUENCE_STEPS_TRIGGERS);

    console.log('✓ Campaign sequence steps schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create campaign sequence steps schema:', error);
    throw error;
  }
}

export async function dropCampaignSequenceStepsSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping campaign sequence steps schema...');

    // Use directly exported constants from this same file
    const dropTriggersSQL = DROP_CAMPAIGN_SEQUENCE_STEPS_TRIGGERS;
    const dropIndexesSQL = DROP_CAMPAIGN_SEQUENCE_STEPS_INDEXES;
    const dropTableSQL = DROP_CAMPAIGN_SEQUENCE_STEPS_TABLE;

    // Drop triggers first
    await nile.db.query(dropTriggersSQL);

    // Drop indexes
    await nile.db.query(dropIndexesSQL);

    // Drop table
    await nile.db.query(dropTableSQL);

    console.log('✓ Campaign sequence steps schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop campaign sequence steps schema:', error);
    throw error;
  }
}
