/**
 * NileDB Tenant Management Service
 *
 * Provides comprehensive tenant management functionality using NileDB's native
 * multi-tenant architecture with automatic tenant isolation and cross-schema
 * relationship management.
 *
 * @see {@link ../../docs/niledb-setup.md} for database setup and configuration details
 */

import type { Server } from '@niledatabase/server';
import { getNileClient, withTenantContext, withoutTenantContext } from './client';
import { getAuthService } from './auth';

// Tenant Types
export interface NileTenant {
  id: string;
  name: string;
  created: string;
  updated?: string;
  deleted?: string;
}

export interface TenantSettings {
  tenantId: string;
  settings: Record<string, unknown>;
  billingStatus: 'active' | 'suspended' | 'cancelled';
  subscriptionPlan: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantUser {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  created: string;
  updated?: string;
}

interface TenantUserRow {
  user_id: string;
  tenant_id: string;
  email: string;
  roles: string[];
  created: string;
  updated?: string;
}

export interface TenantMembership {
  tenant: NileTenant;
  roles: string[];
  joinedAt: Date;
  companies: CompanyMembership[];
}

export interface CompanyMembership {
  id: string;
  name: string;
  role: 'member' | 'admin' | 'owner';
  permissions: Record<string, unknown>;
}

export interface CreateTenantData {
  name: string;
  settings?: Record<string, unknown>;
  billingStatus?: 'active' | 'suspended' | 'cancelled';
  subscriptionPlan?: string;
}

export interface UpdateTenantData {
  name?: string;
  settings?: Record<string, unknown>;
  billingStatus?: 'active' | 'suspended' | 'cancelled';
  subscriptionPlan?: string;
}

// Tenant Management Errors
export class TenantError extends Error {
  constructor(
    message: string,
    public code: string = 'TENANT_ERROR'
  ) {
    super(message);
    this.name = 'TenantError';
  }
}

export class TenantAccessError extends TenantError {
  constructor(
    message: string,
    public tenantId?: string
  ) {
    super(message, 'TENANT_ACCESS_DENIED');
  }
}

export class TenantNotFoundError extends TenantError {
  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`, 'TENANT_NOT_FOUND');
  }
}

export class TenantContextError extends TenantError {
  constructor(message: string = 'Tenant context not set') {
    super(message, 'TENANT_CONTEXT_ERROR');
  }
}

/**
 * Tenant Management Service Class
 * 
 * Handles all tenant operations using NileDB's built-in multi-tenant architecture
 * with enhanced business logic for company-tenant relationships and user management.
 */
export class TenantService {
  private nile: Server;
  private authService: ReturnType<typeof getAuthService>;

  constructor(nileClient?: Server) {
    this.nile = nileClient || getNileClient();
    this.authService = getAuthService();
  }

  /**
   * Get current tenant from context (if set)
   */
  async getCurrentTenant(): Promise<NileTenant | null> {
    try {
      // This would typically be called within a tenant context
      // For now, we'll return null as context is managed by middleware
      return null;
    } catch (error) {
      console.error('Failed to get current tenant:', error);
      return null;
    }
  }

  /**
   * Get tenant by ID with validation
   */
  async getTenantById(tenantId: string): Promise<NileTenant | null> {
    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT id, name, created, updated, deleted
          FROM tenants
          WHERE id = $1 AND deleted IS NULL
        `,
          [tenantId]
        );
      });

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        created: row.created,
        updated: row.updated,
        deleted: row.deleted,
      };
    } catch (error) {
      console.error('Failed to get tenant by ID:', error);
      throw new TenantError('Failed to retrieve tenant');
    }
  }

  /**
   * Get all tenants for a user
   */
  async getUserTenants(userId: string): Promise<TenantMembership[]> {
    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            t.id as tenant_id,
            t.name as tenant_name,
            t.created as tenant_created,
            t.updated as tenant_updated,
            tu.roles as tenant_roles,
            tu.created as joined_at,
            c.id as company_id,
            c.name as company_name,
            uc.role as company_role,
            uc.permissions as company_permissions
          FROM users.tenant_users tu
          JOIN public.tenants t ON tu.tenant_id = t.id
          LEFT JOIN public.user_companies uc ON tu.user_id = uc.user_id AND tu.tenant_id = uc.tenant_id
          LEFT JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
          WHERE tu.user_id = $1 
            AND tu.deleted IS NULL 
            AND t.deleted IS NULL
            AND (uc.deleted IS NULL OR uc.deleted IS NULL)
            AND (c.deleted IS NULL OR c.deleted IS NULL)
          ORDER BY t.name, c.name
        `,
          [userId]
        );
      });

      // Group results by tenant
      const tenantMap = new Map<string, TenantMembership>();

      for (const row of result.rows) {
        const tenantId = row.tenant_id;
        
        if (!tenantMap.has(tenantId)) {
          tenantMap.set(tenantId, {
            tenant: {
              id: row.tenant_id,
              name: row.tenant_name,
              created: row.tenant_created,
              updated: row.tenant_updated,
            },
            roles: row.tenant_roles || [],
            joinedAt: new Date(row.joined_at),
            companies: [],
          });
        }

        const membership = tenantMap.get(tenantId)!;
        
        // Add company if it exists and not already added
        if (row.company_id && !membership.companies.find(c => c.id === row.company_id)) {
          membership.companies.push({
            id: row.company_id,
            name: row.company_name,
            role: row.company_role,
            permissions: row.company_permissions || {},
          });
        }
      }

      return Array.from(tenantMap.values());
    } catch (error) {
      console.error('Failed to get user tenants:', error);
      throw new TenantError('Failed to retrieve user tenants');
    }
  }

  /**
   * Create a new tenant
   */
  async createTenant(
    name: string,
    creatorUserId?: string,
    tenantData?: Omit<CreateTenantData, 'name'>
  ): Promise<NileTenant> {
    try {
      const result = await withoutTenantContext(async (nile) => {
        // Create tenant in NileDB
        const tenantResult = await nile.db.query(
          `
          INSERT INTO tenants (name)
          VALUES ($1)
          RETURNING id, name, created, updated
        `,
          [name]
        );

        const tenant = tenantResult.rows[0];

        // Create tenant settings if provided
        if (tenantData?.settings || tenantData?.billingStatus || tenantData?.subscriptionPlan) {
          await withTenantContext(tenant.id, async (tenantNile) => {
            await tenantNile.db.query(
              `
              INSERT INTO tenant_billing (
                tenant_id, 
                plan, 
                subscription_status
              )
              VALUES ($1, $2, $3)
            `,
              [
                tenant.id,
                tenantData.subscriptionPlan || 'free',
                tenantData.billingStatus || 'active'
              ]
            );
          });
        }

        // Add creator as tenant owner if specified
        if (creatorUserId) {
          await nile.db.query(
            `
            INSERT INTO users.tenant_users (tenant_id, user_id, email, roles)
            SELECT $1, $2, u.email, ARRAY['owner']
            FROM users.users u
            WHERE u.id = $2
          `,
            [tenant.id, creatorUserId]
          );
        }

        return tenant;
      });

      return {
        id: result.id,
        name: result.name,
        created: result.created,
        updated: result.updated,
      };
    } catch (error) {
      console.error('Failed to create tenant:', error);
      throw new TenantError('Failed to create tenant');
    }
  }

  /**
   * Update tenant information
   */
  async updateTenant(
    tenantId: string,
    updates: UpdateTenantData,
    userId?: string
  ): Promise<NileTenant> {
    try {
      // Validate user has access if userId provided
      if (userId) {
        const hasAccess = await this.validateTenantAccess(userId, tenantId, 'admin');
        if (!hasAccess) {
          throw new TenantAccessError('Insufficient permissions to update tenant', tenantId);
        }
      }

      const result = await withoutTenantContext(async (nile) => {
        // Update tenant basic info
        if (updates.name) {
          const tenantResult = await nile.db.query(
            `
            UPDATE tenants 
            SET name = $1, updated = CURRENT_TIMESTAMP
            WHERE id = $2 AND deleted IS NULL
            RETURNING id, name, created, updated
          `,
            [updates.name, tenantId]
          );

          if (tenantResult.rows.length === 0) {
            throw new TenantNotFoundError(tenantId);
          }
        }

        // Update tenant settings/billing if provided
        if (updates.settings || updates.billingStatus || updates.subscriptionPlan) {
          await withTenantContext(tenantId, async (tenantNile) => {
            const updateFields: string[] = [];
            const updateValues: unknown[] = [tenantId];
            let paramIndex = 2;

            if (updates.subscriptionPlan) {
              updateFields.push(`plan = $${paramIndex++}`);
              updateValues.push(updates.subscriptionPlan);
            }

            if (updates.billingStatus) {
              updateFields.push(`subscription_status = $${paramIndex++}`);
              updateValues.push(updates.billingStatus);
            }

            if (updateFields.length > 0) {
              await tenantNile.db.query(
                `
                INSERT INTO tenant_billing (tenant_id, plan, subscription_status)
                VALUES ($1, $2, $3)
                ON CONFLICT (tenant_id) DO UPDATE SET
                  ${updateFields.join(', ')},
                  updated = CURRENT_TIMESTAMP
              `,
                updateValues
              );
            }
          });
        }

        // Get updated tenant
        const finalResult = await nile.db.query(
          `
          SELECT id, name, created, updated
          FROM tenants
          WHERE id = $1 AND deleted IS NULL
        `,
          [tenantId]
        );

        return finalResult.rows[0];
      });

      return {
        id: result.id,
        name: result.name,
        created: result.created,
        updated: result.updated,
      };
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }
      console.error('Failed to update tenant:', error);
      throw new TenantError('Failed to update tenant');
    }
  }

  /**
   * Add user to tenant with specified roles
   */
  async addUserToTenant(
    userId: string,
    tenantId: string,
    roles: string[] = ['member'],
    addedByUserId?: string
  ): Promise<void> {
    try {
      // Validate adding user has permission if specified
      if (addedByUserId) {
        const hasAccess = await this.validateTenantAccess(addedByUserId, tenantId, 'admin');
        if (!hasAccess) {
          throw new TenantAccessError('Insufficient permissions to add users', tenantId);
        }
      }

      await withoutTenantContext(async (nile) => {
        // Check if user exists
        const userResult = await nile.db.query(
          'SELECT id, email FROM users.users WHERE id = $1 AND deleted IS NULL',
          [userId]
        );

        if (userResult.rows.length === 0) {
          throw new TenantError('User not found');
        }

        const user = userResult.rows[0];

        // Check if tenant exists
        const tenantResult = await nile.db.query(
          'SELECT id FROM tenants WHERE id = $1 AND deleted IS NULL',
          [tenantId]
        );

        if (tenantResult.rows.length === 0) {
          throw new TenantNotFoundError(tenantId);
        }

        // Add user to tenant (or update roles if already exists)
        await nile.db.query(
          `
          INSERT INTO users.tenant_users (tenant_id, user_id, email, roles)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (tenant_id, user_id) DO UPDATE SET
            roles = EXCLUDED.roles,
            updated = CURRENT_TIMESTAMP,
            deleted = NULL
        `,
          [tenantId, userId, user.email, roles]
        );
      });
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }
      console.error('Failed to add user to tenant:', error);
      throw new TenantError('Failed to add user to tenant');
    }
  }

  /**
   * Remove user from tenant
   */
  async removeUserFromTenant(
    userId: string,
    tenantId: string,
    removedByUserId?: string
  ): Promise<void> {
    try {
      // Validate removing user has permission if specified
      if (removedByUserId) {
        const hasAccess = await this.validateTenantAccess(removedByUserId, tenantId, 'admin');
        if (!hasAccess) {
          throw new TenantAccessError('Insufficient permissions to remove users', tenantId);
        }

        // Prevent self-removal if user is the only owner
        if (userId === removedByUserId) {
          const isOnlyOwner = await this.isOnlyTenantOwner(userId, tenantId);
          if (isOnlyOwner) {
            throw new TenantError('Cannot remove yourself as the only tenant owner');
          }
        }
      }

      await withoutTenantContext(async (nile) => {
        // Soft delete from tenant_users
        const result = await nile.db.query(
          `
          UPDATE users.tenant_users 
          SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND tenant_id = $2 AND deleted IS NULL
          RETURNING user_id
        `,
          [userId, tenantId]
        );

        if (result.rows.length === 0) {
          throw new TenantError('User is not a member of this tenant');
        }

        // Also remove from all companies in this tenant
        await withTenantContext(tenantId, async (tenantNile) => {
          await tenantNile.db.query(
            `
            UPDATE user_companies 
            SET deleted = CURRENT_TIMESTAMP, updated = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND tenant_id = $2 AND deleted IS NULL
          `,
            [userId, tenantId]
          );
        });
      });
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }
      console.error('Failed to remove user from tenant:', error);
      throw new TenantError('Failed to remove user from tenant');
    }
  }

  /**
   * Update user roles in tenant
   */
  async updateUserTenantRoles(
    userId: string,
    tenantId: string,
    roles: string[],
    updatedByUserId?: string
  ): Promise<void> {
    try {
      // Validate updating user has permission if specified
      if (updatedByUserId) {
        const hasAccess = await this.validateTenantAccess(updatedByUserId, tenantId, 'admin');
        if (!hasAccess) {
          throw new TenantAccessError('Insufficient permissions to update user roles', tenantId);
        }
      }

      await withoutTenantContext(async (nile) => {
        const result = await nile.db.query(
          `
          UPDATE users.tenant_users 
          SET roles = $1, updated = CURRENT_TIMESTAMP
          WHERE user_id = $2 AND tenant_id = $3 AND deleted IS NULL
          RETURNING user_id
        `,
          [roles, userId, tenantId]
        );

        if (result.rows.length === 0) {
          throw new TenantError('User is not a member of this tenant');
        }
      });
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }
      console.error('Failed to update user tenant roles:', error);
      throw new TenantError('Failed to update user tenant roles');
    }
  }

  /**
   * Get all users in a tenant
   */
  async getTenantUsers(tenantId: string, requestingUserId?: string): Promise<TenantUser[]> {
    try {
      // Validate requesting user has access if specified
      if (requestingUserId) {
        const hasAccess = await this.validateTenantAccess(requestingUserId, tenantId, 'member');
        if (!hasAccess) {
          throw new TenantAccessError('Insufficient permissions to view tenant users', tenantId);
        }
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            tu.user_id,
            tu.tenant_id,
            tu.email,
            tu.roles,
            tu.created,
            tu.updated
          FROM users.tenant_users tu
          WHERE tu.tenant_id = $1 AND tu.deleted IS NULL
          ORDER BY tu.created
        `,
          [tenantId]
        );
      });

      return result.rows.map((row: TenantUserRow) => ({
        userId: row.user_id,
        tenantId: row.tenant_id,
        email: row.email,
        roles: row.roles || [],
        created: row.created,
        updated: row.updated,
      }));
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }
      console.error('Failed to get tenant users:', error);
      throw new TenantError('Failed to retrieve tenant users');
    }
  }

  /**
   * Validate UUID format
   */
  private validateUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Validate user access to tenant with role requirement
   */
  async validateTenantAccess(
    userId: string,
    tenantId: string,
    requiredRole?: 'member' | 'admin' | 'owner'
  ): Promise<boolean> {
    try {
      // Validate UUID format
      if (!this.validateUuid(userId)) {
        throw new TenantError('user_id must be an uuid: invalid id: ' + userId);
      }
      if (!this.validateUuid(tenantId)) {
        throw new TenantError('tenant_id must be an uuid: invalid id: ' + tenantId);
      }

      // Check if user is staff (staff can access any tenant)
      const isStaff = await this.authService.isStaffUser(userId);
      if (isStaff) {
        return true;
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            tu.roles as tenant_roles,
            uc.role as company_role
          FROM users.tenant_users tu
          LEFT JOIN public.user_companies uc ON tu.user_id = uc.user_id AND tu.tenant_id = uc.tenant_id
          WHERE tu.user_id = $1 AND tu.tenant_id = $2 
            AND tu.deleted IS NULL 
            AND (uc.deleted IS NULL OR uc.deleted IS NULL)
        `,
          [userId, tenantId]
        );
      });

      if (result.rows.length === 0) {
        return false;
      }

      // If no specific role required, just check membership
      if (!requiredRole) {
        return true;
      }

      // Check if user has required role in any company
      const roleHierarchy = { member: 1, admin: 2, owner: 3 };
      const requiredLevel = roleHierarchy[requiredRole];

      for (const row of result.rows) {
        const companyRole = row.company_role;
        if (companyRole) {
          const userLevel = roleHierarchy[companyRole as keyof typeof roleHierarchy] || 0;
          if (userLevel >= requiredLevel) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to validate tenant access:', error);
      if (error instanceof TenantError && error.message.includes('must be an uuid')) {
        throw error; // Re-throw UUID validation errors
      }
      return false; // Return false for other errors (like database errors)
    }
  }

  /**
   * Check if user is the only owner of a tenant
   */
  async isOnlyTenantOwner(userId: string, tenantId: string): Promise<boolean> {
    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT COUNT(DISTINCT uc.user_id) as owner_count
          FROM public.user_companies uc
          WHERE uc.tenant_id = $1 AND uc.role = 'owner' AND uc.deleted IS NULL
        `,
          [tenantId]
        );
      });

      const ownerCount = parseInt(result.rows[0]?.owner_count || '0');
      
      if (ownerCount <= 1) {
        // Check if this user is that owner
        const userIsOwner = await withoutTenantContext(async (nile) => {
          const ownerResult = await nile.db.query(
            `
            SELECT user_id
            FROM public.user_companies
            WHERE user_id = $1 AND tenant_id = $2 AND role = 'owner' AND deleted IS NULL
          `,
            [userId, tenantId]
          );
          return ownerResult.rows.length > 0;
        });

        return userIsOwner;
      }

      return false;
    } catch (error) {
      console.error('Failed to check if only tenant owner:', error);
      return false;
    }
  }

  /**
   * Execute operation with tenant context
   */
  async withTenantContext<T>(
    tenantId: string,
    callback: (nile: Server) => Promise<T>
  ): Promise<T> {
    return await withTenantContext(tenantId, callback);
  }

  /**
   * Execute operation without tenant context (cross-tenant)
   */
  async withoutTenantContext<T>(
    callback: (nile: Server) => Promise<T>
  ): Promise<T> {
    return await withoutTenantContext(callback);
  }

  /**
   * Get tenant statistics for admin/staff users
   */
  async getTenantStatistics(tenantId: string, requestingUserId: string): Promise<{
    userCount: number;
    companyCount: number;
    billingStatus: string;
    subscriptionPlan: string;
    createdAt: Date;
  }> {
    try {
      // Validate user is staff or has admin access
      const isStaff = await this.authService.isStaffUser(requestingUserId);
      if (!isStaff) {
        const hasAccess = await this.validateTenantAccess(requestingUserId, tenantId, 'admin');
        if (!hasAccess) {
          throw new TenantAccessError('Insufficient permissions to view tenant statistics', tenantId);
        }
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT 
            t.created,
            tb.subscription_status,
            tb.plan,
            COUNT(DISTINCT tu.user_id) as user_count,
            COUNT(DISTINCT c.id) as company_count
          FROM tenants t
          LEFT JOIN public.tenant_billing tb ON t.id = tb.tenant_id AND tb.deleted IS NULL
          LEFT JOIN users.tenant_users tu ON t.id = tu.tenant_id AND tu.deleted IS NULL
          LEFT JOIN public.companies c ON t.id = c.tenant_id AND c.deleted IS NULL
          WHERE t.id = $1 AND t.deleted IS NULL
          GROUP BY t.id, t.created, tb.subscription_status, tb.plan
        `,
          [tenantId]
        );
      });

      if (result.rows.length === 0) {
        throw new TenantNotFoundError(tenantId);
      }

      const row = result.rows[0];
      return {
        userCount: parseInt(row.user_count || '0'),
        companyCount: parseInt(row.company_count || '0'),
        billingStatus: row.subscription_status || 'unknown',
        subscriptionPlan: row.plan || 'free',
        createdAt: new Date(row.created),
      };
    } catch (error) {
      if (error instanceof TenantError) {
        throw error;
      }
      console.error('Failed to get tenant statistics:', error);
      throw new TenantError('Failed to retrieve tenant statistics');
    }
  }
}

// Export singleton instance
let tenantServiceInstance: TenantService | null = null;

export const getTenantService = (): TenantService => {
  if (!tenantServiceInstance) {
    tenantServiceInstance = new TenantService();
  }
  return tenantServiceInstance;
};

// Reset instance (useful for testing)
export const resetTenantService = (): void => {
  tenantServiceInstance = null;
};
