# NileDB Database Setup Guide

This guide explains how to set up and work with the NileDB database in the current system. The system uses NileDB's native multi-tenant architecture with automatic user management and tenant isolation.

## Overview

The system is now fully integrated with NileDB, utilizing:

- **users.users** - User accounts managed by NileDB
- **public.tenants** - Tenant entities managed by NileDB
- **public.companies** - Company entities scoped to tenants
- **public.user_companies** - User-company relationships
- **user_profiles** - Extended user data (roles, preferences)

## Prerequisites

### Environment Setup

Configure the required NileDB environment variables:

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

### Database Initialization

The database schema is automatically created through the migration scripts. To set up a fresh database:

```bash
# Run the migration system
npm run migration:run

# Validate the setup
npm run migration:validate
```

## Database Architecture

### User Management

Users are managed by NileDB's built-in authentication:

- **users.users**: Core user data (email, name, etc.)
- **user_profiles**: Extended profile data (roles, staff status)

### Tenant Isolation

Tenants provide automatic data isolation:

- **public.tenants**: Tenant definitions
- **Tenant-scoped tables**: Companies, relationships automatically isolated

### Company Management

Companies are scoped to tenants:

- **public.companies**: Company entities per tenant
- **public.user_companies**: User-company relationships with roles

## Working with the Database

### Using the Services

The system provides TypeScript services for database operations:

```typescript
import { getAuthService } from '@/lib/niledb/auth';
import { getTenantService } from '@/lib/niledb/tenant';
import { getCompanyService } from '@/lib/niledb/company';

// Authenticate users
const authService = getAuthService();
const user = await authService.getCurrentUser();

// Work with tenants
const tenantService = getTenantService();
await tenantService.withTenantContext(tenantId, async (nile) => {
  // Tenant-scoped operations
});

// Manage companies
const companyService = getCompanyService();
const companies = await companyService.getUserCompanies(userId);
```

### Migration System

The migration scripts handle schema and data setup:

```bash
# Run all migrations
npm run migration:run

# Validate current state
npm run migration:validate

# Rollback if needed
npm run migration:rollback
```

### Testing

Run the database test suite:

```bash
# Run migration tests
npm test scripts/__tests__/migration.test.ts

# Run integration tests
npm run test:integration
```

## Data Structure

### User Data

- **users.users**: Core user information managed by NileDB
- **user_profiles**: Extended user data including roles and staff status

### Tenant Data

- **public.tenants**: Tenant definitions and metadata
- **users.tenant_users**: Automatic user-tenant relationships

### Company Data

- **public.companies**: Company entities scoped to specific tenants
- **public.user_companies**: User-company relationships with access roles

## Access Control

### Authentication

Users authenticate through NileDB's built-in system:

```typescript
// Get current user
const user = await authService.getCurrentUser();

// Get user with profile data
const userWithProfile = await authService.getUserWithProfile(userId);
```

### Tenant Context

All operations respect tenant isolation:

```typescript
// Execute operations within tenant context
await tenantService.withTenantContext(tenantId, async (nile) => {
  // All queries in this block are tenant-scoped
});
```

### Company Access

Access control is handled through role-based permissions:

```typescript
// Validate company access
const hasAccess = await companyService.validateCompanyAccess(
  userId,
  tenantId,
  companyId,
  "admin"
);
```

## Testing

### Unit Tests

Run the database test suite:

```bash
# Run all migration tests
npm test scripts/__tests__/migration.test.ts

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

### Integration Testing

Test database operations:

```bash
# Test migration system
npm run migration:run
npm run migration:validate

# Test application with database
npm run test:e2e
```

### Performance Testing

Monitor database performance:

```bash
# Health checks
curl http://localhost:3000/api/health/niledb

# Performance benchmarks
npm run benchmark:performance
```

## Troubleshooting

### Common Issues

#### Environment Configuration

**Problem:** Missing environment variables

**Solution:**

```bash
# Check .env file
cat .env

# Test connection
npm run migration:validate
```

#### Database Connection

**Problem:** Connection failures

**Solution:**

```bash
# Validate configuration
npm run migration:validate

# Check network and credentials
```

#### Access Control Issues

**Problem:** Permission errors

**Solution:**

```bash
# Verify user roles and permissions
npm run test:integration

# Check tenant context
```

### Recovery Procedures

#### Database Reset

If you need to reset the database:

```bash
# Rollback all changes
npm run migration:rollback

# Re-run migrations
npm run migration:run
```

#### Data Issues

For data-related problems:

```bash
# Validate data integrity
npm run migration:validate

# Check application logs for specific errors
```

## Development Workflow

### Setting Up Database

For new development environments:

```typescript
// The migration system handles setup automatically
import { getAuthService } from './lib/niledb/auth';

// Services are ready to use after migration
const authService = getAuthService();
```

### Adding New Features

When adding database features:

1. Update schema in migration scripts
2. Test with migration system
3. Update TypeScript services
4. Add integration tests

### Monitoring

Regular health checks:

```bash
# Database health
npm run migration:validate

# Application health
curl http://localhost:3000/api/health
```

## Best Practices

### Database Operations

- Always use tenant context for multi-tenant operations
- Leverage NileDB's automatic isolation features
- Validate data integrity in tests
- Monitor query performance regularly

### Development Workflow

- Run migrations before starting development
- Test database operations thoroughly
- Use the provided TypeScript services
- Follow tenant isolation patterns

### Security

- Maintain role-based access control
- Validate user permissions in services
- Use secure authentication flows
- Test privilege escalation scenarios

## Support and Resources

### Documentation References

- [NileDB Documentation](https://docs.thenile.dev)
- [AuthService Documentation](./lib/niledb/auth.ts)
- [TenantService Documentation](./lib/niledb/tenant.ts)
- [CompanyService Documentation](./lib/niledb/company.ts)

### Database Scripts

- `scripts/migration/` - Database setup and migration system
- `scripts/__tests__/migration.test.ts` - Test suite

### Testing

- Integration tests for database operations
- Performance benchmarks
- Health check endpoints

This guide explains how to work with the current NileDB setup for development and production use.
