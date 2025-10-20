import { NextRequest, NextResponse } from 'next/server';
import { getLoopService } from '@/lib/services/loop';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

// Schema for transactional email requests
const transactionalEmailSchema = z.object({
  type: z.enum(['verification', 'password-reset', 'welcome']),
  email: z.string().email(),
  userName: z.string().optional(),
  token: z.string().optional(),
  companyName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate user session for security
    const authService = getAuthService();
    await authService.validateSession();

    const body = await request.json();
    const validatedData = transactionalEmailSchema.parse(body);

    const loopService = getLoopService();
    let result;

    switch (validatedData.type) {
      case 'verification':
        if (!validatedData.token) {
          return NextResponse.json(
            { error: 'Token is required for verification emails' },
            { status: 400 }
          );
        }
        result = await loopService.sendVerificationEmail(
          validatedData.email,
          validatedData.token,
          validatedData.userName
        );
        break;

      case 'password-reset':
        if (!validatedData.token) {
          return NextResponse.json(
            { error: 'Token is required for password reset emails' },
            { status: 400 }
          );
        }
        result = await loopService.sendPasswordResetEmail(
          validatedData.email,
          validatedData.token,
          validatedData.userName
        );
        break;

      case 'welcome':
        if (!validatedData.userName) {
          return NextResponse.json(
            { error: 'User name is required for welcome emails' },
            { status: 400 }
          );
        }
        result = await loopService.sendWelcomeEmail(
          validatedData.email,
          validatedData.userName,
          validatedData.companyName
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        contactId: result.contactId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Failed to send email',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email send error:', error);

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

// GET endpoint for testing email functionality
export async function GET() {
  try {
    const loopService = getLoopService();

    // Send a test verification email
    const testResult = await loopService.sendVerificationEmail(
      'test@example.com',
      'test-verification-token-123',
      'Test User'
    );

    return NextResponse.json({
      success: testResult.success,
      message: testResult.success ? 'Test email sent successfully' : 'Failed to send test email',
      contactId: testResult.contactId,
      error: testResult.message,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
