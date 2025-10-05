/**
 * Domain Schema Creation Script
 *
 * Creates the domain table schema in NileDB.
 * Domains manage domain configurations.
 */

import { getMigrationClient } from '../config';

export async function createDomainSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating domain schema...');

    // Create domain table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS domains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL UNIQUE,
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_domains_tenant_id ON domains(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(name);
      CREATE INDEX IF NOT EXISTS idx_domains_verified ON domains(verified);
    `);

    console.log('✓ Domain schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create domain schema:', error);
    throw error;
  }
}

export async function dropDomainSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping domain schema...');

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_domains_tenant_id;
      DROP INDEX IF EXISTS idx_domains_name;
      DROP INDEX IF EXISTS idx_domains_verified;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS domains;`);

    console.log('✓ Domain schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop domain schema:', error);
    throw error;
  }
}
