/**
 * Email Notification Endpoint
 *
 * Handles sending notification emails using Loop service.
 * Accepts an email address and sends a notification message.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLoopService } from '@/lib/services/loop';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

// Schema for notification email requests
const notificationEmailSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1),
  subject: z.string().optional(),
  userName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate user session for security
    const authService = getAuthService();
    await authService.validateSession();

    const body = await request.json();
    const validatedData = notificationEmailSchema.parse(body);

    const loopService = getLoopService();
    const result = await loopService.sendNotificationEmail(
      validatedData.email,
      validatedData.message,
      validatedData.subject,
      validatedData.userName
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Notification email sent successfully',
        contactId: result.contactId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Failed to send notification email',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notification email error:', error);

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

// GET endpoint for testing notification email functionality (uses verification template)
export async function GET(request: Request) {
  try {
    const authService = getAuthService();
    await authService.validateSession();
    const { searchParams } = new URL(request.url);

    // Validate email parameter with Zod for consistency
    const emailValidation = z.string().email({ message: "Valid email parameter is required" }).safeParse(searchParams.get('email'));
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: emailValidation.error.issues[0].message, details: emailValidation.error.issues },
        { status: 400 }
      );
    }

    const email = emailValidation.data;
    const message = searchParams.get('message') ?? 'This is a test notification from PenguinMails';
    const subject = searchParams.get('subject') ?? 'Test Notification';
    const userName = searchParams.get('userName') ?? 'Test User';

    const loopService = getLoopService();
    const result = await loopService.sendNotificationEmail(email, message, subject, userName);

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test notification email sent successfully' : 'Failed to send test notification email',
      contactId: result.contactId,
      error: result.message,
      testData: {
        email,
        message,
        subject,
        userName,
      },
    });
  } catch (error) {
    console.error('Test notification email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification email' },
      { status: 500 }
    );
  }
}
