/**
 * NileDB Configuration Tests
 */

import { 
  createNileConfig, 
  validateEnvironmentVariables, 
  getConfigForEnvironment,
  resetConfigInstance 
} from '../config';

// Mock environment variables for testing
const mockEnvVars = {
  NILEDB_USER: 'test-user-id',
  NILEDB_PASSWORD: 'test-password',
  NILEDB_API_URL: 'https://us-west-2.api.thenile.dev/v2/databases/test-db-id',
  NILEDB_POSTGRES_URL: 'postgres://us-west-2.db.thenile.dev:5432/test_db',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
};

describe('NileDB Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset config instance before each test
    resetConfigInstance();
    
    // Set up clean environment
    Object.assign(process.env, mockEnvVars);
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateEnvironmentVariables', () => {
    it('should validate when all required variables are present', () => {
      const result = validateEnvironmentVariables();
      
      expect(result.isValid).toBe(true);
      expect(result.missingVars).toHaveLength(0);
    });

    it('should identify missing variables', () => {
      delete process.env.NILEDB_USER;
      delete process.env.NILEDB_PASSWORD;
      
      const result = validateEnvironmentVariables();
      
      expect(result.isValid).toBe(false);
      expect(result.missingVars).toContain('NILEDB_USER');
      expect(result.missingVars).toContain('NILEDB_PASSWORD');
    });
  });

  describe('createNileConfig', () => {
    it('should create valid configuration from environment variables', () => {
      const config = createNileConfig();
      
      expect(config.databaseId).toBe('test-db-id');
      expect(config.databaseName).toBe('test_db');
      expect(config.user).toBe('test-user-id');
      expect(config.password).toBe('test-password');
      expect(config.apiUrl).toBe('https://us-west-2.api.thenile.dev/v2/databases/test-db-id');
      expect(config.postgresUrl).toBe('postgres://us-west-2.db.thenile.dev:5432/test_db');
      expect(config.origin).toBe('http://localhost:3000');
      expect(config.nodeEnv).toBe('development');
      expect(config.debug).toBe(true);
      expect(config.secureCookies).toBe(false);
    });

    it('should throw error when required variables are missing', () => {
      delete process.env.NILEDB_USER;
      
      expect(() => createNileConfig()).toThrow(/NileDB configuration validation failed/);
    });

    it('should extract database ID from API URL', () => {
      const config = createNileConfig();
      expect(config.databaseId).toBe('test-db-id');
    });

    it('should extract database name from Postgres URL', () => {
      const config = createNileConfig();
      expect(config.databaseName).toBe('test_db');
    });
  });

  describe('getConfigForEnvironment', () => {
    it('should return development configuration', () => {
      const config = getConfigForEnvironment('development');
      
      expect(config.debug).toBe(true);
      expect(config.secureCookies).toBe(false);
      expect(config.connectionPool?.max).toBe(5);
    });

    it('should return staging configuration', () => {
      const config = getConfigForEnvironment('staging');
      
      expect(config.debug).toBe(true);
      expect(config.secureCookies).toBe(true);
      expect(config.connectionPool?.max).toBe(8);
    });

    it('should return production configuration', () => {
      const config = getConfigForEnvironment('production');
      
      expect(config.debug).toBe(false);
      expect(config.secureCookies).toBe(true);
      expect(config.connectionPool?.max).toBe(20);
    });
  });

  describe('URL parsing', () => {
    it('should handle different API URL formats', () => {
      process.env.NILEDB_API_URL = 'https://us-east-1.api.thenile.dev/v2/databases/different-id';
      
      const config = createNileConfig();
      expect(config.databaseId).toBe('different-id');
    });

    it('should handle different Postgres URL formats', () => {
      process.env.NILEDB_POSTGRES_URL = 'postgres://us-east-1.db.thenile.dev:5432/different_db_name';
      
      const config = createNileConfig();
      expect(config.databaseName).toBe('different_db_name');
    });

    it('should handle Postgres URL with query parameters', () => {
      process.env.NILEDB_POSTGRES_URL = 'postgres://us-west-2.db.thenile.dev:5432/test_db?sslmode=require';
      
      const config = createNileConfig();
      expect(config.databaseName).toBe('test_db');
    });
  });
});
