import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = loginSchema.parse(body);

    // For now, return mock response since actual auth implementation
    // depends on NileDB auth setup
    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        id: 'mock-user-id',
        email: email,
        name: 'Mock User',
        tenant_id: 'mock-tenant-id',
        company_id: 'mock-company-id',
        role: 'user',
      },
    };

    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
