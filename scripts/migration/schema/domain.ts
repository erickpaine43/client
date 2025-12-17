/**
 * Domains Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the domains table.
 * Domains manage email domain verification and configuration for companies.
 */

export const CREATE_DOMAINS_TABLE = `
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    domain VARCHAR(253) NOT NULL,

    -- Domain verification status
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    dns_records JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Domain settings
    is_primary BOOLEAN NOT NULL DEFAULT false,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    UNIQUE(company_id, domain),
    CHECK (domain ~ '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'),
    CHECK (char_length(domain) >= 4 AND char_length(domain) <= 253),
    CHECK (verified_at IS NULL OR verification_status = 'verified')
);
`;

export const CREATE_DOMAINS_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_domains_company_id ON domains(company_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
CREATE INDEX IF NOT EXISTS idx_domains_verification_status ON domains(verification_status);
CREATE INDEX IF NOT EXISTS idx_domains_is_primary ON domains(company_id, is_primary);
`;

export const CREATE_DOMAINS_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_domains_updated_at
    BEFORE UPDATE ON domains
    FOR EACH ROW
    EXECUTE FUNCTION update_domains_updated_at();

-- Create trigger to set verified_at when status changes to verified
CREATE OR REPLACE FUNCTION set_domains_verified_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_status = 'verified' AND OLD.verification_status != 'verified' THEN
        NEW.verified_at = NOW();
    ELSIF NEW.verification_status != 'verified' THEN
        NEW.verified_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_domains_verified_at
    BEFORE UPDATE ON domains
    FOR EACH ROW
    EXECUTE FUNCTION set_domains_verified_at();

-- Create trigger to ensure only one primary domain per company
CREATE OR REPLACE FUNCTION ensure_single_primary_domain()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary THEN
        UPDATE domains SET is_primary = false
        WHERE company_id = NEW.company_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_primary_domain
    BEFORE INSERT OR UPDATE ON domains
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_domain();
`;

export const DROP_DOMAINS_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_domain ON domains;
DROP TRIGGER IF EXISTS trigger_set_domains_verified_at ON domains;
DROP TRIGGER IF EXISTS trigger_update_domains_updated_at ON domains;
`;

export const DROP_DOMAINS_INDEXES = `
DROP INDEX IF EXISTS idx_domains_company_id;
DROP INDEX IF EXISTS idx_domains_domain;
DROP INDEX IF EXISTS idx_domains_verification_status;
DROP INDEX IF EXISTS idx_domains_is_primary;
`;

export const DROP_DOMAINS_TABLE = `
DROP TABLE IF EXISTS domains;
`;

export async function createDomainSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating domain schema...');

    // Execute table creation
    await nile.db.query(CREATE_DOMAINS_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_DOMAINS_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_DOMAINS_TRIGGERS);

    console.log('✓ Domain schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create domain schema:', error);
    throw error;
  }
}

export async function dropDomainSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping domain schema...');

    // Drop triggers first
    await nile.db.query(DROP_DOMAINS_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_DOMAINS_INDEXES);

    // Drop table
    await nile.db.query(DROP_DOMAINS_TABLE);

    console.log('✓ Domain schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop domain schema:', error);
    throw error;
  }
}
