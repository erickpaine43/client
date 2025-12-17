/**
 * CompanyService Unit Tests
 * 
 * Comprehensive test suite for the CompanyService class following the established
 * testing patterns with integration to TenantService and AuthService.
 */

import type { Server } from '@niledatabase/server';
import {
  CompanyService,
  getCompanyService,
  resetCompanyService,
  type CreateCompanyData,
  CompanyError,
  CompanyAccessError,
  CompanyNotFoundError,
  CompanyValidationError
} from '../company';

// Mock dependencies
import * as ClientModule from '../client';
import * as TenantModule from '../tenant';
import * as AuthModule from '../auth';

jest.mock('../client', () => ({
  getNileClient: jest.fn(),
  withTenantContext: jest.fn(),
  withoutTenantContext: jest.fn(),
}));

jest.mock('../tenant', () => ({
  getTenantService: jest.fn(),
  resetTenantService: jest.fn(),
}));

jest.mock('../auth', () => ({
  getAuthService: jest.fn(),
  resetAuthService: jest.fn(),
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

const createMockTenantService = () => ({
  validateTenantAccess: jest.fn(),
  withTenantContext: jest.fn(),
  withoutTenantContext: jest.fn(),
});

const createMockAuthService = () => ({
  isStaffUser: jest.fn(),
  validateSession: jest.fn(),
  getUserWithProfile: jest.fn(),
});

// Test data
const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';
const mockUserId = '987fcdeb-51a2-43d1-9f12-345678901234';
const mockCompanyId = '456e7890-e89b-12d3-a456-426614174001';
const mockStaffUserId = 'staff123-e89b-12d3-a456-426614174002';

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

const mockUserCompanyRow = {
  id: 'uc123456-e89b-12d3-a456-426614174003',
  tenant_id: mockTenantId,
  user_id: mockUserId,
  company_id: mockCompanyId,
  role: 'admin',
  permissions: { canManageUsers: true },
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z',
  deleted: null,
};

describe('CompanyService', () => {
  let companyService: CompanyService;
  let mockNile: Server;
  let mockTenantService: ReturnType<typeof createMockTenantService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    resetCompanyService();

    // Create mock instances
    mockNile = createMockNileClient();
    mockTenantService = createMockTenantService();
    mockAuthService = createMockAuthService();

    // Setup mock implementations
    (ClientModule.getNileClient as jest.Mock).mockReturnValue(mockNile);
    (TenantModule.getTenantService as jest.Mock).mockReturnValue(mockTenantService);
    (AuthModule.getAuthService as jest.Mock).mockReturnValue(mockAuthService);

    // Create service instance
    companyService = new CompanyService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompaniesForTenant', () => {
    it('should return companies for tenant with valid access', async () => {
      // Setup mocks
      mockTenantService.validateTenantAccess.mockResolvedValue(true);
      mockTenantService.withTenantContext.mockImplementation(async (_tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithContext = {
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [mockCompanyRow],
            }),
          },
        } as Server;
        return await callback(mockNileWithContext);
      });

      // Execute
      const result = await companyService.getCompaniesForTenant(mockTenantId, mockUserId);

      // Verify
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockCompanyId,
        tenantId: mockTenantId,
        name: 'Test Company',
        email: 'test@company.com',
      });
      expect(mockTenantService.validateTenantAccess).toHaveBeenCalledWith(
        mockUserId,
        mockTenantId,
        'member'
      );
    });

    it('should throw access error for invalid tenant access', async () => {
      // Setup mocks
      mockTenantService.validateTenantAccess.mockResolvedValue(false);

      // Execute & Verify
      await expect(
        companyService.getCompaniesForTenant(mockTenantId, mockUserId)
      ).rejects.toThrow(CompanyAccessError);
      
      expect(mockTenantService.validateTenantAccess).toHaveBeenCalledWith(
        mockUserId,
        mockTenantId,
        'member'
      );
    });

    it('should work without user validation when no requesting user provided', async () => {
      // Setup mocks
      mockTenantService.withTenantContext.mockImplementation(async (_tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithContext = {
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [mockCompanyRow],
            }),
          },
        } as Server;
        return await callback(mockNileWithContext);
      });

      // Execute
      const result = await companyService.getCompaniesForTenant(mockTenantId);

      // Verify
      expect(result).toHaveLength(1);
      expect(mockTenantService.validateTenantAccess).not.toHaveBeenCalled();
    });
  });

  describe('createCompany', () => {
    const createData: CreateCompanyData = {
      name: 'New Company',
      email: 'new@company.com',
      settings: { plan: 'basic' },
    };

    it('should create company with valid data and permissions', async () => {
      // Setup mocks
      mockTenantService.validateTenantAccess.mockResolvedValue(true);
      mockTenantService.withTenantContext.mockImplementation(async (_tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithContext = {
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [{
                ...mockCompanyRow,
                name: 'New Company',
                email: 'new@company.com',
              }],
            }),
          },
        } as Server;
        return await callback(mockNileWithContext);
      });
      
      // Mock addUserToCompany method
      companyService.addUserToCompany = jest.fn().mockResolvedValue({});

      // Execute
      const result = await companyService.createCompany(mockTenantId, createData, mockUserId);

      // Verify
      expect(result.name).toBe('New Company');
      expect(result.email).toBe('new@company.com');
      expect(mockTenantService.validateTenantAccess).toHaveBeenCalledWith(
        mockUserId,
        mockTenantId,
        'admin'
      );
      expect(companyService.addUserToCompany).toHaveBeenCalledWith(
        mockTenantId,
        mockUserId,
        result.id,
        'owner',
        {},
        mockUserId
      );
    });

    it('should validate company name is required', async () => {
      // Execute & Verify
      await expect(
        companyService.createCompany(mockTenantId, { name: '' })
      ).rejects.toThrow(CompanyValidationError);

      await expect(
        companyService.createCompany(mockTenantId, { name: '   ' })
      ).rejects.toThrow(CompanyValidationError);
    });

    it('should validate email format', async () => {
      // Execute & Verify
      await expect(
        companyService.createCompany(mockTenantId, { 
          name: 'Test Company', 
          email: 'invalid-email' 
        })
      ).rejects.toThrow(CompanyValidationError);
    });

    it('should throw access error for insufficient permissions', async () => {
      // Setup mocks
      mockTenantService.validateTenantAccess.mockResolvedValue(false);

      // Execute & Verify
      await expect(
        companyService.createCompany(mockTenantId, createData, mockUserId)
      ).rejects.toThrow(CompanyAccessError);
    });
  });

  describe('validateCompanyAccess', () => {
    it('should return true for staff users', async () => {
      // Setup mocks
      mockAuthService.isStaffUser.mockResolvedValue(true);

      // Execute
      const result = await companyService.validateCompanyAccess(
        mockStaffUserId,
        mockTenantId,
        mockCompanyId,
        'owner'
      );

      // Verify
      expect(result).toBe(true);
      expect(mockAuthService.isStaffUser).toHaveBeenCalledWith(mockStaffUserId);
    });

    it('should validate role hierarchy correctly', async () => {
      // Setup mocks
      mockAuthService.isStaffUser.mockResolvedValue(false);
      mockTenantService.validateTenantAccess.mockResolvedValue(true);
      mockTenantService.withTenantContext.mockImplementation(async (_tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithContext = {
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [{ role: 'admin' }],
            }),
          },
        } as Server;
        return await callback(mockNileWithContext);
      });

      // Execute - admin should have member access
      const memberAccess = await companyService.validateCompanyAccess(
        mockUserId,
        mockTenantId,
        mockCompanyId,
        'member'
      );

      // Execute - admin should have admin access
      const adminAccess = await companyService.validateCompanyAccess(
        mockUserId,
        mockTenantId,
        mockCompanyId,
        'admin'
      );

      // Execute - admin should NOT have owner access
      const ownerAccess = await companyService.validateCompanyAccess(
        mockUserId,
        mockTenantId,
        mockCompanyId,
        'owner'
      );

      // Verify
      expect(memberAccess).toBe(true);
      expect(adminAccess).toBe(true);
      expect(ownerAccess).toBe(false);
    });

    it('should return false when user has no tenant access', async () => {
      // Setup mocks
      mockAuthService.isStaffUser.mockResolvedValue(false);
      mockTenantService.validateTenantAccess.mockResolvedValue(false);

      // Execute
      const result = await companyService.validateCompanyAccess(
        mockUserId,
        mockTenantId,
        mockCompanyId
      );

      // Verify
      expect(result).toBe(false);
    });

    it('should return false when user is not a company member', async () => {
      // Setup mocks
      mockAuthService.isStaffUser.mockResolvedValue(false);
      mockTenantService.validateTenantAccess.mockResolvedValue(true);
      mockTenantService.withTenantContext.mockImplementation(async (_tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithContext = {
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [],
            }),
          },
        } as Server;
        return await callback(mockNileWithContext);
      });

      // Execute
      const result = await companyService.validateCompanyAccess(
        mockUserId,
        mockTenantId,
        mockCompanyId
      );

      // Verify
      expect(result).toBe(false);
    });
  });

  describe('getUserCompanies', () => {
    it('should return user companies for self', async () => {
      // Setup mocks
      mockTenantService.withoutTenantContext.mockImplementation(async (callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithoutContext = {
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [{
                ...mockUserCompanyRow,
                company_name: 'Test Company',
                company_email: 'test@company.com',
                company_settings: { plan: 'pro' },
                company_created: '2024-01-01T00:00:00.000Z',
                company_updated: '2024-01-01T00:00:00.000Z',
                user_email: 'user@example.com',
                user_name: 'Test User',
              }],
            }),
          },
        } as Server;
        return await callback(mockNileWithoutContext);
      });

      // Execute
      const result = await companyService.getUserCompanies(mockUserId, mockUserId);

      // Verify
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        userId: mockUserId,
        companyId: mockCompanyId,
        role: 'admin',
      });
      expect(result[0].company).toMatchObject({
        name: 'Test Company',
        email: 'test@company.com',
      });
    });

    it('should allow staff to view other user companies', async () => {
      // Setup mocks
      mockAuthService.isStaffUser.mockResolvedValue(true);
      mockTenantService.withoutTenantContext.mockImplementation(async (callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithoutContext = {
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [{
                ...mockUserCompanyRow,
                company_name: 'Test Company',
                company_email: 'test@company.com',
                company_settings: { plan: 'pro' },
                company_created: '2024-01-01T00:00:00.000Z',
                company_updated: '2024-01-01T00:00:00.000Z',
                user_email: 'user@example.com',
                user_name: 'Test User',
              }],
            }),
          },
        } as Server;
        return await callback(mockNileWithoutContext);
      });

      // Execute
      const result = await companyService.getUserCompanies(mockUserId, mockStaffUserId);

      // Verify
      expect(result).toHaveLength(1);
      expect(mockAuthService.isStaffUser).toHaveBeenCalledWith(mockStaffUserId);
    });

    it('should throw access error for non-staff viewing other user companies', async () => {
      // Setup mocks
      mockAuthService.isStaffUser.mockResolvedValue(false);

      // Execute & Verify
      await expect(
        companyService.getUserCompanies(mockUserId, 'other-user-id')
      ).rejects.toThrow(CompanyAccessError);
    });
  });

  describe('addUserToCompany', () => {
    it('should add user to company with valid permissions', async () => {
      // Setup mocks
      companyService.validateCompanyAccess = jest.fn().mockResolvedValue(true);
      mockTenantService.validateTenantAccess.mockResolvedValue(true);
      mockTenantService.withTenantContext.mockImplementation(async (_tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithContext = {
          db: {
            query: jest.fn()
              .mockResolvedValueOnce({ rows: [{ id: mockCompanyId }] }) // Company exists check
              .mockResolvedValueOnce({ rows: [mockUserCompanyRow] }), // Insert user-company
          },
        } as Server;
        return await callback(mockNileWithContext);
      });

      // Execute
      const result = await companyService.addUserToCompany(
        mockTenantId,
        mockUserId,
        mockCompanyId,
        'admin',
        { canManageUsers: true },
        mockUserId
      );

      // Verify
      expect(result).toMatchObject({
        userId: mockUserId,
        companyId: mockCompanyId,
        role: 'admin',
        permissions: { canManageUsers: true },
      });
      expect(companyService.validateCompanyAccess).toHaveBeenCalledWith(
        mockUserId,
        mockTenantId,
        mockCompanyId,
        'admin'
      );
    });

    it('should throw error when user does not have tenant access', async () => {
      // Setup mocks
      companyService.validateCompanyAccess = jest.fn().mockResolvedValue(true);
      mockTenantService.validateTenantAccess.mockResolvedValue(false);

      // Execute & Verify
      await expect(
        companyService.addUserToCompany(
          mockTenantId,
          mockUserId,
          mockCompanyId,
          'member',
          {},
          mockUserId
        )
      ).rejects.toThrow(CompanyError);
    });

    it('should throw not found error when company does not exist', async () => {
      // Setup mocks
      companyService.validateCompanyAccess = jest.fn().mockResolvedValue(true);
      mockTenantService.validateTenantAccess.mockResolvedValue(true);
      mockTenantService.withTenantContext.mockImplementation(async (_tenantId: string, callback: (nile: Server) => Promise<unknown>) => {
        const mockNileWithContext = {
          db: {
            query: jest.fn().mockResolvedValue({
              rows: [],
            }),
          },
        } as Server;
        return await callback(mockNileWithContext);
      });

      // Execute & Verify
      await expect(
        companyService.addUserToCompany(
          mockTenantId,
          mockUserId,
          mockCompanyId,
          'member',
          {},
          mockUserId
        )
      ).rejects.toThrow(CompanyNotFoundError);
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getCompanyService();
      const instance2 = getCompanyService();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = getCompanyService();
      resetCompanyService();
      const instance2 = getCompanyService();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Setup mocks
      mockTenantService.withTenantContext.mockRejectedValue(new Error('Database connection failed'));

      // Execute & Verify
      await expect(
        companyService.getCompaniesForTenant(mockTenantId)
      ).rejects.toThrow(CompanyError);
    });

    it('should preserve specific error types', async () => {
      // Setup mocks
      mockTenantService.validateTenantAccess.mockResolvedValue(false);

      // Execute & Verify
      await expect(
        companyService.getCompaniesForTenant(mockTenantId, mockUserId)
      ).rejects.toThrow(CompanyAccessError);
    });
  });
});
