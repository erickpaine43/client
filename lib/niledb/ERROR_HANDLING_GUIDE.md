# NileDB Error Handling and Middleware System

This document provides a comprehensive guide to the enhanced error handling and middleware system implemented for the NileDB backend migration.

## Overview

The error handling system provides:

- **Centralized Error Management**: Consistent error types and handling across the application
- **Enhanced Middleware**: Comprehensive middleware with authentication, validation, rate limiting, and monitoring
- **Recovery Mechanisms**: Automatic error recovery and rollback capabilities
- **Monitoring & Alerting**: Real-time system monitoring with configurable alerts
- **Performance Tracking**: Request performance monitoring and optimization

## Error Classes

### Base Error Class

```typescript
class NileDBError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly context?: Record<string, unknown>;
}
```

### Authentication Errors

```typescript
// Basic authentication required
throw new AuthenticationError("Authentication required", "AUTH_REQUIRED");

// Session expired
throw new SessionExpiredError("Session has expired");

// Invalid credentials
throw new InvalidCredentialsError("Invalid login credentials");

// Insufficient privileges
throw new InsufficientPrivilegesError("Admin access required", "admin", "user");
```

### Tenant Errors

```typescript
// Tenant access denied
throw new TenantAccessError("Access denied", "tenant-123");

// Tenant not found
throw new TenantNotFoundError("Tenant not found", "tenant-123");

// Tenant context required
throw new TenantContextError("Tenant context required", "create_company");
```

### Validation Errors

```typescript
// Input validation failed
throw new ValidationError("Invalid input", {
  email: ["Invalid email format"],
  name: ["Name is required"],
});

// Resource not found
throw new ResourceNotFoundError("Company not found", "company", "comp-123");

// Resource conflict
throw new ConflictError("Email already exists", "unique_violation", {
  field: "email",
  value: "user@example.com",
});
```

### Database Errors

```typescript
// Database connection error
throw new DatabaseConnectionError("Connection failed");

// Query error
throw new QueryError("Query failed", "SELECT * FROM users", originalError);

// Transaction error
throw new TransactionError("Transaction rollback failed");
```

## Enhanced Middleware

### Authentication Middleware

```typescript
// Basic authentication
export const GET = withEnhancedAuthentication()(async (request, context) => {
  // request.user is available
  // context.isStaff indicates staff status
});

// Authentication with profile requirement
export const POST = withEnhancedAuthentication({
  requireProfile: true,
  rateLimit: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
})(async (request, context) => {
  // User profile is guaranteed to exist
});
```

### Tenant Access Middleware

```typescript
// Basic tenant access
export const GET = withEnhancedTenantAccess()(async (request, context) => {
  // request.tenantId is available
  // context.tenant contains tenant info
});

// Tenant access with role requirement
export const PUT = withEnhancedTenantAccess("admin", {
  validateTenantExists: true,
})(async (request, context) => {
  // User has admin role in tenant
});
```

### Staff Access Middleware

```typescript
// Staff access required
export const GET = withEnhancedStaffAccess("admin")(async (
  request,
  context
) => {
  // User is staff with admin level or higher
});

// Super admin access
export const DELETE = withEnhancedStaffAccess("super_admin")(async (
  request,
  context
) => {
  // User is super admin staff
});
```

### Input Validation Middleware

```typescript
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
});

export const POST = withEnhancedAuthentication()(
  withValidation(CreateUserSchema)(async (request, context, validatedBody) => {
    // validatedBody is type-safe and validated
    const { name, email, role } = validatedBody;
  })
);
```

### Enhanced Route Creation

```typescript
// Create route with multiple middleware layers
export const route = createEnhancedRoute(
  {
    GET: async (request, context) => {
      return NextResponse.json({ data: "success" });
    },
    POST: async (request, context) => {
      return NextResponse.json({ created: true });
    },
  },
  {
    requireAuth: true,
    requireTenant: true,
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 20,
    },
    auditLog: "user_management",
  }
);
```

## Error Recovery

### Automatic Retry

```typescript
import { withRetry } from "@/lib/niledb/errors";

// Retry database operations
const result = await withRetry(() => nile.db.query("SELECT * FROM users"), {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  retryableErrors: ["DATABASE_CONNECTION_ERROR", "QUERY_TIMEOUT"],
});
```

### Recovery Manager

```typescript
import { getRecoveryManager } from "@/lib/niledb/recovery";

const recoveryManager = getRecoveryManager();

// Create recovery point before critical operation
const recoveryPoint = await recoveryManager.createRecoveryPoint(
  "user_migration",
  "tenant-123",
  { batchSize: 100 }
);

// Perform automatic recovery
const recoveryResult = await recoveryManager.performAutoRecovery();

// Create system backup
const backup = await recoveryManager.createSystemBackup();

// Validate data integrity
const integrityCheck = await recoveryManager.validateDataIntegrity();
```

## Monitoring System

### Metrics Collection

```typescript
import { getMonitoringManager } from "@/lib/niledb/monitoring";

const monitoring = getMonitoringManager();

// Collect current metrics
const metrics = await monitoring.collectMetrics();

// Get metrics summary
const summary = monitoring.getMetricsSummary(60 * 60 * 1000); // Last hour

// Start continuous monitoring
const stopMonitoring = monitoring.startMonitoring(30000); // Every 30 seconds
```

### Custom Alerts

```typescript
// Add custom alert rule
monitoring.addAlertRule({
  id: "custom_error_rate",
  name: "Custom Error Rate Alert",
  condition: (metrics) => {
    const errorRate =
      metrics.errors.totalErrors / metrics.performance.requestsPerMinute;
    return errorRate > 0.05; // 5% error rate
  },
  severity: "medium",
  cooldownMs: 5 * 60 * 1000, // 5 minutes
  enabled: true,
});
```

## Global Middleware (middleware.ts)

The global Next.js middleware provides:

- **Security Headers**: Automatic security header injection
- **Rate Limiting**: Global rate limiting per IP
- **Request Logging**: Comprehensive request logging
- **CORS Handling**: Automatic CORS header management
- **Security Validation**: Request pattern validation

## API Endpoints

### Health Monitoring

```bash
# Basic health check
GET /api/health/niledb

# Quick health check
GET /api/health/niledb?quick=true

# Health check with config
GET /api/health/niledb?config=true
```

### System Monitoring (Staff Only)

```bash
# Get system metrics
GET /api/admin/monitoring

# Get detailed metrics
GET /api/admin/monitoring?includeDetails=true&limit=100

# Trigger manual metrics collection
POST /api/admin/monitoring

# Update alert rules
PUT /api/admin/monitoring

# Remove alert rule
DELETE /api/admin/monitoring?ruleId=rule_id
```

### Testing Endpoints

```bash
# Test enhanced middleware
GET /api/test/middleware
POST /api/test/middleware
PUT /api/test/middleware
DELETE /api/test/middleware

# Test recovery system
GET /api/test/recovery
POST /api/test/recovery
PUT /api/test/recovery
```

## Database Schema

### Monitoring Tables

The system creates several tables for monitoring and recovery:

- `recovery_points` - Recovery point storage
- `system_backups` - System backup metadata
- `error_logs` - Centralized error logging
- `performance_metrics` - Request performance data
- `alert_rules` - Alert rule configuration
- `alert_history` - Alert trigger history

### Setup

```bash
# Create monitoring schema
npm run setup:monitoring
```

## Testing

### Run Tests

```bash
# Test middleware system
npm run test:middleware

# Test error handling
npm run test:errors

# Test all error handling components
npm run test:error-handling
```

### Test Coverage

The test suite covers:

- Error class creation and serialization
- Error classification and type guards
- Middleware authentication and authorization
- Input validation and error handling
- Rate limiting functionality
- Recovery mechanisms
- Monitoring and alerting

## Best Practices

### Error Handling

1. **Use Specific Error Types**: Always use the most specific error type available
2. **Include Context**: Provide relevant context in error objects
3. **Log Appropriately**: Use appropriate log levels (error, warn, info)
4. **Handle Gracefully**: Implement graceful degradation for non-critical errors

### Middleware Usage

1. **Layer Appropriately**: Apply middleware in the correct order
2. **Validate Early**: Validate input as early as possible
3. **Rate Limit Sensibly**: Configure appropriate rate limits for different endpoints
4. **Monitor Performance**: Track performance metrics for optimization

### Recovery Planning

1. **Create Recovery Points**: Create recovery points before critical operations
2. **Test Recovery**: Regularly test recovery procedures
3. **Monitor Health**: Implement comprehensive health monitoring
4. **Plan Rollbacks**: Have rollback procedures for all major changes

### Security

1. **Validate All Input**: Never trust user input
2. **Implement Rate Limiting**: Protect against abuse
3. **Log Security Events**: Log all security-related events
4. **Use HTTPS**: Always use secure connections in production

## Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**: Check rate limit configuration and user behavior
2. **Authentication Failures**: Verify session management and user permissions
3. **Database Errors**: Check connection health and query performance
4. **Validation Errors**: Review input validation schemas and error messages

### Debugging

1. **Check Logs**: Review error logs for detailed information
2. **Monitor Metrics**: Use monitoring dashboard to identify patterns
3. **Test Recovery**: Use recovery endpoints to test system health
4. **Validate Configuration**: Ensure all environment variables are set correctly

### Performance Optimization

1. **Monitor Response Times**: Track and optimize slow endpoints
2. **Optimize Queries**: Review and optimize database queries
3. **Cache Appropriately**: Implement caching for frequently accessed data
4. **Scale Resources**: Scale database and server resources as needed

## Migration from Old System

The enhanced error handling system is designed to be backward compatible while providing improved functionality:

1. **Existing Error Handling**: Old error handling patterns continue to work
2. **Gradual Migration**: Migrate endpoints gradually to use enhanced middleware
3. **Monitoring Integration**: Existing monitoring can be enhanced with new metrics
4. **Recovery Capabilities**: New recovery features complement existing backup procedures

This system provides a robust foundation for error handling, monitoring, and recovery in the NileDB backend migration.
