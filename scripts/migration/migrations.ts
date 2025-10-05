#!/usr/bin/env tsx

/**
 * Schema Migrations
 *
 * Handles database schema alterations (adding/removing columns) for NileDB.
 * Uses a migration tracking system to ensure migrations run only once.
 */

import { getNileClient, type Server } from '../../lib/niledb/client';

// Simple type for database query results
interface DbRow {
  [key: string]: unknown;
}

interface Migration {
  id: string;
  name: string;
  description: string;
  up: (nile: Server) => Promise<void>;
  down?: (nile: Server) => Promise<void>;
}

// Migration tracking table
const MIGRATION_TABLE = 'schema_migrations';

async function ensureMigrationTable(nile: Server): Promise<void> {
  await nile.db.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      checksum VARCHAR(64)
    )
  `);
}

async function getExecutedMigrations(nile: Server): Promise<Set<string>> {
  const result = await nile.db.query(`SELECT id FROM ${MIGRATION_TABLE} ORDER BY executed_at`);
  return new Set(result.rows.map((row: DbRow) => String(row.id)));
}

async function recordMigration(nile: Server, migration: Migration): Promise<void> {
  await nile.db.query(
    `INSERT INTO ${MIGRATION_TABLE} (id, name, description) VALUES ($1, $2, $3)`,
    [migration.id, migration.name, migration.description]
  );
}

async function removeMigrationRecord(nile: Server, migrationId: string): Promise<void> {
  await nile.db.query(`DELETE FROM ${MIGRATION_TABLE} WHERE id = $1`, [migrationId]);
}

// Define schema migrations
const migrations: Migration[] = [
  // Example: Add new column to tenant_billing
  {
    id: '001_add_subscription_tier',
    name: 'Add subscription tier to tenant billing',
    description: 'Adds tier column to track subscription levels',
    up: async (nile: Server) => {
      // Note: NileDB creates tables on-demand, but we can alter existing tenant-specific tables
      await nile.db.query(`
        ALTER TABLE tenant_billing ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'free'
      `);
    },
    down: async (nile: Server) => {
      await nile.db.query(`ALTER TABLE tenant_billing DROP COLUMN IF EXISTS tier`);
    },
  },

  // Example: Add metadata column to companies
  {
    id: '002_add_company_metadata',
    name: 'Add metadata field to companies',
    description: 'Adds flexible metadata storage for company-specific settings',
    up: async (nile: Server) => {
      await nile.db.query(`
        ALTER TABLE companies ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'
      `);
    },
    down: async (nile: Server) => {
      await nile.db.query(`ALTER TABLE companies DROP COLUMN IF EXISTS metadata`);
    },
  },

  // Add more migrations here as needed
];

export async function runSchemaMigrations(): Promise<void> {
  const nile = getNileClient();

  try {
    // Ensure migration tracking table exists
    await ensureMigrationTable(nile);

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations(nile);

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedMigrations.has(migration.id)) {
        console.log(`🔄 Running migration: ${migration.name}`);
        await migration.up(nile);
        await recordMigration(nile, migration);
        console.log(`✅ Migration completed: ${migration.id}`);
      } else {
        console.log(`⏭️  Skipping already executed migration: ${migration.id}`);
      }
    }

    console.log('✅ All schema migrations completed');

  } catch (error) {
    console.error('❌ Schema migration failed:', error);
    throw error;
  }
}

export async function rollbackSchemaMigrations(migrationId?: string): Promise<void> {
  const nile = getNileClient();

  try {
    await ensureMigrationTable(nile);
    const executedMigrations = await getExecutedMigrations(nile);

    // Find migrations to rollback
    const migrationsToRollback = migrationId
      ? migrations.filter(m => m.id === migrationId && executedMigrations.has(m.id))
      : migrations.filter(m => executedMigrations.has(m.id)).reverse();

    for (const migration of migrationsToRollback) {
      if (migration.down) {
        console.log(`🔄 Rolling back migration: ${migration.name}`);
        await migration.down(nile);
        await removeMigrationRecord(nile, migration.id);
        console.log(`✅ Migration rolled back: ${migration.id}`);
      } else {
        console.log(`⚠️  No rollback function for migration: ${migration.id}`);
      }
    }

    console.log('✅ Schema rollback completed');

  } catch (error) {
    console.error('❌ Schema rollback failed:', error);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const migrationId = process.argv[3];

  if (command === 'rollback') {
    rollbackSchemaMigrations(migrationId)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else if (command === 'run' || !command) {
    runSchemaMigrations()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    console.log('Usage: tsx migrations.ts [run|rollback] [migrationId]');
    process.exit(1);
  }
}
