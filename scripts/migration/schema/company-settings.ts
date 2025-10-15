/**
 * Company Settings Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the company_settings table.
 * Company settings define feature entitlements and configurations for each company.
 */

export const CREATE_COMPANY_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Feature flags and entitlements
    custom_branding BOOLEAN NOT NULL DEFAULT false,
    advanced_analytics BOOLEAN NOT NULL DEFAULT false,
    priority_support BOOLEAN NOT NULL DEFAULT false,

    -- Company-specific settings (flexible for future extensions)
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(company_id)
);
`;

export const CREATE_COMPANY_SETTINGS_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON company_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_custom_branding ON company_settings(custom_branding);
`;

export const CREATE_COMPANY_SETTINGS_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_company_settings_updated_at();
`;

export const DROP_COMPANY_SETTINGS_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_update_company_settings_updated_at ON company_settings;
`;

export const DROP_COMPANY_SETTINGS_INDEXES = `
DROP INDEX IF EXISTS idx_company_settings_company_id;
DROP INDEX IF EXISTS idx_company_settings_custom_branding;
`;

export const DROP_COMPANY_SETTINGS_TABLE = `
DROP TABLE IF EXISTS company_settings;
`;

export async function createCompanySettingsSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating company settings schema...');

    // Execute table creation
    await nile.db.query(CREATE_COMPANY_SETTINGS_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_COMPANY_SETTINGS_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_COMPANY_SETTINGS_TRIGGERS);

    console.log('✓ Company settings schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create company settings schema:', error);
    throw error;
  }
}

export async function dropCompanySettingsSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping company settings schema...');

    // Drop triggers first
    await nile.db.query(DROP_COMPANY_SETTINGS_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_COMPANY_SETTINGS_INDEXES);

    // Drop table
    await nile.db.query(DROP_COMPANY_SETTINGS_TABLE);

    console.log('✓ Company settings schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop company settings schema:', error);
    throw error;
  }
}
