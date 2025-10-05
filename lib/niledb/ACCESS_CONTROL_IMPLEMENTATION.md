# NileDB Access Control & Permission System Implementation

This document describes the comprehensive access control and permission system implementation for the NileDB backend migration, including tenant isolation, role-based access control, and staff privilege management.

## 🏗️ System Architecture

### Multi-Level Access Control

The access control system implements multiple layers of security:

1. **Authentication Layer**: NileDB built-in authentication with session management
2. **Tenant Isolation Layer**: Automatic tenant context enforcement
3. **Role-Based Access Control**: Hierarchical permissions within tenants
4. **Staff Privilege Layer**: Cross-tenant administrative access
5. **Resource-Level Permissions**: Fine-grained access control for specific operations

### Access Control Flow

```
Request → Authentication → Tenant Validation → Role Check → Resource Permission → Operation
```

## 🔐 Authentication System

### NileDB Authentication Integration

```typescript
// Authentication middleware
export const requireAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await nile.auth.getSession(req);

    if (!session?.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    // Attach user to request
    req.user = session.user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      error: "Authentication failed",
      code: "AUTH_FAILED",
    });
  }
};
```

### User Profile Integration

```typescript
// Get user with profile information
export const getUserWithProfile = async (userId: string) => {
  return await withoutTenantContext(async (nile) => {
    const result = await nile.db.query(
      `
      SELECT 
        u.id,
        u.email,
        u.name,
        up.role,
        up.is_penguinmails_staff,
        up.preferences
      FROM users.users u
      LEFT JOIN public.user_profiles up ON u.id = up.user_id
      WHERE u.id = $1 AND u.deleted IS NULL
    `,
      [userId]
    );

    return result.rows[0] || null;
  });
};

// Enhanced authentication with profile
export const requireAuthenticationWithProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await requireAuthentication(req, res, async () => {
    try {
      const userProfile = await getUserWithProfile(req.user.id);

      if (!userProfile) {
        return res.status(404).json({
          error: "User profile not found",
          code: "PROFILE_NOT_FOUND",
        });
      }

      req.userProfile = userProfile;
      next();
    } catch (error) {
      console.error("Profile fetch error:", error);
      return res.status(500).json({
        error: "Profile fetch failed",
        code: "PROFILE_FETCH_ERROR",
      });
    }
  });
};
```

## 🏢 Tenant Access Control

### Tenant Validation Middleware

```typescript
export const requireTenantAccess = (
  requiredRole?: CompanyRole | CompanyRole[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requireAuthenticationWithProfile(req, res, async () => {
        const tenantId = req.params.tenantId;

        if (!tenantId) {
          return res.status(400).json({
            error: "Tenant ID required",
            code: "TENANT_ID_REQUIRED",
          });
        }

        // Check if user is staff (can access any tenant)
        if (req.userProfile.is_penguinmails_staff) {
          req.isStaff = true;
          req.nile = await nile.withContext({ tenantId });

          // Log staff access
          await logStaffAccess(req.user.id, tenantId, req.path, req.method);
          return next();
        }

        // Validate regular user access to tenant
        const tenantAccess = await validateTenantAccess(req.user.id, tenantId);

        if (!tenantAccess.hasAccess) {
          await logAccessDenied(
            req.user.id,
            tenantId,
            req.path,
            "TENANT_ACCESS_DENIED"
          );
          return res.status(403).json({
            error: "Tenant access denied",
            code: "TENANT_ACCESS_DENIED",
          });
        }

        // Check role requirements if specified
        if (requiredRole) {
          const roles = Array.isArray(requiredRole)
            ? requiredRole
            : [requiredRole];
          const userRole = tenantAccess.role;

          if (!hasRequiredRole(userRole, roles)) {
            await logAccessDenied(
              req.user.id,
              tenantId,
              req.path,
              "INSUFFICIENT_ROLE"
            );
            return res.status(403).json({
              error: "Insufficient permissions",
              code: "INSUFFICIENT_ROLE",
              required: roles,
              current: userRole,
            });
          }
        }

        // Set tenant context and user info
        req.nile = await nile.withContext({ tenantId });
        req.tenantId = tenantId;
        req.userTenantRole = tenantAccess.role;
        req.userCompanies = tenantAccess.companies;

        // Log successful access
        await logAccessGranted(req.user.id, tenantId, req.path, req.method);
        next();
      });
    } catch (error) {
      console.error("Tenant access validation error:", error);
      return res.status(500).json({
        error: "Access validation failed",
        code: "ACCESS_VALIDATION_ERROR",
      });
    }
  };
};
```

### Tenant Access Validation

```typescript
interface TenantAccessResult {
  hasAccess: boolean;
  role?: CompanyRole;
  companies: CompanyAccess[];
}

interface CompanyAccess {
  id: string;
  name: string;
  role: CompanyRole;
  permissions: Record<string, any>;
}

const validateTenantAccess = async (
  userId: string,
  tenantId: string
): Promise<TenantAccessResult> => {
  const result = await withoutTenantContext(async (nile) => {
    return await nile.db.query(
      `
      SELECT 
        tu.tenant_id,
        tu.roles as tenant_roles,
        c.id as company_id,
        c.name as company_name,
        uc.role as company_role,
        uc.permissions
      FROM users.tenant_users tu
      LEFT JOIN public.user_companies uc ON tu.user_id = uc.user_id AND tu.tenant_id = uc.tenant_id
      LEFT JOIN public.companies c ON uc.company_id = c.id AND uc.tenant_id = c.tenant_id
      WHERE tu.user_id = $1 AND tu.tenant_id = $2 
        AND tu.deleted IS NULL 
        AND (uc.deleted IS NULL OR uc.deleted IS NULL)
        AND (c.deleted IS NULL OR c.deleted IS NULL)
    `,
      [userId, tenantId]
    );
  });

  if (result.rows.length === 0) {
    return { hasAccess: false, companies: [] };
  }

  // Determine highest role across all companies
  const roles = result.rows.map((row) => row.company_role).filter(Boolean);
  const highestRole = getHighestRole(roles);

  // Build company access list
  const companies = result.rows
    .filter((row) => row.company_id)
    .map((row) => ({
      id: row.company_id,
      name: row.company_name,
      role: row.company_role,
      permissions: row.permissions || {},
    }));

  return {
    hasAccess: true,
    role: highestRole,
    companies,
  };
};
```

## 👥 Role-Based Access Control

### Role Hierarchy System

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

const ROLE_HIERARCHY = {
  user: 1,
  admin: 2,
  super_admin: 3,
};

const COMPANY_ROLE_HIERARCHY = {
  member: 1,
  admin: 2,
  owner: 3,
};

const hasRequiredRole = (
  userRole: string,
  requiredRoles: string[]
): boolean => {
  const userLevel = COMPANY_ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = Math.min(
    ...requiredRoles.map((role) => COMPANY_ROLE_HIERARCHY[role] || 999)
  );

  return userLevel >= requiredLevel;
};

const getHighestRole = (roles: string[]): CompanyRole => {
  if (roles.includes("owner")) return CompanyRole.OWNER;
  if (roles.includes("admin")) return CompanyRole.ADMIN;
  return CompanyRole.MEMBER;
};
```

### Permission Matrix

```typescript
interface PermissionMatrix {
  [resource: string]: {
    [action: string]: CompanyRole[];
  };
}

const PERMISSIONS: PermissionMatrix = {
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
  audit: {
    read: ["admin", "owner"],
    write: [], // System only
    delete: [], // System only
  },
};

const hasPermission = (
  userRole: CompanyRole,
  resource: string,
  action: string
): boolean => {
  const resourcePermissions = PERMISSIONS[resource];
  if (!resourcePermissions) return false;

  const actionPermissions = resourcePermissions[action];
  if (!actionPermissions) return false;

  return actionPermissions.includes(userRole);
};
```

### Resource-Level Access Control

```typescript
export const requireResourcePermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Staff users have all permissions
    if (req.isStaff) {
      return next();
    }

    // Check if user has required permission
    if (!hasPermission(req.userTenantRole, resource, action)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        resource,
        action,
        required: PERMISSIONS[resource]?.[action] || [],
        current: req.userTenantRole,
      });
    }

    next();
  };
};

// Usage examples
app.get(
  "/api/tenants/:tenantId/companies",
  requireTenantAccess("member"),
  requireResourcePermission("company", "read"),
  getCompaniesHandler
);

app.post(
  "/api/tenants/:tenantId/companies",
  requireTenantAccess("admin"),
  requireResourcePermission("company", "write"),
  createCompanyHandler
);

app.delete(
  "/api/tenants/:tenantId/companies/:id",
  requireTenantAccess("owner"),
  requireResourcePermission("company", "delete"),
  deleteCompanyHandler
);
```

## 🛡️ Staff Access Control

### Staff Access Middleware

```typescript
export const requireStaffAccess = (
  requiredLevel: UserRole = UserRole.ADMIN
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requireAuthenticationWithProfile(req, res, async () => {
        // Check if user is PenguinMails staff
        if (!req.userProfile.is_penguinmails_staff) {
          await logAccessDenied(req.user.id, null, req.path, "NOT_STAFF");
          return res.status(403).json({
            error: "Staff access required",
            code: "STAFF_ACCESS_REQUIRED",
          });
        }

        // Check staff role level
        const userLevel = ROLE_HIERARCHY[req.userProfile.role] || 0;
        const requiredLevelValue = ROLE_HIERARCHY[requiredLevel];

        if (userLevel < requiredLevelValue) {
          await logAccessDenied(
            req.user.id,
            null,
            req.path,
            "INSUFFICIENT_STAFF_LEVEL"
          );
          return res.status(403).json({
            error: "Insufficient staff privileges",
            code: "INSUFFICIENT_STAFF_LEVEL",
            required: requiredLevel,
            current: req.userProfile.role,
          });
        }

        req.isStaff = true;
        req.staffLevel = req.userProfile.role;

        // Log staff access
        await logStaffAccess(req.user.id, null, req.path, req.method);
        next();
      });
    } catch (error) {
      console.error("Staff access validation error:", error);
      return res.status(500).json({
        error: "Staff access validation failed",
        code: "STAFF_ACCESS_ERROR",
      });
    }
  };
};
```

### Cross-Tenant Staff Operations

```typescript
// Staff can access any tenant's data
export const requireStaffTenantAccess = (
  tenantIdParam: string = "tenantId"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await requireStaffAccess()(req, res, async () => {
      const tenantId = req.params[tenantIdParam];

      if (tenantId) {
        // Validate tenant exists
        const tenantExists = await withoutTenantContext(async (nile) => {
          const result = await nile.db.query(
            "SELECT id FROM tenants WHERE id = $1 AND deleted IS NULL",
            [tenantId]
          );
          return result.rows.length > 0;
        });

        if (!tenantExists) {
          return res.status(404).json({
            error: "Tenant not found",
            code: "TENANT_NOT_FOUND",
          });
        }

        req.nile = await nile.withContext({ tenantId });
        req.tenantId = tenantId;
      }

      next();
    });
  };
};
```

## 📊 Audit Logging System

### Access Control Logging

```typescript
interface AccessLogEntry {
  user_id: string;
  tenant_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  endpoint: string;
  method: string;
  ip_address?: string;
  user_agent?: string;
  result: "granted" | "denied";
  reason?: string;
  details?: Record<string, any>;
}

const logAccessAttempt = async (entry: AccessLogEntry) => {
  try {
    if (entry.tenant_id) {
      // Tenant-scoped access log
      await withTenantContext(entry.tenant_id, async (nile) => {
        await nile.db.query(
          `
          INSERT INTO audit_logs (
            tenant_id, user_id, action, resource_type, resource_id,
            details, ip_address, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            entry.tenant_id,
            entry.user_id,
            entry.action,
            entry.resource_type,
            entry.resource_id,
            {
              endpoint: entry.endpoint,
              method: entry.method,
              result: entry.result,
              reason: entry.reason,
              ...entry.details,
            },
            entry.ip_address,
            entry.user_agent,
          ]
        );
      });
    } else {
      // Cross-tenant staff access log
      await withoutTenantContext(async (nile) => {
        await nile.db.query(
          `
          INSERT INTO staff_access_logs (
            user_id, action, resource_type, resource_id,
            details, ip_address, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            entry.user_id,
            entry.action,
            entry.resource_type,
            entry.resource_id,
            {
              endpoint: entry.endpoint,
              method: entry.method,
              result: entry.result,
              reason: entry.reason,
              ...entry.details,
            },
            entry.ip_address,
            entry.user_agent,
          ]
        );
      });
    }
  } catch (error) {
    console.error("Audit logging error:", error);
    // Don't fail the request due to logging errors
  }
};

const logAccessGranted = async (
  userId: string,
  tenantId: string,
  endpoint: string,
  method: string
) => {
  await logAccessAttempt({
    user_id: userId,
    tenant_id: tenantId,
    action: "access_granted",
    resource_type: "endpoint",
    endpoint,
    method,
    result: "granted",
  });
};

const logAccessDenied = async (
  userId: string,
  tenantId: string | null,
  endpoint: string,
  reason: string
) => {
  await logAccessAttempt({
    user_id: userId,
    tenant_id: tenantId || undefined,
    action: "access_denied",
    resource_type: "endpoint",
    endpoint,
    method: "unknown",
    result: "denied",
    reason,
  });
};

const logStaffAccess = async (
  userId: string,
  tenantId: string | null,
  endpoint: string,
  method: string
) => {
  await logAccessAttempt({
    user_id: userId,
    tenant_id: tenantId || undefined,
    action: "staff_access",
    resource_type: "endpoint",
    endpoint,
    method,
    result: "granted",
    details: { staff_access: true },
  });
};
```

## 🔧 Implementation Examples

### API Route Protection

```typescript
// Basic tenant access
app.get(
  "/api/tenants/:tenantId/companies",
  requireTenantAccess("member"),
  async (req, res) => {
    try {
      const companies = await req.nile.db.query(`
        SELECT id, name, email, settings
        FROM companies
        WHERE deleted IS NULL
        ORDER BY name
      `);

      res.json({ companies: companies.rows });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  }
);

// Role-based company creation
app.post(
  "/api/tenants/:tenantId/companies",
  requireTenantAccess("admin"),
  requireResourcePermission("company", "write"),
  async (req, res) => {
    try {
      const { name, email, settings } = req.body;

      const result = await req.nile.db.query(
        `
        INSERT INTO companies (tenant_id, name, email, settings)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email
      `,
        [req.tenantId, name, email, settings]
      );

      res.status(201).json({ company: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: "Failed to create company" });
    }
  }
);

// Staff-only cross-tenant access
app.get(
  "/api/admin/companies",
  requireStaffAccess("admin"),
  async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  }
);
```

### User Management with Access Control

```typescript
// Get user's accessible companies
app.get(
  "/api/tenants/:tenantId/user/companies",
  requireTenantAccess("member"),
  async (req, res) => {
    try {
      const companies = await req.nile.db.query(
        `
        SELECT 
          c.id,
          c.name,
          c.email,
          uc.role,
          uc.permissions
        FROM companies c
        JOIN user_companies uc ON c.id = uc.company_id AND c.tenant_id = uc.tenant_id
        WHERE uc.user_id = $1 AND uc.deleted IS NULL AND c.deleted IS NULL
        ORDER BY c.name
      `,
        [req.user.id]
      );

      res.json({ companies: companies.rows });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user companies" });
    }
  }
);

// Update user role in company (admin only)
app.put(
  "/api/tenants/:tenantId/companies/:companyId/users/:userId/role",
  requireTenantAccess("admin"),
  requireResourcePermission("user", "write"),
  async (req, res) => {
    try {
      const { companyId, userId } = req.params;
      const { role } = req.body;

      // Validate role
      if (!Object.values(CompanyRole).includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Prevent self-demotion from owner
      if (
        userId === req.user.id &&
        req.userTenantRole === "owner" &&
        role !== "owner"
      ) {
        return res
          .status(400)
          .json({ error: "Cannot demote yourself from owner role" });
      }

      const result = await req.nile.db.query(
        `
        UPDATE user_companies 
        SET role = $1, updated = LOCALTIMESTAMP
        WHERE user_id = $2 AND company_id = $3 AND tenant_id = $4 AND deleted IS NULL
        RETURNING role
      `,
        [role, userId, companyId, req.tenantId]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "User-company relationship not found" });
      }

      res.json({ role: result.rows[0].role });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role" });
    }
  }
);
```

### Billing Access Control

```typescript
// Tenant billing (owner only)
app.get(
  "/api/tenants/:tenantId/billing",
  requireTenantAccess("owner"),
  requireResourcePermission("billing", "read"),
  async (req, res) => {
    try {
      const billing = await req.nile.db.query(
        `
        SELECT 
          plan,
          billing_email,
          subscription_status,
          current_period_start,
          current_period_end
        FROM tenant_billing
        WHERE tenant_id = $1 AND deleted IS NULL
      `,
        [req.tenantId]
      );

      res.json({ billing: billing.rows[0] || null });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billing information" });
    }
  }
);

// Update billing (owner only)
app.put(
  "/api/tenants/:tenantId/billing",
  requireTenantAccess("owner"),
  requireResourcePermission("billing", "write"),
  async (req, res) => {
    try {
      const { plan, billing_email } = req.body;

      const result = await req.nile.db.query(
        `
        INSERT INTO tenant_billing (tenant_id, plan, billing_email)
        VALUES ($1, $2, $3)
        ON CONFLICT (tenant_id) DO UPDATE SET
          plan = EXCLUDED.plan,
          billing_email = EXCLUDED.billing_email,
          updated = LOCALTIMESTAMP
        RETURNING plan, billing_email, subscription_status
      `,
        [req.tenantId, plan, billing_email]
      );

      res.json({ billing: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: "Failed to update billing information" });
    }
  }
);
```

## 🧪 Testing Access Control

### Test Utilities

```typescript
// Create test user with specific role
const createTestUser = async (
  role: UserRole = UserRole.USER,
  isStaff: boolean = false
) => {
  const user = await testNile.auth.signUp({
    email: `test-${Date.now()}@example.com`,
    password: "test123",
  });

  await testNile.db.query(
    `
    INSERT INTO user_profiles (user_id, role, is_penguinmails_staff)
    VALUES ($1, $2, $3)
  `,
    [user.id, role, isStaff]
  );

  return user;
};

// Create test tenant with user
const createTestTenantWithUser = async (
  userRole: CompanyRole = CompanyRole.MEMBER
) => {
  const tenant = await createTestTenant(testNile, "Test Tenant");
  const user = await createTestUser();

  // Add user to tenant
  await testNile.db.query(
    `
    INSERT INTO users.tenant_users (tenant_id, user_id, email)
    VALUES ($1, $2, $3)
  `,
    [tenant.id, user.id, user.email]
  );

  // Create company and add user
  const company = await testNile.db.query(
    `
    INSERT INTO companies (tenant_id, name)
    VALUES ($1, 'Test Company')
    RETURNING id, name
  `,
    [tenant.id]
  );

  await testNile.db.query(
    `
    INSERT INTO user_companies (tenant_id, user_id, company_id, role)
    VALUES ($1, $2, $3, $4)
  `,
    [tenant.id, user.id, company.rows[0].id, userRole]
  );

  return { tenant, user, company: company.rows[0] };
};
```

### Access Control Tests

```typescript
describe("Access Control System", () => {
  test("should allow tenant member to read companies", async () => {
    const { tenant, user } = await createTestTenantWithUser("member");

    const req = mockRequest({
      user,
      params: { tenantId: tenant.id },
    });
    const res = mockResponse();

    await requireTenantAccess("member")(req, res, () => {
      expect(req.tenantId).toBe(tenant.id);
      expect(req.userTenantRole).toBe("member");
    });
  });

  test("should deny tenant access to non-member", async () => {
    const tenant = await createTestTenant(testNile, "Test Tenant");
    const user = await createTestUser();

    const req = mockRequest({
      user,
      params: { tenantId: tenant.id },
    });
    const res = mockResponse();

    await requireTenantAccess("member")(req, res, () => {
      fail("Should not reach next middleware");
    });

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("should allow staff cross-tenant access", async () => {
    const tenant = await createTestTenant(testNile, "Test Tenant");
    const staffUser = await createTestUser("admin", true);

    const req = mockRequest({
      user: staffUser,
      params: { tenantId: tenant.id },
    });
    const res = mockResponse();

    await requireTenantAccess("member")(req, res, () => {
      expect(req.isStaff).toBe(true);
      expect(req.tenantId).toBe(tenant.id);
    });
  });

  test("should enforce role hierarchy", async () => {
    const { tenant, user } = await createTestTenantWithUser("member");

    const req = mockRequest({
      user,
      params: { tenantId: tenant.id },
    });
    const res = mockResponse();

    // Member should not be able to access admin-only endpoint
    await requireTenantAccess("admin")(req, res, () => {
      fail("Should not reach next middleware");
    });

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
```

## 📋 Security Best Practices

### Authentication Security

1. **Session Validation**: Always validate sessions on protected routes
2. **Token Expiration**: Implement proper token expiration and refresh
3. **CSRF Protection**: Use NileDB's built-in CSRF protection
4. **Secure Cookies**: Enable secure cookies in production

### Authorization Security

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Role Validation**: Always validate roles before granting access
3. **Resource Ownership**: Verify user owns or has access to resources
4. **Staff Oversight**: Log and monitor all staff access

### Audit Security

1. **Comprehensive Logging**: Log all access attempts and outcomes
2. **Tamper Protection**: Protect audit logs from modification
3. **Regular Review**: Implement regular audit log review processes
4. **Retention Policy**: Define appropriate log retention policies

### Performance Security

1. **Rate Limiting**: Implement rate limiting on authentication endpoints
2. **Query Optimization**: Optimize access control queries for performance
3. **Caching Strategy**: Cache user permissions appropriately
4. **Connection Pooling**: Use proper connection pooling for database access

This comprehensive access control system provides robust security while maintaining the flexibility needed for a multi-tenant application with administrative capabilities.
