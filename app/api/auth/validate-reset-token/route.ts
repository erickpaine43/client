import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateToken } from '@/lib/auth/passwordResetTokenUtils';

const validateTokenSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateTokenSchema.parse(body);

    // Validate token using NILEDB TokenService
    await validateToken(validatedData.token);

    // Token is valid
    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
    });

  } catch (error) {
    console.error('Validate reset token error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
