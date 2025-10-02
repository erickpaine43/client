# Database Migration Scripts

This directory contains comprehensive database migration scripts for setting up the NileDB schema and seeding initial data for the application.

## Overview

The migration system provides:
- Complete schema creation for all entities
- Sample data seeding with proper relationships
- Validation utilities for data integrity
- Rollback capabilities for development
- Comprehensive testing suite

## Directory Structure

```
scripts/migration/
├── config.ts          # NileDB client configuration
├── types.ts           # TypeScript type definitions
├── runner.ts          # Main migration orchestrator
├── validation.ts      # Validation utilities
├── rollback.ts        # Rollback operations
├── schema/            # Schema creation scripts
│   ├── index.ts       # Schema exports
│   ├── tenant.ts      # Tenant table schema
│   ├── user.ts        # User table schema
│   └── ...            # Other entity schemas
└── seed/              # Data seeding scripts
    └── index.ts       # Seed data exports
```

## Usage

### Run Complete Migration
```bash
npx tsx scripts/migration/runner.ts run
```

### Run Rollback
```bash
npx tsx scripts/migration/runner.ts rollback
```

### Validate Migration
```bash
npx tsx scripts/migration/validation.ts
```

## Features

- **UUID Primary Keys**: All entities use UUID primary keys as required by NileDB
- **Foreign Key Relationships**: Proper referential integrity constraints
- **Tenant Isolation**: Multi-tenant architecture support
- **Idempotent Operations**: Safe to run multiple times
- **Comprehensive Testing**: Contract and integration tests
- **Error Handling**: Detailed logging and graceful error recovery

## Entities

The migration creates 13 core entities:
- Tenants (multi-tenancy)
- Users (authentication)
- Team Members (app-specific user data)
- Companies (business entities)
- Payments (financial transactions)
- Domains (domain management)
- Company Settings (configuration)
- Email Accounts (email integration)
- Leads (CRM data)
- Campaigns (marketing campaigns)
- Templates (email templates)
- Inbox Messages (email storage)
- Email Services (service configurations)

## Testing

Run the test suite:
```bash
npm run test:migration
```

Tests include:
- Contract tests for migration workflow
- Integration tests for schema creation
- Integration tests for data seeding
- Integration tests for validation
- Integration tests for rollback

## Dependencies

- Node.js with TypeScript
- NileDB client libraries
- Environment variables configured (see config.ts)

## Error Handling

All migration operations include:
- Try/catch blocks with detailed error messages
- Transaction rollbacks on failure
- Logging at each step
- Validation before destructive operations
