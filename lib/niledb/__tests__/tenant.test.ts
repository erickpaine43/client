/**
 * TenantService Unit Tests
 * 
 * Comprehensive test suite for the TenantService class covering all tenant
 * management operations, access control, and error handling scenarios.
 */

import { TenantService, TenantError, TenantAccessError, TenantNotFoundError } from '../tenant';
import type { Server } from '@niledatabase/server';
import {
  createTestNileClient,
  cleanupTestData,
  createTestTenant,
  createTestUserProfile,
  createTestCompany,
  addUserToCompany,
  createTestSetup,
  expectToThrow,
  setupTestEnvironment,
  restoreEnvironment,
} from './test-utils';

describe('TenantService', () => {
  let testNile: Server;
  let tenantService: TenantService;

  beforeAll(() => {
    setupTestEnvironment();
  });

  afterAll(() => {
    restoreEnvironment();
  });

  beforeEach(() => {
    testNile = createTestNileClient();
    tenantService = new TenantService(testNile);
  });

  afterEach(async () => {
    await cleanupTestData(testNile);
  });

  describe('getTenantById', () => {
    it('should retrieve tenant by ID', async () => {
      const testTenant = await createTestTenant(testNile, 'Test Tenant');

      const result = await tenantService.getTenantById(testTenant.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testTenant.id);
      expect(result?.name).toBe('Test Tenant');
      expect(result?.created).toBeDefined();
    });

    it('should return null for non-existent tenant', async () => {
      const result = await tenantService.getTenantById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalQuery = testNile.db.query;
      testNile.db.query = jest.fn().mockRejectedValue(new Error('Database error'));

      await expectToThrow(
        () => tenantService.getTenantById('test-id'),
        TenantError,
        'Failed to retrieve tenant'
      );

      testNile.db.query = originalQuery;
    });
  });

  describe('getUserTenants', () => {
    it('should retrieve all tenants for a user', async () => {
      const { user, tenant, company } = await createTestSetup(testNile, 'admin');

      const result = await tenantService.getUserTenants(user.id);

      expect(result).toHaveLength(1);
      expect(result[0].tenant.id).toBe(tenant.id);
      expect(result[0].tenant.name).toBe(tenant.name);
      expect(result[0].companies).toHaveLength(1);
      expect(result[0].companies[0].id).toBe(company.id);
      expect(result[0].companies[0].role).toBe('admin');
    });

    it('should return empty array for user with no tenants', async () => {
      // Create user without tenant membership
      const userResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`test-user-${Date.now()}`, `test-${Date.now()}@example.com`]
      );
      const userId = userResult.rows[0].id;

      const result = await tenantService.getUserTenants(userId);

      expect(result).toHaveLength(0);
    });

    it('should group companies by tenant correctly', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'owner');

      // Create additional company in same tenant
      const company2 = await createTestCompany(testNile, tenant.id, 'Second Company');
      await addUserToCompany(testNile, user.id, company2.id, tenant.id, 'member');

      const result = await tenantService.getUserTenants(user.id);

      expect(result).toHaveLength(1);
      expect(result[0].companies).toHaveLength(2);
      
      const roles = result[0].companies.map(c => c.role);
      expect(roles).toContain('owner');
      expect(roles).toContain('member');
    });
  });

  describe('createTenant', () => {
    it('should create a new tenant', async () => {
      const result = await tenantService.createTenant('New Tenant');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Tenant');
      expect(result.id).toBeDefined();
      expect(result.created).toBeDefined();
    });

    it('should create tenant with creator as owner', async () => {
      const userResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id, email`,
        [`creator-${Date.now()}`, `creator-${Date.now()}@example.com`]
      );
      const creator = userResult.rows[0];

      const result = await tenantService.createTenant('New Tenant', creator.id);

      expect(result).toBeDefined();

      // Verify user was added to tenant
      const tenantUsers = await tenantService.getTenantUsers(result.id);
      expect(tenantUsers).toHaveLength(1);
      expect(tenantUsers[0].userId).toBe(creator.id);
      expect(tenantUsers[0].roles).toContain('owner');
    });

    it('should create tenant with billing settings', async () => {
      const result = await tenantService.createTenant('Premium Tenant', undefined, {
        subscriptionPlan: 'premium',
        billingStatus: 'active',
      });

      expect(result).toBeDefined();

      // Verify billing settings were created
      const billingResult = await testNile.db.query(
        `SELECT * FROM public.tenant_billing WHERE tenant_id = $1`,
        [result.id]
      );

      expect(billingResult.rows).toHaveLength(1);
      expect(billingResult.rows[0].plan).toBe('premium');
      expect(billingResult.rows[0].subscription_status).toBe('active');
    });
  });

  describe('updateTenant', () => {
    it('should update tenant name', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'admin');

      const result = await tenantService.updateTenant(
        tenant.id,
        { name: 'Updated Tenant Name' },
        user.id
      );

      expect(result.name).toBe('Updated Tenant Name');
      expect(result.updated).toBeDefined();
    });

    it('should update tenant billing settings', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'owner');

      await tenantService.updateTenant(
        tenant.id,
        {
          subscriptionPlan: 'enterprise',
          billingStatus: 'active',
        },
        user.id
      );

      // Verify billing was updated
      const billingResult = await testNile.db.query(
        `SELECT * FROM public.tenant_billing WHERE tenant_id = $1`,
        [tenant.id]
      );

      expect(billingResult.rows[0].plan).toBe('enterprise');
      expect(billingResult.rows[0].subscription_status).toBe('active');
    });

    it('should reject update from user without access', async () => {
      const { tenant } = await createTestSetup(testNile, 'member');
      
      // Create different user without access
      const userResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`other-user-${Date.now()}`, `other-${Date.now()}@example.com`]
      );
      const otherUserId = userResult.rows[0].id;

      await expectToThrow(
        () => tenantService.updateTenant(
          tenant.id,
          { name: 'Hacked Name' },
          otherUserId
        ),
        TenantAccessError,
        'Insufficient permissions to update tenant'
      );
    });

    it('should throw error for non-existent tenant', async () => {
      const { user } = await createTestSetup(testNile, 'owner');

      await expectToThrow(
        () => tenantService.updateTenant(
          'non-existent-id',
          { name: 'New Name' },
          user.id
        ),
        TenantNotFoundError
      );
    });
  });

  describe('addUserToTenant', () => {
    it('should add user to tenant with default member role', async () => {
      const { user: adminUser, tenant } = await createTestSetup(testNile, 'admin');
      
      // Create new user to add
      const newUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id, email`,
        [`new-user-${Date.now()}`, `new-${Date.now()}@example.com`]
      );
      const newUser = newUserResult.rows[0];

      await tenantService.addUserToTenant(
        newUser.id,
        tenant.id,
        ['member'],
        adminUser.id
      );

      const tenantUsers = await tenantService.getTenantUsers(tenant.id);
      const addedUser = tenantUsers.find(u => u.userId === newUser.id);

      expect(addedUser).toBeDefined();
      expect(addedUser?.roles).toContain('member');
      expect(addedUser?.email).toBe(newUser.email);
    });

    it('should add user with custom roles', async () => {
      const { user: adminUser, tenant } = await createTestSetup(testNile, 'admin');
      
      const newUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id, email`,
        [`new-user-${Date.now()}`, `new-${Date.now()}@example.com`]
      );
      const newUser = newUserResult.rows[0];

      await tenantService.addUserToTenant(
        newUser.id,
        tenant.id,
        ['admin', 'billing'],
        adminUser.id
      );

      const tenantUsers = await tenantService.getTenantUsers(tenant.id);
      const addedUser = tenantUsers.find(u => u.userId === newUser.id);

      expect(addedUser?.roles).toEqual(['admin', 'billing']);
    });

    it('should reject addition by user without admin access', async () => {
      const { user: memberUser, tenant } = await createTestSetup(testNile, 'member');
      
      const newUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`new-user-${Date.now()}`, `new-${Date.now()}@example.com`]
      );
      const newUser = newUserResult.rows[0];

      await expectToThrow(
        () => tenantService.addUserToTenant(
          newUser.id,
          tenant.id,
          ['member'],
          memberUser.id
        ),
        TenantAccessError,
        'Insufficient permissions to add users'
      );
    });

    it('should throw error for non-existent user', async () => {
      const { user: adminUser, tenant } = await createTestSetup(testNile, 'admin');

      await expectToThrow(
        () => tenantService.addUserToTenant(
          'non-existent-user',
          tenant.id,
          ['member'],
          adminUser.id
        ),
        TenantError,
        'User not found'
      );
    });

    it('should throw error for non-existent tenant', async () => {
      const { user: adminUser } = await createTestSetup(testNile, 'admin');
      
      const newUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`new-user-${Date.now()}`, `new-${Date.now()}@example.com`]
      );
      const newUser = newUserResult.rows[0];

      await expectToThrow(
        () => tenantService.addUserToTenant(
          newUser.id,
          'non-existent-tenant',
          ['member'],
          adminUser.id
        ),
        TenantNotFoundError
      );
    });
  });

  describe('removeUserFromTenant', () => {
    it('should remove user from tenant', async () => {
      const { user: adminUser, tenant } = await createTestSetup(testNile, 'admin');
      
      // Add another user to remove
      const newUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id, email`,
        [`remove-user-${Date.now()}`, `remove-${Date.now()}@example.com`]
      );
      const newUser = newUserResult.rows[0];

      await tenantService.addUserToTenant(newUser.id, tenant.id, ['member'], adminUser.id);

      // Verify user was added
      let tenantUsers = await tenantService.getTenantUsers(tenant.id);
      expect(tenantUsers.find(u => u.userId === newUser.id)).toBeDefined();

      // Remove user
      await tenantService.removeUserFromTenant(newUser.id, tenant.id, adminUser.id);

      // Verify user was removed
      tenantUsers = await tenantService.getTenantUsers(tenant.id);
      expect(tenantUsers.find(u => u.userId === newUser.id)).toBeUndefined();
    });

    it('should prevent only owner from removing themselves', async () => {
      const { user: ownerUser, tenant } = await createTestSetup(testNile, 'owner');

      await expectToThrow(
        () => tenantService.removeUserFromTenant(ownerUser.id, tenant.id, ownerUser.id),
        TenantError,
        'Cannot remove yourself as the only tenant owner'
      );
    });

    it('should allow owner to remove themselves if other owners exist', async () => {
      const { user: ownerUser, tenant, company } = await createTestSetup(testNile, 'owner');
      
      // Add another owner
      const newOwnerResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id, email`,
        [`new-owner-${Date.now()}`, `new-owner-${Date.now()}@example.com`]
      );
      const newOwner = newOwnerResult.rows[0];

      await tenantService.addUserToTenant(newOwner.id, tenant.id, ['owner'], ownerUser.id);
      await addUserToCompany(testNile, newOwner.id, company.id, tenant.id, 'owner');

      // Now original owner should be able to remove themselves
      await tenantService.removeUserFromTenant(ownerUser.id, tenant.id, ownerUser.id);

      const tenantUsers = await tenantService.getTenantUsers(tenant.id);
      expect(tenantUsers.find(u => u.userId === ownerUser.id)).toBeUndefined();
    });

    it('should reject removal by user without admin access', async () => {
      const { user: memberUser, tenant } = await createTestSetup(testNile, 'member');
      
      const targetUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`target-user-${Date.now()}`, `target-${Date.now()}@example.com`]
      );
      const targetUser = targetUserResult.rows[0];

      await expectToThrow(
        () => tenantService.removeUserFromTenant(targetUser.id, tenant.id, memberUser.id),
        TenantAccessError,
        'Insufficient permissions to remove users'
      );
    });
  });

  describe('updateUserTenantRoles', () => {
    it('should update user roles in tenant', async () => {
      const { user: adminUser, tenant } = await createTestSetup(testNile, 'admin');
      
      // Add user with member role
      const newUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id, email`,
        [`role-user-${Date.now()}`, `role-${Date.now()}@example.com`]
      );
      const newUser = newUserResult.rows[0];

      await tenantService.addUserToTenant(newUser.id, tenant.id, ['member'], adminUser.id);

      // Update to admin role
      await tenantService.updateUserTenantRoles(
        newUser.id,
        tenant.id,
        ['admin', 'billing'],
        adminUser.id
      );

      const tenantUsers = await tenantService.getTenantUsers(tenant.id);
      const updatedUser = tenantUsers.find(u => u.userId === newUser.id);

      expect(updatedUser?.roles).toEqual(['admin', 'billing']);
    });

    it('should reject role update by user without admin access', async () => {
      const { user: memberUser, tenant } = await createTestSetup(testNile, 'member');

      await expectToThrow(
        () => tenantService.updateUserTenantRoles(
          memberUser.id,
          tenant.id,
          ['admin'],
          memberUser.id
        ),
        TenantAccessError,
        'Insufficient permissions to update user roles'
      );
    });

    it('should throw error for non-member user', async () => {
      const { user: adminUser, tenant } = await createTestSetup(testNile, 'admin');
      
      const nonMemberResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`non-member-${Date.now()}`, `non-member-${Date.now()}@example.com`]
      );
      const nonMember = nonMemberResult.rows[0];

      await expectToThrow(
        () => tenantService.updateUserTenantRoles(
          nonMember.id,
          tenant.id,
          ['admin'],
          adminUser.id
        ),
        TenantError,
        'User is not a member of this tenant'
      );
    });
  });

  describe('validateTenantAccess', () => {
    it('should validate member access', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'member');

      const hasAccess = await tenantService.validateTenantAccess(user.id, tenant.id, 'member');

      expect(hasAccess).toBe(true);
    });

    it('should validate admin access', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'admin');

      const hasAccess = await tenantService.validateTenantAccess(user.id, tenant.id, 'admin');

      expect(hasAccess).toBe(true);
    });

    it('should validate owner access', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'owner');

      const hasAccess = await tenantService.validateTenantAccess(user.id, tenant.id, 'owner');

      expect(hasAccess).toBe(true);
    });

    it('should reject insufficient role', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'member');

      const hasAccess = await tenantService.validateTenantAccess(user.id, tenant.id, 'admin');

      expect(hasAccess).toBe(false);
    });

    it('should allow staff access to any tenant', async () => {
      const { tenant } = await createTestSetup(testNile, 'member');
      
      // Create staff user not in tenant
      const staffUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`staff-user-${Date.now()}`, `staff-${Date.now()}@example.com`]
      );
      const staffUser = staffUserResult.rows[0];

      await createTestUserProfile(testNile, staffUser.id, {
        role: 'admin',
        is_penguinmails_staff: true,
      });

      const hasAccess = await tenantService.validateTenantAccess(staffUser.id, tenant.id, 'owner');

      expect(hasAccess).toBe(true);
    });

    it('should reject access for non-member', async () => {
      const { tenant } = await createTestSetup(testNile, 'member');
      
      const nonMemberResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`non-member-${Date.now()}`, `non-member-${Date.now()}@example.com`]
      );
      const nonMember = nonMemberResult.rows[0];

      const hasAccess = await tenantService.validateTenantAccess(nonMember.id, tenant.id);

      expect(hasAccess).toBe(false);
    });
  });

  describe('getTenantStatistics', () => {
    it('should return tenant statistics for admin user', async () => {
      const { user: adminUser, tenant } = await createTestSetup(testNile, 'admin');
      
      // Add another user and company
      const newUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id, email`,
        [`stats-user-${Date.now()}`, `stats-${Date.now()}@example.com`]
      );
      const newUser = newUserResult.rows[0];

      await tenantService.addUserToTenant(newUser.id, tenant.id, ['member'], adminUser.id);
      await createTestCompany(testNile, tenant.id, 'Second Company');

      const stats = await tenantService.getTenantStatistics(tenant.id, adminUser.id);

      expect(stats.userCount).toBe(2);
      expect(stats.companyCount).toBe(2);
      expect(stats.billingStatus).toBeDefined();
      expect(stats.subscriptionPlan).toBeDefined();
      expect(stats.createdAt).toBeInstanceOf(Date);
    });

    it('should return statistics for staff user', async () => {
      const { tenant } = await createTestSetup(testNile, 'member');
      
      // Create staff user
      const staffUserResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id`,
        [`staff-stats-${Date.now()}`, `staff-stats-${Date.now()}@example.com`]
      );
      const staffUser = staffUserResult.rows[0];

      await createTestUserProfile(testNile, staffUser.id, {
        role: 'admin',
        is_penguinmails_staff: true,
      });

      const stats = await tenantService.getTenantStatistics(tenant.id, staffUser.id);

      expect(stats).toBeDefined();
      expect(stats.userCount).toBeGreaterThanOrEqual(1);
      expect(stats.companyCount).toBeGreaterThanOrEqual(1);
    });

    it('should reject statistics request from member user', async () => {
      const { user: memberUser, tenant } = await createTestSetup(testNile, 'member');

      await expectToThrow(
        () => tenantService.getTenantStatistics(tenant.id, memberUser.id),
        TenantAccessError,
        'Insufficient permissions to view tenant statistics'
      );
    });

    it('should throw error for non-existent tenant', async () => {
      const { user: adminUser } = await createTestSetup(testNile, 'admin');

      await expectToThrow(
        () => tenantService.getTenantStatistics('non-existent-tenant', adminUser.id),
        TenantNotFoundError
      );
    });
  });

  describe('isOnlyTenantOwner', () => {
    it('should return true for only owner', async () => {
      const { user: ownerUser, tenant } = await createTestSetup(testNile, 'owner');

      const isOnly = await tenantService.isOnlyTenantOwner(ownerUser.id, tenant.id);

      expect(isOnly).toBe(true);
    });

    it('should return false when multiple owners exist', async () => {
      const { user: ownerUser, tenant, company } = await createTestSetup(testNile, 'owner');
      
      // Add another owner
      const newOwnerResult = await testNile.db.query(
        `INSERT INTO users.users (id, email) VALUES ($1, $2) RETURNING id, email`,
        [`second-owner-${Date.now()}`, `second-owner-${Date.now()}@example.com`]
      );
      const newOwner = newOwnerResult.rows[0];

      await tenantService.addUserToTenant(newOwner.id, tenant.id, ['owner'], ownerUser.id);
      await addUserToCompany(testNile, newOwner.id, company.id, tenant.id, 'owner');

      const isOnly = await tenantService.isOnlyTenantOwner(ownerUser.id, tenant.id);

      expect(isOnly).toBe(false);
    });

    it('should return false for non-owner user', async () => {
      const { user: memberUser, tenant } = await createTestSetup(testNile, 'member');

      const isOnly = await tenantService.isOnlyTenantOwner(memberUser.id, tenant.id);

      expect(isOnly).toBe(false);
    });
  });

  describe('context helpers', () => {
    it('should execute operations with tenant context', async () => {
      const { tenant } = await createTestSetup(testNile, 'member');

      const result = await tenantService.withTenantContext(tenant.id, async (nile) => {
        const queryResult = await nile.db.query('SELECT 1 as test');
        return queryResult.rows[0].test;
      });

      expect(result).toBe(1);
    });

    it('should execute operations without tenant context', async () => {
      const result = await tenantService.withoutTenantContext(async (nile) => {
        const queryResult = await nile.db.query('SELECT 2 as test');
        return queryResult.rows[0].test;
      });

      expect(result).toBe(2);
    });
  });
});
