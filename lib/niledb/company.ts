/**
 * NileDB Company Management Service
 *
 * Provides comprehensive company management functionality using NileDB's native
 * multi-tenant architecture with integration to TenantService and AuthService.
 * Preserves all existing business logic while adapting to NileDB patterns.
 *
 * @see {@link ../../docs/niledb-setup.md} for database setup and configuration details
 */

import type { Server } from '@niledatabase/server';
import { getNileClient } from './client';
import { getTenantService, type TenantService } from './tenant';
import { getAuthService, type AuthService } from './auth';

// Company Types
export interface Company {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateCompanyData {
  name: string;
  email?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  settings?: Record<string, unknown>;
}

export interface UserCompany {
  id: string;
  tenantId: string;
  userId: string;
  companyId: string;
  role: 'member' | 'admin' | 'owner';
  permissions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // Joined data
  company?: Company;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface CompanyStatistics {
  userCount: number;
  adminCount: number;
  ownerCount: number;
  totalDomains: number;
  totalMailboxes: number;
  createdAt: Date;
  lastActivity?: Date;
}

// Company Management Errors
export class CompanyError extends Error {
  constructor(
    msg: string,
    public code: string = 'COMPANY_ERROR'
  ) {
    super(msg);
    this.name = 'CompanyError';
  }
}

export class CompanyAccessError extends CompanyError {
  constructor(
    msg: string,
    public companyId?: string,
    public tenantId?: string
  ) {
    super(msg, 'COMPANY_ACCESS_DENIED');
  }
}

export class CompanyNotFoundError extends CompanyError {
  constructor(companyId: string, tenantId?: string) {
    super(
      `Company not found: ${companyId}${tenantId ? ` in tenant ${tenantId}` : ''}`,
      'COMPANY_NOT_FOUND'
    );
  }
}

export class CompanyValidationError extends CompanyError {
  constructor(msg: string, public field?: string) {
    super(msg, 'COMPANY_VALIDATION_ERROR');
  }
}

/**
 * Company Management Service Class
 * 
 * Handles all company operations using NileDB's tenant-aware architecture
 * with integration to TenantService for access control and AuthService for
 * staff privilege management.
 */
export class CompanyService {
  private nile: Server;
  private tenantService: TenantService;
  private authService: AuthService;

  constructor(nileClient?: Server) {
    this.nile = nileClient || getNileClient();
    this.tenantService = getTenantService();
    this.authService = getAuthService();
  }

  /**
   * Validate UUID format
   */
  private validateUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Get all companies for a tenant (tenant-scoped)
   */
  async getCompaniesForTenant(
    tenantId: string,
    requestingUserId?: string
  ): Promise<Company[]> {
    try {
      // Validate user has access to tenant if specified
      if (requestingUserId) {
        const hasAccess = await this.tenantService.validateTenantAccess(
          requestingUserId,
          tenantId,
          'member'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to view companies', undefined, tenantId);
        }
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            id,
            tenant_id,
            name,
            email,
            settings,
            created,
            updated,
            deleted
          FROM companies
          WHERE deleted IS NULL
          ORDER BY name
        `
        );
      });

      return result.rows.map(this.mapRowToCompany);
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to get companies for tenant:', error);
      throw new CompanyError('Failed to retrieve companies');
    }
  }

  /**
   * Get company by ID within tenant context
   */
  async getCompanyById(
    tenantId: string,
    companyId: string,
    requestingUserId?: string
  ): Promise<Company | null> {
    try {
      // Validate UUID format
      if (!this.validateUuid(tenantId)) {
        throw new CompanyValidationError('tenant_id must be a valid UUID', 'tenantId');
      }
      if (!this.validateUuid(companyId)) {
        throw new CompanyValidationError('company_id must be a valid UUID', 'companyId');
      }

      // Validate user has access if specified
      if (requestingUserId) {
        const hasAccess = await this.validateCompanyAccess(
          requestingUserId,
          tenantId,
          companyId,
          'member'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to view company', companyId, tenantId);
        }
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            id,
            tenant_id,
            name,
            email,
            settings,
            created,
            updated,
            deleted
          FROM companies
          WHERE id = $1 AND deleted IS NULL
        `,
          [companyId]
        );
      });

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToCompany(result.rows[0]);
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to get company by ID:', error);
      throw new CompanyError('Failed to retrieve company');
    }
  }

  /**
   * Create a new company within tenant
   */
  async createCompany(
    tenantId: string,
    companyData: CreateCompanyData,
    creatorUserId?: string
  ): Promise<Company> {
    try {
      // Validate input
      this.validateCompanyData(companyData);

      // Validate user has permission if specified
      if (creatorUserId) {
        const hasAccess = await this.tenantService.validateTenantAccess(
          creatorUserId,
          tenantId,
          'admin'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to create company', undefined, tenantId);
        }
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          INSERT INTO companies (tenant_id, name, email, settings)
          VALUES ($1, $2, $3, $4)
          RETURNING id, tenant_id, name, email, settings, created, updated, deleted
        `,
          [
            tenantId,
            companyData.name.trim(),
            companyData.email?.trim() || null,
            companyData.settings || {}
          ]
        );
      });

      const company = this.mapRowToCompany(result.rows[0]);

      // If creator is specified, add them as owner
      if (creatorUserId) {
        await this.addUserToCompany(
          tenantId,
          creatorUserId,
          company.id,
          'owner',
          {},
          creatorUserId
        );
      }

      return company;
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to create company:', error);
      throw new CompanyError('Failed to create company');
    }
  }

  /**
   * Update company information
   */
  async updateCompany(
    tenantId: string,
    companyId: string,
    updates: UpdateCompanyData,
    updatingUserId?: string
  ): Promise<Company> {
    try {
      // Validate input
      if (Object.keys(updates).length === 0) {
        throw new CompanyValidationError('No updates provided');
      }

      // Validate user has permission if specified
      if (updatingUserId) {
        const hasAccess = await this.validateCompanyAccess(
          updatingUserId,
          tenantId,
          companyId,
          'admin'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to update company', companyId, tenantId);
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: unknown[] = [companyId];
      let paramIndex = 2;

      if (updates.name !== undefined) {
        if (!updates.name.trim()) {
          throw new CompanyValidationError('Company name cannot be empty', 'name');
        }
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updates.name.trim());
      }

      if (updates.email !== undefined) {
        if (updates.email && !this.isValidEmail(updates.email)) {
          throw new CompanyValidationError('Invalid email format', 'email');
        }
        updateFields.push(`email = $${paramIndex++}`);
        updateValues.push(updates.email?.trim() || null);
      }

      if (updates.settings !== undefined) {
        updateFields.push(`settings = $${paramIndex++}`);
        updateValues.push(updates.settings);
      }

      if (updateFields.length === 0) {
        throw new CompanyValidationError('No valid updates provided');
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          UPDATE companies 
          SET ${updateFields.join(', ')}, updated = CURRENT_TIMESTAMP
          WHERE id = $1 AND deleted IS NULL
          RETURNING id, tenant_id, name, email, settings, created, updated, deleted
        `,
          updateValues
        );
      });

      if (result.rows.length === 0) {
        throw new CompanyNotFoundError(companyId, tenantId);
      }

      return this.mapRowToCompany(result.rows[0]);
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to update company:', error);
      throw new CompanyError('Failed to update company');
    }
  }

  /**
   * Delete company (soft delete)
   */
  async deleteCompany(
    tenantId: string,
    companyId: string,
    deletingUserId?: string
  ): Promise<void> {
    try {
      // Validate user has permission if specified
      if (deletingUserId) {
        const hasAccess = await this.validateCompanyAccess(
          deletingUserId,
          tenantId,
          companyId,
          'owner'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to delete company', companyId, tenantId);
        }
      }

      await this.tenantService.withTenantContext(tenantId, async (nile) => {
        // Soft delete company
        const companyResult = await nile.db.query(
          `
          UPDATE companies
          SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
          WHERE id = $1 AND deleted IS NULL
          RETURNING id
        `,
          [companyId]
        );

        if (companyResult.rows.length === 0) {
          throw new CompanyNotFoundError(companyId, tenantId);
        }

        // Also soft delete all user-company relationships
        await nile.db.query(
          `
          UPDATE user_companies
          SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
          WHERE company_id = $1 AND tenant_id = $2 AND deleted IS NULL
        `,
          [companyId, tenantId]
        );
      });
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to delete company:', error);
      throw new CompanyError('Failed to delete company');
    }
  }

  /**
   * Get all companies for a user across tenants (staff or self only)
   */
  async getUserCompanies(
    userId: string,
    requestingUserId?: string
  ): Promise<UserCompany[]> {
    try {
      // Validate access - staff or self only
      if (requestingUserId && requestingUserId !== userId) {
        const isStaff = await this.authService.isStaffUser(requestingUserId);
        if (!isStaff) {
          throw new CompanyAccessError('Can only view your own companies');
        }
      }

      const result = await this.tenantService.withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            uc.id,
            uc.tenant_id,
            uc.user_id,
            uc.company_id,
            uc.role,
            uc.permissions,
            uc.created,
            uc.updated,
            uc.deleted,
            c.name as company_name,
            c.email as company_email,
            c.settings as company_settings,
            c.created as company_created,
            c.updated as company_updated,
            u.email as user_email,
            u.name as user_name
          FROM public.user_companies uc
          JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
          JOIN users.users u ON uc.user_id = u.id
          WHERE uc.user_id = $1 
            AND uc.deleted IS NULL 
            AND c.deleted IS NULL 
            AND u.deleted IS NULL
          ORDER BY c.name
        `,
          [userId]
        );
      });

      return result.rows.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        tenantId: row.tenant_id as string,
        userId: row.user_id as string,
        companyId: row.company_id as string,
        role: row.role as 'member' | 'admin' | 'owner',
        permissions: (row.permissions as Record<string, unknown>) || {},
        createdAt: new Date(row.created as string),
        updatedAt: new Date(row.updated as string),
        deletedAt: row.deleted ? new Date(row.deleted as string) : undefined,
        company: {
          id: row.company_id as string,
          tenantId: row.tenant_id as string,
          name: row.company_name as string,
          email: row.company_email as string,
          settings: (row.company_settings as Record<string, unknown>) || {},
          createdAt: new Date(row.company_created as string),
          updatedAt: new Date(row.company_updated as string),
        },
        user: {
          id: row.user_id as string,
          email: row.user_email as string,
          name: row.user_name as string,
        },
      }));
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to get user companies:', error);
      throw new CompanyError('Failed to retrieve user companies');
    }
  }

  /**
   * Get all users for a company
   */
  async getCompanyUsers(
    tenantId: string,
    companyId: string,
    requestingUserId?: string
  ): Promise<UserCompany[]> {
    try {
      // Validate user has access if specified
      if (requestingUserId) {
        const hasAccess = await this.validateCompanyAccess(
          requestingUserId,
          tenantId,
          companyId,
          'member'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to view company users', companyId, tenantId);
        }
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            uc.id,
            uc.tenant_id,
            uc.user_id,
            uc.company_id,
            uc.role,
            uc.permissions,
            uc.created,
            uc.updated,
            uc.deleted,
            u.email as user_email,
            u.name as user_name
          FROM user_companies uc
          JOIN users.users u ON uc.user_id = u.id
          WHERE uc.company_id = $1 
            AND uc.deleted IS NULL 
            AND u.deleted IS NULL
          ORDER BY uc.role DESC, u.name, u.email
        `,
          [companyId]
        );
      });

      return result.rows.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        tenantId: row.tenant_id as string,
        userId: row.user_id as string,
        companyId: row.company_id as string,
        role: row.role as 'member' | 'admin' | 'owner',
        permissions: (row.permissions as Record<string, unknown>) || {},
        createdAt: new Date(row.created as string),
        updatedAt: new Date(row.updated as string),
        deletedAt: row.deleted ? new Date(row.deleted as string) : undefined,
        user: {
          id: row.user_id as string,
          email: row.user_email as string,
          name: row.user_name as string,
        },
      }));
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to get company users:', error);
      throw new CompanyError('Failed to retrieve company users');
    }
  }

  /**
   * Add user to company with specified role
   */
  async addUserToCompany(
    tenantId: string,
    userId: string,
    companyId: string,
    role: 'member' | 'admin' | 'owner' = 'member',
    permissions: Record<string, unknown> = {},
    addingUserId?: string
  ): Promise<UserCompany> {
    try {
      // Validate adding user has permission if specified
      if (addingUserId) {
        const hasAccess = await this.validateCompanyAccess(
          addingUserId,
          tenantId,
          companyId,
          'admin'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to add users', companyId, tenantId);
        }
      }

      // Validate user exists and has tenant access
      const userExists = await this.tenantService.validateTenantAccess(userId, tenantId);
      if (!userExists) {
        throw new CompanyError('User does not have access to this tenant');
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        // Check if company exists
        const companyResult = await nile.db.query(
          'SELECT id FROM companies WHERE id = $1 AND deleted IS NULL',
          [companyId]
        );

        if (companyResult.rows.length === 0) {
          throw new CompanyNotFoundError(companyId, tenantId);
        }

        // Add user to company (or update if already exists)
        return await nile.db.query(
          `
          INSERT INTO user_companies (tenant_id, user_id, company_id, role, permissions)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (tenant_id, user_id, company_id) DO UPDATE SET
            role = EXCLUDED.role,
            permissions = EXCLUDED.permissions,
            updated = CURRENT_TIMESTAMP,
            deleted = NULL
          RETURNING id, tenant_id, user_id, company_id, role, permissions, created, updated, deleted
        `,
          [tenantId, userId, companyId, role, permissions]
        );
      });

      const userCompany = result.rows[0];
      return {
        id: userCompany.id,
        tenantId: userCompany.tenant_id,
        userId: userCompany.user_id,
        companyId: userCompany.company_id,
        role: userCompany.role,
        permissions: userCompany.permissions || {},
        createdAt: new Date(userCompany.created),
        updatedAt: new Date(userCompany.updated),
        deletedAt: userCompany.deleted ? new Date(userCompany.deleted) : undefined,
      };
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to add user to company:', error);
      throw new CompanyError('Failed to add user to company');
    }
  }

  /**
   * Remove user from company
   */
  async removeUserFromCompany(
    tenantId: string,
    userId: string,
    companyId: string,
    removingUserId?: string
  ): Promise<void> {
    try {
      // Validate removing user has permission if specified
      if (removingUserId) {
        const hasAccess = await this.validateCompanyAccess(
          removingUserId,
          tenantId,
          companyId,
          'admin'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to remove users', companyId, tenantId);
        }

        // Prevent removing the only owner
        if (userId !== removingUserId) {
          const isOnlyOwner = await this.isOnlyCompanyOwner(tenantId, companyId, userId);
          if (isOnlyOwner) {
            throw new CompanyError('Cannot remove the only owner of the company');
          }
        }
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          UPDATE user_companies 
          SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND company_id = $2 AND tenant_id = $3 AND deleted IS NULL
          RETURNING id
        `,
          [userId, companyId, tenantId]
        );
      });

      if (result.rows.length === 0) {
        throw new CompanyError('User is not a member of this company');
      }
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to remove user from company:', error);
      throw new CompanyError('Failed to remove user from company');
    }
  }

  /**
   * Update user role in company
   */
  async updateUserCompanyRole(
    tenantId: string,
    userId: string,
    companyId: string,
    role: 'member' | 'admin' | 'owner',
    permissions: Record<string, unknown> = {},
    updatingUserId?: string
  ): Promise<UserCompany> {
    try {
      // Validate updating user has permission if specified
      if (updatingUserId) {
        const hasAccess = await this.validateCompanyAccess(
          updatingUserId,
          tenantId,
          companyId,
          'admin'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to update user roles', companyId, tenantId);
        }
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          UPDATE user_companies 
          SET role = $1, permissions = $2, updated = CURRENT_TIMESTAMP
          WHERE user_id = $3 AND company_id = $4 AND tenant_id = $5 AND deleted IS NULL
          RETURNING id, tenant_id, user_id, company_id, role, permissions, created, updated, deleted
        `,
          [role, permissions, userId, companyId, tenantId]
        );
      });

      if (result.rows.length === 0) {
        throw new CompanyError('User is not a member of this company');
      }

      const userCompany = result.rows[0];
      return {
        id: userCompany.id,
        tenantId: userCompany.tenant_id,
        userId: userCompany.user_id,
        companyId: userCompany.company_id,
        role: userCompany.role,
        permissions: userCompany.permissions || {},
        createdAt: new Date(userCompany.created),
        updatedAt: new Date(userCompany.updated),
        deletedAt: userCompany.deleted ? new Date(userCompany.deleted) : undefined,
      };
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to update user company role:', error);
      throw new CompanyError('Failed to update user company role');
    }
  }

  /**
   * Get company statistics
   */
  async getCompanyStatistics(
    tenantId: string,
    companyId: string,
    requestingUserId?: string
  ): Promise<CompanyStatistics> {
    try {
      // Validate user has access if specified
      if (requestingUserId) {
        const hasAccess = await this.validateCompanyAccess(
          requestingUserId,
          tenantId,
          companyId,
          'member'
        );
        if (!hasAccess) {
          throw new CompanyAccessError('Insufficient permissions to view company statistics', companyId, tenantId);
        }
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            c.created,
            COUNT(DISTINCT uc.user_id) as user_count,
            COUNT(DISTINCT CASE WHEN uc.role = 'admin' THEN uc.user_id END) as admin_count,
            COUNT(DISTINCT CASE WHEN uc.role = 'owner' THEN uc.user_id END) as owner_count,
            -- These would be actual counts from related tables in a real implementation
            0 as total_domains,
            0 as total_mailboxes,
            MAX(uc.updated) as last_activity
          FROM companies c
          LEFT JOIN user_companies uc ON c.id = uc.company_id AND c.tenant_id = uc.tenant_id AND uc.deleted IS NULL
          WHERE c.id = $1 AND c.deleted IS NULL
          GROUP BY c.id, c.created
        `,
          [companyId]
        );
      });

      if (result.rows.length === 0) {
        throw new CompanyNotFoundError(companyId, tenantId);
      }

      const row = result.rows[0];
      return {
        userCount: parseInt(row.user_count || '0'),
        adminCount: parseInt(row.admin_count || '0'),
        ownerCount: parseInt(row.owner_count || '0'),
        totalDomains: parseInt(row.total_domains || '0'),
        totalMailboxes: parseInt(row.total_mailboxes || '0'),
        createdAt: new Date(row.created),
        lastActivity: row.last_activity ? new Date(row.last_activity) : undefined,
      };
    } catch (error) {
      if (error instanceof CompanyError) {
        throw error;
      }
      console.error('Failed to get company statistics:', error);
      throw new CompanyError('Failed to retrieve company statistics');
    }
  }

  /**
   * Validate user access to company with role requirement
   */
  async validateCompanyAccess(
    userId: string,
    tenantId: string,
    companyId: string,
    requiredRole?: 'member' | 'admin' | 'owner'
  ): Promise<boolean> {
    try {
      // Check if user is staff (staff can access any company)
      const isStaff = await this.authService.isStaffUser(userId);
      if (isStaff) {
        return true;
      }

      // Check tenant access first
      const hasTenantAccess = await this.tenantService.validateTenantAccess(userId, tenantId);
      if (!hasTenantAccess) {
        return false;
      }

      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          SELECT uc.role
          FROM user_companies uc
          WHERE uc.user_id = $1 AND uc.company_id = $2 AND uc.tenant_id = $3 AND uc.deleted IS NULL
        `,
          [userId, companyId, tenantId]
        );
      });

      if (result.rows.length === 0) {
        return false;
      }

      // If no specific role required, just check membership
      if (!requiredRole) {
        return true;
      }

      // Check role hierarchy
      const userRole = result.rows[0].role;
      const roleHierarchy = { member: 1, admin: 2, owner: 3 };
      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
      const requiredLevel = roleHierarchy[requiredRole];

      return userLevel >= requiredLevel;
    } catch (error) {
      console.error('Failed to validate company access:', error);
      if ((error instanceof CompanyError && error.message.includes('must be a valid UUID')) ||
          (error instanceof Error && (error.message.includes('must be an uuid') ||
                                     error.message.includes('Invalid UUID format')))) {
        throw error; // Re-throw UUID validation errors
      }
      return false; // Return false for other errors (like database errors)
    }
  }

  /**
   * Check if user is the only owner of a company
   */
  async isOnlyCompanyOwner(
    tenantId: string,
    companyId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const result = await this.tenantService.withTenantContext(tenantId, async (nile) => {
        return await nile.db.query(
          `
          SELECT COUNT(*) as owner_count
          FROM user_companies
          WHERE company_id = $1 AND tenant_id = $2 AND role = 'owner' AND deleted IS NULL
        `,
          [companyId, tenantId]
        );
      });

      const ownerCount = parseInt(result.rows[0]?.owner_count || '0');
      
      if (ownerCount <= 1) {
        // Check if this user is that owner
        const userIsOwner = await this.tenantService.withTenantContext(tenantId, async (nile) => {
          const ownerResult = await nile.db.query(
            `
            SELECT user_id
            FROM user_companies
            WHERE user_id = $1 AND company_id = $2 AND tenant_id = $3 AND role = 'owner' AND deleted IS NULL
          `,
            [userId, companyId, tenantId]
          );
          return ownerResult.rows.length > 0;
        });

        return userIsOwner;
      }

      return false;
    } catch (error) {
      console.error('Failed to check if only company owner:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private mapRowToCompany(row: Record<string, unknown>): Company {
    return {
      id: row.id as string,
      tenantId: row.tenant_id as string,
      name: row.name as string,
      email: row.email as string,
      settings: (row.settings as Record<string, unknown>) || {},
      createdAt: new Date(row.created as string),
      updatedAt: new Date(row.updated as string),
      deletedAt: row.deleted ? new Date(row.deleted as string) : undefined,
    };
  }

  private validateCompanyData(data: CreateCompanyData | UpdateCompanyData): void {
    if ('name' in data && data.name !== undefined) {
      if (!data.name || !data.name.trim()) {
        throw new CompanyValidationError('Company name is required', 'name');
      }
      if (data.name.trim().length > 255) {
        throw new CompanyValidationError('Company name is too long (max 255 characters)', 'name');
      }
    }

    if ('email' in data && data.email !== undefined && data.email) {
      if (!this.isValidEmail(data.email)) {
        throw new CompanyValidationError('Invalid email format', 'email');
      }
    }

    if ('settings' in data && data.settings !== undefined) {
      if (typeof data.settings !== 'object' || data.settings === null) {
        throw new CompanyValidationError('Settings must be a valid object', 'settings');
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
let companyServiceInstance: CompanyService | null = null;

export const getCompanyService = (): CompanyService => {
  if (!companyServiceInstance) {
    companyServiceInstance = new CompanyService();
  }
  return companyServiceInstance;
};

// Reset instance (useful for testing)
export const resetCompanyService = (): void => {
  companyServiceInstance = null;
};
