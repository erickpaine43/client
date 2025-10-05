# NileDB Setup and Configuration Guide

This document explains the current database setup process for the PenguinMails application using NileDB's native multi-tenant architecture.

## Overview

PenguinMails uses NileDB, which provides built-in multi-tenancy with automatic tenant isolation. Unlike traditional databases that require explicit schema migrations, NileDB handles table creation implicitly when data is first inserted.

## Key Concepts

### Multi-Tenant Architecture
- **Tenants**: Isolated workspaces for different organizations
- **Global Tables**: Shared across all tenants (e.g., `users.users`, `tenants`)
- **Tenant-Specific Tables**: Automatically isolated per tenant (e.g., `tenant_billing`, `companies`, `user_companies`)

### Schema Management
- No explicit migrations required
- Tables are created on-demand when first accessed
- Tenant context is managed automatically by NileDB SDK

## Current Database Structure

### Global Schema (Cross-Tenant)
- `tenants`: Tenant metadata
- `users.users`: User accounts
- `users.tenant_users`: User-tenant relationships

### Tenant-Specific Schema (Per-Tenant)
- `tenant_billing`: Billing and subscription info
- `companies`: Company entities within a tenant
- `user_companies`: User-company relationships

## Setup Process

1. **NileDB Connection**: Configure NileDB client in `lib/niledb/client.ts`
2. **Table Creation**: Tables are created implicitly on first data insertion
3. **Schema Migrations**: Use migration scripts for schema alterations (adding/removing columns)
4. **Database Seeding**: Populate development/testing environments with mock data
5. **Tenant Context**: Use `withTenantContext()` and `withoutTenantContext()` helpers
6. **Data Operations**: Use standard SQL queries with tenant isolation

## Migration & Seeding

### Schema Migrations
Since NileDB creates tables automatically, migrations focus on **schema changes**:

```bash
# Run pending migrations
npm run db:migrate

# Rollback migrations
npm run db:migrate:rollback
```

### Database Seeding
Populate development and testing environments with realistic data:

```bash
# Seed database (development/test only)
npm run db:seed

# Rollback seed data
npm run db:seed:rollback
```

**Environment Protection**: Seeding is automatically blocked in production environments.

## Best Practices

- Always use tenant context for tenant-specific operations
- Use `withoutTenantContext()` for cross-tenant queries
- Validate tenant access before operations
- Handle soft deletes with `deleted` timestamp columns

## Migration from Traditional DB

Previously explored migration-based approaches have been replaced with NileDB's native multi-tenancy:

- No migration scripts needed
- Schema changes handled through code
- Automatic tenant isolation
- Simplified deployment process

## Troubleshooting

- Ensure NileDB connection is properly configured
- Check tenant context is set for tenant-specific operations
- Verify user permissions for tenant access
- Monitor implicit table creation in NileDB dashboard

## Future Considerations

- Monitor NileDB performance and scaling
- Consider schema evolution strategies as the app grows
- Evaluate backup and recovery procedures
- Plan for multi-region deployments if needed
