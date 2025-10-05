/**
 * NileDB Migration Tests
 * 
 * Comprehensive test suite for the data migration process from old Drizzle
 * backend to NileDB. Tests all migration steps and validation.
 */

// Jest globals are available globally in test environment
import { getAuthService, resetAuthService } from '../../lib/niledb/auth';
import { getTenantService, resetTenantService } from '../../lib/niledb/tenant';
import { getCompanyService } from '../../lib/niledb/company';
import { withoutTenantContext } from '../../lib/niledb/client';

// Test data interfaces
interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  is_penguinmails_staff: boolean;
}

interface TestTenant {
  id: string;
  name: string;
}

interface TestCompany {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  settings: Record<string, unknown>;
}

interface TestUserCompany {
  id: string;
  tenant_id: string;
  user_id: string;
  company_id: string;
  role: 'member' | 'admin' | 'owner';
  permissions: Record<string, unknown>;
}

describe('NileDB Migration', () => {
  const authService = getAuthService();
  const tenantService = getTenantService();
  const companyService = getCompanyService();

  // Test data
  const testUsers: TestUser[] = [
    {
      id: 'test_user_001',
      email: 'test.admin@penguinmails.com',
      name: 'Test Admin',
      role: 'super_admin',
      is_penguinmails_staff: true
    },
    {
      id: 'test_user_002',
      email: 'test.user@example.com',
      name: 'Test User',
      role: 'user',
      is_penguinmails_staff: false
    }
  ];

  const testTenants: TestTenant[] = [
    {
      id: 'test_tenant_001',
      name: 'Test PenguinMails'
    },
    {
      id: 'test_tenant_002',
      name: 'Test Company'
    }
  ];

  const testCompanies: TestCompany[] = [
    {
      id: 'test_company_001',
      tenant_id: 'test_tenant_001',
      name: 'Test PenguinMails Internal',
      email: 'test@penguinmails.com',
      settings: { internal: true }
    },
    {
      id: 'test_company_002',
      tenant_id: 'test_tenant_002',
      name: 'Test Customer Company',
      email: 'test@customer.com',
      settings: { industry: 'testing' }
    }
  ];

  const testUserCompanies: TestUserCompany[] = [
    {
      id: 'test_uc_001',
      tenant_id: 'test_tenant_001',
      user_id: 'test_user_001',
      company_id: 'test_company_001',
      role: 'owner',
      permissions: { all: true }
    },
    {
      id: 'test_uc_002',
      tenant_id: 'test_tenant_002',
      user_id: 'test_user_002',
      company_id: 'test_company_002',
      role: 'owner',
      permissions: { can_manage_users: true }
    }
  ];

  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    
    // Reset service instances
    resetAuthService();
    resetTenantService();
  });

  beforeEach(async () => {
    // Ensure clean state for each test
    await cleanupTestData();
  });

  describe('User Migration', () => {
    it('should migrate users to NileDB users table', async () => {
      // Migrate test users
      for (const user of testUsers) {
        await withoutTenantContext(async (nile) => {
          await nile.db.query(
            `INSERT INTO users.users (id, email, name, created, updated, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              user.id,
              user.email,
              user.name,
              new Date().toISOString(),
              new Date().toISOString(),
              true
            ]
          );
        });
      }

      // Verify users exist
      const users = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          'SELECT id, email, name FROM users.users WHERE id LIKE $1 AND deleted IS NULL',
          ['test_user_%']
        );
      });

      expect(users.rows).toHaveLength(testUsers.length);
      expect(users.rows.map((u: { id: string; email: string; name: string }) => u.email)).toEqual(
        expect.arrayContaining(testUsers.map(u => u.email))
      );
    });

    it('should create user profiles using AuthService', async () => {
      // First migrate users
      for (const user of testUsers) {
        await withoutTenantContext(async (nile) => {
          await nile.db.query(
            `INSERT INTO users.users (id, email, name, created, updated, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user.id, user.email, user.name, new Date().toISOString(), new Date().toISOString(), true]
          );
        });
      }

      // Create profiles
      for (const user of testUsers) {
        const profile = await authService.createUserProfile(user.id, {
          role: user.role,
          isPenguinMailsStaff: user.is_penguinmails_staff,
          preferences: {}
        });

        expect(profile).toBeDefined();
        expect(profile.userId).toBe(user.id);
        expect(profile.role).toBe(user.role);
        expect(profile.isPenguinMailsStaff).toBe(user.is_penguinmails_staff);
      }
    });

    it('should retrieve users with profiles using cross-sceries', async () => {
      // Setup users and profiles
      for (const user of testUsers) {
        await withoutTenantContext(async (nile) => {
          await nile.db.query(
            `INSERT INTO users.users (id, email, name, created, updated, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user.id, user.email, user.name, new Date().toISOString(), new Date().toISOString(), true]
          );
        });

        await authService.createUserProfile(user.id, {
          role: user.role,
          isPenguinMailsStaff: user.is_penguinmails_staff,
          preferences: {}
        });
      }

      // Test cross-schema query
      const userWithProfile = await authService.getUserWithProfile(testUsers[0].id);
      
      expect(userWithProfile).toBeDefined();
      expect(userWithProfile?.id).toBe(testUsers[0].id);
      expect(userWithProfile?.email).toBe(testUsers[0].email);
      expect(userWithProfile?.profile).toBeDefined();
      expect(userWithProfile?.profile?.role).toBe(testUsers[0].role);
    });

    it('should identify staff users correctly', async () => {
      // Setup users and profiles
      for (const user of testUsers) {
        await withoutTenantContext(async (nile) => {
          await nile.db.query(
            `INSERT INTO users.users (id, email, name, created, updated, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user.id, user.email, user.name, new Date().toISOString(), new Date().toISOString(), true]
          );
        });

        await authService.createUserProfile(user.id, {
          role: user.role,
          isPenguinMailsStaff: user.is_penguinmails_staff,
          preferences: {}
        });
      }

      // Test staff identification
      const isStaff1 = await authService.isStaffUser(testUsers[0].id);
      const isStaff2 = await authService.isStaffUser(testUsers[1].id);

      expect(isStaff1).toBe(testUsers[0].is_penguinmails_staff);
      expect(isStaff2).toBe(testUsers[1].is_penguinmails_staff);
    });
  });

  describe('Tenant Migration', () => {
    it('should migrate tenants to NileDB tenants table', async () => {
      // Migrate test tenants
      for (const tenant of testTenants) {
        await withoutTenantContext(async (nile) => {
          await nile.db.query(
            'INSERT INTO tenants (id, name, created, updated) VALUES ($1, $2, $3, $4)',
            [tenant.id, tenant.name, new Date().toISOString(), new Date().toISOString()]
          );
        });
      }

      // Verify tenants exist
      for (const tenant of testTenants) {
        const tenantData = await tenantService.getTenantById(tenant.id);
        expect(tenantData).toBeDefined();
        expect(tenantData?.id).toBe(tenant.id);
        expect(tenantData?.name).toBe(tenant.name);
      }
    });

    it('should add users to tenants', async () => {
      // Setup users and tenants
      await setupUsersAndTenants();

      // Add users to tenants
      await tenantService.addUserToTenant(testUsers[0].id, testTenants[0].id, ['owner']);
      await tenantService.addUserToTenant(testUsers[1].id, testTenants[1].id, ['member']);

      // Verify tenant memberships
      const userTenants1 = await tenantService.getUserTenants(testUsers[0].id);
      const userTenants2 = await tenantService.getUserTenants(testUsers[1].id);

      expect(userTenants1).toHaveLength(1);
      expect(userTenants1[0].tenant.id).toBe(testTenants[0].id);

      expect(userTenants2).toHaveLength(1);
      expect(userTenants2[0].tenant.id).toBe(testTenants[1].id);
    });

    it('should validate tenant access correctly', async () => {
      // Setup users and tenants
      await setupUsersAndTenants();
      await tenantService.addUserToTenant(testUsers[0].id, testTenants[0].id, ['owner']);

      // Test access validation
      const hasAccess = await tenantService.validateTenantAccess(
        testUsers[0].id,
        testTenants[0].id,
        'member'
      );
      const noAccess = await tenantService.validateTenantAccess(
        testUsers[1].id,
        testTenants[0].id,
        'member'
      );

      expect(hasAccess).toBe(true);
      expect(noAccess).toBe(false);
    });
  });

  describe('Company Migration', () => {
    it('should migrate companies to tenant-scoped tables', async () => {
      // Setup prerequisites
      await setupUsersAndTenants();

      // Migrate companies
      for (const company of testCompanies) {
        await tenantService.withTenantContext(company.tenant_id, async (nile) => {
          await nile.db.query(
            `INSERT INTO companies (id, tenant_id, name, email, settings, created, updated)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              company.id,
              company.tenant_id,
              company.name,
              company.email,
              company.settings,
              new Date().toISOString(),
              new Date().toISOString()
            ]
          );
        });
      }

      // Verify companies exist
      for (const company of testCompanies) {
        const companyData = await companyService.getCompanyById(
          company.tenant_id,
          company.id
        );
        
        expect(companyData).toBeDefined();
        expect(companyData?.id).toBe(company.id);
        expect(companyData?.name).toBe(company.name);
        expect(companyData?.tenantId).toBe(company.tenant_id);
      }
    });

    it('should get companies for tenant', async () => {
      // Setup prerequisites
      await setupUsersAndTenants();
      await setupCompanies();

      // Get companies for tenant
      const companies = await companyService.getCompaniesForTenant(testTenants[0].id);
      
      expect(companies).toHaveLength(1);
      expect(companies[0].name).toBe(testCompanies[0].name);
      expect(companies[0].tenantId).toBe(testTenants[0].id);
    });
  });

  describe('User-Company Relationships', () => {
    it('should migrate user-company relationships', async () => {
      // Setup prerequisites
      await setupUsersAndTenants();
      await setupCompanies();

      // Add users to tenants first
      for (const uc of testUserCompanies) {
        await tenantService.addUserToTenant(uc.user_id, uc.tenant_id, ['member']);
      }

      // Migrate user-company relationships
      for (const uc of testUserCompanies) {
        await tenantService.withTenantContext(uc.tenant_id, async (nile) => {
          await nile.db.query(
            `INSERT INTO user_companies (id, tenant_id, user_id, company_id, role, permissions, created, updated)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              uc.id,
              uc.tenant_id,
              uc.user_id,
              uc.company_id,
              uc.role,
              uc.permissions,
              new Date().toISOString(),
              new Date().toISOString()
            ]
          );
        });
      }

      // Verify relationships
      for (const uc of testUserCompanies) {
        const hasAccess = await companyService.validateCompanyAccess(
          uc.user_id,
          uc.tenant_id,
          uc.company_id,
          uc.role
        );
        
        expect(hasAccess).toBe(true);
      }
    });

    it('should get user companies across tenants', async () => {
      // Setup complete test data
      await setupCompleteTestData();

      // Get user companies
      const userCompanies = await companyService.getUserCompanies(testUsers[0].id);
      
      expect(userCompanies.length).toBeGreaterThan(0);
      expect(userCompanies[0].userId).toBe(testUsers[0].id);
      expect(userCompanies[0].company).toBeDefined();
    });

    it('should validate company access with role hierarchy', async () => {
      // Setup complete test data
      await setupCompleteTestData();

      const uc = testUserCompanies[0];
      
      // Test role hierarchy
      const ownerAccess = await companyService.validateCompanyAccess(
        uc.user_id,
        uc.tenant_id,
        uc.company_id,
        'owner'
      );
      const adminAccess = await companyService.validateCompanyAccess(
        uc.user_id,
        uc.tenant_id,
        uc.company_id,
        'admin'
      );
      const memberAccess = await companyService.validateCompanyAccess(
        uc.user_id,
        uc.tenant_id,
        uc.company_id,
        'member'
      );

      expect(ownerAccess).toBe(uc.role === 'owner');
      expect(adminAccess).toBe(['owner', 'admin'].includes(uc.role));
      expect(memberAccess).toBe(['owner', 'admin', 'member'].includes(uc.role));
    });
  });

  describe('Staff Access and Cross-Tenant Operations', () => {
    it('should allow staff users to access any tenant', async () => {
      // Setup complete test data
      await setupCompleteTestData();

      // Staff user should have access to any tenant
      const staffAccess = await tenantService.validateTenantAccess(
        testUsers[0].id, // staff user
        testTenants[1].id, // different tenant
        'admin'
      );

      expect(staffAccess).toBe(true);
    });

    it('should allow staff users to access any company', async () => {
      // Setup complete test data
      await setupCompleteTestData();

      // Staff user should have access to any company
      const staffAccess = await companyService.validateCompanyAccess(
        testUsers[0].id, // staff user
        testTenants[1].id,
        testCompanies[1].id,
        'owner'
      );

      expect(staffAccess).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      // Setup complete test data
      await setupCompleteTestData();

      // Check for orphaned records
      const orphanedProfiles = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT up.user_id 
          FROM public.user_profiles up
          LEFT JOIN users.users u ON up.user_id = u.id
          WHERE u.id IS NULL AND up.deleted IS NULL AND up.user_id LIKE 'test_%'
        `);
      });

      const orphanedUserCompanies = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT uc.id
          FROM public.user_companies uc
          LEFT JOIN users.users u ON uc.user_id = u.id
          LEFT JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
          WHERE (u.id IS NULL OR c.id IS NULL) 
            AND uc.deleted IS NULL 
            AND uc.id LIKE 'test_%'
        `);
      });

      expect(orphanedProfiles.rows).toHaveLength(0);
      expect(orphanedUserCompanies.rows).toHaveLength(0);
    });

    it('should preserve data consistency across schemas', async () => {
      // Setup complete test data
      await setupCompleteTestData();

      // Verify user exists in both schemas
      const userWithProfile = await authService.getUserWithProfile(testUsers[0].id);
      const userTenants = await tenantService.getUserTenants(testUsers[0].id);

      expect(userWithProfile).toBeDefined();
      expect(userWithProfile?.profile).toBeDefined();
      expect(userTenants.length).toBeGreaterThan(0);
    });
  });

  // Helper functions
  async function cleanupTestData(): Promise<void> {
    try {
      await withoutTenantContext(async (nile) => {
        // Clean up in reverse dependency order
        await nile.db.query(
          "UPDATE public.user_companies SET deleted = CURRENT_TIMESTAMP WHERE id LIKE 'test_%'"
        );
        await nile.db.query(
          "UPDATE public.companies SET deleted = CURRENT_TIMESTAMP WHERE id LIKE 'test_%'"
        );
        await nile.db.query(
          "UPDATE users.tenant_users SET deleted = CURRENT_TIMESTAMP WHERE user_id LIKE 'test_%'"
        );
        await nile.db.query(
          "UPDATE public.tenants SET deleted = CURRENT_TIMESTAMP WHERE id LIKE 'test_%'"
        );
        await nile.db.query(
          "UPDATE public.user_profiles SET deleted = CURRENT_TIMESTAMP WHERE user_id LIKE 'test_%'"
        );
        await nile.db.query(
          "UPDATE users.users SET deleted = CURRENT_TIMESTAMP WHERE id LIKE 'test_%'"
        );
      });
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Cleanup warning:', error);
    }
  }

  async function setupUsersAndTenants(): Promise<void> {
    // Create users
    for (const user of testUsers) {
      await withoutTenantContext(async (nile) => {
        await nile.db.query(
          `INSERT INTO users.users (id, email, name, created, updated, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, user.email, user.name, new Date().toISOString(), new Date().toISOString(), true]
        );
      });

      await authService.createUserProfile(user.id, {
        role: user.role,
        isPenguinMailsStaff: user.is_penguinmails_staff,
        preferences: {}
      });
    }

    // Create tenants
    for (const tenant of testTenants) {
      await withoutTenantContext(async (nile) => {
        await nile.db.query(
          'INSERT INTO tenants (id, name, created, updated) VALUES ($1, $2, $3, $4)',
          [tenant.id, tenant.name, new Date().toISOString(), new Date().toISOString()]
        );
      });
    }
  }

  async function setupCompanies(): Promise<void> {
    for (const company of testCompanies) {
      await tenantService.withTenantContext(company.tenant_id, async (nile) => {
        await nile.db.query(
          `INSERT INTO companies (id, tenant_id, name, email, settings, created, updated)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            company.id,
            company.tenant_id,
            company.name,
            company.email,
            company.settings,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
      });
    }
  }

  async function setupCompleteTestData(): Promise<void> {
    await setupUsersAndTenants();
    await setupCompanies();

    // Add users to tenants and companies
    for (const uc of testUserCompanies) {
      await tenantService.addUserToTenant(uc.user_id, uc.tenant_id, ['member']);
      
      await tenantService.withTenantContext(uc.tenant_id, async (nile) => {
        await nile.db.query(
          `INSERT INTO user_companies (id, tenant_id, user_id, company_id, role, permissions, created, updated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            uc.id,
            uc.tenant_id,
            uc.user_id,
            uc.company_id,
            uc.role,
            uc.permissions,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
      });
    }
  }
});
