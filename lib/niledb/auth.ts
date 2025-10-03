/**
 * NileDB Authentication Service
 * 
 * Provides authentication functionality using NileDB's native features including
 * session management, user profile integration, and staff user identification.
 */

import type { Server } from '@niledatabase/server';
import { getNileClient, withoutTenantContext } from './client';
import { getNileConfig } from './config';
// Express-like request interface for compatibility
interface ExpressRequest {
  headers?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
}

// User preferences type
interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
    desktop?: boolean;
  };
  dashboard?: {
    defaultView?: string;
    itemsPerPage?: number;
  };
  [key: string]: unknown;
}

// Authentication Types
export interface NileSession {
  user?: NileSessionUser;
  tenantId?: string;
}

export interface NileSessionUser {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  created?: string;
  updated?: string;
  emailVerified?: boolean;
}

export interface UserProfile {
  userId: string;
  role: 'user' | 'admin' | 'super_admin';
  isPenguinMailsStaff: boolean;
  preferences: UserPreferences;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithProfile extends NileSessionUser {
  profile?: UserProfile;
  tenants?: string[];
}

export interface UserProfileUpdates {
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  role?: 'user' | 'admin' | 'super_admin';
  preferences?: Partial<UserPreferences>;
}

// Re-export error classes from the centralized error system
import { 
  AuthenticationError,
  SessionExpiredError,
  InvalidCredentialsError,
} from './errors';

export { 
  AuthenticationError,
  SessionExpiredError,
  InvalidCredentialsError,
};

/**
 * Authentication Service Class
 * 
 * Handles all authentication operations using NileDB's native authentication
 * system with enhanced user profile management and staff access control.
 */
export class AuthService {
  private nile: Server;
  private config: ReturnType<typeof getNileConfig>;

  constructor(nileClient?: Server) {
    this.nile = nileClient || getNileClient();
    this.config = getNileConfig();
  }

  /**
   * Validate UUID format
   */
  private validateUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Get current session from request
   */
  async getSession(_request?: ExpressRequest): Promise<NileSession | null> {
    try {
      // NileDB getSession expects a specific request format or no parameters
      const session = await this.nile.auth.getSession();
      return session as NileSession;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Get current user from session
   */
  async getCurrentUser(request?: ExpressRequest): Promise<NileSessionUser | null> {
    try {
      const session = await this.getSession(request);
      return session?.user || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get user with profile information using cross-schema queries
   */
  async getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
    try {
      // Validate UUID format
      if (!this.validateUuid(userId)) {
        throw new AuthenticationError('Invalid UUID format: ' + userId);
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT
            u.id,
            u.email,
            u.name,
            u.given_name,
            u.family_name,
            u.picture,
            u.created,
            u.updated,
            u.email_verified,
            up.role,
            up.is_penguinmails_staff,
            up.preferences,
            up.last_login_at,
            up.created as profile_created,
            up.updated as profile_updated,
            ARRAY_AGG(DISTINCT tu.tenant_id) FILTER (WHERE tu.tenant_id IS NOT NULL) as tenant_ids
          FROM users.users u
          LEFT JOIN public.user_profiles up ON u.id::uuid = up.user_id::uuid AND up.deleted IS NULL
          LEFT JOIN users.tenant_users tu ON u.id::uuid = tu.user_id::uuid AND tu.deleted IS NULL
          WHERE u.id::uuid = $1::uuid AND u.deleted IS NULL
          GROUP BY u.id, u.email, u.name, u.given_name, u.family_name, u.picture,
                   u.created, u.updated, u.email_verified, up.role, up.is_penguinmails_staff,
                   up.preferences, up.last_login_at, up.created, up.updated
        `,
          [userId]
        );
      });

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      const user: UserWithProfile = {
        id: row.id,
        email: row.email,
        name: row.name,
        givenName: row.given_name,
        familyName: row.family_name,
        picture: row.picture,
        created: row.created,
        updated: row.updated,
        emailVerified: row.email_verified,
        tenants: row.tenant_ids || [],
      };

      // Add profile if it exists
      if (row.role) {
        user.profile = {
          userId: row.id,
          role: row.role,
          isPenguinMailsStaff: row.is_penguinmails_staff || false,
          preferences: row.preferences || {},
          lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
          createdAt: new Date(row.profile_created),
          updatedAt: new Date(row.profile_updated),
        };
      }

      return user;
    } catch (error) {
      console.error('Failed to get user with profile:', error);
      if (error instanceof AuthenticationError && error.message.includes('Invalid UUID format')) {
        throw error; // Re-throw UUID validation errors
      }
      throw new AuthenticationError('Failed to retrieve user profile');
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, updates: UserProfileUpdates): Promise<UserWithProfile> {
    try {
      // Update NileDB user fields if provided
      if (updates.name || updates.givenName || updates.familyName || updates.picture) {
        const userUpdates: Record<string, string> = {};
        if (updates.name !== undefined) userUpdates.name = updates.name;
        if (updates.givenName !== undefined) userUpdates.given_name = updates.givenName;
        if (updates.familyName !== undefined) userUpdates.family_name = updates.familyName;
        if (updates.picture !== undefined) userUpdates.picture = updates.picture;

        await withoutTenantContext(async (nile) => {
          const setClause = Object.keys(userUpdates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');
          
          const values = [userId, ...Object.values(userUpdates)];
          
          return await nile.db.query(
            `UPDATE users.users SET ${setClause}, updated = CURRENT_TIMESTAMP WHERE id = $1`,
            values
          );
        });
      }

      // Update or create user profile
      if (updates.role || updates.preferences) {
        await withoutTenantContext(async (nile) => {
          const profileUpdates: Record<string, string | Partial<UserPreferences>> = {};
          if (updates.role !== undefined) profileUpdates.role = updates.role;
          if (updates.preferences !== undefined) profileUpdates.preferences = updates.preferences;

          // Try to update existing profile first
          const updateResult = await nile.db.query(
            `
            UPDATE public.user_profiles 
            SET ${Object.keys(profileUpdates).map((key, index) => `${key} = $${index + 2}`).join(', ')}, 
                updated = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND deleted IS NULL
            RETURNING user_id
          `,
            [userId, ...Object.values(profileUpdates)]
          );

          // If no profile exists, create one
          if (updateResult.rows.length === 0) {
            await nile.db.query(
              `
              INSERT INTO public.user_profiles (user_id, role, is_penguinmails_staff, preferences)
              VALUES ($1, $2, $3, $4)
            `,
              [
                userId,
                updates.role || 'user',
                false, // Default to non-staff
                updates.preferences || {}
              ]
            );
          }
        });
      }

      // Return updated user with profile
      const updatedUser = await this.getUserWithProfile(userId);
      if (!updatedUser) {
        throw new AuthenticationError('Failed to retrieve updated user profile');
      }

      return updatedUser;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw new AuthenticationError('Failed to update user profile');
    }
  }

  /**
   * Check if user is PenguinMails staff
   */
  async isStaffUser(userId: string): Promise<boolean> {
    try {
      // Validate UUID format
      if (!this.validateUuid(userId)) {
        throw new AuthenticationError('Invalid UUID format: ' + userId);
      }

      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT up.is_penguinmails_staff, up.role
          FROM users.users u
          JOIN public.user_profiles up ON u.id = up.user_id
          WHERE u.id = $1 AND up.is_penguinmails_staff = true AND up.deleted IS NULL AND u.deleted IS NULL
        `,
          [userId]
        );
      });

      return result.rows.length > 0;
    } catch (error) {
      console.error('Failed to check staff status:', error);
      if (error instanceof AuthenticationError && error.message.includes('Invalid UUID format')) {
        throw error; // Re-throw UUID validation errors
      }
      return false; // Return false for other errors (like database errors)
    }
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await withoutTenantContext(async (nile) => {
        // Update or create user profile with last login
        await nile.db.query(
          `
          INSERT INTO public.user_profiles (user_id, role, is_penguinmails_staff, preferences, last_login_at)
          VALUES ($1, 'user', false, '{}', CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET
            last_login_at = CURRENT_TIMESTAMP,
            updated = CURRENT_TIMESTAMP
          WHERE user_profiles.deleted IS NULL
        `,
          [userId]
        );
      });
    } catch (error) {
      console.error('Failed to update last login:', error);
      // Don't throw error for login tracking failure
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await this.nile.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw new AuthenticationError('Failed to sign out');
    }
  }

  /**
   * Validate session and return user with profile
   */
  async validateSession(request?: ExpressRequest): Promise<UserWithProfile> {
    const session = await this.getSession(request);
    
    if (!session?.user) {
      throw new AuthenticationError('Authentication required', 'AUTH_REQUIRED');
    }

    const userWithProfile = await this.getUserWithProfile(session.user.id);
    
    if (!userWithProfile) {
      throw new AuthenticationError('User profile not found', 'PROFILE_NOT_FOUND');
    }

    // Update last login timestamp
    await this.updateLastLogin(session.user.id);

    return userWithProfile;
  }

  /**
   * Validate staff access
   */
  async validateStaffAccess(request?: ExpressRequest): Promise<UserWithProfile> {
    const user = await this.validateSession(request);
    
    if (!user.profile?.isPenguinMailsStaff) {
      throw new AuthenticationError('Staff access required', 'STAFF_ACCESS_REQUIRED');
    }

    return user;
  }

  /**
   * Create user profile for new user
   */
  async createUserProfile(
    userId: string, 
    profileData: Partial<UserProfile> = {}
  ): Promise<UserProfile> {
    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          INSERT INTO public.user_profiles (
            user_id, 
            role, 
            is_penguinmails_staff, 
            preferences,
            last_login_at
          )
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          RETURNING *
        `,
          [
            userId,
            profileData.role || 'user',
            profileData.isPenguinMailsStaff || false,
            profileData.preferences || {}
          ]
        );
      });

      const row = result.rows[0];
      return {
        userId: row.user_id,
        role: row.role,
        isPenguinMailsStaff: row.is_penguinmails_staff,
        preferences: row.preferences,
        lastLoginAt: new Date(row.last_login_at),
        createdAt: new Date(row.created),
        updatedAt: new Date(row.updated),
      };
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw new AuthenticationError('Failed to create user profile');
    }
  }
}

// Export singleton instance
let authServiceInstance: AuthService | null = null;

export const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
};

// Reset instance (useful for testing)
export const resetAuthService = (): void => {
  authServiceInstance = null;
};
