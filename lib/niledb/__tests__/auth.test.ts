/**
 * Authentication Service Tests
 * 
 * Unit tests for NileDB authentication service functionality including
 * session management, user profiles, and staff access control.
 */

import { AuthService, AuthenticationError } from '../auth';
import { createTestNileClient, cleanupTestData, createTestUserProfile } from './test-utils';
import type { Server } from '@niledatabase/server';

describe('AuthService', () => {
  let testNile: Server;
  let authService: AuthService;
  let testUserId: string;

  beforeAll(async () => {
    testNile = createTestNileClient();
    authService = new AuthService(testNile);
    
    // Create a test user in NileDB users table (simulating NileDB auth)
    const userResult = await testNile.db.query(
      `
      INSERT INTO users.users (id, email, name, given_name, family_name, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
      ['test-user-123', 'test@example.com', 'Test User', 'Test', 'User', true]
    );
    testUserId = userResult.rows[0].id;
  });

  afterAll(async () => {
    await cleanupTestData(testNile);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await testNile.db.query(
      'DELETE FROM public.user_profiles WHERE user_id = $1',
      [testUserId]
    );
  });

  describe('getUserWithProfile', () => {
    it('should return user without profile if profile does not exist', async () => {
      const user = await authService.getUserWithProfile(testUserId);

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUserId);
      expect(user?.email).toBe('test@example.com');
      expect(user?.name).toBe('Test User');
      expect(user?.profile).toBeUndefined();
      expect(user?.tenants).toEqual([]);
    });

    it('should return user with profile when profile exists', async () => {
      // Create user profile
      await createTestUserProfile(testNile, testUserId, {
        role: 'admin',
        is_penguinmails_staff: true,
        preferences: { theme: 'dark' },
      });

      const user = await authService.getUserWithProfile(testUserId);

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUserId);
      expect(user?.profile).toBeDefined();
      expect(user?.profile?.role).toBe('admin');
      expect(user?.profile?.isPenguinMailsStaff).toBe(true);
      expect(user?.profile?.preferences).toEqual({ theme: 'dark' });
    });

    it('should return null for non-existent user', async () => {
      const user = await authService.getUserWithProfile('non-existent-user');
      expect(user).toBeNull();
    });

    it('should include tenant information when user has tenants', async () => {
      // Create a tenant and add user to it
      const tenantResult = await testNile.db.query(
        'INSERT INTO public.tenants (id, name) VALUES ($1, $2) RETURNING id',
        ['test-tenant-123', 'Test Tenant']
      );
      const tenantId = tenantResult.rows[0].id;

      await testNile.db.query(
        'INSERT INTO users.tenant_users (tenant_id, user_id, email) VALUES ($1, $2, $3)',
        [tenantId, testUserId, 'test@example.com']
      );

      const user = await authService.getUserWithProfile(testUserId);

      expect(user?.tenants).toContain(tenantId);

      // Cleanup
      await testNile.db.query('DELETE FROM users.tenant_users WHERE user_id = $1', [testUserId]);
      await testNile.db.query('DELETE FROM public.tenants WHERE id = $1', [tenantId]);
    });
  });

  describe('updateUserProfile', () => {
    it('should update NileDB user fields', async () => {
      const updates = {
        name: 'Updated Name',
        givenName: 'Updated',
        familyName: 'Name',
        picture: 'https://example.com/avatar.jpg',
      };

      const updatedUser = await authService.updateUserProfile(testUserId, updates);

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.givenName).toBe('Updated');
      expect(updatedUser.familyName).toBe('Name');
      expect(updatedUser.picture).toBe('https://example.com/avatar.jpg');
    });

    it('should create user profile if it does not exist', async () => {
      const updates = {
        role: 'admin' as const,
        preferences: { theme: 'light' as const },
      };
  
      const updatedUser = await authService.updateUserProfile(testUserId, updates);
  
      expect(updatedUser.profile).toBeDefined();
      expect(updatedUser.profile?.role).toBe('admin');
      expect(updatedUser.profile?.preferences).toEqual({ theme: 'light' });
      expect(updatedUser.profile?.isPenguinMailsStaff).toBe(false);
    });

    it('should update existing user profile', async () => {
      // Create initial profile
      await createTestUserProfile(testNile, testUserId, {
        role: 'user',
        is_penguinmails_staff: false,
        preferences: { theme: 'dark' as const },
      });
  
      const updates = {
        role: 'admin' as const,
        preferences: { theme: 'light' as const, language: 'en' },
      };
  
      const updatedUser = await authService.updateUserProfile(testUserId, updates);
  
      expect(updatedUser.profile?.role).toBe('admin');
      expect(updatedUser.profile?.preferences).toEqual({ theme: 'light', language: 'en' });
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.updateUserProfile('non-existent-user', { role: 'admin' })
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('isStaffUser', () => {
    it('should return true for staff user', async () => {
      await createTestUserProfile(testNile, testUserId, {
        role: 'admin',
        is_penguinmails_staff: true,
      });

      const isStaff = await authService.isStaffUser(testUserId);
      expect(isStaff).toBe(true);
    });

    it('should return false for non-staff user', async () => {
      await createTestUserProfile(testNile, testUserId, {
        role: 'user',
        is_penguinmails_staff: false,
      });

      const isStaff = await authService.isStaffUser(testUserId);
      expect(isStaff).toBe(false);
    });

    it('should return false for user without profile', async () => {
      const isStaff = await authService.isStaffUser(testUserId);
      expect(isStaff).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const isStaff = await authService.isStaffUser('non-existent-user');
      expect(isStaff).toBe(false);
    });
  });

  describe('createUserProfile', () => {
    it('should create user profile with default values', async () => {
      const profile = await authService.createUserProfile(testUserId);

      expect(profile.userId).toBe(testUserId);
      expect(profile.role).toBe('user');
      expect(profile.isPenguinMailsStaff).toBe(false);
      expect(profile.preferences).toEqual({});
      expect(profile.lastLoginAt).toBeDefined();
      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
    });

    it('should create user profile with custom values', async () => {
      const profileData = {
        role: 'admin' as const,
        isPenguinMailsStaff: true,
        preferences: { theme: 'dark' as const, language: 'en' },
      };
  
      const profile = await authService.createUserProfile(testUserId, profileData);
  
      expect(profile.userId).toBe(testUserId);
      expect(profile.role).toBe('admin');
      expect(profile.isPenguinMailsStaff).toBe(true);
      expect(profile.preferences).toEqual({ theme: 'dark', language: 'en' });
    });

    it('should throw error if profile already exists', async () => {
      // Create initial profile
      await authService.createUserProfile(testUserId);

      // Try to create another profile for the same user
      await expect(
        authService.createUserProfile(testUserId)
      ).rejects.toThrow();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login for existing profile', async () => {
      await createTestUserProfile(testNile, testUserId);

      const beforeUpdate = new Date();
      await authService.updateLastLogin(testUserId);

      const user = await authService.getUserWithProfile(testUserId);
      expect(user?.profile?.lastLoginAt).toBeDefined();
      expect(user?.profile?.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('should create profile if it does not exist', async () => {
      await authService.updateLastLogin(testUserId);

      const user = await authService.getUserWithProfile(testUserId);
      expect(user?.profile).toBeDefined();
      expect(user?.profile?.lastLoginAt).toBeDefined();
      expect(user?.profile?.role).toBe('user');
    });

    it('should not throw error for non-existent user', async () => {
      // Should not throw error, just log and continue
      await expect(
        authService.updateLastLogin('non-existent-user')
      ).resolves.not.toThrow();
    });
  });

  describe('validateSession', () => {
    it('should throw AuthenticationError when no session', async () => {
      // Mock getSession to return null
      jest.spyOn(authService, 'getSession').mockResolvedValue(null);

      await expect(
        authService.validateSession()
      ).rejects.toThrow(AuthenticationError);
      
      expect(() => {
        throw new AuthenticationError('Authentication required', 'AUTH_REQUIRED');
      }).toThrow('Authentication required');
    });

    it('should throw AuthenticationError when user profile not found', async () => {
      // Mock getSession to return session without valid user
      jest.spyOn(authService, 'getSession').mockResolvedValue({
        user: { id: 'non-existent-user', email: 'test@example.com' }
      });

      await expect(
        authService.validateSession()
      ).rejects.toThrow(AuthenticationError);
    });

    it('should return user and update last login on successful validation', async () => {
      // Create user profile
      await createTestUserProfile(testNile, testUserId);

      // Mock getSession to return valid session
      jest.spyOn(authService, 'getSession').mockResolvedValue({
        user: { id: testUserId, email: 'test@example.com' }
      });

      const user = await authService.validateSession();

      expect(user.id).toBe(testUserId);
      expect(user.profile).toBeDefined();
      expect(user.profile?.lastLoginAt).toBeDefined();
    });
  });

  describe('validateStaffAccess', () => {
    it('should throw AuthenticationError for non-staff user', async () => {
      await createTestUserProfile(testNile, testUserId, {
        is_penguinmails_staff: false,
      });

      // Mock getSession to return valid session
      jest.spyOn(authService, 'getSession').mockResolvedValue({
        user: { id: testUserId, email: 'test@example.com' }
      });

      await expect(
        authService.validateStaffAccess()
      ).rejects.toThrow(AuthenticationError);
    });

    it('should return user for staff user', async () => {
      await createTestUserProfile(testNile, testUserId, {
        is_penguinmails_staff: true,
        role: 'admin',
      });

      // Mock getSession to return valid session
      jest.spyOn(authService, 'getSession').mockResolvedValue({
        user: { id: testUserId, email: 'test@example.com' }
      });

      const user = await authService.validateStaffAccess();

      expect(user.id).toBe(testUserId);
      expect(user.profile?.isPenguinMailsStaff).toBe(true);
    });
  });

  interface MockServer {
    db: {
      query: jest.Mock<Promise<{ rows: unknown[] }>, [string, unknown[] | undefined]>;
    };
  }

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Create a service with a mock client that throws errors
      const mockNile: MockServer = {
        db: {
          query: jest.fn().mockRejectedValue(new Error('Database connection failed'))
        }
      };

      const errorAuthService = new AuthService(mockNile as unknown as Server);

      await expect(
        errorAuthService.getUserWithProfile(testUserId)
      ).rejects.toThrow(AuthenticationError);
    });

    it('should handle malformed query results', async () => {
      // Mock a query that returns unexpected data
      const mockNile: MockServer = {
        db: {
          query: jest.fn().mockResolvedValue({ rows: [{ invalid: 'data' }] })
        }
      };

      const errorAuthService = new AuthService(mockNile as unknown as Server);

      const user = await errorAuthService.getUserWithProfile(testUserId);
      expect(user).toBeDefined();
      // Should handle missing fields gracefully
    });
  });
});

describe('Authentication Error Classes', () => {
  it('should create AuthenticationError with default code', () => {
    const error = new AuthenticationError('Test message');
    expect(error.message).toBe('Test message');
    expect(error.code).toBe('AUTH_REQUIRED');
    expect(error.name).toBe('AuthenticationError');
  });

  it('should create AuthenticationError with custom code', () => {
    const error = new AuthenticationError('Test message', 'CUSTOM_CODE');
    expect(error.message).toBe('Test message');
    expect(error.code).toBe('CUSTOM_CODE');
  });
});
