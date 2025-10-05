# NileDB SDK Reference & Implementation Guide

This document provides a comprehensive reference for NileDB SDK usage patterns, configuration, and best practices specific to the PenguinMails backend implementation.

## Table of Contents

1. [SDK Configuration](#sdk-configuration)
2. [Client Management](#client-management)
3. [Authentication Patterns](#authentication-patterns)
4. [Tenant Context Management](#tenant-context-management)
5. [Database Operations](#database-operations)
6. [Cross-Schema Queries](#cross-schema-queries)
7. [Admin Operations](#admin-operations)
8. [Error Handling](#error-handling)
9. [Performance Patterns](#performance-patterns)
10. [Testing Strategies](#testing-strategies)

## SDK Configuration

### Environment-Specific Configuration

```typescript
// lib/niledb/config.ts
export const createNileConfig = (): NileConfig => {
  const envConfig = getEnvironmentConfig();

  const rawConfig = {
    databaseId: extractDatabaseIdFromUrl(process.env.NILEDB_API_URL || ""),
    databaseName: extractDatabaseNameFromUrl(
      process.env.NILEDB_POSTGRES_URL || ""
    ),
    user: process.env.NILEDB_USER || "",
    password: process.env.NILEDB_PASSWORD || "",
    apiUrl: process.env.NILEDB_API_URL || "",
    postgresUrl: process.env.NILEDB_POSTGRES_URL || "",
    ...envConfig,
  };

  return NileConfigSchema.parse(rawConfig);
};
```

### Client Initialization

```typescript
// lib/niledb/client.ts
export const initializeNileClient = (): Server => {
  const config = getNileConfig();

  const nileConfig = {
    databaseId: config.databaseId,
    databaseName: config.databaseName,
    user: config.user,
    password: config.password,
    apiUrl: config.apiUrl,
    origin: config.origin,
    debug: config.debug,
    secureCookies: config.secureCookies,
    db: {
      host: extractHostFromPostgresUrl(config.postgresUrl),
      port: extractPortFromPostgresUrl(config.postgresUrl),
      database: config.databaseName,
      user: config.user,
      password: config.password,
      max: config.connectionPool.max,
      idleTimeoutMillis: config.connectionPool.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionPool.connectionTimeoutMillis,
    },
  };

  return Nile(nileConfig);
};
```

## Client Management

### Singleton Pattern

```typescript
let nileInstance: Server | null = null;

export const getNileClient = (): Server => {
  if (!nileInstance) {
    nileInstance = initializeNileClient();
  }
  return nileInstance;
};

export const resetNileClient = (): void => {
  nileInstance = null;
};
```

### Context-Aware Client Creation

```typescript
export const createNileClientWithContext = async (
  tenantId: string
): Promise<Server> => {
  const client = getNileClient();
  return await client.withContext({ tenantId });
};

export const withTenantContext = async <T>(
  tenantId: string,
  callback: (nile: Server) => Promise<T>
): Promise<T> => {
  const client = getNileClient();
  return await client.withContext({ tenantId }, callback);
};

export const withoutTenantContext = async <T>(
  callback: (nile: Server) => Promise<T>
): Promise<T> => {
  const client = getNileClient();
  return await callback(client);
};
```

## Authentication Patterns

### Session Management

```typescript
// Get current session
const session = await nile.auth.getSession(req);
if (!session?.user) {
  return res.status(401).json({ error: "Authentication required" });
}

// User signup with tenant creation
const user = await nile.auth.signUp({
  email: "user@example.com",
  password: "secure123",
  newTenantName: "User Company",
});

// User signup joining existing tenant
const user = await nile.auth.signUp({
  email: "user@example.com",
  password: "secure123",
  tenantId: "existing-tenant-id",
});
```

### Staff User Authentication

```typescript
const validateStaffAccess = async (userId: string): Promise<boolean> => {
  const result = await withoutTenantContext(async (nile) => {
    return await nile.db.query(
      `
      SELECT up.is_penguinmails_staff, up.role
      FROM users.users u
      JOIN public.user_profiles up ON u.id = up.user_id
      WHERE u.id = $1 AND up.is_penguinmails_staff = true
    `,
      [userId]
    );
  });

  return result.rows.length > 0;
};
```

## Tenant Context Management

### Automatic Context Setting

```typescript
// Middleware for automatic tenant context
export const withTenantContextMiddleware = (
  tenantIdParam: string = "tenantId"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.params[tenantIdParam];

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID required" });
    }

    // Validate user has access to tenant
    const session = await nile.auth.getSession(req);
    if (!session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasAccess = await validateTenantAccess(session.user.id, tenantId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Tenant access denied" });
    }

    // Set tenant context for subsequent operations
    req.nile = await nile.withContext({ tenantId });
    next();
  };
};
```

### Context Validation

```typescript
const validateTenantAccess = async (
  userId: string,
  tenantId: string
): Promise<boolean> => {
  // Check if user is staff (can access any tenant)
  const isStaff = await validateStaffAccess(userId);
  if (isStaff) return true;

  // Check if user has access to specific tenant
  const result = await withoutTenantContext(async (nile) => {
    return await nile.db.query(
      `
      SELECT 1
      FROM users.tenant_users tu
      WHERE tu.user_id = $1 AND tu.tenant_id = $2 AND tu.deleted IS NULL
    `,
      [userId, tenantId]
    );
  });

  return result.rows.length > 0;
};
```

## Database Operations

### Tenant-Scoped Queries

```typescript
// Automatic tenant isolation
const getCompanies = async (tenantId: string) => {
  return await withTenantContext(tenantId, async (nile) => {
    return await nile.db.query(`
      SELECT id, name, email, settings
      FROM companies
      WHERE deleted IS NULL
      ORDER BY name
    `);
  });
};

// Create company with tenant context
const createCompany = async (tenantId: string, companyData: CompanyData) => {
  return await withTenantContext(tenantId, async (nile) => {
    return await nile.db.query(
      `
      INSERT INTO companies (tenant_id, name, email, settings)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email
    `,
      [tenantId, companyData.name, companyData.email, companyData.settings]
    );
  });
};
```

### Cross-Tenant Queries (Admin)

```typescript
// Admin queries without tenant context
const getAllCompanies = async () => {
  return await withoutTenantContext(async (nile) => {
    return await nile.db.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.tenant_id,
        t.name as tenant_name,
        COUNT(uc.user_id) as user_count
      FROM companies c
      JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN user_companies uc ON c.id = uc.company_id 
        AND c.tenant_id = uc.tenant_id 
        AND uc.deleted IS NULL
      WHERE c.deleted IS NULL
      GROUP BY c.id, c.name, c.email, c.tenant_id, t.name
      ORDER BY t.name, c.name
    `);
  });
};
```

## Cross-Schema Queries

### User Profile Queries

```typescript
// Get user with profile and tenant information
const getUserWithProfile = async (userId: string) => {
  return await withoutTenantContext(async (nile) => {
    return await nile.db.query(
      `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.created,
        u.email_verified,
        up.role,
        up.is_penguinmails_staff,
        up.preferences,
        COUNT(DISTINCT tu.tenant_id) as tenant_count,
        ARRAY_AGG(DISTINCT t.name) as tenant_names
      FROM users.users u
      LEFT JOIN public.user_profiles up ON u.id = up.user_id
      LEFT JOIN users.tenant_users tu ON u.id = tu.user_id
      LEFT JOIN public.tenants t ON tu.tenant_id = t.id
      WHERE u.id = $1 AND u.deleted IS NULL
      GROUP BY u.id, u.email, u.name, u.created, u.email_verified, 
               up.role, up.is_penguinmails_staff, up.preferences
    `,
      [userId]
    );
  });
};
```

### Complex Business Queries

```typescript
// User-company relationships with full context
const getUserCompanyRelationships = async (userId?: string) => {
  return await withoutTenantContext(async (nile) => {
    const whereClause = userId ? "WHERE u.id = $1 AND" : "WHERE";
    const params = userId ? [userId] : [];

    return await nile.db.query(
      `
      SELECT 
        u.id as user_id,
        u.email,
        u.name as user_name,
        up.role as user_role,
        c.id as company_id,
        c.name as company_name,
        uc.role as company_role,
        uc.permissions,
        t.id as tenant_id,
        t.name as tenant_name,
        uc.created as relationship_created
      FROM users.users u
      JOIN public.user_profiles up ON u.id = up.user_id
      JOIN public.user_companies uc ON u.id = uc.user_id
      JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
      JOIN public.tenants t ON uc.tenant_id = t.id
      ${whereClause} u.deleted IS NULL 
        AND up.deleted IS NULL
        AND uc.deleted IS NULL 
        AND c.deleted IS NULL
      ORDER BY t.name, c.name, u.email
    `,
      params
    );
  });
};
```

## Admin Operations

### System Statistics

```typescript
const getSystemStats = async () => {
  return await withoutTenantContext(async (nile) => {
    return await nile.db.query(`
      SELECT 
        (SELECT COUNT(*) FROM public.tenants WHERE deleted IS NULL) as total_tenants,
        (SELECT COUNT(*) FROM users.users WHERE deleted IS NULL) as total_users,
        (SELECT COUNT(*) FROM public.companies WHERE deleted IS NULL) as total_companies,
        (SELECT COUNT(*) FROM public.user_companies WHERE deleted IS NULL) as total_relationships,
        (SELECT COUNT(*) FROM public.user_profiles WHERE is_penguinmails_staff = true) as staff_users,
        (SELECT COUNT(DISTINCT tenant_id) FROM public.tenant_billing WHERE subscription_status = 'active') as active_subscriptions
    `);
  });
};
```

### Billing Analytics

```typescript
const getBillingAnalytics = async () => {
  return await withoutTenantContext(async (nile) => {
    return await nile.db.query(`
      SELECT 
        tb.plan,
        tb.subscription_status,
        COUNT(*) as tenant_count,
        SUM(CASE WHEN tb.subscription_status = 'active' THEN 1 ELSE 0 END) as active_count,
        ARRAY_AGG(t.name ORDER BY t.name) as tenant_names
      FROM public.tenant_billing tb
      JOIN public.tenants t ON tb.tenant_id = t.id
      WHERE tb.deleted IS NULL AND t.deleted IS NULL
      GROUP BY tb.plan, tb.subscription_status
      ORDER BY tb.plan, tb.subscription_status
    `);
  });
};
```

## Error Handling

### Connection Validation

```typescript
export const testNileConnection = async (): Promise<{
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}> => {
  try {
    const client = getNileClient();
    const result = await client.db.query(
      "SELECT 1 as test, current_timestamp as timestamp"
    );

    return {
      success: true,
      details: {
        query: "SELECT 1 as test, current_timestamp as timestamp",
        result: result.rows[0],
        rowCount: result.rows.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
```

### Authentication Error Handling

```typescript
const handleAuthError = (error: any, res: Response) => {
  if (error.status === 401) {
    return res.status(401).json({
      error: "Authentication failed",
      code: "AUTH_FAILED",
      message: "Invalid credentials provided",
    });
  }

  if (error.status === 403) {
    return res.status(403).json({
      error: "Access denied",
      code: "ACCESS_DENIED",
      message: "Insufficient permissions",
    });
  }

  console.error("Auth error:", error);
  return res.status(500).json({
    error: "Authentication service error",
    code: "AUTH_SERVICE_ERROR",
  });
};
```

### Database Error Handling

```typescript
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error in ${operation}:`, error);

  if (error.code === "23505") {
    // Unique violation
    throw new Error("Duplicate entry detected");
  }

  if (error.code === "23503") {
    // Foreign key violation
    throw new Error("Referenced record not found");
  }

  if (error.code === "42P01") {
    // Undefined table
    throw new Error("Database schema error - table not found");
  }

  throw new Error(`Database operation failed: ${operation}`);
};
```

## Performance Patterns

### Connection Pooling

```typescript
// Optimized connection pool configuration
const connectionPoolConfig = {
  development: {
    max: 5,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 3000,
  },
  staging: {
    max: 8,
    idleTimeoutMillis: 8000,
    connectionTimeoutMillis: 4000,
  },
  production: {
    max: 20,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 5000,
  },
};
```

### Query Optimization

```typescript
// Prepared statement pattern
const preparedQueries = {
  getUserCompanies: `
    SELECT c.id, c.name, uc.role
    FROM companies c
    JOIN user_companies uc ON c.id = uc.company_id AND c.tenant_id = uc.tenant_id
    WHERE uc.user_id = $1 AND uc.deleted IS NULL AND c.deleted IS NULL
    ORDER BY c.name
  `,

  getCompanyUsers: `
    SELECT u.id, u.email, u.name, uc.role, uc.permissions
    FROM users.users u
    JOIN user_companies uc ON u.id = uc.user_id
    WHERE uc.company_id = $1 AND uc.tenant_id = $2 
      AND uc.deleted IS NULL AND u.deleted IS NULL
    ORDER BY u.email
  `,
};

// Batch operations
const createMultipleUserProfiles = async (profiles: UserProfileData[]) => {
  const values = profiles
    .map(
      (_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
    )
    .join(", ");

  const params = profiles.flatMap((p) => [
    p.user_id,
    p.role,
    p.is_penguinmails_staff,
    p.preferences,
  ]);

  return await nile.db.query(
    `
    INSERT INTO user_profiles (user_id, role, is_penguinmails_staff, preferences)
    VALUES ${values}
    RETURNING id, user_id, role
  `,
    params
  );
};
```

### Caching Strategies

```typescript
// Simple in-memory cache for frequently accessed data
class NileCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttl || this.defaultTTL),
    });

    return data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new NileCache();

// Usage
const getCachedUserProfile = async (userId: string) => {
  return await cache.get(`user:${userId}`, async () => {
    return await getUserWithProfile(userId);
  });
};
```

## Testing Strategies

### Test Configuration

```typescript
// Test-specific NileDB configuration
const createTestNileClient = () => {
  return Nile({
    databaseId: process.env.TEST_NILEDB_DATABASE_ID,
    user: process.env.TEST_NILEDB_USER,
    password: process.env.TEST_NILEDB_PASSWORD,
    apiUrl: process.env.TEST_NILEDB_API_URL,
    origin: "http://localhost:3000",
    debug: true,
    db: {
      max: 2, // Smaller pool for tests
      idleTimeoutMillis: 1000,
    },
  });
};
```

### Test Utilities

```typescript
// Test data cleanup
export const cleanupTestData = async (testNile: Server) => {
  await testNile.db.query(
    "DELETE FROM user_companies WHERE created > NOW() - INTERVAL '1 hour'"
  );
  await testNile.db.query(
    "DELETE FROM companies WHERE created > NOW() - INTERVAL '1 hour'"
  );
  await testNile.db.query(
    "DELETE FROM user_profiles WHERE created > NOW() - INTERVAL '1 hour'"
  );
  // Note: Don't delete from users.users or tenants as they're managed by NileDB
};

// Test tenant creation
export const createTestTenant = async (testNile: Server, name: string) => {
  const result = await testNile.db.query(
    `
    INSERT INTO tenants (name) 
    VALUES ($1) 
    RETURNING id, name
  `,
    [name]
  );

  return result.rows[0];
};

// Test user profile creation
export const createTestUserProfile = async (
  testNile: Server,
  userId: string,
  overrides: Partial<UserProfile> = {}
) => {
  const profile = {
    role: "user",
    is_penguinmails_staff: false,
    preferences: {},
    ...overrides,
  };

  const result = await testNile.db.query(
    `
    INSERT INTO user_profiles (user_id, role, is_penguinmails_staff, preferences)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    [userId, profile.role, profile.is_penguinmails_staff, profile.preferences]
  );

  return result.rows[0];
};
```

### Integration Test Patterns

```typescript
describe("NileDB Integration Tests", () => {
  let testNile: Server;
  let testTenant: any;

  beforeAll(async () => {
    testNile = createTestNileClient();
    testTenant = await createTestTenant(testNile, "Test Tenant");
  });

  afterAll(async () => {
    await cleanupTestData(testNile);
  });

  test("should create and retrieve companies with tenant context", async () => {
    const companyData = {
      name: "Test Company",
      email: "test@company.com",
      settings: { theme: "dark" },
    };

    const created = await withTenantContext(testTenant.id, async (nile) => {
      return await nile.db.query(
        `
        INSERT INTO companies (tenant_id, name, email, settings)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
        [
          testTenant.id,
          companyData.name,
          companyData.email,
          companyData.settings,
        ]
      );
    });

    expect(created.rows).toHaveLength(1);
    expect(created.rows[0].name).toBe(companyData.name);

    const retrieved = await withTenantContext(testTenant.id, async (nile) => {
      return await nile.db.query("SELECT * FROM companies WHERE id = $1", [
        created.rows[0].id,
      ]);
    });

    expect(retrieved.rows).toHaveLength(1);
    expect(retrieved.rows[0].name).toBe(companyData.name);
  });
});
```

This comprehensive SDK reference provides the foundation for implementing robust, scalable NileDB applications with proper error handling, performance optimization, and testing strategies.
