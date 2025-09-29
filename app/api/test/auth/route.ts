/**
 * Authentication Test API Routes
 * 
 * GET /api/test/auth - Test authentication functionality
 * 
 * These routes provide testing endpoints for authentication and middleware.
 */

import { NextResponse } from 'next/server';
import { withAuthentication } from '@/lib/niledb/middleware';

/**
 * GET /api/test/auth
 * Test authentication functionality
 */
export const GET = withAuthentication(async (request, _context) => {
  try {
    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: request.user.id,
        email: request.user.email,
        name: request.user.name,
        profile: request.user.profile,
      },
      isStaff: request.isStaff || false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Authentication test failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Authentication test failed',
        code: 'AUTH_TEST_ERROR',
      },
      { status: 500 }
    );
  }
});
