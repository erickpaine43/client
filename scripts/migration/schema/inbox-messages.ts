/**
 * Inbox Messages Schema Creation Script
 *
 * Creates the inbox_messages table schema in NileDB.
 * Inbox messages store inbox message data.
 */

import { getMigrationClient } from '../config';

export async function createInboxMessagesSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating inbox messages schema...');

    // Create inbox_messages table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS inbox_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "fromEmail" VARCHAR(255) NOT NULL,
        "toEmail" VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        "receivedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_inbox_messages_tenant_id ON inbox_messages(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_inbox_messages_from_email ON inbox_messages("fromEmail");
      CREATE INDEX IF NOT EXISTS idx_inbox_messages_to_email ON inbox_messages("toEmail");
      CREATE INDEX IF NOT EXISTS idx_inbox_messages_received_at ON inbox_messages("receivedAt");
    `);

    console.log('✓ Inbox messages schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create inbox messages schema:', error);
    throw error;
  }
}

export async function dropInboxMessagesSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping inbox messages schema...');

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_inbox_messages_tenant_id;
      DROP INDEX IF EXISTS idx_inbox_messages_from_email;
      DROP INDEX IF EXISTS idx_inbox_messages_to_email;
      DROP INDEX IF EXISTS idx_inbox_messages_received_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS inbox_messages;`);

    console.log('✓ Inbox messages schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop inbox messages schema:', error);
    throw error;
  }
}
