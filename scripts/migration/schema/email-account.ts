/**
 * Email Account Schema Creation Script
 *
 * Creates the email_accounts table schema in NileDB.
 * Email accounts manage email account data.
 */

import { getMigrationClient } from '../config';

export async function createEmailAccountSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating email account schema...');

    // Create email_accounts table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS email_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_email_accounts_domain_id ON email_accounts(domain_id);
      CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON email_accounts(email);
      CREATE INDEX IF NOT EXISTS idx_email_accounts_provider ON email_accounts(provider);
    `);

    console.log('✓ Email account schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create email account schema:', error);
    throw error;
  }
}

export async function dropEmailAccountSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping email account schema...');

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_email_accounts_domain_id;
      DROP INDEX IF EXISTS idx_email_accounts_email;
      DROP INDEX IF EXISTS idx_email_accounts_provider;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS email_accounts;`);

    console.log('✓ Email account schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop email account schema:', error);
    throw error;
  }
}
