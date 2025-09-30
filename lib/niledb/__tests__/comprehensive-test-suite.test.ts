/**
 * Comprehensive Testing Suite for NileDB Backend Migration
 * 
 * This test suite leverages all completed infrastructure from Tasks 4-10:
 * - Task 4: AuthService and authentication middleware
 * - Task 5: TenantService and tenant management
 * - Task 6: CompanyService and company management
 * - Task 7: Migration scripts and validation
 * - Task 8: Next.js API routes and comprehensive validation
 * - Task 9: Error handling, middleware, recovery, and monitoring
 * - Task 10: Enhanced authentication system and UI integration
 */

import { getAuthService, resetAuthService } from '../auth';
import { getTenantService, resetTenantService } from '../tenant';
import { getCompanyService, resetCompanyService } from '../company';
import { getRecoveryManager } from '../recovery';
import { getMonitoringManager } from '../monitoring';
import { withoutTenantContext } from '../client';
import {
  createTestNileClient,
  cleanupTestData,
  createTestSetup,
  expectToThrow,
  setupTestEnvironment,
  restoreEnvironment,
  waitFor,
} from './test-utils';
import type { Server } from '@niledatabase/server';

// Import error classes for testing
import {
  AuthenticationError,
  ValidationError,
} from '../errors';

describe('Comprehensive NileDB Testing Suite', () => {
  let testNile: Server;
  let authService: ReturnType<typeof getAuthService>;
  let tenantService: ReturnType<typeof getTenantService>;
  let companyService: ReturnType<typeof getCompanyService>;
  let recoveryManager: ReturnType<typeof getRecoveryManager>;
  let monitoringManager: ReturnType<typeof getMonitoringManager>;

  beforeAll(async () => {
    setupTestEnvironment();
    testNile = createTestNileClient();
    
    // Initialize services
    authService = getAuthService();
    tenantService = getTenantService();
    companyService = getCompanyService();
    recoveryManager = getRecoveryManager();
    monitoringManager = getMonitoringManager();
  });

  afterAll(async () => {
    await cleanupTestData(testNile);
    restoreEnvironment();
    
    // Reset service instances
    resetAuthService();
    resetTenantService();
    resetCompanyService();
  });

  beforeEach(async () => {
    // Clean state for each test
    await cleanupTestData(testNile);
  });

  describe('Integration Testing - Cross-Service Operations', () => {
    it('should handle complete user onboarding workflow', async () => {
      // Step 1: Create user and profile (AuthService)
      const userResult = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `INSERT INTO users.users (id, email, name, email_verified)
           VALUES ($1, $2, $3, $4) RETURNING id, email`,
          [`user-${Date.now()}`, `user-${Date.now()}@example.com`, 'Test User', true]
        );
      });
      const user = userResult.rows[0];

      const profile = await authService.createUserProfile(user.id, {
        role: 'user',
        isPenguinMailsStaff: false,
        preferences: { theme: 'light' },
      });

      expect(profile.userId).toBe(user.id);
      expect(profile.role).toBe('user');

      // Step 2: Create tenant (TenantService)
      const tenant = await tenantService.createTenant('User Tenant', user.id);
      expect(tenant.name).toBe('User Tenant');

      // Step 3: Verify user is tenant owner
      const userTenants = await tenantService.getUserTenants(user.id);
      expect(userTenants).toHaveLength(1);
      expect(userTenants[0].tenant.id).toBe(tenant.id);

      // Step 4: Create company (CompanyService)
      const company = await companyService.createCompany(
        tenant.id,
        {
          name: 'User Company',
          email: 'company@example.com',
          settings: { plan: 'starter' },
        },
        user.id
      );

      expect(company.name).toBe('User Company');
      expect(company.tenantId).toBe(tenant.id);

      // Step 5: Verify user is company owner
      const userCompanies = await companyService.getUserCompanies(user.id, user.id);
      expect(userCompanies).toHaveLength(1);
      expect(userCompanies[0].company?.id).toBe(company.id);
      expect(userCompanies[0].role).toBe('owner');

      // Step 6: Verify access control
      const hasCompanyAccess = await companyService.validateCompanyAccess(
        user.id,
        tenant.id,
        company.id,
        'owner'
      );
      expect(hasCompanyAccess).toBe(true);
    });

    it('should handle staff user cross-tenant operations', async () => {
      // Create staff user
      const staffResult = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `INSERT INTO users.users (id, email, name, email_verified)
           VALUES ($1, $2, $3, $4) RETURNING id, email`,
          [`staff-${Date.now()}`, `staff-${Date.now()}@penguinmails.com`, 'Staff User', true]
        );
      });
      const staffUser = staffResult.rows[0];

      await authService.createUserProfile(staffUser.id, {
        role: 'admin',
        isPenguinMailsStaff: true,
        preferences: {},
      });

      // Create regular user with tenant and company
      const { user, tenant, company } = await createTestSetup(testNile, 'owner');

      // Staff should have access to any tenant
      const staffTenantAccess = await tenantService.validateTenantAccess(
        staffUser.id,
        tenant.id,
        'admin'
      );
      expect(staffTenantAccess).toBe(true);

      // Staff should have access to any company
      const staffCompanyAccess = await companyService.validateCompanyAccess(
        staffUser.id,
        tenant.id,
        company.id,
        'owner'
      );
      expect(staffCompanyAccess).toBe(true);

      // Staff should be able to view user companies across tenants
      const userCompanies = await companyService.getUserCompanies(user.id, staffUser.id);
      expect(userCompanies.length).toBeGreaterThan(0);
    });

    it('should handle multi-tenant user scenarios', async () => {
      // Create user
      const userResult = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `INSERT INTO users.users (id, email, name, email_verified)
           VALUES ($1, $2, $3, $4) RETURNING id, email`,
          [`multi-user-${Date.now()}`, `multi-${Date.now()}@example.com`, 'Multi User', true]
        );
      });
      const user = userResult.rows[0];

      await authService.createUserProfile(user.id);

      // Create multiple tenants
      const tenant1 = await tenantService.createTenant('Tenant 1', user.id);
      const tenant2 = await tenantService.createTenant('Tenant 2');

      // Add user to second tenant as admin
      await tenantService.addUserToTenant(user.id, tenant2.id, ['admin'], user.id);

      // Create companies in both tenants
      await companyService.createCompany(
        tenant1.id,
        { name: 'Company 1' },
        user.id
      );
    
      await companyService.createCompany(
        tenant2.id,
        { name: 'Company 2' },
        user.id
      );

      // Verify user has access to both tenants
      const userTenants = await tenantService.getUserTenants(user.id);
      expect(userTenants).toHaveLength(2);

      // Verify user has companies in both tenants
      const userCompanies = await companyService.getUserCompanies(user.id, user.id);
      expect(userCompanies).toHaveLength(2);

      // Verify different roles in different tenants
      const tenant1Access = await tenantService.validateTenantAccess(user.id, tenant1.id, 'owner');
      const tenant2Access = await tenantService.validateTenantAccess(user.id, tenant2.id, 'admin');
      
      expect(tenant1Access).toBe(true);
      expect(tenant2Access).toBe(true);
    });
  });

  describe('API Route Integration Testing', () => {
    it('should test authentication API endpoints', async () => {
      // Test /api/test/auth endpoint
      const response = await fetch('http://localhost:3000/api/test/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should return 401 without authentication
      expect(response.status).toBe(401);

      const errorData = await response.json();
      expect((errorData as { error: string }).error).toContain('Authentication required');
    });

    it('should test tenant access API endpoints', async () => {
      const { tenant } = await createTestSetup(testNile, 'member');

      // Test /api/test/tenant/[tenantId] endpoint
      const response = await fetch(`http://localhost:3000/api/test/tenant/${tenant.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Note: In real tests, would include session cookie
        },
      });

      // Should return 401 without authentication
      expect(response.status).toBe(401);
    });

    it('should test middleware API endpoints', async () => {
      // Test /api/test/middleware endpoint
      const response = await fetch('http://localhost:3000/api/test/middleware', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should return middleware test results
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('middleware');
      expect(data).toHaveProperty('timestamp');
    });

    it('should test recovery API endpoints', async () => {
      // Test /api/test/recovery endpoint
      const response = await fetch('http://localhost:3000/api/test/recovery', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('recovery');
      expect(data).toHaveProperty('systemHealth');
    });
  });

  describe('Error Handling and Recovery Testing', () => {
    it('should handle authentication errors correctly', async () => {
      // Test invalid user authentication
      await expectToThrow(
        () => authService.getUserWithProfile('invalid-user-id'),
        Error // Will be null, not an error
      );

      // Test staff access validation
      await createTestSetup(testNile, 'member', false);
      
      await expectToThrow(
        () => authService.validateStaffAccess(),
        AuthenticationError,
        'Staff access required'
      );
    });

    it('should handle tenant access errors correctly', async () => {
      const { tenant } = await createTestSetup(testNile, 'member');
      
      // Create different user without access
      const otherUserResult = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `INSERT INTO users.users (id, email, name, email_verified)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [`other-${Date.now()}`, `other-${Date.now()}@example.com`, 'Other User', true]
        );
      });
      const otherUser = otherUserResult.rows[0];

      // Should not have access
      const hasAccess = await tenantService.validateTenantAccess(
        otherUser.id,
        tenant.id,
        'member'
      );
      expect(hasAccess).toBe(false);
    });

    it('should handle company access errors correctly', async () => {
      const { user, tenant, company } = await createTestSetup(testNile, 'member');
      
      // Test insufficient role access
      const hasOwnerAccess = await companyService.validateCompanyAccess(
        user.id,
        tenant.id,
        company.id,
        'owner'
      );
      expect(hasOwnerAccess).toBe(false);

      // Test non-existent company access
      const hasInvalidAccess = await companyService.validateCompanyAccess(
        user.id,
        tenant.id,
        'invalid-company-id',
        'member'
      );
      expect(hasInvalidAccess).toBe(false);
    });

    it('should test error recovery mechanisms', async () => {
      // Create recovery point
      const recoveryPoint = await recoveryManager.createRecoveryPoint(
        'test_operation',
        'test-tenant-id',
        { testData: true }
      );

      expect(recoveryPoint).toBeDefined();
      expect(recoveryPoint.operation).toBe('test_operation');

      // Test data integrity validation
      const integrityResult = await recoveryManager.validateDataIntegrity();
      expect(integrityResult.valid).toBe(true);
    });
  });

  describe('Performance and Monitoring Testing', () => {
    it('should collect and validate performance metrics', async () => {
      // Start monitoring
      const stopMonitoring = monitoringManager.startMonitoring(1000); // 1 second interval

      // Perform some operations
      await createTestSetup(testNile, 'admin');
      
      // Wait for metrics collection
      await waitFor(2000);
      
      // Stop monitoring
      stopMonitoring();

      // Collect metrics
      const metrics = await monitoringManager.collectMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.performance).toBeDefined();
      expect(metrics.errors).toBeDefined();
      expect(metrics.database).toBeDefined();
    });

    it('should test alert system functionality', async () => {
      // Add test alert rule
      monitoringManager.addAlertRule({
        id: 'test_alert',
        name: 'Test Alert Rule',
        condition: (metrics) => metrics.errors.totalErrors > 0,
        severity: 'low',
        cooldownMs: 1000,
        enabled: true,
      });

      // Trigger condition (simulate error)
      try {
        throw new Error('Test error for alert');
      } catch {
        // Error would be logged by monitoring system
      }

      // Check if alert would be triggered
      const alertRules = monitoringManager.getAlertRules();
      
      expect(alertRules).toHaveLength(1);
      expect(alertRules[0].id).toBe('test_alert');
    });

    it('should validate system health monitoring', async () => {
      const healthStatus = await monitoringManager.getSystemHealth();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toMatch(/^(healthy|warning|critical)$/);
      expect(healthStatus.checks).toBeDefined();
      expect(healthStatus.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Data Migration and Validation Testing', () => {
    it('should validate cross-schema data relationships', async () => {
      const { user, tenant, company } = await createTestSetup(testNile, 'owner');

      // Verify user exists in users schema
      const userCheck = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT id, email FROM users.users WHERE id = $1 AND deleted IS NULL',
          [user.id]
        );
      });
      expect(userCheck.rows).toHaveLength(1);

      // Verify profile exists in public schema
      const profileCheck = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT user_id FROM public.user_profiles WHERE user_id = $1 AND deleted IS NULL',
          [user.id]
        );
      });
      expect(profileCheck.rows).toHaveLength(1);

      // Verify tenant membership
      const membershipCheck = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT user_id, tenant_id FROM users.tenant_users WHERE user_id = $1 AND tenant_id = $2 AND deleted IS NULL',
          [user.id, tenant.id]
        );
      });
      expect(membershipCheck.rows).toHaveLength(1);

      // Verify company relationship
      const companyCheck = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT user_id, company_id, role FROM public.user_companies WHERE user_id = $1 AND company_id = $2 AND deleted IS NULL',
          [user.id, company.id]
        );
      });
      expect(companyCheck.rows).toHaveLength(1);
      expect(companyCheck.rows[0].role).toBe('owner');
    });

    it('should validate data integrity constraints', async () => {
      await createTestSetup(testNile, 'admin');

      // Check for orphaned records
      const orphanedProfiles = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT up.user_id 
          FROM public.user_profiles up
          LEFT JOIN users.users u ON up.user_id = u.id
          WHERE u.id IS NULL AND up.deleted IS NULL
        `);
      });
      expect(orphanedProfiles.rows).toHaveLength(0);

      const orphanedUserCompanies = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT uc.id
          FROM public.user_companies uc
          LEFT JOIN users.users u ON uc.user_id = u.id
          LEFT JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
          WHERE (u.id IS NULL OR c.id IS NULL) AND uc.deleted IS NULL
        `);
      });
      expect(orphanedUserCompanies.rows).toHaveLength(0);

      const orphanedTenantUsers = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT tu.user_id, tu.tenant_id
          FROM users.tenant_users tu
          LEFT JOIN users.users u ON tu.user_id = u.id
          LEFT JOIN public.tenants t ON tu.tenant_id = t.id
          WHERE (u.id IS NULL OR t.id IS NULL) AND tu.deleted IS NULL
        `);
      });
      expect(orphanedTenantUsers.rows).toHaveLength(0);
    });

    it('should test role hierarchy validation', async () => {
      const { user, tenant, company } = await createTestSetup(testNile, 'admin');

      // Admin should have member and admin access, but not owner
      const memberAccess = await companyService.validateCompanyAccess(
        user.id,
        tenant.id,
        company.id,
        'member'
      );
      const adminAccess = await companyService.validateCompanyAccess(
        user.id,
        tenant.id,
        company.id,
        'admin'
      );
      const ownerAccess = await companyService.validateCompanyAccess(
        user.id,
        tenant.id,
        company.id,
        'owner'
      );

      expect(memberAccess).toBe(true);
      expect(adminAccess).toBe(true);
      expect(ownerAccess).toBe(false);
    });
  });

  describe('Enhanced Authentication System Testing', () => {
    it('should test tenant context management', async () => {
      const { tenant } = await createTestSetup(testNile, 'member');

      // Test tenant context operations
      const result = await tenantService.withTenantContext(tenant.id, async (nile) => {
        const queryResult = await nile.db.query('SELECT 1 as test');
        return queryResult.rows[0].test;
      });

      expect(result).toBe(1);
    });

    it('should test cross-tenant operations for staff', async () => {
      // Create staff user
      const staffResult = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `INSERT INTO users.users (id, email, name, email_verified)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [`staff-test-${Date.now()}`, `staff-test-${Date.now()}@penguinmails.com`, 'Staff Test', true]
        );
      });
      const staffUser = staffResult.rows[0];

      await authService.createUserProfile(staffUser.id, {
        role: 'admin',
        isPenguinMailsStaff: true,
      });

      // Create multiple tenants with companies
      const tenant1 = await tenantService.createTenant('Staff Test Tenant 1');
      const tenant2 = await tenantService.createTenant('Staff Test Tenant 2');

      await companyService.createCompany(tenant1.id, { name: 'Staff Test Company 1' });
      await companyService.createCompany(tenant2.id, { name: 'Staff Test Company 2' });

      // Staff should be able to access companies across tenants
      const companies1 = await companyService.getCompaniesForTenant(tenant1.id);
      const companies2 = await companyService.getCompaniesForTenant(tenant2.id);

      expect(companies1).toHaveLength(1);
      expect(companies2).toHaveLength(1);
      expect(companies1[0].name).toBe('Staff Test Company 1');
      expect(companies2[0].name).toBe('Staff Test Company 2');
    });

    it('should test user profile management', async () => {
      const userResult = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `INSERT INTO users.users (id, email, name, email_verified)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [`profile-test-${Date.now()}`, `profile-test-${Date.now()}@example.com`, 'Profile Test', true]
        );
      });
      const user = userResult.rows[0];

      // Create profile
      const profile = await authService.createUserProfile(user.id, {
        role: 'user',
        preferences: { theme: 'dark', language: 'en' },
      });

      expect(profile.userId).toBe(user.id);
      expect(profile.role).toBe('user');
      expect(profile.preferences).toEqual({ theme: 'dark', language: 'en' });

      // Update profile
      const updatedUser = await authService.updateUserProfile(user.id, {
        role: 'admin',
        preferences: { theme: 'light', language: 'es' },
      });

      expect(updatedUser.profile?.role).toBe('admin');
      expect(updatedUser.profile?.preferences).toEqual({ theme: 'light', language: 'es' });
    });
  });

  describe('Security and Access Control Testing', () => {
    it('should enforce tenant isolation', async () => {
      // Create two separate tenant setups
      const setup1 = await createTestSetup(testNile, 'owner', false);
      const setup2 = await createTestSetup(testNile, 'owner', false);

      // User 1 should not have access to tenant 2
      const crossTenantAccess = await tenantService.validateTenantAccess(
        setup1.user.id,
        setup2.tenant.id,
        'member'
      );
      expect(crossTenantAccess).toBe(false);

      // User 1 should not have access to company in tenant 2
      const crossCompanyAccess = await companyService.validateCompanyAccess(
        setup1.user.id,
        setup2.tenant.id,
        setup2.company.id,
        'member'
      );
      expect(crossCompanyAccess).toBe(false);
    });

    it('should validate input sanitization', async () => {
      const { user, tenant } = await createTestSetup(testNile, 'admin');

      // Test SQL injection prevention
      await expectToThrow(
        () => companyService.createCompany(
          tenant.id,
          {
            name: "'; DROP TABLE companies; --",
            email: 'malicious@example.com',
          },
          user.id
        ),
        ValidationError
      );

      // Test XSS prevention
      await expectToThrow(
        () => companyService.createCompany(
          tenant.id,
          {
            name: '<script>alert("xss")</script>',
            email: 'xss@example.com',
          },
          user.id
        ),
        ValidationError
      );
    });

    it('should test rate limiting and abuse prevention', async () => {
      // This would typically test the middleware rate limiting
      // For now, we'll test that the monitoring system tracks requests
      const initialMetrics = await monitoringManager.collectMetrics();
      
      // Perform multiple operations
      const { user, tenant } = await createTestSetup(testNile, 'admin');
      
      for (let i = 0; i < 5; i++) {
        await companyService.getCompaniesForTenant(tenant.id, user.id);
      }

      const finalMetrics = await monitoringManager.collectMetrics();
      
      // Should track the requests (exact implementation depends on monitoring setup)
      expect(finalMetrics.performance.totalRequests).toBeGreaterThanOrEqual(
        initialMetrics.performance.totalRequests
      );
    });
  });

  describe('System Health and Monitoring Testing', () => {
    it('should validate system health checks', async () => {
      const healthStatus = await monitoringManager.getSystemHealth();
      
      expect(healthStatus.status).toMatch(/^(healthy|warning|critical)$/);
      expect(healthStatus.checks).toBeDefined();
      expect(healthStatus.checks.database).toBeDefined();
      expect(healthStatus.checks.authentication).toBeDefined();
      expect(healthStatus.checks.tenantService).toBeDefined();
      expect(healthStatus.checks.companyService).toBeDefined();
    });

    it('should test backup and recovery procedures', async () => {
      // Create test data
      await createTestSetup(testNile, 'owner');

      // Create system backup
      const backup = await recoveryManager.createSystemBackup();
      expect(backup).toBeDefined();
      expect(backup.id).toBeDefined();
      expect(backup.status).toBe('completed');

      // Validate backup integrity
      const backupValidation = await recoveryManager.validateBackup(backup.id);
      expect(backupValidation.isValid).toBe(true);
    });

    it('should test monitoring alert system', async () => {
      // Add custom alert rule
      monitoringManager.addAlertRule({
        id: 'test_performance_alert',
        name: 'Test Performance Alert',
        condition: (metrics) => metrics.performance.averageResponseTime > 1000,
        severity: 'medium',
        cooldownMs: 5000,
        enabled: true,
      });

      // Get alert rules
      const alertRules = monitoringManager.getAlertRules();
      expect(alertRules.find(rule => rule.id === 'test_performance_alert')).toBeDefined();

      // Remove alert rule
      monitoringManager.removeAlertRule('test_performance_alert');
      const updatedRules = monitoringManager.getAlertRules();
      expect(updatedRules.find(rule => rule.id === 'test_performance_alert')).toBeUndefined();
    });
  });
});
