/**
 * Templates Schema Creation Script
 *
 * Creates the templates table schema in NileDB.
 * Templates manage email templates.
 */

import { getMigrationClient } from '../config';

export async function createTemplatesSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating templates schema...');

    // Create templates table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_templates_tenant_id ON templates(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
      CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates("createdAt");
    `);

    // Create updated_at trigger
    await nile.db.query(`
      CREATE TRIGGER update_templates_updated_at
          BEFORE UPDATE ON templates
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✓ Templates schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create templates schema:', error);
    throw error;
  }
}

export async function dropTemplatesSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping templates schema...');

    // Drop trigger
    await nile.db.query(`DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;`);

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_templates_tenant_id;
      DROP INDEX IF EXISTS idx_templates_name;
      DROP INDEX IF EXISTS idx_templates_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS templates;`);

    console.log('✓ Templates schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop templates schema:', error);
    throw error;
  }
}
