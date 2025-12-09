import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateVerificationToken,
  markTokenAsUsed,
  updateUserVerificationStatus,
  storeVerificationToken
} from '@/lib/utils/email-verification';

// Schema for email verification requests
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    // Validate token using our utility
    const tokenValidation = await validateVerificationToken(validatedData.token);

    if (!tokenValidation.valid) {
      if (tokenValidation.expired) {
        return NextResponse.json({
          success: false,
          error: 'expired',
          message: 'This verification link has expired.',
          email: tokenValidation.email,
        }, { status: 400 });
      }
      
      if (tokenValidation.used) {
        return NextResponse.json({
          success: false,
          error: 'used',
          message: 'This verification link has already been used.',
          email: tokenValidation.email,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: 'Invalid verification link. The token does not exist.',
      }, { status: 400 });
    }

    // Token is valid, mark it as used
    const tokenMarked = await markTokenAsUsed(validatedData.token);
    if (!tokenMarked) {
      console.error(`Critical: Failed to mark token as used: ${validatedData.token}`);
      return NextResponse.json({
        success: false,
        error: 'Verification process failed. Please try again.'
      }, { status: 500 });
    }

    // Update user verification status
    if (tokenValidation.email) {
      const userUpdated = await updateUserVerificationStatus(tokenValidation.email);
      if (!userUpdated) {
        console.error(`Critical: Failed to update verification status for email: ${tokenValidation.email}`);
        return NextResponse.json({
          success: false,
          error: 'Verification process failed. Please try again.'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: tokenValidation.email,
    });

  } catch (error) {
    console.error('Email verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing verification (development only)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 }
    );
  }

  try {
    // Generate a test verification token
    const testToken = crypto.randomUUID();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Store test token using our utility
    const tokenStored = await storeVerificationToken(
      'test@example.com',
      testToken,
      expiresAt
    );

    if (!tokenStored) {
      return NextResponse.json(
        { error: 'Failed to store test token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test verification token created',
      token: testToken,
      testUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${testToken}`,
      expiresAt: new Date(expiresAt).toISOString(),
    });

  } catch (error) {
    console.error('Test verification error:', error);
    return NextResponse.json(
      { error: 'Failed to create test token' },
      { status: 500 }
    );
  }
}
