/**
 * Tenant Settings Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the tenant_settings table.
 * Tenant settings define default configurations and limits for all companies in a tenant.
 */

export const CREATE_TENANT_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Default settings for all companies in this tenant
    default_theme VARCHAR(50) NOT NULL DEFAULT 'light' CHECK (default_theme IN ('light', 'dark', 'auto')),
    default_language VARCHAR(10) NOT NULL DEFAULT 'en',
    default_timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',

    -- Tenant-wide limits and features
    allow_custom_branding BOOLEAN NOT NULL DEFAULT false,
    max_companies_per_tenant INTEGER NOT NULL DEFAULT 100 CHECK (max_companies_per_tenant > 0),
    global_email_limits INTEGER NOT NULL DEFAULT 10000 CHECK (global_email_limits > 0),

    -- Audit and monitoring
    audit_logging_enabled BOOLEAN NOT NULL DEFAULT true,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(tenant_id),
    CHECK (default_language ~ '^[a-z]{2}(-[A-Z]{2})?$'),
    CHECK (default_timezone ~ '^[A-Za-z/_+-]+$')
);
`;

export const CREATE_TENANT_SETTINGS_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_default_theme ON tenant_settings(default_theme);
`;

export const CREATE_TENANT_SETTINGS_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_tenant_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenant_settings_updated_at
    BEFORE UPDATE ON tenant_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_settings_updated_at();
`;

export const DROP_TENANT_SETTINGS_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_update_tenant_settings_updated_at ON tenant_settings;
`;

export const DROP_TENANT_SETTINGS_INDEXES = `
DROP INDEX IF EXISTS idx_tenant_settings_tenant_id;
DROP INDEX IF EXISTS idx_tenant_settings_default_theme;
`;

export const DROP_TENANT_SETTINGS_TABLE = `
DROP TABLE IF EXISTS tenant_settings;
`;

export async function createTenantSettingsSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating tenant settings schema...');

    // Execute table creation
    await nile.db.query(CREATE_TENANT_SETTINGS_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_TENANT_SETTINGS_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_TENANT_SETTINGS_TRIGGERS);

    console.log('✓ Tenant settings schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create tenant settings schema:', error);
    throw error;
  }
}

export async function dropTenantSettingsSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping tenant settings schema...');

    // Drop triggers first
    await nile.db.query(DROP_TENANT_SETTINGS_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_TENANT_SETTINGS_INDEXES);

    // Drop table
    await nile.db.query(DROP_TENANT_SETTINGS_TABLE);

    console.log('✓ Tenant settings schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop tenant settings schema:', error);
    throw error;
  }
}
