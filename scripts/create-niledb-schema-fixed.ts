#!/usr/bin/env tsx

/**
 * Create NileDB Schema (Fixed Version)
 * 
 * This script creates the custom tables needed for the PenguinMails application
 * on top of NileDB's built-in users and tenants tables.
 * 
 * Fixed issues:
 * - Corrected LOCALTIMESTAMP syntax
 * - Added tenant_id to primary keys for tenant-aware tables
 */

import { getNileClient } from '../lib/niledb/client';

interface SchemaCreationResult {
  table: string;
  status: 'created' | 'exists' | 'failed';
  message: string;
}

/**
 * Create user_profiles table for custom user fields
 */
async function createUserProfilesTable(): Promise<SchemaCreationResult> {
  const nile = getNileClient();
  
  try {
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
        user_id uuid NOT NULL,
        role text DEFAULT 'user',
        is_penguinmails_staff boolean DEFAULT false,
        preferences jsonb DEFAULT '{}',
        last_login_at timestamp without time zone,
        created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        deleted timestamp without time zone NULL,
        PRIMARY KEY (id),
        UNIQUE(user_id)
      );
    `);
    
    // Add missing columns if they don't exist
    await nile.db.query(`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS last_login_at timestamp without time zone;
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_staff ON user_profiles(is_penguinmails_staff);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_deleted ON user_profiles(deleted) WHERE deleted IS NULL;
    `);
    
    return {
      table: 'user_profiles',
      status: 'created',
      message: 'User profiles table created successfully with indexes'
    };
    
  } catch (error) {
    return {
      table: 'user_profiles',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create companies table for tenant-scoped business entities
 */
async function createCompaniesTable(): Promise<SchemaCreationResult> {
  const nile = getNileClient();
  
  try {
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name text NOT NULL,
        email text,
        settings jsonb DEFAULT '{}',
        created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        deleted timestamp without time zone NULL,
        PRIMARY KEY (tenant_id, id)
      );
    `);
    
    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
      CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
      CREATE INDEX IF NOT EXISTS idx_companies_deleted ON companies(deleted) WHERE deleted IS NULL;
    `);
    
    // Add constraints
    await nile.db.query(`
      ALTER TABLE companies 
      ADD CONSTRAINT IF NOT EXISTS chk_companies_name_not_empty 
      CHECK (length(trim(name)) > 0);
    `);
    
    return {
      table: 'companies',
      status: 'created',
      message: 'Companies table created successfully with indexes and constraints'
    };
    
  } catch (error) {
    return {
      table: 'companies',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create user_companies junction table for user-company relationships
 */
async function createUserCompaniesTable(): Promise<SchemaCreationResult> {
  const nile = getNileClient();
  
  try {
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS user_companies (
        id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id uuid NOT NULL,
        company_id uuid NOT NULL,
        role text DEFAULT 'member',
        permissions jsonb DEFAULT '{}',
        created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        deleted timestamp without time zone NULL,
        PRIMARY KEY (tenant_id, id),
        UNIQUE(tenant_id, user_id, company_id)
      );
    `);
    
    // Add foreign key to companies table
    await nile.db.query(`
      ALTER TABLE user_companies 
      ADD CONSTRAINT IF NOT EXISTS fk_user_companies_company_id 
      FOREIGN KEY (tenant_id, company_id) REFERENCES companies(tenant_id, id) ON DELETE CASCADE;
    `);
    
    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_companies_tenant_id ON user_companies(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);
      CREATE INDEX IF NOT EXISTS idx_user_companies_role ON user_companies(role);
      CREATE INDEX IF NOT EXISTS idx_user_companies_tenant_user ON user_companies(tenant_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_user_companies_tenant_company ON user_companies(tenant_id, company_id);
      CREATE INDEX IF NOT EXISTS idx_user_companies_deleted ON user_companies(deleted) WHERE deleted IS NULL;
    `);
    
    // Add constraints
    await nile.db.query(`
      ALTER TABLE user_companies 
      ADD CONSTRAINT IF NOT EXISTS chk_user_companies_role 
      CHECK (role IN ('member', 'admin', 'owner'));
    `);
    
    return {
      table: 'user_companies',
      status: 'created',
      message: 'User-companies table created successfully with indexes and constraints'
    };
    
  } catch (error) {
    return {
      table: 'user_companies',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create additional business tables from the old schema
 */
async function createAdditionalTables(): Promise<SchemaCreationResult[]> {
  const nile = getNileClient();
  const results: SchemaCreationResult[] = [];
  
  // Tenant billing table
  try {
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS tenant_billing (
        id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        plan text DEFAULT 'free',
        billing_email text,
        stripe_customer_id text,
        subscription_status text DEFAULT 'inactive',
        current_period_start timestamp without time zone,
        current_period_end timestamp without time zone,
        created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        deleted timestamp without time zone NULL,
        PRIMARY KEY (tenant_id, id),
        UNIQUE(tenant_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_tenant_billing_tenant_id ON tenant_billing(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_tenant_billing_stripe_customer ON tenant_billing(stripe_customer_id);
      CREATE INDEX IF NOT EXISTS idx_tenant_billing_deleted ON tenant_billing(deleted) WHERE deleted IS NULL;
    `);
    
    results.push({
      table: 'tenant_billing',
      status: 'created',
      message: 'Tenant billing table created successfully'
    });
  } catch (error) {
    results.push({
      table: 'tenant_billing',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Domains table
  try {
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS domains (
        id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        domain text NOT NULL,
        is_verified boolean DEFAULT false,
        verification_token text,
        dns_records jsonb DEFAULT '[]',
        created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        deleted timestamp without time zone NULL,
        PRIMARY KEY (tenant_id, id),
        UNIQUE(domain)
      );
      
      CREATE INDEX IF NOT EXISTS idx_domains_tenant_id ON domains(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
      CREATE INDEX IF NOT EXISTS idx_domains_verified ON domains(is_verified);
      CREATE INDEX IF NOT EXISTS idx_domains_deleted ON domains(deleted) WHERE deleted IS NULL;
    `);
    
    results.push({
      table: 'domains',
      status: 'created',
      message: 'Domains table created successfully'
    });
  } catch (error) {
    results.push({
      table: 'domains',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Audit logs table
  try {
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id uuid,
        action text NOT NULL,
        resource_type text NOT NULL,
        resource_id uuid,
        details jsonb DEFAULT '{}',
        ip_address inet,
        user_agent text,
        created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
        PRIMARY KEY (tenant_id, id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created);
    `);
    
    results.push({
      table: 'audit_logs',
      status: 'created',
      message: 'Audit logs table created successfully'
    });
  } catch (error) {
    results.push({
      table: 'audit_logs',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return results;
}

/**
 * Add foreign key constraint for user_profiles after users table exists
 */
async function addUserProfilesForeignKey(): Promise<SchemaCreationResult> {
  const nile = getNileClient();
  
  try {
    // Check if users table exists
    const usersExists = await nile.db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (usersExists.rows[0].exists) {
      await nile.db.query(`
        ALTER TABLE user_profiles 
        ADD CONSTRAINT IF NOT EXISTS fk_user_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `);
      
      return {
        table: 'user_profiles',
        status: 'created',
        message: 'Foreign key constraint added to user_profiles'
      };
    } else {
      return {
        table: 'user_profiles',
        status: 'exists',
        message: 'Users table does not exist yet - foreign key will be added later'
      };
    }
  } catch (error) {
    return {
      table: 'user_profiles',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Add foreign key constraint for user_companies after users table exists
 */
async function addUserCompaniesForeignKey(): Promise<SchemaCreationResult> {
  const nile = getNileClient();
  
  try {
    // Check if users table exists
    const usersExists = await nile.db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (usersExists.rows[0].exists) {
      await nile.db.query(`
        ALTER TABLE user_companies 
        ADD CONSTRAINT IF NOT EXISTS fk_user_companies_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `);
      
      return {
        table: 'user_companies',
        status: 'created',
        message: 'Foreign key constraint added to user_companies'
      };
    } else {
      return {
        table: 'user_companies',
        status: 'exists',
        message: 'Users table does not exist yet - foreign key will be added later'
      };
    }
  } catch (error) {
    return {
      table: 'user_companies',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Drop existing tables if they have errors
 */
async function dropErrorTables(): Promise<void> {
  const nile = getNileClient();
  
  console.log('🧹 Cleaning up failed tables...');
  
  const tablesToDrop = ['companies', 'user_companies', 'tenant_billing', 'domains', 'audit_logs'];
  
  for (const table of tablesToDrop) {
    try {
      await nile.db.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      console.log(`   ✅ Dropped ${table}`);
    } catch (error) {
      console.log(`   ⚠️  Could not drop ${table}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

/**
 * Main schema creation function
 */
async function createNileDBSchema(): Promise<void> {
  console.log('🏗️  Creating NileDB Schema (Fixed Version)\n');
  console.log('==========================================\n');
  
  const results: SchemaCreationResult[] = [];
  
  try {
    // Clean up any failed tables first
    await dropErrorTables();
    
    // Create core tables
    console.log('\n📋 Creating core business tables...');
    results.push(await createUserProfilesTable());
    results.push(await createCompaniesTable());
    results.push(await createUserCompaniesTable());
    
    // Create additional tables
    console.log('\n📋 Creating additional business tables...');
    const additionalResults = await createAdditionalTables();
    results.push(...additionalResults);
    
    // Try to add foreign key constraints (will succeed if users table exists)
    console.log('\n🔗 Adding foreign key constraints...');
    results.push(await addUserProfilesForeignKey());
    results.push(await addUserCompaniesForeignKey());
    
    // Display results
    console.log('\n📊 Schema Creation Results:');
    console.log('===========================\n');
    
    const successful = results.filter(r => r.status === 'created').length;
    const existing = results.filter(r => r.status === 'exists').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    results.forEach(result => {
      const icon = result.status === 'created' ? '✅' : result.status === 'exists' ? '⚠️' : '❌';
      console.log(`${icon} ${result.table}: ${result.message}`);
    });
    
    console.log('\n📈 Summary:');
    console.log(`   ✅ Created: ${successful}`);
    console.log(`   ⚠️  Existing: ${existing}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📋 Total: ${results.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 Schema creation completed successfully!');
      console.log('\n💡 Next Steps:');
      console.log('   1. Create a user through NileDB auth to initialize users table');
      console.log('   2. Run foreign key constraint script again after users table exists');
      console.log('   3. Begin data migration from old database');
    } else {
      console.log('\n⚠️  Some tables failed to create. Please review the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Verify schema creation
 */
async function verifySchema(): Promise<void> {
  console.log('\n🔍 Verifying Schema Creation\n');
  console.log('============================\n');
  
  const nile = getNileClient();
  
  try {
    // List all tables
    const tables = await nile.db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Created Tables:');
    tables.rows.forEach((table: { table_name: string }) => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check table counts
    console.log('\n📊 Table Status:');
    for (const table of tables.rows) {
      const count = await nile.db.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
      console.log(`   ${table.table_name}: ${count.rows[0].count} rows`);
    }
    
    // Show table relationships
    console.log('\n🔗 Table Relationships:');
    const relationships = await nile.db.query(`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `);
    
    relationships.rows.forEach((rel: { table_name: string; column_name: string; foreign_table_name: string; foreign_column_name: string }) => {
      console.log(`   ${rel.table_name}.${rel.column_name} → ${rel.foreign_table_name}.${rel.foreign_column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  await createNileDBSchema();
  await verifySchema();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export {
  createNileDBSchema,
  createUserProfilesTable,
  createCompaniesTable,
  createUserCompaniesTable,
  createAdditionalTables,
  addUserProfilesForeignKey,
  addUserCompaniesForeignKey,
  verifySchema,
  dropErrorTables,
};
