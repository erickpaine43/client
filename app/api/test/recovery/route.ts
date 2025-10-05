/**
 * Recovery System Test API Routes
 * 
 * Testing endpoints for the recovery and rollback system
 * including health checks, data integrity validation, and recovery operations.
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
import { getRecoveryManager } from '@/lib/niledb/recovery';
import { performHealthCheck } from '@/lib/niledb/health';

// Validation schemas
const RecoveryTestSchema = z.object({
  operation: z.enum(['health_check', 'auto_recovery', 'data_integrity', 'create_backup']),
  options: z.object({
    dryRun: z.boolean().optional(),
    includeMetrics: z.boolean().optional(),
  }).optional(),
});

const RecoveryPointSchema = z.object({
  operation: z.string().min(1),
  tenantId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/test/recovery
 * Test system health and recovery status
 */
export const GET = withEnhancedStaffAccess('admin')(async (request, context) => {
  try {
    const recoveryManager = getRecoveryManager();
    
    // Perform comprehensive health check
    const healthCheck = await performHealthCheck();
    
    // Check data integrity
    const integrityCheck = await recoveryManager.validateDataIntegrity();
    
    return NextResponse.json({
      message: 'Recovery system test successful',
      requestId: context.requestId,
      systemHealth: healthCheck,
      dataIntegrity: integrityCheck,
      recoverySystemStatus: {
        available: true,
        lastHealthCheck: healthCheck.timestamp,
        integrityIssues: integrityCheck.issues.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { body, status } = createErrorResponse(error, {
      requestId: context.requestId,
      operation: 'recovery_status_test',
    });
    return NextResponse.json(body, { status });
  }
});

/**
 * POST /api/test/recovery
 * Test recovery operations
 */
export const POST = withEnhancedStaffAccess('admin')(
  withValidation(RecoveryTestSchema)(async (request, context, validatedBody) => {
    const { operation, options = {} } = validatedBody;

    try {
      const recoveryManager = getRecoveryManager();
      let result: unknown;

      switch (operation) {
        case 'health_check':
          result = await performHealthCheck();
          break;

        case 'auto_recovery':
          result = await recoveryManager.performAutoRecovery();
          break;

        case 'data_integrity':
          {
            const integrityResult = await recoveryManager.validateDataIntegrity();
            if (!integrityResult.valid && !options.dryRun) {
              await recoveryManager.repairDataIntegrity(integrityResult.issues);
              (integrityResult as { valid: boolean; issues: Array<{ table: string; issue: string; severity: 'low' | 'medium' | 'high'; affectedRecords: number }>; repaired?: boolean }).repaired = true;
            }
            result = integrityResult;
          }
          break;

        case 'create_backup':
          result = await recoveryManager.createSystemBackup(`test_backup_${Date.now()}`);
          break;

        default:
          throw new Error(`Unknown recovery operation: ${operation}`);
      }

      return NextResponse.json({
        message: `Recovery operation '${operation}' completed successfully`,
        requestId: context.requestId,
        operation,
        options,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const { body, status } = createErrorResponse(error, {
        requestId: context.requestId,
        operation: `recovery_${operation}_test`,
      });
      return NextResponse.json(body, { status });
    }
  })
);

/**
 * PUT /api/test/recovery
 * Test recovery point creation
 */
export const PUT = withEnhancedStaffAccess('admin')(
  withValidation(RecoveryPointSchema)(async (request, context, validatedBody) => {
    const { operation, tenantId, metadata = {} } = validatedBody;

    try {
      const recoveryManager = getRecoveryManager();
      
      const recoveryPoint = await recoveryManager.createRecoveryPoint(
        operation,
        tenantId,
        {
          ...metadata,
          testMode: true,
          createdBy: request.user.id,
          requestId: context.requestId,
        }
      );

      return NextResponse.json({
        message: 'Recovery point created successfully',
        requestId: context.requestId,
        recoveryPoint,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const { body, status } = createErrorResponse(error, {
        requestId: context.requestId,
        operation: 'recovery_point_test',
        tenantId,
      });
      return NextResponse.json(body, { status });
    }
  })
);
