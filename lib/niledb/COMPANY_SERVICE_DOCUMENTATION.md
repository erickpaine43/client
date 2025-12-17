# CompanyService Documentation

## Overview

The `CompanyService` class provides comprehensive company management functionality using NileDB's native multi-tenant architecture. It integrates seamlessly with the `TenantService` from Task 5 and `AuthService` from Task 4, following the established patterns for secure, scalable company operations within tenant contexts.

## Key Features

- **Tenant-Scoped Operations**: All company operations are automatically isolated within tenant contexts
- **Role-Based Access Control**: Hierarchical permissions (member → admin → owner) with staff privilege escalation
- **Cross-Schema Integration**: Leverages NileDB's multi-schema architecture for user-company relationships
- **Staff Access Control**: Integrates with `AuthService` for privilege escalation and cross-tenant access
- **Comprehensive Error Handling**: Custom error classes with specific error codes and context
- **Data Validation**: Input validation with detailed error messages and field-specific feedback
- **Audit Trail Support**: Built-in patterns for logging and validation

## Architecture Integration

### Multi-Schema Architecture

```typescript
// NileDB Built-in Tables (users schema)
users.users; // Core user authentication
users.tenant_users; // User-tenant relationships

// NileDB Built-in Tables (public schema)
public.tenants; // Tenant management

// Custom Business Tables (public schema)
public.companies; // Tenant-scoped company entities
public.user_companies; // User-company relationships with roles
```

### Integration with Existing Services

The `CompanyService` leverages completed infrastructure from Tasks 4 & 5:

```typescript
// From Task 4 - AuthService
const isStaff = await this.authService.isStaffUser(userId);

// From Task 5 - TenantService
const hasAccess = await this.tenantService.validateTenantAccess(
  userId,
  tenantId
);
const companies = await this.tenantServicContext(tenantId, callback);
```

## Core Classes and Interfaces

### CompanyService Class

```typescript
class CompanyService {
  // Company Management
  async getCompaniesForTenant(
    tenantId: string,
    requestingUserId?: string
  ): Promise<Company[]>;
  async getCompanyById(
    tenantId: string,
    companyId: string,
    requestingUserId?: string
  ): Promise<Company | null>;
  async createCompany(
    tenantId: string,
    companyData: CreateCompanyData,
    creatorUserId?: string
  ): Promise<Company>;
  async updateCompany(
    tenantId: string,
    companyId: string,
    updates: UpdateCompanyData,
    updatingUserId?: string
  ): Promise<Company>;
  async deleteCompany(
    tenantId: string,
    companyId: string,
    deletingUserId?: string
  ): Promise<void>;

  // User-Company Relationships
  async getUserCompanies(
    userId: string,
    requestingUserId?: string
  ): Promise<UserCompany[]>;
  async getCompanyUsers(
    tenantId: string,
    companyId: string,
    requestingUserId?: string
  ): Promise<UserCompany[]>;
  async addUserToCompany(
    tenantId: string,
    userId: string,
    companyId: string,
    role?: CompanyRole,
    permissions?: Record<string, unknown>,
    addingUserId?: string
  ): Promise<UserCompany>;
  async removeUserFromCompany(
    tenantId: string,
    userId: string,
    companyId: string,
    removingUserId?: string
  ): Promise<void>;
  async updateUserCompanyRole(
    tenantId: string,
    userId: string,
    companyId: string,
    role: CompanyRole,
    permissions?: Record<string, unknown>,
    updatingUserId?: string
  ): Promise<UserCompany>;

  // Access Control & Validation
  async validateCompanyAccess(
    userId: string,
    tenantId: string,
    companyId: string,
    requiredRole?: CompanyRole
  ): Promise<boolean>;
  async isOnlyCompanyOwner(
    tenantId: string,
    companyId: string,
    userId: string
  ): Promise<boolean>;

  // Statistics & Analytics
  async getCompanyStatistics(
    tenantId: string,
    companyId: string,
    requestingUserId?: string
  ): Promise<CompanyStatistics>;
}
```

### Key Interfaces

```typescript
interface Company {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface UserCompany {
  id: string;
  tenantId: string;
  userId: string;
  companyId: string;
  role: "member" | "admin" | "owner";
  permissions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // Joined data
  company?: Company;
  user?: { id: string; email: string; name?: string };
}

interface CreateCompanyData {
  name: string;
  email?: string;
  settings?: Record<string, unknown>;
}

interface UpdateCompanyData {
  name?: string;
  email?: string;
  settings?: Record<string, unknown>;
}
```

### Error Classes

```typescript
class CompanyError extends Error {
  constructor(msg: string, public code: string = 'COMPANY_ERROR')
}

class CompanyAccessError extends CompanyError {
  constructor(msg: string, public companyId?: string, public tenantId?: string)
}

class CompanyNotFoundError extends CompanyError {
  constructor(companyId: string, tenantId?: string)
}

class CompanyValidationError extends CompanyError {
  constructor(msg: string, public field?: string)
}
```

## Usage Examples

### Basic Company Operations

```typescript
import { getCompanyService } from "@/lib/niledb/company";

const companyService = getCompanyService();

// Create a new company
const company = await companyService.createCompany(
  tenantId,
  {
    name: "Acme Corporation",
    email: "contact@acme.com",
    settings: { plan: "enterprise" },
  },
  creatorUserId
);

// Get all companies in a tenant
const companies = await companyService.getCompaniesForTenant(tenantId, userId);

// Update company information
const updatedCompany = await companyService.updateCompany(
  tenantId,
  companyId,
  { name: "Acme Corp", settings: { plan: "pro" } },
  adminUserId
);
```

### User-Company Relationship Management

```typescript
// Add user to company with specific role
await companyService.addUserToCompany(
  tenantId,
  userId,
  companyId,
  "admin",
  { canManageUsers: true, canManageBilling: false },
  ownerUserId
);

// Get all users in a company
const companyUsers = await companyService.getCompanyUsers(
  tenantId,
  companyId,
  adminUserId
);

// Update user role
await companyService.updateUserCompanyRole(
  tenantId,
  userId,
  companyId,
  "owner",
  { canManageUsers: true, canManageBilling: true },
  currentOwnerUserId
);

// Remove user from company
await companyService.removeUserFromCompany(
  tenantId,
  userId,
  companyId,
  adminUserId
);
```

### Cross-Tenant Operations (Staff Only)

```typescript
// Get all companies for a user across tenants (staff or self only)
const userCompanies = await companyService.getUserCompanies(
  userId,
  staffUserId
);

// Staff users can access any company
const hasAccess = await companyService.validateCompanyAccess(
  staffUserId,
  tenantId,
  companyId,
  "owner" // Staff bypasses role requirements
);
```

### Access Control Validation

```typescript
// Validate user has access to company
const hasAccess = await companyService.validateCompanyAccess(
  userId,
  tenantId,
  companyId,
  "admin" // Required role
);

// Check if user is the only owner (prevents self-removal)
const isOnlyOwner = await companyService.isOnlyCompanyOwner(
  tenantId,
  companyId,
  userId
);

// Get company statistics
const stats = await companyService.getCompanyStatistics(
  tenantId,
  companyId,
  userId
);
```

## API Route Integration

### Using with Middleware from Task 4

```typescript
import {
  withTenantAccess,
  withResourcePermission,
  createTenantRoute,
} from "@/lib/niledb/middleware";
import { getCompanyService } from "@/lib/niledb/company";

// Tenant-scoped company listing
export const GET = withTenantAccess("member")(async (
  request: AuthenticatedRequest,
  context: RouteContext
) => {
  const companyService = getCompanyService();
  const { tenantId } = context.params;

  const companies = await companyService.getCompaniesForTenant(
    tenantId,
    request.user.id
  );

  return NextResponse.json({ companies });
});

// Company creation with admin access
export const POST = withTenantAccess("admin")(
  withResourcePermission(
    "company",
    "write"
  )(async (request: AuthenticatedRequest, context: RouteContext) => {
    const companyService = getCompanyService();
    const { tenantId } = context.params;
    const body = await request.json();

    const company = await companyService.createCompany(
      tenantId,
      body,
      request.user.id
    );

    return NextResponse.json({ company }, { status: 201 });
  })
);
```

### Complete Route Examples

```typescript
// app/api/tenants/[tenantId]/companies/route.ts
export { GET, POST } from "@/lib/niledb/examples/company-api-routes";

// app/api/tenants/[tenantId]/companies/[companyId]/route.ts
export {
  GET as getCompanyHandler,
  PUT as updateCompanyHandler,
  DELETE as deleteCompanyHandler,
} from "@/lib/niledb/examples/company-api-routes";

// app/api/tenants/[tenantId]/companies/[companyId]/users/route.ts
export {
  GET as getCompanyUsersHandler,
  POST as addUserToCompanyHandler,
} from "@/lib/niledb/examples/company-api-routes";
```

## Access Control Patterns

### Role Hierarchy

```typescript
// Company roles (within tenants)
member < admin < owner

// Staff privileges (cross-tenant)
is_penguinmails_staff = true (bypasses all tenant restrictions)
```

### Permission Matrix

```typescript
const COMPANY_PERMISSIONS = {
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
};
```

### Staff Access Patterns

```typescript
// Staff users can access any company
if (user.profile?.isPenguinMailsStaff) {
  return true; // Full access to all companies across all tenants
}

// Regular users must be company members with appropriate roles
const companyAccess = await validateCompanyAccess(
  userId,
  tenantId,
  companyId,
  requiredRole
);
return companyAccess;
```

## Data Validation

### Input Validation

```typescript
// Company name validation
if (!name || !name.trim()) {
  throw new CompanyValidationError("Company name is required", "name");
}

if (name.trim().length > 255) {
  throw new CompanyValidationError(
    "Company name is too long (max 255 characters)",
    "name"
  );
}

// Email validation
if (email && !isValidEmail(email)) {
  throw new CompanyValidationError("Invalid email format", "email");
}

// Settings validation
if (settings && (typeof settings !== "object" || settings === null)) {
  throw new CompanyValidationError(
    "Settings must be a valid object",
    "settings"
  );
}
```

### Business Logic Validation

```typescript
// Prevent removing the only owner
const isOnlyOwner = await this.isOnlyCompanyOwner(tenantId, companyId, userId);
if (isOnlyOwner) {
  throw new CompanyError("Cannot remove the only owner of the company");
}

// Validate user has tenant access before adding to company
const userExists = await this.tenantService.validateTenantAccess(
  userId,
  tenantId
);
if (!userExists) {
  throw new CompanyError("User does not have access to this tenant");
}
```

## Performance Optimization

### Query Patterns

```typescript
// Use tenant context for automatic isolation
const companies = await this.tenantService.withTenantContext(
  tenantId,
  async (nile) => {
    return await nile.db.query(`
    SELECT id, name, email, settings, created, updated
    FROM companies
    WHERE deleted IS NULL
    ORDER BY name
  `);
  }
);

// Use cross-tenant context for staff operations
const allUserCompanies = await this.tenantService.withoutTenantContext(
  async (nile) => {
    return await nile.db.query(
      `
    SELECT uc.*, c.name as company_name, u.email as user_email
    FROM public.user_companies uc
    JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
    JOIN users.users u ON uc.user_id = u.id
    WHERE uc.user_id = $1 AND uc.deleted IS NULL
    ORDER BY c.name
  `,
      [userId]
    );
  }
);
```

### Indexing Strategy

```sql
-- Company indexes
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_deleted ON companies(deleted) WHERE deleted IS NULL;

-- User-company relationship indexes
CREATE INDEX IF NOT EXISTS idx_user_companies_tenant_id ON user_companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_tenant_user ON user_companies(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_role ON user_companies(role);
CREATE INDEX IF NOT EXISTS idx_user_companies_deleted ON user_companies(deleted) WHERE deleted IS NULL;
```

## Testing Strategies

### Unit Testing

```typescript
describe("CompanyService", () => {
  let companyService: CompanyService;
  let mockTenantService: jest.Mocked<TenantService>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    // Setup mocks and service instance
    companyService = new CompanyService();
  });

  it("should validate tenant access before company operations", async () => {
    mockTenantService.validateTenantAccess.mockResolvedValue(true);

    const result = await companyService.getCompaniesForTenant(tenantId, userId);

    expect(mockTenantService.validateTenantAccess).toHaveBeenCalledWith(
      userId,
      tenantId,
      "member"
    );
  });
});
```

### Integration Testing

```typescript
describe("CompanyService Integration", () => {
  it("should complete full company lifecycle with proper access control", async () => {
    // Create company
    const company = await companyService.createCompany(
      tenantId,
      companyData,
      userId
    );

    // Add user to company
    const userCompany = await companyService.addUserToCompany(
      tenantId,
      userId,
      company.id,
      "admin",
      {},
      adminUserId
    );

    // Verify access control was enforced
    expect(company.tenantId).toBe(tenantId);
    expect(userCompany.role).toBe("admin");
  });
});
```

## Security Best Practices

### Access Control

1. **Always validate tenant access** before company operations
2. **Use staff flags** for privilege escalation across tenants
3. **Implement role hierarchies** in application logic
4. **Prevent privilege escalation** through role validation
5. **Log all admin operations** for audit trails

### Data Protection

1. **Use tenant context** for automatic isolation
2. **Validate user permissions** at multiple levels
3. **Sanitize input data** before database operations
4. **Use parameterized queries** to prevent SQL injection
5. **Implement soft deletes** for data recovery

### Error Handling

1. **Use specific error classes** for different scenarios
2. **Don't expose sensitive information** in error messages
3. **Log errors appropriately** for debugging
4. **Provide user-friendly error responses**
5. **Include context information** in error objects

## Troubleshooting

### Common Issues

**Issue**: User cannot access company

```typescript
// Check company membership
const companyUsers = await companyService.getCompanyUsers(tenantId, companyId);
const userMembership = companyUsers.find((u) => u.userId === userId);

// Check tenant access
const hasTenantAccess = await tenantService.validateTenantAccess(
  userId,
  tenantId
);

// Check staff status
const isStaff = await authService.isStaffUser(userId);
```

**Issue**: Permission denied errors

```typescript
// Validate role hierarchy
const hasAccess = await companyService.validateCompanyAccess(
  userId,
  tenantId,
  companyId,
  requiredRole
);

// Check staff access
const isStaff = await authService.isStaffUser(userId);
```

**Issue**: Cross-tenant queries failing

```typescript
// Use withoutTenantContext for staff operations
const result = await tenantService.withoutTenantContext(async (nile) => {
  return await nile.db.query("SELECT * FROM companies");
});
```

### Debug Logging

```typescript
// Enable debug logging in development
if (process.env.NODE_ENV === "development") {
  console.log("Company operation:", {
    userId,
    tenantId,
    companyId,
    operation: "validateAccess",
    timestamp: new Date().toISOString(),
  });
}
```

## Migration from Old System

The CompanyService seamlessly integrates with the existing infrastructure while providing enhanced functionality:

### Leveraged Components

- **TenantService**: Tenant context management and user-tenant relationships
- **AuthService**: Staff user identification and session validation
- **Middleware**: Access control patterns (`withTenantAccess`, `withResourcePermission`)
- **Database Architecture**: Multi-schema patterns and cross-schema queries
- **Testing Infrastructure**: Established testing patterns and utilities

### Enhanced Functionality

- **Tenant-Scoped Operations**: Automatic tenant isolation for all company operations
- **Role-Based Access Control**: Hierarchical permissions with staff privilege escalation
- **Cross-Tenant Capabilities**: Staff users can access companies across all tenants
- **Comprehensive Validation**: Input validation with detailed error messages
- **Audit Trail Support**: Built-in logging and validation patterns

This implementation provides a robust, scalable foundation for company management within the multi-tenant architecture while maintaining the security and performance characteristics required for production use.

## Next Steps

1. **API Route Implementation**: Create actual Next.js API routes using the provided examples
2. **Frontend Integration**: Update UI components to use the CompanyService
3. **Data Migration**: Migrate existing company data to the new schema
4. **Performance Monitoring**: Implement monitoring for company operations
5. **Advanced Features**: Add bulk operations, advanced filtering, and company analytics
