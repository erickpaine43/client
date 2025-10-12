# Database Setup & Migration Guide

This directory contains the database setup scripts for the marketing agency SaaS application using NileDB.

## 📁 Directory Structure

```
scripts/
├── migrations/           # Database schema migrations
│   └── 001_initial_schema.sql
├── seed/                # Initial seed data
│   └── 001_initial_data.sql
└── README.md            # This file
```

## 🚀 Setup Process

### Prerequisites
- NileDB instance configured and accessible
- Database connection credentials set in environment variables
- NileDB SDK installed and configured

### Step 1: Run Schema Migration

**Using NileDB SDK:**
```typescript
import { runMigration } from './scripts/migrations/001_initial_schema.sql';

// Execute the schema migration
await runMigration();
```

**Manual execution:**
```bash
# If you have direct database access
psql -h your-niledb-host -U your-username -d your-database -f scripts/migrations/001_initial_schema.sql
```

### Step 2: Run Seed Data

**Using NileDB SDK:**
```typescript
import { runSeed } from './scripts/seed/001_initial_data.sql';

// Execute the seed data (run after migration)
await runSeed();
```

**Manual execution:**
```bash
# Run after schema migration is complete
psql -h your-niledb-host -U your-username -d your-database -f scripts/seed/001_initial_data.sql
```

## 🧪 Testing Migrations

Run existing test suites to ensure migrations work correctly:

```bash
# Run database migration tests
npm run test:migration

# Run comprehensive database tests
npm run test:comprehensive
```

The test suites will:
- ✅ Validate migration file structure and execution
- ✅ Check Prisma schema compatibility
- ✅ Test database connectivity and operations
- ✅ Verify foreign key relationships and constraints
- ✅ Run comprehensive integration tests

## 📊 What Gets Created

### Schema Migration (`001_initial_schema.sql`)

**Core Business Tables:**
- `tenants` - Marketing agencies
- `users` - Agency staff members
- `companies` - Client records
- `user_profiles` - Extended user data & admin status

**Billing & Subscription Tables:**
- `plans` - Subscription plan definitions
- `subscriptions` - Agency subscriptions
- `subscription_addons` - Additional features
- `payments` - Billing transaction history

**Configuration Tables:**
- `tenant_config` - Agency UI settings & billing info
- `tenant_policies` - Security & company policies

**Permission System:**
- `roles` - Role definitions
- `permissions` - Permission definitions
- `role_permissions` - Role-permission assignments

**System Tables:**
- `system_config` - Global system settings

### Seed Data (`001_initial_data.sql`)

**Default Permissions:**
- Campaign management permissions
- User management permissions
- Billing & settings permissions
- Reporting permissions

**Default Plans:**
- **Starter Plan**: $29/month - Basic features for small teams
- **Professional Plan**: $79/month - Advanced features for growing agencies
- **Enterprise Plan**: $199/month - Full-featured for large agencies

**Default Roles:**
- **Owner**: Full access to all features
- **Admin**: Manage users, campaigns, most settings
- **Manager**: Campaign management & reporting
- **User**: Basic campaign execution access

**Default Role Permissions:**
- Pre-configured permission assignments for each role
- Hierarchical access control (Owner > Admin > Manager > User)

## 🔧 NileDB Integration Notes

### Using NileDB SDK

The migration and seed files are designed to work with NileDB's SDK. You may need to adapt them based on your NileDB setup:

```typescript
import { NileDB } from '@theniledev/sdk';

const nile = new NileDB({
  apiKey: process.env.NILE_API_KEY,
  databaseId: process.env.NILE_DATABASE_ID,
});

// Execute migrations
await nile.executeFile('./scripts/migrations/001_initial_schema.sql');
await nile.executeFile('./scripts/seed/001_initial_data.sql');
```

### Drizzle Integration

If using Drizzle ORM with NileDB, you can adapt these SQL files:

```typescript
import { drizzle } from 'drizzle-orm/nile';
import { migrate } from 'drizzle-orm/nile/migrator';
import * as schema from './schema';

// Run migrations
await migrate(db, { migrationsFolder: './scripts/migrations' });

// Run seeds
await db.execute(sql`-- content of 001_initial_data.sql`);
```

## 📋 Verification Steps

After running migrations and seeds:

1. **Check table creation:**
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **Verify permissions:**
   ```sql
   SELECT COUNT(*) as permission_count FROM permissions;
   -- Should return 13
   ```

3. **Check plans:**
   ```sql
   SELECT name, display_name, price_monthly FROM plans ORDER BY price_monthly;
   ```

4. **Verify roles and permissions:**
   ```sql
   SELECT r.name as role_name, COUNT(rp.permission_id) as permission_count
   FROM roles r
   LEFT JOIN role_permissions rp ON r.id = rp.role_id
   GROUP BY r.id, r.name
   ORDER BY r.name;
   ```

## 🚨 Important Notes

- **Run migrations before seeds** - Seed data depends on schema structure
- **Backup existing data** - Migrations may modify existing tables
- **Test in staging first** - Always test migrations in a staging environment
- **Version control migrations** - Keep migration files under version control
- **Idempotent operations** - Scripts use `IF NOT EXISTS` and `ON CONFLICT` for safety

## 🆘 Troubleshooting

### Migration Fails
- Check database connection credentials
- Ensure proper permissions for DDL operations
- Verify NileDB version compatibility

### Seed Data Issues
- Ensure foreign key constraints are satisfied
- Check for duplicate key conflicts
- Verify data types match schema definitions

### Permission Errors
- Confirm database user has DDL permissions
- Check NileDB SDK configuration
- Verify API keys and authentication

## 📞 Support

For NileDB-specific migration issues:
- Check NileDB documentation: https://docs.thenile.dev/
- Review SDK migration examples
- Contact NileDB support if needed
