#!/usr/bin/env tsx

/**
 * Migration Runner
 *
 * Executes database schema migrations (adding/removing columns) in proper order.
 * Note: NileDB creates tables on-demand, so this focuses on schema alterations.
 */

import { runSchemaMigrations } from './migrations';
import { runValidationSuite } from './validation';

export async function runMigrations(): Promise<void> {
  console.log('🚀 Starting database migration process...\n');

  try {
    // Phase 1: Run schema migrations
    console.log('📋 Phase 1: Running schema migrations...');
    await runSchemaMigrations();
    console.log('✅ Schema migrations completed\n');

    // Phase 2: Validation
    console.log('🔍 Phase 2: Running validation checks...');
    const validationResult = await runValidationSuite();

    if (validationResult.overallSuccess) {
      console.log('✅ All validations passed!');
      console.log('🎉 Migration process completed successfully!');
    } else {
      console.error('❌ Validation failed!');
      console.error('Issues found:', validationResult.errors);
      throw new Error('Migration validation failed');
    }

  } catch (error) {
    console.error('💥 Migration process failed:', error);
    throw error;
  }
}

export async function rollbackMigrations(): Promise<void> {
  console.log('🔄 Starting migration rollback...\n');

  try {
    // Note: Schema migrations don't have rollback in this version
    // For seed rollback, use: npm run db:seed:rollback

    console.log('⚠️  Schema migrations do not support rollback in this version.');
    console.log('💡 For seed data rollback, run: npm run db:seed:rollback');

    console.log('🎉 Rollback process completed (no-op)!');
  } catch (error) {
    console.error('💥 Rollback process failed:', error);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'rollback') {
    rollbackMigrations()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else if (command === 'run' || !command) {
    runMigrations()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    console.log('Usage: tsx runner.ts [run|rollback]');
    process.exit(1);
  }
}
