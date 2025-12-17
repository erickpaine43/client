# NileDB Database Service Layer

A comprehensive database service layer for NileDB integration with multi-schema architecture support, tenant context management, cross-schema queries, and performance optimization.

## Overview

The DatabaseService class provides a high-level interface for interacting with NileDB's multi-schema architecture, handling tenant isolation, cross-schema relationships, and performance monitoring automatically.

## Key Features

- **Multi-Schema Support**: Seamless queries across `users`, `public`, and `auth` schemas
- **Tenant Context Management**: Automatic tenant isolation with `withTenantContext()` and `withoutTenantContext()`
- **Cross-Schema Queries**: Built-in methods for user-tenant-company relationships
- **Performance Monitoring**: Automatic query performance tracking and slow query detection
- **Access Control**: Built-in staff user validation and tenant access control
- **Error Handling**: Enhanced error messages with query context
- **Transaction Support**: Basic transaction management with tenant context
- **Admin Operations**: Cross-tenant queries for administrative dashboards

## Quick Start

```typescript
import { getDatabaseService } from "@/lib/niledb";

const db = getDatabaseService();

// Basic query
const result = await db.query("SELECT * FROM companies WHERE deleted IS NULL");

// Tenant-scoped query
const companies = await db.queryWithContext(
  "tenant-123",
  "SELECT * FROM companies ORDER BY name"
);

// Cross-tenant admin query
const allTenants = await db.queryCrossTenant("SELECT * FROM tenants");
```

## API Reference

### Core Methods

#### `query<T>(sql: string, params?: any[]): Promise<QueryResult<T>>`

Execute a basic SQL query with automatic performance tracking.

```typescript
const users = await db.query("SELECT * FROM user_profiles WHERE role = $1", [
  "admin",
]);
```

#### `queryWithContext<T>(tenantId: string, sql: string, params?: any[]): Promise<QueryResult<T>>`

Execute a query with tenant context for automatic tenant isolation.

```typescript
const companies = await db.queryWithContext(
  "tenant-123",
  "SELECT * FROM companies WHERE deleted IS NULL"
);
```

#### `queryCrossTenant<T>(sql: string, params?: any[]): Promise<QueryResult<T>>`

Execute a cross-tenant query for admin operations.

```typescript
const stats = await db.queryCrossTenant(`
  SELECT 
    COUNT(*) as total_companies,
    COUNT(DISTINCT tenant_id) as total_tenants
  FROM companies
`);
```

### Cross-Schema Query Methods

#### `getUserWithFullContext(userId: string, options?: CrossSchemaQueryOptions): Promise<any>`

Get user information with tenant and profile data from multiple schemas.

```typescript
const user = await db.getUserWithFullContext("user-123");
console.log(user.tenant_names); // Array of tenant names
console.log(user.is_penguinmails_staff); // Staff status
```

#### `getUserCompanyRelationships(userId?: string, tenantId?: string, options?: CrossSchemaQueryOptions): Promise<any[]>`

Get user-company relationships with full context.

```typescript
// Get all relationships for a user
const relationships = await db.getUserCompanyRelationships("user-123");

// Get relationships within a specific tenant
const tenantRelationships = await db.getUserCompanyRelationships(
  "user-123",
  "tenant-456"
);
```

#### `getCompaniesWithStats(tenantId?: string, options?: CrossSchemaQueryOptions): Promise<any[]>`

Get companies with user count statistics.

```typescript
// Get all companies with stats
const companies = await db.getCompaniesWithStats();

// Get companies for specific tenant
const tenantCompanies = await db.getCompaniesWithStats("tenant-123");
```

### Access Control Methods

#### `validateTenantAccess(userId: string, tenantId: string): Promise<boolean>`

Check if a user has access to a specific tenant.

```typescript
const hasAccess = await db.validateTenantAccess("user-123", "tenant-456");
if (!hasAccess) {
  throw new Error("Access denied");
}
```

#### `isStaffUser(userId: string): Promise<boolean>`

Check if a user is a staff member with elevated privileges.

```typescript
const isStaff = await db.isStaffUser("user-123");
if (isStaff) {
  // Allow admin operations
}
```

### System Information Methods

#### `getSystemStatistics(): Promise<SystemStats>`

Get comprehensive system statistics for admin dashboards.

```typescript
const stats = await db.getSystemStatistics();
console.log({
  totalTenants: stats.totalTenants,
  totalUsers: stats.totalUsers,
  totalCompanies: stats.totalCompanies,
  staffUsers: stats.staffUsers,
  activeSubscriptions: stats.activeSubscriptions,
});
```

### Performance Methods

#### `getPerformanceMetrics(): PerformanceMetrics`

Get current performance metrics.

```typescript
const metrics = db.getPerformanceMetrics();
console.log({
  queryCount: metrics.queryCount,
  averageTime: metrics.averageTime,
  slowQueries: metrics.slowQueries.length,
});
```

#### `runPerformanceBenchmark(): Promise<BenchmarkResult>`

Run a comprehensive performance benchmark.

```typescript
const benchmark = await db.runPerformanceBenchmark();
console.log("Connection test:", benchmark.connectionTest);
console.log("Query performance:", benchmark.queryPerformance);
```

#### `resetPerformanceMetrics(): void`

Reset performance metrics for a new monitoring period.

```typescript
db.resetPerformanceMetrics();
```

### Transaction Support

#### `transaction<T>(callback: (client: DatabaseClient) => Promise<T>, tenantId?: string): Promise<T>`

Execute operations within a transaction context.

```typescript
const result = await db.transaction(async (client) => {
  const company = await client.query(
    "INSERT INTO companies (name) VALUES ($1) RETURNING id",
    ["New Company"]
  );

  const relationship = await client.query(
    "INSERT INTO user_companies (user_id, company_id, role) VALUES ($1, $2, $3)",
    ["user-123", company.rows[0].id, "owner"]
  );

  return { company: company.rows[0], relationship: relationship.rows[0] };
}, "tenant-123");
```

## Query Options

Many methods accept `CrossSchemaQueryOptions` for advanced query control:

```typescript
interface CrossSchemaQueryOptions {
  includeSoftDeleted?: boolean; // Include soft-deleted records
  orderBy?: string; // Custom ORDER BY clause
  limit?: number; // Limit results
  offset?: number; // Offset for pagination
}
```

Example usage:

```typescript
const companies = await db.getCompaniesWithStats("tenant-123", {
  orderBy: "user_count DESC, name ASC",
  limit: 10,
  offset: 0,
});
```

## Performance Optimization

### Automatic Performance Tracking

The service automatically tracks:

- Query execution time
- Total query count
- Average response time
- Slow queries (configurable threshold)

### Slow Query Detection

Queries exceeding the threshold (default: 1000ms) are automatically logged:

```typescript
// Create service with custom slow query threshold
const db = createDatabaseService(undefined, 500); // 500ms threshold
```

### Performance Best Practices

1. **Use Prepared Statements**: The service handles parameter binding automatically
2. **Leverage Indexes**: Ensure proper indexes exist for your query patterns
3. **Monitor Metrics**: Regularly check performance metrics
4. **Batch Operations**: Use transactions for multiple related operations

## Error Handling

The service provides enhanced error messages with query context:

```typescript
try {
  await db.query("SELECT * FROM invalid_table");
} catch (error) {
  console.error(error.message); // Includes SQL and parameters
}
```

## Multi-Schema Architecture

The service is designed for NileDB's multi-schema architecture:

- **`users` Schema**: NileDB built-in authentication tables
- **`public` Schema**: Custom business logic tables
- **Cross-Schema Joins**: Automatic handling of relationships between schemas

### Schema Relationships

```sql
-- Cross-schema relationships handled automatically
users.users ← public.user_profiles (user_id)
users.tenant_users → public.tenants (tenant_id)
public.companies → public.tenants (tenant_id)
public.user_companies → users.users (user_id)
```

## Factory Functions

### `getDatabaseService(): DatabaseService`

Get singleton database service instance.

```typescript
const db = getDatabaseService();
```

### `createDatabaseService(client?: Server, slowQueryThreshold?: number): DatabaseService`

Create a new database service instance with custom configuration.

```typescript
const customDb = createDatabaseService(customClient, 500);
```

### `resetDatabaseService(): void`

Reset singleton instance (useful for testing).

```typescript
resetDatabaseService();
```

## Testing

The service includes comprehensive unit tests covering:

- Basic query operations
- Tenant context management
- Cross-schema queries
- Performance tracking
- Error handling
- Access control

Run tests:

```bash
npm test -- lib/niledb/__tests__/database.test.ts
```

## Examples

See `lib/niledb/examples/database-usage.ts` for comprehensive usage examples including:

- Basic operations
- Tenant-scoped queries
- Cross-schema relationships
- Admin operations
- Performance monitoring
- Transaction usage

## Integration with Existing Code

The database service integrates seamlessly with existing NileDB infrastructure:

```typescript
import { getDatabaseService } from "@/lib/niledb";

// Use in API routes
export async function GET(request: Request) {
  const db = getDatabaseService();
  const companies = await db.queryWithContext(
    tenantId,
    "SELECT * FROM companies"
  );
  return Response.json({ companies: companies.rows });
}

// Use in server actions
export async function createCompany(tenantId: string, data: CompanyData) {
  const db = getDatabaseService();
  return await db.queryWithContext(
    tenantId,
    "INSERT INTO companies (name, email) VALUES ($1, $2) RETURNING *",
    [data.name, data.email]
  );
}
```

## Migration from Direct NileDB Usage

Replace direct NileDB client usage:

```typescript
// Before
const nile = getNileClient();
const result = await nile.db.query("SELECT * FROM companies");

// After
const db = getDatabaseService();
const result = await db.query("SELECT * FROM companies");
```

The service provides the same interface with additional features like performance tracking and enhanced error handling.
