# NileDB Database Architecture & Implementation Guide

This document provides a comprehensive overview of the NileDB database architecture, schema design, and implementation patterns for the PenguinMails backend migration.

## 🏗️ Architecture Overview

### Multi-Schema Architecture

NileDB implements a sophisticated multi-schema architecture that separates concerns and provides optimance:

- **`users` Schema**: NileDB built-in authentication and user management tables
- **`public` Schema**: Custom business logic tables with tenant isolation
- **`auth` Schema**: NileDB authentication infrastructure (sessions, tokens, etc.)
- **Internal Schemas**: NileDB's internal management and optimization tables

### Key Architectural Benefits

- **Authentic Multi-Tenancy**: Built-in tenant isolation with automatic context management
- **Cross-Schema Relationships**: Seamless joins between authentication and business data
- **Performance Optimization**: Time-ordered UUIDs and optimized query patterns
- **Admin Panel Support**: Cross-tenant queries for administrative operations
- **Scalable Design**: Handles growth from single tenant to enterprise scale

## 📊 Database Schema

### NileDB Built-in Tables (users schema)

#### `users.users` - Core User Authentication

```sql
CREATE TABLE users.users (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  name text NULL,
  family_name text NULL,
  given_name text NULL,
  email text NULL,
  picture text NULL,
  email_verified timestamp without time zone NULL
);
```

**Features:**

- Time-ordered UUIDs for better performance
- Built-in soft delete support
- OAuth profile fields (name, picture, etc.)
- Email verification tracking
- Automatic timestamp management

#### `users.tenant_users` - User-Tenant Relationships

```sql
CREATE TABLE users.tenant_users (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  roles ARRAY NULL,
  email text NULL
);
```

**Features:**

- Many-to-many user-tenant relationships
- Array-based role system
- Automatic email denormalization
- Soft delete support

### NileDB Built-in Tables (public schema)

#### `public.tenants` - Tenant Management

```sql
CREATE TABLE public.tenants (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  name text NULL,
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  compute_id uuid NULL
);
```

**Features:**

- Time-ordered tenant IDs
- Built-in soft delete
- Compute resource tracking
- Automatic timestamp management

### Custom Business Tables (public schema)

#### `public.user_profiles` - Extended User Data

```sql
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  user_id uuid NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  is_penguinmails_staff boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (id),
  UNIQUE(user_id)
);
```

**Purpose:** Store custom user fields not covered by NileDB's built-in users table
**Key Fields:**

- `role`: Application-specific user roles (user, admin, super_admin)
- `is_penguinmails_staff`: Staff privilege escalation flag
- `preferences`: Flexible JSON storage for user settings

#### `public.companies` - Tenant-Scoped Business Entities

```sql
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  settings jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (tenant_id, id)
);
```

**Features:**

- Composite primary key for tenant isolation
- Automatic tenant context enforcement
- Flexible JSON settings storage
- Built-in soft delete support

#### `public.user_companies` - Business Relationships

```sql
CREATE TABLE public.user_companies (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, -- References users.users(id) - enforced at application level
  company_id uuid NOT NULL REFERENCES companies(tenant_id, id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  permissions jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (tenant_id, id),
  UNIQUE(tenant_id, user_id, company_id)
);
```

**Features:**

- Tenant-scoped user-company relationships
- Role-based access control
- Flexible permissions system
- Composite foreign key to companies table

#### `public.tenant_billing` - Billing Management

```sql
CREATE TABLE public.tenant_billing (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan text DEFAULT 'free',
  billing_email text,
  stripe_customer_id text,
  subscription_status text DEFAULT 'inactive',
  current_period_start timestamp without time zone,
  current_period_end timestamp without time zone,
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (tenant_id, id),
  UNIQUE(tenant_id)
);
```

**Features:**

- One-to-one tenant billing relationship
- Stripe integration support
- Subscription lifecycle management
- Billing period tracking

#### `public.audit_logs` - Comprehensive Audit Trail

```sql
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid, -- References users.users(id) - enforced at application level
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  PRIMARY KEY (tenant_id, id)
);
```

**Features:**

- Tenant-scoped audit logging
- Flexible action and resource tracking
- Network metadata collection
- JSON details for complex audit data

## 🔗 Relationship Architecture

### Cross-Schema Relationships

```sql
-- Users to User Profiles (Cross-schema FK)
user_profiles.user_id → users.users.id

-- Users to Tenant Users (Same schema)
users.tenant_users.user_id → users.users.id

-- Tenants to Business Tables (Same schema)
companies.tenant_id → tenants.id
user_companies.tenant_id → tenants.id
tenant_billing.tenant_id → tenants.id
audit_logs.tenant_id → tenants.id

-- Business Relationships (Same schema)
user_companies.company_id → companies.id (composite FK)
```

### Application-Level Relationships

Due to NileDB limitations, some relationships are enforced at the application level:

```sql
-- These are validated in code, not database constraints
user_companies.user_id → users.users.id
audit_logs.user_id → users.users.id
```

## 🎯 Query Patterns

### Cross-Schema Queries

```sql
-- User with tenant and company information
SELECT
  u.id as user_id,
  u.email,
  u.name,
  up.role as user_role,
  up.is_penguinmails_staff,
  tu.tenant_id,
  t.name as tenant_name,
  tu.roles as tenant_roles,
  c.name as company_name,
  uc.role as company_role
FROM users.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN users.tenant_users tu ON u.id = tu.user_id
LEFT JOIN public.tenants t ON tu.tenant_id = t.id
LEFT JOIN public.user_companies uc ON u.id = uc.user_id AND tu.tenant_id = uc.tenant_id
LEFT JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
WHERE u.deleted IS NULL
  AND (up.deleted IS NULL OR up.deleted IS NULL)
  AND (tu.deleted IS NULL OR tu.deleted IS NULL);
```

### Tenant Context Queries

```typescript
// With tenant context (automatic isolation)
const companies = await withTenantContext(tenantId, async (nile) => {
  return await nile.db.query(`
    SELECT id, name, email, settings
    FROM companies
    WHERE deleted IS NULL
    ORDER BY name
  `);
});

// Without tenant context (cross-tenant admin access)
const allCompanies = await withoutTenantContext(async (nile) => {
  return await nile.db.query(`
    SELECT c.*, t.name as tenant_name
    FROM companies c
    JOIN tenants t ON c.tenant_id = t.id
    WHERE c.deleted IS NULL
    ORDER BY t.name, c.name
  `);
});
```

### Admin Panel Queries

```typescript
// Staff users across all tenants
const adminUsers = await withoutTenantContext(async (nile) => {
  return await nile.db.query(`
    SELECT 
      u.id,
      u.email,
      u.name,
      up.role,
      up.is_penguinmails_staff,
      COUNT(DISTINCT tu.tenant_id) as tenant_count,
      ARRAY_AGG(DISTINCT t.name) as tenant_names
    FROM users.users u
    LEFT JOIN public.user_profiles up ON u.id = up.user_id
    LEFT JOIN users.tenant_users tu ON u.id = tu.user_id
    LEFT JOIN public.tenants t ON tu.tenant_id = t.id
    WHERE u.deleted IS NULL
      AND (up.role IN ('admin', 'super_admin') OR up.is_penguinmails_staff = true)
    GROUP BY u.id, u.email, u.name, up.role, up.is_penguinmails_staff
    ORDER BY up.is_penguinmails_staff DESC, up.role DESC
  `);
});
```

## 🔐 Access Control Patterns

### Staff User Identification

```typescript
const isStaff = await withoutTenantContext(async (nile) => {
  const result = await nile.db.query(
    `
    SELECT up.is_penguinmails_staff, up.role
    FROM users.users u
    JOIN public.user_profiles up ON u.id = up.user_id
    WHERE u.id = $1 AND up.is_penguinmails_staff = true
  `,
    [userId]
  );

  return result.rows.length > 0;
});
```

### Role-Based Access Control

```typescript
enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

enum CompanyRole {
  MEMBER = "member",
  ADMIN = "admin",
  OWNER = "owner",
}

const hasCompanyAccess = async (
  userId: string,
  companyId: string,
  requiredRole: CompanyRole
) => {
  const result = await nile.db.query(
    `
    SELECT uc.role
    FROM user_companies uc
    WHERE uc.user_id = $1 AND uc.company_id = $2 AND uc.deleted IS NULL
  `,
    [userId, companyId]
  );

  if (result.rows.length === 0) return false;

  const userRole = result.rows[0].role;
  const roleHierarchy = { member: 1, admin: 2, owner: 3 };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
```

### Tenant Context Management

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

## 🚀 Performance Optimization

### Indexing Strategy

```sql
-- User profile indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_staff ON user_profiles(is_penguinmails_staff) WHERE is_penguinmails_staff = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Company indexes
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_deleted ON companies(deleted) WHERE deleted IS NULL;

-- User-company relationship indexes
CREATE INDEX IF NOT EXISTS idx_user_companies_tenant_id ON user_companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_tenant_user ON user_companies(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_deleted ON user_companies(deleted) WHERE deleted IS NULL;

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_tenant_billing_tenant_id ON tenant_billing(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_billing_status ON tenant_billing(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenant_billing_stripe ON tenant_billing(stripe_customer_id);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created);
```

### Query Optimization Patterns

```typescript
// Use prepared statements for frequently executed queries
const getUserCompanies = nile.db.prepare(`
  SELECT c.id, c.name, uc.role
  FROM companies c
  JOIN user_companies uc ON c.id = uc.company_id AND c.tenant_id = uc.tenant_id
  WHERE uc.user_id = $1 AND uc.deleted IS NULL AND c.deleted IS NULL
  ORDER BY c.name
`);

// Batch operations for better performance
const createMultipleCompanies = async (companies: CompanyData[]) => {
  const values = companies
    .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
    .join(", ");
  const params = companies.flatMap((c) => [c.tenant_id, c.name, c.email]);

  return await nile.db.query(
    `
    INSERT INTO companies (tenant_id, name, email)
    VALUES ${values}
    RETURNING id, name
  `,
    params
  );
};
```

## 🔄 Migration Patterns

### Schema Migration from Old System

```typescript
// 1. Export users from old system
const oldUsers = await oldDb.query("SELECT * FROM users");

// 2. Create users through NileDB auth (populates users.users)
for (const user of oldUsers) {
  const nileUser = await nile.auth.signUp({
    email: user.email,
    password: "temporary-password", // User will reset
  });

  // 3. Create user profile with custom fields
  await nile.db.query(
    `
    INSERT INTO user_profiles (user_id, role, is_penguinmails_staff) 
    VALUES ($1, $2, $3)
  `,
    [nileUser.id, user.role, user.is_penguinmails_staff]
  );
}

// 4. Migrate tenants (map old companies to NileDB tenants)
const oldCompanies = await oldDb.query(
  "SELECT DISTINCT tenant_id, name FROM companies"
);
for (const company of oldCompanies) {
  await nile.db.query(
    `
    INSERT INTO tenants (id, name) 
    VALUES ($1, $2)
  `,
    [company.tenant_id, company.name]
  );
}

// 5. Migrate business data with proper relationships
const oldBusinessData = await oldDb.query("SELECT * FROM companies");
for (const company of oldBusinessData) {
  await nile.db.query(
    `
    INSERT INTO companies (id, tenant_id, name, email, settings) 
    VALUES ($1, $2, $3, $4, $5)
  `,
    [
      company.id,
      company.tenant_id,
      company.name,
      company.email,
      company.settings,
    ]
  );
}
```

### Data Validation Patterns

```typescript
// Validate data integrity after migration
const validateMigration = async () => {
  const checks = [];

  // Check user profile completeness
  const usersWithoutProfiles = await nile.db.query(`
    SELECT u.id, u.email
    FROM users.users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.deleted IS NULL AND up.user_id IS NULL
  `);
  checks.push({
    test: "Users without profiles",
    count: usersWithoutProfiles.rows.length,
  });

  // Check orphaned relationships
  const orphanedRelationships = await nile.db.query(`
    SELECT uc.id
    FROM user_companies uc
    LEFT JOIN users.users u ON uc.user_id = u.id
    WHERE u.id IS NULL
  `);
  checks.push({
    test: "Orphaned user-company relationships",
    count: orphanedRelationships.rows.length,
  });

  return checks;
};
```

## 📚 Best Practices

### Schema Design

1. **Always use composite primary keys** for tenant-aware tables: `PRIMARY KEY (tenant_id, id)`
2. **Include soft delete columns** on all business tables: `deleted timestamp without time zone NULL`
3. **Use time-ordered UUIDs** for better performance: `DEFAULT public.uuid_generate_v7()`
4. **Follow NileDB naming conventions**: `created`/`updated` instead of `created_at`/`updated_at`

### Query Patterns

1. **Use `withTenantContext()`** for tenant-scoped operations
2. **Use `withoutTenantContext()`** for admin/cross-tenant operations
3. **Always check soft delete status** in WHERE clauses: `WHERE deleted IS NULL`
4. **Use cross-schema joins** for comprehensive data retrieval

### Security

1. **Validate tenant access** before setting context
2. **Use staff flags** for privilege escalation: `is_penguinmails_staff = true`
3. **Implement role hierarchies** in application logic
4. **Log all admin operations** in audit tables

### Performance

1. **Create appropriate indexes** for query patterns
2. **Use prepared statements** for frequently executed queries
3. **Batch operations** when possible
4. **Monitor query performance** and optimize as needed

## 🎯 Common Patterns

### User Authentication Flow

```typescript
// 1. Authenticate user
const session = await nile.auth.getSession(req);
if (!session?.user) {
  return res.status(401).json({ error: "Authentication required" });
}

// 2. Get user profile
const profile = await nile.db.query(
  `
  SELECT role, is_penguinmails_staff
  FROM user_profiles
  WHERE user_id = $1
`,
  [session.user.id]
);

// 3. Check permissions
if (profile.rows[0]?.is_penguinmails_staff) {
  // Staff user - full access
} else {
  // Regular user - validate tenant access
}
```

### Tenant-Scoped Operations

```typescript
// Standard tenant operation
app.get("/api/tenants/:tenantId/companies", async (req, res) => {
  const { tenantId } = req.params;

  const companies = await withTenantContext(tenantId, async (nile) => {
    return await nile.db.query(`
      SELECT id, name, email, settings
      FROM companies
      WHERE deleted IS NULL
      ORDER BY name
    `);
  });

  res.json({ companies: companies.rows });
});
```

### Admin Operations

```typescript
// Cross-tenant admin operation
app.get("/api/admin/companies", requireStaffAccess, async (req, res) => {
  const companies = await withoutTenantContext(async (nile) => {
    return await nile.db.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        t.name as tenant_name,
        COUNT(uc.user_id) as user_count
      FROM companies c
      JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN user_companies uc ON c.id = uc.company_id 
        AND c.tenant_id = uc.tenant_id 
        AND uc.deleted IS NULL
      WHERE c.deleted IS NULL
      GROUP BY c.id, c.name, c.email, t.name
      ORDER BY t.name, c.name
    `);
  });

  res.json({ companies: companies.rows });
});
```

This architecture provides a robust, scalable foundation for multi-tenant applications with comprehensive admin capabilities and optimal performance characteristics.
