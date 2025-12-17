/**
 * Inbox Messages Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the inbox_messages table.
 * Inbox messages store both inbound (from leads) and outbound (from campaign sequences) emails.
 */

export const CREATE_INBOX_MESSAGES_TABLE = `
CREATE TABLE IF NOT EXISTS inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    parent_message_id UUID REFERENCES inbox_messages(id) ON DELETE SET NULL,

    -- Message direction and type
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (message_type IN ('email', 'reply', 'bounce', 'complaint')),

    -- Email headers
    from_email VARCHAR(254) NOT NULL,
    to_email VARCHAR(254) NOT NULL,
    subject VARCHAR(500),
    in_reply_to VARCHAR(1000),

    -- Content
    content_text TEXT,
    content_html TEXT,

    -- Metadata
    external_message_id VARCHAR(500), -- Provider's message ID
    provider_status VARCHAR(50), -- Provider-specific status

    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed', 'bounced')),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    CHECK (direction = 'inbound' OR campaign_id IS NOT NULL), -- Outbound messages must have campaign
    CHECK (direction = 'inbound' OR lead_id IS NOT NULL), -- Outbound messages must have lead
    CHECK (direction = 'outbound' OR parent_message_id IS NOT NULL OR status = 'bounced') -- Inbound messages usually reply to outbound
);
`;

export const CREATE_INBOX_MESSAGES_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inbox_messages_email_account_id ON inbox_messages(email_account_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_campaign_id ON inbox_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_lead_id ON inbox_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_parent_message_id ON inbox_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_direction ON inbox_messages(direction);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_status ON inbox_messages(status);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_created_at ON inbox_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_from_email ON inbox_messages(from_email);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_to_email ON inbox_messages(to_email);
`;

export const CREATE_INBOX_MESSAGES_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_inbox_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inbox_messages_updated_at
    BEFORE UPDATE ON inbox_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_inbox_messages_updated_at();
`;

export const DROP_INBOX_MESSAGES_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_update_inbox_messages_updated_at ON inbox_messages;
`;

export const DROP_INBOX_MESSAGES_INDEXES = `
DROP INDEX IF EXISTS idx_inbox_messages_email_account_id;
DROP INDEX IF EXISTS idx_inbox_messages_campaign_id;
DROP INDEX IF EXISTS idx_inbox_messages_lead_id;
DROP INDEX IF EXISTS idx_inbox_messages_parent_message_id;
DROP INDEX IF EXISTS idx_inbox_messages_direction;
DROP INDEX IF EXISTS idx_inbox_messages_status;
DROP INDEX IF EXISTS idx_inbox_messages_created_at;
DROP INDEX IF EXISTS idx_inbox_messages_from_email;
DROP INDEX IF EXISTS idx_inbox_messages_to_email;
`;

export const DROP_INBOX_MESSAGES_TABLE = `
DROP TABLE IF EXISTS inbox_messages;
`;

export async function createInboxMessagesSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating inbox messages schema...');

    // Execute table creation
    await nile.db.query(CREATE_INBOX_MESSAGES_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_INBOX_MESSAGES_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_INBOX_MESSAGES_TRIGGERS);

    console.log('✓ Inbox messages schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create inbox messages schema:', error);
    throw error;
  }
}

export async function dropInboxMessagesSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping inbox messages schema...');

    // Drop triggers first
    await nile.db.query(DROP_INBOX_MESSAGES_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_INBOX_MESSAGES_INDEXES);

    // Drop table
    await nile.db.query(DROP_INBOX_MESSAGES_TABLE);

    console.log('✓ Inbox messages schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop inbox messages schema:', error);
    throw error;
  }
}

