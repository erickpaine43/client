import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

const createCompanySchema = z.object({
  name: z.string().min(1),
});

export async function GET(_request: NextRequest) {
  try {
    const authService = getAuthService();
    const user = await authService.validateSession();

    // For now, return mock companies data
    const mockCompanies = [
      {
        id: 'mock-company-id',
        name: 'Mock Company',
        tenant_id: user.tenants?.[0] || 'mock-tenant-id',
      },
    ];

    return NextResponse.json(mockCompanies, { status: 200 });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authService = getAuthService();
    const user = await authService.validateSession();

    const body = await request.json();
    const { name } = createCompanySchema.parse(body);

    // For now, return mock created company
    const mockCompany = {
      id: 'new-mock-company-id',
      name: name,
      tenant_id: user.tenants?.[0] || 'mock-tenant-id',
    };

    return NextResponse.json(mockCompany, { status: 201 });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { error: 'Bad request' },
      { status: 400 }
    );
  }
}
