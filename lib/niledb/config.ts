/**
 * NileDB Configuration
 * 
 * Comprehensive configuration for NileDB integration with environment-specific settings,
 * connection validation, and health checks.
 */

import { z } from 'zod';

// Environment validation schema
const NileConfigSchema = z.object({
  // Database Configuration
  databaseId: z.string().min(1, 'Database ID is required'),
  databaseName: z.string().min(1, 'Database name is required'),
  user: z.string().min(1, 'Database user is required'),
  password: z.string().min(1, 'Database password is required'),
  
  // API Configuration
  apiUrl: z.string().url('API URL must be a valid URL'),
  postgresUrl: z.string().url('Postgres URL must be a valid URL'),
  
  // Application Configuration
  origin: z.string().url('Origin must be a valid URL'),
  debug: z.boolean().default(false),
  secureCookies: z.boolean().default(true),
  
  // Environment
  nodeEnv: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  
  // Optional Configuration
  routePrefix: z.string().default('/api'),
  sessionTimeout: z.number().default(24 * 60 * 60 * 1000), // 24 hours in ms
  
  // Database Connection Pool Settings
  connectionPool: z.object({
    max: z.number().default(10),
    idleTimeoutMillis: z.number().default(10000),
    connectionTimeoutMillis: z.number().default(5000),
  }).default({
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  }),
});

export type NileConfig = z.infer<typeof NileConfigSchema>;

/**
 * Environment-specific configuration
 */
const getEnvironmentConfig = (): Partial<NileConfig> => {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production' | 'test';
  
  const baseConfig = {
    nodeEnv,
    debug: nodeEnv === 'development',
    secureCookies: nodeEnv === 'production',
  };

  switch (nodeEnv) {
    case 'development':
      return {
        ...baseConfig,
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        debug: true,
        secureCookies: false,
        connectionPool: {
          max: 5,
          idleTimeoutMillis: 5000,
          connectionTimeoutMillis: 3000,
        },
      };
      
    case 'staging':
      return {
        ...baseConfig,
        origin: process.env.NEXT_PUBLIC_APP_URL || 'https://staging.penguinmails.com',
        debug: true,
        secureCookies: true,
        connectionPool: {
          max: 8,
          idleTimeoutMillis: 8000,
          connectionTimeoutMillis: 4000,
        },
      };
      
    case 'production':
      return {
        ...baseConfig,
        origin: process.env.NEXT_PUBLIC_APP_URL || 'https://penguinmails.com',
        debug: false,
        secureCookies: true,
        connectionPool: {
          max: 20,
          idleTimeoutMillis: 15000,
          connectionTimeoutMillis: 5000,
        },
      };
      
    case 'test':
      return {
        ...baseConfig,
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        debug: false,
        secureCookies: false,
        connectionPool: {
          max: 2,
          idleTimeoutMillis: 1000,
          connectionTimeoutMillis: 2000,
        },
      };
      
    default:
      return baseConfig;
  }
};

/**
 * Parse and validate NileDB configuration from environment variables
 */
export const createNileConfig = (): NileConfig => {
  const envConfig = getEnvironmentConfig();
  
  const rawConfig = {
    // Database Configuration
    databaseId: extractDatabaseIdFromUrl(process.env.NILEDB_API_URL || ''),
    databaseName: extractDatabaseNameFromUrl(process.env.NILEDB_POSTGRES_URL || ''),
    user: process.env.NILEDB_USER || '',
    password: process.env.NILEDB_PASSWORD || '',
    
    // API Configuration
    apiUrl: process.env.NILEDB_API_URL || '',
    postgresUrl: process.env.NILEDB_POSTGRES_URL || '',
    
    // Merge with environment-specific config
    ...envConfig,
  };

  try {
    return NileConfigSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `NileDB configuration validation failed:\n${missingFields.join('\n')}\n\n` +
        'Please check your environment variables. Required variables:\n' +
        '- NILEDB_USER\n' +
        '- NILEDB_PASSWORD\n' +
        '- NILEDB_API_URL\n' +
        '- NILEDB_POSTGRES_URL\n' +
        '- NEXT_PUBLIC_APP_URL'
      );
    }
    throw error;
  }
};

/**
 * Extract database ID from NileDB API URL
 */
function extractDatabaseIdFromUrl(apiUrl: string): string {
  if (!apiUrl) return '';
  
  // Extract from URL like: https://us-west-2.api.thenile.dev/v2/databases/01988a31-7e7a-7bc7-a089-92bc09d501d4
  const match = apiUrl.match(/\/databases\/([a-zA-Z0-9-]+)(?:\/|$)/);
  return match ? match[1] : '';
}

/**
 * Extract database name from Postgres URL
 */
function extractDatabaseNameFromUrl(postgresUrl: string): string {
  if (!postgresUrl) return '';
  
  // Extract from URL like: postgres://us-west-2.db.thenile.dev:5432/penguinmails_dev
  try {
    const url = new URL(postgresUrl);
    return url.pathname.substring(1); // Remove leading slash
  } catch {
    // Fallback to regex if URL parsing fails
    const match = postgresUrl.match(/\/([^/?]+)(?:\?|$)/);
    return match ? match[1] : '';
  }
}

/**
 * Validate required environment variables are present
 */
export const validateEnvironmentVariables = (): { isValid: boolean; missingVars: string[] } => {
  const requiredVars = [
    'NILEDB_USER',
    'NILEDB_PASSWORD', 
    'NILEDB_API_URL',
    'NILEDB_POSTGRES_URL',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
};

/**
 * Get configuration for specific environment
 */
export const getConfigForEnvironment = (env: 'development' | 'staging' | 'production'): Partial<NileConfig> => {
  // Create a temporary environment context without modifying the global process.env
  const tempEnv = { ...process.env, NODE_ENV: env };
  const originalProcessEnv = process.env;
  
  try {
    // Temporarily override process.env for configuration testing
    (process.env as unknown) = tempEnv;
    const config = getEnvironmentConfig();
    return config;
  } finally {
    // Restore original environment
    process.env = originalProcessEnv;
  }
};

// Export singleton config instance
let configInstance: NileConfig | null = null;

export const getNileConfig = (): NileConfig => {
  if (!configInstance) {
    configInstance = createNileConfig();
  }
  return configInstance;
};

// Reset config instance (useful for testing)
export const resetConfigInstance = (): void => {
  configInstance = null;
};
