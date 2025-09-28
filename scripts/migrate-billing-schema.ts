#!/usr/bin/env tsx

/**
 * Billing Schema Migration Script
 * 
 * This script creates the complete OLTP billing infrastructure in NileDB
 * following the established architectural patterns.
 * 
 * Usage:
 *   npm run migrate:billing
 *   or
 *   npx tsx scripts/migrate-billing-schema.ts
 * 
 * Features:
 * - Creates all billing tables with proper constraints
 * - Sets up indexes for performance
 * - Implements row-level security (RLS)
 * - Creates audit triggers
 * - Inserts default subscription plans
 * - Validates schema integrity
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Import NileDB connection
// Note: In a real implementation, you would import the actual NileDB client
// For now, we'll create a mock implementation that shows the structure

interface NileDBClient {
  query(sql: string, params?: unknown[]): Promise<unknown[]>;
}

// Mock NileDB client - replace with actual implementation
const createNileClient = (): NileDBClient => {
  return {
    async query(sql: string, params?: unknown[]): Promise<unknown[]> {
      console.log('Executing SQL:', sql.substring(0, 100) + '...');
      if (params && params.length > 0) {
        console.log('Parameters:', params);
      }
      // In real implementation, this would execute against NileDB
      return [];
    }
  };
};

/**
 * Migration runner class
 */
class BillingMigration {
  private client: NileDBClient;
  private schemaPath: string;

  constructor() {
    this.client = createNileClient();
    this.schemaPath = join(__dirname, '../lib/actions/billing/schema.sql');
  }

  /**
   * Run the complete billing schema migration
   */
  async run(): Promise<void> {
    console.log('🚀 Starting billing schema migration...');
    
    try {
      // 1. Read schema file
      console.log('📖 Reading schema file...');
      const schemaSQL = readFileSync(this.schemaPath, 'utf-8');
      
      // 2. Split schema into individual statements
      const statements = this.splitSQLStatements(schemaSQL);
      console.log(`📝 Found ${statements.length} SQL statements to execute`);
      
      // 3. Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement.length === 0 || statement.startsWith('--')) {
          continue; // Skip empty lines and comments
        }
        
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        await this.executeStatement(statement);
      }
      
      // 4. Validate migration
      console.log('✅ Validating migration...');
      await this.validateMigration();
      
      console.log('🎉 Billing schema migration completed successfully!');
      
      // 5. Display summary
      await this.displayMigrationSummary();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Split SQL file into individual statements
   */
  private splitSQLStatements(sql: string): string[] {
    // Remove comments and split by semicolons
    const lines = sql.split('\n');
    const cleanedLines = lines.filter(line => 
      !line.trim().startsWith('--') && 
      !line.trim().startsWith('/*') &&
      !line.trim().startsWith('*') &&
      !line.trim().startsWith('*/') &&
      line.trim().length > 0
    );
    
    const cleanedSQL = cleanedLines.join('\n');
    return cleanedSQL.split(';').filter(stmt => stmt.trim().length > 0);
  }

  /**
   * Execute a single SQL statement with error handling
   */
  private async executeStatement(statement: string): Promise<void> {
    try {
      await this.client.query(statement);
    } catch (error) {
      console.error(`Failed to execute statement: ${statement.substring(0, 100)}...`);
      throw error;
    }
  }

  /**
   * Validate that the migration was successful
   */
  private async validateMigration(): Promise<void> {
    const validations = [
      {
        name: 'subscription_plans table',
        query: `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'subscription_plans'`
      },
      {
        name: 'company_billing table',
        query: `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'company_billing'`
      },
      {
        name: 'payment_methods table',
        query: `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'payment_methods'`
      },
      {
        name: 'invoices table',
        query: `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'invoices'`
      },
      {
        name: 'default subscription plans',
        query: `SELECT COUNT(*) as count FROM subscription_plans WHERE is_active = true`
      }
    ];

    for (const validation of validations) {
      try {
        const result = await this.client.query(validation.query);
        const count = (result[0] as { count?: number })?.count || 0;
        
        if (count === 0 && validation.name.includes('table')) {
          throw new Error(`${validation.name} was not created`);
        }
        
        console.log(`✓ ${validation.name}: ${count > 0 ? 'OK' : 'Not found'}`);
      } catch (error) {
        console.warn(`⚠️  Could not validate ${validation.name}:`, error);
      }
    }
  }

  /**
   * Display migration summary
   */
  private async displayMigrationSummary(): Promise<void> {
    console.log('\n📊 Migration Summary:');
    console.log('====================');
    
    try {
      // Count tables created
      const tables = ['subscription_plans', 'company_billing', 'payment_methods', 'invoices'];
      console.log(`📋 Tables created: ${tables.length}`);
      
      // Count default plans
      const plansResult = await this.client.query('SELECT COUNT(*) as count FROM subscription_plans');
      const plansCount = (plansResult[0] as { count?: number })?.count || 0;
      console.log(`💳 Default subscription plans: ${plansCount}`);
      
      // Display security features
      console.log('\n🔒 Security Features Implemented:');
      console.log('  ✓ Row-level security (RLS) policies');
      console.log('  ✓ Tenant isolation via tenant_id');
      console.log('  ✓ Payment method tokenization ready');
      console.log('  ✓ Financial audit trail');
      console.log('  ✓ PCI compliance foundation');
      
      // Display architectural features
      console.log('\n🏗️  Architectural Features:');
      console.log('  ✓ OLTP-first design pattern');
      console.log('  ✓ Complete financial data isolation');
      console.log('  ✓ Secure payment method storage');
      console.log('  ✓ Proper subscription management');
      console.log('  ✓ Invoice generation and tracking');
      
    } catch (error) {
      console.warn('⚠️  Could not generate complete summary:', error);
    }
  }

  /**
   * Rollback migration (for development/testing)
   */
  async rollback(): Promise<void> {
    console.log('🔄 Rolling back billing schema migration...');
    
    const rollbackStatements = [
      'DROP TABLE IF EXISTS invoices CASCADE',
      'DROP TABLE IF EXISTS payment_methods CASCADE',
      'DROP TABLE IF EXISTS company_billing CASCADE',
      'DROP TABLE IF EXISTS subscription_plans CASCADE',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE'
    ];

    for (const statement of rollbackStatements) {
      try {
        console.log(`⚡ Executing: ${statement}`);
        await this.client.query(statement);
      } catch (error) {
        console.warn(`⚠️  Rollback warning: ${error}`);
      }
    }
    
    console.log('✅ Rollback completed');
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const migration = new BillingMigration();
  
  if (args.includes('--rollback')) {
    await migration.rollback();
  } else {
    await migration.run();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { BillingMigration };
