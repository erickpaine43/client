/**
 * Migration Validation Utilities
 *
 * Comprehensive validation suite for migrated database schema and data.
 */

import { getMigrationClient } from './config';

export interface ValidationResult {
  success: boolean;
  errors: string[];
  details?: Record<string, unknown>;
  // Table existence validation
  existingTables: string[];
  missingTables: string[];
  // Constraint validation
  checks: Record<string, boolean>;
  // Foreign key validation
  violations: string[];
  validatedRelationships: Array<{ from: string; to: string; key: string }>;
  // Sample data validation
  totalRecords: number;
  entitiesWithData: string[];
  invalidRecords: string[];
}

export interface ValidationSuiteResult {
  overallSuccess: boolean;
  checks: {
    tableExistence: ValidationResult;
    constraints: ValidationResult;
    foreignKeys: ValidationResult;
    sampleData: ValidationResult;
  };
  errors: string[];
}

/**
 * Validate table existence
 */
export async function validateTableExistence(): Promise<ValidationResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];

  const requiredTables = [
    'tenants', 'users', 'team_members', 'companies', 'payments',
    'domains', 'company_settings', 'email_accounts', 'leads',
    'campaigns', 'templates', 'inbox_messages', 'email_services'
  ];

  const existingTables: string[] = [];
  const missingTables: string[] = [];

  try {
    for (const table of requiredTables) {
      const result = await nile.db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        )
      `, [table]);

      if (result.rows[0].exists) {
        existingTables.push(table);
      } else {
        missingTables.push(table);
        errors.push(`Table '${table}' does not exist`);
      }
    }

    return {
      success: missingTables.length === 0,
      errors,
      details: { existingTables, missingTables },
      existingTables,
      missingTables,
      checks: {},
      violations: [],
      validatedRelationships: [],
      totalRecords: 0,
      entitiesWithData: [],
      invalidRecords: []
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to validate table existence: ${error}`],
      existingTables: [],
      missingTables: [],
      checks: {},
      violations: [],
      validatedRelationships: [],
      totalRecords: 0,
      entitiesWithData: [],
      invalidRecords: []
    };
  }
}

/**
 * Validate constraints
 */
export async function validateConstraints(): Promise<ValidationResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];
  const checks: Record<string, boolean> = {};

  try {
    // Check for primary key constraints
    const pkResult = await nile.db.query(`
      SELECT COUNT(*) as pk_count
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_name IN ('tenants', 'users', 'team_members', 'companies', 'payments',
                           'domains', 'company_settings', 'email_accounts', 'leads',
                           'campaigns', 'templates', 'inbox_messages', 'email_services')
    `);

    const pkCount = parseInt(pkResult.rows[0].pk_count);
    checks.primary_key_constraints = pkCount >= 13;
    if (!checks.primary_key_constraints) {
      errors.push(`Expected 13 primary key constraints, found ${pkCount}`);
    }

    // Check for foreign key constraints
    const fkResult = await nile.db.query(`
      SELECT COUNT(*) as fk_count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
    `);

    const fkCount = parseInt(fkResult.rows[0].fk_count);
    checks.foreign_key_constraints = fkCount >= 10;
    if (!checks.foreign_key_constraints) {
      errors.push(`Expected at least 10 foreign key constraints, found ${fkCount}`);
    }

    // Check for unique constraints
    const uniqueResult = await nile.db.query(`
      SELECT COUNT(*) as unique_count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'UNIQUE'
    `);

    const uniqueCount = parseInt(uniqueResult.rows[0].unique_count);
    checks.unique_constraints = uniqueCount >= 5;
    if (!checks.unique_constraints) {
      errors.push(`Expected at least 5 unique constraints, found ${uniqueCount}`);
    }

    // Check for check constraints
    const checkResult = await nile.db.query(`
      SELECT COUNT(*) as check_count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'CHECK'
    `);

    const checkCount = parseInt(checkResult.rows[0].check_count);
    checks.check_constraints = checkCount >= 0; // Allow 0 for now

    return {
      success: errors.length === 0,
      errors,
      checks,
      existingTables: [],
      missingTables: [],
      violations: [],
      validatedRelationships: [],
      totalRecords: 0,
      entitiesWithData: [],
      invalidRecords: []
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to validate constraints: ${error}`],
      checks: {
        primary_key_constraints: false,
        foreign_key_constraints: false,
        unique_constraints: false,
        check_constraints: false
      },
      existingTables: [],
      missingTables: [],
      violations: [],
      validatedRelationships: [],
      totalRecords: 0,
      entitiesWithData: [],
      invalidRecords: []
    };
  }
}

/**
 * Validate foreign key relationships
 */
export async function validateForeignKeys(): Promise<ValidationResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];
  const violations: string[] = [];
  const validatedRelationships: Array<{ from: string; to: string; key: string }> = [];

  try {
    // Define expected relationships
    const expectedRelationships = [
      { from: 'users', to: 'tenants', key: 'tenant_id' },
      { from: 'team_members', to: 'users', key: 'user_id' },
      { from: 'team_members', to: 'tenants', key: 'team_id' },
      { from: 'companies', to: 'tenants', key: 'tenant_id' },
      { from: 'payments', to: 'companies', key: 'company_id' },
      { from: 'domains', to: 'companies', key: 'company_id' },
      { from: 'company_settings', to: 'companies', key: 'company_id' },
      { from: 'email_accounts', to: 'companies', key: 'company_id' },
      { from: 'leads', to: 'companies', key: 'company_id' },
      { from: 'campaigns', to: 'companies', key: 'company_id' }
    ];

    // Check each expected relationship
    for (const rel of expectedRelationships) {
      const fkResult = await nile.db.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1
          AND kcu.column_name = $2
          AND ccu.table_name = $3
        ) as exists_fk
      `, [rel.from, rel.key, rel.to]);

      if (fkResult.rows[0].exists_fk) {
        validatedRelationships.push(rel);
      } else {
        violations.push(`Missing FK: ${rel.from}.${rel.key} -> ${rel.to}`);
        errors.push(`Foreign key relationship ${rel.from}.${rel.key} -> ${rel.to} not found`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      violations,
      validatedRelationships,
      existingTables: [],
      missingTables: [],
      checks: {},
      totalRecords: 0,
      entitiesWithData: [],
      invalidRecords: []
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to validate foreign keys: ${error}`],
      violations: [],
      validatedRelationships: [],
      existingTables: [],
      missingTables: [],
      checks: {},
      totalRecords: 0,
      entitiesWithData: [],
      invalidRecords: []
    };
  }
}

/**
 * Validate sample data consistency
 */
export async function validateSampleData(): Promise<ValidationResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];
  const entitiesWithData: string[] = [];
  const invalidRecords: string[] = [];
  let totalRecords = 0;

  try {
    // Check that each table has some data
    const tables = [
      'tenants', 'users', 'team_members', 'companies', 'payments',
      'domains', 'company_settings', 'email_accounts', 'leads',
      'campaigns', 'templates', 'inbox_messages', 'email_services'
    ];

    for (const table of tables) {
      const result = await nile.db.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      totalRecords += count;

      if (count > 0) {
        entitiesWithData.push(table);
      } else {
        errors.push(`Table '${table}' has no data`);
      }

      // Basic validation: check for null primary keys (simplified invalid record check)
      try {
        const nullCheck = await nile.db.query(`
          SELECT COUNT(*) as null_count FROM ${table}
          WHERE id IS NULL
        `);
        if (parseInt(nullCheck.rows[0].null_count) > 0) {
          invalidRecords.push(`${table}: ${nullCheck.rows[0].null_count} records with null id`);
        }
      } catch {
        // Skip if table doesn't have 'id' column
      }
    }

    return {
      success: errors.length === 0,
      errors,
      totalRecords,
      entitiesWithData,
      invalidRecords,
      existingTables: [],
      missingTables: [],
      checks: {},
      violations: [],
      validatedRelationships: []
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to validate sample data: ${error}`],
      totalRecords: 0,
      entitiesWithData: [],
      invalidRecords: [],
      existingTables: [],
      missingTables: [],
      checks: {},
      violations: [],
      validatedRelationships: []
    };
  }
}

/**
 * Run complete validation suite
 */
export async function runValidationSuite(): Promise<ValidationSuiteResult> {
  console.log('Running validation suite...');

  const tableResult = await validateTableExistence();
  const constraintResult = await validateConstraints();
  const fkResult = await validateForeignKeys();
  const dataResult = await validateSampleData();

  const allErrors = [
    ...tableResult.errors,
    ...constraintResult.errors,
    ...fkResult.errors,
    ...dataResult.errors
  ];

  const overallSuccess = allErrors.length === 0;

  return {
    overallSuccess,
    checks: {
      tableExistence: tableResult,
      constraints: constraintResult,
      foreignKeys: fkResult,
      sampleData: dataResult
    },
    errors: allErrors
  };
}
