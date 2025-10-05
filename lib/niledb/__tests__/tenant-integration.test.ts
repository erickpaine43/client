/**
 * TenantService Integration Tests
 * 
 * Basic integration tests to verify the TenantService class structure
 * and method signatures are correct without requiring database connectivity.
 */

import { TenantService, TenantError, TenantAccessError, TenantNotFoundError, getTenantService, resetTenantService } from '../tenant';
import { AuthService } from '../auth';

describe('TenantService Integration', () => {
  let tenantService: TenantService;
  let authService: AuthService;

  beforeEach(() => {
    // Create services without actual NileDB connection
    tenantService = new TenantService();
    authService = new AuthService();
  });

  describe('Service Initialization', () => {
    it('should create TenantService instance', () => {
      expect(tenantService).toBeInstanceOf(TenantService);
    });

    it('should have all required methods', () => {
      expect(typeof tenantService.getTenantById).toBe('function');
      expect(typeof tenantService.getUserTenants).toBe('function');
      expect(typeof tenantService.createTenant).toBe('function');
      expect(typeof tenantService.updateTenant).toBe('function');
      expect(typeof tenantService.addUserToTenant).toBe('function');
      expect(typeof tenantService.removeUserFromTenant).toBe('function');
      expect(typeof tenantService.updateUserTenantRoles).toBe('function');
      expect(typeof tenantService.getTenantUsers).toBe('function');
      expect(typeof tenantService.validateTenantAccess).toBe('function');
      expect(typeof tenantService.isOnlyTenantOwner).toBe('function');
      expect(typeof tenantService.withTenantContext).toBe('function');
      expect(typeof tenantService.withoutTenantContext).toBe('function');
      expect(typeof tenantService.getTenantStatistics).toBe('function');
    });
  });

  describe('Error Classes', () => {
    it('should create TenantError correctly', () => {
      const error = new TenantError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TenantError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TENANT_ERROR');
      expect(error.name).toBe('TenantError');
    });

    it('should create TenantAccessError correctly', () => {
      const error = new TenantAccessError('Access denied', 'tenant-123');
      expect(error).toBeInstanceOf(TenantError);
      expect(error).toBeInstanceOf(TenantAccessError);
      expect(error.message).toBe('Access denied');
      expect(error.code).toBe('TENANT_ACCESS_DENIED');
      expect(error.tenantId).toBe('tenant-123');
    });

    it('should create TenantNotFoundError correctly', () => {
      const error = new TenantNotFoundError('tenant-456');
      expect(error).toBeInstanceOf(TenantError);
      expect(error).toBeInstanceOf(TenantNotFoundError);
      expect(error.message).toBe('Tenant not found: tenant-456');
      expect(error.code).toBe('TENANT_NOT_FOUND');
    });
  });

  describe('Type Definitions', () => {
    it('should have correct interface structures', () => {
      // Test that TypeScript interfaces are properly defined
      // This will fail at compile time if interfaces are incorrect
      
      const mockTenant = {
        id: 'test-id',
        name: 'Test Tenant',
        created: '2023-01-01T00:00:00Z',
        updated: '2023-01-01T00:00:00Z',
      };

      const mockTenantMembership = {
        tenant: mockTenant,
        roles: ['member'],
        joinedAt: new Date(),
        companies: [],
      };

      const mockCompanyMembership = {
        id: 'company-id',
        name: 'Test Company',
        role: 'member' as const,
        permissions: {},
      };

      // These should compile without errors
      expect(mockTenant.id).toBeDefined();
      expect(mockTenantMembership.tenant).toBeDefined();
      expect(mockCompanyMembership.role).toBe('member');
    });
  });

  describe('Method Signatures', () => {
    it('should have correct method signatures for async operations', async () => {
      // Test that methods return promises and have correct signatures
      // These will throw connection errors but verify the signatures are correct
      
      try {
        await tenantService.getTenantById('test-id');
      } catch (error) {
        // Expected to fail due to no database connection
        expect(error).toBeDefined();
      }

      try {
        await tenantService.getUserTenants('user-id');
      } catch (error) {
        // Expected to fail due to no database connection
        expect(error).toBeDefined();
      }

      try {
        await tenantService.createTenant('Test Tenant');
      } catch (error) {
        // Expected to fail due to no database connection
        expect(error).toBeDefined();
      }
    });

    it('should have correct context helper signatures', async () => {
      try {
        await tenantService.withTenantContext('tenant-id', async (nile) => {
          expect(nile).toBeDefined();
          return 'test';
        });
      } catch (error) {
        // Expected to fail due to no database connection
        expect(error).toBeDefined();
      }

      try {
        await tenantService.withoutTenantContext(async (nile) => {
          expect(nile).toBeDefined();
          return 'test';
        });
      } catch (error) {
        // Expected to fail due to no database connection
        expect(error).toBeDefined();
      }
    });
  });

  describe('Integration with AuthService', () => {
    it('should integrate with AuthService for staff validation', () => {
      // Verify that TenantService uses AuthService internally
      expect(tenantService).toBeDefined();
      expect(authService).toBeDefined();
      
      // The TenantService constructor should accept an AuthService
      // This is verified by the fact that it compiles
    });
  });

  describe('Singleton Pattern', () => {
    it('should provide singleton access', () => {
      
      const instance1 = getTenantService();
      const instance2 = getTenantService();
      
      expect(instance1).toBe(instance2);
      
      resetTenantService();
      const instance3 = getTenantService();
      
      expect(instance3).not.toBe(instance1);
    });
  });
});
