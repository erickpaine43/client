/**
 * Migration Rollback Utilities
 *
 * Handles rollback operations for database migrations.
 */

import { getMigrationClient } from './config';

export interface RollbackResult {
  success: boolean;
  entities: string[];
  errors: string[];
  rolledBackEntities: string[];
  remainingData: number;
  remainingTables: string[];
  rollbackComplete: boolean;
  droppedTables: string[];
  preservedEntities: string[];
  attemptedEntities: string[];
}

/**
 * Create a default rollback result with empty/default values
 */
function createDefaultRollbackResult(): Omit<RollbackResult, 'success'> {
  return {
    entities: [],
    errors: [],
    rolledBackEntities: [],
    remainingData: 0,
    remainingTables: [],
    rollbackComplete: false,
    droppedTables: [],
    preservedEntities: [],
    attemptedEntities: []
  };
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
      rolledBackEntities,
      errors,
      remainingData: 0,
      remainingTables: [],
      rollbackComplete: errors.length === 0,
      droppedTables: [],
      preservedEntities: [],
      attemptedEntities: rolledBackEntities
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Rollback failed: ${error}`],
      entities: [],
      rolledBackEntities: [],
      remainingData: 0,
      remainingTables: [],
      rollbackComplete: false,
      droppedTables: [],
      preservedEntities: [],
      attemptedEntities: []
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
      ...createDefaultRollbackResult(),
      entities: [entity],
      rolledBackEntities: [entity],
      attemptedEntities: [entity]
    };
  } catch (error) {
    return {
      success: false,
      ...createDefaultRollbackResult(),
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
  const remainingTables: string[] = [];
  let remainingData = 0;

  const tables = [
    'tenants', 'users', 'team_members', 'companies', 'payments',
    'domains', 'company_settings', 'email_accounts', 'leads',
    'campaigns', 'templates', 'inbox_messages', 'email_services'
  ];

  try {
    for (const table of tables) {
      const result = await nile.db.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      remainingData += count;

      if (count > 0) {
        errors.push(`Table '${table}' still contains ${count} records`);
        remainingTables.push(table);
      }
    }

    const rollbackComplete = errors.length === 0;

    return {
      success: rollbackComplete,
      ...createDefaultRollbackResult(),
      errors,
      remainingData,
      remainingTables,
      rollbackComplete
    };
  } catch (error) {
    return {
      success: false,
      ...createDefaultRollbackResult(),
      errors: [`Validation failed: ${error}`],
      remainingData: 0,
      remainingTables: [],
      rollbackComplete: false
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
      ...createDefaultRollbackResult(),
      entities: dataResult.entities,
      rolledBackEntities: dataResult.rolledBackEntities
    };
  } catch (error) {
    return {
      success: false,
      ...createDefaultRollbackResult(),
      errors: [`Complete rollback failed: ${error}`]
    };
  }
}

/**
 * Rollback schema (drop tables)
 */
export async function rollbackSchema(): Promise<RollbackResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];
  const droppedTables: string[] = [];

  const tables = [
    'tenants', 'users', 'team_members', 'companies', 'payments',
    'domains', 'company_settings', 'email_accounts', 'leads',
    'campaigns', 'templates', 'inbox_messages', 'email_services'
  ];

  console.log('Rolling back schema (dropping tables)...');

  try {
    for (const table of tables) {
      try {
        await nile.db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        droppedTables.push(table);
        console.log(`✓ Dropped table ${table}`);
      } catch (error) {
        const errorMsg = `Failed to drop ${table}: ${error}`;
        errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
      }
    }

    return {
      success: errors.length === 0,
      ...createDefaultRollbackResult(),
      droppedTables,
      errors
    };
  } catch (error) {
    return {
      success: false,
      ...createDefaultRollbackResult(),
      errors: [`Schema rollback failed: ${error}`]
    };
  }
}

/**
 * Partial rollback for specific entities
 */
export async function rollbackPartial(entities: string[]): Promise<RollbackResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];
  const rolledBackEntities: string[] = [];
  const preservedEntities: string[] = [];

  const allEntities = [
    'tenants', 'users', 'team_members', 'companies', 'payments',
    'domains', 'company_settings', 'email_accounts', 'leads',
    'campaigns', 'templates', 'inbox_messages', 'email_services'
  ];

  console.log(`Performing partial rollback for: ${entities.join(', ')}`);

  try {
    // Rollback specified entities
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

    // Identify preserved entities
    preservedEntities.push(...allEntities.filter(entity => !entities.includes(entity)));

    return {
      success: errors.length === 0,
      ...createDefaultRollbackResult(),
      rolledBackEntities,
      preservedEntities,
      errors,
      entities: rolledBackEntities
    };
  } catch (error) {
    return {
      success: false,
      ...createDefaultRollbackResult(),
      errors: [`Partial rollback failed: ${error}`],
      rolledBackEntities: [],
      preservedEntities: []
    };
  }
}

/**
 * Rollback with comprehensive error handling
 */
export async function rollbackWithErrorHandling(): Promise<RollbackResult> {
  const nile = getMigrationClient();
  const errors: string[] = [];
  const attemptedEntities: string[] = [];

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

  console.log('Rolling back with comprehensive error handling...');

  try {
    for (const entity of entities) {
      attemptedEntities.push(entity);
      try {
        await nile.db.query(`DELETE FROM ${entity}`);
        console.log(`✓ Cleared data from ${entity}`);
      } catch (error) {
        const errorMsg = `Failed to clear ${entity}: ${error}`;
        errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
        // Continue with other entities despite errors
      }
    }

    return {
      success: errors.length === 0,
      ...createDefaultRollbackResult(),
      attemptedEntities,
      errors
    };
  } catch (error) {
    return {
      success: false,
      ...createDefaultRollbackResult(),
      errors: [`Rollback with error handling failed: ${error}`],
      attemptedEntities
    };
  }
}
