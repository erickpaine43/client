/**
 * Campaign Schema Creation Script
 *
 * Creates the campaigns table schema in NileDB.
 * Campaigns store campaign-related information and settings.
 */

import { getMigrationClient } from '../config';

export async function createCampaignSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating campaign schema...');

    // Create campaigns table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON campaigns(company_id);
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns("createdAt");
    `);

    // Create updated_at trigger
    await nile.db.query(`
      CREATE TRIGGER update_campaigns_updated_at
          BEFORE UPDATE ON campaigns
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✓ Campaign schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create campaign schema:', error);
    throw error;
  }
}

export async function dropCampaignSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping campaign schema...');

    // Drop trigger
    await nile.db.query(`DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;`);

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_campaigns_company_id;
      DROP INDEX IF EXISTS idx_campaigns_status;
      DROP INDEX IF EXISTS idx_campaigns_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS campaigns;`);

    console.log('✓ Campaign schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop campaign schema:', error);
    throw error;
  }
}
