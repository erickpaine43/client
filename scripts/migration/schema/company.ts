/**
 * Company Schema Creation Script
 *
 * Creates the company table schema in NileDB.
 * Companies contain company-specific data and configurations.
 */

import { getMigrationClient } from '../config';

export async function createCompanySchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating company schema...');

    // Create company table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        domain VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
      CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies("createdAt");
    `);

    // Create updated_at trigger
    await nile.db.query(`
      CREATE TRIGGER update_companies_updated_at
          BEFORE UPDATE ON companies
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✓ Company schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create company schema:', error);
    throw error;
  }
}

export async function dropCompanySchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping company schema...');

    // Drop trigger
    await nile.db.query(`DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;`);

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_companies_tenant_id;
      DROP INDEX IF EXISTS idx_companies_domain;
      DROP INDEX IF EXISTS idx_companies_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS companies;`);

    console.log('✓ Company schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop company schema:', error);
    throw error;
  }
}
