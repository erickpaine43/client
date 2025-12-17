/**
 * Enhanced Middleware Test API Routes
 * 
 * Comprehensive testing endpoints for the enhanced middleware system
 * including error handling, validation, rate limiting, and recovery.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  withEnhancedAuthentication,
  withValidation,
  performanceMonitor,
} from '@/lib/niledb/enhanced-middleware';
import { 
  ValidationError,
  AuthenticationError,
  TenantAccessError,
  DatabaseError,
  createErrorResponse,
} from '@/lib/niledb/errors';

// Validation schemas for testing
const TestValidationSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  age: z.number().min(0).max(150).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    notifications: z.boolean().optional(),
  }).optional(),
});

const ErrorTestSchema = z.object({
  errorType: z.enum([
    'validation',
    'authentication',
    'tenant_access',
    'database',
    'unknown',
  ]),
  message: z.string().optional(),
});

/**
 * GET /api/test/middleware
 * Test basic enhanced authentication middleware
 */
export const GET = withEnhancedAuthentication({
  requireProfile: true,
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
})(async (request, context) => {
  try {
    return NextResponse.json({
      message: 'Enhanced middleware test successful',
      requestId: context.requestId,
      user: {
        id: request.user.id,
        email: request.user.email,
        name: request.user.name,
        profile: request.user.profile,
      },
      isStaff: context.isStaff,
      performance: {
        requestStartTime: request.startTime,
        currentTime: Date.now(),
        duration: Date.now() - request.startTime,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { body, status } = createErrorResponse(error, {
      requestId: context.requestId,
      operation: 'middleware_test',
    });
    return NextResponse.json(body, { status });
  }
});

/**
 * POST /api/test/middleware
 * Test input validation middleware
 */
export const POST = withEnhancedAuthentication()(
  withValidation(TestValidationSchema)(async (request, context, validatedBody) => {
    try {
      return NextResponse.json({
        message: 'Input validation test successful',
        requestId: context.requestId,
        validatedData: validatedBody,
        user: {
          id: request.user.id,
          email: request.user.email,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const { body, status } = createErrorResponse(error, {
        requestId: context.requestId,
        operation: 'validation_test',
      });
      return NextResponse.json(body, { status });
    }
  })
);

/**
 * PUT /api/test/middleware
 * Test error handling and recovery
 */
export const PUT = withEnhancedAuthentication()(
  withValidation(ErrorTestSchema)(async (request, context, validatedBody) => {
    const { errorType, message } = validatedBody;

    try {
      // Simulate different types of errors for testing
      switch (errorType) {
        case 'validation':
          throw new ValidationError(
            message || 'Test validation error',
            { testField: ['This is a test validation error'] }
          );

        case 'authentication':
          throw new AuthenticationError(
            message || 'Test authentication error',
            'TEST_AUTH_ERROR'
          );

        case 'tenant_access':
          throw new TenantAccessError(
            message || 'Test tenant access error',
            'test-tenant-id'
          );

        case 'database':
          throw new DatabaseError(
            message || 'Test database error',
            'TEST_DB_ERROR'
          );

        case 'unknown':
          throw new Error(message || 'Test unknown error');

        default:
          return NextResponse.json({
            message: 'Error test completed - no error thrown',
            requestId: context.requestId,
            errorType,
            timestamp: new Date().toISOString(),
          });
      }
    } catch (error) {
      // This is expected for error testing
      const { body, status } = createErrorResponse(error, {
        requestId: context.requestId,
        operation: 'error_test',
        userId: request.user.id,
      });
      return NextResponse.json(body, { status });
    }
  })
);

/**
 * DELETE /api/test/middleware
 * Test performance monitoring and metrics
 */
export const DELETE = withEnhancedAuthentication()(async (request, context) => {
  try {
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

    const metrics = performanceMonitor.getMetrics(50);
    const averageResponseTime = performanceMonitor.getAverageResponseTime();

    return NextResponse.json({
      message: 'Performance monitoring test successful',
      requestId: context.requestId,
      performance: {
        currentRequestDuration: Date.now() - request.startTime,
        averageResponseTime,
        recentMetricsCount: metrics.length,
        recentMetrics: metrics.slice(-5), // Last 5 requests
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const { body, status } = createErrorResponse(error, {
      requestId: context.requestId,
      operation: 'performance_test',
    });
    return NextResponse.json(body, { status });
  }
});
