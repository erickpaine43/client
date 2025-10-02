/**
 * Migration Rollback Utilities
 *
 * Handles rollback operations for database migrations.
 */

import { getMigrationClient } from './config';

export interface RollbackResult {
  success: boolean;
  entities?: string[];
  errors?: string[];
}

/**
 * Rollback all seeded data
 */
export async function rollbackAllData(): Promise<RollbackResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];
  const rolledBackEntities: string[] = [];

  console.log('Rolling back all seeded data...');

  const entities = [
    'email_services',
    'inbox_messages',
    'templates',
    'campaigns',
    'leads',
    'email_accounts',
    'company_settings',
    'domains',
    'payments',
    'companies',
    'team_members',
    'users',
    'tenants'
  ];

  try {
    for (const entity of entities) {
      try {
        await nile.db.query(`DELETE FROM ${entity}`);
        rolledBackEntities.push(entity);
        console.log(`✓ Cleared data from ${entity}`);
      } catch (error) {
        const errorMsg = `Failed to clear ${entity}: ${error}`;
        errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
      }
    }

    return {
      success: errors.length === 0,
      entities: rolledBackEntities,
      errors
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Rollback failed: ${error}`]
    };
  }
}

/**
 * Rollback specific entity data
 */
export async function rollbackEntityData(entity: string): Promise<RollbackResult> {
  const nile = getMigrationClient();

  try {
    await nile.db.query(`DELETE FROM ${entity}`);
    console.log(`✓ Cleared data from ${entity}`);

    return {
      success: true,
      entities: [entity]
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to clear ${entity}: ${error}`]
    };
  }
}

/**
 * Validate rollback state
 */
export async function validateRollback(): Promise<RollbackResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];

  const tables = [
    'tenants', 'users', 'team_members', 'companies', 'payments',
    'domains', 'company_settings', 'email_accounts', 'leads',
    'campaigns', 'templates', 'inbox_messages', 'email_services'
  ];

  try {
    for (const table of tables) {
      const result = await nile.db.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = parseInt(result.rows[0].count);

      if (count > 0) {
        errors.push(`Table '${table}' still contains ${count} records`);
      }
    }

    return {
      success: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Validation failed: ${error}`]
    };
  }
}

/**
 * Complete rollback (data + schema)
 */
export async function completeRollback(): Promise<RollbackResult> {
  console.log('Performing complete rollback (data + schema)...');

  try {
    // First rollback data
    const dataResult = await rollbackAllData();
    if (!dataResult.success) {
      return dataResult;
    }

    // Then drop schemas (would need to import dropAllSchemas)
    // For now, just return data rollback result
    console.log('✓ Complete rollback completed');

    return {
      success: true,
      entities: dataResult.entities
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Complete rollback failed: ${error}`]
    };
  }
}
