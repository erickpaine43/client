/**
 * CompanyService Integration Tests
 * 
 * Integration tests that verify CompanyService works correctly with TenantService
 * and AuthService, following the established testing patterns from Tasks 4 & 5.
 */

import type { Server } from '@niledatabase/server';
import {
  CompanyService,
  getCompanyService,
  resetCompanyService,
  type CreateCompanyData,
  CompanyAccessError,
} from '../company';

import { resetTenantService } from '../tenant';
import { resetAuthService } from '../auth';

// Mock the client module
jest.mock('../client', () => ({
  getNileClient: jest.fn(),
  withTenantContext: jest.fn(),
  withoutTenantContext: jest.fn(),
}));

// Test utilities
const createMockNileClient = (): Server => ({
  db: {
    query: jest.fn(),
  },
  auth: {
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
} as unknown as Server);

// Test data
const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';
const mockUserId = '987fcdeb-51a2-43d1-9f12-345678901234';
const mockStaffUserId = 'staff123-e89b-12d3-a456-426614174002';
const mockCompanyId = '456e7890-e89b-12d3-a456-426614174001';

const mockCompanyRow = {
  id: mockCompanyId,
  tenant_id: mockTenantId,
  name: 'Test Company',
  email: 'test@company.com',
  settings: { plan: 'pro' },
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z',
  deleted: null,
};

describe('CompanyService Integration Tests', () => {
  let companyService: CompanyService;
  let mockNile: Server;

  beforeEach(async () => {
    // Reset all services
    resetCompanyService();
    resetTenantService();
    resetAuthService();
    jest.clearAllMocks();

    // Create mock client
    mockNile = createMockNileClient();

    // Setup client mock
    const clientModule = await import('../client');
    const { getNileClient, withTenantContext, withoutTenantContext } = clientModule;
    (getNileClient as jest.Mock).mockReturnValue(mockNile);

    // Setup context helpers
    (withTenantContext as jest.Mock).mockImplementation(async (tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
      return await callback(mockNile);
    });

    (withoutTenantContext as jest.Mock).mockImplementation(async (callback: (nile: Server) => Promise<unknown>) => {
      return await callback(mockNile);
    });

    // Create service instances
    companyService = getCompanyService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Integration with TenantService', () => {
    it('should validate tenant access before company operations', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      
      // Mock tenant access validation (TenantService)
      mockQuery
        .mockResolvedValueOnce({ // validateTenantAccess - check staff status
          rows: [{ is_penguinmails_staff: false, role: 'user' }],
        })
        .mockResolvedValueOnce({ // validateTenantAccess - check tenant membership
          rows: [{ tenant_roles: ['member'], company_role: 'admin' }],
        })
        .mockResolvedValueOnce({ // getCompaniesForTenant
          rows: [mockCompanyRow],
        });

      // Execute
      const result = await companyService.getCompaniesForTenant(mockTenantId, mockUserId);

      // Verify
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Company');
      
      // Verify tenant access was checked
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('is_penguinmails_staff'),
        [mockUserId]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('tenant_users'),
        [mockUserId, mockTenantId]
      );
    });

    it('should use tenant context for company queries', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      const clientModule2 = await import('../client');
      const { withTenantContext } = clientModule2;
      
      let capturedTenantId: string | undefined;
      (withTenantContext as jest.Mock).mockImplementation(async (tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
        capturedTenantId = tenantId;
        return await callback(mockNile);
      });

      mockQuery.mockResolvedValue({ rows: [mockCompanyRow] });

      // Execute
      await companyService.getCompaniesForTenant(mockTenantId);

      // Verify
      expect(capturedTenantId).toBe(mockTenantId);
      expect(withTenantContext).toHaveBeenCalledWith(mockTenantId, expect.any(Function));
    });

    it('should handle tenant access denial correctly', async () => {
      // Setup mocks - simulate no tenant access
      const mockQuery = mockNile.db.query as jest.Mock;
      mockQuery
        .mockResolvedValueOnce({ // Check staff status
          rows: [{ is_penguinmails_staff: false }],
        })
        .mockResolvedValueOnce({ // Check tenant membership - no access
          rows: [],
        });

      // Execute & Verify
      await expect(
        companyService.getCompaniesForTenant(mockTenantId, mockUserId)
      ).rejects.toThrow(CompanyAccessError);
    });
  });

  describe('Integration with AuthService', () => {
    it('should allow staff users to bypass tenant restrictions', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      
      // Mock staff user check (AuthService)
      mockQuery
        .mockResolvedValueOnce({ // isStaffUser check
          rows: [{ is_penguinmails_staff: true, role: 'admin' }],
        })
        .mockResolvedValueOnce({ // getCompaniesForTenant
          rows: [mockCompanyRow],
        });

      // Execute
      const result = await companyService.getCompaniesForTenant(mockTenantId, mockStaffUserId);

      // Verify
      expect(result).toHaveLength(1);
      
      // Verify staff check was performed
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('is_penguinmails_staff = true'),
        [mockStaffUserId]
      );
    });

    it('should validate company access using staff privileges', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      
      // Mock staff user validation
      mockQuery.mockResolvedValueOnce({
        rows: [{ is_penguinmails_staff: true, role: 'admin' }],
      });

      // Execute
      const hasAccess = await companyService.validateCompanyAccess(
        mockStaffUserId,
        mockTenantId,
        mockCompanyId,
        'owner' // Even owner-level access should be granted to staff
      );

      // Verify
      expect(hasAccess).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('is_penguinmails_staff = true'),
        [mockStaffUserId]
      );
    });

    it('should enforce role hierarchy for non-staff users', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      
      mockQuery
        .mockResolvedValueOnce({ // Check staff status - not staff
          rows: [],
        })
        .mockResolvedValueOnce({ // Check tenant access
          rows: [{ tenant_roles: ['member'], company_role: 'admin' }],
        })
        .mockResolvedValueOnce({ // Check company membership
          rows: [{ role: 'admin' }],
        });

      // Execute - admin should have admin access but not owner access
      const adminAccess = await companyService.validateCompanyAccess(
        mockUserId,
        mockTenantId,
        mockCompanyId,
        'admin'
      );

      const ownerAccess = await companyService.validateCompanyAccess(
        mockUserId,
        mockTenantId,
        mockCompanyId,
        'owner'
      );

      // Verify
      expect(adminAccess).toBe(true);
      expect(ownerAccess).toBe(false);
    });
  });

  describe('End-to-End Company Management Workflow', () => {
    it('should complete full company lifecycle with proper access control', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      
      // Mock user as tenant admin
      mockQuery
        .mockResolvedValueOnce({ // Staff check for createCompany
          rows: [],
        })
        .mockResolvedValueOnce({ // Tenant access check for createCompany
          rows: [{ tenant_roles: ['admin'], company_role: 'admin' }],
        })
        .mockResolvedValueOnce({ // Create company
          rows: [mockCompanyRow],
        })
        .mockResolvedValueOnce({ // Staff check for addUserToCompany
          rows: [],
        })
        .mockResolvedValueOnce({ // Tenant access check for addUserToCompany
          rows: [{ tenant_roles: ['admin'], company_role: 'admin' }],
        })
        .mockResolvedValueOnce({ // User tenant access check
          rows: [{ tenant_roles: ['member'] }],
        })
        .mockResolvedValueOnce({ // Company exists check
          rows: [{ id: mockCompanyId }],
        })
        .mockResolvedValueOnce({ // Add user to company
          rows: [{
            id: 'uc123',
            tenant_id: mockTenantId,
            user_id: mockUserId,
            company_id: mockCompanyId,
            role: 'member',
            permissions: {},
            created: '2024-01-01T00:00:00.000Z',
            updated: '2024-01-01T00:00:00.000Z',
            deleted: null,
          }],
        });

      const createData: CreateCompanyData = {
        name: 'Integration Test Company',
        email: 'integration@test.com',
        settings: { plan: 'enterprise' },
      };

      // Step 1: Create company
      const company = await companyService.createCompany(
        mockTenantId,
        createData,
        mockUserId
      );

      expect(company.name).toBe('Test Company'); // From mock data
      expect(company.tenantId).toBe(mockTenantId);

      // Step 2: Add user to company
      const userCompany = await companyService.addUserToCompany(
        mockTenantId,
        mockUserId,
        company.id,
        'member',
        {},
        mockUserId
      );

      expect(userCompany.userId).toBe(mockUserId);
      expect(userCompany.companyId).toBe(mockCompanyId);
      expect(userCompany.role).toBe('member');

      // Verify all access checks were performed
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('is_penguinmails_staff'),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('tenant_users'),
        expect.any(Array)
      );
    });

    it('should handle cross-tenant user company queries for staff', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      const clientModule3 = await import('../client');
      const { withoutTenantContext } = clientModule3;
      
      let usedWithoutContext = false;
      (withoutTenantContext as jest.Mock).mockImplementation(async (callback: (nile: Server) => Promise<unknown>) => {
        usedWithoutContext = true;
        return await callback(mockNile);
      });

      mockQuery.mockResolvedValue({
        rows: [{
          id: 'uc123',
          tenant_id: mockTenantId,
          user_id: mockUserId,
          company_id: mockCompanyId,
          role: 'admin',
          permissions: {},
          created: '2024-01-01T00:00:00.000Z',
          updated: '2024-01-01T00:00:00.000Z',
          deleted: null,
          company_name: 'Test Company',
          company_email: 'test@company.com',
          company_settings: { plan: 'pro' },
          company_created: '2024-01-01T00:00:00.000Z',
          company_updated: '2024-01-01T00:00:00.000Z',
          user_email: 'user@example.com',
          user_name: 'Test User',
        }],
      });

      // Execute - staff viewing user companies
      const companies = await companyService.getUserCompanies(mockUserId, mockStaffUserId);

      // Verify
      expect(companies).toHaveLength(1);
      expect(companies[0].company?.name).toBe('Test Company');
      expect(usedWithoutContext).toBe(true);
      
      // Verify cross-schema query was used
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('public.user_companies uc'),
        [mockUserId]
      );
    });
  });

  describe('Error Handling Integration', () => {
    it('should propagate tenant service errors correctly', async () => {
      // Setup mocks to simulate tenant service error
      const mockQuery = mockNile.db.query as jest.Mock;
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      // Execute & Verify
      await expect(
        companyService.getCompaniesForTenant(mockTenantId, mockUserId)
      ).rejects.toThrow('Failed to retrieve companies');
    });

    it('should handle auth service errors gracefully', async () => {
      // Setup mocks to simulate auth service error
      const mockQuery = mockNile.db.query as jest.Mock;
      mockQuery.mockRejectedValue(new Error('Authentication service unavailable'));

      // Execute & Verify
      const hasAccess = await companyService.validateCompanyAccess(
        mockUserId,
        mockTenantId,
        mockCompanyId
      );

      expect(hasAccess).toBe(false); // Should default to false on error
    });
  });

  describe('Performance and Optimization', () => {
    it('should minimize database queries through efficient access validation', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      
      // Mock staff user - should skip tenant validation
      mockQuery
        .mockResolvedValueOnce({ // Staff check
          rows: [{ is_penguinmails_staff: true, role: 'admin' }],
        })
        .mockResolvedValueOnce({ // Get companies
          rows: [mockCompanyRow],
        });

      // Execute
      await companyService.getCompaniesForTenant(mockTenantId, mockStaffUserId);

      // Verify - should only make 2 queries (staff check + get companies)
      // No additional tenant validation queries for staff users
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should use prepared statement patterns for frequent queries', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      mockQuery.mockResolvedValue({ rows: [mockCompanyRow] });

      // Execute multiple times
      await companyService.getCompaniesForTenant(mockTenantId);
      await companyService.getCompaniesForTenant(mockTenantId);

      // Verify consistent query patterns
      const calls = mockQuery.mock.calls;
      expect(calls[0][0]).toBe(calls[1][0]); // Same SQL query
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity across services', async () => {
      // Setup mocks
      const mockQuery = mockNile.db.query as jest.Mock;
      
      // Mock company creation with user addition
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // Staff check
        .mockResolvedValueOnce({ rows: [{ tenant_roles: ['admin'], company_role: 'admin' }] }) // Tenant access
        .mockResolvedValueOnce({ rows: [mockCompanyRow] }) // Create company
        .mockResolvedValueOnce({ rows: [] }) // Staff check for addUser
        .mockResolvedValueOnce({ rows: [{ tenant_roles: ['admin'], company_role: 'admin' }] }) // Tenant access for addUser
        .mockResolvedValueOnce({ rows: [{ tenant_roles: ['member'] }] }) // User tenant access
        .mockResolvedValueOnce({ rows: [{ id: mockCompanyId }] }) // Company exists
        .mockResolvedValueOnce({ rows: [{ // Add user result
          id: 'uc123',
          tenant_id: mockTenantId,
          user_id: mockUserId,
          company_id: mockCompanyId,
          role: 'owner',
          permissions: {},
          created: '2024-01-01T00:00:00.000Z',
          updated: '2024-01-01T00:00:00.000Z',
          deleted: null,
        }] });

      // Execute
      const company = await companyService.createCompany(
        mockTenantId,
        { name: 'Test Company' },
        mockUserId
      );

      // Verify company was created with proper tenant association
      expect(company.tenantId).toBe(mockTenantId);
      
      // Verify all queries used proper tenant context
      const tenantQueries = mockQuery.mock.calls.filter((call: [string, unknown[]]) =>
        call[1] && call[1].includes(mockTenantId)
      );
      expect(tenantQueries.length).toBeGreaterThan(0);
    });
  });
});
