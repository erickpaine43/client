/**
 * Leads Schema Creation Script
 *
 * Creates the leads table schema in NileDB.
 * Leads contain lead information.
 */

import { getMigrationClient } from '../config';

export async function createLeadsSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating leads schema...');

    // Create leads table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(200),
        company VARCHAR(200),
        status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted')),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads("createdAt");
    `);

    // Create updated_at trigger
    await nile.db.query(`
      CREATE TRIGGER update_leads_updated_at
          BEFORE UPDATE ON leads
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✓ Leads schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create leads schema:', error);
    throw error;
  }
}

export async function dropLeadsSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping leads schema...');

    // Drop trigger
    await nile.db.query(`DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;`);

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_leads_tenant_id;
      DROP INDEX IF EXISTS idx_leads_email;
      DROP INDEX IF EXISTS idx_leads_status;
      DROP INDEX IF EXISTS idx_leads_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS leads;`);

    console.log('✓ Leads schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop leads schema:', error);
    throw error;
  }
}
