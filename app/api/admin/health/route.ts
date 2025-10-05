/**
 * Admin System Health API Routes
 * 
 * GET /api/admin/health - Get system health status (staff only)
 * 
 * These routes provide system health monitoring for staff users.
 */

import { NextResponse } from 'next/server';
import { withStaffAccess } from '@/lib/niledb/middleware';
import { performHealthCheck } from '@/lib/niledb/health';
import { withoutTenantContext } from '@/lib/niledb/client';

/**
 * GET /api/admin/health
 * Get system health status (staff only)
 */
export const GET = withStaffAccess('admin')(async (_request, _context) => {
  try {
    // Perform comprehensive health check
    const healthResult = await performHealthCheck();

    // Get system statistics
    const statistics = await withoutTenantContext(async (nile) => {
      const [userCount, tenantCount, companyCount, recentActivity] = await Promise.all([
        nile.db.query('SELECT COUNT(*) as count FROM users.users'),
        nile.db.query('SELECT COUNT(*) as count FROM public.tenants WHERE deleted IS NULL'),
        nile.db.query('SELECT COUNT(*) as count FROM public.companies WHERE deleted IS NULL'),
        nile.db.query(
          `SELECT COUNT(*) as count FROM public.audit_logs 
           WHERE created_at >= NOW() - INTERVAL '1 hour' AND deleted IS NULL`
        ),
      ]);

      return {
        users: parseInt(userCount.rows[0]?.count || '0'),
        tenants: parseInt(tenantCount.rows[0]?.count || '0'),
        companies: parseInt(companyCount.rows[0]?.count || '0'),
        recentActivity: parseInt(recentActivity.rows[0]?.count || '0'),
      };
    });

    return NextResponse.json({
      status: healthResult.status,
      timestamp: healthResult.timestamp,
      checks: healthResult.checks,
      statistics,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || 'unknown',
    });
  } catch (error) {
    console.error('Failed to get system health:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});
