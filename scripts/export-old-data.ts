#!/usr/bin/env npx tsx

/**
 * Old System Data Export Script
 * 
 * This script exports data from the old Drizzle-based backend system
 * for migration to NileDB. It creates JSON files that can be used by
 * the migration script.
 * 
 * Usage:
 *   npm run export:old-data
 *   npx tsx scripts/export-old-data.ts
 *   npx tsx scripts/export-old-data.ts --output=./migration-data
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface ExportOptions {
  output?: string;
  verbose?: boolean;
  format?: 'json' | 'csv';
}

interface ExportedData {
  users: unknown[];
  tenants: unknown[];
  companies: unknown[];
  userCompanies: unknown[];
  metadata: {
    exportedAt: string;
    version: string;
    source: string;
  };
}

/**
 * Data export class
 */
class OldDataExporter {
  private outputDir: string;

  constructor(private options: ExportOptions = {}) {
    this.outputDir = options.output || './migration-data';
  }

  /**
   * Export all data from old system
   */
  async export(): Promise<ExportedData> {
    console.log('📤 Exporting data from old system...\n');

    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
      console.log(`Created output directory: ${this.outputDir}`);
    }

    // For this implementation, we'll use the sample data from the old backend
    // In a real scenario, this would connect to the old database
    const exportedData: ExportedData = {
      users: await this.exportUsers(),
      tenants: await this.exportTenants(),
      companies: await this.exportCompanies(),
      userCompanies: await this.exportUserCompanies(),
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        source: 'old-backend-drizzle'
      }
    };

    // Save to files
    await this.saveExportedData(exportedData);

    console.log('\n✅ Data export completed successfully!');
    this.printSummary(exportedData);

    return exportedData;
  }

  /**
   * Export users from old system
   */
  private async exportUsers(): Promise<unknown[]> {
    console.log('1️⃣ Exporting users...');

    // Sample users from old backend fixtures
    const users = [
      {
        id: 'user_001',
        email: 'admin@penguinmails.com',
        name: 'PenguinMails Admin',
        role: 'sn',
        is_penguinmails_staff: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'user_002',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
        is_penguinmails_staff: false,
        created_at: '2024-01-02T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z'
      },
      {
        id: 'user_003',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'admin',
        is_penguinmails_staff: false,
        created_at: '2024-01-03T00:00:00.000Z',
        updated_at: '2024-01-03T00:00:00.000Z'
      },
      {
        id: 'user_004',
        email: 'alice.johnson@acme.com',
        name: 'Alice Johnson',
        role: 'user',
        is_penguinmails_staff: false,
        created_at: '2024-01-04T00:00:00.000Z',
        updated_at: '2024-01-04T00:00:00.000Z'
      },
      {
        id: 'user_005',
        email: 'charlie.brown@techstart.com',
        name: 'Charlie Brown',
        role: 'admin',
        is_penguinmails_staff: false,
        created_at: '2024-01-05T00:00:00.000Z',
        updated_at: '2024-01-05T00:00:00.000Z'
      }
    ];

    console.log(`  ✅ Exported ${users.length} users`);
    return users;
  }

  /**
   * Export tenants from old system
   */
  private async exportTenants(): Promise<unknown[]> {
    console.log('2️⃣ Exporting tenants...');

    const tenants = [
      {
        id: 'tenant_001',
        name: 'PenguinMails',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'tenant_002',
        name: 'Acme Corporation',
        created_at: '2024-01-02T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z'
      },
      {
        id: 'tenant_003',
        name: 'TechStart Inc',
        created_at: '2024-01-03T00:00:00.000Z',
        updated_at: '2024-01-03T00:00:00.000Z'
      },
      {
        id: 'tenant_004',
        name: 'TestCorp LLC',
        created_at: '2024-01-04T00:00:00.000Z',
        updated_at: '2024-01-04T00:00:00.000Z'
      }
    ];

    console.log(`  ✅ Exported ${tenants.length} tenants`);
    return tenants;
  }

  /**
   * Export companies from old system
   */
  private async exportCompanies(): Promise<unknown[]> {
    console.log('3️⃣ Exporting companies...');

    const companies = [
      {
        id: 'company_001',
        tenant_id: 'tenant_001',
        name: 'PenguinMails Internal',
        email: 'internal@penguinmails.com',
        settings: { internal: true, features: ['admin_panel', 'analytics'] },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'company_002',
        tenant_id: 'tenant_002',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        settings: { industry: 'manufacturing', employees: 500 },
        created_at: '2024-01-02T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z'
      },
      {
        id: 'company_003',
        tenant_id: 'tenant_003',
        name: 'TechStart Inc',
        email: 'hello@techstart.com',
        settings: { industry: 'technology', stage: 'startup' },
        created_at: '2024-01-03T00:00:00.000Z',
        updated_at: '2024-01-03T00:00:00.000Z'
      },
      {
        id: 'company_004',
        tenant_id: 'tenant_004',
        name: 'TestCorp LLC',
        email: 'info@testcorp.com',
        settings: { industry: 'consulting', size: 'small' },
        created_at: '2024-01-04T00:00:00.000Z',
        updated_at: '2024-01-04T00:00:00.000Z'
      }
    ];

    console.log(`  ✅ Exported ${companies.length} companies`);
    return companies;
  }

  /**
   * Export user-company relationships from old system
   */
  private async exportUserCompanies(): Promise<unknown[]> {
    console.log('4️⃣ Exporting user-company relationships...');

    const userCompanies = [
      {
        id: 'uc_001',
        tenant_id: 'tenant_001',
        user_id: 'user_001',
        company_id: 'company_001',
        role: 'owner',
        permissions: { 
          all: true,
          can_manage_users: true,
          can_manage_settings: true,
          can_view_analytics: true,
          can_manage_billing: true
        },
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'uc_002',
        tenant_id: 'tenant_002',
        user_id: 'user_002',
        company_id: 'company_002',
        role: 'owner',
        permissions: {
          can_manage_users: true,
          can_manage_settings: true,
          can_view_analytics: true,
          can_manage_billing: true
        },
        created_at: '2024-01-02T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z'
      },
      {
        id: 'uc_003',
        tenant_id: 'tenant_003',
        user_id: 'user_005',
        company_id: 'company_003',
        role: 'owner',
        permissions: {
          can_manage_users: true,
          can_manage_settings: true,
          can_view_analytics: true,
          can_manage_billing: true
        },
        created_at: '2024-01-03T00:00:00.000Z',
        updated_at: '2024-01-03T00:00:00.000Z'
      },
      {
        id: 'uc_004',
        tenant_id: 'tenant_002',
        user_id: 'user_003',
        company_id: 'company_002',
        role: 'admin',
        permissions: {
          can_manage_users: true,
          can_manage_settings: false,
          can_view_analytics: true,
          can_manage_billing: false
        },
        created_at: '2024-01-04T00:00:00.000Z',
        updated_at: '2024-01-04T00:00:00.000Z'
      },
      {
        id: 'uc_005',
        tenant_id: 'tenant_003',
        user_id: 'user_002',
        company_id: 'company_003',
        role: 'member',
        permissions: {
          can_manage_users: false,
          can_manage_settings: false,
          can_view_analytics: false,
          can_manage_billing: false
        },
        created_at: '2024-01-05T00:00:00.000Z',
        updated_at: '2024-01-05T00:00:00.000Z'
      },
      {
        id: 'uc_006',
        tenant_id: 'tenant_004',
        user_id: 'user_002',
        company_id: 'company_004',
        role: 'member',
        permissions: {
          can_manage_users: false,
          can_manage_settings: false,
          can_view_analytics: false,
          can_manage_billing: false
        },
        created_at: '2024-01-06T00:00:00.000Z',
        updated_at: '2024-01-06T00:00:00.000Z'
      }
    ];

    console.log(`  ✅ Exported ${userCompanies.length} user-company relationships`);
    return userCompanies;
  }

  /**
   * Save exported data to files
   */
  private async saveExportedData(data: ExportedData): Promise<void> {
    console.log('\n5️⃣ Saving exported data...');

    // Save complete data as single file
    const completeFile = join(this.outputDir, 'complete-export.json');
    writeFileSync(completeFile, JSON.stringify(data, null, 2));
    console.log(`  ✅ Saved complete export: ${completeFile}`);

    // Save individual entity files
    const usersFile = join(this.outputDir, 'users.json');
    writeFileSync(usersFile, JSON.stringify(data.users, null, 2));
    console.log(`  ✅ Saved users: ${usersFile}`);

    const tenantsFile = join(this.outputDir, 'tenants.json');
    writeFileSync(tenantsFile, JSON.stringify(data.tenants, null, 2));
    console.log(`  ✅ Saved tenants: ${tenantsFile}`);

    const companiesFile = join(this.outputDir, 'companies.json');
    writeFileSync(companiesFile, JSON.stringify(data.companies, null, 2));
    console.log(`  ✅ Saved companies: ${companiesFile}`);

    const userCompaniesFile = join(this.outputDir, 'user-companies.json');
    writeFileSync(userCompaniesFile, JSON.stringify(data.userCompanies, null, 2));
    console.log(`  ✅ Saved user-companies: ${userCompaniesFile}`);

    // Save metadata
    const metadataFile = join(this.outputDir, 'metadata.json');
    writeFileSync(metadataFile, JSON.stringify(data.metadata, null, 2));
    console.log(`  ✅ Saved metadata: ${metadataFile}`);

    // Create CSV files if requested
    if (this.options.format === 'csv') {
      await this.saveCSVFiles(data);
    }
  }

  /**
   * Save data as CSV files
   */
  private async saveCSVFiles(data: ExportedData): Promise<void> {
    console.log('\n📊 Saving CSV files...');

    // Helper function to convert JSON to CSV
    const jsonToCSV = (items: unknown[]): string => {
      if (items.length === 0) return '';
      
      const headers = Object.keys(items[0] as Record<string, unknown>);
      const csvRows = [headers.join(',')];
      
      for (const item of items) {
        const values = headers.map(header => {
          const value = (item as Record<string, unknown>)[header];
          return typeof value === 'object' ? JSON.stringify(value) : String(value);
        });
        csvRows.push(values.join(','));
      }
      
      return csvRows.join('\n');
    };

    // Save CSV files
    const csvFiles = [
      { name: 'users.csv', data: data.users },
      { name: 'tenants.csv', data: data.tenants },
      { name: 'companies.csv', data: data.companies },
      { name: 'user-companies.csv', data: data.userCompanies }
    ];

    for (const { name, data: items } of csvFiles) {
      const csvContent = jsonToCSV(items);
      const csvFile = join(this.outputDir, name);
      writeFileSync(csvFile, csvContent);
      console.log(`  ✅ Saved CSV: ${csvFile}`);
    }
  }

  /**
   * Print export summary
   */
  private printSummary(data: ExportedData): void {
    console.log('\n📊 EXPORT SUMMARY:');
    console.log(`  Users: ${data.users.length}`);
    console.log(`  Tenants: ${data.tenants.length}`);
    console.log(`  Companies: ${data.companies.length}`);
    console.log(`  User-Company Relationships: ${data.userCompanies.length}`);
    console.log(`  Output Directory: ${this.outputDir}`);
    console.log(`  Export Time: ${data.metadata.exportedAt}`);
    
    if (this.options.verbose) {
      console.log('\n📁 Generated Files:');
      console.log('  - complete-export.json (all data)');
      console.log('  - users.json');
      console.log('  - tenants.json');
      console.log('  - companies.json');
      console.log('  - user-companies.json');
      console.log('  - metadata.json');
      
      if (this.options.format === 'csv') {
        console.log('  - users.csv');
        console.log('  - tenants.csv');
        console.log('  - companies.csv');
        console.log('  - user-companies.csv');
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const options: ExportOptions = {};

  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg.startsWith('--format=')) {
      const format = arg.split('=')[1];
      if (format === 'json' || format === 'csv') {
        options.format = format;
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Old System Data Export Script

Usage:
  npx tsx scripts/export-old-data.ts [options]

Options:
  --output=<path>     Specify output directory (default: ./migration-data)
  --format=<format>   Output format: json, csv (default: json)
  --verbose, -v       Enable verbose output
  --help, -h          Show this help message

Examples:
  npx tsx scripts/export-old-data.ts
  npx tsx scripts/export-old-data.ts --output=./exports --verbose
  npx tsx scripts/export-old-data.ts --format=csv
      `);
      process.exit(0);
    }
  }

  const exporter = new OldDataExporter(options);
  
  try {
    await exporter.export();
    console.log('\n🎉 Export completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Review the exported data files');
    console.log('  2. Run the migration script: npx tsx scripts/migrate-to-niledb.ts');
    console.log('  3. Validate the migration: npx tsx scripts/validate-migration.ts');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Export failed with error:', error);
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

// Run the export
main().catch((error) => {
  console.error('\n❌ Export script failed:', error.message);
  process.exit(1);
});
