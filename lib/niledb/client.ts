/**
 * NileDB Client Initialization
 * 
 * Provides a configured NileDB client instance with proper error handling,
 * connection management, and environment-specific settings.
 */

import { Nile } from '@niledatabase/server';
import type { Server } from '@niledatabase/server';
import { getNileConfig, type NileConfig } from './config';
import { validateConfiguration } from './health';

// Global client instance
let nileInstance: Server | null = null;

/**
 * Initialize NileDB client with configuration
 */
export const initializeNileClient = (): Server => {
  // Validate configuration first
  const configValidation = validateConfiguration();
  if (!configValidation.isValid) {
    throw new Error(
      `NileDB configuration is invalid:\n${configValidation.errors.join('\n')}`
    );
  }

  const config = getNileConfig();

  try {
    const nileConfig = {
      // Database connection
      databaseId: config.databaseId,
      databaseName: config.databaseName,
      user: config.user,
      password: config.password,
      
      // API configuration
      apiUrl: config.apiUrl,
      
      // Application settings
      origin: config.origin,
      debug: config.debug,
      secureCookies: config.secureCookies,
      
      // Database connection pool
      db: {
        host: extractHostFromPostgresUrl(config.postgresUrl),
        port: extractPortFromPostgresUrl(config.postgresUrl),
        database: config.databaseName,
        user: config.user,
        password: config.password,
        max: config.connectionPool.max,
        idleTimeoutMillis: config.connectionPool.idleTimeoutMillis,
        connectionTimeoutMillis: config.connectionPool.connectionTimeoutMillis,
      },
    };

    const client = Nile(nileConfig);

    // Add error handling for common issues
    if (config.debug) {
      console.log('NileDB client initialized with config:', {
        databaseId: config.databaseId,
        databaseName: config.databaseName,
        environment: config.nodeEnv,
        origin: config.origin,
        debug: config.debug,
        secureCookies: config.secureCookies,
      });
    }

    return client;
  } catch (error) {
    throw new Error(
      `Failed to initialize NileDB client: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Get or create NileDB client instance (singleton)
 */
export const getNileClient = (): Server => {
  if (!nileInstance) {
    nileInstance = initializeNileClient();
  }
  return nileInstance;
};

/**
 * Reset client instance (useful for testing or configuration changes)
 */
export const resetNileClient = (): void => {
  nileInstance = null;
};

/**
 * Create a new NileDB client instance (non-singleton)
 */
export const createNileClient = (customConfig?: Partial<NileConfig>): Server => {
  const config = customConfig ? { ...getNileConfig(), ...customConfig } : getNileConfig();
  
  const nileConfig = {
    databaseId: config.databaseId,
    databaseName: config.databaseName,
    user: config.user,
    password: config.password,
    apiUrl: config.apiUrl,
    origin: config.origin,
    debug: config.debug,
    secureCookies: config.secureCookies,
    db: {
      host: extractHostFromPostgresUrl(config.postgresUrl),
      port: extractPortFromPostgresUrl(config.postgresUrl),
      database: config.databaseName,
      user: config.user,
      password: config.password,
      max: config.connectionPool.max,
      idleTimeoutMillis: config.connectionPool.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionPool.connectionTimeoutMillis,
    },
  };

  return Nile(nileConfig);
};

/**
 * Create NileDB client with tenant context
 */
export const createNileClientWithContext = async (tenantId: string): Promise<Server> => {
  const client = getNileClient();
  return await client.withContext({ tenantId });
};

/**
 * Utility function to execute operations with tenant context
 */
export const withTenantContext = async <T>(
  tenantId: string,
  callback: (nile: Server) => Promise<T>
): Promise<T> => {
  const client = getNileClient();
  return await client.withContext({ tenantId }, callback);
};

/**
 * Utility function to execute operations without tenant context (cross-tenant)
 */
export const withoutTenantContext = async <T>(
  callback: (nile: Server) => Promise<T>
): Promise<T> => {
  const client = getNileClient();
  return await callback(client);
};

/**
 * Helper functions to extract connection details from Postgres URL
 */
function extractHostFromPostgresUrl(postgresUrl: string): string {
  try {
    const url = new URL(postgresUrl);
    return url.hostname;
  } catch {
    return 'localhost';
  }
}

function extractPortFromPostgresUrl(postgresUrl: string): number {
  try {
    const url = new URL(postgresUrl);
    return parseInt(url.port) || 5432;
  } catch {
    return 5432;
  }
}

/**
 * Test the client connection
 */
export const testNileConnection = async (): Promise<{
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}> => {
  try {
    const client = getNileClient();
    const result = await client.db.query('SELECT 1 as test, current_timestamp as timestamp');
    
    return {
      success: true,
      details: {
        query: 'SELECT 1 as test, current_timestamp as timestamp',
        result: result.rows[0],
        rowCount: result.rows.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get client configuration info (without sensitive data)
 */
export const getClientInfo = (): {
  databaseId: string;
  databaseName: string;
  environment: string;
  origin: string;
  debug: boolean;
  secureCookies: boolean;
} => {
  const config = getNileConfig();
  
  return {
    databaseId: config.databaseId,
    databaseName: config.databaseName,
    environment: config.nodeEnv,
    origin: config.origin,
    debug: config.debug,
    secureCookies: config.secureCookies,
  };
};

// Export types for use in other modules
export type { Server } from '@niledatabase/server';
