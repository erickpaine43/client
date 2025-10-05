/**
 * User Company Management API Routes
 * 
 * GET /api/users/[userId]/companies - Get all companies for a user across tenants
 * 
 * These routes handle cross-tenant user company operations.
 */

import { NextResponse } from 'next/server';
import { withAuthentication } from '@/lib/niledb/middleware';
import { getCompanyService } from '@/lib/niledb/company';
import { getAuthService } from '@/lib/niledb/auth';

/**
 * GET /api/users/[userId]/companies
 * Get all companies for a user across tenants (staff or self only)
 */
export const GET = withAuthentication(async (request, context) => {
  try {
    const companyService = getCompanyService();
    const authService = getAuthService();
    const { userId } = await context.params;

    // Handle 'me' parameter for current user
    const targetUserId = userId === 'me' ? request.user.id : userId;

    // Check if user can access this data (staff or self)
    const isStaff = await authService.isStaffUser(request.user.id);
    if (!isStaff && request.user.id !== targetUserId) {
      return NextResponse.json(
        {
          error: 'Access denied. You can only view your own companies',
          code: 'ACCESS_DENIED',
        },
        { status: 403 }
      );
    }

    const companies = await companyService.getUserCompanies(
      targetUserId,
      request.user.id
    );

    return NextResponse.json({
      companies,
      count: companies.length,
      userId: targetUserId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get user companies:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve user companies',
        code: 'USER_COMPANIES_FETCH_ERROR',
      },
      { status: 500 }
    );
  }
});
