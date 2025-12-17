/**
 * NileDB Health Check API Endpoint
 * 
 * Provides health check information for NileDB connection and configuration.
 * This endpoint can be used for monitoring and debugging purposes.
 * 
 * GET /api/health/niledb - Returns comprehensive health check
 * GET /api/health/niledb?quick=true - Returns quick health check (connection only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { performHealthCheck, validateDatabaseConnection } from '@/lib/niledb/health';
import { getClientInfo } from '@/lib/niledb/client';
import { createErrorResponse } from '@/lib/niledb/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const quick = searchParams.get('quick') === 'true';
  const includeConfig = searchParams.get('config') === 'true';

  try {
    if (quick) {
      // Quick health check - just test database connection
      const connectionResult = await validateDatabaseConnection();
      
      return NextResponse.json({
        status: connectionResult.isValid ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        connection: {
          isValid: connectionResult.isValid,
          responseTime: connectionResult.details.responseTime,
          error: connectionResult.error,
        },
        ...(includeConfig && {
          config: getClientInfo(),
        }),
      });
    } else {
      // Comprehensive health check
      const healthResult = await performHealthCheck();
      
      return NextResponse.json({
        ...healthResult,
        ...(includeConfig && {
          config: getClientInfo(),
        }),
      });
    }
  } catch (error) {
    const { body, status } = createErrorResponse(error, {
      operation: 'health_check',
    });
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: body.error,
      code: body.code,
      checks: {
        database: { status: 'fail', error: 'Configuration error' },
        api: { status: 'fail', error: 'Configuration error' },
        authentication: { status: 'fail', error: 'Configuration error' },
      },
    }, { status });
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
