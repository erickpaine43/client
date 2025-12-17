# TenantService Documentation

## Overview

The `TenantService` class provides comprehensive tenant management functionality using NileDB's native multi-tenant architecture. It integrates seamlessly with the `AuthService` from Task 4 and follows the documented multi-schema architecture patterns for secure, scalable tenant operations.

## Key Features

- **Multi-Schema Integration**: Leverages NileDB's `users.tenant_users` and `public.tenants` tables
- **Cross-Schema Queries**: Seamlessly joins user authentication data with business logic
- **Staff Access Control**: Integrates with `AuthService` for privilege escalation
- **Tenant Isolation**: Automatic tenant context management with `withTenantContext()`
- **Role-Based Access**: Hierarchical permissions (member → admin → owner)
- **Company-Tenant Mapping**: Preserves existing business logic for company relationships
- **Comprehensive Error Handling**: Custom error classes with specific error codes
- **Audit Trail Support**: Built-in logging and validation patterns

## Architecture Integration

### Multi-Schema Architecture

```typescript
// NileDB Built-in Tables (users schema)
users.users; // Core user authentication
users.tenant_users; // User-tenant relationships with roles

// NileDB Built-in Tables (public schema)
public.tenants; // Tenant management

// Custom Business Tables (public schema)
public.user_profiles; // Extended user data with staff flags
public.companies; // Tenant-scoped business entities
public.user_companies; // User-company relationships with roles
public.tenant_billing; // Tenant billing and subscription data
```

### Integration with AuthService

The `TenantService` leverages the completed `AuthService` from Task 4:

```typescript
// Staff user identification for cross-tenant access
const isStaff = await this.authService.isStaffUser(userId);

// User profile validation with staff privileges
const userWithProfile = await this.authService.getUserWithProfile(userId);
```

## Core Classes and Interfaces

### TenantService Class

```typescript
class TenantService {
  // Tenant Management
  async getTenantById(tenantId: string): Promise<NileTenant | null>;
  async getUserTenants(userId: string): Promise<TenantMembership[]>;
  async createTenant(
    name: string,
    creatorUserId?: string,
    tenantData?: CreateTenantData
  ): Promise<NileTenant>;
  async updateTenant(
    tenantId: string,
    updates: UpdateTenantData,
    userId?: string
  ): Promise<NileTenant>;

  // User Management
  async addUserToTenant(
    userId: string,
    tenantId: string,
    roles?: string[],
    addedByUserId?: string
  ): Promise<void>;
  async removeUserFromTenant(
    userId: string,
    tenantId: string,
    removedByUserId?: string
  ): Promise<void>;
  async updateUserTenantRoles(
    userId: string,
    tenantId: string,
    roles: string[],
    updatedByUserId?: string
  ): Promise<void>;
  async getTenantUsers(
    tenantId: string,
    requestingUserId?: string
  ): Promise<TenantUser[]>;

  // Access Control
  async validateTenantAccess(
    userId: string,
    tenantId: string,
    requiredRole?: "member" | "admin" | "owner"
  ): Promise<boolean>;
  async isOnlyTenantOwner(userId: string, tenantId: string): Promise<boolean>;

  // Context Management
  async withTenantContext<T>(
    tenantId: string,
    callback: (nile: Server) => Promise<T>
  ): Promise<T>;
  async withoutTenantContext<T>(
    callback: (nile: Server) => Promise<T>
  ): Promise<T>;

  // Statistics and Monitoring
  async getTenantStatistics(
    tenantId: string,
    requestingUserId: string
  ): Promise<TenantStatistics>;
}
```

### Key Interfaces

```typescript
interface NileTenant {
  id: string;
  name: string;
  created: string;
  updated?: string;
  deleted?: string;
}

interface TenantMembership {
  tenant: NileTenant;
  roles: string[];
  joinedAt: Date;
  companies: CompanyMembership[];
}

interface CompanyMembership {
  id: string;
  name: string;
  role: "member" | "admin" | "owner";
  permissions: Record<string, unknown>;
}

interface TenantUser {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  created: string;
  updated?: string;
}
```

### Error Classes

```typescript
class TenantError extends Error {
  constructor(message: string, public code: string = 'TENANT_ERROR')

class TenantAccessError extends TenantError {
  constructor(message: string, public tenantId?: string)
}

class TenantNotFoundError extends TenantError {
  constructor(tenantId: string)
}

class TenantContextError extends TenantError {
  constructor(message: string = 'Tenant context not set')
}
```

## Usage Examples

### Basic Tenant Operations

```typescript
import { getTenantService } from "@/lib/niledb/tenant";

const tenantService = getTenantService();

// Create a new tenant
const tenant = await tenantService.createTenant(
  "Acme Corporation",
  creatorUserId,
  {
    subscriptionPlan: "premium",
    billingStatus: "active",
  }
);

// Get tenant information
const tenantInfo = await tenantService.getTenantById(tenant.id);

// Get all tenants for a user
const userTenants = await tenantService.getUserTenants(userId);
```

### User Management

```typescript
// Add user to tenant with specific roles
await tenantService.addUserToTenant(
  newUserId,
  tenantId,
  ["member", "billing"],
  adminUserId
);

// Update user roles
await tenantService.updateUserTenantRoles(
  userId,
  tenantId,
  ["admin"],
  ownerUserId
);

// Remove user from tenant
await tenantService.removeUserFromTenant(userId, tenantId, adminUserId);

// Get all users in tenant
const tenantUsers = await tenantService.getTenantUsers(tenantId, adminUserId);
```

### Access Control Validation

```typescript
// Validate user has access to tenant
const hasAccess = await tenantService.validateTenantAccess(
  userId,
  tenantId,
  "admin" // Required role
);

// Check if user is the only owner (prevents self-removal)
const isOnlyOwner = await tenantService.isOnlyTenantOwner(userId, tenantId);

// Staff users automatically have access to all tenants
const isStaff = await authService.isStaffUser(userId);
```

### Context Management

```typescript
// Execute operations with tenant context (automatic isolation)
const companies = await tenantService.withTenantContext(
  tenantId,
  async (nile) => {
    return await nile.db.query(`
    SELECT id, name, email
    FROM companies
    WHERE deleted IS NULL
    ORDER BY name
  `);
  }
);

// Execute cross-tenant operations (admin/staff only)
const allTenants = await tenantService.withoutTenantContext(async (nile) => {
  return await nile.db.query(`
    SELECT t.*, COUNT(tu.user_id) as user_count
    FROM tenants t
    LEFT JOIN users.tenant_users tu ON t.id = tu.tenant_id
    WHERE t.deleted IS NULL
    GROUP BY t.id
    ORDER BY t.created DESC
  `);
});
```

## API Route Integration

### Using with Middleware from Task 4

```typescript
import {
  withTenantAccess,
  withResourcePermission,
} from "@/lib/niledb/middleware";
import { getTenantService } from "@/lib/niledb/tenant";

// Tenant-scoped endpoint with role requirement
export const GET = withTenantAccess("admin")(
  withResourcePermission(
    "user",
    "read"
  )(async (request: AuthenticatedRequest, context: RouteContext) => {
    const tenantService = getTenantService();
    const { tenantId } = context.params;

    const users = await tenantService.getTenantUsers(tenantId, request.user.id);

    return NextResponse.json({ users });
  })
);

// Staff-only cross-tenant endpoint
export const GET = withStaffAccess("admin")(async (
  request: AuthenticatedRequest,
  context: RouteContext
) => {
  const tenantService = getTenantService();

  const statistics = await tenantService.getTenantStatistics(
    context.params.tenantId,
    request.user.id
  );

  return NextResponse.json({ statistics });
});
```

### Complete API Route Examples

```typescript
// app/api/tenants/[tenantId]/route.ts
export const GET = withTenantAccess("member")(getTenantHandler);
export const PUT = withTenantAccess("admin")(updateTenantHandler);

// app/api/tenants/[tenantId]/users/route.ts
export const GET = withTenantAccess("admin")(getTenantUsersHandler);
export const POST = withTenantAccess("admin")(addUserToTenantHandler);

// app/api/admin/tenants/route.ts
export const GET = withStaffAccess("admin")(getAllTenantsHandler);
```

## Access Control Patterns

### Role Hierarchy

```typescript
// Company roles (within tenants)
member < admin < owner

// User roles (application-wide)
user < admin < super_admin

// Staff privileges (cross-tenant)
is_penguinmails_staff = true (bypasses tenant restrictions)
```

### Permission Matrix

```typescript
const PERMISSIONS = {
  company: {
    read: ["member", "admin", "owner"],
    write: ["admin", "owner"],
    delete: ["owner"],
  },
  user: {
    read: ["admin", "owner"],
    write: ["admin", "owner"],
    delete: ["owner"],
    invite: ["admin", "owner"],
  },
  billing: {
    read: ["admin", "owner"],
    write: ["owner"],
    delete: ["owner"],
  },
};
```

### Staff Access Patterns

```typescript
// Staff users can access any tenant
if (user.profile?.isPenguinMailsStaff) {
  // Full access to all tenants and operations
  return true;
}

// Regular users must be tenant members
const tenantAccess = await validateTenantAccess(userId, tenantId);
return tenantAccess.hasAccess;
```

## Data Migration Patterns

### From Old System to NileDB

```typescript
// 1. Migrate users through NileDB auth
const nileUser = await nile.auth.signUp({
  email: oldUser.email,
  password: "temporary-password",
});

// 2. Create user profile with staff flag
await authService.createUserProfile(nileUser.id, {
  role: oldUser.role,
  isPenguinMailsStaff: oldUser.is_staff,
  preferences: oldUser.preferences,
});

// 3. Create tenant from old company
const tenant = await tenantService.createTenant(oldCompany.name, nileUser.id);

// 4. Add user to tenant with appropriate role
await tenantService.addUserToTenant(nileUser.id, tenant.id, [
  oldUserCompany.role,
]);
```

## Performance Optimization

### Query Patterns

```typescript
// Use prepared statements for frequent queries
const getUserTenants = nile.db.prepare(`
  SELECT t.*, tu.roles, COUNT(c.id) as company_count
  FROM users.tenant_users tu
  JOIN public.tenants t ON tu.tenant_id = t.id
  LEFT JOIN public.companies c ON t.id = c.tenant_id
  WHERE tu.user_id = $1 AND tu.deleted IS NULL
  GROUP BY t.id, tu.roles
  ORDER BY t.name
`);

// Batch operations for multiple users
const addMultipleUsers = async (userIds: string[], tenantId: string) => {
  const values = userIds
    .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
    .join(", ");
  const params = userIds.flatMap((id) => [tenantId, id, "member"]);

  return await nile.db.query(
    `
    INSERT INTO users.tenant_users (tenant_id, user_id, roles)
    VALUES ${values}
  `,
    params
  );
};
```

### Indexing Strategy

```sql
-- Tenant user relationships
CREATE INDEX idx_tenant_users_user_id ON users.tenant_users(user_id);
CREATE INDEX idx_tenant_users_tenant_id ON users.tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_deleted ON users.tenant_users(deleted) WHERE deleted IS NULL;

-- User company relationships
CREATE INDEX idx_user_companies_tenant_user ON public.user_companies(tenant_id, user_id);
CREATE INDEX idx_user_companies_role ON public.user_companies(role);
CREATE INDEX idx_user_companies_deleted ON public.user_companies(deleted) WHERE deleted IS NULL;

-- Tenant billing
CREATE INDEX idx_tenant_billing_status ON public.tenant_billing(subscription_status);
CREATE INDEX idx_tenant_billing_tenant ON public.tenant_billing(tenant_id);
```

## Testing Strategies

### Unit Testing

```typescript
describe("TenantService", () => {
  let tenantService: TenantService;
  let testNile: Server;

  beforeEach(() => {
    testNile = createTestNileClient();
    tenantService = new TenantService(testNile);
  });

  it("should validate tenant access correctly", async () => {
    const { user, tenant } = await createTestSetup(testNile, "admin");

    const hasAccess = await tenantService.validateTenantAccess(
      user.id,
      tenant.id,
      "admin"
    );

    expect(hasAccess).toBe(true);
  });
});
```

### Integration Testing

```typescript
describe("Tenant API Integration", () => {
  it("should create tenant with proper access control", async () => {
    const response = await request(app)
      .post("/api/tenants")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Test Tenant" });

    expect(response.status).toBe(201);
    expect(response.body.tenant.name).toBe("Test Tenant");
  });
});
```

## Security Best Practices

### Access Control

1. **Always validate tenant access** before operations
2. **Use staff flags** for privilege escalation
3. **Implement role hierarchies** in application logic
4. **Log all admin operations** for audit trails

### Data Protection

1. **Use tenant context** for automatic isolation
2. **Validate user permissions** at multiple levels
3. **Prevent privilege escalation** through role validation
4. **Audit all access attempts** with detailed logging

### Error Handling

1. **Use specific error classes** for different scenarios
2. **Don't expose sensitive information** in error messages
3. **Log errors appropriately** for debugging
4. **Provide user-friendly error responses**

## Troubleshooting

### Common Issues

**Issue**: User cannot access tenant

```typescript
// Check tenant membership
const tenantUsers = await tenantService.getTenantUsers(tenantId);
const userMembership = tenantUsers.find((u) => u.userId === userId);

// Check user profile and staff status
const userProfile = await authService.getUserWithProfile(userId);
const isStaff = userProfile?.profile?.isPenguinMailsStaff;
```

**Issue**: Permission denied errors

```typescript
// Validate role hierarchy
const userRole = await getUserTenantRole(userId, tenantId);
const hasPermission = hasRequiredRole(userRole, ["admin"]);

// Check staff access
const isStaff = await authService.isStaffUser(userId);
```

**Issue**: Cross-tenant queries failing

```typescript
// Use withoutTenantContext for admin operations
const result = await tenantService.withoutTenantContext(async (nile) => {
  return await nile.db.query("SELECT * FROM tenants");
});
```

### Debug Logging

```typescript
// Enable debug logging in development
const config = getNileConfig();
if (config.debug) {
  console.log("Tenant operation:", {
    userId,
    tenantId,
    operation: "validateAccess",
    timestamp: new Date().toISOString(),
  });
}
```

## Migration from Task 4

The TenantService seamlessly integrates with the completed AuthService from Task 4:

### Leveraged Components

- **AuthService**: Staff user identification and validation
- **Authentication Middleware**: `withTenantAccess`, `withStaffAccess`, `withResourcePermission`
- **Cross-Schema Queries**: User profile integration with tenant data
- **Error Handling**: Consistent error patterns and logging
- **Testing Infrastructure**: Established testing patterns and utilities

### Enhanced Functionality

- **Tenant Context Management**: Automatic tenant isolation
- **Company-Tenant Mapping**: Business logic preservation
- **Role-Based Access Control**: Hierarchical permissions
- **Staff Privilege Escalation**: Cross-tenant administrative access
- **Comprehensive Audit Trail**: Detailed operation logging

This implementation provides a robust, scalable foundation for multi-tenant applications with comprehensive administrative capabilities while maintaining the security and performance characteristics required for production use.
