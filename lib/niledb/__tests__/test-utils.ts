/**
 * Test Utilities for NileDB Authentication Tests
 * 
 * Provides utility functions for setting up test data, creating test clients,
 * and cleaning up after tests.
 */

import { Nile } from '@niledatabase/server';
import type { Server } from '@niledatabase/server';
import type { UserProfile } from '../auth';

/**
 * Create test-specific NileDB client
 */
export const createTestNileClient = (): Server => {
  return Nile({
    databaseId: process.env.TEST_NILEDB_DATABASE_ID || 'test-db',
    user: process.env.TEST_NILEDB_USER || 'test-user',
    password: process.env.TEST_NILEDB_PASSWORD || 'test-password',
    apiUrl: process.env.TEST_NILEDB_API_URL || 'http://localhost:3000/api/test',
    origin: 'http://localhost:3000',
    debug: true,
    db: {
      max: 2, // Smaller pool for tests
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 2000,
    },
  });
};

/**
 * Clean up test data
 */
export const cleanupTestData = async (testNile: Server): Promise<void> => {
  try {
    // Clean up in reverse dependency order
    await testNile.db.query(
      "DELETE FROM public.user_companies WHERE created > NOW() - INTERVAL '1 hour'"
    );
    await testNile.db.query(
      "DELETE FROM public.companies WHERE created > NOW() - INTERVAL '1 hour'"
    );
    await testNile.db.query(
      "DELETE FROM public.user_profiles WHERE created > NOW() - INTERVAL '1 hour'"
    );
    await testNile.db.query(
      "DELETE FROM users.tenant_users WHERE created > NOW() - INTERVAL '1 hour'"
    );
    await testNile.db.query(
      "DELETE FROM public.tenants WHERE created > NOW() - INTERVAL '1 hour'"
    );
    // Note: Don't delete from users.users as it's managed by NileDB auth
  } catch (error) {
    console.warn('Cleanup error (non-critical):', error);
  }
};

/**
 * Create test tenant
 */
export const createTestTenant = async (
  testNile: Server,
  name: string = 'Test Tenant'
): Promise<{ id: string; name: string }> => {
  const result = await testNile.db.query(
    `
    INSERT INTO public.tenants (name) 
    VALUES ($1) 
    RETURNING id, name
  `,
    [name]
  );

  return result.rows[0];
};

/**
 * Create test user profile
 */
export const createTestUserProfile = async (
  testNile: Server,
  userId: string,
  overrides: Partial<{
    role: 'user' | 'admin' | 'super_admin';
    is_penguinmails_staff: boolean;
    preferences: Record<string, unknown>;
  }> = {}
): Promise<UserProfile> => {
  const profile = {
    role: 'user',
    is_penguinmails_staff: false,
    preferences: {},
    ...overrides,
  };

  const result = await testNile.db.query(
    `
    INSERT INTO public.user_profiles (user_id, role, is_penguinmails_staff, preferences, last_login_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING *
  `,
    [userId, profile.role, profile.is_penguinmails_staff, profile.preferences]
  );

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
};

/**
 * Create test company
 */
export const createTestCompany = async (
  testNile: Server,
  tenantId: string,
  name: string = 'Test Company'
): Promise<{ id: string; name: string; tenantId: string }> => {
  const result = await testNile.db.query(
    `
    INSERT INTO public.companies (tenant_id, name, email)
    VALUES ($1, $2, $3)
    RETURNING id, name, tenant_id
  `,
    [tenantId, name, `${name.toLowerCase().replace(/\s+/g, '')}@example.com`]
  );

  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    tenantId: result.rows[0].tenant_id,
  };
};

/**
 * Add user to tenant
 */
export const addUserToTenant = async (
  testNile: Server,
  userId: string,
  tenantId: string,
  email: string
): Promise<void> => {
  await testNile.db.query(
    `
    INSERT INTO users.tenant_users (tenant_id, user_id, email)
    VALUES ($1, $2, $3)
  `,
    [tenantId, userId, email]
  );
};

/**
 * Add user to company with role
 */
export const addUserToCompany = async (
  testNile: Server,
  userId: string,
  companyId: string,
  tenantId: string,
  role: 'member' | 'admin' | 'owner' = 'member',
  permissions: Record<string, unknown> = {}
): Promise<void> => {
  await testNile.db.query(
    `
    INSERT INTO public.user_companies (tenant_id, user_id, company_id, role, permissions)
    VALUES ($1, $2, $3, $4, $5)
  `,
    [tenantId, userId, companyId, role, permissions]
  );
};

/**
 * Create complete test setup with user, tenant, and company
 */
export const createTestSetup = async (
  testNile: Server,
  userRole: 'member' | 'admin' | 'owner' = 'member',
  isStaff: boolean = false
): Promise<{
  user: { id: string; email: string };
  tenant: { id: string; name: string };
  company: { id: string; name: string; tenantId: string };
  profile: UserProfile;
}> => {
  // Create test user in NileDB users table
  const userResult = await testNile.db.query(
    `
    INSERT INTO users.users (id, email, name, email_verified)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email
  `,
    [
      `test-user-${Date.now()}`,
      `test-${Date.now()}@example.com`,
      'Test User',
      true
    ]
  );
  const user = userResult.rows[0];

  // Create tenant
  const tenant = await createTestTenant(testNile, `Test Tenant ${Date.now()}`);

  // Create company
  const company = await createTestCompany(testNile, tenant.id, `Test Company ${Date.now()}`);

  // Create user profile
  const profile = await createTestUserProfile(testNile, user.id, {
    role: isStaff ? 'admin' : 'user',
    is_penguinmails_staff: isStaff,
  });

  // Add user to tenant
  await addUserToTenant(testNile, user.id, tenant.id, user.email);

  // Add user to company
  await addUserToCompany(testNile, user.id, company.id, tenant.id, userRole);

  return { user, tenant, company, profile };
};

/**
 * Mock Express-style request for testing
 */
interface MockRequest {
  headers: Record<string, unknown>;
  cookies: Record<string, unknown>;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  user: unknown | null;
}

export const mockRequest = (overrides: Partial<MockRequest> = {}): MockRequest => ({
  headers: {},
  cookies: {},
  params: {},
  query: {},
  body: {},
  user: null,
  ...overrides,
});

/**
 * Mock Express-style response for testing
 */
interface MockResponse {
  status: jest.Mock<unknown, []>;
  json: jest.Mock<unknown, []>;
  send: jest.Mock<unknown, []>;
  end: jest.Mock<unknown, []>;
}

export const mockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
    end: jest.fn(),
  };
  res.status.mockReturnThis();
  res.json.mockReturnThis();
  res.send.mockReturnThis();
  res.end.mockReturnThis();
  return res;
};

/**
 * Mock Next.js request for testing
 */
interface MockNextRequest {
  headers: Map<string, string>;
  cookies: {
    getAll: () => unknown[];
  };
  nextUrl: URL;
}

export const mockNextRequest = (overrides: Partial<MockNextRequest> = {}): MockNextRequest => ({
  headers: new Map(),
  cookies: {
    getAll: () => [],
  },
  nextUrl: new URL('http://localhost:3000'),
  ...overrides,
});

/**
 * Wait for async operations to complete
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Assert that a function throws a specific error
 */
export const expectToThrow = async (
  fn: () => Promise<unknown>,
  errorClass: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  errorMessage?: string
): Promise<void> => {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error) {
    expect(error).toBeInstanceOf(errorClass);
    if (errorMessage) {
      expect((error as Error).message).toContain(errorMessage);
    }
  }
};

/**
 * Create test environment variables
 */
export const setupTestEnvironment = (): void => {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    TEST_NILEDB_DATABASE_ID: 'test-database-id',
    TEST_NILEDB_USER: 'test-user',
    TEST_NILEDB_PASSWORD: 'test-password',
    TEST_NILEDB_API_URL: 'http://localhost:3000/api/test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  });
};

/**
 * Restore environment after tests
 */
export const restoreEnvironment = (): void => {
  delete process.env.TEST_NILEDB_DATABASE_ID;
  delete process.env.TEST_NILEDB_USER;
  delete process.env.TEST_NILEDB_PASSWORD;
  delete process.env.TEST_NILEDB_API_URL;
};
