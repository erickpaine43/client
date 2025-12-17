// ============================================================================
// ANALYTICS MONITORING API - Endpoint for monitoring dashboard data
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { MonitoringUtils } from "@/lib/services/analytics/monitoring/MonitoringUtils";
import { requireAuth } from "@/lib/actions/core/auth";

/**
 * GET /api/analytics/monitoring
 * Get comprehensive monitoring dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "dashboard";

    switch (action) {
      case "dashboard":
        const dashboardData = await MonitoringUtils.getDashboardData();
        return NextResponse.json({
          success: true,
          data: dashboardData,
        });

      case "health":
        const healthCheck = await MonitoringUtils.getHealthCheck();
        return NextResponse.json({
          success: true,
          data: healthCheck,
        });

      case "report":
        const timeWindow = parseInt(searchParams.get("timeWindow") || "3600000");
        const report = await MonitoringUtils.generateReport(timeWindow);
        return NextResponse.json({
          success: true,
          data: report,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Supported actions: dashboard, health, report",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics monitoring API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/monitoring
 * Perform monitoring actions (clear data, resolve alerts, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user and check admin privileges
    const authResult = await requireAuth();
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error?.message || "Authentication required",
        },
        { status: 401 }
      );
    }

    // For admin operations, require admin role
    // In a production system, this should check the user's actual role from the database
    // For now, we'll use environment variable to determine if admin access is allowed
    const isAdminAccess = process.env.ALLOW_ADMIN_OPERATIONS === 'true';
    if (!isAdminAccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin privileges required for this operation",
        },
        { status: 403 }
      );
    }

    const body = await request.json() as { action: string; olderThanHours?: number, alertId?: string, errorId?: string };
    const { action, ...params } = body;

    switch (action) {
      case "clearOldData":
        const olderThanHours = params.olderThanHours || 24;
        const cleared = await MonitoringUtils.clearOldData(olderThanHours);
        return NextResponse.json({
          success: true,
          data: {
            message: "Old monitoring data cleared",
            cleared,
          },
        });

      case "resolveAlert":
        const { alertId } = params;
        if (!alertId) {
          return NextResponse.json(
            {
              success: false,
              error: "alertId is required",
            },
            { status: 400 }
          );
        }

        // Import analyticsMonitor directly to resolve alert
        const { analyticsMonitor } = await import("@/lib/services/analytics/monitoring/AnalyticsMonitor");
        const resolved = analyticsMonitor.resolveAlert(alertId);
        
        return NextResponse.json({
          success: true,
          data: {
            resolved,
            message: resolved ? "Alert resolved" : "Alert not found or already resolved",
          },
        });

      case "resolveError":
        const { errorId } = params;
        if (!errorId) {
          return NextResponse.json(
            {
              success: false,
              error: "errorId is required",
            },
            { status: 400 }
          );
        }

        // Import errorTracker directly to resolve error
        const { errorTracker } = await import("@/lib/services/analytics/monitoring/ErrorTracker");
        const errorResolved = errorTracker.resolveError(errorId);
        
        return NextResponse.json({
          success: true,
          data: {
            resolved: errorResolved,
            message: errorResolved ? "Error resolved" : "Error not found or already resolved",
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Supported actions: clearOldData, resolveAlert, resolveError",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics monitoring API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
