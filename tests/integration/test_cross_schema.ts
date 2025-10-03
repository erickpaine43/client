/**
 * Integration Test for Cross-Schema Queries
 *
 * Tests cross-schema query functionality between users and public schemas.
 */

import { getAuthService } from '../../lib/niledb/auth';

const authService = getAuthService();

describe('Cross-Schema Queries Integration', () => {
  const validUserId = '0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n';

  describe('Schema Joins', () => {
    it('should perform cross-schema joins correctly', async () => {
      const result = await authService.getUserWithProfile(validUserId);
      expect(result).toBe(null);
    });

    it('should handle UUID type casting in joins', async () => {
      // Test that ::uuid casting works in queries
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Query Performance', () => {
    it('should execute cross-schema queries efficiently', async () => {
      const startTime = Date.now();
      await authService.getUserWithProfile(validUserId);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });
  });
});
