# Fresh NileDB Database Analysis & Migration Plan

## Database Status: ✅ PROPERLY INITIALIZED

**Date:** 2025-01-27  
**Database:** penguin_mails_dev (New Clean Instance)  
**Status:** Fresh NileDB with built-in tables only

## Current NileDB Built-in Tables

### 🏢 Tenants Table (NileDB Built-in)

**Schema:**

```sql
CREATE TABLE tenants (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  name text NULL,
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  compute_id uuid NULL
);
```

**Key Features:**

- ✅ Uses `uuid_generate_v7()` for time-ordered UUIDs
- ✅ Built-in soft delete support (`deleted` column)
- ✅ Automatic timestamp management
- ✅ Tenant context isolation ready

### 👤 Users Table (NileDB Built-in - Not Yet Created)

**Status:** Will be automatically created when first user is registered through NileDB auth system

**Expected Schema:** (Based on NileDB documentation)

```sql
-- This will be created automatically by NileDB
CREATE TABLE users (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  email text NOT NULL UNIQUE,
  name text,
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  -- Additional NileDB auth fields will be added automatically
);
```

## Migration Strategy: Old Schema → NileDB

### 1. Schema Mapping Analysis

#### Old Users Table → NileDB Users Table

**Old Schema (Custom):**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_penguinmails_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  password_changed_at TIMESTAMP DEFAULT NOW()
);
```

**NileDB Built-in (Expected):**

```sql
-- NileDB will create this automatically
CREATE TABLE users (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  email text NOT NULL UNIQUE,
  name text,
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP
  -- NileDB adds its own auth-related fields
);
```

**Migration Plan:**

- ✅ **Core fields preserved**: id, email, name
- 🔄 **Custom fields need separate table**: role, is_penguinmails_staff
- 🔄 **Auth fields handled by NileDB**: NileDB manages authentication internally
- 📋 **Action**: Create `user_profiles` table for custom fields

#### Old Companies Table → NileDB Companies Table

**Old Schema:**

```sql
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id)
);
```

**New NileDB-Compatible Schema:**

```sql
CREATE TABLE companies (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  email text,
  settings jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (id)
);
```

**Migration Changes:**

- 🔄 **ID Generation**: Switch to `uuid_generate_v7()` for time-ordered IDs
- 🔄 **Timestamps**: Use `created`/`updated` instead of `created_at`/`updated_at`
- ➕ **Soft Delete**: Add `deleted` column for consistency with NileDB patterns
- 🔄 **Primary Key**: Single column PK instead of composite (tenant_id, id)
- ✅ **Tenant Reference**: Maintain foreign key to tenants.id

#### Old User-Companies Table → NileDB User-Companies Table

**Old Schema:**

```sql
CREATE TABLE user_companies (
  id UUID DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE(tenant_id, user_id, company_id)
);
```

**New NileDB-Compatible Schema:**

```sql
CREATE TABLE user_companies (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid NOT NULL REFERENCES users(id),
  company_id uuid NOT NULL REFERENCES companies(id),
  role text DEFAULT 'member',
  permissions jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (id),
  UNIQUE(tenant_id, user_id, company_id)
);
```

**Migration Changes:**

- 🔄 **ID Generation**: Switch to `uuid_generate_v7()`
- 🔄 **Timestamps**: Use NileDB naming convention
- ➕ **Soft Delete**: Add `deleted` column
- ✅ **Relationships**: Maintain all foreign key relationships
- ✅ **Business Logic**: Preserve role and permissions structure

### 2. Additional Tables Needed

#### User Profiles Table (New)

```sql
CREATE TABLE user_profiles (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  user_id uuid NOT NULL REFERENCES users(id),
  role text DEFAULT 'user',
  is_penguinmails_staff boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (id),
  UNIQUE(user_id)
);
```

**Purpose:** Store custom user fields that aren't part of NileDB's built-in users table.

### 3. Data Migration Plan

#### Phase 1: Export Existing Data

```typescript
// Export users (9 records)
const users = await oldDb.query("SELECT * FROM users");

// Export tenants (16 records)
const tenants = await oldDb.query("SELECT * FROM tenants");

// Export companies (7 records)
const companies = await oldDb.query("SELECT * FROM companies");

// Export user-company relationships (17 records)
const userCompanies = await oldDb.query("SELECT * FROM user_companies");
```

#### Phase 2: Create NileDB Schema

```sql
-- 1. Users table will be created automatically by NileDB auth
-- 2. Tenants table already exists
-- 3. Create custom tables:

CREATE TABLE user_profiles (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  user_id uuid NOT NULL REFERENCES users(id),
  role text DEFAULT 'user',
  is_penguinmails_staff boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (id),
  UNIQUE(user_id)
);

CREATE TABLE companies (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  email text,
  settings jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (id)
);

CREATE TABLE user_companies (
  id uuid NOT NULL DEFAULT public.uuid_generate_v7(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid NOT NULL REFERENCES users(id),
  company_id uuid NOT NULL REFERENCES companies(id),
  role text DEFAULT 'member',
  permissions jsonb DEFAULT '{}',
  created timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  updated timestamp without time zone NOT NULL DEFAULT LOCALTIMESTAMP,
  deleted timestamp without time zone NULL,
  PRIMARY KEY (id),
  UNIQUE(tenant_id, user_id, company_id)
);
```

#### Phase 3: Import Data with Mapping

```typescript
// 1. Import tenants (map old tenant data to NileDB tenants)
for (const tenant of oldTenants) {
  await nile.db.query(
    `
    INSERT INTO tenants (id, name, created, updated) 
    VALUES ($1, $2, $3, $4)
  `,
    [tenant.id, tenant.name, tenant.created, tenant.updated]
  );
}

// 2. Create users through NileDB auth system
for (const user of oldUsers) {
  // Use NileDB auth API to create user
  const newUser = await nile.auth.signUp({
    email: user.email,
    password: "temporary-password", // User will need to reset
  });

  // Create user profile with custom fields
  await nile.db.query(
    `
    INSERT INTO user_profiles (user_id, role, is_penguinmails_staff) 
    VALUES ($1, $2, $3)
  `,
    [newUser.id, user.role, user.is_penguinmails_staff]
  );
}

// 3. Import companies
for (const company of oldCompanies) {
  await nile.db.query(
    `
    INSERT INTO companies (id, tenant_id, name, email, settings, created, updated) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,
    [
      company.id,
      company.tenant_id,
      company.name,
      company.email,
      company.settings,
      company.created_at,
      company.updated_at,
    ]
  );
}

// 4. Import user-company relationships
for (const relationship of oldUserCompanies) {
  await nile.db.query(
    `
    INSERT INTO user_companies (id, tenant_id, user_id, company_id, role, permissions, created, updated) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,
    [
      relationship.id,
      relationship.tenant_id,
      relationship.user_id,
      relationship.company_id,
      relationship.role,
      relationship.permissions,
      relationship.created_at,
      relationship.updated_at,
    ]
  );
}
```

### 4. Key Benefits of New Architecture

#### NileDB Built-in Features

- ✅ **Automatic Authentication**: Built-in user management and session handling
- ✅ **Tenant Isolation**: Automatic tenant context for all queries
- ✅ **Time-Ordered UUIDs**: Better performance with uuid_generate_v7()
- ✅ **Soft Deletes**: Built-in support for soft delete patterns
- ✅ **Audit Trails**: Automatic timestamp management

#### Preserved Business Logic

- ✅ **All Relationships**: User-company-tenant relationships maintained
- ✅ **Custom Fields**: Role, permissions, settings preserved
- ✅ **Data Integrity**: All foreign key constraints maintained
- ✅ **Business Rules**: All existing validation and business logic preserved

### 5. Implementation Checklist

#### Immediate Tasks

- [ ] Create data export scripts for old database
- [ ] Create NileDB schema creation scripts
- [ ] Create data import scripts with proper mapping
- [ ] Test migration with sample data
- [ ] Validate data integrity after migration

#### Service Layer Updates

- [ ] Update authentication service to use NileDB auth
- [ ] Update database service to use tenant context
- [ ] Update user management to work with user_profiles table
- [ ] Update company management with new schema
- [ ] Update user-company relationship management

#### API Updates

- [ ] Convert Express.js routes to Next.js API routes
- [ ] Implement proper tenant context in all endpoints
- [ ] Update authentication middleware
- [ ] Update authorization logic for new schema

## Conclusion

The fresh NileDB database is properly initialized and ready for migration. The new architecture will provide:

1. **Better Performance**: Time-ordered UUIDs and optimized tenant isolation
2. **Enhanced Security**: Built-in authentication and session management
3. **Simplified Development**: Automatic tenant context and user management
4. **Preserved Functionality**: All existing business logic and relationships maintained

The migration strategy preserves all existing data while upgrading to NileDB's built-in multi-tenancy system, providing a solid foundation for the backend migration.
