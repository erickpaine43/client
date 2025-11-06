import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { getLoopService } from '@/lib/services/loop';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

    // Generate secure token
    const token = crypto.randomUUID();

    // Calculate expiration time (default 1 hour)
    const expiryMinutes = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || '60');
    const expiresAt = Date.now() + (expiryMinutes * 60 * 1000);

    // Store token in Convex
    await (convex as any).mutation('passwordResetTokens:createToken', {
      email: validatedData.email,
      token,
      expiresAt,
    });

    // Send password reset email via Loop with real user name
    const loopService = getLoopService();
    const result = await loopService.sendPasswordResetEmail(
      validatedData.email,
      token,
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

