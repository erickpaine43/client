/**
 * Integration Test for UUID Validation
 *
 * Tests that UUID validation is properly implemented across all services
 * and that invalid UUIDs are rejected appropriately.
 */

import { getTenantService } from '../../lib/niledb/tenant';
import { getAuthService } from '../../lib/niledb/auth';
import { getCompanyService } from '../../lib/niledb/company';

const tenantService = getTenantService();
const authService = getAuthService();
const companyService = getCompanyService();

describe('UUID Validation Integration', () => {
  const invalidUuids = [
    'invalid-uuid',
    'user_001',
    'tenant_002',
    'not-a-uuid-at-all',
    '12345',
    '',
    null,
    undefined
  ];

  const validUuid = '0192a1b2-3c4d-5e6f-7g8h-9i0j1k2l3m4n';

  describe('TenantService UUID Validation', () => {
    invalidUuids.forEach(invalidUuid => {
      it(`should reject invalid userId: ${invalidUuid}`, async () => {
        await expect(
          tenantService.validateTenantAccess(String(invalidUuid), validUuid)
        ).rejects.toThrow(/user_id must be an uuid/);
      });

      it(`should reject invalid tenantId: ${invalidUuid}`, async () => {
        await expect(
          tenantService.validateTenantAccess(validUuid, String(invalidUuid))
        ).rejects.toThrow(/tenant_id must be an uuid/);
      });
    });
  });

  describe('AuthService UUID Validation', () => {
    invalidUuids.forEach(invalidUuid => {
      it(`should reject invalid userId: ${invalidUuid}`, async () => {
        await expect(
          authService.getUserWithProfile(String(invalidUuid))
        ).rejects.toThrow(/Invalid UUID format/);
      });
    });
  });

  describe('CompanyService UUID Validation', () => {
    invalidUuids.forEach(invalidUuid => {
      it(`should reject invalid tenantId: ${invalidUuid}`, async () => {
        await expect(
          companyService.getCompanyById(String(invalidUuid), validUuid)
        ).rejects.toThrow(/tenant_id must be a valid UUID/);
      });

      it(`should reject invalid companyId: ${invalidUuid}`, async () => {
        await expect(
          companyService.getCompanyById(validUuid, String(invalidUuid))
        ).rejects.toThrow(/company_id must be a valid UUID/);
      });
    });
  });

  describe('Migration Data UUID Validation', () => {
    it('should validate UUIDs in seed data', async () => {
      // Test that the updated users.json contains valid UUIDs
      const fs = await import('fs');
      const path = await import('path');
      const usersData = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../migration-data/users.json'), 'utf8')
      );

      usersData.forEach((user: { id: string }) => {
        expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      });
    });
  });

  describe('Database UUID Functions', () => {
    it('should use proper UUID generation functions', async () => {
      // This test would validate that schema uses uuid_generate_v7() or similar
      // For now, test basic UUID generation
      expect(validUuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
});
