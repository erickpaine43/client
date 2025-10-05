/**
 * System Monitoring API Routes
 * 
 * Staff-only endpoints for system monitoring, metrics collection,
 * and alert management.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  withEnhancedStaffAccess,
  withValidation,
} from '@/lib/niledb/enhanced-middleware';
import { 
  createErrorResponse,
} from '@/lib/niledb/errors';
import { getMonitoringManager, type AlertRule } from '@/lib/niledb/monitoring';

// Validation schemas
// Schema for future use
// const MetricsQuerySchema = z.object({
//   limit: z.number().min(1).max(1000).optional().default(100),
//   period: z.number().min(60000).max(24 * 60 * 60 * 1000).optional(), // 1 minute to 24 hours
//   includeDetails: z.boolean().optional().default(false),
// });

const AlertRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  cooldownMs: z.number().min(60000), // Minimum 1 minute cooldown
  enabled: z.boolean(),
  condition: z.string(), // JavaScript condition as string (would need eval in real implementation)
});

/**
 * GET /api/admin/monitoring
 * Get system metrics and monitoring data
 */
export const GET = withEnhancedStaffAccess('admin')(async (request, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const period = searchParams.get('period') ? parseInt(searchParams.get('period')!) : undefined;
    const includeDetails = searchParams.get('includeDetails') === 'true';

    const monitoringManager = getMonitoringManager();

    // Collect current metrics
    const currentMetrics = await monitoringManager.collectMetrics();
    
    // Get recent metrics
    const recentMetrics = monitoringManager.getRecentMetrics(limit);
    
    // Get summary for requested period
    const summary = period 
      ? monitoringManager.getMetricsSummary(period)
      : monitoringManager.getMetricsSummary();

    const response: Record<string, unknown> = {
      message: 'System monitoring data retrieved successfully',
      requestId: context.requestId,
      current: currentMetrics,
      summary,
      metricsCount: recentMetrics.length,
      timestamp: new Date().toISOString(),
    };

    if (includeDetails) {
      response.recentMetrics = recentMetrics;
      response.alertRules = monitoringManager.getAlertRules();
    }

    return NextResponse.json(response);

  } catch (error) {
    const { body, status } = createErrorResponse(error, {
      requestId: context.requestId,
      operation: 'get_monitoring_data',
    });
    return NextResponse.json(body, { status });
  }
});

/**
 * POST /api/admin/monitoring
 * Trigger manual metrics collection
 */
export const POST = withEnhancedStaffAccess('admin')(async (request, context) => {
  try {
    const monitoringManager = getMonitoringManager();
    
    // Force metrics collection
    const metrics = await monitoringManager.collectMetrics();
    
    return NextResponse.json({
      message: 'Manual metrics collection completed',
      requestId: context.requestId,
      metrics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const { body, status } = createErrorResponse(error, {
      requestId: context.requestId,
      operation: 'manual_metrics_collection',
    });
    return NextResponse.json(body, { status });
  }
});

/**
 * PUT /api/admin/monitoring
 * Update monitoring configuration or alert rules
 */
export const PUT = withEnhancedStaffAccess('super_admin')(
  withValidation(AlertRuleSchema)(async (request, context, validatedBody) => {
    try {
      const monitoringManager = getMonitoringManager();
      
      // Create alert rule (simplified - in real implementation would need proper condition parsing)
      const alertRule: AlertRule = {
        ...validatedBody,
        condition: () => false, // Placeholder - would need proper implementation
        lastTriggered: undefined,
      };
      
      monitoringManager.addAlertRule(alertRule);
      
      return NextResponse.json({
        message: 'Alert rule updated successfully',
        requestId: context.requestId,
        alertRule: {
          id: alertRule.id,
          name: alertRule.name,
          severity: alertRule.severity,
          enabled: alertRule.enabled,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const { body, status } = createErrorResponse(error, {
        requestId: context.requestId,
        operation: 'update_alert_rule',
      });
      return NextResponse.json(body, { status });
    }
  })
);

/**
 * DELETE /api/admin/monitoring
 * Remove alert rule
 */
export const DELETE = withEnhancedStaffAccess('super_admin')(async (request, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json(
        {
          error: 'Rule ID required',
          code: 'RULE_ID_REQUIRED',
          requestId: context.requestId,
        },
        { status: 400 }
      );
    }

    const monitoringManager = getMonitoringManager();
    monitoringManager.removeAlertRule(ruleId);
    
    return NextResponse.json({
      message: 'Alert rule removed successfully',
      requestId: context.requestId,
      ruleId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const { body, status } = createErrorResponse(error, {
      requestId: context.requestId,
      operation: 'remove_alert_rule',
    });
    return NextResponse.json(body, { status });
  }
});
