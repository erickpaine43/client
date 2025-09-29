#!/usr/bin/env npx tsx

/**
 * NileDB Migration Validation Script
 * 
 * This script validates the integrity of migrated data and ensures all
 * relationships and access controls are working correctly.
 * 
 * Usage:
 *   npm run validate:migration
 *   npx tsx scripts/validate-migration.ts
 *   npx tsx scripts/validate-migration.ts --verbose
 */

import { getAuthService } from '../lib/niledb/auth';
import { getTenantService } from '../lib/niledb/tenant';
import { getCompanyService } from '../lib/niledb/company';
import { withoutTenantContext } from '../lib/niledb/client';

interface ValidationOptions {
  verbose?: boolean;
  fix?: boolean;
}

interface ValidationResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: unknown;
}

/**
 * Migration validation class
 */
class MigrationValidator {
  private authService = getAuthService();
  private tenantService = getTenantService();
  private companyService = getCompanyService();
  private results: ValidationResult[] = [];

  constructor(private options: ValidationOptions = {}) {}

  /**
   * Run all validation tests
   */
  async validate(): Promise<ValidationResult[]> {
    console.log('🔍 Validating NileDB Migration...\n');

    await this.validateUserMigration();
    await this.validateTenantMigration();
    await this.validateCompanyMigration();
    await this.validateRelationships();
    await this.validateAccessControl();
    await this.validateCrossSchemaQueries();
    await this.validateDataIntegrity();

    this.printResults();
    return this.results;
  }

  /**
   * Validate user migration and profiles
   */
  private async validateUserMigration(): Promise<void> {
    console.log('1️⃣ Validating user migration...');

    try {
      // Check if users exist in NileDB users table
      const users = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT id, email, name FROM users.users WHERE deleted IS NULL'
        );
      });

      this.addResult('Users', 'User count', 
        users.rows.length > 0 ? 'pass' : 'fail',
        `Found ${users.rows.length} users in NileDB`,
        { count: users.rows.length }
      );

      // Check user profiles
      for (const user of users.rows) {
        const userWithProfile = await this.authService.getUserWithProfile(user.id);
        
        this.addResult('Users', `Profile for ${user.email}`,
          userWithProfile?.profile ? 'pass' : 'fail',
          userWithProfile?.profile ? 'Profile exists' : 'Profile missing'
        );

        if (userWithProfile?.profile && this.options.verbose) {
          console.log(`  ✅ ${user.email}: ${userWithProfile.profile.role}${userWithProfile.profile.isPenguinMailsStaff ? ' (staff)' : ''}`);
        }
      }

    } catch (error) {
      this.addResult('Users', 'User migration validation',
        'fail', `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  /**
   * Validate tenant migration
   */
  private async validateTenantMigration(): Promise<void> {
    console.log('2️⃣ Validating tenant migration...');

    try {
      const tenants = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT id, name FROM tenants WHERE deleted IS NULL'
        );
      });

      this.addResult('Tenants', 'Tenant count',
        tenants.rows.length > 0 ? 'pass' : 'fail',
        `Found ${tenants.rows.length} tenants`,
        { count: tenants.rows.length }
      );

      // Validate each tenant
      for (const tenant of tenants.rows) {
        const tenantData = await this.tenantService.getTenantById(tenant.id);
        
        this.addResult('Tenants', `Tenant ${tenant.name}`,
          tenantData ? 'pass' : 'fail',
          tenantData ? 'Tenant accessible' : 'Tenant not accessible'
        );

        if (this.options.verbose && tenantData) {
          console.log(`  ✅ ${tenant.name}: ${tenant.id}`);
        }
      }

    } catch (error) {
      this.addResult('Tenants', 'Tenant migration validation',
        'fail', `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate company migration
   */
  private async validateCompanyMigration(): Promise<void> {
    console.log('3️⃣ Validating company migration...');

    try {
      const companies = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT id, tenant_id, name FROM public.companies WHERE deleted IS NULL'
        );
      });

      this.addResult('Companies', 'Company count',
        companies.rows.length > 0 ? 'pass' : 'fail',
        `Found ${companies.rows.length} companies`,
        { count: companies.rows.length }
      );

      // Validate each company
      for (const company of companies.rows) {
        const companyData = await this.companyService.getCompanyById(
          company.tenant_id,
          company.id
        );
        
        this.addResult('Companies', `Company ${company.name}`,
          companyData ? 'pass' : 'fail',
          companyData ? 'Company accessible' : 'Company not accessible'
        );

        if (this.options.verbose && companyData) {
          console.log(`  ✅ ${company.name}: ${company.id} (tenant: ${company.tenant_id})`);
        }
      }

    } catch (error) {
      this.addResult('Companies', 'Company migration validation',
        'fail', `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate relationships
   */
  private async validateRelationships(): Promise<void> {
    console.log('4️⃣ Validating relationships...');

    try {
      // Check user-tenant relationships
      const userTenants = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT user_id, tenant_id, roles FROM users.tenant_users WHERE deleted IS NULL'
        );
      });

      this.addResult('Relationships', 'User-tenant relationships',
        userTenants.rows.length > 0 ? 'pass' : 'fail',
        `Found ${userTenants.rows.length} user-tenant relationships`,
        { count: userTenants.rows.length }
      );

      // Check user-company relationships
      const userCompanies = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT user_id, company_id, tenant_id, role FROM public.user_companies WHERE deleted IS NULL'
        );
      });

      this.addResult('Relationships', 'User-company relationships',
        userCompanies.rows.length > 0 ? 'pass' : 'fail',
        `Found ${userCompanies.rows.length} user-company relationships`,
        { count: userCompanies.rows.length }
      );

      if (this.options.verbose) {
        console.log(`  User-tenant relationships: ${userTenants.rows.length}`);
        console.log(`  User-company relationships: ${userCompanies.rows.length}`);
      }

    } catch (error) {
      this.addResult('Relationships', 'Relationship validation',
        'fail', `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate access control
   */
  private async validateAccessControl(): Promise<void> {
    console.log('5️⃣ Validating access control...');

    try {
      // Test staff user access
      const staffAccess = await this.authService.isStaffUser('user_001');
      this.addResult('Access Control', 'Staff user identification',
        staffAccess ? 'pass' : 'fail',
        staffAccess ? 'Staff user correctly identified' : 'Staff user not identified'
      );

      // Test tenant access validation
      const tenantAccess = await this.tenantService.validateTenantAccess('user_002', 'tenant_002', 'member');
      this.addResult('Access Control', 'Tenant access validation',
        tenantAccess ? 'pass' : 'fail',
        tenantAccess ? 'Tenant access validation working' : 'Tenant access validation failed'
      );

      // Test company access validation
      const companyAccess = await this.companyService.validateCompanyAccess(
        'user_002', 'tenant_002', 'company_002', 'owner'
      );
      this.addResult('Access Control', 'Company access validation',
        companyAccess ? 'pass' : 'fail',
        companyAccess ? 'Company access validation working' : 'Company access validation failed'
      );

    } catch (error) {
      this.addResult('Access Control', 'Access control validation',
        'fail', `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate cross-schema queries
   */
  private async validateCrossSchemaQueries(): Promise<void> {
    console.log('6️⃣ Validating cross-schema queries...');

    try {
      // Test cross-schema user profile query
      const userWithProfile = await this.authService.getUserWithProfile('user_001');
      this.addResult('Cross-Schema', 'User profile query',
        userWithProfile ? 'pass' : 'fail',
        userWithProfile ? 'Cross-schema user profile query working' : 'Cross-schema query failed'
      );

      // Test user tenants query
      const userTenants = await this.tenantService.getUserTenants('user_003');
      this.addResult('Cross-Schema', 'User tenants query',
        userTenants.length > 0 ? 'pass' : 'warning',
        `Found ${userTenants.length} tenants for user`,
        { tenantCount: userTenants.length }
      );

      // Test user companies query
      const userCompanies = await this.companyService.getUserCompanies('user_003');
      this.addResult('Cross-Schema', 'User companies query',
        userCompanies.length > 0 ? 'pass' : 'warning',
        `Found ${userCompanies.length} companies for user`,
        { companyCount: userCompanies.length }
      );

    } catch (error) {
      this.addResult('Cross-Schema', 'Cross-schema query validation',
        'fail', `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate data integrity
   */
  private async validateDataIntegrity(): Promise<void> {
    console.log('7️⃣ Validating data integrity...');

    try {
      // Check for orphaned user profiles
      const orphanedProfiles = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT up.user_id 
          FROM public.user_profiles up
          LEFT JOIN users.users u ON up.user_id = u.id
          WHERE u.id IS NULL AND up.deleted IS NULL
        `);
      });

      this.addResult('Data Integrity', 'Orphaned user profiles',
        orphanedProfiles.rows.length === 0 ? 'pass' : 'warning',
        `Found ${orphanedProfiles.rows.length} orphaned user profiles`,
        { count: orphanedProfiles.rows.length }
      );

      // Check for orphaned user-company relationships
      const orphanedUserCompanies = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT uc.id
          FROM public.user_companies uc
          LEFT JOIN users.users u ON uc.user_id = u.id
          LEFT JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
          WHERE (u.id IS NULL OR c.id IS NULL) AND uc.deleted IS NULL
        `);
      });

      this.addResult('Data Integrity', 'Orphaned user-company relationships',
        orphanedUserCompanies.rows.length === 0 ? 'pass' : 'warning',
        `Found ${orphanedUserCompanies.rows.length} orphaned user-company relationships`,
        { count: orphanedUserCompanies.rows.length }
      );

      // Check for companies without tenants
      const companiesWithoutTenants = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT c.id, c.name
          FROM public.companies c
          LEFT JOIN public.tenants t ON c.tenant_id = t.id
          WHERE t.id IS NULL AND c.deleted IS NULL
        `);
      });

      this.addResult('Data Integrity', 'Companies without tenants',
        companiesWithoutTenants.rows.length === 0 ? 'pass' : 'fail',
        `Found ${companiesWithoutTenants.rows.length} companies without tenants`,
        { count: companiesWithoutTenants.rows.length }
      );

    } catch (error) {
      this.addResult('Data Integrity', 'Data integrity validation',
        'fail', `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Add validation result
   */
  private addResult(category: string, test: string, status: 'pass' | 'fail' | 'warning', message: string, details?: unknown): void {
    this.results.push({ category, test, status, message, details });
  }

  /**
   * Print validation results
   */
  private printResults(): void {
    console.log('\n📊 VALIDATION RESULTS:\n');

    const categories = [...new Set(this.results.map(r => r.category))];
    
    for (const category of categories) {
      console.log(`${category}:`);
      const categoryResults = this.results.filter(r => r.category === category);
      
      for (const result of categoryResults) {
        const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`  ${icon} ${result.test}: ${result.message}`);
        
        if (this.options.verbose && result.details) {
          console.log(`     Details: ${JSON.stringify(result.details)}`);
        }
      }
      console.log('');
    }

    // Summary
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const total = this.results.length;

    console.log('📈 SUMMARY:');
    console.log(`  Total tests: ${total}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Warnings: ${warnings}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Success rate: ${Math.round((passed / total) * 100)}%`);

    if (failed > 0) {
      console.log('\n❌ CRITICAL ISSUES FOUND - Migration may need attention');
    } else if (warnings > 0) {
      console.log('\n⚠️  Some warnings found - Review recommended');
    } else {
      console.log('\n✅ All validations passed - Migration successful!');
    }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const options: ValidationOptions = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
NileDB Migration Validation Script

Usage:
  npx tsx scripts/validate-migration.ts [options]

Options:
  --verbose, -v    Enable verbose output with detailed information
  --fix            Attempt to fix issues found during validation
  --help, -h       Show this help message

Examples:
  npx tsx scripts/validate-migration.ts
  npx tsx scripts/validate-migration.ts --verbose
  npx tsx scripts/validate-migration.ts --fix
      `);
      process.exit(0);
    }
  }

  const validator = new MigrationValidator(options);
  
  try {
    const results = await validator.validate();
    const failed = results.filter(r => r.status === 'fail').length;
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n💥 Validation failed with error:', error);
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

// Run the validation
main().catch((error) => {
  console.error('\n❌ Validation script failed:', error.message);
  process.exit(1);
});
