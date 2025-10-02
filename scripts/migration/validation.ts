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
}

export interface ValidationSuiteResult {
  overallSuccess: boolean;
  tableExistence: ValidationResult;
  constraints: ValidationResult;
  foreignKeys: ValidationResult;
  sampleData: ValidationResult;
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
      details: { existingTables, missingTables }
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to validate table existence: ${error}`]
    };
  }
}

/**
 * Validate constraints
 */
export async function validateConstraints(): Promise<ValidationResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];

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

    if (pkResult.rows[0].pk_count < 13) {
      errors.push(`Expected 13 primary key constraints, found ${pkResult.rows[0].pk_count}`);
    }

    // Add more constraint validations as needed

    return {
      success: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to validate constraints: ${error}`]
    };
  }
}

/**
 * Validate foreign key relationships
 */
export async function validateForeignKeys(): Promise<ValidationResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];

  try {
    // Check foreign key constraints exist
    const fkResult = await nile.db.query(`
      SELECT COUNT(*) as fk_count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
    `);

    // Should have multiple FK constraints
    if (fkResult.rows[0].fk_count < 10) {
      errors.push(`Expected at least 10 foreign key constraints, found ${fkResult.rows[0].fk_count}`);
    }

    return {
      success: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to validate foreign keys: ${error}`]
    };
  }
}

/**
 * Validate sample data consistency
 */
export async function validateSampleData(): Promise<ValidationResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];

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

      if (count === 0) {
        errors.push(`Table '${table}' has no data`);
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to validate sample data: ${error}`]
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
    tableExistence: tableResult,
    constraints: constraintResult,
    foreignKeys: fkResult,
    sampleData: dataResult,
    errors: allErrors
  };
}
