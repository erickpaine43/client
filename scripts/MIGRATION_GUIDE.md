# NileDB Migration Guide

This guide provides comprehensive instructions for migrating data from the old Drizzle-based backend system to NileDB's native multi-tenant architecture.

## Overview

The migration process transforms the existing custom user management, tenant relationships, and business logic to work with NileDB's built-in features while preserving all functionality and data integrity.

### Migration Architecture

```
Old System (Drizzle)          →          New System (NileDB)
├── Custom users table        →          users.users (NileDB managed)
├── Custom tenants            →          public.tenants (NileDB managed)
├── Custom companies          →          public.companies (tenant-scoped)
├── Custom user_companies     →          public.user_companies (enhanced)
└── Custom middleware         →          NileDB native features
```

## Prerequisites

### 1. Environment Setup

Ensure all required environment variables are configured:

```bash
# Required NileDB configuration
NILEDB_USER=your_user
NILEDB_PASSWORD=your_password
NILEDB_API_URL=your_api_url
NILEDB_POSTGRES_URL=your_postgres_url

# Optional configuration
NODE_ENV=development
NILEDB_DEBUG=true
```

### 2. Validate Configuration

Run the configuration validation script:

```bash
npx tsx scripts/validate-niledb-config.ts --verbose
```

### 3. Backup Existing Data

Create a backup of your current system before migration:

```bash
# Export old system data
npx tsx scripts/export-old-data.ts --output=./migration-backup --verbose

# Verify backup
ls -la migration-backup/
```

## Migration Process

### Step 1: Data Export

Export data from the old system:

```bash
# Export all data to JSON files
npx tsx scripts/export-old-data.ts --output=./migration-data --verbose

# Optional: Export as CSV for analysis
npx tsx scripts/export-old-data.ts --format=csv --output=./migration-data
```

**Output Files:**

- `complete-export.json` - All data in single file
- `users.json` - User records
- `tenants.json` - Tenant records
- `companies.json` - Company records
- `user-companies.json` - Relationship records
- `metadata.json` - Export metadata

### Step 2: Dry Run Migration

Test the migration process without making changes:

```bash
# Simulate complete migration
npx tsx scripts/migrate-to-niledb.ts --dry-run --verbose

# Review the analysis output
```

**Dry Run Output:**

- Users to migrate count and details
- Tenants to migrate count and details
- Companies to migrate count and details
- User-company relationships to migrate
- No actual changes made to database

### Step 3: Execute Migration

Run the actual migration:

```bash
# Full migration with verbose output
npx tsx scripts/migrate-to-niledb.ts --verbose

# Monitor progress and check for errors
```

**Migration Steps:**

1. **User Migration** - Create users in `users.users` table
2. **Profile Creation** - Create user profiles with roles and staff flags
3. **Tenant Migration** - Create tenants in `public.tenants` table
4. **Company Migration** - Create companies in tenant-scoped tables
5. **Relationship Migration** - Create user-company relationships
6. **Validation** - Verify all data and access controls

### Step 4: Validate Migration

Verify the migration was successful:

```bash
# Run comprehensive validation
npx tsx scripts/validate-migration.ts --verbose

# Check specific areas if needed
npx tsx scripts/validate-migration.ts
```

**Validation Checks:**

- ✅ User migration and profile creation
- ✅ Tenant migration and access control
- ✅ Company migration and tenant isolation
- ✅ User-company relationships and permissions
- ✅ Cross-schema query functionality
- ✅ Staff access and privilege escalation
- ✅ Data integrity and referential consistency

## Migration Scripts Reference

### Main Migration Script

```bash
npx tsx scripts/migrate-to-niledb.ts [options]

Options:
  --dry-run              Simulate migration without changes
  --rollback             Remove all migrated data
  --verbose, -v          Enable detailed output
  --skip-validation      Skip prerequisite validation
  --data-source=<path>   Use custom data source
```

### Validation Script

```bash
npx tsx scripts/validate-migration.ts [options]

Options:
  --verbose, -v    Show detailed validation information
  --fix            Attempt to fix issues found
```

### Rollback Script

```bash
npx tsx scripts/rollback-migration.ts [options]

Options:
  --complete              Complete rollback (all data)
  --selective=<entities>  Rollback specific entities
  --dry-run              Simulate rollback
  --preserve-staff       Keep staff users (default: true)
  --backup               Create backup before rollback
```

### Data Export Script

```bash
npx tsx scripts/export-old-data.ts [options]

Options:
  --output=<path>     Output directory
  --format=<format>   json or csv format
  --verbose, -v       Detailed output
```

## Data Mapping

### User Data Mapping

| Old System                    | NileDB                                | Notes                |
| ----------------------------- | ------------------------------------- | -------------------- |
| `users.id`                    | `users.users.id`                      | Preserved            |
| `users.email`                 | `users.users.email`                   | Direct mapping       |
| `users.name`                  | `users.users.name`                    | Direct mapping       |
| `users.role`                  | `user_profiles.role`                  | Moved to profile     |
| `users.is_penguinmails_staff` | `user_profiles.is_penguinmails_staff` | Staff identification |

### Tenant Data Mapping

| Old System                | NileDB               | Notes          |
| ------------------------- | -------------------- | -------------- |
| Custom tenant logic       | `public.tenants`     | NileDB managed |
| User-tenant relationships | `users.tenant_users` | NileDB managed |
| Tenant context            | Automatic            | NileDB native  |

### Company Data Mapping

| Old System         | NileDB                    | Notes                        |
| ------------------ | ------------------------- | ---------------------------- |
| `companies.*`      | `public.companies.*`      | Tenant-scoped                |
| `user_companies.*` | `public.user_companies.*` | Enhanced with tenant context |
| Role hierarchy     | Preserved                 | member → admin → owner       |

## Access Control Migration

### Authentication

**Before (Custom):**

```javascript
// Custom user sync middleware
app.use(userSyncMiddleware);
```

**After (NileDB):**

```typescript
// Native NileDB authentication
const user = await authService.getCurrentUser();
const userWithProfile = await authService.getUserWithProfile(userId);
```

### Tenant Access

**Before (Custom):**

```javascript
// Custom tenant context
req.tenantId = extractTenantId(req);
```

**After (NileDB):**

```typescript
// Native tenant context
await tenantService.withTenantContext(tenantId, async (nile) => {
  // Tenant-scoped operations
});
```

### Company Access

**Before (Custom):**

```javascript
// Custom access control
if (!hasCompanyAccess(userId, companyId)) {
  throw new Error("Access denied");
}
```

**After (NileDB):**

```typescript
// Integrated access control
const hasAccess = await companyService.validateCompanyAccess(
  userId,
  tenantId,
  companyId,
  "admin"
);
```

## Testing Strategy

### Unit Tests

Run the migration test suite:

```bash
# Run all migration tests
npm test scripts/__tests__/migration.test.ts

# Run specific test categories
npm test -- --testNamePattern="User Migration"
npm test -- --testNamePattern="Tenant Migration"
npm test -- --testNamePattern="Company Migration"
```

### Integration Testing

Test complete workflows:

```bash
# Test complete migration workflow
npx tsx scripts/migrate-to-niledb.ts --dry-run
npx tsx scripts/migrate-to-niledb.ts
npx tsx scripts/validate-migration.ts
npx tsx scripts/rollback-migration.ts --dry-run
```

### Performance Testing

Validate performance with larger datasets:

```bash
# Test with performance monitoring
npx tsx scripts/validate-niledb-config.ts --verbose
```

## Troubleshooting

### Common Issues

#### 1. Environment Configuration

**Problem:** Missing environment variables

```
❌ Missing required environment variables: NILEDB_USER, NILEDB_PASSWORD
```

**Solution:**

```bash
# Check .env file
cat .env

# Validate configuration
npx tsx scripts/validate-niledb-config.ts
```

#### 2. Database Connection

**Problem:** Connection failures

```
❌ Database connection failed: Connection timeout
```

**Solution:**

```bash
# Test connection
npx tsx scripts/validate-niledb-config.ts --verbose

# Check network and credentials
```

#### 3. Migration Conflicts

**Problem:** Data already exists

```
⏭️ User admin@penguinmails.com already exists
```

**Solution:**

```bash
# Check existing data
npx tsx scripts/validate-migration.ts

# Clean rollback if needed
npx tsx scripts/rollback-migration.ts --complete
```

#### 4. Access Control Issues

**Problem:** Permission denied errors

```
❌ Insufficient permissions to access tenant
```

**Solution:**

```bash
# Verify staff user setup
npx tsx scripts/validate-migration.ts --verbose

# Check user profiles and roles
```

### Recovery Procedures

#### Partial Migration Failure

```bash
# 1. Check what was migrated
npx tsx scripts/validate-migration.ts

# 2. Rollback problematic parts
npx tsx scripts/rollback-migration.ts --selective=companies,relationships

# 3. Fix issues and re-run
npx tsx scripts/migrate-to-niledb.ts
```

#### Complete Migration Failure

```bash
# 1. Complete rollback
npx tsx scripts/rollback-migration.ts --complete --backup

# 2. Restore from backup if needed
# (restore procedures depend on backup system)

# 3. Fix issues and retry
npx tsx scripts/migrate-to-niledb.ts --dry-run
```

## Post-Migration Tasks

### 1. Update Application Code

Replace old authentication and database code:

```typescript
// Old: Custom auth middleware
import { userSyncMiddleware } from "./middleware/userSync";

// New: NileDB services
import { getAuthService } from "./lib/niledb/auth";
import { getTenantService } from "./lib/niledb/tenant";
import { getCompanyService } from "./lib/niledb/company";
```

### 2. Update API Routes

Convert Express routes to Next.js API routes using NileDB middleware patterns.

### 3. Test Application

Thoroughly test all functionality:

- User authentication and profiles
- Tenant switching and isolation
- Company management and access control
- Cross-tenant admin operations
- Staff user privileges

### 4. Monitor Performance

Use NileDB's built-in monitoring and the health check system:

```bash
# Regular health checks
npx tsx scripts/validate-niledb-config.ts

# Performance monitoring
curl http://localhost:3000/api/health/niledb
```

## Best Practices

### 1. Migration Safety

- Always run dry-run first
- Create backups before migration
- Test in development environment
- Validate each step thoroughly
- Have rollback plan ready

### 2. Data Integrity

- Preserve all existing relationships
- Maintain role hierarchies
- Keep audit trails
- Validate cross-schema queries
- Test access control thoroughly

### 3. Performance Optimization

- Use tenant context appropriately
- Leverage NileDB's automatic isolation
- Optimize cross-schema queries
- Monitor query performance
- Use proper indexing strategies

### 4. Security Considerations

- Preserve staff user privileges
- Maintain role-based access control
- Use secure session management
- Validate all access patterns
- Test privilege escalation

## Support and Resources

### Documentation References

- [NileDB Documentation](https://docs.thenile.dev)
- [AuthService Documentation](../lib/niledb/auth.ts)
- [TenantService Documentation](../lib/niledb/tenant.ts)
- [CompanyService Documentation](../lib/niledb/company.ts)

### Migration Scripts

- `scripts/migrate-to-niledb.ts` - Main migration script
- `scripts/validate-migration.ts` - Validation and testing
- `scripts/rollback-migration.ts` - Rollback capabilities
- `scripts/export-old-data.ts` - Data export utilities

### Testing Files

- `scripts/__tests__/migration.test.ts` - Comprehensive test suite
- Test data and fixtures included
- Integration and unit test coverage

This migration guide provides a complete roadmap for successfully migrating from the old Drizzle-based system to NileDB while preserving all functionality and ensuring data integrity.
