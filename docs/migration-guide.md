# NileDB Integration Guide

## Overview
This guide documents the integration of NileDB's native multi-tenant architecture into the PenguinMails application.

**Note:** Traditional database migrations are not used. NileDB handles schema management automatically through its built-in multi-tenancy features. See [niledb-setup.md](niledb-setup.md) for current database setup procedures.

## Database Migration & Seeding System

### Migration System
NileDB creates tables on-demand, so migrations focus on **schema alterations** (adding/removing columns) rather than initial table creation.

#### Running Migrations
```bash
# Run all pending schema migrations
npm run db:migrate

# Rollback specific migration
npm run db:migrate:rollback 001_add_subscription_tier

# Rollback last migration
npm run db:migrate:rollback
```

#### Creating New Migrations
Add migration objects to `scripts/migration/migrations.ts`:

```typescript
{
  id: '003_your_migration_name',
  name: 'Description of what this migration does',
  description: 'Detailed explanation',
  up: async (nile: any) => {
    // Schema alteration logic
    await nile.db.query('ALTER TABLE your_table ADD COLUMN new_column VARCHAR(255)');
  },
  down: async (nile: any) => {
    // Rollback logic
    await nile.db.query('ALTER TABLE your_table DROP COLUMN new_column');
  },
}
```

### Seeding System
Database seeding provides realistic test data for development and testing environments.

#### Running Seeds
```bash
# Seed development/test database (prevents production execution)
npm run db:seed

# Rollback seed data
npm run db:seed:rollback
```

#### Environment Protection
- ✅ **Development**: Seeding allowed
- ✅ **Test**: Seeding allowed
- ❌ **Production**: Seeding blocked with error

### Integration Phases

#### Phase 1: Research and Planning
- Analyzed NileDB's multi-tenant capabilities
- Designed tenant isolation architecture
- Planned service integration approach

#### Phase 2: Testing First (TDD)
- Created comprehensive test suite before implementation
- Contract tests for all API endpoints
- Integration tests for service interactions

#### Phase 3: Core Implementation
- Integrated NileDB client into services
- Implemented tenant context management
- Created TypeScript types and interfaces
- Established connection patterns

#### Phase 4: Service Integration
- Connected all services to NileDB client
- Implemented tenant isolation middleware
- Added request/response logging
- Updated package.json scripts

#### Phase 5: Optimization
- Added performance monitoring
- Implemented error handling
- Updated documentation
- Verified tenant isolation

## Key Features

### Multi-Tenant Architecture
- Automatic tenant isolation through NileDB
- Global and tenant-specific schemas
- Row-level security built-in

### Authentication
- NileDB's native authentication support
- JWT token-based auth maintained
- Enhanced tenant access control

### API Endpoints
- All endpoints use NileDB for data operations
- Maintained existing API contracts
- Added comprehensive error handling

### Services
- AuthService, TenantService integrated
- Campaign and Email services updated
- Comprehensive logging implemented

## Testing
- Contract tests ensure API compliance
- Integration tests verify tenant isolation
- Performance tests monitor system health
- Unit tests validate business logic

## Performance Benchmarks
- API response time: <500ms p95
- Memory usage: <1GB
- Email throughput: 1000 emails/minute

## Success Criteria
- All tests pass
- Tenant isolation verified
- Performance meets requirements
- Data integrity maintained
- Production deployment successful
