import { NextRequest, NextResponse } from 'next/server';
import { getLoopService } from '@/lib/services/loop';
import { getAuthService } from '@/lib/niledb/auth';
import { generateResetToken } from '@/lib/auth/passwordResetTokenUtils';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Try to get user profile to obtain real name
    const authService = getAuthService();
    let userName = 'User'; // Default fallback

    try {
      const user = await authService.getUserWithProfile(validatedData.email);
      if (user?.name) {
        userName = user.name;
      } else if (user?.givenName) {
        userName = user.givenName;
      }
    } catch (error) {
      // If user lookup fails, continue with default 'User'
      console.log(
        'Could not find user profile for email:',
        validatedData.email,
        'using default name',
        error,
      );
    }

    // Generate a stateless signed reset token bound to the email
    const token = generateResetToken(validatedData.email);

    // Send password reset email via Loop with real user name
    const loopService = getLoopService();
    const result = await loopService.sendPasswordResetEmail(
      validatedData.email,
      token,
      userName, // Includes real user name when available
    );

    if (!result.success) {
      console.error('Failed to send password reset email:', result.message);
      // For security, do not leak whether the email exists
    }

    // Always return success for security reasons (do not confirm if email exists)
    return NextResponse.json({
      success: true,
      message:
        'If an account with this email exists, you will receive a password reset link shortly.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format', details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

