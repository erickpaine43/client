# Database Migration Scripts - Schema Organization & Consolidation

## Overview

This document details the comprehensive effort to organize, consolidate, and standardize the database migration schema files for the PenguinMails client application. The goal was to create a clean, consistent, and maintainable migration system that properly leverages NileDB's multi-tenant architecture.

## Background

The migration schema directory (`scripts/migration/schema/`) contained multiple issues:
- Duplicate files with similar naming patterns (singular vs plural)
- Inconsistent file structures (some split SQL/constants from execution logic)
- Legacy schemas no longer aligned with the current architecture
- Mixed patterns for schema definition and execution

## Key Changes Made

### 1. Schema Consolidation

#### Files Consolidated & Removed:
- **`plans.sql`** → **`plans.ts`** ✅
- **`tenant_settings.sql`** → **`tenant-settings.ts`** ✅
- **`user_preferences.sql`** → **`user-preferences.ts`** ✅
- **`campaign.ts`** + **`campaigns.ts`** → **`campaign.ts`** ✅
- **`company-settings.ts`** + **`company_settings.ts`** → **`company-settings.ts`** ✅
- **`company.ts`** + **`companies.ts`** → **`company.ts`** ✅
- **`domain.ts`** + **`domains.ts`** → **`domain.ts`** ✅
- **`email-account.ts`** + **`email-accounts.ts`** → **`email-account.ts`** ✅

#### Legacy Schema Removal:
- **`team-member.ts`** - Replaced with NileDB's native `users.tenant_users` functionality ✅

### 2. Architecture Alignment

#### NileDB Native Features Adoption:
- **Tenant Management**: Using `users.tenant_users` and `public.tenants` instead of custom `team_members` table
- **User Roles**: Leveraging NileDB's built-in role system within tenant contexts
- **Multi-tenancy**: Proper use of NileDB's automatic tenant isolation

#### Data Model Simplification:
- Teams are now **logical groupings** of users within tenants/companies
- Eliminated redundant table structures
- Streamlined relationship management

### 3. File Structure Standardization

#### Consistent Pattern:
All schema files now follow the **exact same structure**:

```typescript
/**
 * [Table] Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the [table] table.
 * [Brief description of table purpose].
 */

// Exported SQL Constants
export const CREATE_[TABLE]_TABLE = `...`;
export const CREATE_[TABLE]_INDEXES = `...`;
export const CREATE_[TABLE]_TRIGGERS = `...`;
export const DROP_[TABLE]_TRIGGERS = `...`;
export const DROP_[TABLE]_INDEXES = `...`;
export const DROP_[TABLE]_TABLE = `...`;

// Execution Functions
export async function create[Table]Schema(): Promise<void> { ... }
export async function drop[Table]Schema(): Promise<void> { ... }
```

#### Benefits:
- **Single Source of Truth**: SQL definitions and execution logic in one file
- **Consistency**: Uniform structure across all schema files
- **Maintainability**: Easier to modify and extend schemas
- **Testing**: Consistent patterns for test validation

### 4. Migration Ordering & Dependencies

#### Proper Dependency Order:
```typescript
// createAllSchemas() execution order:
await createTenantSchema();        // 1. Foundation
await createUserSchema();          // 2. Core entities
await createPlansSchema();         // 3. Referenced by payments
await createCompanySchema();       // 4. Depends on tenants
await createPaymentSchema();       // 5. Depends on plans/companies
await createDomainSchema();        // 6. Depends on companies
// ... additional dependent schemas
```

#### Reverse Drop Order:
```typescript
// dropAllSchemas() execution order:
await dropTemplatesSchema();       // Reverse dependency order
await dropCampaignSequenceStepsSchema();
// ... cascade down to foundation tables
await dropTenantSchema();          // Drop foundation last
```

## Current Schema Architecture

### Core Tables (Foundation)
- **`tenants`** - Multi-tenant isolation (NileDB native)
- **`users`** - User accounts scoped to tenants
- **`companies`** - Organizations within tenants

### Feature Tables
- **`plans`** - Subscription tiers and limits
- **`payments`** - Billing transactions
- **`domains`** - Email domain verification
- **`email_accounts`** - SMTP/IMAP configurations
- **`campaigns`** - Email campaign definitions
- **`campaign_sequence_steps`** - Campaign workflow steps
- **`leads`** - Contact management
- **`templates`** - Email template storage
- **`inbox_messages`** - Email conversation tracking

### Settings Tables
- **`company_settings`** - Company-level feature flags
- **`tenant_settings`** - Tenant-wide configurations
- **`user_preferences`** - Individual user preferences

## Schema Relationships

```
tenants (NileDB native)
├── users.tenant_users (NileDB native tenant membership)
├── companies (tenant-scoped organizations)
│   ├── company_settings (company feature flags)
│   ├── domains (verified email domains)
│   │   └── email_accounts (SMTP/IMAP configs)
│   ├── campaigns (email campaigns)
│   │   └── campaign_sequence_steps (workflow steps)
│   ├── leads (contacts)
│   ├── templates (email templates)
│   └── payments (billing transactions)
├── plans (subscription tiers)
├── tenant_settings (tenant-wide configs)
└── user_preferences (individual preferences)
```

## Migration Script Categories

### Schema Creation (`scripts/migration/schema/`)
- Individual table schema definitions
- Proper dependency ordering
- Consistent error handling

### Data Migration (`scripts/migration/`)
- **`preferences_migration.sql`** - One-time JSONB to structured tables migration
- Handles legacy data transformation
- Includes rollback and validation scripts

### Utilities (`scripts/migration/`)
- **`validation.ts`** - Schema integrity checks
- **`rollback.ts`** - Partial/full rollback capabilities
- **`seed.ts`** - Development data seeding
- **`runner.ts`** - Migration execution orchestration

## Benefits Achieved

### 1. **Consistency**
- Uniform file structure and naming
- Consistent error handling patterns
- Standardized SQL constant exports

### 2. **Maintainability**
- Single files per schema (no more split logic)
- Clear documentation and purpose
- Easy to extend and modify

### 3. **Architecture Alignment**
- Proper use of NileDB's multi-tenant features
- Eliminated redundant table structures
- Streamlined data relationships

### 4. **Developer Experience**
- Clear migration ordering
- Comprehensive validation
- Proper rollback capabilities

## Migration Execution

### Full Schema Creation:
```bash
npm run migrate:create
# or
npx ts-node scripts/migration/runner.ts create
```

### Full Schema Drop:
```bash
npm run migrate:drop
# or
npx ts-node scripts/migration/runner.ts drop
```

### Validation:
```bash
npm run migrate:validate
# or
npx ts-node scripts/migration/validation.ts
```

## Future Considerations

### Schema Evolution:
- New tables should follow the established pattern
- Maintain proper dependency ordering
- Update validation scripts accordingly

### Performance Monitoring:
- Monitor index usage and effectiveness
- Optimize queries based on usage patterns
- Consider additional indexing strategies

### Testing:
- Schema tests should validate the consolidated structure
- Integration tests should cover full migration flows
- Performance tests for large-scale migrations

## Summary

This consolidation effort transformed a fragmented and inconsistent migration system into a clean, maintainable, and architecture-aligned database schema management system. The standardized approach ensures:

- **Consistency** across all schema definitions
- **Maintainability** through uniform patterns
- **Scalability** with proper dependency management
- **Reliability** through comprehensive validation

The migration scripts are now production-ready and aligned with NileDB's multi-tenant architecture, providing a solid foundation for the PenguinMails application's database operations.
