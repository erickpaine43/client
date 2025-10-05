/**
 * EmailService Schema Creation Script
 *
 * Creates the email_services table schema in NileDB.
 * Email services manage email service configurations and integrations.
 */

import { getMigrationClient } from '../config';

export async function createEmailServiceSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating email service schema...');

    // Create email_services table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS email_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        provider VARCHAR(100) NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_email_services_tenant_id ON email_services(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_email_services_provider ON email_services(provider);
      CREATE INDEX IF NOT EXISTS idx_email_services_created_at ON email_services("createdAt");
    `);

    console.log('✓ Email service schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create email service schema:', error);
    throw error;
  }
}

export async function dropEmailServiceSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping email service schema...');

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_email_services_tenant_id;
      DROP INDEX IF EXISTS idx_email_services_provider;
      DROP INDEX IF EXISTS idx_email_services_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS email_services;`);

    console.log('✓ Email service schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop email service schema:', error);
    throw error;
  }
}
