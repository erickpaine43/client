#!/usr/bin/env npx tsx

/**
 * NileDB Data Migration Script
 * 
 * This script migrates data from the old Drizzle-based backend system to NileDB.
 * It follows the documented migration approach: users → user profiles → tenants → companies → user-company relationships
 * 
 * Usage:
 *   npm run migrate:to-niledb
 *   npx tsx scripts/migrate-to-niledb.ts
 *   npx tsx scripts/migrate-to-niledb.ts --dry-run
 *   npx tsx scripts/migrate-to-niledb.ts --rollback
 */

import { getAuthService } from '../lib/niledb/auth';
import { getTenantService } from '../lib/niledb/tenant';
import { getCompanyService } from '../lib/niledb/company';
import { validateConfiguration, performHealthCheck } from '../lib/niledb/health';
import { validateEnvironmentVariables } from '../lib/niledb/config';
import { withoutTenantContext } from '../lib/niledb/client';

interface MigrationOptions {
  dryRun?: boolean;
  rollback?: boolean;
  verbose?: boolean;
  skipValidation?: boolean;
  dataSource?: string;
}

interface MigrationStats {
  usersCreated: number;
  profilesCreated: number;
  tenantsCreated: number;
  companiesCreated: number;
  userCompanyRelationships: number;
  errors: string[];
  warnings: string[];
}

interface OldSystemUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'super_admin';
  is_penguinmails_staff: boolean;
  created_at: Date;
  updated_at: Date;
}

interface OldSystemTenant {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

interface OldSystemCompany {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  settings: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

interface OldSystemUserCompany {
  id: string;
  tenant_id: string;
  user_id: string;
  company_id: string;
  role: 'member' | 'admin' | 'owner';
  permissions: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Main migration class
 */
class NileDBMigration {
  private authService = getAuthService();
  private tenantService = getTenantService();
  private companyService = getCompanyService();
  private stats: MigrationStats = {
    usersCreated: 0,
    profilesCreated: 0,
    tenantsCreated: 0,
    companiesCreated: 0,
    userCompanyRelationships: 0,
    errors: [],
    warnings: []
  };

  constructor(private options: MigrationOptions = {}) {}

  /**
   * Run the complete migration process
   */
  async migrate(): Promise<MigrationStats> {
    console.log('🚀 Starting NileDB Migration...\n');

    try {
      // Step 1: Pre-migration validation
      if (!this.options.skipValidation) {
        await this.validatePrerequisites();
      }

      // Step 2: Load old system data
      const oldData = await this.loadOldSystemData();

      if (this.options.dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n');
        await this.performDryRun(oldData);
        return this.stats;
      }

      if (this.options.rollback) {
        console.log('🔄 ROLLBACK MODE - Removing migrated data\n');
        await this.performRollback();
        return this.stats;
      }

      // Step 3: Migrate users through NileDB auth system
      await this.migrateUsers(oldData.users);

      // Step 4: Create user profiles
      await this.migrateUserProfiles(oldData.users);

      // Step 5: Create tenants
      await this.migrateTenants(oldData.tenants);

      // Step 6: Create companies
      await this.migrateCompanies(oldData.companies);

      // Step 7: Create user-company relationships
      await this.migrateUserCompanyRelationships(oldData.userCompanies);

      // Step 8: Validate migration
      await this.validateMigration();

      console.log('\n✅ Migration completed successfully!');
      this.printStats();

      return this.stats;

    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      this.stats.errors.push(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Validate prerequisites before migration
   */
  private async validatePrerequisites(): Promise<void> {
    console.log('1️⃣ Validating prerequisites...');

    // Check environment variables
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.isValid) {
      throw new Error(`Missing environment variables: ${envValidation.missingVars.join(', ')}`);
    }

    // Check NileDB configuration
    const configValidation = validateConfiguration();
    if (!configValidation.isValid) {
      throw new Error(`Configuration errors: ${configValidation.errors.join(', ')}`);
    }

    // Check NileDB health
    const healthCheck = await performHealthCheck();
    if (healthCheck.status !== 'healthy') {
      throw new Error('NileDB health check failed');
    }

    console.log('✅ Prerequisites validated\n');
  }

  /**
   * Load data from old system (simulated for now)
   */
  private async loadOldSystemData(): Promise<{
    users: OldSystemUser[];
    tenants: OldSystemTenant[];
    companies: OldSystemCompany[];
    userCompanies: OldSystemUserCompany[];
  }> {
    console.log('2️⃣ Loading old system data...');

    // For now, we'll use sample data that matches the old backend structure
    // In a real migration, this would connect to the old database
    const users: OldSystemUser[] = [
      {
        id: 'user_001',
        email: 'admin@penguinmails.com',
        name: 'PenguinMails Admin',
        role: 'super_admin',
        is_penguinmails_staff: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      },
      {
        id: 'user_002',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
        is_penguinmails_staff: false,
        created_at: new Date('2024-01-02'),
        updated_at: new Date('2024-01-02')
      },
      {
        id: 'user_003',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'admin',
        is_penguinmails_staff: false,
        created_at: new Date('2024-01-03'),
        updated_at: new Date('2024-01-03')
      }
    ];

    const tenants: OldSystemTenant[] = [
      {
        id: 'tenant_001',
        name: 'PenguinMails',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      },
      {
        id: 'tenant_002',
        name: 'Acme Corporation',
        created_at: new Date('2024-01-02'),
        updated_at: new Date('2024-01-02')
      },
      {
        id: 'tenant_003',
        name: 'TechStart Inc',
        created_at: new Date('2024-01-03'),
        updated_at: new Date('2024-01-03')
      }
    ];

    const companies: OldSystemCompany[] = [
      {
        id: 'company_001',
        tenant_id: 'tenant_001',
        name: 'PenguinMails Internal',
        email: 'internal@penguinmails.com',
        settings: { internal: true },
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      },
      {
        id: 'company_002',
        tenant_id: 'tenant_002',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        settings: { industry: 'manufacturing' },
        created_at: new Date('2024-01-02'),
        updated_at: new Date('2024-01-02')
      },
      {
        id: 'company_003',
        tenant_id: 'tenant_003',
        name: 'TechStart Inc',
        email: 'hello@techstart.com',
        settings: { industry: 'technology' },
        created_at: new Date('2024-01-03'),
        updated_at: new Date('2024-01-03')
      }
    ];

    const userCompanies: OldSystemUserCompany[] = [
      {
        id: 'uc_001',
        tenant_id: 'tenant_001',
        user_id: 'user_001',
        company_id: 'company_001',
        role: 'owner',
        permissions: { all: true },
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      },
      {
        id: 'uc_002',
        tenant_id: 'tenant_002',
        user_id: 'user_002',
        company_id: 'company_002',
        role: 'owner',
        permissions: { can_manage_users: true, can_manage_settings: true },
        created_at: new Date('2024-01-02'),
        updated_at: new Date('2024-01-02')
      },
      {
        id: 'uc_003',
        tenant_id: 'tenant_003',
        user_id: 'user_003',
        company_id: 'company_003',
        role: 'owner',
        permissions: { can_manage_users: true, can_manage_settings: true },
        created_at: new Date('2024-01-03'),
        updated_at: new Date('2024-01-03')
      },
      {
        id: 'uc_004',
        tenant_id: 'tenant_002',
        user_id: 'user_003',
        company_id: 'company_002',
        role: 'admin',
        permissions: { can_manage_users: true, can_view_analytics: true },
        created_at: new Date('2024-01-04'),
        updated_at: new Date('2024-01-04')
      }
    ];

    console.log(`✅ Loaded ${users.length} users, ${tenants.length} tenants, ${companies.length} companies, ${userCompanies.length} relationships\n`);

    return { users, tenants, companies, userCompanies };
  }

  /**
   * Migrate users through NileDB auth system
   */
  private async migrateUsers(users: OldSystemUser[]): Promise<void> {
    console.log('3️⃣ Migrating users through NileDB auth system...');

    for (const user of users) {
      try {
        if (this.options.verbose) {
          console.log(`  Processing user: ${user.email}`);
        }

        // Check if user already exists in NileDB
        const existingUser = await withoutTenantContext(async (nile) => {
          const result = await nile.db.query(
            'SELECT id FROM users.users WHERE email = $1 AND deleted IS NULL',
            [user.email]
          );
          return result.rows.length > 0 ? result.rows[0] : null;
        });

        if (existingUser) {
          console.log(`  ⏭️  User ${user.email} already exists in NileDB`);
          continue;
        }

        // For this migration, we'll create users directly in NileDB's users table
        // In a real scenario, users would be created through NileDB's auth system
        await withoutTenantContext(async (nile) => {
          await nile.db.query(
            `INSERT INTO users.users (id, email, name, created, updated, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              user.id,
              user.email,
              user.name,
              user.created_at.toISOString(),
              user.updated_at.toISOString(),
              true // Assume migrated users are verified
            ]
          );
        });

        this.stats.usersCreated++;
        console.log(`  ✅ Migrated user: ${user.email}`);

      } catch (error) {
        const errorMsg = `Failed to migrate user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`  ❌ ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }

    console.log(`✅ User migration completed: ${this.stats.usersCreated} users migrated\n`);
  }

  /**
   * Create user profiles using AuthService
   */
  private async migrateUserProfiles(users: OldSystemUser[]): Promise<void> {
    console.log('4️⃣ Creating user profiles...');

    for (const user of users) {
      try {
        if (this.options.verbose) {
          console.log(`  Creating profile for: ${user.email}`);
        }

        // Check if profile already exists
        const existingProfile = await withoutTenantContext(async (nile) => {
          const result = await nile.db.query(
            'SELECT user_id FROM public.user_profiles WHERE user_id = $1 AND deleted IS NULL',
            [user.id]
          );
          return result.rows.length > 0;
        });

        if (existingProfile) {
          console.log(`  ⏭️  Profile for ${user.email} already exists`);
          continue;
        }

        // Create user profile using AuthService
        await this.authService.createUserProfile(user.id, {
          role: user.role,
          isPenguinMailsStaff: user.is_penguinmails_staff,
          preferences: {}
        });

        this.stats.profilesCreated++;
        console.log(`  ✅ Created profile for: ${user.email}`);

      } catch (error) {
        const errorMsg = `Failed to create profile for ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`  ❌ ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }

    console.log(`✅ Profile creation completed: ${this.stats.profilesCreated} profiles created\n`);
  }

  /**
   * Migrate tenants using TenantService
   */
  private async migrateTenants(tenants: OldSystemTenant[]): Promise<void> {
    console.log('5️⃣ Migrating tenants...');

    for (const tenant of tenants) {
      try {
        if (this.options.verbose) {
          console.log(`  Processing tenant: ${tenant.name}`);
        }

        // Check if tenant already exists
        const existingTenant = await this.tenantService.getTenantById(tenant.id);
        if (existingTenant) {
          console.log(`  ⏭️  Tenant ${tenant.name} already exists`);
          continue;
        }

        // Create tenant directly in NileDB (preserving original ID)
        await withoutTenantContext(async (nile) => {
          await nile.db.query(
            'INSERT INTO tenants (id, name, created, updated) VALUES ($1, $2, $3, $4)',
            [tenant.id, tenant.name, tenant.created_at.toISOString(), tenant.updated_at.toISOString()]
          );
        });

        this.stats.tenantsCreated++;
        console.log(`  ✅ Migrated tenant: ${tenant.name}`);

      } catch (error) {
        const errorMsg = `Failed to migrate tenant ${tenant.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`  ❌ ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }

    console.log(`✅ Tenant migration completed: ${this.stats.tenantsCreated} tenants migrated\n`);
  }

  /**
   * Migrate companies using CompanyService
   */
  private async migrateCompanies(companies: OldSystemCompany[]): Promise<void> {
    console.log('6️⃣ Migrating companies...');

    for (const company of companies) {
      try {
        if (this.options.verbose) {
          console.log(`  Processing company: ${company.name} (tenant: ${company.tenant_id})`);
        }

        // Check if company already exists
        const existingCompany = await this.companyService.getCompanyById(
          company.tenant_id,
          company.id
        );
        if (existingCompany) {
          console.log(`  ⏭️  Company ${company.name} already exists`);
          continue;
        }

        // Create company directly in tenant context (preserving original ID)
        await this.tenantService.withTenantContext(company.tenant_id, async (nile) => {
          await nile.db.query(
            `INSERT INTO companies (id, tenant_id, name, email, settings, created, updated)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              company.id,
              company.tenant_id,
              company.name,
              company.email,
              company.settings,
              company.created_at.toISOString(),
              company.updated_at.toISOString()
            ]
          );
        });

        this.stats.companiesCreated++;
        console.log(`  ✅ Migrated company: ${company.name}`);

      } catch (error) {
        const errorMsg = `Failed to migrate company ${company.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`  ❌ ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }

    console.log(`✅ Company migration completed: ${this.stats.companiesCreated} companies migrated\n`);
  }

  /**
   * Migrate user-company relationships using CompanyService
   */
  private async migrateUserCompanyRelationships(userCompanies: OldSystemUserCompany[]): Promise<void> {
    console.log('7️⃣ Migrating user-company relationships...');

    for (const userCompany of userCompanies) {
      try {
        if (this.options.verbose) {
          console.log(`  Processing relationship: user ${userCompany.user_id} → company ${userCompany.company_id} (${userCompany.role})`);
        }

        // Check if relationship already exists
        const existingRelationship = await this.tenantService.withTenantContext(
          userCompany.tenant_id,
          async (nile) => {
            const result = await nile.db.query(
              `SELECT id FROM user_companies 
               WHERE user_id = $1 AND company_id = $2 AND tenant_id = $3 AND deleted IS NULL`,
              [userCompany.user_id, userCompany.company_id, userCompany.tenant_id]
            );
            return result.rows.length > 0;
          }
        );

        if (existingRelationship) {
          console.log(`  ⏭️  Relationship already exists`);
          continue;
        }

        // First, add user to tenant if not already added
        await this.tenantService.addUserToTenant(
          userCompany.user_id,
          userCompany.tenant_id,
          ['member'] // Default tenant role
        );

        // Then add user to company with preserved role and permissions
        await this.tenantService.withTenantContext(userCompany.tenant_id, async (nile) => {
          await nile.db.query(
            `INSERT INTO user_companies (id, tenant_id, user_id, company_id, role, permissions, created, updated)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              userCompany.id,
              userCompany.tenant_id,
              userCompany.user_id,
              userCompany.company_id,
              userCompany.role,
              userCompany.permissions,
              userCompany.created_at.toISOString(),
              userCompany.updated_at.toISOString()
            ]
          );
        });

        this.stats.userCompanyRelationships++;
        console.log(`  ✅ Migrated relationship: ${userCompany.role} access`);

      } catch (error) {
        const errorMsg = `Failed to migrate user-company relationship: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`  ❌ ${errorMsg}`);
        this.stats.errors.push(errorMsg);
      }
    }

    console.log(`✅ Relationship migration completed: ${this.stats.userCompanyRelationships} relationships migrated\n`);
  }

  /**
   * Validate migration results
   */
  private async validateMigration(): Promise<void> {
    console.log('8️⃣ Validating migration results...');

    try {
      // Validate user profiles exist and are accessible
      const userWithProfile = await this.authService.getUserWithProfile('user_001');
      if (!userWithProfile?.profile) {
        this.stats.warnings.push('User profile validation failed for admin user');
      }

      // Validate tenant access
      const hasAccess = await this.tenantService.validateTenantAccess('user_002', 'tenant_002', 'member');
      if (!hasAccess) {
        this.stats.warnings.push('Tenant access validation failed');
      }

      // Validate company access
      const hasCompanyAccess = await this.companyService.validateCompanyAccess(
        'user_002',
        'tenant_002',
        'company_002',
        'owner'
      );
      if (!hasCompanyAccess) {
        this.stats.warnings.push('Company access validation failed');
      }

      // Validate cross-schema relationships
      const userTenants = await this.tenantService.getUserTenants('user_003');
      if (userTenants.length === 0) {
        this.stats.warnings.push('Cross-tenant user relationships not found');
      }

      console.log('✅ Migration validation completed');

      if (this.stats.warnings.length > 0) {
        console.log('\n⚠️  Validation warnings:');
        this.stats.warnings.forEach(warning => console.log(`  - ${warning}`));
      }

    } catch (error) {
      const errorMsg = `Migration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
    }

    console.log('');
  }

  /**
   * Perform dry run (simulation)
   */
  private async performDryRun(oldData: {
    users: OldSystemUser[];
    tenants: OldSystemTenant[];
    companies: OldSystemCompany[];
    userCompanies: OldSystemUserCompany[];
  }): Promise<void> {
    console.log('📋 DRY RUN ANALYSIS:\n');

    console.log(`Users to migrate: ${oldData.users.length}`);
    oldData.users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}${user.is_penguinmails_staff ? ', staff' : ''})`);
    });

    console.log(`\nTenants to migrate: ${oldData.tenants.length}`);
    oldData.tenants.forEach(tenant => {
      console.log(`  - ${tenant.name}`);
    });

    console.log(`\nCompanies to migrate: ${oldData.companies.length}`);
    oldData.companies.forEach(company => {
      console.log(`  - ${company.name} (tenant: ${company.tenant_id})`);
    });

    console.log(`\nUser-company relationships to migrate: ${oldData.userCompanies.length}`);
    oldData.userCompanies.forEach(uc => {
      console.log(`  - User ${uc.user_id} → Company ${uc.company_id} (${uc.role})`);
    });

    console.log('\n✅ Dry run completed - no changes made');
  }

  /**
   * Perform rollback (remove migrated data)
   */
  private async performRollback(): Promise<void> {
    console.log('🔄 Rolling back migration...\n');

    try {
      // Remove user-company relationships
      console.log('Removing user-company relationships...');
      await withoutTenantContext(async (nile) => {
        const result = await nile.db.query(
          'UPDATE public.user_companies SET deleted = CURRENT_TIMESTAMP WHERE deleted IS NULL'
        );
        console.log(`  ✅ Soft-deleted ${result.rowCount || 0} user-company relationships`);
      });

      // Remove companies
      console.log('Removing companies...');
      await withoutTenantContext(async (nile) => {
        const result = await nile.db.query(
          'UPDATE public.companies SET deleted = CURRENT_TIMESTAMP WHERE deleted IS NULL'
        );
        console.log(`  ✅ Soft-deleted ${result.rowCount || 0} companies`);
      });

      // Remove tenant-user relationships
      console.log('Removing tenant-user relationships...');
      await withoutTenantContext(async (nile) => {
        const result = await nile.db.query(
          'UPDATE users.tenant_users SET deleted = CURRENT_TIMESTAMP WHERE deleted IS NULL'
        );
        console.log(`  ✅ Soft-deleted ${result.rowCount || 0} tenant-user relationships`);
      });

      // Remove tenants
      console.log('Removing tenants...');
      await withoutTenantContext(async (nile) => {
        const result = await nile.db.query(
          'UPDATE public.tenants SET deleted = CURRENT_TIMESTAMP WHERE deleted IS NULL'
        );
        console.log(`  ✅ Soft-deleted ${result.rowCount || 0} tenants`);
      });

      // Remove user profiles
      console.log('Removing user profiles...');
      await withoutTenantContext(async (nile) => {
        const result = await nile.db.query(
          'UPDATE public.user_profiles SET deleted = CURRENT_TIMESTAMP WHERE deleted IS NULL'
        );
        console.log(`  ✅ Soft-deleted ${result.rowCount || 0} user profiles`);
      });

      // Remove users (soft delete)
      console.log('Removing users...');
      await withoutTenantContext(async (nile) => {
        const result = await nile.db.query(
          'UPDATE users.users SET deleted = CURRENT_TIMESTAMP WHERE deleted IS NULL'
        );
        console.log(`  ✅ Soft-deleted ${result.rowCount || 0} users`);
      });

      console.log('\n✅ Rollback completed successfully');

    } catch (error) {
      const errorMsg = `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    }
  }

  /**
   * Print migration statistics
   */
  private printStats(): void {
    console.log('\n📊 MIGRATION STATISTICS:');
    console.log(`  Users created: ${this.stats.usersCreated}`);
    console.log(`  Profiles created: ${this.stats.profilesCreated}`);
    console.log(`  Tenants created: ${this.stats.tenantsCreated}`);
    console.log(`  Companies created: ${this.stats.companiesCreated}`);
    console.log(`  User-company relationships: ${this.stats.userCompanyRelationships}`);
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
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--rollback') {
      options.rollback = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--skip-validation') {
      options.skipValidation = true;
    } else if (arg.startsWith('--data-source=')) {
      options.dataSource = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
NileDB Data Migration Script

Usage:
  npx tsx scripts/migrate-to-niledb.ts [options]

Options:
  --dry-run              Simulate migration without making changes
  --rollback             Remove all migrated data (soft delete)
  --verbose, -v          Enable verbose output
  --skip-validation      Skip prerequisite validation
  --data-source=<path>   Specify custom data source (default: sample data)
  --help, -h             Show this help message

Examples:
  npx tsx scripts/migrate-to-niledb.ts --dry-run
  npx tsx scripts/migrate-to-niledb.ts --verbose
  npx tsx scripts/migrate-to-niledb.ts --rollback
      `);
      process.exit(0);
    }
  }

  const migration = new NileDBMigration(options);
  
  try {
    await migration.migrate();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed with error:', error);
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

// Run the migration
main().catch((error) => {
  console.error('\n❌ Migration script failed:', error.message);
  process.exit(1);
});
