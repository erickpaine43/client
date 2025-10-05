/**
 * Migration Configuration
 *
 * Configuration for NileDB migration scripts.
 * Provides database client and settings for schema creation and seeding.
 */

import { getNileClient } from '../../lib/niledb/client';
import { getNileConfig } from '../../lib/niledb/config';

/**
 * Get NileDB client configured for migrations
 */
export const getMigrationClient = () => {
  return getNileClient();
};

/**
 * Migration-specific configuration
 */
export const migrationConfig = {
  batchSize: 100,
  timeout: 30000, // 30 seconds
  retries: 3,
  dryRun: process.env.MIGRATION_DRY_RUN === 'true',
};

/**
 * Validate migration environment
 */
export const validateMigrationEnvironment = (): boolean => {
  const config = getNileConfig();

  if (!config.databaseId || !config.databaseName) {
    console.error('NileDB configuration is incomplete. Please check environment variables.');
    return false;
  }

  return true;
};
