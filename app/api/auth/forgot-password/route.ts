import { NextRequest, NextResponse } from 'next/server';
import { getLoopService } from '@/lib/services/loop';
import { getAuthService } from '@/lib/niledb/auth';
import { getTokenService } from '@/lib/niledb/tokens';
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
      console.log('Could not find user profile for email:', validatedData.email, 'using default name', error);
    }

    // Use NILEDB TokenService to generate and store token
    const tokenService = getTokenService();
    
    // Clean up expired tokens for this email first
    await tokenService.cleanupExpiredTokensForEmail(validatedData.email, 'password_reset');
    
    // Calculate expiration time (default 1 hour)
    const expiryMinutes = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || '60');
    
    // Create new token
    const tokenData = await tokenService.createToken(
      validatedData.email,
      'password_reset',
      expiryMinutes
    );

    // Send password reset email via Loop with real user name
    const loopService = getLoopService();
    const result = await loopService.sendPasswordResetEmail(
      validatedData.email,
      tokenData.token,
      userName // Now includes real user name from database
    );

    if (!result.success) {
      console.error('Failed to send password reset email:', result.message);
      // Don't return error to user for security - always return success
    }

    // Always return success for security reasons (don't confirm if email exists)
    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link shortly.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

