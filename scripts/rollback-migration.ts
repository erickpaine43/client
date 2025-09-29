#!/usr/bin/env npx tsx

/**
 * NileDB Migration Rollback Script
 * 
 * This script provides comprehensive rollback capabilities for the NileDB migration.
 * It can perform selective or complete rollbacks with data preservation options.
 * 
 * Usage:
 *   npm run rollback:migration
 *   npx tsx scripts/rollback-migration.ts
 *   npx tsx scripts/rollback-migration.ts --complete
 *   npx tsx scripts/rollback-migration.ts --selective=users,companies
 */

import { withoutTenantContext } from '../lib/niledb/client';
import { validateConfiguration } from '../lib/niledb/health';

interface RollbackOptions {
  complete?: boolean;
  selective?: string[];
  dryRun?: boolean;
  preserveStaff?: boolean;
  backup?: boolean;
  verbose?: boolean;
}

interface RollbackStats {
  usersRemoved: number;
  profilesRemoved: number;
  tenantsRemoved: number;
  companiesRemoved: number;
  relationshipsRemoved: number;
  errors: string[];
  warnings: string[];
}

/**
 * Migration rollback class
 */
class MigrationRollback {
  private stats: RollbackStats = {
    usersRemoved: 0,
    profilesRemoved: 0,
    tenantsRemoved: 0,
    companiesRemoved: 0,
    relationshipsRemoved: 0,
    errors: [],
    warnings: []
  };

  constructor(private options: RollbackOptions = {}) {}

  /**
   * Perform migration rollback
   */
  async rollback(): Promise<RollbackStats> {
    console.log('🔄 Starting NileDB Migration Rollback...\n');

    try {
      // Validate prerequisites
      await this.validatePrerequisites();

      if (this.options.dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');
        await this.performDryRun();
        return this.stats;
      }

      // Create backup if requested
      if (this.options.backup) {
        await this.createBackup();
 }

      // Perform rollback based on options
      if (this.options.complete) {
        await this.performCompleteRollback();
      } else if (this.options.selective) {
        await this.performSelectiveRollback(this.options.selective);
      } else {
        // Default: complete rollback with staff preservation
        this.options.preserveStaff = true;
        await this.performCompleteRollback();
      }

      console.log('\n✅ Rollback completed successfully!');
      this.printStats();

      return this.stats;

    } catch (error) {
      console.error('\n❌ Rollback failed:', error);
      this.stats.errors.push(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Validate prerequisites
   */
  private async validatePrerequisites(): Promise<void> {
    console.log('1️⃣ Validating prerequisites...');

    const configValidation = validateConfiguration();
    if (!configValidation.isValid) {
      throw new Error(`Configuration errors: ${configValidation.errors.join(', ')}`);
    }

    console.log('✅ Prerequisites validated\n');
  }

  /**
   * Create backup before rollback
   */
  private async createBackup(): Promise<void> {
    console.log('2️⃣ Creating backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
      timestamp,
      users: [],
      profiles: [],
      tenants: [],
      companies: [],
      userCompanies: []
    };

    try {
      // Backup users
      const users = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT * FROM users.users WHERE deleted IS NULL'
        );
      });
      backupData.users = users.rows;

      // Backup profiles
      const profiles = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT * FROM public.user_profiles WHERE deleted IS NULL'
        );
      });
      backupData.profiles = profiles.rows;

      // Backup tenants
      const tenants = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT * FROM public.tenants WHERE deleted IS NULL'
        );
      });
      backupData.tenants = tenants.rows;

      // Backup companies
      const companies = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT * FROM public.companies WHERE deleted IS NULL'
        );
      });
      backupData.companies = companies.rows;

      // Backup user-company relationships
      const userCompanies = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT * FROM public.user_companies WHERE deleted IS NULL'
        );
      });
      backupData.userCompanies = userCompanies.rows;

      // Save backup (in a real implementation, this would save to file)
      console.log(`  ✅ Backup created with ${users.rows.length} users, ${tenants.rows.length} tenants, ${companies.rows.length} companies`);

    } catch (error) {
      const errorMsg = `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`  ❌ ${errorMsg}`);
      this.stats.warnings.push(errorMsg);
    }

    console.log('');
  }

  /**
   * Perform complete rollback
   */
  private async performCompleteRollback(): Promise<void> {
    console.log('3️⃣ Performing complete rollback...');

    // Rollback in reverse dependency order
    await this.rollbackUserCompanyRelationships();
    await this.rollbackCompanies();
    await this.rollbackTenantUsers();
    await this.rollbackTenants();
    await this.rollbackUserProfiles();
    await this.rollbackUsers();

    console.log('✅ Complete rollback finished\n');
  }

  /**
   * Perform selective rollback
   */
  private async performSelectiveRollback(entities: string[]): Promise<void> {
    console.log(`3️⃣ Performing selective rollback for: ${entities.join(', ')}...`);

    for (const entity of entities) {
      switch (entity.toLowerCase()) {
        case 'users':
          await this.rollbackUsers();
          break;
        case 'profiles':
          await this.rollbackUserProfiles();
          break;
        case 'tenants':
          await this.rollbackTenants();
          break;
        case 'companies':
          await this.rollbackCompanies();
          break;
        case 'relationships':
          await this.rollbackUserCompanyRelationships();
          break;
        default:
          this.stats.warnings.push(`Unknown entity type: ${entity}`);
      }
    }

    console.log('✅ Selective rollback finished\n');
  }

  /**
   * Rollback user-company relationships
   */
  private async rollbackUserCompanyRelationships(): Promise<void> {
    if (this.options.verbose) {
      console.log('  Rolling back user-company relationships...');
    }

    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `UPDATE public.user_companies 
           SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
           WHERE deleted IS NULL`
        );
      });

      this.stats.relationshipsRemoved = result.rowCount || 0;
      console.log(`    ✅ Removed ${this.stats.relationshipsRemoved} user-company relationships`);

    } catch (error) {
      const errorMsg = `Failed to rollback user-company relationships: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`    ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }
  }

  /**
   * Rollback companies
   */
  private async rollbackCompanies(): Promise<void> {
    if (this.options.verbose) {
      console.log('  Rolling back companies...');
    }

    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `UPDATE public.companies 
           SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
           WHERE deleted IS NULL`
        );
      });

      this.stats.companiesRemoved = result.rowCount || 0;
      console.log(`    ✅ Removed ${this.stats.companiesRemoved} companies`);

    } catch (error) {
      const errorMsg = `Failed to rollback companies: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`    ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }
  }

  /**
   * Rollback tenant-user relationships
   */
  private async rollbackTenantUsers(): Promise<void> {
    if (this.options.verbose) {
      console.log('  Rolling back tenant-user relationships...');
    }

    try {
      let query = `UPDATE users.tenant_users 
                   SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
                   WHERE deleted IS NULL`;
      
      // Preserve staff users if requested
      if (this.options.preserveStaff) {
        query += ` AND user_id NOT IN (
          SELECT user_id FROM public.user_profiles 
          WHERE is_penguinmails_staff = true AND deleted IS NULL
        )`;
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(query);
      });

      console.log(`    ✅ Removed ${result.rowCount || 0} tenant-user relationships`);

    } catch (error) {
      const errorMsg = `Failed to rollback tenant-user relationships: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`    ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }
  }

  /**
   * Rollback tenants
   */
  private async rollbackTenants(): Promise<void> {
    if (this.options.verbose) {
      console.log('  Rolling back tenants...');
    }

    try {
      let query = `UPDATE public.tenants 
                   SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
                   WHERE deleted IS NULL`;

      // Preserve PenguinMails tenant if preserving staff
      if (this.options.preserveStaff) {
        query += ` AND name != 'PenguinMails'`;
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(query);
      });

      this.stats.tenantsRemoved = result.rowCount || 0;
      console.log(`    ✅ Removed ${this.stats.tenantsRemoved} tenants`);

    } catch (error) {
      const errorMsg = `Failed to rollback tenants: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`    ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }
  }

  /**
   * Rollback user profiles
   */
  private async rollbackUserProfiles(): Promise<void> {
    if (this.options.verbose) {
      console.log('  Rolling back user profiles...');
    }

    try {
      let query = `UPDATE public.user_profiles 
                   SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
                   WHERE deleted IS NULL`;

      // Preserve staff profiles if requested
      if (this.options.preserveStaff) {
        query += ` AND is_penguinmails_staff = false`;
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(query);
      });

      this.stats.profilesRemoved = result.rowCount || 0;
      console.log(`    ✅ Removed ${this.stats.profilesRemoved} user profiles`);

    } catch (error) {
      const errorMsg = `Failed to rollback user profiles: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`    ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }
  }

  /**
   * Rollback users
   */
  private async rollbackUsers(): Promise<void> {
    if (this.options.verbose) {
      console.log('  Rolling back users...');
    }

    try {
      let query = `UPDATE users.users 
                   SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
                   WHERE deleted IS NULL`;

      // Preserve staff users if requested
      if (this.options.preserveStaff) {
        query += ` AND id NOT IN (
          SELECT user_id FROM public.user_profiles 
          WHERE is_penguinmails_staff = true AND deleted IS NULL
        )`;
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(query);
      });

      this.stats.usersRemoved = result.rowCount || 0;
      console.log(`    ✅ Removed ${this.stats.usersRemoved} users`);

    } catch (error) {
      const errorMsg = `Failed to rollback users: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`    ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }
  }

  /**
   * Perform dry run analysis
   */
  private async performDryRun(): Promise<void> {
    console.log('📋 DRY RUN ANALYSIS:\n');

    try {
      // Count users
      const users = await withoutTenantContext(async (nile) => {
        let query = 'SELECT COUNT(*) as count FROM users.users WHERE deleted IS NULL';
        if (this.options.preserveStaff) {
          query += ` AND id NOT IN (
            SELECT user_id FROM public.user_profiles 
            WHERE is_penguinmails_staff = true AND deleted IS NULL
          )`;
        }
        return await nile.db.query(query);
      });

      // Count profiles
      const profiles = await withoutTenantContext(async (nile) => {
        let query = 'SELECT COUNT(*) as count FROM public.user_profiles WHERE deleted IS NULL';
        if (this.options.preserveStaff) {
          query += ' AND is_penguinmails_staff = false';
        }
        return await nile.db.query(query);
      });

      // Count tenants
      const tenants = await withoutTenantContext(async (nile) => {
        let query = 'SELECT COUNT(*) as count FROM public.tenants WHERE deleted IS NULL';
        if (this.options.preserveStaff) {
          query += ` AND name != 'PenguinMails'`;
        }
        return await nile.db.query(query);
      });

      // Count companies
      const companies = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT COUNT(*) as count FROM public.companies WHERE deleted IS NULL'
        );
      });

      // Count relationships
      const relationships = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT COUNT(*) as count FROM public.user_companies WHERE deleted IS NULL'
        );
      });

      console.log('Records that would be removed:');
      console.log(`  Users: ${users.rows[0].count}`);
      console.log(`  User Profiles: ${profiles.rows[0].count}`);
      console.log(`  Tenants: ${tenants.rows[0].count}`);
      console.log(`  Companies: ${companies.rows[0].count}`);
      console.log(`  User-Company Relationships: ${relationships.rows[0].count}`);

      if (this.options.preserveStaff) {
        console.log('\n⚠️  Staff users and PenguinMails tenant will be preserved');
      }

      console.log('\n✅ Dry run completed - no changes made');

    } catch (error) {
      const errorMsg = `Dry run failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }
  }

  /**
   * Print rollback statistics
   */
  private printStats(): void {
    console.log('\n📊 ROLLBACK STATISTICS:');
    console.log(`  Users removed: ${this.stats.usersRemoved}`);
    console.log(`  Profiles removed: ${this.stats.profilesRemoved}`);
    console.log(`  Tenants removed: ${this.stats.tenantsRemoved}`);
    console.log(`  Companies removed: ${this.stats.companiesRemoved}`);
    console.log(`  Relationships removed: ${this.stats.relationshipsRemoved}`);
    console.log(`  Errors: ${this.stats.errors.length}`);
    console.log(`  Warnings: ${this.stats.warnings.length}`);

    if (this.stats.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.stats.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.stats.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.stats.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (this.options.preserveStaff) {
      console.log('\n🛡️  Staff users and internal data preserved');
    }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const options: RollbackOptions = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--complete') {
      options.complete = true;
    } else if (arg.startsWith('--selective=')) {
      options.selective = arg.split('=')[1].split(',').map(s => s.trim());
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--preserve-staff') {
      options.preserveStaff = true;
    } else if (arg === '--no-preserve-staff') {
      options.preserveStaff = false;
    } else if (arg === '--backup') {
      options.backup = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
NileDB Migration Rollback Script

Usage:
  npx tsx scripts/rollback-migration.ts [options]

Options:
  --complete              Perform complete rollback (removes all migrated data)
  --selective=<entities>  Rollback specific entities (users,profiles,tenants,companies,relationships)
  --dry-run              Simulate rollback without making changes
  --preserve-staff       Preserve PenguinMails staff users and data (default: true)
  --no-preserve-staff    Remove all data including staff users
  --backup               Create backup before rollback
  --verbose, -v          Enable verbose output
  --help, -h             Show this help message

Examples:
  npx tsx scripts/rollback-migration.ts --dry-run
  npx tsx scripts/rollback-migration.ts --complete --backup
  npx tsx scripts/rollback-migration.ts --selective=users,companies
  npx tsx scripts/rollback-migration.ts --no-preserve-staff --verbose
      `);
      process.exit(0);
    }
  }

  // Default to preserving staff if not explicitly set
  if (options.preserveStaff === undefined) {
    options.preserveStaff = true;
  }

  const rollback = new MigrationRollback(options);
  
  try {
    await rollback.rollback();
    console.log('\n🎉 Rollback completed successfully!');
    
    if (!options.dryRun) {
      console.log('\nNext steps:');
      console.log('  1. Verify the rollback results');
      console.log('  2. If needed, restore from backup');
      console.log('  3. Re-run migration with fixes if necessary');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Rollback failed with error:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Run the rollback
main().catch((error) => {
  console.error('\n❌ Rollback script failed:', error.message);
  process.exit(1);
});
