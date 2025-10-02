/**
 * User Schema Creation Script
 *
 * Creates the user table schema in NileDB.
 * Users are external entities from NileDB service.
 */

import { getMigrationClient } from '../config';

export async function createUserSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating user schema...');

    // Create user table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");
    `);

    // Create updated_at trigger
    await nile.db.query(`
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✓ User schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create user schema:', error);
    throw error;
  }
}

export async function dropUserSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping user schema...');

    // Drop trigger
    await nile.db.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users;`);

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_users_email;
      DROP INDEX IF EXISTS idx_users_tenant_id;
      DROP INDEX IF EXISTS idx_users_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS users;`);

    console.log('✓ User schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop user schema:', error);
    throw error;
  }
}
