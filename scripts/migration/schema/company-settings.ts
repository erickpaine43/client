/**
 * Company Settings Schema Creation Script
 *
 * Creates the company_settings table schema in NileDB.
 * Company settings store company-specific configurations.
 */

import { getMigrationClient } from '../config';

export async function createCompanySettingsSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating company settings schema...');

    // Create company_settings table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        settings JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON company_settings(company_id);
      CREATE INDEX IF NOT EXISTS idx_company_settings_created_at ON company_settings("createdAt");
    `);

    // Create updated_at trigger
    await nile.db.query(`
      CREATE TRIGGER update_company_settings_updated_at
          BEFORE UPDATE ON company_settings
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✓ Company settings schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create company settings schema:', error);
    throw error;
  }
}

export async function dropCompanySettingsSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping company settings schema...');

    // Drop trigger
    await nile.db.query(`DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;`);

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_company_settings_company_id;
      DROP INDEX IF EXISTS idx_company_settings_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS company_settings;`);

    console.log('✓ Company settings schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop company settings schema:', error);
    throw error;
  }
}
