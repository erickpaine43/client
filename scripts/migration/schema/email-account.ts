/**
 * Email Accounts Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the email_accounts table.
 * Email accounts manage SMTP/IMAP configurations for sending emails from verified domains.
 */

export const CREATE_EMAIL_ACCOUNTS_TABLE = `
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(domain_id, email)
);
`;

export const CREATE_EMAIL_ACCOUNTS_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_accounts_domain_id ON email_accounts(domain_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON email_accounts(email);
CREATE INDEX IF NOT EXISTS idx_email_accounts_provider ON email_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_email_accounts_created_at ON email_accounts(created_at);
`;

export const CREATE_EMAIL_ACCOUNTS_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_email_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_accounts_updated_at
    BEFORE UPDATE ON email_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_email_accounts_updated_at();
`;

export const DROP_EMAIL_ACCOUNTS_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_update_email_accounts_updated_at ON email_accounts;
`;

export const DROP_EMAIL_ACCOUNTS_INDEXES = `
DROP INDEX IF EXISTS idx_email_accounts_domain_id;
DROP INDEX IF EXISTS idx_email_accounts_email;
DROP INDEX IF EXISTS idx_email_accounts_provider;
DROP INDEX IF EXISTS idx_email_accounts_created_at;
`;

export const DROP_EMAIL_ACCOUNTS_TABLE = `
DROP TABLE IF EXISTS email_accounts;
`;

export async function createEmailAccountSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating email account schema...');

    // Execute table creation
    await nile.db.query(CREATE_EMAIL_ACCOUNTS_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_EMAIL_ACCOUNTS_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_EMAIL_ACCOUNTS_TRIGGERS);

    console.log('✓ Email account schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create email account schema:', error);
    throw error;
  }
}

export async function dropEmailAccountSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping email account schema...');

    // Drop triggers first
    await nile.db.query(DROP_EMAIL_ACCOUNTS_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_EMAIL_ACCOUNTS_INDEXES);

    // Drop table
    await nile.db.query(DROP_EMAIL_ACCOUNTS_TABLE);

    console.log('✓ Email account schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop email account schema:', error);
    throw error;
  }
}
