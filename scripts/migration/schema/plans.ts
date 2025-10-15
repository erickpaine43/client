/**
 * Plans Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the plans table.
 * Plans define pricing tiers, user limits, and feature entitlements.
 */

export const CREATE_PLANS_TABLE = `
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    -- User and resource limits
    max_users INTEGER NOT NULL DEFAULT 1 CHECK (max_users > 0),
    max_domains INTEGER NOT NULL DEFAULT 1 CHECK (max_domains > 0),
    max_campaigns_per_month INTEGER NOT NULL DEFAULT 10 CHECK (max_campaigns_per_month > 0),
    api_rate_limit INTEGER NOT NULL DEFAULT 100 CHECK (api_rate_limit > 0),

    -- Pricing (in cents)
    price_monthly INTEGER NOT NULL DEFAULT 0 CHECK (price_monthly >= 0),
    price_yearly INTEGER NOT NULL DEFAULT 0 CHECK (price_yearly >= 0),

    -- Features included in this plan (JSON array of feature slugs)
    features JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Plan status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    CHECK (slug ~ '^[a-z0-9-]+$'),
    CHECK (char_length(name) >= 2)
);
`;

export const CREATE_PLANS_INDEXES = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_price_monthly ON plans(price_monthly);
`;

export const CREATE_PLANS_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_plans_updated_at();
`;

export const INSERT_DEFAULT_PLANS = `
-- Insert default plans
INSERT INTO plans (name, slug, description, max_users, max_domains, max_campaigns_per_month, api_rate_limit, price_monthly, price_yearly, features, is_active) VALUES
('Free', 'free', 'Perfect for getting started with basic email campaigns', 1, 1, 10, 100, 0, 0, '["basic-campaigns", "basic-analytics", "email-support"]', true),
('Starter', 'starter', 'Great for small teams and growing businesses', 5, 3, 100, 1000, 2900, 29000, '["advanced-campaigns", "detailed-analytics", "email-support", "basic-templates"]', true),
('Professional', 'professional', 'For professional marketers and medium-sized businesses', 25, 10, 1000, 5000, 9900, 99000, '["advanced-campaigns", "detailed-analytics", "priority-support", "custom-templates", "api-access", "advanced-segmentation"]', true),
('Enterprise', 'enterprise', 'Full-featured solution for large organizations', 100, 50, 10000, 25000, 29900, 299000, '["advanced-campaigns", "detailed-analytics", "dedicated-support", "custom-templates", "api-access", "advanced-segmentation", "custom-domain", "sso-integration", "white-label"]', true)
ON CONFLICT (slug) DO NOTHING;
`;

export const DROP_PLANS_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_update_plans_updated_at ON plans;
`;

export const DROP_PLANS_INDEXES = `
DROP INDEX IF EXISTS idx_plans_slug;
DROP INDEX IF EXISTS idx_plans_active;
DROP INDEX IF EXISTS idx_plans_price_monthly;
`;

export const DROP_PLANS_TABLE = `
DROP TABLE IF EXISTS plans;
`;

export async function createPlansSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating plans schema...');

    // Execute table creation
    await nile.db.query(CREATE_PLANS_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_PLANS_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_PLANS_TRIGGERS);

    // Insert default plans
    await nile.db.query(INSERT_DEFAULT_PLANS);

    console.log('✓ Plans schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create plans schema:', error);
    throw error;
  }
}

export async function dropPlansSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping plans schema...');

    // Drop triggers first
    await nile.db.query(DROP_PLANS_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_PLANS_INDEXES);

    // Drop table
    await nile.db.query(DROP_PLANS_TABLE);

    console.log('✓ Plans schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop plans schema:', error);
    throw error;
  }
}
