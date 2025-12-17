# Authentication and Authorization Patterns Guide

This guide documents the standardized authentication and authorization patterns implemented across all server actions in the application.

## Overview

The new authentication system provides:

- **Consistent authentication checking** across all actions
- **Company/tenant isolation** for multi-tenant security
- **Rate limiting** for sensitive operations
- **Permission-based access control** with role-based permissions
- **Comprehensive audit logging** for security events
- **Standardized error handling** and validation

## Architecture

### Core Components

1. **`lib/actions/core/auth.ts`** - Basic authentication utilities
2. **`lib/actions/core/auth-middleware.ts`** - Comprehensive security middleware
3. **`types/auth.ts`** - Authentication types and permission definitions
4. **`lib/utils/auth.ts`** - Low-level authentication utilities

### Security Middleware

The `withSecurity` function is the main entry point for all authenticated actions:

```typescript
import { withSecurity, SecurityConfigs } from "../core/auth-middleware";

export async function myAction(data: MyData): Promise<ActionResult<MyResult>> {
  return withSecurity(
    "my_action",
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Your action logic here
      // context.userId and context.companyId are guaranteed to exist
      // Rate limiting and permissions are automatically enforced
    }
  );
}
```

## Authentication Levels

### AuthLevel.NONE

- No authentication required
- Used for public endpoints
- Still provides request tracking and basic rate limiting

```typescript
const config: SecurityConfig = {
  auth: { level: AuthLevel.NONE },
  rateLimit: {
    type: RateLimitType.IP,
    action: "public_read",
    config: RateLimits.GENERAL_READ,
  },
};
```

### AuthLevel.USER

- Basic user authentication required
- User must be logged in
- Provides `context.userId`

```typescript
const config: SecurityConfig = {
  auth: { level: AuthLevel.USER },
  rateLimit: {
    type: RateLimitType.USER,
    action: "user_read",
    config: RateLimits.GENERAL_READ,
  },
};
```

### AuthLevel.COMPANY

- User authentication + company context required
- Provides `context.userId` and `context.companyId`
- Enforces tenant isolation

```typescript
const config: SecurityConfig = {
  auth: {
    level: AuthLevel.COMPANY,
    requireCompanyIsolation: true,
  },
  rateLimit: {
    type: RateLimitType.COMPANY,
    action: "company_read",
    config: RateLimits.GENERAL_READ,
  },
};
```

### AuthLevel.PERMISSION

- Requires specific permission
- Automatically checks user permissions
- Can be combined with company isolation

```typescript
const config: SecurityConfig = {
  auth: {
    level: AuthLevel.PERMISSION,
    permission: Permission.VIEW_ANALYTICS,
    requireCompanyIsolation: true,
  },
  rateLimit: {
    type: RateLimitType.COMPANY,
    action: "analytics_read",
    config: RateLimits.ANALYTICS_QUERY,
  },
};
```

### AuthLevel.ADMIN / AuthLevel.SUPER_ADMIN

- Role-based authentication
- Requires admin or super admin permissions
- Includes comprehensive audit logging

```typescript
const config: SecurityConfig = {
  auth: { level: AuthLevel.ADMIN },
  audit: {
    enabled: true,
    sensitiveData: true,
    includeRequestData: true,
  },
  validation: {
    requireHttps: true,
  },
};
```

## Rate Limiting

### Rate Limit Types

#### RateLimitType.USER

- Per-user rate limiting
- Key format: `user:{userId}:{action}`
- Best for user-specific operations

#### RateLimitType.COMPANY

- Per-company rate limiting
- Key format: `company:{companyId}:{action}`
- Best for company-wide operations

#### RateLimitType.IP

- Per-IP address rate limiting
- Key format: `ip:{ipAddress}:{action}`
- Best for public endpoints

#### RateLimitType.GLOBAL

- Global rate limiting
- Key format: `global:{action}`
- Best for system-wide limits

### Predefined Rate Limits

```typescript
export const RateLimits = {
  // Authentication
  AUTH_LOGIN: { limit: 5, windowMs: 300000 }, // 5 per 5 minutes
  AUTH_SIGNUP: { limit: 3, windowMs: 3600000 }, // 3 per hour

  // General operations
  GENERAL_READ: { limit: 1000, windowMs: 60000 }, // 1000 per minute
  GENERAL_WRITE: { limit: 100, windowMs: 60000 }, // 100 per minute

  // Sensitive operations
  SENSITIVE_ACTION: { limit: 5, windowMs: 60000 }, // 5 per minute
  BULK_OPERATION: { limit: 10, windowMs: 300000 }, // 10 per 5 minutes

  // Analytics
  ANALYTICS_QUERY: { limit: 200, windowMs: 60000 }, // 200 per minute
  ANALYTICS_EXPORT: { limit: 10, windowMs: 3600000 }, // 10 per hour

  // Billing
  BILLING_UPDATE: { limit: 5, windowMs: 300000 }, // 5 per 5 minutes
};
```

## Permission System

### Permission Definitions

```typescript
export enum Permission {
  // User management
  CREATE_USER = "create_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",
  VIEW_USERS = "view_users",

  // Campaign management
  CREATE_CAMPAIGN = "create_campaign",
  UPDATE_CAMPAIGN = "update_campaign",
  DELETE_PAIGN = "delete_campaign",
  VIEW_CAMPAIGNS = "view_campaigns",

  // Analytics
  VIEW_ANALYTICS = "view_analytics",
  EXPORT_DATA = "export_data",

  // Billing
  VIEW_BILLING = "view_billing",
  UPDATE_BILLING = "update_billing",
  MANAGE_SUBSCRIPTIONS = "manage_subscriptions",
}
```

### Role-Based Permissions

```typescript
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    // ... more permissions
  ],
  [UserRole.MANAGER]: [
    Permission.CREATE_CAMPAIGN,
    Permission.UPDATE_CAMPAIGN,
    Permission.VIEW_ANALYTICS,
    // ... more permissions
  ],
  [UserRole.USER]: [
    Permission.CREATE_CAMPAIGN,
    Permission.VIEW_CAMPAIGNS,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.GUEST]: [Permission.VIEW_ANALYTICS],
};
```

## Predefined Security Configurations

### SecurityConfigs.PUBLIC_READ

```typescript
{
  auth: { level: AuthLevel.NONE },
  rateLimit: {
    type: RateLimitType.IP,
    action: 'public_read',
    config: RateLimits.GENERAL_READ,
  },
  audit: { enabled: false },
}
```

### SecurityConfigs.USER_READ

```typescript
{
  auth: { level: AuthLevel.USER },
  rateLimit: {
    type: RateLimitType.USER,
    action: 'user_read',
    config: RateLimits.GENERAL_READ,
  },
  audit: { enabled: false },
}
```

### SecurityConfigs.COMPANY_READ

```typescript
{
  auth: {
    level: AuthLevel.COMPANY,
    requireCompanyIsolation: true,
  },
  rateLimit: {
    type: RateLimitType.COMPANY,
    action: 'company_read',
    config: RateLimits.GENERAL_READ,
  },
  audit: { enabled: false },
}
```

### SecurityConfigs.COMPANY_WRITE

```typescript
{
  auth: {
    level: AuthLevel.COMPANY,
    requireCompanyIsolation: true,
  },
  rateLimit: {
    type: RateLimitType.COMPANY,
    action: 'company_write',
    config: RateLimits.GENERAL_WRITE,
  },
  audit: { enabled: true },
}
```

### SecurityConfigs.SENSITIVE_OPERATION

```typescript
{
  auth: {
    level: AuthLevel.COMPANY,
    requireCompanyIsolation: true,
  },
  rateLimit: {
    type: RateLimitType.USER,
    action: 'sensitive_operation',
    config: RateLimits.SENSITIVE_ACTION,
  },
  audit: {
    enabled: true,
    sensitiveData: true,
    includeRequestData: true,
  },
  validation: {
    requireHttps: true,
  },
}
```

### SecurityConfigs.BILLING_OPERATION

```typescript
{
  auth: {
    level: AuthLevel.PERMISSION,
    permission: Permission.UPDATE_BILLING,
    requireCompanyIsolation: true,
  },
  rateLimit: {
    type: RateLimitType.USER,
    action: 'billing_operation',
    config: RateLimits.BILLING_UPDATE,
  },
  audit: {
    enabled: true,
    sensitiveData: true,
    includeRequestData: true,
  },
  validation: {
    requireHttps: true,
  },
}
```

### SecurityConfigs.ANALYTICS_READ

```typescript
{
  auth: {
    level: AuthLevel.PERMISSION,
    permission: Permission.VIEW_ANALYTICS,
    requireCompanyIsolation: true,
  },
  rateLimit: {
    type: RateLimitType.COMPANY,
    action: 'analytics_read',
    config: RateLimits.ANALYTICS_QUERY,
  },
  audit: { enabled: false },
}
```

### SecurityConfigs.BULK_OPERATION

```typescript
{
  auth: {
    level: AuthLevel.COMPANY,
    requireCompanyIsolation: true,
  },
  rateLimit: {
    type: RateLimitType.USER,
    action: 'bulk_operation',
    config: RateLimits.BULK_OPERATION,
  },
  audit: {
    enabled: true,
    includeRequestData: true,
  },
}
```

## Company/Tenant Isolation

### Automatic Isolation

When using `AuthLevel.COMPANY` or `requireCompanyIsolation: true`, the middleware automatically:

1. Validates that the user has a company context
2. Ensures all operations are scoped to the user's company
3. Prevents cross-tenant data access

### Manual Isolation Checks

For additional security, you can manually validate company isolation:

```typescript
import { validateCompanyIsolation } from "../core/auth";

export async function getResource(
  resourceId: string
): Promise<ActionResult<Resource>> {
  return withSecurity(
    "get_resource",
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Get resource from database
      const resource = await getResourceById(resourceId);

      // Validate company isolation
      const isolationResult = await validateCompanyIsolation(
        resource.companyId,
        context
      );

      if (!isolationResult.success) {
        return isolationResult as ActionResult<Resource>;
      }

      return { success: true, data: resource };
    }
  );
}
```

## Audit Logging

### Automatic Logging

When `audit.enabled: true`, the middleware automatically logs:

- Action name and timestamp
- User ID and company ID
- IP address and user agent
- Success/failure status
- Error messages (if any)
- Request metadata (if enabled)

### Audit Log Structure

```typescript
interface AuditLogEntry {
  timestamp: number;
  userId?: string;
  companyId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}
```

### Accessing Audit Logs

```typescript
import { getAuditLogs } from "../core/auth-middleware";

// Get audit logs (admin only)
const logsResult = await getAuditLogs({
  userId: "user123",
  startTime: Date.now() - 86400000, // Last 24 hours
  success: false, // Only failed operations
});
```

## Migration Guide

### Updating Existing Actions

1. **Add imports**:

```typescript
import { withSecurity, SecurityConfigs } from "../core/auth-middleware";
```

2. **Replace old patterns**:

```typescript
// Old pattern
export async function myAction(): Promise<ActionResult<MyResult>> {
  return withContextualRateLimit(
    "my_action",
    "company",
    RateLimits.GENERAL_WRITE,
    () =>
      withAuthAndCompany(
        async (context: ActionContext & { companyId: string }) => {
          // Action logic
        }
      )
  );
}

// New pattern
export async function myAction(): Promise<ActionResult<MyResult>> {
  return withSecurity(
    "my_action",
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized("Company context required");
      }

      // Action logic
    }
  );
}
```

3. **Add company context validation**:

```typescript
// Ensure company context exists
if (!context.companyId) {
  return ErrorFactory.unauthorized("Company context required");
}
```

4. **Remove manual rate limiting**:

```typescript
// Remove these patterns
const rateLimiter = new RateLimiter();
const canProceed = await rateLimiter.checkLimit(...);
if (!canProceed) {
  return ErrorFactory.rateLimit('...');
}
```

### Automated Migration

Use the migration script to automatically update action files:

```bash
# Run migration
npx tsx scripts/migrate-auth-patterns.ts

# Generate migration report
npx tsx scripts/migrate-auth-patterns.ts report
```

## Best Practices

### 1. Choose Appropriate Security Levels

- Use `PUBLIC_READ` only for truly public data
- Use `USER_READ` for user-specific data that doesn't need company isolation
- Use `COMPANY_READ` for company-scoped data
- Use `PERMISSION` levels for operations requiring specific permissions
- Use `ADMIN` levels for administrative operations

### 2. Apply Proper Rate Limiting

- Use `USER` rate limiting for user-specific operations
- Use `COMPANY` rate limiting for company-wide operations
- Use `IP` rate limiting for public endpoints
- Use `GLOBAL` rate limiting sparingly for system-wide limits

### 3. Enable Audit Logging Appropriately

- Enable for all write operations
- Enable for sensitive read operations
- Include request data for debugging sensitive operations
- Disable for high-frequency read operations to reduce noise

### 4. Validate Company Isolation

- Always validate company isolation for multi-tenant operations
- Use automatic isolation when possible
- Add manual checks for complex scenarios
- Test cross-tenant access prevention

### 5. Handle Errors Consistently

- Use `ErrorFactory` for consistent error responses
- Provide meaningful error messages
- Log security events appropriately
- Don't expose sensitive information in error messages

## Testing

### Unit Tests

```typescript
import { withSecurity, SecurityConfigs } from "../core/auth-middleware";

describe("myAction", () => {
  it("should require authentication", async () => {
    // Mock unauthenticated request
    const result = await myAction(testData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Authentication required");
  });

  it("should enforce company isolation", async () => {
    // Mock user from different company
    const result = await myAction(testData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("different organization");
  });

  it("should apply rate limiting", async () => {
    // Make multiple requests quickly
    const promises = Array(10)
      .fill(null)
      .map(() => myAction(testData));
    const results = await Promise.all(promises);

    const rateLimitedResults = results.filter(
      (r) => !r.success && r.error?.includes("Rate limit")
    );
    expect(rateLimitedResults.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe("Authentication Integration", () => {
  it("should log audit events", async () => {
    await myAction(testData);

    const auditLogs = await getAuditLogs({
      action: "my_action",
      userId: testUserId,
    });

    expect(auditLogs.success).toBe(true);
    expect(auditLogs.data).toHaveLength(1);
  });
});
```

## Troubleshooting

### Common Issues

1. **"Company context required" errors**
   - Ensure user has a valid company association
   - Check that company ID is properly set in user context
   - Verify tenant isolation is working correctly

2. **Rate limiting too aggressive**
   - Adjust rate limit configurations
   - Use appropriate rate limit types
   - Consider user vs company vs IP rate limiting

3. **Permission denied errors**
   - Verify user has required permissions
   - Check role-based permission mappings
   - Ensure permission checks are working correctly

4. **Audit logs not appearing**
   - Verify audit logging is enabled in security config
   - Check that audit log storage is working
   - Ensure proper error handling in audit logging

### Debugging

Enable debug logging:

```typescript
// In development
if (process.env.NODE_ENV === "development") {
  console.log("Security Event:", auditEntry);
}
```

Check rate limit statistics:

```typescript
import { getRateLimitStats } from "../core/auth";

const stats = getRateLimitStats();
console.log("Rate limit stats:", stats);
```

## Security Considerations

1. **Always use HTTPS in production** for sensitive operations
2. **Validate all inputs** before processing
3. **Log security events** for monitoring and compliance
4. **Regularly review audit logs** for suspicious activity
5. **Keep rate limits reasonable** but protective
6. **Test cross-tenant isolation** thoroughly
7. **Monitor for authentication bypass attempts**
8. **Use strong session management** practices

## Performance Considerations

1. **Rate limiting is in-memory** - use Redis in production
2. **Audit logs are in-memory** - use proper logging service in production
3. **Permission checks** may require database queries - consider caching
4. **Company isolation checks** should be efficient
5. **Monitor middleware overhead** and optimize as needed

## Future Enhancements

1. **Redis-based rate limiting** for distributed systems
2. **Database-backed audit logging** with retention policies
3. **Advanced permission caching** for better performance
4. **Real-time security monitoring** and alerting
5. **Automated security testing** and compliance checks
6. **Integration with external security services**
7. **Advanced threat detection** and prevention
