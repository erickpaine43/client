/**
 * Database Service Usage Examples
 * 
 * This file demonstrates how to use the DatabaseService class for various
 * multi-schema operations, tenant context management, and performance optimization.
 */

import { getDatabaseService, createDatabaseService } from '../database';
import type { CrossSchemaQueryOptions } from '../database';

/**
 * Example 1: Basic Database Operations
 */
export async function basicDatabaseOperations() {
  const db = getDatabaseService();

  // Simple query
  const result = await db.query('SELECT current_timestamp as now');
  console.log('Current time:', result.rows[0].now);

  // Query with parameters
  const userProfiles = await db.query(
    'SELECT * FROM user_profiles WHERE role = $1',
    ['admin']
  );
  console.log('Admin users:', userProfiles.rows);

  // Cross-tenant query (admin operation)
  const allTenants = await db.queryCrossTenant(
    'SELECT id, name, created FROM tenants WHERE deleted IS NULL ORDER BY name'
  );
  console.log('All tenants:', allTenants.rows);
}

/**
 * Example 2: Tenant-Scoped Operations
 */
export async function tenantScopedOperations(tenantId: string) {
  const db = getDatabaseService();

  // Get companies for a specific tenant
  const companies = await db.queryWithContext(
    tenantId,
    'SELECT id, name, email FROM companies WHERE deleted IS NULL ORDER BY name'
  );
  console.log(`Companies for tenant ${tenantId}:`, companies.rows);

  // Create a new company in tenant context
  const newCompany = await db.queryWithContext(
    tenantId,
    `
    INSERT INTO companies (tenant_id, name, email, settings)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name
  `,
    [tenantId, 'New Company', 'contact@newcompany.com', { theme: 'light' }]
  );
  console.log('Created company:', newCompany.rows[0]);
}

/**
 * Example 3: Cross-Schema Queries
 */
export async function crossSchemaQueries(userId: string) {
  const db = getDatabaseService();

  // Get user with full context (cross-schema)
  const userWithContext = await db.getUserWithFullContext(userId);
  console.log('User with full context:', userWithContext);

  // Get user-company relationships
  const relationships = await db.getUserCompanyRelationships(userId);
  console.log('User company relationships:', relationships);

  // Get companies with statistics
  const companiesWithStats = await db.getCompaniesWithStats();
  console.log('Companies with user counts:', companiesWithStats);
}

/**
 * Example 4: Access Control and Validation
 */
export async function accessControlExamples(userId: string, tenantId: string) {
  const db = getDatabaseService();

  // Check if user is staff
  const isStaff = await db.isStaffUser(userId);
  console.log(`User ${userId} is staff:`, isStaff);

  // Validate tenant access
  const hasAccess = await db.validateTenantAccess(userId, tenantId);
  console.log(`User ${userId} has access to tenant ${tenantId}:`, hasAccess);

  // Get system statistics (admin only)
  if (isStaff) {
    const stats = await db.getSystemStatistics();
    console.log('System statistics:', stats);
  }
}

/**
 * Example 5: Performance Monitoring
 */
export async function performanceMonitoring() {
  const db = getDatabaseService();

  // Execute some queries
  await db.query('SELECT 1');
  await db.query('SELECT COUNT(*) FROM tenants');
  await db.query('SELECT COUNT(*) FROM users.users');

  // Get performance metrics
  const metrics = db.getPerformanceMetrics();
  console.log('Performance metrics:', {
    queryCount: metrics.queryCount,
    averageTime: metrics.averageTime,
    slowQueries: metrics.slowQueries.length,
  });

  // Run performance benchmark
  const benchmark = await db.runPerformanceBenchmark();
  console.log('Performance benchmark:', benchmark);

  // Reset metrics for next monitoring period
  db.resetPerformanceMetrics();
}

/**
 * Example 6: Transaction Usage
 */
export async function transactionExample(tenantId: string) {
  const db = getDatabaseService();

  try {
    const result = await db.transaction(async (client) => {
      // Create company
      const company = await client.query(
        `
        INSERT INTO companies (tenant_id, name, email)
        VALUES ($1, $2, $3)
        RETURNING id, name
      `,
        [tenantId, 'Transaction Company', 'tx@company.com']
      );

      // Create user-company relationship
      const relationship = await client.query(
        `
        INSERT INTO user_companies (tenant_id, user_id, company_id, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
        [tenantId, 'user-123', company.rows[0].id, 'owner']
      );

      return {
        company: company.rows[0],
        relationship: relationship.rows[0],
      };
    }, tenantId);

    console.log('Transaction completed:', result);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

/**
 * Example 7: Advanced Query Options
 */
export async function advancedQueryOptions(userId: string) {
  const db = getDatabaseService();

  // Query with options
  const options: CrossSchemaQueryOptions = {
    includeSoftDeleted: false,
    orderBy: 'c.name ASC',
    limit: 10,
    offset: 0,
  };

  // Get user relationships with pagination
  const relationships = await db.getUserCompanyRelationships(
    userId,
    undefined, // all tenants
    options
  );
  console.log('Paginated relationships:', relationships);

  // Get companies with custom ordering
  const companies = await db.getCompaniesWithStats(undefined, {
    orderBy: 'user_count DESC, c.name ASC',
    limit: 5,
  });
  console.log('Top 5 companies by user count:', companies);
}

/**
 * Example 8: Error Handling and Resilience
 */
export async function errorHandlingExample() {
  const db = getDatabaseService();

  try {
    // This will fail due to invalid SQL
    await db.query('SELECT * FROM non_existent_table');
  } catch (error) {
    console.error('Expected error caught:', error instanceof Error ? error.message : 'Unknown error');
  }

  // Validate connection before critical operations
  const isConnected = await db.validateConnection();
  if (!isConnected) {
    console.error('Database connection is not available');
    return;
  }

  console.log('Database connection is healthy');
}

/**
 * Example 9: Custom Database Service Instance
 */
export async function customDatabaseServiceExample() {
  // Create a custom instance with different settings
  const customDb = createDatabaseService(undefined, 500); // 500ms slow query threshold

  // Use the custom instance
  await customDb.query('SELECT 1');

  const metrics = customDb.getPerformanceMetrics();
  console.log('Custom DB metrics:', metrics);
}

/**
 * Example 10: Admin Dashboard Data
 */
export async function adminDashboardData() {
  const db = getDatabaseService();

  // Get comprehensive system overview
  const [stats, companiesWithStats, topUsers] = await Promise.all([
    db.getSystemStatistics(),
    db.getCompaniesWithStats(undefined, { orderBy: 'user_count DESC', limit: 10 }),
    db.queryCrossTenant(`
      SELECT 
        u.id,
        u.email,
        u.name,
        up.role,
        up.is_penguinmails_staff,
        COUNT(DISTINCT uc.company_id) as company_count
      FROM users.users u
      JOIN public.user_profiles up ON u.id = up.user_id
      LEFT JOIN public.user_companies uc ON u.id = uc.user_id AND uc.deleted IS NULL
      WHERE u.deleted IS NULL AND up.deleted IS NULL
      GROUP BY u.id, u.email, u.name, up.role, up.is_penguinmails_staff
      ORDER BY company_count DESC, u.email
      LIMIT 10
    `),
  ]);

  console.log('Admin Dashboard Data:', {
    systemStats: stats,
    topCompanies: companiesWithStats,
    activeUsers: topUsers.rows,
  });
}

/**
 * Example Usage Function
 */
export async function runAllExamples() {
  console.log('=== Database Service Usage Examples ===\n');

  try {
    console.log('1. Basic Database Operations');
    await basicDatabaseOperations();

    console.log('\n2. Tenant-Scoped Operations');
    await tenantScopedOperations('example-tenant-id');

    console.log('\n3. Cross-Schema Queries');
    await crossSchemaQueries('example-user-id');

    console.log('\n4. Access Control Examples');
    await accessControlExamples('example-user-id', 'example-tenant-id');

    console.log('\n5. Performance Monitoring');
    await performanceMonitoring();

    console.log('\n6. Transaction Example');
    await transactionExample('example-tenant-id');

    console.log('\n7. Advanced Query Options');
    await advancedQueryOptions('example-user-id');

    console.log('\n8. Error Handling');
    await errorHandlingExample();

    console.log('\n9. Custom Database Service');
    await customDatabaseServiceExample();

    console.log('\n10. Admin Dashboard Data');
    await adminDashboardData();

    console.log('\n=== All examples completed successfully ===');
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Individual examples are already exported above
