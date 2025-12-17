import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/niledb/auth';

export async function GET(_request: NextRequest) {
  try {
    const authService = getAuthService();
    const user = await authService.validateSession();

    // For now, return mock tenant data
    const mockTenant = {
      id: user.tenants?.[0] || 'mock-tenant-id',
      name: 'Mock Tenant',
      slug: 'mock-tenant',
    };

    return NextResponse.json(mockTenant, { status: 200 });
  } catch (error) {
    console.error('Get tenants error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
