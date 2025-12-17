/**
 * Companies Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the companies table.
 * Companies define tenant-scoped organizations with their own settings and billing.
 */

export const CREATE_COMPANIES_TABLE = `
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    domain VARCHAR(255),

    -- Plan and billing relationships
    current_plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    next_payment_due_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);
`;

export const CREATE_COMPANIES_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_current_plan_id ON companies(current_plan_id);
CREATE INDEX IF NOT EXISTS idx_companies_next_payment_due ON companies(next_payment_due_at);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
`;

export const CREATE_COMPANIES_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();
`;

export const DROP_COMPANIES_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_update_companies_updated_at ON companies;
`;

export const DROP_COMPANIES_INDEXES = `
DROP INDEX IF EXISTS idx_companies_tenant_id;
DROP INDEX IF EXISTS idx_companies_domain;
DROP INDEX IF EXISTS idx_companies_current_plan_id;
DROP INDEX IF EXISTS idx_companies_next_payment_due;
DROP INDEX IF EXISTS idx_companies_created_at;
`;

export const DROP_COMPANIES_TABLE = `
DROP TABLE IF EXISTS companies;
`;

export async function createCompanySchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating company schema...');

    // Execute table creation
    await nile.db.query(CREATE_COMPANIES_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_COMPANIES_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_COMPANIES_TRIGGERS);

    console.log('✓ Company schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create company schema:', error);
    throw error;
  }
}

export async function dropCompanySchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping company schema...');

    // Drop triggers first
    await nile.db.query(DROP_COMPANIES_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_COMPANIES_INDEXES);

    // Drop table
    await nile.db.query(DROP_COMPANIES_TABLE);

    console.log('✓ Company schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop company schema:', error);
    throw error;
  }
}
