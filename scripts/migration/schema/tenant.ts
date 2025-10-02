/**
 * Tenant Schema Creation Script
 *
 * Creates the tenant table schema in NileDB.
 * Tenants manage multi-tenancy isolation.
 */

import { getMigrationClient } from '../config';
import { Tenant } from '../types';

export async function createTenantSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating tenant schema...');

    // Create tenant table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
      CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants("createdAt");
    `);

    // Create updated_at trigger
    await nile.db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW."updatedAt" = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_tenants_updated_at
          BEFORE UPDATE ON tenants
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✓ Tenant schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create tenant schema:', error);
    throw error;
  }
}

export async function dropTenantSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping tenant schema...');

    // Drop trigger and function
    await nile.db.query(`
      DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_tenants_slug;
      DROP INDEX IF EXISTS idx_tenants_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS tenants;`);

    console.log('✓ Tenant schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop tenant schema:', error);
    throw error;
  }
}
