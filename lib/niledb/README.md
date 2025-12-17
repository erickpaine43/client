# NileDB Integration

This module provides comprehensive NileDB integration for the PenguinMails application, including configuration management, health checking, and client initialization.

## Overview

The NileDB integration consists of three main components:

1. **Configuration Management** (`config.ts`) - Environment-specific configuration with validation
2. **Client Management** (`client.ts`) - NileDB client initialization and connection management
3. **Health Monitoring** (`health.ts`) - Connection validation and health checks

## Quick Start

### 1. Environment Setup

Copy the appropriate environment file for your setup:

```bash
# For development
cp .env.development .env

# For staging
cp .env.staging .env

# For production
cp .env.production .env
```

### 2. Configure Environment Variables

Set the following required environment variables:

```bash
# NileDB Configuration
NILEDB_USER=your_niledb_user_id
NILEDB_PASSWORD=your_niledb_password
NILEDB_API_URL=https://us-west-2.api.thenile.dev/v2/databases/your_database_id
NILEDB_POSTGRES_URL=postgres://us-west-2.db.thenile.dev:5432/your_database_name

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Validate Configuration

Run the validation script to ensure everything is configured correctly:

```bash
# Basic validation
npm run validate:niledb

# Verbose validation with detailed output
npm run validate:niledb:verbose

# Validate specific environment
npm run validate:niledb:staging
```

### 4. Use in Your Application

```typescript
import { getNileClient, performHealthCheck } from "@/lib/niledb";

// Get NileDB client
const nile = getNileClient();

// Use with tenant context
import { withTenantContext } from "@/lib/niledb";

const result = await withTenantContext("tenant-id", async (nile) => {
  return await nile.db.query("SELECT * FROM companies");
});

// Check health
const health = await performHealthCheck();
console.log("NileDB Status:", health.status);
```

## Configuration

### Environment-Specific Settings

The configuration automatically adapts based on the `NODE_ENV` environment variable:

#### Development

- Debug mode enabled
- Secure cookies disabled
- Smaller connection pool (5 connections)
- Shorter timeouts for faster development

#### Staging

- Debug mode enabled (for troubleshooting)
- Secure cookies enabled
- Medium connection pool (8 connections)
- Moderate timeouts

#### Production

- Debug mode disabled
- Secure cookies enabled
- Large connection pool (20 connections)
- Longer timeouts for stability

### Configuration Options

```typescript
interface NileConfig {
  // Database Configuration
  databaseId: string;
  databaseName: string;
  user: string;
  password: string;

  // API Configuration
  apiUrl: string;
  postgresUrl: string;

  // Application Configuration
  origin: string;
  debug: boolean;
  secureCookies: boolean;
  nodeEnv: "development" | "staging" | "production";

  // Connection Pool Settings
  connectionPool: {
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
}
```

## Client Usage

### Basic Usage

```typescript
import { getNileClient } from "@/lib/niledb";

const nile = getNileClient();

// Execute query
const result = await nile.db.query("SELECT * FROM users");

// Get current user
const user = await nile.users.getSelf();

// Get current tenant
const tenant = await nile.tenants.get();
```

### Tenant Context

```typescript
import { withTenantContext, createNileClientWithContext } from "@/lib/niledb";

// Method 1: Using withTenantContext helper
const companies = await withTenantContext("tenant-id", async (nile) => {
  return await nile.db.query("SELECT * FROM companies");
});

// Method 2: Creating client with context
const nileWithContext = await createNileClientWithContext("tenant-id");
const companies = await nileWithContext.db.query("SELECT * FROM companies");

// Method 3: Using the client's withContext method
const nile = getNileClient();
const companies = await nile.withContext(
  { tenantId: "tenant-id" },
  async (contextNile) => {
    return await contextNile.db.query("SELECT * FROM companies");
  }
);
```

### Cross-Tenant Operations

```typescript
import { withoutTenantContext } from "@/lib/niledb";

// Execute queries without tenant context (for shared data)
const sharedData = await withoutTenantContext(async (nile) => {
  return await nile.db.query("SELECT * FROM shared_settings");
});
```

## Health Monitoring

### Health Check API

The health check API endpoint is available at `/api/health/niledb`:

```bash
# Comprehensive health check
curl http://localhost:3000/api/health/niledb

# Quick health check (connection only)
curl http://localhost:3000/api/health/niledb?quick=true

# Include configuration info
curl http://localhost:3000/api/health/niledb?config=true
```

### Programmatic Health Checks

```typescript
import {
  performHealthCheck,
  validateDatabaseConnection,
  testQueryPerformance,
} from "@/lib/niledb/health";

// Comprehensive health check
const health = await performHealthCheck();
console.log("Status:", health.status);
console.log("Database:", health.checks.database.status);

// Simple connection test
const connection = await validateDatabaseConnection();
console.log("Connection valid:", connection.isValid);

// Performance testing
const performance = await testQueryPerformance();
console.log("Average response time:", performance.averageResponseTime);
```

### Continuous Monitoring

```typescript
import { createHealthMonitor } from "@/lib/niledb/health";

// Create a health monitor that checks every minute
const monitor = createHealthMonitor(60000);

// Start monitoring
monitor.start();

// Get last result
const lastResult = monitor.getLastResult();

// Stop monitoring
monitor.stop();
```

## Validation and Troubleshooting

### Validation Script

The validation script provides comprehensive testing of your NileDB configuration:

```bash
# Basic validation
npm run validate:niledb

# Verbose output with detailed information
npm run validate:niledb:verbose

# Test specific environment
npm run validate:niledb:staging

# Skip connection tests (config validation only)
npx tsx scripts/validate-niledb-config.ts --skip-connection
```

### Common Issues

#### 1. Missing Environment Variables

**Error:** `Missing required environment variable: NILEDB_USER`

**Solution:** Ensure all required environment variables are set in your `.env` file:

- `NILEDB_USER`
- `NILEDB_PASSWORD`
- `NILEDB_API_URL`
- `NILEDB_POSTGRES_URL`

#### 2. Invalid Database URL

**Error:** `NILEDB_API_URL must be a valid HTTPS URL`

**Solution:** Ensure your API URL follows the correct format:

```
https://us-west-2.api.thenile.dev/v2/databases/your-database-id
```

#### 3. Connection Timeout

**Error:** `Connection failed: timeout`

**Solution:** Check your network connection and database availability. You may need to adjust timeout settings in the configuration.

#### 4. Authentication Failed

**Error:** `Authentication failed`

**Solution:** Verify your `NILEDB_USER` and `NILEDB_PASSWORD` are correct and have the necessary permissions.

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set in environment
DEBUG=true
NILEDB_DEBUG=true

# Or in code
const config = getNileConfig();
console.log('Debug mode:', config.debug);
```

## Migration from Old Backend

If you're migrating from the old Drizzle-based backend:

1. **Environment Variables:** The environment variables remain the same, but are now validated and structured
2. **Client Usage:** Replace direct Drizzle usage with NileDB client methods
3. **Tenant Context:** Use the new tenant context helpers instead of custom middleware
4. **Health Checks:** Use the built-in health check system instead of custom validation

### Example Migration

**Before (Old Backend):**

```javascript
// Custom database connection
const db = drizzle(connection);
const users = await db.select().from(usersTable);
```

**After (New NileDB Integration):**

```typescript
// NileDB client
const nile = getNileClient();
const users = await nile.db.query("SELECT * FROM users");
```

## API Reference

### Configuration Functions

- `createNileConfig()` - Create and validate configuration from environment
- `getNileConfig()` - Get singleton configuration instance
- `validateEnvironmentVariables()` - Check if required env vars are present
- `getConfigForEnvironment(env)` - Get config for specific environment

### Client Functions

- `getNileClient()` - Get singleton NileDB client
- `createNileClient(config?)` - Create new client instance
- `withTenantContext(tenantId, callback)` - Execute with tenant context
- `withoutTenantContext(callback)` - Execute without tenant context
- `testNileConnection()` - Test database connection

### Health Functions

- `performHealthCheck()` - Comprehensive health check
- `validateDatabaseConnection()` - Test database connection
- `testQueryPerformance()` - Test query performance
- `createHealthMonitor(interval)` - Create continuous health monitor

## Best Practices

1. **Always validate configuration** before deploying to new environments
2. **Use tenant context helpers** instead of manually managing context
3. **Monitor health regularly** in production environments
4. **Use environment-specific configurations** for different deployment stages
5. **Handle errors gracefully** and provide meaningful error messages
6. **Test connections** before performing critical operations
7. **Use connection pooling** settings appropriate for your environment

## Support

For issues with this integration:

1. Run the validation script to identify configuration problems
2. Check the health check endpoint for runtime issues
3. Review the NileDB documentation: https://docs.thenile.dev
4. Check the application logs for detailed error messages
