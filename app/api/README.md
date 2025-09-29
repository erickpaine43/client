# Next.js API Routes Documentation

This document describes the migrated API routes from the old Express.js backend to Next.js API routes using NileDB integration.

## Overview

All API routes have been migrated to use:

- **NileDB Authentication**: Native session management and user authentication
- **Tenant Context**: Automatic tenant isolation and access control
- **Role-Based Access Control**: Hierarchical permissions (member → admin → owner)
- **Staff Access**: Cross-tenant administration capabilities
- **Input Validation**: Comprehensive Zod schema validation
- **Error Handling**: Consistent error responses and logging

## Authentication

All protected routes use NileDB's native authentication system with automatic session validation.

### Middleware Types

1. **`withAuthentication`** - Basic authentication required
2. **`withTenantAccess(role)`** - Tenant-scoped access with role requirements
3. **`withStaffAccess(level)`** - Staff-only access with privilege levels
4. **`withResourcePermission(resource, action)`** - Fine-grained resource permissions

## API Endpoints

### Tenant Management

#### Create Tenant

- **POST** `/api/tenants`
- **Auth**: Authenticated users
- **Body**: `{ name: string, subscriptionPlan?: string, billingStatus?: string }`

#### Get Tenant

- **GET** `/api/tenants/[tenantId]`
- **Auth**: Tenant member access
- **Response**: Tenant information

#### Update Tenant

- **PUT** `/api/tenants/[tenantId]`
- **Auth**: Tenant admin access + company write permission
- **Body**: `{ name?: string, subscriptionPlan?: string, billingStatus?: string }`

#### Get User's Tenants

- **GET** `/api/user/tenants`
- **Auth**: Authenticated users
- **Response**: List of user's tenants

#### Get Tenant Statistics

- **GET** `/api/tenants/[tenantId]/statistics`
- **Auth**: Tenant admin access
- **Response**: Tenant analytics and statistics

### Tenant User Management

#### Get Tenant Users

- **GET** `/api/tenants/[tenantId]/users`
- **Auth**: Tenant admin access + user read permission
- **Response**: List of users in tenant

#### Add User to Tenant

- **POST** `/api/tenants/[tenantId]/users`
- **Auth**: Tenant admin access + user write permission
- **Body**: `{ userId: string, roles?: string[] }`

#### Remove User from Tenant

- **DELETE** `/api/tenants/[tenantId]/users/[userId]`
- **Auth**: Tenant admin access + user delete permission

#### Update User Tenant Roles

- **PUT** `/api/tenants/[tenantId]/users/[userId]/roles`
- **Auth**: Tenant admin access + user write permission
- **Body**: `{ roles: string[] }`

### Company Management

#### List Companies

- **GET** `/api/tenants/[tenantId]/companies`
- **Auth**: Tenant member access
- **Response**: List of companies in tenant

#### Create Company

- **POST** `/api/tenants/[tenantId]/companies`
- **Auth**: Tenant admin access + company write permission
- **Body**: `{ name: string, email?: string, settings?: object }`

#### Get Company

- **GET** `/api/tenants/[tenantId]/companies/[companyId]`
- **Auth**: Tenant member access
- **Response**: Company information

#### Update Company

- **PUT** `/api/tenants/[tenantId]/companies/[companyId]`
- **Auth**: Tenant admin access + company write permission
- **Body**: `{ name?: string, email?: string, settings?: object }`

#### Delete Company

- **DELETE** `/api/tenants/[tenantId]/companies/[companyId]`
- **Auth**: Tenant owner access + company delete permission

#### Get Company Statistics

- **GET** `/api/tenants/[tenantId]/companies/[companyId]/statistics`
- **Auth**: Tenant member access
- **Response**: Company analytics and statistics

### Company User Management

#### Get Company Users

- **GET** `/api/tenants/[tenantId]/companies/[companyId]/users`
- **Auth**: Tenant member access
- **Response**: List of users in company

#### Add User to Company

- **POST** `/api/tenants/[tenantId]/companies/[companyId]/users`
- **Auth**: Tenant admin access + user write permission
- **Body**: `{ userId: string, role?: string, permissions?: object }`

#### Update User Company Role

- **PUT** `/api/tenants/[tenantId]/companies/[companyId]/users/[userId]`
- **Auth**: Tenant admin access + user write permission
- **Body**: `{ role: string, permissions?: object }`

#### Remove User from Company

- **DELETE** `/api/tenants/[tenantId]/companies/[companyId]/users/[userId]`
- **Auth**: Tenant admin access + user delete permission

### Cross-Tenant User Operations

#### Get User Companies

- **GET** `/api/users/[userId]/companies`
- **Auth**: Authenticated (staff or self only)
- **Response**: List of user's companies across all tenants

### User Profile Management

#### Get Profile

- **GET** `/api/profile`
- **Auth**: Authenticated users
- **Response**: Current user profile information

#### Update Profile

- **PUT** `/api/profile`
- **Auth**: Authenticated users
- **Body**: `{ name?: string, preferences?: object }`

### Admin Routes (Staff Only)

#### List All Tenants

- **GET** `/api/admin/tenants`
- **Auth**: Staff admin access
- **Query**: `limit`, `offset` for pagination
- **Response**: List of all tenants with statistics

#### Get Tenant Details

- **GET** `/api/admin/tenants/[tenantId]`
- **Auth**: Staff admin access
- **Response**: Detailed tenant information

#### List All Companies

- **GET** `/api/admin/companies`
- **Auth**: Staff admin access
- **Query**: `limit`, `offset`, `search`, `tenantId` for filtering
- **Response**: List of all companies across tenants

#### List All Users

- **GET** `/api/admin/users`
- **Auth**: Staff admin access
- **Query**: `limit`, `offset`, `search`, `role`, `staff_only` for filtering
- **Response**: List of all users with statistics

#### Get User Details

- **GET** `/api/admin/users/[userId]`
- **Auth**: Staff admin access
- **Response**: Detailed user information with tenants and companies

#### Update User

- **PUT** `/api/admin/users/[userId]`
- **Auth**: Staff admin access
- **Body**: `{ name?: string, role?: string, is_penguinmails_staff?: boolean }`

#### System Health

- **GET** `/api/admin/health`
- **Auth**: Staff admin access
- **Response**: System health status and statistics

### Test Endpoints

#### Test Authentication

- **GET** `/api/test/auth`
- **Auth**: Authenticated users
- **Response**: Authentication status and user information

#### Test Tenant Access

- **GET** `/api/test/tenant/[tenantId]`
- **Auth**: Tenant member access
- **Response**: Tenant access status and context information

## Role Hierarchy

### Company Roles

1. **member** - Basic access to company resources
2. **admin** - Can manage users and company settings
3. **owner** - Full control including deletion

### User Roles

1. **user** - Regular platform user
2. **admin** - Platform administrator
3. **super_admin** - Full platform access

### Staff Access

- Staff users can access any tenant using `withoutTenantContext()`
- Staff privileges are determined by `is_penguinmails_staff` field
- Staff access bypasses normal tenant isolation

## Permission Matrix

| Resource | Action | Required Roles       |
| -------- | ------ | -------------------- |
| company  | read   | member, admin, owner |
| company  | write  | admin, owner         |
| company  | delete | owner                |
| user     | read   | admin, owner         |
| user     | write  | admin, owner         |
| user     | delete | owner                |
| user     | invite | admin, owner         |
| billing  | read   | admin, owner         |
| billing  | write  | owner                |
| audit    | read   | admin, owner         |

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `AUTH_REQUIRED` - Authentication required
- `TENANT_ACCESS_DENIED` - No access to tenant
- `INSUFFICIENT_PERMISSIONS` - Insufficient role/permissions
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (duplicate, etc.)

## Input Validation

All endpoints use Zod schemas for input validation:

- **UUID validation** for IDs
- **Email validation** for email fields
- **String length limits** for text fields
- **Enum validation** for role fields
- **Object validation** for JSON fields

## Security Features

1. **Tenant Isolation** - Automatic tenant context enforcement
2. **Role-Based Access Control** - Hierarchical permission system
3. **Input Sanitization** - Comprehensive validation and sanitization
4. **SQL Injection Protection** - Parameterized queries
5. **Session Management** - Secure cookie-based sessions
6. **Staff Access Logging** - Audit trail for administrative actions

## Migration Notes

### Changes from Express.js Backend

1. **Route Structure** - Converted to Next.js API route format
2. **Middleware** - Replaced Express middleware with Next.js middleware functions
3. **Authentication** - Integrated with NileDB native authentication
4. **Tenant Context** - Automatic tenant isolation using NileDB features
5. **Error Handling** - Consistent error response format
6. **Validation** - Enhanced input validation with Zod schemas
7. **Access Control** - Improved role-based permissions system

### Preserved Functionality

- All existing API endpoints and functionality
- User-company relationship management
- Cross-tenant staff access capabilities
- Comprehensive audit logging
- Role hierarchy and permissions
- Input validation and error handling

### Enhanced Features

- **Better Type Safety** - Full TypeScript integration
- **Improved Security** - Enhanced access control and validation
- **Better Performance** - Optimized database queries
- **Comprehensive Testing** - Built-in testing patterns
- **Better Documentation** - Complete API documentation
- **Health Monitoring** - System health and monitoring endpoints

## Usage Examples

### Create a Company

```bash
curl -X POST http://localhost:3000/api/tenants/123e4567-e89b-12d3-a456-426614174000/companies \
  -H "Content-Type: application/json" \
  -H "Cookie: nile.session=your-session-cookie" \
  -d '{
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "settings": {"plan": "enterprise"}
  }'
```

### Get User's Tenants

```bash
curl http://localhost:3000/api/user/tenants \
  -H "Cookie: nile.session=your-session-cookie"
```

### Admin: List All Users

```bash
curl "http://localhost:3000/api/admin/users?limit=20&search=john" \
  -H "Cookie: nile.session=your-session-cookie"
```

This completes the migration of all Express.js routes to Next.js API routes with enhanced security, validation, and NileDB integration.
