#!/usr/bin/env tsx

/**
 * Migration Runner
 *
 * Orchestrates the complete migration process: schema creation, seeding, and validation.
 */

import { createAllSchemas } from './schema';
import { seedAllData } from './seed';
import { runValidationSuite } from './validation';

export async function runMigrations(): Promise<void> {
  console.log('🚀 Starting database migration process...\n');

  try {
    // Phase 1: Create schemas
    console.log('📋 Phase 1: Creating database schemas...');
    await createAllSchemas();
    console.log('✅ Schema creation completed\n');

    // Phase 2: Seed data
    console.log('🌱 Phase 2: Seeding sample data...');
    await seedAllData();
    console.log('✅ Data seeding completed\n');

    // Phase 3: Validation
    console.log('🔍 Phase 3: Running validation checks...');
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
    // Import rollback functions
    const { rollbackAllData } = await import('./seed');
    const { dropAllSchemas } = await import('./schema');

    // Phase 1: Rollback data
    console.log('🗑️ Phase 1: Rolling back seeded data...');
    await rollbackAllData();
    console.log('✅ Data rollback completed\n');

    // Phase 2: Drop schemas
    console.log('💥 Phase 2: Dropping database schemas...');
    await dropAllSchemas();
    console.log('✅ Schema rollback completed\n');

    console.log('🎉 Rollback process completed successfully!');
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
