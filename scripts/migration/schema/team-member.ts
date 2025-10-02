/**
 * TeamMember Schema Creation Script
 *
 * Creates the team_member table schema in NileDB.
 * Team members are auxiliary to users for app-specific team data.
 */

import { getMigrationClient } from '../config';

export async function createTeamMemberSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating team member schema...');

    // Create team_member table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        team_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(200) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
        avatar TEXT,
        "joinedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "lastActiveAt" TIMESTAMP WITH TIME ZONE,
        permissions TEXT[] NOT NULL DEFAULT '{}',
        "twoFactorEnabled" BOOLEAN,
        metadata JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
      CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
      CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
      CREATE INDEX IF NOT EXISTS idx_team_members_joined_at ON team_members("joinedAt");
    `);

    // Create updated_at trigger
    await nile.db.query(`
      CREATE TRIGGER update_team_members_updated_at
          BEFORE UPDATE ON team_members
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✓ Team member schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create team member schema:', error);
    throw error;
  }
}

export async function dropTeamMemberSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping team member schema...');

    // Drop trigger
    await nile.db.query(`DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;`);

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_team_members_user_id;
      DROP INDEX IF EXISTS idx_team_members_team_id;
      DROP INDEX IF EXISTS idx_team_members_email;
      DROP INDEX IF EXISTS idx_team_members_role;
      DROP INDEX IF EXISTS idx_team_members_status;
      DROP INDEX IF EXISTS idx_team_members_joined_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS team_members;`);

    console.log('✓ Team member schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop team member schema:', error);
    throw error;
  }
}
