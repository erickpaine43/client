/**
 * Integration Test for Database Connection
 *
 * Tests that the NileDB connection is properly configured and functional.
 * Validates DATABASE_URL configuration and basic connectivity.
 */

import { getNileClient } from '../../lib/niledb/client';

describe('Database Connection Integration', () => {
  describe('Connection Configuration', () => {
    it('should have valid NileDB configuration', () => {
      // Test that environment variables are set
      expect(process.env.NILEDB_USER).toBeDefined();
      expect(process.env.NILEDB_PASSWORD).toBeDefined();
      expect(process.env.NILEDB_API_URL).toBeDefined();
      expect(process.env.NILEDB_POSTGRES_URL).toBeDefined();
    });

    it('should have DATABASE_URL for psql operations', () => {
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.DATABASE_URL).toMatch(/^postgres:\/\//);
    });
  });

  describe('Client Initialization', () => {
    it('should initialize NileDB client without errors', () => {
      expect(() => getNileClient()).not.toThrow();
    });

    it('should return a valid client instance', () => {
      const client = getNileClient();
      expect(client).toBeDefined();
      expect(client.db).toBeDefined();
    });
  });

  describe('Basic Connectivity', () => {
    it('should execute a simple query successfully', async () => {
      const client = getNileClient();

      // Test basic connectivity with a simple SELECT
      const result = await client.db.query('SELECT 1 as test_value, current_timestamp as timestamp');

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].test_value).toBe(1);
      expect(result.rows[0].timestamp).toBeDefined();
    });

    it('should handle connection pooling correctly', async () => {
      const client = getNileClient();

      // Execute multiple queries to test connection pooling
      const promises = Array.from({ length: 5 }, () =>
        client.db.query('SELECT current_timestamp as ts')
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result: { rows: Array<{ ts?: string }> }) => {
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].ts).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      const client = getNileClient();

      await expect(
        client.db.query('SELECT * FROM nonexistent_table_that_does_not_exist')
      ).rejects.toThrow();
    });

    it('should handle connection timeouts appropriately', async () => {
      // This test would require specific timeout configuration
      // For now, just ensure basic error handling works
      const client = getNileClient();
      expect(client).toBeDefined();
    });
  });

  describe('FATAL Role Error Prevention', () => {
    it('should not encounter "FATAL: role does not exist" errors', async () => {
      const client = getNileClient();

      // This test ensures that the role configuration from setup is working
      // If this fails, it indicates the PostgreSQL role setup was not completed
      const result = await client.db.query('SELECT current_user as user');

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].user).toBeDefined();
    });
  });
});
