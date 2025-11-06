import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';
import { validateToken } from '@/lib/auth/passwordResetTokenUtils';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Validate token
    const tokenInfo = await validateToken(convex, validatedData.token);

    // Update password using NileDB auth service
    const authService = getAuthService();
    // Use a type assertion and runtime check because AuthService type may not declare updatePassword
    if (typeof (authService as any).updatePassword !== 'function') {
      throw new Error('Auth service does not implement updatePassword');
    }
    await (authService as any).updatePassword(tokenInfo.email, validatedData.newPassword);

    // Mark token as used (only if _id exists)
    if (tokenInfo._id) {
      await (convex as any).mutation('passwordResetTokens:markTokenAsUsed', {
        tokenId: tokenInfo._id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);

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
